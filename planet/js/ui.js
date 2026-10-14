// Instruments, the settings drawer, and the keyboard.
(function (P) {
	'use strict';

	var UI = P.UI = { hudTimer: 0, hidden: false };

	function el(id) { return document.getElementById(id); }

	function make(tag, cls, text) {
		var n = document.createElement(tag);
		if (cls) n.className = cls;
		if (text !== undefined) n.textContent = text;
		return n;
	}

	// ---- settings drawer -----------------------------------------------------

	// Anything that needs more than a live parameter read gets a hook here.
	var rebuild = {
		ball: function () { P.Render.buildBall(); },
		streamers: function () { P.Streamers.rebuild(); },
		pixels: function () { P.UI.resize(); },
		wind: function () { P.Wind.updateDirection(); },
		all: function () {
			P.Render.buildBall();
			P.Streamers.rebuild();
			P.UI.resize();
		}
	};

	UI.spec = function () {
		var p = P.params;
		return [
			{ type: 'head', label: 'The ball' },
			{ type: 'range', label: 'Ball radius', min: 25, max: 400, step: 5, unit: 'm',
			  get: function () { return p.world.radius; },
			  set: function (v) { p.world.radius = v; },
			  note: function () {
				  return 'The boat stays the same size, so this is the curve itself. ' +
					  'Lookout can see ' + P.World.horizonLOA().toFixed(1) + ' boat lengths.';
			  } },
			{ type: 'range', label: 'Boat length', min: 5, max: 40, step: 0.5, unit: 'm',
			  get: function () { return p.world.boatLOA; },
			  set: function (v) { p.world.boatLOA = v; } },
			{ type: 'range', label: 'Boat size', min: 0.4, max: 2.2, step: 0.05, unit: 'x',
			  get: function () { return p.world.boatScale; },
			  set: function (v) { p.world.boatScale = v; } },

			{ type: 'head', label: 'The sea' },
			{ type: 'range', label: 'Chop', min: 0, max: 3, step: 0.05, unit: 'm',
			  get: function () { return p.sea.chop; },
			  set: function (v) { p.sea.chop = v; },
			  note: 'Waves on the ball itself. Flat water and a hull is a clean silhouette a long way off; put a sea on and she comes and goes.' },
			{ type: 'range', label: 'Wavelength', min: 0.3, max: 3, step: 0.05, unit: 'x',
			  get: function () { return 1 / p.sea.chopScale; },
			  set: function (v) { p.sea.chopScale = 1 / Math.max(0.05, v); } },

			{ type: 'head', label: 'Simulation quality' },
			{ type: 'choice', label: 'Preset', options: ['low', 'medium', 'high', 'ultra'],
			  get: function () { return p.quality.preset; },
			  set: function (v) { P.applyQualityPreset(v); },
			  after: rebuild.all, refresh: true },
			{ type: 'range', label: 'Wind streamers', min: 60, max: 5000, step: 20,
			  get: function () { return p.quality.streamers; },
			  set: function (v) { p.quality.streamers = v; p.quality.preset = 'custom'; },
			  after: rebuild.streamers, commit: true },
			{ type: 'range', label: 'Streamer length', min: 6, max: 64, step: 1,
			  get: function () { return p.quality.trail; },
			  set: function (v) { p.quality.trail = v; p.quality.preset = 'custom'; },
			  after: rebuild.streamers, commit: true },
			{ type: 'range', label: 'Flow substeps', min: 1, max: 6, step: 1,
			  get: function () { return p.quality.substeps; },
			  set: function (v) { p.quality.substeps = v; p.quality.preset = 'custom'; } },
			{ type: 'range', label: 'Ball tessellation', min: 24, max: 256, step: 8,
			  get: function () { return p.quality.segments; },
			  set: function (v) { p.quality.segments = v; p.quality.preset = 'custom'; },
			  after: rebuild.ball, commit: true },
			{ type: 'range', label: 'Pixel ratio', min: 0.5, max: 2, step: 0.1,
			  get: function () { return p.quality.pixelRatio; },
			  set: function (v) { p.quality.pixelRatio = v; p.quality.preset = 'custom'; },
			  after: rebuild.pixels },
			{ type: 'toggle', label: 'Paint the wind on the water',
			  get: function () { return p.quality.paint; },
			  set: function (v) { p.quality.paint = v; } },
			{ type: 'range', label: 'Boat shadows in the paint', min: 0, max: 4, step: 1,
			  get: function () { return p.quality.paintShadows; },
			  set: function (v) { p.quality.paintShadows = v; } },

			{ type: 'head', label: 'The wind' },
			{ type: 'range', label: 'Free stream', min: 2, max: 40, step: 0.5, unit: 'kts',
			  get: function () { return p.wind.speedKts; },
			  set: function (v) { p.wind.speedKts = v; } },
			{ type: 'range', label: 'Source bearing', min: 0, max: 360, step: 1, unit: '°',
			  get: function () { return p.wind.azimuthDeg; },
			  set: function (v) { p.wind.azimuthDeg = v; }, after: rebuild.wind },
			{ type: 'range', label: 'Source elevation', min: -85, max: 85, step: 1, unit: '°',
			  get: function () { return p.wind.elevationDeg; },
			  set: function (v) { p.wind.elevationDeg = v; }, after: rebuild.wind },
			{ type: 'range', label: 'Separation angle', min: 70, max: 170, step: 1, unit: '°',
			  get: function () { return p.wind.separationDeg; },
			  set: function (v) { p.wind.separationDeg = v; },
			  note: 'Where the flow lets go of the ball and the sheltered lee begins.' },
			{ type: 'range', label: 'On the nose', min: 0, max: 1.6, step: 0.05, unit: 'x',
			  get: function () { return p.wind.noseFrac; },
			  set: function (v) { p.wind.noseFrac = v; },
			  note: function () {
				  return 'Straight into the windward face: ' +
					  (p.wind.noseFrac * p.wind.speedKts).toFixed(1) + ' kts. Wind it to zero for the ' +
					  'textbook stagnation point, and a dead calm you cannot sail out of.';
			  } },
			{ type: 'range', label: 'On the limb', min: 0.2, max: 2.5, step: 0.05, unit: 'x',
			  get: function () { return p.wind.limbFrac; },
			  set: function (v) { p.wind.limbFrac = v; },
			  note: function () {
				  return 'The circumference, where it blows hardest: ' +
					  (p.wind.limbFrac * p.wind.speedKts).toFixed(1) + ' kts.';
			  } },
			{ type: 'range', label: 'Lee wind strength', min: 0, max: 1.2, step: 0.02,
			  get: function () { return p.wind.wakeSpeed; },
			  set: function (v) { p.wind.wakeSpeed = v; },
			  note: function () {
				  return 'Mean wind behind the ball: ' +
					  (p.wind.wakeSpeed * p.wind.speedKts).toFixed(1) + ' kts before the eddies ' +
					  'move it about. A lee, not a hole.';
			  } },
			{ type: 'range', label: 'Lee turbulence', min: 0, max: 1.2, step: 0.05,
			  get: function () { return p.wind.eddy; },
			  set: function (v) { p.wind.eddy = v; },
			  note: 'How hard the eddies breathe. At zero the lee is a steady, weak, backed breeze; wind it up and it lulls and puffs on you.' },
			{ type: 'range', label: 'Eddy size', min: 1, max: 14, step: 0.5,
			  get: function () { return p.wind.eddyScale; },
			  set: function (v) { p.wind.eddyScale = v; },
			  note: 'Higher is finer and busier.' },
			{ type: 'range', label: 'Lee back-eddy', min: 0, max: 1.5, step: 0.05,
			  get: function () { return p.wind.recirc; },
			  set: function (v) { p.wind.recirc = v; } },
			{ type: 'range', label: 'Lee swirl', min: 0, max: 2.5, step: 0.05,
			  get: function () { return p.wind.swirl; },
			  set: function (v) { p.wind.swirl = v; } },
			{ type: 'range', label: 'Eddy shedding', min: 0, max: 0.4, step: 0.005, unit: 'Hz',
			  get: function () { return p.wind.shedHz; },
			  set: function (v) { p.wind.shedHz = v; } },
			{ type: 'range', label: 'Gustiness', min: 0, max: 0.5, step: 0.01,
			  get: function () { return p.wind.gust; },
			  set: function (v) { p.wind.gust = v; } },

			{ type: 'head', label: 'Dirty air' },
			{ type: 'range', label: 'Blanket strength', min: 0, max: 1, step: 0.02,
			  get: function () { return p.shadow.strength; },
			  set: function (v) { p.shadow.strength = v; },
			  note: 'How dead the air is directly behind a boat’s sails.' },
			{ type: 'range', label: 'Shadow reach', min: 1, max: 18, step: 0.5, unit: 'LOA',
			  get: function () { return p.shadow.lengthMul; },
			  set: function (v) { p.shadow.lengthMul = v; } },
			{ type: 'range', label: 'Shadow width', min: 0.2, max: 2, step: 0.05, unit: 'LOA',
			  get: function () { return p.shadow.sigmaMul; },
			  set: function (v) { p.shadow.sigmaMul = v; } },
			{ type: 'range', label: 'Cone spread', min: 0, max: 0.6, step: 0.01,
			  get: function () { return p.shadow.spread; },
			  set: function (v) { p.shadow.spread = v; } },
			{ type: 'range', label: 'Bend round the edges', min: 0, max: 1.5, step: 0.05,
			  get: function () { return p.shadow.bend; },
			  set: function (v) { p.shadow.bend = v; } },

			{ type: 'head', label: 'View' },
			{ type: 'choice', label: 'Camera', options: ['follow', 'mast', 'orbit'],
			  get: function () { return p.view.camera; },
			  set: function (v) { p.view.camera = v; }, refresh: true },
			{ type: 'toggle', label: 'Surface streamlines',
			  get: function () { return p.view.streamers; }, set: function (v) { p.view.streamers = v; } },
			{ type: 'toggle', label: 'Beach-ball panels',
			  get: function () { return p.view.panels; }, set: function (v) { p.view.panels = v; } },
			{ type: 'toggle', label: 'Draw dirty-air cones',
			  get: function () { return p.view.cones; }, set: function (v) { p.view.cones = v; } },
			{ type: 'toggle', label: 'Tactician’s card',
			  get: function () { return p.view.minimap; }, set: function (v) { p.view.minimap = v; } },

			{ type: 'head', label: 'Sailing' },
			{ type: 'toggle', label: 'Auto-trim the sheets',
			  get: function () { return p.sim.autoTrim; }, set: function (v) { p.sim.autoTrim = v; } },
			{ type: 'choice', label: 'Rival', options: ['auto', 'cover', 'hide', 'chase', 'free'],
			  get: function () { return p.sim.aiMode; }, set: function (v) { p.sim.aiMode = v; }, refresh: true },
			{ type: 'button', label: 'Reset the race', action: function () { P.World.reset(); } }
		];
	};

	UI.buildSettings = function (host) {
		host.innerHTML = '';
		this.refreshers = [];
		var spec = this.spec(), self = this;

		spec.forEach(function (item) {
			if (item.type === 'head') {
				host.appendChild(make('h3', 'sec', item.label));
				return;
			}

			var row = make('div', 'row');
			var label = make('label', null, item.label);
			row.appendChild(label);

			if (item.type === 'range') {
				var out = make('span', 'val');
				var input = document.createElement('input');
				input.type = 'range';
				input.min = item.min; input.max = item.max; input.step = item.step;
				input.value = item.get();
				var show = function () {
					var v = parseFloat(input.value);
					var shown = item.step < 0.1 ? v.toFixed(2) : item.step < 1 ? v.toFixed(1) : Math.round(v);
					out.textContent = shown + (item.unit ? ' ' + item.unit : '');
				};
				var apply = function () {
					item.set(parseFloat(input.value));
					show();
					if (item.after && !item.commit) item.after();
					self.refresh();
				};
				input.addEventListener('input', apply);
				// Rebuilding a buffer on every pixel of slider travel is wasteful, so
				// the expensive ones wait for you to let go.
				if (item.commit) input.addEventListener('change', function () { item.after(); });
				label.appendChild(out);
				row.appendChild(input);
				show();
				this.refreshers.push(function () {
					if (document.activeElement !== input) { input.value = item.get(); show(); }
				});
			} else if (item.type === 'toggle') {
				var btn = make('button', 'toggle');
				var paint = function () {
					btn.textContent = item.get() ? 'on' : 'off';
					btn.className = 'toggle' + (item.get() ? ' on' : '');
				};
				btn.addEventListener('click', function () {
					item.set(!item.get());
					paint();
					if (item.after) item.after();
				});
				paint();
				row.appendChild(btn);
				this.refreshers.push(paint);
			} else if (item.type === 'choice') {
				var group = make('div', 'choice');
				var buttons = [];
				item.options.forEach(function (opt) {
					var b = make('button', null, opt);
					b.addEventListener('click', function () {
						item.set(opt);
						if (item.after) item.after();
						self.refresh();
					});
					buttons.push({ el: b, opt: opt });
					group.appendChild(b);
				});
				var paintChoice = function () {
					var cur = item.get();
					buttons.forEach(function (b) { b.el.className = b.opt === cur ? 'on' : ''; });
				};
				paintChoice();
				row.appendChild(group);
				this.refreshers.push(paintChoice);
			} else if (item.type === 'button') {
				var b2 = make('button', 'action', item.label);
				b2.addEventListener('click', item.action);
				row.innerHTML = '';
				row.appendChild(b2);
			}

			host.appendChild(row);

			// A note may be a live function — the radius and the light-airs floor
			// both say what the number you are dragging actually buys you.
			if (item.note) {
				var note = make('p', 'note');
				if (typeof item.note === 'function') {
					var paintNote = function () { note.textContent = item.note(); };
					paintNote();
					this.refreshers.push(paintNote);
				} else {
					note.textContent = item.note;
				}
				host.appendChild(note);
			}
		}, this);
	};

	UI.refresh = function () {
		if (!this.refreshers) return;
		for (var i = 0; i < this.refreshers.length; i++) this.refreshers[i]();
	};

	// ---- instruments ---------------------------------------------------------

	UI.init = function () {
		this.panel = el('settings');
		this.buildSettings(el('settings-body'));
		this.readouts = {
			speed: el('r-speed'), twa: el('r-twa'), wind: el('r-wind'), aw: el('r-aw'),
			zone: el('r-zone'), heading: el('r-heading'), rival: el('r-rival'),
			horizon: el('r-horizon'), trim: el('r-trim')
		};
		this.dirty = el('dirty');
		this.log = el('log');
		this.lastEvent = 0;
		this.gauge = el('trim-gauge');
		this.gaugeCtx = this.gauge ? this.gauge.getContext('2d') : null;
		this.hp = { us: el('hp-us'), them: el('hp-them') };
		this.gunLamps = { port: el('gun-port'), stbd: el('gun-stbd') };

		el('settings-toggle').addEventListener('click', function () { UI.toggleSettings(); });
		el('settings-close').addEventListener('click', function () { UI.toggleSettings(false); });

		P.Render.onCameraChanged = function () { UI.refresh(); };
		this.bindKeys();
		this.resize();
		window.addEventListener('resize', function () { UI.resize(); });
		return this;
	};

	UI.toggleSettings = function (force) {
		var open = force === undefined ? !this.panel.classList.contains('open') : force;
		this.panel.classList.toggle('open', open);
		// The drawer slides in over the button that opened it.
		el('settings-toggle').style.display = open ? 'none' : '';
		if (open) this.refresh();
	};

	UI.resize = function () {
		P.Render.resize(window.innerWidth, window.innerHeight);
	};

	UI.update = function (dt) {
		this.hudTimer -= dt;
		if (this.hudTimer > 0) return;
		this.hudTimer = 0.1;

		var boat = P.World.player, rival = P.World.rival;
		var R = P.params.world.radius, L = P.boatLength();
		var r = this.readouts;

		r.speed.textContent = boat.speed.toFixed(1);
		var side = boat.twa >= 0 ? 'S' : 'P';
		r.twa.textContent = Math.abs(Math.round(boat.twa)) + '° ' + side;
		r.wind.textContent = boat.windSpeed.toFixed(1) + ' kts';
		r.aw.textContent = boat.aws.toFixed(1) + ' @ ' + Math.abs(Math.round(boat.awa)) + '° ' +
			(boat.awa >= 0 ? 'S' : 'P');
		r.zone.textContent = P.Wind.zoneAt(boat.pos);

		// Trim used to read as a bare angle, which tells you nothing: you cannot
		// tell whether 49° is right without knowing what the wind wants. Show the
		// target alongside it, and how much drive the miss is costing.
		var want = Math.round(P.optimalSheet(boat.twa));
		var miss = Math.round(boat.sheet) - want;
		r.trim.textContent = Math.round(boat.sheet) + '° / want ' + want + '°' +
			(P.params.sim.autoTrim ? ' (auto)'
				: Math.abs(miss) < 4 ? ' — well set'
				: (miss > 0 ? ' — sheet in ↑' : ' — ease ↓') +
				  ' (' + Math.round(boat.trimEff * 100) + '% drive)');
		r.trim.className = (!P.params.sim.autoTrim && boat.trimEff < 0.8) ? 'v hot' : 'v';

		// "North" is the ball's own pole — as good a datum as any out here.
		var north = _north.set(0, 1, 0);
		north.addScaledVector(boat.pos, -north.dot(boat.pos));
		if (north.lengthSq() > 1e-8) {
			north.normalize();
			r.heading.textContent = P.compass(P.signedAngle(north, boat.head, boat.pos) / P.DEG + 360);
		} else {
			r.heading.textContent = '---';
		}

		var sep = P.arc(boat.pos, rival.pos) * R;
		var bearing = Math.round(P.signedAngle(boat.head, _toRival(boat, rival), boat.pos) / P.DEG);
		r.rival.textContent = P.World.rivalVisible
			? Math.abs(bearing) + '° ' + (bearing >= 0 ? 'stbd' : 'port') + ', ' +
			  Math.round(sep) + ' m (' + (sep / L).toFixed(1) + ' LOA)'
			: 'over the curve, ' + Math.round(sep) + ' m';
		r.rival.className = P.World.rivalVisible ? 'v' : 'v hidden';
		r.horizon.textContent = Math.round(P.World.horizonRange()) + ' m (' +
			P.World.horizonLOA().toFixed(1) + ' LOA)';

		var pct = Math.round(boat.deficit * 100);
		if (pct > 6) {
			this.dirty.style.display = 'block';
			this.dirty.textContent = boat.stalled
				? 'STALLED IN HER SHADOW — ' + pct + '% of our wind gone'
				: 'DIRTY AIR — ' + pct + '% of our wind gone';
			this.dirty.className = boat.stalled ? 'bad' : '';
		} else {
			this.dirty.style.display = 'none';
		}

		this.drawGauge();
		this.updateGunHud(boat, rival);

		var events = P.World.events;
		if (events.length && events[events.length - 1].at !== this.lastEvent) {
			this.lastEvent = events[events.length - 1].at;
			var line = make('div', null, events[events.length - 1].text);
			this.log.appendChild(line);
			while (this.log.children.length > 4) this.log.removeChild(this.log.firstChild);
			setTimeout(function () { if (line.parentNode) line.parentNode.removeChild(line); }, 8000);
		}
	};

	// ---- the guns ------------------------------------------------------------

	UI.updateGunHud = function (boat, rival) {
		if (!P.Guns || !this.hp.us) return;
		var g = P.params.guns;

		function bar(node, hp) {
			var pct = P.clamp(hp / 10, 0, 1) * 100;
			node.style.width = pct + '%';
			node.className = pct > 60 ? 'hp-fill' : pct > 30 ? 'hp-fill warn' : 'hp-fill bad';
		}
		bar(this.hp.us, boat.hp);
		bar(this.hp.them, rival.hp);

		var sol = P.Guns.solution(boat, rival);
		var self = this;
		['port', 'stbd'].forEach(function (s) {
			var lamp = self.gunLamps[s];
			if (!lamp) return;
			var load = boat.guns[s];
			var bears = sol.side === s && sol.inRange && sol.visible;
			if (load > 0) {
				lamp.textContent = s.toUpperCase() + ' ' + Math.ceil(load) + 's';
				lamp.className = 'lamp loading';
			} else if (bears) {
				lamp.textContent = s.toUpperCase() + (sol.raking ? ' RAKE!' : ' READY');
				lamp.className = 'lamp ' + (sol.raking ? 'rake' : 'ready');
			} else {
				lamp.textContent = s.toUpperCase() + ' —';
				lamp.className = 'lamp';
			}
		});
	};

	// ---- the trim gauge ------------------------------------------------------

	// A plan view of the boat with the wind coming in over her: the boom where
	// you have actually put it, a ghost boom where the wind wants it, and the
	// wedge between them. The number told you the sheet angle; it could not tell
	// you whether that angle was right, which is the only thing you want to know.
	UI.drawGauge = function () {
		var ctx = this.gaugeCtx;
		if (!ctx) return;
		var boat = P.World.player;
		var css = this.gauge.clientWidth || 150;
		if (this.gauge.width !== css * 2) { this.gauge.width = css * 2; this.gauge.height = css * 2; }
		var W = this.gauge.width, H = this.gauge.height;
		var cx = W / 2, cy = H * 0.56, r = Math.min(W, H) * 0.40;

		ctx.clearRect(0, 0, W, H);

		// Screen convention: bow up the canvas, starboard to the right, which is
		// exactly what the follow camera shows you.
		function pt(deg, rad) {
			var a = (deg - 90) * P.DEG;
			return [cx + Math.cos(a) * rad, cy + Math.sin(a) * rad];
		}

		// The no-go zone, so you can see when you are pinching.
		ctx.fillStyle = 'rgba(120, 150, 180, 0.10)';
		ctx.beginPath();
		ctx.moveTo(cx, cy);
		ctx.arc(cx, cy, r * 1.08, (-90 - 34) * P.DEG, (-90 + 34) * P.DEG);
		ctx.closePath();
		ctx.fill();

		// The hull.
		ctx.strokeStyle = 'rgba(190, 215, 240, 0.55)';
		ctx.lineWidth = 2;
		ctx.beginPath();
		ctx.ellipse(cx, cy, r * 0.16, r * 0.52, 0, 0, Math.PI * 2);
		ctx.stroke();

		// Canvas bearings are starboard-positive, same as `twa`. The boom goes to
		// LEEWARD, so wind over starboard swings it to port, which is +ve here.
		// Note this is the opposite sign to render.js's `side`, where the model's
		// local +X is the port side and rotation.y runs the other way.
		var side = boat.twa >= 0 ? 1 : -1;
		var want = P.optimalSheet(boat.twa);

		// Where the wind wants the boom.
		var wg = pt(180 + side * want, r * 0.86);
		ctx.strokeStyle = 'rgba(150, 200, 245, 0.45)';
		ctx.lineWidth = 3;
		ctx.setLineDash([6, 6]);
		ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(wg[0], wg[1]); ctx.stroke();
		ctx.setLineDash([]);

		// Where it is.
		var bg = pt(180 + side * boat.sheet, r * 0.86);
		var good = boat.trimEff > 0.9;
		ctx.strokeStyle = good ? '#8fe6b0' : boat.trimEff > 0.7 ? '#ffd9a0' : '#ff9a80';
		ctx.lineWidth = 5;
		ctx.lineCap = 'round';
		ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(bg[0], bg[1]); ctx.stroke();

		// The error, as a wedge you can close by eye.
		if (Math.abs(boat.sheet - want) > 2) {
			ctx.fillStyle = 'rgba(255, 150, 110, 0.20)';
			ctx.beginPath();
			ctx.moveTo(cx, cy);
			var a0 = (180 + side * want - 90) * P.DEG, a1 = (180 + side * boat.sheet - 90) * P.DEG;
			ctx.arc(cx, cy, r * 0.86, Math.min(a0, a1), Math.max(a0, a1));
			ctx.closePath();
			ctx.fill();
		}

		// The wind, an arrow blowing in from where it comes from. `twa` is already
		// a starboard-positive bearing to the wind's eye, so it plots straight.
		var from = pt(boat.twa, r * 1.10);
		var into = pt(boat.twa, r * 0.66);
		ctx.strokeStyle = '#bfe8ff';
		ctx.lineWidth = 3;
		ctx.beginPath(); ctx.moveTo(from[0], from[1]); ctx.lineTo(into[0], into[1]); ctx.stroke();
		ctx.fillStyle = '#bfe8ff';
		ctx.beginPath();
		var head = pt(boat.twa, r * 0.60);
		var l = pt(boat.twa + 7, r * 0.78), rr = pt(boat.twa - 7, r * 0.78);
		ctx.moveTo(head[0], head[1]); ctx.lineTo(l[0], l[1]); ctx.lineTo(rr[0], rr[1]);
		ctx.closePath(); ctx.fill();

		// Drive, as a bar along the bottom.
		var bw = W * 0.72, bx = (W - bw) / 2, by = H - 18;
		ctx.fillStyle = 'rgba(140, 190, 235, 0.18)';
		ctx.fillRect(bx, by, bw, 10);
		ctx.fillStyle = good ? '#8fe6b0' : boat.trimEff > 0.7 ? '#ffd9a0' : '#ff9a80';
		ctx.fillRect(bx, by, bw * P.clamp(boat.trimEff, 0, 1), 10);
	};

	var _north = new THREE.Vector3();
	var _tr = new THREE.Vector3();
	function _toRival(boat, rival) { return P.tangentToward(_tr, boat.pos, rival.pos); }

	// ---- keyboard ------------------------------------------------------------

	UI.keys = {};

	UI.bindKeys = function () {
		window.addEventListener('keydown', function (e) {
			if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
			UI.keys[e.code] = true;
			// The arrows are the helm and the sheets. Left to the browser they
			// also scroll the page and the settings drawer, which made trimming
			// feel like it was fighting the camera.
			if (/^Arrow/.test(e.code)) e.preventDefault();

			switch (e.code) {
				case 'KeyG': UI.toggleSettings(); e.preventDefault(); break;
				case 'KeyQ': P.Guns.fire(P.World.player, P.World.rival, 'port'); break;
				case 'KeyE': P.Guns.fire(P.World.player, P.World.rival, 'stbd'); break;
				case 'KeyF': P.Guns.fire(P.World.player, P.World.rival, null); break;
				case 'KeyC':
					var modes = ['follow', 'mast', 'orbit'];
					P.params.view.camera = modes[(modes.indexOf(P.params.view.camera) + 1) % 3];
					UI.refresh(); break;
				case 'KeyT': P.params.sim.autoTrim = !P.params.sim.autoTrim; UI.refresh(); break;
				case 'KeyL': P.params.view.streamers = !P.params.view.streamers; UI.refresh(); break;
				case 'KeyK': P.params.view.cones = !P.params.view.cones; UI.refresh(); break;
				case 'KeyP': P.params.quality.paint = !P.params.quality.paint; UI.refresh(); break;
				case 'KeyR': P.World.reset(); break;
				case 'KeyH': UI.hidden = !UI.hidden; document.body.classList.toggle('bare', UI.hidden); break;
				case 'Space': P.params.sim.paused = !P.params.sim.paused; e.preventDefault(); break;
			}
		});
		window.addEventListener('keyup', function (e) { UI.keys[e.code] = false; });
		window.addEventListener('blur', function () { UI.keys = {}; });
	};

	// Helm and sheets, read every frame.
	UI.driveInput = function (dt) {
		var k = this.keys, boat = P.World.player;
		var want = 0;
		if (k.ArrowLeft || k.KeyA) want -= 1;
		if (k.ArrowRight || k.KeyD) want += 1;
		boat.rudder += (want - boat.rudder) * (1 - Math.exp(-dt * 6));
		if (Math.abs(boat.rudder) < 0.01) boat.rudder = 0;

		var trim = 0;
		if (k.ArrowUp || k.KeyW) trim -= 1;      // sheet in
		if (k.ArrowDown || k.KeyS) trim += 1;    // ease
		if (trim !== 0) {
			P.params.sim.autoTrim = false;
			boat.sheet = P.clamp(boat.sheet + trim * 55 * dt, 0, 90);
		}
	};
})(window.PLANET);
