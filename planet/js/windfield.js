// The wind field.
//
// The ball is a sphere moving through air (equivalently: air blowing past a
// sphere) from a source point out in space. Three things stack up:
//
//   1. POTENTIAL FLOW round a sphere. Surface speed is 1.5 * U * sin(theta),
//      where theta is the angle from the windward stagnation point. So: dead
//      calm on the nose of the ball, fastest — half again the free stream — on
//      the circumference you see as the limb, and slowing towards the lee pole.
//
//   2. SEPARATION. Real flow can't stay attached round the back. Past
//      ~110 degrees it breaks away into a wake: weak, partly reversed, and
//      swirling. Vortex shedding makes that lee wind wander and back, so the
//      shelter behind the ball is real but never steady.
//
//   3. BOAT SHADOWS. Every boat drags a widening cone of dead air downwind of
//      its sails. Sail into one and you lose your wind; sit in front of one and
//      you hand the other boat yours.
//
// Sampling happens thousands of times a frame (every streamline head, every
// boat), so this file allocates nothing after start-up.
(function (P) {
	'use strict';

	var _t = new THREE.Vector3();      // downwind tangent
	var _b = new THREE.Vector3();      // lateral tangent (t rotated 90 deg)
	var _e = new THREE.Vector3();      // bearing from a boat to the sample point
	var _wake = new THREE.Vector3();

	var Wind = P.Wind = {
		dir: new THREE.Vector3(0, 0, -1),      // direction the free stream TRAVELS
		source: new THREE.Vector3(0, 0, 1),    // where it blows FROM, on the unit sphere
		refA: new THREE.Vector3(1, 0, 0),      // orthonormal frame across the wind axis,
		refB: new THREE.Vector3(0, 1, 0),      // used for the azimuth of the shedding eddies
		time: 0
	};

	// Recompute the wind axis from the source's azimuth/elevation.
	Wind.updateDirection = function () {
		var w = P.params.wind;
		P.fromAzEl(this.source, w.azimuthDeg, w.elevationDeg);
		this.dir.copy(this.source).multiplyScalar(-1);
		P.arbitraryTangent(this.refA, this.dir);
		this.refB.crossVectors(this.dir, this.refA).normalize();
	};

	// Speed of the undisturbed field at `p`, as a fraction of the free stream.
	// Mirrored in the ball's fragment shader (see render.js, windSpeedAt) so the
	// painted water and the streamlines agree — keep the two in step.
	//
	// The textbook answer for flow round a sphere is 1.5*U*sin(theta), which is
	// exactly nil at the windward stagnation point. That is true of a sphere in
	// a wind tunnel and useless as a map: it makes the entire windward face,
	// the part you look at most, a hole you cannot sail out of.
	//
	// So the profile is anchored at two ends instead. `noseFrac` is what blows
	// straight into the face of the ball, an ordinary breeze; `limbFrac` is the
	// circumference, where it blows hardest. The sin(theta) shape between them
	// is the same as the textbook one, just lifted off the floor.
	Wind.profile = function (theta) {
		var w = P.params.wind;
		var sep = w.separationDeg * P.DEG;
		var st = Math.max(0, Math.sin(theta));
		var potential = w.noseFrac + (w.limbFrac - w.noseFrac) * st;
		// Barely any sin(theta) shape in the lee: it does not taper away towards
		// the back pole, it just gets more confused.
		var wake = w.wakeSpeed * (0.85 + 0.15 * st);
		var blend = P.smoothstep(sep - 0.30, sep + 0.55, theta);
		return { potential: potential, wake: wake, blend: blend };
	};

	// The lee's own turbulence, in [-1, 1]: two scales of wandering eddy on top
	// of the alternating shed. Mirrored in the ball's fragment shader (leeNoise)
	// so the mottling you can see on the water is the field you are sailing in.
	Wind.eddyAt = function (p, phi) {
		var w = P.params.wind, k = w.eddyScale;
		var shed = Math.sin(w.shedHz * this.time * P.TAU + phi * 2.0);
		var fine = P.flowNoise(p.x * k, p.y * k, p.z * k, this.time * 1.3);
		var coarse = P.flowNoise(p.z * k * 0.45 + 2.0, p.x * k * 0.45, p.y * k * 0.45 - 1.0, this.time * 0.7);
		return 0.55 * shed + 0.30 * fine + 0.25 * coarse;
	};

	// A second, independent eddy field. The lee needs two: one to swing the wind
	// sideways and one to decide how much of it is running back up the ball. Fed
	// from the same noise with a different offset and rate so they drift apart.
	Wind.eddyAt2 = function (p, phi) {
		var w = P.params.wind, k = w.eddyScale;
		var shed = Math.cos(w.shedHz * this.time * P.TAU * 0.7 + phi * 3.0 + 1.3);
		var fine = P.flowNoise(p.y * k + 5.5, p.z * k - 3.1, p.x * k + 1.7, this.time * 0.95);
		return 0.6 * shed + 0.4 * fine;
	};

	// Tangential wind at unit-sphere point `p`, in knots, written into `out`.
	// `shadows` may be null; `excludeId` skips a boat's own shadow.
	Wind.sample = function (out, p, shadows, excludeId) {
		var w = P.params.wind;
		var dn = this.dir.dot(p);
		var theta = Math.acos(P.clamp(-dn, -1, 1));   // 0 windward, PI dead lee

		// Downwind tangent: the free stream with its radial part removed.
		_t.copy(this.dir).addScaledVector(p, -dn);
		var tl = _t.length();
		if (tl < 1e-6) P.arbitraryTangent(_t, p); else _t.multiplyScalar(1 / tl);
		_b.crossVectors(p, _t);

		var prof = this.profile(theta);
		var U = w.speedKts;

		// Attached flow: straight downwind along the meridian.
		out.copy(_t).multiplyScalar(prof.potential * U);

		if (prof.blend > 0.001) {
			// The lee. Not a hole: a body of air that has let go of the ball and
			// is rolling around behind it. Three things make it read as eddies
			// rather than as a dead patch — some of it running back UP the ball
			// against the free stream, a large sideways component that reverses
			// as vortices shed off alternate sides, and turbulence of its own on
			// two scales so no two square metres of it agree for long.
			var phi = Math.atan2(p.dot(this.refB), p.dot(this.refA));
			var e = this.eddyAt(p, phi);
			var e2 = this.eddyAt2(p, phi);

			// Along the meridian: a mean downwind drift with a varying part of it
			// running back UP the ball. `leeDrift` keeps the balance positive on
			// average, which is what makes this a lee and not a blender.
			var along = w.leeDrift - w.recirc * (0.5 + 0.5 * e2);

			// Across it: the swing, and the reason the lee is worth sailing into.
			_wake.copy(_t).multiplyScalar(along).addScaledVector(_b, w.swirl * e);

			// Then it is renormalised to the lee's own strength. The DIRECTION is
			// what the eddies scramble; the strength only breathes a little, so
			// there is always something in your sails back here.
			var wl = _wake.length();
			var mag = prof.wake * U * P.clamp(1 + w.eddy * 0.5 * e, 0.55, 1.5);
			if (wl > 1e-6) _wake.multiplyScalar(mag / wl);
			else _wake.copy(_t).multiplyScalar(mag);
			out.lerp(_wake, prof.blend);
		}

		// Gusts: a slow breathing of strength plus a couple of degrees of shift.
		if (w.gust > 0.0001) {
			var n1 = P.flowNoise(p.x * 2.2, p.y * 2.2, p.z * 2.2, this.time * 0.9);
			var n2 = P.flowNoise(p.z * 1.7 + 4.1, p.x * 1.7 - 2.3, p.y * 1.7, this.time * 0.6);
			out.multiplyScalar(1 + w.gust * n1);
			P.rotateAbout(out, p, w.gust * 0.55 * n2);
		}

		if (shadows && shadows.length) this.applyShadows(out, p, shadows, excludeId);

		// Keep it strictly tangential after all that.
		out.addScaledVector(p, -out.dot(p));
		return out;
	};

	// Wind loss at `p` from every boat's dirty air, applied to `out`.
	// Returns the total deficit in 0..1 so the HUD can shout about it.
	Wind.applyShadows = function (out, p, shadows, excludeId) {
		var R = P.params.world.radius;
		var bendCfg = P.params.shadow.bend;
		var deficit = 0, bend = 0;

		for (var i = 0; i < shadows.length; i++) {
			var s = shadows[i];
			if (s.id === excludeId || s.strength <= 0) continue;

			var cosA = P.clamp(p.dot(s.pos), -1, 1);
			var arc = Math.acos(cosA) * R;
			if (arc > s.length * 2.2) continue;              // far outside the cone

			_e.copy(p).addScaledVector(s.pos, -cosA);
			var el = _e.length();
			var along, across;
			if (el < 1e-9) {                                  // sitting on the boat
				along = 0; across = 0;
			} else {
				_e.multiplyScalar(1 / el);
				var cx = _e.dot(s.down);
				along = arc * cx;
				across = arc * Math.sqrt(Math.max(0, 1 - cx * cx));
			}
			if (along < 0) continue;                          // upwind of her: clean air

			var sigma = s.sigma0 + s.spread * along;
			var lat = across / sigma;
			var d = s.strength * Math.exp(-along / s.length) * Math.exp(-0.5 * lat * lat);
			if (d < 0.002) continue;

			deficit = 1 - (1 - deficit) * (1 - d);            // shadows compound

			// Air squeezed out of the shadow has to go somewhere: it bends round
			// the edges, so the boats on either side get a shift, not just a lull.
			if (el > 1e-9) {
				var side = _e.dot(s.lateral) < 0 ? -1 : 1;
				bend += side * d * bendCfg * Math.min(1, lat);
			}

			// And her lee is DISTURBED air, not merely thin air. Sails shed a
			// vortex street the same way the ball does, alternating side to side
			// as it goes downstream and drifting aft with the wind. Sail through
			// somebody's wake and the breeze wags on you, which is the thing you
			// actually notice on the water long before the lull arrives.
			var cfg = P.params.shadow;
			if (cfg.eddy > 0.0001) {
				var street = Math.sin(along / Math.max(0.4, s.sigma0 * cfg.eddyPitch) -
					this.time * cfg.shedHz * P.TAU);
				bend += street * d * cfg.eddy;
			}
		}

		if (deficit > 0) out.multiplyScalar(1 - deficit);
		if (bend !== 0) P.rotateAbout(out, p, bend);
		return deficit;
	};

	// The same flow, out in space. `x` is in ball radii (so the caller can just
	// scale by the radius); the result is in knots. This is the doublet solution
	// whose surface trace is exactly the 1.5*U*sin(theta) profile above, which is
	// why the streaks in space line up with the streamers on the water.
	var _rhat = new THREE.Vector3();
	Wind.sample3D = function (out, x) {
		var U = P.params.wind.speedKts;
		var r = Math.max(1.0, x.length());
		_rhat.copy(x).multiplyScalar(1 / x.length());
		var dr = this.dir.dot(_rhat);
		var k = U * 0.5 / (r * r * r);

		out.copy(this.dir).multiplyScalar(U);
		out.addScaledVector(_rhat, -k * 3 * dr);
		out.addScaledVector(this.dir, k);

		// Downstream the real flow never closes up as neatly as the maths says:
		// leave a slow, soft column behind the ball.
		var along = x.dot(this.dir);
		if (along > 0) {
			_rhat.copy(x).addScaledVector(this.dir, -along);
			var lateral = _rhat.length();
			if (lateral < 1.5) {
				var damp = (1 - lateral / 1.5) * Math.exp(-along / 5.0) * (1 - P.params.wind.wakeSpeed);
				out.multiplyScalar(1 - 0.8 * damp);
			}
		}
		return out;
	};

	// Deficit alone, without disturbing a wind vector. For the HUD readout.
	var _scratch = new THREE.Vector3();
	Wind.shadowDeficitAt = function (p, shadows, excludeId) {
		_scratch.set(1, 0, 0);
		_scratch.addScaledVector(p, -_scratch.dot(p));
		if (_scratch.lengthSq() < 1e-12) P.arbitraryTangent(_scratch, p);
		else _scratch.normalize();
		return this.applyShadows(_scratch, p, shadows, excludeId);
	};

	// Where a boat sitting at `p` is in the field, for plain-English HUD text.
	Wind.zoneAt = function (p) {
		var theta = Math.acos(P.clamp(-this.dir.dot(p), -1, 1)) / P.DEG;
		var sep = P.params.wind.separationDeg;
		if (theta < 25) return 'windward pole';
		if (theta < 70) return 'windward face';
		if (theta < sep - 12) return 'the limb';
		if (theta < sep + 25) return 'separation line';
		if (theta < 155) return 'the lee';
		return 'lee pole';
	};
})(window.PLANET);
