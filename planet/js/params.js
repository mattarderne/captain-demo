// Every tunable in one place. The settings panel mutates this object live;
// nothing else keeps its own copy of a number that lives here.
(function (P) {
	'use strict';

	P.params = {
		world: {
			radius: 90,        // metres. The whole point of the ball: small = savage curve.
			boatLOA: 12.8,     // metres, and INDEPENDENT of the radius — see boatLength()
			boatScale: 1.0
		},

		wind: {
			speedKts: 14,
			azimuthDeg: 0,     // where the wind SOURCE sits in space, as seen from the ball
			elevationDeg: 14,
			separationDeg: 122,// angle from the windward stagnation point where flow separates

			// The shape of the field, as fractions of the free stream. The nose
			// of the ball is an ORDINARY breeze, the limb is the hard stuff, and
			// the back is a lee: eddying, not dead. The textbook 1.5*sin(theta)
			// gives nil at the nose, which made the windward face a trap rather
			// than a place to sail.
			noseFrac: 1.00,    // straight into the windward face
			limbFrac: 1.55,    // on the circumference, where it blows hardest

			// The lee is CONFUSED, not weak. It blows about as hard as anywhere
			// else on the ball; what the eddies scramble is its direction. An
			// earlier cut put the variation into the strength instead and the
			// boats simply stalled to nothing back there, which is the one thing
			// a lee should never do.
			wakeSpeed: 1.00,   // lee wind as a fraction of the free stream
			leeDrift: 0.55,    // mean downwind component, so it is a lee not a blender
			recirc: 0.40,      // part of it runs back UP the ball, and varies
			swirl: 1.10,       // sideways swing of the eddies; this is the confusion
			shedHz: 0.10,      // vortex shedding rate: the lee wind backs and fills
			eddy: 0.35,        // how much STRENGTH wobbles too. Keep this modest.
			eddyScale: 4.5,    // eddy size; higher is finer and busier
			gust: 0.16         // gust depth over the whole ball (also small shifts)
		},

		// Surface chop. Displaces the ball itself, so a hull a few lengths off
		// sits down in it and is genuinely hard to pick out.
		sea: {
			chop: 0.55,        // metres, crest to trough, in the strongest breeze
			chopScale: 1.0     // wavelength multiplier
		},

		// Each boat blankets the air downwind of it: a widening cone of dead air.
		shadow: {
			strength: 0.85,    // peak wind loss right behind the sails
			lengthMul: 4.0,    // shadow reach, in boat lengths
			sigmaMul: 0.62,    // shadow half-width at the transom, in boat lengths
			spread: 0.17,      // how fast the cone widens with distance
			bend: 0.55,        // how much air bends around the edges of the shadow

			// Her sails shed a vortex street, same as the ball does. This is what
			// you see wagging in her wake before the lull itself reaches you.
			eddy: 0.42,        // strength of the wag, radians at the peak deficit
			eddyPitch: 1.9,    // spacing of the vortices, in shadow half-widths
			shedHz: 0.30       // how fast the street drifts aft
		},

		// Broadsides. Ranges in BOAT LENGTHS, not metres, so they keep meaning
		// something as the ball resizes. See guns.js for why rangeLOA sits right
		// on top of the masthead horizon.
		guns: {
			rangeLOA: 7.5,
			arcDeg: 50,               // half-width of the broadside arc, either side of abeam
			playerReloadS: 20,        // matches the flat-ocean game's battle.playerReloadS
			reloadS: 16,              // ...and its battle.reloadS for the rival
			ballsPerBroadside: 5,
			hitAtPointBlank: 0.50,    // per ball, at nil range
			rakeDamage: 3,            // as the flat-ocean game: a rake is worth three
			maxDamagePerBroadside: 4, // no single broadside ends it
			spreadLOA: 1.6,           // how wide the misses fall
			flightPerLOA: 0.13        // seconds of flight per boat length of range
		},

		// A density field advected by the wind, in a texture wrapped round the
		// ball. This is the thing that actually shows you the air moving: dye off
		// the sails, carried, stretched and rolled up by the flow. See smoke.js.
		smoke: {
			enabled: true,
			resolution: 1024,  // texture width; height is half. Rebuild on change.
			substeps: 2,       // advection steps per frame; more = crisper filaments
			speed: 1.0,        // multiplier on how fast the wind carries it
			dissipate: 0.9975, // per 60th of a second. Lower fades sooner.
			fromSails: 3.6,    // dye injected at each boat
			plumeWidth: 0.55,  // injection radius, in boat lengths
			ambientSeed: 0.95, // feed over the windward face
			seedScale: 9,      // grain of that feed
			opacity: 1.0,      // how strongly it shows on the water
			contrast: 2.2
		},

		// The older line-integral-convolution texture, kept underneath the smoke
		// as a fine grain on the water. It has no sources and no memory, so it
		// cannot do what the smoke does, but it costs little and reads well close
		// to. Set strength to 0 if the two fight each other.
		flow: {
			strength: 0.14,    // 0 turns it off entirely
			scale: 26,         // detail; higher is finer
			step: 0.020,       // radians of arc per convolution step (streak length)
			speed: 0.035       // how fast the pattern drifts downwind
		},

		quality: {
			preset: 'medium',
			segments: 128,     // ball tessellation
			streamers: 900,    // surface wind streamlines
			trail: 26,         // points per streamline
			substeps: 1,       // wind integration substeps per frame
			paint: true,       // paint the wind field onto the water
			paintShadows: 4,   // boat shadows resolved in the painted field
			pixelRatio: 1.5
		},

		view: {
			camera: 'follow',  // follow | mast | orbit
			streamers: true,
			panels: true,      // beach-ball panelling on the water
			cones: false,      // draw each boat's dirty-air cone
			minimap: true,
			stars: 0.75,       // starfield brightness, 0 for an empty sky
			ambient: 0.52      // how lit the night side of the ball stays
		},

		sim: {
			autoTrim: true,
			aiMode: 'auto',    // auto | cover | hide | chase | free
			// Matches the flat-ocean game's battle.aggression. Scales how close
			// she tries to sit, how readily she fires, and how rarely she runs
			// for the far side of the ball. At 0 she is a tourist.
			aggression: 0.92,
			paused: false
		}
	};

	P.qualityPresets = {
		low:    { segments: 48,  streamers: 260,  trail: 14, substeps: 1, paint: false, paintShadows: 2, pixelRatio: 1.0 },
		// Chop lives in the ball's own geometry, so the tessellation is what
		// decides whether the horizon has a sea on it or a smooth edge. 128 is
		// the point where the silhouette stops looking faceted at R = 90.
		medium: { segments: 128, streamers: 900,  trail: 26, substeps: 1, paint: true,  paintShadows: 4, pixelRatio: 1.5 },
		high:   { segments: 144, streamers: 2000, trail: 36, substeps: 2, paint: true,  paintShadows: 4, pixelRatio: 2.0 },
		ultra:  { segments: 200, streamers: 3600, trail: 48, substeps: 3, paint: true,  paintShadows: 4, pixelRatio: 2.0 }
	};

	P.applyQualityPreset = function (name) {
		var preset = P.qualityPresets[name];
		if (!preset) return false;
		var q = P.params.quality;
		q.preset = name;
		for (var k in preset) if (preset.hasOwnProperty(k)) q[k] = preset[k];
		return true;
	};

	// Boat length in metres. Everything else about a boat (sail area, shadow
	// reach, turning circle) is derived from it.
	//
	// This used to be `0.085 * radius`, which made the whole world scale-free:
	// moving the radius slider changed the boat, her shadow, her turning circle
	// and the horizon by the same factor, so the picture was pixel-for-pixel
	// identical at 60 m and at 700 m and the slider looked broken. It was.
	// A boat is a fixed size now, and the radius is what curves away underneath
	// her — which is the only reason to have the slider at all.
	P.boatLength = function () {
		return P.params.world.boatLOA * P.params.world.boatScale;
	};

	// How far a lookout at `height` metres can see over the curve, in radians of
	// arc. Everything that asks "can she see him?" comes through here.
	P.horizonAngle = function (height) {
		var R = P.params.world.radius;
		return Math.acos(P.clamp(R / (R + height), -1, 1));
	};
})(window.PLANET);
