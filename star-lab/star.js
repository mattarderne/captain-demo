// Star Fluid — a from-scratch reimplementation of JoTrdl/starfluid
// (github.com/JoTrdl/starfluid, "Star Fluid Experiment").
//
// The original pipeline, kept intact here, is four passes chained through
// render-to-texture:
//
//   MOTION    a Gaussian impulse dropped wherever a cursor is, this frame
//             only — not accumulated. xy = velocity kick, z = dye kick.
//   FLUID     one combined pass per source pixel: semi-Lagrangian advect,
//             a Laplacian viscosity term, and a scalar "z" channel that
//             stands in for pressure via a LINEAR equation of state
//             (dp = stiffness * d(density)) rather than the iterative
//             Jacobi projection smoke-lab uses. No pressure solve, no
//             iterations — one pass, cheap enough to leave the whole frame
//             budget for a quarter of a million points.
//   PARTICLES a 512x512 texture holding position/size/age for 262,144
//             particles, one texel each. Advected by sampling the fluid's
//             own velocity at each particle's own position; aged out and
//             parked off-screen at zero; refilled through a ring buffer
//             that writes one full row (512 texels) per emission, via
//             texSubImage2D straight into the currently-read half of the
//             ping-pong pair — the same trick the source uses.
//   VISUALIZE the "star" look: gold points, drawn additively so overlapping
//             ones brighten instead of overwriting, composited with a
//             cool dye field sampled through linear filtering so the
//             coarse solver grid comes out smooth rather than blocky.
//
// Two real departures from the source, both because the source is driven
// only by mouse *events* and this page has to look alive with nobody
// touching it:
//
//   1. An autoplay driver walks `orbitLobes` points around a rosette path
//      and calls the exact same per-frame impulse+emit routine the mouse
//      does. Dragging still works and simply adds another source.
//   2. Motion is drawn as N additive splats into one target rather than a
//      single point, because there can be several simultaneous sources
//      (autoplay lobes plus a live drag) where the source only ever had
//      one.
//
// Raw WebGL, no libraries, matching this project's house style. FBO/blit
// boilerplate is cribbed from smoke-lab/smoke.js (read, not modified).
(function (root) {
	'use strict';

	var LAB = root.STARLAB = {};

	// 1024 * 256 = 262144 = 512 * 512 exactly, so the position/age texture
	// is a perfect square with no wasted or overhanging texels.
	var PARTICLE_COUNT = 1024 * 256;
	var PDATA_SIDE = Math.ceil(Math.sqrt(PARTICLE_COUNT));
	// The source's PARTICLE_EMIT_RATE equals CELLS_PARTICLE_DATA, so every
	// emission call is exactly one full row of the ring buffer — never a
	// partial row, so the write is always a clean texSubImage2D at x=0.
	var EMIT_ROW = PDATA_SIDE;

	var params = {
		// -- the fluid --
		dt: 0.25,
		viscosity: 0.05,
		stiffness: 0.15,
		// Extra dials, not in the source, sitting at the values that
		// reproduce its equation exactly (damping 1 = no bleed, zSmooth 0 =
		// no extra smoothing of the z channel). The real stability fix
		// turned out to live in drawMotion() (see clearTarget()'s comment
		// near the top of this file) -- a stray unbound-program draw was
		// feeding the visualizer's own output back in as a bogus impulse
		// every frame, and THAT is what was driving the runaway a first
		// attempt at these two knobs tried and failed to control. With
		// that fixed, the field is stable at 262,144 particles and three
		// permanently-orbiting sources for 40+ seconds straight (soak-
		// tested headlessly) with both left at their faithful, off values.
		// They stay on the panel as a safety margin for anyone who pushes
		// stiffness or impulse gain hard.
		damping: 1.0,
		zSmooth: 0.0,
		simRes: 256,

		dyeAcc: 2.0,
		dyeDiffusion: 0.994,

		velRadius: 500,
		dyeRadius: 2000,
		impulseGain: 100,

		// -- particles --
		particleAge: 5.0,
		particleRadius: 0.025,
		particleSize: 0.7,
		particleDecay: 0.01,
		particleDensity: 1.0,
		driftGain: 2.0,

		// -- autoplay driver --
		autoplay: true,
		orbitLobes: 3,
		orbitSpeed: 0.35,
		orbitRadius: 0.28,
		autoDye: 0.6,

		// -- colour --
		dyeR: 0.30, dyeG: 0.50, dyeB: 1.10,
		particR: 1.00, particG: 0.50, particB: 0.166, particA: 0.66,

		showParticles: true,
		showDye: true,
		paused: false,

		// -- the rig, from shared/rig.js --
		// A solid obstacle dropped into the middle of the orbiting sources so
		// the particles and the dye have something to stream around. Off by
		// default: the source this lab reimplements never had an obstacle in
		// it at all, and the rig is a deliberate addition on top rather than
		// something this look was designed around.
		rigOn: false,
		rigX: 0.5,
		rigY: 0.5,
		rigSize: RIG.defaults.boatSize * 1.6,
		jibX: RIG.defaults.jibX,
		jibY: RIG.defaults.jibY,
		mainX: RIG.defaults.mainX,
		mainY: RIG.defaults.mainY,
		jibAngle: RIG.defaults.jibAngle,
		jibChord: RIG.defaults.jibChord,
		jibCamber: RIG.defaults.jibCamber,
		jibThick: RIG.defaults.jibThick,
		mainAngle: RIG.defaults.mainAngle,
		mainChord: RIG.defaults.mainChord,
		mainCamber: RIG.defaults.mainCamber,
		mainThick: RIG.defaults.mainThick
	};
	LAB.params = params;
	if (typeof location !== 'undefined' && location.search.indexOf('noauto') >= 0) params.autoplay = false;

	// Presets for the AIR, the PARTICLES and the LOOK only — never the
	// autoplay path, so picking one never yanks the camera-equivalent
	// (here, the orbit) out from under you mid-look. Same discipline
	// shared/labkit.js documents for smoke-lab's rig.
	var PRESETS = {
		'ember drift': {
			dt: 0.25, viscosity: 0.08, stiffness: 0.12, dyeAcc: 1.6, dyeDiffusion: 0.996,
			velRadius: 500, dyeRadius: 2000, impulseGain: 80,
			particleAge: 6.5, particleRadius: 0.020, particleSize: 0.6, particleDecay: 0.008,
			particleDensity: 0.85, driftGain: 1.6, autoDye: 0.4,
			dyeR: 0.35, dyeG: 0.22, dyeB: 0.12, particR: 1.0, particG: 0.45, particB: 0.12, particA: 0.6
		},
		'star storm': {
			dt: 0.30, viscosity: 0.03, stiffness: 0.22, dyeAcc: 2.6, dyeDiffusion: 0.990,
			velRadius: 420, dyeRadius: 1600, impulseGain: 160,
			particleAge: 3.5, particleRadius: 0.035, particleSize: 0.9, particleDecay: 0.018,
			particleDensity: 1.0, driftGain: 3.0, autoDye: 0.8,
			dyeR: 0.25, dyeG: 0.45, dyeB: 1.35, particR: 1.0, particG: 0.62, particB: 0.20, particA: 0.72
		},
		'quiet nebula': {
			dt: 0.20, viscosity: 0.14, stiffness: 0.09, dyeAcc: 1.2, dyeDiffusion: 0.998,
			velRadius: 650, dyeRadius: 2600, impulseGain: 55,
			particleAge: 9.0, particleRadius: 0.014, particleSize: 0.5, particleDecay: 0.005,
			particleDensity: 0.6, driftGain: 1.1, autoDye: 0.30,
			dyeR: 0.20, dyeG: 0.28, dyeB: 0.55, particR: 0.85, particG: 0.55, particB: 0.35, particA: 0.5
		}
	};

	var kit = LABKIT.create({
		store: 'starlab.params.v1',
		params: params,
		presets: PRESETS,
		defaultOpen: ['sec-air']
	});

	function saveParams() { kit.save(); }
	function loadParams() { kit.load(); }
	function clearParams() { kit.clear(); }
	function announce(t) { kit.announce(t); }
	function bindSections() { kit.bindSections(); }

	var gl, canvas, ext;
	var motionFbo, solver, dye, particleData, particlesTex, obstacleFbo, probeFbo;
	var programs = {};
	var quadBuffer, particleGeomBuffer;
	var bufferIndex = 0;
	var simW = 0, simH = 0;

	// ---- boilerplate, cribbed from smoke-lab/smoke.js (read, not edited) -----

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
		'varying vec2 vUv;',
		'void main() {',
		'  vUv = aPosition * 0.5 + 0.5;',
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
		gl.clearColor(0, 0, 0, 0);
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

	function blit(target, clear) {
		if (target == null) {
			gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
			gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		} else {
			gl.viewport(0, 0, target.width, target.height);
			gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
		}
		if (clear) { gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT); }
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
	}

	// Bind + clear only, no draw. blit()'s `clear` flag was meant for this
	// but blit() always issues the drawArrays too — and a "just clear"
	// call site (drawMotion's per-frame reset, below) has no reason to
	// have any particular program bound first. The result was a real bug,
	// not a cosmetic one: on frame 1 there was genuinely no program bound
	// yet, so that draw was rejected outright (the "no valid shader
	// program in use" warning every run logs), but from frame 2 onward
	// whatever program the PREVIOUS frame's LAST pass had left
	// bound — visualizer, or particles — was still current, so this
	// "clear" was actually re-running that shader against motionFbo with
	// whatever textures/uniforms it last had, every single frame. That
	// fed the visualizer's own output back into the fluid as a bogus
	// motion impulse — a genuine feedback loop — which is what a single,
	// tiny, one-off test impulse was found to double on almost every
	// frame regardless of any solver-side clamping: the corruption was
	// happening upstream of the physics entirely, not inside it.
	function clearTarget(target) {
		gl.viewport(0, 0, target.width, target.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
	}

	// ---- shaders ---------------------------------------------------------

	// The impulse. Read verbatim off shaders/motion.html: a Gaussian bump in
	// screen space (corrected for aspect so it stays round), scaled by the
	// pointer's own velocity. It is redrawn from nothing every call — there
	// is no persistent "wind", only whatever is actively being dragged
	// through the fluid this instant, which is why the fluid goes still the
	// moment nothing is moving through it.
	var MOTION_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform float ratio;',
		'uniform vec2 point;',
		'uniform float dye;',
		'uniform vec2 velocity;',
		'uniform float velRadius, dyeRadius, gain;',
		'void main() {',
		'  vec2 pos = vUv * vec2(ratio, 1.0);',
		'  vec2 rPoint = point * vec2(ratio, 1.0);',
		'  float gaussian = -dot(pos - rPoint, pos - rPoint);',
		'  gl_FragColor.xy = velocity * exp(gaussian * velRadius) * gain;',
		'  gl_FragColor.z = dye * exp(gaussian * dyeRadius);',
		'  gl_FragColor.w = 1.0;',
		'}'
	].join('\n');

	// The rig, rasterised into a mask once a frame, at the solver's own
	// resolution — same technique smoke-lab and vortex-lab use, just against
	// a single-pass solver instead of a Stam projection: every later pass
	// that needs to know where the solid is reads this instead of
	// re-evaluating the sections. Only the sails go in (r = 1 inside a
	// sail); the hull is drawn, in the visualizer pass below, but never
	// solid — a hull is in the water, not the air.
	//
	// The solver/dye grid here is always SQUARE (simW === simH, both set
	// from params.simRes) but the canvas usually is not, so — same as
	// MOTION_FRAG's `vUv * vec2(ratio, 1.0)` above — screen-space distances
	// need the aspect ratio folded in or the rig would read stretched
	// whenever the window isn't square.
	var MASK_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform float ratio;',
		'uniform vec2 point, heading, uJibOff, uMainOff;',
		'uniform float size, lee, rigOn;',
		'uniform vec4 uJib, uMain;',
		RIG.GLSL,
		'void main() {',
		'  if (rigOn < 0.5) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }',
		'  vec2 p = (vUv - point) * vec2(ratio, 1.0);',
		'  vec2 a = vec2(dot(p, heading), dot(p, vec2(-heading.y, heading.x)));',
		'  vec3 d = rigDist(a, size, uJibOff, uMainOff, uJib, uMain, lee);',
		'  gl_FragColor = vec4(step(min(d.y, d.z), 0.0), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// The solver. Off shaders/fluid.html's "fluid-solver", unchanged in
	// substance. FC.xy is velocity; FC.z is a scalar the source calls
	// nothing in particular but which behaves as an artificial density —
	// advected by the same continuity equation a compressible gas obeys,
	// then read back through a straight-line equation of state
	// (pressureGradient = stiffness/dt * gradient(z)) to push velocity away
	// from wherever it has piled up. That is the whole "pressure solve":
	// one algebraic term, no Jacobi iterations, which is what makes this
	// affordable at a quarter of a million particles riding on top of it.
	var FLUID_SOLVER_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D tSampler;',
		'uniform sampler2D motion;',
		'uniform sampler2D uObstacle;',
		'uniform float dt;',
		'uniform vec2 d;',
		'uniform float viscosity, stiffness, damping, zSmooth;',
		'vec2 dx2 = vec2(d.x, 0.0);',
		'vec2 dy2 = vec2(0.0, d.y);',
		'const float CentralScale = 0.5;',
		'bool isBoundary(vec2 uv) {',
		'  return (uv.x <= d.x || uv.x > (1.0 - d.x) || uv.y <= d.y || uv.y > (1.0 - d.y));',
		'}',
		'vec3 bilerp(sampler2D t, vec2 pos) {',
		'  vec3 x = texture2D(t, pos).xyz;',
		'  vec3 x0 = texture2D(t, pos - dx2).xyz;',
		'  vec3 x1 = texture2D(t, pos + dx2).xyz;',
		'  vec3 y0 = texture2D(t, pos - dy2).xyz;',
		'  vec3 y1 = texture2D(t, pos + dy2).xyz;',
		'  return (x + x0 + x1 + y0 + y1) * 0.2;',
		'}',
		'void main() {',
		'  vec2 dirs[4];',
		'  dirs[0] = vec2(1.0, 0.0); dirs[1] = vec2(0.0, -1.0);',
		'  dirs[2] = vec2(-1.0, 0.0); dirs[3] = vec2(0.0, 1.0);',
		'  vec4 FC = texture2D(tSampler, vUv);',
		'  vec3 FR = texture2D(tSampler, vUv + dx2).xyz;',
		'  vec3 FL = texture2D(tSampler, vUv - dx2).xyz;',
		'  vec3 FT = texture2D(tSampler, vUv + dy2).xyz;',
		'  vec3 FD = texture2D(tSampler, vUv - dy2).xyz;',
		// The rig, masked in once a frame (see MASK_FRAG). A solid neighbour
		// is a wall: zero velocity, not whatever the field happens to hold
		// there, and it reports THIS cell's own z back rather than its own —
		// the same zero-gradient/Neumann treatment smoke-lab's pressure pass
		// uses for exactly the same reason: a sharp step in z at the sail's
		// edge would otherwise feed PdX (below) a shock every frame.
		'  float oC = texture2D(uObstacle, vUv).x;',
		'  if (texture2D(uObstacle, vUv + dx2).x > 0.5) { FR.xy = vec2(0.0); FR.z = FC.z; }',
		'  if (texture2D(uObstacle, vUv - dx2).x > 0.5) { FL.xy = vec2(0.0); FL.z = FC.z; }',
		'  if (texture2D(uObstacle, vUv + dy2).x > 0.5) { FT.xy = vec2(0.0); FT.z = FC.z; }',
		'  if (texture2D(uObstacle, vUv - dy2).x > 0.5) { FD.xy = vec2(0.0); FD.z = FC.z; }',
		'  vec2 laplacian = FR.xy + FL.xy + FT.xy + FD.xy - 4.0 * FC.xy;',
		'  vec3 UdX = (FR - FL) * CentralScale;',
		'  vec3 UdY = (FT - FD) * CentralScale;',
		'  vec2 visc = viscosity * laplacian;',
		'  vec2 DdX = vec2(UdX.z, UdY.z);',
		'  vec2 PdX = (stiffness / max(dt, 1e-5)) * DdX;',
		// FC.z is hard-clamped to [0.3, 1.7] a few lines up, but nothing
		// stops it clamping into a near-discontinuity — a full 1.4 swing
		// across a single cell — and DdX is a raw, unscaled finite
		// difference of that (see the comment on CentralScale below), so a
		// shock in z reads back here as a huge PdX regardless of how calm
		// the velocity field otherwise is. That self-feeds: a sharp PdX
		// distorts velocity, which sharpens z further next step. Clamping
		// the symptom (velocity, below) was not enough on its own — the
		// field still sat pinned at that clamp indefinitely rather than
		// settling, because this term kept re-injecting energy every frame
		// regardless of how much velocity damping bled off. Clamping PdX
		// itself, at the source, is what actually breaks the feedback.
		'  PdX = clamp(PdX, vec2(-8.0), vec2(8.0));',
		'  vec3 temp = vec3(DdX, UdX.x + UdY.y);',
		'  FC.z = clamp(FC.z - dt * dot(FC.xyz, temp), 0.3, 1.7);',
		// Found only by reading the field back headlessly, not by eye: with
		// forcing repeated every frame indefinitely (autoplay, rather than
		// the source's sparse mouse events), z drives itself into a
		// standing shock — a hard step between 0.3 and 1.7 one cell wide —
		// that regenerates itself every frame through the PdX feedback
		// above no matter how much the velocity clamp or the damping below
		// bleeds off. It does not decay on its own even with every source
		// switched off, because the shock is self-sustaining once formed,
		// not left-over energy. A small Laplacian smoothing of z (previous
		// frame's neighbours, since this frame's are not yet written) is
		// the standard fix for this class of artificial-compressibility
		// scheme: it caps how sharp a step can get, which caps DdX, which
		// is what actually breaks the loop rather than clamping its output.
		'  FC.z += zSmooth * (FR.z + FL.z + FT.z + FD.z - 4.0 * FC.z);',
		'  FC.z = clamp(FC.z, 0.3, 1.7);',
		// This is the actual root cause, found by reading the velocity
		// field back frame-by-frame in Playwright with a single isolated
		// impulse and nothing else forcing it: a tiny seed (0.5) DOUBLED
		// on almost every frame — 0.5, 1.2, 2.3, 4.2, 8.0, 15.5, 30, then
		// pinned at whatever the output clamp happened to be. That is
		// unmistakably a multiplicative feedback, not leftover energy, and
		// it tracks exactly with |v| crossing 1/dt (~4 here): once the
		// semi-Lagrangian trace-back distance dt*v*d exceeds about one
		// texel, "was" stops sampling the smooth field AROUND the impulse
		// and starts sampling the impulse's OWN peak — so the next frame's
		// velocity is built partly from a copy of this frame's, which is
		// exactly the loop gain that produces doubling. The source has no
		// guard against this either; it just never trips it in practice
		// because real per-mouse-event forcing stays under that threshold.
		// Clamping the trace-back distance to a couple of texels is the
		// standard fix for semi-Lagrangian solvers generally (a CFL
		// limit), and it is what actually stops the growth rather than
		// bounding its output after the fact.
		'  vec2 disp = dt * FC.xy * d;',
		'  float dispLimit = 2.0 * max(d.x, d.y);',
		'  float dispLen = length(disp);',
		'  if (dispLen > dispLimit) disp *= dispLimit / dispLen;',
		'  vec2 was = vUv - disp;',
		'  FC.xy = bilerp(tSampler, was).xy;',
		'  FC.xy += dt * (visc - PdX + texture2D(motion, vUv).xy);',
		// The source forces this field only from sparse, human-paced mouse
		// events, so momentum bleeds off through the viscosity Laplacian
		// faster than it arrives and the field simply never runs away. This
		// lab drives it from an autoplay loop instead — several sources,
		// every single frame, indefinitely — which is a far more sustained
		// forcing regime than the source was ever exercised under, and
		// without a floor it visibly diverges within a few seconds (found
		// by reading the velocity field back in Playwright: avg |v| in the
		// tens of thousands, particles landing at uv (-16, -9)). A light
		// per-step multiplicative damping and a hard clamp cost nothing
		// when the field is calm and only bite once it starts running away.
		'  FC.xy *= damping;',
		'  FC.xy = clamp(FC.xy, vec2(-30.0), vec2(30.0));',
		'  for (int i = 0; i < 4; i++) {',
		'    if (isBoundary(vUv + d * dirs[i])) { FC.xy *= 1.0 - abs(dirs[i]); }',
		'  }',
		// Inside the sail the air simply IS the sail: hard zero, the same
		// choice smoke-lab's gradient pass makes for the same reason — a
		// lerp would leave a fraction of the old velocity behind every
		// frame and the flow would leak straight through.
		'  if (oC > 0.5) { FC.xy = vec2(0.0); }',
		'  gl_FragColor = FC;',
		'}'
	].join('\n');

	// Off shaders/fluid.html's "fluid-dye": a plain semi-Lagrangian advect
	// of a separate, purely visual scalar (z again, but a different z —
	// this texture's, not the solver's), carried by the solver's velocity
	// and topped up wherever the motion pass just injected dye.
	var FLUID_DYE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D tSampler;',
		'uniform sampler2D motion;',
		'uniform sampler2D solver;',
		'uniform sampler2D uObstacle;',
		'uniform float dt;',
		'uniform vec2 d;',
		'uniform float acc, diffusion;',
		'void main() {',
		'  vec2 was = vUv - dt * texture2D(solver, vUv).xy * d * acc;',
		'  gl_FragColor.xyz = texture2D(tSampler, was).xyz * diffusion;',
		'  gl_FragColor.z += texture2D(motion, vUv).z;',
		'  gl_FragColor.a = 1.0;',
		// A sail cannot hold dye — zeroed every frame at the solid cell
		// itself so nothing accumulates inside it, however it got there.
		'  if (texture2D(uObstacle, vUv).x > 0.5) gl_FragColor.xyz = vec3(0.0);',
		'}'
	].join('\n');

	// Off shaders/particles.html's "fragment-particle-data": each texel is
	// one particle (xy = position in the same 0..1 space the fluid lives
	// in, z = point size, w = age). Position is pushed along by sampling
	// the solver's velocity AT the particle's own position — not at the
	// texel's own uv, which is the whole trick that makes this a particle
	// system riding a grid rather than a second grid.
	var PARTICLE_DATA_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D tSampler;',
		'uniform sampler2D solver;',
		'uniform float dt;',
		'uniform vec2 d;',
		'uniform float decay, driftGain;',
		'void main() {',
		'  vec4 data = texture2D(tSampler, vUv);',
		'  data.xy += dt * texture2D(solver, data.xy).xy * d * driftGain;',
		'  if (data.a > 0.0) {',
		'    data.a -= decay;',
		'  } else {',
		'    data = vec4(-1.0);',
		'  }',
		'  gl_FragColor = data;',
		'}'
	].join('\n');

	// Off shaders/particles.html's "vertex-particles" / "fragment-particles".
	// One vertex per texel of the particle-data texture: aPosition here is
	// NOT a screen quad corner, it is that texel's own uv, used purely to
	// fetch this particle's data. A dead particle (age <= 0) was written as
	// vec4(-1): its xy lands at clip (-3,-3), off every edge, and its size
	// goes negative — clamped to zero below rather than left to whatever
	// the driver does with a negative gl_PointSize, which is undefined by
	// spec even if most drivers happen to just drop the point.
	var PARTICLE_VERT = [
		'precision highp float;',
		'attribute vec2 aPosition;',
		'varying float vAge;',
		'uniform sampler2D particleData;',
		'uniform float ratio, sizeScale;',
		'void main() {',
		'  vec4 data = texture2D(particleData, aPosition);',
		'  vec2 point = data.xy;',
		'  vAge = data.a;',
		'  gl_PointSize = max(0.0, data.z * ratio * sizeScale);',
		'  vec2 clip = point * 2.0 - 1.0;',
		'  gl_Position = vec4(clip, 0.0, 1.0);',
		'}'
	].join('\n');

	var PARTICLE_FRAG = [
		'precision highp float;',
		'varying float vAge;',
		'uniform vec4 particleColor;',
		'void main() {',
		'  if (vAge <= 0.0) discard;',
		'  gl_FragColor = particleColor;',
		'}'
	].join('\n');

	// Off shaders/visualizer.html's "fluid-visualizer": the whole "star"
	// look in one line. A cool dye field (LINEAR-sampled, so the coarse
	// solver grid comes out smooth) plus the particle raster, added rather
	// than blended, which is what lets a cluster of overlapping points
	// blow out to white instead of just tinting gold — the closest thing
	// this pipeline has to a bloom, and it costs nothing extra because
	// it's arithmetic already sitting in a shader that had to run anyway.
	// The rig, drawn last, from the same distance field MASK_FRAG treats as
	// solid — hull faint for context (and NOT solid: a hull is in the
	// water, not the air), sails drawn full and rimmed, same visual
	// treatment as every other lab's rig. With rigOn = 0 this whole block
	// is skipped and the pass is exactly what it always was.
	var VISUALIZER_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D dyeTex;',
		'uniform sampler2D particlesSampler;',
		'uniform vec4 dyeColor;',
		'uniform float showDye, showParticles;',
		'uniform float ratio, rigOn, size, lee;',
		'uniform vec2 point, heading, uJibOff, uMainOff;',
		'uniform vec4 uJib, uMain;',
		RIG.GLSL,
		'void main() {',
		'  float d = texture2D(dyeTex, vUv).z * showDye;',
		'  vec4 p = texture2D(particlesSampler, vUv) * showParticles;',
		'  vec3 c = d * dyeColor.rgb + p.rgb;',
		'  if (rigOn > 0.5) {',
		'    vec2 rp = (vUv - point) * vec2(ratio, 1.0);',
		'    vec2 ra = vec2(dot(rp, heading), dot(rp, vec2(-heading.y, heading.x)));',
		'    vec3 rd = rigDist(ra, size, uJibOff, uMainOff, uJib, uMain, lee);',
		'    float ed = size * 0.010;',
		'    c = mix(c, vec3(0.30, 0.30, 0.32), (1.0 - smoothstep(0.0, ed * 3.0, rd.x)) * 0.30);',
		'    c = mix(c, vec3(0.99, 0.96, 0.90), 1.0 - smoothstep(0.0, ed, rd.y));',
		'    c = mix(c, vec3(1.0, 0.99, 0.96), 1.0 - smoothstep(0.0, ed, rd.z));',
		'    float rim = min(rd.y, rd.z);',
		'    c = mix(c, vec3(0.12, 0.17, 0.24), (1.0 - smoothstep(ed, ed * 3.0, abs(rim))) * 0.75);',
		'  }',
		'  gl_FragColor = vec4(c, 1.0);',
		'}'
	].join('\n');

	// A single texel readback, always RGBA8/UNSIGNED_BYTE regardless of the
	// solver's own half-float storage — reading a HALF_FLOAT target with the
	// wrong readPixels type silently returns zeros on some drivers and looks
	// exactly like a dead solid, not an error (see vortex-lab/vortex.js's
	// own copy of this trick). velScale is generous headroom over the
	// fastest flow this solver's clamp allows (+/-30).
	var PROBE_FRAG = [
		'precision highp float;',
		'uniform sampler2D uVelocity;',
		'uniform vec2 point;',
		'uniform float velScale;',
		'void main() {',
		'  vec2 v = texture2D(uVelocity, point).xy;',
		'  vec2 enc = clamp(v / velScale * 0.5 + 0.5, 0.0, 1.0);',
		'  gl_FragColor = vec4(enc, 0.0, 1.0);',
		'}'
	].join('\n');
	var PROBE_VEL_SCALE = 32.0;

	function buildPrograms() {
		programs.motion = program(MOTION_FRAG);
		programs.mask = program(MASK_FRAG);
		programs.solver = program(FLUID_SOLVER_FRAG);
		programs.dye = program(FLUID_DYE_FRAG);
		programs.pdata = program(PARTICLE_DATA_FRAG);
		programs.particles = program(PARTICLE_FRAG, PARTICLE_VERT);
		programs.visualizer = program(VISUALIZER_FRAG);
		programs.probe = program(PROBE_FRAG);
		for (var k in programs) {
			if (programs.hasOwnProperty(k)) {
				// aPosition is attribute 0 everywhere, including the particle
				// program, where it means something completely different
				// (a data-texture uv, not a screen quad corner) but is bound
				// the same way so one blit() helper serves both.
				gl.bindAttribLocation(programs[k].handle, 0, 'aPosition');
			}
		}
	}

	// ---- particle geometry -----------------------------------------------
	// One vertex per texel of the PDATA_SIDE x PDATA_SIDE data texture,
	// laid out exactly like particles.js's VERTICES table.
	function buildParticleGeometry() {
		var verts = new Float32Array(PDATA_SIDE * PDATA_SIDE * 2);
		var i = 0;
		for (var n = 0; n < PDATA_SIDE * PDATA_SIDE; n++) {
			verts[i++] = (n % PDATA_SIDE) / PDATA_SIDE;
			verts[i++] = Math.floor(n / PDATA_SIDE) / PDATA_SIDE;
		}
		particleGeomBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, particleGeomBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
	}

	// ---- buffers -----------------------------------------------------------

	function buildBuffers() {
		var filter = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;
		var type = ext.halfFloatTexType;
		simW = params.simRes;
		simH = params.simRes;

		motionFbo = createFBO(simW, simH, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		solver = createDoubleFBO(simW, simH, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		dye = createDoubleFBO(simW, simH, ext.formatRGBA.internal, ext.formatRGBA.format, type, filter);
		// The rig's mask, at the solver's own resolution. NEAREST regardless
		// of what the fluid textures use: this is a binary in/out flag, and
		// filtering it would blur the wall the solver depends on into a soft
		// gradient instead of a hard edge.
		obstacleFbo = createFBO(simW, simH, ext.formatRGBA.internal, ext.formatRGBA.format, type, gl.NEAREST);
		// Deliberately plain RGBA8/UNSIGNED_BYTE, independent of whatever
		// half-float format the solver itself uses — see readVelocityAt().
		probeFbo = createFBO(1, 1, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.NEAREST);

		// Particle data is written to directly from JS (texSubImage2D), so
		// it has to be a plain gl.FLOAT texture matching a Float32Array
		// exactly — a half-float target here would silently corrupt every
		// emitted particle, since texSubImage2D does not convert for you.
		// NEAREST only: each particle samples its own single texel, and
		// filtering an age/position texture would blend positions of
		// unrelated particles together.
		particleData = createDoubleFBO(PDATA_SIDE, PDATA_SIDE,
			ext.particleInternal, ext.particleFormat, ext.particleType, gl.NEAREST);

		bufferIndex = 0;
		seedParticlesEmpty();
	}

	// Every particle starts dead (age <= 0), same as the source: nothing
	// exists until the ring buffer has written it in.
	function seedParticlesEmpty() {
		var blank = new Float32Array(PDATA_SIDE * PDATA_SIDE * 4);
		for (var i = 3; i < blank.length; i += 4) blank[i] = -1;
		for (var j = 0; j < blank.length; j += 4) { blank[j] = -1; blank[j + 1] = -1; blank[j + 2] = 0; }
		gl.bindTexture(gl.TEXTURE_2D, particleData.read.texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PDATA_SIDE, PDATA_SIDE, ext.particleFormat, ext.particleType, blank);
		gl.bindTexture(gl.TEXTURE_2D, particleData.write.texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, PDATA_SIDE, PDATA_SIDE, ext.particleFormat, ext.particleType, blank);
	}

	function buildCanvasTargets() {
		var filter = gl.LINEAR;
		particlesTex = createFBO(canvas.width, canvas.height, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, filter);
	}

	// ---- emission ----------------------------------------------------------
	// One full row (EMIT_ROW = PDATA_SIDE texels) written per call, exactly
	// as particles.js's mousemove handler does — the ring buffer's x
	// coordinate is therefore always 0, and only the row advances.
	var emitBuf = new Float32Array(EMIT_ROW * 4);

	function emitRow(cx, cy, vx, vy, dyeAmt) {
		var n = Math.max(0, Math.min(EMIT_ROW, Math.round(EMIT_ROW * params.particleDensity)));
		var i = 0, p = 0;
		for (; p < n; p++) {
			var angle = Math.random() * Math.PI * 2;
			var r = Math.random() * params.particleRadius;
			emitBuf[i++] = cx + Math.cos(angle) * r;
			emitBuf[i++] = cy + Math.sin(angle) * r * aspectRatio();
			emitBuf[i++] = params.particleSize;
			emitBuf[i++] = Math.random() * params.particleAge;
		}
		for (; p < EMIT_ROW; p++) {
			emitBuf[i++] = -1; emitBuf[i++] = -1; emitBuf[i++] = 0; emitBuf[i++] = -1;
		}
		var y = (bufferIndex / EMIT_ROW) | 0;
		gl.bindTexture(gl.TEXTURE_2D, particleData.read.texture);
		gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, y, EMIT_ROW, 1, ext.particleFormat, ext.particleType, emitBuf);
		bufferIndex = (bufferIndex + EMIT_ROW) % PARTICLE_COUNT;

		// The kick that goes with it: fed into the same additive motion
		// pass every other source uses, so an emitting point also shoves
		// the fluid, the way dragging in the source both paints dye and
		// pushes the field.
		motionSources.push({ x: cx, y: cy, vx: vx, vy: vy, dye: dyeAmt });
	}

	function aspectRatio() { return canvas.width / canvas.height; }

	// ---- autoplay driver -----------------------------------------------------
	// Walks `orbitLobes` points around a rosette so the fluid stays alive
	// with nobody at the mouse. Each lobe is just another call into the
	// exact same emitRow()/motion-source path a real drag would use.
	var orbitT = 0;
	var orbitLast = [];

	function stepAutoplay(dt) {
		if (!params.autoplay) return;
		orbitT += dt * params.orbitSpeed;
		var lobes = Math.max(1, Math.round(params.orbitLobes));
		for (var i = 0; i < lobes; i++) {
			var phase = orbitT + (i * Math.PI * 2) / lobes;
			// A rose-ish curve: a slow rotation modulated by a faster inner
			// wobble, so the lobes trace loops rather than a plain circle.
			var rad = params.orbitRadius * (0.72 + 0.28 * Math.sin(phase * 2.3 + i));
			var cx = 0.5 + Math.cos(phase) * rad;
			var cy = 0.5 + Math.sin(phase * 1.0) * rad * 0.85;
			var prev = orbitLast[i];
			// The source's own mousemove handler feeds the motion shader a
			// raw PER-EVENT pixel delta (mouseX - oldMouseX, normalised by
			// canvas width) — never divided by a timestep to make it a
			// rate. velRadius/gain are calibrated against that convention.
			// Dividing by dt here first (an actual per-second rate) came
			// out roughly 60x too strong at 60fps and blew the solver up
			// within a couple of seconds — caught by reading the velocity
			// field back in Playwright and seeing it pinned at the clamp.
			// A frame-to-frame delta, not a rate, is the fix; the small
			// multiplier brings a slow autoplay lobe up to about what a
			// real drag's per-event delta looks like.
			var vx = prev ? (cx - prev.x) * 3.0 : 0;
			var vy = prev ? (cy - prev.y) * 3.0 : 0;
			orbitLast[i] = { x: cx, y: cy };
			emitRow(cx, cy, vx, vy, params.autoDye);
		}
	}

	// ---- pointer -------------------------------------------------------------

	var pointer = { down: false, x: 0.5, y: 0.5, lastX: 0.5, lastY: 0.5 };

	function bindPointer() {
		function pos(e) {
			var t = e.touches ? e.touches[0] : e;
			var r = canvas.getBoundingClientRect();
			return { x: (t.clientX - r.left) / r.width, y: 1 - (t.clientY - r.top) / r.height };
		}
		canvas.addEventListener('mousedown', function (e) {
			var q = pos(e);
			pointer.down = true; pointer.x = q.x; pointer.y = q.y; pointer.lastX = q.x; pointer.lastY = q.y;
		});
		window.addEventListener('mouseup', function () { pointer.down = false; });
		window.addEventListener('mousemove', function (e) {
			if (!pointer.down) return;
			var q = pos(e);
			pointer.lastX = pointer.x; pointer.lastY = pointer.y;
			pointer.x = q.x; pointer.y = q.y;
		});
		canvas.addEventListener('touchstart', function (e) {
			var q = pos(e);
			pointer.down = true; pointer.x = q.x; pointer.y = q.y; pointer.lastX = q.x; pointer.lastY = q.y;
			e.preventDefault();
		}, { passive: false });
		canvas.addEventListener('touchmove', function (e) {
			var q = pos(e);
			pointer.lastX = pointer.x; pointer.lastY = pointer.y;
			pointer.x = q.x; pointer.y = q.y;
			e.preventDefault();
		}, { passive: false });
		window.addEventListener('touchend', function () { pointer.down = false; });
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

	function stepPointer(dt) {
		if (!pointer.down) return;
		// A raw per-frame delta, matching particles.js's own mousemove
		// handler (du = mouseX - oldMouseX, normalised by width — never
		// divided by a timestep). See the comment in stepAutoplay for why
		// that distinction matters here.
		var dx = pointer.x - pointer.lastX;
		var dy = pointer.y - pointer.lastY;
		emitRow(pointer.x, pointer.y, dx, dy, 1.0);
	}

	// ---- the rig ------------------------------------------------------------

	var DEG = Math.PI / 180;

	// Static here too, same as vortex-lab: nothing sails this one, so it
	// always stands heading straight along +x with its sails set on the
	// starboard tack, and each trim slider reads directly as that sail's own
	// angle of attack.
	function setRigTrimUniforms(p) {
		gl.uniform2f(p.uniforms.uJibOff, params.jibX, params.jibY);
		gl.uniform2f(p.uniforms.uMainOff, params.mainX, params.mainY);
		gl.uniform4f(p.uniforms.uJib, params.jibAngle * DEG, params.jibChord,
			params.jibCamber, params.jibThick);
		gl.uniform4f(p.uniforms.uMain, params.mainAngle * DEG, params.mainChord,
			params.mainCamber, params.mainThick);
	}

	function drawMask() {
		var p = programs.mask;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.ratio, aspectRatio());
		gl.uniform2f(p.uniforms.point, params.rigX, params.rigY);
		gl.uniform2f(p.uniforms.heading, 1.0, 0.0);
		gl.uniform1f(p.uniforms.size, params.rigSize);
		gl.uniform1f(p.uniforms.lee, 1.0);
		gl.uniform1f(p.uniforms.rigOn, params.rigOn ? 1.0 : 0.0);
		setRigTrimUniforms(p);
		blit(obstacleFbo);
	}

	function readVelocityAt(u, v) {
		var p = programs.probe;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, solver.read.attach(0));
		gl.uniform2f(p.uniforms.point, u, v);
		gl.uniform1f(p.uniforms.velScale, PROBE_VEL_SCALE);
		blit(probeFbo);
		gl.bindFramebuffer(gl.FRAMEBUFFER, probeFbo.fbo);
		var px = new Uint8Array(4);
		gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return {
			x: (px[0] / 255 * 2 - 1) * PROBE_VEL_SCALE,
			y: (px[1] / 255 * 2 - 1) * PROBE_VEL_SCALE
		};
	}
	LAB.readVelocityAt = readVelocityAt;

	// ---- the frame ------------------------------------------------------------

	var motionSources = [];
	var lastTime = 0, frames = 0, fpsTimer = 0;

	function drawMotion() {
		clearTarget(motionFbo);
		if (!motionSources.length) return;
		var p = programs.motion;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.ratio, aspectRatio());
		gl.uniform1f(p.uniforms.velRadius, params.velRadius);
		gl.uniform1f(p.uniforms.dyeRadius, params.dyeRadius);
		gl.uniform1f(p.uniforms.gain, params.impulseGain);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.ONE, gl.ONE);
		for (var i = 0; i < motionSources.length; i++) {
			var s = motionSources[i];
			gl.uniform2f(p.uniforms.point, s.x, s.y);
			gl.uniform2f(p.uniforms.velocity, s.vx, s.vy);
			gl.uniform1f(p.uniforms.dye, s.dye);
			blit(motionFbo, false);
		}
		gl.disable(gl.BLEND);
		motionSources.length = 0;
	}

	function stepSolver(dt) {
		var p = programs.solver;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.d, 1 / simW, 1 / simH);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.viscosity, params.viscosity);
		gl.uniform1f(p.uniforms.stiffness, params.stiffness);
		gl.uniform1f(p.uniforms.damping, params.damping);
		gl.uniform1f(p.uniforms.zSmooth, params.zSmooth);
		gl.uniform1i(p.uniforms.tSampler, solver.read.attach(0));
		gl.uniform1i(p.uniforms.motion, motionFbo.attach(1));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		blit(solver.write);
		solver.swap();
	}

	function stepDye(dt) {
		var p = programs.dye;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.d, 1 / simW, 1 / simH);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.acc, params.dyeAcc);
		gl.uniform1f(p.uniforms.diffusion, params.dyeDiffusion);
		gl.uniform1i(p.uniforms.tSampler, dye.read.attach(0));
		gl.uniform1i(p.uniforms.motion, motionFbo.attach(1));
		gl.uniform1i(p.uniforms.solver, solver.read.attach(2));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(3));
		blit(dye.write);
		dye.swap();
	}

	function stepParticleData(dt) {
		var p = programs.pdata;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.d, 1 / simW, 1 / simH);
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.decay, params.particleDecay);
		gl.uniform1f(p.uniforms.driftGain, params.driftGain);
		gl.uniform1i(p.uniforms.tSampler, particleData.read.attach(0));
		gl.uniform1i(p.uniforms.solver, solver.read.attach(1));
		blit(particleData.write);
		particleData.swap();
	}

	function drawParticles() {
		var p = programs.particles;
		gl.useProgram(p.handle);
		gl.bindBuffer(gl.ARRAY_BUFFER, particleGeomBuffer);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
		// Matches particles.js's own `ratio` uniform (aspect = width/height),
		// with a devicePixelRatio correction the source never needed: it
		// sizes its canvas straight from window.innerWidth with no DPR
		// scaling, so its backing store and its CSS pixels are the same
		// thing. Ours are not — resize() scales the backing store up to
		// 1.5x for sharpness — so gl_PointSize (always in backing-store
		// pixels) is corrected back up or the points shrink on any retina
		// display relative to how they read in the original.
		var dpr = canvas.width / canvas.clientWidth;
		gl.uniform1f(p.uniforms.ratio, aspectRatio() * dpr);
		gl.uniform1f(p.uniforms.sizeScale, 1.0);
		gl.uniform1i(p.uniforms.particleData, particleData.read.attach(0));
		gl.uniform4f(p.uniforms.particleColor, params.particR, params.particG, params.particB, params.particA);

		gl.viewport(0, 0, particlesTex.width, particlesTex.height);
		gl.bindFramebuffer(gl.FRAMEBUFFER, particlesTex.fbo);
		gl.clearColor(0, 0, 0, 0);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
		gl.drawArrays(gl.POINTS, 0, PDATA_SIDE * PDATA_SIDE);
		gl.disable(gl.BLEND);

		// Back to the shared quad for every subsequent blit() call.
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
	}

	function drawVisualizer() {
		var p = programs.visualizer;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.dyeTex, dye.read.attach(0));
		gl.uniform1i(p.uniforms.particlesSampler, particlesTex.attach(1));
		gl.uniform4f(p.uniforms.dyeColor, params.dyeR, params.dyeG, params.dyeB, 1.0);
		gl.uniform1f(p.uniforms.showDye, params.showDye ? 1 : 0);
		gl.uniform1f(p.uniforms.showParticles, params.showParticles ? 1 : 0);
		gl.uniform1f(p.uniforms.ratio, aspectRatio());
		gl.uniform2f(p.uniforms.point, params.rigX, params.rigY);
		gl.uniform2f(p.uniforms.heading, 1.0, 0.0);
		gl.uniform1f(p.uniforms.size, params.rigSize);
		gl.uniform1f(p.uniforms.lee, 1.0);
		gl.uniform1f(p.uniforms.rigOn, params.rigOn ? 1.0 : 0.0);
		setRigTrimUniforms(p);
		gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		gl.clearColor(0, 0, 0, 1);
		gl.clear(gl.COLOR_BUFFER_BIT);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
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

		if (resize()) buildCanvasTargets();

		if (!params.paused) {
			var simDt = params.dt * Math.min(dt / 0.016, 2.0);
			drawMask();
			stepAutoplay(dt);
			stepPointer(dt);
			drawMotion();
			stepSolver(simDt);
			stepDye(simDt);
			stepParticleData(simDt);
			drawParticles();
		}
		drawVisualizer();

		frames++; fpsTimer += dt;
		if (fpsTimer >= 0.5) {
			var el = document.getElementById('fps');
			if (el) el.textContent = Math.round(frames / fpsTimer) + ' fps';
			frames = 0; fpsTimer = 0;
		}
	}

	// ---- controls --------------------------------------------------------

	function bindControls() {
		function slider(id, key, fmt, hook) { return kit.slider(id, key, fmt, hook); }
		var one = function (v) { return (+v).toFixed(2); };
		var three = function (v) { return (+v).toFixed(3); };
		var whole = function (v) { return Math.round(v); };

		slider('dt', 'dt', three);
		slider('visc', 'viscosity', three);
		slider('stiff', 'stiffness', three);
		slider('damp', 'damping', function (v) { return (+v).toFixed(3); });
		slider('zsmooth', 'zSmooth', function (v) { return (+v).toFixed(2); });
		slider('dyeacc', 'dyeAcc', one);
		slider('dyediff', 'dyeDiffusion', function (v) { return (+v).toFixed(3); });
		slider('velrad', 'velRadius', whole);
		slider('dyerad', 'dyeRadius', whole);
		slider('gain', 'impulseGain', whole);

		slider('page', 'particleAge', one);
		slider('prad', 'particleRadius', three);
		slider('psize', 'particleSize', one);
		slider('pdecay', 'particleDecay', three);
		slider('pdensity', 'particleDensity', one);
		slider('drift', 'driftGain', one);

		slider('orbitlobes', 'orbitLobes', whole);
		slider('orbitspeed', 'orbitSpeed', one);
		slider('orbitradius', 'orbitRadius', one);
		slider('autodye', 'autoDye', one);

		slider('dyer', 'dyeR', one);
		slider('dyeg', 'dyeG', one);
		slider('dyeb', 'dyeB', one);
		slider('particr', 'particR', one);
		slider('particg', 'particG', one);
		slider('particb', 'particB', one);
		slider('parta', 'particA', one);

		kit.toggle('b-rig', 'rigOn', null, function (v) { return v ? 'rig on' : 'rig off'; });
		slider('rigx', 'rigX', three);
		slider('rigy', 'rigY', three);
		slider('rigsize', 'rigSize', three);
		slider('jang', 'jibAngle', whole);
		slider('jx', 'jibX', one);
		slider('jy', 'jibY', one);
		slider('jchord', 'jibChord', one);
		slider('jcamber', 'jibCamber', one);
		slider('jthick', 'jibThick', one);
		slider('mang', 'mainAngle', whole);
		slider('mx', 'mainX', one);
		slider('my', 'mainY', one);
		slider('mchord', 'mainChord', one);
		slider('mcamber', 'mainCamber', one);
		slider('mthick', 'mainThick', one);

		kit.toggle('b-autoplay', 'autoplay');
		kit.toggle('b-dye', 'showDye');
		kit.toggle('b-particles', 'showParticles');
		kit.toggle('b-pause', 'paused');

		document.getElementById('b-clear').addEventListener('click', function () {
			bufferIndex = 0;
			seedParticlesEmpty();
			// Both halves of every ping-ponged pair, since whichever one is
			// currently "read" becomes next frame's input regardless of
			// which is visibly "current" right now.
			clearTarget(solver.read); clearTarget(solver.write);
			clearTarget(dye.read); clearTarget(dye.write);
			clearTarget(motionFbo);
			orbitLast.length = 0;
			announce('Cleared.');
		});
		document.getElementById('b-reset').addEventListener('click', clearParams);
		kit.buildPresetBar('preset-bar');
		document.getElementById('b-copy').addEventListener('click', function () {
			var text = kit.settingsBlock();
			console.log(text);
			if (navigator.clipboard) navigator.clipboard.writeText(text);
			announce('Settings copied to the clipboard, and printed to the console.');
		});
	}

	// ---- boot --------------------------------------------------------------

	function initGL() {
		var opts = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
		gl = canvas.getContext('webgl2', opts);
		var isWebGL2 = !!gl;
		if (!gl) gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
		if (!gl) throw new Error('This browser has no WebGL at all.');

		var halfFloat, supportLinearFiltering, floatExt;
		if (isWebGL2) {
			gl.getExtension('EXT_color_buffer_float');
			supportLinearFiltering = !!gl.getExtension('OES_texture_float_linear');
		} else {
			halfFloat = gl.getExtension('OES_texture_half_float');
			supportLinearFiltering = !!gl.getExtension('OES_texture_half_float_linear');
			floatExt = gl.getExtension('OES_texture_float');
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
				return { internal: gl.RGBA16F, format: gl.RGBA };
			}
			return { internal: internal, format: format };
		}

		ext = {
			isWebGL2: isWebGL2,
			halfFloatTexType: halfFloatTexType,
			supportLinearFiltering: supportLinearFiltering,
			formatRGBA: isWebGL2 ? formatFor(gl.RGBA16F, gl.RGBA, halfFloatTexType) : { internal: gl.RGBA, format: gl.RGBA }
		};

		// Particle data is written from JS via texSubImage2D, so its type
		// has to be a real gl.FLOAT matching the Float32Array we upload —
		// HALF_FLOAT would need the data pre-packed into 16-bit halves, and
		// silently reading it back with the wrong type is exactly the kind
		// of thing that returns all-zero and looks like a dead sim rather
		// than an error.
		if (isWebGL2 || floatExt) {
			ext.particleInternal = isWebGL2 ? gl.RGBA32F : gl.RGBA;
			ext.particleFormat = gl.RGBA;
			ext.particleType = gl.FLOAT;
			if (isWebGL2 && !supportRenderTextureFormat(gl.RGBA32F, gl.RGBA, gl.FLOAT)) {
				throw new Error('This GPU cannot render to a float texture (EXT_color_buffer_float missing).');
			}
		} else {
			throw new Error('This browser has neither WebGL2 nor OES_texture_float — the particle system needs float textures.');
		}

		gl.clearColor(0, 0, 0, 1);

		quadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
	}

	LAB.boot = function () {
		canvas = document.getElementById('gl');
		try {
			loadParams();
			resize();
			initGL();
			buildPrograms();
			buildParticleGeometry();
			buildBuffers();
			buildCanvasTargets();
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

	LAB.debug = function () {
		return {
			gl: gl, ext: ext, canvas: canvas,
			solver: solver, dye: dye, particleData: particleData, particlesTex: particlesTex,
			obstacleFbo: obstacleFbo, simW: simW, simH: simH,
			bufferIndex: bufferIndex, particleCount: PARTICLE_COUNT, pdataSide: PDATA_SIDE,
			readVelocityAt: readVelocityAt
		};
	};

	Object.defineProperty(LAB, 'particleCount', { get: function () { return PARTICLE_COUNT; } });
	Object.defineProperty(LAB, 'pdataSide', { get: function () { return PDATA_SIDE; } });
	Object.defineProperty(LAB, 'bufferIndex', { get: function () { return bufferIndex; } });
	Object.defineProperty(LAB, 'maskFbo', { get: function () { return obstacleFbo; } });
})(window);
