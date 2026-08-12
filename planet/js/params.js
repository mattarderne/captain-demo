// Every tunable in one place. The settings panel mutates this object live;
// nothing else keeps its own copy of a number that lives here.
(function (P) {
	'use strict';

	P.params = {
		world: {
			radius: 150,       // world units. The whole point of the ball: small = savage curve.
			boatScale: 1.0     // boat length = 0.085 * radius * boatScale
		},

		wind: {
			speedKts: 14,
			azimuthDeg: 0,     // where the wind SOURCE sits in space, as seen from the ball
			elevationDeg: 14,
			separationDeg: 108,// angle from the windward stagnation point where flow separates
			wakeSpeed: 0.20,   // lee-side wind as a fraction of the free stream
			recirc: 0.55,      // how much of the lee flow runs back UP the ball
			swirl: 0.90,       // sideways component of the lee eddies
			shedHz: 0.06,      // vortex shedding rate — makes the lee wind wander and back
			gust: 0.16         // gust depth (also drives the small directional shifts)
		},

		// Each boat blankets the air downwind of it: a widening cone of dead air.
		shadow: {
			strength: 0.85,    // peak wind loss right behind the sails
			lengthMul: 7.0,    // shadow reach, in boat lengths
			sigmaMul: 0.62,    // shadow half-width at the transom, in boat lengths
			spread: 0.17,      // how fast the cone widens with distance
			bend: 0.55         // how much air bends around the edges of the shadow
		},

		quality: {
			preset: 'medium',
			segments: 96,      // ball tessellation
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
			minimap: true
		},

		sim: {
			autoTrim: true,
			aiMode: 'auto',    // auto | cover | hide | chase | free
			paused: false
		}
	};

	P.qualityPresets = {
		low:    { segments: 48,  streamers: 260,  trail: 14, substeps: 1, paint: false, paintShadows: 2, pixelRatio: 1.0 },
		medium: { segments: 96,  streamers: 900,  trail: 26, substeps: 1, paint: true,  paintShadows: 4, pixelRatio: 1.5 },
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

	// Boat length in world units — everything about a boat (sail area, shadow
	// reach, turning circle) is derived from it, so boats stay proportional to
	// the ball as the radius slider moves.
	P.boatLength = function () {
		return 0.085 * P.params.world.radius * P.params.world.boatScale;
	};
})(window.PLANET);
