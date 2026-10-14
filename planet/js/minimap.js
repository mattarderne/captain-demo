// The tactician's card: the ball drawn side-on with the wind blowing left to
// right, so you can see at a glance which face you are on, where the lee is,
// and whose dirty air is pointing at whom.
(function (P) {
	'use strict';

	var M = P.Minimap = {};

	var _v = new THREE.Vector3(), _a = new THREE.Vector3(), _k = new THREE.Vector3();

	M.init = function (canvas) {
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		return this;
	};

	// Screen right is downwind, screen up is one of the cross-wind axes, and the
	// third axis is depth — near-side boats are filled, far-side ones hollow.
	M.project = function (q, out) {
		out.x = q.dot(P.Wind.dir);
		out.y = q.dot(P.Wind.refB);
		out.z = q.dot(P.Wind.refA);
		return out;
	};

	var _pr = { x: 0, y: 0, z: 0 };

	M.draw = function () {
		var c = this.canvas, ctx = this.ctx;
		if (!c || !P.params.view.minimap) return;

		var dpr = Math.min(window.devicePixelRatio || 1, 2);
		var size = c.clientWidth;
		if (c.width !== size * dpr) { c.width = size * dpr; c.height = size * dpr; }
		ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
		ctx.clearRect(0, 0, size, size);

		var cx = size * 0.5, cy = size * 0.5, r = size * 0.32;
		var self = this;
		function sx(p) { return cx + p.x * r; }
		function sy(p) { return cy - p.y * r; }

		// The ball.
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, P.TAU);
		ctx.fillStyle = 'rgba(30,72,104,0.55)';
		ctx.fill();

		// The separated lee: everything past the separation angle.
		var sepX = -Math.cos(P.params.wind.separationDeg * P.DEG);
		ctx.save();
		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, P.TAU);
		ctx.clip();
		ctx.fillStyle = 'rgba(6,10,20,0.62)';
		ctx.fillRect(cx + sepX * r, cy - r, r * 2, r * 2);
		ctx.restore();

		// The windward limb, where it blows hardest.
		ctx.beginPath();
		ctx.arc(cx, cy, r, -Math.PI * 0.5, Math.PI * 0.5, true);
		ctx.strokeStyle = 'rgba(150,225,255,0.55)';
		ctx.lineWidth = 2;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(cx, cy, r, 0, P.TAU);
		ctx.strokeStyle = 'rgba(160,200,230,0.35)';
		ctx.lineWidth = 1;
		ctx.stroke();

		// Free stream coming in from the left.
		ctx.strokeStyle = 'rgba(150,220,255,0.45)';
		for (var i = -2; i <= 2; i++) {
			var y = cy + i * r * 0.42;
			var x0 = 6, x1 = cx - r - 8;
			ctx.beginPath();
			ctx.moveTo(x0, y); ctx.lineTo(x1, y);
			ctx.moveTo(x1 - 6, y - 3); ctx.lineTo(x1, y); ctx.lineTo(x1 - 6, y + 3);
			ctx.stroke();
		}

		// How far the player can see over the curve.
		this.drawCap(ctx, P.World.player.pos, P.World.horizonAngle(P.boatLength() * 1.15) * 2,
			'rgba(120,220,180,0.35)', sx, sy);

		for (var b = 0; b < P.World.boats.length; b++) {
			this.drawShadow(ctx, P.World.boats[b], sx, sy);
		}
		for (var j = 0; j < P.World.boats.length; j++) {
			this.drawBoat(ctx, P.World.boats[j], j === 0, sx, sy, r);
		}

		ctx.fillStyle = 'rgba(190,215,235,0.75)';
		ctx.font = '9px ui-monospace, Menlo, monospace';
		ctx.fillText('WIND', 6, 12);
		ctx.fillText('LEE', size - 24, 12);
	};

	M.drawCap = function (ctx, centre, angle, color, sx, sy) {
		P.arbitraryTangent(_a, centre);
		_k.crossVectors(centre, _a).normalize();
		ctx.beginPath();
		for (var i = 0; i <= 48; i++) {
			_v.copy(centre);
			P.rotateAbout(_v, _a, angle);
			P.rotateAbout(_v, centre, (i / 48) * P.TAU);
			this.project(_v, _pr);
			var x = sx(_pr), y = sy(_pr);
			if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
		}
		ctx.strokeStyle = color;
		ctx.lineWidth = 1;
		ctx.setLineDash([3, 3]);
		ctx.stroke();
		ctx.setLineDash([]);
	};

	M.drawShadow = function (ctx, boat, sx, sy) {
		var s = boat.shadow, R = P.params.world.radius;
		if (s.strength <= 0.01) return;
		_k.crossVectors(s.pos, s.down).normalize();

		ctx.beginPath();
		var N = 18, i, f, along, half, first = true;
		for (i = 0; i < N; i++) {
			f = i / (N - 1); along = f * s.length; half = 1.7 * (s.sigma0 + s.spread * along);
			_v.copy(s.pos);
			P.rotateAbout(_v, _k, along / R);
			_a.crossVectors(_v, _k).normalize();
			P.rotateAbout(_v, _a, half / R);
			this.project(_v, _pr);
			if (first) { ctx.moveTo(sx(_pr), sy(_pr)); first = false; } else ctx.lineTo(sx(_pr), sy(_pr));
		}
		for (i = N - 1; i >= 0; i--) {
			f = i / (N - 1); along = f * s.length; half = 1.7 * (s.sigma0 + s.spread * along);
			_v.copy(s.pos);
			P.rotateAbout(_v, _k, along / R);
			_a.crossVectors(_v, _k).normalize();
			P.rotateAbout(_v, _a, -half / R);
			this.project(_v, _pr);
			ctx.lineTo(sx(_pr), sy(_pr));
		}
		ctx.closePath();
		ctx.fillStyle = boat.isPlayer ? 'rgba(255,235,180,0.20)' : 'rgba(255,120,90,0.22)';
		ctx.fill();
	};

	M.drawBoat = function (ctx, boat, isPlayer, sx, sy, r) {
		this.project(boat.pos, _pr);
		var x = sx(_pr), y = sy(_pr), near = _pr.z >= 0;

		// A short tick showing which way she is pointing.
		_v.copy(boat.pos).addScaledVector(boat.head, 0.13).normalize();
		var hp = { x: 0, y: 0, z: 0 };
		this.project(_v, hp);

		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.lineTo(sx(hp), sy(hp));
		ctx.strokeStyle = isPlayer ? 'rgba(255,245,210,0.9)' : 'rgba(255,150,110,0.9)';
		ctx.lineWidth = 1.5;
		ctx.stroke();

		ctx.beginPath();
		ctx.arc(x, y, isPlayer ? 4 : 3.5, 0, P.TAU);
		if (near) {
			ctx.fillStyle = isPlayer ? '#ffe9b0' : '#ff7a55';
			ctx.fill();
		} else {
			ctx.strokeStyle = isPlayer ? 'rgba(255,233,176,0.7)' : 'rgba(255,122,85,0.7)';
			ctx.lineWidth = 1.2;
			ctx.stroke();
		}
	};
})(window.PLANET);
