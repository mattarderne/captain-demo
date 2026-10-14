// Everything the two labs genuinely share.
//
// smoke-lab and globelab are the same instrument, one flat and one wrapped on a
// sphere. Their SOLVERS legitimately differ: the sphere version carries metric
// terms through the divergence, the pressure solve and the gradient, so those
// shaders cannot be common code. Their PANELS do not differ at all, and keeping
// two copies of that has been the single largest source of bugs in this project.
//
// Four times a change was made to both files by pattern-matching, and four times
// it silently applied to one and no-opped in the other, because the two had
// drifted a comment or an argument name apart:
//
//   - `uOil` declared in one shader and not the other: globelab dead on load.
//   - the wake-mixing sliders bound in one lab only: three dead controls.
//   - `hueRGB`/`splatRGB` added by matching a `splat` signature that differs
//     between the two: oil threw every frame on the globe.
//   - the preset buttons landing in one panel and not the other.
//
// Every one of those parsed cleanly and left the page running, so none were
// caught by anything short of exercising the specific feature. This file exists
// so that class of bug cannot happen again: the panel, the persistence and the
// presets have exactly one implementation.
(function (root) {
	'use strict';

	var LABKIT = root.LABKIT = {};

	// Hue around the wheel, for oil. The modulo is written defensively because
	// callers pass a time-varying phase that can go negative; the version that
	// lived in one of the labs did not, and would have returned undefined.
	LABKIT.hueRGB = function (h, v) {
		var i = Math.floor(h * 6), f = h * 6 - i;
		var q = 1 - f, t = f;
		switch (((i % 6) + 6) % 6) {
			case 0: return [v, v * t, 0];
			case 1: return [v * q, v, 0];
			case 2: return [0, v, v * t];
			case 3: return [0, v * q, v];
			case 4: return [v * t, 0, v];
			default: return [v, 0, v * q];
		}
	};

	// Presets for the AIR and the LOOK only.
	//
	// Deliberately none of them touch the rig: not a sail angle, chord, camber,
	// thickness, attachment point, nor her size, and not the camera or control
	// mode either. Those are hard-won and a preset that quietly threw them away
	// would be worse than no preset at all.
	//
	// "dobryakov" is the WebGL fluid demo's own published defaults mapped onto
	// these controls: a much coarser grid, dye that dies ten times faster, and
	// velocity that barely damps. A good reminder of how differently the same
	// solver behaves when it is tuned to be smeared with a finger rather than to
	// hold a streakline steady past a sail.
	// Exactly which keys a preset carries. Everything about the AIR and the LOOK;
	// nothing about the rig, the camera or the control mode. This list is also
	// what "save" captures, so a saved preset can never smuggle a sail angle in.
	LABKIT.PRESET_KEYS = [
		'wind', 'curl', 'viscosity', 'iterations', 'gravity',
		'streaks', 'streakCount', 'streakWidth', 'fade', 'maccormack',
		'medium', 'colourSpeed', 'speedScale', 'speedContrast', 'colourBlur',
		'saturation', 'contrast', 'neon'
	];

	LABKIT.PRESETS = {
		'wind tunnel': { wind: 0.30, curl: 19, viscosity: 0.70, iterations: 39,
			streaks: 2.00, streakCount: 21, streakWidth: 0.90, fade: 0.10,
			maccormack: 1.0, medium: 'smoke', colourSpeed: true,
			speedScale: 0.32, speedContrast: 1.00, colourBlur: 2.00,
			speedScale: 0.32,
			speedContrast: 1.00,
			colourBlur: 2.00,
			saturation: 1.00,
			contrast: 1.00,
			neon: 0.00
		},

		'glass': { wind: 0.55, curl: 0, viscosity: 0.95, iterations: 45,
			streaks: 1.60, streakCount: 34, streakWidth: 0.70, fade: 0.04,
			maccormack: 1.0, medium: 'smoke', colourSpeed: false,
			speedScale: 0.40,
			speedContrast: 1.60,
			colourBlur: 1.60,
			saturation: 0.85,
			contrast: 1.10,
			neon: 0.00
		},

		'oil slick': { wind: 0.40, curl: 12, viscosity: 0.88, iterations: 30,
			streaks: 2.60, streakCount: 26, streakWidth: 1.60, fade: 0.02,
			maccormack: 1.0, medium: 'oil', colourSpeed: false,
			speedScale: 0.40,
			speedContrast: 1.20,
			colourBlur: 2.00,
			saturation: 1.25,
			contrast: 1.05,
			neon: 0.35
		},

		'storm': { wind: 2.40, curl: 46, viscosity: 0.28, iterations: 24,
			streaks: 3.20, streakCount: 14, streakWidth: 1.90, fade: 0.55,
			maccormack: 0.7, medium: 'smoke', colourSpeed: true,
			speedScale: 0.45, speedContrast: 2.6, colourBlur: 1.4,
			speedScale: 0.45,
			speedContrast: 2.60,
			colourBlur: 1.40,
			saturation: 1.10,
			contrast: 1.15,
			neon: 0.20
		},

		'dobryakov': { wind: 1.00, curl: 30, viscosity: 0.20, iterations: 20,
			streaks: 2.20, streakCount: 18, streakWidth: 1.40, fade: 1.00,
			maccormack: 0.0, medium: 'oil', colourSpeed: false,
			speedScale: 0.50,
			speedContrast: 1.00,
			colourBlur: 2.00,
			saturation: 1.00,
			contrast: 1.00,
			neon: 0.00
		},

		// Straight off the panel you sent: dissipation 0.1, viscosity 1,
		// vorticity 20, with NEON on, COLORFUL on, and the FILTER block's
		// saturation 0.8 / contrast 1.2.
		'neon': { wind: 0.85, curl: 20, viscosity: 1.00, iterations: 30,
			streaks: 2.40, streakCount: 24, streakWidth: 1.20, fade: 0.10,
			maccormack: 1.0, medium: 'oil', colourSpeed: false,
			saturation: 0.80, contrast: 1.20, neon: 1.0,
			speedScale: 0.45,
			speedContrast: 1.40,
			colourBlur: 1.80
		},

		// The same look wound right up: saturated palette, hard contrast.
		'saturated': { wind: 1.30, curl: 34, viscosity: 0.55, iterations: 28,
			streaks: 3.00, streakCount: 18, streakWidth: 1.70, fade: 0.06,
			maccormack: 1.0, medium: 'oil', colourSpeed: false,
			saturation: 1.60, contrast: 1.45, neon: 0.75,
			speedScale: 0.50,
			speedContrast: 1.80,
			colourBlur: 1.60
		}
	};

	// One kit per lab, holding that lab's params object by reference.
	LABKIT.create = function (opts) {
		var params = opts.params;
		var STORE = opts.store;
		// A lab MUST bring its own presets if its params mean anything different
		// from the flat smoke lab's. The fallback exists for the two labs that
		// share that vocabulary, and is a trap for anyone else: `viscosity` and
		// `iterations` appear in several labs meaning genuinely different things,
		// so a shared preset would silently overwrite a diffusion coefficient
		// with a dye-fade value. Warn rather than fail, because failing would
		// take the panel with it.
		var PRESETS = opts.presets;
		if (!PRESETS) {
			PRESETS = LABKIT.PRESETS;
			if (!opts.sharedVocabulary) {
				console.warn('LABKIT: no presets given for "' + opts.store + '", falling back to ' +
					'the smoke-lab table. Pass your own `presets` unless this lab genuinely ' +
					'shares that parameter vocabulary, or a preset will overwrite params that ' +
					'happen to share a name but not a meaning.');
			}
		}
		// Which keys "save as..." captures. Defaults to the shared list, but a lab
		// with its own vocabulary must pass its own or saving silently drops
		// everything it does not recognise.
		var PRESET_KEYS = opts.presetKeys || LABKIT.PRESET_KEYS;
		var defaultOpen = opts.defaultOpen || ['sec-air', 'sec-smoke'];
		var refreshers = [];

		var kit = {};

		// ---- persistence -----------------------------------------------------

		kit.save = function () {
			try {
				var out = JSON.parse(JSON.stringify(params));
				out.__schema = SCHEMA;
				localStorage.setItem(STORE, JSON.stringify(out));
			} catch (e) {}
		};

		// Changing a DEFAULT does nothing for anyone who has already used the page:
		// their saved store simply overwrites it on load. That is not hypothetical
		// — switching the labs to sheets-and-rudder appeared to work in a clean
		// browser and did nothing at all in one that had been used before, which
		// looks exactly like the feature being broken.
		//
		// So: a schema number. Bump `schema` and list the keys in
		// `resetOnUpgrade`, and those keys take the code default once, on the next
		// load, without discarding everything else the user has tuned. Bumping the
		// store key would work too but throws away their whole session.
		var SCHEMA = opts.schema || 0;
		var RESET_ON_UPGRADE = opts.resetOnUpgrade || [];

		kit.load = function () {
			var raw;
			try { raw = localStorage.getItem(STORE); } catch (e) { return; }
			if (!raw) return;
			var saved;
			try { saved = JSON.parse(raw); } catch (e) { return; }
			// Only keys that already exist and are the same kind of value, so a
			// stale store from an older build can never inject junk. Bump the
			// store key whenever a value's MEANING changes, not when one is added.
			var stale = (saved.__schema || 0) < SCHEMA;
			for (var k in saved) {
				if (k === '__schema') continue;
				if (!params.hasOwnProperty(k)) continue;
				if (typeof saved[k] !== typeof params[k]) continue;
				// On an upgrade, these keys keep the code's new default rather
				// than the value this browser happens to have lying around.
				if (stale && RESET_ON_UPGRADE.indexOf(k) >= 0) continue;
				params[k] = saved[k];
			}
			if (stale) kit.save();
		};

		kit.clear = function () {
			try {
				localStorage.removeItem(STORE);
				localStorage.removeItem(STORE + '.open');
			} catch (e) {}
			location.reload();
		};

		// The current settings as the exact block that belongs in the lab's
		// source, so a keeper can be baked in rather than living in a browser.
		kit.settingsBlock = function () {
			var order = Object.keys(params), out = [];
			for (var i = 0; i < order.length; i++) {
				var k = order[i], v = params[k];
				if (typeof v === 'number') v = Number(v.toFixed(4));
				out.push('\t\t' + k + ': ' + JSON.stringify(v) + ',');
			}
			return out.join('\n');
		};

		// ---- controls --------------------------------------------------------

		kit.announce = function (text) {
			// Its own line. Announcements used to overwrite the readout's units
			// caveat, so the first sweep or settings copy permanently deleted the
			// one warning telling you not to read the forces as newtons.
			var el = document.getElementById('status-note');
			if (el) el.textContent = text;
		};

		kit.refreshAll = function () {
			for (var i = 0; i < refreshers.length; i++) refreshers[i]();
		};

		kit.slider = function (id, key, fmt, hook) {
			var input = document.getElementById('s-' + id);
			var out = document.getElementById('v-' + id);
			if (!input || !out) {
				// Loud, because a control present in the panel but never bound
				// just sits at a range input's default midpoint doing nothing,
				// and looks entirely alive. That happened three times.
				console.warn('LABKIT: no control for "' + id + '" (looked for #s-' + id + ' and #v-' + id + ')');
				return function () {};
			}
			input.value = params[key];
			var show = function () {
				out.textContent = fmt ? fmt(params[key]) : params[key];
			};
			input.addEventListener('input', function () {
				params[key] = parseFloat(input.value);
				if (hook) hook();
				show();
				kit.save();
			});
			show();
			refreshers.push(function () { input.value = params[key]; show(); });
			return show;
		};

		// A two-state button wired to a boolean param, with its lit state taken
		// from the param on load rather than from the markup. Hard-coding
		// `class="on"` in the HTML is how a button came to claim auto trim was
		// running when it was not.
		kit.toggle = function (id, key, onChange, label) {
			var el = document.getElementById(id);
			if (!el) { console.warn('LABKIT: no button #' + id); return function () {}; }
			var paint = function () {
				el.className = params[key] ? 'on' : '';
				if (label) el.textContent = label(params[key]);
			};
			el.addEventListener('click', function () {
				params[key] = !params[key];
				paint();
				if (onChange) onChange(params[key]);
				kit.save();
			});
			paint();
			refreshers.push(paint);
			return paint;
		};

		// For params that step through a list rather than flipping: the smoke/oil
		// medium, the camera modes, the control scheme. Registers a refresher, so
		// a preset that changes the underlying value repaints the control.
		kit.cycle = function (id, key, values, label, onChange) {
			var el = document.getElementById(id);
			if (!el) { console.warn('LABKIT: no button #' + id); return function () {}; }
			var paint = function () {
				var v = params[key];
				el.textContent = label ? label(v) : String(v);
				el.className = (values.length === 2 && v === values[1]) ? 'on' : '';
			};
			el.addEventListener('click', function () {
				var i = values.indexOf(params[key]);
				params[key] = values[(i + 1) % values.length];
				paint();
				if (onChange) onChange(params[key]);
				kit.save();
			});
			paint();
			refreshers.push(paint);
			return paint;
		};

		// Pick one of a set, as a row of buttons that light the active one.
		kit.pick = function (ids, key, onChange) {
			var paint = function () {
				for (var k in ids) {
					var e = document.getElementById(ids[k]);
					if (e) e.className = (params[key] === k) ? 'on' : '';
				}
			};
			var bind = function (k) {
				var e = document.getElementById(ids[k]);
				if (!e) { console.warn('LABKIT: no button #' + ids[k]); return; }
				e.addEventListener('click', function () {
					params[key] = k;
					paint();
					if (onChange) onChange(k);
					kit.save();
				});
			};
			for (var k in ids) bind(k);
			paint();
			refreshers.push(paint);
			return paint;
		};

		kit.bindSections = function () {
			var open = [];
			try { open = JSON.parse(localStorage.getItem(STORE + '.open') || '[]'); } catch (e) {}
			var all = document.querySelectorAll('#controls details');
			for (var i = 0; i < all.length; i++) {
				var d = all[i];
				d.open = open.length ? open.indexOf(d.id) >= 0 : defaultOpen.indexOf(d.id) >= 0;
				d.addEventListener('toggle', function () {
					var now = [], els = document.querySelectorAll('#controls details');
					for (var j = 0; j < els.length; j++) if (els[j].open) now.push(els[j].id);
					try { localStorage.setItem(STORE + '.open', JSON.stringify(now)); } catch (e) {}
				});
			}
		};

		// ---- presets ---------------------------------------------------------

		kit.applyPreset = function (name) {
			var p = PRESETS[name];
			if (!p) return;
			for (var k in p) {
				if (p.hasOwnProperty(k) && params.hasOwnProperty(k)) params[k] = p[k];
			}
			kit.refreshAll();
			kit.save();
			kit.announce('Preset: ' + name + '. The rig is untouched.');
		};

		// ---- saved presets ---------------------------------------------------
		//
		// Built-ins live in the table above; anything you save lives in
		// localStorage beside the settings. A saved preset captures PRESET_KEYS
		// only, so it stays a description of the air and the look and can never
		// carry a rig into a session where you did not want one.
		var USER_KEY = STORE + '.presets';

		function userPresets() {
			try { return JSON.parse(localStorage.getItem(USER_KEY) || '{}'); }
			catch (e) { return {}; }
		}

		function writeUserPresets(all) {
			try { localStorage.setItem(USER_KEY, JSON.stringify(all)); } catch (e) {}
		}

		kit.allPresets = function () {
			var out = {}, k;
			for (k in PRESETS) out[k] = { builtIn: true, values: PRESETS[k] };
			var u = userPresets();
			for (k in u) out[k] = { builtIn: false, values: u[k] };
			return out;
		};

		kit.applyPreset = function (name) {
			var all = kit.allPresets(), entry = all[name];
			if (!entry) return;
			var p = entry.values;
			for (var k in p) {
				if (p.hasOwnProperty(k) && params.hasOwnProperty(k)) params[k] = p[k];
			}
			kit.refreshAll();
			kit.save();
			kit.announce('Preset: ' + name + '. The rig is untouched.');
		};

		kit.savePreset = function (name) {
			if (!name) return;
			if (PRESETS.hasOwnProperty(name)) {
				kit.announce('"' + name + '" is a built-in. Pick another name.');
				return;
			}
			var vals = {};
			PRESET_KEYS.forEach(function (k) {
				if (params.hasOwnProperty(k)) vals[k] = params[k];
			});
			var all = userPresets();
			all[name] = vals;
			writeUserPresets(all);
			kit.buildPresetBar();
			var sel = document.getElementById('preset-select');
			if (sel) sel.value = name;
			kit.announce('Saved "' + name + '".');
		};

		kit.deletePreset = function (name) {
			var all = userPresets();
			if (!all.hasOwnProperty(name)) {
				kit.announce(PRESETS.hasOwnProperty(name)
					? 'Built-in presets cannot be deleted.' : 'Nothing to delete.');
				return;
			}
			delete all[name];
			writeUserPresets(all);
			kit.buildPresetBar();
			kit.announce('Deleted "' + name + '".');
		};

		// The dropdown is BUILT from the tables rather than written into each
		// lab's HTML, so a new preset appears in both panels and cannot land in
		// one and miss the other.
		kit.buildPresetBar = function (containerId) {
			var host = document.getElementById(containerId || 'preset-bar');
			if (!host) return;
			var previous = (document.getElementById('preset-select') || {}).value;
			host.innerHTML = '';

			var row = document.createElement('div');
			row.className = 'btns';
			var sel = document.createElement('select');
			sel.id = 'preset-select';
			var all = kit.allPresets();
			Object.keys(all).forEach(function (name) {
				var o = document.createElement('option');
				o.value = name;
				o.textContent = all[name].builtIn ? name : name + '  \u2022';
				sel.appendChild(o);
			});
			if (previous && all[previous]) sel.value = previous;
			sel.addEventListener('change', function () { kit.applyPreset(sel.value); });
			row.appendChild(sel);
			host.appendChild(row);

			var row2 = document.createElement('div');
			row2.className = 'btns';
			var save = document.createElement('button');
			save.textContent = 'save as\u2026';
			save.addEventListener('click', function () {
				var name = window.prompt('Save the current air and look as:', '');
				if (name) kit.savePreset(name.trim());
			});
			var del = document.createElement('button');
			del.textContent = 'delete';
			del.addEventListener('click', function () {
				var s2 = document.getElementById('preset-select');
				if (s2) kit.deletePreset(s2.value);
			});
			row2.appendChild(save);
			row2.appendChild(del);
			host.appendChild(row2);
		};

		return kit;
	};
})(window);
