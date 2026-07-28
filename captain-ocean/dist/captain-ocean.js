(function(){"use strict";function pi(e){if(e.enemyStruck)return"struck her colours — dead in the water";const t=e.npc,n={APPROACH:"closing",ENGAGE:"engaging",FLEE:"fleeing",STRUCK:"struck"},i=t.rudderDeg>.5?"S":t.rudderDeg<-.5?"P":"",a=i===""?"rudder 0°":`rudder ${Math.abs(Math.round(t.rudderDeg))}°${i}`,s=(t.mainTrim+t.jibTrim)/2;return`${n[t.behavior]??t.behavior.toLowerCase()} — ${vt(t.speedKts)} kts, trim ${s.toFixed(2)}, ${a}, hull ${e.enemyHullHp}/10`}function mi(e){if(e.enemyStruck)return"she's struck her colours — battle won";const t=e.guns,n=`${Math.round(t.rangeM)} m`;if(t.readyInS>0)return`reloading… ${Math.ceil(t.readyInS)} s`;if(!t.inRange)return`ready — out of range (${n})`;if(!t.inArc)return`ready — she doesn't bear (bring her abeam, ${n})`;const i=t.raking?", raking — 2× damage!":"";return`ready — she bears, ${n}, ~${t.hitChancePct}% to hit${i}`}function Yt(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function vt(e){return e.toFixed(1)}function B(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=Yt(t.heading),a=vt(t.speedKts),s=Yt(t.windDirection),o=vt(t.windSpeedKts);let r=`Steering ${i} at ${a} knots, wind ${s} at ${o}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const gi=-35,fi=35,bi=0,yi=1,wi=1;function vi(e){return e==="main"||e==="jib"||e==="all"}function ke(e,t){return{ok:!1,message:e,state:t}}function ye(e,t){return{ok:!0,message:e,state:t}}function xi(e,t){function n(a){const s=a.action;if(s==="helm"){const o=a.degrees;if(typeof o!="number"||!Number.isFinite(o)||o<gi||o>fi)return Promise.resolve(ke(B("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:o}).accepted)return Promise.resolve(ke(B("unknown_order",e.snapshot()),e.snapshot()));const c=e.snapshot();return c.speedKts<wi?Promise.resolve(ye(B("no_steerage_way",c),c)):o>0?Promise.resolve(ye(B("helm_ack_starboard",c),c)):o<0?Promise.resolve(ye(B("helm_ack_port",c),c)):Promise.resolve(ye(B("helm_ack_amidships",c),c))}if(s==="trim_sail"){const o=a.sail,r=a.trim;if(!vi(o))return Promise.resolve(ke(B("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<bi||r>yi)return Promise.resolve(ke(B("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:o,trim:r}).accepted)return Promise.resolve(ke(B("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),h=o==="main"?"trim_ack_main":o==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(ye(B(h,d),d))}if(s==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(ke(B("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(ye(B("status",r),r))}if(s==="fire_guns"){const o=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(ke(B("no_target",o),o));const c=a.side,d=c==="port"||c==="starboard"?c:void 0,h=r.fireGuns(d);switch(h.kind){case"no_target":return Promise.resolve(ke(B("no_target",o),o));case"wasted":return Promise.resolve(ye(B("shot_wasted",o),o));case"reloading":return Promise.resolve(ye(B("guns_reloading",o),o));case"miss":return Promise.resolve(ye(B("player_miss",o),o));case"hit":{const u=h.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(ye(B(u,o,{enemyHullHp:h.enemyHullHp}),o))}default:{const u=h;throw new Error(`unhandled fire outcome: ${String(u)}`)}}}return Promise.resolve(ke(B("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const xt=1.94384,le=180/Math.PI,ee=Math.PI/180;function Jt(e){return e*xt}function St(e){return e/xt}function we(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function U(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function Ee(e,t,n){return e<t?t:e>n?n:e}const Si=0,Mi=12;function qt(e={}){return{x:0,y:0,psi:U((e.heading??0)*ee),u:St(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*ee,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:U((e.windDirection??Si)*ee),windSpeedMs:St(e.windSpeedKts??Mi)}}const Je=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],ki=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Ei=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function _i(e,t,n){return e+(t-e)*n}function Xt(e,t){const n=Ee(t,0,180);let i=0;for(;i<Je.length-1&&Je[i+1]<=n;)i++;const a=Math.min(i+1,Je.length-1),s=Je[i],o=Je[a],r=o===s?0:(n-s)/(o-s);return _i(e[i],e[a],r)}function Ti(e){return{cl:Xt(ki,e),cd:Xt(Ei,e)}}function Ri(e){const t=Ee(Math.abs(e),0,180),{cl:n,cd:i}=Ti(t),a=t*ee,s=Math.sin(a),o=Math.cos(a),r=n*s-i*o,c=Math.abs(n*o+i*s);return{cDrive:r,cSide:c}}const Zt=.95,Ci=.2;function st(e){const t=Ee(Math.abs(e),0,180)/180;return Ee(Zt-(Zt-Ci)*t*t,.15,1)}const Ai=.65;function Di(e,t){const n=(e-st(t))/Ai;return Math.max(0,1-n*n)}const ze={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:165,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"marin",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3,defaultMode:"ai"},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6},performance:{oceanQuality:"medium",reflectionInterval:2},showCannonRange:!0},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Fe="captain.config";function Ae(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Pi(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Qt(e,t,n,i){for(const a of Object.keys(t)){const s=t[a];if(!(a in e)){i.push(`${n}${a} (unknown key)`);continue}const o=e[a];Ae(o)&&Ae(s)?Qt(o,s,`${n}${a}.`,i):Ae(o)||Ae(s)||typeof o!=typeof s?i.push(`${n}${a} (expected ${typeof o}, got ${typeof s})`):e[a]=s}}function en(e,t){const n={...e};for(const i of Object.keys(t)){const a=t[i],s=n[i];n[i]=Ae(s)&&Ae(a)?en(s,a):a}return n}function rt(){return typeof localStorage<"u"}function Ni(){if(!rt())return{};const e=localStorage.getItem(Fe);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return Ae(t)?t:{}}catch{return{}}}function lt(){const e=Pi(ze);if(!rt())return e;const t=localStorage.getItem(Fe);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Fe}"] is not valid JSON — ignoring it, using defaults.`),e}if(!Ae(n))return console.warn(`captain.config: stored value in localStorage["${Fe}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Qt(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function tn(e){if(!rt())return;const t=Ni(),n=en(t,e);localStorage.setItem(Fe,JSON.stringify(n))}function nn(){rt()&&localStorage.removeItem(Fe)}function Ne(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0||(s=s?.[r],s==null))return}s!=null&&(s[a]=n)}const Oi=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"Legacy STT model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.sttFallbackModel",label:"Legacy STT fallback",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.intentModel",label:"AI Orders intent model",section:"Voice",type:"text",live:!1,note:"Used by the AI Orders input mode. The server may pin its own model on public hosts."},{path:"voice.ttsModel",label:"Legacy TTS model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.ttsVoice",label:"Realtime voice",section:"Voice",type:"select",options:["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],live:!0},{path:"voice.whisperMode",label:"Legacy VAD default",section:"Voice",type:"boolean",live:!1,hidden:!0},{path:"voice.ttsVolume",label:"Realtime voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"input.defaultMode",label:"Boot input mode",section:"Input",type:"select",options:["ai","direct","realtime"],live:!1,note:"Which order-input mode the app starts in. AI falls back to the local parser when no server is available."},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!1,note:"captain-ocean only. Reload required — live changes visibly rescale the whole ocean."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, choppiness/directionality above are overwritten from wind speed every time wind changes; the ocean wave scale slider only re-derives at boot/reload (see its own note)."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.showCannonRange",label:"Show cannon range ring",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Circle on the water at cannon range around your ship."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"visuals.performance.oceanQuality",label:"Ocean quality (GPU load)",section:"Performance",type:"select",options:["low","medium","high"],live:!1,note:"captain-ocean only. Reload required — FFT/geometry/cloud resolutions are built once at shell init. High = the original full-resolution ocean; medium ≈ a quarter of high's FFT pixel work."},{path:"visuals.performance.reflectionInterval",label:"Reflection every N frames",section:"Performance",type:"number",min:1,max:4,step:1,live:!0,note:"captain-ocean only. The mirror reflection is a full extra scene render — 2 halves its cost (~30Hz at 60fps) with at most a half-frame reflection lag; 1 = original every-frame behaviour."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],Ii=ze.controls.rudderMaxDeg*ee,Li=ze.physics;function Mt(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),o=-e.windSpeedMs*Math.cos(e.windFromRad),r=s-i,c=o-a,d=Math.hypot(r,c),h=r*t+c*n,u=r*n-c*t;return{awaDeg:Math.atan2(-u,-h)*le,awsMs:d}}function an(e,t,n,i,a){const s=Math.abs(n),{cDrive:o,cSide:r}=Ri(s),c=Di(t,s),d=.5*a*i*i,h=d*e*o*c,u=d*e*r*c,f=-Math.sign(n||1)*u;return{surge:h,sway:f}}function on(e,t,n=Li,i=Ii,a=1){const{awaDeg:s,awsMs:o}=Mt(e),r=an(n.areaMain,e.mainTrim,s,o,n.rhoAir),c=an(n.areaJib,e.jibTrim,s,o,n.rhoAir),d=(r.surge+c.surge)*a,h=(r.sway+c.sway)*a,u=e.u,f=e.v,b=e.r,S=u>=0?n.kSurgeLin:n.kSurgeLinAstern,w=-n.kSurgeQuad*u*Math.abs(u)-S*u,C=-n.kSwayQuad*f*Math.abs(f)-n.kSwayLin*f,R=Ee(e.rudder,-i,i),_=n.cRudder*R*u*Math.abs(u),W=-(n.kYawDamp+n.kYawDampU*Math.abs(u))*b,F=n.cWeather*Math.sin(s*ee)*o*Math.min(1,Math.abs(u)),D=_+W+F,j=(d+w)/n.mass+f*b,v=(h+C)/n.mass-u*b,A=D/n.izz;e.u=u+j*t,e.v=f+v*t,e.r=b+A*t;const P=Math.sin(e.psi),p=Math.cos(e.psi),x=e.u*P+e.v*p,m=e.u*p-e.v*P;e.x+=x*t,e.y+=m*t,e.psi=U(e.psi+e.r*t)}function sn(e){return Math.hypot(e.u,e.v)*xt}function Hi(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t;return U(Math.atan2(i,a))}function zi(e){return sn(e)<.2?0:we(e.psi-Hi(e))*le}const qe=.05,rn=qe*1e3;function kt(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Fi{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=ze){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*ee,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*ee,this.state=qt({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=Ee(t.degrees*ee,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=Ee(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=rn;)this.state.rudder=kt(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*qe),this.state.mainTrim=kt(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*qe),this.state.jibTrim=kt(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*qe),on(this.state,qe,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=rn}snapshot(){const{awaDeg:t,awsMs:n}=Mt(this.state),i=sn(this.state);return{heading:this.state.psi*le%360,speedKts:i,windDirection:this.state.windFromRad*le%360,windSpeedKts:Jt(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Jt(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*le,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:zi(this.state)}}setWind(t,n){this.state.windFromRad=U(t*ee),this.state.windSpeedMs=St(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const Et="captain.openai_key";function ln(){return window.localStorage.getItem(Et)}function Vi(e){window.localStorage.setItem(Et,e)}function Wi(){window.localStorage.removeItem(Et)}const ji="https://api.openai.com/v1/chat/completions",$i="https://api.openai.com/v1/realtime/calls",Bi="https://api.openai.com/v1/realtime/client_secrets";function _t(){try{return ln()?.trim()??""}catch{return""}}function cn(){return _t().length>0}function Ki(){const e=_t();return e.length>0?{apiKey:e,endpoint:ji,direct:!0}:{apiKey:"",endpoint:"/api/intent/parse",direct:!1}}async function Gi(e){const t=_t();if(t.length===0)return null;const n=await fetch(Bi,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({session:{type:"realtime",model:e}})}),i=await n.json().catch(()=>null);if(!n.ok){const r=i?.error?.message??`OpenAI rejected the key (${n.status}).`;throw new Error(r)}const a=i?.value,s=i?.client_secret?.value,o=typeof a=="string"?a:typeof s=="string"?s:"";if(o.length===0)throw new Error("OpenAI returned no ephemeral key.");return o}function Ui(){return cn()?{apiKey:"",endpoint:$i,direct:!0}:{apiKey:"",endpoint:"/api/realtime/session",direct:!1}}const Yi=["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],dn=[];function Ji(e){dn.push(e)}function qi(){for(const e of dn)e()}let un=null;function hn(e){return e==="direct"||e==="realtime"||e==="ai"?e:"ai"}function Xi(e,t,n){e.innerHTML="",ca();const i=document.createElement("div");i.id="hud",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel hud-state",i.appendChild(a);const s=document.createElement("div");s.className="hud-panel-title",s.textContent="Ship State",a.appendChild(s);function o(l,g,T=!1){const E=document.createElement("div");E.id=l,E.className="hud-row";const z=document.createElement("span");z.className="hud-row-label",z.textContent=g,E.appendChild(z);const I=document.createElement("span");I.className="hud-row-colon",I.textContent=": ",E.appendChild(I);const oe=document.createElement("span");oe.className="hud-row-value",oe.textContent="--",E.appendChild(oe);let ae=null,Q=null;if(T){const V=document.createElement("div");V.className="hud-bar",ae=document.createElement("div"),ae.className="hud-bar-fill",V.appendChild(ae),Q=document.createElement("div"),Q.className="hud-bar-marker",Q.hidden=!0,V.appendChild(Q),E.appendChild(V)}return a.appendChild(E),{setValue:V=>{oe.textContent=V},setFill:ae?V=>{ae&&(ae.style.width=`${Math.max(0,Math.min(100,V))}%`)}:void 0,setMarker:Q?V=>{Q&&(Q.hidden=V===null,V!==null&&(Q.style.left=`${Math.max(0,Math.min(100,V))}%`))}:void 0}}const r=o("hud-heading","heading"),c=o("hud-speed","speed"),d=o("hud-wind","wind"),h=o("hud-awa","awa"),u=o("hud-main","main",!0),f=o("hud-jib","jib",!0),b=o("hud-rudder","rudder"),S=o("hud-guns","guns",!0),w=document.getElementById("hud-guns");w.hidden=!0;const C=o("hud-hull","hull",!0),R=document.getElementById("hud-hull");R.hidden=!0;const _=o("hud-enemy","enemy"),W=document.getElementById("hud-enemy");W.hidden=!0;const F="http://www.w3.org/2000/svg";function D(l,g){const T=document.createElementNS(F,l);for(const[E,z]of Object.entries(g))T.setAttribute(E,z);return T}const j=document.getElementById("hud-wind"),v=40,A=15,P=document.createElement("div");P.id="hud-windrose",P.className="hud-windrose";const p=D("svg",{viewBox:"0 0 120 120",width:"88",height:"88","aria-hidden":"true",focusable:"false"});function x(l,g,T){const E=V=>{const ot=V*Math.PI/180;return[60+Math.sin(ot)*T,60-Math.cos(ot)*T]},[z,I]=E(l),[oe,ae]=E(g),Q=Math.abs(g-l)>180?1:0;return`M 60 60 L ${z} ${I} A ${T} ${T} 0 ${Q} 1 ${oe} ${ae} Z`}p.appendChild(D("circle",{cx:"60",cy:"60",r:"52",class:"hud-windrose-ring"}));const m=D("g",{class:"hud-windrose-world"});for(const[l,g]of[["N",0],["E",90],["S",180],["W",270]]){const T=g*Math.PI/180,E=D("text",{x:String(60+Math.sin(T)*43),y:String(60-Math.cos(T)*43),class:l==="N"?"hud-windrose-letter hud-windrose-north":"hud-windrose-letter","text-anchor":"middle","dominant-baseline":"central"});E.textContent=l,m.appendChild(E)}p.appendChild(m);const y=D("g",{class:"hud-windrose-wind"});y.appendChild(D("path",{d:x(-v,v,52),class:"hud-windrose-nogo"})),y.appendChild(D("path",{d:x(180-A,180+A,52),class:"hud-windrose-deep"})),y.appendChild(D("line",{x1:"60",y1:"12",x2:"60",y2:"40",class:"hud-windvane-arrow-shaft"})),y.appendChild(D("polygon",{points:"60,50 52,36 68,36",class:"hud-windvane-arrow-head"})),p.appendChild(y),p.appendChild(D("polygon",{points:"60,44 54,72 60,66 66,72",class:"hud-windrose-boat"})),P.appendChild(p);const M=document.createElement("div");M.id="hud-windrose-warn",M.className="hud-windrose-warn",M.textContent=" ",P.appendChild(M),j.after(P);const te=document.getElementById("hud-rudder"),L=document.createElement("div");L.className="hud-gauge";const Y=document.createElement("div");Y.className="hud-gauge-center-tick",L.appendChild(Y);const ne=document.createElement("div");ne.className="hud-gauge-target",L.appendChild(ne);const K=document.createElement("div");K.className="hud-gauge-needle",L.appendChild(K),te.appendChild(L);let me=null;function se(l){return(Math.max(-35,Math.min(35,l))+35)/70*100}function O(l){const g=se(l);K.style.left=`${g}%`,K.classList.toggle("port",l<-.5),K.classList.toggle("stbd",l>.5),me!==null&&Math.abs(l-me)>.5?(ne.style.left=`${se(me)}%`,ne.style.display="block"):ne.style.display="none"}const J=document.createElement("div");J.id="hud-irons",J.className="hud-irons-row";const q=document.createElement("span");q.className="hud-visually-hidden",q.textContent="irons: false",J.appendChild(q),a.appendChild(J);const ce=document.createElement("div");ce.className="hud-panel hud-log",i.appendChild(ce);const je=document.createElement("div");je.className="hud-log-header",ce.appendChild(je);const nt=document.createElement("div");nt.className="hud-panel-title hud-log-title-text",nt.textContent="Quarterdeck Log",je.appendChild(nt);const xe=document.createElement("button");xe.id="command-config-toggle",xe.type="button",xe.title="Command settings",xe.setAttribute("aria-label","Command config"),xe.textContent="⚙",xe.className="hud-btn hud-command-config-toggle",je.appendChild(xe);const X=document.createElement("div");X.id="hud-log-list",X.className="hud-log-list",ce.appendChild(X);const mt=6,$=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function G(){X.innerHTML="";let l=-1;$.forEach((g,T)=>{g.kind==="exchange"&&(l=T)}),$.forEach((g,T)=>{const E=document.createElement("div");if(E.style.opacity=String(.45+.55*((T+1)/$.length)),g.kind==="system"){E.className="hud-log-entry hud-log-system-entry";const Q=document.createElement("div");Q.className="hud-log-system",Q.textContent=`⚠ ${g.transcript}`,E.appendChild(Q),X.appendChild(E);return}const z=T===l;E.className="hud-log-entry";const I=document.createElement("div");I.className="hud-log-you",z&&(I.id="hud-transcript"),I.textContent=`You: ${g.transcript}`,E.appendChild(I);const oe=document.createElement("div");oe.className="hud-log-order",z&&(oe.id="hud-intent"),oe.textContent=g.order,E.appendChild(oe);const ae=document.createElement("div");ae.className="hud-log-crew",z&&(ae.id="hud-crew"),ae.textContent=`Crew: ${g.crew}`,E.appendChild(ae),X.appendChild(E)}),X.scrollTop=X.scrollHeight}G();function $t(l){if(l===null)return"→ no order";if(l.action==="helm"){const g=Math.round(l.degrees),T=g<0?"port":g>0?"stbd":"amidships";return`→ helm ${g}° (${T})`}return l.action==="trim_sail"?`→ trim ${l.sail} → ${l.trim.toFixed(2)}`:l.action==="fire_guns"?"→ fire guns":"→ status report"}function $e(l){$.push({kind:"exchange",transcript:l,order:"→ …",crew:"…"}),$.length>mt&&$.shift(),G()}function Be(l){const g=[...$].reverse().find(T=>T.kind==="exchange");g&&(g.order=$t(l)),l!==null&&l.action==="helm"&&(me=l.degrees),G()}function de(l){const g=[...$].reverse().find(T=>T.kind==="exchange");g&&(g.crew=l),G()}function gt(l){$.push({kind:"system",transcript:l,order:"",crew:""}),$.length>mt&&$.shift(),G()}const Pe=document.createElement("div");Pe.className="hud-controls",ce.insertBefore(Pe,X);const Se=document.createElement("details");Se.id="input-mode-details",Se.className="hud-input-mode-details",Pe.appendChild(Se);const Re=document.createElement("summary");Re.id="input-mode-summary",Re.className="hud-input-mode-summary",Se.appendChild(Re);const Ce=document.createElement("div");Ce.id="input-mode",Ce.className="hud-input-mode",Ce.setAttribute("role","radiogroup"),Ce.setAttribute("aria-label","Command input mode"),Se.appendChild(Ce);function Ke(l,g,T,E=!1){const z=document.createElement("label");z.className="hud-input-mode-option",z.dataset.mode=l;const I=document.createElement("input");I.type="radio",I.name="input-mode",I.id=`input-mode-${l}`,I.value=l,z.appendChild(I);const oe=document.createElement("span");oe.className="hud-input-mode-copy";const ae=document.createElement("span");ae.className="hud-input-mode-name",ae.textContent=g;const Q=document.createElement("span");if(Q.className="hud-input-mode-source",Q.textContent=T,oe.appendChild(ae),oe.appendChild(Q),z.appendChild(oe),E){const V=document.createElement("button");V.type="button",V.className="hud-key-dot",V.dataset.mode=l;const ot=()=>{const Ye=cn();V.classList.toggle("ok",Ye),V.textContent=Ye?"●":"● add key",V.title=Ye?"OpenAI key saved — click to change":"No OpenAI key — click to add one"};V.addEventListener("click",Ye=>{Ye.preventDefault(),Ye.stopPropagation(),un?.()}),ot(),Ji(ot),z.appendChild(V)}return Ce.appendChild(z),{label:z,radio:I}}const ue=Ke("ai","AI Orders","Type or dictate — GPT works out what you mean",!0),H=Ke("realtime","GPT Realtime","Talk over your mic — the crew answers aloud",!0),ie=Ke("direct","Direct Orders","Type or dictate — instant, set phrases, no AI"),N=document.createElement("input");N.id="transcript-input",N.type="text",N.placeholder="Paste or dictate an order",N.className="hud-input",Pe.appendChild(N);const fe=document.createElement("div");fe.className="hud-button-row",Pe.appendChild(fe);const Z=document.createElement("button");Z.id="ptt",Z.type="button",Z.textContent="Connect Mic",Z.className="hud-btn hud-btn-ptt",Z.hidden=!0,fe.appendChild(Z);const Me=document.createElement("div");Me.id="input-status",Me.className="hud-input-status",Me.setAttribute("role","status"),Me.setAttribute("aria-live","polite"),Me.textContent="Ready locally",fe.appendChild(Me);const Ie=document.createElement("button");Ie.id="view-toggle",Ie.type="button",Ie.textContent="Helm View",Ie.className="hud-btn hud-btn-view-toggle",fe.appendChild(Ie);let Ge="direct";function Le(l,g="neutral"){Me.textContent=l,Me.dataset.tone=g}function it(){return Ge!=="realtime"}const qo={ai:"AI Orders",realtime:"GPT Realtime",direct:"Direct Orders"};function Bt(l,g=!0){Ge=l,ie.radio.checked=l==="direct",ue.radio.checked=l==="ai",H.radio.checked=l==="realtime",Re.textContent=`Orders: ${qo[l]}`,N.disabled=l==="realtime",Z.hidden=l!=="realtime",l==="realtime"?(bt(),N.placeholder="Voice orders arrive here",Le("Mic disconnected")):(N.placeholder="Paste or dictate an order",Le(l==="ai"?"Ready — GPT parses orders":"Ready locally"),window.setTimeout(()=>N.focus(),0)),g&&n.setInputMode(l)}function Kt(l){Bt(l),Se.open=!1}ie.radio.addEventListener("change",()=>{ie.radio.checked&&Kt("direct")}),ue.radio.addEventListener("change",()=>{ue.radio.checked&&Kt("ai")}),H.radio.addEventListener("change",()=>{H.radio.checked&&Kt("realtime")}),Z.addEventListener("click",()=>n.toggleRealtime());function He(){it()&&N.focus()}const ft=lt().input,si=2;let at=null;function bt(){at!==null&&(clearTimeout(at),at=null)}let Gt=!1,yt=null;async function Ut(l){if(!it())return;if(Gt||(n.isPipelineBusy?.()??!1)){yt=l;return}Gt=!0,bt();const g=performance.now(),T=Ge==="ai";Le(T?"Asking GPT…":"Processing locally");try{await n.injectTranscript(l),N.value="";const E=Math.max(1,Math.round(performance.now()-g));Le(T?`Accepted in ${E} ms`:`Accepted locally in ${E} ms`,"ok")}catch(E){const z=E instanceof Error?E.message:String(E);de(z),Le("Order not sent","error")}finally{if(Gt=!1,He(),yt!==null){const E=yt;yt=null,Ut(E)}}}function ri(l){if(!ft.autoSubmit)return;const g=l.trim();g.length<si||Ut(g)}N.addEventListener("input",l=>{if(!it()||(bt(),!ft.autoSubmit))return;if(l.inputType==="insertFromPaste"){ri(N.value);return}N.value.trim().length<si||(at=setTimeout(()=>{at=null,ri(N.value)},ft.autoSubmitDelayMs))}),N.addEventListener("keydown",l=>{if(!it()||l.key!=="Enter")return;bt();const g=N.value.trim();g.length!==0&&Ut(g)}),document.addEventListener("click",l=>{const g=l.target;if(g instanceof HTMLCanvasElement){He();return}g instanceof Element&&g.closest("#env-selector")&&He()}),document.addEventListener("keydown",l=>{!it()||aa(l.target)||l.ctrlKey||l.metaKey||l.altKey||!(l.key.length===1)&&l.key!=="Backspace"||N.focus()},{capture:!0}),Bt(hn(ft.defaultMode),!1);const be=document.createElement("button");be.id="mute-toggle",be.type="button",be.title="Mute all sound",be.setAttribute("aria-label","Mute all sound"),be.textContent="🔊",be.className="hud-btn hud-mute-toggle",i.appendChild(be);let Ue=!1;be.addEventListener("click",()=>{Ue=!Ue,be.textContent=Ue?"🔇":"🔊",be.title=Ue?"Unmute":"Mute all sound",be.classList.toggle("muted",Ue),n.setMuted?.(Ue),He()}),ra(i,He),la(ce,xe,n,He);function wt(l){return l.toFixed(1)}function li(l){return l.toFixed(2)}const Xo=["N","NE","E","SE","S","SW","W","NW"];function ci(l){return(l%360+360)%360}function di(l){const g=Math.round(ci(l)/45)%8;return Xo[g]??"N"}function ui(l){return String(Math.round(ci(l))%360).padStart(3,"0")}function Zo(l){return`${ui(l)} ${di(l)}`}function Qo(l,g){return`from ${ui(l)} @ ${wt(g)} kts (${di(l)})`}function es(l,g){const T=Math.round(l);if(T===0)return`dead ahead @ ${wt(g)} kts`;const E=T<0?"port":"starboard";return`${Math.abs(T)}° to ${E} @ ${wt(g)} kts`}function ts(l){const g=Math.round(l),T=g<0?"port":g>0?"stbd":"amidships";return`${g}° ${T}`}function ns(l){r.setValue(Zo(l.heading)),c.setValue(`${wt(l.speedKts)} kts`),d.setValue(Qo(l.windDirection,l.windSpeedKts)),m.setAttribute("transform",`rotate(${-l.heading} 60 60)`),y.setAttribute("transform",`rotate(${l.windDirection-l.heading} 60 60)`);const g=Math.abs(l.apparentWindAngle),T=g<45,E=g>180-A;M.textContent=T?"too close to the wind":E?"running deep":" ",M.dataset.tone=T||E?"warn":"ok",h.setValue(es(l.apparentWindAngle,l.apparentWindKts)),u.setValue(li(l.mainTrim)),u.setFill?.(l.mainTrim*100),f.setValue(li(l.jibTrim)),f.setFill?.(l.jibTrim*100);const z=st(Math.abs(l.apparentWindAngle))*100;u.setMarker?.(z),f.setMarker?.(z),b.setValue(ts(l.rudderAngle)),O(l.rudderAngle);const I=n.getBattleStatus?.()??null;w.hidden=I===null,R.hidden=I===null,W.hidden=I===null,I!==null&&(S.setValue(I.guns),S.setFill?.(I.gunsReadyPct),C.setValue(I.hull),C.setFill?.(I.hullPct),_.setValue(I.enemy)),q.textContent=`irons: ${l.inIrons}`,J.classList.toggle("active",l.inIrons)}function hi(){ns(t.getState())}return hi(),Xe={logTranscript:$e,logIntent:Be,logCrewLine:de,logSystemNote:gt},gn={setInputMode:l=>Bt(l,!1),setRealtimeState:(l,g)=>{if(Z.classList.toggle("listening",l==="listening"),Z.classList.toggle("recording",l==="speaking"),Z.disabled=l==="connecting",l==="connecting"?Z.textContent="Connecting...":l==="listening"||l==="speaking"?Z.textContent="Disconnect Mic":l==="error"?Z.textContent="Retry Mic":Z.textContent="Connect Mic",Ge!=="realtime")return;Le(g??{disconnected:"Mic disconnected",connecting:"Connecting to GPT Realtime",listening:"Listening",speaking:"Crew speaking",error:"Realtime unavailable"}[l],l==="error"?"error":"neutral")},setStatus:Le},fn={focus:He},{update:hi}}let Xe=null;function Zi(e){Xe?.logTranscript(e)}function pn(e){Xe?.logIntent(e)}function Tt(e){Xe?.logCrewLine(e)}function mn(e){Xe?.logSystemNote(e)}function Qi(e,t){pn(e),Tt(t)}let gn=null;function ea(e,t){gn?.setRealtimeState(e,t)}let fn=null;function ta(){fn?.focus()}let bn=[];function na(e){bn.push(e)}function ia(e,t){for(const n of bn)n(e,t)}function aa(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function oa(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function sa(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0)return;const c=s[r];(typeof c!="object"||c===null)&&(s[r]={}),s=s[r]}s[a]=n}function yn(e,t){const n={...e};for(const i of Object.keys(t)){const a=e[i],s=t[i];a!==null&&typeof a=="object"&&!Array.isArray(a)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=yn(a,s):n[i]=s}return n}function ra(e,t){const n=lt(),i={};let a=!1;const s=new Map,o=document.createElement("button");o.id="settings-toggle",o.type="button",o.title="Settings",o.setAttribute("aria-label","Settings"),o.textContent="⚙",o.className="hud-btn hud-settings-toggle",e.appendChild(o);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const c=document.createElement("div");c.className="hud-panel-title",c.textContent="Settings",r.appendChild(c);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);{let p=function(){let se="";try{se=ln()?.trim()??""}catch{se=""}const O=se.length>0;Y.value="",Y.placeholder=O?`saved (…${se.slice(-4)})`:"sk-...",me.textContent=O?"Saved in this browser. AI Orders and GPT Realtime will use it.":"Not set. AI Orders and GPT Realtime are unavailable; Direct Orders still work.",me.dataset.tone=O?"ok":"warn",K.hidden=!O,qi()},x=function(){const se=Y.value.trim();se.length!==0&&(Vi(se),p())};const m=document.createElement("details");m.className="hud-settings-section",m.id="openai-key-section",m.open=!0;const y=document.createElement("summary");y.textContent="OpenAI key",m.appendChild(y);const M=document.createElement("div");M.className="hud-settings-field",m.appendChild(M);const te=document.createElement("div");te.className="hud-settings-note",te.textContent="Needed for AI Orders and GPT Realtime. Stored in this browser only and sent straight to api.openai.com. Without one, Direct Orders still work through the local parser.",M.appendChild(te);const L=document.createElement("div");L.className="hud-settings-key-row",M.appendChild(L);const Y=document.createElement("input");Y.id="openai-key-input",Y.type="password",Y.autocomplete="off",Y.className="hud-settings-text",L.appendChild(Y);const ne=document.createElement("button");ne.id="openai-key-save",ne.type="button",ne.className="hud-btn",ne.textContent="Save",L.appendChild(ne);const K=document.createElement("button");K.id="openai-key-clear",K.type="button",K.className="hud-btn",K.textContent="Clear",L.appendChild(K);const me=document.createElement("div");me.id="openai-key-status",me.className="hud-settings-note",M.appendChild(me),ne.addEventListener("click",x),Y.addEventListener("keydown",se=>{se.key==="Enter"&&(se.preventDefault(),x())}),K.addEventListener("click",()=>{Wi(),p()}),p(),r.appendChild(m),un=()=>{P(!0),m.open=!0,m.scrollIntoView({block:"nearest"}),window.setTimeout(()=>Y.focus(),0)}}function h(){d.hidden=!a}function u(p,x){if(sa(i,p.path,x),p.live)ia(p.path,x);else{const m=s.get(p.path);m&&(m.hidden=!1),a=!0,h()}}function f(p,x){const m=document.createElement("div");m.className="hud-settings-control-row";const y=document.createElement("input");y.type="range",y.min=String(p.min??0),y.max=String(p.max??100),y.step=String(p.step??1),y.value=String(x),y.className="hud-settings-range";const M=document.createElement("input");M.type="number",M.min=y.min,M.max=y.max,M.step=y.step,M.value=String(x),M.className="hud-settings-numeric";const te=p.min??-1/0,L=p.max??1/0;function Y(ne){if(!Number.isFinite(ne))return;const K=Math.min(L,Math.max(te,ne));y.value=String(K),M.value=String(K),u(p,K)}return y.addEventListener("input",()=>Y(Number(y.value))),M.addEventListener("input",()=>Y(Number(M.value))),m.appendChild(y),m.appendChild(M),m}function b(p,x){const m=document.createElement("label");m.className="hud-settings-checkbox-label";const y=document.createElement("input");return y.type="checkbox",y.checked=x,y.addEventListener("change",()=>u(p,y.checked)),m.appendChild(y),m}function S(p,x){const m=document.createElement("select");m.className="hud-settings-select";for(const y of p.options??[]){const M=document.createElement("option");M.value=y,M.textContent=y,y===x&&(M.selected=!0),m.appendChild(M)}return m.addEventListener("change",()=>u(p,m.value)),m}function w(p,x){const m=document.createElement("input");return m.type="color",m.className="hud-settings-color",m.value=x,m.addEventListener("input",()=>u(p,m.value)),m}function C(p,x){const m=document.createElement("input");return m.type="text",m.className="hud-settings-text",m.value=x,m.addEventListener("change",()=>u(p,m.value)),m}function R(p){const x=document.createElement("div");x.className="hud-settings-field",x.dataset.configPath=p.path;const m=document.createElement("div");m.className="hud-settings-label-row";const y=document.createElement("span");if(y.className="hud-settings-label",y.textContent=p.label,m.appendChild(y),!p.live){const L=document.createElement("span");L.className="hud-settings-reload-dot",L.title="Staged — needs Save & Reload",L.hidden=!0,m.appendChild(L),s.set(p.path,L)}x.appendChild(m);const M=oa(n,p.path);let te;switch(p.type){case"number":te=f(p,M);break;case"boolean":te=b(p,M);break;case"select":te=S(p,M);break;case"color":te=w(p,M);break;default:te=C(p,M);break}if(x.appendChild(te),p.note){const L=document.createElement("div");L.className="hud-settings-note",L.textContent=p.note,x.appendChild(L)}return x}const _=new Map;for(const p of Oi)p.hidden||(_.has(p.section)||_.set(p.section,[]),_.get(p.section)?.push(p));const W=new Set(["Visuals","Environment","Lighting"]);for(const[p,x]of _){const m=document.createElement("details");m.className="hud-settings-section",m.open=W.has(p);const y=document.createElement("summary");y.textContent=p,m.appendChild(y);for(const M of x)m.appendChild(R(M));r.appendChild(m)}const F=document.createElement("div");F.className="hud-settings-footer";const D=document.createElement("button");D.id="settings-save-reload",D.type="button",D.textContent="Save & Reload",D.className="hud-btn",D.addEventListener("click",()=>{tn(i),location.reload()});const j=document.createElement("button");j.id="settings-copy-json",j.type="button",j.textContent="Copy JSON",j.className="hud-btn",j.addEventListener("click",()=>{(async()=>{const p=yn(n,i),x=JSON.stringify(p,null,2);console.log(x);try{await navigator.clipboard?.writeText(x)}catch{}})()});const v=document.createElement("button");v.id="settings-reset-all",v.type="button",v.textContent="Reset All",v.className="hud-btn",v.addEventListener("click",()=>{nn(),location.reload()}),F.appendChild(D),F.appendChild(j),F.appendChild(v),r.appendChild(F);let A=!1;function P(p){A=p,r.classList.toggle("open",p),o.classList.toggle("active",p),p||t()}o.addEventListener("click",()=>P(!A))}function la(e,t,n,i){const a=lt(),s=document.createElement("div");s.id="command-config",s.className="hud-panel hud-command-config",e.appendChild(s);function o(R){const _=document.createElement("div");return _.className="hud-command-config-section-title",_.textContent=R,_}s.appendChild(o("Realtime Voice"));const r=document.createElement("div");r.className="hud-command-config-row";const c=document.createElement("label");c.className="hud-toggle-label";const d=document.createElement("input");d.id="tts-enabled",d.type="checkbox",d.checked=!0,d.addEventListener("change",()=>n.setCrewAudioEnabled(d.checked)),c.appendChild(d),c.appendChild(document.createTextNode("Hear crew replies")),r.appendChild(c);const h=document.createElement("select");h.id="tts-voice-select",h.className="hud-settings-select hud-command-config-voice-select";for(const R of Yi){const _=document.createElement("option");_.value=R,_.textContent=R,R===a.voice.ttsVoice&&(_.selected=!0),h.appendChild(_)}h.addEventListener("change",()=>n.setTtsVoice(h.value)),r.appendChild(h),s.appendChild(r);const u=document.createElement("div");u.className="hud-command-config-row";const f=document.createElement("span");f.className="hud-command-config-volume-label",f.textContent="Volume",u.appendChild(f);const b=document.createElement("input");b.id="tts-volume",b.type="range",b.min="0",b.max="1",b.step="0.05",b.value=String(a.voice.ttsVolume),b.className="hud-settings-range",b.addEventListener("input",()=>n.setTtsVolume(Number(b.value))),u.appendChild(b),s.appendChild(u),s.appendChild(o("Actions"));const S=document.createElement("button");S.id="demo",S.type="button",S.textContent="Run Demo",S.className="hud-btn hud-btn-demo hud-command-config-demo",s.appendChild(S);let w=!1;function C(R){w=R,s.classList.toggle("open",w),t.classList.toggle("active",w),w||i()}t.addEventListener("click",()=>C(!w)),document.addEventListener("mousedown",R=>{if(!w)return;const _=R.target;s.contains(_)||t.contains(_)||C(!1)}),document.addEventListener("keydown",R=>{R.key==="Escape"&&w&&C(!1)})}function ca(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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

/* PATCH (voice-boat battle-feedback round 2): panel enlarged per live feedback ("make the top
   left controls panel bigger") — width 236 -> 310, base font 13 -> 16, with the title/label/bar
   sizes scaled to match (scoped overrides here so the quarterdeck log panel, which shares
   .hud-panel, stays its current size). */
.hud-state {
  top: 12px;
  left: 12px;
  width: 310px;
  max-width: calc(100vw - 24px);
  font-size: 15px;
  padding: 11px 15px;
}
.hud-state .hud-row {
  line-height: 1.4;
}
.hud-state .hud-panel-title {
  font-size: 12px;
}
.hud-state .hud-row-label {
  font-size: 12px;
  width: 68px;
}
.hud-state .hud-bar {
  height: 10px;
}
/* The guns/enemy lines ("ready — she bears, 180 m, ~49% to hit") are prose, not short numerics —
   let them wrap within the wider panel instead of overflowing their rows. */
.hud-state #hud-guns .hud-row-value,
.hud-state #hud-enemy .hud-row-value {
  white-space: normal;
}
/* Narrow (phone) viewports: the enlarged panel + wind rose + battle rows otherwise runs into the
   quarterdeck log (the mobile e2e bound) — scale back toward the pre-enlargement sizes there. */
@media (max-width: 480px) {
  .hud-state {
    width: 240px;
    font-size: 13px;
    padding: 10px 12px;
  }
  .hud-state .hud-row-label {
    font-size: 10px;
    width: 52px;
  }
  .hud-windrose svg {
    width: 80px;
    height: 80px;
  }
  .hud-windrose-warn {
    font-size: 10px;
  }
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
/* Wind rose (battle-feedback round 2) — replaces the old in-row wind vane. Bow-up: the fixed
   boat glyph points at 12 o'clock; compass letters counter-rotate with heading; the wind group
   carries the no-go cone, dead-run band and true-wind arrow. */
.hud-windrose {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  margin: 2px 0 1px;
}
.hud-windrose svg {
  display: block;
  overflow: visible;
}
.hud-windrose-ring {
  fill: rgba(255, 255, 255, 0.04);
  stroke: rgba(255, 255, 255, 0.3);
  stroke-width: 1.5;
}
.hud-windrose-letter {
  fill: #7fa8c9;
  font-size: 11px;
  font-weight: 700;
}
.hud-windrose-north {
  fill: #eaf6ff;
}
.hud-windrose-nogo {
  fill: rgba(255, 82, 82, 0.16);
  stroke: rgba(255, 82, 82, 0.45);
  stroke-width: 1;
}
.hud-windrose-deep {
  fill: rgba(255, 196, 0, 0.14);
  stroke: rgba(255, 196, 0, 0.4);
  stroke-width: 1;
}
.hud-windrose-boat {
  fill: #eaf6ff;
  stroke: rgba(0, 0, 0, 0.4);
  stroke-width: 0.8;
}
.hud-windrose-warn {
  font-size: 11px;
  min-height: 14px;
  color: #ffb84d;
  font-weight: 600;
}
.hud-windrose-warn[data-tone="ok"] {
  color: transparent;
}
.hud-windvane-arrow-shaft {
  stroke: #58c4ff;
  stroke-width: 3;
  stroke-linecap: round;
}
.hud-windvane-arrow-head {
  fill: #58c4ff;
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

.hud-bar-marker {
  position: absolute;
  top: -2px;
  bottom: -2px;
  width: 2px;
  margin-left: -1px;
  background: #ffd76a;
  z-index: 1;
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

.hud-mute-toggle {
  position: absolute;
  top: 12px;
  right: 56px;
  pointer-events: auto;
  font-size: 16px;
  line-height: 1;
  padding: 7px 10px;
  z-index: 11;
}
.hud-mute-toggle.muted {
  background: rgba(200, 60, 40, 0.35);
}
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

/* PATCH (voice-boat byok-ux round): key indicator on the modes that need one. Red until a key is
   stored, then a quiet green dot. */
.hud-key-dot {
  position: absolute;
  top: 6px;
  right: 8px;
  pointer-events: auto;
  border: 0;
  background: rgba(210, 60, 45, 0.18);
  color: #ff8a7a;
  font: 700 10px/1 ui-monospace, Menlo, monospace;
  letter-spacing: 0.04em;
  padding: 4px 6px;
  border-radius: 3px;
  cursor: pointer;
}
.hud-key-dot:hover {
  background: rgba(210, 60, 45, 0.3);
}
.hud-key-dot.ok {
  background: transparent;
  color: #5ad18a;
  padding: 4px 2px;
}
.hud-key-dot.ok:hover {
  background: rgba(90, 209, 138, 0.15);
}
.hud-settings-note[data-tone="warn"] {
  color: #ffb84d;
}
.hud-settings-note[data-tone="ok"] {
  color: #7fd6a0;
}

.hud-settings-key-row {
  display: flex;
  gap: 6px;
  align-items: center;
  margin: 6px 0 4px;
}
.hud-settings-key-row .hud-settings-text {
  flex: 1 1 auto;
  min-width: 0;
}
.hud-settings-key-row .hud-btn {
  flex: 0 0 auto;
  pointer-events: auto;
  font-size: 11px;
  padding: 5px 8px;
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
`,document.head.appendChild(e)}const Rt=.05,wn=Rt*1e3,da=35,ua=40,Ct=50,vn=15,ha=8;function At(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class pa{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=qt({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*ee,this.rudderRateRadPerS=t.rudderSlewDegPerS*ee,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=U(t*ee),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",U(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,a=Math.hypot(n,i),s=U(Math.atan2(n,i));a>this.engageRangeM*1.15?this.behavior="APPROACH":a<this.engageRangeM*.85&&(this.behavior="ENGAGE");let o;if(this.behavior==="APPROACH")o=s;else{const d=(a>this.engageRangeM?1:-1)*15*ee;o=U(t.headingRad+d)}const r=we(this.state.windFromRad-o)*le;if(this.tackSide!==null){this.tackHoldS-=Rt;const c=Math.abs(r)>=ua;if(this.tackHoldS<=0){if(c)this.tackSide=null;else if(Math.abs(r)>=ha){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=vn)}}}else if(Math.abs(r)<da){const c=U(this.state.windFromRad-Ct*ee),d=U(this.state.windFromRad+Ct*ee),h=Math.abs(we(c-this.state.psi)),u=Math.abs(we(d-this.state.psi));this.tackSide=h<=u?1:-1,this.tackHoldS=vn}return this.tackSide!==null?U(this.state.windFromRad-this.tackSide*Ct*ee):o}step(t,n){const i=this.planHeading(n),a=we(i-this.state.psi);this.rudderTargetRad=Ee(this.headingKp*a-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:s}=Mt(this.state),o=st(Math.abs(s));this.mainTrimTarget=o,this.jibTrimTarget=o,this.state.rudder=At(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=At(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=At(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),on(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=wn;)this.step(Rt,n),this.accMs-=wn}headingDeg(){return this.state.psi*le%360}}const xn=30;function Sn(){return{reloadRemainingS:0}}function Dt(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function Mn(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function kn(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=xn,ready:e.reloadRemainingS<=0}}function ma(e,t,n,i,a,s){Mn(e,t);const o=kn(e,n,i,a);return!o.inRange||!o.inArc||!o.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=a.reloadS,{fired:!0,hit:s()<Dt(n,a.cannonRangeM)})}function ga(e,t,n,i,a){const s=kn(e,t,n,i);if(!s.ready)return{fired:!1,hit:!1,...s};e.reloadRemainingS=i.reloadS;const o=a();return{fired:!0,hit:s.inRange&&s.inArc&&o<Dt(t,i.cannonRangeM),...s}}const ct=10,fa=5,ba=.8,ya=.5;function En(){return{hullHp:ct}}const _n=30,Tn=2;function Rn(e,t=1){e.hullHp=Math.max(0,e.hullHp-t)}function wa(e){return e.hullHp<=0?ya:e.hullHp<=fa?ba:1}function Cn(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const va=35,An=45;function xa(e){return Math.hypot(e.state.u,e.state.v)*1.94384}function Pt(e,t,n,i,a){const s=U(Math.atan2(e-n,t-i)),o=Math.abs(we(s-a)*le);return o<=_n||o>=180-_n}class Sa{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,a){this.cfg=t,this.rng=Cn(t.seed),this.playerRng=Cn(t.seed+1),this.lastPlayerPose=a;const s=Ee(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*s);const o=1.2+.6*s,r=this.rng()*2*Math.PI,c=a.x+t.spawnRangeM*Math.sin(r),d=a.y+t.spawnRangeM*Math.cos(r),h=U(r+Math.PI);this.npc=new pa({x:c,y:d,heading:h*le,windDirection:a.windDirectionDeg,windSpeedKts:a.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||va,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:o,phys:n}),this.damage=En(),this.cannon=Sn(),this.playerCannon=Sn(),this.enemyDamage=En()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,Mn(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});let a=n.x-this.npc.x,s=n.y-this.npc.y,o=Math.hypot(a,s);if(o>1e-6&&o<An){const r=An/o;this.npc.state.x=n.x-a*r,this.npc.state.y=n.y-s*r,a=n.x-this.npc.state.x,s=n.y-this.npc.state.y,o=Math.hypot(a,s)}if(!this.everSpotted&&o<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=U(Math.atan2(-a,-s)),d=we(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:d})}if(!this.everClosing&&o<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=U(Math.atan2(a,s)),c=we(r-this.npc.state.psi)*le,d=Math.min(Math.abs(c-90),Math.abs(c+90)),h=ma(this.cannon,t/1e3,o,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);if(h.fired&&(i.push({key:"enemy_fires"}),h.hit)){const u=Pt(this.npc.x,this.npc.y,n.x,n.y,n.headingRad);Rn(this.damage,u?Tn:1),i.push({key:"hit_taken",hullHp:this.damage.hullHp})}}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(t){const n=this.resolveFireGuns(t);return this.lastPlayerFireOutcome=n,n}resolveFireGuns(t){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const n=this.lastPlayerPose,i=n.x-this.npc.x,a=n.y-this.npc.y,s=Math.hypot(i,a),o=U(Math.atan2(-i,-a)),r=we(o-n.headingRad)*le,c=t==="starboard"?Math.abs(r-90):t==="port"?Math.abs(r+90):Math.min(Math.abs(r-90),Math.abs(r+90)),d=ga(this.playerCannon,s,c,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);if(!d.fired)return{kind:"reloading"};if(!d.inRange||!d.inArc)return{kind:"wasted"};if(!d.hit)return{kind:"miss"};const h=Pt(n.x,n.y,this.npc.x,this.npc.y,this.npc.state.psi);return Rn(this.enemyDamage,h?Tn:1),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=ct/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return wa(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:xa(this.npc),behavior:this.npc.behavior,mainTrim:this.npc.state.mainTrim,jibTrim:this.npc.state.jibTrim,rudderDeg:this.npc.state.rudder*le},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck,guns:this.gunsView()}}gunsView(){const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),s=U(Math.atan2(-n,-i)),o=we(s-t.headingRad)*le,r=Math.min(Math.abs(o-90),Math.abs(o+90)),c=a<=this.cfg.cannonRangeM,d=r<=xn,h=Pt(t.x,t.y,this.npc.x,this.npc.y,this.npc.state.psi);return{readyInS:this.playerCannon.reloadRemainingS,readyPct:this.cfg.playerReloadS>0?Math.max(0,Math.min(1,1-this.playerCannon.reloadRemainingS/this.cfg.playerReloadS)):1,rangeM:a,inRange:c,inArc:d,hitChancePct:c&&d?Math.round(Dt(a,this.cfg.cannonRangeM)*100):0,raking:h}}}const Ma="I do not understand that order, sir.",Nt="One order at a time, sir.";function ge(e,t){return{kind:"error",code:e,message:t}}function ka(e){return e.toLowerCase().replace(/['\u2018\u2019]/g,"").replace(/[^a-z0-9%]+/g," ").trim().replace(/\s+/g," ")}function Ea(e){return Math.max(0,Math.min(1,e))}const Dn={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},_a={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};function Pn(e){const t=e.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/);if(t?.[1]!==void 0)return Number(t[1]);const n=e.split(" ");for(let i=0;i<n.length;i++){const a=n[i],s=Dn[a];if(s!==void 0)return s;const o=_a[a];if(o!==void 0){const r=n[i+1],c=r===void 0?void 0:Dn[r];return o+(c!==void 0&&c<10?c:0)}}return null}function Oe(e,t){return t.some(n=>n.test(e))}function Ta(e){return Oe(e,[/\bstatus(?: report)?\b/,/\breport(?: to me)?\b/,/\bhow (?:are|re) we doing\b/,/\bhow is she doing\b/,/\bwhats (?:our |the )?(?:heading|course|speed|position)\b/,/\bwhats the wind doing\b/,/\b(?:where are we|what is our position)\b/])}function Ra(e){if(/\b(?:hold|cease) (?:your )?fire\b/.test(e)||/\b(?:dont|do not) fire\b/.test(e)||/\bbelay\b/.test(e)&&/\bfire\b/.test(e))return{kind:"acknowledgement",message:"Holding fire, sir."};if(!(/^fire(?:\b|$)/.test(e)||/\b(?:open fire|fire away|fire as she bears|give (?:her|them) a broadside|let (?:them|em) have it)\b/.test(e)||/\b(?:port|larboard|starboard|stbd) (?:guns|battery|broadside)\b/.test(e)))return null;const i=/\b(?:port|larboard)\b/.test(e)?"port":/\b(?:starboard|stbd)\b/.test(e)?"starboard":void 0;return{kind:"intent",intent:i?{action:"fire_guns",side:i}:{action:"fire_guns"}}}function Ca(e){const t=/\b(?:main|mainsail|main sheet)\b/.test(e),n=/\b(?:jib|headsail|jib sheet)\b/.test(e);return t&&n?"all":t?"main":n?"jib":/\b(?:both sheets|the sheets|sheets|all sails?|all sail|all canvas|the sails|sails|everything)\b/.test(e)?"all":null}function Aa(e,t){return e==="main"?t.mainTrim:e==="jib"?t.jibTrim:(t.mainTrim+t.jibTrim)/2}function Da(e,t){const n=Ca(e);if(n===null)return null;const i=Oe(e,[/\bease(?: away| off)?\b/,/\blet (?:the )?.*\bout\b/,/\blet go\b/,/\bslacken\b/,/\bspill(?: .* )?wind\b/,/\bstart (?:the )?(?:sheet|sheets|main|jib)\b/]),a=Oe(e,[/\bhaul(?: in)?\b/,/\bharden(?: up)?\b/,/\btighten(?: up)?\b/,/\bsheet(?:s)? (?:home|in)\b/,/\btrim (?:the )?.*\b(?:in|home)\b/,/\bpull (?:the )?.*\bin\b/,/\bbring (?:the )?.*\bin\b/,/\bmore on\b/,/\btake a pull\b/]),s=/\b(?:trim|set) (?:the )?(?:sails?|canvas|main|mainsail|jib|headsail)\b/.test(e);if(i&&a)return ge("ambiguous",Nt);if(!i&&!a&&!s)return null;const o=e.match(/\b(\d{1,3})\s*(?:percent|%)\b/),r=/\bpercent\b/.test(e)?Pn(e):null,c=o?.[1]===void 0?r:Number(o[1]);if(c!==null&&c>100)return ge("out_of_range","Sail trim must be between zero and one hundred percent, sir.");let d;if(c!==null&&/\b(?:to|at|set)\b/.test(e))d=c/100;else if(/\b(?:all the way|right|hard) in\b/.test(e))d=1;else if(/\b(?:all the way out|let go)\b/.test(e))d=0;else if(!i&&!a)d=st(Math.abs(t.apparentWindAngle));else{const u=c===null?.15:c/100;d=Ea(Aa(n,t)+(a?u:-u))}return{kind:"intent",intent:{action:"trim_sail",sail:n,trim:d}}}function Nn(e,t){const n=Pn(e);return n!==null?n>35?ge("out_of_range","She will not take more than thirty-five degrees of helm, sir."):n:/\b(?:hard(?: over)?|full)\b/.test(e)?35:/\b(?:little|small|bit|touch|point|easy)\b/.test(e)?t.speedKts>=7?5:10:20}function Pa(e){const t="(?:turn|go|come|steer|point(?: us)?|bring (?:us|her)|give me(?: a)?(?: small)? turn|helm|rudder|hard)",n=/\bdegrees?\b/.test(e),i=n&&/\b(?:left|port|larboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:left|port|larboard)\\b|^(?:left|port|larboard)\\b|\\b(?:helm|hard) a port\\b)`).test(e),a=n&&/\b(?:right|starboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:right|starboard)\\b|^(?:right|starboard)\\b|\\b(?:helm|hard) a starboard\\b)`).test(e);return i&&a?"conflict":i?-1:a?1:null}function Na(e,t){if(Oe(e,[/\b(?:centre|center) (?:the )?(?:rudder|helm|home|hem|whole|hull|it)\b/,/\bstraighten(?: up| (?:the )?(?:rudder|helm|home|hem|whole|hull|ship))?\b/,/^(?:steady|midships|amidships)\b/,/\b(?:rudder|helm) amidships\b/,/\bmeet her\b/,/\bease her back to (?:centre|center)\b/]))return{kind:"intent",intent:{action:"helm",degrees:0}};if(Oe(e,[/^(?:okay )+(?:enough|stop)\b/,/^whoa(?: whoa)+$/,/^too much$/,/^(?:no )+stop$/,/^(?:thats )?enough$/,/^easy(?: easy)+$/])&&Math.abs(t.rudderAngle)>2)return{kind:"intent",intent:{action:"helm",degrees:0}};if(/\b(?:other|wrong) way\b/.test(e))return Math.abs(t.rudderAngle)<=2?ge("ambiguous","The helm is already amidships, sir."):{kind:"intent",intent:{action:"helm",degrees:-Math.sign(t.rudderAngle)*Math.min(20,Math.abs(t.rudderAngle))}};const a=Oe(e,[/\bready about\b/,/^(?:come about|tack)\b/,/\b(?:helm|hard) a lee\b/,/\bluff(?: her)?(?: up)?\b/,/\bbring her up\b/,/\bcome up\b/,/\bpoint higher\b/,/\bharden up (?:the )?(?:helm|rudder)\b/]),s=Oe(e,[/\bbear away\b/,/\bbear off\b/,/\bfall (?:off|away)\b/,/\brun off\b/,/\bbear up to leeward\b/]);if(a&&s)return ge("ambiguous",Nt);if(a||s){if(Math.abs(t.apparentWindAngle)<1)return ge("ambiguous","The wind is dead ahead; name a side, sir.");const c=Nn(e,t);if(typeof c!="number")return c;const d=Math.sign(t.apparentWindAngle);return{kind:"intent",intent:{action:"helm",degrees:(a?d:-d)*c}}}const o=Pa(e);if(o==="conflict")return ge("ambiguous","Port or starboard, sir, not both.");if(o!==null){const c=Nn(e,t);return typeof c!="number"?c:{kind:"intent",intent:{action:"helm",degrees:o*c}}}return/\b(?:steer|set|make) (?:a )?(?:course|heading)\b/.test(e)||/\b(?:course|heading) \d{2,3}\b/.test(e)||/^steer \d{2,3}\b/.test(e)||/^steer (?:zero|one|two|three|four|five|six|seven|eight|nine|north|south|east|west)\b/.test(e)?ge("unsupported","Course-keeping is not fitted; order port, starboard, or amidships, sir."):null}function Oa(e,t){const n=ka(e);if(n.length===0)return ge("empty","No order received, sir.");if(/\b(?:dont|do not|belay|cancel)\b/.test(n))return{kind:"acknowledgement",message:"Belay that, sir."};const i=[Ra(n),Da(n,t),Na(n,t),Ta(n)?{kind:"intent",intent:{action:"report_status"}}:null].filter(a=>a!==null);return i.length===0?ge("unknown",Ma):i.length>1?ge("ambiguous",Nt):i[0]}const On=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears. Pass side only when the captain names one ('fire the port guns') — that battery alone fires, wasted if she doesn't bear on it.",parameters:{type:"object",properties:{side:{type:"string",enum:["port","starboard"],description:"Which battery to fire, only when the captain names a side."}}}}}],In=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function Ln(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,a=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof a!="number"||!Number.isFinite(a)||a<0||a>1?null:{action:"trim_sail",sail:i,trim:a}}case"report_status":return{action:"report_status"};case"fire_guns":{const a=(t??{}).side;return a==="port"||a==="starboard"?{action:"fire_guns",side:a}:{action:"fire_guns"}}default:return null}}const Hn={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function Ia(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function zn(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const La=1500;async function Ha(e){try{return await e()}catch(t){if(!zn(t))throw t;return await new Promise(n=>setTimeout(n,La)),e()}}function za(e,t,n){const i=Ia(t);if(i)return Hn[i];const a=n.trim(),o=a.startsWith("<")||/<\/?[a-z][\s\S]*>/i.test(a.slice(0,200))?"":a.slice(0,140);return o.length>0?`${e} (${t}): ${o}`:`${e} (${t})`}const Fa="https://api.openai.com/v1/chat/completions";function Va(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const a=i,s=typeof a.content=="string"?a.content:null,o=[],r=a.tool_calls;if(Array.isArray(r))for(const c of r){if(typeof c!="object"||c===null)continue;const d=c.function;if(typeof d!="object"||d===null)continue;const h=d,u=h.name,f=h.arguments;typeof u!="string"||typeof f!="string"||o.push({name:u,argumentsJson:f})}return{content:s,toolCalls:o}}function Wa(e){try{return JSON.parse(e)}catch{return null}}async function ja(e,t,n,i=ze.voice.intentModel,a=Fa){const s=`${In}

Current ship state:
${JSON.stringify(t)}`,o={"Content-Type":"application/json"};n.length>0&&(o.Authorization=`Bearer ${n}`);let r;try{r=await Ha(()=>fetch(a,{method:"POST",headers:o,body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:On,messages:[{role:"system",content:s},{role:"user",content:e}]})}))}catch(b){throw zn(b)?new Error(Hn.network):b}if(!r.ok){const b=await r.text();throw new Error(za("intent request failed",r.status,b))}const c=await r.json(),d=Va(c);if(d===null)throw new Error("intent request returned an unrecognizable response body");const h=d.toolCalls[0];if(h===void 0)return{crewLine:d.content??"",intent:null};const u=Wa(h.argumentsJson),f=Ln(h.name,u);return f===null?{crewLine:B("unknown_order",t),intent:null}:{crewLine:"",intent:f}}const $a=new Set(["alloy","ash","ballad","coral","echo","sage","shimmer","verse","marin","cedar"]);function Ot(e){return $a.has(e)?e:"marin"}function Ba(){return On.map(({function:e})=>({type:"function",name:e.name,description:e.description,parameters:e.parameters}))}function Ka(e){if(typeof e!="object"||e===null)return[];const t=e.output;if(!Array.isArray(t))return[];const n=[];for(const i of t){if(typeof i!="object"||i===null)continue;const a=i;a.type==="function_call"&&(typeof a.name!="string"||typeof a.call_id!="string"||typeof a.arguments!="string"||n.push({name:a.name,callId:a.call_id,argumentsJson:a.arguments}))}return n}function Ga(e){if(typeof e!="object"||e===null)return null;const t=e.output;if(!Array.isArray(t))return null;for(const n of t){if(typeof n!="object"||n===null)continue;const i=n.content;if(Array.isArray(i))for(const a of i){if(typeof a!="object"||a===null)continue;const s=a,o=typeof s.transcript=="string"?s.transcript.trim():"";if(o)return o;const r=typeof s.text=="string"?s.text.trim():"";if(r)return r}}return null}function Fn(e){return In+`

REALTIME RULES:
- Wait for a tool result before acknowledging an order.
- When a tool result arrives, speak its message exactly once and do not reinterpret it.
- Never claim the ship changed unless the tool result says the order was accepted.
- If speech is unclear or contains conflicting orders, ask for the order again and call no tool.

Current ship state:
`+JSON.stringify(e)}function Ua(e,t){return{type:"session.update",session:{type:"realtime",output_modalities:["audio"],instructions:Fn(e),audio:{input:{transcription:{model:"gpt-4o-mini-transcribe"},turn_detection:{type:"semantic_vad",create_response:!0,interrupt_response:!0}},output:{voice:Ot(t)}},tools:Ba(),tool_choice:"auto"}}}function Ya(e){try{return Ln(e.name,JSON.parse(e.argumentsJson))}catch{return null}}function Ja(e){let t=null,n=null,i=null,a=null,s=!1,o=!1,r=Ot(e.voice??"marin"),c=Math.max(0,Math.min(1,e.volume??.55)),d=!0,h=!1,u=!1,f=!1;const b=new Set;let S=Promise.resolve();function w(v){n?.readyState==="open"&&n.send(JSON.stringify(v))}function C(){a!==null&&(a.volume=c,a.muted=!d)}function R(v,A){w({type:"conversation.item.create",item:{type:"function_call_output",call_id:v,output:JSON.stringify(A)}})}async function _(v){if(v.length===0)return;if(u||(e.onTranscript("Voice order"),u=!0),v.length>1){const x="One order at a time, sir.";for(const m of v)R(m.callId,{ok:!1,message:x});e.onResponseLine(x),e.onSystemNote(x),f=!0,w({type:"response.create"});return}const A=v[0],P=Ya(A);if(P===null){const x="I do not understand that order, sir.";R(A.callId,{ok:!1,message:x}),e.onResponseLine(x),e.onSystemNote(`Realtime returned an invalid ${A.name} call.`),f=!0,w({type:"response.create"});return}const p=await e.submitIntent(P);R(A.callId,{ok:p.ok,message:p.message,state:p.state}),f=!0,w({type:"response.create",response:{instructions:`Speak exactly this crew line: ${JSON.stringify(p.message)}`}})}async function W(v){let A;try{A=JSON.parse(v)}catch{return}switch(A.type){case"input_audio_buffer.speech_started":u=!1,f=!1,w({type:"session.update",session:{instructions:Fn(e.getState())}}),e.onStatus("listening","Hearing order");break;case"conversation.item.input_audio_transcription.completed":{const P=A.transcript?.trim(),p=A.item_id??P;P&&p&&!b.has(p)&&(b.add(p),u=!0,e.onTranscript(P));break}case"response.output_audio.delta":case"response.audio.delta":case"output_audio_buffer.started":h=!0,e.onStatus("speaking","Crew speaking");break;case"output_audio_buffer.stopped":e.onStatus("listening","Listening");break;case"response.done":{const P=Ka(A.response);if(await _(P),P.length===0){const p=Ga(A.response);f?f=!1:p&&e.onResponseLine(p),e.onStatus("listening","Listening")}break}case"error":e.onStatus("error","Realtime session error");break}}function F(v){return v.readyState==="open"?Promise.resolve():new Promise((A,P)=>{const p=window.setTimeout(()=>P(new Error("Realtime data channel timed out.")),1e4);v.addEventListener("open",()=>{window.clearTimeout(p),A()},{once:!0}),v.addEventListener("error",()=>{window.clearTimeout(p),P(new Error("Realtime data channel failed."))},{once:!0})})}function D(){n?.close(),t?.close();for(const v of i?.getTracks()??[])v.stop();a?.remove(),t=null,n=null,i=null,a=null,s=!1,o=!1,h=!1,u=!1,f=!1,b.clear(),e.onStatus("disconnected","Mic disconnected")}async function j(){if(!(s||o)){s=!0,e.onStatus("connecting","Requesting microphone");try{i=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),t=new RTCPeerConnection,a=document.createElement("audio"),a.autoplay=!0,a.hidden=!0,C(),document.body.appendChild(a),t.addEventListener("track",m=>{a&&(a.srcObject=m.streams[0]??new MediaStream([m.track]))}),t.addEventListener("connectionstatechange",()=>{(t?.connectionState==="failed"||t?.connectionState==="disconnected")&&e.onStatus("error","Realtime connection lost")});for(const m of i.getTracks())t.addTrack(m,i);n=t.createDataChannel("oai-events"),n.addEventListener("message",m=>{S=S.then(()=>W(m.data)).catch(y=>{const M=y instanceof Error?y.message:String(y);e.onSystemNote(M)})});const v=await t.createOffer();if(await t.setLocalDescription(v),!v.sdp)throw new Error("Browser did not create a Realtime offer.");const A=e.getTransport?.()??{apiKey:"",endpoint:"/api/realtime/session",direct:!1},P=e.model??"gpt-realtime-mini";let p;if(A.direct){const m=await e.mintClientSecret?.(P);if(!m)throw new Error("No OpenAI key stored — add one under the settings cog.");const y=new FormData;y.set("sdp",v.sdp),y.set("session",JSON.stringify({type:"realtime",model:P})),p=await fetch(A.endpoint,{method:"POST",headers:{Authorization:`Bearer ${m}`},body:y})}else p=await fetch(A.endpoint,{method:"POST",headers:{"Content-Type":"application/sdp"},body:v.sdp});if(!p.ok){const m=(await p.text()).trim();throw new Error(m||`Realtime session failed (${p.status}).`)}const x=await p.text();await t.setRemoteDescription({type:"answer",sdp:x}),await F(n),w(Ua(e.getState(),r)),s=!1,o=!0,e.onStatus("listening","Listening")}catch(v){const A=v instanceof Error?v.message:String(v);throw D(),e.onStatus("error",A),v}}}return{connect:j,disconnect:D,toggle:async()=>{o||s?D():await j()},isConnected:()=>o,setVoice:v=>{const A=Ot(v);if(A!==r&&(r=A,!!o)){if(h){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");return}w({type:"session.update",session:{audio:{output:{voice:r}}}})}},setVolume:v=>{c=Math.max(0,Math.min(1,v)),C()},setAudioEnabled:v=>{d=v,C()}}}const Vn=9.81,Wn=370,qa=.84,Xa=10/12,It=12,jn=.45,Za=2.2,$n=.6,Qa=50,Bn=2,eo=16,Kn=.2,to=.9,no=137.51,io=251.33;function Lt(e){return Math.min(1,Math.max(0,e))}function ao(e){return Math.max(e*Xa,.1)}function oo(e){const t=ao(e),n=Vn*(qa/t)**2;return 2*Math.PI/n}function so(e){const t=Lt(e/40),n=Math.sqrt(t);return Kn+n*(to-Kn)}function ro(e){const t=Lt(e/40);return Bn+t*(eo-Bn)}function lo(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function co(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=oo(n),a=ro(n),s=so(n),o=1+Lt(s)*3,r=t+180,c=[],d=[],h=[];let u=0;for(let S=0;S<It;S++){const w=S/(It-1),C=jn*(Za/jn)**w;c.push(C);const R=Qa*(2*w-1);d.push(R);const _=Math.log(C),W=Math.exp(-(_*_)/(2*$n*$n)),F=R*Math.PI/180,D=Math.max(0,Math.cos(F))**(2*o),j=W*D;h.push(j),j>u&&(u=j)}const f=[],b=u>0?u:1;for(let S=0;S<It;S++){const w=i*c[S],C=2*Math.PI/w,R=Math.sqrt(Vn*C*(1+C*C/(Wn*Wn))),_=lo(r+d[S]),W=a*(h[S]/b),F=S*no,D=S*io,j=-C*(_.x*F+_.z*D);f.push({amplitude:W,wavenumber:C,omega:R,dirX:_.x,dirZ:_.z,phase0:j})}return f}function uo(e,t,n,i){let a=0;for(const s of e){const o=s.wavenumber*(s.dirX*t+s.dirZ*n)-s.omega*i+s.phase0;a+=s.amplitude*Math.cos(o)}return a}const ho=458.7,po=170;function mo(e){return{length:ho*e,beam:po*e}}function go(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],a=[];for(const s of i)a.push({x:-n,z:s}),a.push({x:n,z:s});return a}function fo(e,t,n){const i=Math.cos(n),a=Math.sin(n);return{x:e*i+t*a,z:-e*a+t*i}}function bo(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,a=0,s=0,o=0,r=0,c=0,d=0;const h=e.length;for(let _=0;_<h;_++){const{x:W,z:F}=e[_],D=t[_];n+=W*W,i+=W*F,a+=W,s+=F*F,o+=F,r+=W*D,c+=F*D,d+=D}const u=n*(s*h-o*o)-i*(i*h-o*a)+a*(i*o-s*a);if(Math.abs(u)<1e-9)return{heave:d/h,pitchRad:0,rollRad:0};const f=r*(s*h-o*o)-i*(c*h-o*d)+a*(c*o-s*d),b=n*(c*h-d*o)-r*(i*h-o*a)+a*(i*d-c*a),S=n*(s*d-o*c)-i*(i*d-o*r)+r*(i*o-s*a),w=f/u,C=b/u;return{heave:S/u,pitchRad:Math.atan(-C),rollRad:Math.atan(w)}}function yo(e,t,n,i,a,s){const o=-i*(Math.PI/180),r=mo(a),c=go(r),d=c.map(h=>{const u=fo(h.x,h.z,o);return uo(e,t+u.x,n+u.z,s)});return bo(c,d)}function Ht(e,t,n,i,a){if(a<=0||n<=0)return e;const s=e.position-t,o=e.velocity,r=1e-4;let c,d;if(Math.abs(i-1)<r){const h=Math.exp(-n*a),u=o+n*s;c=(s+u*a)*h,d=h*(o-n*a*u)}else if(i>1){const h=n*Math.sqrt(i*i-1),u=-n*i+h,f=-n*i-h,b=(o-f*s)/(u-f),S=s-b,w=Math.exp(u*a),C=Math.exp(f*a);c=b*w+S*C,d=b*u*w+S*f*C}else{const h=-n*i,u=n*Math.sqrt(1-i*i),f=Math.exp(h*a),b=Math.cos(u*a),S=Math.sin(u*a),w=(o-h*s)/u;c=f*(s*b+w*S),d=h*c+f*u*(-s*S+w*b)}return{position:t+c,velocity:d}}function Gn(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(a,s,o,r,c,d,h,u){const f=yo(h,o,r,c,d,s),b=f.heave*u.heaveScale,S=f.pitchRad*u.pitchScale,w=f.rollRad*u.rollScale;return a>0?(e=Ht(e,b,u.stiffness,u.damping,a),t=Ht(t,S,u.stiffness,u.damping,a),n=Ht(n,w,u.stiffness,u.damping,a)):(e={position:b,velocity:0},t={position:S,velocity:0},n={position:w,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const wo=.514444,De=Math.PI/180,vo=1,xo=512,So=4;function dt(e){return-e*De}function Mo(e){const t=e*De;return{x:Math.sin(t),z:-Math.cos(t)}}function Ve(e,t){return{x:e.x*t,z:-e.y*t}}const Un=18,ko=95,Eo=260;function _o(e,t,n,i,a,s){const o=s*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Eo;e.position.x=t+i.x*o+a.x*r,e.position.z=n+i.z*o+a.z*r,e.position.y=Un+Math.random()*(ko-Un)}function To(e,t,n,i,a,s,o,r){if(e.length===0)return;const c=i+180,d=Mo(c),h={x:-d.x,z:-d.z},u={x:-d.z,z:d.x},f=a*wo*s,b=dt(c),S=o*o;for(const w of e){w.position.x+=d.x*f*r,w.position.z+=d.z*f*r,w.rotation.y=b;const C=w.position.x-t,R=w.position.z-n;C*C+R*R>S&&_o(w,t,n,h,u,o)}}const Ro=1.4,Co=6,Ao=2;function Do(e,t,n,i,a=ze.visuals,s={}){const{camera:o=null,getStreamerNode:r,windStreaks:c=[],getEnemyShipNode:d,muzzleFlash:h=null,splash:u=null,hitFlash:f=null,rangeRing:b=null,cannonRangeM:S=0,getEnemyTiltNode:w}=s;let C=null,R=0,_=0,W=0;const F=Gn(),D=Gn();let j=null,v=[];function A(O,J){const q=`${O}:${J}`;return q!==j&&(v=co({windDirectionDeg:O,windSpeedKts:J}),j=q),v}const P=220,p=450;let x=null,m=null,y=null,M="follow";const te=o!==null?o.fov:null;function L(O){M=O,typeof window<"u"&&(window.__captainViewMode=O),o!==null&&O==="follow"&&te!==null&&(o.fov=te,o.updateProjectionMatrix())}function Y(O,J,q){const{worldUnitsPerMetre:ce,maxHeelDeg:je,maxBraceDeg:nt,heelSmoothingHz:xe,boatScale:X,streakFieldRadius:mt}=a,$=C===null?0:Math.min((O-C)/1e3,.5);C=O;const G=e.getState(),$t=dt(J.headingDeg);t.rotation.y=$t,t.scale.x=X,t.scale.y=X,t.scale.z=X;const{x:$e,z:Be}=Ve(J,ce);t.position.x=$e,t.position.z=Be;const{buoyancy:de}=a,gt=A(G.windDirection,G.windSpeedKts),Pe=O/1e3,Se=F.update($,Pe,$e,Be,J.headingDeg,X,gt,de),Re=n();if(Re!==null){const H=je*Math.tanh(G.apparentWindKts**2*((G.mainTrim+G.jibTrim)/2)*Math.abs(Math.sin(G.apparentWindAngle*De))/xo),ie=Math.sign(G.apparentWindAngle)*H*De,N=$>0?1-Math.exp(-$*xe):0,fe=R+(ie-R)*N,Z=So*De*$,Me=Math.max(-Z,Math.min(Z,fe-R));R+=Me;const Ie=de.enabled?Se.rollRad:0;Re.rotation.z=R+Ie,Re.rotation.x=de.enabled?Se.pitchRad:0;const Ge=de.baseOffsetM*ce;Re.position.y=de.enabled?Se.heave+Ge:0}const Ce=i?i():null;if(Ce!==null){const H=(G.mainTrim+G.jibTrim)/2,ie=Math.sign(G.apparentWindAngle)*H*nt*De,N=$>0?1-Math.exp(-$*vo):0;_+=(ie-_)*N,Ce.rotation.y=_}if(b!==null){const H=a.showCannonRange&&S>0;if(b.visible=H,H){const ie=S*ce;b.position.x=$e,b.position.z=Be,b.scale.x=ie,b.scale.y=1,b.scale.z=ie}}To(c,$e,Be,G.windDirection,G.windSpeedKts,ce,mt,$);const Ke=r?r():null;if(Ke!==null){const H=dt(G.apparentWindAngle+180),ie=$>0?1-Math.exp(-$*Ao):0;let N=H-W;N=(N+Math.PI)%(2*Math.PI)-Math.PI,W+=N*ie;const fe=Co*De*Math.sin(O/1e3*2*Math.PI*Ro);Ke.rotation.y=W+fe}if(o!==null&&M==="helm"){const{helmView:H}=a;o.position.x=H.x,o.position.y=H.y,o.position.z=H.z,o.rotation.x=H.pitchDeg*De,o.rotation.y=0,o.rotation.z=0,o.fov!==H.fov&&(o.fov=H.fov,o.updateProjectionMatrix())}const ue=d?d():null;if(ue!==null)if(q!==null){const H=Ve(q,ce);ue.position.x=H.x,ue.position.z=H.z,ue.rotation.y=dt(q.headingDeg),ue.scale.x=X,ue.scale.y=X,ue.scale.z=X,ue.visible=!0;const ie=w?w():null,N=D.update($,Pe,H.x,H.z,q.headingDeg,X,gt,de);if(ie!==null){const fe=de.baseOffsetM*ce;ie.position.y=de.enabled?N.heave+fe:0,ie.rotation.x=de.enabled?N.pitchRad:0,ie.rotation.z=de.enabled?N.rollRad:0}}else ue.visible=!1;x!==null&&O>=x&&(h!==null&&(h.visible=!1),x=null),m!==null&&O>=m&&(u!==null&&(u.visible=!1),m=null),y!==null&&O>=y&&(f!==null&&(f.visible=!1),y=null)}function ne(){L(M==="follow"?"helm":"follow")}function K(O,J,q){h!==null&&(h.position.x=J,h.position.y=90,h.position.z=q,h.visible=!0,x=O+P)}function me(O,J,q){u!==null&&(u.position.x=J,u.position.y=8,u.position.z=q,u.visible=!0,m=O+P)}function se(O,J,q){f!==null&&(f.position.x=J,f.position.y=55,f.position.z=q,f.visible=!0,y=O+p)}return{update:Y,toggleView:ne,getViewMode:()=>M,triggerMuzzleFlash:K,triggerSplash:me,triggerHitFlash:se}}window.__captainDriverActive=!0;const k=lt();window.__captainAmbientRock=k.visuals.ambientRock,window.__captainReflectionInterval=k.visuals.performance.reflectionInterval;const ve=new Fi({},k),Yn={current:null},he=xi(ve,()=>Yn.current),re=k.battle.enabled?new Sa(k.battle,k.physics,k.controls,{...ve.getPose(),windDirectionDeg:he.getState().windDirection,windSpeedKts:he.getState().windSpeedKts}):null;Yn.current=re;const zt=document.createElement("div");zt.id="hud-root",document.body.appendChild(zt);function Ft(e){Zi(e)}function Ze(e){pn(e)}function Qe(e){Tt(e)}async function Jn(e){if(Ft(e),Vt==="ai"){const n=Ki();try{const i=await ja(e,he.getState(),n.apiKey,k.voice.intentModel,n.endpoint);if(i.intent===null){Ze(null),Qe(i.crewLine);return}await ut(i.intent);return}catch(i){Po(i,n.direct)}}const t=Oa(e,he.getState());if(t.kind==="error")throw Ze(null),Qe(t.message),new Error(t.message);if(t.kind==="acknowledgement"){Ze(null),Qe(t.message);return}await ut(t.intent)}let Vt=hn(k.input.defaultMode),_e=null,qn=!1;function Po(e,t){if(qn)return;qn=!0;const n=e instanceof Error?e.message:String(e);mn(t?`AI parsing failed (${n}). Orders are being parsed locally. Check your OpenAI key under ⚙ — a rejected or exhausted key looks like this.`:`AI parsing unavailable (${n}). Orders are being parsed locally. Add an OpenAI key under ⚙ to use AI Orders.`)}const No=Xi(zt,he,{injectTranscript:Jn,setInputMode:e=>{Vt=e,e!=="realtime"&&_e?.disconnect()},toggleRealtime:()=>{Vt==="realtime"&&_e?.toggle().catch(()=>{})},setCrewAudioEnabled:e=>{_e?.setAudioEnabled(e)},setTtsVoice:e=>{k.voice.ttsVoice=e,_e?.setVoice(e)},setTtsVolume:e=>{k.voice.ttsVolume=e,_e?.setVolume(e)},setMuted:e=>{window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=e?0:k.visuals.ambientSoundVolume),_e?.setVolume(e?0:k.voice.ttsVolume)},getBattleStatus:()=>{if(!re)return null;const e=re.getView();return{guns:mi(e),gunsReadyPct:e.guns.readyPct*100,hull:`${e.playerHullHp}/${ct}`,hullPct:e.playerHullHp/ct*100,enemy:pi(e)}}});async function ut(e){const t=await he.submit(e);if(Qi(e,t.message),e.action==="fire_guns"&&re){const n=re.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),a=ve.getPose(),s=re.getView().npc,o=Ve({x:a.x,y:a.y},k.visuals.worldUnitsPerMetre);if(Te.triggerMuzzleFlash(i,o.x,o.z),n.kind==="hit"||n.kind==="miss"){const r=Ve({x:s.x,y:s.y},k.visuals.worldUnitsPerMetre);n.kind==="hit"?Te.triggerHitFlash(i,r.x,r.z):Te.triggerSplash(i,r.x,r.z)}}}return t}_e=Ja({getState:()=>he.getState(),submitIntent:ut,onTranscript:Ft,onResponseLine:e=>{Ze(null),Qe(e)},onSystemNote:mn,onStatus:ea,voice:k.voice.ttsVoice,volume:k.voice.ttsVolume,getTransport:Ui,mintClientSecret:Gi});const We=document.getElementById("demo");let Wt=!1;function Oo(e){return new Promise(t=>setTimeout(t,e))}const Io=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:4e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function Xn(){if(!Wt){Wt=!0,We&&(We.disabled=!0);try{for(const e of Io){Ft(`[demo] ${e.label}`);const t=await he.submit(e.intent);Ze(e.intent),Qe(t.message),await Oo(e.waitMs)}}finally{Wt=!1,We&&(We.disabled=!1)}}}We&&We.addEventListener("click",()=>{Xn()}),ta();const pe=window.DEMO;if(pe===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const Te=Do(he,pe.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,k.visuals,{camera:pe.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:pe.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:pe.ms_MuzzleFlash,splash:pe.ms_Splash,hitFlash:pe.ms_HitFlash,rangeRing:pe.ms_RangeRing,cannonRangeM:k.battle.enabled?k.battle.cannonRangeM:0}),Zn=10/12,Lo=350,Ho=1400,Qn=1.6,zo=4.4,ei=.2,Fo=.9;function Vo(e){const t=e*Zn,n=9.81,i=.84,a=Math.max(t,.1),s=n*(i/a)**2,o=2*Math.PI/s,r=Math.min(Ho,Math.max(Lo,o*2)),c=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(c),h=Qn+d*(zo-Qn),u=ei+d*(Fo-ei);return{size:r,choppiness:h,directionality:u}}function ti(e){return 1+Math.min(1,Math.max(0,e))*3}function jt(e){ve.setWind(k.environment.windDirectionDeg,k.environment.windSpeedKts);const t=window.DEMO;if(t===void 0)return;const n=(k.environment.windDirectionDeg+180)*Math.PI/180,i=k.environment.windSpeedKts*Zn;if(t.ms_Ocean.windX=Math.sin(n)*i,t.ms_Ocean.windY=-Math.cos(n)*i,k.visuals.seaStateFollowsWind){const a=Vo(k.environment.windSpeedKts);e&&(t.ms_Ocean.size=a.size),t.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=a.choppiness,t.ms_Ocean.directionality=ti(a.directionality)}else e&&(t.ms_Ocean.size=k.visuals.oceanSize);t.ms_Ocean.changed=!0}function ni(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(Ne(k,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),Ne(k,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),Ne(k,"visuals.lighting.sunIntensity",e.sunIntensity),Ne(k,"visuals.lighting.ambientIntensity",e.ambientIntensity),Ne(k,"visuals.lighting.exposure",e.exposure),Ne(k,"visuals.lighting.fogDensity",e.fogDensity))}function Wo(){window.DEMO?.SetLightingParams(k.visuals.lighting)}!(window.location.hash.length>1)&&pe.ms_Environment!==k.environment.skyPreset&&pe.UpdateEnvironment(k.environment.skyPreset),ni(),jt(!0),pe.ms_soundWaves&&(pe.ms_soundWaves.volume=k.visuals.ambientSoundVolume);function jo(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function $o(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Bo(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function Ko(e,t){switch(Ne(k,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.performance.reflectionInterval":window.__captainReflectionInterval=t;break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=ti(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&jt(!1);break;case"visuals.waterColor":{const n=jo(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":$o(t);break;case"visuals.streakOpacity":Bo(t);break;case"voice.ttsVolume":_e?.setVolume(t);break;case"voice.ttsVoice":_e?.setVoice(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":jt(!1);break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),ni();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Wo();break}}na(Ko);const et=document.getElementById("view-toggle");function ii(e){return e==="helm"?"Follow Cam":"Helm View"}function Go(){Te.toggleView(),et&&(et.textContent=ii(Te.getViewMode()))}et&&(et.textContent=ii(Te.getViewMode()),et.addEventListener("click",()=>{Go()}));const tt=document.createElement("div");tt.id="battle-hit-flash",tt.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(tt);let ht=null;const Uo=180;function Yo(){ht!==null&&clearTimeout(ht),tt.style.opacity="0.35",ht=setTimeout(()=>{tt.style.opacity="0",ht=null},Uo)}const ai=15,Jo=250;let pt=null;document.addEventListener("visibilitychange",()=>{document.hidden&&(pt=null)});function oi(e){if(pt!==null){const s=Math.min(e-pt,Jo);if(ve.tick(s),re){const o=ve.getPose(),r=he.getState(),c=re.tick(s,{...o,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(ve.setDriveMultiplier(re.getSpeedMultiplier()),c.some(d=>d.key==="enemy_fires")){const d=re.getView().npc,h=Ve({x:d.x,y:d.y},k.visuals.worldUnitsPerMetre);if(Te.triggerMuzzleFlash(e,h.x,h.z),c.some(u=>u.key==="hit_taken"))Yo();else{const u=d.x-o.x,f=d.y-o.y,b=Math.hypot(u,f)||1,S={x:o.x+u/b*ai,y:o.y+f/b*ai},w=Ve(S,k.visuals.worldUnitsPerMetre);Te.triggerSplash(e,w.x,w.z)}}for(const d of c){const h=B(d.key,r,d);Tt(h)}}}pt=e;const t=ve.getPose(),n={x:t.x,y:t.y,headingDeg:he.getState().heading},i=re?re.getView().npc:null,a=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;Te.update(e,n,a),No.update(),requestAnimationFrame(oi)}requestAnimationFrame(oi),window.__captain={bus:he,submitIntent:ut,injectTranscript:Jn,setWind:(e,t)=>{ve.setWind(e,t)},demo:Xn,getConfig:()=>k,copyConfig:()=>{const e=JSON.stringify(k,null,2);return console.log(e),e},setConfig:e=>{tn(e),location.reload()},resetConfig:()=>{nn(),location.reload()},getPlayerPose:()=>ve.getPose(),get battle(){return re?re.getView():null}}})();
