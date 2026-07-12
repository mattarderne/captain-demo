/**
 * @author jbouny / https://github.com/fft-ocean
 */

var DEMO =
{
	ms_Renderer : null,
	ms_Camera : null,
	ms_Scene : null,
	ms_Controls : null,
	ms_Ocean : null,
	// PATCH (voice-boat polish round): default preset changed from the shell's original "night"
	// to "day" per live-testing feedback — this is only the *default*; LoadSkyBox() below still
	// overrides it from a URL hash (e.g. "#night") when one is present, and the #env-selector
	// menu (InitGui()) keeps working exactly as before, including highlighting whichever preset
	// is actually active on load.
	ms_Environment : "day",
	ms_Raining : false,

	ms_Commands : {
		states : {
			up : false,
			right : false,
			down : false,
			left : false
		},
		movements : {
			speed : 0.0,
			angle : 0.0
		}
	},

	Initialize : function () {

		this.ms_Renderer = new THREE.WebGLRenderer();
		this.ms_Renderer.context.getExtension( 'OES_texture_float' );
		this.ms_Renderer.context.getExtension( 'OES_texture_float_linear' );
		this.ms_Renderer.setClearColor( 0x000000 );

		document.body.appendChild( this.ms_Renderer.domElement );

		this.ms_Scene = new THREE.Scene();

		this.ms_GroupShip = new THREE.Object3D();
		this.ms_BlackPearlShip = new THREE.Object3D();
		this.ms_Scene.add( this.ms_GroupShip );
		this.ms_GroupShip.add( this.ms_BlackPearlShip );

		this.ms_Camera = new THREE.PerspectiveCamera( 55.0, WINDOW.ms_Width / WINDOW.ms_Height, 0.5, 1000000 );
		this.ms_Camera.position.set( 0, 350, 800 );
		this.ms_Camera.lookAt( new THREE.Vector3() );
		this.ms_BlackPearlShip.add( this.ms_Camera );

		// Initialize Orbit control
		this.ms_Controls = new THREE.OrbitControls( this.ms_Camera, this.ms_Renderer.domElement );
		this.ms_Controls.userPan = false;
		this.ms_Controls.target.set( 0, 100.0, 0 );
		this.ms_Controls.noKeys = true;
		this.ms_Controls.userPanSpeed = 0;
		this.ms_Controls.minDistance = 0;
		this.ms_Controls.maxDistance = 20000.0;
		this.ms_Controls.minPolarAngle = 0;
		this.ms_Controls.maxPolarAngle = Math.PI * 0.75;

		this.InitializeSound();
		this.InitializeLoader();
		this.InitializeScene();

		this.InitGui();
		this.InitCommands();

	},
	
	InitializeSound : function InitializeSound() {
		
		var initSound = function initSound( url ) {
		
			if ( window.HTMLAudioElement ) {
			
				var sound = new Audio('');

				if ( sound.canPlayType( 'audio/mp3' ) ) {
				
					var sound = new Audio( url );
					
					sound.addEventListener( 'ended', function() {
						this.currentTime = 0;
						this.play();
					}, false );
					
					return sound;
					
				}
				
			}
			
		};
		
		this.ms_soundWaves = initSound( 'sound/waves.mp3' );
		this.ms_soundRain = initSound( 'sound/rain.mp3' );
		
		this.ms_soundWaves.play();
		
	},
	
	InitializeLoader : function InitializeLoader() {
	
		this.ms_Loader = new THREE.LoadingManager();
		
		var log = function( message, type, timeout ) {
			console.log( message );
			messg( message, type, timeout );
		}
		
		var delay = 1500;
		this.ms_Loader.onProgress = function( item, loaded, total ) {
			log( 'Loaded ' + loaded + '/' + total + ':' + item, 'info', delay );
		};
		this.ms_Loader.onLoad = function () {
			log( 'Loaded.', 'success', delay );
		};
		this.ms_Loader.onError = function () {
			log( 'Loading error.', 'error', delay );
		};
		
		
		this.ms_ImageLoader = new THREE.ImageLoader( this.ms_Loader );
	
	},

	InitializeScene : function InitializeScene() {

		// Add light
		this.ms_MainDirectionalLight = new THREE.DirectionalLight( 0xffffff, 1.5 );
		this.ms_MainDirectionalLight.position.set( -0.2, 0.5, 1 );
		this.ms_Scene.add( this.ms_MainDirectionalLight );

		// Add Black Pearl
		var loader = new THREE.OBJMTLLoader( this.ms_Loader );
		this.ms_BlackPearl = null;
		loader.load( 'models/BlackPearl/BlackPearl.obj', 'models/BlackPearl/BlackPearl.mtl', function ( object ) {
			object.position.y = 20.0;
			if( object.children ) {
				for( child in object.children ) {
					object.children[child].material.side = THREE.DoubleSide;
				}
			}

			// PATCH (voice-boat sails round): BlackPearl.obj has no named o/g sub-objects (a single
			// flat vertex/face stream — see port/captain-ocean/checkpoints/sails-round.md), so there
			// is no separate "sails" node to rig-brace directly. It DOES split into one child mesh
			// per `usemtl` material via OBJMTLLoader (the loop just above already relies on that:
			// object.children is that per-material mesh array), and material_8 — mapped to
			// sails1.jpg in BlackPearl.mtl — is exactly and only the sail canvas geometry (verified
			// against the .obj's usemtl block boundaries; see sails-round.md). Pull that one mesh out
			// into its own pivot node, recentred on the sail mesh's own bounding-box centre (not the
			// model's local origin, which sits well forward of the sail plan's ~400-unit fore/aft
			// span and would turn any rotation into an unrealistic scissor sweep). captain-ocean's
			// driver (driver.ts) rotates this pivot around Y in response to trim; everything else
			// about `object` (hull, masts, flags, the existing DoubleSide loop above) is untouched.
			var sailMesh = null;
			for ( var childIndex = 0; childIndex < object.children.length; childIndex++ ) {
				var candidate = object.children[ childIndex ];
				if ( candidate.material && candidate.material.name === 'material_8' ) {
					sailMesh = candidate;
					break;
				}
			}
			if ( sailMesh !== null ) {
				sailMesh.geometry.computeBoundingBox();
				var sailCenter = sailMesh.geometry.boundingBox.center();

				// PATCH (voice-boat wind-visibility round): masthead streamer (feedback item 2) —
				// a small pennant that reads apparent-wind shifts at a glance. Scene-graph
				// addition only, no vertex surgery: BlackPearl.obj has no named mast sub-object to
				// pivot from (see sails-round.md), so this reuses the sail mesh's own bounding box
				// — already computed just above for sailsPivot — as an estimate of the masthead:
				// centred over the sail plan's own x/z centre, positioned a bit above the sail
				// plan's own highest point (boundingBox.max.y). Built BEFORE sailMesh is removed
				// from `object` below, but that removal doesn't affect the bounding box (geometry-
				// local, unrelated to scene-graph membership) or sailCenter (already captured).
				var streamerLength = 46;
				var streamerWidth = 10;
				var streamerGeometry = new THREE.Geometry();
				streamerGeometry.vertices.push(
					new THREE.Vector3( 0, streamerWidth * 0.5, 0 ),
					new THREE.Vector3( 0, -streamerWidth * 0.5, 0 ),
					new THREE.Vector3( 0, 0, -streamerLength )
				);
				streamerGeometry.faces.push( new THREE.Face3( 0, 1, 2 ) );
				streamerGeometry.computeFaceNormals();
				var streamerMaterial = new THREE.MeshBasicMaterial( {
					color: 0xfff2d6,
					transparent: true,
					opacity: 0.85,
					side: THREE.DoubleSide,
					depthWrite: false
				} );
				var streamerMesh = new THREE.Mesh( streamerGeometry, streamerMaterial );
				var streamerPivot = new THREE.Object3D();
				streamerPivot.position.set(
					sailCenter.x,
					sailMesh.geometry.boundingBox.max.y + 26,
					sailCenter.z
				);
				streamerPivot.add( streamerMesh );
				object.add( streamerPivot );
				// captain-ocean/src/driver.ts rotates this pivot each frame to point along the
				// APPARENT wind's streaming direction, with a slight deterministic flutter — same
				// lazy-getter-via-window.DEMO pattern as ms_Sails above (this loader callback is
				// async, so app.ts/driver.ts can't just close over a local variable here).
				DEMO.ms_Streamer = streamerPivot;

				var sailsPivot = new THREE.Object3D();
				sailsPivot.position.copy( sailCenter );
				object.remove( sailMesh );
				sailMesh.position.copy( sailCenter ).multiplyScalar( -1 );
				sailsPivot.add( sailMesh );
				object.add( sailsPivot );
				DEMO.ms_Sails = sailsPivot;
			}

			DEMO.ms_BlackPearlShip.add( object );
			DEMO.ms_BlackPearl = object;
		} );

		// Add rain
		{
			var size = 128;
			var rainTexture = new THREE.Texture();
			rainTexture.generateMipmaps = false;
			rainTexture.magFilter = THREE.LinearFilter;
			rainTexture.minFilter = THREE.LinearFilter;
			this.ms_ImageLoader.load( 'img/water-drop.png', function ( image ) {
					rainTexture.image = image;
					rainTexture.needsUpdate = true;
			} );

			var rainShader = THREE.ShaderLib['rain'];

			var rainMaterial = new THREE.ShaderMaterial({
				fragmentShader: rainShader.fragmentShader,
				vertexShader: rainShader.vertexShader,
				uniforms: rainShader.uniforms,
				transparent: true,
				depthWrite: false
			});
			rainMaterial.uniforms.texture.value = rainTexture;

			this.ms_RainGeometry = new THREE.Geometry();
			for ( i = 0; i < 100; i++ )
			{
				var vertex = new THREE.Vector3();
				vertex.x = Math.random() * 2.0 * size - size;
				vertex.y = Math.random() * 2.0 * size - size;
				vertex.z = Math.random() * size - size * 0.5;
				this.ms_RainGeometry.vertices.push( vertex );
			}
			this.ms_Rain = new THREE.Points( this.ms_RainGeometry, rainMaterial );
			this.ms_Camera.add( this.ms_Rain );
			this.ms_Rain.position.setZ( - size * 0.75 ) ;
		}

		// Initialize Clouds
		this.ms_CloudShader = new CloudShader( this.ms_Renderer, 512 );
		this.ms_CloudShader.cloudMesh.scale.multiplyScalar( 4.0 );
		this.ms_Scene.add( this.ms_CloudShader.cloudMesh );

		// Initialize Ocean
		var gsize = 512;
		var res = 512;
		var gres = 256;
		var origx = -gsize / 2;
		var origz = -gsize / 2;

		// PATCH (voice-boat polish round): align the FFT ocean's wave-propagation direction with
		// OUR sim's wind at startup. The Ocean's `u_wind` spectrum uniform (INITIAL_WIND below) is
		// a 2-vector that the Phillips-spectrum shader favours generating wave vectors K parallel
		// to (ocean_initial_spectrum's `cosPhi` term in shaders/FFTOceanShader.js) -- i.e. the
		// dominant waves travel in the direction this vector points -- and that vector's two
		// components map directly onto world (x, z) with no flip or swap (confirmed against
		// FFTOceanShader.js's ocean-surface vertex shader, which samples the displacement map at
		// `worldPosition.xz` verbatim, in the same axis order).
		//
		// Our sim's default wind (captain/src/sim/state.ts's DEFAULT_WIND_FROM_DEG = 0) blows FROM
		// 000 true, so waves travel TOWARD 180 (south). Converting that compass bearing into this
		// world frame uses the identical convention captain-ocean/src/driver.ts's headingToYaw()
		// documents (heading 0 -> bow faces -Z), i.e. world (x, z) = (sin(bearingRad), -cos(bearingRad)):
		// at bearing 180 that's world (~0, +1) -- +Z. Static alignment only: our wind is constant
		// for this shell, so this is a one-time init-time constant, not a live readback -- if the
		// sim's default wind direction is ever changed, this needs recomputing by hand with the
		// same formula.
		//
		// PATCH (voice-boat wind-visibility round): this init-time constant is now immediately
		// superseded at boot by captain-ocean/src/app.ts (its "Weather" section), which writes
		// live-computed ms_Ocean.windX/windY from config.environment.windDirectionDeg/windSpeedKts
		// using this exact same formula, right after DEMO.Initialize() finishes. Left in place
		// (rather than deleted) purely so a standalone load of this shell WITHOUT the
		// captain-ocean bundle attached still gets a sane, non-zero wave direction — the same
		// "harmless fallback for a standalone load" role window.__captainAmbientRock's `?? 1` and
		// window.__captainDriverActive's default-off state play elsewhere in this file.
		var WAVE_TRAVEL_BEARING_DEG = 180.0; // (sim wind FROM 000, true) + 180
		var waveTravelRad = WAVE_TRAVEL_BEARING_DEG * Math.PI / 180.0;
		var WAVE_MAGNITUDE = 10.0; // same magnitude as the shell's original INITIAL_WIND components
		var WAVE_WORLD_X = Math.sin( waveTravelRad ) * WAVE_MAGNITUDE;
		var WAVE_WORLD_Z = -Math.cos( waveTravelRad ) * WAVE_MAGNITUDE;

		this.ms_Ocean = new THREE.Ocean( this.ms_Renderer, this.ms_Camera, this.ms_Scene,
		{
			INITIAL_SIZE : 200.0,
			INITIAL_WIND : [ WAVE_WORLD_X, WAVE_WORLD_Z ],
			INITIAL_CHOPPINESS : 3.6,
			CLEAR_COLOR : [ 1.0, 1.0, 1.0, 0.0 ],
			SUN_DIRECTION : this.ms_MainDirectionalLight.position.clone(),
			OCEAN_COLOR: new THREE.Vector3( 0.35, 0.4, 0.45 ),
			SKY_COLOR: new THREE.Vector3( 10.0, 13.0, 15.0 ),
			EXPOSURE : 0.15,
			GEOMETRY_RESOLUTION: gres,
			GEOMETRY_SIZE : gsize,
			RESOLUTION : res
		} );

		this.LoadSkyBox();
		this.LoadMountains();
		// PATCH (voice-boat wind-visibility round): the wind-streak particle pool (feedback item
		// 1) — see InitializeWindStreaks below. captain-ocean/src/driver.ts owns the pool's
		// per-frame motion/recycling; this only builds the meshes and scatters their initial
		// positions.
		this.InitializeWindStreaks();
	},

	// PATCH (voice-boat wind-visibility round): a pool of thin, translucent streak meshes that
	// captain-ocean/src/driver.ts drifts downwind each frame (from the same wind state the HUD/
	// sim already use) and recycles once they fall too far from the ship — the primary "where's
	// the wind" cue requested in feedback item 1. World-anchored (added directly to ms_Scene, NOT
	// parented under ms_GroupShip), since they represent air movement over a patch of ocean, not
	// anything attached to the ship.
	InitializeWindStreaks : function InitializeWindStreaks() {

		var STREAK_COUNT = 64;
		var STREAK_LENGTH = 70;
		var STREAK_WIDTH = 3;
		// Mirrors captain-ocean/src/driver.ts's WIND_STREAK_SPAWN_RADIUS constant — kept as a
		// separate literal here (this is a classic script, not an ES module, so it can't import
		// that file's constant) but must stay the same order of magnitude so streaks start out
		// already scattered across the disc the driver recycles them within, instead of all
		// crowding near the origin on the very first frame.
		var SPAWN_RADIUS = 900;

		// Soft alpha-gradient texture — transparent at both ends, faint white in the middle — so
		// each streak fades in/out along its own length instead of reading as a hard-edged
		// rectangle. Built procedurally (2D canvas) rather than a shipped image asset.
		var canvas = document.createElement( 'canvas' );
		canvas.width = 64;
		canvas.height = 8;
		var ctx = canvas.getContext( '2d' );
		var gradient = ctx.createLinearGradient( 0, 0, 64, 0 );
		gradient.addColorStop( 0.0, 'rgba(255,255,255,0)' );
		gradient.addColorStop( 0.5, 'rgba(255,255,255,0.9)' );
		gradient.addColorStop( 1.0, 'rgba(255,255,255,0)' );
		ctx.fillStyle = gradient;
		ctx.fillRect( 0, 0, 64, 8 );
		var streakTexture = new THREE.Texture( canvas );
		streakTexture.needsUpdate = true;

		var streakMaterial = new THREE.MeshBasicMaterial( {
			map: streakTexture,
			transparent: true,
			opacity: 0.35,
			depthWrite: false,
			side: THREE.DoubleSide,
			blending: THREE.AdditiveBlending
		} );

		// One merged geometry per streak: two crossed quads sharing the same long axis (one lying
		// flat over the water, one standing up like a thin fin), so a streak reads from both the
		// steep top-down follow-cam angle AND the low, grazing helm-view angle without needing
		// per-frame billboarding toward the camera.
		var buildStreakGeometry = function buildStreakGeometry() {
			var geometry = new THREE.Geometry();
			var hw = STREAK_WIDTH * 0.5;
			var hl = STREAK_LENGTH * 0.5;

			// Flat plane, in the XZ plane, elongated along local Z (matching driver.ts's forward
			// convention, where local -Z is "forward").
			geometry.vertices.push(
				new THREE.Vector3( -hw, 0, -hl ), new THREE.Vector3( hw, 0, -hl ),
				new THREE.Vector3( hw, 0, hl ), new THREE.Vector3( -hw, 0, hl )
			);
			// Upright plane, in the YZ plane, same long axis, standing vertical.
			geometry.vertices.push(
				new THREE.Vector3( 0, -hw, -hl ), new THREE.Vector3( 0, hw, -hl ),
				new THREE.Vector3( 0, hw, hl ), new THREE.Vector3( 0, -hw, hl )
			);

			var uv0 = new THREE.Vector2( 0, 0 ); // width-, length-
			var uv1 = new THREE.Vector2( 0, 1 ); // width+, length-
			var uv2 = new THREE.Vector2( 1, 1 ); // width+, length+
			var uv3 = new THREE.Vector2( 1, 0 ); // width-, length+

			var addQuadFaces = function addQuadFaces( a, b, c, d ) {
				geometry.faces.push( new THREE.Face3( a, b, c ), new THREE.Face3( a, c, d ) );
				geometry.faceVertexUvs[0].push( [ uv0, uv1, uv2 ], [ uv0, uv2, uv3 ] );
			};
			addQuadFaces( 0, 1, 2, 3 );
			addQuadFaces( 4, 5, 6, 7 );
			geometry.computeFaceNormals();
			return geometry;
		};

		var streakGeometry = buildStreakGeometry();

		this.ms_WindStreaks = [];
		for ( var i = 0; i < STREAK_COUNT; i++ ) {
			var streak = new THREE.Mesh( streakGeometry, streakMaterial );
			var angle = Math.random() * Math.PI * 2;
			var radius = Math.random() * SPAWN_RADIUS;
			streak.position.set(
				Math.cos( angle ) * radius,
				18 + Math.random() * 77,
				Math.sin( angle ) * radius
			);
			this.ms_Scene.add( streak );
			this.ms_WindStreaks.push( streak );
		}

	},

	InitGui : function InitGui() {

		// Initialize UI
		var gui = new dat.GUI();
		dat.GUI.toggleHide();

		gui.add( this.ms_Ocean, "size", 10, 2000 ).onChange( function( v ) {
			this.object.size = v;
			this.object.changed = true;
		} );
		gui.add( this.ms_Ocean.materialSpectrum.uniforms.u_choppiness, "value", 0.1, 8 ).name( "choppiness" );
		gui.add( this.ms_Ocean, "windX", -50, 50 ).onChange( function ( v ) {
			this.object.windX = v;
			this.object.changed = true;
		} );
		gui.add( this.ms_Ocean, "windY", -50, 50 ).onChange( function ( v ) {
			this.object.windY = v;
			this.object.changed = true;
		} );
		gui.add( this.ms_Ocean, "exposure", 0.0, 0.5 ).onChange( function ( v ) {
			this.object.exposure = v;
			this.object.changed = true;
		} );
		gui.add( DEMO.ms_Ocean.materialOcean, "wireframe" );

		var demo = this;

		// PATCH (voice-boat spike): original code used jQuery, which this repo
		// checkout does not vendor (js/libs/jquery-2.1.4.min.js is missing/404,
		// and its absence was silently aborting DEMO.Initialize() before
		// InitCommands()/Resize() ran). Rewritten in vanilla DOM so the demo
		// runs with zero external fetches.
		var envItems = document.querySelectorAll( '#env-selector > ul > li' );
		envItems.forEach( function( li ) {
			var key = li.getAttribute( 'key' );
			if ( key === demo.ms_Environment ) {
				li.classList.add( 'selected' );
			}
			li.innerHTML = '<a href="#' + key + '">' + li.innerHTML + '</a>';
			li.addEventListener( 'click', function() {
				demo.UpdateEnvironment( key );
				envItems.forEach( function( other ) { other.classList.remove( 'selected' ); } );
				li.classList.add( 'selected' );
			} );
		} );

	},

	InitCommands : function InitCommands() {

		var LEFT = 37,
			UP = 38,
			RIGHT = 39,
			DOWN = 40;

		var keyHandler = function keyHandler( action ) {
			return function( event ) {
				var key = event.which;
				if( key >= LEFT && key <= DOWN ) {
					switch( key ) {
						case UP : DEMO.ms_Commands.states.up = action ; break ;
						case RIGHT : DEMO.ms_Commands.states.right = action ; break ;
						case DOWN : DEMO.ms_Commands.states.down = action ; break ;
						case LEFT : DEMO.ms_Commands.states.left = action ; break ;
					}
				}
			}
		}

		// PATCH (voice-boat spike): vanilla DOM instead of jQuery (see InitGui note above).
		document.addEventListener( 'keydown', keyHandler( true ) );
		document.addEventListener( 'keyup', keyHandler( false ) );

	},

	LoadMountains : function LoadSkyBox() {

		var demo = this;

		var mountainTexture = new THREE.Texture();
		mountainTexture.generateMipmaps = false;
		mountainTexture.magFilter = THREE.LinearFilter;
		mountainTexture.minFilter = THREE.LinearFilter;
		this.ms_ImageLoader.load( 'img/mountains.png', function ( image ) {
				mountainTexture.image = image;
				mountainTexture.needsUpdate = true;
		} );


		var mountainsMaterial = new THREE.MeshBasicMaterial( {
			map: mountainTexture,
			transparent: true,
			side: THREE.BackSide,
			depthWrite: false
		} );

		var addMountain = function addMountain( size ) {

			var moutains = new THREE.Mesh(
				new THREE.CylinderGeometry( size, size, 35000, 32, 1, true ),
				mountainsMaterial
			);
			moutains.position.y = 10000;
			demo.ms_Scene.add( moutains );

		} ;

		// Add twice with different size in order to avoid some artifacts on the reflection
		addMountain( 120000 );
		addMountain( 150000 );

		// Add a black cylinder to hide the skybox under the water
		var cylinder = new THREE.Mesh(
			new THREE.CylinderGeometry( 150000, 150000, 150000, 32, 1, true ),
			new THREE.MeshBasicMaterial( { color: new THREE.Color( 1, 1, 1 ), side: THREE.BackSide } )
		);
		cylinder.position.y = -80000;
		demo.ms_Scene.add( cylinder );

	},

	LoadSkyBox : function LoadSkyBox() {

		var cubeShader = THREE.ShaderLib['cube'];

		var skyBoxMaterial = new THREE.ShaderMaterial( {
			fragmentShader: cubeShader.fragmentShader,
			vertexShader: cubeShader.vertexShader,
			uniforms: cubeShader.uniforms,
			side: THREE.BackSide
		} );

		this.ms_SkyBox = new THREE.Mesh(
			new THREE.BoxGeometry( 450000, 450000, 450000 ),
			skyBoxMaterial
		);

		this.ms_Scene.add( this.ms_SkyBox );

		// https://stackoverflow.com/questions/3552944/how-to-get-the-anchor-from-the-url-using-jquery
		var url = window.location.href, idx = url.indexOf("#");
		var anchor = idx != -1 ? url.substring(idx+1) : null;
		var environmentParameter = anchor;

		if( environmentParameter !== null ) {
			this.ms_Environment = environmentParameter;
		}

		this.UpdateEnvironment( this.ms_Environment );

	},

	UpdateEnvironment : function UpdateEnvironment( key ) {

		var textureName = '';
		var textureExt = ".jpg";
		var directionalLightPosition = null;
		var directionalLightColor = null;
		var raining = false;
		// PATCH (voice-boat wind-visibility round): per-preset light intensity — previously a
		// single value (1.5) set once in InitializeScene and never varied by preset. Defaults to
		// that same 1.5 for every preset except "day" below, so this is a purely additive change
		// for everything but the one preset feedback called out as harsh.
		var directionalLightIntensity = 1.5;

		switch( key ) {
			case 'night':
				textureName = 'grimmnight';
				directionalLightPosition = new THREE.Vector3( -0.3, 0.3, 1 );
				directionalLightColor = new THREE.Color( 1, 1, 1 );
				raining = true;
				break;
			case 'morning':
				textureName = 'clouds';
				directionalLightPosition = new THREE.Vector3( -1, 0.5, 0.8 );
				directionalLightColor = new THREE.Color( 1, 0.95, 0.8 );
				break;
			case 'day':
				// PATCH (voice-boat wind-visibility round): softened per live-testing feedback
				// ("hard on the eyes") — more overhead (higher Y component -> less grazing-angle
				// glare/hotspot on the water's specular highlight), a touch dimmer, and a slightly
				// cooler/less saturated tint so the hull and sails read with more contrast against
				// the water instead of blowing out. Every other preset above/below is untouched.
				textureName = 'sky';
				directionalLightPosition = new THREE.Vector3( -0.35, 0.85, -0.4 );
				directionalLightColor = new THREE.Color( 0.94, 0.92, 0.9 );
				directionalLightIntensity = 1.05;
				break;
			case 'cloudy':
				textureName = 'miramar';
				directionalLightPosition = new THREE.Vector3( 0.3, 1.0, 0.5 );
				directionalLightColor = new THREE.Color( 0.9, 0.95, 1 );
				raining = true;
				break;
			case 'sunset':
				textureName = 'sunset';
				directionalLightPosition = new THREE.Vector3( -0.7, 0.2, -1 );
				directionalLightColor = new THREE.Color( 1, 0.8, 0.5 );
				break;
			case 'interstellar':
				textureName = 'interstellar';
				directionalLightPosition = new THREE.Vector3( -0.7, 1.0, -0.4 );
				directionalLightColor = new THREE.Color( 0.8, 1.0, 0.95 );
				break;
			case 'apocalypse':
				textureName = 'violent_days';
				directionalLightPosition = new THREE.Vector3( 1, 0.3, 1 );
				directionalLightColor = new THREE.Color( 1, 0.85, 0.3 );
				break;
			default:
				return;
		};

		this.ms_Environment = key;
		this.ms_Raining = raining;
		this.ms_MainDirectionalLight.position.copy( directionalLightPosition );
		this.ms_MainDirectionalLight.color.copy( directionalLightColor );
		// PATCH (voice-boat wind-visibility round): see directionalLightIntensity declaration above.
		this.ms_MainDirectionalLight.intensity = directionalLightIntensity;
		this.ms_Ocean.materialOcean.uniforms.u_sunDirection.value.copy( this.ms_MainDirectionalLight.position );
		if ( raining ) {
			this.ms_soundRain.play();
		}
		else {
			this.ms_soundRain.pause();
		}
		
		var sources = [
			'img/' + textureName + '_west' + textureExt,
			'img/' + textureName + '_east' + textureExt,
			'img/' + textureName + '_up' + textureExt,
			'img/' + textureName + '_down' + textureExt,
			'img/' + textureName + '_south' + textureExt,
			'img/' + textureName + '_north' + textureExt
		];
		var images = [];

		var cubeMap = new THREE.CubeTexture( images );
		cubeMap.flipY = false;

		var imageLoader = this.ms_ImageLoader;
		var loaded = 0;
		var loadTexture = function ( i ) {
			imageLoader.load( sources[ i ], function ( image ) {
				cubeMap.images[ i ] = image;
				loaded ++;
				if ( loaded === 6 ) {
					cubeMap.needsUpdate = true;
				}
			} );

		}

		for ( var i = 0, il = sources.length; i < il; ++ i ) {
			loadTexture( i );
		}
		
		cubeMap.format = THREE.RGBFormat;
		cubeMap.generateMipmaps = false;
		cubeMap.magFilter = THREE.LinearFilter;
		cubeMap.minFilter = THREE.LinearFilter;

		this.ms_SkyBox.material.uniforms['tCube'].value = cubeMap;
	},

	Display : function () {

		this.ms_Renderer.render( this.ms_Scene, this.ms_Camera );

	},

	Update : function () {

		// Update camera position
		if( this.ms_Camera.position.y < 0.0 ) {
			this.ms_Camera.position.y = 2.0;
		}

		// PATCH (voice-boat stage 2): update black ship displacements — but only via the original
		// arrow-key arcade path when no captain-ocean driver is attached. window.__captainDriverActive
		// is set synchronously by captain-ocean/src/app.ts before this Update() ever sees it true
		// (see that file's comment on script ordering); when it's true, ms_GroupShip's rotation.y
		// and position, and ms_BlackPearlShip's rotation.z, are instead written once per frame by
		// FftOceanShipDriver (captain-ocean/src/driver.ts) from OUR sim's ShipStateSnapshot, on our
		// own separate rAF loop. This is the exact bypass point identified in
		// port/SPIKE-REPORT.md §3b. Everything below this block (ocean render, camera/OrbitControls,
		// clouds, rain, skybox, the ms_BlackPearl ambient sine-wobble) is untouched and keeps
		// running exactly as before regardless of which path drives the ship transform.
		if ( !window.__captainDriverActive ) {
			this.UpdateCommands();
			this.ms_GroupShip.rotation.y += this.ms_Commands.movements.angle;
			this.ms_BlackPearlShip.rotation.z = -this.ms_Commands.movements.angle * 10.0;
			this.ms_BlackPearlShip.rotation.x = this.ms_Commands.movements.speed * 0.1;
			var shipDisplacement = (new THREE.Vector3(0, 0, -1)).applyEuler(this.ms_GroupShip.rotation).multiplyScalar( 10.0 * this.ms_Commands.movements.speed );
			this.ms_GroupShip.position.add( shipDisplacement );
		}

		var currentTime = new Date().getTime();
		this.ms_Ocean.deltaTime = ( currentTime - lastTime ) / 1000 || 0.0;
		lastTime = currentTime;

		// Update black ship movements
		if( this.ms_BlackPearl !== null )
		{
			var animationRatio = 1.0 + this.ms_Commands.movements.speed * 1.0;
			// PATCH (voice-boat wind-visibility round): this stock sine wobble ("ambient rock")
			// reads as a "rocking horse" motion disconnected from any real state — this shell has
			// no wave-height readback to hook real buoyancy into (see SPIKE-REPORT.md §3b/§5), and
			// it visually fights the driver's own state-driven cosmetic heel (a legitimate,
			// wind/trim-responsive roll applied one node up, on ms_BlackPearlShip). Gated behind
			// window.__captainAmbientRock, a 0..1 multiplier set once at boot by captain-ocean's
			// app.ts from config.visuals.ambientRock (default 0 — off). A standalone load of this
			// shell (no captain-ocean bundle attached) never sets that global, so `?? 1` preserves
			// the original always-on wobble for that case.
			var ambientRock = ( typeof window.__captainAmbientRock === 'number' ) ? window.__captainAmbientRock : 1;
			this.ms_BlackPearl.rotation.y = ( Math.cos( currentTime * 0.0008 ) * 0.05 - 0.025 ) * ambientRock;
			this.ms_BlackPearl.rotation.x = ( Math.sin( currentTime * 0.001154 + 0.78 ) * 0.1 + 0.05 ) * ambientRock;
		}

		// Update rain
		if( this.ms_Raining ) {
			var seed = 1;
			var fastRandom = function fastRandom() {
				// https://stackoverflow.com/questions/521295/javascript-random-seeds
				var x = Math.sin( seed++ ) * 10000;
				return x - Math.floor( x );
			}
			for( i in this.ms_RainGeometry.vertices )
			{
				var speed = 4.0;
				this.ms_RainGeometry.vertices[i].y -= fastRandom() * speed + speed;
				if( this.ms_RainGeometry.vertices[i].y < -50 )
					this.ms_RainGeometry.vertices[i].y = 50;
			}
			this.ms_Rain.rotation.set( -this.ms_Camera.rotation.x, -this.ms_Camera.rotation.y, -this.ms_Camera.rotation.z, "ZYX" );
			this.ms_RainGeometry.verticesNeedUpdate = true;
		}

		// Render ocean reflection
		this.ms_Camera.remove( this.ms_Rain );
		this.ms_Ocean.render();
		if( this.ms_Raining )
			this.ms_Camera.add( this.ms_Rain );

		// Updade clouds
		this.ms_CloudShader.update();

		// Update ocean data
		this.ms_Ocean.update();

		// PATCH (voice-boat wind-visibility round): OrbitControls recomputes ms_Camera's full
		// position/rotation from its own internal spherical state every call, unconditionally —
		// so while captain-ocean's helm view is active (it writes ms_Camera's position/rotation/
		// fov directly each frame — see driver.ts's toggleView()/update()), calling this here
		// would silently stomp that write back to the follow-cam framing a moment later. Skipped
		// only in that mode; OrbitControls' own internal state is untouched while skipped, so
		// toggling back to follow resumes exactly where the mouse/orbit state left off.
		if ( window.__captainViewMode !== 'helm' ) {
			this.ms_Controls.update();
		}
		this.Display();

	},

	UpdateCommands : function UpdateCommands() {

		var states = this.ms_Commands.states;

		// Update speed
		var targetSpeed = 0.0;
		if( states.up ) {
			targetSpeed = 1.0;
		}
		else if( states.down ) {
			targetSpeed = -0.5;
		}
		var curSpeed = this.ms_Commands.movements.speed ;
		this.ms_Commands.movements.speed = curSpeed + ( targetSpeed - curSpeed ) * 0.02;

		// Update angle
		var targetAngle = 0.0;
		if( states.left ) {
			targetAngle = Math.PI * 0.005;
		}
		else if( states.right ) {
			targetAngle = -Math.PI * 0.005;
		}
		if( states.down ) {
			targetAngle *= -1.0;
		}
		
		var curAngle = this.ms_Commands.movements.angle ;
		this.ms_Commands.movements.angle = curAngle + ( targetAngle - curAngle ) * 0.02;

	},

	Resize : function ( inWidth, inHeight ) {

		this.ms_Camera.aspect = inWidth / inHeight;
		this.ms_Camera.updateProjectionMatrix();
		this.ms_Renderer.setSize( inWidth, inHeight );
		this.Display();

	}
};
