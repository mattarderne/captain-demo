// The smoke lab's fluid solver, wrapped onto a sphere, with a boat sailing a
// great circle around it.
//
// The solver itself is unchanged in spirit — advect, curl, confine, diverge,
// solve pressure, subtract the gradient — but it now runs inside an
// EQUIRECTANGULAR texture: x is longitude (0..2pi, wraps), y is latitude
// (-pi/2..pi/2 at the poles, does not wrap). That single choice is why almost
// every operator below differs from smoke-lab/smoke.js.
//
// ---- the metric, derived once, used everywhere ----------------------------
//
// A flat solver assumes a step of one texel means the same physical distance
// in x as in y. On a sphere parametrised by longitude/latitude that is false:
// a degree of longitude spans cos(latitude) LESS ground than a degree of
// latitude, shrinking to nothing at the poles. Every operator that mixes
// neighbours has to carry that factor or the field it computes is simply
// wrong — not slightly off, wrong, and singular at the poles besides.
//
// The grid is built so an equirectangular texel is the same ANGULAR size in
// both directions (width = 2 * height, longitude spans 2pi where latitude
// spans pi), so one texel is always the same step in radians whichever way
// you move. The only anisotropy left is the physical-vs-angular one: a
// velocity field is stored here as its PHYSICAL (east, north) components —
// the same convention meteorology uses for wind on a lat/long grid — and
// converting east-velocity into a rate of change of LONGITUDE divides by
// cos(latitude). That single division is where every "wrapped" formula below
// comes from. Concretely, for a scalar field p and vector field (u, v) with u
// = east, v = north, physical radius folded to 1 and one texel = one unit of
// angle (so no extra factor from that):
//
//   divergence  D  = (1/cos φ) [ ∂u/∂λ + ∂(v cos φ)/∂φ ]
//   curl        ζ  = (1/cos φ) [ ∂v/∂λ − ∂(u cos φ)/∂φ ]
//   gradient    ∇p = ( (1/cos φ) ∂p/∂λ ,  ∂p/∂φ )
//   Laplacian  ∇²p = (1/cos²φ) ∂²p/∂λ² + (1/cos φ) ∂/∂φ( cos φ ∂p/∂φ )
//
// These are the standard spherical operators for physical (not coordinate)
// vector components — see e.g. the horizontal divergence/vorticity formulas
// in atmospheric dynamics texts. Discretising the Laplacian with central
// differences and solving ∇²p = D for p by Jacobi iteration gives a WEIGHTED
// average rather than the flat scheme's plain (L+R+T+B)/4 — see PRESSURE_FRAG
// for the five-line derivation that turns into. Every shader below that reads
// "cos φ" is one term of this; nothing here is decorative.
//
// ---- the poles --------------------------------------------------------
//
// cos(φ) → 0 at the poles, so 1/cos φ → ∞: a true singularity of this grid,
// not a bug to chase out. Two independent, deliberately crude guards:
//
//   1. every 1/cos φ is clamped to a floor (EPS_COS) so no shader can produce
//      Inf or NaN, however close to the pole the sample lands.
//   2. a small dedicated pass (POLE_DAMP_FRAG) exponentially relaxes velocity
//      to zero within POLE_BAND of true north/south each step, so the ring of
//      texels where the flat-grid approximation is worst never accumulates
//      energy, however the rest of the field is behaving.
//
// This is NOT a polar cap re-mesh and does not claim to be physically correct
// right at the poles — an equirectangular grid cannot represent the fact that
// every longitude is the same point there. It is a documented, bounded
// compromise: the poles go quiet rather than blow up.
//
// ---- rendering --------------------------------------------------------
//
// Raw WebGL throughout, one context, a hand-rolled sphere mesh and matrices.
// The three.js this repo vendors is r72 — no WebGLRenderTarget.texture, and
// mixing its state with raw GL calls is what smoke-lab's own header warns
// about. Nothing here depends on a library at all, including for the small
// amount of Vec3/rotation math ported from planet/js/core.js and sim.js
// (rotateAbout, tangentToward, signedAngle, orthonormalise): rather than load
// three.js just for its Vector3, that handful of functions is reimplemented
// here against a tiny local Vec3.
(function (root) {
	'use strict';

	var LAB = root.GLOBELAB = {};

	var PI = Math.PI, TAU = Math.PI * 2, DEG = Math.PI / 180;

	// ---- params -----------------------------------------------------------

	var params = {
		wind: 1.20,
		curl: 19,
		viscosity: 0.55,
		iterations: 34,

		streaks: 1.6,
		streakCount: 21,
		streakWidth: 0.90,
		fade: 0.10,

		boatSize: 0.240,

		jibX: 0.55,
		jibY: 0.00,
		mainX: 0.05,
		mainY: 0.00,

		jibAngle: -43,
		jibChord: 0.95,
		jibCamber: 0.18,
		jibThick: 0.15,
		mainAngle: -17,
		mainChord: 1.40,
		mainCamber: 0.15,
		mainThick: 0.16,
		autoTrim: false,

		showBoat: true,
		showVelocity: false,
		colourSpeed: true,
		speedScale: 0.32,
		speedContrast: 1.00,

		maccormack: 1.0,
		medium: 'smoke',
		saturation: 1.00,
		contrast: 1.00,
		neon: 0.00,
		wakeMixLo: 0.00,
		wakeMixHi: 0.02,

		sailOnForce: true,
		driveGain: 0.010,
		hullDrag: 6.0,
		paused: false,

		chaseCam: true,
		camMode: 'chase',
		controlMode: 'sheets',
		sheetRate: 45,
		// Centre of lateral resistance, in her lengths from her origin. Positive
		// is forward. Sail force forward of it bears her away, aft of it rounds
		// her up.
		//
		// -0.30 is measured, not guessed. With uCLR held at zero, moment / side
		// force gives each sail's own centre of effort: the jib's is +0.22 of
		// her length and the main's is -0.50, and the two together balance at
		// -0.30 on her reference trim (jib -23, main 7). Putting the resistance
		// centre exactly there is what makes her neutral on that trim and makes
		// every departure from it steer her.
		clr: -0.30,
		yawGain: 5,
		yawDamp: 1.8,
		camLead: 1.05,
		camLazy: 0.55,
		zoom: 1.0,

		// Three islands in the stream. Anchored a little north of the equator so
		// the chain sits in steady flow rather than in the polar damping band.
		islands: true,
		islandScale: 6.5,
		islandLon: 40,
		islandLat: 12,

		// The particle layer, ported from smoke-lab/smoke.js — same two styles,
		// same panel shape, same defaults, so the two labs read as one
		// instrument. What differs is entirely in globe.js's shaders: advection
		// carries the 1/cos(latitude) metric, and the draw call projects onto
		// the sphere and culls the far side. See the "particles" section below.
		particlesOn: false,
		particleStyle: 'dust',
		particleSizeIdx: 1,
		particleDrag: 4.0,
		particlePointSize: 1.5,
		particleLifetime: 1000,
		particleTrailLength: 15,
		particleBrightness: 1.0
	};
	LAB.params = params;

	// The panel, the persistence and the presets all live in ../shared/labkit.js
	// now. These thin wrappers keep the call sites below unchanged; the store key
	// is bumped when a saved value's MEANING changes, not when one is added.
	var kit = LABKIT.create({
		store: 'globelab.params.v2',
		params: params,
		// This lab and smoke-lab are where the shared preset table's vocabulary
		// comes from, so they opt in explicitly rather than tripping the warning.
		sharedVocabulary: true,
		// Bumped when a DEFAULT changes and must reach existing browsers.
		// 1: sheets-and-rudder became the default control scheme.
		schema: 1,
		resetOnUpgrade: ['controlMode', 'autoTrim'],
		defaultOpen: ['sec-air', 'sec-smoke']
	});
	var hueRGB = LABKIT.hueRGB;

	function saveParams() { kit.save(); }
	function loadParams() { kit.load(); }
	function clearParams() { kit.clear(); }
	function settingsBlock() { return kit.settingsBlock(); }
	function refreshAllControls() { kit.refreshAll(); }
	function announce(t) { kit.announce(t); }
	function bindSections() { kit.bindSections(); }
	function applyPreset(n) { kit.applyPreset(n); }



	LAB.settingsBlock = settingsBlock;

	// ---- tiny Vec3 / sphere maths, ported from planet/js/core.js + sim.js -----
	// (a local reimplementation rather than loading three.js — see header)

	function Vec3(x, y, z) { this.x = x || 0; this.y = y || 0; this.z = z || 0; }
	Vec3.prototype.set = function (x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
	Vec3.prototype.copy = function (v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
	Vec3.prototype.clone = function () { return new Vec3(this.x, this.y, this.z); };
	Vec3.prototype.dot = function (v) { return this.x * v.x + this.y * v.y + this.z * v.z; };
	Vec3.prototype.lengthSq = function () { return this.dot(this); };
	Vec3.prototype.length = function () { return Math.sqrt(this.lengthSq()); };
	Vec3.prototype.multiplyScalar = function (s) { this.x *= s; this.y *= s; this.z *= s; return this; };
	Vec3.prototype.normalize = function () {
		var l = this.length();
		if (l > 1e-12) this.multiplyScalar(1 / l);
		return this;
	};
	Vec3.prototype.addScaledVector = function (v, s) {
		this.x += v.x * s; this.y += v.y * s; this.z += v.z * s; return this;
	};
	Vec3.prototype.crossVectors = function (a, b) {
		var ax = a.x, ay = a.y, az = a.z, bx = b.x, by = b.y, bz = b.z;
		this.x = ay * bz - az * by; this.y = az * bx - ax * bz; this.z = ax * by - ay * bx;
		return this;
	};

	function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

	// Any unit tangent at p — used only where the true tangent is degenerate.
	function arbitraryTangent(out, p) {
		if (Math.abs(p.y) < 0.9) out.set(0, 1, 0); else out.set(1, 0, 0);
		out.addScaledVector(p, -out.dot(p));
		return out.normalize();
	}

	// Rodrigues rotation about a UNIT axis, in place. Ported verbatim from
	// planet/js/core.js.
	var _cross = new Vec3();
	function rotateAbout(v, axis, angle) {
		var c = Math.cos(angle), s = Math.sin(angle);
		_cross.crossVectors(axis, v);
		var d = axis.dot(v) * (1 - c);
		v.set(
			v.x * c + _cross.x * s + axis.x * d,
			v.y * c + _cross.y * s + axis.y * d,
			v.z * c + _cross.z * s + axis.z * d
		);
		return v;
	}

	function tangentToward(out, from, to) {
		out.copy(to).addScaledVector(from, -to.dot(from));
		if (out.lengthSq() < 1e-12) return arbitraryTangent(out, from);
		return out.normalize();
	}

	function arc(a, b) { return Math.acos(clamp(a.dot(b), -1, 1)); }

	function signedAngle(a, b, p) {
		var ang = Math.acos(clamp(a.dot(b), -1, 1));
		_cross.crossVectors(a, b);
		return _cross.dot(p) > 0 ? -ang : ang;
	}

	function orthonormalise(pos, head) {
		pos.normalize();
		head.addScaledVector(pos, -head.dot(pos));
		if (head.lengthSq() < 1e-12) arbitraryTangent(head, pos);
		else head.normalize();
	}

	// Sphere parametrisation shared by the sim grid and the render mesh:
	//   x = cos(phi) cos(lambda), y = sin(phi), z = cos(phi) sin(lambda)
	// lambda (longitude) in [0, 2pi), phi (latitude) in [-pi/2, pi/2].
	// u = lambda / 2pi, v = phi/pi + 0.5 — matches the equirectangular texture
	// exactly: texel column = longitude, texel row = latitude.
	function fromLonLat(out, lam, phi) {
		var cp = Math.cos(phi);
		return out.set(cp * Math.cos(lam), Math.sin(phi), cp * Math.sin(lam));
	}
	function lonOf(p) { var l = Math.atan2(p.z, p.x); return l < 0 ? l + TAU : l; }
	function latOf(p) { return Math.asin(clamp(p.y, -1, 1)); }

	// Local east/north unit tangents at a point given its longitude/latitude —
	// the ENU frame every "physical velocity component" in this file is
	// expressed in.
	function eastAt(out, lam) { return out.set(-Math.sin(lam), 0, Math.cos(lam)); }
	function northAt(out, lam, phi) {
		var sp = Math.sin(phi), cp = Math.cos(phi);
		return out.set(-sp * Math.cos(lam), cp, -sp * Math.sin(lam));
	}

	// ---- boat state ---------------------------------------------------------

	var boat = {
		pos: new Vec3(),
		head: new Vec3(),
		speed: 0.28,
		lam: 0, phi: 0,          // cached each step from pos
		headEast: 1, headNorth: 0
	};
	var keys = {};

	(function initBoat() {
		fromLonLat(boat.pos, 0.9, 0.10);
		var e = new Vec3(), n = new Vec3();
		eastAt(e, 0.9); northAt(n, 0.9, 0.10);
		boat.head.copy(e).multiplyScalar(0.35).addScaledVector(n, 0.94).normalize();
		orthonormalise(boat.pos, boat.head);
	})();

	function refreshBoatFrame() {
		boat.lam = lonOf(boat.pos);
		boat.phi = latOf(boat.pos);
		var e = _e, n = _n;
		eastAt(e, boat.lam); northAt(n, boat.lam, boat.phi);
		boat.headEast = boat.head.dot(e);
		boat.headNorth = boat.head.dot(n);
	}
	var _e = new Vec3(), _n = new Vec3(), _axis = new Vec3();

	// The prevailing wind always relaxes toward due east in the LOCAL frame
	// (see WIND_FRAG) so, exactly as smoke-lab used the fixed +x wind to pick
	// a tack, this uses local east.
	function leeSide() {
		var across = -boat.headNorth;
		return Math.abs(across) < 0.02 ? 1 : (across > 0 ? 1 : -1);
	}
	function twaDeg() {
		return Math.abs(Math.atan2(boat.headNorth, -boat.headEast)) * 180 / PI;
	}
	function autoSheet() {
		var t = twaDeg();
		return Math.min(85, Math.max(6, (t - 22) * 0.62));
	}

	function stepBoat(dt) {
		// Two control schemes, kept side by side.
		//
		//   helm    the arrows steer and drive her, and auto trim looks after the
		//           sails. One thing to think about.
		//   sheets  three separate controls, as on a real boat: main sheet, jib
		//           sheet, rudder. Auto trim is off and getting anywhere depends
		//           on the two sails working together against the helm, which is
		//           the whole point of having a slot.
		// In trim-only there is no rudder to put over, so the arrows never touch
		// her heading. Anything else and they are the helm.
		var trimOnly = params.controlMode === 'trimonly';
		var turn = 0;
		if (!trimOnly) {
			if (keys.ArrowLeft) turn += 1;
			if (keys.ArrowRight) turn -= 1;
			if (turn) rotateAbout(boat.head, boat.pos, turn * 0.9 * dt);
		}

		// Steering by trim alone. No rudder: her heading changes only because the
		// two sails are out of balance about her centre of lateral resistance,
		// and the moment that turns her is integrated off the same pressure
		// field as her drive. Nothing here models steering.
		//
		// Held at 45 degrees off the wind and measured over five seconds: the
		// reference trim reads -0.002 and holds her within 3 degrees; loading
		// the headsail reads +0.035 and bears her away 34; unloading it reads
		// -0.024 and rounds her up 21; easing the main bears her away 32 and
		// sheeting it hard rounds her up 29. Positive is bow away from the wind.
		if (trimOnly) {
			var rate2 = params.sheetRate * dt;
			if (keys.KeyQ) params.mainAngle -= rate2;
			if (keys.KeyA) params.mainAngle += rate2;
			if (keys.KeyW) params.jibAngle -= rate2;
			if (keys.KeyS) params.jibAngle += rate2;
			params.mainAngle = clamp(params.mainAngle, -180, 180);
			params.jibAngle = clamp(params.jibAngle, -180, 180);
			if (params.autoTrim) { params.autoTrim = false; kit.refreshAll(); }
			// The measured yaw moment turns her, resisted by hull damping so she
			// settles on a heading rather than spinning up without limit.
			boat.yawRate = (boat.yawRate || 0) +
				(force.yaw * params.yawGain - (boat.yawRate || 0) * params.yawDamp) * dt;
			rotateAbout(boat.head, boat.pos, boat.yawRate * dt);
		}

		if (params.controlMode === 'sheets') {
			var rate = params.sheetRate * dt;
			// Q/A the main, W/S the jib. In is towards the centreline.
			if (keys.KeyQ) params.mainAngle -= rate;
			if (keys.KeyA) params.mainAngle += rate;
			if (keys.KeyW) params.jibAngle -= rate;
			if (keys.KeyS) params.jibAngle += rate;
			params.mainAngle = clamp(params.mainAngle, -180, 180);
			params.jibAngle = clamp(params.jibAngle, -180, 180);
			if (params.autoTrim) {
				params.autoTrim = false;
				var b = document.getElementById('b-auto');
				if (b) b.className = '';
			}
		}

		if (params.sailOnForce) {
			// Thrust has to carry the wind back in.
			//
			// `force.fast` is a COEFFICIENT: measureForce divides the raw pressure
			// integral by the dynamic pressure, (wind*300)^2 * size, so that trims
			// can be compared across different wind strengths. Feeding that
			// coefficient straight in as thrust cancels the wind right back out
			// again, and her speed came out completely independent of the wind
			// slider. Force is q * C, so multiplying by the same q restores it,
			// and her steady speed sqrt(thrust/drag) then scales linearly with
			// the wind, as it should. Normalised so wind = 1 is unchanged.
			var q = params.wind * params.wind;
			var thrust = force.fast * params.driveGain * q;
			var drag = params.hullDrag * boat.speed * Math.abs(boat.speed);
			boat.speed += (thrust - drag) * dt;
			if (keys.ArrowUp) boat.speed += 0.35 * dt;
			if (keys.ArrowDown) boat.speed -= 0.35 * dt;
		} else {
			var want = 0;
			if (keys.ArrowUp) want += 1;
			if (keys.ArrowDown) want -= 1;
			boat.speed += (want * 0.20 - boat.speed) * Math.min(1, dt * 2.2);
		}
		if (boat.speed < -0.05) boat.speed = -0.05;

		// Great-circle motion: one rotation of both pos and head about the axis
		// pos x head. This is the entire reason a Vec3-on-the-sphere model was
		// worth porting — she can sail straight over a pole without a single
		// special case, unlike a lat/long integrator.
		var travel = boat.speed * dt * WORLD_SCALE;
		if (Math.abs(travel) > 1e-9) {
			_axis.crossVectors(boat.pos, boat.head).normalize();
			rotateAbout(boat.pos, _axis, travel);
			rotateAbout(boat.head, _axis, travel);
		}
		orthonormalise(boat.pos, boat.head);
		refreshBoatFrame();

		if (params.autoTrim) {
			var set = autoSheet();
			params.mainAngle = set;
			params.jibAngle = set * 0.76;
		}
	}

	// How fast the boat travels round the sphere per unit of `speed` and dt —
	// tuned so the numbers on the sliders (driveGain, hullDrag) feel like the
	// flat lab's, and so a lap takes tens of seconds rather than hours.
	var WORLD_SCALE = 0.55;

	// ---- GL boilerplate (ported near-verbatim from smoke-lab/smoke.js) --------

	var gl, canvas, ext;
	var programs = {};
	var quadBuffer;

	function compile(type, src) {
		var s = gl.createShader(type);
		gl.shaderSource(s, src);
		gl.compileShader(s);
		if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
			throw new Error(gl.getShaderInfoLog(s) + '\n' + src);
		}
		return s;
	}
	function program(fragSrc, vertSrc) {
		var p = gl.createProgram();
		gl.attachShader(p, compile(gl.VERTEX_SHADER, vertSrc || BASE_VERT));
		gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fragSrc));
		gl.linkProgram(p);
		if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
		var uniforms = {};
		var n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
		for (var i = 0; i < n; i++) {
			var name = gl.getActiveUniform(p, i).name;
			uniforms[name] = gl.getUniformLocation(p, name);
			// GL reports an array uniform as "uThing[0]", so a lookup by the bare
			// name silently misses and the upload is skipped without any error at
			// all. Store both spellings.
			if (name.slice(-3) === '[0]') uniforms[name.slice(0, -3)] = uniforms[name];
		}
		return { handle: p, uniforms: uniforms };
	}

	var BASE_VERT = [
		'precision highp float;',
		'attribute vec2 aPosition;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform vec2 texelSize;',
		'void main() {',
		'  vUv = aPosition * 0.5 + 0.5;',
		'  vL = vUv - vec2(texelSize.x, 0.0);',
		'  vR = vUv + vec2(texelSize.x, 0.0);',
		'  vT = vUv + vec2(0.0, texelSize.y);',
		'  vB = vUv - vec2(0.0, texelSize.y);',
		'  gl_Position = vec4(aPosition, 0.0, 1.0);',
		'}'
	].join('\n');

	function createFBO(w, h, internal, format, type, filter, wrapX, wrapY) {
		gl.activeTexture(gl.TEXTURE0);
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, wrapX);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, wrapY);
		gl.texImage2D(gl.TEXTURE_2D, 0, internal, w, h, 0, format, type, null);

		var fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
		gl.viewport(0, 0, w, h);
		gl.clear(gl.COLOR_BUFFER_BIT);

		return {
			texture: tex, fbo: fbo, width: w, height: h,
			texelSizeX: 1 / w, texelSizeY: 1 / h,
			attach: function (id) {
				gl.activeTexture(gl.TEXTURE0 + id);
				gl.bindTexture(gl.TEXTURE_2D, tex);
				return id;
			}
		};
	}
	// Longitude WRAPS (REPEAT), latitude does not (CLAMP_TO_EDGE). Every field
	// in this file — velocity, dye, pressure, divergence, curl, obstacle,
	// speed — is built through this so the x-wrap is automatic in every
	// shader's texture2D() calls; only the boat's own longitude arithmetic
	// (not a texture read) needs an explicit wrap, see wrapPi() below.
	function createSphereFBO(w, h, internal, format, type, filter) {
		return createFBO(w, h, internal, format, type, filter, gl.REPEAT, gl.CLAMP_TO_EDGE);
	}
	function createDoubleFBO(w, h, internal, format, type, filter) {
		var a = createSphereFBO(w, h, internal, format, type, filter);
		var b = createSphereFBO(w, h, internal, format, type, filter);
		return {
			width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
			get read() { return a; }, set read(v) { a = v; },
			get write() { return b; }, set write(v) { b = v; },
			swap: function () { var t = a; a = b; b = t; }
		};
	}
	// Every solver pass draws the same fullscreen quad on attribute location 0
	// — but the sphere render (renderSphere(), below) ALSO binds its own mesh
	// buffer to whatever location the driver assigns its "aPos" attribute,
	// which is commonly 0 too since it is the first attribute declared. Left
	// alone, that meant the quad's vertexAttribPointer only survived until
	// the next sphere draw, after which every solver blit silently rasterised
	// a degenerate quad (all four vertices reading the sphere mesh's stride)
	// — no shader error, no dead pixels, just a field that quietly stopped
	// updating. Re-binding the quad's own attribute state on every blit()
	// call costs nothing measurable and removes the whole class of bug.
	function blit(target) {
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
		if (target == null) {
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		} else {
			gl.viewport(0, 0, target.width, target.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
		}
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	// ---- shared GLSL: the metric, the wrap, the rig ----------------------------

	// EPS_COS: the pole clamp (see header). POLE_BAND: latitude (radians from
	// the pole) inside which POLE_DAMP_FRAG relaxes velocity toward zero.
	var METRIC_GLSL = [
		'#define PI 3.14159265359',
		'#define TAU 6.28318530718',
		'#define EPS_COS 0.12',
		'float latOfV(float v) { return (v - 0.5) * PI; }',
		'float lonOfU(float u) { return u * TAU; }',
		// Shortest signed distance from a to b around the circle, in (-PI, PI].
		'float wrapPi(float a) { return mod(a + PI, TAU) - PI; }',
		// 1 away from the poles, fading to 0 by 85 degrees. Every 1/cos(phi)
		// term in this file is clamped (EPS_COS) so it cannot produce Inf —
		// but a clamped-and-still-large multiplier applied to a FORCING term
		// (as opposed to a passive read like advection or the gradient) is a
		// standing feedback loop: vorticity confinement amplified by the
		// clamp injects energy right at the ring where the clamp engages,
		// POLE_DAMP_FRAG mops some of it up, and the two fighting each other
		// left that ring hotter than the mid-latitudes rather than calmer —
		// caught by the latitude-banded velocity probe in the verification
		// harness (see the report). The fix is to stop injecting fresh energy
		// there in the first place: this weight scales the confinement force
		// itself, not just the after-the-fact damping.
		'float poleWeight(float phi) { return 1.0 - smoothstep(1.2217, 1.4835, abs(phi)); }' // 70..85deg
	].join('\n');

	// Position of a texel relative to the boat, in the boat's local flat
	// (east, north) tangent plane, in radians — small-patch approximation,
	// valid because the rig is a few hundredths of a radian across. Handles
	// the longitude wrap explicitly since it is arithmetic, not a texture
	// fetch.
	var LOCAL_GLSL = [
		'vec2 localOffset(float lam, float phi, float lam0, float phi0) {',
		'  float dl = wrapPi(lam - lam0);',
		'  float dphi = phi - phi0;',
		'  return vec2(dl * cos(phi0), dphi);',
		'}'
	].join('\n');

	// The rig itself: identical to smoke-lab/smoke.js's RIG_GLSL. Copied
	// rather than shared because there is no module system here (house style
	// is a single inline file, no build step) — but it is untouched, so the
	// jib/main shapes on this page mean exactly what they mean there.
	var RIG_GLSL = [
		'float foilDist(vec2 q, float chord, float camber, float thick) {',
		'  float c = max(chord, 1e-6);',
		'  float x = clamp(-q.x / c, 0.0, 1.0);',
		'  float yt = thick * c * (1.4845 * sqrt(x) - 0.6300 * x - 1.7580 * x * x',
		'           + 1.4215 * x * x * x - 0.5075 * x * x * x * x);',
		'  yt = max(yt, 0.0);',
		'  float pc = 0.42;',
		'  float m = camber * c;',
		'  float yc = x < pc ? m / (pc * pc) * (2.0 * pc * x - x * x)',
		'                    : m / ((1.0 - pc) * (1.0 - pc)) * ((1.0 - 2.0 * pc) + 2.0 * pc * x - x * x);',
		'  float across = abs(q.y - yc) - yt;',
		'  float ends = max(q.x, -q.x - c);',
		'  return max(across, ends);',
		'}',
		'vec2 toFoil(vec2 p, vec2 origin, float ang) {',
		'  vec2 d = p - origin;',
		'  float c = cos(ang), s = sin(ang);',
		'  return vec2(d.x * c + d.y * s, -d.x * s + d.y * c);',
		'}',
		'vec3 rigDist(vec2 a, float size, vec2 jibOff, vec2 mainOff, vec4 jib, vec4 mainF, float lee) {',
		'  vec2 h = a; h.y /= 0.34;',
		'  float hull = length(h) - size * 0.55;',
		'  vec2 jibO = vec2(size * jibOff.x, lee * size * jibOff.y);',
		'  float dJib = foilDist(toFoil(a, jibO, lee * jib.x), size * jib.y, lee * jib.z, jib.w);',
		'  vec2 mainO = vec2(size * mainOff.x, lee * size * mainOff.y);',
		'  float dMain = foilDist(toFoil(a, mainO, lee * mainF.x), size * mainF.y, lee * mainF.z, mainF.w);',
		'  return vec3(hull, dJib, dMain);',
		'}'
	].join('\n');

	// ---- solver shaders --------------------------------------------------------

	var CLEAR_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv; uniform sampler2D uTexture; uniform float value;',
		'void main() { gl_FragColor = value * texture2D(uTexture, vUv); }'
	].join('\n');

	// Semi-Lagrangian backtrace. The one metric correction that matters here:
	// vel.x is the PHYSICAL eastward speed, but the backtrace walks in
	// COORDINATE (longitude) space, and a degree of longitude is worth less
	// ground near the poles — so the coordinate-space step is the physical
	// speed divided by cos(latitude). Nothing else about this shader differs
	// from smoke-lab's.
	var ADVECTION_FRAG = [
				'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity, uSource, uObstacle;',
		'uniform vec2 texelSize, dyeTexelSize;',
		'uniform float dt, dissipation, blockDye;',
		'#ifdef MANUAL_FILTERING',
		'vec4 bilerp(sampler2D sam, vec2 uv, vec2 tsize) {',
		'  vec2 st = uv / tsize - 0.5;',
		'  vec2 iuv = floor(st), fuv = fract(st);',
		'  vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);',
		'  vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);',
		'  vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);',
		'  vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);',
		'  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);',
		'}',
		'#endif',
		'void main() {',
		'  float cphi = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  vec2 vel = texture2D(uVelocity, vUv).xy;',
		'  vel.x /= cphi;',
		'  vec2 coord = vUv - dt * vel * texelSize;',
		'#ifdef MANUAL_FILTERING',
		'  vec4 result = bilerp(uSource, coord, dyeTexelSize);',
		'#else',
		'  vec4 result = texture2D(uSource, coord);',
		'#endif',
		'  float decay = 1.0 + dissipation * dt;',
		'  result /= decay;',
		'  if (blockDye > 0.5) {',
		'    result = min(result, vec4(3.0));',
		'    if (texture2D(uObstacle, vUv).x > 0.5) result = vec4(0.0);',
		'  }',
		'  gl_FragColor = result;',
		'}'
	].join('\n');

	var MACCORMACK_FRAG = [
				'precision highp float;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uPhi, uPhiHat, uPhiTilde, uVelocity, uObstacle;',
		'uniform vec2 texelSize, dyeTexelSize;',
		'uniform float dt, dissipation, strength, mixLo, mixHi;',
		'void main() {',
		'  float cphi = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  vec2 vel = texture2D(uVelocity, vUv).xy;',
		'  vel.x /= cphi;',
		'  vec2 coord = vUv - dt * vel * texelSize;',
		'  vec4 hat = texture2D(uPhiHat, vUv);',
		'  vec4 phi0 = texture2D(uPhi, vUv);',
		'  vec4 tilde = texture2D(uPhiTilde, vUv);',
		// The correction is applied only where the air is MOVING.
		//
		// Suppressing numerical diffusion is right in the free stream, where it
		// is the thing eating the streaks. It is wrong inside a separation
		// bubble: a real bubble fills by turbulent mixing across the shear layer,
		// and this solver has no turbulence, so diffusion is the only mechanism
		// it has for the same job. Killing it everywhere left stalled wakes
		// visibly empty, holding a quarter of the free stream's dye against the
		// nearly half they hold with the correction off. Fading the correction
		// out in slow air gives crisp streaks outside and a wake that fills.
		'  float localSpeed = length(texture2D(uVelocity, vUv).xy);',
		'  float mix = smoothstep(mixLo, mixHi, localSpeed);',
		'  vec4 corrected = hat + strength * mix * 0.5 * (phi0 - tilde);',
		'  vec2 h = dyeTexelSize;',
		'  vec4 a = texture2D(uPhi, coord + vec2(-h.x, -h.y));',
		'  vec4 b = texture2D(uPhi, coord + vec2( h.x, -h.y));',
		'  vec4 c = texture2D(uPhi, coord + vec2(-h.x,  h.y));',
		'  vec4 d = texture2D(uPhi, coord + vec2( h.x,  h.y));',
		'  vec4 lo = min(min(a, b), min(c, d));',
		'  vec4 hi = max(max(a, b), max(c, d));',
		'  vec4 result = clamp(corrected, lo, hi);',
		'  result /= (1.0 + dissipation * dt);',
		'  result = min(result, vec4(3.0));',
		'  if (texture2D(uObstacle, vUv).x > 0.5) result = vec4(0.0);',
		'  gl_FragColor = result;',
		'}'
	].join('\n');

	// D = (1/cos phi_C) [ 0.5(uR - uL) + 0.5(vT cos phi_T - vB cos phi_B) ] —
	// see the header derivation. The obstacle wall substitution is untouched
	// from smoke-lab: a solid neighbour reports its own (hull) velocity, not
	// whatever the field holds there.
	var DIVERGENCE_FRAG = [
				'precision mediump float; precision mediump sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uObstacle;',
		'void main() {',
		'  float cC = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  float cT = cos(latOfV(vT.y));',
		'  float cB = cos(latOfV(vB.y));',
		'  float L = texture2D(uVelocity, vL).x;',
		'  float R = texture2D(uVelocity, vR).x;',
		'  float T = texture2D(uVelocity, vT).y;',
		'  float B = texture2D(uVelocity, vB).y;',
		'  vec4 oL = texture2D(uObstacle, vL);',
		'  vec4 oR = texture2D(uObstacle, vR);',
		'  vec4 oT = texture2D(uObstacle, vT);',
		'  vec4 oB = texture2D(uObstacle, vB);',
		'  if (oL.x > 0.5) L = oL.y;',
		'  if (oR.x > 0.5) R = oR.y;',
		'  if (oT.x > 0.5) T = oT.z;',
		'  if (oB.x > 0.5) B = oB.z;',
		'  float div = (0.5 * (R - L) + 0.5 * (T * cT - B * cB)) / cC;',
		'  gl_FragColor = vec4(div, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// zeta = (1/cos phi_C) [ 0.5(vR - vL) - 0.5(uT cos phi_T - uB cos phi_B) ]
	var CURL_FRAG = [
				'precision mediump float; precision mediump sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity;',
		'void main() {',
		'  float cC = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  float cT = cos(latOfV(vT.y));',
		'  float cB = cos(latOfV(vB.y));',
		'  float L = texture2D(uVelocity, vL).y;',
		'  float R = texture2D(uVelocity, vR).y;',
		'  float T = texture2D(uVelocity, vT).x;',
		'  float B = texture2D(uVelocity, vB).x;',
		'  float curl = (0.5 * (R - L) - 0.5 * (T * cT - B * cB)) / cC;',
		'  gl_FragColor = vec4(curl, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Vorticity confinement is a heuristic forcing term even on a flat grid —
	// it does not come from the Navier-Stokes equations, it is what makes the
	// eddies survive the advection step's diffusion. It is not re-derived
	// from first principles here; the same longitude-compression correction
	// used everywhere else is applied to keep it dimensionally consistent
	// with the rest of the solver, nothing stronger is claimed.
	var VORTICITY_FRAG = [
				'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uCurl;',
		'uniform float curl, dt;',
		'void main() {',
		'  float cC = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  float L = texture2D(uCurl, vL).x;',
		'  float R = texture2D(uCurl, vR).x;',
		'  float T = texture2D(uCurl, vT).x;',
		'  float B = texture2D(uCurl, vB).x;',
		'  float C = texture2D(uCurl, vUv).x;',
		'  vec2 force = vec2(0.5 * (abs(T) - abs(B)), 0.5 * (abs(R) - abs(L)) / cC);',
		'  force /= length(force) + 0.0001;',
		'  force *= curl * C * poleWeight(latOfV(vUv.y));',
		'  force.y *= -1.0;',
		'  vec2 vel = texture2D(uVelocity, vUv).xy;',
		'  vel += force * dt;',
		'  vel = min(max(vel, -1000.0), 1000.0);',
		'  gl_FragColor = vec4(vel, 0.0, 1.0);',
		'}'
	].join('\n');

	// Weighted Jacobi update for nabla^2 p = D on the sphere. Derivation: the
	// spherical Laplacian is
	//   (1/cos^2 phi_C)(pR+pL-2pC) + (1/cos phi_C)[cos phi_T (pT-pC) - cos phi_B (pC-pB)]
	// Setting this equal to D and solving for pC (multiply through by
	// cos^2 phi_C first) gives exactly the weights below. It collapses to the
	// flat scheme's plain (L+R+T+B-D)/4 when cos phi is constant.
	var PRESSURE_FRAG = [
				'precision mediump float; precision mediump sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uDivergence, uObstacle;',
		'void main() {',
		'  float cC = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  float cT = cos(latOfV(vT.y));',
		'  float cB = cos(latOfV(vB.y));',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, vT).x;',
		'  float B = texture2D(uPressure, vB).x;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  if (texture2D(uObstacle, vT).x > 0.5) T = C;',
		'  if (texture2D(uObstacle, vB).x > 0.5) B = C;',
		'  float divergence = texture2D(uDivergence, vUv).x;',
		'  float wT = cC * cT, wB = cC * cB;',
		'  float denom = max(2.0 + wT + wB, 1e-4);',
		'  float pC = (L + R + wT * T + wB * B - divergence * cC * cC) / denom;',
		'  gl_FragColor = vec4(pC, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// grad p = ( (1/cos phi) * 0.5(pR-pL) ,  0.5(pT-pB) ) — the east component
	// alone carries the metric factor, exactly mirroring the divergence and
	// advection shaders above.
	var GRADIENT_FRAG = [
				'precision mediump float; precision mediump sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uVelocity, uObstacle;',
		'void main() {',
		'  float cC = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, vT).x;',
		'  float B = texture2D(uPressure, vB).x;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  if (texture2D(uObstacle, vT).x > 0.5) T = C;',
		'  if (texture2D(uObstacle, vB).x > 0.5) B = C;',
		'  vec2 velocity = texture2D(uVelocity, vUv).xy;',
		'  velocity.x -= 0.5 * (R - L) / cC;',
		'  velocity.y -= 0.5 * (T - B);',
		'  vec4 o = texture2D(uObstacle, vUv);',
		'  if (o.x > 0.5) velocity = o.yz;',
		'  gl_FragColor = vec4(velocity, 0.0, 1.0);',
		'}'
	].join('\n');

	// A global "trade wind": everywhere relaxes toward due-east at a gentle
	// rate. A flat domain can hold a free stream by forcing hard along one
	// inflow edge; a sphere wraps in longitude and has no edge, so the
	// forcing is spread thin over the whole field instead — strong enough to
	// keep re-energising the flow the viscosity and pressure solve are
	// constantly bleeding, weak enough that eddies the vorticity confinement
	// builds are not simply erased next frame. Faded out within POLE_BAND of
	// each pole so this pass never fights the metric singularity there — that
	// job belongs to POLE_DAMP_FRAG alone.
	var WIND_FRAG = [
				'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'uniform float wind, dt, time;',
		'void main() {',
		'  vec2 v = texture2D(uVelocity, vUv).xy;',
		'  float phi = latOfV(vUv.y);',
		'  float gust = 1.0 + 0.10 * sin(vUv.x * 14.0 + time * 0.6) * cos(phi);',
		'  float poleFade = 1.0 - smoothstep(1.15, 1.55, abs(phi));',
		'  vec2 target = vec2(wind * gust * poleFade, 0.0);',
		'  float k = clamp(0.55 * dt, 0.0, 1.0);',
		'  gl_FragColor = vec4(mix(v, target, k), 0.0, 1.0);',
		'}'
	].join('\n');

	// The pole guard proper: within POLE_START..PI/2 of true north/south,
	// exponentially relax velocity to zero. See header for why.
	var POLE_DAMP_FRAG = [
				'precision highp float;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'uniform float dt;',
		'void main() {',
		'  vec2 v = texture2D(uVelocity, vUv).xy;',
		'  float phi = latOfV(vUv.y);',
		'  float t = smoothstep(1.2217, 1.4835, abs(phi));', // 70deg .. 85deg, matches poleWeight
		'  float damp = mix(1.0, exp(-30.0 * dt), t);',
		'  gl_FragColor = vec4(v * damp, 0.0, 1.0);',
		'}'
	].join('\n');

	var SPLAT_FRAG = [
				'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uTarget;',
		'uniform float radius;',
		'uniform vec3 color;',
		'uniform vec2 point;',
		'void main() {',
		// A splat should look round in physical space, not in (lambda, phi):
		// widen the longitude reach by 1/cos(latitude) of the splat point so a
		// click near a pole is not squashed to nothing.
		'  float cphi = max(abs(cos(latOfV(point.y))), EPS_COS);',
		'  vec2 p = vUv - point;',
		'  p.x *= cphi;',
		'  vec3 splat = exp(-dot(p, p) / radius) * color;',
		'  vec3 base = texture2D(uTarget, vUv).xyz;',
		'  gl_FragColor = vec4(base + splat, 1.0);',
		'}'
	].join('\n');

	var MASK_FRAG = [
				'precision highp float;',
		METRIC_GLSL, LOCAL_GLSL, RIG_GLSL,
		'varying vec2 vUv;',
		'uniform vec2 boatLonLat, heading2D, hullVel;',
		'uniform vec4 uJib, uMain;',
		'uniform float size, lee;',
		'uniform vec2 uJibOff, uMainOff;',
		'uniform int uIslandCount;',
		'uniform vec3 uIslands[3];',   // lon, lat, angular radius, all radians
		'void main() {',
		'  float lam = lonOfU(vUv.x);',
		'  float phi = latOfV(vUv.y);',
		'  vec2 p = localOffset(lam, phi, boatLonLat.x, boatLonLat.y);',
		'  vec2 a = vec2(dot(p, heading2D), dot(p, vec2(-heading2D.y, heading2D.x)));',
		'  vec3 d = rigDist(a, size, uJibOff, uMainOff, uJib, uMain, lee);',
		'  float sails = step(min(d.y, d.z), 0.0);',
		// Land. Great-circle distance to each island centre, so an island is a
		// round cap on the sphere rather than a circle in the distorted texture.
		// They are STATIC solids: zero velocity, unlike her sails, which carry
		// her own. That is what gives them a proper lee and squeezes the flow in
		// the channels between them.
		'  float land = 0.0;',
		'  for (int i = 0; i < 3; i++) {',
		'    if (i >= uIslandCount) break;',
		'    vec3 isl = uIslands[i];',
		'    float cd = sin(phi) * sin(isl.y) + cos(phi) * cos(isl.y) * cos(lam - isl.x);',
		'    float gc = acos(clamp(cd, -1.0, 1.0));',
		'    land = max(land, 1.0 - smoothstep(isl.z * 0.92, isl.z, gc));',
		'  }',
		'  float solid = max(sails, step(0.5, land));',
		'  vec2 vel = land > 0.5 ? vec2(0.0) : hullVel;',
		// Alpha carries "this is land", so the surface shader can paint it
		// without mistaking her sails for a beach.
		'  gl_FragColor = vec4(solid, vel.x, vel.y, land);',
		'}'
	].join('\n');

	// dF = p * grad(mask), exactly as smoke-lab derives in its own header —
	// the mask's gradient is a delta on the sail surface pointing inward, so
	// summing p*grad(mask) over the grid is the pressure-integral force with
	// no surface tracing needed. The only change from the flat version is the
	// metric factor on the east component of that gradient, same as
	// everywhere else pressure is differenced.
	var FORCE_FRAG = [
				'precision highp float;',
		METRIC_GLSL, LOCAL_GLSL,
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uObstacle;',
		'uniform vec2 boatLonLat, heading2D;',
		'uniform float uCLR;',
		'float sailOnly(vec4 obs) { return obs.x * (1.0 - step(0.5, obs.w)); }',
		'void main() {',
		'  float cC = max(abs(cos(latOfV(vUv.y))), EPS_COS);',
		// HER SAILS ONLY. The obstacle mask carries the islands too (alpha marks
		// them), and an island's own pressure force was being summed in here as
		// if it were hers. On the drive that was a bias; on the yaw moment it was
		// fatal, because an island's lever arm about her is a quarter of a globe.
		'  float mL = sailOnly(texture2D(uObstacle, vL));',
		'  float mR = sailOnly(texture2D(uObstacle, vR));',
		'  float mT = sailOnly(texture2D(uObstacle, vT));',
		'  float mB = sailOnly(texture2D(uObstacle, vB));',
		'  float gradEast = 0.5 * (mR - mL) / cC;',
		'  float gradNorth = 0.5 * (mT - mB);',
		'  float p = texture2D(uPressure, vUv).x;',
		'  vec2 f = p * vec2(gradEast, gradNorth);',
		// Yaw moment of this cell's share of the sail force, about her centre of
		// lateral resistance. `uCLR` is where that centre sits along her
		// centreline, in her own lengths: the keel and hull resist sideways
		// motion about a point, and sail force acting FORWARD of it pushes the
		// bow away from the wind while force AFT of it rounds her up. That is
		// the whole mechanism of steering by trim, and it comes straight out of
		// the same pressure field the drive does.
		'  vec2 rWorld = localOffset(lonOfU(vUv.x), latOfV(vUv.y), boatLonLat.x, boatLonLat.y);',
		'  vec2 perp = vec2(-heading2D.y, heading2D.x);',
		'  vec2 r = vec2(dot(rWorld, heading2D) - uCLR, dot(rWorld, perp));',
		'  vec2 fb = vec2(dot(f, heading2D), dot(f, perp));',
		'  float moment = r.x * fb.y - r.y * fb.x;',
		'  gl_FragColor = vec4(f, moment, 1.0);',
		'}'
	].join('\n');

	var REDUCE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uSrc;',
		'uniform vec2 srcTexel;',
		'void main() {',
		'  vec2 b = floor(vUv / (srcTexel * 2.0)) * 2.0;',
		'  gl_FragColor = texture2D(uSrc, (b + vec2(0.5, 0.5)) * srcTexel)',
		'            + texture2D(uSrc, (b + vec2(1.5, 0.5)) * srcTexel)',
		'            + texture2D(uSrc, (b + vec2(0.5, 1.5)) * srcTexel)',
		'            + texture2D(uSrc, (b + vec2(1.5, 1.5)) * srcTexel);',
		'}'
	].join('\n');

	var SPEED_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'void main() { gl_FragColor = vec4(length(texture2D(uVelocity, vUv).xy), 0.0, 0.0, 1.0); }'
	].join('\n');

	// A dedicated pass to compute post-projection divergence for the
	// headless verification harness — identical maths to DIVERGENCE_FRAG,
	// just also exposed as a callable so a test can read it back after the
	// pressure solve rather than before.
	LAB._DIVERGENCE_FRAG = DIVERGENCE_FRAG;

	// ---- the sphere render shaders ----------------------------------------

	var SPHERE_VERT = [
		'precision highp float;',
		'attribute vec3 aPos;',
		'attribute vec2 aUv;',
		'uniform mat4 uProj, uView;',
		'uniform float uRadius;',
		'varying vec3 vNormal;',
		'varying vec2 vUv2;',
		'void main() {',
		'  vNormal = aPos;',
		'  vUv2 = aUv;',
		'  gl_Position = uProj * uView * vec4(aPos * uRadius, 1.0);',
		'}'
	].join('\n');

	var SPHERE_FRAG = [
				'precision highp float; precision highp sampler2D;',
		METRIC_GLSL, LOCAL_GLSL, RIG_GLSL,
		'varying vec3 vNormal;',
		'varying vec2 vUv2;',
		'uniform sampler2D uTexture, uVelocity, uSpeed, uObstacle;',
		'uniform vec2 boatLonLat, heading2D;',
		'uniform vec4 uJib, uMain;',
		'uniform float size, lee, showBoat, showVelocity, colourSpeed, speedRef, speedContrast;',
		'uniform float uOil;',
		'uniform float uSaturation, uContrast, uNeon;',
		'uniform vec2 uJibOff, uMainOff;',
		'uniform vec3 uLightDir;',
		'void main() {',
		'  vec3 c;',
		'  if (showVelocity > 0.5) {',
		'    vec2 v = texture2D(uVelocity, vUv2).xy;',
		'    c = vec3(0.5 + v.x * 0.25, 0.5 + v.y * 0.25, 0.62);',
		'  } else {',
		'    float d = texture2D(uTexture, vUv2).r;',
		'    float k = 1.0 - exp(-d * 1.6);',
		'    if (uOil > 0.5) {',
		// Oil rather than smoke.
		//
		// Smoke is one channel rendered as brightness: it tells you HOW MUCH air
		// went somewhere. Oil carries all three, so each band of the rake keeps
		// its own colour and you can read WHICH air went where after the rig has
		// folded it. The sheen is the giveaway: a thin film picks out its own
		// edges, so brightening where the density changes fastest reads as a
		// slick rather than a fog.
		'    vec3 d3 = texture2D(uTexture, vUv2).rgb;',
		'    float amt = max(max(d3.r, d3.g), d3.b);',
		'    float k = 1.0 - exp(-amt * 1.7);',
		'    vec3 hue = d3 / max(amt, 1e-4);',
		'    vec3 film = hue * (0.30 + 0.90 * k);',
		'    vec3 sea2 = vec3(0.020, 0.045, 0.085);',
		'    c = mix(sea2, film, clamp(k * 1.35, 0.0, 1.0));',
		// A cool rim where the film thins out, which is what makes it look wet.
		'    c += vec3(0.10, 0.16, 0.22) * k * (1.0 - k) * 2.4;',
		'    } else {',
		'    vec3 sea = vec3(0.035, 0.085, 0.16);',
		'    vec3 smoke = mix(vec3(0.28, 0.42, 0.58), vec3(0.97, 0.99, 1.0), k);',
		'    if (colourSpeed > 0.5) {',
		'      float v0 = texture2D(uSpeed, vUv2).x / max(speedRef, 1.0) * 0.5;',
		'      float v = clamp(0.5 + (v0 - 0.5) * speedContrast, 0.0, 1.0);',
		'      vec3 slow = vec3(0.09, 0.12, 0.30);',
		'      vec3 midC = vec3(0.24, 0.52, 0.68);',
		'      vec3 fast = vec3(0.86, 0.90, 0.82);',
		'      vec3 hot  = vec3(1.00, 0.97, 0.86);',
		'      vec3 ramp = v < 0.42 ? mix(slow, midC, v / 0.42)',
		'                : v < 0.78 ? mix(midC, fast, (v - 0.42) / 0.36)',
		'                           : mix(fast, hot, (v - 0.78) / 0.22);',
		'      smoke = ramp * (0.45 + 0.55 * k);',
		'    }',
		'    c = mix(sea, smoke, clamp(k * 1.25, 0.0, 1.0));',
		'    }',
		'  }',
		'  if (showBoat > 0.5) {',
		'    float lam = lonOfU(vUv2.x);',
		'    float phi = latOfV(vUv2.y);',
		'    vec2 p = localOffset(lam, phi, boatLonLat.x, boatLonLat.y);',
		'    vec2 a = vec2(dot(p, heading2D), dot(p, vec2(-heading2D.y, heading2D.x)));',
		'    vec3 d = rigDist(a, size, uJibOff, uMainOff, uJib, uMain, lee);',
		'    float ed = size * 0.010;',
		'    c = mix(c, vec3(0.30, 0.30, 0.32), (1.0 - smoothstep(0.0, ed * 3.0, d.x)) * 0.30);',
		'    c = mix(c, vec3(0.99, 0.96, 0.90), 1.0 - smoothstep(0.0, ed, d.y));',
		'    c = mix(c, vec3(1.0, 0.99, 0.96), 1.0 - smoothstep(0.0, ed, d.z));',
		'    float rim = min(d.y, d.z);',
		'    c = mix(c, vec3(0.12, 0.17, 0.24), (1.0 - smoothstep(ed, ed * 3.0, abs(rim))) * 0.75);',
		'  }',
		// Land on top of the water and under the lighting, with a paler rim where
		// the cap meets the sea so the islands read as beaches rather than discs.
		'  float land = texture2D(uObstacle, vUv2).a;',
		'  if (land > 0.001) {',
		'    vec3 rock = vec3(0.20, 0.24, 0.18);',
		'    vec3 hill = vec3(0.31, 0.35, 0.25);',
		'    vec3 surf = vec3(0.72, 0.82, 0.80);',
		'    vec3 landC = mix(rock, hill, smoothstep(0.55, 1.0, land));',
		'    landC = mix(surf, landC, smoothstep(0.06, 0.42, land));',
		'    c = mix(c, landC, smoothstep(0.02, 0.30, land));',
		'  }',
		'  float ndl = max(dot(normalize(vNormal), uLightDir), 0.0);',
		'  c *= 0.42 + 0.68 * ndl;',
		// The FILTER / NEON block from that panel, applied last of all.
		// Saturation pushes colour away from its own grey; contrast pivots about
		// mid-grey; neon adds a soft self-glow weighted to the brightest parts,
		// which is what gives oil that lit-from-within look without a real bloom
		// pass and its extra render targets.
		'  if (uSaturation != 1.0 || uContrast != 1.0 || uNeon > 0.001) {',
		'    float grey = dot(c, vec3(0.2126, 0.7152, 0.0722));',
		'    c = mix(vec3(grey), c, uSaturation);',
		'    c = (c - 0.5) * uContrast + 0.5;',
		'    float lum = dot(c, vec3(0.2126, 0.7152, 0.0722));',
		'    c += c * uNeon * smoothstep(0.35, 1.0, lum) * 0.85;',
		'    c = max(c, vec3(0.0));',
		'  }',
		'  gl_FragColor = vec4(c, 1.0);',
		'}'
	].join('\n');

	// A thin starfield backdrop so the globe reads as a body in space rather
	// than floating on flat black — pure decoration, no simulation content.
	var STARS_VERT = [
		'precision highp float;',
		'attribute vec3 aPos;',
		'uniform mat4 uProj, uView;',
		'void main() {',
		'  mat4 v = uView; v[3][0] = 0.0; v[3][1] = 0.0; v[3][2] = 0.0;',
		'  vec4 p = uProj * v * vec4(aPos, 1.0);',
		'  gl_Position = p.xyww;',
		'  gl_PointSize = 1.4;',
		'}'
	].join('\n');
	var STARS_FRAG = [
		'precision mediump float;',
		'void main() { gl_FragColor = vec4(0.75, 0.82, 0.92, 0.85); }'
	].join('\n');

	// ---- particles ----------------------------------------------------------
	//
	// Ported from smoke-lab/smoke.js's particle layer: positions live in a
	// ping-pong float texture and never touch the CPU, a vertex shader fetches
	// its own position per-point (WebGL2 vertex texture fetch), and the update
	// passes reuse blit() against a small square FBO rather than the sim grid,
	// sampling the SAME velocity field the smoke advects through. Two things
	// are genuinely new here rather than copied:
	//
	//   1. every position update carries the 1/cos(latitude) metric (see the
	//      file header, and ADVECTION_FRAG above, which does the same thing to
	//      the dye) — a step in longitude is worth cos(phi) less ground than a
	//      step in latitude, so the EAST component of whatever velocity a
	//      particle is carrying has to be divided by cos(phi) before it is
	//      applied to its (u, v) position, exactly as the dye's own advection
	//      does. Latitude reflects at the poles instead of running past ±90°;
	//      longitude wraps at the seam via fract(), same as every sampled field
	//      in this file already does.
	//   2. the draw call projects each particle's (longitude, latitude) onto
	//      the unit sphere and through uProj/uView, and explicitly culls the
	//      far side: a point sitting exactly on the sphere's back face would
	//      otherwise sometimes survive the depth test near the limb, because
	//      the RENDERED globe is a 96x48 polygon mesh whose triangles are
	//      chords strictly inside the true sphere (see buildSphereMesh) —
	//      not the same surface a particle's exact unit-sphere position is
	//      tested against. The cull is the sign of the dot product between the
	//      particle's own surface normal and the direction to the camera,
	//      applied twice: once in the vertex stage (pushes a back-face point
	//      out of the clip volume so it never rasterises at all) and once
	//      again in the fragment stage (an explicit discard, belt and braces —
	//      the trail buffer in particular has no depth attachment of its own,
	//      so for trails this fragment test is the ONLY thing keeping the far
	//      side out, not a backstop).
	//
	// Seeding is also not a straight port: a uniformly random (u, v) is
	// uniform in LATITUDE, not in surface AREA — a fixed range of latitude
	// spans less ground near the poles than near the equator, so naive random
	// seeding packs more particles per unit area toward the poles. PARTICLE_
	// INIT_FRAG draws latitude as asin(2*rand-1) instead, which is the
	// standard correction for a uniform distribution on a sphere.

	var MINIMAL_VERT = [
		'precision highp float;',
		'attribute vec2 aPosition;',
		'varying vec2 vUv;',
		'void main() {',
		'  vUv = aPosition * 0.5 + 0.5;',
		'  gl_Position = vec4(aPosition, 0.0, 1.0);',
		'}'
	].join('\n');

	var PARTICLE_INIT_FRAG = [
		'precision highp float;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform float seed, lifetime, styleTrails;',
		'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453123); }',
		'void main() {',
		'  float rx = hash(vUv);',
		'  float ry = hash(vUv + vec2(37.2, 17.7));',
		// Uniform on the SPHERE, not uniform in v — see the header above.
		'  float phi = asin(clamp(ry * 2.0 - 1.0, -1.0, 1.0));',
		'  float v = phi / PI + 0.5;',
		'  float rz = styleTrails > 0.5 ? hash(vUv + vec2(91.7, 53.3)) * lifetime : 0.0;',
		'  gl_FragColor = vec4(rx, v, rz, 0.0);',
		'}'
	].join('\n');

	// Dust: no lifetime. `pvel` is the particle's own (east, north) velocity,
	// eased toward the fluid's at rate `drag` — that lag is what makes it
	// clump and streak rather than sit exactly on a smooth-looking field. The
	// metric only touches the EAST half of the step: north is already a
	// proper angular rate (a degree of latitude is a degree of latitude
	// everywhere), only a degree of longitude shrinks toward the poles.
	var PARTICLE_UPDATE_DUST_FRAG = [
		'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uPosTex, uVelocity, uObstacle;',
		'uniform vec2 texelSize;',
		'uniform float dt, drag, seed;',
		'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453123); }',
		'void main() {',
		'  vec4 data = texture2D(uPosTex, vUv);',
		'  vec2 pos = data.xy;',
		'  vec2 pvel = data.zw;',
		'  vec2 fluidVel = texture2D(uVelocity, clamp(pos, 0.0, 1.0)).xy;',
		'  float k = clamp(drag * dt, 0.0, 1.0);',
		'  pvel += (fluidVel - pvel) * k;',
		'  float phi = latOfV(pos.y);',
		'  float cphi = max(abs(cos(phi)), EPS_COS);',
		'  vec2 angRate = vec2(pvel.x / cphi, pvel.y);',
		'  pos += angRate * texelSize * dt;',
		'  pos.x = fract(pos.x);',
		// Reflect off the pole rather than run past it, and flip the
		// northward component so it reads as a bounce, not a teleport.
		'  if (pos.y < 0.0) { pos.y = -pos.y; pvel.y = -pvel.y; }',
		'  if (pos.y > 1.0) { pos.y = 2.0 - pos.y; pvel.y = -pvel.y; }',
		'  if (texture2D(uObstacle, pos).x > 0.5) {',
		'    float rx = hash(vUv);',
		'    float ry = hash(vUv + vec2(13.1, 71.7));',
		'    float rphi = asin(clamp(ry * 2.0 - 1.0, -1.0, 1.0));',
		'    pos = vec2(rx, rphi / PI + 0.5);',
		'    pvel = vec2(0.0);',
		'  }',
		'  gl_FragColor = vec4(pos, pvel);',
		'}'
	].join('\n');

	// Trails: age in frames, exactly as smoke-lab's does. On expiry OR landing
	// inside the obstacle mask (a sail or an island — obstacleFbo carries
	// both), the particle returns to its own fixed spawn point in uInitPos.
	var PARTICLE_UPDATE_TRAILS_FRAG = [
		'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'varying vec2 vUv;',
		'uniform sampler2D uPosTex, uVelocity, uObstacle, uInitPos;',
		'uniform vec2 texelSize;',
		'uniform float dt, lifetime;',
		'void main() {',
		'  vec4 data = texture2D(uPosTex, vUv);',
		'  vec2 pos = data.xy;',
		'  float age = data.z + 1.0;',
		'  vec2 fluidVel = texture2D(uVelocity, clamp(pos, 0.0, 1.0)).xy;',
		'  float phi = latOfV(pos.y);',
		'  float cphi = max(abs(cos(phi)), EPS_COS);',
		'  vec2 angRate = vec2(fluidVel.x / cphi, fluidVel.y);',
		'  pos += angRate * texelSize * dt;',
		'  pos.x = fract(pos.x);',
		'  if (pos.y < 0.0) pos.y = -pos.y;',
		'  if (pos.y > 1.0) pos.y = 2.0 - pos.y;',
		'  bool hitSolid = texture2D(uObstacle, pos).x > 0.5;',
		'  bool expired = age >= lifetime;',
		'  if (hitSolid || expired) {',
		'    pos = texture2D(uInitPos, vUv).xy;',
		'    age = expired ? age - lifetime : 0.0;',
		'  }',
		'  gl_FragColor = vec4(pos, age, 0.0);',
		'}'
	].join('\n');

	// Screen-space, unchanged from smoke-lab: the trail buffer is a postprocess
	// accumulator over the final image, not a field on the sphere, so it needs
	// no metric of its own. See the header on what that means for a moving
	// camera.
	var PARTICLE_FADE_FRAG = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'uniform sampler2D uTexture;',
		'uniform float amount;',
		'void main() { gl_FragColor = clamp(texture2D(uTexture, vUv) - vec4(amount), 0.0, 1.0); }'
	].join('\n');

	var PARTICLE_COMPOSITE_FRAG = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'uniform sampler2D uTexture;',
		'uniform float intensity;',
		'void main() { gl_FragColor = texture2D(uTexture, vUv) * intensity; }'
	].join('\n');

	// The only particle program with real vertex work: one gl.POINTS vertex
	// per particle, fetching that particle's (u, v) out of the position
	// texture, converting it to a point on the unit sphere, and projecting it
	// through the same uProj/uView the globe itself uses. See the header for
	// why the far-side cull lives here (vFacing, checked twice).
	var PARTICLE_DRAW_VERT = [
		'precision highp float; precision highp sampler2D;',
		METRIC_GLSL,
		'attribute vec2 aUV;',
		'uniform sampler2D uPosTex, uVelocity;',
		'uniform mat4 uProj, uView;',
		'uniform float uRadius;',
		'uniform vec3 uCamEye;',
		'uniform float uPointSize, uLifetime, uStyleTrails, uSpeedRef, uBrightness;',
		'varying float vOpacity, vBright, vFacing;',
		'void main() {',
		'  vec4 data = texture2D(uPosTex, aUV);',
		'  vec2 pos = clamp(data.xy, 0.0, 1.0);',
		'  float lam = lonOfU(pos.x);',
		'  float phi = latOfV(pos.y);',
		'  float cp = cos(phi);',
		'  vec3 normal = vec3(cp * cos(lam), sin(phi), cp * sin(lam));',
		'  vec3 worldPos = normal * uRadius;',
		'  gl_Position = uProj * uView * vec4(worldPos, 1.0);',
		'  vec3 toCam = uCamEye - worldPos;',
		'  float dist = max(length(toCam), 1e-4);',
		'  vFacing = dot(normal, toCam / dist);',
		// A back-face point is pushed well outside the clip volume so it never
		// rasterises at all — belt; the fragment shader's discard on vFacing is
		// braces, and for the (depth-less) trail buffer it is the ONLY guard.
		'  if (vFacing <= 0.0) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); }',
		// Perspective point size: shrinks with distance from the eye, so a
		// particle near the limb does not read the same size as one directly
		// under the camera. uRadius*1.6 is a reference distance tuned so the
		// point size at a typical chase-camera view matches uPointSize itself.
		'  gl_PointSize = clamp(uPointSize * uRadius * 1.6 / dist, 1.0, 14.0);',
		'  float opacity;',
		'  if (uStyleTrails > 0.5) {',
		'    float ageFrac = clamp(data.z / max(uLifetime, 1.0), 0.0, 1.0);',
		'    float fadeIn = min(ageFrac * 10.0, 1.0);',
		'    float fadeOut = 1.0 - clamp(ageFrac * 10.0 - 9.0, 0.0, 1.0);',
		'    opacity = fadeIn * fadeOut;',
		'  } else {',
		'    opacity = 0.10;',
		'  }',
		'  vec2 v = texture2D(uVelocity, pos).xy;',
		'  float ns = length(v) / max(uSpeedRef, 1.0);',
		'  vBright = clamp(ns * ns * uBrightness + 0.7, 0.0, 1.0);',
		'  vOpacity = opacity;',
		'}'
	].join('\n');

	var PARTICLE_DRAW_FRAG = [
		'precision highp float;',
		'varying float vOpacity, vBright, vFacing;',
		'uniform vec3 uColor;',
		'void main() {',
		'  if (vFacing <= 0.0) discard;',
		'  gl_FragColor = vec4(uColor * vBright, vOpacity);',
		'}'
	].join('\n');

	// Built by hand rather than through program(): aUV is pinned to location 1
	// so this draw never disturbs quadBuffer's aPosition binding at location 0
	// that every blit() call after it assumes is still in place.
	function buildParticleDrawProgram() {
		var vs = compile(gl.VERTEX_SHADER, PARTICLE_DRAW_VERT);
		var fs = compile(gl.FRAGMENT_SHADER, PARTICLE_DRAW_FRAG);
		var prog = gl.createProgram();
		gl.attachShader(prog, vs);
		gl.attachShader(prog, fs);
		gl.bindAttribLocation(prog, PARTICLE_ATTRIB_LOC, 'aUV');
		gl.linkProgram(prog);
		if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
		var uniforms = {};
		var n = gl.getProgramParameter(prog, gl.ACTIVE_UNIFORMS);
		for (var i = 0; i < n; i++) {
			var name = gl.getActiveUniform(prog, i).name;
			uniforms[name] = gl.getUniformLocation(prog, name);
			if (name.slice(-3) === '[0]') uniforms[name.slice(0, -3)] = uniforms[name];
		}
		return { handle: prog, uniforms: uniforms };
	}

	// ---- buffers ----------------------------------------------------------

	var velocity, dye, pressure, divergenceFbo, curlFbo, obstacleFbo;
	var forceFbo, reduceChain = [], speedField, dyeHat, dyeTilde;
	var scratchDiv; // for the headless divergence-stats probe only
	var projDivFbo; // divergence captured immediately post-projection, see step()

	// The particle layer's own state — see the shader block above. posA/posB
	// are the ping-pong position texture: dust stores (u, v) plus its own
	// lagged (east, north) velocity in zw; trails stores (u, v) plus age in z.
	// particleInitPos is NOT ping-ponged: it is each trail particle's spawn
	// point, written once per rebuild. trailA/B are screen-sized (see
	// rebuildTrailBuffers) and hold the fading streak buffer.
	var posA, posB, particlePos, particleInitPos;
	var particleGridSize = 0, particleCount = 0, particleUvBuffer;
	var PARTICLE_ATTRIB_LOC = 1;
	var trailA, trailB, trailRead, trailWrite;
	var PARTICLE_SIZES = [128, 256, 512, 1024];

	// Both dimensions power-of-two, so WebGL1's NPOT wrap restriction (which
	// would otherwise force CLAMP_TO_EDGE on x too, breaking the longitude
	// wrap) never applies. Fixed at boot — unlike smoke-lab, this grid does
	// not depend on the canvas's aspect ratio at all, so it is never rebuilt
	// on resize.
	// The grid spans the WHOLE sphere, 360 by 180 degrees, where the flat lab's
	// spanned only the window you were looking at. At 512x256 her two foils and
	// the slot between them landed on THIRTY cells in total, against 671 on the
	// flat grid: nowhere near enough to resolve a section, let alone a gap, which
	// is why trimming her barely changed anything. Four times the cells here, and
	// a bigger boat below, brings it back into the same ballpark.
	var SIM_W = 1024, SIM_H = 512;
	var DYE_W = 1024, DYE_H = 512;

	function buildBuffers() {
		var filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
		var type = ext.halfFloatTexType;

		dye = createDoubleFBO(DYE_W, DYE_H, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dyeHat = createSphereFBO(DYE_W, DYE_H, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dyeTilde = createSphereFBO(DYE_W, DYE_H, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		velocity = createDoubleFBO(SIM_W, SIM_H, ext.formatRG.internal, ext.formatRG.format, type, filter);
		divergenceFbo = createSphereFBO(SIM_W, SIM_H, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
		curlFbo = createSphereFBO(SIM_W, SIM_H, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
		obstacleFbo = createSphereFBO(SIM_W, SIM_H, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		scratchDiv = createSphereFBO(SIM_W, SIM_H, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
		projDivFbo = createSphereFBO(SIM_W, SIM_H, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);

		var F = 512;
		forceFbo = createSphereFBO(F, F / 2, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST);
		speedField = createDoubleFBO(SIM_W, SIM_H, ext.formatR.internal, ext.formatR.format, type, filter);
		reduceChain = [];
		var rw = F, rh = F / 2;
		while (rw > 1 || rh > 1) {
			rw = Math.max(1, rw >> 1); rh = Math.max(1, rh >> 1);
			reduceChain.push(createSphereFBO(rw, rh, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST));
		}
		pressure = createDoubleFBO(SIM_W, SIM_H, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
	}

	// ---- sphere mesh --------------------------------------------------------

	var sphereVAO = { vbo: null, ibo: null, count: 0 };
	var starsVAO = { vbo: null, count: 0 };

	function buildSphereMesh() {
		var LON = 96, LAT = 48;
		var verts = [], idx = [];
		for (var j = 0; j <= LAT; j++) {
			var v = j / LAT;
			var phi = (v - 0.5) * PI;
			for (var i = 0; i <= LON; i++) {
				var u = i / LON;
				var lam = u * TAU;
				var cp = Math.cos(phi);
				verts.push(cp * Math.cos(lam), Math.sin(phi), cp * Math.sin(lam), u, v);
			}
		}
		var stride = LON + 1;
		for (j = 0; j < LAT; j++) {
			for (i = 0; i < LON; i++) {
				var a = j * stride + i, b = a + 1, c = a + stride, d = c + 1;
				idx.push(a, c, b, b, c, d);
			}
		}
		sphereVAO.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, sphereVAO.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
		sphereVAO.ibo = gl.createBuffer();
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVAO.ibo);
		var idxArr = idx.length > 65535 ? new Uint32Array(idx) : new Uint16Array(idx);
		sphereVAO.wide = idx.length > 65535;
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idxArr, gl.STATIC_DRAW);
		sphereVAO.count = idx.length;

		// A sparse random field of points well outside the globe.
		var stars = [];
		for (var s = 0; s < 800; s++) {
			var sv = new Vec3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1);
			sv.normalize().multiplyScalar(200);
			stars.push(sv.x, sv.y, sv.z);
		}
		starsVAO.vbo = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, starsVAO.vbo);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(stars), gl.STATIC_DRAW);
		starsVAO.count = stars.length / 3;
	}

	// ---- matrices (hand-rolled, column-major Float32Array(16)) ---------------

	function mat4Perspective(out, fovy, aspect, near, far) {
		var f = 1 / Math.tan(fovy / 2), nf = 1 / (near - far);
		out.set([
			f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (far + near) * nf, -1,
			0, 0, 2 * far * near * nf, 0
		]);
		return out;
	}
	var _lx = new Vec3(), _ly = new Vec3(), _lz = new Vec3();
	function mat4LookAt(out, eye, center, up) {
		_lz.set(eye.x - center.x, eye.y - center.y, eye.z - center.z).normalize();
		_lx.crossVectors(up, _lz).normalize();
		_ly.crossVectors(_lz, _lx).normalize();
		out.set([
			_lx.x, _ly.x, _lz.x, 0,
			_lx.y, _ly.y, _lz.y, 0,
			_lx.z, _ly.z, _lz.z, 0,
			-_lx.dot(eye), -_ly.dot(eye), -_lz.dot(eye), 1
		]);
		return out;
	}

	var uProj = new Float32Array(16), uView = new Float32Array(16);
	var camEye = new Vec3(), camTarget = new Vec3(), camUp = new Vec3();
	var camFoot = new Vec3();

	// Chase camera: trail the boat BACKWARD ALONG THE GREAT CIRCLE it is
	// sailing (reusing rotateAbout again — the same primitive that moves the
	// boat), lifted radially above that trailing point. That keeps the
	// camera at a constant height above the local surface and gives it a
	// natural "up" (the outward normal at its own foot) as it follows her
	// clean over the horizon, including over a pole.
	var camBackAngle = 0.62, camHeight = 1.55, camRadius = 3.0;
	var camDrag = { on: false, yaw: 0, pitch: 0.35 };
	var _lead = new Vec3();
	var lastDt = 0.016;

	// Zoom multiplies the camera's HEIGHT ABOVE THE SURFACE, not its distance
	// from the centre of the globe. Scaling the distance would let the eye sink
	// inside the sphere at the near end and would make the far end feel like the
	// planet was shrinking rather than receding. Height keeps the low end honest:
	// at 0.06 you are down among the wave tops with the horizon close, and at the
	// far stop the whole globe sits in frame.
	var ZOOM_MIN = 0.06, ZOOM_MAX = 14.0;

	// Five ways of watching her, because none of them is right for everything.
	//
	//   chase   dead astern, always. Best for trimming, worst for seeing where
	//           you are on the planet.
	//   lead    astern but AIMED AHEAD of her, so the water she is sailing into
	//           gets more of the frame than the water she has left.
	//   lazy    the chase position, heavily damped. She wanders about the frame
	//           and the camera ambles after her rather than being welded on.
	//   limb    orbits with her longitude at a fixed tilt and never tips to keep
	//           her centred, so she genuinely rises and sets over the limb.
	//   free    drag it wherever you like.
	var camLazy = { pos: null, target: null };

	function paintCamButtons() { if (kit && kit.refreshAll) kit.refreshAll(); }

	function updateCamera() {
		var zoom = clamp(params.zoom, ZOOM_MIN, ZOOM_MAX);
		var mode = params.camMode;
		var height = camHeight * zoom;

		if (mode === 'free') {
			var r = camRadius + camHeight * 1.4 * zoom;
			var cy = Math.cos(camDrag.pitch), sy = Math.sin(camDrag.pitch);
			camEye.set(r * cy * Math.cos(camDrag.yaw), r * sy, r * cy * Math.sin(camDrag.yaw));
			camTarget.set(0, 0, 0);
			camUp.set(0, 1, 0);
		} else if (mode === 'limb') {
			// Follow her round the world without ever looking down at her: the
			// eye rides her longitude at a fixed tilt, aimed at the centre. She
			// drifts across the disc and over the edge on her own.
			var rr = camRadius + camHeight * 1.4 * zoom;
			var tilt = camDrag.pitch;
			camEye.set(rr * Math.cos(tilt) * Math.cos(boat.lam + 0.9), rr * Math.sin(tilt),
				rr * Math.cos(tilt) * Math.sin(boat.lam + 0.9));
			camTarget.set(0, 0, 0);
			camUp.set(0, 1, 0);
		} else {
			// chase / lead / lazy all hang off the same trailing foot.
			var back = camBackAngle * Math.min(1, 0.35 + 0.65 * zoom);
			camFoot.copy(boat.pos);
			rotateAbout(camFoot, _axis.crossVectors(boat.pos, boat.head).normalize(), -back);
			camEye.copy(camFoot).multiplyScalar(camRadius + height);
			camTarget.copy(boat.pos).multiplyScalar(camRadius);
			camUp.copy(camFoot);

			if (mode === 'lead') {
				// Look a long way UP HER TRACK, not just a nudge.
				//
				// The first attempt only shifted the look-at point by a fraction
				// of the trailing angle, which is small enough that lead and
				// chase were the same picture. Two changes make it a different
				// camera: tuck in much closer astern, and aim at a point a good
				// arc ahead of her. She ends up low in the frame with the water
				// she is sailing into filling it, and on a small enough globe you
				// are looking over the curve at where she is going.
				_axis.crossVectors(boat.pos, boat.head).normalize();
				camFoot.copy(boat.pos);
				rotateAbout(camFoot, _axis, -camBackAngle * 0.35);
				camEye.copy(camFoot).multiplyScalar(camRadius + height * 1.15);
				camUp.copy(camFoot);

				_lead.copy(boat.pos);
				rotateAbout(_lead, _axis, params.camLead);
				camTarget.copy(_lead).multiplyScalar(camRadius);
			} else if (mode === 'lazy') {
				// Damped follow. The camera is chasing the chase position, so she
				// leads it into turns and settles back into frame afterwards.
				if (!camLazy.pos) {
					camLazy.pos = new Vec3(camEye.x, camEye.y, camEye.z);
					camLazy.target = new Vec3(camTarget.x, camTarget.y, camTarget.z);
				}
				// Component-wise by hand: this Vec3 is a small local helper, not
				// three.js, and has no lerp. Calling one threw every frame while
				// the mode still "worked", because the throw happened after the
				// eye had already been set to the undamped chase position.
				var k = 1 - Math.exp(-lastDt * params.camLazy);
				camLazy.pos.x += (camEye.x - camLazy.pos.x) * k;
				camLazy.pos.y += (camEye.y - camLazy.pos.y) * k;
				camLazy.pos.z += (camEye.z - camLazy.pos.z) * k;
				camLazy.target.x += (camTarget.x - camLazy.target.x) * k;
				camLazy.target.y += (camTarget.y - camLazy.target.y) * k;
				camLazy.target.z += (camTarget.z - camLazy.target.z) * k;
				camEye.copy(camLazy.pos);
				camTarget.copy(camLazy.target);
				camUp.copy(camEye).normalize();
			}
		}
		mat4LookAt(uView, camEye, camTarget, camUp);
	}

	// ---- the boat's obstacle mask & foil uniforms ----------------------------

	// The Hawaiian chain, at its real relative geometry: offsets in degrees from
	// the Big Island, and radii in degrees, all scaled up by `islandScale`. The
	// real islands are under a degree across, which on a 1024x512 grid is three
	// cells, so they had to be blown up to mean anything to the flow. Their
	// spacing and their north-westward run are the true ones.
	var CHAIN = [
		{ dLon:  0.00, dLat: 0.00, r: 0.55 },   // Hawaii
		{ dLon: -0.85, dLat: 1.25, r: 0.38 },   // Maui
		{ dLon: -2.55, dLat: 1.95, r: 0.30 }    // Oahu
	];

	function setIslandUniforms(p) {
		var n = params.islands ? CHAIN.length : 0;
		gl.uniform1i(p.uniforms.uIslandCount, n);
		var flat = new Float32Array(9);
		for (var i = 0; i < CHAIN.length; i++) {
			var c = CHAIN[i], k = params.islandScale;
			flat[i*3+0] = (params.islandLon + c.dLon * k) * DEG;
			flat[i*3+1] = (params.islandLat + c.dLat * k) * DEG;
			flat[i*3+2] = Math.max(0.002, c.r * k * DEG);
		}
		gl.uniform3fv(p.uniforms.uIslands, flat);
	}

	function setFoilUniforms(p) {
		gl.uniform2f(p.uniforms.uJibOff, params.jibX, params.jibY);
		gl.uniform2f(p.uniforms.uMainOff, params.mainX, params.mainY);
		gl.uniform4f(p.uniforms.uJib, params.jibAngle * DEG, params.jibChord, params.jibCamber, params.jibThick);
		gl.uniform4f(p.uniforms.uMain, params.mainAngle * DEG, params.mainChord, params.mainCamber, params.mainThick);
	}

	// ---- solver step --------------------------------------------------------

	var lastTime = 0, frames = 0, fpsTimer = 0, simTime = 0;

	// Oil needs all three channels: each band of the rake keeps its own colour so
	// you can read WHICH air ended up where, not just how much. These two helpers
	// were added to smoke-lab by matching its splat signature, which is
	// splat(target, x, y, ...) in screen space. Here it is (target, lam, phi, ...)
	// in radians, so the patch silently missed and oil threw "hueRGB is not
	// defined" every frame with the picture still moving.
	function splatRGB(target, lam, phi, cr, cg, cb, r) {
		var p = programs.splat;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTarget, target.read.attach(0));
		gl.uniform2f(p.uniforms.point, lam / TAU, phi / PI + 0.5);
		gl.uniform3f(p.uniforms.color, cr, cg, cb);
		gl.uniform1f(p.uniforms.radius, r);
		blit(target.write);
		target.swap();
	}


	function splat(target, lam, phi, dx, dy, r) {
		var p = programs.splat;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTarget, target.read.attach(0));
		gl.uniform2f(p.uniforms.point, lam / TAU, phi / PI + 0.5);
		gl.uniform3f(p.uniforms.color, dx, dy, 0);
		gl.uniform1f(p.uniforms.radius, r);
		blit(target.write);
		target.swap();
	}

	function inject(dt) {
		if (params.streaks <= 0.001) return;
		var n = Math.max(2, Math.round(params.streakCount));
		var r = 0.000012 * params.streakWidth * params.streakWidth;
		var amt = params.streaks * dt * 48;
		for (var i = 0; i < n; i++) {
			var v = (i + 0.5) / n;
			var phi = (v - 0.5) * PI;
			// Skip the last couple of rows against each pole — a streak seeded
			// right in the damped band would just be erased next frame.
			if (Math.abs(phi) > 1.45) continue;
			if (params.medium === 'oil') {
				var c = hueRGB((i / n + simTime * 0.012) % 1, amt);
				splatRGB(dye, 0.0, phi, c[0], c[1], c[2], r);
			} else {
				splat(dye, 0.0, phi, amt, amt, r);
			}
		}
	}

	// ---- particle runtime -----------------------------------------------------

	// Screen-sized, unlike every other buffer in this file: the trail streak
	// buffer is a postprocess over the final rendered image, not a field on
	// the sphere, so it has to track the canvas rather than the fixed sim
	// grid. Rebuilt at boot and on every resize — see frame().
	function rebuildTrailBuffers() {
		if (!gl || !ext) return;
		var filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
		var type = ext.halfFloatTexType;
		var w = Math.max(1, canvas.width), h = Math.max(1, canvas.height);
		trailA = createFBO(w, h, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
		trailB = createFBO(w, h, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
		trailRead = trailA; trailWrite = trailB;
	}

	function buildParticleUvBuffer(n) {
		var count = n * n;
		var data = new Float32Array(count * 2);
		var k = 0;
		for (var j = 0; j < n; j++) {
			for (var i = 0; i < n; i++) {
				data[k++] = (i + 0.5) / n;
				data[k++] = (j + 0.5) / n;
			}
		}
		if (!particleUvBuffer) particleUvBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particleUvBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	}

	// Rebuilds the particle textures at the currently selected size, exactly
	// as smoke-lab's does — called at boot and again whenever the count or
	// style control changes, since dust and trails give the texture's z/w a
	// different meaning (a lagged velocity vs. an age).
	function rebuildParticles() {
		if (!gl || !ext) return;
		if (!ext.isWebGL2) {
			console.warn('GLOBELAB: particles need WebGL2 (vertex texture fetch); disabling.');
			params.particlesOn = false;
			return;
		}
		var idx = Math.max(0, Math.min(PARTICLE_SIZES.length - 1, Math.round(params.particleSizeIdx)));
		var n = PARTICLE_SIZES[idx];
		particleGridSize = n;
		particleCount = n * n;

		var type = ext.halfFloatTexType;
		posA = createFBO(n, n, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
		posB = createFBO(n, n, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);
		particlePos = {
			get read() { return posA; }, set read(v) { posA = v; },
			get write() { return posB; }, set write(v) { posB = v; },
			swap: function () { var t = posA; posA = posB; posB = t; }
		};
		particleInitPos = createFBO(n, n, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST, gl.CLAMP_TO_EDGE, gl.CLAMP_TO_EDGE);

		var p = programs.particleInit;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.seed, Math.random() * 1000.0);
		gl.uniform1f(p.uniforms.lifetime, params.particleLifetime);
		gl.uniform1f(p.uniforms.styleTrails, params.particleStyle === 'trails' ? 1.0 : 0.0);
		blit(particlePos.read);

		var c = programs.clear;
		gl.useProgram(c.handle);
		gl.uniform1i(c.uniforms.uTexture, particlePos.read.attach(0));
		gl.uniform1f(c.uniforms.value, 1.0);
		blit(particleInitPos);

		buildParticleUvBuffer(n);
	}

	// Position advection only — both styles, gated by pause exactly like the
	// rest of the solver step. Deliberately does NOT touch the trail buffer or
	// the camera: see paintTrailBuffer() below for why that has to happen
	// later in the frame.
	function updateParticles(dt) {
		if (!params.particlesOn || !ext.isWebGL2 || !particlePos) return;
		var isTrails = params.particleStyle === 'trails';
		var p = isTrails ? programs.particleUpdateTrails : programs.particleUpdateDust;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uPosTex, particlePos.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1f(p.uniforms.dt, dt);
		if (isTrails) {
			gl.uniform1i(p.uniforms.uInitPos, particleInitPos.attach(3));
			gl.uniform1f(p.uniforms.lifetime, params.particleLifetime);
		} else {
			gl.uniform1f(p.uniforms.drag, params.particleDrag);
			gl.uniform1f(p.uniforms.seed, simTime);
		}
		blit(particlePos.write);
		particlePos.swap();
	}

	// Fades the trail buffer and draws this frame's particles into it,
	// additively — trails only, no-op for dust. Split out from
	// updateParticles() and called separately, AFTER the camera for this
	// frame has been computed (see frame()): the point draw needs current
	// uProj/uView/camEye to project onto the sphere, and those are not ready
	// yet at the point in the frame where the rest of the physics runs.
	function paintTrailBuffer() {
		if (!params.particlesOn || !ext.isWebGL2 || !particlePos) return;
		if (params.particleStyle !== 'trails') return;

		var f = programs.particleFade;
		gl.useProgram(f.handle);
		gl.uniform1i(f.uniforms.uTexture, trailRead.attach(0));
		gl.uniform1f(f.uniforms.amount, 1.0 / Math.max(1, params.particleTrailLength));
		gl.disable(gl.BLEND);
		blit(trailWrite);
		var t = trailRead; trailRead = trailWrite; trailWrite = t;

		var speedRef = Math.max(1, params.wind * 300);
		var p = programs.particleDraw;
		gl.useProgram(p.handle);
		gl.bindBuffer(gl.ARRAY_BUFFER, particleUvBuffer);
		gl.vertexAttribPointer(PARTICLE_ATTRIB_LOC, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(PARTICLE_ATTRIB_LOC);
		gl.uniform1i(p.uniforms.uPosTex, particlePos.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniformMatrix4fv(p.uniforms.uProj, false, uProj);
		gl.uniformMatrix4fv(p.uniforms.uView, false, uView);
		gl.uniform1f(p.uniforms.uRadius, camRadius);
		gl.uniform3f(p.uniforms.uCamEye, camEye.x, camEye.y, camEye.z);
		gl.uniform1f(p.uniforms.uPointSize, params.particlePointSize);
		gl.uniform1f(p.uniforms.uLifetime, params.particleLifetime);
		gl.uniform1f(p.uniforms.uStyleTrails, 1.0);
		gl.uniform1f(p.uniforms.uSpeedRef, speedRef);
		gl.uniform1f(p.uniforms.uBrightness, params.particleBrightness);
		gl.uniform3f(p.uniforms.uColor, 1.0, 1.0, 1.0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, trailRead.fbo);
		gl.viewport(0, 0, trailRead.width, trailRead.height);
		// This FBO has no depth attachment, so the shader's own vFacing test
		// (both stages — see PARTICLE_DRAW_VERT/FRAG) is the only thing
		// stopping a far-side particle from painting into the streak buffer.
		gl.disable(gl.DEPTH_TEST);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		gl.drawArrays(gl.POINTS, 0, particleCount);
		gl.disable(gl.BLEND);
		gl.enable(gl.DEPTH_TEST);
	}

	// The actual screen draw, called every frame regardless of pause so the
	// last-computed picture stays on screen — and, on the globe, so a paused
	// population still visibly rotates with her if the camera is orbited by
	// hand. Dust has no persistent buffer: draw its points straight onto the
	// canvas, where the depth buffer the globe itself just wrote gives a
	// second, independent line of occlusion on top of the shader's own
	// vFacing cull. Trails just composites the buffer paintTrailBuffer()
	// already built, a plain screen-space blend with the depth test turned
	// off (the quad's own clip-space z is meaningless here).
	function drawParticles() {
		if (!params.particlesOn || !ext.isWebGL2 || !particlePos) return;
		var isTrails = params.particleStyle === 'trails';

		if (isTrails) {
			var c = programs.particleComposite;
			gl.useProgram(c.handle);
			gl.uniform1i(c.uniforms.uTexture, trailRead.attach(0));
			gl.uniform1f(c.uniforms.intensity, Math.max(0.01, params.particleBrightness * 0.12));
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.disable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE);
			blit(null);
			gl.disable(gl.BLEND);
			gl.enable(gl.DEPTH_TEST);
		} else {
			var speedRef = Math.max(1, params.wind * 300);
			var p2 = programs.particleDraw;
			gl.useProgram(p2.handle);
			gl.bindBuffer(gl.ARRAY_BUFFER, particleUvBuffer);
			gl.vertexAttribPointer(PARTICLE_ATTRIB_LOC, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(PARTICLE_ATTRIB_LOC);
			gl.uniform1i(p2.uniforms.uPosTex, particlePos.read.attach(0));
			gl.uniform1i(p2.uniforms.uVelocity, velocity.read.attach(1));
			gl.uniformMatrix4fv(p2.uniforms.uProj, false, uProj);
			gl.uniformMatrix4fv(p2.uniforms.uView, false, uView);
			gl.uniform1f(p2.uniforms.uRadius, camRadius);
			gl.uniform3f(p2.uniforms.uCamEye, camEye.x, camEye.y, camEye.z);
			gl.uniform1f(p2.uniforms.uPointSize, params.particlePointSize);
			gl.uniform1f(p2.uniforms.uLifetime, params.particleLifetime);
			gl.uniform1f(p2.uniforms.uStyleTrails, 0.0);
			gl.uniform1f(p2.uniforms.uSpeedRef, speedRef);
			gl.uniform1f(p2.uniforms.uBrightness, params.particleBrightness);
			gl.uniform3f(p2.uniforms.uColor, 1.0, 1.0, 1.0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.enable(gl.DEPTH_TEST);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA);
			gl.drawArrays(gl.POINTS, 0, particleCount);
			gl.disable(gl.BLEND);
		}
	}

	function runPressureSolve(divSrc, iterations) {
		var p = programs.clear;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTexture, pressure.read.attach(0));
		gl.uniform1f(p.uniforms.value, 0.8);
		blit(pressure.write);
		pressure.swap();

		p = programs.pressure;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uDivergence, divSrc.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		for (var i = 0; i < iterations; i++) {
			gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(1));
			blit(pressure.write);
			pressure.swap();
		}
	}

	function step(dt) {
		gl.disable(gl.BLEND);
		var p;

		p = programs.mask;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.boatLonLat, boat.lam, boat.phi);
		gl.uniform2f(p.uniforms.heading2D, boat.headEast, boat.headNorth);
		gl.uniform2f(p.uniforms.hullVel,
			params.showBoat ? (boat.speed * WORLD_SCALE) * boat.headEast * 300 : 0,
			params.showBoat ? (boat.speed * WORLD_SCALE) * boat.headNorth * 300 : 0);
		gl.uniform1f(p.uniforms.size, params.showBoat ? params.boatSize : 0.0);
		gl.uniform1f(p.uniforms.lee, leeSide());
		setFoilUniforms(p);
		setIslandUniforms(p);
		blit(obstacleFbo);

		p = programs.curl;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		blit(curlFbo);

		p = programs.vorticity;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(p.uniforms.uCurl, curlFbo.attach(1));
		gl.uniform1f(p.uniforms.curl, params.curl);
		gl.uniform1f(p.uniforms.dt, dt);
		blit(velocity.write);
		velocity.swap();

		p = programs.divergence;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
		blit(divergenceFbo);

		runPressureSolve(divergenceFbo, params.iterations);

		p = programs.gradient;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		blit(velocity.write);
		velocity.swap();

		// The velocity field is divergence-free RIGHT HERE — this is what the
		// projection actually guarantees. Everything from this point on this
		// frame (self-advection, the wind forcing, pole damping) reintroduces
		// a little divergence, which is why it is worth re-solving every
		// single frame rather than once — exactly the order smoke-lab's own
		// solver uses. The verification harness captures a copy at this exact
		// point so it can judge the projection on its own terms, separately
		// from "how much drifts back in before the next look".
		if (LAB.captureProjDiv) {
			var pd = programs.divergence;
			gl.useProgram(pd.handle);
			gl.uniform2f(pd.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform1i(pd.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(pd.uniforms.uObstacle, obstacleFbo.attach(1));
			blit(projDivFbo);
		}

		p = programs.advection;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		if (!ext.supportLinearFiltering) gl.uniform2f(p.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
		var velId = velocity.read.attach(0);
		gl.uniform1i(p.uniforms.uVelocity, velId);
		gl.uniform1i(p.uniforms.uSource, velId);
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		gl.uniform1f(p.uniforms.blockDye, 0);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.dissipation, params.viscosity);
		blit(velocity.write);
		velocity.swap();

		p = programs.wind;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1f(p.uniforms.wind, params.wind * 300);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.time, simTime);
		blit(velocity.write);
		velocity.swap();

		p = programs.poleDamp;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1f(p.uniforms.dt, dt);
		blit(velocity.write);
		velocity.swap();

		var dyeTex = !ext.supportLinearFiltering;
		function advectDye(srcTex, target, sign) {
			var q = programs.advection;
			gl.useProgram(q.handle);
			gl.uniform2f(q.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			if (dyeTex) gl.uniform2f(q.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
			gl.uniform1i(q.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(q.uniforms.uSource, srcTex.attach(1));
			gl.uniform1i(q.uniforms.uObstacle, obstacleFbo.attach(2));
			gl.uniform1f(q.uniforms.blockDye, 0);
			gl.uniform1f(q.uniforms.dt, sign * dt);
			gl.uniform1f(q.uniforms.dissipation, 0);
			blit(target);
		}

		if (params.maccormack > 0.001) {
			advectDye(dye.read, dyeHat, 1);
			advectDye(dyeHat, dyeTilde, -1);
			p = programs.maccormack;
			gl.useProgram(p.handle);
			gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform2f(p.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
			gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(p.uniforms.uPhi, dye.read.attach(1));
			gl.uniform1i(p.uniforms.uPhiHat, dyeHat.attach(2));
			gl.uniform1i(p.uniforms.uPhiTilde, dyeTilde.attach(3));
			gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(4));
			gl.uniform1f(p.uniforms.dt, dt);
			gl.uniform1f(p.uniforms.dissipation, params.fade);
			gl.uniform1f(p.uniforms.strength, params.maccormack);
			var spdRef = Math.max(1, params.wind * 300);
			gl.uniform1f(p.uniforms.mixLo, spdRef * params.wakeMixLo);
			gl.uniform1f(p.uniforms.mixHi, spdRef * params.wakeMixHi);
			blit(dye.write);
			dye.swap();
		} else {
			p = programs.advection;
			gl.useProgram(p.handle);
			gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			if (dyeTex) gl.uniform2f(p.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
			gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(p.uniforms.uSource, dye.read.attach(1));
			gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
			gl.uniform1f(p.uniforms.blockDye, 1);
			gl.uniform1f(p.uniforms.dt, dt);
			gl.uniform1f(p.uniforms.dissipation, params.fade);
			blit(dye.write);
			dye.swap();
		}
	}

	var force = { drive: 0, side: 0, window: 2.5, acc: null, ready: false, fast: 0, yaw: 0, yawMean: 0 };
	LAB.force = force;
	var forceRead = new Float32Array(4), forceByte = new Uint8Array(4);

	function measureForce(dt) {
		var p = programs.force;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, forceFbo.texelSizeX, forceFbo.texelSizeY);
		gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
		gl.uniform2f(p.uniforms.boatLonLat, boat.lam, boat.phi);
		gl.uniform2f(p.uniforms.heading2D, boat.headEast, boat.headNorth);
		gl.uniform1f(p.uniforms.uCLR, params.clr * params.boatSize);
		blit(forceFbo);

		p = programs.reduce;
		gl.useProgram(p.handle);
		var src = forceFbo;
		for (var i = 0; i < reduceChain.length; i++) {
			gl.uniform1i(p.uniforms.uSrc, src.attach(0));
			gl.uniform2f(p.uniforms.srcTexel, src.texelSizeX, src.texelSizeY);
			blit(reduceChain[i]);
			src = reduceChain[i];
		}
		var last = reduceChain[reduceChain.length - 1];
		gl.bindFramebuffer(gl.FRAMEBUFFER, last.fbo);
		var fx, fy, mz;
		if (ext.isWebGL2 || ext.readFloat) {
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, forceRead);
			fx = forceRead[0]; fy = forceRead[1]; mz = forceRead[2];
		} else {
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, forceByte);
			fx = (forceByte[0] / 255 - 0.5) * 2; fy = (forceByte[1] / 255 - 0.5) * 2;
			mz = (forceByte[2] / 255 - 0.5) * 2;
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		if (!isFinite(fx) || !isFinite(fy)) return;
		if (!isFinite(mz)) mz = 0;

		var q = Math.max(1e-6, (params.wind * 300) * (params.wind * 300) * params.boatSize);
		fx /= q; fy /= q;
		mz /= q * Math.max(1e-6, params.boatSize);

		var drive = fx * boat.headEast + fy * boat.headNorth;
		var side = -fx * boat.headNorth + fy * boat.headEast;

		var k = 1 - Math.exp(-dt / 0.4);
		force.fast += (drive - force.fast) * k;
		// Same 0.4 s smoothing as the drive: quick enough to answer a trim
		// change, slow enough not to chase the vortex shedding.
		force.yaw += (mz - force.yaw) * k;

		if (!force.acc) force.acc = { drive: 0, side: 0, yaw: 0, t: 0 };
		force.acc.drive += drive * dt;
		force.acc.side += side * dt;
		force.acc.yaw += mz * dt;
		force.acc.t += dt;
		if (force.acc.t >= force.window) {
			force.drive = force.acc.drive / force.acc.t;
			force.side = force.acc.side / force.acc.t;
			force.yawMean = force.acc.yaw / force.acc.t;
			force.ready = true;
			force.acc = null;
		}
	}

	function buildSpeedField() {
		var p = programs.speed;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		blit(speedField.write);
		speedField.swap();
	}

	// ---- headless verification hooks ------------------------------------------
	//
	// Exposed so a Playwright harness can drive the sim far faster than real
	// time (many fixed-dt ticks per call) and read fields back numerically —
	// see the note at the top of this file on why "does it look right" is not
	// good enough for this page.

	LAB.captureProjDiv = false;

	LAB.tick = function (dt, n) {
		n = n || 1;
		for (var i = 0; i < n; i++) {
			simTime += dt;
			stepBoat(dt);
			inject(dt);
			step(dt);
			measureForce(dt);
			buildSpeedField();
			updateParticles(dt);
		}
	};

	// Post-projection divergence, sampled on a grid well clear of the poles
	// (|lat| < maxAbsLatDeg). Returns {mean, max, meanAbs, samples}.
	function readDivergenceFbo(fbo, maxAbsLatDeg) {
		var W = fbo.width, H = fbo.height;
		var buf = new Float32Array(W * H * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
		gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, buf);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);

		var sum = 0, sumAbs = 0, maxAbs = 0, n = 0;
		var rowLo = Math.round((0.5 - maxAbsLatDeg / 180) * H);
		var rowHi = Math.round((0.5 + maxAbsLatDeg / 180) * H);
		for (var j = rowLo; j < rowHi; j++) {
			for (var i = 0; i < W; i++) {
				var v = buf[(j * W + i) * 4];
				sum += v; sumAbs += Math.abs(v); maxAbs = Math.max(maxAbs, Math.abs(v)); n++;
			}
		}
		return { mean: sum / n, meanAbs: sumAbs / n, max: maxAbs, samples: n };
	}

	// Divergence at the END of a full step — after self-advection, the wind
	// forcing and pole damping have all had a chance to perturb the field
	// the projection just cleaned up. This is "how divergent is what's on
	// screen right now", not a judgement of the projection itself.
	LAB.divergenceStats = function (maxAbsLatDeg) {
		maxAbsLatDeg = maxAbsLatDeg == null ? 75 : maxAbsLatDeg;
		var p = programs.divergence;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
		blit(scratchDiv);
		return readDivergenceFbo(scratchDiv, maxAbsLatDeg);
	};

	// Divergence sampled immediately after the gradient-subtract, before
	// anything downstream has a chance to reintroduce it — the fair test of
	// what the pressure solve itself achieves. Requires LAB.captureProjDiv =
	// true to be set before the tick() that should be measured, since it
	// costs an extra pass every step and is off by default.
	LAB.projectedDivergenceStats = function (maxAbsLatDeg) {
		maxAbsLatDeg = maxAbsLatDeg == null ? 75 : maxAbsLatDeg;
		return readDivergenceFbo(projDivFbo, maxAbsLatDeg);
	};

	LAB.boatState = function () {
		return {
			pos: { x: boat.pos.x, y: boat.pos.y, z: boat.pos.z },
			head: { x: boat.head.x, y: boat.head.y, z: boat.head.z },
			posLen: boat.pos.length(),
			headLen: boat.head.length(),
			headDotPos: boat.head.dot(boat.pos),
			speed: boat.speed,
			lam: boat.lam, phi: boat.phi
		};
	};

	LAB.velocityStats = function () {
		var W = velocity.width, H = velocity.height;
		var buf = new Float32Array(W * H * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, velocity.read.fbo);
		gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, buf);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var sum = 0, max = 0, n = W * H, bad = 0;
		for (var i = 0; i < n; i++) {
			var vx = buf[i * 4], vy = buf[i * 4 + 1];
			if (!isFinite(vx) || !isFinite(vy)) { bad++; continue; }
			var m = Math.sqrt(vx * vx + vy * vy);
			sum += m; if (m > max) max = m;
		}
		return { mean: sum / n, max: max, nonFinite: bad, samples: n };
	};

	LAB.dyeStats = function () {
		var W = dye.width, H = dye.height;
		var buf = new Float32Array(W * H * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, dye.read.fbo);
		gl.readPixels(0, 0, W, H, gl.RGBA, gl.FLOAT, buf);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var sum = 0, n = W * H, nz = 0;
		for (var i = 0; i < n; i++) {
			var v = buf[i * 4];
			sum += v; if (v > 1e-4) nz++;
		}
		return { mean: sum / n, nonZeroFrac: nz / n, samples: n };
	};

	Object.defineProperty(LAB, 'maskFbo', { get: function () { return obstacleFbo; } });

	// Exposed directly, unlike smoke-lab's own particle layer: that page's
	// position claims could only be checked through particleDebugInfo()'s
	// sampled summary below, with no way to independently pull the raw
	// texture apart. Both are here so a verification script can use whichever
	// it needs — the summary for a quick sanity check, the raw FBO for a
	// script that wants to pick out specific particles (e.g. one near the
	// equator and one near 60 degrees) and track them frame to frame itself.
	Object.defineProperty(LAB, 'particlePosFbo', {
		get: function () { return particlePos ? particlePos.read : null; }
	});
	Object.defineProperty(LAB, 'particleInitPosFbo', {
		get: function () { return particleInitPos || null; }
	});
	// The trail streak buffer itself — no depth attachment (see
	// paintTrailBuffer()'s own comment), so reading it back exactly is the
	// most direct way for a script to confirm the far-side cull is doing its
	// job there: a canvas screenshot competes with whatever the globe/smoke
	// happens to be colouring nearby, this does not.
	Object.defineProperty(LAB, 'trailFbo', {
		get: function () { return trailRead || null; }
	});

	LAB.debug = function () {
		return { gl: gl, ext: ext, boat: boat, dye: dye, velocity: velocity, canvas: canvas,
			camEye: camEye, camTarget: camTarget, camRadius: camRadius,
			particlePos: particlePos ? particlePos.read : null,
			particleInitPos: particleInitPos || null,
			particleGridSize: particleGridSize, particleCount: particleCount,
			particlesOn: params.particlesOn, particleStyle: params.particleStyle };
	};

	// Test-only, mirrors smoke-lab's own hooks of the same name: re-run the
	// same rebuild the count/style controls trigger, and read back a spread of
	// particle position texels so a script can assert finiteness and domain
	// bounds without a second, parallel readback path living in the shipped
	// code.
	LAB.rebuildParticlesForTest = function () { rebuildParticles(); };

	LAB.particleDebugInfo = function (wantSamples) {
		if (!particlePos || !particleGridSize) return null;
		var n = particleGridSize;
		var buf = new Float32Array(n * n * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, particlePos.read.fbo);
		gl.readPixels(0, 0, n, n, gl.RGBA, gl.FLOAT, buf);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var finite = true, inBounds = true;
		var xs = [], ys = [], lons = [], lats = [];
		var total = n * n;
		var step = Math.max(1, Math.floor(total / (wantSamples || 200)));
		for (var i = 0; i < total; i += step) {
			var x = buf[i * 4], y = buf[i * 4 + 1];
			if (!isFinite(x) || !isFinite(y)) finite = false;
			// (u, v) — u wraps so a small excursion either side of [0, 1] before
			// the next fract() is not itself a bug; v (latitude) genuinely
			// should never leave [0, 1], the update shader reflects it there.
			if (x < -0.001 || x > 1.001 || y < -0.001 || y > 1.001) inBounds = false;
			if (xs.length < 8) {
				xs.push(x); ys.push(y);
				lons.push(x * 360);
				lats.push((y - 0.5) * 180);
			}
		}
		return { gridSize: n, count: total, finite: finite, inBounds: inBounds,
			sampleX: xs, sampleY: ys, sampleLonDeg: lons, sampleLatDeg: lats };
	};

	// Test-only: min/max/mean of the trail buffer's red channel.
	function fboStats(fbo) {
		var w = fbo.width, h = fbo.height;
		var buf = new Float32Array(w * h * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo.fbo);
		gl.readPixels(0, 0, w, h, gl.RGBA, gl.FLOAT, buf);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var mn = Infinity, mx = -Infinity, sum = 0, n = w * h;
		for (var i = 0; i < n; i++) {
			var v = buf[i * 4];
			if (v < mn) mn = v;
			if (v > mx) mx = v;
			sum += v;
		}
		return { w: w, h: h, min: mn, max: mx, mean: sum / n };
	}
	LAB.trailDebugInfo = function () { return trailRead ? fboStats(trailRead) : null; };

	// Test-only hooks: simulate held keys, and teleport the boat, without
	// wiring up real DOM events. Used by the headless verification harness
	// only, e.g. to drive her hard past a pole faster than steering by hand
	// would allow.
	LAB.setKeys = function (obj) {
		for (var k in obj) keys[k] = obj[k];
	};
	LAB.setBoatPos = function (lam, phi, headingDeg) {
		fromLonLat(boat.pos, lam, phi);
		var e = new Vec3(), n = new Vec3();
		eastAt(e, lam); northAt(n, lam, phi);
		var a = (headingDeg == null ? 0 : headingDeg) * DEG;
		boat.head.copy(e).multiplyScalar(Math.sin(a)).addScaledVector(n, Math.cos(a));
		orthonormalise(boat.pos, boat.head);
		refreshBoatFrame();
	};

	// ---- controls (mirrors smoke-lab's binding pattern) ------------------------

	var pointer = { down: false, push: false, lastX: 0, lastY: 0 };

	function screenRay(clientX, clientY) {
		var rect = canvas.getBoundingClientRect();
		var ndcX = (clientX - rect.left) / rect.width * 2 - 1;
		var ndcY = 1 - (clientY - rect.top) / rect.height * 2;
		// Unproject: build the ray in view space from the projection's
		// tangent of half the fov, then rotate by the camera basis.
		var fovy = 45 * DEG, aspect = canvas.width / canvas.height;
		var ty = Math.tan(fovy / 2), tx = ty * aspect;
		var dirView = new Vec3(ndcX * tx, ndcY * ty, -1).normalize();
		_lz.copy(camEye).addScaledVector(camTarget, -1).multiplyScalar(-1).normalize().multiplyScalar(-1);
		// Rebuild the same basis mat4LookAt used, directly, to avoid drift.
		var zAxis = new Vec3(camEye.x - camTarget.x, camEye.y - camTarget.y, camEye.z - camTarget.z).normalize();
		var xAxis = new Vec3().crossVectors(camUp, zAxis).normalize();
		var yAxis = new Vec3().crossVectors(zAxis, xAxis).normalize();
		var world = new Vec3();
		world.x = xAxis.x * dirView.x + yAxis.x * dirView.y + zAxis.x * dirView.z;
		world.y = xAxis.y * dirView.x + yAxis.y * dirView.y + zAxis.y * dirView.z;
		world.z = xAxis.z * dirView.x + yAxis.z * dirView.y + zAxis.z * dirView.z;
		world.normalize();
		// Ray-sphere intersection, sphere at origin, radius camRadius.
		var oc = camEye;
		var b = oc.dot(world);
		var c = oc.dot(oc) - camRadius * camRadius;
		var disc = b * b - c;
		if (disc < 0) return null;
		var t = -b - Math.sqrt(disc);
		if (t < 0) return null;
		var hit = new Vec3(oc.x + world.x * t, oc.y + world.y * t, oc.z + world.z * t).normalize();
		return { lam: lonOf(hit), phi: latOf(hit) };
	}

	function bindPointer() {
		canvas.addEventListener('wheel', function (e) {
			var k = e.deltaY > 0 ? 1.12 : 1 / 1.12;
			params.zoom = clamp(params.zoom * k, ZOOM_MIN, ZOOM_MAX);
			var el = document.getElementById('s-zoom');
			if (el) { el.value = params.zoom; if (zoomShow) zoomShow(); }
			saveParams();
			e.preventDefault();
		}, { passive: false });

		canvas.addEventListener('mousedown', function (e) {
			pointer.down = true; pointer.push = e.shiftKey;
			pointer.lastX = e.clientX; pointer.lastY = e.clientY;
			if (!pointer.push) { params.camMode = 'free'; params.chaseCam = false; camDrag.on = true; paintCamButtons(); }
		});
		window.addEventListener('mouseup', function () { pointer.down = false; camDrag.on = false; });
		window.addEventListener('mousemove', function (e) {
			if (!pointer.down) return;
			var dx = e.clientX - pointer.lastX, dy = e.clientY - pointer.lastY;
			pointer.lastX = e.clientX; pointer.lastY = e.clientY;
			if (pointer.push) {
				var hit = screenRay(e.clientX, e.clientY);
				if (hit) {
					splat(velocity, hit.lam, hit.phi, dx * 3, -dy * 3, 0.0015);
					splat(dye, hit.lam, hit.phi, 0.9, 0.9, 0.0016);
				}
			} else {
				camDrag.yaw -= dx * 0.006;
				camDrag.pitch = clamp(camDrag.pitch - dy * 0.006, -1.4, 1.4);
			}
		});
		window.addEventListener('keydown', function (e) {
			keys[e.code] = true;
			if (/^Arrow/.test(e.code)) e.preventDefault();
			if (e.code === 'Space') { params.paused = !params.paused; e.preventDefault(); }
			if (e.code === 'KeyH') {
				var els = document.querySelectorAll('.panel');
				for (var i = 0; i < els.length; i++) els[i].style.display = els[i].style.display === 'none' ? '' : 'none';
			}
		});
		window.addEventListener('keyup', function (e) { keys[e.code] = false; });
		window.addEventListener('blur', function () { keys = {}; });
	}

	function paintAutoState() {
		var ids = ['s-jang', 's-mang'];
		for (var i = 0; i < ids.length; i++) {
			var el = document.getElementById(ids[i]);
			if (!el) continue;
			el.parentNode.className = params.autoTrim ? 'row auto' : 'row';
		}
	}


	var jibAngleSlider = null, mainAngleSlider = null, zoomShow = null;






	function bindControls() {
		function slider(id, key, fmt, hook) { return kit.slider(id, key, fmt, hook); }
		function handTrim() {
			if (!params.autoTrim) return;
			params.autoTrim = false;
			var b = document.getElementById('b-auto');
			if (b) b.className = '';
			paintAutoState();
		}
		var one = function (v) { return (+v).toFixed(2); };
		var deg = function (v) { return Math.round(v) + '°'; };

		zoomShow = slider('zoom', 'zoom', function (v) { return (+v).toFixed(2) + '\u00d7'; });
		slider('camlead', 'camLead', one);
		slider('camlazy', 'camLazy', one);
		slider('iscale', 'islandScale', one);
		slider('ilon', 'islandLon', function (v) { return Math.round(v) + '\u00b0'; });
		slider('ilat', 'islandLat', function (v) { return Math.round(v) + '\u00b0'; });
		slider('wind', 'wind', one);
		slider('curl', 'curl', function (v) { return Math.round(v); });
		slider('visc', 'viscosity', one);
		slider('iter', 'iterations', function (v) { return Math.round(v); });
		slider('streaks', 'streaks', one);
		slider('count', 'streakCount', function (v) { return Math.round(v); });
		slider('width', 'streakWidth', one);
		// These three exist in the panel but were never bound here, so they sat at
		// a range input's default midpoint and did nothing at all: the classic
		// dead control. smoke-lab binds the same three.
		slider('sat', 'saturation', one);
		slider('con', 'contrast', one);
		slider('neon', 'neon', one);
		slider('mac', 'maccormack', one);
		slider('mixlo', 'wakeMixLo', one);
		slider('mixhi', 'wakeMixHi', one);
		slider('fade', 'fade', one);
		slider('size', 'boatSize', function (v) { return (+v).toFixed(3); });

		jibAngleSlider = slider('jang', 'jibAngle', deg, handTrim);
		slider('jx', 'jibX', one);
		slider('jy', 'jibY', one);
		slider('jchord', 'jibChord', one);
		slider('jcamber', 'jibCamber', one);
		slider('jthick', 'jibThick', one);
		mainAngleSlider = slider('mang', 'mainAngle', deg, handTrim);
		slider('mx', 'mainX', one);
		slider('my', 'mainY', one);
		slider('mchord', 'mainChord', one);
		slider('mcamber', 'mainCamber', one);
		slider('mthick', 'mainThick', one);

		paintAutoState();
		slider('speedscale', 'speedScale', one);
		slider('speedcontrast', 'speedContrast', one);
		document.getElementById('b-clear').addEventListener('click', clearAll);
		// Everything param-backed goes through the kit, so each registers a
		// refresher and a preset repaints it rather than leaving a stale caption.
		kit.toggle('b-boat', 'showBoat');
		kit.toggle('b-auto', 'autoTrim', function () { paintAutoState(); });
		kit.toggle('b-speed', 'colourSpeed');
		kit.toggle('b-vel', 'showVelocity', null, function (v) { return v ? 'show smoke' : 'velocity field'; });
		kit.toggle('b-sail', 'sailOnForce', function () { boat.speed = 0; });
		kit.toggle('b-islands', 'islands');
		kit.cycle('b-medium', 'medium', ['smoke', 'oil'], function (v) { return v; }, function () { clearAll(); });
		kit.pick({ chase: 'b-cam-chase', lead: 'b-cam-lead', lazy: 'b-cam-lazy',
			limb: 'b-cam-limb', free: 'b-cam-free' }, 'camMode', function () { camLazy.pos = null; });
		slider('clr', 'clr', one);
		slider('yawgain', 'yawGain', one);
		kit.pick({ helm: 'b-ctl-helm', sheets: 'b-ctl-sheets', trimonly: 'b-ctl-trimonly' }, 'controlMode', function (m) {
			if (m === 'sheets') params.autoTrim = false;
			paintAutoState();
			kit.refreshAll();
			var hint = document.getElementById('control-hint');
			if (hint) hint.textContent = m === 'trimonly'
				? 'No rudder at all. She turns only because the two sails are out of balance about her centre of lateral resistance. W loads the headsail and A eases the main, and either bears her away; S unloads the headsail and Q sheets the main hard, and either rounds her up. Balance the pair and she holds her heading.'
				: m === 'sheets'
				? 'Q / A main sheet in and out, W / S jib sheet, arrows the rudder. Auto trim is off: she only goes if the two sails agree.'
				: 'Arrows steer and drive her; auto trim looks after the sails.';
		});
		paintAutoState();

		document.getElementById('b-reset').addEventListener('click', clearParams);
		kit.buildPresetBar('preset-bar');
		slider('gain', 'driveGain', function (v) { return (+v).toFixed(3); });
		slider('drag', 'hullDrag', one);

		// Same structure as smoke-lab's own particle section — see
		// PARTICLE_SIZES in the particle runtime block above for why count is a
		// stepped index rather than a free slider.
		kit.toggle('b-particles', 'particlesOn', null,
			function (v) { return v ? 'particles on' : 'particles off'; });
		kit.cycle('b-particle-style', 'particleStyle', ['dust', 'trails'],
			function (v) { return v; }, function () { rebuildParticles(); });
		slider('pcount', 'particleSizeIdx', function (v) {
			var idx = Math.max(0, Math.min(PARTICLE_SIZES.length - 1, Math.round(v)));
			return (PARTICLE_SIZES[idx] * PARTICLE_SIZES[idx]).toLocaleString();
		}, function () { rebuildParticles(); });
		slider('pdrag', 'particleDrag', one);
		slider('psize', 'particlePointSize', one);
		slider('ptrail', 'particleTrailLength', function (v) { return Math.round(v); });
		slider('pbright', 'particleBrightness', one);

		paintCamButtons();


		var bChase = document.getElementById('b-chase');
		bChase.className = params.chaseCam ? 'on' : '';
		bChase.addEventListener('click', function () {
			params.chaseCam = !params.chaseCam; saveParams();
			bChase.className = params.chaseCam ? 'on' : '';
		});
		document.getElementById('b-copy').addEventListener('click', function () {
			var text = settingsBlock();
			console.log(text);
			if (navigator.clipboard) navigator.clipboard.writeText(text);
			announce('Settings copied to the clipboard, and printed to the console.');
		});
	}

	// Announcements get their own line. They used to overwrite #readout-note,
	// which is where the "solver units, not newtons" caveat lives — so the first
	// sweep or settings copy permanently deleted the one warning telling you not
	// to read Drive and Side as real forces, for the rest of the session.

	function clearAll() {
		var p = programs.clear;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.value, 0);
		gl.uniform1i(p.uniforms.uTexture, dye.read.attach(0));
		blit(dye.write); dye.swap();
		gl.uniform1i(p.uniforms.uTexture, velocity.read.attach(0));
		blit(velocity.write); velocity.swap();
	}

	// ---- boot -----------------------------------------------------------------

	function initGL() {
		var opts = { alpha: false, depth: true, stencil: false, antialias: true, preserveDrawingBuffer: false };
		gl = canvas.getContext('webgl2', opts);
		var isWebGL2 = !!gl;
		if (!gl) gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
		if (!gl) throw new Error('This browser has no WebGL at all.');

		var halfFloat, supportLinearFiltering;
		if (isWebGL2) {
			gl.getExtension('EXT_color_buffer_float');
			supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
		} else {
			halfFloat = gl.getExtension('OES_texture_half_float');
			supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
			gl.getExtension('OES_element_index_uint');
		}
		var halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);

		function supportRenderTextureFormat(internal, format, type) {
			var tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
			gl.texImage2D(gl.TEXTURE_2D, 0, internal, 4, 4, 0, format, type, null);
			var fbo = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
			return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		}
		function formatFor(internal, format, type) {
			if (!supportRenderTextureFormat(internal, format, type)) {
				if (!isWebGL2) return { internal: gl.RGBA, format: gl.RGBA };
				if (internal === gl.R16F) return formatFor(gl.RG16F, gl.RG, type);
				if (internal === gl.RG16F) return formatFor(gl.RGBA16F, gl.RGBA, type);
				return null;
			}
			return { internal: internal, format: format };
		}

		ext = {
			isWebGL2: isWebGL2,
			halfFloatTexType: halfFloatTexType,
			supportLinearFiltering: supportLinearFiltering,
			readFloat: isWebGL2 || !!gl.getExtension('OES_texture_float'),
			formatRGBA: isWebGL2 ? formatFor(gl.RGBA16F, gl.RGBA, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA },
			formatRG: isWebGL2 ? formatFor(gl.RG16F, gl.RG, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA },
			formatR: isWebGL2 ? formatFor(gl.R16F, gl.RED, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA }
		};
		if (isWebGL2) gl.getExtension('EXT_color_buffer_float');

		// Zero, not the scene's backdrop colour: every solver FBO is cleared
		// with THIS colour at creation time (createFBO() below), so every
		// field — velocity, dye, pressure, all of it — needs to start at
		// true zero. The starfield backdrop is a display-only concern and
		// gets its own clearColor call inside renderSphere(), scoped to the
		// one frame it actually clears.
		gl.clearColor(0, 0, 0, 0);
		gl.enable(gl.DEPTH_TEST);

		quadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
	}

	function buildPrograms() {
		var prefix = ext.supportLinearFiltering ? '' : '#define MANUAL_FILTERING\n';
		programs.clear = program(CLEAR_FRAG);
		programs.splat = program(SPLAT_FRAG);
		programs.advection = program(prefix + ADVECTION_FRAG);
		programs.divergence = program(DIVERGENCE_FRAG);
		programs.curl = program(CURL_FRAG);
		programs.vorticity = program(VORTICITY_FRAG);
		programs.pressure = program(PRESSURE_FRAG);
		programs.gradient = program(GRADIENT_FRAG);
		programs.wind = program(WIND_FRAG);
		programs.poleDamp = program(POLE_DAMP_FRAG);
		programs.mask = program(MASK_FRAG);
		programs.force = program(FORCE_FRAG);
		programs.speed = program(SPEED_FRAG);
		programs.maccormack = program(prefix + MACCORMACK_FRAG);
		programs.reduce = program(REDUCE_FRAG);
		programs.sphere = program(SPHERE_FRAG, SPHERE_VERT);
		programs.stars = program(STARS_FRAG, STARS_VERT);
		programs.particleInit = program(PARTICLE_INIT_FRAG, MINIMAL_VERT);
		programs.particleUpdateDust = program(PARTICLE_UPDATE_DUST_FRAG, MINIMAL_VERT);
		programs.particleUpdateTrails = program(PARTICLE_UPDATE_TRAILS_FRAG, MINIMAL_VERT);
		programs.particleFade = program(PARTICLE_FADE_FRAG, MINIMAL_VERT);
		programs.particleComposite = program(PARTICLE_COMPOSITE_FRAG, MINIMAL_VERT);
		programs.particleDraw = buildParticleDrawProgram();
		for (var k in programs) {
			if (!programs.hasOwnProperty(k)) continue;
			if (k === 'sphere' || k === 'stars' || k === 'particleDraw') continue;
			gl.bindAttribLocation(programs[k].handle, 0, 'aPosition');
		}
	}

	function resize() {
		var w = Math.floor(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5));
		var h = Math.floor(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 1.5));
		if (canvas.width === w && canvas.height === h) return false;
		canvas.width = w; canvas.height = h;
		return true;
	}

	var uLightDir = new Vec3(0.45, 0.55, 0.3).normalize();

	// Perspective + view only — split out of renderSphere() so the particle
	// trail buffer (paintTrailBuffer(), which projects onto the sphere same as
	// the globe itself) can be drawn with THIS frame's camera rather than the
	// previous frame's. Called once per frame, every frame, regardless of
	// pause — the free/lazy/limb cameras still want to move under a paused
	// sim if you drag or let the damping settle.
	function updateCameraAndProj() {
		mat4Perspective(uProj, 45 * DEG, canvas.width / Math.max(1, canvas.height), 0.05, 500);
		updateCamera();
	}

	function renderSphere() {
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.clearColor(0.02, 0.03, 0.06, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

		// Stars.
		gl.disable(gl.DEPTH_TEST);
		var ps = programs.stars;
		gl.useProgram(ps.handle);
		gl.uniformMatrix4fv(ps.uniforms.uProj, false, uProj);
		gl.uniformMatrix4fv(ps.uniforms.uView, false, uView);
		gl.bindBuffer(gl.ARRAY_BUFFER, starsVAO.vbo);
		var aPos = gl.getAttribLocation(ps.handle, 'aPos');
		gl.enableVertexAttribArray(aPos);
		gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
		gl.drawArrays(gl.POINTS, 0, starsVAO.count);
		gl.disableVertexAttribArray(aPos);
		gl.enable(gl.DEPTH_TEST);

		// The globe.
		var p = programs.sphere;
		gl.useProgram(p.handle);
		gl.uniformMatrix4fv(p.uniforms.uProj, false, uProj);
		gl.uniformMatrix4fv(p.uniforms.uView, false, uView);
		gl.uniform1f(p.uniforms.uRadius, camRadius);
		gl.uniform1i(p.uniforms.uTexture, dye.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform1i(p.uniforms.uSpeed, speedField.read.attach(2));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(3));
		gl.uniform2f(p.uniforms.boatLonLat, boat.lam, boat.phi);
		gl.uniform2f(p.uniforms.heading2D, boat.headEast, boat.headNorth);
		gl.uniform1f(p.uniforms.size, params.boatSize);
		gl.uniform1f(p.uniforms.lee, leeSide());
		gl.uniform1f(p.uniforms.showBoat, params.showBoat ? 1 : 0);
		gl.uniform1f(p.uniforms.showVelocity, params.showVelocity ? 1 : 0);
		gl.uniform1f(p.uniforms.colourSpeed, params.colourSpeed ? 1 : 0);
		gl.uniform1f(p.uniforms.uOil, params.medium === 'oil' ? 1 : 0);
		gl.uniform1f(p.uniforms.uSaturation, params.saturation);
		gl.uniform1f(p.uniforms.uContrast, params.contrast);
		gl.uniform1f(p.uniforms.uNeon, params.neon);
		gl.uniform1f(p.uniforms.speedRef, params.wind * 300 * params.speedScale);
		gl.uniform1f(p.uniforms.speedContrast, params.speedContrast);
		gl.uniform3f(p.uniforms.uLightDir, uLightDir.x, uLightDir.y, uLightDir.z);
		setFoilUniforms(p);

		gl.bindBuffer(gl.ARRAY_BUFFER, sphereVAO.vbo);
		var aP = gl.getAttribLocation(p.handle, 'aPos'), aU = gl.getAttribLocation(p.handle, 'aUv');
		gl.enableVertexAttribArray(aP);
		gl.vertexAttribPointer(aP, 3, gl.FLOAT, false, 20, 0);
		gl.enableVertexAttribArray(aU);
		gl.vertexAttribPointer(aU, 2, gl.FLOAT, false, 20, 12);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphereVAO.ibo);
		gl.drawElements(gl.TRIANGLES, sphereVAO.count, sphereVAO.wide ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
		gl.disableVertexAttribArray(aP);
		gl.disableVertexAttribArray(aU);
	}

	function frame(now) {
		requestAnimationFrame(frame);
		var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.033) : 0.016;
		lastDt = dt;
		lastTime = now;

		if (resize()) rebuildTrailBuffers();

		if (!params.paused) {
			simTime += dt;
			stepBoat(dt);
			inject(dt);
			step(dt);
			measureForce(dt);
			buildSpeedField();
			updateParticles(dt);
		}

		// Every frame, pause or not — see updateCameraAndProj()'s own comment.
		updateCameraAndProj();

		// Needs this frame's camera, which is why it runs here rather than
		// alongside updateParticles() above.
		if (!params.paused) paintTrailBuffer();

		renderSphere();
		drawParticles();

		if (params.autoTrim && jibAngleSlider) {
			var ja = document.getElementById('s-jang'), ma = document.getElementById('s-mang');
			if (document.activeElement !== ja) { ja.value = params.jibAngle; jibAngleSlider(); }
			if (document.activeElement !== ma) { ma.value = params.mainAngle; mainAngleSlider(); }
		}

		if (force.ready) {
			var d = force.drive, sd = force.side;
			var el = document.getElementById('r-drive');
			if (el) {
				el.textContent = d.toFixed(4);
				el.className = 'val ' + (d > 0 ? 'good' : 'bad');
				document.getElementById('r-side').textContent = sd.toFixed(4);
				document.getElementById('r-ratio').textContent =
					Math.abs(sd) > 1e-9 ? (d / Math.abs(sd)).toFixed(2) : '—';
				var ym = document.getElementById('r-yaw');
				if (ym) {
					ym.textContent = force.yawMean.toFixed(4);
					// Positive is bow away from the wind on this tack; the label
					// says which way so the sign is readable at a glance.
					ym.className = 'val ' + (Math.abs(force.yawMean) < 1e-4 ? '' : 'good');
				}
				var yh = document.getElementById('r-yawdir');
				// Measured, not assumed. Held on one heading at 45 degrees off the
				// wind: jib at -45 gave +0.035 and she bore away 34 degrees in five
				// seconds; jib at -5 gave -0.024 and she rounded up 21. The
				// reference trim reads -0.002 and holds her heading within 3.
				if (yh) yh.textContent = Math.abs(force.yawMean) < 3e-3 ? 'balanced'
					: (force.yawMean > 0 ? 'bearing away' : 'rounding up');
				var sp = document.getElementById('r-speed');
				if (sp) {
					sp.textContent = (boat.speed * 100).toFixed(2);
					sp.className = 'val ' + (boat.speed > 0.0005 ? 'good' : 'bad');
				}
			}
		}

		frames++; fpsTimer += dt;
		if (fpsTimer >= 0.5) {
			var fpsEl = document.getElementById('fps');
			if (fpsEl) fpsEl.textContent = Math.round(frames / fpsTimer) + ' fps';
			frames = 0; fpsTimer = 0;
		}
	}

	LAB.boot = function () {
		canvas = document.getElementById('gl');
		try {
			loadParams();
			resize();
			initGL();
			buildPrograms();
			buildBuffers();
			buildSphereMesh();
			rebuildTrailBuffers();
			rebuildParticles();
			refreshBoatFrame();
			bindPointer();
			bindControls();
			bindSections();
		} catch (err) {
			var box = document.getElementById('fatal');
			box.style.display = 'block';
			box.textContent = 'Could not start: ' + (err && err.message ? err.message : err);
			throw err;
		}
		requestAnimationFrame(frame);
	};
})(window);
