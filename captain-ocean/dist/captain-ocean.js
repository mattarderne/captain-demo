(function(){"use strict";function Et(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function kt(e){return e.toFixed(1)}function V(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=Et(t.heading),a=kt(t.speedKts),o=Et(t.windDirection),s=kt(t.windSpeedKts);let r=`Steering ${i} at ${a} knots, wind ${o} at ${s}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const On=-35,In=35,Ln=0,Hn=1,zn=1;function Vn(e){return e==="main"||e==="jib"||e==="all"}function be(e,t){return{ok:!1,message:e,state:t}}function pe(e,t){return{ok:!0,message:e,state:t}}function Fn(e,t){function n(a){const o=a.action;if(o==="helm"){const s=a.degrees;if(typeof s!="number"||!Number.isFinite(s)||s<On||s>In)return Promise.resolve(be(V("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:s}).accepted)return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<zn?Promise.resolve(pe(V("no_steerage_way",l),l)):s>0?Promise.resolve(pe(V("helm_ack_starboard",l),l)):s<0?Promise.resolve(pe(V("helm_ack_port",l),l)):Promise.resolve(pe(V("helm_ack_amidships",l),l))}if(o==="trim_sail"){const s=a.sail,r=a.trim;if(!Vn(s))return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<Ln||r>Hn)return Promise.resolve(be(V("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:s,trim:r}).accepted)return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),p=s==="main"?"trim_ack_main":s==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(pe(V(p,d),d))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(pe(V("status",r),r))}if(o==="fire_guns"){const s=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(be(V("no_target",s),s));const l=r.fireGuns();switch(l.kind){case"no_target":return Promise.resolve(be(V("no_target",s),s));case"wasted":return Promise.resolve(pe(V("shot_wasted",s),s));case"reloading":return Promise.resolve(pe(V("guns_reloading",s),s));case"miss":return Promise.resolve(pe(V("player_miss",s),s));case"hit":{const d=l.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(pe(V(d,s,{enemyHullHp:l.enemyHullHp}),s))}default:{const d=l;throw new Error(`unhandled fire outcome: ${String(d)}`)}}}return Promise.resolve(be(V("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const it=1.94384,me=180/Math.PI,B=Math.PI/180;function _t(e){return e*it}function at(e){return e/it}function Se(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function G(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function ye(e,t,n){return e<t?t:e>n?n:e}const Wn=0,jn=12;function Tt(e={}){return{x:0,y:0,psi:G((e.heading??0)*B),u:at(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*B,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:G((e.windDirection??Wn)*B),windSpeedMs:at(e.windSpeedKts??jn)}}const Ve=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Bn=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Kn=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function $n(e,t,n){return e+(t-e)*n}function Rt(e,t){const n=ye(t,0,180);let i=0;for(;i<Ve.length-1&&Ve[i+1]<=n;)i++;const a=Math.min(i+1,Ve.length-1),o=Ve[i],s=Ve[a],r=s===o?0:(n-o)/(s-o);return $n(e[i],e[a],r)}function Gn(e){return{cl:Rt(Bn,e),cd:Rt(Kn,e)}}function Un(e){const t=ye(Math.abs(e),0,180),{cl:n,cd:i}=Gn(t),a=t*B,o=Math.sin(a),s=Math.cos(a),r=n*o-i*s,l=Math.abs(n*s+i*o);return{cDrive:r,cSide:l}}const Ct=.95,Yn=.2;function st(e){const t=ye(Math.abs(e),0,180)/180;return ye(Ct-(Ct-Yn)*t*t,.15,1)}const Xn=.65;function Jn(e,t){const n=(e-st(t))/Xn;return Math.max(0,1-n*n)}const Oe={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:330,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"marin",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6},performance:{oceanQuality:"medium",reflectionInterval:2}},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Ie="captain.config";function Me(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function qn(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function At(e,t,n,i){for(const a of Object.keys(t)){const o=t[a];if(!(a in e)){i.push(`${n}${a} (unknown key)`);continue}const s=e[a];Me(s)&&Me(o)?At(s,o,`${n}${a}.`,i):Me(s)||Me(o)||typeof s!=typeof o?i.push(`${n}${a} (expected ${typeof s}, got ${typeof o})`):e[a]=o}}function Dt(e,t){const n={...e};for(const i of Object.keys(t)){const a=t[i],o=n[i];n[i]=Me(o)&&Me(a)?Dt(o,a):a}return n}function Xe(){return typeof localStorage<"u"}function Qn(){if(!Xe())return{};const e=localStorage.getItem(Ie);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return Me(t)?t:{}}catch{return{}}}function Je(){const e=qn(Oe);if(!Xe())return e;const t=localStorage.getItem(Ie);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Ie}"] is not valid JSON — ignoring it, using defaults.`),e}if(!Me(n))return console.warn(`captain.config: stored value in localStorage["${Ie}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return At(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Pt(e){if(!Xe())return;const t=Qn(),n=Dt(t,e);localStorage.setItem(Ie,JSON.stringify(n))}function Nt(){Xe()&&localStorage.removeItem(Ie)}function Ce(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let o=e;for(let s=0;s<i.length-1;s++){const r=i[s];if(r===void 0||(o=o?.[r],o==null))return}o!=null&&(o[a]=n)}const Zn=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"Legacy STT model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.sttFallbackModel",label:"Legacy STT fallback",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.intentModel",label:"AI Orders intent model",section:"Voice",type:"text",live:!1,note:"Used by the AI Orders input mode. The server may pin its own model on public hosts."},{path:"voice.ttsModel",label:"Legacy TTS model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.ttsVoice",label:"Realtime voice",section:"Voice",type:"select",options:["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],live:!0},{path:"voice.whisperMode",label:"Legacy VAD default",section:"Voice",type:"boolean",live:!1,hidden:!0},{path:"voice.ttsVolume",label:"Realtime voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!1,note:"captain-ocean only. Reload required — live changes visibly rescale the whole ocean."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, choppiness/directionality above are overwritten from wind speed every time wind changes; the ocean wave scale slider only re-derives at boot/reload (see its own note)."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"visuals.performance.oceanQuality",label:"Ocean quality (GPU load)",section:"Performance",type:"select",options:["low","medium","high"],live:!1,note:"captain-ocean only. Reload required — FFT/geometry/cloud resolutions are built once at shell init. High = the original full-resolution ocean; medium ≈ a quarter of high's FFT pixel work."},{path:"visuals.performance.reflectionInterval",label:"Reflection every N frames",section:"Performance",type:"number",min:1,max:4,step:1,live:!0,note:"captain-ocean only. The mirror reflection is a full extra scene render — 2 halves its cost (~30Hz at 60fps) with at most a half-frame reflection lag; 1 = original every-frame behaviour."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],ei=Oe.controls.rudderMaxDeg*B,ti=Oe.physics;function ot(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t,o=-e.windSpeedMs*Math.sin(e.windFromRad),s=-e.windSpeedMs*Math.cos(e.windFromRad),r=o-i,l=s-a,d=Math.hypot(r,l),p=r*t+l*n,u=r*n-l*t;return{awaDeg:Math.atan2(-u,-p)*me,awsMs:d}}function Ot(e,t,n,i,a){const o=Math.abs(n),{cDrive:s,cSide:r}=Un(o),l=Jn(t,o),d=.5*a*i*i,p=d*e*s*l,u=d*e*r*l,m=-Math.sign(n||1)*u;return{surge:p,sway:m}}function It(e,t,n=ti,i=ei,a=1){const{awaDeg:o,awsMs:s}=ot(e),r=Ot(n.areaMain,e.mainTrim,o,s,n.rhoAir),l=Ot(n.areaJib,e.jibTrim,o,s,n.rhoAir),d=(r.surge+l.surge)*a,p=(r.sway+l.sway)*a,u=e.u,m=e.v,y=e.r,v=u>=0?n.kSurgeLin:n.kSurgeLinAstern,g=-n.kSurgeQuad*u*Math.abs(u)-v*u,R=-n.kSwayQuad*m*Math.abs(m)-n.kSwayLin*m,_=ye(e.rudder,-i,i),S=n.cRudder*_*u*Math.abs(u),L=-(n.kYawDamp+n.kYawDampU*Math.abs(u))*y,O=n.cWeather*Math.sin(o*B)*s*Math.min(1,Math.abs(u)),D=S+L+O,H=(d+g)/n.mass+m*y,w=(p+R)/n.mass-u*y,M=D/n.izz;e.u=u+H*t,e.v=m+w*t,e.r=y+M*t;const P=Math.sin(e.psi),h=Math.cos(e.psi),x=e.u*P+e.v*h,f=e.u*h-e.v*P;e.x+=x*t,e.y+=f*t,e.psi=G(e.psi+e.r*t)}function Lt(e){return Math.hypot(e.u,e.v)*it}function ni(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t;return G(Math.atan2(i,a))}function ii(e){return Lt(e)<.2?0:Se(e.psi-ni(e))*me}const Fe=.05,Ht=Fe*1e3;function rt(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class ai{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=Oe){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*B,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*B,this.state=Tt({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=ye(t.degrees*B,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=ye(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Ht;)this.state.rudder=rt(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*Fe),this.state.mainTrim=rt(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Fe),this.state.jibTrim=rt(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Fe),It(this.state,Fe,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=Ht}snapshot(){const{awaDeg:t,awsMs:n}=ot(this.state),i=Lt(this.state);return{heading:this.state.psi*me%360,speedKts:i,windDirection:this.state.windFromRad*me%360,windSpeedKts:_t(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:_t(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*me,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:ii(this.state)}}setWind(t,n){this.state.windFromRad=G(t*B),this.state.windSpeedMs=at(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const si=["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"];function oi(e,t,n){e.innerHTML="",wi();const i=document.createElement("div");i.id="hud",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel hud-state",i.appendChild(a);const o=document.createElement("div");o.className="hud-panel-title",o.textContent="Ship State",a.appendChild(o);function s(c,b,N=!1){const T=document.createElement("div");T.id=c,T.className="hud-row";const j=document.createElement("span");j.className="hud-row-label",j.textContent=b,T.appendChild(j);const ae=document.createElement("span");ae.className="hud-row-colon",ae.textContent=": ",T.appendChild(ae);const se=document.createElement("span");se.className="hud-row-value",se.textContent="--",T.appendChild(se);let q=null;if(N){const he=document.createElement("div");he.className="hud-bar",q=document.createElement("div"),q.className="hud-bar-fill",he.appendChild(q),T.appendChild(he)}return a.appendChild(T),{setValue:he=>{se.textContent=he},setFill:q?he=>{q&&(q.style.width=`${Math.max(0,Math.min(100,he))}%`)}:void 0}}const r=s("hud-heading","heading"),l=s("hud-speed","speed"),d=s("hud-wind","wind"),p=s("hud-awa","awa"),u=s("hud-main","main",!0),m=s("hud-jib","jib",!0),y=s("hud-rudder","rudder"),v="http://www.w3.org/2000/svg";function g(c,b){const N=document.createElementNS(v,c);for(const[T,j]of Object.entries(b))N.setAttribute(T,j);return N}const R=document.getElementById("hud-wind"),_=document.createElement("div");_.id="hud-windvane",_.className="hud-windvane";const S=g("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});S.appendChild(g("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),S.appendChild(g("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const L=g("g",{class:"hud-windvane-arrow"});L.appendChild(g("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),L.appendChild(g("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),S.appendChild(L),S.appendChild(g("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),_.appendChild(S),R.appendChild(_);const O=document.getElementById("hud-rudder"),D=document.createElement("div");D.className="hud-gauge";const H=document.createElement("div");H.className="hud-gauge-center-tick",D.appendChild(H);const w=document.createElement("div");w.className="hud-gauge-target",D.appendChild(w);const M=document.createElement("div");M.className="hud-gauge-needle",D.appendChild(M),O.appendChild(D);let P=null;function h(c){return(Math.max(-35,Math.min(35,c))+35)/70*100}function x(c){const b=h(c);M.style.left=`${b}%`,M.classList.toggle("port",c<-.5),M.classList.toggle("stbd",c>.5),P!==null&&Math.abs(c-P)>.5?(w.style.left=`${h(P)}%`,w.style.display="block"):w.style.display="none"}const f=document.createElement("div");f.id="hud-irons",f.className="hud-irons-row";const E=document.createElement("span");E.className="hud-visually-hidden",E.textContent="irons: false",f.appendChild(E),a.appendChild(f);const C=document.createElement("div");C.className="hud-panel hud-log",i.appendChild(C);const Y=document.createElement("div");Y.className="hud-log-header",C.appendChild(Y);const K=document.createElement("div");K.className="hud-panel-title hud-log-title-text",K.textContent="Quarterdeck Log",Y.appendChild(K);const ie=document.createElement("button");ie.id="command-config-toggle",ie.type="button",ie.title="Command settings",ie.setAttribute("aria-label","Command config"),ie.textContent="⚙",ie.className="hud-btn hud-command-config-toggle",Y.appendChild(ie);const Q=document.createElement("div");Q.id="hud-log-list",Q.className="hud-log-list",C.appendChild(Q);const _e=6,A=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function F(){Q.innerHTML="";let c=-1;A.forEach((b,N)=>{b.kind==="exchange"&&(c=N)}),A.forEach((b,N)=>{const T=document.createElement("div");if(T.style.opacity=String(.45+.55*((N+1)/A.length)),b.kind==="system"){T.className="hud-log-entry hud-log-system-entry";const he=document.createElement("div");he.className="hud-log-system",he.textContent=`⚠ ${b.transcript}`,T.appendChild(he),Q.appendChild(T);return}const j=N===c;T.className="hud-log-entry";const ae=document.createElement("div");ae.className="hud-log-you",j&&(ae.id="hud-transcript"),ae.textContent=`You: ${b.transcript}`,T.appendChild(ae);const se=document.createElement("div");se.className="hud-log-order",j&&(se.id="hud-intent"),se.textContent=b.order,T.appendChild(se);const q=document.createElement("div");q.className="hud-log-crew",j&&(q.id="hud-crew"),q.textContent=`Crew: ${b.crew}`,T.appendChild(q),Q.appendChild(T)}),Q.scrollTop=Q.scrollHeight}F();function X(c){if(c===null)return"→ no order";if(c.action==="helm"){const b=Math.round(c.degrees),N=b<0?"port":b>0?"stbd":"amidships";return`→ helm ${b}° (${N})`}return c.action==="trim_sail"?`→ trim ${c.sail} → ${c.trim.toFixed(2)}`:c.action==="fire_guns"?"→ fire guns":"→ status report"}function De(c){A.push({kind:"exchange",transcript:c,order:"→ …",crew:"…"}),A.length>_e&&A.shift(),F()}function St(c){const b=[...A].reverse().find(N=>N.kind==="exchange");b&&(b.order=X(c)),c!==null&&c.action==="helm"&&(P=c.degrees),F()}function tt(c){const b=[...A].reverse().find(N=>N.kind==="exchange");b&&(b.crew=c),F()}function Mt(c){A.push({kind:"system",transcript:c,order:"",crew:""}),A.length>_e&&A.shift(),F()}const Z=document.createElement("div");Z.className="hud-controls",C.insertBefore(Z,Q);const Te=document.createElement("div");Te.id="input-mode",Te.className="hud-input-mode",Te.setAttribute("role","radiogroup"),Te.setAttribute("aria-label","Command input mode"),Z.appendChild(Te);function ee(c,b,N){const T=document.createElement("label");T.className="hud-input-mode-option",T.dataset.mode=c;const j=document.createElement("input");j.type="radio",j.name="input-mode",j.id=`input-mode-${c}`,j.value=c,T.appendChild(j);const ae=document.createElement("span");ae.className="hud-input-mode-copy";const se=document.createElement("span");se.className="hud-input-mode-name",se.textContent=b;const q=document.createElement("span");return q.className="hud-input-mode-source",q.textContent=N,ae.appendChild(se),ae.appendChild(q),T.appendChild(ae),Te.appendChild(T),{label:T,radio:j}}const $=ee("direct","Direct Orders","LOCAL TEXT"),Ge=ee("ai","AI Orders","GPT TEXT"),Pe=ee("realtime","GPT Realtime","LIVE MIC"),z=document.createElement("input");z.id="transcript-input",z.type="text",z.placeholder="Paste or dictate an order",z.className="hud-input",Z.appendChild(z);const U=document.createElement("div");U.className="hud-button-row",Z.appendChild(U);const W=document.createElement("button");W.id="ptt",W.type="button",W.textContent="Connect Mic",W.className="hud-btn hud-btn-ptt",W.hidden=!0,U.appendChild(W);const de=document.createElement("div");de.id="input-status",de.className="hud-input-status",de.setAttribute("role","status"),de.setAttribute("aria-live","polite"),de.textContent="Ready locally",U.appendChild(de);const ve=document.createElement("button");ve.id="view-toggle",ve.type="button",ve.textContent="Helm View",ve.className="hud-btn hud-btn-view-toggle",U.appendChild(ve);let xe="direct";function fe(c,b="neutral"){de.textContent=c,de.dataset.tone=b}function Re(){return xe!=="realtime"}function J(c,b=!0){xe=c,$.radio.checked=c==="direct",Ge.radio.checked=c==="ai",Pe.radio.checked=c==="realtime",z.disabled=c==="realtime",W.hidden=c!=="realtime",c==="realtime"?(Ne(),z.placeholder="Voice orders arrive here",fe("Mic disconnected")):(z.placeholder="Paste or dictate an order",fe(c==="ai"?"Ready — GPT parses orders":"Ready locally"),window.setTimeout(()=>z.focus(),0)),b&&n.setInputMode(c)}$.radio.addEventListener("change",()=>{$.radio.checked&&J("direct")}),Ge.radio.addEventListener("change",()=>{Ge.radio.checked&&J("ai")}),Pe.radio.addEventListener("change",()=>{Pe.radio.checked&&J("realtime")}),W.addEventListener("click",()=>n.toggleRealtime());function I(){Re()&&z.focus()}const te=Je().input,ne=2;let ue=null;function Ne(){ue!==null&&(clearTimeout(ue),ue=null)}let Ue=!1,ze=null;async function Ye(c){if(!Re())return;if(Ue||(n.isPipelineBusy?.()??!1)){ze=c;return}Ue=!0,Ne();const b=performance.now(),N=xe==="ai";fe(N?"Asking GPT…":"Processing locally");try{await n.injectTranscript(c),z.value="";const T=Math.max(1,Math.round(performance.now()-b));fe(N?`Accepted via GPT in ${T} ms`:`Accepted locally in ${T} ms`,"ok")}catch(T){const j=T instanceof Error?T.message:String(T);tt(j),fe("Order not sent","error")}finally{if(Ue=!1,I(),ze!==null){const T=ze;ze=null,Ye(T)}}}function Rn(c){if(!te.autoSubmit)return;const b=c.trim();b.length<ne||Ye(b)}z.addEventListener("input",c=>{if(!Re()||(Ne(),!te.autoSubmit))return;if(c.inputType==="insertFromPaste"){Rn(z.value);return}z.value.trim().length<ne||(ue=setTimeout(()=>{ue=null,Rn(z.value)},te.autoSubmitDelayMs))}),z.addEventListener("keydown",c=>{if(!Re()||c.key!=="Enter")return;Ne();const b=z.value.trim();b.length!==0&&Ye(b)}),document.addEventListener("click",c=>{const b=c.target;if(b instanceof HTMLCanvasElement){I();return}b instanceof Element&&b.closest("#env-selector")&&I()}),document.addEventListener("keydown",c=>{!Re()||mi(c.target)||c.ctrlKey||c.metaKey||c.altKey||!(c.key.length===1)&&c.key!=="Backspace"||z.focus()},{capture:!0}),J("direct",!1),bi(i,I),yi(C,ie,n,I);function nt(c){return c.toFixed(1)}function Cn(c){return c.toFixed(2)}const ss=["N","NE","E","SE","S","SW","W","NW"];function An(c){return(c%360+360)%360}function Dn(c){const b=Math.round(An(c)/45)%8;return ss[b]??"N"}function Pn(c){return String(Math.round(An(c))%360).padStart(3,"0")}function os(c){return`${Pn(c)} ${Dn(c)}`}function rs(c,b){return`from ${Pn(c)} @ ${nt(b)} kts (${Dn(c)})`}function ls(c,b){const N=Math.round(c);if(N===0)return`dead ahead @ ${nt(b)} kts`;const T=N<0?"port":"starboard";return`${Math.abs(N)}° to ${T} @ ${nt(b)} kts`}function cs(c){const b=Math.round(c),N=b<0?"port":b>0?"stbd":"amidships";return`${b}° ${N}`}function ds(c){r.setValue(os(c.heading)),l.setValue(`${nt(c.speedKts)} kts`),d.setValue(rs(c.windDirection,c.windSpeedKts)),L&&L.setAttribute("transform",`rotate(${c.windDirection-c.heading} 20 20)`),p.setValue(ls(c.apparentWindAngle,c.apparentWindKts)),u.setValue(Cn(c.mainTrim)),u.setFill?.(c.mainTrim*100),m.setValue(Cn(c.jibTrim)),m.setFill?.(c.jibTrim*100),y.setValue(cs(c.rudderAngle)),x(c.rudderAngle),E.textContent=`irons: ${c.inIrons}`,f.classList.toggle("active",c.inIrons)}function Nn(){ds(t.getState())}return Nn(),We={logTranscript:De,logIntent:St,logCrewLine:tt,logSystemNote:Mt},Vt={setInputMode:c=>J(c,!1),setRealtimeState:(c,b)=>{if(W.classList.toggle("listening",c==="listening"),W.classList.toggle("recording",c==="speaking"),W.disabled=c==="connecting",c==="connecting"?W.textContent="Connecting...":c==="listening"||c==="speaking"?W.textContent="Disconnect Mic":c==="error"?W.textContent="Retry Mic":W.textContent="Connect Mic",xe!=="realtime")return;fe(b??{disconnected:"Mic disconnected",connecting:"Connecting to GPT Realtime",listening:"Listening",speaking:"Crew speaking",error:"Realtime unavailable"}[c],c==="error"?"error":"neutral")},setStatus:fe},Ft={focus:I},{update:Nn}}let We=null;function ri(e){We?.logTranscript(e)}function zt(e){We?.logIntent(e)}function lt(e){We?.logCrewLine(e)}function li(e){We?.logSystemNote(e)}function ci(e,t){zt(e),lt(t)}let Vt=null;function di(e,t){Vt?.setRealtimeState(e,t)}let Ft=null;function ui(){Ft?.focus()}let Wt=[];function hi(e){Wt.push(e)}function pi(e,t){for(const n of Wt)n(e,t)}function mi(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function gi(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function fi(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let o=e;for(let s=0;s<i.length-1;s++){const r=i[s];if(r===void 0)return;const l=o[r];(typeof l!="object"||l===null)&&(o[r]={}),o=o[r]}o[a]=n}function jt(e,t){const n={...e};for(const i of Object.keys(t)){const a=e[i],o=t[i];a!==null&&typeof a=="object"&&!Array.isArray(a)&&o!==null&&typeof o=="object"&&!Array.isArray(o)?n[i]=jt(a,o):n[i]=o}return n}function bi(e,t){const n=Je(),i={};let a=!1;const o=new Map,s=document.createElement("button");s.id="settings-toggle",s.type="button",s.title="Settings",s.setAttribute("aria-label","Settings"),s.textContent="⚙",s.className="hud-btn hud-settings-toggle",e.appendChild(s);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);function p(){d.hidden=!a}function u(h,x){if(fi(i,h.path,x),h.live)pi(h.path,x);else{const f=o.get(h.path);f&&(f.hidden=!1),a=!0,p()}}function m(h,x){const f=document.createElement("div");f.className="hud-settings-control-row";const E=document.createElement("input");E.type="range",E.min=String(h.min??0),E.max=String(h.max??100),E.step=String(h.step??1),E.value=String(x),E.className="hud-settings-range";const C=document.createElement("input");C.type="number",C.min=E.min,C.max=E.max,C.step=E.step,C.value=String(x),C.className="hud-settings-numeric";const Y=h.min??-1/0,K=h.max??1/0;function ie(Q){if(!Number.isFinite(Q))return;const _e=Math.min(K,Math.max(Y,Q));E.value=String(_e),C.value=String(_e),u(h,_e)}return E.addEventListener("input",()=>ie(Number(E.value))),C.addEventListener("input",()=>ie(Number(C.value))),f.appendChild(E),f.appendChild(C),f}function y(h,x){const f=document.createElement("label");f.className="hud-settings-checkbox-label";const E=document.createElement("input");return E.type="checkbox",E.checked=x,E.addEventListener("change",()=>u(h,E.checked)),f.appendChild(E),f}function v(h,x){const f=document.createElement("select");f.className="hud-settings-select";for(const E of h.options??[]){const C=document.createElement("option");C.value=E,C.textContent=E,E===x&&(C.selected=!0),f.appendChild(C)}return f.addEventListener("change",()=>u(h,f.value)),f}function g(h,x){const f=document.createElement("input");return f.type="color",f.className="hud-settings-color",f.value=x,f.addEventListener("input",()=>u(h,f.value)),f}function R(h,x){const f=document.createElement("input");return f.type="text",f.className="hud-settings-text",f.value=x,f.addEventListener("change",()=>u(h,f.value)),f}function _(h){const x=document.createElement("div");x.className="hud-settings-field",x.dataset.configPath=h.path;const f=document.createElement("div");f.className="hud-settings-label-row";const E=document.createElement("span");if(E.className="hud-settings-label",E.textContent=h.label,f.appendChild(E),!h.live){const K=document.createElement("span");K.className="hud-settings-reload-dot",K.title="Staged — needs Save & Reload",K.hidden=!0,f.appendChild(K),o.set(h.path,K)}x.appendChild(f);const C=gi(n,h.path);let Y;switch(h.type){case"number":Y=m(h,C);break;case"boolean":Y=y(h,C);break;case"select":Y=v(h,C);break;case"color":Y=g(h,C);break;default:Y=R(h,C);break}if(x.appendChild(Y),h.note){const K=document.createElement("div");K.className="hud-settings-note",K.textContent=h.note,x.appendChild(K)}return x}const S=new Map;for(const h of Zn)h.hidden||(S.has(h.section)||S.set(h.section,[]),S.get(h.section)?.push(h));const L=new Set(["Visuals","Environment","Lighting"]);for(const[h,x]of S){const f=document.createElement("details");f.className="hud-settings-section",f.open=L.has(h);const E=document.createElement("summary");E.textContent=h,f.appendChild(E);for(const C of x)f.appendChild(_(C));r.appendChild(f)}const O=document.createElement("div");O.className="hud-settings-footer";const D=document.createElement("button");D.id="settings-save-reload",D.type="button",D.textContent="Save & Reload",D.className="hud-btn",D.addEventListener("click",()=>{Pt(i),location.reload()});const H=document.createElement("button");H.id="settings-copy-json",H.type="button",H.textContent="Copy JSON",H.className="hud-btn",H.addEventListener("click",()=>{(async()=>{const h=jt(n,i),x=JSON.stringify(h,null,2);console.log(x);try{await navigator.clipboard?.writeText(x)}catch{}})()});const w=document.createElement("button");w.id="settings-reset-all",w.type="button",w.textContent="Reset All",w.className="hud-btn",w.addEventListener("click",()=>{Nt(),location.reload()}),O.appendChild(D),O.appendChild(H),O.appendChild(w),r.appendChild(O);let M=!1;function P(h){M=h,r.classList.toggle("open",h),s.classList.toggle("active",h),h||t()}s.addEventListener("click",()=>P(!M))}function yi(e,t,n,i){const a=Je(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function s(_){const S=document.createElement("div");return S.className="hud-command-config-section-title",S.textContent=_,S}o.appendChild(s("Realtime Voice"));const r=document.createElement("div");r.className="hud-command-config-row";const l=document.createElement("label");l.className="hud-toggle-label";const d=document.createElement("input");d.id="tts-enabled",d.type="checkbox",d.checked=!0,d.addEventListener("change",()=>n.setCrewAudioEnabled(d.checked)),l.appendChild(d),l.appendChild(document.createTextNode("Hear crew replies")),r.appendChild(l);const p=document.createElement("select");p.id="tts-voice-select",p.className="hud-settings-select hud-command-config-voice-select";for(const _ of si){const S=document.createElement("option");S.value=_,S.textContent=_,_===a.voice.ttsVoice&&(S.selected=!0),p.appendChild(S)}p.addEventListener("change",()=>n.setTtsVoice(p.value)),r.appendChild(p),o.appendChild(r);const u=document.createElement("div");u.className="hud-command-config-row";const m=document.createElement("span");m.className="hud-command-config-volume-label",m.textContent="Volume",u.appendChild(m);const y=document.createElement("input");y.id="tts-volume",y.type="range",y.min="0",y.max="1",y.step="0.05",y.value=String(a.voice.ttsVolume),y.className="hud-settings-range",y.addEventListener("input",()=>n.setTtsVolume(Number(y.value))),u.appendChild(y),o.appendChild(u),o.appendChild(s("Actions"));const v=document.createElement("button");v.id="demo",v.type="button",v.textContent="Run Demo",v.className="hud-btn hud-btn-demo hud-command-config-demo",o.appendChild(v);let g=!1;function R(_){g=_,o.classList.toggle("open",g),t.classList.toggle("active",g),g||i()}t.addEventListener("click",()=>R(!g)),document.addEventListener("mousedown",_=>{if(!g)return;const S=_.target;o.contains(S)||t.contains(S)||R(!1)}),document.addEventListener("keydown",_=>{_.key==="Escape"&&g&&R(!1)})}function wi(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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

.hud-input-mode {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 4px;
  overflow: hidden;
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
  border-left: 1px solid rgba(255, 255, 255, 0.2);
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
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.08em;
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
`,document.head.appendChild(e)}const ct=.05,Bt=ct*1e3,vi=35,xi=40,dt=50,Kt=15,Si=8;function ut(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Mi{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=Tt({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*B,this.rudderRateRadPerS=t.rudderSlewDegPerS*B,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=G(t*B),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",G(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,a=Math.hypot(n,i),o=G(Math.atan2(n,i));a>this.engageRangeM*1.15?this.behavior="APPROACH":a<this.engageRangeM*.85&&(this.behavior="ENGAGE");let s;if(this.behavior==="APPROACH")s=o;else{const d=(a>this.engageRangeM?1:-1)*15*B;s=G(t.headingRad+d)}const r=Se(this.state.windFromRad-s)*me;if(this.tackSide!==null){this.tackHoldS-=ct;const l=Math.abs(r)>=xi;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=Si){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=Kt)}}}else if(Math.abs(r)<vi){const l=G(this.state.windFromRad-dt*B),d=G(this.state.windFromRad+dt*B),p=Math.abs(Se(l-this.state.psi)),u=Math.abs(Se(d-this.state.psi));this.tackSide=p<=u?1:-1,this.tackHoldS=Kt}return this.tackSide!==null?G(this.state.windFromRad-this.tackSide*dt*B):s}step(t,n){const i=this.planHeading(n),a=Se(i-this.state.psi);this.rudderTargetRad=ye(this.headingKp*a-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:o}=ot(this.state),s=st(Math.abs(o));this.mainTrimTarget=s,this.jibTrimTarget=s,this.state.rudder=ut(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=ut(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=ut(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),It(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Bt;)this.step(ct,n),this.accMs-=Bt}headingDeg(){return this.state.psi*me%360}}const Ei=30;function $t(){return{reloadRemainingS:0}}function Gt(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function Ut(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function Yt(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=Ei,ready:e.reloadRemainingS<=0}}function ki(e,t,n,i,a,o){Ut(e,t);const s=Yt(e,n,i,a);return!s.inRange||!s.inArc||!s.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=a.reloadS,{fired:!0,hit:o()<Gt(n,a.cannonRangeM)})}function _i(e,t,n,i,a){const o=Yt(e,t,n,i);if(!o.ready)return{fired:!1,hit:!1,...o};e.reloadRemainingS=i.reloadS;const s=a();return{fired:!0,hit:o.inRange&&o.inArc&&s<Gt(t,i.cannonRangeM),...o}}const Xt=10,Ti=5,Ri=.8,Ci=.5;function Jt(){return{hullHp:Xt}}function qt(e){e.hullHp=Math.max(0,e.hullHp-1)}function Ai(e){return e.hullHp<=0?Ci:e.hullHp<=Ti?Ri:1}function Qt(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Di=35;function Pi(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class Ni{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,a){this.cfg=t,this.rng=Qt(t.seed),this.playerRng=Qt(t.seed+1),this.lastPlayerPose=a;const o=ye(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*o);const s=1.2+.6*o,r=this.rng()*2*Math.PI,l=a.x+t.spawnRangeM*Math.sin(r),d=a.y+t.spawnRangeM*Math.cos(r),p=G(r+Math.PI);this.npc=new Mi({x:l,y:d,heading:p*me,windDirection:a.windDirectionDeg,windSpeedKts:a.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Di,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:s,phys:n}),this.damage=Jt(),this.cannon=$t(),this.playerCannon=$t(),this.enemyDamage=Jt()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,Ut(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});const a=n.x-this.npc.x,o=n.y-this.npc.y,s=Math.hypot(a,o);if(!this.everSpotted&&s<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=G(Math.atan2(-a,-o)),d=Se(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:d})}if(!this.everClosing&&s<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=G(Math.atan2(a,o)),l=Se(r-this.npc.state.psi)*me,d=Math.min(Math.abs(l-90),Math.abs(l+90)),p=ki(this.cannon,t/1e3,s,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);p.fired&&(i.push({key:"enemy_fires"}),p.hit&&(qt(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp})))}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(){const t=this.resolveFireGuns();return this.lastPlayerFireOutcome=t,t}resolveFireGuns(){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),o=G(Math.atan2(-n,-i)),s=Se(o-t.headingRad)*me,r=Math.min(Math.abs(s-90),Math.abs(s+90)),l=_i(this.playerCannon,a,r,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);return l.fired?!l.inRange||!l.inArc?{kind:"wasted"}:l.hit?(qt(this.enemyDamage),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=Xt/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})):{kind:"miss"}:{kind:"reloading"}}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return Ai(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:Pi(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck}}}const Oi="I do not understand that order, sir.",ht="One order at a time, sir.";function le(e,t){return{kind:"error",code:e,message:t}}function Ii(e){return e.toLowerCase().replace(/['\u2018\u2019]/g,"").replace(/[^a-z0-9%]+/g," ").trim().replace(/\s+/g," ")}function Li(e){return Math.max(0,Math.min(1,e))}const Zt={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},Hi={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};function en(e){const t=e.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/);if(t?.[1]!==void 0)return Number(t[1]);const n=e.split(" ");for(let i=0;i<n.length;i++){const a=n[i],o=Zt[a];if(o!==void 0)return o;const s=Hi[a];if(s!==void 0){const r=n[i+1],l=r===void 0?void 0:Zt[r];return s+(l!==void 0&&l<10?l:0)}}return null}function Ae(e,t){return t.some(n=>n.test(e))}function zi(e){return Ae(e,[/\bstatus(?: report)?\b/,/\breport(?: to me)?\b/,/\bhow (?:are|re) we doing\b/,/\bhow is she doing\b/,/\bwhats (?:our |the )?(?:heading|course|speed|position)\b/,/\bwhats the wind doing\b/,/\b(?:where are we|what is our position)\b/])}function Vi(e){return/\b(?:hold|cease) (?:your )?fire\b/.test(e)||/\b(?:dont|do not) fire\b/.test(e)||/\bbelay\b/.test(e)&&/\bfire\b/.test(e)?{kind:"acknowledgement",message:"Holding fire, sir."}:/^fire(?:\b|$)/.test(e)||/\b(?:open fire|fire away|fire as she bears|give (?:her|them) a broadside|let (?:them|em) have it)\b/.test(e)?{kind:"intent",intent:{action:"fire_guns"}}:null}function Fi(e){const t=/\b(?:main|mainsail|main sheet)\b/.test(e),n=/\b(?:jib|headsail|jib sheet)\b/.test(e);return t&&n?"all":t?"main":n?"jib":/\b(?:both sheets|the sheets|sheets|all sails?|all sail|all canvas|the sails|sails|everything)\b/.test(e)?"all":null}function Wi(e,t){return e==="main"?t.mainTrim:e==="jib"?t.jibTrim:(t.mainTrim+t.jibTrim)/2}function ji(e,t){const n=Fi(e);if(n===null)return null;const i=Ae(e,[/\bease(?: away| off)?\b/,/\blet (?:the )?.*\bout\b/,/\blet go\b/,/\bslacken\b/,/\bspill(?: .* )?wind\b/,/\bstart (?:the )?(?:sheet|sheets|main|jib)\b/]),a=Ae(e,[/\bhaul(?: in)?\b/,/\bharden(?: up)?\b/,/\btighten(?: up)?\b/,/\bsheet(?:s)? (?:home|in)\b/,/\btrim (?:the )?.*\b(?:in|home)\b/,/\bpull (?:the )?.*\bin\b/,/\bbring (?:the )?.*\bin\b/,/\bmore on\b/,/\btake a pull\b/]),o=/\b(?:trim|set) (?:the )?(?:sails?|canvas|main|mainsail|jib|headsail)\b/.test(e);if(i&&a)return le("ambiguous",ht);if(!i&&!a&&!o)return null;const s=e.match(/\b(\d{1,3})\s*(?:percent|%)\b/),r=/\bpercent\b/.test(e)?en(e):null,l=s?.[1]===void 0?r:Number(s[1]);if(l!==null&&l>100)return le("out_of_range","Sail trim must be between zero and one hundred percent, sir.");let d;if(l!==null&&/\b(?:to|at|set)\b/.test(e))d=l/100;else if(/\b(?:all the way|right|hard) in\b/.test(e))d=1;else if(/\b(?:all the way out|let go)\b/.test(e))d=0;else if(!i&&!a)d=st(Math.abs(t.apparentWindAngle));else{const u=l===null?.15:l/100;d=Li(Wi(n,t)+(a?u:-u))}return{kind:"intent",intent:{action:"trim_sail",sail:n,trim:d}}}function tn(e,t){const n=en(e);return n!==null?n>35?le("out_of_range","She will not take more than thirty-five degrees of helm, sir."):n:/\b(?:hard(?: over)?|full)\b/.test(e)?35:/\b(?:little|small|bit|touch|point|easy)\b/.test(e)?t.speedKts>=7?5:10:20}function Bi(e){const t="(?:turn|go|come|steer|point(?: us)?|bring (?:us|her)|give me(?: a)?(?: small)? turn|helm|rudder|hard)",n=/\bdegrees?\b/.test(e),i=n&&/\b(?:left|port|larboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:left|port|larboard)\\b|^(?:left|port|larboard)\\b|\\b(?:helm|hard) a port\\b)`).test(e),a=n&&/\b(?:right|starboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:right|starboard)\\b|^(?:right|starboard)\\b|\\b(?:helm|hard) a starboard\\b)`).test(e);return i&&a?"conflict":i?-1:a?1:null}function Ki(e,t){if(Ae(e,[/\b(?:centre|center) (?:the )?(?:rudder|helm|home|hem|whole|hull|it)\b/,/\bstraighten(?: up| (?:the )?(?:rudder|helm|home|hem|whole|hull|ship))?\b/,/^(?:steady|midships|amidships)\b/,/\b(?:rudder|helm) amidships\b/,/\bmeet her\b/,/\bease her back to (?:centre|center)\b/]))return{kind:"intent",intent:{action:"helm",degrees:0}};if(Ae(e,[/^(?:okay )+(?:enough|stop)\b/,/^whoa(?: whoa)+$/,/^too much$/,/^(?:no )+stop$/,/^(?:thats )?enough$/,/^easy(?: easy)+$/])&&Math.abs(t.rudderAngle)>2)return{kind:"intent",intent:{action:"helm",degrees:0}};if(/\b(?:other|wrong) way\b/.test(e))return Math.abs(t.rudderAngle)<=2?le("ambiguous","The helm is already amidships, sir."):{kind:"intent",intent:{action:"helm",degrees:-Math.sign(t.rudderAngle)*Math.min(20,Math.abs(t.rudderAngle))}};const a=Ae(e,[/\bready about\b/,/^(?:come about|tack)\b/,/\b(?:helm|hard) a lee\b/,/\bluff(?: her)?(?: up)?\b/,/\bbring her up\b/,/\bcome up\b/,/\bpoint higher\b/,/\bharden up (?:the )?(?:helm|rudder)\b/]),o=Ae(e,[/\bbear away\b/,/\bbear off\b/,/\bfall (?:off|away)\b/,/\brun off\b/,/\bbear up to leeward\b/]);if(a&&o)return le("ambiguous",ht);if(a||o){if(Math.abs(t.apparentWindAngle)<1)return le("ambiguous","The wind is dead ahead; name a side, sir.");const l=tn(e,t);if(typeof l!="number")return l;const d=Math.sign(t.apparentWindAngle);return{kind:"intent",intent:{action:"helm",degrees:(a?d:-d)*l}}}const s=Bi(e);if(s==="conflict")return le("ambiguous","Port or starboard, sir, not both.");if(s!==null){const l=tn(e,t);return typeof l!="number"?l:{kind:"intent",intent:{action:"helm",degrees:s*l}}}return/\b(?:steer|set|make) (?:a )?(?:course|heading)\b/.test(e)||/\b(?:course|heading) \d{2,3}\b/.test(e)||/^steer \d{2,3}\b/.test(e)||/^steer (?:zero|one|two|three|four|five|six|seven|eight|nine|north|south|east|west)\b/.test(e)?le("unsupported","Course-keeping is not fitted; order port, starboard, or amidships, sir."):null}function $i(e,t){const n=Ii(e);if(n.length===0)return le("empty","No order received, sir.");if(/\b(?:dont|do not|belay|cancel)\b/.test(n))return{kind:"acknowledgement",message:"Belay that, sir."};const i=[Vi(n),ji(n,t),Ki(n,t),zi(n)?{kind:"intent",intent:{action:"report_status"}}:null].filter(a=>a!==null);return i.length===0?le("unknown",Oi):i.length>1?le("ambiguous",ht):i[0]}const nn=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears.",parameters:{type:"object",properties:{}}}}],an=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function sn(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,a=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof a!="number"||!Number.isFinite(a)||a<0||a>1?null:{action:"trim_sail",sail:i,trim:a}}case"report_status":return{action:"report_status"};case"fire_guns":return{action:"fire_guns"};default:return null}}const on={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function Gi(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function rn(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Ui=1500;async function Yi(e){try{return await e()}catch(t){if(!rn(t))throw t;return await new Promise(n=>setTimeout(n,Ui)),e()}}function Xi(e,t,n){const i=Gi(t);return i?on[i]:`${e} (${t}): ${n}`}const Ji="https://api.openai.com/v1/chat/completions";function qi(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const a=i,o=typeof a.content=="string"?a.content:null,s=[],r=a.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const d=l.function;if(typeof d!="object"||d===null)continue;const p=d,u=p.name,m=p.arguments;typeof u!="string"||typeof m!="string"||s.push({name:u,argumentsJson:m})}return{content:o,toolCalls:s}}function Qi(e){try{return JSON.parse(e)}catch{return null}}async function Zi(e,t,n,i=Oe.voice.intentModel,a=Ji){const o=`${an}

Current ship state:
${JSON.stringify(t)}`,s={"Content-Type":"application/json"};n.length>0&&(s.Authorization=`Bearer ${n}`);let r;try{r=await Yi(()=>fetch(a,{method:"POST",headers:s,body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:nn,messages:[{role:"system",content:o},{role:"user",content:e}]})}))}catch(y){throw rn(y)?new Error(on.network):y}if(!r.ok){const y=await r.text();throw new Error(Xi("intent request failed",r.status,y))}const l=await r.json(),d=qi(l);if(d===null)throw new Error("intent request returned an unrecognizable response body");const p=d.toolCalls[0];if(p===void 0)return{crewLine:d.content??"",intent:null};const u=Qi(p.argumentsJson),m=sn(p.name,u);return m===null?{crewLine:V("unknown_order",t),intent:null}:{crewLine:"",intent:m}}const ea=new Set(["alloy","ash","ballad","coral","echo","sage","shimmer","verse","marin","cedar"]);function pt(e){return ea.has(e)?e:"marin"}function ta(){return nn.map(({function:e})=>({type:"function",name:e.name,description:e.description,parameters:e.parameters}))}function na(e){if(typeof e!="object"||e===null)return[];const t=e.output;if(!Array.isArray(t))return[];const n=[];for(const i of t){if(typeof i!="object"||i===null)continue;const a=i;a.type==="function_call"&&(typeof a.name!="string"||typeof a.call_id!="string"||typeof a.arguments!="string"||n.push({name:a.name,callId:a.call_id,argumentsJson:a.arguments}))}return n}function ia(e){if(typeof e!="object"||e===null)return null;const t=e.output;if(!Array.isArray(t))return null;for(const n of t){if(typeof n!="object"||n===null)continue;const i=n.content;if(Array.isArray(i))for(const a of i){if(typeof a!="object"||a===null)continue;const o=a,s=typeof o.transcript=="string"?o.transcript.trim():"";if(s)return s;const r=typeof o.text=="string"?o.text.trim():"";if(r)return r}}return null}function ln(e){return an+`

REALTIME RULES:
- Wait for a tool result before acknowledging an order.
- When a tool result arrives, speak its message exactly once and do not reinterpret it.
- Never claim the ship changed unless the tool result says the order was accepted.
- If speech is unclear or contains conflicting orders, ask for the order again and call no tool.

Current ship state:
`+JSON.stringify(e)}function aa(e,t){return{type:"session.update",session:{type:"realtime",output_modalities:["audio"],instructions:ln(e),audio:{input:{transcription:{model:"gpt-4o-mini-transcribe"},turn_detection:{type:"semantic_vad",create_response:!0,interrupt_response:!0}},output:{voice:pt(t)}},tools:ta(),tool_choice:"auto"}}}function sa(e){try{return sn(e.name,JSON.parse(e.argumentsJson))}catch{return null}}function oa(e){let t=null,n=null,i=null,a=null,o=!1,s=!1,r=pt(e.voice??"marin"),l=Math.max(0,Math.min(1,e.volume??.55)),d=!0,p=!1,u=!1,m=!1;const y=new Set;let v=Promise.resolve();function g(w){n?.readyState==="open"&&n.send(JSON.stringify(w))}function R(){a!==null&&(a.volume=l,a.muted=!d)}function _(w,M){g({type:"conversation.item.create",item:{type:"function_call_output",call_id:w,output:JSON.stringify(M)}})}async function S(w){if(w.length===0)return;if(u||(e.onTranscript("Voice order"),u=!0),w.length>1){const x="One order at a time, sir.";for(const f of w)_(f.callId,{ok:!1,message:x});e.onResponseLine(x),e.onSystemNote(x),m=!0,g({type:"response.create"});return}const M=w[0],P=sa(M);if(P===null){const x="I do not understand that order, sir.";_(M.callId,{ok:!1,message:x}),e.onResponseLine(x),e.onSystemNote(`Realtime returned an invalid ${M.name} call.`),m=!0,g({type:"response.create"});return}const h=await e.submitIntent(P);_(M.callId,{ok:h.ok,message:h.message,state:h.state}),m=!0,g({type:"response.create",response:{instructions:`Speak exactly this crew line: ${JSON.stringify(h.message)}`}})}async function L(w){let M;try{M=JSON.parse(w)}catch{return}switch(M.type){case"input_audio_buffer.speech_started":u=!1,m=!1,g({type:"session.update",session:{instructions:ln(e.getState())}}),e.onStatus("listening","Hearing order");break;case"conversation.item.input_audio_transcription.completed":{const P=M.transcript?.trim(),h=M.item_id??P;P&&h&&!y.has(h)&&(y.add(h),u=!0,e.onTranscript(P));break}case"response.output_audio.delta":case"response.audio.delta":case"output_audio_buffer.started":p=!0,e.onStatus("speaking","Crew speaking");break;case"output_audio_buffer.stopped":e.onStatus("listening","Listening");break;case"response.done":{const P=na(M.response);if(await S(P),P.length===0){const h=ia(M.response);m?m=!1:h&&e.onResponseLine(h),e.onStatus("listening","Listening")}break}case"error":e.onStatus("error","Realtime session error");break}}function O(w){return w.readyState==="open"?Promise.resolve():new Promise((M,P)=>{const h=window.setTimeout(()=>P(new Error("Realtime data channel timed out.")),1e4);w.addEventListener("open",()=>{window.clearTimeout(h),M()},{once:!0}),w.addEventListener("error",()=>{window.clearTimeout(h),P(new Error("Realtime data channel failed."))},{once:!0})})}function D(){n?.close(),t?.close();for(const w of i?.getTracks()??[])w.stop();a?.remove(),t=null,n=null,i=null,a=null,o=!1,s=!1,p=!1,u=!1,m=!1,y.clear(),e.onStatus("disconnected","Mic disconnected")}async function H(){if(!(o||s)){o=!0,e.onStatus("connecting","Requesting microphone");try{i=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),t=new RTCPeerConnection,a=document.createElement("audio"),a.autoplay=!0,a.hidden=!0,R(),document.body.appendChild(a),t.addEventListener("track",h=>{a&&(a.srcObject=h.streams[0]??new MediaStream([h.track]))}),t.addEventListener("connectionstatechange",()=>{(t?.connectionState==="failed"||t?.connectionState==="disconnected")&&e.onStatus("error","Realtime connection lost")});for(const h of i.getTracks())t.addTrack(h,i);n=t.createDataChannel("oai-events"),n.addEventListener("message",h=>{v=v.then(()=>L(h.data)).catch(x=>{const f=x instanceof Error?x.message:String(x);e.onSystemNote(f)})});const w=await t.createOffer();if(await t.setLocalDescription(w),!w.sdp)throw new Error("Browser did not create a Realtime offer.");const M=await fetch(e.endpoint??"/api/realtime/session",{method:"POST",headers:{"Content-Type":"application/sdp"},body:w.sdp});if(!M.ok){const h=(await M.text()).trim();throw new Error(h||`Realtime session failed (${M.status}).`)}const P=await M.text();await t.setRemoteDescription({type:"answer",sdp:P}),await O(n),g(aa(e.getState(),r)),o=!1,s=!0,e.onStatus("listening","Listening")}catch(w){const M=w instanceof Error?w.message:String(w);throw D(),e.onStatus("error",M),w}}}return{connect:H,disconnect:D,toggle:async()=>{s||o?D():await H()},isConnected:()=>s,setVoice:w=>{const M=pt(w);if(M!==r&&(r=M,!!s)){if(p){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");return}g({type:"session.update",session:{audio:{output:{voice:r}}}})}},setVolume:w=>{l=Math.max(0,Math.min(1,w)),R()},setAudioEnabled:w=>{d=w,R()}}}const cn=9.81,dn=370,ra=.84,la=10/12,mt=12,un=.45,ca=2.2,hn=.6,da=50,pn=2,ua=16,mn=.2,ha=.9,pa=137.51,ma=251.33;function gt(e){return Math.min(1,Math.max(0,e))}function ga(e){return Math.max(e*la,.1)}function fa(e){const t=ga(e),n=cn*(ra/t)**2;return 2*Math.PI/n}function ba(e){const t=gt(e/40),n=Math.sqrt(t);return mn+n*(ha-mn)}function ya(e){const t=gt(e/40);return pn+t*(ua-pn)}function wa(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function va(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=fa(n),a=ya(n),o=ba(n),s=1+gt(o)*3,r=t+180,l=[],d=[],p=[];let u=0;for(let v=0;v<mt;v++){const g=v/(mt-1),R=un*(ca/un)**g;l.push(R);const _=da*(2*g-1);d.push(_);const S=Math.log(R),L=Math.exp(-(S*S)/(2*hn*hn)),O=_*Math.PI/180,D=Math.max(0,Math.cos(O))**(2*s),H=L*D;p.push(H),H>u&&(u=H)}const m=[],y=u>0?u:1;for(let v=0;v<mt;v++){const g=i*l[v],R=2*Math.PI/g,_=Math.sqrt(cn*R*(1+R*R/(dn*dn))),S=wa(r+d[v]),L=a*(p[v]/y),O=v*pa,D=v*ma,H=-R*(S.x*O+S.z*D);m.push({amplitude:L,wavenumber:R,omega:_,dirX:S.x,dirZ:S.z,phase0:H})}return m}function xa(e,t,n,i){let a=0;for(const o of e){const s=o.wavenumber*(o.dirX*t+o.dirZ*n)-o.omega*i+o.phase0;a+=o.amplitude*Math.cos(s)}return a}const Sa=458.7,Ma=170;function Ea(e){return{length:Sa*e,beam:Ma*e}}function ka(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],a=[];for(const o of i)a.push({x:-n,z:o}),a.push({x:n,z:o});return a}function _a(e,t,n){const i=Math.cos(n),a=Math.sin(n);return{x:e*i+t*a,z:-e*a+t*i}}function Ta(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,a=0,o=0,s=0,r=0,l=0,d=0;const p=e.length;for(let S=0;S<p;S++){const{x:L,z:O}=e[S],D=t[S];n+=L*L,i+=L*O,a+=L,o+=O*O,s+=O,r+=L*D,l+=O*D,d+=D}const u=n*(o*p-s*s)-i*(i*p-s*a)+a*(i*s-o*a);if(Math.abs(u)<1e-9)return{heave:d/p,pitchRad:0,rollRad:0};const m=r*(o*p-s*s)-i*(l*p-s*d)+a*(l*s-o*d),y=n*(l*p-d*s)-r*(i*p-s*a)+a*(i*d-l*a),v=n*(o*d-s*l)-i*(i*d-s*r)+r*(i*s-o*a),g=m/u,R=y/u;return{heave:v/u,pitchRad:Math.atan(-R),rollRad:Math.atan(g)}}function Ra(e,t,n,i,a,o){const s=-i*(Math.PI/180),r=Ea(a),l=ka(r),d=l.map(p=>{const u=_a(p.x,p.z,s);return xa(e,t+u.x,n+u.z,o)});return Ta(l,d)}function ft(e,t,n,i,a){if(a<=0||n<=0)return e;const o=e.position-t,s=e.velocity,r=1e-4;let l,d;if(Math.abs(i-1)<r){const p=Math.exp(-n*a),u=s+n*o;l=(o+u*a)*p,d=p*(s-n*a*u)}else if(i>1){const p=n*Math.sqrt(i*i-1),u=-n*i+p,m=-n*i-p,y=(s-m*o)/(u-m),v=o-y,g=Math.exp(u*a),R=Math.exp(m*a);l=y*g+v*R,d=y*u*g+v*m*R}else{const p=-n*i,u=n*Math.sqrt(1-i*i),m=Math.exp(p*a),y=Math.cos(u*a),v=Math.sin(u*a),g=(s-p*o)/u;l=m*(o*y+g*v),d=p*l+m*u*(-o*v+g*y)}return{position:t+l,velocity:d}}function gn(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(a,o,s,r,l,d,p,u){const m=Ra(p,s,r,l,d,o),y=m.heave*u.heaveScale,v=m.pitchRad*u.pitchScale,g=m.rollRad*u.rollScale;return a>0?(e=ft(e,y,u.stiffness,u.damping,a),t=ft(t,v,u.stiffness,u.damping,a),n=ft(n,g,u.stiffness,u.damping,a)):(e={position:y,velocity:0},t={position:v,velocity:0},n={position:g,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const Ca=.514444,Ee=Math.PI/180,Aa=1,Da=512,Pa=4;function qe(e){return-e*Ee}function Na(e){const t=e*Ee;return{x:Math.sin(t),z:-Math.cos(t)}}function Le(e,t){return{x:e.x*t,z:-e.y*t}}const fn=18,Oa=95,Ia=260;function La(e,t,n,i,a,o){const s=o*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Ia;e.position.x=t+i.x*s+a.x*r,e.position.z=n+i.z*s+a.z*r,e.position.y=fn+Math.random()*(Oa-fn)}function Ha(e,t,n,i,a,o,s,r){if(e.length===0)return;const l=i+180,d=Na(l),p={x:-d.x,z:-d.z},u={x:-d.z,z:d.x},m=a*Ca*o,y=qe(l),v=s*s;for(const g of e){g.position.x+=d.x*m*r,g.position.z+=d.z*m*r,g.rotation.y=y;const R=g.position.x-t,_=g.position.z-n;R*R+_*_>v&&La(g,t,n,p,u,s)}}const za=1.4,Va=6,Fa=2;function Wa(e,t,n,i,a=Oe.visuals,o={}){const{camera:s=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:d,muzzleFlash:p=null,splash:u=null,hitFlash:m=null,getEnemyTiltNode:y}=o;let v=null,g=0,R=0,_=0;const S=gn(),L=gn();let O=null,D=[];function H(A,F){const X=`${A}:${F}`;return X!==O&&(D=va({windDirectionDeg:A,windSpeedKts:F}),O=X),D}const w=220,M=450;let P=null,h=null,x=null,f="follow";const E=s!==null?s.fov:null;function C(A){f=A,typeof window<"u"&&(window.__captainViewMode=A),s!==null&&A==="follow"&&E!==null&&(s.fov=E,s.updateProjectionMatrix())}function Y(A,F,X){const{worldUnitsPerMetre:De,maxHeelDeg:St,maxBraceDeg:tt,heelSmoothingHz:Mt,boatScale:Z,streakFieldRadius:Te}=a,ee=v===null?0:Math.min((A-v)/1e3,.5);v=A;const $=e.getState(),Ge=qe(F.headingDeg);t.rotation.y=Ge,t.scale.x=Z,t.scale.y=Z,t.scale.z=Z;const{x:Pe,z}=Le(F,De);t.position.x=Pe,t.position.z=z;const{buoyancy:U}=a,W=H($.windDirection,$.windSpeedKts),de=A/1e3,ve=S.update(ee,de,Pe,z,F.headingDeg,Z,W,U),xe=n();if(xe!==null){const I=St*Math.tanh($.apparentWindKts**2*(($.mainTrim+$.jibTrim)/2)*Math.abs(Math.sin($.apparentWindAngle*Ee))/Da),te=Math.sign($.apparentWindAngle)*I*Ee,ne=ee>0?1-Math.exp(-ee*Mt):0,ue=g+(te-g)*ne,Ne=Pa*Ee*ee,Ue=Math.max(-Ne,Math.min(Ne,ue-g));g+=Ue;const ze=U.enabled?ve.rollRad:0;xe.rotation.z=g+ze,xe.rotation.x=U.enabled?ve.pitchRad:0;const Ye=U.baseOffsetM*De;xe.position.y=U.enabled?ve.heave+Ye:0}const fe=i?i():null;if(fe!==null){const I=($.mainTrim+$.jibTrim)/2,te=Math.sign($.apparentWindAngle)*I*tt*Ee,ne=ee>0?1-Math.exp(-ee*Aa):0;R+=(te-R)*ne,fe.rotation.y=R}Ha(l,Pe,z,$.windDirection,$.windSpeedKts,De,Te,ee);const Re=r?r():null;if(Re!==null){const I=qe($.apparentWindAngle+180),te=ee>0?1-Math.exp(-ee*Fa):0;let ne=I-_;ne=(ne+Math.PI)%(2*Math.PI)-Math.PI,_+=ne*te;const ue=Va*Ee*Math.sin(A/1e3*2*Math.PI*za);Re.rotation.y=_+ue}if(s!==null&&f==="helm"){const{helmView:I}=a;s.position.x=I.x,s.position.y=I.y,s.position.z=I.z,s.rotation.x=I.pitchDeg*Ee,s.rotation.y=0,s.rotation.z=0,s.fov!==I.fov&&(s.fov=I.fov,s.updateProjectionMatrix())}const J=d?d():null;if(J!==null)if(X!==null){const I=Le(X,De);J.position.x=I.x,J.position.z=I.z,J.rotation.y=qe(X.headingDeg),J.scale.x=Z,J.scale.y=Z,J.scale.z=Z,J.visible=!0;const te=y?y():null,ne=L.update(ee,de,I.x,I.z,X.headingDeg,Z,W,U);if(te!==null){const ue=U.baseOffsetM*De;te.position.y=U.enabled?ne.heave+ue:0,te.rotation.x=U.enabled?ne.pitchRad:0,te.rotation.z=U.enabled?ne.rollRad:0}}else J.visible=!1;P!==null&&A>=P&&(p!==null&&(p.visible=!1),P=null),h!==null&&A>=h&&(u!==null&&(u.visible=!1),h=null),x!==null&&A>=x&&(m!==null&&(m.visible=!1),x=null)}function K(){C(f==="follow"?"helm":"follow")}function ie(A,F,X){p!==null&&(p.position.x=F,p.position.y=90,p.position.z=X,p.visible=!0,P=A+w)}function Q(A,F,X){u!==null&&(u.position.x=F,u.position.y=8,u.position.z=X,u.visible=!0,h=A+w)}function _e(A,F,X){m!==null&&(m.position.x=F,m.position.y=55,m.position.z=X,m.visible=!0,x=A+M)}return{update:Y,toggleView:K,getViewMode:()=>f,triggerMuzzleFlash:ie,triggerSplash:Q,triggerHitFlash:_e}}window.__captainDriverActive=!0;const k=Je();window.__captainAmbientRock=k.visuals.ambientRock,window.__captainReflectionInterval=k.visuals.performance.reflectionInterval;const ge=new ai({},k),bn={current:null},oe=Fn(ge,()=>bn.current),re=k.battle.enabled?new Ni(k.battle,k.physics,k.controls,{...ge.getPose(),windDirectionDeg:oe.getState().windDirection,windSpeedKts:oe.getState().windSpeedKts}):null;bn.current=re;const bt=document.createElement("div");bt.id="hud-root",document.body.appendChild(bt);function yt(e){ri(e)}function je(e){zt(e)}function Be(e){lt(e)}async function yn(e){if(yt(e),wt==="ai"){const n=await Zi(e,oe.getState(),"",k.voice.intentModel,"/api/intent/parse");if(n.intent===null){je(null),Be(n.crewLine);return}await Qe(n.intent);return}const t=$i(e,oe.getState());if(t.kind==="error")throw je(null),Be(t.message),new Error(t.message);if(t.kind==="acknowledgement"){je(null),Be(t.message);return}await Qe(t.intent)}let wt="direct",ke=null;const ja=oi(bt,oe,{injectTranscript:yn,setInputMode:e=>{wt=e,e!=="realtime"&&ke?.disconnect()},toggleRealtime:()=>{wt==="realtime"&&ke?.toggle().catch(()=>{})},setCrewAudioEnabled:e=>{ke?.setAudioEnabled(e)},setTtsVoice:e=>{k.voice.ttsVoice=e,ke?.setVoice(e)},setTtsVolume:e=>{k.voice.ttsVolume=e,ke?.setVolume(e)}});async function Qe(e){const t=await oe.submit(e);if(ci(e,t.message),e.action==="fire_guns"&&re){const n=re.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),a=ge.getPose(),o=re.getView().npc,s=Le({x:a.x,y:a.y},k.visuals.worldUnitsPerMetre);if(we.triggerMuzzleFlash(i,s.x,s.z),n.kind==="hit"||n.kind==="miss"){const r=Le({x:o.x,y:o.y},k.visuals.worldUnitsPerMetre);n.kind==="hit"?we.triggerHitFlash(i,r.x,r.z):we.triggerSplash(i,r.x,r.z)}}}return t}ke=oa({getState:()=>oe.getState(),submitIntent:Qe,onTranscript:yt,onResponseLine:e=>{je(null),Be(e)},onSystemNote:li,onStatus:di,voice:k.voice.ttsVoice,volume:k.voice.ttsVolume});const He=document.getElementById("demo");let vt=!1;function Ba(e){return new Promise(t=>setTimeout(t,e))}const Ka=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function wn(){if(!vt){vt=!0,He&&(He.disabled=!0);try{for(const e of Ka){yt(`[demo] ${e.label}`);const t=await oe.submit(e.intent);je(e.intent),Be(t.message),await Ba(e.waitMs)}}finally{vt=!1,He&&(He.disabled=!1)}}}He&&He.addEventListener("click",()=>{wn()}),ui();const ce=window.DEMO;if(ce===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const we=Wa(oe,ce.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,k.visuals,{camera:ce.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:ce.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:ce.ms_MuzzleFlash,splash:ce.ms_Splash,hitFlash:ce.ms_HitFlash}),vn=10/12,$a=350,Ga=1400,xn=1.6,Ua=4.4,Sn=.2,Ya=.9;function Xa(e){const t=e*vn,n=9.81,i=.84,a=Math.max(t,.1),o=n*(i/a)**2,s=2*Math.PI/o,r=Math.min(Ga,Math.max($a,s*2)),l=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(l),p=xn+d*(Ua-xn),u=Sn+d*(Ya-Sn);return{size:r,choppiness:p,directionality:u}}function Mn(e){return 1+Math.min(1,Math.max(0,e))*3}function xt(e){ge.setWind(k.environment.windDirectionDeg,k.environment.windSpeedKts);const t=window.DEMO;if(t===void 0)return;const n=(k.environment.windDirectionDeg+180)*Math.PI/180,i=k.environment.windSpeedKts*vn;if(t.ms_Ocean.windX=Math.sin(n)*i,t.ms_Ocean.windY=-Math.cos(n)*i,k.visuals.seaStateFollowsWind){const a=Xa(k.environment.windSpeedKts);e&&(t.ms_Ocean.size=a.size),t.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=a.choppiness,t.ms_Ocean.directionality=Mn(a.directionality)}else e&&(t.ms_Ocean.size=k.visuals.oceanSize);t.ms_Ocean.changed=!0}function En(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(Ce(k,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),Ce(k,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),Ce(k,"visuals.lighting.sunIntensity",e.sunIntensity),Ce(k,"visuals.lighting.ambientIntensity",e.ambientIntensity),Ce(k,"visuals.lighting.exposure",e.exposure),Ce(k,"visuals.lighting.fogDensity",e.fogDensity))}function Ja(){window.DEMO?.SetLightingParams(k.visuals.lighting)}!(window.location.hash.length>1)&&ce.ms_Environment!==k.environment.skyPreset&&ce.UpdateEnvironment(k.environment.skyPreset),En(),xt(!0),ce.ms_soundWaves&&(ce.ms_soundWaves.volume=k.visuals.ambientSoundVolume);function qa(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function Qa(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Za(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function es(e,t){switch(Ce(k,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.performance.reflectionInterval":window.__captainReflectionInterval=t;break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=Mn(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&xt(!1);break;case"visuals.waterColor":{const n=qa(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":Qa(t);break;case"visuals.streakOpacity":Za(t);break;case"voice.ttsVolume":ke?.setVolume(t);break;case"voice.ttsVoice":ke?.setVoice(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":xt(!1);break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),En();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Ja();break}}hi(es);const Ke=document.getElementById("view-toggle");function kn(e){return e==="helm"?"Follow Cam":"Helm View"}function ts(){we.toggleView(),Ke&&(Ke.textContent=kn(we.getViewMode()))}Ke&&(Ke.textContent=kn(we.getViewMode()),Ke.addEventListener("click",()=>{ts()}));const $e=document.createElement("div");$e.id="battle-hit-flash",$e.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild($e);let Ze=null;const ns=180;function is(){Ze!==null&&clearTimeout(Ze),$e.style.opacity="0.35",Ze=setTimeout(()=>{$e.style.opacity="0",Ze=null},ns)}const _n=15,as=250;let et=null;document.addEventListener("visibilitychange",()=>{document.hidden&&(et=null)});function Tn(e){if(et!==null){const o=Math.min(e-et,as);if(ge.tick(o),re){const s=ge.getPose(),r=oe.getState(),l=re.tick(o,{...s,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(ge.setDriveMultiplier(re.getSpeedMultiplier()),l.some(d=>d.key==="enemy_fires")){const d=re.getView().npc,p=Le({x:d.x,y:d.y},k.visuals.worldUnitsPerMetre);if(we.triggerMuzzleFlash(e,p.x,p.z),l.some(u=>u.key==="hit_taken"))is();else{const u=d.x-s.x,m=d.y-s.y,y=Math.hypot(u,m)||1,v={x:s.x+u/y*_n,y:s.y+m/y*_n},g=Le(v,k.visuals.worldUnitsPerMetre);we.triggerSplash(e,g.x,g.z)}}for(const d of l){const p=V(d.key,r,d);lt(p)}}}et=e;const t=ge.getPose(),n={x:t.x,y:t.y,headingDeg:oe.getState().heading},i=re?re.getView().npc:null,a=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;we.update(e,n,a),ja.update(),requestAnimationFrame(Tn)}requestAnimationFrame(Tn),window.__captain={bus:oe,submitIntent:Qe,injectTranscript:yn,setWind:(e,t)=>{ge.setWind(e,t)},demo:wn,getConfig:()=>k,copyConfig:()=>{const e=JSON.stringify(k,null,2);return console.log(e),e},setConfig:e=>{Pt(e),location.reload()},resetConfig:()=>{Nt(),location.reload()},getPlayerPose:()=>ge.getPose(),get battle(){return re?re.getView():null}}})();
