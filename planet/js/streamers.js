// Streamlines: the wind made visible.
//
// Two systems, one idea. Surface streamers crawl over the skin of the ball and
// show you the wind you can actually sail in — including the dead patches the
// boats drag behind them. Space streaks fly past out in the void and show the
// same air parting around the ball in three dimensions.
//
// Both are ring buffers. A streamer's history slots never move, so each step
// only rewrites the one segment that just grew and blanks the seam behind it —
// O(streamers) per frame, not O(streamers x trail). The fade along the tail is
// done in the vertex shader from a birth-tick attribute, for the same reason.
(function (P) {
	'use strict';

	var LINE_VERT = [
		'attribute vec3 aColor;',
		'attribute float aBirth;',
		'uniform float uTick;',
		'uniform float uTrail;',
		'varying vec3 vCol;',
		'void main() {',
		'  float age = (uTick - aBirth) / uTrail;',
		'  float f = clamp(1.0 - age, 0.0, 1.0);',
		'  vCol = aColor * f * f;',
		'  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
		'}'
	].join('\n');

	var LINE_FRAG = [
		'precision mediump float;',
		'varying vec3 vCol;',
		'void main() { gl_FragColor = vec4(vCol, 1.0); }'
	].join('\n');

	// Same ramp the water is painted with, so a streamer's colour and the patch
	// of sea under it always agree.
	function ramp(out, i, s, gain) {
		var t = P.clamp(s / 1.5, 0, 1);
		var r, g, b;
		if (t < 0.5) {
			var u = t * 2;
			r = P.lerp(0.05, 0.07, u); g = P.lerp(0.06, 0.42, u); b = P.lerp(0.16, 0.52, u);
		} else {
			var v = (t - 0.5) * 2;
			r = P.lerp(0.07, 0.62, v); g = P.lerp(0.42, 0.87, v); b = P.lerp(0.52, 0.96, v);
		}
		out[i] = r * gain; out[i + 1] = g * gain; out[i + 2] = b * gain;
	}

	function makeSystem(count, trail) {
		var geo = new THREE.BufferGeometry();
		var verts = count * trail * 2;
		geo.addAttribute('position', new THREE.BufferAttribute(new Float32Array(verts * 3), 3));
		geo.addAttribute('aColor', new THREE.BufferAttribute(new Float32Array(verts * 3), 3));
		geo.addAttribute('aBirth', new THREE.BufferAttribute(new Float32Array(verts), 1));
		var mat = new THREE.ShaderMaterial({
			uniforms: { uTick: { type: 'f', value: 0 }, uTrail: { type: 'f', value: trail } },
			vertexShader: LINE_VERT,
			fragmentShader: LINE_FRAG,
			blending: THREE.AdditiveBlending,
			transparent: true,
			depthWrite: false
		});
		var line = new THREE.LineSegments(geo, mat);
		line.frustumCulled = false;
		return line;
	}

	var S = P.Streamers = {
		tick: 0,
		enabled: true
	};

	S.init = function (scene) {
		this.scene = scene;
		this.rebuild();
	};

	S.rebuild = function () {
		var q = P.params.quality;
		var count = Math.max(16, q.streamers | 0);
		var trail = Math.max(4, q.trail | 0);
		var spaceCount = Math.max(8, Math.round(count / 7));
		var spaceTrail = Math.max(4, Math.round(trail * 0.6));

		if (this.surface) { this.scene.remove(this.surface.line); this.surface.line.geometry.dispose(); }
		if (this.space) { this.scene.remove(this.space.line); this.space.line.geometry.dispose(); }

		this.surface = this.makeState(count, trail);
		this.space = this.makeState(spaceCount, spaceTrail);
		this.surface.gain = 1;
		this.space.gain = 0.45;         // out in the void they are scenery, not instruments
		this.scene.add(this.surface.line);
		this.scene.add(this.space.line);

		for (var i = 0; i < count; i++) this.seedSurface(i, true);
		for (var j = 0; j < spaceCount; j++) this.seedSpace(j, true);
	};

	S.makeState = function (count, trail) {
		return {
			count: count,
			trail: trail,
			line: makeSystem(count, trail),
			hist: new Float32Array(count * trail * 3),
			speed: new Float32Array(count * trail),
			ptr: new Int32Array(count),
			age: new Int32Array(count),
			life: new Int32Array(count)
		};
	};

	// ---- surface -------------------------------------------------------------

	var _p = new THREE.Vector3(), _w = new THREE.Vector3(), _axis = new THREE.Vector3();

	// Mostly windward-biased — pick a few candidates and take the breeziest, so
	// the streamers start where the air is doing something. But a quarter of them
	// are seeded blind, which is what keeps a few slow ones crawling around the
	// sheltered lee where the back-eddies live.
	S.seedSurface = function (i, initial) {
		var st = this.surface;
		var best = null, bestSpeed = -1;
		var tries = Math.random() < 0.25 ? 1 : (initial ? 3 : 4);
		for (var k = 0; k < tries; k++) {
			var z = Math.random() * 2 - 1;
			var a = Math.random() * P.TAU;
			var r = Math.sqrt(Math.max(0, 1 - z * z));
			_p.set(r * Math.cos(a), z, r * Math.sin(a));
			P.Wind.sample(_w, _p, null, -1);
			var sp = _w.length();
			if (sp > bestSpeed) { bestSpeed = sp; best = _p.clone(); }
		}
		this.resetStreamer(st, i, best, bestSpeed / Math.max(0.01, P.params.wind.speedKts));
		// Long enough to carry a streamer most of the way round the ball, so the
		// flow reads as one continuous thing rather than a field of dashes.
		st.life[i] = st.trail * 5 + Math.floor(Math.random() * st.trail * 10);
	};

	// ---- space ---------------------------------------------------------------

	// Positions here are in ball radii, so the whole system just scales when the
	// radius slider moves.
	S.seedSpace = function (i) {
		var st = this.space;
		var d = P.Wind.dir;
		var a = Math.random() * P.TAU;
		// Outside the ball's silhouette, so they part around it in front of your
		// eyes instead of smearing across its face.
		var rad = 1.15 + Math.sqrt(Math.random()) * 1.75;
		_p.copy(P.Wind.refA).multiplyScalar(Math.cos(a) * rad)
			.addScaledVector(P.Wind.refB, Math.sin(a) * rad)
			.addScaledVector(d, -(2.8 + Math.random() * 1.6));
		this.resetStreamer(st, i, _p.clone(), 1);
		st.life[i] = st.trail + Math.floor(Math.random() * st.trail * 3);
	};

	S.resetStreamer = function (st, i, pos, speedNorm) {
		var T = st.trail;
		st.ptr[i] = 0;
		st.age[i] = 0;
		var base = i * T * 3;
		for (var s = 0; s < T; s++) {
			st.hist[base + s * 3] = pos.x;
			st.hist[base + s * 3 + 1] = pos.y;
			st.hist[base + s * 3 + 2] = pos.z;
			st.speed[i * T + s] = speedNorm;
		}
		// Blank every segment this streamer owns; it will grow them back one per step.
		var arr = st.line.geometry.attributes.position.array;
		var o = i * T * 2 * 3;
		for (var v = 0; v < T * 2; v++) {
			arr[o + v * 3] = pos.x; arr[o + v * 3 + 1] = pos.y; arr[o + v * 3 + 2] = pos.z;
		}
	};

	// ---- stepping ------------------------------------------------------------

	S.update = function (dt) {
		var visible = !!P.params.view.streamers;
		this.surface.line.visible = visible;
		this.space.line.visible = visible;
		if (!visible || P.params.sim.paused) return;

		var R = P.params.world.radius;
		this.surface.line.scale.set(R * 1.0012, R * 1.0012, R * 1.0012);
		this.space.line.scale.set(R, R, R);

		var steps = Math.max(1, P.params.quality.substeps | 0);
		var sub = dt / steps;
		for (var s = 0; s < steps; s++) {
			this.tick++;
			this.stepSurface(sub, R);
			this.stepSpace(sub, R);
		}

		this.surface.line.material.uniforms.uTick.value = this.tick;
		this.surface.line.material.uniforms.uTrail.value = this.surface.trail;
		this.space.line.material.uniforms.uTick.value = this.tick;
		this.space.line.material.uniforms.uTrail.value = this.space.trail;

		this.surface.line.geometry.attributes.position.needsUpdate = true;
		this.surface.line.geometry.attributes.aColor.needsUpdate = true;
		this.surface.line.geometry.attributes.aBirth.needsUpdate = true;
		this.space.line.geometry.attributes.position.needsUpdate = true;
		this.space.line.geometry.attributes.aColor.needsUpdate = true;
		this.space.line.geometry.attributes.aBirth.needsUpdate = true;
	};

	S.stepSurface = function (dt, R) {
		var st = this.surface, T = st.trail;
		var U = Math.max(0.01, P.params.wind.speedKts);
		var shadows = P.World.shadows;

		for (var i = 0; i < st.count; i++) {
			var p = st.ptr[i], base = i * T * 3;
			_p.set(st.hist[base + p * 3], st.hist[base + p * 3 + 1], st.hist[base + p * 3 + 2]);

			P.Wind.sample(_w, _p, shadows, -1);
			var speed = _w.length();

			if (speed > 1e-4) {
				// Walk along the great circle the local wind is pointing down.
				_axis.crossVectors(_p, _w).normalize();
				P.rotateAbout(_p, _axis, speed * dt / R);
				_p.normalize();
			}

			var q = (p + 1) % T;
			st.hist[base + q * 3] = _p.x;
			st.hist[base + q * 3 + 1] = _p.y;
			st.hist[base + q * 3 + 2] = _p.z;
			st.speed[i * T + q] = speed / U;

			this.writeSegment(st, i, p, q);
			st.ptr[i] = q;
			st.age[i]++;

			// Retire her when she is old, or when she has crawled into a corner of
			// the lee where nothing moves — otherwise they all pile up down there.
			if (st.age[i] > st.life[i] || (speed / U < 0.02 && st.age[i] > T)) this.seedSurface(i, false);
		}
	};

	S.stepSpace = function (dt, R) {
		var st = this.space, T = st.trail;
		var U = Math.max(0.01, P.params.wind.speedKts);

		for (var i = 0; i < st.count; i++) {
			var p = st.ptr[i], base = i * T * 3;
			_p.set(st.hist[base + p * 3], st.hist[base + p * 3 + 1], st.hist[base + p * 3 + 2]);

			P.Wind.sample3D(_w, _p);
			var speed = _w.length();
			_p.addScaledVector(_w, dt / R);

			var q = (p + 1) % T;
			st.hist[base + q * 3] = _p.x;
			st.hist[base + q * 3 + 1] = _p.y;
			st.hist[base + q * 3 + 2] = _p.z;
			st.speed[i * T + q] = speed / U;

			this.writeSegment(st, i, p, q);
			st.ptr[i] = q;
			st.age[i]++;

			var downwind = _p.dot(P.Wind.dir);
			if (st.age[i] > st.life[i] || downwind > 3.4 || _p.length() > 6) this.seedSpace(i);
		}
	};

	// Grow the segment from slot `a` to slot `b`, and collapse the one in front
	// of it so the ring never draws a line across its own seam.
	S.writeSegment = function (st, i, a, b) {
		var T = st.trail;
		var pos = st.line.geometry.attributes.position.array;
		var col = st.line.geometry.attributes.aColor.array;
		var birth = st.line.geometry.attributes.aBirth.array;
		var hb = i * T * 3, sb = i * T;

		var seg = (i * T + a) * 2;
		var o = seg * 3;
		pos[o] = st.hist[hb + a * 3]; pos[o + 1] = st.hist[hb + a * 3 + 1]; pos[o + 2] = st.hist[hb + a * 3 + 2];
		pos[o + 3] = st.hist[hb + b * 3]; pos[o + 4] = st.hist[hb + b * 3 + 1]; pos[o + 5] = st.hist[hb + b * 3 + 2];
		ramp(col, o, st.speed[sb + a], st.gain);
		ramp(col, o + 3, st.speed[sb + b], st.gain);
		birth[seg] = this.tick;
		birth[seg + 1] = this.tick;

		var dead = (i * T + b) * 2, d = dead * 3;
		pos[d] = pos[d + 3] = st.hist[hb + b * 3];
		pos[d + 1] = pos[d + 4] = st.hist[hb + b * 3 + 1];
		pos[d + 2] = pos[d + 5] = st.hist[hb + b * 3 + 2];
	};
})(window.PLANET);
