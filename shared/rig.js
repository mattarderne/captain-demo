// The rig geometry, and only the rig geometry: the GLSL distance functions
// smoke-lab/smoke.js worked out for a real jib-and-main section, plus the
// JS-side defaults that go with them.
//
// This exists because the same edit to this geometry has silently applied to
// one lab and no-oped in another FOUR separate times in this project, each
// time parsing cleanly and leaving the page running (see shared/labkit.js's
// own header for the class of bug this is). The rig is tuned — the luff-as-
// pivot, the sharp trailing edge, the 42%-chord camber peak are all measured,
// not guessed — so a second hand-copied version is a second chance to get one
// of those wrong. One copy, shared by every lab that wants a boat in its
// flow.
//
// Copied verbatim from smoke-lab/smoke.js's RIG_GLSL. Do not redesign it
// here; if it needs to change, change it once and let every lab pick it up.
(function (root) {
	'use strict';

	var RIG = root.RIG = {};

	// The rig, shared by every solver that needs to know where the solid is
	// and every display that draws it. One source, so the sail you can see
	// and the sail the air runs into are the same object.
	RIG.GLSL = [
		// A real section rather than a bent plate. NACA-style thickness: blunt at
		// the nose, tapering to a sharp trailing edge, laid on a cambered mean line
		// with maximum draft at 42% of the chord. The sharp leech matters more than
		// it looks: a constant-thickness arc keeps its full width right to the end,
		// so two of them close enough to form a slot just choke the gap instead.
		// `x` runs 0 at the luff to 1 at the leech.
		// The chord runs from the LUFF at q.x = 0 aft to the leech at q.x = -c, so
		// the foil's own origin IS its luff. That makes the pivot the luff too:
		// rotating the foil sheets the leech in and out while the luff stays
		// exactly where it is bolted. Rotating about the centre, as this did at
		// first, swung the whole sail including its attachment point, so trimming
		// slid the rig about instead of trimming it.
		'float foilDist(vec2 q, float chord, float camber, float thick) {',
		'  float c = max(chord, 1e-6);',
		'  float x = clamp(-q.x / c, 0.0, 1.0);',
		'  float yt = thick * c * (1.4845 * sqrt(x) - 0.6300 * x - 1.7580 * x * x',
		'           + 1.4215 * x * x * x - 0.5075 * x * x * x * x);',
		'  yt = max(yt, 0.0);',
		'  float pc = 0.42;',
		'  float m = camber * c;',
		'  float yc = x < pc ? m / (pc * pc) * (2.0 * pc * x - x * x)',
		'                    : m / ((1.0 - pc) * (1.0 - pc)) * ((1.0 - 2.0 * pc) + 2.0 * pc * x - x * x);',
		'  float across = abs(q.y - yc) - yt;',
		'  float ends = max(q.x, -q.x - c);',
		'  return max(across, ends);',
		'}',

		// Into a foil's own frame: translate to its centre, rotate by its set.
		'vec2 toFoil(vec2 p, vec2 origin, float ang) {',
		'  vec2 d = p - origin;',
		'  float c = cos(ang), s = sin(ang);',
		'  return vec2(d.x * c + d.y * s, -d.x * s + d.y * c);',
		'}',

		// The rig in the boat's own frame. `lee` is +1 or -1: which side the sails
		// are set on, so she works on either tack. Returns .x = hull, .y = jib,
		// .z = main. Only the two foils are ever given to the solver: the hull is
		// in the water, not in the air, and letting it shed its own wake buried the
		// thing the page exists to show.
		// `jib` and `mainF` are each (angle, chord, camber, thickness), so the two
		// sails can be set and shaped independently of one another.
		// `jibOff` and `mainOff` are the two ATTACHMENT POINTS in units of her
		// length: the stemhead and the mast. Fore-and-aft positive forward,
		// athwartships positive to leeward so the rig keeps its shape on either
		// tack. Both sails hang from these and pivot about them, so the slot is
		// set by where the mast is and how hard each sail is sheeted.
		'vec3 rigDist(vec2 a, float size, vec2 jibOff, vec2 mainOff, vec4 jib, vec4 mainF, float lee) {',
		'  vec2 h = a; h.y /= 0.34;',
		'  float hull = length(h) - size * 0.55;',
		// The jib is OUTBOARD and the main INBOARD of it, and the jib's leech
		// carries aft past the main's luff so the two overlap, which is how a
		// headsail and a main actually stand. The first cut had the main pushed
		// out to leeward of the jib's line, which is backwards: it made two
		// separate plates in a row rather than a slot.
		//
		// `slot` is the lateral separation between the two chord lines, split
		// either side of the centreline.
		// Her stemhead: where the jib is tacked down.
		'  vec2 jibO = vec2(size * jibOff.x, lee * size * jibOff.y);',
		'  float dJib = foilDist(toFoil(a, jibO, lee * jib.x), size * jib.y, lee * jib.z, jib.w);',
		// Her mast: where the main's luff is set.
		'  vec2 mainO = vec2(size * mainOff.x, lee * size * mainOff.y);',
		'  float dMain = foilDist(toFoil(a, mainO, lee * mainF.x), size * mainF.y, lee * mainF.z, mainF.w);',
		'  return vec3(hull, dJib, dMain);',
		'}'
	].join('\n');

	// The JS-side numbers that go with that geometry, straight off smoke-lab's
	// own `params` — the trim that made the slot actually read as a slot.
	// `boatSize`/`jibX`/`jibY`/`mainX`/`mainY` are all in "her own lengths",
	// exactly as the GLSL comments above describe; a caller places the rig by
	// choosing where `size` and the boat's own origin land in ITS coordinate
	// space (screen fraction, grid cells, whatever the caller's solver uses).
	RIG.defaults = {
		boatSize: 0.100,

		jibX: 0.59,
		jibY: 0.08,
		mainX: -0.20,
		mainY: 0.06,

		jibAngle: -23,
		jibChord: 1.30,
		jibCamber: 0.18,
		jibThick: 0.15,
		mainAngle: 7,
		mainChord: 1.60,
		mainCamber: 0.15,
		mainThick: 0.16
	};

	RIG.PARAM_KEYS = Object.keys(RIG.defaults);
})(window);
