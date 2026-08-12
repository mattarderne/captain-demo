// The picture: a stylised water-ball, the wind field painted onto it, and two
// small boats stuck to its skin.
(function (P) {
	'use strict';

	var MAX_SHADOWS = 4;

	// The chop. Three beating sinusoids of the surface normal, displacing the ball
	// along it. The frequencies are in radians per unit sphere, so a frequency f
	// is a wavelength of 2*PI*R/f metres: at R = 90 the three come out around 20,
	// 14 and 9 metres, which is short enough to sit a 12.8 m hull down in it.
	//
	// This is the reason you cannot simply orbit round and spot her: on a mirror
	// ball a boat a hundred metres off is a clean silhouette, and on a rough one
	// she is in and out of the backs of waves.
	var CHOP = [
		'float chopAt(vec3 n, float t, float k) {',
		'  return sin(dot(n, vec3(0.91, 0.23, 0.34)) * 26.0 * k + t * 1.1)',
		'       + 0.7 * sin(dot(n, vec3(-0.31, 0.82, 0.48)) * 41.0 * k - t * 1.6)',
		'       + 0.4 * sin(dot(n, vec3(0.52, -0.44, 0.73)) * 63.0 * k + t * 2.3);',
		'}'
	].join('\n');

	var BALL_VERT = [
		'uniform float uTime, uChop, uChopScale, uRadius;',
		'varying vec3 vN;',
		'varying vec3 vWorld;',
		CHOP,
		'void main() {',
		'  vN = normalize(normal);',
		// uChop is metres; the geometry is a unit sphere scaled by uRadius, so
		// divide through to keep the sea state honest as the ball resizes.
		'  float lift = chopAt(vN, uTime, uChopScale) * uChop / max(1.0, uRadius);',
		'  vec4 w = modelMatrix * vec4(position * (1.0 + lift), 1.0);',
		'  vWorld = w.xyz;',
		'  gl_Position = projectionMatrix * viewMatrix * w;',
		'}'
	].join('\n');

	// The wind maths here mirrors PLANET.Wind.sample in windfield.js: same
	// potential-flow profile, same separation blend, same boat shadows. The one
	// difference is that this works in speed only (the JS blends the vectors, so
	// inside the separation band the two disagree by a percent or two) — keep the
	// two in step if you tune either.
	var BALL_FRAG = [
		'precision highp float;',
		'const int MAX_BLANKETS = ' + MAX_SHADOWS + ';',
		'uniform float uTime, uSep, uWakeSpeed, uRecirc, uSwirl, uShedHz;',
		'uniform float uNose, uLimb, uEddy, uEddyScale;',
		'uniform float uPaint, uPanels, uRadius, uWindScale, uChop, uChopScale;',
		'uniform vec3 uWindDir, uRefA, uRefB, uSun;',
		'uniform int uShadowCount;',
		'uniform vec3 uShadowPos[MAX_BLANKETS];',
		'uniform vec3 uShadowDown[MAX_BLANKETS];',
		'uniform vec4 uShadowParams[MAX_BLANKETS];',   // strength, length, sigma0, spread
		'varying vec3 vN;',
		'varying vec3 vWorld;',
		CHOP,

		// Mirrors PLANET.Wind.eddyAt. Keep the two in step or the mottling on the
		// water will disagree with the wind the boats are actually feeling.
		'float leeNoise(vec3 n, float t, float phi) {',
		'  float k = uEddyScale;',
		'  float shed = sin(uShedHz * t * 6.2831853 + phi * 2.0);',
		'  float fine = sin(n.x * k * 3.1 + t * 0.91) * sin(n.y * k * 2.3 - t * 0.69)',
		'             * sin(n.z * k * 1.9 + t * 0.40);',
		'  float coarse = sin(n.z * k * 1.4 + 2.0) * sin(n.x * k * 1.0 - t * 0.37)',
		'               * sin(n.y * k * 0.86 + t * 0.22);',
		'  return 0.55 * shed + 0.30 * fine + 0.25 * coarse;',
		'}',

		'float windSpeedAt(vec3 n) {',
		'  float dn = dot(uWindDir, n);',
		'  float theta = acos(clamp(-dn, -1.0, 1.0));',
		'  float st = max(0.0, sin(theta));',
		'  float potential = uNose + (uLimb - uNose) * st;',
		'  float phi = atan(dot(n, uRefB), dot(n, uRefA));',
		'  float wake = uWakeSpeed * (0.85 + 0.15 * st)',
		'             * clamp(1.0 + uEddy * 0.5 * leeNoise(n, uTime, phi), 0.55, 1.5);',
		'  float blend = smoothstep(uSep - 0.30, uSep + 0.55, theta);',
		'  float spd = mix(potential, wake, blend);',
		'  float def = 0.0;',
		'  for (int i = 0; i < MAX_BLANKETS; i++) {',
		'    if (i >= uShadowCount) break;',
		'    vec4 pr = uShadowParams[i];',
		'    if (pr.x <= 0.0) continue;',
		'    vec3 sp = uShadowPos[i];',
		'    float cosA = clamp(dot(n, sp), -1.0, 1.0);',
		'    float arc = acos(cosA) * uRadius;',
		'    if (arc > pr.y * 2.2) continue;',
		'    vec3 e = n - sp * cosA;',
		'    float el = length(e);',
		'    float along = 0.0, across = 0.0;',
		'    if (el > 1e-6) {',
		'      e /= el;',
		'      float cx = dot(e, uShadowDown[i]);',
		'      along = arc * cx;',
		'      across = arc * sqrt(max(0.0, 1.0 - cx * cx));',
		'    }',
		'    if (along < 0.0) continue;',
		'    float sigma = pr.z + pr.w * along;',
		'    float lat = across / sigma;',
		'    float d = pr.x * exp(-along / pr.y) * exp(-0.5 * lat * lat);',
		'    def = 1.0 - (1.0 - def) * (1.0 - d);',
		'  }',
		'  return spd * (1.0 - def);',
		'}',

		// The ramp has to span the field that actually exists. It used to divide
		// by a flat 1.5, which was right when the nose of the ball was dead calm
		// and the range ran 0 to 1.5. Now that nothing is below about 0.85 the
		// whole ball came out at the pale end and the wind map read as one flat
		// colour. Anchored to uLimb so it re-scales with the sliders.
		'vec3 windRamp(float s) {',
		'  float lo = 0.55;',
		'  float t = clamp((s - lo) / max(0.2, uLimb - lo), 0.0, 1.0);',
		'  vec3 calm = vec3(0.07, 0.09, 0.21);',
		'  vec3 mid  = vec3(0.07, 0.42, 0.52);',
		'  vec3 fast = vec3(0.62, 0.87, 0.96);',
		'  return t < 0.5 ? mix(calm, mid, t * 2.0) : mix(mid, fast, (t - 0.5) * 2.0);',
		'}',

		'void main() {',
		'  vec3 n = normalize(vN);',
		'  vec3 view = normalize(cameraPosition - vWorld);',
		'  float spd = windSpeedAt(n);',
		// Out near the limb a whole ocean of wave detail lands on a handful of
		// pixels; let it go rather than watch it alias into blotches.
		'  float facing = smoothstep(0.10, 0.55, dot(n, view));',

		// Swell: the water is only textured where the wind is actually working
		// it, so a hole in the breeze reads as a glassy patch from a mile off.
		'  float rough = clamp((spd - 0.55) / 1.05, 0.0, 1.0);',
		'  float swell = chopAt(n, uTime, uChopScale) * 0.17 * rough * facing;',

		// Tilt the shading normal down the face of the chop. The vertex shader
		// has already moved the surface; without this the new geometry would be
		// lit as though it were still a smooth ball and you would not see it.
		'  vec3 tx = normalize(cross(n, abs(n.y) < 0.9 ? vec3(0.0, 1.0, 0.0) : vec3(1.0, 0.0, 0.0)));',
		'  vec3 ty = cross(n, tx);',
		'  float eps = 0.012;',
		'  float h0 = chopAt(n, uTime, uChopScale);',
		'  float hx = chopAt(normalize(n + tx * eps), uTime, uChopScale);',
		'  float hy = chopAt(normalize(n + ty * eps), uTime, uChopScale);',
		'  float slope = uChop * rough * 0.5 / max(1.0, eps * uRadius);',
		'  n = normalize(n - (tx * (hx - h0) + ty * (hy - h0)) * slope);',

		'  vec3 deep = vec3(0.015, 0.075, 0.155);',
		'  vec3 shallow = vec3(0.055, 0.255, 0.375);',
		'  vec3 base = mix(deep, shallow, clamp(0.45 + swell, 0.0, 1.0));',

		// Eight panels round the ball, and a bright seam on every edge: the thing
		// that actually tells you that you are moving over the curve. Built from
		// sin/cos of the longitude rather than fract(), which would put a seam of
		// its own down the branch cut of atan.
		'  if (uPanels > 0.5) {',
		'    float ang = atan(n.x, n.z);',
		'    float s4 = sin(ang * 4.0), c4 = cos(ang * 4.0);',
		'    base *= mix(0.88, 1.08, step(0.0, s4));',
		'    base += vec3(0.10, 0.16, 0.20) * pow(abs(c4), 70.0) * facing;',
		'    base *= 1.0 - 0.10 * smoothstep(0.90, 0.995, abs(n.y));',
		'  }',

		'  vec3 col = mix(base, windRamp(spd), uPaint * 0.42);',

		// Whitecaps where it really blows.
		'  float caps = smoothstep(1.34, 1.62, spd + swell * 0.8) * facing;',
		'  col = mix(col, vec3(0.92, 0.97, 1.0), caps * 0.22);',

		'  float diff = clamp(dot(n, uSun) * 0.5 + 0.58, 0.26, 1.2);',
		'  vec3 h = normalize(uSun + view);',
		'  float spec = pow(max(dot(n, h), 0.0), 60.0) * (0.35 + 0.65 * rough);',
		'  float fres = pow(1.0 - max(dot(n, view), 0.0), 3.5);',

		'  col *= diff;',
		'  col += vec3(1.0, 0.94, 0.82) * spec * 0.55;',
		'  col += vec3(0.35, 0.62, 0.85) * fres * 0.45;',
		'  gl_FragColor = vec4(col, 1.0);',
		'}'
	].join('\n');

	// The old starfield lit whole grid cells: `step(0.9975, hash(floor(d*260)))`
	// paints the entire cell white, so every star was an axis-aligned SQUARE,
	// and at 260 cells there were thousands of them scraping past. Now each cell
	// holds at most one round star at a jittered point inside it, with a soft
	// edge and a brightness that mostly lands faint. Far fewer, far quieter.
	var SKY_FRAG = [
		'precision mediump float;',
		'uniform vec3 uSun;',
		'uniform float uStars;',
		'varying vec3 vDir;',
		'float hash(vec3 p) { return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }',

		'float starLayer(vec3 d, float density, float thresh, float size) {',
		'  vec3 p = d * density;',
		'  vec3 g = floor(p);',
		'  float h = hash(g);',
		'  if (h < thresh) return 0.0;',
		'  vec3 jitter = vec3(hash(g + 11.0), hash(g + 23.0), hash(g + 37.0)) - 0.5;',
		'  float r = length(fract(p) - 0.5 - jitter * 0.7);',
		// Brightness biased low: a sky of pinpricks with a handful of real ones.
		'  float mag = pow((h - thresh) / (1.0 - thresh), 2.2);',
		'  return smoothstep(size, 0.0, r) * mag;',
		'}',

		'void main() {',
		'  vec3 d = normalize(vDir);',
		'  float up = clamp(d.y * 0.5 + 0.5, 0.0, 1.0);',
		'  vec3 col = mix(vec3(0.03, 0.05, 0.10), vec3(0.10, 0.16, 0.30), up);',
		'  float sun = pow(max(dot(d, uSun), 0.0), 220.0);',
		'  col += vec3(1.0, 0.85, 0.65) * sun;',
		'  col += vec3(0.9, 0.55, 0.35) * pow(max(dot(d, uSun), 0.0), 6.0) * 0.08;',
		'  float star = starLayer(d, 42.0, 0.86, 0.13) * 0.55',
		'             + starLayer(d, 90.0, 0.955, 0.10) * 0.30;',
		// Faint blue-white, and fading out towards the zenith glow.
		'  col += vec3(0.86, 0.92, 1.0) * star * uStars * (1.0 - up * 0.45);',
		'  gl_FragColor = vec4(col, 1.0);',
		'}'
	].join('\n');

	var SKY_VERT = [
		'varying vec3 vDir;',
		'void main() {',
		'  vDir = position;',
		'  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		'}'
	].join('\n');

	var Render = P.Render = {
		sun: new THREE.Vector3(0.45, 0.55, 0.7).normalize(),
		orbit: { theta: 2.6, phi: 0.30, dist: 4.2, drag: false, lx: 0, ly: 0 },
		boats: []
	};

	Render.init = function (container) {
		this.container = container;
		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setClearColor(0x05070f, 1);
		container.appendChild(this.renderer.domElement);

		this.scene = new THREE.Scene();
		this.camera = new THREE.PerspectiveCamera(58, 1, 0.5, 40000);
		this.camEye = new THREE.Vector3();
		this.camLook = new THREE.Vector3();
		this.camUp = new THREE.Vector3(0, 1, 0);
		this.camReady = false;

		this.scene.add(new THREE.AmbientLight(0x30405a));
		var key = new THREE.DirectionalLight(0xfff0dd, 1.05);
		key.position.copy(this.sun).multiplyScalar(1000);
		this.scene.add(key);
		var fill = new THREE.DirectionalLight(0x5577aa, 0.4);
		fill.position.copy(this.sun).multiplyScalar(-800);
		this.scene.add(fill);

		this.buildSky();
		this.buildBall();
		this.buildWindSource();

		for (var i = 0; i < P.World.boats.length; i++) {
			var b = this.buildBoat(i === 0 ? 0xf2e5c8 : 0xc8542f, i === 0 ? 0xffffff : 0xffd9a0);
			this.boats.push(b);
			this.scene.add(b.group);
		}

		this.buildWakes();
		this.buildCones();

		this.buildGunnery();
		P.Streamers.init(this.scene);
		this.bindOrbit();
		return this;
	};

	// Round shot, splashes and smoke, all from fixed pools so a hot engagement
	// never allocates mid-frame.
	Render.buildGunnery = function () {
		var i;
		this.shotPool = [];
		var ballGeo = new THREE.SphereGeometry(1, 8, 6);
		var ballMat = new THREE.MeshBasicMaterial({ color: 0x1b1410 });
		for (i = 0; i < 24; i++) {
			var ball = new THREE.Mesh(ballGeo, ballMat);
			ball.visible = false;
			this.scene.add(ball);
			this.shotPool.push(ball);
		}

		this.splashPool = [];
		var ringGeo = new THREE.SphereGeometry(1, 10, 6);
		for (i = 0; i < 24; i++) {
			var sp = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({
				color: 0xdff2ff, transparent: true, opacity: 0.5, depthWrite: false
			}));
			sp.visible = false;
			this.scene.add(sp);
			this.splashPool.push(sp);
		}
	};

	Render.buildSky = function () {
		var geo = new THREE.SphereGeometry(1, 32, 24);
		var mat = new THREE.ShaderMaterial({
			uniforms: {
				uSun: { type: 'v3', value: this.sun },
				uStars: { type: 'f', value: 1 }
			},
			vertexShader: SKY_VERT,
			fragmentShader: SKY_FRAG,
			side: THREE.BackSide,
			depthWrite: false
		});
		this.sky = new THREE.Mesh(geo, mat);
		this.scene.add(this.sky);
	};

	Render.buildBall = function () {
		if (this.ball) {
			this.scene.remove(this.ball);
			this.ball.geometry.dispose();
		}
		var seg = Math.max(16, P.params.quality.segments | 0);
		var geo = new THREE.SphereGeometry(1, seg, Math.max(12, seg >> 1));

		if (!this.ballUniforms) {
			var pos = [], down = [], prm = [];
			for (var i = 0; i < MAX_SHADOWS; i++) {
				pos.push(new THREE.Vector3(0, 1, 0));
				down.push(new THREE.Vector3(0, 0, 1));
				prm.push(new THREE.Vector4(0, 1, 1, 0.17));
			}
			this.ballUniforms = {
				uTime: { type: 'f', value: 0 },
				uSep: { type: 'f', value: 1.9 },
				uWakeSpeed: { type: 'f', value: 0.2 },
				uRecirc: { type: 'f', value: 0.55 },
				uSwirl: { type: 'f', value: 0.9 },
				uShedHz: { type: 'f', value: 0.06 },
				uNose: { type: 'f', value: 1.0 },
				uLimb: { type: 'f', value: 1.55 },
				uEddy: { type: 'f', value: 0.55 },
				uEddyScale: { type: 'f', value: 4.5 },
				uChop: { type: 'f', value: 0.85 },
				uChopScale: { type: 'f', value: 1 },
				uPaint: { type: 'f', value: 1 },
				uPanels: { type: 'f', value: 1 },
				uRadius: { type: 'f', value: 90 },
				uWindScale: { type: 'f', value: 1 },
				uWindDir: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
				uRefA: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
				uRefB: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
				uSun: { type: 'v3', value: this.sun },
				uShadowCount: { type: 'i', value: 2 },
				uShadowPos: { type: 'v3v', value: pos },
				uShadowDown: { type: 'v3v', value: down },
				uShadowParams: { type: 'v4v', value: prm }
			};
		}

		var mat = this.ballMaterial || (this.ballMaterial = new THREE.ShaderMaterial({
			uniforms: this.ballUniforms,
			vertexShader: BALL_VERT,
			fragmentShader: BALL_FRAG
		}));

		this.ball = new THREE.Mesh(geo, mat);
		this.scene.add(this.ball);
	};

	Render.buildWindSource = function () {
		this.windSource = new THREE.Group();
		var core = new THREE.Mesh(
			new THREE.SphereGeometry(1, 16, 12),
			new THREE.MeshBasicMaterial({ color: 0xbfe8ff })
		);
		this.windSource.add(core);
		var halo = new THREE.Mesh(
			new THREE.SphereGeometry(2.6, 16, 12),
			new THREE.MeshBasicMaterial({ color: 0x3a7fb0, transparent: true, opacity: 0.22, side: THREE.BackSide })
		);
		this.windSource.add(halo);
		this.scene.add(this.windSource);
	};

	// A hull, a mast, two sails and a burgee — built once at unit length and
	// scaled by the boat length, which itself follows the ball's radius.
	Render.buildBoat = function (hullColor, sailColor) {
		var group = new THREE.Group();
		group.matrixAutoUpdate = false;

		// A hull tapered to a point at both ends, sat low enough that only her
		// topsides show above the water.
		var hullGeo = new THREE.SphereGeometry(0.5, 16, 10);
		for (var i = 0; i < hullGeo.vertices.length; i++) {
			var v = hullGeo.vertices[i];
			var taper = 1 - 0.90 * Math.pow(Math.abs(v.z) / 0.5, 2.2);
			var sheer = v.y > 0 ? 1.25 : 1.0;          // flare above the waterline
			v.x *= 0.26 * taper;
			v.y *= 0.30 * taper * sheer;
		}
		hullGeo.computeFaceNormals();
		hullGeo.computeVertexNormals();
		var hull = new THREE.Mesh(hullGeo, new THREE.MeshPhongMaterial({
			color: hullColor, shininess: 24, specular: 0x223344
		}));
		hull.position.y = -0.015;
		group.add(hull);

		var stripe = new THREE.Mesh(
			new THREE.SphereGeometry(0.5, 16, 6, 0, Math.PI * 2, Math.PI * 0.40, Math.PI * 0.13),
			new THREE.MeshPhongMaterial({ color: 0x1a2634 })
		);
		stripe.scale.set(0.265, 0.31, 1.004);
		stripe.position.y = -0.015;
		group.add(stripe);

		var mast = new THREE.Mesh(
			new THREE.CylinderGeometry(0.008, 0.013, 1.15, 6),
			new THREE.MeshPhongMaterial({ color: 0xd8c9a8 })
		);
		mast.position.set(0, 0.60, 0.04);
		group.add(mast);

		var sailMat = new THREE.MeshPhongMaterial({
			color: sailColor, side: THREE.DoubleSide, shininess: 4, emissive: 0x141821
		});

		var mainPivot = new THREE.Group();
		mainPivot.position.set(0, 0.05, 0.04);
		mainPivot.add(this.buildSail(0.40, 0.88, 0.10, sailMat, -1));
		group.add(mainPivot);

		var jibPivot = new THREE.Group();
		jibPivot.position.set(0, 0.05, 0.40);
		jibPivot.add(this.buildSail(0.26, 0.56, 0.08, sailMat, 1));
		group.add(jibPivot);

		var burgeeGeo = new THREE.Geometry();
		burgeeGeo.vertices.push(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0.05, 0.16), new THREE.Vector3(0, -0.03, 0.15));
		burgeeGeo.faces.push(new THREE.Face3(0, 1, 2));
		burgeeGeo.computeFaceNormals();
		var burgee = new THREE.Mesh(burgeeGeo, new THREE.MeshBasicMaterial({
			color: 0xff5533, side: THREE.DoubleSide
		}));
		burgee.position.set(0, 1.15, 0.04);
		group.add(burgee);

		return { group: group, mainPivot: mainPivot, jibPivot: jibPivot, burgee: burgee, hull: hull };
	};

	// A cambered sail. `dir` is -1 for a sail that hangs aft of its pivot (the
	// main) and +1 for one that hangs forward of it (the jib).
	Render.buildSail = function (foot, height, camber, mat, dir) {
		var geo = new THREE.PlaneGeometry(foot, height, 6, 6);
		for (var i = 0; i < geo.vertices.length; i++) {
			var v = geo.vertices[i];
			var u = (v.x / foot) + 0.5;
			var h = (v.y / height) + 0.5;
			v.z = Math.sin(u * Math.PI) * camber * (1 - 0.35 * h);
			v.x *= 1 - 0.45 * h;                 // roach taper towards the head
		}
		geo.computeFaceNormals();
		geo.computeVertexNormals();
		var mesh = new THREE.Mesh(geo, mat);
		mesh.rotation.y = Math.PI / 2;           // swing the panel into the fore-and-aft plane
		mesh.position.set(0, height * 0.5, dir * foot * 0.5);
		return mesh;
	};

	Render.buildWakes = function () {
		this.wakes = [];
		for (var i = 0; i < P.World.boats.length; i++) {
			var geo = new THREE.BufferGeometry();
			geo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(48 * 2 * 3), 3));
			var mat = new THREE.LineBasicMaterial({
				color: 0x9fd8ff, transparent: true, opacity: 0.35, linewidth: 1
			});
			var line = new THREE.LineSegments(geo, mat);
			line.frustumCulled = false;
			this.scene.add(line);
			this.wakes.push(line);
		}
	};

	Render.buildCones = function () {
		var STATIONS = 26;
		this.cones = [];
		for (var i = 0; i < P.World.boats.length; i++) {
			var geo = new THREE.BufferGeometry();
			geo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(STATIONS * 2 * 3), 3));
			var idx = [];
			for (var s = 0; s < STATIONS - 1; s++) {
				var a = s * 2, b = s * 2 + 1, c = (s + 1) * 2, d = (s + 1) * 2 + 1;
				idx.push(a, b, c, b, d, c);
			}
			geo.setIndex(new THREE.BufferAttribute(new Uint16Array(idx), 1));
			var mesh = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({
				color: 0x0a1420, transparent: true, opacity: 0.34, side: THREE.DoubleSide, depthWrite: false
			}));
			mesh.frustumCulled = false;
			mesh.visible = false;
			this.scene.add(mesh);
			this.cones.push({ mesh: mesh, stations: STATIONS });
		}
	};

	// ---- per-frame -----------------------------------------------------------

	var _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
	var _p = new THREE.Vector3(), _q = new THREE.Vector3(), _k = new THREE.Vector3();
	var _eye = new THREE.Vector3(), _look = new THREE.Vector3(), _axis = new THREE.Vector3();

	Render.update = function (dt) {
		var R = P.params.world.radius;
		var L = P.boatLength();

		this.ball.scale.set(R, R, R);
		this.sky.scale.set(R * 26, R * 26, R * 26);
		this.camera.far = R * 60;
		this.camera.near = Math.max(0.05, L * 0.02);
		this.camera.updateProjectionMatrix();

		this.updateBallUniforms(R);
		this.updateWindSource(R);

		for (var i = 0; i < P.World.boats.length; i++) {
			this.placeBoat(P.World.boats[i], this.boats[i], R, L);
			this.updateWake(P.World.boats[i], this.wakes[i], R, L);
			this.updateCone(P.World.boats[i], this.cones[i], R);
		}
		this.hideOverTheCurve(R, L);
		this.updateGunnery(R, L);

		P.Streamers.update(dt);
		this.updateCamera(dt, R, L);

		// Pin the sky to the eye so the stars sit at infinity. Left at the origin
		// they had parallax against a boat crossing the ball, which read as the
		// whole sky sliding past at the speed of a country lane. They still turn
		// with the camera, which is honest, but they no longer travel.
		this.sky.position.copy(this.camera.position);
		this.sky.material.uniforms.uStars.value = P.params.view.stars;

		this.renderer.render(this.scene, this.camera);
	};

	Render.updateBallUniforms = function (R) {
		var u = this.ballUniforms, w = P.params.wind, q = P.params.quality;
		u.uTime.value = P.World.time;
		u.uSep.value = w.separationDeg * P.DEG;
		u.uWakeSpeed.value = w.wakeSpeed;
		u.uRecirc.value = w.recirc;
		u.uSwirl.value = w.swirl;
		u.uShedHz.value = w.shedHz;
		u.uNose.value = w.noseFrac;
		u.uLimb.value = w.limbFrac;
		u.uEddy.value = w.eddy;
		u.uEddyScale.value = w.eddyScale;
		u.uChop.value = P.params.sea.chop;
		u.uChopScale.value = P.params.sea.chopScale;
		u.uPaint.value = q.paint ? 1 : 0;
		u.uPanels.value = P.params.view.panels ? 1 : 0;
		u.uRadius.value = R;
		u.uWindDir.value.copy(P.Wind.dir);
		u.uRefA.value.copy(P.Wind.refA);
		u.uRefB.value.copy(P.Wind.refB);

		var n = Math.min(q.paintShadows | 0, MAX_SHADOWS, P.World.shadows.length);
		u.uShadowCount.value = n;
		for (var i = 0; i < MAX_SHADOWS; i++) {
			var prm = u.uShadowParams.value[i];
			if (i < n) {
				var s = P.World.shadows[i];
				u.uShadowPos.value[i].copy(s.pos);
				u.uShadowDown.value[i].copy(s.down);
				prm.set(s.strength, s.length, s.sigma0, s.spread);
			} else {
				prm.set(0, 1, 1, 0.17);
			}
		}
	};

	Render.updateWindSource = function (R) {
		var d = R * 3.4;
		this.windSource.position.copy(P.Wind.source).multiplyScalar(d);
		var s = R * 0.05;
		this.windSource.scale.set(s, s, s);
	};

	Render.placeBoat = function (boat, view, R, L) {
		_y.copy(boat.pos);
		_z.copy(boat.head);
		_x.crossVectors(_y, _z).normalize();

		// Lay her over to LEEWARD, hard on the breeze and easier off it. A positive
		// rotation of her up-vector about her heading tips the mast to starboard,
		// so wind over starboard (twa > 0) has to come out negative.
		var heel = P.STARBOARD * 0.34 * P.clamp(boat.windSpeed / 16, 0, 1.2) *
			Math.sin(boat.twa * P.DEG) * (boat.stalled ? 0.3 : 1);
		if (heel !== 0) {
			P.rotateAbout(_y, _z, heel);
			P.rotateAbout(_x, _z, heel);
		}

		var m = view.group.matrix;
		m.makeBasis(_x, _y, _z);
		m.scale(_q.set(L, L, L));
		_p.copy(boat.pos).multiplyScalar(R + L * 0.06);
		m.setPosition(_p);
		view.group.matrixWorldNeedsUpdate = true;

		// Boom to leeward, swung out by however much sheet is eased. rotation.y
		// swings the boom to STARBOARD when positive (the model's local +X is the
		// port side here), so wind over starboard has to drive it negative.
		var side = boat.twa >= 0 ? -1 : 1;
		var sheet = boat.sheet * P.DEG * side;
		view.mainPivot.rotation.y = sheet;
		view.jibPivot.rotation.y = sheet * 0.75;

		// The burgee streams with the apparent wind — awa is starboard-positive
		// and rotation.y is port-positive, hence the sign.
		view.burgee.rotation.y = -(boat.awa + 180) * P.DEG;

		// A stalled boat's sails go soft; a struck one's collapse altogether.
		var lively = P.clamp(boat.windSpeed / 6, 0.15, 1);
		if (boat.struck) lively = 0.05;
		view.mainPivot.scale.set(0.6 + 0.4 * lively, 1, 1);
		view.jibPivot.scale.set(0.6 + 0.4 * lively, boat.struck ? 0.25 : 1, 1);
		view.burgee.visible = !boat.struck;

		// A shot going home lights her up for half a second.
		if (view.hull && view.hull.material.emissive) {
			var flash = P.clamp(boat.hitFlash || 0, 0, 1);
			view.hull.material.emissive.setRGB(flash * 0.9, flash * 0.25, flash * 0.05);
		}
	};

	Render.updateGunnery = function (R, L) {
		if (!P.Guns) return;
		var i, shots = P.Guns.shots, splashes = P.Guns.splashes;

		for (i = 0; i < this.shotPool.length; i++) {
			var ball = this.shotPool[i];
			if (i < shots.length) {
				ball.position.copy(shots[i].pos);
				var s = L * 0.05;
				ball.scale.set(s, s, s);
				ball.visible = true;
			} else ball.visible = false;
		}

		for (i = 0; i < this.splashPool.length; i++) {
			var mesh = this.splashPool[i];
			if (i < splashes.length) {
				var sp = splashes[i];
				var f = P.clamp(sp.age / 1.1, 0, 1);
				mesh.position.copy(sp.pos);
				// A hit throws a shorter, brighter burst than a splash alongside.
				var grow = L * (sp.hit ? 0.16 : 0.10) * (1 + f * (sp.hit ? 1.6 : 3.2));
				mesh.scale.set(grow, grow, grow);
				mesh.material.color.setHex(sp.hit ? 0xffc98a : 0xdff2ff);
				mesh.material.opacity = 0.55 * (1 - f) * (1 - f);
				mesh.visible = true;
			} else mesh.visible = false;
		}
	};

	// Sink the rival as she goes over the curve.
	//
	// The sphere is convex, so depth alone hides her from a camera down at deck
	// level — but the moment you lift the camera at all she comes back, and her
	// wake (drawn on the surface, no depth test to speak of) never hid at all.
	// Both went straight through the "she is genuinely gone" rule. She is pushed
	// down through the surface in proportion to how much of her is below your
	// horizon, so she goes truck-last and comes back truck-first.
	Render.hideOverTheCurve = function (R, L) {
		var view = this.boats[1];
		if (!view) return;
		var under = P.World.rivalHidden();         // 0 in full view, 1 fully gone
		var drop = under * L * 1.6;

		if (drop > 0.0001) {
			_p.copy(P.World.rival.pos).multiplyScalar(R + L * 0.06 - drop);
			view.group.matrix.setPosition(_p);
			view.group.matrixWorldNeedsUpdate = true;
		}
		view.group.visible = under < 0.999;

		// Her wake is a line lying on the water, so it cannot sink out of sight —
		// fade it out over the same stretch instead.
		var wake = this.wakes[1];
		if (wake) {
			wake.material.opacity = 0.35 * (1 - under);
			wake.visible = under < 0.999;
		}
	};

	Render.updateWake = function (boat, line, R, L) {
		var trail = boat.trail;
		var arr = line.geometry.attributes.position.array;
		var n = 0;
		for (var i = 1; i < trail.length; i++) {
			var a = trail[i - 1], b = trail[i];
			var r = R + L * 0.02;
			arr[n++] = a.x * r; arr[n++] = a.y * r; arr[n++] = a.z * r;
			arr[n++] = b.x * r; arr[n++] = b.y * r; arr[n++] = b.z * r;
		}
		line.geometry.setDrawRange(0, Math.max(0, (trail.length - 1) * 2));
		line.geometry.attributes.position.needsUpdate = true;
	};

	Render.updateCone = function (boat, cone, R) {
		cone.mesh.visible = !!P.params.view.cones;
		if (!cone.mesh.visible) return;

		var s = boat.shadow;
		var arr = cone.mesh.geometry.attributes.position.array;
		var N = cone.stations;
		// K is the pole of the great circle running downwind from her transom:
		// rotating about it walks along the shadow's centreline, and K itself is
		// the sideways direction at every point on that line.
		_k.crossVectors(s.pos, s.down).normalize();
		var r = R * 1.0015;

		for (var i = 0, o = 0; i < N; i++) {
			var f = i / (N - 1);
			var along = f * s.length;
			var half = 1.7 * (s.sigma0 + s.spread * along);
			_p.copy(s.pos);
			P.rotateAbout(_p, _k, along / R);
			_axis.crossVectors(_p, _k).normalize();
			for (var side = -1; side <= 1; side += 2) {
				_q.copy(_p);
				P.rotateAbout(_q, _axis, side * half / R);
				arr[o++] = _q.x * r; arr[o++] = _q.y * r; arr[o++] = _q.z * r;
			}
		}
		cone.mesh.geometry.attributes.position.needsUpdate = true;
	};

	// ---- camera --------------------------------------------------------------

	// The orbit camera turns round your own boat rather than round the centre of
	// the ball, so pulling back keeps her in frame instead of swinging her away.
	//
	// The zoom is FREE: from close enough to read her nameboard out to the whole
	// ball hanging in space. It was leashed at first to stop you cheating the
	// horizon, but that turned out to be the wrong place to enforce it. Hiding is
	// enforced on the model, in Render.hideOverTheCurve, against the PLAYER's
	// masthead horizon rather than the camera's: the rival is pushed down through
	// the surface when she is over the curve, so she stays gone no matter where
	// you put the eye. The camera can go anywhere precisely because the rule does
	// not depend on it.
	var ORBIT = { minDist: 0.8, maxDist: 60, minPhi: -0.35, maxPhi: 1.45 };

	Render.updateCamera = function (dt, R, L) {
		var boat = P.World.player;
		var mode = P.params.view.camera;

		if (mode === 'orbit') {
			var d = P.clamp(this.orbit.dist, ORBIT.minDist, ORBIT.maxDist) * L;

			// The one stop worth keeping. A fixed negative elevation is fine up
			// close, but at fifty boat lengths the same angle drops the eye clean
			// through the ball and you end up looking at the back of the world.
			// Hold it to half a boat length under the boat's own tangent plane,
			// whatever the range, which keeps a true sea-level view available
			// close in without letting a long pull-back go subsurface.
			var lowStop = Math.max(ORBIT.minPhi, -Math.asin(P.clamp(L * 0.5 / d, 0, 1)));
			var phi = P.clamp(this.orbit.phi, lowStop, ORBIT.maxPhi);
			var th = this.orbit.theta;

			// A local frame at the boat: forward, starboard, up.
			_z.copy(boat.head);
			_y.copy(boat.pos);
			_x.crossVectors(_z, _y).normalize();          // starboard

			_eye.copy(_z).multiplyScalar(Math.cos(phi) * Math.cos(th))
				.addScaledVector(_x, Math.cos(phi) * Math.sin(th))
				.addScaledVector(_y, Math.sin(phi))
				.multiplyScalar(d)
				.addScaledVector(boat.pos, R + L * 0.35);

			// Never let her dip below the sea, however low the elevation stop is.
			var alt = _eye.length() - R;
			if (alt < L * 0.35) _eye.multiplyScalar((R + L * 0.35) / _eye.length());

			_look.copy(boat.pos).multiplyScalar(R + L * 0.30);
			this.camUp.copy(boat.pos);
		} else if (mode === 'mast') {
			_eye.copy(boat.pos).multiplyScalar(R + L * 1.25);
			_axis.crossVectors(boat.pos, boat.head).normalize();
			_look.copy(boat.pos);
			P.rotateAbout(_look, _axis, P.World.horizonAngle(L * 1.25) * 0.9);
			_look.multiplyScalar(R);
			this.camUp.copy(boat.pos);
		} else {
			_axis.crossVectors(boat.pos, boat.head).normalize();
			_p.copy(boat.pos);
			P.rotateAbout(_p, _axis, -(L * 4.6) / R);
			_eye.copy(_p).multiplyScalar(R + L * 1.9);
			_q.copy(boat.pos);
			P.rotateAbout(_q, _axis, (L * 7.0) / R);
			_look.copy(_q).multiplyScalar(R + L * 0.4);
			this.camUp.copy(boat.pos);
		}

		if (!this.camReady) {
			this.camEye.copy(_eye); this.camLook.copy(_look); this.camReady = true;
		} else {
			var k = 1 - Math.exp(-dt * (mode === 'orbit' ? 6 : 4.5));
			this.camEye.lerp(_eye, k);
			this.camLook.lerp(_look, k);
		}

		this.camera.position.copy(this.camEye);
		this.camera.up.copy(this.camUp);
		this.camera.lookAt(this.camLook);
	};

	Render.bindOrbit = function () {
		var el = this.renderer.domElement, o = this.orbit, self = this;
		el.addEventListener('mousedown', function (e) {
			o.drag = true; o.lx = e.clientX; o.ly = e.clientY;
		});
		window.addEventListener('mouseup', function () { o.drag = false; });
		window.addEventListener('mousemove', function (e) {
			if (!o.drag) return;
			o.theta -= (e.clientX - o.lx) * 0.006;
			o.phi = P.clamp(o.phi + (e.clientY - o.ly) * 0.005, ORBIT.minPhi, ORBIT.maxPhi);
			o.lx = e.clientX; o.ly = e.clientY;
			if (P.params.view.camera !== 'orbit') {
				P.params.view.camera = 'orbit';
				if (self.onCameraChanged) self.onCameraChanged();
			}
		});

		// The wheel pulls back, as far as the leash goes and no further. It is
		// deliberately inert outside orbit mode: a trackpad scroll while you are
		// trimming in the follow camera should do nothing at all, rather than
		// silently move a camera you cannot see moving.
		el.addEventListener('wheel', function (e) {
			if (P.params.view.camera !== 'orbit') return;
			o.dist = P.clamp(o.dist * (1 + (e.deltaY > 0 ? 0.12 : -0.12)), ORBIT.minDist, ORBIT.maxDist);
			e.preventDefault();
		}, { passive: false });
	};

	Render.resize = function (w, h) {
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, P.params.quality.pixelRatio));
		this.renderer.setSize(w, h);
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
	};
})(window.PLANET);
