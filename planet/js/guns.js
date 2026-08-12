// Broadsides.
//
// The numbers come from the flat-ocean game's `battle` config so the two feel
// like the same navy, but they are held in BOAT LENGTHS rather than metres,
// which is what makes them mean anything on a ball you can resize.
//
// The one that matters is range. Over there a 250 m gun on a ~33 m hull is about
// 7.6 hull lengths; here the masthead horizon at the default radius is 7.5. So
// the gun reaches almost exactly as far as the lookout sees, and the whole fight
// is about the curve: shrink the ball and your guns out-range your eyes, so you
// are firing at a masthead over the horizon and she can lie hull-down and reload
// in peace. Grow it and it becomes an ordinary sea fight.
//
// You cannot shoot what you cannot see. That rule is enforced against the same
// `World.rivalHidden()` the renderer uses to sink her, so the gun and the eye
// never disagree.
(function (P) {
	'use strict';

	var Guns = P.Guns = { shots: [], events: [] };

	var HULL_HP = 10;

	// ---- geometry of a broadside ---------------------------------------------

	var _toTarget = new THREE.Vector3();
	var _fromTarget = new THREE.Vector3();

	// Which battery bears on `target`, if either. Returns null, 'port' or 'stbd'.
	// A broadside points abeam; the arc either side of that is `arcDeg` wide.
	Guns.bearingOn = function (shooter, target) {
		P.tangentToward(_toTarget, shooter.pos, target.pos);
		var rel = P.signedAngle(shooter.head, _toTarget, shooter.pos) / P.DEG;
		var arc = P.params.guns.arcDeg;
		var off = Math.abs(Math.abs(rel) - 90);          // degrees off dead abeam
		if (off > arc) return null;
		return rel >= 0 ? 'stbd' : 'port';
	};

	// Range in boat lengths.
	Guns.rangeLOA = function (shooter, target) {
		return P.arc(shooter.pos, target.pos) * P.params.world.radius / P.boatLength();
	};

	// A shot down the target's bow or stern axis sweeps her whole gun deck. The
	// flat-ocean game pays 3x for it and so does this one.
	Guns.isRaking = function (shooter, target) {
		P.tangentToward(_fromTarget, target.pos, shooter.pos);
		var rel = Math.abs(P.signedAngle(target.head, _fromTarget, target.pos) / P.DEG);
		return rel < 35 || rel > 145;
	};

	// Everything the HUD and the AI need to know about one boat shooting another.
	Guns.solution = function (shooter, target) {
		var g = P.params.guns;
		var side = this.bearingOn(shooter, target);
		var range = this.rangeLOA(shooter, target);
		// You may lay a gun on a ship you can only half see: hull-down, with just
		// her masts over the curve, is a hard shot rather than an impossible one.
		// Accuracy falls with `hidden` and reaches nil as her masthead goes, so
		// the gun and the eye run out together instead of arguing.
		var hidden = P.World.rivalHidden();
		return {
			side: side,
			rangeLOA: range,
			inRange: range <= g.rangeLOA,
			visible: hidden < 0.98,
			hullDown: hidden > 0.02,
			sighting: 1 - hidden,
			raking: this.isRaking(shooter, target),
			ready: side ? shooter.guns[side] <= 0 : false,
			can: !!side && range <= g.rangeLOA && hidden < 0.98 &&
				!shooter.struck && !target.struck && (side ? shooter.guns[side] <= 0 : false)
		};
	};

	// ---- firing ---------------------------------------------------------------

	Guns.init = function (boat) {
		boat.hp = HULL_HP;
		boat.struck = false;
		boat.guns = { port: 0, stbd: 0 };     // seconds left on each battery's reload
		boat.hitFlash = 0;
	};

	Guns.reset = function () {
		this.shots.length = 0;
		this.events.length = 0;
		for (var i = 0; i < P.World.boats.length; i++) this.init(P.World.boats[i]);
	};

	Guns.tick = function (dt) {
		var boats = P.World.boats, i;
		for (i = 0; i < boats.length; i++) {
			var b = boats[i];
			if (b.guns.port > 0) b.guns.port -= dt;
			if (b.guns.stbd > 0) b.guns.stbd -= dt;
			if (b.hitFlash > 0) b.hitFlash -= dt;

			// A struck ship lets everything fly and stops.
			if (b.struck) {
				b.sheet += (90 - b.sheet) * Math.min(1, dt * 0.6);
				b.speed *= Math.exp(-dt * 0.5);
			}
		}
		this.stepShots(dt);
	};

	// Fire the battery on `side`. Returns false if she could not.
	Guns.fire = function (shooter, target, side) {
		var g = P.params.guns;
		var sol = this.solution(shooter, target);
		if (!side) side = sol.side;
		if (!side || shooter.struck) return false;
		if (shooter.guns[side] > 0) return false;
		if (sol.side !== side) { this.say(shooter, 'She does not bear.'); return false; }
		if (!sol.inRange) { this.say(shooter, 'Out of range.'); return false; }
		if (!sol.visible) { this.say(shooter, 'No target. She is under the curve.'); return false; }

		shooter.guns[side] = shooter.isPlayer ? g.playerReloadS : g.reloadS;

		// Each ball is resolved on its own, so a broadside reads as a spread of
		// splashes with a hit or two in among them rather than one dice roll.
		// Measured on the running sim: at 3 LOA this is ~1.8 hits a broadside, so
		// she strikes in six or seven. A squared falloff was tried first and made
		// everything past half range pointless (37 broadsides to a decision); the
		// linear one keeps a long shot worth taking at about a third the weight.
		var falloff = P.clamp(1 - sol.rangeLOA / g.rangeLOA, 0, 1);
		var p = g.hitAtPointBlank * (0.25 + 0.75 * falloff) * sol.sighting;
		var hits = 0;
		for (var i = 0; i < g.ballsPerBroadside; i++) {
			var hit = Math.random() < p;
			if (hit) hits++;
			this.launch(shooter, target, side, i / (g.ballsPerBroadside - 1), hit);
		}

		var damage = Math.min(g.maxDamagePerBroadside, hits * (sol.raking ? g.rakeDamage : 1));
		if (damage > 0) this.pending.push({ target: target, damage: damage, raking: sol.raking, at: 0 });
		this.say(shooter, sol.raking && hits
			? shooter.name + ' rakes her!'
			: shooter.name + ' fires a ' + side + ' broadside.');
		return true;
	};

	// Damage lands when the shot does, not when the gun goes off.
	Guns.pending = [];

	Guns.applyDamage = function (target, damage, raking) {
		if (target.struck) return;
		target.hp = Math.max(0, target.hp - damage);
		target.hitFlash = 0.5;
		this.say(null, (raking ? 'Raked. ' : '') + target.name + ' takes ' + damage +
			(damage === 1 ? ' hit' : ' hits') + ' — ' + target.hp + ' of ' + HULL_HP + ' left.');
		if (target.hp <= 0) {
			target.struck = true;
			this.say(null, target.isPlayer
				? 'We have struck our colours. Press R to sail again.'
				: target.name + ' strikes her colours. She is ours.');
		}
	};

	Guns.say = function (boat, text) {
		P.World.push(text);
	};

	// ---- shot in flight -------------------------------------------------------

	// A ball travels the great circle from the muzzle towards the target, lobbed
	// a little so it clears the curve on the way. Storing the axis and the arc
	// means it keeps flying true even as both ships sail on underneath it.
	var _axis = new THREE.Vector3(), _dir = new THREE.Vector3(), _lat = new THREE.Vector3();

	Guns.launch = function (shooter, target, side, spread, willHit) {
		var g = P.params.guns;
		var L = P.boatLength(), R = P.params.world.radius;

		P.tangentToward(_dir, shooter.pos, target.pos);
		var arcTo = P.arc(shooter.pos, target.pos);

		// A miss goes over, short, or wide; a hit goes to her waterline.
		var wide = 0, over = 1;
		if (!willHit) {
			wide = (spread - 0.5) * g.spreadLOA * 2 * L / R;
			over = 1 + (Math.random() - 0.45) * 0.22;
		} else {
			wide = (spread - 0.5) * 0.25 * L / R;
		}

		_axis.crossVectors(shooter.pos, _dir).normalize();
		var start = shooter.pos.clone();
		P.rotateAbout(start, _dir, wide);          // step off the firing line

		this.shots.push({
			from: start,
			axis: _axis.clone(),
			arc: arcTo * over,
			t: 0,
			flight: Math.max(0.35, g.flightPerLOA * (arcTo * R / L)),
			hit: willHit,
			target: target,
			pos: new THREE.Vector3(),
			done: false
		});
	};

	var _sp = new THREE.Vector3();

	Guns.stepShots = function (dt) {
		var R = P.params.world.radius, L = P.boatLength();
		for (var i = this.shots.length - 1; i >= 0; i--) {
			var s = this.shots[i];
			s.t += dt / s.flight;
			if (s.t >= 1) {
				// Landfall: splash, or the damage this ball was carrying.
				this.splashes.push({ pos: s.pos.clone(), age: 0, hit: s.hit });
				this.shots.splice(i, 1);
				continue;
			}
			_sp.copy(s.from);
			P.rotateAbout(_sp, s.axis, s.arc * s.t);
			// Lob: a shallow arc, higher for a longer shot.
			var lob = Math.sin(Math.PI * s.t) * L * 0.30 * (1 + s.arc * R / (L * 8));
			s.pos.copy(_sp).multiplyScalar(R + L * 0.09 + lob);
		}

		// Damage lands with the volley, a beat after the muzzle flash.
		for (var j = this.pending.length - 1; j >= 0; j--) {
			var d = this.pending[j];
			d.at += dt;
			if (d.at >= P.params.guns.flightPerLOA * 3) {
				this.applyDamage(d.target, d.damage, d.raking);
				this.pending.splice(j, 1);
			}
		}

		for (var k = this.splashes.length - 1; k >= 0; k--) {
			this.splashes[k].age += dt;
			if (this.splashes[k].age > 1.1) this.splashes.splice(k, 1);
		}
	};

	Guns.splashes = [];

	// ---- the rival's gunnery --------------------------------------------------

	// She shoots when she bears, and she prefers a rake. Her sailing brain is
	// untouched: this only decides when to pull the lanyard.
	Guns.updateAI = function (boat, target, dt) {
		if (boat.struck || target.struck) return;
		var sol = this.solution(boat, target);
		if (!sol.can) return;

		// Hold fire at the edge of the range unless she can rake, which is worth
		// a long shot. Inside half range she fires as fast as she can load.
		var g = P.params.guns;
		if (!sol.raking && sol.rangeLOA > g.rangeLOA * 0.75) return;
		this.fire(boat, target, sol.side);
	};
})(window.PLANET);
