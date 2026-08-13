// A fluid solver on a flat plane, and a boat sitting in it.
//
// Written flat and standalone on purpose. The version of this on the ball could
// not be judged: a grey wash inside a water shader, competing with the wind
// paint, the chop, the panels and 900 streamer lines, seen edge-on from deck
// level. There was no way to tell a working simulation from a broken one, and I
// spent a long time tuning one I could not see. Here the smoke is the entire
// picture, so if it is wrong it is obvious.
//
// This is the standard Stam scheme, the same one the WebGL fluid demos use:
//
//   1. ADVECT     carry velocity and dye along the velocity field
//   2. CURL       measure the local spin
//   3. VORTICITY  push energy back into that spin, so eddies survive instead of
//                 being smeared away by the advection step. This is the single
//                 knob that decides whether it looks like smoke or like fog.
//   4. DIVERGENCE how much each cell is gaining or losing air
//   5. PRESSURE   Jacobi iterations solving for the pressure that cancels it
//   6. SUBTRACT   remove that pressure gradient, leaving divergence-free flow
//
// Raw WebGL rather than three.js: the version of three this repo vendors (r72)
// has no WebGLRenderTarget.texture and quietly gives you unbound samplers, which
// cost hours on the sphere. Nothing here depends on a library at all.
(function (root) {
	'use strict';

	var LAB = root.SMOKELAB = {};

	// Settled by eye on the running sim rather than picked. Slow wind and heavy
	// viscosity is what lets the slot read: the flow has time to bend round the
	// foils instead of blowing straight through them.
	var params = {
		wind: 1.20,
		curl: 19,
		viscosity: 0.70,
		iterations: 39,

		// Streaks only, and they barely fade. A streakline that survives the whole
		// width of the screen tells you what the air did all the way past her;
		// one that dies halfway just looks like the solver ran out of steam.
		streaks: 2.00,
		streakCount: 21,
		streakWidth: 0.90,
		fade: 0.10,

		boatSize: 0.100,

		// The rig. A jib forward and a main aft, both cambered plates set at the
		// sheet angle, with a gap between the jib's leech and the main's luff:
		// the slot. Air funnelled through a narrowing gap has to speed up, so the
		// solver accelerates it there on its own and the wake comes off the two
		// foils as one shaped stream rather than a blob.
		// Each foil is set and shaped on its own. A jib and a main are not the
		// same sail: the jib is smaller, flatter and sheeted inside the main, and
		// the difference between them is most of what the slot is doing.
		// Where each foil sits, in her own lengths. Fore-and-aft is positive
		// forward; athwartships is positive to LEEWARD. The jib sits outboard and
		// overlapping, the main inboard of its line.
		jibX: 0.59,
		jibY: 0.08,
		mainX: -0.20,
		mainY: 0.06,

		jibAngle: -23,
		jibChord: 1.30,
		jibCamber: 0.18,
		jibThick: 0.15,
		mainAngle: 7,
		mainChord: 1.60,
		mainCamber: 0.15,
		mainThick: 0.16,
		autoTrim: false,

		showBoat: true,
		showVelocity: false,
		colourSpeed: true,
		speedScale: 0.32,
		speedContrast: 1.00,
		colourBlur: 2.00,

		// Second-order dye advection. 0 is the plain first-order step, 1 is the
		// full correction. See MACCORMACK_FRAG for why smoke used to dissolve in
		// slow air without it.
		maccormack: 1.0,
		medium: 'smoke',
		saturation: 1.00,
		contrast: 1.00,
		neon: 0.00,
		wakeMixLo: 0.00,
		wakeMixHi: 0.02,

		// She sails on the force actually measured on her sails, rather than on a
		// throttle. `driveGain` turns the pressure coefficient into thrust and
		// `hullDrag` is the resistance she is pushing against; her steady speed is
		// sqrt(thrust / drag), which is the same balance a real hull settles at.
		sailOnForce: true,
		controlMode: 'sheets',
		sheetRate: 45,
		driveGain: 0.010,
		hullDrag: 6.0,
		paused: false,
		// The slot is only a few hundredths of a screen wide, and it has to be
		// several cells across or the pressure solve cannot put a jet through it.
		// At 256 the gap was about as wide as the obstacle's own soft edge and the
		// flow simply stopped there, which is what made the smoke vanish in it.
		simRes: 384,
		dyeRes: 1280,

		// The particle layer. It rides the existing velocity field; it does not
		// solve anything of its own. Two styles: dust has no lifetime and gets its
		// grain from a drag lag against the flow (haxiomic's fluid-and-particles);
		// trails carries an age per particle and paints into a fading buffer
		// (amandaghassaei's gpu-io fluid example). particleSizeIdx steps through
		// PARTICLE_SIZES rather than being a free slider, because the backing
		// texture has to be square and power-of-two-ish to stay cheap to rebuild.
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
		store: 'smokelab.params.v2',
		params: params,
		// This lab and globelab are where the shared preset table's vocabulary
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

	var gl, canvas, ext;
	var velocity, dye, pressure, divergenceFbo, curlFbo, obstacleFbo;
	var forceFbo, reduceChain = [], speedField, dyeHat, dyeTilde;
	var programs = {};
	var quadBuffer;

	// The particle layer's own state. posA/posB are the ping-pong position
	// texture (RGBA: dust stores pos.xy + its own lagged velocity in zw; trails
	// stores pos.xy + age in z). particleInitPos is NOT ping-ponged: it is the
	// spawn point each trail particle returns to, written once per rebuild and
	// left alone. trailA/B are screen-sized and hold the fading streak buffer.
	var posA, posB, particlePos, particleInitPos;
	var particleGridSize = 0, particleCount = 0, particleUvBuffer;
	var PARTICLE_ATTRIB_LOC = 1;
	var trailA, trailB, trailRead, trailWrite;
	var PARTICLE_SIZES = [128, 256, 512, 1024];

	// ---- boilerplate ----------------------------------------------------------

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
		}
		return { handle: p, uniforms: uniforms };
	}

	// Every pass samples its four neighbours, so the vertex shader hands them
	// down rather than each fragment shader recomputing them.
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

	function createFBO(w, h, internal, format, type, filter) {
		gl.activeTexture(gl.TEXTURE0);
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
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

	function createDoubleFBO(w, h, internal, format, type, filter) {
		var a = createFBO(w, h, internal, format, type, filter);
		var b = createFBO(w, h, internal, format, type, filter);
		return {
			width: w, height: h, texelSizeX: a.texelSizeX, texelSizeY: a.texelSizeY,
			get read() { return a; }, set read(v) { a = v; },
			get write() { return b; }, set write(v) { b = v; },
			swap: function () { var t = a; a = b; b = t; }
		};
	}

	function blit(target) {
		if (target == null) {
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		} else {
			gl.viewport(0, 0, target.width, target.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
		}
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	// ---- shaders --------------------------------------------------------------

	var CLEAR_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv; uniform sampler2D uTexture; uniform float value;',
		'void main() { gl_FragColor = value * texture2D(uTexture, vUv); }'
	].join('\n');

	// Semi-Lagrangian: look back along the velocity to where this parcel came
	// from, and take what was there. `manual bilerp` is for the case where the
	// driver will not filter float textures for us.
	var ADVECTION_FRAG = [
		'precision highp float; precision highp sampler2D;',
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
		'  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;',
		'#ifdef MANUAL_FILTERING',
		'  vec4 result = bilerp(uSource, coord, dyeTexelSize);',
		'#else',
		'  vec4 result = texture2D(uSource, coord);',
		'#endif',
		'  float decay = 1.0 + dissipation * dt;',
		'  result /= decay;',
		// Both of these are for the DYE pass only, and the guard matters: this
		// shader advects the velocity field too. Capping unconditionally clamped
		// velocities that run to about 300 down to 3, which stopped the wind dead
		// and emptied the screen while leaving the sails drawn, so it looked like
		// the smoke had been switched off rather than the air.
		'  if (blockDye > 0.5) {',
		// With fade at zero the dye never leaves, so a source cell would climb
		// without limit and wash the picture out to flat white. A ceiling keeps
		// zero fade usable: streaks persist the full width and still read as
		// separate streaks.
		'    result = min(result, vec4(3.0));',
		// And smoke does not live inside a sail. Clearing it is what stops the
		// streaks smearing across the foils as though they were not there.
		'    if (texture2D(uObstacle, vUv).x > 0.5) result = vec4(0.0);',
		'  }',
		'  gl_FragColor = result;',
		'}'
	].join('\n');

	// Second-order advection for the dye, and the reason smoke stops vanishing
	// where the air is slow.
	//
	// The plain semi-Lagrangian step above traces back and takes a BILINEAR
	// sample, and bilinear interpolation is a small blur. Applied once that is
	// nothing; applied every frame to the same parcel it compounds. So the loss
	// is set by how long the smoke LOITERS, not by how fast it moves: fast smoke
	// leaves the picture after a handful of interpolations, while smoke sitting
	// in a lull is smeared several hundred times and quietly dissolves. That is
	// why it "disappears when it slows down", and it is numerical, not physical.
	//
	// MacCormack: advect forward, advect that result BACK, and the difference
	// between where you started and where the round trip landed is the error the
	// interpolation introduced. Add half of it back. The clamp to the source
	// neighbourhood is essential — the correction is unstable without it and will
	// happily manufacture smoke out of nothing.
	var MACCORMACK_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uPhi, uPhiHat, uPhiTilde, uVelocity, uObstacle;',
		'uniform vec2 texelSize, dyeTexelSize;',
		'uniform float dt, dissipation, strength, mixLo, mixHi;',
		'void main() {',
		'  vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;',
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
		// Clamp to what was actually there to be picked up.
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

	var DIVERGENCE_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uObstacle;',
		'void main() {',
		'  float L = texture2D(uVelocity, vL).x;',
		'  float R = texture2D(uVelocity, vR).x;',
		'  float T = texture2D(uVelocity, vT).y;',
		'  float B = texture2D(uVelocity, vB).y;',
		'  vec2 C = texture2D(uVelocity, vUv).xy;',
		// A neighbouring cell that is solid is a WALL. Its velocity is the
		// solid's own, not whatever the field happens to hold there. Without
		// this the projection has no idea the sails exist and pushes air
		// straight through them, which is exactly what it was doing.
		'  vec4 oL = texture2D(uObstacle, vL);',
		'  vec4 oR = texture2D(uObstacle, vR);',
		'  vec4 oT = texture2D(uObstacle, vT);',
		'  vec4 oB = texture2D(uObstacle, vB);',
		'  if (oL.x > 0.5) L = oL.y;',
		'  if (oR.x > 0.5) R = oR.y;',
		'  if (oT.x > 0.5) T = oT.z;',
		'  if (oB.x > 0.5) B = oB.z;',
		// Free-slip outer walls: reflect rather than read off the edge.
		'  if (vL.x < 0.0) { L = -C.x; }',
		'  if (vR.x > 1.0) { R = -C.x; }',
		'  if (vT.y > 1.0) { T = -C.y; }',
		'  if (vB.y < 0.0) { B = -C.y; }',
		'  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	var CURL_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity;',
		'void main() {',
		'  float L = texture2D(uVelocity, vL).y;',
		'  float R = texture2D(uVelocity, vR).y;',
		'  float T = texture2D(uVelocity, vT).x;',
		'  float B = texture2D(uVelocity, vB).x;',
		'  gl_FragColor = vec4(0.5 * ((R - L) - (T - B)), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Vorticity confinement. Advection is diffusive and quietly eats small
	// eddies; this finds where spin is concentrated and pushes energy back into
	// it. Turn it to zero and the smoke goes limp and foggy; this is the knob
	// that makes it curl.
	var VORTICITY_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uCurl;',
		'uniform float curl, dt;',
		'void main() {',
		'  float L = texture2D(uCurl, vL).x;',
		'  float R = texture2D(uCurl, vR).x;',
		'  float T = texture2D(uCurl, vT).x;',
		'  float B = texture2D(uCurl, vB).x;',
		'  float C = texture2D(uCurl, vUv).x;',
		'  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));',
		'  force /= length(force) + 0.0001;',
		'  force *= curl * C;',
		'  force.y *= -1.0;',
		'  vec2 vel = texture2D(uVelocity, vUv).xy;',
		'  vel += force * dt;',
		'  vel = min(max(vel, -1000.0), 1000.0);',
		'  gl_FragColor = vec4(vel, 0.0, 1.0);',
		'}'
	].join('\n');

	var PRESSURE_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uDivergence, uObstacle;',
		'void main() {',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, vT).x;',
		'  float B = texture2D(uPressure, vB).x;',
		// Zero pressure gradient into a wall: a solid neighbour reports this
		// cell's own pressure. That is the boundary condition that actually
		// makes the air go round the sail instead of through it.
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  if (texture2D(uObstacle, vT).x > 0.5) T = C;',
		'  if (texture2D(uObstacle, vB).x > 0.5) B = C;',
		'  float divergence = texture2D(uDivergence, vUv).x;',
		'  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	var GRADIENT_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uVelocity, uObstacle;',
		'void main() {',
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
		'  velocity.xy -= vec2(R - L, T - B);',
		// Inside the sail the air simply IS the sail. Hard, not a soft nudge:
		// a lerp left a third of the old velocity behind every frame and the
		// smoke leaked through.
		'  vec4 o = texture2D(uObstacle, vUv);',
		'  if (o.x > 0.5) velocity = o.yz;',
		'  gl_FragColor = vec4(velocity, 0.0, 1.0);',
		'}'
	].join('\n');

	var SPLAT_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv;',
		'uniform sampler2D uTarget;',
		'uniform float aspectRatio, radius;',
		'uniform vec3 color;',
		'uniform vec2 point;',
		'void main() {',
		'  vec2 p = vUv - point;',
		'  p.x *= aspectRatio;',
		'  vec3 splat = exp(-dot(p, p) / radius) * color;',
		'  vec3 base = texture2D(uTarget, vUv).xyz;',
		'  gl_FragColor = vec4(base + splat, 1.0);',
		'}'
	].join('\n');

	// The inflow. A strong band down the windward edge holds the free stream,
	// and a much weaker pull everywhere else keeps the body of air moving without
	// flattening the structure the solver has built downstream.
	var WIND_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'uniform float wind, dt, time;',
		'void main() {',
		'  vec2 v = texture2D(uVelocity, vUv).xy;',
		'  float inflow = smoothstep(0.10, 0.0, vUv.x);',
		'  float gust = 1.0 + 0.12 * sin(vUv.y * 9.0 + time * 0.7);',
		'  vec2 target = vec2(wind * gust, 0.0);',
		'  float k = clamp((inflow * 12.0 + 0.45) * dt, 0.0, 1.0);',
		'  gl_FragColor = vec4(mix(v, target, k), 0.0, 1.0);',
		'}'
	].join('\n');

	// The rig, shared by the solver (which needs to know where the solid is) and
	// the display (which draws it). One source, so the sail you can see and the
	// sail the air runs into are the same object.
	var RIG_GLSL = [
		// A real section rather than a bent plate. NACA-style thickness: blunt at
		// the nose, tapering to a sharp trailing edge, laid on a cambered mean line
		// with maximum draft at 42% of the chord. The sharp leech matters more than
		// it looks: a constant-thickness arc keeps its full width right to the end,
		// so two of them close enough to form a slot just choke the gap instead.
		// `x` runs 0 at the luff to 1 at the leech.
		// The chord runs from the LUFF at q.x = 0 aft to the leech at q.x = -c, so
		// the foil's own origin IS its luff. That makes the pivot the luff too:
		// rotating the foil sheets the leech in and out while the luff stays
		// exactly where it is bolted. Rotating about the centre, as this did at
		// first, swung the whole sail including its attachment point, so trimming
		// slid the rig about instead of trimming it.
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

		// Into a foil's own frame: translate to its centre, rotate by its set.
		'vec2 toFoil(vec2 p, vec2 origin, float ang) {',
		'  vec2 d = p - origin;',
		'  float c = cos(ang), s = sin(ang);',
		'  return vec2(d.x * c + d.y * s, -d.x * s + d.y * c);',
		'}',

		// The rig in the boat's own frame. `lee` is +1 or -1: which side the sails
		// are set on, so she works on either tack. Returns .x = hull, .y = jib,
		// .z = main. Only the two foils are ever given to the solver: the hull is
		// in the water, not in the air, and letting it shed its own wake buried the
		// thing the page exists to show.
		// `jib` and `mainF` are each (angle, chord, camber, thickness), so the two
		// sails can be set and shaped independently of one another.
		// `jibOff` and `mainOff` are the two ATTACHMENT POINTS in units of her
		// length: the stemhead and the mast. Fore-and-aft positive forward,
		// athwartships positive to leeward so the rig keeps its shape on either
		// tack. Both sails hang from these and pivot about them, so the slot is
		// set by where the mast is and how hard each sail is sheeted.
		'vec3 rigDist(vec2 a, float size, vec2 jibOff, vec2 mainOff, vec4 jib, vec4 mainF, float lee) {',
		'  vec2 h = a; h.y /= 0.34;',
		'  float hull = length(h) - size * 0.55;',
		// The jib is OUTBOARD and the main INBOARD of it, and the jib's leech
		// carries aft past the main's luff so the two overlap, which is how a
		// headsail and a main actually stand. The first cut had the main pushed
		// out to leeward of the jib's line, which is backwards: it made two
		// separate plates in a row rather than a slot.
		//
		// `slot` is the lateral separation between the two chord lines, split
		// either side of the centreline.
		// Her stemhead: where the jib is tacked down.
		'  vec2 jibO = vec2(size * jibOff.x, lee * size * jibOff.y);',
		'  float dJib = foilDist(toFoil(a, jibO, lee * jib.x), size * jib.y, lee * jib.z, jib.w);',
		// Her mast: where the main's luff is set.
		'  vec2 mainO = vec2(size * mainOff.x, lee * size * mainOff.y);',
		'  float dMain = foilDist(toFoil(a, mainO, lee * mainF.x), size * mainF.y, lee * mainF.z, mainF.w);',
		'  return vec3(hull, dJib, dMain);',
		'}'
	].join('\n');

	// The rig, rasterised into a mask once a frame. Every later pass reads this
	// instead of re-evaluating the sections, which matters because the pressure
	// solve runs it dozens of times per pixel.
	//   r = 1 inside a sail, 0 outside
	//   gb = the velocity of the solid there, so a moving rig drags the air
	var MASK_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform vec2 point, heading, hullVel;',
		'uniform vec4 uJib, uMain;',
		'uniform float aspectRatio, size, lee;',
		'uniform vec2 uJibOff, uMainOff;',
		RIG_GLSL,
		'void main() {',
		'  vec2 p = vUv - point;',
		'  p.x *= aspectRatio;',
		'  vec2 a = vec2(dot(p, heading), dot(p, vec2(-heading.y, heading.x)));',
		'  vec3 d = rigDist(a, size, uJibOff, uMainOff, uJib, uMain, lee);',
		'  float solid = step(min(d.y, d.z), 0.0);',
		'  gl_FragColor = vec4(solid, hullVel.x, hullVel.y, 1.0);',
		'}'
	].join('\n');

	// ---- measuring the force on the sails -------------------------------------
	//
	// The aerodynamic force on an immersed body is the pressure integrated over
	// its surface: F = -∮ p n dS, with n the outward normal. In a masked fluid
	// solver there is a neat discrete form of that. The mask m is 1 inside the
	// solid and 0 outside, so its gradient is a delta on the surface pointing
	// INWARD, which is -n dS. That makes the per-cell contribution simply
	//
	//     dF = p * grad(m)
	//
	// summed over the whole grid. No surface tracing, no normals to derive, and
	// nothing drawn: this is the same pressure field the projection just solved
	// to push the air round the sails, so it cannot disagree with what the smoke
	// is doing.
	//
	// The numbers are in the solver's own units, not newtons. That is fine for
	// the question being asked, which is comparative: which trim gives the most
	// drive. Drive over side force is dimensionless and comparable outright.
	var FORCE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uObstacle;',
		'uniform float aspectRatio;',
		'void main() {',
		'  float mL = texture2D(uObstacle, vL).x;',
		'  float mR = texture2D(uObstacle, vR).x;',
		'  float mT = texture2D(uObstacle, vT).x;',
		'  float mB = texture2D(uObstacle, vB).x;',
		'  vec2 grad = 0.5 * vec2(mR - mL, mT - mB);',
		'  float p = texture2D(uPressure, vUv).x;',
		// uv is anisotropic: x spans `aspectRatio` of physical width. The factors
		// cancel on x and leave one on y.
		'  vec2 f = p * vec2(grad.x, grad.y * aspectRatio);',
		'  gl_FragColor = vec4(f, abs(grad.x) + abs(grad.y), 1.0);',
		'}'
	].join('\n');

	// Sum four texels into one. Run enough times and a whole field collapses to a
	// single value, which is how the integral above gets off the GPU without
	// reading a quarter of a million texels back every frame.
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

	// The speed field, blurred properly and once, rather than gathered with a
	// handful of taps inside the display shader at full screen resolution.
	//
	// The velocity grid is a sixth the width of the screen and turbulent down to
	// the cell, so colouring straight off it fizzes. A nine-tap gather hid that
	// at low contrast and stopped hiding it the moment the contrast slider went
	// up, because expanding the range expands the noise with it. A separable
	// blur over a real radius does not care what the contrast is afterwards.
	var SPEED_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'void main() { gl_FragColor = vec4(length(texture2D(uVelocity, vUv).xy), 0.0, 0.0, 1.0); }'
	].join('\n');

	// Edge-aware, and small.
	//
	// The first version spaced its taps `colourBlur` CELLS apart, so a nominal
	// radius of 2 actually reached eight cells each way and blurred across the
	// sails. The slot jet is only a handful of cells wide and the dead air behind
	// the foils is large, so the average came out BELOW the free stream: measured
	// raw the slot ran 1.41x the free stream, and after that blur it read 0.89x.
	// The smoothing was not dulling the signal, it was inverting it.
	//
	// Two changes. The radius is now the whole kernel rather than the tap step,
	// so it stays where it is put. And taps that land inside a sail are dropped
	// and the weights renormalised, so dead air trapped behind a foil can never
	// bleed into the gap beside it.
	var BLUR_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uSrc, uObstacle;',
		'uniform vec2 dir;',
		'void main() {',
		'  float w[5];',
		'  w[0] = 0.2270; w[1] = 0.1946; w[2] = 0.1216; w[3] = 0.0540; w[4] = 0.0162;',
		'  float acc = texture2D(uSrc, vUv).x * w[0];',
		'  float wsum = w[0];',
		'  for (int i = 1; i < 5; i++) {',
		'    vec2 o = dir * float(i);',
		'    vec2 a = vUv + o, b = vUv - o;',
		'    float sa = 1.0 - step(0.5, texture2D(uObstacle, a).x);',
		'    float sb = 1.0 - step(0.5, texture2D(uObstacle, b).x);',
		'    acc += texture2D(uSrc, a).x * w[i] * sa + texture2D(uSrc, b).x * w[i] * sb;',
		'    wsum += w[i] * (sa + sb);',
		'  }',
		'  gl_FragColor = vec4(acc / max(wsum, 1e-4), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	var DISPLAY_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv;',
		'uniform sampler2D uTexture, uVelocity;',
		'uniform vec2 point, heading;',
		'uniform float aspectRatio, size, showBoat, showVelocity, lee;',
		'uniform vec2 uJibOff, uMainOff;',
		'uniform float uOil, colourSpeed, speedRef, speedContrast;',
		'uniform float uSaturation, uContrast, uNeon;',
		'uniform sampler2D uSpeed;',
		'uniform vec4 uJib, uMain;',
		RIG_GLSL,
		'void main() {',
		'  vec3 c;',
		'  if (showVelocity > 0.5) {',
		'    vec2 v = texture2D(uVelocity, vUv).xy;',
		'    c = vec3(0.5 + v.x * 0.25, 0.5 + v.y * 0.25, 0.62);',
		'  } else {',
		'    float d = texture2D(uTexture, vUv).r;',
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
		'    vec3 d3 = texture2D(uTexture, vUv).rgb;',
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
		// Colour the smoke by how fast the air carrying it is moving. The free
		// stream sits around the middle of the ramp, so the squeeze through the
		// slot shows up as the smoke going from teal to yellow to white while
		// the dead patch behind the leech drops to indigo.
		'    if (colourSpeed > 0.5) {',
		// Centred on the free stream and then expanded, because the interesting
		// range is narrow: the slot only speeds the air up by about a quarter,
		// and against a 0-to-nominal-wind ramp that difference was invisible.
		// Free stream lands mid-ramp, dead air at the bottom, the slot jet near
		// the top.
		// The colour comes from the VELOCITY field, which is a third the
		// resolution of the dye and a sixth of the screen, and at this vorticity
		// it is turbulent right down to the cell. Sampled raw it beat against the
		// fine dye detail and the whole picture fizzed. Nine taps over a couple
		// of cells: hue from a smooth field, brightness still from the sharp one,
		// which is the usual way round for this kind of thing.
		'      float v0 = texture2D(uSpeed, vUv).x / max(speedRef, 1.0) * 0.5;',
		'      float v = clamp(0.5 + (v0 - 0.5) * speedContrast, 0.0, 1.0);',
		// A calmer ramp than the first cut, which went straight to saturated
		// yellow and made the sea look like a heat map of itself.
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

		// The rig, drawn from the same distance field the solver treats as solid.
		'  if (showBoat > 0.5) {',
		'    vec2 p = vUv - point;',
		'    p.x *= aspectRatio;',
		'    vec2 a = vec2(dot(p, heading), dot(p, vec2(-heading.y, heading.x)));',
		'    vec3 d = rigDist(a, size, uJibOff, uMainOff, uJib, uMain, lee);',
		'    float ed = size * 0.010;',
		// The hull is drawn faintly for context and is deliberately NOT solid.
		'    c = mix(c, vec3(0.30, 0.30, 0.32), (1.0 - smoothstep(0.0, ed * 3.0, d.x)) * 0.30);',
		'    c = mix(c, vec3(0.99, 0.96, 0.90), 1.0 - smoothstep(0.0, ed, d.y));',
		'    c = mix(c, vec3(1.0, 0.99, 0.96), 1.0 - smoothstep(0.0, ed, d.z));',
		// A thin dark keyline on each foil, so the slot between them stays
		// readable once the smoke piles up bright against the sails.
		'    float rim = min(d.y, d.z);',
		'    c = mix(c, vec3(0.12, 0.17, 0.24), (1.0 - smoothstep(ed, ed * 3.0, abs(rim))) * 0.75);',
		'  }',
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

	// ---- particles --------------------------------------------------------------
	//
	// Positions live in a float texture and never touch the CPU. A vertex shader
	// samples that texture per-point (WebGL2 guarantees vertex texture fetch;
	// this layer quietly disables itself under the WebGL1 fallback rather than
	// risk a silent zero-length draw). The update passes reuse the same blit()
	// plumbing as the fluid solver, just against a small square FBO instead of
	// the sim grid, and sample the SAME velocity field the smoke advects
	// through — there is no second solver here, only a second thing reading the
	// first one's answer.

	var MINIMAL_VERT = [
		'precision highp float;',
		'attribute vec2 aPosition;',
		'varying vec2 vUv;',
		'void main() {',
		'  vUv = aPosition * 0.5 + 0.5;',
		'  gl_Position = vec4(aPosition, 0.0, 1.0);',
		'}'
	].join('\n');

	// Seeded once per rebuild. Trails also gets a random age here so the whole
	// generation does not respawn in lockstep the first time every particle
	// times out together.
	var PARTICLE_INIT_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform float seed, lifetime, styleTrails;',
		'float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7)) + seed) * 43758.5453123); }',
		'void main() {',
		'  float rx = hash(vUv);',
		'  float ry = hash(vUv + vec2(37.2, 17.7));',
		'  float rz = styleTrails > 0.5 ? hash(vUv + vec2(91.7, 53.3)) * lifetime : 0.0;',
		'  gl_FragColor = vec4(rx, ry, rz, 0.0);',
		'}'
	].join('\n');

	// Dust: no lifetime at all. `pvel` is the particle's OWN velocity, eased
	// toward the fluid's at rate `drag`. That lag is the entire mechanism —
	// remove it and every particle sits exactly on the field each frame and the
	// grain disappears into a smooth-looking density. A particle that ends up
	// inside a sail is not pushed out, it is re-rolled: at one pixel across,
	// finding the nearest exterior point is not worth a gradient walk.
	var PARTICLE_UPDATE_DUST_FRAG = [
		'precision highp float; precision highp sampler2D;',
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
		'  pos += pvel * texelSize * dt;',
		'  pos = fract(pos);',
		'  if (texture2D(uObstacle, pos).x > 0.5) {',
		'    pos = vec2(hash(vUv), hash(vUv + vec2(13.1, 71.7)));',
		'    pvel = vec2(0.0);',
		'  }',
		'  gl_FragColor = vec4(pos, pvel);',
		'}'
	].join('\n');

	// Trails: age counts up in FRAMES (matching the 1000-frame lifetime the
	// source demo uses) rather than seconds, so the panel's "lifetime" reads the
	// same regardless of frame rate. On expiry OR on landing inside a sail the
	// particle returns to its own fixed spawn point in uInitPos; expiry keeps
	// the age remainder so the population stays desynchronised, a sail hit
	// resets to 0 since that is an early, unplanned death.
	var PARTICLE_UPDATE_TRAILS_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv;',
		'uniform sampler2D uPosTex, uVelocity, uObstacle, uInitPos;',
		'uniform vec2 texelSize;',
		'uniform float dt, lifetime;',
		'void main() {',
		'  vec4 data = texture2D(uPosTex, vUv);',
		'  vec2 pos = data.xy;',
		'  float age = data.z + 1.0;',
		'  vec2 fluidVel = texture2D(uVelocity, clamp(pos, 0.0, 1.0)).xy;',
		'  pos += fluidVel * texelSize * dt;',
		'  pos = fract(pos);',
		'  bool hitSolid = texture2D(uObstacle, pos).x > 0.5;',
		'  bool expired = age >= lifetime;',
		'  if (hitSolid || expired) {',
		'    pos = texture2D(uInitPos, vUv).xy;',
		'    age = expired ? age - lifetime : 0.0;',
		'  }',
		'  gl_FragColor = vec4(pos, age, 0.0);',
		'}'
	].join('\n');

	// The trail buffer's own decay: linear, `amount` per frame, not the usual
	// exponential multiply. That is what the source demo does (fade by
	// -1/trailLength each frame) and it is why the streak has a fairly hard tail
	// rather than an exponential one that never quite reaches zero.
	//
	// The upper clamp is not in the source description and had to be added: the
	// source demo's canvas is an 8-bit target, so additive draws clip at 1.0 for
	// free. This buffer is float, so without an explicit ceiling here a pixel
	// that gets hit several frames running (which is the common case, not the
	// exception, wherever the flow is slow) accumulates without bound — measured
	// running up past 1000x in under two seconds — and every such pixel then
	// composites onto the canvas as flat white regardless of how far past 1.0 it
	// went. Clamping to 1.0 keeps "pile up and blow out" bounded at the same
	// blowout an 8-bit buffer would have given for free.
	var PARTICLE_FADE_FRAG = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'uniform sampler2D uTexture;',
		'uniform float amount;',
		'void main() { gl_FragColor = clamp(texture2D(uTexture, vUv) - vec4(amount), 0.0, 1.0); }'
	].join('\n');

	// `intensity` exists because the trail buffer, even bounded to 1.0 per
	// texel by the fade pass, is not sparse the way a single particle's dot
	// is: it is the SUM of every nearby particle's last `trailLength` frames
	// of streak, and at a few tens of thousands of particles those streaks
	// overlap almost everywhere the flow is slow, not just at isolated
	// hotspots. Compositing that at full ONE,ONE strength onto an already-lit
	// scene measured as a near-total whiteout of the canvas — bounding the
	// SOURCE was necessary but not sufficient, the composite itself needed
	// damping too, same as dust's alpha did.
	var PARTICLE_COMPOSITE_FRAG = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'uniform sampler2D uTexture;',
		'uniform float intensity;',
		'void main() { gl_FragColor = texture2D(uTexture, vUv) * intensity; }'
	].join('\n');

	// The only program here with a non-trivial vertex shader: it is the one
	// doing the actual particle draw, one gl.POINTS vertex per particle, and it
	// has to fetch that particle's position out of the texture itself since
	// there is no other way to get per-particle data to a POINTS draw call
	// without an instancing extension.
	var PARTICLE_DRAW_VERT = [
		'precision highp float; precision highp sampler2D;',
		'attribute vec2 aUV;',
		'uniform sampler2D uPosTex, uVelocity;',
		'uniform float uPointSize, uLifetime, uStyleTrails, uSpeedRef, uBrightness;',
		'varying float vOpacity, vBright;',
		'void main() {',
		'  vec4 data = texture2D(uPosTex, aUV);',
		'  vec2 pos = clamp(data.xy, 0.0, 1.0);',
		'  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);',
		'  gl_PointSize = uPointSize;',
		'  float opacity;',
		// Fade in over the first tenth of life, out over the last tenth. The
		// source demo's own comment gives this as mix(0,1,min(f*10,1)) *
		// mix(1,0,max(f*10-90,0)); taken literally that second term can never
		// exceed zero for f in [0,1] and the fade-out never fires at all, so a
		// trail particle would pop out at full brightness the instant it
		// respawns. -9 is the version that actually starts the fade at f=0.9
		// and reaches zero at f=1.0, which is what "fades out over the last
		// 10%" has to mean.
		'  if (uStyleTrails > 0.5) {',
		'    float ageFrac = clamp(data.z / max(uLifetime, 1.0), 0.0, 1.0);',
		'    float fadeIn = min(ageFrac * 10.0, 1.0);',
		'    float fadeOut = 1.0 - clamp(ageFrac * 10.0 - 9.0, 0.0, 1.0);',
		'    opacity = fadeIn * fadeOut;',
		'  } else {',
		// Dust has no lifetime and no trail buffer to bound it — the ONLY thing
		// standing between "sparse individual dots" and "solid white sheet" is
		// this alpha being small. At 1.0, one white point at gl.SRC_ALPHA,
		// gl.SRC_ALPHA already saturates whatever pixel it lands on outright
		// (a+dst clamps to white), and at typical densities roughly half the
		// canvas gets a hit every single frame — the whole picture went white.
		// 0.1 means a lone particle barely tints its pixel and only a real
		// pile-up of several particles on the same texel this frame reads as
		// bright, which is the grain the reference demo actually shows.
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
		'varying float vOpacity, vBright;',
		'uniform vec3 uColor;',
		'void main() { gl_FragColor = vec4(uColor * vBright, vOpacity); }'
	].join('\n');

	// Built by hand rather than through program(): it needs aUV pinned to a
	// location other than 0, because location 0 is where quadBuffer's aPosition
	// has lived since initGL() and every blit() call after this one assumes
	// that binding is still in place. Using a second location means the point
	// draw never has to touch it.
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
		}
		return { handle: prog, uniforms: uniforms };
	}

	// ---- the boat -------------------------------------------------------------

	// Close-hauled on port at 38 degrees to the wind, which is where auto trim
	// puts the main at 10 degrees. She sails: driving her through the smoke is
	// most of the point, and a rig moving through the fluid drags the air with
	// it rather than just standing in it. Drag still parks her where you want.
	var boat = { x: 0.52, y: 0.5, heading: 2.478, speed: 0, vx: 0, vy: 0 };
	var keys = {};

	// Which side the sails are set on. The wind blows towards +x, so its
	// across-the-boat component is -sin(heading); the sails go whichever way that
	// pushes them, and she works on either tack with nothing special done.
	function leeSide() {
		var across = -Math.sin(boat.heading);
		return Math.abs(across) < 0.02 ? 1 : (across > 0 ? 1 : -1);
	}

	// Her angle to the wind, 0 head to wind and 180 dead downwind. The wind's eye
	// is at -x, so this is the angle between her heading and that.
	function twaDeg() {
		return Math.abs(Math.atan2(Math.sin(boat.heading), -Math.cos(boat.heading))) * 180 / Math.PI;
	}

	// Sheet to the sailing angle: hard in close-hauled, right out on a run. Same
	// curve the ball game uses, so the two agree about what "well trimmed" means.
	function autoSheet() {
		var t = twaDeg();
		return Math.min(85, Math.max(6, (t - 22) * 0.62));
	}

	var DEG = Math.PI / 180;

	function setFoilUniforms(p) {
		gl.uniform2f(p.uniforms.uJibOff, params.jibX, params.jibY);
		gl.uniform2f(p.uniforms.uMainOff, params.mainX, params.mainY);
		gl.uniform4f(p.uniforms.uJib, params.jibAngle * DEG, params.jibChord,
			params.jibCamber, params.jibThick);
		gl.uniform4f(p.uniforms.uMain, params.mainAngle * DEG, params.mainChord,
			params.mainCamber, params.mainThick);
	}

	function stepRig(dt) {
		var turn = 0;
		if (keys.ArrowLeft) turn += 1;
		if (keys.ArrowRight) turn -= 1;
		if (turn) boat.heading += turn * 1.3 * dt;

		// Two control schemes, the same pair globelab has.
		//
		//   helm    the arrows steer and drive her, auto trim looks after the sails.
		//   sheets  three separate controls as on a real boat: main sheet, jib
		//           sheet, rudder. Auto trim is off, so getting anywhere depends on
		//           the two sails working together against the helm, which is the
		//           whole point of having a slot.
		if (params.controlMode === 'sheets') {
			var rate = params.sheetRate * dt;
			// Q/A the main, W/S the jib. In is towards the centreline.
			if (keys.KeyQ) params.mainAngle -= rate;
			if (keys.KeyA) params.mainAngle += rate;
			if (keys.KeyW) params.jibAngle -= rate;
			if (keys.KeyS) params.jibAngle += rate;
			// Math.min/max, not clamp(): globelab has a clamp helper and this file
			// does not, so the block copied across from it threw every frame.
			// The angle changes above happened first, so trimming still LOOKED
			// like it worked while everything after this line in the frame —
			// including her sailing on the measured force — was dead.
			params.mainAngle = Math.max(-180, Math.min(180, params.mainAngle));
			params.jibAngle = Math.max(-180, Math.min(180, params.jibAngle));
			if (params.autoTrim) {
				params.autoTrim = false;
				var ab = document.getElementById('b-auto');
				if (ab) ab.className = '';
			}
			kit.refreshAll();
		}

		if (params.sailOnForce) {
			// Thrust from the pressure measured on her own sails, against a hull
			// resistance that goes as the square of her speed. She settles where
			// the two balance, so a badly trimmed rig genuinely will not go, and
			// a rig sheeted past the stall drives her backwards.
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
			// The arrows still shove her along if you want to reposition her.
			if (keys.ArrowUp) boat.speed += 0.35 * dt;
			if (keys.ArrowDown) boat.speed -= 0.35 * dt;
		} else {
			var want = 0;
			if (keys.ArrowUp) want += 1;
			if (keys.ArrowDown) want -= 1;
			boat.speed += (want * 0.20 - boat.speed) * Math.min(1, dt * 2.2);
		}

		var px = boat.x, py = boat.y;
		boat.x += Math.cos(boat.heading) * boat.speed * dt;
		boat.y += Math.sin(boat.heading) * boat.speed * dt;

		// Wrap her round rather than let her sail out of the picture.
		if (boat.x > 1.06) boat.x -= 1.12;
		if (boat.x < -0.06) boat.x += 1.12;
		if (boat.y > 1.04) boat.y -= 1.08;
		if (boat.y < -0.04) boat.y += 1.08;

		// Her velocity is what the obstacle pass hands to the air inside the sails,
		// so sailing her across the stream shoves the smoke about instead of the rig
		// sliding through it like a ghost.
		boat.vx = dt > 0 ? (boat.x - px) / dt : 0;
		boat.vy = dt > 0 ? (boat.y - py) / dt : 0;

		// Auto trim sets both, with the jib sheeted inside the main the way it
		// actually is on the water. Their shapes are left alone: that is the part
		// worth playing with by hand.
		if (params.autoTrim) {
			var set = autoSheet();
			params.mainAngle = set;
			params.jibAngle = set * 0.76;
		}
	}

	// ---- passes ---------------------------------------------------------------

	// Oil wants all three channels: different colours injected at different
	// places, advected independently, marbling into each other where the flow
	// folds them together. Smoke only ever needed one.
	function splatRGB(target, x, y, cr, cg, cb, r) {
		var p = programs.splat;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTarget, target.read.attach(0));
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform2f(p.uniforms.point, x, y);
		gl.uniform3f(p.uniforms.color, cr, cg, cb);
		gl.uniform1f(p.uniforms.radius, r);
		blit(target.write);
		target.swap();
	}

	// Hue around the wheel, so a rake of streaks comes out as a spectrum and you
	// can see which band of oil ended up where after the rig has folded it.

	function splat(target, x, y, dx, dy, r) {
		var p = programs.splat;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTarget, target.read.attach(0));
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform2f(p.uniforms.point, x, y);
		gl.uniform3f(p.uniforms.color, dx, dy, 0);
		gl.uniform1f(p.uniforms.radius, r);
		blit(target.write);
		target.swap();
	}

	// Rebuilds the particle textures at the currently selected size. Called once
	// at boot and again whenever the count control or the style changes — style
	// changes because dust and trails give the texture's z/w channels different
	// meanings (a lagged velocity vs. an age), so switching style with stale
	// data in there means every particle briefly reads as either already-expired
	// or moving at whatever velocity the old style left behind. A clean reseed
	// costs one frame and is not worth avoiding.
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

	function rebuildParticles() {
		if (!gl || !ext) return;
		if (!ext.isWebGL2) {
			// No guaranteed vertex texture fetch under the WebGL1 fallback; the
			// draw shader reads the position texture from the vertex stage, so
			// there is nothing safe to fall back to short of a second, uglier
			// code path. Fail quiet rather than throw: the fluid lab itself
			// still has to work everywhere.
			console.warn('SMOKELAB: particles need WebGL2 (vertex texture fetch); disabling.');
			params.particlesOn = false;
			return;
		}
		var idx = Math.max(0, Math.min(PARTICLE_SIZES.length - 1, Math.round(params.particleSizeIdx)));
		var n = PARTICLE_SIZES[idx];
		particleGridSize = n;
		particleCount = n * n;

		var type = ext.halfFloatTexType;
		posA = createFBO(n, n, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST);
		posB = createFBO(n, n, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST);
		particlePos = {
			get read() { return posA; }, set read(v) { posA = v; },
			get write() { return posB; }, set write(v) { posB = v; },
			swap: function () { var t = posA; posA = posB; posB = t; }
		};
		particleInitPos = createFBO(n, n, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST);

		var p = programs.particleInit;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.seed, Math.random() * 1000.0);
		gl.uniform1f(p.uniforms.lifetime, params.particleLifetime);
		gl.uniform1f(p.uniforms.styleTrails, params.particleStyle === 'trails' ? 1.0 : 0.0);
		blit(particlePos.read);

		// The spawn-point texture is a straight copy of that same seed, taken
		// once: CLEAR_FRAG multiplied by 1.0 is just a copy, so this reuses the
		// program already built for clearing the dye rather than adding a
		// dedicated one.
		var c = programs.clear;
		gl.useProgram(c.handle);
		gl.uniform1i(c.uniforms.uTexture, particlePos.read.attach(0));
		gl.uniform1f(c.uniforms.value, 1.0);
		blit(particleInitPos);

		buildParticleUvBuffer(n);
	}

	// Advances particle position (both styles) and, for trails, the persistent
	// trail buffer. All of this is physics, not display, so it lives in the
	// same paused-gated call as the fluid step — a first version drew into the
	// trail buffer from drawParticles() instead, which runs every frame
	// unconditionally so the frozen picture stays visible while paused. That
	// meant PAUSING did not pause the trail: the same handful of frozen
	// positions kept getting re-added to the same pixels every frame, and the
	// buffer grew (measured) from a mean of 12 to 15 in the time it takes to
	// glance at a paused frame. Trail accumulation now stops exactly when
	// everything else does.
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

		if (isTrails) updateTrailBuffer();
	}

	// Fade the trail buffer and draw this frame's particles into it
	// additively. Draws to trailRead's OWN framebuffer directly rather than
	// through blit(), because blit() only knows how to draw the shared
	// full-screen quad and this draw is gl.POINTS with a different vertex
	// count than the quad's four.
	function updateTrailBuffer() {
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
		gl.uniform1f(p.uniforms.uPointSize, params.particlePointSize);
		gl.uniform1f(p.uniforms.uLifetime, params.particleLifetime);
		gl.uniform1f(p.uniforms.uStyleTrails, 1.0);
		gl.uniform1f(p.uniforms.uSpeedRef, speedRef);
		gl.uniform1f(p.uniforms.uBrightness, params.particleBrightness);
		gl.uniform3f(p.uniforms.uColor, 1.0, 1.0, 1.0);
		gl.bindFramebuffer(gl.FRAMEBUFFER, trailRead.fbo);
		gl.viewport(0, 0, trailRead.width, trailRead.height);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		gl.drawArrays(gl.POINTS, 0, particleCount);
		gl.disable(gl.BLEND);
	}

	// The actual screen draw, called every frame regardless of pause so the
	// last-computed picture stays on screen. Dust has no persistent buffer of
	// its own: the display pass just finished painting the dye opaquely, so
	// blending points straight on top of that IS the whole effect, using the
	// gl.blendFunc(SRC_ALPHA, SRC_ALPHA) the source demo uses. Trails just
	// composites the buffer updateTrailBuffer() already built.
	function drawParticles() {
		if (!params.particlesOn || !ext.isWebGL2 || !particlePos) return;
		var isTrails = params.particleStyle === 'trails';

		if (isTrails) {
			var c = programs.particleComposite;
			gl.useProgram(c.handle);
			gl.uniform1i(c.uniforms.uTexture, trailRead.attach(0));
			gl.uniform1f(c.uniforms.intensity, Math.max(0.01, params.particleBrightness * 0.12));
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.ONE, gl.ONE);
			blit(null);
			gl.disable(gl.BLEND);
		} else {
			var speedRef = Math.max(1, params.wind * 300);
			var p2 = programs.particleDraw;
			gl.useProgram(p2.handle);
			gl.bindBuffer(gl.ARRAY_BUFFER, particleUvBuffer);
			gl.vertexAttribPointer(PARTICLE_ATTRIB_LOC, 2, gl.FLOAT, false, 0, 0);
			gl.enableVertexAttribArray(PARTICLE_ATTRIB_LOC);
			gl.uniform1i(p2.uniforms.uPosTex, particlePos.read.attach(0));
			gl.uniform1i(p2.uniforms.uVelocity, velocity.read.attach(1));
			gl.uniform1f(p2.uniforms.uPointSize, params.particlePointSize);
			gl.uniform1f(p2.uniforms.uLifetime, params.particleLifetime);
			gl.uniform1f(p2.uniforms.uStyleTrails, 0.0);
			gl.uniform1f(p2.uniforms.uSpeedRef, speedRef);
			gl.uniform1f(p2.uniforms.uBrightness, params.particleBrightness);
			gl.uniform3f(p2.uniforms.uColor, 1.0, 1.0, 1.0);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			gl.viewport(0, 0, canvas.width, canvas.height);
			gl.enable(gl.BLEND);
			gl.blendFunc(gl.SRC_ALPHA, gl.SRC_ALPHA);
			gl.drawArrays(gl.POINTS, 0, particleCount);
			gl.disable(gl.BLEND);
		}
	}

	var lastTime = 0, frames = 0, fpsTimer = 0, simTime = 0;

	function step(dt) {
		gl.disable(gl.BLEND);
		var p;

		// --- the rig, rasterised ---------------------------------------------
		p = programs.mask;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.point, boat.x, boat.y);
		gl.uniform2f(p.uniforms.heading, Math.cos(boat.heading), Math.sin(boat.heading));
		gl.uniform2f(p.uniforms.hullVel,
			params.showBoat ? boat.vx * 300 : 0, params.showBoat ? boat.vy * 300 : 0);
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform1f(p.uniforms.size, params.showBoat ? params.boatSize : 0.0);
		gl.uniform1f(p.uniforms.lee, leeSide());
		setFoilUniforms(p);
		blit(obstacleFbo);

		// --- velocity ---------------------------------------------------------
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

		p = programs.clear;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTexture, pressure.read.attach(0));
		gl.uniform1f(p.uniforms.value, 0.8);
		blit(pressure.write);
		pressure.swap();

		p = programs.pressure;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uDivergence, divergenceFbo.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		for (var i = 0; i < params.iterations; i++) {
			gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(1));
			blit(pressure.write);
			pressure.swap();
		}

		p = programs.gradient;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		blit(velocity.write);
		velocity.swap();

		// --- advect the velocity ---------------------------------------------
		p = programs.advection;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		if (!ext.supportLinearFiltering) {
			gl.uniform2f(p.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
		}
		var velId = velocity.read.attach(0);
		gl.uniform1i(p.uniforms.uVelocity, velId);
		gl.uniform1i(p.uniforms.uSource, velId);
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		gl.uniform1f(p.uniforms.blockDye, 0);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.dissipation, params.viscosity);
		blit(velocity.write);
		velocity.swap();

		// --- the inflow --------------------------------------------------------
		p = programs.wind;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1f(p.uniforms.wind, params.wind * 300);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.time, simTime);
		blit(velocity.write);
		velocity.swap();

		// --- dye ---------------------------------------------------------------
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
			advectDye(dye.read, dyeHat, 1);          // forward
			advectDye(dyeHat, dyeTilde, -1);         // and back again

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

	// The measured force, smoothed. A single frame of a shedding wake is noise:
	// an instantaneous probe read 142 one moment and 111 the next at identical
	// settings. Everything reported here is a running mean over `window` seconds.
	var force = {
		drive: 0, side: 0, raw: { x: 0, y: 0 },
		window: 2.5, acc: null, tally: 0, ready: false, fast: 0
	};
	LAB.force = force;

	var forceRead = new Float32Array(4);
	var forceByte = new Uint8Array(4);

	// |v|, then blurred across and up. Radius follows the contrast, because a
	// picture that is about to be stretched needs to be smoother going in.
	function buildSpeedField() {
		var p = programs.speed;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		blit(speedField.write);
		speedField.swap();

		// `colourBlur` is the kernel's whole reach in cells; the taps run out to
		// four steps, so the step is a quarter of it. Contrast nudges it a little
		// because a stretched picture wants to go in slightly smoother, but only
		// a little: coupling it hard to contrast is what made the kernel enormous.
		// Scaled to the grid, not to a fixed cell count. A kernel that is a fixed
		// number of CELLS wide gets physically wider as the grid gets coarser,
		// which is backwards: the coarser the grid, the closer the noise already
		// is to the size of the jet, and the less you can afford to smear.
		var r = params.colourBlur * 0.25 * (0.75 + 0.25 * params.speedContrast) * (384 / params.simRes);
		p = programs.blur;
		gl.useProgram(p.handle);
		for (var pass = 0; pass < 2; pass++) {
			gl.uniform1i(p.uniforms.uSrc, speedField.read.attach(0));
			gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
			gl.uniform2f(p.uniforms.dir,
				pass === 0 ? speedField.texelSizeX * r : 0,
				pass === 0 ? 0 : speedField.texelSizeY * r);
			blit(speedField.write);
			speedField.swap();
		}
	}

	function measureForce(dt) {
		var p = programs.force;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, forceFbo.texelSizeX, forceFbo.texelSizeY);
		gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
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
		var fx, fy;
		if (ext.isWebGL2 || ext.readFloat) {
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, forceRead);
			fx = forceRead[0]; fy = forceRead[1];
		} else {
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, forceByte);
			fx = (forceByte[0] / 255 - 0.5) * 2; fy = (forceByte[1] / 255 - 0.5) * 2;
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		if (!isFinite(fx) || !isFinite(fy)) return;

		// Normalise by dynamic pressure times her size, the way a lift coefficient
		// is. The raw sum is in solver units and runs to five figures; this keeps
		// it near unity AND keeps comparisons honest across different wind
		// settings and sail sizes, which a bare scale factor would not.
		var q = Math.max(1e-6, (params.wind * 300) * (params.wind * 300) * params.boatSize);
		fx /= q; fy /= q;

		// Into her frame: drive along the heading, side force across it.
		var ch = Math.cos(boat.heading), sh = Math.sin(boat.heading);
		var drive = fx * ch + fy * sh;
		var side = -fx * sh + fy * ch;

		// The 2.5 s mean is right for reporting and far too slow to steer with, so
		// the dynamics run off a 0.4 s exponential average instead: quick enough
		// to answer a trim change, slow enough not to chase the vortex shedding.
		var k = 1 - Math.exp(-dt / 0.4);
		force.fast += (drive - force.fast) * k;

		if (!force.acc) force.acc = { drive: 0, side: 0, x: 0, y: 0, t: 0 };
		force.acc.drive += drive * dt;
		force.acc.side += side * dt;
		force.acc.x += fx * dt;
		force.acc.y += fy * dt;
		force.acc.t += dt;
		if (force.acc.t >= force.window) {
			force.drive = force.acc.drive / force.acc.t;
			force.side = force.acc.side / force.acc.t;
			force.raw.x = force.acc.x / force.acc.t;
			force.raw.y = force.acc.y / force.acc.t;
			force.ready = true;
			force.acc = null;
		}
	}

	// Sweep a trim through its range, hold each setting long enough for the wake
	// to settle and be averaged, and record the drive. This is the empirical bit:
	// no polar curve, no lookup table, no assumption about what a sail "should"
	// do. Just the pressure the solver computed on the shapes as drawn.
	var sweep = {
		// Both ends matter. The first main sweep ran 0 to 55 and reported its best
		// at the very first sample, which is not a peak, it is a boundary: the
		// curve was still climbing when the sweep ran out of range. A sail sheeted
		// past the centreline is a real setting and has to be in the range.
		running: false, key: 'mainAngle', from: -25, to: 55, step: 5,
		settle: 1.2, hold: 2.5, at: 0, phase: 0, timer: 0, results: [], restore: 0
	};
	LAB.sweep = sweep;

	function startSweep(key, from, to, stepBy) {
		sweep.running = true;
		sweep.key = key || 'mainAngle';
		sweep.from = from; sweep.to = to; sweep.step = stepBy;
		sweep.at = from; sweep.phase = 0; sweep.timer = 0;
		sweep.results = [];
		sweep.restore = params[sweep.key];
		params.autoTrim = false;
		var b = document.getElementById('b-auto'); if (b) b.className = '';
		if (typeof paintAutoState === 'function') paintAutoState();
		params[sweep.key] = sweep.at;
		force.acc = null;
		announce('Sweeping ' + sweep.key + '...');
	}

	function sweepTick(dt) {
		if (!sweep.running) return;
		sweep.timer += dt;

		// Phase 0 lets the wake forget the previous setting; phase 1 measures.
		if (sweep.phase === 0) {
			if (sweep.timer >= sweep.settle) { sweep.phase = 1; sweep.timer = 0; force.acc = null; }
			return;
		}
		if (sweep.timer < sweep.hold) return;

		sweep.results.push({ at: sweep.at, drive: force.drive, side: force.side });
		sweep.at += sweep.step;
		sweep.timer = 0; sweep.phase = 0;
		force.acc = null;

		if (sweep.at > sweep.to) {
			sweep.running = false;
			var best = sweep.results[0];
			for (var i = 1; i < sweep.results.length; i++) {
				if (sweep.results[i].drive > best.drive) best = sweep.results[i];
			}
			params[sweep.key] = best.at;
			var rows = sweep.results.map(function (r) {
				return '  ' + String(Math.round(r.at)).padStart(4) + '\u00b0  drive ' +
					r.drive.toFixed(4) + '   side ' + r.side.toFixed(4);
			}).join('\n');
			console.log('sweep of ' + sweep.key + ':\n' + rows +
				'\nbest: ' + Math.round(best.at) + '\u00b0 (drive ' + best.drive.toFixed(4) + ')');
			announce('Best ' + sweep.key.replace('Angle', '') + ' trim: ' +
				Math.round(best.at) + '\u00b0, drive ' + best.drive.toFixed(3));
			LAB.lastSweep = sweep.results.slice();
		} else {
			params[sweep.key] = sweep.at;
		}
	}

	// Announcements get their own line. They used to overwrite #readout-note,
	// which is where the "solver units, not newtons" caveat lives — so the first
	// sweep or settings copy permanently deleted the one warning telling you not
	// to read Drive and Side as real forces, for the rest of the session.

	function inject(dt) {
		// A rake of streaklines across the whole inflow, and nothing else.
		//
		// There used to be a second set of sources parked just upwind of the rig to
		// "feed" it. They were a crutch for streaks that were dying before they got
		// there, and they looked exactly like what they were: a row of lines
		// starting from nowhere in mid-air. With the fade near zero and the streaks
		// wide enough to survive being squeezed, the rake alone carries all the way
		// across and the crutch is gone.
		//
		// Width matters more than it should. A streak thinner than a texel of the
		// dye texture gets averaged away by the advection step, and the squeeze
		// through the slot is exactly where they get thinnest. Start them fat.
		if (params.streaks <= 0.001) return;
		var n = Math.max(2, Math.round(params.streakCount));
		// `radius` here is the Gaussian's denominator, so the visible half-width
		// is about sqrt(radius). At the first attempt this was 3e-4, giving lines
		// 1.7% of the screen wide against a 1/26 spacing: they overlapped into
		// one solid sheet and the whole domain went white. Distinct lines want a
		// width well under the gap between them.
		var r = 0.000012 * params.streakWidth * params.streakWidth;
		var amt = params.streaks * dt * 48;
		for (var i = 0; i < n; i++) {
			var y = (i + 0.5) / n;
			if (params.medium === 'oil') {
				var c = hueRGB((i / n + simTime * 0.012) % 1, amt);
				splatRGB(dye, 0.010, y, c[0], c[1], c[2], r);
			} else {
				splat(dye, 0.010, y, amt, amt, r);
			}
		}
	}

	// ---- pointer --------------------------------------------------------------

	var pointer = { down: false, push: false, x: 0, y: 0, dx: 0, dy: 0 };
	var dtHint = 0.016;

	function bindPointer() {
		function pos(e) {
			var t = e.touches ? e.touches[0] : e;
			return { x: t.clientX / canvas.clientWidth, y: 1 - t.clientY / canvas.clientHeight };
		}
		canvas.addEventListener('mousedown', function (e) {
			var q = pos(e); pointer.down = true; pointer.x = q.x; pointer.y = q.y;
			pointer.push = e.shiftKey;
			if (!pointer.push) { boat.x = q.x; boat.y = q.y; }
		});
		window.addEventListener('mouseup', function () { pointer.down = false; });
		window.addEventListener('mousemove', function (e) {
			if (!pointer.down) return;
			var q = pos(e);
			pointer.dx = (q.x - pointer.x) * 900;
			pointer.dy = (q.y - pointer.y) * 900;
			pointer.x = q.x; pointer.y = q.y;
			if (pointer.push) {
				splat(velocity, q.x, q.y, pointer.dx, pointer.dy, 0.0015);
				splat(dye, q.x, q.y, 0.9, 0.9, 0.0016);
			} else {
				// Drag the rig about the stream. This is the instrument: park it
				// where the smoke is thickest and watch what the slot does to it.
				// Dragging counts as motion too, so she shoves the air on the way.
				boat.vx = pointer.dx / 900 / Math.max(1e-3, dtHint);
				boat.vy = pointer.dy / 900 / Math.max(1e-3, dtHint);
				boat.x = q.x; boat.y = q.y;
			}
		});
		window.addEventListener('keydown', function (e) {
			keys[e.code] = true;
			if (/^Arrow/.test(e.code)) e.preventDefault();
			if (e.code === 'Space') { params.paused = !params.paused; e.preventDefault(); }
			if (e.code === 'KeyH') {
				var els = document.querySelectorAll('.panel');
				for (var i = 0; i < els.length; i++) {
					els[i].style.display = els[i].style.display === 'none' ? '' : 'none';
				}
			}
		});
		window.addEventListener('keyup', function (e) { keys[e.code] = false; });
		window.addEventListener('blur', function () { keys = {}; });
	}

	// ---- controls -------------------------------------------------------------

	var jibAngleSlider = null, mainAngleSlider = null;

	// Grey the two angle rows while auto trim owns them, so a slider that cannot
	// move is visibly a slider that cannot move.
	function paintAutoState() {
		var ids = ['s-jang', 's-mang'];
		for (var i = 0; i < ids.length; i++) {
			var el = document.getElementById(ids[i]);
			if (!el) continue;
			var row = el.parentNode;
			row.className = params.autoTrim ? 'row auto' : 'row';
		}
	}







	function bindControls() {
		function slider(id, key, fmt, hook) { return kit.slider(id, key, fmt, hook); }

		// Touching either angle drops auto trim. Without this the two sliders
		// looked completely dead: auto trim rewrites both angles every frame, so
		// whatever you dragged was overwritten before the next frame drew.
		function handTrim() {
			if (!params.autoTrim) return;
			params.autoTrim = false;
			var b = document.getElementById('b-auto');
			if (b) b.className = '';
			paintAutoState();
		}
		var one = function (v) { return (+v).toFixed(2); };
		var deg = function (v) { return Math.round(v) + '\u00b0'; };
		slider('wind', 'wind', one);
		slider('curl', 'curl', function (v) { return Math.round(v); });
		slider('visc', 'viscosity', one);
		slider('iter', 'iterations', function (v) { return Math.round(v); });
		slider('streaks', 'streaks', one);
		slider('count', 'streakCount', function (v) { return Math.round(v); });
		slider('width', 'streakWidth', one);
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

		slider('speedscale', 'speedScale', one);
		slider('speedcontrast', 'speedContrast', one);
		slider('colourblur', 'colourBlur', one);
		document.getElementById('b-clear').addEventListener('click', clearAll);
		// All of these go through the kit so each registers a refresher: a preset
		// that changes `medium` or `colourSpeed` now repaints its button instead
		// of leaving it showing the previous state, which is what made "colour by
		// speed" look like it was not applying.
		kit.toggle('b-boat', 'showBoat');
		kit.toggle('b-auto', 'autoTrim', function () { paintAutoState(); });
		kit.toggle('b-speed', 'colourSpeed');
		kit.toggle('b-vel', 'showVelocity', null, function (v) { return v ? 'show smoke' : 'velocity field'; });
		kit.toggle('b-sail', 'sailOnForce', function () { boat.speed = 0; });
		kit.pick({ helm: 'b-ctl-helm', sheets: 'b-ctl-sheets' }, 'controlMode', function (m) {
			if (m === 'sheets') params.autoTrim = false;
			paintAutoState();
			kit.refreshAll();
		});
		kit.cycle('b-medium', 'medium', ['smoke', 'oil'], function (v) { return v; }, function () { clearAll(); });
		paintAutoState();

		document.getElementById('b-reset').addEventListener('click', clearParams);
		kit.buildPresetBar('preset-bar');
		slider('sat', 'saturation', one);
		slider('con', 'contrast', one);
		slider('neon', 'neon', one);
		slider('mac', 'maccormack', one);
		slider('mixlo', 'wakeMixLo', one);
		slider('mixhi', 'wakeMixHi', one);
		slider('gain', 'driveGain', function (v) { return (+v).toFixed(3); });
		slider('drag', 'hullDrag', one);

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
		document.getElementById('b-copy').addEventListener('click', function () {
			var text = settingsBlock();
			console.log(text);
			if (navigator.clipboard) navigator.clipboard.writeText(text);
			announce('Settings copied to the clipboard, and printed to the console.');
		});
		document.getElementById('b-sweep-main').addEventListener('click', function () {
			startSweep('mainAngle', -90, 180, 5);
		});
		document.getElementById('b-sweep-jib').addEventListener('click', function () {
			startSweep('jibAngle', -90, 180, 5);
		});
	}

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
		var opts = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
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
		}
		var halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : (halfFloat && halfFloat.HALF_FLOAT_OES);

		function formatFor(internal, format, type) {
			if (!supportRenderTextureFormat(internal, format, type)) {
				if (!isWebGL2) return { internal: gl.RGBA, format: gl.RGBA };
				if (internal === gl.R16F) return formatFor(gl.RG16F, gl.RG, type);
				if (internal === gl.RG16F) return formatFor(gl.RGBA16F, gl.RGBA, type);
				return null;
			}
			return { internal: internal, format: format };
		}

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

		ext = {
			isWebGL2: isWebGL2,
			halfFloatTexType: halfFloatTexType,
			supportLinearFiltering: supportLinearFiltering,
			formatRGBA: isWebGL2 ? formatFor(gl.RGBA16F, gl.RGBA, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA },
			formatRG: isWebGL2 ? formatFor(gl.RG16F, gl.RG, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA },
			formatR: isWebGL2 ? formatFor(gl.R16F, gl.RED, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA }
		};

		gl.clearColor(0, 0, 0, 1);

		quadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
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
		programs.mask = program(MASK_FRAG);
		programs.force = program(FORCE_FRAG);
		programs.speed = program(SPEED_FRAG);
		programs.blur = program(BLUR_FRAG);
		programs.maccormack = program(prefix + MACCORMACK_FRAG);
		programs.reduce = program(REDUCE_FRAG);
		programs.display = program(DISPLAY_FRAG);
		programs.particleInit = program(PARTICLE_INIT_FRAG, MINIMAL_VERT);
		programs.particleUpdateDust = program(PARTICLE_UPDATE_DUST_FRAG, MINIMAL_VERT);
		programs.particleUpdateTrails = program(PARTICLE_UPDATE_TRAILS_FRAG, MINIMAL_VERT);
		programs.particleFade = program(PARTICLE_FADE_FRAG, MINIMAL_VERT);
		programs.particleComposite = program(PARTICLE_COMPOSITE_FRAG, MINIMAL_VERT);
		programs.particleDraw = buildParticleDrawProgram();
		// aPosition is attribute 0 in every program; bind once.
		for (var k in programs) {
			if (programs.hasOwnProperty(k)) gl.bindAttribLocation(programs[k].handle, 0, 'aPosition');
		}
	}

	function buildBuffers() {
		var filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
		var type = ext.isWebGL2 ? ext.halfFloatTexType : ext.halfFloatTexType;
		var sim = params.simRes, dyeRes = params.dyeRes;
		var aspect = canvas.width / canvas.height;
		var sw = Math.round(sim * Math.max(1, aspect)), sh = Math.round(sim * Math.max(1, 1 / aspect));
		var dw = Math.round(dyeRes * Math.max(1, aspect)), dh = Math.round(dyeRes * Math.max(1, 1 / aspect));

		dye = createDoubleFBO(dw, dh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dyeHat = createFBO(dw, dh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dyeTilde = createFBO(dw, dh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		velocity = createDoubleFBO(sw, sh, ext.formatRG.internal, ext.formatRG.format, type, filter);
		divergenceFbo = createFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
		curlFbo = createFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
		// The mask carries a flag and a velocity, so it needs all four channels.
		obstacleFbo = createFBO(sw, sh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);

		// Power of two so the sum collapses exactly, halving each pass.
		var F = 512;
		forceFbo = createFBO(F, F / 2, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST);
		speedField = createDoubleFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, filter);
		reduceChain = [];
		var rw = F, rh = F / 2;
		while (rw > 1 || rh > 1) {
			rw = Math.max(1, rw >> 1); rh = Math.max(1, rh >> 1);
			reduceChain.push(createFBO(rw, rh, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST));
		}
		pressure = createDoubleFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);

		// Screen-sized, so it has to be rebuilt on every resize same as the
		// dye/velocity grids. Losing the accumulated trail on a resize is a
		// minor visual hiccup, not a correctness problem.
		trailA = createFBO(canvas.width, canvas.height, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		trailB = createFBO(canvas.width, canvas.height, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		trailRead = trailA; trailWrite = trailB;
	}

	function resize() {
		var w = Math.floor(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5));
		var h = Math.floor(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 1.5));
		if (canvas.width === w && canvas.height === h) return false;
		canvas.width = w; canvas.height = h;
		return true;
	}

	function frame(now) {
		requestAnimationFrame(frame);
		var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.033) : 0.016;
		lastTime = now;
		dtHint = dt;

		if (resize()) buildBuffers();

		if (!params.paused) {
			simTime += dt;
			stepRig(dt);
			inject(dt);
			step(dt);
			measureForce(dt);
			buildSpeedField();
			sweepTick(dt);
			updateParticles(dt);
		}

		var p = programs.display;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTexture, dye.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform2f(p.uniforms.point, boat.x, boat.y);
		gl.uniform2f(p.uniforms.heading, Math.cos(boat.heading), Math.sin(boat.heading));
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform1f(p.uniforms.size, params.boatSize);
		gl.uniform1f(p.uniforms.showBoat, params.showBoat ? 1 : 0);
		gl.uniform1f(p.uniforms.showVelocity, params.showVelocity ? 1 : 0);
		gl.uniform1f(p.uniforms.colourSpeed, params.colourSpeed ? 1 : 0);
		gl.uniform1f(p.uniforms.uOil, params.medium === 'oil' ? 1 : 0);
		gl.uniform1f(p.uniforms.uSaturation, params.saturation);
		gl.uniform1f(p.uniforms.uContrast, params.contrast);
		gl.uniform1f(p.uniforms.uNeon, params.neon);
		// The free stream is wind*300; put it partway up the ramp so there is
		// headroom above it for the slot to show as an actual acceleration.
		// 0.40 rather than 1.0: the field settles at about 40 per cent of the
		// nominal inflow once viscosity and the pressure solve have had their
		// say, and the ramp has to be scaled to the flow that exists.
		gl.uniform1f(p.uniforms.speedRef, params.wind * 300 * params.speedScale);
		gl.uniform1f(p.uniforms.speedContrast, params.speedContrast);
		gl.uniform1i(p.uniforms.uSpeed, speedField.read.attach(2));
		gl.uniform1f(p.uniforms.lee, leeSide());
		setFoilUniforms(p);
		blit(null);

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
				var sp = document.getElementById('r-speed');
				if (sp) {
					sp.textContent = (boat.speed * 100).toFixed(2);
					sp.className = 'val ' + (boat.speed > 0.0005 ? 'good' : 'bad');
				}
			}
		}

		frames++; fpsTimer += dt;
		if (fpsTimer >= 0.5) {
			document.getElementById('fps').textContent = Math.round(frames / fpsTimer) + ' fps';
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
			rebuildParticles();
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

	// For the headless checks.
	Object.defineProperty(LAB, 'maskFbo', { get: function () { return obstacleFbo; } });
	Object.defineProperty(LAB, 'speedField', { get: function () { return speedField; } });

	// Test-only: re-run the same rebuild the count/style controls trigger, so a
	// script can drive params.particleSizeIdx / params.particleStyle directly
	// without simulating clicks on the range input.
	LAB.rebuildParticlesForTest = function () { rebuildParticles(); };

	// Test-only: read back a spread of particle position texels so a script can
	// assert finiteness and domain bounds without a second, parallel readback
	// path living in the shipped code. Reads the whole texture in one go
	// (RGBA float, matching what measureForce() already does for this same
	// half-float format) rather than issuing many small reads.
	LAB.particleDebugInfo = function (wantSamples) {
		if (!particlePos || !particleGridSize) return null;
		var n = particleGridSize;
		var buf = new Float32Array(n * n * 4);
		gl.bindFramebuffer(gl.FRAMEBUFFER, particlePos.read.fbo);
		gl.readPixels(0, 0, n, n, gl.RGBA, gl.FLOAT, buf);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		var finite = true, inBounds = true;
		var xs = [], ys = [];
		var total = n * n;
		var step = Math.max(1, Math.floor(total / (wantSamples || 200)));
		for (var i = 0; i < total; i += step) {
			var x = buf[i * 4], y = buf[i * 4 + 1];
			if (!isFinite(x) || !isFinite(y)) finite = false;
			if (x < -0.001 || x > 1.001 || y < -0.001 || y > 1.001) inBounds = false;
			if (xs.length < 8) { xs.push(x); ys.push(y); }
		}
		return { gridSize: n, count: total, finite: finite, inBounds: inBounds, sampleX: xs, sampleY: ys };
	};

	// Test-only: min/max/mean of an FBO's red channel, for chasing down blowouts.
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
	LAB.dyeDebugInfo = function () { return dye ? fboStats(dye.read) : null; };

	LAB.debug = function () {
		return { gl: gl, ext: ext, dye: dye, velocity: velocity, boat: boat, canvas: canvas };
	};
})(window);
