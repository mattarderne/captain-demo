(function(){"use strict";function Kn(e){if(e.enemyStruck)return"she's struck her colours — battle won";const t=e.guns,n=`${Math.round(t.rangeM)} m`;return t.readyInS>0?`reloading… ${Math.ceil(t.readyInS)} s`:t.inRange?t.inArc?`ready — she bears, ${n}, ~${t.hitChancePct}% to hit`:`ready — she doesn't bear (bring her abeam, ${n})`:`ready — out of range (${n})`}function At(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function Dt(e){return e.toFixed(1)}function V(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=At(t.heading),a=Dt(t.speedKts),o=At(t.windDirection),s=Dt(t.windSpeedKts);let r=`Steering ${i} at ${a} knots, wind ${o} at ${s}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Gn=-35,Un=35,Yn=0,Jn=1,Xn=1;function qn(e){return e==="main"||e==="jib"||e==="all"}function be(e,t){return{ok:!1,message:e,state:t}}function pe(e,t){return{ok:!0,message:e,state:t}}function Qn(e,t){function n(a){const o=a.action;if(o==="helm"){const s=a.degrees;if(typeof s!="number"||!Number.isFinite(s)||s<Gn||s>Un)return Promise.resolve(be(V("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:s}).accepted)return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Xn?Promise.resolve(pe(V("no_steerage_way",l),l)):s>0?Promise.resolve(pe(V("helm_ack_starboard",l),l)):s<0?Promise.resolve(pe(V("helm_ack_port",l),l)):Promise.resolve(pe(V("helm_ack_amidships",l),l))}if(o==="trim_sail"){const s=a.sail,r=a.trim;if(!qn(s))return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<Yn||r>Jn)return Promise.resolve(be(V("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:s,trim:r}).accepted)return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),p=s==="main"?"trim_ack_main":s==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(pe(V(p,d),d))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(pe(V("status",r),r))}if(o==="fire_guns"){const s=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(be(V("no_target",s),s));const l=r.fireGuns();switch(l.kind){case"no_target":return Promise.resolve(be(V("no_target",s),s));case"wasted":return Promise.resolve(pe(V("shot_wasted",s),s));case"reloading":return Promise.resolve(pe(V("guns_reloading",s),s));case"miss":return Promise.resolve(pe(V("player_miss",s),s));case"hit":{const d=l.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(pe(V(d,s,{enemyHullHp:l.enemyHullHp}),s))}default:{const d=l;throw new Error(`unhandled fire outcome: ${String(d)}`)}}}return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const at=1.94384,oe=180/Math.PI,G=Math.PI/180;function Pt(e){return e*at}function st(e){return e/at}function ye(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function U(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function we(e,t,n){return e<t?t:e>n?n:e}const Zn=0,ei=12;function Nt(e={}){return{x:0,y:0,psi:U((e.heading??0)*G),u:st(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*G,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:U((e.windDirection??Zn)*G),windSpeedMs:st(e.windSpeedKts??ei)}}const Fe=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],ti=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],ni=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function ii(e,t,n){return e+(t-e)*n}function It(e,t){const n=we(t,0,180);let i=0;for(;i<Fe.length-1&&Fe[i+1]<=n;)i++;const a=Math.min(i+1,Fe.length-1),o=Fe[i],s=Fe[a],r=s===o?0:(n-o)/(s-o);return ii(e[i],e[a],r)}function ai(e){return{cl:It(ti,e),cd:It(ni,e)}}function si(e){const t=we(Math.abs(e),0,180),{cl:n,cd:i}=ai(t),a=t*G,o=Math.sin(a),s=Math.cos(a),r=n*o-i*s,l=Math.abs(n*s+i*o);return{cDrive:r,cSide:l}}const Ot=.95,oi=.2;function ot(e){const t=we(Math.abs(e),0,180)/180;return we(Ot-(Ot-oi)*t*t,.15,1)}const ri=.65;function li(e,t){const n=(e-ot(t))/ri;return Math.max(0,1-n*n)}const De={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:165,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"marin",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3,defaultMode:"ai"},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6},performance:{oceanQuality:"medium",reflectionInterval:2}},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Pe="captain.config";function Se(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ci(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Lt(e,t,n,i){for(const a of Object.keys(t)){const o=t[a];if(!(a in e)){i.push(`${n}${a} (unknown key)`);continue}const s=e[a];Se(s)&&Se(o)?Lt(s,o,`${n}${a}.`,i):Se(s)||Se(o)||typeof s!=typeof o?i.push(`${n}${a} (expected ${typeof s}, got ${typeof o})`):e[a]=o}}function Ht(e,t){const n={...e};for(const i of Object.keys(t)){const a=t[i],o=n[i];n[i]=Se(o)&&Se(a)?Ht(o,a):a}return n}function Je(){return typeof localStorage<"u"}function di(){if(!Je())return{};const e=localStorage.getItem(Pe);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return Se(t)?t:{}}catch{return{}}}function Xe(){const e=ci(De);if(!Je())return e;const t=localStorage.getItem(Pe);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Pe}"] is not valid JSON — ignoring it, using defaults.`),e}if(!Se(n))return console.warn(`captain.config: stored value in localStorage["${Pe}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Lt(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function zt(e){if(!Je())return;const t=di(),n=Ht(t,e);localStorage.setItem(Pe,JSON.stringify(n))}function Vt(){Je()&&localStorage.removeItem(Pe)}function Te(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let o=e;for(let s=0;s<i.length-1;s++){const r=i[s];if(r===void 0||(o=o?.[r],o==null))return}o!=null&&(o[a]=n)}const ui=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"Legacy STT model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.sttFallbackModel",label:"Legacy STT fallback",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.intentModel",label:"AI Orders intent model",section:"Voice",type:"text",live:!1,note:"Used by the AI Orders input mode. The server may pin its own model on public hosts."},{path:"voice.ttsModel",label:"Legacy TTS model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.ttsVoice",label:"Realtime voice",section:"Voice",type:"select",options:["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],live:!0},{path:"voice.whisperMode",label:"Legacy VAD default",section:"Voice",type:"boolean",live:!1,hidden:!0},{path:"voice.ttsVolume",label:"Realtime voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"input.defaultMode",label:"Boot input mode",section:"Input",type:"select",options:["ai","direct","realtime"],live:!1,note:"Which order-input mode the app starts in. AI falls back to the local parser when no server is available."},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!1,note:"captain-ocean only. Reload required — live changes visibly rescale the whole ocean."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, choppiness/directionality above are overwritten from wind speed every time wind changes; the ocean wave scale slider only re-derives at boot/reload (see its own note)."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"visuals.performance.oceanQuality",label:"Ocean quality (GPU load)",section:"Performance",type:"select",options:["low","medium","high"],live:!1,note:"captain-ocean only. Reload required — FFT/geometry/cloud resolutions are built once at shell init. High = the original full-resolution ocean; medium ≈ a quarter of high's FFT pixel work."},{path:"visuals.performance.reflectionInterval",label:"Reflection every N frames",section:"Performance",type:"number",min:1,max:4,step:1,live:!0,note:"captain-ocean only. The mirror reflection is a full extra scene render — 2 halves its cost (~30Hz at 60fps) with at most a half-frame reflection lag; 1 = original every-frame behaviour."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],hi=De.controls.rudderMaxDeg*G,pi=De.physics;function rt(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t,o=-e.windSpeedMs*Math.sin(e.windFromRad),s=-e.windSpeedMs*Math.cos(e.windFromRad),r=o-i,l=s-a,d=Math.hypot(r,l),p=r*t+l*n,u=r*n-l*t;return{awaDeg:Math.atan2(-u,-p)*oe,awsMs:d}}function Ft(e,t,n,i,a){const o=Math.abs(n),{cDrive:s,cSide:r}=si(o),l=li(t,o),d=.5*a*i*i,p=d*e*s*l,u=d*e*r*l,m=-Math.sign(n||1)*u;return{surge:p,sway:m}}function Wt(e,t,n=pi,i=hi,a=1){const{awaDeg:o,awsMs:s}=rt(e),r=Ft(n.areaMain,e.mainTrim,o,s,n.rhoAir),l=Ft(n.areaJib,e.jibTrim,o,s,n.rhoAir),d=(r.surge+l.surge)*a,p=(r.sway+l.sway)*a,u=e.u,m=e.v,y=e.r,x=u>=0?n.kSurgeLin:n.kSurgeLinAstern,b=-n.kSurgeQuad*u*Math.abs(u)-x*u,R=-n.kSwayQuad*m*Math.abs(m)-n.kSwayLin*m,S=we(e.rudder,-i,i),E=n.cRudder*S*u*Math.abs(u),L=-(n.kYawDamp+n.kYawDampU*Math.abs(u))*y,N=n.cWeather*Math.sin(o*G)*s*Math.min(1,Math.abs(u)),P=E+L+N,F=(d+b)/n.mass+m*y,w=(p+R)/n.mass-u*y,_=P/n.izz;e.u=u+F*t,e.v=m+w*t,e.r=y+_*t;const A=Math.sin(e.psi),h=Math.cos(e.psi),v=e.u*A+e.v*h,f=e.u*h-e.v*A;e.x+=v*t,e.y+=f*t,e.psi=U(e.psi+e.r*t)}function jt(e){return Math.hypot(e.u,e.v)*at}function mi(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t;return U(Math.atan2(i,a))}function gi(e){return jt(e)<.2?0:ye(e.psi-mi(e))*oe}const We=.05,Bt=We*1e3;function lt(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class fi{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=De){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*G,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*G,this.state=Nt({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=we(t.degrees*G,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=we(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Bt;)this.state.rudder=lt(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*We),this.state.mainTrim=lt(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*We),this.state.jibTrim=lt(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*We),Wt(this.state,We,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=Bt}snapshot(){const{awaDeg:t,awsMs:n}=rt(this.state),i=jt(this.state);return{heading:this.state.psi*oe%360,speedKts:i,windDirection:this.state.windFromRad*oe%360,windSpeedKts:Pt(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Pt(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*oe,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:gi(this.state)}}setWind(t,n){this.state.windFromRad=U(t*G),this.state.windSpeedMs=st(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const bi=["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"];function $t(e){return e==="direct"||e==="realtime"||e==="ai"?e:"ai"}function yi(e,t,n){e.innerHTML="",Ai();const i=document.createElement("div");i.id="hud",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel hud-state",i.appendChild(a);const o=document.createElement("div");o.className="hud-panel-title",o.textContent="Ship State",a.appendChild(o);function s(c,g,I=!1){const k=document.createElement("div");k.id=c,k.className="hud-row";const K=document.createElement("span");K.className="hud-row-label",K.textContent=g,k.appendChild(K);const ie=document.createElement("span");ie.className="hud-row-colon",ie.textContent=": ",k.appendChild(ie);const ae=document.createElement("span");ae.className="hud-row-value",ae.textContent="--",k.appendChild(ae);let Z=null;if(I){const he=document.createElement("div");he.className="hud-bar",Z=document.createElement("div"),Z.className="hud-bar-fill",he.appendChild(Z),k.appendChild(he)}return a.appendChild(k),{setValue:he=>{ae.textContent=he},setFill:Z?he=>{Z&&(Z.style.width=`${Math.max(0,Math.min(100,he))}%`)}:void 0}}const r=s("hud-heading","heading"),l=s("hud-speed","speed"),d=s("hud-wind","wind"),p=s("hud-awa","awa"),u=s("hud-main","main",!0),m=s("hud-jib","jib",!0),y=s("hud-rudder","rudder"),x=s("hud-guns","guns"),b=document.getElementById("hud-guns");b.hidden=!0;const R="http://www.w3.org/2000/svg";function S(c,g){const I=document.createElementNS(R,c);for(const[k,K]of Object.entries(g))I.setAttribute(k,K);return I}const E=document.getElementById("hud-wind"),L=document.createElement("div");L.id="hud-windvane",L.className="hud-windvane";const N=S("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});N.appendChild(S("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),N.appendChild(S("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const P=S("g",{class:"hud-windvane-arrow"});P.appendChild(S("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),P.appendChild(S("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),N.appendChild(P),N.appendChild(S("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),L.appendChild(N),E.appendChild(L);const F=document.getElementById("hud-rudder"),w=document.createElement("div");w.className="hud-gauge";const _=document.createElement("div");_.className="hud-gauge-center-tick",w.appendChild(_);const A=document.createElement("div");A.className="hud-gauge-target",w.appendChild(A);const h=document.createElement("div");h.className="hud-gauge-needle",w.appendChild(h),F.appendChild(w);let v=null;function f(c){return(Math.max(-35,Math.min(35,c))+35)/70*100}function T(c){const g=f(c);h.style.left=`${g}%`,h.classList.toggle("port",c<-.5),h.classList.toggle("stbd",c>.5),v!==null&&Math.abs(c-v)>.5?(A.style.left=`${f(v)}%`,A.style.display="block"):A.style.display="none"}const C=document.createElement("div");C.id="hud-irons",C.className="hud-irons-row";const X=document.createElement("span");X.className="hud-visually-hidden",X.textContent="irons: false",C.appendChild(X),a.appendChild(C);const W=document.createElement("div");W.className="hud-panel hud-log",i.appendChild(W);const xe=document.createElement("div");xe.className="hud-log-header",W.appendChild(xe);const ke=document.createElement("div");ke.className="hud-panel-title hud-log-title-text",ke.textContent="Quarterdeck Log",xe.appendChild(ke);const te=document.createElement("button");te.id="command-config-toggle",te.type="button",te.title="Command settings",te.setAttribute("aria-label","Command config"),te.textContent="⚙",te.className="hud-btn hud-command-config-toggle",xe.appendChild(te);const D=document.createElement("div");D.id="hud-log-list",D.className="hud-log-list",W.appendChild(D);const q=6,O=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function ce(){D.innerHTML="";let c=-1;O.forEach((g,I)=>{g.kind==="exchange"&&(c=I)}),O.forEach((g,I)=>{const k=document.createElement("div");if(k.style.opacity=String(.45+.55*((I+1)/O.length)),g.kind==="system"){k.className="hud-log-entry hud-log-system-entry";const he=document.createElement("div");he.className="hud-log-system",he.textContent=`⚠ ${g.transcript}`,k.appendChild(he),D.appendChild(k);return}const K=I===c;k.className="hud-log-entry";const ie=document.createElement("div");ie.className="hud-log-you",K&&(ie.id="hud-transcript"),ie.textContent=`You: ${g.transcript}`,k.appendChild(ie);const ae=document.createElement("div");ae.className="hud-log-order",K&&(ae.id="hud-intent"),ae.textContent=g.order,k.appendChild(ae);const Z=document.createElement("div");Z.className="hud-log-crew",K&&(Z.id="hud-crew"),Z.textContent=`Crew: ${g.crew}`,k.appendChild(Z),D.appendChild(k)}),D.scrollTop=D.scrollHeight}ce();function Et(c){if(c===null)return"→ no order";if(c.action==="helm"){const g=Math.round(c.degrees),I=g<0?"port":g>0?"stbd":"amidships";return`→ helm ${g}° (${I})`}return c.action==="trim_sail"?`→ trim ${c.sail} → ${c.trim.toFixed(2)}`:c.action==="fire_guns"?"→ fire guns":"→ status report"}function kt(c){O.push({kind:"exchange",transcript:c,order:"→ …",crew:"…"}),O.length>q&&O.shift(),ce()}function _t(c){const g=[...O].reverse().find(I=>I.kind==="exchange");g&&(g.order=Et(c)),c!==null&&c.action==="helm"&&(v=c.degrees),ce()}function de(c){const g=[...O].reverse().find(I=>I.kind==="exchange");g&&(g.crew=c),ce()}function Tt(c){O.push({kind:"system",transcript:c,order:"",crew:""}),O.length>q&&O.shift(),ce()}const J=document.createElement("div");J.className="hud-controls",W.insertBefore(J,D);const j=document.createElement("details");j.id="input-mode-details",j.className="hud-input-mode-details",J.appendChild(j);const Oe=document.createElement("summary");Oe.id="input-mode-summary",Oe.className="hud-input-mode-summary",j.appendChild(Oe);const ge=document.createElement("div");ge.id="input-mode",ge.className="hud-input-mode",ge.setAttribute("role","radiogroup"),ge.setAttribute("aria-label","Command input mode"),j.appendChild(ge);function Ce(c,g,I){const k=document.createElement("label");k.className="hud-input-mode-option",k.dataset.mode=c;const K=document.createElement("input");K.type="radio",K.name="input-mode",K.id=`input-mode-${c}`,K.value=c,k.appendChild(K);const ie=document.createElement("span");ie.className="hud-input-mode-copy";const ae=document.createElement("span");ae.className="hud-input-mode-name",ae.textContent=g;const Z=document.createElement("span");return Z.className="hud-input-mode-source",Z.textContent=I,ie.appendChild(ae),ie.appendChild(Z),k.appendChild(ie),ge.appendChild(k),{label:k,radio:K}}const ne=Ce("ai","AI Orders","Type or dictate — GPT works out what you mean"),Le=Ce("realtime","GPT Realtime","Talk over your mic — the crew answers aloud"),He=Ce("direct","Direct Orders","Type or dictate — instant, set phrases, no AI"),H=document.createElement("input");H.id="transcript-input",H.type="text",H.placeholder="Paste or dictate an order",H.className="hud-input",J.appendChild(H);const fe=document.createElement("div");fe.className="hud-button-row",J.appendChild(fe);const B=document.createElement("button");B.id="ptt",B.type="button",B.textContent="Connect Mic",B.className="hud-btn hud-btn-ptt",B.hidden=!0,fe.appendChild(B);const ue=document.createElement("div");ue.id="input-status",ue.className="hud-input-status",ue.setAttribute("role","status"),ue.setAttribute("aria-live","polite"),ue.textContent="Ready locally",fe.appendChild(ue);const Q=document.createElement("button");Q.id="view-toggle",Q.type="button",Q.textContent="Helm View",Q.className="hud-btn hud-btn-view-toggle",fe.appendChild(Q);let z="direct";function $(c,g="neutral"){ue.textContent=c,ue.dataset.tone=g}function Y(){return z!=="realtime"}const Ae={ai:"AI Orders",realtime:"GPT Realtime",direct:"Direct Orders"};function ze(c,g=!0){z=c,He.radio.checked=c==="direct",ne.radio.checked=c==="ai",Le.radio.checked=c==="realtime",Oe.textContent=`Orders: ${Ae[c]}`,H.disabled=c==="realtime",B.hidden=c!=="realtime",c==="realtime"?(tt(),H.placeholder="Voice orders arrive here",$("Mic disconnected")):(H.placeholder="Paste or dictate an order",$(c==="ai"?"Ready — GPT parses orders":"Ready locally"),window.setTimeout(()=>H.focus(),0)),g&&n.setInputMode(c)}function Ue(c){ze(c),j.open=!1}He.radio.addEventListener("change",()=>{He.radio.checked&&Ue("direct")}),ne.radio.addEventListener("change",()=>{ne.radio.checked&&Ue("ai")}),Le.radio.addEventListener("change",()=>{Le.radio.checked&&Ue("realtime")}),B.addEventListener("click",()=>n.toggleRealtime());function _e(){Y()&&H.focus()}const Ve=Xe().input,zn=2;let Ye=null;function tt(){Ye!==null&&(clearTimeout(Ye),Ye=null)}let Rt=!1,nt=null;async function Ct(c){if(!Y())return;if(Rt||(n.isPipelineBusy?.()??!1)){nt=c;return}Rt=!0,tt();const g=performance.now(),I=z==="ai";$(I?"Asking GPT…":"Processing locally");try{await n.injectTranscript(c),H.value="";const k=Math.max(1,Math.round(performance.now()-g));$(I?`Accepted in ${k} ms`:`Accepted locally in ${k} ms`,"ok")}catch(k){const K=k instanceof Error?k.message:String(k);de(K),$("Order not sent","error")}finally{if(Rt=!1,_e(),nt!==null){const k=nt;nt=null,Ct(k)}}}function Vn(c){if(!Ve.autoSubmit)return;const g=c.trim();g.length<zn||Ct(g)}H.addEventListener("input",c=>{if(!Y()||(tt(),!Ve.autoSubmit))return;if(c.inputType==="insertFromPaste"){Vn(H.value);return}H.value.trim().length<zn||(Ye=setTimeout(()=>{Ye=null,Vn(H.value)},Ve.autoSubmitDelayMs))}),H.addEventListener("keydown",c=>{if(!Y()||c.key!=="Enter")return;tt();const g=H.value.trim();g.length!==0&&Ct(g)}),document.addEventListener("click",c=>{const g=c.target;if(g instanceof HTMLCanvasElement){_e();return}g instanceof Element&&g.closest("#env-selector")&&_e()}),document.addEventListener("keydown",c=>{!Y()||ki(c.target)||c.ctrlKey||c.metaKey||c.altKey||!(c.key.length===1)&&c.key!=="Backspace"||H.focus()},{capture:!0}),ze($t(Ve.defaultMode),!1),Ri(i,_e),Ci(W,te,n,_e);function it(c){return c.toFixed(1)}function Fn(c){return c.toFixed(2)}const fs=["N","NE","E","SE","S","SW","W","NW"];function Wn(c){return(c%360+360)%360}function jn(c){const g=Math.round(Wn(c)/45)%8;return fs[g]??"N"}function Bn(c){return String(Math.round(Wn(c))%360).padStart(3,"0")}function bs(c){return`${Bn(c)} ${jn(c)}`}function ys(c,g){return`from ${Bn(c)} @ ${it(g)} kts (${jn(c)})`}function ws(c,g){const I=Math.round(c);if(I===0)return`dead ahead @ ${it(g)} kts`;const k=I<0?"port":"starboard";return`${Math.abs(I)}° to ${k} @ ${it(g)} kts`}function vs(c){const g=Math.round(c),I=g<0?"port":g>0?"stbd":"amidships";return`${g}° ${I}`}function xs(c){r.setValue(bs(c.heading)),l.setValue(`${it(c.speedKts)} kts`),d.setValue(ys(c.windDirection,c.windSpeedKts)),P&&P.setAttribute("transform",`rotate(${c.windDirection-c.heading} 20 20)`),p.setValue(ws(c.apparentWindAngle,c.apparentWindKts)),u.setValue(Fn(c.mainTrim)),u.setFill?.(c.mainTrim*100),m.setValue(Fn(c.jibTrim)),m.setFill?.(c.jibTrim*100),y.setValue(vs(c.rudderAngle)),T(c.rudderAngle);const g=n.getGunsStatus?.()??null;b.hidden=g===null,g!==null&&x.setValue(g),X.textContent=`irons: ${c.inIrons}`,C.classList.toggle("active",c.inIrons)}function $n(){xs(t.getState())}return $n(),je={logTranscript:kt,logIntent:_t,logCrewLine:de,logSystemNote:Tt},Ut={setInputMode:c=>ze(c,!1),setRealtimeState:(c,g)=>{if(B.classList.toggle("listening",c==="listening"),B.classList.toggle("recording",c==="speaking"),B.disabled=c==="connecting",c==="connecting"?B.textContent="Connecting...":c==="listening"||c==="speaking"?B.textContent="Disconnect Mic":c==="error"?B.textContent="Retry Mic":B.textContent="Connect Mic",z!=="realtime")return;$(g??{disconnected:"Mic disconnected",connecting:"Connecting to GPT Realtime",listening:"Listening",speaking:"Crew speaking",error:"Realtime unavailable"}[c],c==="error"?"error":"neutral")},setStatus:$},Yt={focus:_e},{update:$n}}let je=null;function wi(e){je?.logTranscript(e)}function Kt(e){je?.logIntent(e)}function ct(e){je?.logCrewLine(e)}function Gt(e){je?.logSystemNote(e)}function vi(e,t){Kt(e),ct(t)}let Ut=null;function xi(e,t){Ut?.setRealtimeState(e,t)}let Yt=null;function Si(){Yt?.focus()}let Jt=[];function Mi(e){Jt.push(e)}function Ei(e,t){for(const n of Jt)n(e,t)}function ki(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function _i(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function Ti(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let o=e;for(let s=0;s<i.length-1;s++){const r=i[s];if(r===void 0)return;const l=o[r];(typeof l!="object"||l===null)&&(o[r]={}),o=o[r]}o[a]=n}function Xt(e,t){const n={...e};for(const i of Object.keys(t)){const a=e[i],o=t[i];a!==null&&typeof a=="object"&&!Array.isArray(a)&&o!==null&&typeof o=="object"&&!Array.isArray(o)?n[i]=Xt(a,o):n[i]=o}return n}function Ri(e,t){const n=Xe(),i={};let a=!1;const o=new Map,s=document.createElement("button");s.id="settings-toggle",s.type="button",s.title="Settings",s.setAttribute("aria-label","Settings"),s.textContent="⚙",s.className="hud-btn hud-settings-toggle",e.appendChild(s);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);function p(){d.hidden=!a}function u(h,v){if(Ti(i,h.path,v),h.live)Ei(h.path,v);else{const f=o.get(h.path);f&&(f.hidden=!1),a=!0,p()}}function m(h,v){const f=document.createElement("div");f.className="hud-settings-control-row";const T=document.createElement("input");T.type="range",T.min=String(h.min??0),T.max=String(h.max??100),T.step=String(h.step??1),T.value=String(v),T.className="hud-settings-range";const C=document.createElement("input");C.type="number",C.min=T.min,C.max=T.max,C.step=T.step,C.value=String(v),C.className="hud-settings-numeric";const X=h.min??-1/0,W=h.max??1/0;function xe(ke){if(!Number.isFinite(ke))return;const te=Math.min(W,Math.max(X,ke));T.value=String(te),C.value=String(te),u(h,te)}return T.addEventListener("input",()=>xe(Number(T.value))),C.addEventListener("input",()=>xe(Number(C.value))),f.appendChild(T),f.appendChild(C),f}function y(h,v){const f=document.createElement("label");f.className="hud-settings-checkbox-label";const T=document.createElement("input");return T.type="checkbox",T.checked=v,T.addEventListener("change",()=>u(h,T.checked)),f.appendChild(T),f}function x(h,v){const f=document.createElement("select");f.className="hud-settings-select";for(const T of h.options??[]){const C=document.createElement("option");C.value=T,C.textContent=T,T===v&&(C.selected=!0),f.appendChild(C)}return f.addEventListener("change",()=>u(h,f.value)),f}function b(h,v){const f=document.createElement("input");return f.type="color",f.className="hud-settings-color",f.value=v,f.addEventListener("input",()=>u(h,f.value)),f}function R(h,v){const f=document.createElement("input");return f.type="text",f.className="hud-settings-text",f.value=v,f.addEventListener("change",()=>u(h,f.value)),f}function S(h){const v=document.createElement("div");v.className="hud-settings-field",v.dataset.configPath=h.path;const f=document.createElement("div");f.className="hud-settings-label-row";const T=document.createElement("span");if(T.className="hud-settings-label",T.textContent=h.label,f.appendChild(T),!h.live){const W=document.createElement("span");W.className="hud-settings-reload-dot",W.title="Staged — needs Save & Reload",W.hidden=!0,f.appendChild(W),o.set(h.path,W)}v.appendChild(f);const C=_i(n,h.path);let X;switch(h.type){case"number":X=m(h,C);break;case"boolean":X=y(h,C);break;case"select":X=x(h,C);break;case"color":X=b(h,C);break;default:X=R(h,C);break}if(v.appendChild(X),h.note){const W=document.createElement("div");W.className="hud-settings-note",W.textContent=h.note,v.appendChild(W)}return v}const E=new Map;for(const h of ui)h.hidden||(E.has(h.section)||E.set(h.section,[]),E.get(h.section)?.push(h));const L=new Set(["Visuals","Environment","Lighting"]);for(const[h,v]of E){const f=document.createElement("details");f.className="hud-settings-section",f.open=L.has(h);const T=document.createElement("summary");T.textContent=h,f.appendChild(T);for(const C of v)f.appendChild(S(C));r.appendChild(f)}const N=document.createElement("div");N.className="hud-settings-footer";const P=document.createElement("button");P.id="settings-save-reload",P.type="button",P.textContent="Save & Reload",P.className="hud-btn",P.addEventListener("click",()=>{zt(i),location.reload()});const F=document.createElement("button");F.id="settings-copy-json",F.type="button",F.textContent="Copy JSON",F.className="hud-btn",F.addEventListener("click",()=>{(async()=>{const h=Xt(n,i),v=JSON.stringify(h,null,2);console.log(v);try{await navigator.clipboard?.writeText(v)}catch{}})()});const w=document.createElement("button");w.id="settings-reset-all",w.type="button",w.textContent="Reset All",w.className="hud-btn",w.addEventListener("click",()=>{Vt(),location.reload()}),N.appendChild(P),N.appendChild(F),N.appendChild(w),r.appendChild(N);let _=!1;function A(h){_=h,r.classList.toggle("open",h),s.classList.toggle("active",h),h||t()}s.addEventListener("click",()=>A(!_))}function Ci(e,t,n,i){const a=Xe(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function s(S){const E=document.createElement("div");return E.className="hud-command-config-section-title",E.textContent=S,E}o.appendChild(s("Realtime Voice"));const r=document.createElement("div");r.className="hud-command-config-row";const l=document.createElement("label");l.className="hud-toggle-label";const d=document.createElement("input");d.id="tts-enabled",d.type="checkbox",d.checked=!0,d.addEventListener("change",()=>n.setCrewAudioEnabled(d.checked)),l.appendChild(d),l.appendChild(document.createTextNode("Hear crew replies")),r.appendChild(l);const p=document.createElement("select");p.id="tts-voice-select",p.className="hud-settings-select hud-command-config-voice-select";for(const S of bi){const E=document.createElement("option");E.value=S,E.textContent=S,S===a.voice.ttsVoice&&(E.selected=!0),p.appendChild(E)}p.addEventListener("change",()=>n.setTtsVoice(p.value)),r.appendChild(p),o.appendChild(r);const u=document.createElement("div");u.className="hud-command-config-row";const m=document.createElement("span");m.className="hud-command-config-volume-label",m.textContent="Volume",u.appendChild(m);const y=document.createElement("input");y.id="tts-volume",y.type="range",y.min="0",y.max="1",y.step="0.05",y.value=String(a.voice.ttsVolume),y.className="hud-settings-range",y.addEventListener("input",()=>n.setTtsVolume(Number(y.value))),u.appendChild(y),o.appendChild(u),o.appendChild(s("Actions"));const x=document.createElement("button");x.id="demo",x.type="button",x.textContent="Run Demo",x.className="hud-btn hud-btn-demo hud-command-config-demo",o.appendChild(x);let b=!1;function R(S){b=S,o.classList.toggle("open",b),t.classList.toggle("active",b),b||i()}t.addEventListener("click",()=>R(!b)),document.addEventListener("mousedown",S=>{if(!b)return;const E=S.target;o.contains(E)||t.contains(E)||R(!1)}),document.addEventListener("keydown",S=>{S.key==="Escape"&&b&&R(!1)})}function Ai(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
#hud {
  position: fixed;
  inset: 0;
  pointer-events: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: #e8f4ff;
  z-index: 10;
}

.hud-panel {
  position: absolute;
  box-sizing: border-box;
  background: rgba(6, 20, 34, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 6px;
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
  padding: 10px 12px;
  pointer-events: none;
}

.hud-panel-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #7fa8c9;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 5px;
  margin-bottom: 7px;
}

/* -------------------------------------------------- ship-state panel -------------------- */

.hud-state {
  top: 12px;
  left: 12px;
  width: 236px;
  max-width: calc(100vw - 24px);
  font-size: 13px;
}

.hud-row {
  display: flex;
  align-items: baseline;
  line-height: 1.55;
  white-space: nowrap;
  /* The wind row's value text ("from 000 @ 12.0 kts (N)") plus the wind vane widget can run
     wider than the fixed 236px state panel at this font size; wrap the *items* (not the text
     within them, which stays nowrap) onto a second line rather than silently overflowing past
     the panel edge over the 3D scene. Harmless for every shorter row, which never wraps. */
  flex-wrap: wrap;
}

.hud-row-label {
  color: #7fa8c9;
  text-transform: uppercase;
  font-size: 10px;
  letter-spacing: 0.06em;
  width: 52px;
  flex: 0 0 auto;
}

.hud-row-colon {
  display: none;
}

.hud-row-value {
  color: #eaf6ff;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  margin-left: 6px;
}

/* Wind vane: small rotating compass-style arrow nested in the #hud-wind row. "Up" in this
   widget is always the bow (ship-relative), so the fixed triangle glyph at 12 o'clock marks
   the bow and the arrow group rotates around the centre to show where the true wind blows
   from relative to it. */
.hud-windvane {
  flex: 0 0 auto;
  /* Left-aligned under the label (not margin-left: auto) so that when this wraps onto the wind
     row's second line (see .hud-row's flex-wrap above) it sits tidily at the row's left edge
     instead of jumping to the far right of a now-empty line. */
  margin: 2px 0 0 58px;
  display: inline-flex;
  align-items: center;
}
.hud-windvane svg {
  display: block;
  overflow: visible;
}
.hud-windvane-ring {
  fill: rgba(255, 255, 255, 0.05);
  stroke: rgba(255, 255, 255, 0.28);
  stroke-width: 1.5;
}
.hud-windvane-bow {
  fill: #7fa8c9;
}
.hud-windvane-arrow-shaft {
  stroke: #58c4ff;
  stroke-width: 2.4;
  stroke-linecap: round;
}
.hud-windvane-arrow-head {
  fill: #58c4ff;
}
.hud-windvane-hub {
  fill: #eaf6ff;
}

.hud-bar {
  position: relative;
  flex: 1 1 auto;
  height: 8px;
  margin-left: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
}

.hud-bar-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 0%;
  background: linear-gradient(90deg, #2b7fb8, #58c4ff);
  border-radius: 2px;
}

/* Rudder gauge: -35..+35 scale, needle = actual (slewing) angle, dashed marker = last order. */
.hud-gauge {
  position: relative;
  flex: 1 1 auto;
  height: 12px;
  margin: 4px 0 12px 8px;
  background: linear-gradient(
    to right,
    rgba(231, 76, 60, 0.28),
    rgba(255, 255, 255, 0.05) 48%,
    rgba(255, 255, 255, 0.05) 52%,
    rgba(46, 204, 113, 0.28)
  );
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 3px;
}
.hud-gauge::before,
.hud-gauge::after {
  position: absolute;
  top: 15px;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.hud-gauge::before {
  content: "P";
  left: 2px;
  color: #ff8a75;
}
.hud-gauge::after {
  content: "S";
  right: 2px;
  color: #6ee89a;
}
.hud-gauge-center-tick {
  position: absolute;
  left: 50%;
  top: -3px;
  bottom: -3px;
  width: 1px;
  background: rgba(255, 255, 255, 0.45);
}
.hud-gauge-needle {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 4px;
  margin-left: -2px;
  left: 50%;
  background: #eef6ff;
  border-radius: 2px;
  transition: left 0.08s linear;
}
.hud-gauge-needle.port {
  background: #e74c3c;
}
.hud-gauge-needle.stbd {
  background: #2ecc71;
}
.hud-gauge-target {
  position: absolute;
  top: -5px;
  bottom: -5px;
  width: 0;
  margin-left: -1px;
  left: 50%;
  display: none;
  border-left: 2px dashed rgba(255, 214, 121, 0.95);
}

.hud-visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
  padding: 0;
  margin: -1px;
}

.hud-irons-row {
  min-height: 0;
}
.hud-irons-row.active {
  min-height: 22px;
  margin-top: 6px;
}
.hud-irons-row.active::after {
  content: "\\26A0 IN IRONS";
  display: inline-block;
  background: #c0392b;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 8px;
  border-radius: 3px;
  font-size: 11px;
}

/* -------------------------------------------------- quarterdeck log panel --------------- */

.hud-log {
  left: 12px;
  bottom: 12px;
  width: 380px;
  max-width: calc(100vw - 24px);
  font-size: 12.5px;
}

.hud-log-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 5px;
  margin-bottom: 7px;
}
.hud-log-title-text {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
}

/* text2 (text-first round): the quarterdeck log reads as a secondary surface now that the
   transcript input (below, .hud-input/.hud-controls) is the visually dominant control —
   dimmed opacity + slightly smaller text on the scrolling history itself, NOT on the panel's
   header/input/buttons (those stay full opacity; only this list is touched). */
.hud-log-list {
  max-height: 240px;
  overflow-y: auto;
  pointer-events: auto;
  opacity: 0.75;
  font-size: 11.5px;
}

.hud-log-entry {
  padding: 6px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}
.hud-log-entry:last-child {
  border-bottom: none;
  padding-bottom: 2px;
}

.hud-log-you {
  color: #8ecbff;
  font-weight: 600;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.4;
}
.hud-log-order {
  color: #ffd479;
  margin: 3px 0 3px 14px;
  font-size: 11.5px;
  white-space: normal;
  overflow-wrap: anywhere;
}
.hud-log-crew {
  color: #b9f6c4;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.4;
}
.hud-log-system-entry {
  padding: 4px 0;
}
.hud-log-system {
  color: #ffb454;
  font-size: 11px;
  font-style: italic;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.35;
}

/* -------------------------------------------------- controls ---------------------------- */

/* text2 (text-first round): moved to sit directly under the header (was: below the log, with a
   top divider) — the transcript input is now the first thing in the panel, not the last. The
   divider moves to the BOTTOM, separating this prominent block from the de-emphasized notice/log
   beneath it. */
.hud-controls {
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* PATCH (voice-boat battle-feedback round): the mode options live inside a collapsed <details>
   — the summary line names the active mode; opening reveals the three options stacked with
   plain-words descriptions (was a 2-col grid of always-visible tiles). */
.hud-input-mode-details {
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.035);
}
.hud-input-mode-summary {
  cursor: pointer;
  list-style: none;
  padding: 7px 9px;
  font-size: 12px;
  font-weight: 700;
  color: #d7ecfa;
  user-select: none;
}
.hud-input-mode-summary::-webkit-details-marker {
  display: none;
}
.hud-input-mode-summary::after {
  content: " ▾";
  color: #7fa8c9;
}
.hud-input-mode-details[open] .hud-input-mode-summary {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.hud-input-mode-details[open] .hud-input-mode-summary::after {
  content: " ▴";
}
.hud-input-mode {
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 0 0 4px 4px;
}
.hud-input-mode-option {
  position: relative;
  min-width: 0;
  min-height: 44px;
  display: flex;
  align-items: center;
  padding: 7px 9px;
  color: #b7cfe0;
  background: rgba(255, 255, 255, 0.035);
  cursor: pointer;
}
.hud-input-mode-option + .hud-input-mode-option {
  border-top: 1px solid rgba(255, 255, 255, 0.15);
}
.hud-input-mode-option:has(input:checked) {
  color: #f4fbff;
  background: rgba(88, 196, 255, 0.18);
  box-shadow: inset 0 -2px 0 #58c4ff;
}
.hud-input-mode-option input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}
.hud-input-mode-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hud-input-mode-name {
  font-size: 12px;
  font-weight: 700;
  white-space: normal;
  overflow-wrap: anywhere;
}
.hud-input-mode-source {
  color: #7fa8c9;
  font-size: 10px;
  font-weight: 400;
}

/* text2 (text-first round): the visually dominant control of the whole HUD — ~1.5x the old
   font-size, brighter default border (was barely-there rgba(255,255,255,0.18)), a glow on focus
   instead of a flat color swap, so the always-focused cursor (see hud.ts's refocusInput()) reads
   as an obviously "live" surface rather than a quiet form field. */
.hud-input {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 18px;
  color: #eaf6ff;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(88, 196, 255, 0.4);
  border-radius: 6px;
  padding: 11px 13px;
  box-shadow: 0 0 14px rgba(88, 196, 255, 0.12);
}
.hud-input::placeholder {
  color: rgba(232, 244, 255, 0.45);
}
.hud-input:focus {
  outline: none;
  border-color: #58c4ff;
  box-shadow: 0 0 0 3px rgba(88, 196, 255, 0.25), 0 0 20px rgba(88, 196, 255, 0.2);
}
.hud-input:disabled {
  color: rgba(232, 244, 255, 0.55);
  background: rgba(255, 255, 255, 0.035);
  border-color: rgba(255, 255, 255, 0.15);
  box-shadow: none;
  cursor: default;
}

.hud-button-row {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 31px;
}

.hud-input-status {
  min-width: 0;
  flex: 1 1 auto;
  color: #91aabd;
  font-size: 10.5px;
  line-height: 1.25;
  text-align: right;
  overflow-wrap: anywhere;
}
.hud-input-status[data-tone="ok"] {
  color: #9ee8ad;
}
.hud-input-status[data-tone="error"] {
  color: #ffad9f;
}

.hud-btn {
  font-family: inherit;
  font-size: 11.5px;
  font-weight: 600;
  color: #eaf6ff;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  padding: 6px 10px;
  cursor: pointer;
  transition: background 0.1s ease, border-color 0.1s ease;
}
.hud-btn:hover {
  background: rgba(255, 255, 255, 0.15);
}
.hud-btn:disabled {
  opacity: 0.5;
  cursor: default;
}

.hud-btn-ptt.recording {
  background: #c0392b;
  border-color: #ff6b52;
  color: #fff;
  animation: hud-ptt-pulse 1s ease-in-out infinite;
}
@keyframes hud-ptt-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(192, 57, 43, 0.55); }
  50% { box-shadow: 0 0 0 5px rgba(192, 57, 43, 0); }
}

/* Realtime connected/listening indicator. */
.hud-btn-ptt.listening {
  background: rgba(88, 196, 255, 0.18);
  border-color: #58c4ff;
  color: #eaf6ff;
  animation: hud-ptt-listen-pulse 2.2s ease-in-out infinite;
}
@keyframes hud-ptt-listen-pulse {
  0%, 100% { box-shadow: 0 0 0 0 rgba(88, 196, 255, 0.35); }
  50% { box-shadow: 0 0 0 4px rgba(88, 196, 255, 0); }
}

.hud-toggle-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #b7cfe0;
  cursor: pointer;
}

/* -------------------------------------------------- command config popover -------------- */

.hud-command-config-toggle {
  pointer-events: auto;
  font-size: 13px;
  line-height: 1;
  padding: 3px 7px;
  flex: 0 0 auto;
}
.hud-command-config-toggle.active {
  background: rgba(88, 196, 255, 0.25);
  border-color: #58c4ff;
}

.hud-command-config {
  position: absolute;
  bottom: 100%;
  margin-bottom: 6px;
  right: 8px;
  width: 260px;
  display: none;
  pointer-events: auto;
  font-size: 12px;
  z-index: 12;
  max-height: min(60vh, 420px);
  overflow-y: auto;
}
.hud-command-config.open {
  display: block;
}

.hud-command-config-section-title {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #7fa8c9;
  margin: 9px 0 4px;
}
.hud-command-config-section-title:first-child {
  margin-top: 0;
}

.hud-command-config-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 4px;
  flex-wrap: wrap;
}

.hud-command-config-voice-select {
  flex: 1 1 auto;
  min-width: 90px;
}

.hud-command-config-volume-label {
  font-size: 11px;
  color: #b7cfe0;
  flex: 0 0 auto;
}

.hud-command-config-demo {
  width: 100%;
  box-sizing: border-box;
}

.hud-key-masked {
  font-variant-numeric: tabular-nums;
  color: #eaf6ff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 4px;
  padding: 4px 6px;
  margin-bottom: 6px;
  font-size: 11.5px;
}

.hud-segmented {
  display: flex;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 4px;
}
.hud-segmented-option {
  flex: 1 1 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  padding: 6px 6px;
  font-size: 11px;
  cursor: pointer;
  color: #b7cfe0;
  text-align: center;
}
.hud-segmented-option:first-child {
  border-right: 1px solid rgba(255, 255, 255, 0.18);
}
.hud-segmented-option:has(input:checked) {
  background: rgba(88, 196, 255, 0.22);
  color: #eaf6ff;
}
.hud-segmented-option input {
  accent-color: #58c4ff;
}

/* -------------------------------------------------- settings panel ---------------------- */

.hud-settings-toggle {
  position: absolute;
  top: 12px;
  right: 12px;
  pointer-events: auto;
  font-size: 16px;
  line-height: 1;
  padding: 7px 10px;
  z-index: 11;
}
.hud-settings-toggle.active {
  background: rgba(88, 196, 255, 0.25);
  border-color: #58c4ff;
}

.hud-settings-panel {
  top: 52px;
  right: 12px;
  width: 360px;
  max-height: calc(100vh - 72px);
  overflow-y: auto;
  pointer-events: auto;
  font-size: 12.5px;
  display: none;
}
.hud-settings-panel.open {
  display: block;
}

.hud-settings-reload-banner {
  background: rgba(255, 214, 121, 0.16);
  border: 1px solid rgba(255, 214, 121, 0.4);
  color: #ffd479;
  border-radius: 4px;
  padding: 6px 8px;
  margin-bottom: 8px;
  font-size: 11px;
}

.hud-settings-section {
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 0;
}
.hud-settings-section:first-of-type {
  border-top: none;
}
.hud-settings-section > summary {
  cursor: pointer;
  font-size: 10.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7fa8c9;
  padding: 6px 2px;
  list-style: none;
}
.hud-settings-section > summary::-webkit-details-marker {
  display: none;
}
.hud-settings-section > summary::before {
  content: "▸ ";
}
.hud-settings-section[open] > summary::before {
  content: "▾ ";
}

.hud-settings-field {
  padding: 5px 4px 5px 10px;
}

.hud-settings-label-row {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 3px;
}

.hud-settings-label {
  color: #cfe4f5;
  font-size: 11.5px;
}

.hud-settings-reload-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ffd479;
  flex: 0 0 auto;
}

.hud-settings-note {
  color: #7fa8c9;
  font-size: 10px;
  margin-top: 2px;
}

.hud-settings-control-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hud-settings-range {
  flex: 1 1 auto;
  accent-color: #58c4ff;
}

.hud-settings-numeric {
  width: 64px;
  flex: 0 0 auto;
  font-family: inherit;
  font-size: 11.5px;
  color: #eaf6ff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  padding: 3px 5px;
}

.hud-settings-select,
.hud-settings-text {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 11.5px;
  color: #eaf6ff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  padding: 4px 6px;
}

.hud-settings-color {
  width: 48px;
  height: 24px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  background: none;
  cursor: pointer;
}

.hud-settings-checkbox-label {
  display: inline-flex;
  align-items: center;
}

.hud-settings-footer {
  position: sticky;
  bottom: 0;
  background: rgba(6, 20, 34, 0.96);
  padding-top: 8px;
  margin-top: 6px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 600px) {
  #source-attribution {
    display: none;
  }
}
`,document.head.appendChild(e)}const dt=.05,qt=dt*1e3,Di=35,Pi=40,ut=50,Qt=15,Ni=8;function ht(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Ii{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=Nt({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*G,this.rudderRateRadPerS=t.rudderSlewDegPerS*G,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=U(t*G),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",U(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,a=Math.hypot(n,i),o=U(Math.atan2(n,i));a>this.engageRangeM*1.15?this.behavior="APPROACH":a<this.engageRangeM*.85&&(this.behavior="ENGAGE");let s;if(this.behavior==="APPROACH")s=o;else{const d=(a>this.engageRangeM?1:-1)*15*G;s=U(t.headingRad+d)}const r=ye(this.state.windFromRad-s)*oe;if(this.tackSide!==null){this.tackHoldS-=dt;const l=Math.abs(r)>=Pi;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=Ni){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=Qt)}}}else if(Math.abs(r)<Di){const l=U(this.state.windFromRad-ut*G),d=U(this.state.windFromRad+ut*G),p=Math.abs(ye(l-this.state.psi)),u=Math.abs(ye(d-this.state.psi));this.tackSide=p<=u?1:-1,this.tackHoldS=Qt}return this.tackSide!==null?U(this.state.windFromRad-this.tackSide*ut*G):s}step(t,n){const i=this.planHeading(n),a=ye(i-this.state.psi);this.rudderTargetRad=we(this.headingKp*a-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:o}=rt(this.state),s=ot(Math.abs(o));this.mainTrimTarget=s,this.jibTrimTarget=s,this.state.rudder=ht(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=ht(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=ht(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),Wt(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=qt;)this.step(dt,n),this.accMs-=qt}headingDeg(){return this.state.psi*oe%360}}const Zt=30;function en(){return{reloadRemainingS:0}}function pt(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function tn(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function nn(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=Zt,ready:e.reloadRemainingS<=0}}function Oi(e,t,n,i,a,o){tn(e,t);const s=nn(e,n,i,a);return!s.inRange||!s.inArc||!s.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=a.reloadS,{fired:!0,hit:o()<pt(n,a.cannonRangeM)})}function Li(e,t,n,i,a){const o=nn(e,t,n,i);if(!o.ready)return{fired:!1,hit:!1,...o};e.reloadRemainingS=i.reloadS;const s=a();return{fired:!0,hit:o.inRange&&o.inArc&&s<pt(t,i.cannonRangeM),...o}}const an=10,Hi=5,zi=.8,Vi=.5;function sn(){return{hullHp:an}}function on(e){e.hullHp=Math.max(0,e.hullHp-1)}function Fi(e){return e.hullHp<=0?Vi:e.hullHp<=Hi?zi:1}function rn(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Wi=35,ln=45;function ji(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class Bi{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,a){this.cfg=t,this.rng=rn(t.seed),this.playerRng=rn(t.seed+1),this.lastPlayerPose=a;const o=we(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*o);const s=1.2+.6*o,r=this.rng()*2*Math.PI,l=a.x+t.spawnRangeM*Math.sin(r),d=a.y+t.spawnRangeM*Math.cos(r),p=U(r+Math.PI);this.npc=new Ii({x:l,y:d,heading:p*oe,windDirection:a.windDirectionDeg,windSpeedKts:a.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Wi,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:s,phys:n}),this.damage=sn(),this.cannon=en(),this.playerCannon=en(),this.enemyDamage=sn()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,tn(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});let a=n.x-this.npc.x,o=n.y-this.npc.y,s=Math.hypot(a,o);if(s>1e-6&&s<ln){const r=ln/s;this.npc.state.x=n.x-a*r,this.npc.state.y=n.y-o*r,a=n.x-this.npc.state.x,o=n.y-this.npc.state.y,s=Math.hypot(a,o)}if(!this.everSpotted&&s<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=U(Math.atan2(-a,-o)),d=ye(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:d})}if(!this.everClosing&&s<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=U(Math.atan2(a,o)),l=ye(r-this.npc.state.psi)*oe,d=Math.min(Math.abs(l-90),Math.abs(l+90)),p=Oi(this.cannon,t/1e3,s,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);p.fired&&(i.push({key:"enemy_fires"}),p.hit&&(on(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp})))}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(){const t=this.resolveFireGuns();return this.lastPlayerFireOutcome=t,t}resolveFireGuns(){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),o=U(Math.atan2(-n,-i)),s=ye(o-t.headingRad)*oe,r=Math.min(Math.abs(s-90),Math.abs(s+90)),l=Li(this.playerCannon,a,r,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);return l.fired?!l.inRange||!l.inArc?{kind:"wasted"}:l.hit?(on(this.enemyDamage),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=an/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})):{kind:"miss"}:{kind:"reloading"}}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return Fi(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:ji(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck,guns:this.gunsView()}}gunsView(){const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),o=U(Math.atan2(-n,-i)),s=ye(o-t.headingRad)*oe,r=Math.min(Math.abs(s-90),Math.abs(s+90)),l=a<=this.cfg.cannonRangeM,d=r<=Zt;return{readyInS:this.playerCannon.reloadRemainingS,rangeM:a,inRange:l,inArc:d,hitChancePct:l&&d?Math.round(pt(a,this.cfg.cannonRangeM)*100):0}}}const $i="I do not understand that order, sir.",mt="One order at a time, sir.";function re(e,t){return{kind:"error",code:e,message:t}}function Ki(e){return e.toLowerCase().replace(/['\u2018\u2019]/g,"").replace(/[^a-z0-9%]+/g," ").trim().replace(/\s+/g," ")}function Gi(e){return Math.max(0,Math.min(1,e))}const cn={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},Ui={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};function dn(e){const t=e.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/);if(t?.[1]!==void 0)return Number(t[1]);const n=e.split(" ");for(let i=0;i<n.length;i++){const a=n[i],o=cn[a];if(o!==void 0)return o;const s=Ui[a];if(s!==void 0){const r=n[i+1],l=r===void 0?void 0:cn[r];return s+(l!==void 0&&l<10?l:0)}}return null}function Re(e,t){return t.some(n=>n.test(e))}function Yi(e){return Re(e,[/\bstatus(?: report)?\b/,/\breport(?: to me)?\b/,/\bhow (?:are|re) we doing\b/,/\bhow is she doing\b/,/\bwhats (?:our |the )?(?:heading|course|speed|position)\b/,/\bwhats the wind doing\b/,/\b(?:where are we|what is our position)\b/])}function Ji(e){return/\b(?:hold|cease) (?:your )?fire\b/.test(e)||/\b(?:dont|do not) fire\b/.test(e)||/\bbelay\b/.test(e)&&/\bfire\b/.test(e)?{kind:"acknowledgement",message:"Holding fire, sir."}:/^fire(?:\b|$)/.test(e)||/\b(?:open fire|fire away|fire as she bears|give (?:her|them) a broadside|let (?:them|em) have it)\b/.test(e)?{kind:"intent",intent:{action:"fire_guns"}}:null}function Xi(e){const t=/\b(?:main|mainsail|main sheet)\b/.test(e),n=/\b(?:jib|headsail|jib sheet)\b/.test(e);return t&&n?"all":t?"main":n?"jib":/\b(?:both sheets|the sheets|sheets|all sails?|all sail|all canvas|the sails|sails|everything)\b/.test(e)?"all":null}function qi(e,t){return e==="main"?t.mainTrim:e==="jib"?t.jibTrim:(t.mainTrim+t.jibTrim)/2}function Qi(e,t){const n=Xi(e);if(n===null)return null;const i=Re(e,[/\bease(?: away| off)?\b/,/\blet (?:the )?.*\bout\b/,/\blet go\b/,/\bslacken\b/,/\bspill(?: .* )?wind\b/,/\bstart (?:the )?(?:sheet|sheets|main|jib)\b/]),a=Re(e,[/\bhaul(?: in)?\b/,/\bharden(?: up)?\b/,/\btighten(?: up)?\b/,/\bsheet(?:s)? (?:home|in)\b/,/\btrim (?:the )?.*\b(?:in|home)\b/,/\bpull (?:the )?.*\bin\b/,/\bbring (?:the )?.*\bin\b/,/\bmore on\b/,/\btake a pull\b/]),o=/\b(?:trim|set) (?:the )?(?:sails?|canvas|main|mainsail|jib|headsail)\b/.test(e);if(i&&a)return re("ambiguous",mt);if(!i&&!a&&!o)return null;const s=e.match(/\b(\d{1,3})\s*(?:percent|%)\b/),r=/\bpercent\b/.test(e)?dn(e):null,l=s?.[1]===void 0?r:Number(s[1]);if(l!==null&&l>100)return re("out_of_range","Sail trim must be between zero and one hundred percent, sir.");let d;if(l!==null&&/\b(?:to|at|set)\b/.test(e))d=l/100;else if(/\b(?:all the way|right|hard) in\b/.test(e))d=1;else if(/\b(?:all the way out|let go)\b/.test(e))d=0;else if(!i&&!a)d=ot(Math.abs(t.apparentWindAngle));else{const u=l===null?.15:l/100;d=Gi(qi(n,t)+(a?u:-u))}return{kind:"intent",intent:{action:"trim_sail",sail:n,trim:d}}}function un(e,t){const n=dn(e);return n!==null?n>35?re("out_of_range","She will not take more than thirty-five degrees of helm, sir."):n:/\b(?:hard(?: over)?|full)\b/.test(e)?35:/\b(?:little|small|bit|touch|point|easy)\b/.test(e)?t.speedKts>=7?5:10:20}function Zi(e){const t="(?:turn|go|come|steer|point(?: us)?|bring (?:us|her)|give me(?: a)?(?: small)? turn|helm|rudder|hard)",n=/\bdegrees?\b/.test(e),i=n&&/\b(?:left|port|larboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:left|port|larboard)\\b|^(?:left|port|larboard)\\b|\\b(?:helm|hard) a port\\b)`).test(e),a=n&&/\b(?:right|starboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:right|starboard)\\b|^(?:right|starboard)\\b|\\b(?:helm|hard) a starboard\\b)`).test(e);return i&&a?"conflict":i?-1:a?1:null}function ea(e,t){if(Re(e,[/\b(?:centre|center) (?:the )?(?:rudder|helm|home|hem|whole|hull|it)\b/,/\bstraighten(?: up| (?:the )?(?:rudder|helm|home|hem|whole|hull|ship))?\b/,/^(?:steady|midships|amidships)\b/,/\b(?:rudder|helm) amidships\b/,/\bmeet her\b/,/\bease her back to (?:centre|center)\b/]))return{kind:"intent",intent:{action:"helm",degrees:0}};if(Re(e,[/^(?:okay )+(?:enough|stop)\b/,/^whoa(?: whoa)+$/,/^too much$/,/^(?:no )+stop$/,/^(?:thats )?enough$/,/^easy(?: easy)+$/])&&Math.abs(t.rudderAngle)>2)return{kind:"intent",intent:{action:"helm",degrees:0}};if(/\b(?:other|wrong) way\b/.test(e))return Math.abs(t.rudderAngle)<=2?re("ambiguous","The helm is already amidships, sir."):{kind:"intent",intent:{action:"helm",degrees:-Math.sign(t.rudderAngle)*Math.min(20,Math.abs(t.rudderAngle))}};const a=Re(e,[/\bready about\b/,/^(?:come about|tack)\b/,/\b(?:helm|hard) a lee\b/,/\bluff(?: her)?(?: up)?\b/,/\bbring her up\b/,/\bcome up\b/,/\bpoint higher\b/,/\bharden up (?:the )?(?:helm|rudder)\b/]),o=Re(e,[/\bbear away\b/,/\bbear off\b/,/\bfall (?:off|away)\b/,/\brun off\b/,/\bbear up to leeward\b/]);if(a&&o)return re("ambiguous",mt);if(a||o){if(Math.abs(t.apparentWindAngle)<1)return re("ambiguous","The wind is dead ahead; name a side, sir.");const l=un(e,t);if(typeof l!="number")return l;const d=Math.sign(t.apparentWindAngle);return{kind:"intent",intent:{action:"helm",degrees:(a?d:-d)*l}}}const s=Zi(e);if(s==="conflict")return re("ambiguous","Port or starboard, sir, not both.");if(s!==null){const l=un(e,t);return typeof l!="number"?l:{kind:"intent",intent:{action:"helm",degrees:s*l}}}return/\b(?:steer|set|make) (?:a )?(?:course|heading)\b/.test(e)||/\b(?:course|heading) \d{2,3}\b/.test(e)||/^steer \d{2,3}\b/.test(e)||/^steer (?:zero|one|two|three|four|five|six|seven|eight|nine|north|south|east|west)\b/.test(e)?re("unsupported","Course-keeping is not fitted; order port, starboard, or amidships, sir."):null}function ta(e,t){const n=Ki(e);if(n.length===0)return re("empty","No order received, sir.");if(/\b(?:dont|do not|belay|cancel)\b/.test(n))return{kind:"acknowledgement",message:"Belay that, sir."};const i=[Ji(n),Qi(n,t),ea(n,t),Yi(n)?{kind:"intent",intent:{action:"report_status"}}:null].filter(a=>a!==null);return i.length===0?re("unknown",$i):i.length>1?re("ambiguous",mt):i[0]}const hn=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears.",parameters:{type:"object",properties:{}}}}],pn=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

STEERING — the helm tool. Negative = port (turn left); positive = starboard (turn right); 0 = amidships (straight).
- Fixed side words set the SIGN and override the wind. LEFT SIDE → NEGATIVE degrees: "left, port, to port, a-port, come to port, larboard" (so "turn left" and "hard a-port" are both negative). RIGHT SIDE → POSITIVE degrees: "right, starboard, to starboard, a-starboard, come to starboard" (so "turn right" and "hard a-starboard" are both positive). Whenever one of these words appears, use its sign no matter what the wind is doing.
- "straighten up / steady / steady as she goes / steady as you go / midships / amidships / rudder amidships / meet her / centre the rudder / centre (or center) the helm / helm amidships / ease her back to centre" → helm 0. These are helm orders even though "ease ... back to centre" contains the word "ease" — it is not a sail order unless a sail (main/jib/sheet) is named.
- Decide the SIGN first (port = negative, starboard = positive), then the magnitude: a small turn ("a little / a bit / a touch / a point") ≈ 10°, an ordinary turn ≈ 20°, a hard turn ("hard", "hard over", "hard a-port/a-starboard") ≈ 35°. If a number of degrees is named, use it (never beyond 35). "a point" only sets the size — it never changes the direction.
- Wind-relative orders: read apparentWindAngle from the state — a NEGATIVE value means the wind is on the PORT side, POSITIVE means the STARBOARD side. "Come up / luff / luff up / point higher / bring her up / harden up (helm) / helm a-lee / hard a-lee / ready about" mean turn TOWARD the wind: the helm takes the SAME sign as apparentWindAngle. "Bear away / bear off / fall off / fall away / run off / bear up to leeward" mean turn AWAY from the wind: the helm takes the OPPOSITE sign to apparentWindAngle. Use an ordinary turn unless told otherwise. Note: "helm a-lee", "hard a-lee" and "ready about" are the order to TACK — bring the bow UP through the wind (turn TOWARD the wind, same sign as apparentWindAngle); never steer to leeward for these.
- Dictation note: voice-to-text sometimes mishears "helm" as "home", "hem", "whole", or "hull". If the sentence is otherwise steering-shaped — it contains a centering/straightening verb (center, centre, straighten, steady) or is the bare command "center/centre it" — and one of those words sits where "helm" belongs, read it as "helm" and apply the centering rule above (→ helm 0). Do not apply this outside a steering-shaped sentence: "hull" still means the ship's hull with no centering verb present (e.g. "put a ball in her hull" stays a gunnery/damage matter, not a helm order).

SAILS — the trim_sail tool. trim 0 = fully eased/let out, 1 = hauled fully in.
- Choose the sail: "main / mainsail / main sheet" → main; "jib / headsail / jib sheet" → jib; "sails / the sails / all sail / all canvas / everything / trim the sails" → all. "Both sheets" or "the sheets" (plural, no main/jib named) ALWAYS means ALL, no matter the verb — e.g. "sheet in both sheets" and "ease both sheets" both apply to ALL, never just the main sheet.
- "Ease / ease away / ease off / let out / let go / start / slacken / spill wind" LOWER the trim by ~0.15 from the sail's CURRENT value (compute the absolute result from state — e.g. main at 0.5 becomes 0.35). "Haul in / haul / harden / harden up / tighten / sheet in / sheet home / trim in / take a pull / bring her in" RAISE the trim by ~0.15. "a touch / a bit / a little / a hair / slightly / some / more" still means ~0.15. "hard in / right in / all the way in" → toward 1; "let go / all the way out" → toward 0.

REPORTS — the report_status tool. ANY question or request about heading, course, speed, wind, position, or how she is doing ("report", "status", "how are we doing", "what's our heading", "what's the wind doing") MUST be answered by CALLING report_status. Never answer these in text yourself; always make the tool call.

CHATTER — only when the captain says something that is genuinely NOT an order and NOT a question about the ship (small talk, jokes, musings, personal requests) do you make NO tool call; reply in character in one short period sentence.

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function mn(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,a=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof a!="number"||!Number.isFinite(a)||a<0||a>1?null:{action:"trim_sail",sail:i,trim:a}}case"report_status":return{action:"report_status"};case"fire_guns":return{action:"fire_guns"};default:return null}}const gn={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function na(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function fn(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const ia=1500;async function aa(e){try{return await e()}catch(t){if(!fn(t))throw t;return await new Promise(n=>setTimeout(n,ia)),e()}}function sa(e,t,n){const i=na(t);if(i)return gn[i];const a=n.trim(),s=a.startsWith("<")||/<\/?[a-z][\s\S]*>/i.test(a.slice(0,200))?"":a.slice(0,140);return s.length>0?`${e} (${t}): ${s}`:`${e} (${t})`}const oa="https://api.openai.com/v1/chat/completions";function ra(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const a=i,o=typeof a.content=="string"?a.content:null,s=[],r=a.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const d=l.function;if(typeof d!="object"||d===null)continue;const p=d,u=p.name,m=p.arguments;typeof u!="string"||typeof m!="string"||s.push({name:u,argumentsJson:m})}return{content:o,toolCalls:s}}function la(e){try{return JSON.parse(e)}catch{return null}}async function ca(e,t,n,i=De.voice.intentModel,a=oa){const o=`${pn}

Current ship state:
${JSON.stringify(t)}`,s={"Content-Type":"application/json"};n.length>0&&(s.Authorization=`Bearer ${n}`);let r;try{r=await aa(()=>fetch(a,{method:"POST",headers:s,body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:hn,messages:[{role:"system",content:o},{role:"user",content:e}]})}))}catch(y){throw fn(y)?new Error(gn.network):y}if(!r.ok){const y=await r.text();throw new Error(sa("intent request failed",r.status,y))}const l=await r.json(),d=ra(l);if(d===null)throw new Error("intent request returned an unrecognizable response body");const p=d.toolCalls[0];if(p===void 0)return{crewLine:d.content??"",intent:null};const u=la(p.argumentsJson),m=mn(p.name,u);return m===null?{crewLine:V("unknown_order",t),intent:null}:{crewLine:"",intent:m}}const da=new Set(["alloy","ash","ballad","coral","echo","sage","shimmer","verse","marin","cedar"]);function gt(e){return da.has(e)?e:"marin"}function ua(){return hn.map(({function:e})=>({type:"function",name:e.name,description:e.description,parameters:e.parameters}))}function ha(e){if(typeof e!="object"||e===null)return[];const t=e.output;if(!Array.isArray(t))return[];const n=[];for(const i of t){if(typeof i!="object"||i===null)continue;const a=i;a.type==="function_call"&&(typeof a.name!="string"||typeof a.call_id!="string"||typeof a.arguments!="string"||n.push({name:a.name,callId:a.call_id,argumentsJson:a.arguments}))}return n}function pa(e){if(typeof e!="object"||e===null)return null;const t=e.output;if(!Array.isArray(t))return null;for(const n of t){if(typeof n!="object"||n===null)continue;const i=n.content;if(Array.isArray(i))for(const a of i){if(typeof a!="object"||a===null)continue;const o=a,s=typeof o.transcript=="string"?o.transcript.trim():"";if(s)return s;const r=typeof o.text=="string"?o.text.trim():"";if(r)return r}}return null}function bn(e){return pn+`

REALTIME RULES:
- Wait for a tool result before acknowledging an order.
- When a tool result arrives, speak its message exactly once and do not reinterpret it.
- Never claim the ship changed unless the tool result says the order was accepted.
- If speech is unclear or contains conflicting orders, ask for the order again and call no tool.

Current ship state:
`+JSON.stringify(e)}function ma(e,t){return{type:"session.update",session:{type:"realtime",output_modalities:["audio"],instructions:bn(e),audio:{input:{transcription:{model:"gpt-4o-mini-transcribe"},turn_detection:{type:"semantic_vad",create_response:!0,interrupt_response:!0}},output:{voice:gt(t)}},tools:ua(),tool_choice:"auto"}}}function ga(e){try{return mn(e.name,JSON.parse(e.argumentsJson))}catch{return null}}function fa(e){let t=null,n=null,i=null,a=null,o=!1,s=!1,r=gt(e.voice??"marin"),l=Math.max(0,Math.min(1,e.volume??.55)),d=!0,p=!1,u=!1,m=!1;const y=new Set;let x=Promise.resolve();function b(w){n?.readyState==="open"&&n.send(JSON.stringify(w))}function R(){a!==null&&(a.volume=l,a.muted=!d)}function S(w,_){b({type:"conversation.item.create",item:{type:"function_call_output",call_id:w,output:JSON.stringify(_)}})}async function E(w){if(w.length===0)return;if(u||(e.onTranscript("Voice order"),u=!0),w.length>1){const v="One order at a time, sir.";for(const f of w)S(f.callId,{ok:!1,message:v});e.onResponseLine(v),e.onSystemNote(v),m=!0,b({type:"response.create"});return}const _=w[0],A=ga(_);if(A===null){const v="I do not understand that order, sir.";S(_.callId,{ok:!1,message:v}),e.onResponseLine(v),e.onSystemNote(`Realtime returned an invalid ${_.name} call.`),m=!0,b({type:"response.create"});return}const h=await e.submitIntent(A);S(_.callId,{ok:h.ok,message:h.message,state:h.state}),m=!0,b({type:"response.create",response:{instructions:`Speak exactly this crew line: ${JSON.stringify(h.message)}`}})}async function L(w){let _;try{_=JSON.parse(w)}catch{return}switch(_.type){case"input_audio_buffer.speech_started":u=!1,m=!1,b({type:"session.update",session:{instructions:bn(e.getState())}}),e.onStatus("listening","Hearing order");break;case"conversation.item.input_audio_transcription.completed":{const A=_.transcript?.trim(),h=_.item_id??A;A&&h&&!y.has(h)&&(y.add(h),u=!0,e.onTranscript(A));break}case"response.output_audio.delta":case"response.audio.delta":case"output_audio_buffer.started":p=!0,e.onStatus("speaking","Crew speaking");break;case"output_audio_buffer.stopped":e.onStatus("listening","Listening");break;case"response.done":{const A=ha(_.response);if(await E(A),A.length===0){const h=pa(_.response);m?m=!1:h&&e.onResponseLine(h),e.onStatus("listening","Listening")}break}case"error":e.onStatus("error","Realtime session error");break}}function N(w){return w.readyState==="open"?Promise.resolve():new Promise((_,A)=>{const h=window.setTimeout(()=>A(new Error("Realtime data channel timed out.")),1e4);w.addEventListener("open",()=>{window.clearTimeout(h),_()},{once:!0}),w.addEventListener("error",()=>{window.clearTimeout(h),A(new Error("Realtime data channel failed."))},{once:!0})})}function P(){n?.close(),t?.close();for(const w of i?.getTracks()??[])w.stop();a?.remove(),t=null,n=null,i=null,a=null,o=!1,s=!1,p=!1,u=!1,m=!1,y.clear(),e.onStatus("disconnected","Mic disconnected")}async function F(){if(!(o||s)){o=!0,e.onStatus("connecting","Requesting microphone");try{i=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),t=new RTCPeerConnection,a=document.createElement("audio"),a.autoplay=!0,a.hidden=!0,R(),document.body.appendChild(a),t.addEventListener("track",h=>{a&&(a.srcObject=h.streams[0]??new MediaStream([h.track]))}),t.addEventListener("connectionstatechange",()=>{(t?.connectionState==="failed"||t?.connectionState==="disconnected")&&e.onStatus("error","Realtime connection lost")});for(const h of i.getTracks())t.addTrack(h,i);n=t.createDataChannel("oai-events"),n.addEventListener("message",h=>{x=x.then(()=>L(h.data)).catch(v=>{const f=v instanceof Error?v.message:String(v);e.onSystemNote(f)})});const w=await t.createOffer();if(await t.setLocalDescription(w),!w.sdp)throw new Error("Browser did not create a Realtime offer.");const _=await fetch(e.endpoint??"/api/realtime/session",{method:"POST",headers:{"Content-Type":"application/sdp"},body:w.sdp});if(!_.ok){const h=(await _.text()).trim();throw new Error(h||`Realtime session failed (${_.status}).`)}const A=await _.text();await t.setRemoteDescription({type:"answer",sdp:A}),await N(n),b(ma(e.getState(),r)),o=!1,s=!0,e.onStatus("listening","Listening")}catch(w){const _=w instanceof Error?w.message:String(w);throw P(),e.onStatus("error",_),w}}}return{connect:F,disconnect:P,toggle:async()=>{s||o?P():await F()},isConnected:()=>s,setVoice:w=>{const _=gt(w);if(_!==r&&(r=_,!!s)){if(p){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");return}b({type:"session.update",session:{audio:{output:{voice:r}}}})}},setVolume:w=>{l=Math.max(0,Math.min(1,w)),R()},setAudioEnabled:w=>{d=w,R()}}}const yn=9.81,wn=370,ba=.84,ya=10/12,ft=12,vn=.45,wa=2.2,xn=.6,va=50,Sn=2,xa=16,Mn=.2,Sa=.9,Ma=137.51,Ea=251.33;function bt(e){return Math.min(1,Math.max(0,e))}function ka(e){return Math.max(e*ya,.1)}function _a(e){const t=ka(e),n=yn*(ba/t)**2;return 2*Math.PI/n}function Ta(e){const t=bt(e/40),n=Math.sqrt(t);return Mn+n*(Sa-Mn)}function Ra(e){const t=bt(e/40);return Sn+t*(xa-Sn)}function Ca(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function Aa(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=_a(n),a=Ra(n),o=Ta(n),s=1+bt(o)*3,r=t+180,l=[],d=[],p=[];let u=0;for(let x=0;x<ft;x++){const b=x/(ft-1),R=vn*(wa/vn)**b;l.push(R);const S=va*(2*b-1);d.push(S);const E=Math.log(R),L=Math.exp(-(E*E)/(2*xn*xn)),N=S*Math.PI/180,P=Math.max(0,Math.cos(N))**(2*s),F=L*P;p.push(F),F>u&&(u=F)}const m=[],y=u>0?u:1;for(let x=0;x<ft;x++){const b=i*l[x],R=2*Math.PI/b,S=Math.sqrt(yn*R*(1+R*R/(wn*wn))),E=Ca(r+d[x]),L=a*(p[x]/y),N=x*Ma,P=x*Ea,F=-R*(E.x*N+E.z*P);m.push({amplitude:L,wavenumber:R,omega:S,dirX:E.x,dirZ:E.z,phase0:F})}return m}function Da(e,t,n,i){let a=0;for(const o of e){const s=o.wavenumber*(o.dirX*t+o.dirZ*n)-o.omega*i+o.phase0;a+=o.amplitude*Math.cos(s)}return a}const Pa=458.7,Na=170;function Ia(e){return{length:Pa*e,beam:Na*e}}function Oa(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],a=[];for(const o of i)a.push({x:-n,z:o}),a.push({x:n,z:o});return a}function La(e,t,n){const i=Math.cos(n),a=Math.sin(n);return{x:e*i+t*a,z:-e*a+t*i}}function Ha(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,a=0,o=0,s=0,r=0,l=0,d=0;const p=e.length;for(let E=0;E<p;E++){const{x:L,z:N}=e[E],P=t[E];n+=L*L,i+=L*N,a+=L,o+=N*N,s+=N,r+=L*P,l+=N*P,d+=P}const u=n*(o*p-s*s)-i*(i*p-s*a)+a*(i*s-o*a);if(Math.abs(u)<1e-9)return{heave:d/p,pitchRad:0,rollRad:0};const m=r*(o*p-s*s)-i*(l*p-s*d)+a*(l*s-o*d),y=n*(l*p-d*s)-r*(i*p-s*a)+a*(i*d-l*a),x=n*(o*d-s*l)-i*(i*d-s*r)+r*(i*s-o*a),b=m/u,R=y/u;return{heave:x/u,pitchRad:Math.atan(-R),rollRad:Math.atan(b)}}function za(e,t,n,i,a,o){const s=-i*(Math.PI/180),r=Ia(a),l=Oa(r),d=l.map(p=>{const u=La(p.x,p.z,s);return Da(e,t+u.x,n+u.z,o)});return Ha(l,d)}function yt(e,t,n,i,a){if(a<=0||n<=0)return e;const o=e.position-t,s=e.velocity,r=1e-4;let l,d;if(Math.abs(i-1)<r){const p=Math.exp(-n*a),u=s+n*o;l=(o+u*a)*p,d=p*(s-n*a*u)}else if(i>1){const p=n*Math.sqrt(i*i-1),u=-n*i+p,m=-n*i-p,y=(s-m*o)/(u-m),x=o-y,b=Math.exp(u*a),R=Math.exp(m*a);l=y*b+x*R,d=y*u*b+x*m*R}else{const p=-n*i,u=n*Math.sqrt(1-i*i),m=Math.exp(p*a),y=Math.cos(u*a),x=Math.sin(u*a),b=(s-p*o)/u;l=m*(o*y+b*x),d=p*l+m*u*(-o*x+b*y)}return{position:t+l,velocity:d}}function En(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(a,o,s,r,l,d,p,u){const m=za(p,s,r,l,d,o),y=m.heave*u.heaveScale,x=m.pitchRad*u.pitchScale,b=m.rollRad*u.rollScale;return a>0?(e=yt(e,y,u.stiffness,u.damping,a),t=yt(t,x,u.stiffness,u.damping,a),n=yt(n,b,u.stiffness,u.damping,a)):(e={position:y,velocity:0},t={position:x,velocity:0},n={position:b,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const Va=.514444,Me=Math.PI/180,Fa=1,Wa=512,ja=4;function qe(e){return-e*Me}function Ba(e){const t=e*Me;return{x:Math.sin(t),z:-Math.cos(t)}}function Ne(e,t){return{x:e.x*t,z:-e.y*t}}const kn=18,$a=95,Ka=260;function Ga(e,t,n,i,a,o){const s=o*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Ka;e.position.x=t+i.x*s+a.x*r,e.position.z=n+i.z*s+a.z*r,e.position.y=kn+Math.random()*($a-kn)}function Ua(e,t,n,i,a,o,s,r){if(e.length===0)return;const l=i+180,d=Ba(l),p={x:-d.x,z:-d.z},u={x:-d.z,z:d.x},m=a*Va*o,y=qe(l),x=s*s;for(const b of e){b.position.x+=d.x*m*r,b.position.z+=d.z*m*r,b.rotation.y=y;const R=b.position.x-t,S=b.position.z-n;R*R+S*S>x&&Ga(b,t,n,p,u,s)}}const Ya=1.4,Ja=6,Xa=2;function qa(e,t,n,i,a=De.visuals,o={}){const{camera:s=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:d,muzzleFlash:p=null,splash:u=null,hitFlash:m=null,getEnemyTiltNode:y}=o;let x=null,b=0,R=0,S=0;const E=En(),L=En();let N=null,P=[];function F(D,q){const O=`${D}:${q}`;return O!==N&&(P=Aa({windDirectionDeg:D,windSpeedKts:q}),N=O),P}const w=220,_=450;let A=null,h=null,v=null,f="follow";const T=s!==null?s.fov:null;function C(D){f=D,typeof window<"u"&&(window.__captainViewMode=D),s!==null&&D==="follow"&&T!==null&&(s.fov=T,s.updateProjectionMatrix())}function X(D,q,O){const{worldUnitsPerMetre:ce,maxHeelDeg:Et,maxBraceDeg:kt,heelSmoothingHz:_t,boatScale:de,streakFieldRadius:Tt}=a,J=x===null?0:Math.min((D-x)/1e3,.5);x=D;const j=e.getState(),Oe=qe(q.headingDeg);t.rotation.y=Oe,t.scale.x=de,t.scale.y=de,t.scale.z=de;const{x:ge,z:Ce}=Ne(q,ce);t.position.x=ge,t.position.z=Ce;const{buoyancy:ne}=a,Le=F(j.windDirection,j.windSpeedKts),He=D/1e3,H=E.update(J,He,ge,Ce,q.headingDeg,de,Le,ne),fe=n();if(fe!==null){const z=Et*Math.tanh(j.apparentWindKts**2*((j.mainTrim+j.jibTrim)/2)*Math.abs(Math.sin(j.apparentWindAngle*Me))/Wa),$=Math.sign(j.apparentWindAngle)*z*Me,Y=J>0?1-Math.exp(-J*_t):0,Ae=b+($-b)*Y,ze=ja*Me*J,Ue=Math.max(-ze,Math.min(ze,Ae-b));b+=Ue;const _e=ne.enabled?H.rollRad:0;fe.rotation.z=b+_e,fe.rotation.x=ne.enabled?H.pitchRad:0;const Ve=ne.baseOffsetM*ce;fe.position.y=ne.enabled?H.heave+Ve:0}const B=i?i():null;if(B!==null){const z=(j.mainTrim+j.jibTrim)/2,$=Math.sign(j.apparentWindAngle)*z*kt*Me,Y=J>0?1-Math.exp(-J*Fa):0;R+=($-R)*Y,B.rotation.y=R}Ua(l,ge,Ce,j.windDirection,j.windSpeedKts,ce,Tt,J);const ue=r?r():null;if(ue!==null){const z=qe(j.apparentWindAngle+180),$=J>0?1-Math.exp(-J*Xa):0;let Y=z-S;Y=(Y+Math.PI)%(2*Math.PI)-Math.PI,S+=Y*$;const Ae=Ja*Me*Math.sin(D/1e3*2*Math.PI*Ya);ue.rotation.y=S+Ae}if(s!==null&&f==="helm"){const{helmView:z}=a;s.position.x=z.x,s.position.y=z.y,s.position.z=z.z,s.rotation.x=z.pitchDeg*Me,s.rotation.y=0,s.rotation.z=0,s.fov!==z.fov&&(s.fov=z.fov,s.updateProjectionMatrix())}const Q=d?d():null;if(Q!==null)if(O!==null){const z=Ne(O,ce);Q.position.x=z.x,Q.position.z=z.z,Q.rotation.y=qe(O.headingDeg),Q.scale.x=de,Q.scale.y=de,Q.scale.z=de,Q.visible=!0;const $=y?y():null,Y=L.update(J,He,z.x,z.z,O.headingDeg,de,Le,ne);if($!==null){const Ae=ne.baseOffsetM*ce;$.position.y=ne.enabled?Y.heave+Ae:0,$.rotation.x=ne.enabled?Y.pitchRad:0,$.rotation.z=ne.enabled?Y.rollRad:0}}else Q.visible=!1;A!==null&&D>=A&&(p!==null&&(p.visible=!1),A=null),h!==null&&D>=h&&(u!==null&&(u.visible=!1),h=null),v!==null&&D>=v&&(m!==null&&(m.visible=!1),v=null)}function W(){C(f==="follow"?"helm":"follow")}function xe(D,q,O){p!==null&&(p.position.x=q,p.position.y=90,p.position.z=O,p.visible=!0,A=D+w)}function ke(D,q,O){u!==null&&(u.position.x=q,u.position.y=8,u.position.z=O,u.visible=!0,h=D+w)}function te(D,q,O){m!==null&&(m.position.x=q,m.position.y=55,m.position.z=O,m.visible=!0,v=D+_)}return{update:X,toggleView:W,getViewMode:()=>f,triggerMuzzleFlash:xe,triggerSplash:ke,triggerHitFlash:te}}window.__captainDriverActive=!0;const M=Xe();window.__captainAmbientRock=M.visuals.ambientRock,window.__captainReflectionInterval=M.visuals.performance.reflectionInterval;const me=new fi({},M),_n={current:null},se=Qn(me,()=>_n.current),ee=M.battle.enabled?new Bi(M.battle,M.physics,M.controls,{...me.getPose(),windDirectionDeg:se.getState().windDirection,windSpeedKts:se.getState().windSpeedKts}):null;_n.current=ee;const wt=document.createElement("div");wt.id="hud-root",document.body.appendChild(wt);function vt(e){wi(e)}function Be(e){Kt(e)}function $e(e){ct(e)}async function Tn(e){if(vt(e),xt==="ai")try{const n=await ca(e,se.getState(),"",M.voice.intentModel,"/api/intent/parse");if(n.intent===null){Be(null),$e(n.crewLine);return}await Qe(n.intent);return}catch(n){Qa(n)}const t=ta(e,se.getState());if(t.kind==="error")throw Be(null),$e(t.message),new Error(t.message);if(t.kind==="acknowledgement"){Be(null),$e(t.message);return}await Qe(t.intent)}let xt=$t(M.input.defaultMode),Ee=null,Rn=!1;function Qa(e){if(Rn)return;Rn=!0;const t=e instanceof Error?e.message:String(e);Gt(`AI parsing unavailable (${t}) — orders are being parsed locally instead.`)}const Za=yi(wt,se,{injectTranscript:Tn,setInputMode:e=>{xt=e,e!=="realtime"&&Ee?.disconnect()},toggleRealtime:()=>{xt==="realtime"&&Ee?.toggle().catch(()=>{})},setCrewAudioEnabled:e=>{Ee?.setAudioEnabled(e)},setTtsVoice:e=>{M.voice.ttsVoice=e,Ee?.setVoice(e)},setTtsVolume:e=>{M.voice.ttsVolume=e,Ee?.setVolume(e)},getGunsStatus:()=>ee?Kn(ee.getView()):null});async function Qe(e){const t=await se.submit(e);if(vi(e,t.message),e.action==="fire_guns"&&ee){const n=ee.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),a=me.getPose(),o=ee.getView().npc,s=Ne({x:a.x,y:a.y},M.visuals.worldUnitsPerMetre);if(ve.triggerMuzzleFlash(i,s.x,s.z),n.kind==="hit"||n.kind==="miss"){const r=Ne({x:o.x,y:o.y},M.visuals.worldUnitsPerMetre);n.kind==="hit"?ve.triggerHitFlash(i,r.x,r.z):ve.triggerSplash(i,r.x,r.z)}}}return t}Ee=fa({getState:()=>se.getState(),submitIntent:Qe,onTranscript:vt,onResponseLine:e=>{Be(null),$e(e)},onSystemNote:Gt,onStatus:xi,voice:M.voice.ttsVoice,volume:M.voice.ttsVolume});const Ie=document.getElementById("demo");let St=!1;function es(e){return new Promise(t=>setTimeout(t,e))}const ts=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:4e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function Cn(){if(!St){St=!0,Ie&&(Ie.disabled=!0);try{for(const e of ts){vt(`[demo] ${e.label}`);const t=await se.submit(e.intent);Be(e.intent),$e(t.message),await es(e.waitMs)}}finally{St=!1,Ie&&(Ie.disabled=!1)}}}Ie&&Ie.addEventListener("click",()=>{Cn()}),Si();const le=window.DEMO;if(le===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const ve=qa(se,le.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,M.visuals,{camera:le.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:le.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:le.ms_MuzzleFlash,splash:le.ms_Splash,hitFlash:le.ms_HitFlash}),An=10/12,ns=350,is=1400,Dn=1.6,as=4.4,Pn=.2,ss=.9;function os(e){const t=e*An,n=9.81,i=.84,a=Math.max(t,.1),o=n*(i/a)**2,s=2*Math.PI/o,r=Math.min(is,Math.max(ns,s*2)),l=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(l),p=Dn+d*(as-Dn),u=Pn+d*(ss-Pn);return{size:r,choppiness:p,directionality:u}}function Nn(e){return 1+Math.min(1,Math.max(0,e))*3}function Mt(e){me.setWind(M.environment.windDirectionDeg,M.environment.windSpeedKts);const t=window.DEMO;if(t===void 0)return;const n=(M.environment.windDirectionDeg+180)*Math.PI/180,i=M.environment.windSpeedKts*An;if(t.ms_Ocean.windX=Math.sin(n)*i,t.ms_Ocean.windY=-Math.cos(n)*i,M.visuals.seaStateFollowsWind){const a=os(M.environment.windSpeedKts);e&&(t.ms_Ocean.size=a.size),t.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=a.choppiness,t.ms_Ocean.directionality=Nn(a.directionality)}else e&&(t.ms_Ocean.size=M.visuals.oceanSize);t.ms_Ocean.changed=!0}function In(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(Te(M,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),Te(M,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),Te(M,"visuals.lighting.sunIntensity",e.sunIntensity),Te(M,"visuals.lighting.ambientIntensity",e.ambientIntensity),Te(M,"visuals.lighting.exposure",e.exposure),Te(M,"visuals.lighting.fogDensity",e.fogDensity))}function rs(){window.DEMO?.SetLightingParams(M.visuals.lighting)}!(window.location.hash.length>1)&&le.ms_Environment!==M.environment.skyPreset&&le.UpdateEnvironment(M.environment.skyPreset),In(),Mt(!0),le.ms_soundWaves&&(le.ms_soundWaves.volume=M.visuals.ambientSoundVolume);function ls(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function cs(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function ds(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function us(e,t){switch(Te(M,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.performance.reflectionInterval":window.__captainReflectionInterval=t;break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=Nn(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&Mt(!1);break;case"visuals.waterColor":{const n=ls(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":cs(t);break;case"visuals.streakOpacity":ds(t);break;case"voice.ttsVolume":Ee?.setVolume(t);break;case"voice.ttsVoice":Ee?.setVoice(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":Mt(!1);break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),In();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":rs();break}}Mi(us);const Ke=document.getElementById("view-toggle");function On(e){return e==="helm"?"Follow Cam":"Helm View"}function hs(){ve.toggleView(),Ke&&(Ke.textContent=On(ve.getViewMode()))}Ke&&(Ke.textContent=On(ve.getViewMode()),Ke.addEventListener("click",()=>{hs()}));const Ge=document.createElement("div");Ge.id="battle-hit-flash",Ge.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(Ge);let Ze=null;const ps=180;function ms(){Ze!==null&&clearTimeout(Ze),Ge.style.opacity="0.35",Ze=setTimeout(()=>{Ge.style.opacity="0",Ze=null},ps)}const Ln=15,gs=250;let et=null;document.addEventListener("visibilitychange",()=>{document.hidden&&(et=null)});function Hn(e){if(et!==null){const o=Math.min(e-et,gs);if(me.tick(o),ee){const s=me.getPose(),r=se.getState(),l=ee.tick(o,{...s,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(me.setDriveMultiplier(ee.getSpeedMultiplier()),l.some(d=>d.key==="enemy_fires")){const d=ee.getView().npc,p=Ne({x:d.x,y:d.y},M.visuals.worldUnitsPerMetre);if(ve.triggerMuzzleFlash(e,p.x,p.z),l.some(u=>u.key==="hit_taken"))ms();else{const u=d.x-s.x,m=d.y-s.y,y=Math.hypot(u,m)||1,x={x:s.x+u/y*Ln,y:s.y+m/y*Ln},b=Ne(x,M.visuals.worldUnitsPerMetre);ve.triggerSplash(e,b.x,b.z)}}for(const d of l){const p=V(d.key,r,d);ct(p)}}}et=e;const t=me.getPose(),n={x:t.x,y:t.y,headingDeg:se.getState().heading},i=ee?ee.getView().npc:null,a=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;ve.update(e,n,a),Za.update(),requestAnimationFrame(Hn)}requestAnimationFrame(Hn),window.__captain={bus:se,submitIntent:Qe,injectTranscript:Tn,setWind:(e,t)=>{me.setWind(e,t)},demo:Cn,getConfig:()=>M,copyConfig:()=>{const e=JSON.stringify(M,null,2);return console.log(e),e},setConfig:e=>{zt(e),location.reload()},resetConfig:()=>{Vt(),location.reload()},getPlayerPose:()=>me.getPose(),get battle(){return ee?ee.getView():null}}})();
