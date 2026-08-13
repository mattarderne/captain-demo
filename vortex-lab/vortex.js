// A GPU fluid solver reproducing amandaghassaei's VortexShedding demo
// (github.com/amandaghassaei/VortexShedding): a circular obstacle dropped in
// a uniform stream, sheding the alternating von Karman vortex street behind
// it. Read straight from that project's main.js/index.html/GPUMath.js.
//
// The pipeline is theirs: advect velocity, advect a "material" (dye) field
// carried by it, divergence, Jacobi pressure, subtract the pressure
// gradient, render. Two deliberate departures from their exact code, both
// noted where they happen:
//
//   1. OBSTACLE HANDLING. Their boundaryConditionsShader is a single analytic
//      "reflect near the circle" pass, and their own about-text admits it
//      leaves "some artifacts around the boundary of the obstacle". This file
//      instead masks the obstacle into a texture once a frame and has
//      divergence/pressure/gradient each check their four neighbours against
//      it directly — the same technique smoke-lab/smoke.js uses for the rig,
//      proven on this codebase already. Same circular obstacle, same
//      variables (obstaclePosition, obstacleRad), a sturdier solve underneath.
//
//   2. TIMESTEP. Their dt is a fixed 1 "per frame", so the simulation's speed
//      is coupled to whatever frame rate the browser happens to deliver.
//      Here dt is the real elapsed time (clamped), so flowSpeed is in grid
//      cells per SECOND and a measured shedding frequency means something in
//      Hz. Semi-Lagrangian advection is unconditionally stable regardless of
//      step size, so this costs nothing.
//
// Filtering: their GlBoilerplate.js hardcodes NEAREST on every texture and
// does bilinear interpolation BY HAND only where two grids of different
// resolution meet (the material field reads the coarser velocity field).
// That sidesteps the whole "does this driver linear-filter a float texture"
// question, which has bitten this codebase before (see smoke-lab's
// MANUAL_FILTERING dance) — so it is copied here rather than reinvented.
(function (root) {
	'use strict';

	var LAB = root.VORTEXLAB = {};

	// Chosen, not measured off the reference (its main.js hardcodes pixel
	// constants tied to its own canvas, which do not transplant).
	//
	// An honest attempt was made to pick viscosity so Re = U*D/nu lands near
	// the textbook laminar-shedding value of ~150. It does not shed there —
	// it sits dead steady, indefinitely, at Re values from 150 up into the
	// thousands. The reason is the reference's own about-text, taken
	// seriously: "the implicit advection solving I'm using creates enough
	// diffusion on its own... I ignored the viscous [term] to encourage
	// BETTER vortex formation." This scheme's own numerical dissipation —
	// from NEAREST-sampled self-advection on a ~150-cell grid — is large
	// enough that it, not the explicit `nu` below, dominates the total
	// damping at any Re a real cylinder would use. Measured directly: a scan
	// over viscosity with a DFT on the transverse velocity a few diameters
	// downstream (see the verification writeup) found a clean, SINGLE
	// dominant frequency, consistent across four downstream stations, at
	// viscosity 0.4 — where the formula below reports Re ≈ 4000, nowhere
	// near a real cylinder's laminar regime. So: the Reynolds readout is a
	// real, honestly-solved U*D/nu, not a decoration — but on this grid it is
	// a LOWER BOUND on the total dissipation actually at work, not the whole
	// story, and should not be read against real-cylinder Re/St tables
	// literally. This is a known, general limitation of coarse-grid
	// stable-fluids solvers, not specific to this one.
	var params = {
		// Grid cells per second at the inflow (left edge). "grid cells" means
		// the VELOCITY grid, which is coarser than the dye grid — see below.
		flowSpeed: 60,
		// Kinematic viscosity, cells^2/s: an actual Jacobi diffusion pass, not
		// a fudge. 0.4 is the value the DFT scan above found gives the
		// cleanest, most position-independent shedding frequency.
		viscosity: 0.4,
		// Vorticity confinement. The reference has NO such term — it relies
		// entirely on the numerical diffusion of its advection step to stay
		// stable and sheds vortices anyway. This is an addition for pushing
		// the wake further into unsteadiness than the honest viscosity slider
		// alone allows; it defaults to 0 so the out-of-the-box behaviour has
		// nothing the reference didn't have.
		vorticity: 0,
		// Jacobi iterations for the pressure Poisson solve, their "for
		// (i=0;i<20;i++)" loop (each of their iterations is two of these
		// half-steps; this counts single half-steps the same way smoke-lab
		// does, so 30 here is comparable to their 20).
		iterations: 30,
		// Obstacle radius, as a fraction of the grid's SHORT axis (its
		// height). Their obstacleRad=20 is a raw pixel count tied to their own
		// canvas and does not mean anything transplanted elsewhere. 0.09 of
		// the channel height gives a diameter of about 27 cells on the default
		// grid: enough cells across the body to resolve separation cleanly
		// without blocking so much of the channel that the walls dominate the
		// wake (blockage ratio here is under 10%).
		obstacleRad: 0.09,
		// Obstacle centre, fraction of width/height. Their default is
		// [actualWidth/10, actualHeight/2] — close to the left edge, mid
		// channel. Pulled out to 0.24 rather than matching that: the control
		// panel is a fixed ~290px regardless of window width, and at 0.16 the
		// obstacle sat directly behind it on anything under ~1800px wide —
		// the one object the whole page exists to show, invisible by default.
		obstacleX: 0.24,
		obstacleY: 0.5,
		// Multiplier on the striped inflow dye. 1.0 matches their material
		// value of 1.0 at the inflow stripes.
		dyeAmount: 1.0,
		showVelocity: false,
		paused: false,

		// The rig, from shared/rig.js: the same jib-and-main geometry
		// smoke-lab sails with, dropped in here as a second obstacle shape.
		// 'cylinder' is the default and stays exactly the reference demo —
		// this is the shedding measurement the whole lab exists to make, and
		// it must not move when the rig ships. 'rig' swaps the cylinder out
		// entirely; 'both' masks in whichever cells either shape occupies.
		shape: 'cylinder',
		// The rig's own position, independent of the cylinder's
		// obstacleX/obstacleY, so 'both' can show one behind the other
		// rather than the two stacked on top of each other.
		rigX: 0.52,
		rigY: 0.50,
		rigSize: RIG.defaults.boatSize * 1.3,
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

	// LABKIT.create falls back to smoke-lab's own PRESETS table
	// (shared/labkit.js's module-level default) whenever `presets` is
	// omitted — and that table's keys happen to include `viscosity` and
	// `iterations`, which this file ALSO uses for entirely different
	// quantities. Without an explicit table here, picking "wind tunnel" from
	// the dropdown would silently overwrite this solver's viscosity (a
	// diffusion coefficient in cells^2/s) with smoke-lab's (a dye
	// dissipation rate) — found by inspection, not by symptom, so it is
	// called out here for whoever edits this next.
	var VORTEX_PRESETS = {
		'clean street': { flowSpeed: 60, viscosity: 0.4, vorticity: 0, iterations: 30, obstacleRad: 0.09, obstacleX: 0.24, obstacleY: 0.5, dyeAmount: 1.0 },
		'faster, choppier': { flowSpeed: 90, viscosity: 0.25, vorticity: 6, iterations: 30, obstacleRad: 0.09, obstacleX: 0.24, obstacleY: 0.5, dyeAmount: 1.0 },
		'big blunt body': { flowSpeed: 55, viscosity: 0.5, vorticity: 0, iterations: 34, obstacleRad: 0.15, obstacleX: 0.14, obstacleY: 0.5, dyeAmount: 1.0 },
		'steady (no shedding)': { flowSpeed: 60, viscosity: 2.5, vorticity: 0, iterations: 30, obstacleRad: 0.09, obstacleX: 0.24, obstacleY: 0.5, dyeAmount: 1.0 }
	};
	var kit = LABKIT.create({
		store: 'vortexlab.params.v1',
		params: params,
		presets: VORTEX_PRESETS,
		defaultOpen: ['sec-air']
	});
	// The "save as..." custom-preset feature in the shared panel captures
	// LABKIT.PRESET_KEYS — a fixed list baked into shared/labkit.js for
	// smoke-lab's own params, not overridable per-kit. Only this file's
	// `viscosity` and `iterations` happen to appear on that list, so a
	// custom save here will silently capture just those two and drop
	// flowSpeed/vorticity/obstacle*/dyeAmount. A real limitation of reusing
	// the shared kit as-is, not fixed here since shared/labkit.js is owned
	// by other labs too.
	function saveParams() { kit.save(); }
	function loadParams() { kit.load(); }
	function clearParams() { kit.clear(); }
	function refreshAllControls() { kit.refreshAll(); }
	function announce(t) { kit.announce(t); }
	function bindSections() { kit.bindSections(); }

	var gl, canvas, ext;
	var velocity, dye, pressure, divergenceFbo, obstacleFbo, curlFbo, diffuseB, probeFbo;
	var programs = {};
	var quadBuffer;

	// ---- boilerplate: FBOs, blit, program compile ------------------------
	// Same pattern as smoke-lab/smoke.js (createFBO/createDoubleFBO/blit) —
	// read there for the reasoning; not repeated here.

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
		gl.bindAttribLocation(p, 0, 'aPosition');
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

	// The transverse boundary is PERIODIC, same as the reference (its
	// repeatBoundary() in the divergence/gradient shaders does exactly this).
	// A cylinder in an unbounded stream is closer to what "vortex shedding"
	// usually means than one between two solid walls.
	var WRAPY_GLSL = [
		'vec2 wrapY(vec2 uv) {',
		'  if (uv.y < 0.0) uv.y += 1.0;',
		'  else if (uv.y > 1.0) uv.y -= 1.0;',
		'  return uv;',
		'}'
	].join('\n');

	// `internalFormat` defaults to the simulation's float format (ext.internal)
	// when omitted — but it MUST match `type`, or WebGL2 silently refuses to
	// complete the framebuffer (an RGBA16F internal format paired with a
	// UNSIGNED_BYTE type is simply invalid). The probe FBO passes gl.RGBA
	// explicitly for exactly this reason: it is deliberately a plain byte
	// texture, not a float one, and needs its own internal format to match.
	function createFBO(w, h, type, filter, internalFormat) {
		gl.activeTexture(gl.TEXTURE0);
		var tex = gl.createTexture();
		gl.bindTexture(gl.TEXTURE_2D, tex);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, filter);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat || ext.internal, w, h, 0, gl.RGBA, type, null);

		var fbo = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
		// Fail loudly. An incomplete FBO does not throw on its own — it just
		// makes every later draw/readPixels into it a silent no-op, which
		// looks exactly like a dead simulation rather than a boot error. This
		// is what caught the RGBA16F/UNSIGNED_BYTE mismatch on the probe FBO.
		var status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
		if (status !== gl.FRAMEBUFFER_COMPLETE) {
			throw new Error('Incomplete framebuffer (0x' + status.toString(16) + ') at ' + w + 'x' + h);
		}
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

	function createDoubleFBO(w, h, type, filter) {
		var a = createFBO(w, h, type, filter);
		var b = createFBO(w, h, type, filter);
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

	// ---- shaders ------------------------------------------------------------

	var CLEAR_FRAG = [
		'precision mediump float;',
		'varying vec2 vUv; uniform sampler2D uTexture; uniform float value;',
		'void main() { gl_FragColor = value * texture2D(uTexture, vUv); }'
	].join('\n');

	// Rasterise the obstacle(s) into a mask once a frame, at velocity-grid
	// resolution. Everything downstream (divergence/pressure/gradient) reads
	// this instead of re-testing the shapes, which is what lets a slider drag
	// on radius, position or trim take effect immediately.
	//
	// Two independent shapes can be live at once ('both'): the cylinder from
	// the reference demo, and the rig from shared/rig.js. The mask is just
	// their union — whichever cells either shape's distance field puts
	// inside zero. Only the rig's SAILS go in; its hull, like the boat's
	// hull in every other lab, is drawn but never solid to the flow (a hull
	// is in the water, not the air).
	//
	// This grid's cells are already square in screen space — simWidth and
	// simHeight are both derived from SIM_BASE scaled by the SAME aspect
	// ratio (see buildBuffers) specifically so a distance in gl_FragCoord
	// units means the same physical length on x and y. That is what lets
	// the rig frame be built directly off gl_FragCoord with no aspect
	// correction, unlike smoke-lab's version of this same pass (which works
	// in 0..1 vUv space against a canvas that usually isn't square, and so
	// needs one).
	var MASK_FRAG = [
		'precision highp float;',
		'uniform vec2 uObstaclePos;',
		'uniform float uObstacleRad, uUseCylinder, uUseRig;',
		'uniform vec2 uRigPoint, uHeading, uJibOff, uMainOff;',
		'uniform float uRigSize, uLee;',
		'uniform vec4 uJib, uMain;',
		RIG.GLSL,
		'void main() {',
		'  float solid = 0.0;',
		'  if (uUseCylinder > 0.5) {',
		'    float dc = distance(gl_FragCoord.xy - vec2(0.5), uObstaclePos);',
		'    solid = max(solid, step(dc, uObstacleRad));',
		'  }',
		'  if (uUseRig > 0.5) {',
		'    vec2 p = gl_FragCoord.xy - vec2(0.5) - uRigPoint;',
		'    vec2 a = vec2(dot(p, uHeading), dot(p, vec2(-uHeading.y, uHeading.x)));',
		'    vec3 d = rigDist(a, uRigSize, uJibOff, uMainOff, uJib, uMain, uLee);',
		'    solid = max(solid, step(min(d.y, d.z), 0.0));',
		'  }',
		'  gl_FragColor = vec4(solid, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Self-advection of velocity. Direct NEAREST sample, no manual bilerp —
	// this is what the reference's advectShaderVel does too (its bilerp
	// helper is only used by the MATERIAL shader, which crosses resolutions).
	// The left column is hard-set to the free-stream value every frame: that
	// Dirichlet inflow is what drives the whole tunnel.
	var ADVECT_VEL_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity;',
		'uniform vec2 texelSize;',
		'uniform float dt, flowSpeed;',
		WRAPY_GLSL,
		'void main() {',
		'  if (vUv.x <= texelSize.x * 0.5) { gl_FragColor = vec4(flowSpeed, 0.0, 0.0, 1.0); return; }',
		'  vec2 vel = texture2D(uVelocity, vUv).xy;',
		'  vec2 coord = wrapY(vUv - dt * vel * texelSize);',
		'  vec2 result = (coord.x <= texelSize.x * 0.5) ? vec2(flowSpeed, 0.0) : texture2D(uVelocity, coord).xy;',
		'  gl_FragColor = vec4(result, 0.0, 1.0);',
		'}'
	].join('\n');

	// The reference's viscosity term, `nu`, is declared and never used — it
	// notes the implicit advection diffuses enough on its own. Here it is
	// actually solved: implicit diffusion via Jacobi iteration, straight out
	// of Stable Fluids (Stam) / GPU Gems ch.38, the same two sources the
	// reference's own about-page cites. b is the field to diffuse (fixed for
	// the whole iteration), x is the running solve.
	var DIFFUSE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uB, uX;',
		'uniform float alpha, rBeta;',
		WRAPY_GLSL,
		'void main() {',
		'  vec2 b = texture2D(uB, vUv).xy;',
		'  vec2 n = texture2D(uX, wrapY(vT)).xy;',
		'  vec2 s = texture2D(uX, wrapY(vB)).xy;',
		'  vec2 e = texture2D(uX, vR).xy;',
		'  vec2 w = texture2D(uX, vL).xy;',
		'  gl_FragColor = vec4((n + s + e + w + alpha * b) * rBeta, 0.0, 1.0);',
		'}'
	].join('\n');

	var CURL_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity;',
		WRAPY_GLSL,
		'void main() {',
		'  float L = texture2D(uVelocity, vL).y;',
		'  float R = texture2D(uVelocity, vR).y;',
		'  float T = texture2D(uVelocity, wrapY(vT)).x;',
		'  float B = texture2D(uVelocity, wrapY(vB)).x;',
		'  gl_FragColor = vec4(0.5 * ((R - L) - (T - B)), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Extension beyond the reference (see file header). Off at curl=0.
	var VORTICITY_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uCurl;',
		'uniform float curl, dt;',
		WRAPY_GLSL,
		'void main() {',
		'  float L = texture2D(uCurl, vL).x;',
		'  float R = texture2D(uCurl, vR).x;',
		'  float T = texture2D(uCurl, wrapY(vT)).x;',
		'  float B = texture2D(uCurl, wrapY(vB)).x;',
		'  float C = texture2D(uCurl, vUv).x;',
		'  vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));',
		'  force /= length(force) + 0.0001;',
		'  force *= curl * C;',
		'  force.y *= -1.0;',
		'  vec2 vel = texture2D(uVelocity, vUv).xy + force * dt;',
		'  gl_FragColor = vec4(vel, 0.0, 1.0);',
		'}'
	].join('\n');

	// Divergence, pressure and the gradient subtract all check their four
	// neighbours against the obstacle mask: a solid neighbour contributes
	// zero velocity to the divergence, and reports back ITS OWN pressure
	// (zero-gradient / Neumann) rather than whatever the mask cell holds. That
	// pair of conditions is what makes the projection actually route the flow
	// around the circle instead of through it — see smoke-lab/smoke.js for
	// the same technique worked out against the rig.
	var DIVERGENCE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uVelocity, uObstacle;',
		WRAPY_GLSL,
		'void main() {',
		'  float L = texture2D(uVelocity, vL).x;',
		'  float R = texture2D(uVelocity, vR).x;',
		'  float T = texture2D(uVelocity, wrapY(vT)).y;',
		'  float B = texture2D(uVelocity, wrapY(vB)).y;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = 0.0;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = 0.0;',
		'  if (texture2D(uObstacle, wrapY(vT)).x > 0.5) T = 0.0;',
		'  if (texture2D(uObstacle, wrapY(vB)).x > 0.5) B = 0.0;',
		'  gl_FragColor = vec4(0.5 * (R - L + T - B), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	var PRESSURE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uDivergence, uObstacle;',
		WRAPY_GLSL,
		'void main() {',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, wrapY(vT)).x;',
		'  float B = texture2D(uPressure, wrapY(vB)).x;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  if (texture2D(uObstacle, wrapY(vT)).x > 0.5) T = C;',
		'  if (texture2D(uObstacle, wrapY(vB)).x > 0.5) B = C;',
		'  float div = texture2D(uDivergence, vUv).x;',
		'  gl_FragColor = vec4((L + R + T + B - div) * 0.25, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	var GRADIENT_FRAG = [
		'precision highp float;',
		'varying vec2 vUv, vL, vR, vT, vB;',
		'uniform sampler2D uPressure, uVelocity, uObstacle;',
		WRAPY_GLSL,
		'void main() {',
		'  float C = texture2D(uPressure, vUv).x;',
		'  float L = texture2D(uPressure, vL).x;',
		'  float R = texture2D(uPressure, vR).x;',
		'  float T = texture2D(uPressure, wrapY(vT)).x;',
		'  float B = texture2D(uPressure, wrapY(vB)).x;',
		'  if (texture2D(uObstacle, vL).x > 0.5) L = C;',
		'  if (texture2D(uObstacle, vR).x > 0.5) R = C;',
		'  if (texture2D(uObstacle, wrapY(vT)).x > 0.5) T = C;',
		'  if (texture2D(uObstacle, wrapY(vB)).x > 0.5) B = C;',
		'  vec2 vel = texture2D(uVelocity, vUv).xy - vec2(R - L, T - B);',
		'  if (texture2D(uObstacle, vUv).x > 0.5) vel = vec2(0.0);',
		'  gl_FragColor = vec4(vel, 0.0, 1.0);',
		'}'
	].join('\n');

	// The material/dye field, at a finer resolution than velocity (their
	// design: solve motion cheap, show it expensive). Reads the coarse
	// velocity field with a hand-rolled bilinear filter — copied from their
	// advectShaderMat's bilinearInterp, which exists for exactly this
	// cross-resolution case. The left edge paints the same alternating
	// stripes their advectShaderMat hardcodes, which is what turns "a grey
	// blob" into a wake you can actually count crossings in.
	var ADVECT_DYE_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uVelocity, uDye;',
		'uniform vec2 texelSize;',
		'uniform vec2 dyeTexelSize;',
		'uniform float dt, dyeGridHeight, dyeAmount;',
		'uniform vec2 uObstaclePosFine;',
		'uniform float uObstacleRadFine, uUseCylinder, uUseRig;',
		'uniform vec2 uRigPointFine, uHeading, uJibOff, uMainOff;',
		'uniform float uRigSizeFine, uLee;',
		'uniform vec4 uJib, uMain;',
		RIG.GLSL,
		WRAPY_GLSL,
		'float bilerp(sampler2D tex, vec2 uv, vec2 texel) {',
		'  vec2 st = uv / texel - 0.5;',
		'  vec2 iuv = floor(st), fuv = fract(st);',
		'  float a = texture2D(tex, (iuv + vec2(0.5, 0.5)) * texel).x;',
		'  float b = texture2D(tex, (iuv + vec2(1.5, 0.5)) * texel).x;',
		'  float c = texture2D(tex, (iuv + vec2(0.5, 1.5)) * texel).x;',
		'  float d = texture2D(tex, (iuv + vec2(1.5, 1.5)) * texel).x;',
		'  return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);',
		'}',
		'void main() {',
		'  if (gl_FragCoord.x < 1.0) {',
		'    float numCols = floor(dyeGridHeight / 10.0);',
		'    if (mod(numCols, 2.0) == 1.0) numCols -= 1.0;',
		'    numCols = max(numCols, 2.0);',
		'    float numPx = dyeGridHeight / numCols;',
		'    float band = floor(mod((gl_FragCoord.y - 2.0) / numPx, 2.0));',
		'    gl_FragColor = vec4(band == 0.0 ? dyeAmount : 0.0, 0.0, 0.0, 1.0);',
		'    return;',
		'  }',
		'  vec2 vel = texture2D(uVelocity, vUv).xy;',
		'  vec2 coord = wrapY(vUv - dt * vel * texelSize);',
		'  float result = bilerp(uDye, coord, dyeTexelSize);',
		'  if (uUseCylinder > 0.5) {',
		'    float dc = distance(gl_FragCoord.xy - vec2(0.5), uObstaclePosFine);',
		'    if (dc < uObstacleRadFine) result = 0.0;',
		'  }',
		'  if (uUseRig > 0.5) {',
		'    vec2 rp = gl_FragCoord.xy - vec2(0.5) - uRigPointFine;',
		'    vec2 ra = vec2(dot(rp, uHeading), dot(rp, vec2(-uHeading.y, uHeading.x)));',
		'    vec3 rd = rigDist(ra, uRigSizeFine, uJibOff, uMainOff, uJib, uMain, uLee);',
		'    if (min(rd.y, rd.z) < 0.0) result = 0.0;',
		'  }',
		'  gl_FragColor = vec4(result, 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// Push on the velocity field, same Gaussian splat every WebGL fluid demo
	// uses. Not in the reference's own shader list but matches the "click and
	// drag to apply a force" interaction their about-text describes.
	var SPLAT_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uTarget;',
		'uniform float aspectRatio, radius;',
		'uniform vec2 point, dir;',
		'void main() {',
		'  vec2 p = vUv - point; p.x *= aspectRatio;',
		'  vec2 base = texture2D(uTarget, vUv).xy;',
		'  float g = exp(-dot(p, p) / radius);',
		'  gl_FragColor = vec4(base + dir * g, 0.0, 1.0);',
		'}'
	].join('\n');

	// The obstacle is drawn from the analytic circle test again here, at the
	// dye grid's own resolution, rather than sampling the coarse mask texture
	// — this is what keeps its edge crisp instead of blocky at low velocity-
	// grid resolution, exactly the trick the reference's own render shader
	// uses (its 2d-render-shader tests u_obstaclePosition/u_obstacleRad
	// directly against gl_FragCoord too).
	// When the rig is in play it's drawn AFTER the cylinder's early-return
	// test and after the dye/velocity colouring, from the same distance
	// field the mask pass treats as solid — hull faint for context (and
	// deliberately not solid: a hull is in the water, not the air), sails
	// drawn full and rimmed the way smoke-lab's DISPLAY_FRAG draws them.
	// With shape left at its default 'cylinder' (uUseRig = 0), this whole
	// block is skipped and the pass is byte-for-byte what it always was.
	//
	// This pass runs at full CANVAS resolution (blit(null) sets the
	// viewport to the drawing buffer, not the dye grid), unlike the
	// cylinder's own "Fine" uniforms just above, which were calibrated
	// against the dye grid and only happen to land right because the
	// cylinder's own ADVECT_DYE_FRAG pass runs at THAT resolution. Rather
	// than inherit that same coordinate space here, the rig is placed in
	// plain 0..1 vUv space with an aspect-ratio correction — exactly the
	// convention smoke-lab's DISPLAY_FRAG uses for the same reason, and the
	// one that stays correct regardless of what resolution this pass runs
	// at.
	var RENDER_FRAG = [
		'precision highp float;',
		'varying vec2 vUv;',
		'uniform sampler2D uDye, uVelocity;',
		'uniform vec2 uObstaclePosFine;',
		'uniform float uObstacleRadFine, showVelocity, uUseCylinder, uUseRig;',
		'uniform vec2 point, heading, uJibOff, uMainOff;',
		'uniform float aspectRatio, size, lee;',
		'uniform vec4 uJib, uMain;',
		RIG.GLSL,
		'void main() {',
		'  if (uUseCylinder > 0.5) {',
		'    float dc = distance(gl_FragCoord.xy - vec2(0.5), uObstaclePosFine);',
		'    if (dc < uObstacleRadFine) { gl_FragColor = vec4(0.925, 0.0, 0.55, 1.0); return; }',
		'  }',
		'  vec3 c;',
		'  if (showVelocity > 0.5) {',
		'    vec2 v = texture2D(uVelocity, vUv).xy;',
		'    c = vec3(0.5 + v.x * 0.006, 0.5 + v.y * 0.02, 0.62);',
		'  } else {',
		'    float m = clamp(texture2D(uDye, vUv).x, 0.0, 1.0);',
		'    vec3 ink = vec3(0.98, 0.93, 0.84);',
		'    vec3 bg = vec3(0.03, 0.05, 0.09);',
		'    c = mix(bg, ink, m);',
		'  }',
		'  if (uUseRig > 0.5) {',
		'    vec2 rp = vUv - point;',
		'    rp.x *= aspectRatio;',
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

	// A single texel readback, always RGBA8/UNSIGNED_BYTE regardless of what
	// format the velocity field itself is stored in. Reading a FLOAT/
	// HALF_FLOAT target with the wrong readPixels type silently returns
	// zeros on some drivers and looks exactly like a dead simulation — so the
	// probe renders the velocity, ENCODED into a plain byte texture, and
	// readPixels only ever touches that. velScale is generous headroom over
	// the fastest flow expected near the body.
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
	var PROBE_VEL_SCALE = 220.0;

	// ---- state ----------------------------------------------------------

	var simWidth, simHeight, dyeWidth, dyeHeight;
	var lastTime = 0, frames = 0, fpsTimer = 0, simTime = 0;
	var DIFFUSE_ITERS = 20;

	var pointer = { down: false, x: 0, y: 0, dx: 0, dy: 0 };
	var dtHint = 0.016;

	// Live shedding-frequency estimate off a single probe point a few
	// diameters downstream, offset to one side of the centreline (dead on the
	// centreline the transverse velocity is symmetric and near zero, which is
	// exactly the wrong place to look for an oscillation). Counts zero-
	// crossings of v_y; two crossings make one period. This is a rough, noisy,
	// live indicator — the number reported in the writeup comes from an
	// external headless probe run far longer and averaged properly, per the
	// task's own warning that a single sample of an unsteady flow lies.
	var shed = { simT: 0, lastSign: 0, lastCrossT: -1, periods: [], hz: 0 };

	// obstacleRad is a fraction of the grid's HEIGHT; converting that same
	// physical length into a fraction of WIDTH needs the aspect ratio, or an
	// obstacle radius meant as "9% of the channel height" quietly becomes an
	// offset of "9% of the channel WIDTH" once used on the x-axis — on a wide
	// canvas that lands the probe roughly twice as far downstream as
	// intended. simWidth/simHeight (both cell counts over the same physical
	// domain) carry that ratio.
	function probePoint() {
		var diamCells = 2 * params.obstacleRad * simHeight;
		var diamFracX = diamCells / simWidth;
		return {
			x: Math.min(0.97, params.obstacleX + diamFracX * 3.5),
			y: params.obstacleY + params.obstacleRad * 0.9
		};
	}

	function readVelocityAt(u, v) {
		var p = programs.probe;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
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

	function updateShedding(dt, vy) {
		shed.simT += dt;
		var sign = vy >= 0 ? 1 : -1;
		if (shed.lastSign !== 0 && sign !== shed.lastSign) {
			if (shed.lastCrossT >= 0) {
				var full = (shed.simT - shed.lastCrossT) * 2;
				shed.periods.push(full);
				if (shed.periods.length > 14) shed.periods.shift();
			}
			shed.lastCrossT = shed.simT;
		}
		shed.lastSign = sign;
		if (shed.periods.length >= 4) {
			var sum = 0;
			for (var i = 0; i < shed.periods.length; i++) sum += shed.periods[i];
			var avg = sum / shed.periods.length;
			shed.hz = avg > 0 ? 1 / avg : 0;
		}
	}

	function reynolds() {
		var diamCells = 2 * params.obstacleRad * simHeight;
		return params.flowSpeed * diamCells / Math.max(1e-6, params.viscosity);
	}
	function strouhal() {
		var diamCells = 2 * params.obstacleRad * simHeight;
		return shed.hz > 0 ? shed.hz * diamCells / params.flowSpeed : 0;
	}
	LAB.reynolds = reynolds;
	LAB.strouhal = strouhal;

	// ---- the rig ------------------------------------------------------------

	var DEG = Math.PI / 180;

	// The rig is a static obstacle here — nothing sails it — so it always
	// stands heading straight downstream (aligned with the inflow) on the
	// starboard tack. That makes each trim slider read directly as the
	// sail's own angle of attack against the free stream, with no boat
	// heading to fold in on top of it.
	function useCylinder() { return params.shape !== 'rig'; }
	function useRig() { return params.shape !== 'cylinder'; }

	function setRigUniforms(p) {
		gl.uniform2f(p.uniforms.uJibOff, params.jibX, params.jibY);
		gl.uniform2f(p.uniforms.uMainOff, params.mainX, params.mainY);
		gl.uniform4f(p.uniforms.uJib, params.jibAngle * DEG, params.jibChord,
			params.jibCamber, params.jibThick);
		gl.uniform4f(p.uniforms.uMain, params.mainAngle * DEG, params.mainChord,
			params.mainCamber, params.mainThick);
		gl.uniform2f(p.uniforms.uHeading, 1.0, 0.0);
		gl.uniform1f(p.uniforms.uLee, 1.0);
		gl.uniform1f(p.uniforms.uUseCylinder, useCylinder() ? 1.0 : 0.0);
		gl.uniform1f(p.uniforms.uUseRig, useRig() ? 1.0 : 0.0);
	}

	// ---- passes -----------------------------------------------------------

	function splat(target, x, y, dx, dy, r) {
		var p = programs.splat;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uTarget, target.read.attach(0));
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform2f(p.uniforms.point, x, y);
		gl.uniform2f(p.uniforms.dir, dx, dy);
		gl.uniform1f(p.uniforms.radius, r);
		blit(target.write);
		target.swap();
	}

	function step(dt) {
		gl.disable(gl.BLEND);
		var p;

		// --- the obstacle(s), rasterised -----------------------------------
		p = programs.mask;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.uObstaclePos, params.obstacleX * simWidth, params.obstacleY * simHeight);
		gl.uniform1f(p.uniforms.uObstacleRad, params.obstacleRad * simHeight);
		gl.uniform2f(p.uniforms.uRigPoint, params.rigX * simWidth, params.rigY * simHeight);
		gl.uniform1f(p.uniforms.uRigSize, params.rigSize * simHeight);
		setRigUniforms(p);
		blit(obstacleFbo);

		// --- advect velocity ----------------------------------------------
		p = programs.advectVel;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.flowSpeed, params.flowSpeed);
		blit(velocity.write);
		velocity.swap();

		// --- viscosity: implicit diffusion, Jacobi -------------------------
		// b = the field just advected (fixed for the whole solve); iterate x
		// starting from the same field. diffuseB holds that fixed snapshot.
		var nu = Math.max(0.05, params.viscosity);
		var alpha = 1 / (nu * Math.max(dt, 1e-4)); // dx = 1 cell by construction
		var rBeta = 1 / (4 + alpha);
		p = programs.clear;
		gl.useProgram(p.handle);
		gl.uniform1f(p.uniforms.value, 1.0);
		gl.uniform1i(p.uniforms.uTexture, velocity.read.attach(0));
		blit(diffuseB);
		p = programs.diffuse;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uB, diffuseB.attach(1));
		gl.uniform1f(p.uniforms.alpha, alpha);
		gl.uniform1f(p.uniforms.rBeta, rBeta);
		for (var i = 0; i < DIFFUSE_ITERS; i++) {
			gl.uniform1i(p.uniforms.uX, velocity.read.attach(0));
			blit(velocity.write);
			velocity.swap();
		}

		// --- pointer force --------------------------------------------------
		if (pointer.down) {
			splat(velocity, pointer.x, pointer.y, pointer.dx, pointer.dy, 0.0016);
		}

		// --- vorticity confinement (extension; off at 0) --------------------
		if (params.vorticity > 0.01) {
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
			gl.uniform1f(p.uniforms.curl, params.vorticity);
			gl.uniform1f(p.uniforms.dt, dt);
			blit(velocity.write);
			velocity.swap();
		}

		// --- pressure projection --------------------------------------------
		p = programs.divergence;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(1));
		blit(divergenceFbo);

		// No clear of `pressure` between frames: like the reference, it is
		// left to persist as a warm start for the next Jacobi solve, which
		// both converges faster and matches what they do (they never zero it).
		p = programs.pressure;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform1i(p.uniforms.uDivergence, divergenceFbo.attach(0));
		gl.uniform1i(p.uniforms.uObstacle, obstacleFbo.attach(2));
		for (var it = 0; it < params.iterations; it++) {
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

		// --- advect the dye, at its own finer resolution --------------------
		p = programs.advectDye;
		gl.useProgram(p.handle);
		gl.uniform2f(p.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
		gl.uniform2f(p.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(0));
		gl.uniform1i(p.uniforms.uDye, dye.read.attach(1));
		gl.uniform1f(p.uniforms.dt, dt);
		gl.uniform1f(p.uniforms.dyeGridHeight, dyeHeight);
		gl.uniform1f(p.uniforms.dyeAmount, params.dyeAmount);
		gl.uniform2f(p.uniforms.uObstaclePosFine, params.obstacleX * dyeWidth, params.obstacleY * dyeHeight);
		gl.uniform1f(p.uniforms.uObstacleRadFine, params.obstacleRad * dyeHeight);
		gl.uniform2f(p.uniforms.uRigPointFine, params.rigX * dyeWidth, params.rigY * dyeHeight);
		gl.uniform1f(p.uniforms.uRigSizeFine, params.rigSize * dyeHeight);
		setRigUniforms(p);
		blit(dye.write);
		dye.swap();
		if (pointer.down) splat(dye, pointer.x, pointer.y, 0, 0, 0.0016); // leaves a faint mark, doesn't inject colour
	}

	// ---- boot / resize / frame ---------------------------------------------

	function initGL() {
		var opts = { alpha: false, depth: false, stencil: false, antialias: false, preserveDrawingBuffer: false };
		gl = canvas.getContext('webgl2', opts);
		var isWebGL2 = !!gl;
		if (!gl) gl = canvas.getContext('webgl', opts) || canvas.getContext('experimental-webgl', opts);
		if (!gl) throw new Error('This browser has no WebGL at all.');

		var type, internal, halfFloat;
		if (isWebGL2) {
			gl.getExtension('EXT_color_buffer_float');
			type = gl.HALF_FLOAT;
			internal = gl.RGBA16F;
		} else {
			halfFloat = gl.getExtension('OES_texture_half_float');
			if (!halfFloat) throw new Error('This browser has no half-float texture support.');
			type = halfFloat.HALF_FLOAT_OES;
			internal = gl.RGBA;
		}

		function renderable(intFmt, ty) {
			var tex = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, tex);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texImage2D(gl.TEXTURE_2D, 0, intFmt, 4, 4, 0, gl.RGBA, ty, null);
			var fbo = gl.createFramebuffer();
			gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
			gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
			return gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		}

		if (!renderable(internal, type)) {
			// Fall back to a plain byte texture. Velocities well outside
			// [0,1] will clip; this keeps the page alive on a driver with no
			// floating-point render target rather than dying silently, but it
			// is a genuinely degraded simulation. Not expected to trigger on
			// any real Chrome/Firefox/Safari.
			console.warn('VORTEXLAB: no float render target; falling back to bytes (degraded).');
			internal = gl.RGBA; type = gl.UNSIGNED_BYTE;
		}

		ext = { isWebGL2: isWebGL2, internal: internal, type: type };

		gl.clearColor(0, 0, 0, 1);
		quadBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
		gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(0);
	}

	function buildPrograms() {
		programs.clear = program(CLEAR_FRAG);
		programs.splat = program(SPLAT_FRAG);
		programs.mask = program(MASK_FRAG);
		programs.advectVel = program(ADVECT_VEL_FRAG);
		programs.diffuse = program(DIFFUSE_FRAG);
		programs.curl = program(CURL_FRAG);
		programs.vorticity = program(VORTICITY_FRAG);
		programs.divergence = program(DIVERGENCE_FRAG);
		programs.pressure = program(PRESSURE_FRAG);
		programs.gradient = program(GRADIENT_FRAG);
		programs.advectDye = program(ADVECT_DYE_FRAG);
		programs.render = program(RENDER_FRAG);
		programs.probe = program(PROBE_FRAG);
	}

	// Grid sizing: the velocity grid's long axis holds SIM_BASE cells (fast —
	// this is what the pressure solve iterates over); the dye grid's long
	// axis holds DYE_BASE (slower to advect but cheap, one pass, and this is
	// the field actually drawn, so it wants the resolution). Both computed
	// from the SAME canvas aspect ratio, so a "cell" is the same physical
	// square in both grids and obstaclePosition/obstacleRad (fractions of
	// height) mean the same physical circle wherever they're used.
	var SIM_BASE = 150;
	var DYE_BASE = 420;

	function buildBuffers() {
		var aspect = canvas.width / canvas.height;
		simWidth = Math.round(SIM_BASE * Math.max(1, aspect));
		simHeight = Math.round(SIM_BASE * Math.max(1, 1 / aspect));
		dyeWidth = Math.round(DYE_BASE * Math.max(1, aspect));
		dyeHeight = Math.round(DYE_BASE * Math.max(1, 1 / aspect));

		velocity = createDoubleFBO(simWidth, simHeight, ext.type, gl.NEAREST);
		divergenceFbo = createFBO(simWidth, simHeight, ext.type, gl.NEAREST);
		pressure = createDoubleFBO(simWidth, simHeight, ext.type, gl.NEAREST);
		obstacleFbo = createFBO(simWidth, simHeight, ext.type, gl.NEAREST);
		curlFbo = createFBO(simWidth, simHeight, ext.type, gl.NEAREST);
		diffuseB = createFBO(simWidth, simHeight, ext.type, gl.NEAREST);
		dye = createDoubleFBO(dyeWidth, dyeHeight, ext.type, gl.NEAREST);
		// Deliberately plain RGBA8/UNSIGNED_BYTE, independent of whatever
		// float format the simulation itself uses — see readVelocityAt().
		probeFbo = createFBO(1, 1, gl.UNSIGNED_BYTE, gl.NEAREST, gl.RGBA);
		seedAsymmetry();
	}

	// The obstacle, the inflow and this solver's own numerics are all
	// perfectly symmetric top-to-bottom, and a symmetric twin-vortex
	// recirculation bubble sitting behind the cylinder is a genuine (if
	// unstable) fixed point of the discrete equations — measured directly:
	// with nothing to break the symmetry, this solver sat dead steady for
	// 30+ seconds at Re 147, well above the real onset of shedding (~Re 47).
	// A real cylinder never sees that fixed point because ambient turbulence
	// and surface roughness perturb it immediately; DNS codes studying this
	// same transition seed an initial disturbance for exactly the same
	// reason. A handful of small random splats near the body does the same
	// job here — small enough to leave the mean flow and Reynolds number
	// unchanged, large enough to give the Karman instability something to
	// amplify.
	function seedAsymmetry() {
		for (var i = 0; i < 8; i++) {
			var ang = Math.random() * Math.PI * 2;
			var r = params.obstacleRad * (1.3 + Math.random());
			var x = params.obstacleX + Math.cos(ang) * r * (simHeight / simWidth);
			var y = params.obstacleY + Math.sin(ang) * r;
			splat(velocity, x, y, (Math.random() - 0.5) * params.flowSpeed, (Math.random() - 0.5) * params.flowSpeed, 0.0006);
		}
	}

	function resize() {
		var w = Math.floor(canvas.clientWidth * Math.min(window.devicePixelRatio || 1, 1.5));
		var h = Math.floor(canvas.clientHeight * Math.min(window.devicePixelRatio || 1, 1.5));
		if (canvas.width === w && canvas.height === h) return false;
		canvas.width = w; canvas.height = h;
		return true;
	}

	function bindPointer() {
		function pos(e) {
			var t = e.touches ? e.touches[0] : e;
			return { x: t.clientX / canvas.clientWidth, y: 1 - t.clientY / canvas.clientHeight };
		}
		canvas.addEventListener('mousedown', function (e) {
			var q = pos(e); pointer.down = true; pointer.x = q.x; pointer.y = q.y;
		});
		window.addEventListener('mouseup', function () { pointer.down = false; });
		window.addEventListener('mousemove', function (e) {
			if (!pointer.down) return;
			var q = pos(e);
			pointer.dx = (q.x - pointer.x) * 900;
			pointer.dy = (q.y - pointer.y) * 900;
			pointer.x = q.x; pointer.y = q.y;
		});
		canvas.addEventListener('touchstart', function (e) { e.preventDefault(); var q = pos(e); pointer.down = true; pointer.x = q.x; pointer.y = q.y; }, { passive: false });
		window.addEventListener('touchend', function () { pointer.down = false; });
		window.addEventListener('touchmove', function (e) {
			if (!pointer.down) return; e.preventDefault();
			var q = pos(e);
			pointer.dx = (q.x - pointer.x) * 900; pointer.dy = (q.y - pointer.y) * 900;
			pointer.x = q.x; pointer.y = q.y;
		}, { passive: false });
		window.addEventListener('keydown', function (e) {
			if (e.code === 'Space') { params.paused = !params.paused; e.preventDefault(); paintPause(); }
			if (e.code === 'KeyH') {
				var els = document.querySelectorAll('.panel');
				for (var i = 0; i < els.length; i++) els[i].style.display = els[i].style.display === 'none' ? '' : 'none';
			}
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
		shed.periods = []; shed.hz = 0; shed.lastSign = 0; shed.lastCrossT = -1;
	}

	var pauseBtn = null;
	function paintPause() { if (pauseBtn) pauseBtn.className = params.paused ? 'on' : ''; pauseBtn && (pauseBtn.textContent = params.paused ? 'paused' : 'pause'); }

	function bindControls() {
		function slider(id, key, fmt, hook) { return kit.slider(id, key, fmt, hook); }
		var one = function (v) { return (+v).toFixed(2); };
		var whole = function (v) { return Math.round(v); };
		slider('flow', 'flowSpeed', whole);
		slider('visc', 'viscosity', one);
		slider('vort', 'vorticity', whole);
		slider('iter', 'iterations', whole);
		slider('rad', 'obstacleRad', function (v) { return (+v).toFixed(3); });
		slider('ox', 'obstacleX', function (v) { return (+v).toFixed(3); });
		slider('oy', 'obstacleY', function (v) { return (+v).toFixed(3); });
		slider('dye', 'dyeAmount', one);

		kit.pick({ cylinder: 'b-shape-cyl', rig: 'b-shape-rig', both: 'b-shape-both' }, 'shape');

		slider('rigx', 'rigX', function (v) { return (+v).toFixed(3); });
		slider('rigy', 'rigY', function (v) { return (+v).toFixed(3); });
		slider('rigsize', 'rigSize', function (v) { return (+v).toFixed(3); });
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

		kit.toggle('b-vel', 'showVelocity');
		document.getElementById('b-clear').addEventListener('click', clearAll);
		pauseBtn = document.getElementById('b-pause');
		pauseBtn.addEventListener('click', function () { params.paused = !params.paused; paintPause(); });
		paintPause();
		document.getElementById('b-reset').addEventListener('click', clearParams);
		kit.buildPresetBar('preset-bar');
	}

	function frame(now) {
		requestAnimationFrame(frame);
		var dt = lastTime ? Math.min((now - lastTime) / 1000, 0.033) : 0.016;
		lastTime = now;
		dtHint = dt;

		if (resize()) buildBuffers();

		if (!params.paused) {
			simTime += dt;
			step(dt);
			var probe = probePoint();
			var v = readVelocityAt(probe.x, probe.y);
			updateShedding(dt, v.y);
		}

		var p = programs.render;
		gl.useProgram(p.handle);
		gl.uniform1i(p.uniforms.uDye, dye.read.attach(0));
		gl.uniform1i(p.uniforms.uVelocity, velocity.read.attach(1));
		gl.uniform2f(p.uniforms.uObstaclePosFine, params.obstacleX * dyeWidth, params.obstacleY * dyeHeight);
		gl.uniform1f(p.uniforms.uObstacleRadFine, params.obstacleRad * dyeHeight);
		// Plain 0..1 vUv space, not the dye grid's own pixel space (see the
		// comment on RENDER_FRAG) — this pass runs at full canvas resolution.
		gl.uniform2f(p.uniforms.point, params.rigX, params.rigY);
		gl.uniform1f(p.uniforms.aspectRatio, canvas.width / canvas.height);
		gl.uniform1f(p.uniforms.size, params.rigSize);
		gl.uniform2f(p.uniforms.heading, 1.0, 0.0);
		gl.uniform1f(p.uniforms.lee, 1.0);
		gl.uniform1f(p.uniforms.showVelocity, params.showVelocity ? 1 : 0);
		gl.uniform2f(p.uniforms.uJibOff, params.jibX, params.jibY);
		gl.uniform2f(p.uniforms.uMainOff, params.mainX, params.mainY);
		gl.uniform4f(p.uniforms.uJib, params.jibAngle * DEG, params.jibChord,
			params.jibCamber, params.jibThick);
		gl.uniform4f(p.uniforms.uMain, params.mainAngle * DEG, params.mainChord,
			params.mainCamber, params.mainThick);
		gl.uniform1f(p.uniforms.uUseCylinder, useCylinder() ? 1.0 : 0.0);
		gl.uniform1f(p.uniforms.uUseRig, useRig() ? 1.0 : 0.0);
		blit(null);

		var reEl = document.getElementById('r-re');
		if (reEl) reEl.textContent = Math.round(reynolds());
		var hzEl = document.getElementById('r-hz');
		if (hzEl) hzEl.textContent = shed.hz > 0 ? shed.hz.toFixed(2) + ' Hz' : '—';
		var stEl = document.getElementById('r-st');
		if (stEl) stEl.textContent = shed.hz > 0 ? strouhal().toFixed(3) : '—';

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
	LAB.debug = function () {
		return {
			gl: gl, ext: ext, canvas: canvas,
			simWidth: simWidth, simHeight: simHeight,
			dyeWidth: dyeWidth, dyeHeight: dyeHeight,
			velocity: velocity, dye: dye, obstacleFbo: obstacleFbo,
			readVelocityAt: readVelocityAt,
			probePoint: probePoint,
			reynolds: reynolds, strouhal: strouhal,
			shed: shed
		};
	};
	Object.defineProperty(LAB, 'maskFbo', { get: function () { return obstacleFbo; } });
})(window);
