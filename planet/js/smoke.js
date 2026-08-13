// Smoke on the ball.
//
// The first attempt at "show me the wind" was line integral convolution: smear
// a fixed noise field along the instantaneous flow. It produced flow-aligned
// filaments and it was wrong, because a static field has no memory. Nothing was
// being carried, nothing came from anywhere, and it read as marble.
//
// This is the real thing. A density field lives in a texture wrapped round the
// ball, and every frame it is ADVECTED: each texel looks back along the wind to
// where its air came from a moment ago and takes the density it finds there.
// Dye is injected at sources, mostly at each boat's sails, and then the wind
// carries it. Structures persist, stretch, fold and roll up over seconds, which
// is the whole difference. A plume off a boat is literally her dirty air, drawn.
//
// Semi-Lagrangian advection, the same scheme the WebGL fluid demos use, with
// two simplifications the sphere earns us: the velocity field is analytic (from
// windglsl.js) rather than solved, so there is no pressure projection and no
// divergence to clean up, and the domain is closed, so there are no boundaries
// to handle beyond the equirectangular seam.
(function (P) {
	'use strict';

	var Smoke = P.Smoke = { ready: false };

	var VERT = [
		'varying vec2 vUv;',
		'void main() {',
		'  vUv = uv;',
		'  gl_Position = vec4(position.xy * 2.0, 0.0, 1.0);',
		'}'
	].join('\n');

	var ADVECT = [
		'precision highp float;',
		P.GLSL.uniforms,
		'uniform sampler2D uPrev;',
		'uniform float uDt, uSpeedScale, uDissipate, uInject, uInjectWidth;',
		'uniform float uAmbientSeed, uSeedScale, uBoatSmoke;',
		'uniform int uBoatCount;',
		'uniform vec3 uBoatPos[MAX_BLANKETS];',
		'uniform float uBoatStrength[MAX_BLANKETS];',
		'varying vec2 vUv;',
		P.GLSL.wind,

		'void main() {',
		'  vec3 n = uvToDir(vUv);',

		// Trace BACK along the wind: where was this air a moment ago? The step is
		// an angle, because a metre of travel is a smaller angle on a bigger ball,
		// which is what keeps the smoke's pace right as the radius slider moves.
		'  vec3 d = windFlowAt(n);',
		'  float kts = windSpeedAt(n) * uSpeedScale;',
		'  float a = kts * uDt / max(1.0, uRadius);',
		'  vec3 src = normalize(n * cos(a) - d * sin(a));',
		'  vec4 prev = texture2D(uPrev, dirToUv(src));',

		'  float dens = prev.r * uDissipate;',

		// Sources. The boats are the point of the whole thing: dye off her sails
		// so her dirty air is visible as dirty air.
		'  for (int i = 0; i < MAX_BLANKETS; i++) {',
		'    if (i >= uBoatCount) break;',
		'    float arc = acos(clamp(dot(n, uBoatPos[i]), -1.0, 1.0)) * uRadius;',
		'    float r = arc / max(0.5, uInjectWidth);',
		'    dens += uBoatSmoke * uBoatStrength[i] * exp(-r * r) * uDt;',
		'  }',

		// And a thin, noisy feed over the windward face, so the whole ball has
		// something streaming over it rather than two lonely plumes. Seeded in
		// world space and slowly evolving, so it does not sit still relative to
		// the ball and print a pattern.
		'  float theta = acos(clamp(-dot(uWindDir, n), -1.0, 1.0));',
		'  float face = smoothstep(1.9, 0.5, theta);',
		'  float seed = vnoise(n * uSeedScale + vec3(0.0, uTime * 0.05, 0.0));',
		'  seed = smoothstep(0.52, 0.92, seed);',
		'  dens += uAmbientSeed * face * seed * uDt;',

		'  gl_FragColor = vec4(clamp(dens, 0.0, 1.6), 0.0, 0.0, 1.0);',
		'}'
	].join('\n');

	// ---------------------------------------------------------------------------

	Smoke.init = function (renderer, uniforms) {
		this.renderer = renderer;
		this.shared = uniforms;

		var size = this.sizeFor(P.params.smoke.resolution);
		this.scene = new THREE.Scene();
		this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

		this.uniforms = {};
		var k;
		for (k in uniforms) if (uniforms.hasOwnProperty(k)) this.uniforms[k] = uniforms[k];
		this.uniforms.uPrev = { type: 't', value: null };
		this.uniforms.uDt = { type: 'f', value: 0.016 };
		this.uniforms.uSpeedScale = { type: 'f', value: 0.51 };   // knots -> m/s
		this.uniforms.uDissipate = { type: 'f', value: 0.994 };
		this.uniforms.uInject = { type: 'f', value: 1 };
		this.uniforms.uInjectWidth = { type: 'f', value: 8 };
		this.uniforms.uAmbientSeed = { type: 'f', value: 0.5 };
		this.uniforms.uSeedScale = { type: 'f', value: 9 };
		this.uniforms.uBoatSmoke = { type: 'f', value: 2.4 };
		this.uniforms.uBoatCount = { type: 'i', value: 2 };
		this.uniforms.uBoatPos = { type: 'v3v', value: [] };
		this.uniforms.uBoatStrength = { type: 'fv1', value: [] };
		for (k = 0; k < P.GLSL.MAX_SHADOWS; k++) {
			this.uniforms.uBoatPos.value.push(new THREE.Vector3(0, 1, 0));
			this.uniforms.uBoatStrength.value.push(0);
		}

		this.material = new THREE.ShaderMaterial({
			uniforms: this.uniforms,
			vertexShader: VERT,
			fragmentShader: ADVECT,
			depthTest: false,
			depthWrite: false
		});
		this.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(1, 1), this.material);
		this.quad.frustumCulled = false;
		this.scene.add(this.quad);

		this.build(size);
		this.ready = true;
		return this;
	};

	Smoke.sizeFor = function (r) {
		var w = Math.max(128, Math.min(2048, r | 0));
		return { w: w, h: w >> 1 };                       // equirectangular is 2:1
	};

	Smoke.build = function (size) {
		if (this.targets) {
			this.targets[0].dispose();
			this.targets[1].dispose();
		}
		// Byte textures quantise the dissipation into visible steps and stall the
		// fade, so a float target is preferable. But the obvious test for one is
		// wrong: OES_texture_float grants float TEXTURES, not float RENDER
		// TARGETS. Ask for it, render to it, and on this machine you get a
		// silently incomplete framebuffer and a field that stays empty for ever.
		// Colour-buffer-float is the extension that actually matters, and even
		// then the framebuffer is checked below before being trusted.
		var gl = this.renderer.getContext();
		var type = THREE.UnsignedByteType;
		if (gl.getExtension('OES_texture_half_float') &&
			(gl.getExtension('EXT_color_buffer_half_float') || gl.getExtension('WEBGL_color_buffer_float'))) {
			type = THREE.HalfFloatType;
		}
		if (gl.getExtension('OES_texture_float') && gl.getExtension('WEBGL_color_buffer_float')) {
			type = THREE.FloatType;
		}

		var opts = {
			minFilter: THREE.LinearFilter,
			magFilter: THREE.LinearFilter,
			format: THREE.RGBAFormat,
			type: type,
			// Longitude wraps, latitude does not: repeat across the seam so the
			// bilinear tap there does not smear the whole texture into the edge.
			wrapS: THREE.RepeatWrapping,
			wrapT: THREE.ClampToEdgeWrapping,
			depthBuffer: false,
			stencilBuffer: false
		};
		this.targets = [
			new THREE.WebGLRenderTarget(size.w, size.h, opts),
			new THREE.WebGLRenderTarget(size.w, size.h, opts)
		];
		this.size = size;
		this.front = 0;
		this.textureType = type;
		this.clear();

		// Trust nothing: force the targets to exist, then ask the driver whether
		// the framebuffer is actually usable. An incomplete one draws nothing and
		// reports no error, which is the worst failure mode there is.
		if (type !== THREE.UnsignedByteType && !this.framebufferWorks()) {
			this.textureType = THREE.UnsignedByteType;
			opts.type = THREE.UnsignedByteType;
			this.targets[0].dispose();
			this.targets[1].dispose();
			this.targets = [
				new THREE.WebGLRenderTarget(size.w, size.h, opts),
				new THREE.WebGLRenderTarget(size.w, size.h, opts)
			];
			this.front = 0;
			this.clear();
		}
	};

	Smoke.framebufferWorks = function () {
		var gl = this.renderer.getContext();
		// Renders once so three.js allocates the framebuffer, then checks it.
		this.uniforms.uPrev.value = asTexture(this.targets[0]);
		this.uniforms.uDt.value = 0;
		this.renderer.render(this.scene, this.camera, this.targets[1], true);
		var ok = gl.checkFramebufferStatus(gl.FRAMEBUFFER) === gl.FRAMEBUFFER_COMPLETE;
		this.renderer.setRenderTarget ? this.renderer.setRenderTarget(null) : null;
		return ok;
	};

	Smoke.clear = function () {
		var keep = this.renderer.getClearColor().clone();
		var alpha = this.renderer.getClearAlpha();
		this.renderer.setClearColor(0x000000, 1);
		this.renderer.clearTarget(this.targets[0], true, false, false);
		this.renderer.clearTarget(this.targets[1], true, false, false);
		this.renderer.setClearColor(keep, alpha);
	};

	// r72 has no WebGLRenderTarget.texture: the render target IS the texture,
	// and `.texture` only arrives a revision or two later. Binding the undefined
	// property gave an unbound sampler, a GL_INVALID_OPERATION and a density
	// field that stayed at exactly zero while every other check said the
	// simulation was healthy. Read it through here and nowhere else.
	function asTexture(rt) {
		if (!rt) return null;
		return rt.texture !== undefined ? rt.texture : rt;
	}
	Smoke.asTexture = asTexture;

	Smoke.texture = function () {
		return this.targets ? asTexture(this.targets[this.front]) : null;
	};

	Smoke.resize = function () {
		var want = this.sizeFor(P.params.smoke.resolution);
		if (!this.size || want.w !== this.size.w) this.build(want);
	};

	// One advection step. `dt` is real seconds; a paused sim passes 0 and the
	// field simply holds, which is what you want when you pause to look at it.
	Smoke.update = function (dt) {
		if (!this.ready || !P.params.smoke.enabled || dt <= 0) return;
		var s = P.params.smoke;

		var sub = Math.max(1, s.substeps | 0);
		var h = Math.min(dt, 0.05) / sub;

		this.uniforms.uDt.value = h;
		this.uniforms.uSpeedScale.value = 0.514 * s.speed;
		this.uniforms.uDissipate.value = Math.pow(s.dissipate, h * 60);
		this.uniforms.uAmbientSeed.value = s.ambientSeed;
		this.uniforms.uSeedScale.value = s.seedScale;
		this.uniforms.uBoatSmoke.value = s.fromSails;
		this.uniforms.uInjectWidth.value = s.plumeWidth * P.boatLength();

		// Each boat smokes as hard as she has wind working her sails, so a boat
		// lying in a hole stops making dirty air, exactly as her shadow does.
		var boats = P.World.boats;
		var n = Math.min(boats.length, P.GLSL.MAX_SHADOWS);
		this.uniforms.uBoatCount.value = n;
		for (var i = 0; i < n; i++) {
			this.uniforms.uBoatPos.value[i].copy(boats[i].pos);
			this.uniforms.uBoatStrength.value[i] =
				P.clamp(boats[i].windSpeed / Math.max(1, P.params.wind.speedKts), 0, 1.6);
		}

		for (var k = 0; k < sub; k++) {
			var back = 1 - this.front;
			this.uniforms.uPrev.value = asTexture(this.targets[this.front]);
			this.renderer.render(this.scene, this.camera, this.targets[back], false);
			this.front = back;
		}
	};
})(window.PLANET);
