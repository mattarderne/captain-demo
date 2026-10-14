// Free flight for the foil lab.
//
// The solver cannot run a real wingfoil in real time: at 7 m/s on this grid
// the water would have to move about 50 times further per step than it can.
// So flight works in two halves. CALIBRATE puts the whole rig (front wing,
// fuselage, stabiliser, pitched together about the mast base) through a grid
// of depths and pitch angles in the solver and records the lift, drag and
// moment coefficients it measures. FLY then moves the board in real time on
// those measured coefficients, while the water picture follows the rig.
//
// What comes from the solver: 2D section lift and moment for both foils at
// every depth and pitch, including the free surface's effect and the main
// foil's downwash on the stabiliser in the side-on slice.
//
// What comes from formulas, because a side-on 2D slice cannot hold it:
// span effects (lifting line: induced angle and induced drag, raised near the
// surface), the trailing-vortex downwash at the stabiliser, skin friction,
// the mast and its spray, and ventilation. Each is marked where it is used.
(function (root) {
	'use strict';

	var LAB = root.FOILLAB;
	var RHO = 1025, G = 9.81, NU = 1.19e-6, KNOT = 0.514444, DEG = Math.PI / 180;

	// The craft: an 85 cm, aspect-ratio-9 front wing (9.4 cm mean chord,
	// 803 cm^2), a 38 cm stabiliser, and a 60 cm fuselage between their
	// leading edges. Setting angles are relative to the fuselage.
	var craft = {
		mainSpan: 0.85, mainAR: 9, mainSet: 1.5, mainCamber: 0.045, mainThick: 0.11,
		stabSpan: 0.38, stabAR: 6.5, stabSet: -1.5, stabCamber: -0.02, stabThick: 0.09,
		mainAhead: 0.20, stabAft: 0.40,
		mastChord: 0.12, mastThick: 0.015,
		oswald: 0.9,
		// Trailing-vortex downwash at the stabiliser as a fraction of the
		// far-field value 2 CL / (pi AR). An estimate for a tail about 0.7
		// spans behind the wing.
		downwashAtTail: 0.8,
		// Lift kept by a ventilated foil. Free-streamline theory for a flat
		// plate with an air cavity over its back gives a quarter of the
		// fully wetted lift at small angles (pi/2 alpha against 2 pi alpha).
		ventLift: 0.25
	};
	craft.mainChord = craft.mainSpan / craft.mainAR;
	craft.stabChord = craft.stabSpan / craft.stabAR;

	// One domain height is this many metres, chosen so the front wing's chord
	// spans 0.15 of the height (about 114 cells at the default resolution).
	var CHORD_UV = 0.15;
	var H = craft.mainChord / CHORD_UV;
	var RIG_X = 0.45;

	var opts = {
		speedKn: 14, massKg: 90, stanceCm: 20, mastCm: 85,
		// The rider holds the board at this attitude with their feet, the way
		// riders do without thinking. Height is left free.
		balance: true, attitude: 1,
		// The board, mast, foil and the part of the rider that pitches with
		// them, about the rider's feet. An estimate, not a measurement.
		pitchInertia: 6
	};
	var STORE = 'foillab.flight.v1', TABLE_STORE = 'foillab.flightTable.v1';
	try { Object.assign(opts, JSON.parse(localStorage.getItem(STORE) || '{}')); } catch (e) {}
	function saveOpts() { try { localStorage.setItem(STORE, JSON.stringify(opts)); } catch (e) {} }

	var state = { depth: 0.15, pitch: 2, w: 0, q: 0, mainVent: false, stabVent: false, ventTimer: 0, touching: false };
	var flying = false, table = null, last = null, crashed = null, crashNext = false;
	var calib = { running: false };

	LAB.flight = { craft: craft, opts: opts, state: state, H: H };

	// ---- the rig in the solver ---------------------------------------------

	var savedParams = null;
	function solverSetup() {
		var p = LAB.params;
		if (!savedParams) {
			savedParams = {};
			['mainChord', 'mainCamber', 'mainThick', 'mainIncidence', 'stabChord', 'stabCamber', 'stabThick',
				'stabIncidence', 'flow', 'curl', 'viscosity', 'mode'].forEach(function (k) { savedParams[k] = p[k]; });
		}
		p.mode = 'linear';
		p.mainChord = craft.mainChord / H; p.stabChord = craft.stabChord / H;
		p.mainCamber = craft.mainCamber; p.mainThick = craft.mainThick; p.mainIncidence = craft.mainSet;
		p.stabCamber = craft.stabCamber; p.stabThick = craft.stabThick; p.stabIncidence = craft.stabSet;
		p.flow = 230; p.curl = 0; p.viscosity = 0;
	}
	function solverRestore() {
		if (!savedParams) return;
		Object.assign(LAB.params, savedParams);
		savedParams = null;
	}
	function placeRig(depth, pitch, vent) {
		var aspect = LAB.simAspect();
		LAB.setRig({
			metresPerHeight: H,
			// The front wing's leading edge RIG_X metres downstream of the
			// inflow, with the wake running on across the rest of the screen.
			pivotX: (RIG_X + craft.mainAhead) / (H * aspect),
			mastLength: opts.mastCm / 100,
			mainAhead: craft.mainAhead, stabAft: craft.stabAft,
			// The domain shows about 0.6 m of water; deeper than that the rig
			// is drawn at the bottom and the depth is read off the panel.
			depth: Math.min(depth, H * 0.82),
			pitch: pitch, mastThick: craft.mastThick, vent: vent || 0,
			still: calib.running
		});
	}

	// ---- calibration -------------------------------------------------------

	// Depths of the mast base in front-wing chords, denser near the surface
	// where the surface effect changes fastest. Pitch in degrees, fuselage
	// to flow.
	var DEPTHS_C = [0.45, 0.65, 0.9, 1.3, 2.0, 3.0];
	var PITCHES = [-1, 3, 7];
	// Measured on a symmetric 11% section at 5 degrees: the solver sheds a
	// vortex street at its own (low) Reynolds number, so lift swings about
	// +/-0.08 around its mean, and it takes a few seconds to settle after a
	// move. Averaged over 8 s it reads 0.464-0.470 at 78 or 114 cells a chord
	// and at 80 or 120 pressure iterations alike (thin-aerofoil theory: 0.55,
	// a real section at this Reynolds number about 0.5). So calibration runs
	// at the coarser grid and 80 iterations, about 2.6x faster, and holds
	// each point long enough to average several shedding cycles.
	var SETTLE = 4, HOLD = 5, FIRST_SETTLE = 7, ITERATIONS = 80, CAL_RES = 540;
	// A point where either foil is within this fraction of its chord of the
	// surface is not run: the foil is about to breach, and the flight model
	// treats that region with its ventilation model instead.
	var MIN_CLEAR = 0.15;

	function signature() {
		return JSON.stringify({ v: 4, rigX: RIG_X, craft: craft, chordUV: CHORD_UV, it: ITERATIONS, flow: 230,
			simRes: CAL_RES, depths: DEPTHS_C, pitches: PITCHES, settle: SETTLE, hold: HOLD });
	}

	function startCalibration() {
		flying = false;
		solverSetup();
		LAB.iterationsOverride = ITERATIONS;
		var pts = [];
		for (var i = DEPTHS_C.length - 1; i >= 0; i--) {
			var row = PITCHES.slice();
			if ((DEPTHS_C.length - 1 - i) % 2) row.reverse();
			row.forEach(function (th) {
				var cl = clearances(DEPTHS_C[i] * craft.mainChord, th);
				if (cl.main > MIN_CLEAR * craft.mainChord && cl.stab > MIN_CLEAR * craft.stabChord) pts.push({ i: i, th: th });
			});
		}
		document.body.classList.add('flight');
		calib = { running: true, pts: pts, k: 0, t: 0, phase: 0, acc: null, redo: 0,
			out: { main: grid(), stab: grid() }, started: performance.now(), res: LAB.params.simRes };
		LAB.params.simRes = CAL_RES;
		LAB.rebuildBuffersForTest();
		var first = pts[0];
		calib.running = true;
		placeRig(DEPTHS_C[first.i] * craft.mainChord, first.th);
		LAB.clearAll();
		renderStatus();
	}
	function grid() {
		var g = [];
		for (var i = 0; i < DEPTHS_C.length; i++) {
			g.push(PITCHES.map(function () { return null; }));
		}
		return g;
	}

	function calibStep(dt) {
		var c = calib, pt = c.pts[c.k];
		c.t += dt;
		var settle = c.k === 0 ? FIRST_SETTLE : SETTLE;
		if (c.phase === 0) {
			if (c.t >= settle) { c.phase = 1; c.t = 0; c.acc = { m: [0, 0, 0], s: [0, 0, 0], n: 0 }; }
			return;
		}
		var mi = LAB.mainForce.inst, si = LAB.stabForce.inst;
		// A blown-up solve reads impossible lift. Start the water again and
		// settle this point afresh, once.
		if (mi && (Math.abs(mi.cl) > 3 || !isFinite(mi.cl)) && c.redo < 2) {
			c.redo++; c.phase = 0; c.t = 0; LAB.clearAll();
			console.log('[lab] calibration point ' + c.k + ' blew up; restarting the water');
			return;
		}
		if (mi && si) {
			c.acc.m[0] += mi.cl; c.acc.m[1] += mi.cd; c.acc.m[2] += mi.cm;
			c.acc.s[0] += si.cl; c.acc.s[1] += si.cd; c.acc.s[2] += si.cm;
			c.acc.n++;
		}
		if (c.t < HOLD) return;
		var n = Math.max(1, c.acc.n);
		var j = PITCHES.indexOf(pt.th);
		c.out.main[pt.i][j] = { cl: c.acc.m[0] / n, cd: c.acc.m[1] / n, cm: c.acc.m[2] / n };
		c.out.stab[pt.i][j] = { cl: c.acc.s[0] / n, cd: c.acc.s[1] / n, cm: c.acc.s[2] / n };
		c.k++; c.t = 0; c.phase = 0; c.redo = 0;
		if (c.k >= c.pts.length) { finishCalibration(); return; }
		var nx = c.pts[c.k];
		placeRig(DEPTHS_C[nx.i] * craft.mainChord, nx.th);
	}

	// Points skipped near the surface take the nearest measured point at the
	// same pitch from deeper down, so the table has no holes.
	function fillHoles(g) {
		for (var j = 0; j < PITCHES.length; j++) {
			for (var i = 0; i < DEPTHS_C.length; i++) {
				if (g[i][j]) continue;
				for (var k = i + 1; k < DEPTHS_C.length; k++) if (g[k][j]) { g[i][j] = Object.assign({ filled: true }, g[k][j]); break; }
				if (!g[i][j]) g[i][j] = { cl: 0, cd: 0, cm: 0, filled: true };
			}
		}
		return g;
	}

	function finishCalibration() {
		LAB.params.simRes = calib.res;
		LAB.rebuildBuffersForTest();
		LAB.clearAll();
		table = { sig: signature(), depths: DEPTHS_C.map(function (d) { return d * craft.mainChord; }),
			pitches: PITCHES.slice(), main: fillHoles(calib.out.main), stab: fillHoles(calib.out.stab),
			seconds: Math.round((performance.now() - calib.started) / 1000), when: new Date().toISOString() };
		try { localStorage.setItem(TABLE_STORE, JSON.stringify(table)); } catch (e) {}
		fitTable(table);
		calib.running = false;
		LAB.iterationsOverride = null;
		document.body.classList.remove('flight');
		var att = trimAttitude();
		if (att !== null) opts.attitude = Math.round(att * 10) / 10;
		saveOpts(); refreshSliders();
		resetFlight();
		renderStatus();
		console.log('[lab] calibration done in ' + table.seconds + ' s', JSON.stringify(summary()));
	}

	// A calibration made in this browser wins; otherwise the one shipped
	// with the page (the same procedure, run once and saved as
	// calibration.json) is used, so the page flies without the wait.
	function loadTable() {
		try {
			var t = JSON.parse(localStorage.getItem(TABLE_STORE) || 'null');
			if (t && t.sig === signature()) { table = fitTable(t); return; }
		} catch (e) {}
		if (!root.fetch) return;
		root.fetch('calibration.json').then(function (r) { return r.ok ? r.json() : null; }).then(function (t) {
			if (t && t.sig === signature() && !table) {
				table = fitTable(t); table.shipped = true;
				var att = trimAttitude();
				if (att !== null) opts.attitude = Math.round(att * 10) / 10;
				refreshSliders(); renderStatus();
			}
		}).catch(function () {});
	}

	// The measured points carry the solver's shedding noise (lift swings
	// about +/-0.08 around its mean). Flight uses a least-squares fit of them
	// to a smooth form instead of joining the dots:
	//   C = a + b pitch + (e + f pitch) s(depth)
	// where s is a surface effect that fades with depth. Of four candidate
	// shapes, the one that fits each quantity best is kept, and its error is
	// shown on the panel.
	var SHAPES = {
		'exp1': function (d) { return Math.exp(-d / craft.mainChord); },
		'exp06': function (d) { return Math.exp(-d / (0.6 * craft.mainChord)); },
		'inv07': function (d) { return 1 / (1 + Math.pow(d / (0.7 * craft.mainChord), 2)); },
		'inv4': function (d) { return 1 / (1 + 4 * Math.pow(d / craft.mainChord, 2)); }
	};
	function solveLS(A, y) {
		var n = A[0].length, M = [], i, j, k;
		for (i = 0; i < n; i++) { M.push(new Array(n + 1).fill(0)); }
		for (var r = 0; r < A.length; r++) for (i = 0; i < n; i++) { for (j = 0; j < n; j++) M[i][j] += A[r][i] * A[r][j]; M[i][n] += A[r][i] * y[r]; }
		for (i = 0; i < n; i++) {
			var p = i; for (k = i + 1; k < n; k++) if (Math.abs(M[k][i]) > Math.abs(M[p][i])) p = k;
			var tmp = M[i]; M[i] = M[p]; M[p] = tmp;
			for (k = 0; k < n; k++) if (k !== i) { var fct = M[k][i] / M[i][i]; for (j = i; j <= n; j++) M[k][j] -= fct * M[i][j]; }
		}
		return M.map(function (row, ii) { return row[n] / row[ii]; });
	}
	function fitTable(t) {
		t.fit = {};
		['main', 'stab'].forEach(function (foil) {
			t.fit[foil] = {};
			['cl', 'cm', 'cd'].forEach(function (field) {
				var pts = [];
				t[foil].forEach(function (row, i) { row.forEach(function (p, j) { if (!p.filled) pts.push([t.depths[i], t.pitches[j], p[field]]); }); });
				var best = null;
				Object.keys(SHAPES).forEach(function (name) {
					var s = SHAPES[name];
					var A = pts.map(function (q) { var v = s(q[0]); return [1, q[1], v, q[1] * v]; });
					var k = solveLS(A, pts.map(function (q) { return q[2]; }));
					var e2 = 0;
					A.forEach(function (a, r) { var v = a[0] * k[0] + a[1] * k[1] + a[2] * k[2] + a[3] * k[3] - pts[r][2]; e2 += v * v; });
					var rms = Math.sqrt(e2 / pts.length);
					if (!best || rms < best.rms) best = { shape: name, k: k, rms: rms };
				});
				t.fit[foil][field] = best;
			});
		});
		return t;
	}
	function look(which, field, depth, pitch) {
		var F = table.fit[which][field], k = F.k;
		pitch = Math.max(table.pitches[0] - 6, Math.min(table.pitches[table.pitches.length - 1] + 6, pitch));
		var s = SHAPES[F.shape](Math.max(0, depth));
		return k[0] + k[1] * pitch + (k[2] + k[3] * pitch) * s;
	}
	// The raw calibration point nearest a depth and pitch: bilinear in depth,
	// linear in pitch. Kept for comparing against the fit.
	function lookRaw(which, field, depth, pitch) {
		var T = table[which], D = table.depths, P = table.pitches;
		var i = 0;
		if (depth <= D[0]) { i = 0; depth = D[0]; }
		else if (depth >= D[D.length - 1]) { i = D.length - 2; depth = D[D.length - 1]; }
		else { while (depth > D[i + 1]) i++; }
		var fi = (depth - D[i]) / (D[i + 1] - D[i]);
		pitch = Math.max(P[0] - 6, Math.min(P[P.length - 1] + 6, pitch));
		var j = 0;
		if (pitch <= P[0]) j = 0;
		else if (pitch >= P[P.length - 1]) j = P.length - 2;
		else { while (pitch > P[j + 1]) j++; }
		var fj = (pitch - P[j]) / (P[j + 1] - P[j]);
		function at(ii) { return T[ii][j][field] + (T[ii][j + 1][field] - T[ii][j][field]) * fj; }
		return at(i) + (at(i + 1) - at(i)) * fi;
	}

	function summary() {
		if (!table) return null;
		var deep = table.depths[table.depths.length - 1], shallow = table.depths[0];
		return {
			mainClDeep4: +look('main', 'cl', deep, 4).toFixed(3),
			mainClShallow4: +look('main', 'cl', shallow, 4).toFixed(3),
			mainSlopePerDeg: +((look('main', 'cl', deep, 7) - look('main', 'cl', deep, -2)) / 9).toFixed(4),
			stabClDeep4: +look('stab', 'cl', deep, 4).toFixed(3)
		};
	}

	// ---- the physics of the board ------------------------------------------

	// Free-surface factor on induced drag for a wing at depth h, span b. The
	// surface at speed mirrors the trailing vortices with the same sign,
	// which raises the downwash; Wieselsberger's ground-effect fit, with its
	// sign reversed, as an estimate.
	function surfaceSigma(h, b) {
		var x = Math.max(0.02, h / b);
		return Math.max(0, (1 - 1.32 * x) / (1.05 + 7.4 * x));
	}
	// Skin friction from the ITTC-57 line, with a thickness form factor,
	// both sides. Re from the local speed and chord.
	function profileDrag(U, chord, tc) {
		var Re = Math.max(1e4, U * chord / NU);
		var cf = 0.075 / Math.pow(Math.log(Re) / Math.LN10 - 2, 2);
		return 2 * cf * (1 + 2 * tc + 60 * Math.pow(tc, 4));
	}

	function rot(ax, ay, th) {
		var c = Math.cos(th * DEG), s = Math.sin(th * DEG);
		return [ax * c + ay * s, -ax * s + ay * c];
	}

	// Top of a foil's upper surface, metres above its leading edge, at angle
	// `a` (degrees, nose-up) and chord c. Mirrors foilDist in foil.js.
	function foilTop(c, camber, thick, a) {
		var ca = Math.cos(a * DEG), sa = Math.sin(a * DEG), top = -1e9, pc = 0.42, m = camber * c;
		for (var k = 0; k <= 20; k++) {
			var x = k / 20;
			var yt = thick * c * (1.4845 * Math.sqrt(x) - 0.6300 * x - 1.7580 * x * x + 1.4215 * x * x * x - 0.5075 * x * x * x * x);
			var yc = x < pc ? m / (pc * pc) * (2 * pc * x - x * x) : m / ((1 - pc) * (1 - pc)) * ((1 - 2 * pc) + 2 * pc * x - x * x);
			var py = -x * c * sa + (yc + Math.max(0, yt)) * ca;
			if (py > top) top = py;
		}
		return top;
	}
	// How far below the surface each foil's highest point is, in metres.
	function clearances(depth, pitch) {
		var m = rot(-craft.mainAhead, 0, pitch), s = rot(craft.stabAft, 0, pitch);
		return {
			main: depth - m[1] - foilTop(craft.mainChord, craft.mainCamber, craft.mainThick, craft.mainSet + pitch),
			stab: depth - s[1] - foilTop(craft.stabChord, craft.stabCamber, craft.stabThick, craft.stabSet + pitch)
		};
	}

	// Every force and moment on the board+mast+foil at one state. Lift up is
	// positive, drag is downstream, the moment is about the rider's feet,
	// nose-up positive. w is the board's sink rate (m/s, down positive), q its
	// pitch rate (rad/s, nose-up positive).
	function loads(st, o) {
		var U = o.speedKn * KNOT, mast = o.mastCm / 100;
		var feet = rot(-o.stanceCm / 100, mast, st.pitch);
		var parts = [
			{ key: 'main', at: rot(-craft.mainAhead, 0, st.pitch), span: craft.mainSpan, chord: craft.mainChord,
				ar: craft.mainAR, tc: craft.mainThick, vent: st.mainVent },
			{ key: 'stab', at: rot(craft.stabAft, 0, st.pitch), span: craft.stabSpan, chord: craft.stabChord,
				ar: craft.stabAR, tc: craft.stabThick, vent: st.stabVent }
		];
		var out = { lift: 0, moment: 0, drag: { wing: 0, induced: 0, stab: 0, mast: 0, fuselage: 0, board: 0 }, parts: {} };
		var mainCl = 0;
		for (var k = 0; k < 2; k++) {
			var f = parts[k];
			var r = [f.at[0] - feet[0], f.at[1] - feet[1]];
			// Rotation about the feet moves this foil: forward (more speed) and
			// up or down (more or less angle).
			var vx = st.q * r[1], vy = -st.q * r[0];
			var Ur = Math.max(0.5, U - vx);
			var dAlpha = Math.atan2(st.w - vy, Ur) / DEG;
			var depthHere = st.depth;
			var sig = surfaceSigma(Math.max(0.01, st.depth - f.at[1]), f.span);
			var K = (1 + sig) / (Math.PI * craft.oswald * f.ar);
			var th = st.pitch + dAlpha;
			if (f.key === 'stab') th -= craft.downwashAtTail * 2 * mainCl / (Math.PI * craft.mainAR) / DEG;
			// Lifting line on the measured section: the 3D lift is the 2D lift
			// at the angle left after the induced angle CL K.
			var cl = look(f.key, 'cl', depthHere, th);
			for (var it = 0; it < 4; it++) cl = look(f.key, 'cl', depthHere, th - cl * K / DEG);
			var cm = look(f.key, 'cm', depthHere, th - cl * K / DEG);
			var cdi = cl * cl * K;
			if (f.vent) { cl *= craft.ventLift; cm *= craft.ventLift; cdi = Math.abs(cl) * 0.1 + 0.02; }
			if (f.key === 'main') mainCl = cl;
			var qd = 0.5 * RHO * Ur * Ur, S = f.span * f.chord;
			var L = qd * S * cl, Dp = qd * S * profileDrag(Ur, f.chord, f.tc), Di = qd * S * cdi;
			var M = qd * S * f.chord * cm;
			out.lift += L;
			out.moment += M - r[0] * L + r[1] * (Dp + Di);
			if (f.key === 'main') { out.drag.wing += Dp; out.drag.induced += Di; }
			else out.drag.stab += Dp + Di;
			out.parts[f.key] = { cl: cl, cm: cm, L: L, D: Dp + Di, sigma: sig, angle: th };
		}
		var q0 = 0.5 * RHO * U * U;
		// The mast: friction on the wetted length, plus spray where it cuts
		// the surface (Hoerner: about 0.24 on thickness squared).
		var wet = Math.max(0, Math.min(st.depth, mast));
		var Dmast = q0 * craft.mastChord * wet * profileDrag(U, craft.mastChord, craft.mastThick / craft.mastChord)
			+ (wet > 0 && wet < mast ? q0 * craft.mastThick * craft.mastThick * 0.24 : 0);
		var mastMid = rot(0, wet / 2, st.pitch);
		out.moment += (mastMid[1] - feet[1]) * Dmast;
		out.drag.mast = Dmast;
		// Fuselage: friction on about 0.05 m^2 of wetted area.
		var Dfus = q0 * 0.05 * profileDrag(U, 0.6, 0.04) / 2;
		out.drag.fuselage = Dfus;
		out.moment += (0 - feet[1]) * Dfus;
		// Touchdown: once the board reaches the water it planes, hard.
		var sink = st.depth - mast;
		if (sink > 0) {
			var Ft = Math.max(0, 30000 * sink + 3000 * st.w);
			out.lift += Ft;
			out.drag.board = 0.4 * Ft;
		}
		out.dragTotal = 0;
		for (var key in out.drag) out.dragTotal += out.drag[key];
		return out;
	}

	var RIDER_K = 3000, RIDER_C = 300, RIDER_REACH = 0.25, FOOT_GAP = 0.5;

	function resetFlight() {
		var eq = table ? equilibrium(opts) : null;
		state.depth = eq && eq.depth ? eq.depth + 0.04 : 0.25;
		state.pitch = eq && eq.depth ? eq.pitch : 3;
		state.w = 0; state.q = 0; state.mainVent = false; state.stabVent = false; state.ventTimer = 0;
	}

	function flyStep(dt) {
		var o = opts, m = o.massKg;
		var a = loads(state, o);
		last = a;
		var dw = (m * G - a.lift) / m;
		// The rider: ankle stiffness and damping toward the attitude they are
		// holding, limited to what shifting their whole weight between feet
		// half a metre apart can give.
		var Mr = 0;
		if (o.balance) {
			var lim = m * G * RIDER_REACH;
			Mr = -RIDER_K * (state.pitch - o.attitude) * DEG - RIDER_C * state.q;
			Mr = Math.max(-lim, Math.min(lim, Mr));
		}
		state.riderMoment = Mr;
		var dq = (a.moment + Mr) / o.pitchInertia;
		state.w += dw * dt; state.depth += state.w * dt;
		state.q += dq * dt; state.pitch += state.q * dt / DEG;
		state.pitch = Math.max(-25, Math.min(30, state.pitch));
		if (state.depth < -0.05) { state.depth = -0.05; state.w = Math.max(0, state.w); }
		// Ventilation: a foil that breaches draws air over its back and keeps
		// it until it is back down about half a chord and the cavity has had
		// a moment to wash off.
		var cl = clearances(state.depth, state.pitch);
		state.clear = cl;
		if (cl.main < 0.002) { state.mainVent = true; state.ventTimer = 0; }
		if (cl.stab < 0.002) { state.stabVent = true; state.ventTimer = 0; }
		if (state.mainVent || state.stabVent) {
			state.ventTimer += dt;
			if (state.ventTimer > 0.2) {
				if (cl.main > 0.5 * craft.mainChord) state.mainVent = false;
				if (cl.stab > 0.5 * craft.stabChord) state.stabVent = false;
			}
		}
		state.touching = state.depth > o.mastCm / 100;
		// Pitched past 20 degrees, or running away: that is a crash. Stop and
		// say why rather than starting her again into the same crash.
		if (!isFinite(state.depth + state.pitch + state.w + state.q) || Math.abs(state.pitch) > 20 ||
			Math.abs(state.q) > 30 || Math.abs(state.w) > 15) {
			state.crashes = (state.crashes || 0) + 1;
			crashed = state.mainVent || state.stabVent ? 'the front wing ventilated and she pitched over' :
				(state.pitch > 0 ? 'she pitched up and over' : 'she nosed in');
			crashNext = true;
		}
	}

	// The board settles where lift equals weight and the moment about the
	// feet is zero. At each depth, find the pitch where the moment crosses
	// from nose-up to nose-down as the nose rises (a pitch-stable balance),
	// then find the depth where lift matches weight with more lift deeper
	// (height-stable: rise and the surface takes lift away, sink and it
	// gives it back).
	function pitchForMoment(depth, o) {
		var M = function (th) { return loads({ depth: depth, pitch: th, w: 0, q: 0 }, o).moment; };
		var prevTh = -10, prevM = M(prevTh);
		for (var th = -9.5; th <= 12; th += 0.5) {
			var m = M(th);
			if (prevM > 0 && m <= 0) return prevTh + (th - prevTh) * prevM / (prevM - m);
			prevTh = th; prevM = m;
		}
		return null;
	}
	// With the rider holding an attitude, pitch is that attitude and only the
	// height is free: she settles where lift at that attitude equals weight.
	function liftAt(d, th, o) { return loads({ depth: d, pitch: th, w: 0, q: 0 }, o).lift; }
	function equilibriumHeld(o) {
		var W = o.massKg * G, th = o.attitude, prev = null;
		var dmin = 0.02, dmax = Math.min(o.mastCm / 100 - 0.01, 0.45);
		for (var k = 0; k <= 80; k++) {
			var d = dmin + (dmax - dmin) * k / 80;
			var F = liftAt(d, th, o) - W;
			if (prev && prev.F < 0 && F >= 0 && clearances(d, th).main > 0.002) {
				var dd = prev.d + (d - prev.d) * (-prev.F / (F - prev.F));
				return { depth: dd, pitch: th, stable: true, moment: loads({ depth: dd, pitch: th, w: 0, q: 0 }, o).moment };
			}
			prev = { d: d, F: F };
		}
		return { depth: null, pitch: th, note: prev && prev.F > 0 ?
			'at this attitude lift beats weight at every depth: she climbs until the front wing breaches' :
			'at this attitude lift falls short of weight: she sinks until the board touches' };
	}
	// The attitude that rides the front wing about a chord under at this speed.
	function trimAttitude() {
		if (!table) return null;
		var W = opts.massKg * G, lo = -8, hi = 12, d;
		var target = craft.mainChord;
		var depthFor = function (th) {
			// mast-base depth that puts the front wing's top one chord under
			var lo2 = 0.01, hi2 = 0.6;
			for (var k = 0; k < 30; k++) { var mid = (lo2 + hi2) / 2; if (clearances(mid, th).main < target) lo2 = mid; else hi2 = mid; }
			return (lo2 + hi2) / 2;
		};
		var f = function (th) { d = depthFor(th); return liftAt(d, th, opts) - W; };
		var flo = f(lo), fhi = f(hi);
		if (flo * fhi > 0) return null;
		for (var k = 0; k < 40; k++) { var mid = (lo + hi) / 2, fm = f(mid); if (fm * flo > 0) { lo = mid; flo = fm; } else hi = mid; }
		return (lo + hi) / 2;
	}
	function equilibrium(o) {
		if (o.balance) return equilibriumHeld(o);
		var W = o.massKg * G, prev = null, res = { depth: null }, sawLift = 0;
		var dmin = 0.02, dmax = Math.min(o.mastCm / 100 - 0.01, 0.45);
		for (var k = 0; k <= 60; k++) {
			var d = dmin + (dmax - dmin) * k / 60;
			var th = pitchForMoment(d, o);
			if (th === null) { prev = null; continue; }
			var cl = clearances(d, th);
			var F = loads({ depth: d, pitch: th, w: 0, q: 0 }, o).lift - W;
			sawLift = F;
			if (prev && prev.F < 0 && F >= 0 && cl.main > 0.002) {
				var f = -prev.F / (F - prev.F);
				res = { depth: prev.d + (d - prev.d) * f, pitch: prev.th + (th - prev.th) * f, stable: true };
				break;
			}
			prev = { d: d, th: th, F: F };
		}
		if (res.depth === null) {
			res.note = prev === null ? 'no pitch-stable balance at this stance: move your weight forward' :
				(sawLift > 0 ? 'lift beats weight at every depth: she climbs to the surface' :
					'lift falls short of weight: she sinks until the board touches');
		}
		return res;
	}
	// The stance that settles her with the front wing about a chord under.
	function trimStance() {
		if (!table) return null;
		var target = craft.mainChord * 1.3, o = Object.assign({}, opts), best = null;
		for (var s = -5; s <= 45; s += 1) {
			o.stanceCm = s;
			var e = equilibrium(o);
			if (e.depth === null) continue;
			var miss = Math.abs(clearances(e.depth, e.pitch).main - craft.mainChord);
			if (!best || miss < best.miss) best = { stance: s / 100, depth: e.depth, pitch: e.pitch, miss: miss };
		}
		return best;
	}

	LAB.flight.stepOnce = function (dt) { flyStep(dt); return last; };
	LAB.flight.place = function (d, p, still) { solverSetup(); placeRig(d, p); var r = LAB.getRig(); r.still = !!still; };
	LAB.flight.loads = function (st) { return table ? loads(st, opts) : null; };
	LAB.flight.equilibrium = function () { return table ? equilibrium(opts) : null; };
	LAB.flight.look = function (w, f, d, p) { return table ? look(w, f, d, p) : null; };
	LAB.flight.summary = summary;
	LAB.flight.trimStance = trimStance;
	LAB.flight.trimAttitude = trimAttitude;
	LAB.flight.calibrate = startCalibration;
	LAB.flight.table = function () { return table; };
	LAB.flight.calibrating = function () { return calib.running; };
	LAB.flight.fly = function (on) { setFlying(on); };
	LAB.flight.reset = resetFlight;

	// ---- hooks into the lab --------------------------------------------------

	LAB.onStep = function (dt) { if (calib.running) calibStep(dt); };
	LAB.onFrame = function (dt) {
		if (flying && table) {
			var n = 8, h = dt / n;
			for (var k = 0; k < n && !crashNext; k++) flyStep(h);
			if (crashNext) { crashNext = false; setFlying(false); return; }
			placeRig(state.depth, state.pitch, state.mainVent ? 1 : 0);
		}
		renderReadouts();
	};

	function setFlying(on) {
		if (on && !table) return;
		flying = !!on;
		if (flying) crashed = null;
		document.body.classList.toggle('flight', flying || calib.running);
		if (flying) { solverSetup(); resetFlight(); placeRig(state.depth, state.pitch); LAB.clearAll(); }
		else if (!calib.running) { LAB.setRig(null); solverRestore(); LAB.clearAll(); }
		renderStatus();
	}

	// ---- panel -----------------------------------------------------------------

	var els = {};
	function $(id) { return els[id] || (els[id] = document.getElementById(id)); }
	var sliderDefs = [
		['f-speed', 'speedKn', function (v) { return (+v).toFixed(1) + ' kn'; }],
		['f-mass', 'massKg', function (v) { return Math.round(v) + ' kg'; }],
		['f-stance', 'stanceCm', function (v) { return (+v).toFixed(1) + ' cm'; }],
		['f-mast', 'mastCm', function (v) { return Math.round(v) + ' cm'; }],
		['f-attitude', 'attitude', function (v) { return (+v).toFixed(1) + '°'; }]
	];
	function refreshSliders() {
		sliderDefs.forEach(function (d) {
			var s = $('s-' + d[0]), v = $('v-' + d[0]);
			if (s) s.value = opts[d[1]];
			if (v) v.textContent = d[2](opts[d[1]]);
		});
	}
	function bindPanel() {
		sliderDefs.forEach(function (d) {
			var s = $('s-' + d[0]);
			if (!s) return;
			s.addEventListener('input', function () {
				opts[d[1]] = parseFloat(s.value); saveOpts(); refreshSliders(); renderStatus();
			});
		});
		refreshSliders();
		var bal = $('b-balance');
		var paintBal = function () { bal.className = opts.balance ? 'on' : ''; bal.textContent = opts.balance ? 'rider balances' : 'no rider input'; };
		bal.addEventListener('click', function () { opts.balance = !opts.balance; saveOpts(); paintBal(); renderStatus(); });
		paintBal();
		$('b-calibrate').addEventListener('click', function () { if (!calib.running) startCalibration(); });
		$('b-fly').addEventListener('click', function () { setFlying(!flying); });
		$('b-trim').addEventListener('click', function () {
			var att = trimAttitude();
			if (att !== null) { opts.attitude = Math.round(att * 10) / 10; saveOpts(); refreshSliders(); }
			renderStatus();
		});
		$('b-drop').addEventListener('click', function () { if (flying) { resetFlight(); state.depth += 0.08; } });
	}

	function renderStatus() {
		var el = $('flight-status');
		if (!el) return;
		var fly = $('b-fly');
		if (fly) { fly.className = flying ? 'on' : ''; fly.textContent = flying ? 'stop flying' : 'fly'; fly.disabled = !table; }
		if (calib.running) {
			var left = (calib.pts.length - calib.k) * (SETTLE + HOLD);
			el.textContent = 'Calibrating: point ' + (calib.k + 1) + ' of ' + calib.pts.length + ', about ' +
				Math.max(1, Math.round(left / 60 * 1.3)) + ' min of solver time left. Hands off.';
			return;
		}
		if (crashed) {
			el.textContent = 'Crashed: ' + crashed + ' at ' + opts.speedKn + ' kn. Press trim for this speed, or lower the attitude, then fly again.';
			el.className = 'note bad';
			return;
		}
		el.className = 'note';
		if (!table) { el.textContent = 'Not calibrated yet. Calibrate once (about four minutes); the result is kept in this browser.'; return; }
		var eq = equilibrium(opts);
		var s = summary();
		el.textContent = (table.shipped ? 'Using the calibration shipped with the page. ' : 'Calibrated in this browser. ') +
			'Front wing CL at 4 degrees: ' + s.mainClDeep4 +
			' deep, ' + s.mainClShallow4 + ' at the surface (fit to the measured points within ' +
			table.fit.main.cl.rms.toFixed(2) + '). ' +
			(eq.depth ? 'At this speed and attitude she should settle with the front wing ' +
				Math.round(clearances(eq.depth, eq.pitch).main * 100) + ' cm under.' : (eq.note || 'No steady height here.'));
	}

	function setText(id, t, cls) { var e = $(id); if (e) { e.textContent = t; if (cls !== undefined) e.className = 'val ' + cls; } }
	var readTimer = 0;
	function renderReadouts() {
		if (calib.running) {
			readTimer++;
			if (readTimer % 20 === 0) renderStatus();
			return;
		}
		if (!flying || !last) return;
		var o = opts, W = o.massKg * G, mast = o.mastCm / 100;
		var st = state.touching ? 'touching down' : (state.mainVent ? 'VENTILATED' : (state.clear && state.clear.main < 0.02 ? 'skimming the surface' : 'flying'));
		setText('fr-state', st, state.mainVent || state.touching ? 'bad' : 'good');
		setText('fr-ride', Math.round((mast - state.depth) * 100) + ' cm');
		setText('fr-depth', Math.round((state.clear ? state.clear.main : 0) * 100) + ' cm');
		setText('fr-pitch', state.pitch.toFixed(1) + '°');
		setText('fr-lift', Math.round(last.lift / W * 100) + '%');
		setText('fr-drag', Math.round(last.dragTotal) + ' N');
		setText('fr-power', Math.round(last.dragTotal * o.speedKn * KNOT) + ' W');
		var front = 0.5 - (state.riderMoment || 0) / (W * FOOT_GAP);
		setText('fr-feet', o.balance ? Math.round(front * 100) + '% front, ' + Math.round((1 - front) * 100) + '% back' : 'hands off',
			o.balance && Math.abs(state.riderMoment || 0) >= W * RIDER_REACH * 0.99 ? 'bad' : undefined);
		var d = last.drag;
		setText('fr-breakdown', 'wing ' + Math.round(d.wing) + ', induced ' + Math.round(d.induced) + ', stab ' + Math.round(d.stab) +
			', mast ' + Math.round(d.mast) + ', fuselage ' + Math.round(d.fuselage) + (d.board ? ', board ' + Math.round(d.board) : ''));
	}

	loadTable();
	var bootLab = LAB.boot;
	LAB.boot = function () {
		bootLab();
		bindPanel();
		renderStatus();
	};
})(window);
