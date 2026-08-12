// The sailing sim: two boats on the skin of a ball.
//
// A boat is a unit position vector plus a unit heading tangent to the sphere
// there. Sailing her forward is one rotation about (pos x head) — no flat-earth
// coordinates anywhere, so she can sail clean over the pole and keep going.
(function (P) {
	'use strict';

	// Speed as a fraction of the true wind, against true wind angle. Nothing
	// below the no-go zone, best on a beam reach, honest loss dead downwind.
	var POLAR_TWA = [0,  28,  36,  45,  55,  70,  90, 110, 130, 150, 165, 180];
	var POLAR_F   = [0, 0.02, 0.26, 0.41, 0.49, 0.55, 0.58, 0.56, 0.50, 0.44, 0.40, 0.38];
	var NO_GO_DEG = 34;

	P.polarFactor = function (twaDeg) {
		var t = Math.abs(twaDeg);
		if (t >= 180) return POLAR_F[POLAR_F.length - 1];
		for (var i = 1; i < POLAR_TWA.length; i++) {
			if (t <= POLAR_TWA[i]) {
				var f = (t - POLAR_TWA[i - 1]) / (POLAR_TWA[i] - POLAR_TWA[i - 1]);
				return P.lerp(POLAR_F[i - 1], POLAR_F[i], f);
			}
		}
		return 0;
	};

	// Where the sheet wants to be for a given wind angle: hard in close-hauled,
	// right out on a run.
	P.optimalSheet = function (twaDeg) {
		return P.clamp((Math.abs(twaDeg) - 22) * 0.62, 0, 85);
	};

	function Boat(id, name, isPlayer, pos, head) {
		this.id = id;
		this.name = name;
		this.isPlayer = isPlayer;
		this.pos = pos.clone().normalize();
		this.head = head.clone();
		P.orthonormalise(this.pos, this.head);

		this.speed = 2.0;
		this.rudder = 0;
		this.sheet = 45;

		this.wind = new THREE.Vector3();     // true wind at the boat, shadows included
		this.windSpeed = 0;
		this.cleanWind = 0;                  // what she'd have with nobody in the way
		this.deficit = 0;                    // 0..1 of her wind stolen
		this.twa = 0;                        // signed, +ve wind over starboard
		this.awa = 0;
		this.aws = 0;
		this.trimEff = 1;
		this.stalled = false;
		this.aiMode = 'auto';
		this.aiTimer = 0;

		// The dirty air she throws downwind, rebuilt every step.
		this.shadow = {
			id: id,
			pos: this.pos,
			down: new THREE.Vector3(0, 0, 1),
			lateral: new THREE.Vector3(1, 0, 0),
			strength: 0,
			length: 1,
			sigma0: 1,
			spread: 0.17
		};

		this.trail = [];                     // recent positions, for the wake
	}

	var World = P.World = {
		boats: [],
		shadows: [],
		time: 0,
		player: null,
		rival: null,
		events: [],
		rivalVisible: false,
		coveredBy: null
	};

	// Start them on the windward face, well clear of the stagnation point on the
	// nose of the ball — there is no wind at all up there.
	// `theta` is the angle from that point, `phi` spins round the wind axis.
	function spawn(theta, phi) {
		var p = P.Wind.source.clone();
		P.rotateAbout(p, P.Wind.refA, theta * P.DEG);
		P.rotateAbout(p, P.Wind.dir, phi * P.DEG);
		return p.normalize();
	}

	// A beam reach to begin with: square across the local breeze, on opposite
	// tacks so the two of them converge.
	function reachFrom(pos, hand) {
		var h = new THREE.Vector3();
		P.tangentToward(h, pos, P.Wind.dir);      // straight downwind along the surface
		P.rotateAbout(h, pos, hand * Math.PI / 2);
		return h;
	}

	World.reset = function () {
		P.Wind.updateDirection();
		var R = P.params.world.radius, L = P.boatLength();
		var a = spawn(78, 0);
		var ha = reachFrom(a, 1);

		// She starts where the boat ahead always wants to be: to windward and a
		// length or two clear ahead, with her dirty air lying across our bow.
		var down = P.tangentToward(new THREE.Vector3(), a, P.Wind.dir);
		var b = a.clone()
			.addScaledVector(down, -(3.4 * L) / R)
			.addScaledVector(ha, (2.0 * L) / R)
			.normalize();

		this.player = new Boat(0, 'Kestrel', true, a, ha);
		this.rival = new Boat(1, 'Marlin', false, b, reachFrom(b, 1));
		this.boats = [this.player, this.rival];
		this.shadows = [this.player.shadow, this.rival.shadow];
		this.time = 0;
		this.events.length = 0;
		this.rivalVisible = true;
		P.Wind.updateDirection();
		this.refreshShadowGeometry();
		if (P.Guns) P.Guns.reset();
	};

	// Shadow size follows boat length, so it stays proportional as the ball grows.
	World.refreshShadowGeometry = function () {
		var L = P.boatLength(), cfg = P.params.shadow;
		for (var i = 0; i < this.boats.length; i++) {
			var s = this.boats[i].shadow;
			s.length = cfg.lengthMul * L;
			s.sigma0 = cfg.sigmaMul * L;
			s.spread = cfg.spread;
		}
	};

	var _v = new THREE.Vector3();
	var _windFrom = new THREE.Vector3();
	var _axis = new THREE.Vector3();
	var _app = new THREE.Vector3();

	World.step = function (dt) {
		if (dt <= 0) return;
		this.time += dt;
		P.Wind.time = this.time;
		this.refreshShadowGeometry();

		var i, boat;

		// 1. Read the wind each boat actually has — her rival's dirty air included,
		//    her own excluded (she doesn't blanket herself).
		for (i = 0; i < this.boats.length; i++) {
			boat = this.boats[i];
			P.Wind.sample(boat.wind, boat.pos, this.shadows, boat.id);
			boat.windSpeed = boat.wind.length();
			P.Wind.sample(_v, boat.pos, null, boat.id);
			boat.cleanWind = _v.length();
			boat.deficit = boat.cleanWind > 0.01
				? P.clamp(1 - boat.windSpeed / boat.cleanWind, 0, 1) : 0;
		}

		// 2. Rebuild the cones of dead air from the wind they just read.
		for (i = 0; i < this.boats.length; i++) this.updateShadow(this.boats[i]);

		// 3. Steer and sail.
		for (i = 0; i < this.boats.length; i++) {
			boat = this.boats[i];
			// A ship that has struck stops steering. Her helm goes over and stays.
			if (boat.struck) boat.rudder *= Math.exp(-dt);
			else if (!boat.isPlayer) this.updateAI(boat, dt);
			this.sail(boat, dt);
		}

		this.separate();
		this.updateAwareness();

		// Gunnery last: it reads positions and headings that are now settled, and
		// a ball already in the air keeps flying whatever the ships do under it.
		if (P.Guns) {
			P.Guns.tick(dt);
			P.Guns.updateAI(this.rival, this.player, dt);
		}
	};

	// No hull-to-hull sailing: two boats that get within a length and a half of
	// each other are shouldered apart, and both lose a little way for it.
	var _apart = new THREE.Vector3(), _sepAxis = new THREE.Vector3();
	World.separate = function () {
		var R = P.params.world.radius, L = P.boatLength();
		var a = this.player, b = this.rival;
		var minArc = 1.5 * L / R;
		var arc = P.arc(a.pos, b.pos);
		if (arc >= minArc || arc < 1e-7) return;

		var push = (minArc - arc) * 0.5;
		P.tangentToward(_apart, a.pos, b.pos);
		_sepAxis.crossVectors(a.pos, _apart).normalize();
		P.rotateAbout(a.pos, _sepAxis, -push);

		P.tangentToward(_apart, b.pos, a.pos);
		_sepAxis.crossVectors(b.pos, _apart).normalize();
		P.rotateAbout(b.pos, _sepAxis, -push);

		P.orthonormalise(a.pos, a.head);
		P.orthonormalise(b.pos, b.head);
		a.speed *= 0.98;
		b.speed *= 0.98;
	};

	World.updateShadow = function (boat) {
		var s = boat.shadow;
		s.pos = boat.pos;
		if (boat.windSpeed > 0.01) {
			s.down.copy(boat.wind).multiplyScalar(1 / boat.windSpeed);
		}
		s.lateral.crossVectors(boat.pos, s.down).normalize();
		// A boat only blankets as hard as she's got sail working: a stalled boat
		// lying in a lull is barely in anyone's way.
		var working = P.clamp(boat.windSpeed / Math.max(1, P.params.wind.speedKts * 0.45), 0, 1);
		s.strength = P.params.shadow.strength * (0.35 + 0.65 * working);
	};

	World.sail = function (boat, dt) {
		var R = P.params.world.radius;
		var L = P.boatLength();

		// True wind angle, signed: +ve means the wind is over her starboard side.
		if (boat.windSpeed > 0.001) _windFrom.copy(boat.wind).multiplyScalar(-1 / boat.windSpeed);
		else _windFrom.copy(boat.head).multiplyScalar(-1);
		boat.twa = P.signedAngle(boat.head, _windFrom, boat.pos) / P.DEG;

		// Apparent wind, for the burgee and the instruments.
		_app.copy(boat.wind).addScaledVector(boat.head, -boat.speed);
		boat.aws = _app.length();
		if (boat.aws > 0.001) {
			_v.copy(_app).multiplyScalar(-1 / boat.aws);
			boat.awa = P.signedAngle(boat.head, _v, boat.pos) / P.DEG;
		}

		// Trim.
		var want = P.optimalSheet(boat.twa);
		if (P.params.sim.autoTrim || !boat.isPlayer) {
			boat.sheet += P.clamp(want - boat.sheet, -60 * dt, 60 * dt);
		}
		var miss = Math.abs(want - boat.sheet);
		boat.trimEff = P.clamp(1 - 0.9 * Math.min(1, (miss / 50) * (miss / 50)), 0.1, 1);

		// Drive.
		var target = boat.windSpeed * P.polarFactor(boat.twa) * boat.trimEff;
		if (boat.windSpeed < 2.0) target *= boat.windSpeed / 2.0;   // ghosting in a hole
		boat.stalled = target < 0.35;

		var tau = target > boat.speed ? 5.0 : 3.0;
		boat.speed += (target - boat.speed) * (1 - Math.exp(-dt / tau));
		if (boat.speed < 0) boat.speed = 0;

		// Helm. She needs way on to answer it. Positive rudder is starboard helm,
		// and starboard is a NEGATIVE rotation about her own up-vector — hence
		// P.STARBOARD rather than a bare sign that reads either way.
		//
		// The 0.14 floor is a trap door. With authority going to a clean zero, a
		// boat that lost all way could never steer again: no speed, so no helm,
		// so no way to point at any wind, so no speed. The confused air in the
		// lee found that hole in about a minute. A real hull always has SOME
		// steerage from her sails and her heel even when she is barely moving.
		var authority = P.clamp(0.14 + boat.speed / 1.6, 0, 1);
		var maxRate = 0.42 * (12.75 / L);        // bigger boat, wider turning circle
		P.rotateAbout(boat.head, boat.pos, P.STARBOARD * boat.rudder * maxRate * authority * dt);

		// In irons. Head to wind with no way on, her sails go aback and she pays
		// off onto one tack or the other of her own accord — she does not sit
		// there head to wind for ever, which is what she used to do. Falls off
		// to whichever side the wind is already on, so she keeps her tack.
		if (Math.abs(boat.twa) < NO_GO_DEG && boat.speed < 1.2 && boat.windSpeed > 0.5) {
			var lost = 1 - boat.speed / 1.2;
			var payRate = 0.30 * lost * P.clamp(boat.windSpeed / 10, 0.25, 1.5) * dt;
			P.rotateAbout(boat.head, boat.pos, -P.STARBOARD * (boat.twa >= 0 ? 1 : -1) * payRate);
		}

		// Sail her forward along the great circle under the bow.
		var travel = boat.speed * dt / R;
		if (travel > 1e-9) {
			_axis.crossVectors(boat.pos, boat.head).normalize();
			P.rotateAbout(boat.pos, _axis, travel);
			P.rotateAbout(boat.head, _axis, travel);
		}

		// Leeway: she slides a little downwind of where she points.
		if (boat.windSpeed > 0.01) {
			var slip = 0.055 * boat.windSpeed * Math.abs(Math.sin(boat.twa * P.DEG)) * dt / R;
			_axis.crossVectors(boat.pos, boat.wind).normalize();
			P.rotateAbout(boat.pos, _axis, slip);
		}

		P.orthonormalise(boat.pos, boat.head);

		// Wake history, in boat lengths of spacing.
		var t = boat.trail;
		if (!t.length || P.arc(t[t.length - 1], boat.pos) * R > L * 0.5) {
			t.push(boat.pos.clone());
			if (t.length > 48) t.shift();
		}
	};

	// ---- The rival -----------------------------------------------------------

	var _target = new THREE.Vector3();
	var _desired = new THREE.Vector3();
	var _probe = new THREE.Vector3();
	var _probeWind = new THREE.Vector3();
	var _escape = new THREE.Vector3();

	World.updateAI = function (boat, dt) {
		var player = this.player;
		var R = P.params.world.radius;
		var L = P.boatLength();
		var range = P.arc(boat.pos, player.pos) * R;

		boat.aiTimer -= dt;
		var forced = P.params.sim.aiMode;
		if (forced !== 'auto') {
			boat.aiMode = forced;
		} else if (boat.aiTimer <= 0) {
			boat.aiTimer = 4 + Math.random() * 4;
			if (boat.deficit > 0.25) boat.aiMode = 'escape';            // out of his bad air
			else if (range < L * 16) {
				boat.aiMode = Math.random() < 0.22 ? 'hide' : 'cover';   // sit on his wind, or vanish
			} else {
				boat.aiMode = 'chase';                                   // close the gap first
			}
			// Hiding is only worth anything if she commits to it for a while.
			if (boat.aiMode === 'hide') boat.aiTimer = 10 + Math.random() * 8;
		}

		switch (boat.aiMode) {
			case 'cover':
				// Half a shadow upwind of him and a shade ahead — the spot from
				// which her dirty air lands square on his sails. When she is still
				// a long way off this collapses towards simply closing him down.
				_target.copy(player.pos)
					.addScaledVector(player.shadow.down, -Math.min(boat.shadow.length * 0.55, range * 0.9) / R)
					.addScaledVector(player.head, (L * 1.5) / R)
					.normalize();
				break;
			case 'hide':
				// Straight for his antipode — over the curve, out of sight.
				_target.copy(player.pos).multiplyScalar(-1);
				break;
			case 'escape': {
				// Straight out of the side of the shadow he has laid on her —
				// whichever edge is nearer.
				var cosA = P.clamp(boat.pos.dot(player.pos), -1, 1);
				_escape.copy(boat.pos).addScaledVector(player.pos, -cosA);
				var side = _escape.dot(player.shadow.lateral) < 0 ? -1 : 1;
				_target.copy(boat.pos)
					.addScaledVector(player.shadow.lateral, side * (L * 10) / R)
					.normalize();
				break;
			}
			case 'free':
				// Reach around the ball, minding her own business.
				_target.copy(boat.pos).addScaledVector(boat.head, (L * 20) / R).normalize();
				break;
			default: // chase
				_target.copy(player.pos);
		}

		this.steerToward(boat, _target, boat.aiMode !== 'hide');
	};

	// Point her at `to`, tacking round the no-go zone, and nudge her towards the
	// better air if `seekAir` (she won't bother when she's running for cover).
	World.steerToward = function (boat, to, seekAir) {
		var R = P.params.world.radius, L = P.boatLength();
		P.tangentToward(_desired, boat.pos, to);

		if (boat.windSpeed > 0.01) {
			_windFrom.copy(boat.wind).multiplyScalar(-1 / boat.windSpeed);
			var wantTwa = P.signedAngle(_desired, _windFrom, boat.pos) / P.DEG;
			if (Math.abs(wantTwa) < NO_GO_DEG) {
				// Dead upwind of where she wants to be: take the nearer tack. On
				// starboard tack (wind over the starboard side) her close-hauled
				// heading lies NO_GO to port of the wind's eye, and vice versa.
				var onStarboard = boat.twa >= 0 ? 1 : -1;
				_desired.copy(_windFrom);
				P.rotateAbout(_desired, boat.pos, onStarboard * NO_GO_DEG * P.DEG);
			}
		}

		var err = P.signedAngle(boat.head, _desired, boat.pos) / P.DEG;
		var rudder = P.clamp(err / 25, -1, 1);

		if (seekAir) {
			// Sniff six lengths out on either bow and lean towards the better air.
			// `side` is a rotation sign, so the gain it produces is in rotation
			// terms too; P.STARBOARD converts it into rudder.
			var here = boat.windSpeed;
			var gain = 0;
			for (var side = -1; side <= 1; side += 2) {
				_probe.copy(boat.head);
				P.rotateAbout(_probe, boat.pos, side * 40 * P.DEG);
				_probe.multiplyScalar((L * 6) / R).add(boat.pos).normalize();
				P.Wind.sample(_probeWind, _probe, this.shadows, boat.id);
				gain += side * (_probeWind.length() - here);
			}
			gain *= P.STARBOARD;
			rudder = P.clamp(rudder + P.clamp(gain * 0.22, -0.5, 0.5), -1, 1);
		}

		boat.rudder = rudder;
	};

	// ---- Who can see whom ----------------------------------------------------

	World.horizonAngle = function (height) { return P.horizonAngle(height); };

	// How much of the rival is UNDER the curve: 0 with her hull up, 1 with even
	// her masthead gone. She sinks truck-last and rises truck-first rather than
	// blinking off, because a hard cut at the horizon makes the curve look fake.
	//
	// Two ranges bracket it: `deck` is where her waterline goes, `truck` is where
	// her masthead follows. Between them she is hull-down.
	World.rivalHidden = function () {
		var L = P.boatLength();
		var sep = P.arc(this.player.pos, this.rival.pos);
		var eye = P.horizonAngle(L * 1.15);            // our masthead over the curve
		var deck = eye + P.horizonAngle(L * 0.10);     // ...to her waterline
		var truck = eye + P.horizonAngle(L * 1.15);    // ...to her masthead
		if (sep <= deck) return 0;
		if (sep >= truck) return 1;
		return (sep - deck) / Math.max(1e-6, truck - deck);
	};

	World.updateAwareness = function () {
		var L = P.boatLength();
		var mast = L * 1.15;
		var reach = this.horizonAngle(mast) * 2;      // masthead to masthead
		var sep = P.arc(this.player.pos, this.rival.pos);
		var visible = sep < reach;

		if (visible !== this.rivalVisible) {
			this.rivalVisible = visible;
			this.push(visible ? 'Sail ho — ' + this.rival.name + ' rising over the curve.'
			                  : this.rival.name + ' has dropped behind the ball.');
		}

		// Is she sitting on our wind?
		var covered = this.player.deficit > 0.12 ? this.rival : null;
		if (!!covered !== !!this.coveredBy) {
			this.coveredBy = covered;
			this.push(covered ? 'She has us covered — our air is going dead.'
			                  : 'We are back into clean air.');
		}
	};

	World.push = function (text) {
		this.events.push({ text: text, at: this.time });
		if (this.events.length > 6) this.events.shift();
	};

	World.horizonRange = function () {
		// Metres of surface you can see from the masthead — the real "hiding" radius.
		return this.horizonAngle(P.boatLength() * 1.15) * 2 * P.params.world.radius;
	};

	// The same thing in boat lengths, which is the number that actually tells you
	// how savage the ball is. Fixed boat, shrinking ball: this falls.
	World.horizonLOA = function () {
		return this.horizonRange() / P.boatLength();
	};

	P.Boat = Boat;
})(window.PLANET);
