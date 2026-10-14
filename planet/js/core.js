// Shared maths for the spherical world.
//
// Everything in the sim lives on a UNIT sphere: a position is a unit vector, a
// heading is a unit vector tangent to the sphere at that position. World-space
// distances are (angle * radius), so changing the ball's radius rescales the
// whole world without touching a single position.
window.PLANET = window.PLANET || {};

(function (P) {
	'use strict';

	// The ocean demo next door vendors three.js r72, and we ride on the same
	// copy rather than shipping a second one. r72 predates a couple of Vector3
	// helpers this code leans on hard, so fill them in.
	if (!THREE.Vector3.prototype.addScaledVector) {
		THREE.Vector3.prototype.addScaledVector = function (v, s) {
			this.x += v.x * s; this.y += v.y * s; this.z += v.z * s;
			return this;
		};
	}

	P.DEG = Math.PI / 180;
	P.TAU = Math.PI * 2;

	P.clamp = function (v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); };

	P.lerp = function (a, b, t) { return a + (b - a) * t; };

	P.smoothstep = function (edge0, edge1, x) {
		var t = P.clamp((x - edge0) / (edge1 - edge0), 0, 1);
		return t * t * (3 - 2 * t);
	};

	// Wrap to (-180, 180] degrees.
	P.wrapDeg = function (d) {
		d = (d + 180) % 360;
		if (d < 0) d += 360;
		return d - 180;
	};

	P.compass = function (deg) {
		var d = Math.round(deg) % 360;
		if (d < 0) d += 360;
		return ('00' + d).slice(-3);
	};

	// Any unit vector tangent to the sphere at `p`. Used where the flow is
	// degenerate (the two stagnation points) and a direction is still needed.
	P.arbitraryTangent = function (out, p) {
		if (Math.abs(p.y) < 0.9) out.set(0, 1, 0); else out.set(1, 0, 0);
		out.addScaledVector(p, -out.dot(p));
		return out.normalize();
	};

	// Rodrigues rotation about a UNIT axis, in place.
	var _cross = new THREE.Vector3();
	P.rotateAbout = function (v, axis, angle) {
		var c = Math.cos(angle), s = Math.sin(angle);
		_cross.crossVectors(axis, v);
		var d = axis.dot(v) * (1 - c);
		v.set(
			v.x * c + _cross.x * s + axis.x * d,
			v.y * c + _cross.y * s + axis.y * d,
			v.z * c + _cross.z * s + axis.z * d
		);
		return v;
	};

	// Unit tangent at `from` pointing along the great circle towards `to`.
	P.tangentToward = function (out, from, to) {
		out.copy(to).addScaledVector(from, -to.dot(from));
		if (out.lengthSq() < 1e-12) return P.arbitraryTangent(out, from);
		return out.normalize();
	};

	// Angle (radians) along the surface between two unit vectors.
	P.arc = function (a, b) { return Math.acos(P.clamp(a.dot(b), -1, 1)); };

	// Signed angle from `a` to `b` in the tangent plane at `p`, +ve to STARBOARD.
	//
	// Starboard is (a x p), not (p x a). Get this backwards and everything reads
	// mirrored: the helm answers the wrong way, the wind blows over the wrong
	// side, and the compass counts anticlockwise. The check is the render basis
	// in render.js — makeBasis(pos x head, pos, head) — where the model's forward
	// is +Z and up is +Y, so the model's right-hand side lies along (head x pos).
	// Every sign in the sim is pinned to that.
	P.signedAngle = function (a, b, p) {
		var ang = Math.acos(P.clamp(a.dot(b), -1, 1));
		_cross.crossVectors(a, b);
		return _cross.dot(p) > 0 ? -ang : ang;
	};

	// A rotation about `p` by a positive angle swings a tangent vector to PORT
	// (towards p x v). Anything that wants to express "turn this much to
	// starboard" as an angle goes through here rather than guessing the sign.
	P.STARBOARD = -1;

	// Re-seat `head` as a unit tangent at `pos` after numerical drift.
	P.orthonormalise = function (pos, head) {
		pos.normalize();
		head.addScaledVector(pos, -head.dot(pos));
		if (head.lengthSq() < 1e-12) P.arbitraryTangent(head, pos);
		else head.normalize();
	};

	// Cheap, allocation-free, loosely-coherent noise in [-1, 1]. Not Perlin —
	// just three beating sinusoids, which is plenty for gusts.
	P.flowNoise = function (x, y, z, t) {
		return (
			Math.sin(x * 3.1 + t * 0.7) * Math.sin(y * 2.3 - t * 0.53) * Math.sin(z * 1.9 + t * 0.31) +
			0.5 * Math.sin(x * 6.7 - t * 0.41) * Math.sin(z * 5.3 + t * 0.29)
		) * 0.67;
	};

	// A point on the unit sphere from azimuth/elevation in degrees.
	P.fromAzEl = function (out, azDeg, elDeg) {
		var az = azDeg * P.DEG, el = elDeg * P.DEG;
		var ce = Math.cos(el);
		return out.set(Math.sin(az) * ce, Math.sin(el), Math.cos(az) * ce).normalize();
	};
})(window.PLANET);
