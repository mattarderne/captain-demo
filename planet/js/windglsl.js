// The wind field, in GLSL, in ONE place.
//
// Three things now need to evaluate the same field: the ball's fragment shader
// paints it, the smoke simulation advects dye through it, and windfield.js
// decides what the boats actually feel. The first two are shaders and share
// this source; the third is the JS in windfield.js and has to be kept in step
// by hand. There is exactly one copy of the GLSL so at least the two shaders
// can never drift apart, which they had already started to do.
(function (P) {
	'use strict';

	var MAX_SHADOWS = 4;

	var GLSL = P.GLSL = { MAX_SHADOWS: MAX_SHADOWS };

	// Everything the functions below read. Both shaders declare exactly this.
	GLSL.uniforms = [
		'const int MAX_BLANKETS = ' + MAX_SHADOWS + ';',
		'uniform float uTime, uSep, uWakeSpeed, uRecirc, uSwirl, uShedHz, uLeeDrift;',
		'uniform float uNose, uLimb, uEddy, uEddyScale, uRadius;',
		'uniform float uShadowBend, uShadowEddy, uShadowPitch, uShadowShed;',
		'uniform vec3 uWindDir, uRefA, uRefB;',
		'uniform int uShadowCount;',
		'uniform vec3 uShadowPos[MAX_BLANKETS];',
		'uniform vec3 uShadowDown[MAX_BLANKETS];',
		'uniform vec4 uShadowParams[MAX_BLANKETS];'   // strength, length, sigma0, spread
	].join('\n');

	GLSL.wind = [
		// Mirrors PLANET.Wind.eddyAt.
		'float leeNoise(vec3 n, float t, float phi) {',
		'  float k = uEddyScale;',
		'  float shed = sin(uShedHz * t * 6.2831853 + phi * 2.0);',
		'  float fine = sin(n.x * k * 3.1 + t * 0.91) * sin(n.y * k * 2.3 - t * 0.69)',
		'             * sin(n.z * k * 1.9 + t * 0.40);',
		'  float coarse = sin(n.z * k * 1.4 + 2.0) * sin(n.x * k * 1.0 - t * 0.37)',
		'               * sin(n.y * k * 0.86 + t * 0.22);',
		'  return 0.55 * shed + 0.30 * fine + 0.25 * coarse;',
		'}',

		// Mirrors PLANET.Wind.eddyAt2.
		'float leeNoise2(vec3 n, float t, float phi) {',
		'  float k = uEddyScale;',
		'  float shed = cos(uShedHz * t * 6.2831853 * 0.7 + phi * 3.0 + 1.3);',
		'  float fine = sin(n.y * k * 3.1 + 5.5) * sin(n.z * k * 2.3 - t * 0.66)',
		'             * sin(n.x * k * 1.9 + 1.7);',
		'  return 0.6 * shed + 0.4 * fine;',
		'}',

		'vec3 spinAbout(vec3 v, vec3 axis, float a) {',
		'  return v * cos(a) + cross(axis, v) * sin(a) + axis * dot(axis, v) * (1.0 - cos(a));',
		'}',

		// Value noise. Both the ball (for its fine grain) and the simulation (for
		// the feed over the windward face) want it, so it lives here with
		// everything else they share.
		'float hash31(vec3 p) {',
		'  p = fract(p * 0.3183099 + vec3(0.71, 0.113, 0.419));',
		'  p *= 17.0;',
		'  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));',
		'}',
		'float vnoise(vec3 x) {',
		'  vec3 i = floor(x), f = fract(x);',
		'  f = f * f * (3.0 - 2.0 * f);',
		'  return mix(mix(mix(hash31(i), hash31(i + vec3(1.0, 0.0, 0.0)), f.x),',
		'                 mix(hash31(i + vec3(0.0, 1.0, 0.0)), hash31(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),',
		'             mix(mix(hash31(i + vec3(0.0, 0.0, 1.0)), hash31(i + vec3(1.0, 0.0, 1.0)), f.x),',
		'                 mix(hash31(i + vec3(0.0, 1.0, 1.0)), hash31(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);',
		'}',

		// Speed as a fraction of the free stream. Mirrors Wind.profile.
		'float windSpeedAt(vec3 n) {',
		'  float dn = dot(uWindDir, n);',
		'  float theta = acos(clamp(-dn, -1.0, 1.0));',
		'  float st = max(0.0, sin(theta));',
		'  float potential = uNose + (uLimb - uNose) * st;',
		'  float phi = atan(dot(n, uRefB), dot(n, uRefA));',
		'  float wake = uWakeSpeed * (0.85 + 0.15 * st)',
		'             * clamp(1.0 + uEddy * 0.5 * leeNoise(n, uTime, phi), 0.55, 1.5);',
		'  float blend = smoothstep(uSep - 0.30, uSep + 0.55, theta);',
		'  return mix(potential, wake, blend);',
		'}',

		// Direction on the surface. Downwind along the meridian where the flow is
		// attached; in the lee a mean drift with a varying part running back up
		// the ball, plus the lateral swirl. Mirrors Wind.sample's lee block.
		'vec3 windDirAt(vec3 n) {',
		'  float dn = dot(uWindDir, n);',
		'  vec3 t = uWindDir - n * dn;',
		'  float tl = length(t);',
		'  if (tl < 1e-5) return normalize(cross(n, vec3(0.0, 1.0, 0.0)));',
		'  t /= tl;',
		'  float theta = acos(clamp(-dn, -1.0, 1.0));',
		'  float blend = smoothstep(uSep - 0.30, uSep + 0.55, theta);',
		'  if (blend < 0.002) return t;',
		'  vec3 b = cross(n, t);',
		'  float phi = atan(dot(n, uRefB), dot(n, uRefA));',
		'  float along = mix(1.0, uLeeDrift - uRecirc * (0.5 + 0.5 * leeNoise2(n, uTime, phi)), blend);',
		'  float across = mix(0.0, uSwirl * leeNoise(n, uTime, phi), blend);',
		'  vec3 v = t * along + b * across;',
		'  float vl = length(v);',
		'  return vl > 1e-5 ? v / vl : t;',
		'}',

		// How much a boat's dirty air kills the wind here, 0..1. Mirrors
		// Wind.applyShadows' deficit.
		'float shadowDeficit(vec3 n) {',
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
		'  return def;',
		'}',

		// ...and how much it bends the flow: the squeeze round the edges of the
		// cone plus the vortex street her sails shed. Mirrors the same function.
		'float shadowBend(vec3 n) {',
		'  float bend = 0.0;',
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
		'    if (el < 1e-6) continue;',
		'    e /= el;',
		'    vec3 down = uShadowDown[i];',
		'    float cx = dot(e, down);',
		'    float along = arc * cx;',
		'    if (along < 0.0) continue;',
		'    float across = arc * sqrt(max(0.0, 1.0 - cx * cx));',
		'    float sigma = pr.z + pr.w * along;',
		'    float lat = across / sigma;',
		'    float d = pr.x * exp(-along / pr.y) * exp(-0.5 * lat * lat);',
		'    if (d < 0.002) continue;',
		'    vec3 lateral = normalize(cross(sp, down));',
		'    float side = dot(e, lateral) < 0.0 ? -1.0 : 1.0;',
		'    bend += side * d * uShadowBend * min(1.0, lat);',
		'    float street = sin(along / max(0.4, pr.z * uShadowPitch) - uTime * uShadowShed * 6.2831853);',
		'    bend += street * d * uShadowEddy;',
		'  }',
		'  return bend;',
		'}',

		// The wind actually blowing here: direction, bent by every boat's wake.
		'vec3 windFlowAt(vec3 n) {',
		'  return spinAbout(windDirAt(n), n, shadowBend(n));',
		'}',

		// Equirectangular mapping, shared by the simulation and the ball so a
		// texel written by one is read by the other at exactly the same place.
		'vec2 dirToUv(vec3 n) {',
		'  return vec2(atan(n.x, n.z) / 6.2831853 + 0.5, acos(clamp(n.y, -1.0, 1.0)) / 3.14159265);',
		'}',
		'vec3 uvToDir(vec2 uv) {',
		'  float lon = (uv.x - 0.5) * 6.2831853;',
		'  float lat = uv.y * 3.14159265;',
		'  float s = sin(lat);',
		'  return vec3(s * sin(lon), cos(lat), s * cos(lon));',
		'}'
	].join('\n');

	// One uniform object, shared by reference between the ball material and the
	// simulation, so there is a single place that syncs them from `params`.
	GLSL.makeUniforms = function () {
		var pos = [], down = [], prm = [], i;
		for (i = 0; i < MAX_SHADOWS; i++) {
			pos.push(new THREE.Vector3(0, 1, 0));
			down.push(new THREE.Vector3(0, 0, 1));
			prm.push(new THREE.Vector4(0, 1, 1, 0.17));
		}
		return {
			uTime: { type: 'f', value: 0 },
			uSep: { type: 'f', value: 2.13 },
			uWakeSpeed: { type: 'f', value: 1.0 },
			uRecirc: { type: 'f', value: 0.40 },
			uSwirl: { type: 'f', value: 1.10 },
			uShedHz: { type: 'f', value: 0.10 },
			uLeeDrift: { type: 'f', value: 0.55 },
			uNose: { type: 'f', value: 1.0 },
			uLimb: { type: 'f', value: 1.55 },
			uEddy: { type: 'f', value: 0.35 },
			uEddyScale: { type: 'f', value: 4.5 },
			uRadius: { type: 'f', value: 90 },
			uShadowBend: { type: 'f', value: 0.55 },
			uShadowEddy: { type: 'f', value: 0.42 },
			uShadowPitch: { type: 'f', value: 1.9 },
			uShadowShed: { type: 'f', value: 0.30 },
			uWindDir: { type: 'v3', value: new THREE.Vector3(0, 0, -1) },
			uRefA: { type: 'v3', value: new THREE.Vector3(1, 0, 0) },
			uRefB: { type: 'v3', value: new THREE.Vector3(0, 1, 0) },
			uShadowCount: { type: 'i', value: 2 },
			uShadowPos: { type: 'v3v', value: pos },
			uShadowDown: { type: 'v3v', value: down },
			uShadowParams: { type: 'v4v', value: prm }
		};
	};

	// Pull the current `params` into a uniform set made above.
	GLSL.sync = function (u) {
		var w = P.params.wind, sh = P.params.shadow;
		u.uTime.value = P.World.time;
		u.uSep.value = w.separationDeg * P.DEG;
		u.uWakeSpeed.value = w.wakeSpeed;
		u.uRecirc.value = w.recirc;
		u.uSwirl.value = w.swirl;
		u.uShedHz.value = w.shedHz;
		u.uLeeDrift.value = w.leeDrift;
		u.uNose.value = w.noseFrac;
		u.uLimb.value = w.limbFrac;
		u.uEddy.value = w.eddy;
		u.uEddyScale.value = w.eddyScale;
		u.uRadius.value = P.params.world.radius;
		u.uShadowBend.value = sh.bend;
		u.uShadowEddy.value = sh.eddy;
		u.uShadowPitch.value = sh.eddyPitch;
		u.uShadowShed.value = sh.shedHz;
		u.uWindDir.value.copy(P.Wind.dir);
		u.uRefA.value.copy(P.Wind.refA);
		u.uRefB.value.copy(P.Wind.refB);

		var n = Math.min(P.params.quality.paintShadows | 0, MAX_SHADOWS, P.World.shadows.length);
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
})(window.PLANET);
