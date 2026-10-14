// Boot and the frame loop.
(function (P) {
	'use strict';

	var last = 0, mapTimer = 0, fpsTimer = 0, frames = 0;

	function frame(now) {
		requestAnimationFrame(frame);
		var dt = last ? (now - last) / 1000 : 0.016;
		last = now;
		if (dt > 0.1) dt = 0.1;                 // a tab that was in the background

		P.UI.driveInput(dt);
		if (!P.params.sim.paused) P.World.step(dt);
		P.Render.update(P.params.sim.paused ? 0 : dt);
		P.UI.update(dt);

		mapTimer -= dt;
		if (mapTimer <= 0) { mapTimer = 0.05; P.Minimap.draw(); }

		frames++;
		fpsTimer += dt;
		if (fpsTimer >= 0.5) {
			var fps = document.getElementById('fps');
			if (fps) fps.textContent = Math.round(frames / fpsTimer) + ' fps';
			frames = 0; fpsTimer = 0;
		}
	}

	P.boot = function () {
		var stage = document.getElementById('stage');
		try {
			P.World.reset();
			P.Render.init(stage);
			P.Minimap.init(document.getElementById('card'));
			P.UI.init();
		} catch (err) {
			var msg = document.getElementById('fatal');
			msg.style.display = 'block';
			msg.textContent = 'Could not start: ' + (err && err.message ? err.message : err);
			throw err;
		}
		requestAnimationFrame(frame);
	};
})(window.PLANET);
