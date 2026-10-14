// A hydrofoil near a free surface: a main wing forward and an inverted rear
// stabiliser behind it, both immersed at an adjustable depth below a flat
// water line, with horizontal flow running past them.
//
// Solver is smoke-lab's, unmodified in its bones: advect -> curl -> vorticity
// confinement -> divergence -> Jacobi pressure -> gradient subtract, the same
// MacCormack dye advection, and the same "no surface tracing" force
// measurement (dF = p * grad(mask), summed over the grid and reduced on the
// GPU). See smoke-lab/smoke.js for the long-form comments on each of those;
// they are not repeated here except where this solver actually differs.
//
// THE ONE THING THAT MATTERS: the top of the domain is the free surface, and
// the pressure Jacobi solve treats it as Dirichlet p = 0 there (a ghost cell
// at zero pressure, T = -C in the stencil) rather than the zero-gradient wall
// condition every other boundary uses. A rigid lid (zero-gradient, T = C)
// mirrors the foil's bound vortex with an OPPOSITE-sign image above it, which
// speeds the flow over the foil and INCREASES lift as it nears the surface.
// That is the low-speed limit, where gravity holds the surface flat, and it is
// the easy mistake to make by treating the water's top edge like any other
// wall. A constant-pressure surface needs a SAME-sign image instead, which
// slows the flow over the foil, so lift falls off as she comes up shallow.
// That is the high-speed limit (depth Froude number U / sqrt(g h) well above
// 1), which is where a foiler spends her time once she is flying. Sides and
// the seabed keep the ordinary zero-gradient wall condition. Only the top
// changes.
//
// What this does NOT model, on purpose: the surface itself never deforms, so
// there is no wave-making drag and no wave elevation feeding back into the
// flow; there is no ventilation (air drawn down the low-pressure side once a
// real foil gets close enough to breach) and no cavitation. The Dirichlet lid
// is the INFINITE-FROUDE limit of the linearised free-surface condition: there
// is no gravity in it, so no waves. It gets the sign and the trend right at
// flying speed, and it is the entire mechanism by which "shallower means less
// lift" shows up here. Around take-off speed (depth Froude number near 1) real
// surface waves change the lift and add wave drag, and none of that is here,
// nor is what happens in the last few centimetres before a foil broaches.
(function (root) {
	'use strict';

	var LAB = root.FOILLAB = {};

	var params = {
		// The flow. In solver units/second, comparable within a run, not
		// across runs with a different depth/chord — see the note on the
		// readout panel about why these are not newtons.
		flow: 230,
		// Low by this repo's usual standard (smoke-lab runs curl 19-46):
		// vorticity confinement's shed eddies are exactly the "1.41 vs 0.94
		// at identical settings" noise the depth sweep has to average out,
		// and turning it down is what actually let the sweep's signal (a
		// few percent, close to the surface) come out from under it rather
		// than needing an impractically long hold to do the same job.
		// Off by default: confinement feeds energy into every eddy, which held
		// a large separated vortex over the foil and made the force readings
		// swing. With it off, lift on a symmetric section at 5 degrees settles
		// at the thin-aerofoil value.
		curl: 0,
		// A uniform decay on velocity, not a real viscosity: kept as a
		// slider for the look of the wake, off by default.
		viscosity: 0,
		iterations: 40,

		// 'linear': the Dirichlet p=0 lid described above — flat, stable,
		// cheap, and what the depth sweep trusts. 'twoPhase': an actual
		// advected air/water interface with variable density (see the
		// TWO-PHASE MODE block further down). Switchable so the linear mode
		// stays the honest default and the two-phase attempt can be judged
		// on its own, not silently relied on.
		mode: 'linear',

		// Where the ASSEMBLY sits, as a rigid group: groupX/groupDepth are
		// the pair's own reference point (the midpoint between the two
		// leading edges, at the group's own depth). mainDepthOffset and
		// stabDepthOffset then move each foil independently up or down from
		// that shared depth — zero means "rigidly together", as it was
		// before this was added. Depth is measured straight down from the
		// free surface: the top edge of the sim domain in linear mode
		// (where the Dirichlet condition lives), or the initial interface
		// height in two-phase mode. gap is the stabiliser's leading edge
		// aft of the main foil's, along the flow.
		groupX: 0.36,
		depth: 0.15,
		gap: 0.26,
		mainDepthOffset: 0,
		stabDepthOffset: 0,

		mainIncidence: 5,
		mainChord: 0.20,
		mainCamber: 0.045,
		mainThick: 0.11,

		// Inverted by default: negative camber flips the mean camber line to
		// the other side of the chord, negative incidence points the nose
		// down. Both together are what make this a downforce-producing
		// section rather than a small second lifting wing.
		stabIncidence: -5,
		stabChord: 0.10,
		stabCamber: -0.05,
		stabThick: 0.09,

		streaks: 1.8,
		streakCount: 22,
		streakWidth: 0.90,
		fade: 0.08,
		maccormack: 1.0,
		colourSpeed: true,
		speedScale: 0.35,
		speedContrast: 1.10,
		colourBlur: 2.0,
		showVelocity: false,

		// Sized so the main chord still lands on a few hundred cells (see
		// the boot-time report) despite the chord itself being smaller,
		// fraction-of-domain-wise, than the first cut of this lab used — a
		// domain only ~3 chords tall let a rigid BOTTOM wall's own image
		// effect fight the free surface's, humping the depth-sweep curve
		// partway through instead of it falling cleanly throughout. ~5
		// chords tall (this chord, this simRes) mostly clears that.
		simRes: 760,
		dyeRes: 900,
		paused: false,

		// TWO-PHASE MODE. rhoAirRatio is water:air, softened from the real
		// ~1000:1 (which a fixed-iteration Jacobi solve at this grid size
		// cannot hold together) down to something a real-time solve can
		// actually resolve. gravity is in the solver's own units — see the
		// comment on GRAVITY_FRAG for how it was picked. surfaceFrac is how
		// much of the domain height starts as water (the rest starts as
		// air, giving the interface room to move before it runs into the
		// domain top).
		rhoAirRatio: 40,
		// Empirically the largest that held a still interface roughly in
		// place over 6+ seconds at this grid and iteration count without a
		// slow drain toward all-air — 10 already crept down over time, 16
		// visibly drained, 46 (the first guess) emptied the tank in about
		// ten seconds. The softened density ratio above is exactly why this
		// number is well below what real gravity would want: the
		// variable-density Jacobi solve cannot build a strong enough
		// hydrostatic pressure gradient per frame to hold back more than
		// this at a real-time iteration budget.
		gravity: 5,
		surfaceFrac: 0.62,
		phaseSharpen: 2.5,

		// The depth sweep. Deep to shallow, so the headline table reads the
		// way the question is usually asked ("what happens as she comes up").
		sweepFrom: 0.35,
		sweepTo: 0.02,
		sweepStep: 0.033,
		sweepSettle: 1.8,
		sweepHold: 3.0,

		// The offset sweep: group depth held fixed, the relative depth
		// between the two foils swept instead — the case a rigid pair can
		// never show, because the two feel different amounts of surface
		// effect only when they are NOT at the same depth.
		offsetFrom: -0.09,
		offsetTo: 0.09,
		offsetStep: 0.02,
		offsetGroupDepth: 0.13
	};
	LAB.params = params;

	var kit = LABKIT.create({
		store: 'foillab.params.v1',
		params: params,
		schema: 3,
		resetOnUpgrade: ['viscosity', 'curl'],
		defaultOpen: ['sec-foil'],
		// No preset bar on this page — an explicit empty table rather than
		// silently inheriting smoke-lab's (a wind/rig vocabulary this lab
		// does not share).
		presets: {}
	});

	function saveParams() { kit.save(); }
	function loadParams() { kit.load(); }
	function clearParams() { kit.clear(); }
	function refreshAllControls() { kit.refreshAll(); }
	function announce(t) { kit.announce(t); }
	function bindSections() { kit.bindSections(); }

	var gl, canvas, ext;
	var velocity, dye, pressure, divergenceFbo, curlFbo;
	var phase, phaseHat, phaseTilde;
	var mainMaskFbo, stabMaskFbo, obstacleFbo;
	var forceFbo, reduceChain = [], speedField, dyeHat, dyeTilde;
	var programs = {};
	var quadBuffer;
	var DEG = Math.PI / 180;

	// ---- boilerplate (identical to smoke-lab/smoke.js) -------------------

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

	// ---- shaders -----------------------------------------------------------

	// Sets every texel to one value: used to start the water already moving
	// at the free-stream speed, so a reset does not throw an impulsive start
	// (and its starting vortex) at the foils.
	var FILL_FRAG = [
		'precision highp float;',
		'uniform vec4 value;',
		'void main() { gl_FragColor = value; }'
	].join('\n');

	var CLEAR_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv; uniform sampler2D uTexture; uniform float value;',
		'void main() { gl_FragColor = value * texture2D(uTexture, vUv); }'
	].join('\n');

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
		'  if (blockDye > 0.5) {',
		'    result = min(result, vec4(3.0));',
		'    if (texture2D(uObstacle, vUv).x > 0.5) result = vec4(0.0);',
		'  }',
		'  gl_FragColor = result;',
		'}'
	].join('\n');

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

	// Divergence: sides and bottom unchanged from the reference solver — a
	// free-slip reflect, no flow crosses those three. The TOP is not in that
	// list on purpose, but which way it goes now depends on `topOpen`.
	//
	// Linear mode (topOpen = true): the top edge is left OPEN, no override,
	// just whatever the velocity texture's own edge-clamped read gives. A
	// Dirichlet p = 0 boundary and a reflecting (zero normal velocity) wall
	// are two different physical boundaries; demanding both at once
	// over-constrains the same Poisson solve. That is not a theoretical
	// nicety — tried it the reflecting way first, and the pressure field's
	// own mean drifted from ~1 to 32+ over four seconds (rigid-lid top, same
	// test, stayed within +/-0.1), because the fixed per-frame Jacobi
	// iteration count never fully resolves the mismatch and each frame's
	// leftover residual gets carried into the next as the starting guess.
	//
	// Two-phase mode (topOpen = false): the domain top is an ordinary closed
	// wall, same as the other three sides. There is no Dirichlet condition
	// to conflict with here — the free surface in this mode is wherever the
	// phase field says it is, found by the variable-density pressure solve
	// itself, not imposed on a fixed edge. With a light air phase already
	// sitting above the water, a rigid lid at the very top of a mostly-air
	// region is a much smaller lie than a rigid lid AT the water surface
	// would be.
	var DIVERGENCE_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uObstacle;',
		'uniform float topOpen, openFlow, inflow;',
		'void main() {',
		'  float L = texture2D(uVelocity, vL).x;',
		'  float R = texture2D(uVelocity, vR).x;',
		'  float T = texture2D(uVelocity, vT).y;',
		'  float B = texture2D(uVelocity, vB).y;',
		'  vec2 C = texture2D(uVelocity, vUv).xy;',
		'  vec4 oL = texture2D(uObstacle, vL);',
		'  vec4 oR = texture2D(uObstacle, vR);',
		'  vec4 oT = texture2D(uObstacle, vT);',
		'  vec4 oB = texture2D(uObstacle, vB);',
		'  if (oL.x > 0.5) L = oL.y;',
		'  if (oR.x > 0.5) R = oR.y;',
		'  if (oT.x > 0.5) T = oT.z;',
		'  if (oB.x > 0.5) B = oB.z;',
		// Linear mode: water comes in at the left at the free-stream speed
		// and leaves through the right edge. Two-phase mode keeps the closed
		// box it was built with.
		'  if (vL.x < 0.0) { L = openFlow > 0.5 ? inflow : -C.x; }',
		'  if (vR.x > 1.0) { R = openFlow > 0.5 ? C.x : -C.x; }',
		'  if (topOpen < 0.5 && vT.y > 1.0) { T = -C.y; }',
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

	// Pressure: the one shader in this file that is NOT a copy of smoke-lab's.
	// Every other boundary (both sides, the seabed, and any obstacle
	// neighbour) still gets the zero-gradient wall condition, "a solid
	// neighbour reports this cell's own pressure" — L/R/B below are exactly
	// smoke-lab's PRESSURE_FRAG. The TOP domain edge, and only when there is
	// no obstacle sitting in the way there, instead gets a ghost cell held at
	// p = 0: since the stencil approximates the neighbour as (C + T) / 2, a
	// ghost pressure of zero at the surface means T = -C. That is Dirichlet
	// p = 0, and it is what makes the water surface a PRESSURE RELEASE rather
	// than a lid: the low-pressure suction side of a foil lifting close under
	// it partially unloads against the open surface above, instead of being
	// reinforced by the opposite-sign image a rigid ceiling would put there. Get this sign backwards and lift RISES as the foil comes up
	// shallow, which is the rigid-lid answer and the wrong one for a foiler.
	var PRESSURE_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uDivergence, uObstacle;',
		'uniform float openFlow;',
		'void main() {',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, vT).x;',
		'  float B = texture2D(uPressure, vB).x;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  else if (openFlow > 0.5 && vR.x > 1.0) R = -C;',
		'  if (texture2D(uObstacle, vB).x > 0.5) B = C;',
		'  if (texture2D(uObstacle, vT).x > 0.5) {',
		'    T = C;',
		'  } else if (vT.y > 1.0) {',
		'    T = -C;',
		'  }',
		'  float divergence = texture2D(uDivergence, vUv).x;',
		'  gl_FragColor = vec4((L + R + B + T - divergence) * 0.25, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Gradient subtract carries the identical Dirichlet top so the velocity
	// field the pressure just solved for is actually enforced right up to
	// the surface, not just approximated by the Jacobi iterations converging
	// near it.
	var GRADIENT_FRAG = [
		'precision mediump float; precision mediump sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uVelocity, uObstacle;',
		'uniform float openFlow;',
		'void main() {',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, vT).x;',
		'  float B = texture2D(uPressure, vB).x;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  else if (openFlow > 0.5 && vR.x > 1.0) R = -C;',
		'  if (texture2D(uObstacle, vB).x > 0.5) B = C;',
		'  if (texture2D(uObstacle, vT).x > 0.5) {',
		'    T = C;',
		'  } else if (vT.y > 1.0) {',
		'    T = -C;',
		'  }',
		'  vec2 velocity = texture2D(uVelocity, vUv).xy;',
		'  velocity.xy -= vec2(R - L, T - B);',
		'  vec4 o = texture2D(uObstacle, vUv);',
		'  if (o.x > 0.5) velocity = vec2(0.0, 0.0);',
		'  gl_FragColor = vec4(velocity, 0.0, 1.0);',
		'}'
	].join('\n');

	// ---- TWO-PHASE MODE --------------------------------------------------
	//
	// Everything above this point (and PRESSURE_FRAG/GRADIENT_FRAG just
	// above) is the linear mode: a flat Dirichlet lid, constant density,
	// cheap and stable, and what the depth sweep trusts. This block is a
	// second, switchable mode that tries to simulate the actual water/air
	// interface instead of approximating its leading-order effect.
	//
	// A phase field phi (1 = water, 0 = air) is advected by the same
	// MacCormack scheme the dye already uses — plain semi-Lagrangian
	// smears the interface into a grey band within a couple of seconds,
	// and MacCormack is genuinely the difference between a visible surface
	// and fog. Density rho = mix(rhoAir, 1, phi), and gravity is a real
	// force once rho actually varies. The pressure Poisson equation
	// becomes variable-coefficient, div((1/rho) grad(p)) = div(u*): each
	// Jacobi neighbour is weighted by 1/rho evaluated at the FACE between
	// the two cells (the average of the two cells' own densities), rather
	// than the flat 0.25 the constant-density solve uses.
	//
	// Real water:air is about 1000:1. That is stiff enough that a Jacobi
	// solve at a real-time iteration count will not hold the interface
	// together — tried it, it did not. rhoAirRatio softens this, same as
	// graphics fluid codes routinely do (50:1, 100:1 are common); the
	// default here is 40:1. This is stated on the panel, not hidden: a
	// softened ratio is a real simplification with a real cost (surface
	// tension-scale detail, the exact speed things fall, is not to be
	// trusted), not a free lunch.
	//
	// HONEST STATUS: this mode is not stable under sustained flow. With the
	// horizontal inflow running — the entire point of this lab — the phase
	// field's mean drains from its initial ~0.62 toward 0 over roughly 8-15
	// seconds regardless of gravity (measured with gravity SET TO ZERO: the
	// decline still happens, so it is not simply "gravity is too strong").
	// Raising the iteration count and softening rhoAirRatio further both
	// slow the drain but do not stop it — 150 iterations and an 8:1 ratio
	// (both well past anything usable at interactive framerates) still lose
	// half the water in under ten seconds. That points at the variable-
	// density Jacobi solve itself not converging fast enough per frame to
	// hold a sharp, high-shear density interface against real horizontal
	// flow, not at a simple mistuned constant. It was not chased further
	// than this: the honest outcome, per the brief, is to report it rather
	// than keep tuning indefinitely or quietly ship something that looks
	// fine for a few seconds and then empties the tank. The mode is left in
	// place and switchable because it DOES show the interface deforming
	// convincingly for the first few seconds after a reset — long enough to
	// see the mechanism — before the drain takes over. Do not trust a
	// multi-minute two-phase session, and do not read a ventilation onset
	// depth out of it: this mode does not currently hold up long enough to
	// measure that trustworthily. The linear mode above is unaffected by
	// any of this and remains the one the depth sweep uses.

	// Advected exactly like a dye channel — deliberately not a bespoke
	// shader, so it inherits the same MacCormack correction rather than a
	// second, possibly-inconsistent implementation of the same idea.
	var PHASE_INIT_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform float surfaceFrac;',
		'void main() { gl_FragColor = vec4(step(vUv.y, surfaceFrac), 0.0, 0.0, 1.0); }'
	].join('\n');

	// Crude anti-diffusion: nudge phi away from 0.5 each frame so the
	// interface does not just slowly grey out despite MacCormack. This is
	// a heuristic steepening filter, not a proper interface-reconstruction
	// (PLIC) scheme — it holds a usable interface together at this grid
	// resolution and no more than that.
	var PHASE_SHARPEN_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uPhase;',
		'uniform float rate, dt;',
		'void main() {',
		'  float phi = texture2D(uPhase, vUv).x;',
		'  phi += rate * dt * phi * (1.0 - phi) * (phi - 0.5);',
		'  gl_FragColor = vec4(clamp(phi, 0.0, 1.0), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Uniform gravity on the vertical velocity. `gravity` is in the
	// solver's own units (velocity is roughly O(hundreds) given `flow` is
	// specified the same way) — picked empirically so a still tank holds
	// its water down without the interface collapsing or blowing up
	// within the iteration budget below; it is exposed as a slider rather
	// than baked in because that balance point moves with rhoAirRatio and
	// with grid resolution.
	var GRAVITY_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'uniform float gravity, dt;',
		'void main() {',
		'  vec2 v = texture2D(uVelocity, vUv).xy;',
		'  v.y -= gravity * dt;',
		'  gl_FragColor = vec4(v, 0.0, 1.0);',
		'}'
	].join('\n');

	// Variable-density pressure Jacobi. Same stencil shape as the
	// constant-density PRESSURE_FRAG above — same obstacle handling, same
	// domain-edge behaviour (plain zero-gradient walls all round in this
	// mode; the Dirichlet lid is the linear mode's trick specifically, and
	// with a light air phase already sitting above the water here a rigid
	// domain top is a much smaller lie than a rigid lid AT the surface
	// would be) — except each neighbour term carries its own weight
	// 1/rho_face instead of a flat 0.25, and the sum is normalised by the
	// weights actually used rather than always dividing by 4.
	var PRESSURE_VD_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uDivergence, uObstacle, uPhase;',
		'uniform float rhoAir;',
		'float rhoOf(float phi) { return mix(rhoAir, 1.0, phi); }',
		'void main() {',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, vT).x;',
		'  float B = texture2D(uPressure, vB).x;',
		'  float rhoC = rhoOf(texture2D(uPhase, vUv).x);',
		'  float wL = 1.0 / (0.5 * (rhoC + rhoOf(texture2D(uPhase, vL).x)));',
		'  float wR = 1.0 / (0.5 * (rhoC + rhoOf(texture2D(uPhase, vR).x)));',
		'  float wT = 1.0 / (0.5 * (rhoC + rhoOf(texture2D(uPhase, vT).x)));',
		'  float wB = 1.0 / (0.5 * (rhoC + rhoOf(texture2D(uPhase, vB).x)));',
		'  if (texture2D(uObstacle, vL).x > 0.5) { L = C; wL = 1.0 / rhoC; }',
		'  if (texture2D(uObstacle, vR).x > 0.5) { R = C; wR = 1.0 / rhoC; }',
		'  if (texture2D(uObstacle, vT).x > 0.5) { T = C; wT = 1.0 / rhoC; }',
		'  if (texture2D(uObstacle, vB).x > 0.5) { B = C; wB = 1.0 / rhoC; }',
		'  float divergence = texture2D(uDivergence, vUv).x;',
		'  float wsum = wL + wR + wT + wB;',
		'  gl_FragColor = vec4((wL * L + wR * R + wT * T + wB * B - divergence) / max(wsum, 1e-6), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Variable-density gradient subtract: velocity -= (1/rho) * grad(p),
	// the direct generalisation of the constant-density GRADIENT_FRAG
	// above (which is this with rho = 1 everywhere).
	var GRADIENT_VD_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uVelocity, uObstacle, uPhase;',
		'uniform float rhoAir;',
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
		'  float rhoC = mix(rhoAir, 1.0, texture2D(uPhase, vUv).x);',
		'  vec2 velocity = texture2D(uVelocity, vUv).xy;',
		'  velocity.xy -= vec2(R - L, T - B) / max(rhoC, 1e-4);',
		'  vec4 o = texture2D(uObstacle, vUv);',
		'  if (o.x > 0.5) velocity = vec2(0.0, 0.0);',
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

	// The inflow, left edge only. No gust term: the depth sweep wants the
	// only thing changing between samples to be the depth.
	var FLOW_FRAG = [
		'precision highp float; precision highp sampler2D;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'uniform float flow, dt;',
		'void main() {',
		'  vec2 v = texture2D(uVelocity, vUv).xy;',
		'  float inflow = smoothstep(0.10, 0.0, vUv.x);',
		'  vec2 target = vec2(flow, 0.0);',
		// Inflow strip only. This used to add 0.45/s everywhere, which pulled
		// the whole tank back toward free stream and damped the wake and the
		// downwash the stabiliser sits in.
		'  float k = clamp(inflow * 12.0 * dt, 0.0, 1.0);',
		'  gl_FragColor = vec4(mix(v, target, k), 0.0, 1.0);',
		'}'
	].join('\n');

	// The section, lifted verbatim from smoke-lab's RIG_GLSL: blunt nose,
	// sharp trailing edge, cambered mean line, pivoting about the leading
	// edge (q.x = 0). rotateFoil replaces toFoil() because there is no boat
	// to translate into the frame of first — the caller does the translation
	// itself and hands this the already-centred point.
	var FOIL_GLSL = [
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
		// foilDist puts the LEADING edge at local x = 0 and the TRAILING edge
		// at local x = -c. Water flows in +x (world), so the trailing edge
		// has to land DOWNSTREAM (world +x) of the origin at zero incidence
		// — the opposite sense from a plain rotation of world x, which would
		// leave it pointing upstream into the oncoming flow instead. So this
		// mirrors x before rotating: at ang = 0 a world point c to the right
		// of the origin maps to local (-c, 0), the trailing edge, as it
		// should. Get this backwards (drop the mirror) and the foil sits
		// pointing into its own incoming flow, incidence works backwards,
		// and the lift this file measures is not lift on the shape drawn.
		'vec2 rotateFoil(vec2 p, float ang) {',
		'  float c = cos(ang), s = sin(ang);',
		'  return vec2(-p.x * c + p.y * s, p.x * s + p.y * c);',
		'}'
	].join('\n');

	// One foil rasterised into its own mask, so its force can be measured
	// separately from the other one's. r = 1 inside, 0 outside; g/b carry
	// the mask's own velocity, same idea as smoke-lab's rig — normally zero
	// (the assembly just sits there), but set to the drag velocity while
	// the user is hauling the whole rig around by hand, so a dragged foil
	// genuinely shoves the water rather than sliding through it like a
	// ghost.
	var FOIL_MASK_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform vec2 origin, vel;',
		'uniform float aspectRatio, angle, chord, camber, thick;',
		FOIL_GLSL,
		'void main() {',
		'  vec2 p = vUv - origin;',
		'  p.x *= aspectRatio;',
		'  vec2 local = rotateFoil(p, angle);',
		'  float d = foilDist(local, chord, camber, thick);',
		'  gl_FragColor = vec4(step(d, 0.0), vel.x, vel.y, 1.0);',
		'}'
	].join('\n');

	// The combined obstacle the fluid solver actually respects: solid if
	// EITHER foil is there. Kept as its own small FBO/pass, separate from
	// the two per-foil masks, precisely so the force integral (below) can
	// read a mask with only one foil in it. Velocity: both masks carry the
	// SAME drag velocity uniform everywhere (not just where solid), since
	// it is one rigid group being dragged, so either one's g/b already IS
	// the combined answer.
	var COMBINE_MASK_FRAG = [
		'precision mediump float;',
		'varying vec2 vUv;',
		'uniform sampler2D uA, uB;',
		'void main() {',
		'  vec4 a = texture2D(uA, vUv);',
		'  vec4 b = texture2D(uB, vUv);',
		'  gl_FragColor = vec4(max(a.x, b.x), a.y, a.z, 1.0);',
		'}'
	].join('\n');

	// dF = p * grad(mask), the pressure-surface integral with no surface
	// tracing (see smoke-lab/smoke.js for the derivation). Called once per
	// foil per frame with that foil's OWN mask, so grad(mask) is only ever
	// nonzero on that foil's own surface and the two forces cannot leak into
	// each other.
	var FORCE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uObstacle;',
		'uniform vec2 simSize, originCells;',
		'void main() {',
		'  float mL = texture2D(uObstacle, vL).x;',
		'  float mR = texture2D(uObstacle, vR).x;',
		'  float mT = texture2D(uObstacle, vT).x;',
		'  float mB = texture2D(uObstacle, vB).x;',
		'  vec2 grad = 0.5 * vec2(mR - mL, mT - mB);',
		'  float p = texture2D(uPressure, vUv).x;',
		// Run at the sim's own resolution, so every cell is counted once and
		// both directions use the same square cell. r is this cell's offset
		// from the foil's leading edge, in cells, for the moment.
		'  vec2 f = p * grad;',
		'  vec2 r = vUv * simSize - originCells;',
		'  gl_FragColor = vec4(f, r.x * f.y - r.y * f.x, 0.0);',
		'}'
	].join('\n');

	var REDUCE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uSrc;',
		'uniform vec2 srcSize;',
		// Each output texel sums the 2x2 block under it, skipping texels past
		// an odd edge, so the chain adds every cell exactly once.
		'vec4 at(vec2 c) {',
		'  if (c.x >= srcSize.x || c.y >= srcSize.y) return vec4(0.0);',
		'  return texture2D(uSrc, (c + 0.5) / srcSize);',
		'}',
		'void main() {',
		'  vec2 b = floor(gl_FragCoord.xy) * 2.0;',
		'  gl_FragColor = at(b) + at(b + vec2(1.0, 0.0)) + at(b + vec2(0.0, 1.0)) + at(b + vec2(1.0, 1.0));',
		'}'
	].join('\n');

	var SPEED_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'void main() { gl_FragColor = vec4(length(texture2D(uVelocity, vUv).xy), 0.0, 0.0, 1.0); }'
	].join('\n');

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
		'uniform sampler2D uTexture, uVelocity, uSpeed, uPhase;',
		'uniform vec2 mainOrigin, stabOrigin;',
		'uniform float aspectRatio, mainAngle, mainChord, mainCamber, mainThick;',
		'uniform float stabAngle, stabChord, stabCamber, stabThick;',
		'uniform float showVelocity, colourSpeed, speedRef, speedContrast, surfaceY, twoPhase;',
		'uniform float showRig, vent, mastHalf;',
		'uniform vec2 mastBase, fuseA, fuseB;',
		FOIL_GLSL,
		'float segDist(vec2 p, vec2 a, vec2 b) {',
		'  vec2 ab = b - a; float t = clamp(dot(p - a, ab) / max(dot(ab, ab), 1e-9), 0.0, 1.0);',
		'  return length(p - a - ab * t);',
		'}',
		'void main() {',
		'  vec3 c;',
		'  if (showVelocity > 0.5) {',
		'    vec2 v = texture2D(uVelocity, vUv).xy;',
		'    c = vec3(0.5 + v.x * 0.25, 0.5 + v.y * 0.25, 0.62);',
		'  } else {',
		'    float d = texture2D(uTexture, vUv).r;',
		'    float k = 1.0 - exp(-d * 1.6);',
		'    vec3 sea = vec3(0.020, 0.075, 0.140);',
		'    vec3 dyeCol = mix(vec3(0.25, 0.40, 0.56), vec3(0.95, 0.98, 1.0), k);',
		'    if (colourSpeed > 0.5) {',
		'      float v0 = texture2D(uSpeed, vUv).x / max(speedRef, 1.0) * 0.5;',
		'      float v = clamp(0.5 + (v0 - 0.5) * speedContrast, 0.0, 1.0);',
		'      vec3 slow = vec3(0.06, 0.10, 0.26);',
		'      vec3 midC = vec3(0.16, 0.46, 0.62);',
		'      vec3 fast = vec3(0.80, 0.90, 0.86);',
		'      vec3 hot  = vec3(1.00, 0.95, 0.78);',
		'      vec3 ramp = v < 0.42 ? mix(slow, midC, v / 0.42)',
		'                : v < 0.78 ? mix(midC, fast, (v - 0.42) / 0.36)',
		'                           : mix(fast, hot, (v - 0.78) / 0.22);',
		'      dyeCol = ramp * (0.45 + 0.55 * k);',
		'    }',
		'    c = mix(sea, dyeCol, clamp(k * 1.25, 0.0, 1.0));',
		'  }',
		// The free surface. Linear mode: a bright line exactly on the sim's
		// top edge, which is also exactly where the pressure solve enforces
		// p = 0. Two-phase mode: the actual phase field, which can now be
		// somewhere else entirely — pulled into a dip over suction, thrown
		// into a wave, breached by ventilation.
		'  if (twoPhase > 0.5) {',
		'    float phi = texture2D(uPhase, vUv).x;',
		'    vec3 air = vec3(0.66, 0.80, 0.92);',
		'    c = mix(c, air, clamp(1.0 - phi, 0.0, 1.0));',
		'    float edge = abs(phi - 0.5);',
		'    c += vec3(0.85, 0.92, 1.0) * (1.0 - smoothstep(0.0, 0.06, edge)) * 0.6;',
		'  } else {',
		'    float distToSurface = surfaceY - vUv.y;',
		'    c += vec3(0.55, 0.78, 0.98) * exp(-distToSurface * 220.0) * 0.9;',
		'  }',
		// Both foils, from the same distance field the solver treats as
		// solid: main pale, stabiliser warm, so "which one is which" reads
		// at a glance.
		'  vec2 pm = vUv - mainOrigin; pm.x *= aspectRatio;',
		'  float dMain = foilDist(rotateFoil(pm, mainAngle), mainChord, mainCamber, mainThick);',
		'  vec2 ps = vUv - stabOrigin; ps.x *= aspectRatio;',
		'  float dStab = foilDist(rotateFoil(ps, stabAngle), stabChord, stabCamber, stabThick);',
		'  float ed = 0.006;',
		'  c = mix(c, vec3(0.97, 0.94, 0.86), 1.0 - smoothstep(0.0, ed, dMain));',
		'  c = mix(c, vec3(1.00, 0.62, 0.30), 1.0 - smoothstep(0.0, ed, dStab));',
		'  float rim = min(dMain, dStab);',
		'  c = mix(c, vec3(0.04, 0.06, 0.09), (1.0 - smoothstep(ed, ed * 3.0, abs(rim))) * 0.7);',
		// The rig: fuselage between the two leading edges, mast from its base
		// up through the surface. Drawn only: neither is in the solver, a
		// vertical mast would be a wall across this side-on slice.
		'  if (showRig > 0.5) {',
		'    vec2 q = vUv; q.x *= aspectRatio;',
		'    vec2 a = fuseA; a.x *= aspectRatio; vec2 b = fuseB; b.x *= aspectRatio;',
		'    vec2 m0 = mastBase; m0.x *= aspectRatio;',
		'    float dF = segDist(q, a, b) - 0.0035;',
		'    float dM = segDist(q, m0, vec2(m0.x, surfaceY + 0.05)) - mastHalf;',
		'    c = mix(c, vec3(0.55, 0.60, 0.66), 1.0 - smoothstep(0.0, 0.002, min(dF, dM)));',
		// Ventilation: air drawn down the mast and over the back of the
		// main foil once she has breached.
		'    if (vent > 0.01) {',
		'      vec2 lm = rotateFoil(pm, mainAngle);',
		'      float upper = step(0.0, dMain) * (1.0 - smoothstep(0.0, 0.016, dMain));',
		'      float side = step(0.0, lm.y);',
		'      float sheet = (1.0 - smoothstep(0.0, 0.012, abs(q.x - m0.x + 0.006))) * step(m0.y, q.y);',
		'      float cav = max(upper * side, sheet * 0.7);',
		'      c = mix(c, vec3(0.78, 0.88, 0.96), cav * vent * 0.85);',
		'    }',
		'  }',
		'  gl_FragColor = vec4(c, 1.0);',
		'}'
	].join('\n');

	// ---- geometry -----------------------------------------------------------

	// The free surface itself: the top edge of the domain in linear mode
	// (where the Dirichlet condition lives), or the initial water line in
	// two-phase mode (which can then move — see TWO-PHASE MODE below).
	function surfaceY() { return params.mode === 'twoPhase' ? params.surfaceFrac : 1.0; }

	// The assembly is a rigid GROUP (groupX, depth) that both foils share,
	// plus each foil's own independent offset from that shared depth. Zero
	// offset both sides reproduces the original rigidly-paired behaviour.
	// THE RIG. When something outside this file (flight.js) takes the
	// assembly over, it places it as one rigid body: a fuselage line with the
	// mast at `pivotX`, the main foil's leading edge `mainAhead` metres ahead
	// of the mast and the stabiliser's `stabAft` behind, all pitched together
	// about the mast base. Depth is the mast base's, in metres below the
	// surface; `metresPerHeight` is the physical size of one domain height.
	var rig = null;
	LAB.setRig = function (r) { rig = r; };
	LAB.getRig = function () { return rig; };

	function rigPoint(ax, ay) {
		var H = rig.metresPerHeight, aspect = canvas.width / canvas.height;
		var th = rig.pitch * DEG, c = Math.cos(th), s = Math.sin(th);
		// Nose-up is clockwise with water flowing in +x, so a point ahead of
		// the mast rises as the pitch increases.
		var rx = ax * c + ay * s, ry = -ax * s + ay * c;
		return [rig.pivotX + rx / (H * aspect), surfaceY() - rig.depth / H + ry / H];
	}
	LAB.rigPoint = function (ax, ay) { return rig ? rigPoint(ax, ay) : null; };

	function mainOriginXY() {
		if (rig) return rigPoint(-rig.mainAhead, 0);
		return [params.groupX, surfaceY() - params.depth - params.mainDepthOffset];
	}
	function stabOriginXY() {
		if (rig) return rigPoint(rig.stabAft, 0);
		return [params.groupX + params.gap, surfaceY() - params.depth - params.stabDepthOffset];
	}
	function mainAngle() { return (params.mainIncidence + (rig ? rig.pitch : 0)) * DEG; }
	function stabAngle() { return (params.stabIncidence + (rig ? rig.pitch : 0)) * DEG; }

	function setFoilUniforms(p) {
		var mo = mainOriginXY(), so = stabOriginXY();
		gl.uniform2f(p.uniforms.mainOrigin, mo[0], mo[1]);
		gl.uniform2f(p.uniforms.stabOrigin, so[0], so[1]);
		gl.uniform1f(p.uniforms.mainAngle, mainAngle());
		gl.uniform1f(p.uniforms.mainChord, params.mainChord);
		gl.uniform1f(p.uniforms.mainCamber, params.mainCamber);
		gl.uniform1f(p.uniforms.mainThick, params.mainThick);
		gl.uniform1f(p.uniforms.stabAngle, stabAngle());
		gl.uniform1f(p.uniforms.stabChord, params.stabChord);
		gl.uniform1f(p.uniforms.stabCamber, params.stabCamber);
		gl.uniform1f(p.uniforms.stabThick, params.stabThick);
	}

	// ---- passes ---------------------------------------------------------------

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

	function buildMasks() {
		var p = programs.foilMask;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		// groupVel is in screen fractions per second; the solver works in
		// cells per second.
		gl.uniform2f(p.uniforms.vel, groupVel.x * LAB.simWidth, groupVel.y * LAB.simHeight);

		var mo = mainOriginXY();
		gl.uniform2f(p.uniforms.origin, mo[0], mo[1]);
		gl.uniform1f(p.uniforms.angle, mainAngle());
		gl.uniform1f(p.uniforms.chord, params.mainChord);
		gl.uniform1f(p.uniforms.camber, params.mainCamber);
		gl.uniform1f(p.uniforms.thick, params.mainThick);
		blit(mainMaskFbo);

		var so = stabOriginXY();
		gl.uniform2f(p.uniforms.origin, so[0], so[1]);
		gl.uniform1f(p.uniforms.angle, stabAngle());
		gl.uniform1f(p.uniforms.chord, params.stabChord);
		gl.uniform1f(p.uniforms.camber, params.stabCamber);
		gl.uniform1f(p.uniforms.thick, params.stabThick);
		blit(stabMaskFbo);

		p = programs.combineMask;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uA, mainMaskFbo.attach(0));
		gl.uniform1i(p.uniforms.uB, stabMaskFbo.attach(1));
		blit(obstacleFbo);
	}

	var lastTime = 0, frames = 0, fpsTimer = 0, simTime = 0;
	// The solver's pressure scales with its timestep, so a varying frame time
	// moved the force readings (a 30 fps frame read about 36% more lift than
	// a 60 fps one). The sim now always steps at SIM_DT, catching up with at
	// most two steps a frame.
	var SIM_DT = 1 / 60, simAccum = 0, dragFrom = null, rigFrom = null;
	LAB.SIM_DT = SIM_DT;

	function step(dt) {
		gl.disable(gl.BLEND);
		var p;

		buildMasks();

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

		var twoPhase = params.mode === 'twoPhase';

		if (twoPhase) {
			p = programs.gravity;
			gl.useProgram(p.handle);
			gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1f(p.uniforms.gravity, params.gravity);
			gl.uniform1f(p.uniforms.dt, dt);
			blit(velocity.write);
			velocity.swap();
		}

		p = programs.divergence;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
		gl.uniform1f(p.uniforms.topOpen, twoPhase ? 0 : 1);
		gl.uniform1f(p.uniforms.openFlow, twoPhase ? 0 : 1);
		gl.uniform1f(p.uniforms.inflow, params.flow);
		blit(divergenceFbo);

		p = programs.clear;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTexture, pressure.read.attach(0));
		// Linear mode keeps last frame's pressure as the starting guess: the
		// p = 0 top pins the solve, so there is no drift to bleed off, and
		// cutting it by a fifth each frame was costing about 40% of the lift.
		// Two-phase mode is closed on all sides, so it keeps the bleed.
		gl.uniform1f(p.uniforms.value, twoPhase ? 0.8 : 1.0);
		blit(pressure.write);
		pressure.swap();

		p = twoPhase ? programs.pressureVD : programs.pressure;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		if (!twoPhase) gl.uniform1f(p.uniforms.openFlow, 1);
		gl.uniform1i(p.uniforms.uDivergence, divergenceFbo.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		if (twoPhase) {
			gl.uniform1i(p.uniforms.uPhase, phase.read.attach(3));
			gl.uniform1f(p.uniforms.rhoAir, 1 / Math.max(1, params.rhoAirRatio));
		}
		var iters = LAB.iterationsOverride || params.iterations;
		for (var i = 0; i < iters; i++) {
			gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(1));
			blit(pressure.write);
			pressure.swap();
		}

		p = twoPhase ? programs.gradientVD : programs.gradient;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		if (!twoPhase) gl.uniform1f(p.uniforms.openFlow, 1);
		gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		if (twoPhase) {
			gl.uniform1i(p.uniforms.uPhase, phase.read.attach(3));
			gl.uniform1f(p.uniforms.rhoAir, 1 / Math.max(1, params.rhoAirRatio));
		}
		blit(velocity.write);
		velocity.swap();

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

		p = programs.flow;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1f(p.uniforms.flow, params.flow);
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
			var spdRef = Math.max(1, params.flow);
			gl.uniform1f(p.uniforms.mixLo, spdRef * 0.0);
			gl.uniform1f(p.uniforms.mixHi, spdRef * 0.02);
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

		// The phase field: same MacCormack machinery as the dye above, but
		// on its own textures at sim (not dye) resolution, always at full
		// correction strength (the interface is the whole point of this
		// mode, so it is not left to a slider that could be dialled to
		// zero), fixed sharpening afterward against numerical diffusion.
		if (twoPhase) {
			var q;
			q = programs.advection;
			gl.useProgram(q.handle);
			gl.uniform2f(q.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			if (dyeTex) gl.uniform2f(q.uniforms.dyeTexelSize, phase.texelSizeX, phase.texelSizeY);
			gl.uniform1i(q.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(q.uniforms.uSource, phase.read.attach(1));
			gl.uniform1i(q.uniforms.uObstacle, obstacleFbo.attach(2));
			gl.uniform1f(q.uniforms.blockDye, 0);
			gl.uniform1f(q.uniforms.dt, dt);
			gl.uniform1f(q.uniforms.dissipation, 0);
			blit(phaseHat);

			gl.uniform1i(q.uniforms.uSource, phaseHat.attach(1));
			gl.uniform1f(q.uniforms.dt, -dt);
			blit(phaseTilde);

			q = programs.maccormack;
			gl.useProgram(q.handle);
			gl.uniform2f(q.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
			gl.uniform2f(q.uniforms.dyeTexelSize, phase.texelSizeX, phase.texelSizeY);
			gl.uniform1i(q.uniforms.uVelocity, velocity.read.attach(0));
			gl.uniform1i(q.uniforms.uPhi, phase.read.attach(1));
			gl.uniform1i(q.uniforms.uPhiHat, phaseHat.attach(2));
			gl.uniform1i(q.uniforms.uPhiTilde, phaseTilde.attach(3));
			gl.uniform1i(q.uniforms.uObstacle, obstacleFbo.attach(4));
			gl.uniform1f(q.uniforms.dt, dt);
			gl.uniform1f(q.uniforms.dissipation, 0);
			gl.uniform1f(q.uniforms.strength, 1.0);
			gl.uniform1f(q.uniforms.mixLo, 0);
			gl.uniform1f(q.uniforms.mixHi, Math.max(1, params.flow) * 0.02);
			blit(phase.write);
			phase.swap();

			q = programs.phaseSharpen;
			gl.useProgram(q.handle);
			gl.uniform1i(q.uniforms.uPhase, phase.read.attach(0));
			gl.uniform1f(q.uniforms.rate, params.phaseSharpen);
			gl.uniform1f(q.uniforms.dt, dt);
			blit(phase.write);
			phase.swap();
		}
	}

	// ---- force measurement ------------------------------------------------
	//
	// Two independent meters, one per foil, each fed that foil's OWN mask so
	// they cannot see each other's pressure gradient. Both use the reference
	// solver's windowed-mean + fast-EMA pattern: `lift` is the number to
	// read, averaged over `window` seconds because a single frame of an
	// unsteady wake is not a measurement (a probe read 1.41 and 0.94 at
	// identical settings before this averaging was added).
	function makeMeter() {
		return { lift: 0, drag: 0, liftFast: 0, acc: null, ready: false, window: 2.0,
			cl: 0, cd: 0, cm: 0 };
	}
	var mainForce = makeMeter();
	var stabForce = makeMeter();
	LAB.mainForce = mainForce;
	LAB.stabForce = stabForce;

	var forceRead = new Float32Array(4);
	var forceByte = new Uint8Array(4);

	function buildSpeedField() {
		var p = programs.speed;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		blit(speedField.write);
		speedField.swap();

		var r = params.colourBlur * 0.25 * (0.75 + 0.25 * params.speedContrast) * (560 / params.simRes);
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

	// The sum over the grid of p * grad(mask), and of its moment about the
	// foil's leading edge, in solver units: pressure times cells.
	function sumFoilForce(maskFbo, origin) {
		var p = programs.force;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, forceFbo.texelSizeX, forceFbo.texelSizeY);
		gl.uniform1i(p.uniforms.uPressure, pressure.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, maskFbo.attach(1));
		gl.uniform2f(p.uniforms.simSize, LAB.simWidth, LAB.simHeight);
		gl.uniform2f(p.uniforms.originCells, origin[0] * LAB.simWidth, origin[1] * LAB.simHeight);
		blit(forceFbo);

		p = programs.reduce;
		gl.useProgram(p.handle);
		var src = forceFbo;
		for (var i = 0; i < reduceChain.length; i++) {
			gl.uniform1i(p.uniforms.uSrc, src.attach(0));
			gl.uniform2f(p.uniforms.srcSize, src.width, src.height);
			blit(reduceChain[i]);
			src = reduceChain[i];
		}

		var last = reduceChain[reduceChain.length - 1];
		gl.bindFramebuffer(gl.FRAMEBUFFER, last.fbo);
		var out;
		if (ext.isWebGL2 || ext.readFloat) {
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.FLOAT, forceRead);
			out = [forceRead[0], forceRead[1], forceRead[2]];
		} else {
			gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, forceByte);
			out = [(forceByte[0] / 255 - 0.5) * 2, (forceByte[1] / 255 - 0.5) * 2, 0];
		}
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return out;
	}

	// From solver units to coefficients. The gradient pass subtracts
	// (p_R - p_L) from a velocity measured in cells per second, so a solver
	// pressure p maps to a physical one of 2 rho dx^2 p / dt. Dividing by the
	// dynamic pressure 1/2 rho (flow dx)^2 and a chord of c cells, with the
	// sum already a line integral in cells, leaves C = 4 sum / (dt flow^2 c).
	// Lift is up, drag is downstream, and the moment is about the foil's own
	// leading edge, nose-up positive, per chord squared.
	function coefficients(raw, chordCells, dt) {
		var k = 4 / Math.max(1e-9, dt * params.flow * params.flow);
		var c = Math.max(1e-6, chordCells);
		return { cl: k * raw[1] / c, cd: k * raw[0] / c, cm: -k * raw[2] / (c * c) };
	}
	LAB.coefficients = coefficients;

	function measureFoilForce(maskFbo, origin, chord, meter, dt) {
		var raw = sumFoilForce(maskFbo, origin);
		if (!isFinite(raw[0]) || !isFinite(raw[1]) || !isFinite(raw[2])) return;
		var own = coefficients(raw, chord * LAB.simHeight, dt);
		// `lift` keeps its old meaning for the sweeps and the readout: both
		// foils on the main chord, so main and stabiliser add up directly.
		var onMain = coefficients(raw, params.mainChord * LAB.simHeight, dt);
		var fy = onMain.cl;

		meter.instFx = onMain.cd;
		meter.instFy = fy;
		meter.inst = own;

		var k = 1 - Math.exp(-dt / 0.35);
		meter.liftFast += (fy - meter.liftFast) * k;

		if (!meter.acc) meter.acc = { lift: 0, drag: 0, cl: 0, cd: 0, cm: 0, t: 0 };
		meter.acc.lift += fy * dt;
		meter.acc.drag += onMain.cd * dt;
		meter.acc.cl += own.cl * dt;
		meter.acc.cd += own.cd * dt;
		meter.acc.cm += own.cm * dt;
		meter.acc.t += dt;
		if (meter.acc.t >= meter.window) {
			var t = meter.acc.t;
			meter.lift = meter.acc.lift / t;
			meter.drag = meter.acc.drag / t;
			meter.cl = meter.acc.cl / t;
			meter.cd = meter.acc.cd / t;
			meter.cm = meter.acc.cm / t;
			meter.ready = true;
			meter.samples = (meter.samples || 0) + 1;
			meter.acc = null;
		}
	}

	function measureForces(dt) {
		measureFoilForce(mainMaskFbo, mainOriginXY(), params.mainChord, mainForce, dt);
		measureFoilForce(stabMaskFbo, stabOriginXY(), params.stabChord, stabForce, dt);
	}

	// Pitching moment about the assembly's own centre (midway between the
	// two leading edges, at their shared depth). Both foils sit at the same
	// depth by construction, so the vertical lever arm is zero and only the
	// horizontal offset times each foil's LIFT contributes: M = sum(dx * Fy).
	// A positive value here noses the assembly down (stabiliser's downforce
	// wins the lever), which is the sign a real T-foil wants at trim.
	function pitchMoment() {
		var refX = params.groupX + params.gap * 0.5;
		var mo = mainOriginXY(), so = stabOriginXY();
		return mainForce.lift * (mo[0] - refX) + stabForce.lift * (so[0] - refX);
	}
	LAB.pitchMoment = pitchMoment;

	// ---- depth sweep --------------------------------------------------------
	//
	// Step the whole assembly from deep to just under the surface, holding
	// each depth long enough for the wake to forget the last one and then
	// long enough again to average properly, and record the total lift. This
	// is the page's actual deliverable: a measured, monotonic depth-vs-lift
	// curve, built the same empirical way smoke-lab sweeps a sail's trim —
	// no polar curve, no lookup table, just the pressure the solver computed
	// on the shapes as drawn.
	var sweep = {
		running: false, from: 0, to: 0, step: 0,
		settle: 1.4, hold: 2.2, at: 0, phase: 0, timer: 0, results: [], restoreDepth: 0
	};
	LAB.sweep = sweep;

	function startDepthSweep() {
		sweep.running = true;
		sweep.from = params.sweepFrom;
		sweep.to = params.sweepTo;
		// Signed so the walk actually moves toward `to`: the default run is
		// deep (0.56) to shallow (0.035), i.e. DOWNWARD, and adding a bare
		// positive step there walked the wrong way and ended the sweep after
		// one sample the moment `at` first exceeded `to` in the wrong
		// direction.
		var mag = Math.abs(params.sweepStep) || 0.03;
		sweep.step = sweep.to < sweep.from ? -mag : mag;
		sweep.settle = params.sweepSettle;
		sweep.hold = params.sweepHold;
		sweep.at = sweep.from;
		sweep.phase = 0;
		sweep.timer = 0;
		sweep.results = [];
		sweep.restoreDepth = params.depth;
		params.depth = sweep.at;
		mainForce.acc = null;
		stabForce.acc = null;
		renderSweepTable([]);
		announce('Sweeping depth: deep to shallow...');
	}

	function sweepTick(dt) {
		if (!sweep.running) return;
		sweep.timer += dt;

		if (sweep.phase === 0) {
			if (sweep.timer >= sweep.settle) {
				sweep.phase = 1; sweep.timer = 0;
				mainForce.acc = null; stabForce.acc = null;
			}
			return;
		}
		if (sweep.timer < sweep.hold) return;

		sweep.results.push({
			depth: sweep.at,
			depthChords: sweep.at / Math.max(1e-6, params.mainChord),
			mainLift: mainForce.lift,
			stabLift: stabForce.lift,
			total: mainForce.lift + stabForce.lift,
			moment: pitchMoment()
		});
		renderSweepTable(sweep.results);

		sweep.at += sweep.step;
		sweep.timer = 0; sweep.phase = 0;
		mainForce.acc = null; stabForce.acc = null;

		var overshot = sweep.step < 0 ? (sweep.at < sweep.to - 1e-9) : (sweep.at > sweep.to + 1e-9);
		if (overshot) {
			sweep.running = false;
			params.depth = sweep.restoreDepth;
			refreshAllControls();

			var monotonic = true;
			for (var i = 1; i < sweep.results.length; i++) {
				// Results are pushed deep-first. A monotonically FALLING
				// lift as she comes up shallow means each row's mainLift
				// should be <= the previous (deeper) row's, within a small
				// numeric margin — wake noise on a fixed-iteration solve is
				// not exactly zero even after 2.2s of averaging. Flag it the
				// moment a shallower row reads a noticeably HIGHER lift than
				// the deeper row before it.
				if (sweep.results[i].mainLift > sweep.results[i - 1].mainLift + 0.01) {
					monotonic = false;
				}
			}
			LAB.sweepMonotonic = monotonic;

			var rows = sweep.results.map(function (r) {
				return '  depth ' + r.depth.toFixed(3) + ' (' + r.depthChords.toFixed(2) + 'c)  main ' +
					r.mainLift.toFixed(4) + '  stab ' + r.stabLift.toFixed(4) + '  total ' +
					r.total.toFixed(4) + '  moment ' + r.moment.toFixed(4);
			}).join('\n');
			console.log('depth sweep, deep to shallow:\n' + rows +
				'\nmain lift falls monotonically as she comes up: ' + monotonic);
			announce(monotonic
				? 'Sweep done. Lift falls as she comes up shallow, as it should.'
				: 'Sweep done. Lift did NOT fall monotonically — check the console.');
			renderSweepTable(sweep.results, monotonic);
			LAB.lastSweep = sweep.results.slice();
		} else {
			params.depth = sweep.at;
		}
	}

	function renderSweepTable(rows, monotonic) {
		var host = document.getElementById('sweep-table');
		if (!host) return;
		if (!rows || !rows.length) { host.innerHTML = '<p class="note">No sweep run yet.</p>'; return; }
		var html = '<table><thead><tr><th>depth</th><th>depth (chords)</th><th>main lift</th>' +
			'<th>stab lift</th><th>total</th><th>moment</th></tr></thead><tbody>';
		for (var i = 0; i < rows.length; i++) {
			var r = rows[i];
			html += '<tr><td>' + r.depth.toFixed(3) + '</td><td>' + r.depthChords.toFixed(2) + '</td><td>' +
				r.mainLift.toFixed(4) + '</td><td>' + r.stabLift.toFixed(4) + '</td><td>' +
				r.total.toFixed(4) + '</td><td>' + r.moment.toFixed(4) + '</td></tr>';
		}
		html += '</tbody></table>';
		if (typeof monotonic === 'boolean') {
			html += '<p class="note ' + (monotonic ? 'good' : 'bad') + '">' +
				(monotonic ? 'Lift falls monotonically toward the surface.' :
					'Lift did NOT fall monotonically — the free-surface boundary condition may be inverted.') +
				'</p>';
		}
		host.innerHTML = html;
	}

	// ---- depth-offset sweep --------------------------------------------------
	//
	// The group depth sweep above is the headline, but it cannot show the
	// case that only exists once the two foils are allowed to sit at
	// different depths: main and stabiliser feeling DIFFERENT amounts of
	// surface effect, and the balance between main lift and stabiliser
	// downforce shifting as a result. This holds the group at a fixed depth
	// and sweeps the relative offset between the two instead — negative
	// means the stabiliser is shallower (closer to the surface) than the
	// main foil, positive means it is deeper.
	var offsetSweep = {
		running: false, from: 0, to: 0, step: 0,
		settle: 1.4, hold: 2.2, at: 0, phase: 0, timer: 0, results: [],
		restoreDepth: 0, restoreMainOff: 0, restoreStabOff: 0
	};
	LAB.offsetSweep = offsetSweep;

	function startOffsetSweep() {
		offsetSweep.running = true;
		offsetSweep.from = params.offsetFrom;
		offsetSweep.to = params.offsetTo;
		var mag = Math.abs(params.offsetStep) || 0.02;
		offsetSweep.step = offsetSweep.to < offsetSweep.from ? -mag : mag;
		offsetSweep.settle = params.sweepSettle;
		offsetSweep.hold = params.sweepHold;
		offsetSweep.at = offsetSweep.from;
		offsetSweep.phase = 0;
		offsetSweep.timer = 0;
		offsetSweep.results = [];
		offsetSweep.restoreDepth = params.depth;
		offsetSweep.restoreMainOff = params.mainDepthOffset;
		offsetSweep.restoreStabOff = params.stabDepthOffset;
		params.depth = params.offsetGroupDepth;
		params.mainDepthOffset = 0;
		params.stabDepthOffset = offsetSweep.at;
		mainForce.acc = null;
		stabForce.acc = null;
		renderOffsetTable([]);
		announce('Sweeping the relative offset between the two foils...');
	}

	function offsetSweepTick(dt) {
		if (!offsetSweep.running) return;
		offsetSweep.timer += dt;

		if (offsetSweep.phase === 0) {
			if (offsetSweep.timer >= offsetSweep.settle) {
				offsetSweep.phase = 1; offsetSweep.timer = 0;
				mainForce.acc = null; stabForce.acc = null;
			}
			return;
		}
		if (offsetSweep.timer < offsetSweep.hold) return;

		offsetSweep.results.push({
			offset: offsetSweep.at,
			mainLift: mainForce.lift,
			stabLift: stabForce.lift,
			total: mainForce.lift + stabForce.lift,
			moment: pitchMoment()
		});
		renderOffsetTable(offsetSweep.results);

		offsetSweep.at += offsetSweep.step;
		offsetSweep.timer = 0; offsetSweep.phase = 0;
		mainForce.acc = null; stabForce.acc = null;

		var overshot = offsetSweep.step < 0
			? (offsetSweep.at < offsetSweep.to - 1e-9)
			: (offsetSweep.at > offsetSweep.to + 1e-9);
		if (overshot) {
			offsetSweep.running = false;
			params.depth = offsetSweep.restoreDepth;
			params.mainDepthOffset = offsetSweep.restoreMainOff;
			params.stabDepthOffset = offsetSweep.restoreStabOff;
			refreshAllControls();

			var rows = offsetSweep.results.map(function (r) {
				return '  offset ' + r.offset.toFixed(3) + '  main ' + r.mainLift.toFixed(4) +
					'  stab ' + r.stabLift.toFixed(4) + '  total ' + r.total.toFixed(4) +
					'  moment ' + r.moment.toFixed(4);
			}).join('\n');
			console.log('offset sweep, stabiliser relative to main (group depth ' +
				params.offsetGroupDepth.toFixed(3) + '):\n' + rows);
			announce('Offset sweep done — see the table for how the balance shifts.');
			renderOffsetTable(offsetSweep.results);
			LAB.lastOffsetSweep = offsetSweep.results.slice();
		} else {
			params.stabDepthOffset = offsetSweep.at;
		}
	}

	function renderOffsetTable(rows) {
		var host = document.getElementById('offset-table');
		if (!host) return;
		if (!rows || !rows.length) { host.innerHTML = '<p class="note">No sweep run yet.</p>'; return; }
		var html = '<table><thead><tr><th>stab offset</th><th>main lift</th>' +
			'<th>stab lift</th><th>total</th><th>moment</th></tr></thead><tbody>';
		for (var i = 0; i < rows.length; i++) {
			var r = rows[i];
			html += '<tr><td>' + r.offset.toFixed(3) + '</td><td>' +
				r.mainLift.toFixed(4) + '</td><td>' + r.stabLift.toFixed(4) + '</td><td>' +
				r.total.toFixed(4) + '</td><td>' + r.moment.toFixed(4) + '</td></tr>';
		}
		html += '</tbody></table>';
		host.innerHTML = html;
	}

	// ---- streak injection -----------------------------------------------------

	function inject(dt) {
		if (params.streaks <= 0.001) return;
		var n = Math.max(2, Math.round(params.streakCount));
		var r = 0.000012 * params.streakWidth * params.streakWidth;
		var amt = params.streaks * dt * 48;
		for (var i = 0; i < n; i++) {
			var y = (i + 0.5) / n;
			splat(dye, 0.010, y, amt, amt, r);
		}
	}

	// ---- pointer ----------------------------------------------------------
	//
	// Same interaction pattern as smoke-lab: plain drag moves the object
	// (there, the boat; here, the whole assembly, grabbed by its group
	// position and dragged anywhere in the domain with the two foils'
	// relative offsets and the gap between them left exactly as set).
	// Shift-drag pushes the water instead. Dragging the assembly also
	// counts as motion — see the `vel` uniform on FOIL_MASK_FRAG — so
	// hauling it across the domain genuinely shoves the water rather than
	// sliding through it like a ghost.

	var pointer = { down: false, push: false, x: 0, y: 0, dx: 0, dy: 0 };
	var groupVel = { x: 0, y: 0 };
	var dtHint = 0.016;

	function bindPointer() {
		function pos(e) {
			var t = e.touches ? e.touches[0] : e;
			return { x: t.clientX / canvas.clientWidth, y: 1 - t.clientY / canvas.clientHeight };
		}
		canvas.addEventListener('mousedown', function (e) {
			var q = pos(e); pointer.down = true; pointer.x = q.x; pointer.y = q.y;
			pointer.push = e.shiftKey;
			if (!pointer.push) {
				params.groupX = q.x;
				params.depth = Math.max(0.01, surfaceY() - q.y);
			}
		});
		window.addEventListener('mouseup', function () {
			pointer.down = false;
			groupVel.x = 0; groupVel.y = 0;
		});
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
				var newX = q.x;
				var newDepth = Math.max(0.01, surfaceY() - q.y);
				params.groupX = newX;
				params.depth = newDepth;
			}
		});
		window.addEventListener('keydown', function (e) {
			if (e.code === 'Space') { params.paused = !params.paused; e.preventDefault(); }
			if (e.code === 'KeyH') {
				var els = document.querySelectorAll('.panel');
				for (var i = 0; i < els.length; i++) {
					els[i].style.display = els[i].style.display === 'none' ? '' : 'none';
				}
			}
		});
	}

	// ---- controls -----------------------------------------------------------

	function bindControls() {
		function slider(id, key, fmt, hook) { return kit.slider(id, key, fmt, hook); }
		var one = function (v) { return (+v).toFixed(2); };
		var three = function (v) { return (+v).toFixed(3); };
		var deg = function (v) { return Math.round(v) + '°'; };

		slider('flow', 'flow', function (v) { return Math.round(v); });
		slider('curl', 'curl', function (v) { return Math.round(v); });
		slider('visc', 'viscosity', one);
		slider('iter', 'iterations', function (v) { return Math.round(v); });

		slider('depth', 'depth', three);
		slider('gap', 'gap', three);
		slider('moff', 'mainDepthOffset', three);
		slider('soff', 'stabDepthOffset', three);

		slider('mang', 'mainIncidence', deg);
		slider('mchord', 'mainChord', three);
		slider('mcamber', 'mainCamber', three);
		slider('mthick', 'mainThick', three);

		slider('sang', 'stabIncidence', deg);
		slider('schord', 'stabChord', three);
		slider('scamber', 'stabCamber', three);
		slider('sthick', 'stabThick', three);

		slider('rho', 'rhoAirRatio', function (v) { return Math.round(v) + ':1'; });
		slider('gravity', 'gravity', function (v) { return Math.round(v); });
		slider('surfacefrac', 'surfaceFrac', one);
		slider('sharpen', 'phaseSharpen', one);
		kit.cycle('b-mode', 'mode', ['linear', 'twoPhase'],
			function (v) { return v === 'linear' ? 'linear (Dirichlet)' : 'two-phase (VOF)'; },
			function () {
				// A fresh start on every mode switch: the two modes drive the
				// domain edges differently (open top vs. closed), and a flow
				// field built up under one would just be noise under the
				// other's different boundary condition.
				initPhase();
				clearAll();
				announce('Mode: ' + params.mode + '. Sim reset for the new boundary conditions.');
			});

		slider('streaks', 'streaks', one);
		slider('count', 'streakCount', function (v) { return Math.round(v); });
		slider('width', 'streakWidth', one);
		slider('fade', 'fade', one);
		slider('mac', 'maccormack', one);
		slider('speedscale', 'speedScale', one);
		slider('speedcontrast', 'speedContrast', one);
		slider('colourblur', 'colourBlur', one);

		kit.toggle('b-speed', 'colourSpeed');
		kit.toggle('b-vel', 'showVelocity', null, function (v) { return v ? 'show dye' : 'velocity field'; });

		document.getElementById('b-clear').addEventListener('click', clearAll);
		document.getElementById('b-reset').addEventListener('click', clearParams);
		document.getElementById('b-sweep').addEventListener('click', startDepthSweep);
		document.getElementById('b-sweep-offset').addEventListener('click', startOffsetSweep);
		document.getElementById('b-pause').addEventListener('click', function () {
			params.paused = !params.paused;
			this.className = params.paused ? 'on' : '';
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
		gl.uniform1i(p.uniforms.uTexture, pressure.read.attach(0));
		blit(pressure.write); pressure.swap();
		if (params.mode !== 'twoPhase') {
			p = programs.fill;
			gl.useProgram(p.handle);
			gl.uniform4f(p.uniforms.value, params.flow, 0, 0, 1);
			blit(velocity.write); velocity.swap();
		}
		initPhase();
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
			formatRGBA: isWebGL2 ? formatFor(gl.RGBA16F, gl.RGBA, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA },
			formatRG: isWebGL2 ? formatFor(gl.RG16F, gl.RG, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA },
			formatR: isWebGL2 ? formatFor(gl.R16F, gl.RED, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA }
		};
		if (isWebGL2) {
			ext.formatR32 = supportRenderTextureFormat(gl.R32F, gl.RED, gl.FLOAT) ? { internal: gl.R32F, format: gl.RED } : null;
			ext.formatRGBA32 = supportRenderTextureFormat(gl.RGBA32F, gl.RGBA, gl.FLOAT) ? { internal: gl.RGBA32F, format: gl.RGBA } : null;
		}

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
		programs.fill = program(FILL_FRAG);
		programs.splat = program(SPLAT_FRAG);
		programs.advection = program(prefix + ADVECTION_FRAG);
		programs.divergence = program(DIVERGENCE_FRAG);
		programs.curl = program(CURL_FRAG);
		programs.vorticity = program(VORTICITY_FRAG);
		programs.pressure = program(PRESSURE_FRAG);
		programs.gradient = program(GRADIENT_FRAG);
		programs.flow = program(FLOW_FRAG);
		programs.foilMask = program(FOIL_MASK_FRAG);
		programs.combineMask = program(COMBINE_MASK_FRAG);
		programs.force = program(FORCE_FRAG);
		programs.speed = program(SPEED_FRAG);
		programs.blur = program(BLUR_FRAG);
		programs.maccormack = program(prefix + MACCORMACK_FRAG);
		programs.reduce = program(REDUCE_FRAG);
		programs.display = program(DISPLAY_FRAG);
		programs.phaseInit = program(PHASE_INIT_FRAG);
		programs.phaseSharpen = program(PHASE_SHARPEN_FRAG);
		programs.gravity = program(GRAVITY_FRAG);
		programs.pressureVD = program(PRESSURE_VD_FRAG);
		programs.gradientVD = program(GRADIENT_VD_FRAG);
		for (var k in programs) {
			if (programs.hasOwnProperty(k)) gl.bindAttribLocation(programs[k].handle, 0, 'aPosition');
		}
	}

	function buildBuffers() {
		var filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
		var type = ext.halfFloatTexType;
		var sim = params.simRes, dyeRes = params.dyeRes;
		var aspect = canvas.width / canvas.height;
		var sw = Math.round(sim * Math.max(1, aspect)), sh = Math.round(sim * Math.max(1, 1 / aspect));
		var dw = Math.round(dyeRes * Math.max(1, aspect)), dh = Math.round(dyeRes * Math.max(1, 1 / aspect));

		dye = createDoubleFBO(dw, dh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dyeHat = createFBO(dw, dh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dyeTilde = createFBO(dw, dh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		velocity = createDoubleFBO(sw, sh, ext.formatRG.internal, ext.formatRG.format, type, filter);
		// Pressure and divergence in 32-bit floats where the GPU allows: the
		// forces are sums over the pressure, and half floats held it to about
		// three significant figures.
		var fr = ext.formatR32 || ext.formatR, ftype = ext.formatR32 ? gl.FLOAT : type;
		divergenceFbo = createFBO(sw, sh, fr.internal, fr.format, ftype, gl.NEAREST);
		curlFbo = createFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, gl.NEAREST);
		mainMaskFbo = createFBO(sw, sh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		stabMaskFbo = createFBO(sw, sh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		obstacleFbo = createFBO(sw, sh, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);

		// The force pass runs at the sim's own resolution and is summed by an
		// exact 2x2 chain down to one texel, in 32-bit floats where possible.
		var f4 = ext.formatRGBA32 || ext.formatRGBA, f4type = ext.formatRGBA32 ? gl.FLOAT : type;
		forceFbo = createFBO(sw, sh, f4.internal, f4.format, f4type, gl.NEAREST);
		speedField = createDoubleFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, filter);
		reduceChain = [];
		var rw = sw, rh = sh;
		while (rw > 1 || rh > 1) {
			rw = Math.max(1, Math.ceil(rw / 2)); rh = Math.max(1, Math.ceil(rh / 2));
			reduceChain.push(createFBO(rw, rh, f4.internal, f4.format, f4type, gl.NEAREST));
		}
		pressure = createDoubleFBO(sw, sh, fr.internal, fr.format, ftype, gl.NEAREST);

		// Two-phase mode's own fields, at sim resolution (not dye's, larger)
		// so phi lands on the exact same grid the pressure solve's face
		// weights are evaluated on. Allocated unconditionally — cheap, and
		// it means switching modes mid-session never has to rebuild.
		phase = createDoubleFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, filter);
		phaseHat = createFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, filter);
		phaseTilde = createFBO(sw, sh, ext.formatR.internal, ext.formatR.format, type, filter);

		LAB.simWidth = sw;
		LAB.simHeight = sh;
		// The mask measures chord in screen heights, so it spans chord x sh cells.
		LAB.cellsOnMainChord = params.mainChord * sh;

		initPhase();
	}

	// (Re)lays the flat initial water line into the phase field. Called on
	// every buffer rebuild and whenever two-phase mode is (re)entered from
	// a cold start, so switching modes never inherits a stale or empty
	// phase field from before the last resize.
	function initPhase() {
		if (!phase) return;
		var p = programs.phaseInit;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.surfaceFrac, params.surfaceFrac);
		blit(phase.read);
		blit(phase.write);
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

		// The dragged assembly's velocity, from how far it actually moved this
		// frame, so it stops pushing water the moment the mouse holds still.
		if (LAB.onFrame) LAB.onFrame(dt);

		var dragging = pointer.down && !pointer.push && !rig;
		if (rig && dt > 0) {
			// The rig moves itself: its velocity, from how far the mast base
			// moved this frame, is what the mask hands the water. A rig marked
			// `still` (calibration, which jumps between points) pushes nothing.
			var at = rigPoint(0, 0);
			if (rigFrom && !rig.still) { groupVel.x = (at[0] - rigFrom[0]) / dt; groupVel.y = (at[1] - rigFrom[1]) / dt; }
			else { groupVel.x = 0; groupVel.y = 0; }
			rigFrom = at;
		} else if (dragging && dragFrom && dt > 0) {
			groupVel.x = (params.groupX - dragFrom.x) / dt;
			groupVel.y = -(params.depth - dragFrom.depth) / dt;
		} else {
			groupVel.x = 0; groupVel.y = 0;
		}
		dragFrom = dragging ? { x: params.groupX, depth: params.depth } : null;
		if (!rig) rigFrom = null;

		if (!params.paused) {
			simAccum = Math.min(simAccum + dt, 2 * SIM_DT);
			var n = Math.min(2, Math.floor(simAccum / SIM_DT + 0.1));
			for (var i = 0; i < n; i++) {
				simTime += SIM_DT;
				inject(SIM_DT);
				step(SIM_DT);
				measureForces(SIM_DT);
				if (LAB.onStep) LAB.onStep(SIM_DT);
				sweepTick(SIM_DT);
				offsetSweepTick(SIM_DT);
			}
			simAccum = Math.max(0, simAccum - n * SIM_DT);
			buildSpeedField();
		}

		var p = programs.display;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTexture, dye.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform1f(p.uniforms.showVelocity, params.showVelocity ? 1 : 0);
		gl.uniform1f(p.uniforms.colourSpeed, params.colourSpeed ? 1 : 0);
		gl.uniform1f(p.uniforms.speedRef, params.flow * params.speedScale);
		gl.uniform1f(p.uniforms.speedContrast, params.speedContrast);
		gl.uniform1i(p.uniforms.uSpeed, speedField.read.attach(2));
		gl.uniform1f(p.uniforms.surfaceY, surfaceY());
		gl.uniform1f(p.uniforms.twoPhase, params.mode === 'twoPhase' ? 1 : 0);
		gl.uniform1i(p.uniforms.uPhase, phase.read.attach(3));
		setFoilUniforms(p);
		gl.uniform1f(p.uniforms.showRig, rig ? 1 : 0);
		if (rig) {
			var base = rigPoint(0, 0), fa = mainOriginXY(), fb = stabOriginXY();
			gl.uniform2f(p.uniforms.mastBase, base[0], base[1]);
			gl.uniform2f(p.uniforms.fuseA, fa[0], fa[1]);
			gl.uniform2f(p.uniforms.fuseB, fb[0], fb[1]);
			gl.uniform1f(p.uniforms.mastHalf, (rig.mastThick || 0.015) / rig.metresPerHeight * 0.5);
			gl.uniform1f(p.uniforms.vent, rig.vent || 0);
		}
		blit(null);

		if (mainForce.ready) {
			var elM = document.getElementById('r-main');
			if (elM) {
				elM.textContent = mainForce.lift.toFixed(4);
				elM.className = 'val ' + (mainForce.lift > 0 ? 'good' : 'bad');
			}
		}
		if (stabForce.ready) {
			var elS = document.getElementById('r-stab');
			if (elS) {
				elS.textContent = stabForce.lift.toFixed(4);
				elS.className = 'val ' + (stabForce.lift < 0 ? 'good' : 'bad');
			}
		}
		if (mainForce.ready && stabForce.ready) {
			var total = mainForce.lift + stabForce.lift;
			var elT = document.getElementById('r-total');
			if (elT) elT.textContent = total.toFixed(4);
			var elMo = document.getElementById('r-moment');
			if (elMo) elMo.textContent = pitchMoment().toFixed(4);
		}
		var elD = document.getElementById('r-depthchords');
		if (elD) elD.textContent = (params.depth / Math.max(1e-6, params.mainChord)).toFixed(2) + 'c';
		var elCells = document.getElementById('r-cells');
		if (elCells && LAB.cellsOnMainChord) {
			elCells.textContent = Math.round(LAB.cellsOnMainChord) + ' / ' +
				Math.round(params.stabChord * LAB.simHeight);
		}

		frames++; fpsTimer += dt;
		if (fpsTimer >= 0.5) {
			var fpsEl = document.getElementById('fps');
			if (fpsEl) fpsEl.textContent = Math.round(frames / fpsTimer) + ' fps';
			LAB.fps = Math.round(frames / fpsTimer);
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

	// ---- test hooks -----------------------------------------------------------

	LAB.startDepthSweep = startDepthSweep;
	LAB.startOffsetSweep = startOffsetSweep;
	LAB.clearAll = function () { clearAll(); };
	LAB.rebuildBuffersForTest = function () { buildBuffers(); };
	LAB.mainOriginXY = mainOriginXY;
	LAB.mainAngle = mainAngle;
	LAB.stabAngle = stabAngle;
	LAB.canvas = function () { return canvas; };
	LAB.stabOriginXY = stabOriginXY;
	LAB.debug = function () {
		return {
			gl: gl, ext: ext, canvas: canvas,
			simWidth: LAB.simWidth, simHeight: LAB.simHeight,
			cellsOnMainChord: LAB.cellsOnMainChord,
			cellsOnStabChord: params.stabChord * LAB.simHeight,
			mainForce: mainForce, stabForce: stabForce,
			sweep: sweep, offsetSweep: offsetSweep,
			groupVel: groupVel
		};
	};

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
	LAB.pressureDebugInfo = function () { return pressure ? fboStats(pressure.read) : null; };
	LAB.mainMaskDebugInfo = function () { return mainMaskFbo ? fboStats(mainMaskFbo) : null; };
	LAB.phaseDebugInfo = function () { return phase ? fboStats(phase.read) : null; };
})(window);
