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
			{ type: 'range', label: 'Ball radius', min: 60, max: 700, step: 5, unit: 'm',
			  get: function () { return p.world.radius; },
			  set: function (v) { p.world.radius = v; },
			  note: 'Small ball, savage curve — she drops over the horizon in a couple of boat lengths.' },
			{ type: 'range', label: 'Boat size', min: 0.4, max: 2.2, step: 0.05, unit: 'x',
			  get: function () { return p.world.boatScale; },
			  set: function (v) { p.world.boatScale = v; } },

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
			{ type: 'range', label: 'Lee wind strength', min: 0, max: 0.6, step: 0.01,
			  get: function () { return p.wind.wakeSpeed; },
			  set: function (v) { p.wind.wakeSpeed = v; } },
			{ type: 'range', label: 'Lee back-eddy', min: 0, max: 1.5, step: 0.05,
			  get: function () { return p.wind.recirc; },
			  set: function (v) { p.wind.recirc = v; } },
			{ type: 'range', label: 'Lee swirl', min: 0, max: 2, step: 0.05,
			  get: function () { return p.wind.swirl; },
			  set: function (v) { p.wind.swirl = v; } },
			{ type: 'range', label: 'Eddy shedding', min: 0, max: 0.3, step: 0.005, unit: 'Hz',
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
					out.textContent = (item.step < 1 ? v.toFixed(2) : Math.round(v)) + (item.unit ? ' ' + item.unit : '');
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
			if (item.note) host.appendChild(make('p', 'note', item.note));
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
		r.trim.textContent = Math.round(boat.sheet) + '°' +
			(P.params.sim.autoTrim ? ' auto' : '') +
			(boat.trimEff < 0.85 ? ' — badly set' : '');

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
		r.horizon.textContent = Math.round(P.World.horizonRange()) + ' m';

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

		var events = P.World.events;
		if (events.length && events[events.length - 1].at !== this.lastEvent) {
			this.lastEvent = events[events.length - 1].at;
			var line = make('div', null, events[events.length - 1].text);
			this.log.appendChild(line);
			while (this.log.children.length > 4) this.log.removeChild(this.log.firstChild);
			setTimeout(function () { if (line.parentNode) line.parentNode.removeChild(line); }, 8000);
		}
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
			switch (e.code) {
				case 'KeyG': UI.toggleSettings(); e.preventDefault(); break;
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
