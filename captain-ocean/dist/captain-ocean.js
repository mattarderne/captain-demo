(function(){"use strict";function ki(e){if(e.enemyStruck)return"struck her colours — dead in the water";const t=e.npc,n={APPROACH:"closing",ENGAGE:"engaging",FLEE:"fleeing",STRUCK:"struck"},i=t.rudderDeg>.5?"S":t.rudderDeg<-.5?"P":"",a=i===""?"rudder 0°":`rudder ${Math.abs(Math.round(t.rudderDeg))}°${i}`,s=(t.mainTrim+t.jibTrim)/2;return`${n[t.behavior]??t.behavior.toLowerCase()} — ${Ct(t.speedKts)} kts, trim ${s.toFixed(2)}, ${a}, hull ${e.enemyHullHp}/10`}function Mi(e){if(e.enemyStruck)return"she's struck her colours — battle won";const t=e.guns,n=`${Math.round(t.rangeM)} m`;if(t.readyInS>0)return`reloading… ${Math.ceil(t.readyInS)} s`;if(!t.inRange)return`ready — out of range (${n})`;if(!t.inArc)return`ready — she doesn't bear (bring her abeam, ${n})`;const i=t.raking?", raking — 2× damage!":"";return`ready — she bears, ${n}, ~${t.hitChancePct}% to hit${i}`}function sn(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function Ct(e){return e.toFixed(1)}function L(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=sn(t.heading),a=Ct(t.speedKts),s=sn(t.windDirection),o=Ct(t.windSpeedKts);let r=`Steering ${i} at ${a} knots, wind ${s} at ${o}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"tack_ack":return"Ready about! Helm's a-lee!";case"tack_no_way":return"She's no way on her, sir — we'd be caught in stays.";case"tack_through":return"Through the wind, sir — she's full on the new board.";case"tack_in_irons":return"She's in irons, sir — we must bear away and try again.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Ei=-35,_i=35,Ti=0,Ri=1,Ci=1;function Ai(e){return e==="main"||e==="jib"||e==="all"}function Ee(e,t){return{ok:!1,message:e,state:t}}function be(e,t){return{ok:!0,message:e,state:t}}function Di(e,t){function n(a){const s=a.action;if(s==="helm"){const o=a.degrees;if(typeof o!="number"||!Number.isFinite(o)||o<Ei||o>_i)return Promise.resolve(Ee(L("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:o}).accepted)return Promise.resolve(Ee(L("unknown_order",e.snapshot()),e.snapshot()));const c=e.snapshot();return c.speedKts<Ci?Promise.resolve(be(L("no_steerage_way",c),c)):o>0?Promise.resolve(be(L("helm_ack_starboard",c),c)):o<0?Promise.resolve(be(L("helm_ack_port",c),c)):Promise.resolve(be(L("helm_ack_amidships",c),c))}if(s==="trim_sail"){const o=a.sail,r=a.trim;if(!Ai(o))return Promise.resolve(Ee(L("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<Ti||r>Ri)return Promise.resolve(Ee(L("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:o,trim:r}).accepted)return Promise.resolve(Ee(L("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),u=o==="main"?"trim_ack_main":o==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(be(L(u,d),d))}if(s==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(Ee(L("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(be(L("status",r),r))}if(s==="tack"){const o=e.apply({action:"tack"}),r=e.snapshot();return o.accepted?Promise.resolve(be(L("tack_ack",r),r)):Promise.resolve(Ee(L("tack_no_way",r),r))}if(s==="fire_guns"){const o=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(Ee(L("no_target",o),o));const c=a.side,d=c==="port"||c==="starboard"?c:void 0,u=r.fireGuns(d);switch(u.kind){case"no_target":return Promise.resolve(Ee(L("no_target",o),o));case"wasted":return Promise.resolve(be(L("shot_wasted",o),o));case"reloading":return Promise.resolve(be(L("guns_reloading",o),o));case"miss":return Promise.resolve(be(L("player_miss",o),o));case"hit":{const h=u.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(be(L(h,o,{enemyHullHp:u.enemyHullHp}),o))}default:{const h=u;throw new Error(`unhandled fire outcome: ${String(h)}`)}}}return Promise.resolve(Ee(L("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const At=1.94384,oe=180/Math.PI,Z=Math.PI/180;function rn(e){return e*At}function Dt(e){return e/At}function _e(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function q(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function Te(e,t,n){return e<t?t:e>n?n:e}const Pi=0,Ni=12;function ln(e={}){return{x:0,y:0,psi:q((e.heading??0)*Z),u:Dt(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*Z,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:q((e.windDirection??Pi)*Z),windSpeedMs:Dt(e.windSpeedKts??Ni)}}const et=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Oi=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Ii=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function Li(e,t,n){return e+(t-e)*n}function cn(e,t){const n=Te(t,0,180);let i=0;for(;i<et.length-1&&et[i+1]<=n;)i++;const a=Math.min(i+1,et.length-1),s=et[i],o=et[a],r=o===s?0:(n-s)/(o-s);return Li(e[i],e[a],r)}function Hi(e){return{cl:cn(Oi,e),cd:cn(Ii,e)}}function zi(e){const t=Te(Math.abs(e),0,180),{cl:n,cd:i}=Hi(t),a=t*Z,s=Math.sin(a),o=Math.cos(a),r=n*s-i*o,c=Math.abs(n*o+i*s);return{cDrive:r,cSide:c}}const dn=.95,Fi=.2;function tt(e){const t=Te(Math.abs(e),0,180)/180;return Te(dn-(dn-Fi)*t*t,.15,1)}const Vi=.65;function Wi(e,t){const n=(e-tt(t))/Vi;return Math.max(0,1-n*n)}const $e={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:330,cWeather:0},controls:{rudderSlewDegPerS:4,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"marin",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3,defaultMode:"ai"},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6},performance:{oceanQuality:"medium",reflectionInterval:2},windRoseMode:"wind-up",showCannonRange:!0},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Ke="captain.config";function Pe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ji(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function un(e,t,n,i){for(const a of Object.keys(t)){const s=t[a];if(!(a in e)){i.push(`${n}${a} (unknown key)`);continue}const o=e[a];Pe(o)&&Pe(s)?un(o,s,`${n}${a}.`,i):Pe(o)||Pe(s)||typeof o!=typeof s?i.push(`${n}${a} (expected ${typeof o}, got ${typeof s})`):e[a]=s}}function hn(e,t){const n={...e};for(const i of Object.keys(t)){const a=t[i],s=n[i];n[i]=Pe(s)&&Pe(a)?hn(s,a):a}return n}function mt(){return typeof localStorage<"u"}function $i(){if(!mt())return{};const e=localStorage.getItem(Ke);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return Pe(t)?t:{}}catch{return{}}}function nt(){const e=ji($e);if(!mt())return e;const t=localStorage.getItem(Ke);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Ke}"] is not valid JSON — ignoring it, using defaults.`),e}if(!Pe(n))return console.warn(`captain.config: stored value in localStorage["${Ke}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return un(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Pt(e){if(!mt())return;const t=$i(),n=hn(t,e);localStorage.setItem(Ke,JSON.stringify(n))}function pn(){mt()&&localStorage.removeItem(Ke)}function He(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0||(s=s?.[r],s==null))return}s!=null&&(s[a]=n)}const Ki=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"Legacy STT model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.sttFallbackModel",label:"Legacy STT fallback",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.intentModel",label:"AI Orders intent model",section:"Voice",type:"text",live:!1,note:"Used by the AI Orders input mode. The server may pin its own model on public hosts."},{path:"voice.ttsModel",label:"Legacy TTS model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.ttsVoice",label:"Realtime voice",section:"Voice",type:"select",options:["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],live:!0},{path:"voice.whisperMode",label:"Legacy VAD default",section:"Voice",type:"boolean",live:!1,hidden:!0},{path:"voice.ttsVolume",label:"Realtime voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"input.defaultMode",label:"Boot input mode",section:"Input",type:"select",options:["ai","direct","realtime"],live:!1,note:"Which order-input mode the app starts in. AI falls back to the local parser when no server is available."},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!1,note:"captain-ocean only. Reload required — live changes visibly rescale the whole ocean."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, choppiness/directionality above are overwritten from wind speed every time wind changes; the ocean wave scale slider only re-derives at boot/reload (see its own note)."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.windRoseMode",label:"Wind rose orientation",section:"Visuals",type:"select",options:["wind-up","north-up","bow-up"],live:!0,note:"Click the rose itself to cycle. Wind-up pins the wind at the top; north-up is the chart convention; bow-up fixes the ship."},{path:"visuals.showCannonRange",label:"Show cannon range ring",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Circle on the water at cannon range around your ship."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"visuals.performance.oceanQuality",label:"Ocean quality (GPU load)",section:"Performance",type:"select",options:["low","medium","high"],live:!1,note:"captain-ocean only. Reload required — FFT/geometry/cloud resolutions are built once at shell init. High = the original full-resolution ocean; medium ≈ a quarter of high's FFT pixel work."},{path:"visuals.performance.reflectionInterval",label:"Reflection every N frames",section:"Performance",type:"number",min:1,max:4,step:1,live:!0,note:"captain-ocean only. The mirror reflection is a full extra scene render — 2 halves its cost (~30Hz at 60fps) with at most a half-frame reflection lag; 1 = original every-frame behaviour."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],Bi=$e.controls.rudderMaxDeg*Z,Gi=$e.physics;function Be(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),o=-e.windSpeedMs*Math.cos(e.windFromRad),r=s-i,c=o-a,d=Math.hypot(r,c),u=r*t+c*n,h=r*n-c*t;return{awaDeg:Math.atan2(-h,-u)*oe,awsMs:d}}function mn(e,t,n,i,a){const s=Math.abs(n),{cDrive:o,cSide:r}=zi(s),c=Wi(t,s),d=.5*a*i*i,u=d*e*o*c,h=d*e*r*c,g=-Math.sign(n||1)*h;return{surge:u,sway:g}}function gn(e,t,n=Gi,i=Bi,a=1,s=0){const{awaDeg:o,awsMs:r}=Be(e),c=mn(n.areaMain,e.mainTrim,o,r,n.rhoAir),d=mn(n.areaJib,e.jibTrim,o,r,n.rhoAir),u=(c.surge+d.surge)*a,h=(c.sway+d.sway)*a,g=e.u,b=e.v,v=e.r,w=g>=0?n.kSurgeLin:n.kSurgeLinAstern,R=-n.kSurgeQuad*g*Math.abs(g)-w*g,C=-n.kSwayQuad*b*Math.abs(b)-n.kSwayLin*b,_=Te(e.rudder,-i,i),V=n.cRudder*_*g*Math.abs(g),z=-(n.kYawDamp+n.kYawDampU*Math.abs(g))*v,A=n.cWeather*Math.sin(o*Z)*r*Math.min(1,Math.abs(g)),W=V+z+A+s,S=(u+R)/n.mass+b*v,D=(h+C)/n.mass-g*v,P=W/n.izz;e.u=g+S*t,e.v=b+D*t,e.r=v+P*t;const p=Math.sin(e.psi),x=Math.cos(e.psi),m=e.u*p+e.v*x,y=e.u*x-e.v*p;e.x+=m*t,e.y+=y*t,e.psi=q(e.psi+e.r*t)}function Nt(e){return Math.hypot(e.u,e.v)*At}function Ui(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t;return q(Math.atan2(i,a))}function Yi(e){return Nt(e)<.2?0:_e(e.psi-Ui(e))*oe}const Ge=.05,fn=Ge*1e3;function Ot(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}const Ji=1.5,qi=500,bn=45,Xi=90,Zi=30;class Qi{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;tack=null;tackEvent=null;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=$e){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*Z,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*Z,this.state=ln({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.tack=null,this.rudderTargetRad=Te(t.degrees*Z,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{this.tack=null;const n=Te(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"tack":{if(Nt(this.state)<Ji)return{accepted:!1,reason:"no_way"};const{awaDeg:n}=Be(this.state);return this.tack={dir:n<0?-1:1,turnedDeg:0,elapsedS:0,throughEye:!1},this.tackEvent=null,{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=fn;){const n=this.stepTack(Ge);this.state.rudder=Ot(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*Ge),this.state.mainTrim=Ot(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Ge),this.state.jibTrim=Ot(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Ge),gn(this.state,Ge,this.physics,this.rudderMaxRad,this.driveMultiplier,n),this.accMs-=fn}}stepTack(t){const n=this.tack;if(n===null)return 0;n.elapsedS+=t;const{awaDeg:i}=Be(this.state),a=Math.abs(i);if(this.rudderTargetRad=n.dir*this.rudderMaxRad,this.mainTrimTarget=1,this.jibTrimTarget=1,n.turnedDeg+=this.state.r*oe*t*n.dir,a<bn&&(n.throughEye=!0),n.turnedDeg>=Xi){this.tack=null,this.rudderTargetRad=0;const s=tt(Math.abs(Be(this.state).awaDeg));return this.mainTrimTarget=s,this.jibTrimTarget=s,this.tackEvent="through",0}return n.elapsedS>Zi?(this.tack=null,this.rudderTargetRad=0,this.tackEvent="in_irons",0):a<bn?n.dir*qi:0}isTacking(){return this.tack!==null}takeTackEvent(){const t=this.tackEvent;return this.tackEvent=null,t}snapshot(){const{awaDeg:t,awsMs:n}=Be(this.state),i=Nt(this.state);return{heading:this.state.psi*oe%360,speedKts:i,windDirection:this.state.windFromRad*oe%360,windSpeedKts:rn(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:rn(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*oe,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:Yi(this.state)}}setWind(t,n){this.state.windFromRad=q(t*Z),this.state.windSpeedMs=Dt(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const It="captain.openai_key";function yn(){return window.localStorage.getItem(It)}function ea(e){window.localStorage.setItem(It,e)}function ta(){window.localStorage.removeItem(It)}const na="https://api.openai.com/v1/chat/completions",ia="https://api.openai.com/v1/realtime/calls",aa="https://api.openai.com/v1/realtime/client_secrets";function Lt(){try{return yn()?.trim()??""}catch{return""}}function wn(){return Lt().length>0}function oa(){const e=Lt();return e.length>0?{apiKey:e,endpoint:na,direct:!0}:{apiKey:"",endpoint:"/api/intent/parse",direct:!1}}async function sa(e){const t=Lt();if(t.length===0)return null;const n=await fetch(aa,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({session:{type:"realtime",model:e}})}),i=await n.json().catch(()=>null);if(!n.ok){const r=i?.error?.message??`OpenAI rejected the key (${n.status}).`;throw new Error(r)}const a=i?.value,s=i?.client_secret?.value,o=typeof a=="string"?a:typeof s=="string"?s:"";if(o.length===0)throw new Error("OpenAI returned no ephemeral key.");return o}function ra(){return wn()?{apiKey:"",endpoint:ia,direct:!0}:{apiKey:"",endpoint:"/api/realtime/session",direct:!1}}const la=["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],vn=[];function ca(e){vn.push(e)}function da(){for(const e of vn)e()}let xn=null;function Sn(e){return e==="direct"||e==="realtime"||e==="ai"?e:"ai"}function ua(e,t,n){e.innerHTML="",ka();const i=document.createElement("div");i.id="hud",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel hud-state",i.appendChild(a);const s=document.createElement("div");s.className="hud-panel-title",s.textContent="Ship State",a.appendChild(s);function o(l,f,E=!1){const k=document.createElement("div");k.id=l,k.className="hud-row";const H=document.createElement("span");H.className="hud-row-label",H.textContent=f,k.appendChild(H);const K=document.createElement("span");K.className="hud-row-colon",K.textContent=": ",k.appendChild(K);const J=document.createElement("span");J.className="hud-row-value",J.textContent="--",k.appendChild(J);let B=null,O=null;if(E){const F=document.createElement("div");F.className="hud-bar",B=document.createElement("div"),B.className="hud-bar-fill",F.appendChild(B),O=document.createElement("div"),O.className="hud-bar-marker",O.hidden=!0,F.appendChild(O),k.appendChild(F)}return a.appendChild(k),{setValue:F=>{J.textContent=F},setFill:B?F=>{B&&(B.style.width=`${Math.max(0,Math.min(100,F))}%`)}:void 0,setMarker:O?F=>{O&&(O.hidden=F===null,F!==null&&(O.style.left=`${Math.max(0,Math.min(100,F))}%`))}:void 0}}const r=o("hud-heading","heading"),c=o("hud-speed","speed"),d=o("hud-wind","wind"),u=o("hud-awa","awa"),h=o("hud-main","main",!0),g=o("hud-jib","jib",!0),b=o("hud-rudder","rudder"),v=o("hud-guns","guns",!0),w=document.getElementById("hud-guns");w.hidden=!0;const R=o("hud-hull","hull",!0),C=document.getElementById("hud-hull");C.hidden=!0;const _=o("hud-enemy","enemy"),V=document.getElementById("hud-enemy");V.hidden=!0;const z="http://www.w3.org/2000/svg";function A(l,f){const E=document.createElementNS(z,l);for(const[k,H]of Object.entries(f))E.setAttribute(k,H);return E}const W=document.getElementById("hud-wind"),S=40,D=15,P=document.createElement("div");P.id="hud-windrose",P.className="hud-windrose";const p=A("svg",{viewBox:"0 0 120 120",width:"88",height:"88","aria-hidden":"true",focusable:"false"});function x(l,f,E){const k=F=>{const pt=F*Math.PI/180;return[60+Math.sin(pt)*E,60-Math.cos(pt)*E]},[H,K]=k(l),[J,B]=k(f),O=Math.abs(f-l)>180?1:0;return`M 60 60 L ${H} ${K} A ${E} ${E} 0 ${O} 1 ${J} ${B} Z`}p.appendChild(A("circle",{cx:"60",cy:"60",r:"52",class:"hud-windrose-ring"}));const m=A("g",{class:"hud-windrose-world"});for(const[l,f]of[["N",0],["E",90],["S",180],["W",270]]){const E=f*Math.PI/180,k=A("text",{x:String(60+Math.sin(E)*43),y:String(60-Math.cos(E)*43),class:l==="N"?"hud-windrose-letter hud-windrose-north":"hud-windrose-letter","text-anchor":"middle","dominant-baseline":"central"});k.textContent=l,m.appendChild(k)}p.appendChild(m);const y=A("g",{class:"hud-windrose-wind"});y.appendChild(A("path",{d:x(-S,S,52),class:"hud-windrose-nogo"})),y.appendChild(A("path",{d:x(180-D,180+D,52),class:"hud-windrose-deep"})),y.appendChild(A("line",{x1:"60",y1:"-2",x2:"60",y2:"44",class:"hud-windvane-arrow-shaft"})),y.appendChild(A("polygon",{points:"60,54 52,38 68,38",class:"hud-windvane-arrow-head"}));const T=A("text",{x:"60",y:"-10",class:"hud-windrose-windlabel","text-anchor":"middle","dominant-baseline":"central"});T.textContent="WIND",y.appendChild(T),p.appendChild(y);const G=A("g",{class:"hud-windrose-shipgroup"});G.appendChild(A("polygon",{points:"60,42 53,74 60,67 67,74",class:"hud-windrose-boat"})),p.appendChild(G),P.appendChild(p);const I=document.createElement("div");I.id="hud-windrose-warn",I.className="hud-windrose-warn",I.textContent=" ",P.appendChild(I);const $=["wind-up","north-up","bow-up"],ce={"wind-up":"wind up · click to change","north-up":"north up · click to change","bow-up":"bow up · click to change"};function te(){const l=nt().visuals.windRoseMode;return $.includes(l)?l:"wind-up"}let de=te();const U=document.createElement("button");U.id="hud-windrose-mode",U.type="button",U.className="hud-windrose-mode",P.appendChild(U);function N(l){de=l,U.textContent=ce[l],Pt({visuals:{windRoseMode:l}})}function ne(){N($[($.indexOf(de)+1)%$.length])}p.addEventListener("click",ne),U.addEventListener("click",ne),N(de),W.after(P);const ie=document.getElementById("hud-rudder"),me=document.createElement("div");me.className="hud-gauge";const xt=document.createElement("div");xt.className="hud-gauge-center-tick",me.appendChild(xt);const Fe=document.createElement("div");Fe.className="hud-gauge-target",me.appendChild(Fe);const Ve=document.createElement("div");Ve.className="hud-gauge-needle",me.appendChild(Ve),ie.appendChild(me);let ue=null;function St(l){return(Math.max(-35,Math.min(35,l))+35)/70*100}function ge(l){const f=St(l);Ve.style.left=`${f}%`,Ve.classList.toggle("port",l<-.5),Ve.classList.toggle("stbd",l>.5),ue!==null&&Math.abs(l-ue)>.5?(Fe.style.left=`${St(ue)}%`,Fe.style.display="block"):Fe.style.display="none"}const Y=document.createElement("div");Y.id="hud-irons",Y.className="hud-irons-row";const Je=document.createElement("span");Je.className="hud-visually-hidden",Je.textContent="irons: false",Y.appendChild(Je),a.appendChild(Y);const ve=document.createElement("div");ve.className="hud-panel hud-log",i.appendChild(ve);const Ae=document.createElement("div");Ae.className="hud-log-header",ve.appendChild(Ae);const re=document.createElement("div");re.className="hud-panel-title hud-log-title-text",re.textContent="Quarterdeck Log",Ae.appendChild(re);const xe=document.createElement("button");xe.id="command-config-toggle",xe.type="button",xe.title="Command settings",xe.setAttribute("aria-label","Command config"),xe.textContent="⚙",xe.className="hud-btn hud-command-config-toggle",Ae.appendChild(xe);const fe=document.createElement("div");fe.id="hud-log-list",fe.className="hud-log-list",ve.appendChild(fe);const qe=6,Q=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function Oe(){fe.innerHTML="";let l=-1;Q.forEach((f,E)=>{f.kind==="exchange"&&(l=E)}),Q.forEach((f,E)=>{const k=document.createElement("div");if(k.style.opacity=String(.45+.55*((E+1)/Q.length)),f.kind==="system"){k.className="hud-log-entry hud-log-system-entry";const O=document.createElement("div");O.className="hud-log-system",O.textContent=`⚠ ${f.transcript}`,k.appendChild(O),fe.appendChild(k);return}const H=E===l;k.className="hud-log-entry";const K=document.createElement("div");K.className="hud-log-you",H&&(K.id="hud-transcript"),K.textContent=`You: ${f.transcript}`,k.appendChild(K);const J=document.createElement("div");J.className="hud-log-order",H&&(J.id="hud-intent"),J.textContent=f.order,k.appendChild(J);const B=document.createElement("div");B.className="hud-log-crew",H&&(B.id="hud-crew"),B.textContent=`Crew: ${f.crew}`,k.appendChild(B),fe.appendChild(k)}),fe.scrollTop=fe.scrollHeight}Oe();function kt(l){if(l===null)return"→ no order";if(l.action==="helm"){const f=Math.round(l.degrees),E=f<0?"port":f>0?"stbd":"amidships";return`→ helm ${f}° (${E})`}return l.action==="trim_sail"?`→ trim ${l.sail} → ${l.trim.toFixed(2)}`:l.action==="fire_guns"?"→ fire guns":"→ status report"}function Se(l){Q.push({kind:"exchange",transcript:l,order:"→ …",crew:"…"}),Q.length>qe&&Q.shift(),Oe()}function j(l){const f=[...Q].reverse().find(E=>E.kind==="exchange");f&&(f.order=kt(l)),l!==null&&l.action==="helm"&&(ue=l.degrees),Oe()}function ee(l){const f=[...Q].reverse().find(E=>E.kind==="exchange");f&&(f.crew=l),Oe()}function he(l){Q.push({kind:"system",transcript:l,order:"",crew:""}),Q.length>qe&&Q.shift(),Oe()}const ke=document.createElement("div");ke.className="hud-controls",ve.insertBefore(ke,fe);const De=document.createElement("details");De.id="input-mode-details",De.className="hud-input-mode-details",ke.appendChild(De);const Xe=document.createElement("summary");Xe.id="input-mode-summary",Xe.className="hud-input-mode-summary",De.appendChild(Xe);const Ie=document.createElement("div");Ie.id="input-mode",Ie.className="hud-input-mode",Ie.setAttribute("role","radiogroup"),Ie.setAttribute("aria-label","Command input mode"),De.appendChild(Ie);function lt(l,f,E,k=!1){const H=document.createElement("label");H.className="hud-input-mode-option",H.dataset.mode=l;const K=document.createElement("input");K.type="radio",K.name="input-mode",K.id=`input-mode-${l}`,K.value=l,H.appendChild(K);const J=document.createElement("span");J.className="hud-input-mode-copy";const B=document.createElement("span");B.className="hud-input-mode-name",B.textContent=f;const O=document.createElement("span");if(O.className="hud-input-mode-source",O.textContent=E,J.appendChild(B),J.appendChild(O),H.appendChild(J),k){const F=document.createElement("button");F.type="button",F.className="hud-key-dot",F.dataset.mode=l;const pt=()=>{const Qe=wn();F.classList.toggle("ok",Qe),F.textContent=Qe?"●":"● add key",F.title=Qe?"OpenAI key saved — click to change":"No OpenAI key — click to add one"};F.addEventListener("click",Qe=>{Qe.preventDefault(),Qe.stopPropagation(),xn?.()}),pt(),ca(pt),H.appendChild(F)}return Ie.appendChild(H),{label:H,radio:K}}const Zt=lt("ai","AI Orders","Type or dictate — GPT works out what you mean",!0),Qt=lt("realtime","GPT Realtime","Talk over your mic — the crew answers aloud",!0),en=lt("direct","Direct Orders","Type or dictate — instant, set phrases, no AI"),X=document.createElement("input");X.id="transcript-input",X.type="text",X.placeholder="Paste or dictate an order",X.className="hud-input",ke.appendChild(X);const ct=document.createElement("div");ct.className="hud-button-row",ke.appendChild(ct);const ae=document.createElement("button");ae.id="ptt",ae.type="button",ae.textContent="Connect Mic",ae.className="hud-btn hud-btn-ptt",ae.hidden=!0,ct.appendChild(ae);const Le=document.createElement("div");Le.id="input-status",Le.className="hud-input-status",Le.setAttribute("role","status"),Le.setAttribute("aria-live","polite"),Le.textContent="Ready locally",ct.appendChild(Le);const dt=document.createElement("button");dt.id="view-toggle",dt.type="button",dt.textContent="Helm View",dt.className="hud-btn hud-btn-view-toggle",ct.appendChild(dt);let Mt="direct";function We(l,f="neutral"){Le.textContent=l,Le.dataset.tone=f}function ut(){return Mt!=="realtime"}const us={ai:"AI Orders",realtime:"GPT Realtime",direct:"Direct Orders"};function tn(l,f=!0){Mt=l,en.radio.checked=l==="direct",Zt.radio.checked=l==="ai",Qt.radio.checked=l==="realtime",Xe.textContent=`Orders: ${us[l]}`,X.disabled=l==="realtime",ae.hidden=l!=="realtime",l==="realtime"?(_t(),X.placeholder="Voice orders arrive here",We("Mic disconnected")):(X.placeholder="Paste or dictate an order",We(l==="ai"?"Ready — GPT parses orders":"Ready locally"),window.setTimeout(()=>X.focus(),0)),f&&n.setInputMode(l)}function nn(l){tn(l),De.open=!1}en.radio.addEventListener("change",()=>{en.radio.checked&&nn("direct")}),Zt.radio.addEventListener("change",()=>{Zt.radio.checked&&nn("ai")}),Qt.radio.addEventListener("change",()=>{Qt.radio.checked&&nn("realtime")}),ae.addEventListener("click",()=>n.toggleRealtime());function je(){ut()&&X.focus()}const Et=nt().input,fi=2;let ht=null;function _t(){ht!==null&&(clearTimeout(ht),ht=null)}let an=!1,Tt=null;async function on(l){if(!ut())return;if(an||(n.isPipelineBusy?.()??!1)){Tt=l;return}an=!0,_t();const f=performance.now(),E=Mt==="ai";We(E?"Asking GPT…":"Processing locally");try{await n.injectTranscript(l),X.value="";const k=Math.max(1,Math.round(performance.now()-f));We(E?`Accepted in ${k} ms`:`Accepted locally in ${k} ms`,"ok")}catch(k){const H=k instanceof Error?k.message:String(k);ee(H),We("Order not sent","error")}finally{if(an=!1,je(),Tt!==null){const k=Tt;Tt=null,on(k)}}}function bi(l){if(!Et.autoSubmit)return;const f=l.trim();f.length<fi||on(f)}X.addEventListener("input",l=>{if(!ut()||(_t(),!Et.autoSubmit))return;if(l.inputType==="insertFromPaste"){bi(X.value);return}X.value.trim().length<fi||(ht=setTimeout(()=>{ht=null,bi(X.value)},Et.autoSubmitDelayMs))}),X.addEventListener("keydown",l=>{if(!ut()||l.key!=="Enter")return;_t();const f=X.value.trim();f.length!==0&&on(f)}),document.addEventListener("click",l=>{const f=l.target;if(f instanceof HTMLCanvasElement){je();return}f instanceof Element&&f.closest("#env-selector")&&je()}),document.addEventListener("keydown",l=>{!ut()||ya(l.target)||l.ctrlKey||l.metaKey||l.altKey||!(l.key.length===1)&&l.key!=="Backspace"||X.focus()},{capture:!0}),tn(Sn(Et.defaultMode),!1);const Me=document.createElement("button");Me.id="mute-toggle",Me.type="button",Me.title="Mute all sound",Me.setAttribute("aria-label","Mute all sound"),Me.textContent="🔊",Me.className="hud-btn hud-mute-toggle",i.appendChild(Me);let Ze=!1;Me.addEventListener("click",()=>{Ze=!Ze,Me.textContent=Ze?"🔇":"🔊",Me.title=Ze?"Unmute":"Mute all sound",Me.classList.toggle("muted",Ze),n.setMuted?.(Ze),je()}),xa(i,je),Sa(ve,xe,n,je);function Rt(l){return l.toFixed(1)}function yi(l){return l.toFixed(2)}const hs=["N","NE","E","SE","S","SW","W","NW"];function wi(l){return(l%360+360)%360}function vi(l){const f=Math.round(wi(l)/45)%8;return hs[f]??"N"}function xi(l){return String(Math.round(wi(l))%360).padStart(3,"0")}function ps(l){return`${xi(l)} ${vi(l)}`}function ms(l,f){return`from ${xi(l)} @ ${Rt(f)} kts (${vi(l)})`}function gs(l,f){const E=Math.round(l);if(E===0)return`dead ahead @ ${Rt(f)} kts`;const k=E<0?"port":"starboard";return`${Math.abs(E)}° to ${k} @ ${Rt(f)} kts`}function fs(l){const f=Math.round(l),E=f<0?"port":f>0?"stbd":"amidships";return`${f}° ${E}`}function bs(l){r.setValue(ps(l.heading)),c.setValue(`${Rt(l.speedKts)} kts`),d.setValue(ms(l.windDirection,l.windSpeedKts));const f=l.heading,E=l.windDirection,k=de==="north-up"?{world:0,wind:E,ship:f}:de==="wind-up"?{world:-E,wind:0,ship:f-E}:{world:-f,wind:E-f,ship:0};m.setAttribute("transform",`rotate(${k.world} 60 60)`),y.setAttribute("transform",`rotate(${k.wind} 60 60)`),T.setAttribute("transform",`rotate(${-k.wind} 60 -10)`),G.setAttribute("transform",`rotate(${k.ship} 60 60)`);const H=Math.abs(l.apparentWindAngle),K=H<45,J=H>180-D;I.textContent=K?"too close to the wind":J?"running deep":" ",I.dataset.tone=K||J?"warn":"ok",u.setValue(gs(l.apparentWindAngle,l.apparentWindKts)),h.setValue(yi(l.mainTrim)),h.setFill?.(l.mainTrim*100),g.setValue(yi(l.jibTrim)),g.setFill?.(l.jibTrim*100);const B=tt(Math.abs(l.apparentWindAngle))*100;h.setMarker?.(B),g.setMarker?.(B),b.setValue(fs(l.rudderAngle)),ge(l.rudderAngle);const O=n.getBattleStatus?.()??null;w.hidden=O===null,C.hidden=O===null,V.hidden=O===null,O!==null&&(v.setValue(O.guns),v.setFill?.(O.gunsReadyPct),R.setValue(O.hull),R.setFill?.(O.hullPct),_.setValue(O.enemy)),Je.textContent=`irons: ${l.inIrons}`,Y.classList.toggle("active",l.inIrons)}function Si(){bs(t.getState())}return Si(),it={logTranscript:Se,logIntent:j,logCrewLine:ee,logSystemNote:he},En={setInputMode:l=>tn(l,!1),setRealtimeState:(l,f)=>{if(ae.classList.toggle("listening",l==="listening"),ae.classList.toggle("recording",l==="speaking"),ae.disabled=l==="connecting",l==="connecting"?ae.textContent="Connecting...":l==="listening"||l==="speaking"?ae.textContent="Disconnect Mic":l==="error"?ae.textContent="Retry Mic":ae.textContent="Connect Mic",Mt!=="realtime")return;We(f??{disconnected:"Mic disconnected",connecting:"Connecting to GPT Realtime",listening:"Listening",speaking:"Crew speaking",error:"Realtime unavailable"}[l],l==="error"?"error":"neutral")},setStatus:We},_n={focus:je},{update:Si}}let it=null;function ha(e){it?.logTranscript(e)}function kn(e){it?.logIntent(e)}function gt(e){it?.logCrewLine(e)}function Mn(e){it?.logSystemNote(e)}function pa(e,t){kn(e),gt(t)}let En=null;function ma(e,t){En?.setRealtimeState(e,t)}let _n=null;function ga(){_n?.focus()}let Tn=[];function fa(e){Tn.push(e)}function ba(e,t){for(const n of Tn)n(e,t)}function ya(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function wa(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function va(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0)return;const c=s[r];(typeof c!="object"||c===null)&&(s[r]={}),s=s[r]}s[a]=n}function Rn(e,t){const n={...e};for(const i of Object.keys(t)){const a=e[i],s=t[i];a!==null&&typeof a=="object"&&!Array.isArray(a)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=Rn(a,s):n[i]=s}return n}function xa(e,t){const n=nt(),i={};let a=!1;const s=new Map,o=document.createElement("button");o.id="settings-toggle",o.type="button",o.title="Settings",o.setAttribute("aria-label","Settings"),o.textContent="⚙",o.className="hud-btn hud-settings-toggle",e.appendChild(o);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const c=document.createElement("div");c.className="hud-panel-title",c.textContent="Settings",r.appendChild(c);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);{let p=function(){let U="";try{U=yn()?.trim()??""}catch{U=""}const N=U.length>0;$.value="",$.placeholder=N?`saved (…${U.slice(-4)})`:"sk-...",de.textContent=N?"Saved in this browser. AI Orders and GPT Realtime will use it.":"Not set. AI Orders and GPT Realtime are unavailable; Direct Orders still work.",de.dataset.tone=N?"ok":"warn",te.hidden=!N,da()},x=function(){const U=$.value.trim();U.length!==0&&(ea(U),p())};const m=document.createElement("details");m.className="hud-settings-section",m.id="openai-key-section",m.open=!0;const y=document.createElement("summary");y.textContent="OpenAI key",m.appendChild(y);const T=document.createElement("div");T.className="hud-settings-field",m.appendChild(T);const G=document.createElement("div");G.className="hud-settings-note",G.textContent="Needed for AI Orders and GPT Realtime. Stored in this browser only and sent straight to api.openai.com. Without one, Direct Orders still work through the local parser.",T.appendChild(G);const I=document.createElement("div");I.className="hud-settings-key-row",T.appendChild(I);const $=document.createElement("input");$.id="openai-key-input",$.type="password",$.autocomplete="off",$.className="hud-settings-text",I.appendChild($);const ce=document.createElement("button");ce.id="openai-key-save",ce.type="button",ce.className="hud-btn",ce.textContent="Save",I.appendChild(ce);const te=document.createElement("button");te.id="openai-key-clear",te.type="button",te.className="hud-btn",te.textContent="Clear",I.appendChild(te);const de=document.createElement("div");de.id="openai-key-status",de.className="hud-settings-note",T.appendChild(de),ce.addEventListener("click",x),$.addEventListener("keydown",U=>{U.key==="Enter"&&(U.preventDefault(),x())}),te.addEventListener("click",()=>{ta(),p()}),p(),r.appendChild(m),xn=()=>{P(!0),m.open=!0,m.scrollIntoView({block:"nearest"}),window.setTimeout(()=>$.focus(),0)}}function u(){d.hidden=!a}function h(p,x){if(va(i,p.path,x),p.live)ba(p.path,x);else{const m=s.get(p.path);m&&(m.hidden=!1),a=!0,u()}}function g(p,x){const m=document.createElement("div");m.className="hud-settings-control-row";const y=document.createElement("input");y.type="range",y.min=String(p.min??0),y.max=String(p.max??100),y.step=String(p.step??1),y.value=String(x),y.className="hud-settings-range";const T=document.createElement("input");T.type="number",T.min=y.min,T.max=y.max,T.step=y.step,T.value=String(x),T.className="hud-settings-numeric";const G=p.min??-1/0,I=p.max??1/0;function $(ce){if(!Number.isFinite(ce))return;const te=Math.min(I,Math.max(G,ce));y.value=String(te),T.value=String(te),h(p,te)}return y.addEventListener("input",()=>$(Number(y.value))),T.addEventListener("input",()=>$(Number(T.value))),m.appendChild(y),m.appendChild(T),m}function b(p,x){const m=document.createElement("label");m.className="hud-settings-checkbox-label";const y=document.createElement("input");return y.type="checkbox",y.checked=x,y.addEventListener("change",()=>h(p,y.checked)),m.appendChild(y),m}function v(p,x){const m=document.createElement("select");m.className="hud-settings-select";for(const y of p.options??[]){const T=document.createElement("option");T.value=y,T.textContent=y,y===x&&(T.selected=!0),m.appendChild(T)}return m.addEventListener("change",()=>h(p,m.value)),m}function w(p,x){const m=document.createElement("input");return m.type="color",m.className="hud-settings-color",m.value=x,m.addEventListener("input",()=>h(p,m.value)),m}function R(p,x){const m=document.createElement("input");return m.type="text",m.className="hud-settings-text",m.value=x,m.addEventListener("change",()=>h(p,m.value)),m}function C(p){const x=document.createElement("div");x.className="hud-settings-field",x.dataset.configPath=p.path;const m=document.createElement("div");m.className="hud-settings-label-row";const y=document.createElement("span");if(y.className="hud-settings-label",y.textContent=p.label,m.appendChild(y),!p.live){const I=document.createElement("span");I.className="hud-settings-reload-dot",I.title="Staged — needs Save & Reload",I.hidden=!0,m.appendChild(I),s.set(p.path,I)}x.appendChild(m);const T=wa(n,p.path);let G;switch(p.type){case"number":G=g(p,T);break;case"boolean":G=b(p,T);break;case"select":G=v(p,T);break;case"color":G=w(p,T);break;default:G=R(p,T);break}if(x.appendChild(G),p.note){const I=document.createElement("div");I.className="hud-settings-note",I.textContent=p.note,x.appendChild(I)}return x}const _=new Map;for(const p of Ki)p.hidden||(_.has(p.section)||_.set(p.section,[]),_.get(p.section)?.push(p));const V=new Set(["Visuals","Environment","Lighting"]);for(const[p,x]of _){const m=document.createElement("details");m.className="hud-settings-section",m.open=V.has(p);const y=document.createElement("summary");y.textContent=p,m.appendChild(y);for(const T of x)m.appendChild(C(T));r.appendChild(m)}const z=document.createElement("div");z.className="hud-settings-footer";const A=document.createElement("button");A.id="settings-save-reload",A.type="button",A.textContent="Save & Reload",A.className="hud-btn",A.addEventListener("click",()=>{Pt(i),location.reload()});const W=document.createElement("button");W.id="settings-copy-json",W.type="button",W.textContent="Copy JSON",W.className="hud-btn",W.addEventListener("click",()=>{(async()=>{const p=Rn(n,i),x=JSON.stringify(p,null,2);console.log(x);try{await navigator.clipboard?.writeText(x)}catch{}})()});const S=document.createElement("button");S.id="settings-reset-all",S.type="button",S.textContent="Reset All",S.className="hud-btn",S.addEventListener("click",()=>{pn(),location.reload()}),z.appendChild(A),z.appendChild(W),z.appendChild(S),r.appendChild(z);let D=!1;function P(p){D=p,r.classList.toggle("open",p),o.classList.toggle("active",p),p||t()}o.addEventListener("click",()=>P(!D))}function Sa(e,t,n,i){const a=nt(),s=document.createElement("div");s.id="command-config",s.className="hud-panel hud-command-config",e.appendChild(s);function o(C){const _=document.createElement("div");return _.className="hud-command-config-section-title",_.textContent=C,_}s.appendChild(o("Realtime Voice"));const r=document.createElement("div");r.className="hud-command-config-row";const c=document.createElement("label");c.className="hud-toggle-label";const d=document.createElement("input");d.id="tts-enabled",d.type="checkbox",d.checked=!0,d.addEventListener("change",()=>n.setCrewAudioEnabled(d.checked)),c.appendChild(d),c.appendChild(document.createTextNode("Hear crew replies")),r.appendChild(c);const u=document.createElement("select");u.id="tts-voice-select",u.className="hud-settings-select hud-command-config-voice-select";for(const C of la){const _=document.createElement("option");_.value=C,_.textContent=C,C===a.voice.ttsVoice&&(_.selected=!0),u.appendChild(_)}u.addEventListener("change",()=>n.setTtsVoice(u.value)),r.appendChild(u),s.appendChild(r);const h=document.createElement("div");h.className="hud-command-config-row";const g=document.createElement("span");g.className="hud-command-config-volume-label",g.textContent="Volume",h.appendChild(g);const b=document.createElement("input");b.id="tts-volume",b.type="range",b.min="0",b.max="1",b.step="0.05",b.value=String(a.voice.ttsVolume),b.className="hud-settings-range",b.addEventListener("input",()=>n.setTtsVolume(Number(b.value))),h.appendChild(b),s.appendChild(h),s.appendChild(o("Actions"));const v=document.createElement("button");v.id="demo",v.type="button",v.textContent="Run Demo",v.className="hud-btn hud-btn-demo hud-command-config-demo",s.appendChild(v);let w=!1;function R(C){w=C,s.classList.toggle("open",w),t.classList.toggle("active",w),w||i()}t.addEventListener("click",()=>R(!w)),document.addEventListener("mousedown",C=>{if(!w)return;const _=C.target;s.contains(_)||t.contains(_)||R(!1)}),document.addEventListener("keydown",C=>{C.key==="Escape"&&w&&R(!1)})}function ka(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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
  .hud-windrose svg {
  cursor: pointer;
}
.hud-windrose-windlabel {
  fill: #58c4ff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.hud-windrose-mode {
  pointer-events: auto;
  background: none;
  border: 0;
  color: #6f93ae;
  font: 9px/1.4 ui-monospace, Menlo, monospace;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 0;
}
.hud-windrose-mode:hover {
  color: #b7cfe0;
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
  /* Headroom for the wind marker, which now sits outside the ring. */
  margin: 12px 0 1px;
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
.hud-windrose svg {
  cursor: pointer;
}
.hud-windrose-windlabel {
  fill: #58c4ff;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.12em;
}
.hud-windrose-mode {
  pointer-events: auto;
  background: none;
  border: 0;
  color: #6f93ae;
  font: 9px/1.4 ui-monospace, Menlo, monospace;
  letter-spacing: 0.06em;
  cursor: pointer;
  padding: 0;
}
.hud-windrose-mode:hover {
  color: #b7cfe0;
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
`,document.head.appendChild(e)}const Ht=.05,Cn=Ht*1e3,Ma=35,Ea=40,zt=50,An=15,_a=8;function Ft(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Ta{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=ln({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*Z,this.rudderRateRadPerS=t.rudderSlewDegPerS*Z,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=q(t*Z),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",q(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,a=Math.hypot(n,i),s=q(Math.atan2(n,i));a>this.engageRangeM*1.15?this.behavior="APPROACH":a<this.engageRangeM*.85&&(this.behavior="ENGAGE");let o;if(this.behavior==="APPROACH")o=s;else{const d=(a>this.engageRangeM?1:-1)*15*Z;o=q(t.headingRad+d)}const r=_e(this.state.windFromRad-o)*oe;if(this.tackSide!==null){this.tackHoldS-=Ht;const c=Math.abs(r)>=Ea;if(this.tackHoldS<=0){if(c)this.tackSide=null;else if(Math.abs(r)>=_a){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=An)}}}else if(Math.abs(r)<Ma){const c=q(this.state.windFromRad-zt*Z),d=q(this.state.windFromRad+zt*Z),u=Math.abs(_e(c-this.state.psi)),h=Math.abs(_e(d-this.state.psi));this.tackSide=u<=h?1:-1,this.tackHoldS=An}return this.tackSide!==null?q(this.state.windFromRad-this.tackSide*zt*Z):o}step(t,n){const i=this.planHeading(n),a=_e(i-this.state.psi);this.rudderTargetRad=Te(this.headingKp*a-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:s}=Be(this.state),o=tt(Math.abs(s));this.mainTrimTarget=o,this.jibTrimTarget=o,this.state.rudder=Ft(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=Ft(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=Ft(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),gn(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Cn;)this.step(Ht,n),this.accMs-=Cn}headingDeg(){return this.state.psi*oe%360}}const Dn=30;function Pn(){return{reloadRemainingS:0}}function Vt(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function Nn(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function On(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=Dn,ready:e.reloadRemainingS<=0}}function Ra(e,t,n,i,a,s){Nn(e,t);const o=On(e,n,i,a);return!o.inRange||!o.inArc||!o.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=a.reloadS,{fired:!0,hit:s()<Vt(n,a.cannonRangeM)})}function Ca(e,t,n,i,a){const s=On(e,t,n,i);if(!s.ready)return{fired:!1,hit:!1,...s};e.reloadRemainingS=i.reloadS;const o=a();return{fired:!0,hit:s.inRange&&s.inArc&&o<Vt(t,i.cannonRangeM),...s}}const ft=10,Aa=5,Da=.8,Pa=.5;function In(){return{hullHp:ft}}const Ln=30,Hn=2;function zn(e,t=1){e.hullHp=Math.max(0,e.hullHp-t)}function Na(e){return e.hullHp<=0?Pa:e.hullHp<=Aa?Da:1}function Fn(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Oa=35,Vn=45;function Ia(e){return Math.hypot(e.state.u,e.state.v)*1.94384}function Wt(e,t,n,i,a){const s=q(Math.atan2(e-n,t-i)),o=Math.abs(_e(s-a)*oe);return o<=Ln||o>=180-Ln}class La{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,a){this.cfg=t,this.rng=Fn(t.seed),this.playerRng=Fn(t.seed+1),this.lastPlayerPose=a;const s=Te(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*s);const o=1.2+.6*s,r=this.rng()*2*Math.PI,c=a.x+t.spawnRangeM*Math.sin(r),d=a.y+t.spawnRangeM*Math.cos(r),u=q(r+Math.PI);this.npc=new Ta({x:c,y:d,heading:u*oe,windDirection:a.windDirectionDeg,windSpeedKts:a.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Oa,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:o,phys:n}),this.damage=In(),this.cannon=Pn(),this.playerCannon=Pn(),this.enemyDamage=In()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,Nn(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});let a=n.x-this.npc.x,s=n.y-this.npc.y,o=Math.hypot(a,s);if(o>1e-6&&o<Vn){const r=Vn/o;this.npc.state.x=n.x-a*r,this.npc.state.y=n.y-s*r,a=n.x-this.npc.state.x,s=n.y-this.npc.state.y,o=Math.hypot(a,s)}if(!this.everSpotted&&o<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=q(Math.atan2(-a,-s)),d=_e(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:d})}if(!this.everClosing&&o<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=q(Math.atan2(a,s)),c=_e(r-this.npc.state.psi)*oe,d=Math.min(Math.abs(c-90),Math.abs(c+90)),u=Ra(this.cannon,t/1e3,o,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);if(u.fired&&(i.push({key:"enemy_fires"}),u.hit)){const h=Wt(this.npc.x,this.npc.y,n.x,n.y,n.headingRad);zn(this.damage,h?Hn:1),i.push({key:"hit_taken",hullHp:this.damage.hullHp})}}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(t){const n=this.resolveFireGuns(t);return this.lastPlayerFireOutcome=n,n}resolveFireGuns(t){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const n=this.lastPlayerPose,i=n.x-this.npc.x,a=n.y-this.npc.y,s=Math.hypot(i,a),o=q(Math.atan2(-i,-a)),r=_e(o-n.headingRad)*oe,c=t==="starboard"?Math.abs(r-90):t==="port"?Math.abs(r+90):Math.min(Math.abs(r-90),Math.abs(r+90)),d=Ca(this.playerCannon,s,c,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);if(!d.fired)return{kind:"reloading"};if(!d.inRange||!d.inArc)return{kind:"wasted"};if(!d.hit)return{kind:"miss"};const u=Wt(n.x,n.y,this.npc.x,this.npc.y,this.npc.state.psi);return zn(this.enemyDamage,u?Hn:1),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=ft/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return Na(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:Ia(this.npc),behavior:this.npc.behavior,mainTrim:this.npc.state.mainTrim,jibTrim:this.npc.state.jibTrim,rudderDeg:this.npc.state.rudder*oe},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck,guns:this.gunsView()}}gunsView(){const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),s=q(Math.atan2(-n,-i)),o=_e(s-t.headingRad)*oe,r=Math.min(Math.abs(o-90),Math.abs(o+90)),c=a<=this.cfg.cannonRangeM,d=r<=Dn,u=Wt(t.x,t.y,this.npc.x,this.npc.y,this.npc.state.psi);return{readyInS:this.playerCannon.reloadRemainingS,readyPct:this.cfg.playerReloadS>0?Math.max(0,Math.min(1,1-this.playerCannon.reloadRemainingS/this.cfg.playerReloadS)):1,rangeM:a,inRange:c,inArc:d,hitChancePct:c&&d?Math.round(Vt(a,this.cfg.cannonRangeM)*100):0,raking:u}}}const Ha="I do not understand that order, sir.",jt="One order at a time, sir.";function ye(e,t){return{kind:"error",code:e,message:t}}function za(e){return e.toLowerCase().replace(/['\u2018\u2019]/g,"").replace(/[^a-z0-9%]+/g," ").trim().replace(/\s+/g," ")}function Fa(e){return Math.max(0,Math.min(1,e))}const Wn={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},Va={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};function jn(e){const t=e.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/);if(t?.[1]!==void 0)return Number(t[1]);const n=e.split(" ");for(let i=0;i<n.length;i++){const a=n[i],s=Wn[a];if(s!==void 0)return s;const o=Va[a];if(o!==void 0){const r=n[i+1],c=r===void 0?void 0:Wn[r];return o+(c!==void 0&&c<10?c:0)}}return null}function ze(e,t){return t.some(n=>n.test(e))}function Wa(e){return ze(e,[/\bstatus(?: report)?\b/,/\breport(?: to me)?\b/,/\bhow (?:are|re) we doing\b/,/\bhow is she doing\b/,/\bwhats (?:our |the )?(?:heading|course|speed|position)\b/,/\bwhats the wind doing\b/,/\b(?:where are we|what is our position)\b/])}function ja(e){return/\bready about\b/.test(e)||/\bhelms? a[- ]?lee\b/.test(e)||/\b(?:come|bring|put) (?:her |the ship )?about\b/.test(e)||/\babout ship\b/.test(e)||/\b(?:tack|tacking)\b/.test(e)||/\bgo about\b/.test(e)?{kind:"intent",intent:{action:"tack"}}:null}function $a(e){if(/\b(?:hold|cease) (?:your )?fire\b/.test(e)||/\b(?:dont|do not) fire\b/.test(e)||/\bbelay\b/.test(e)&&/\bfire\b/.test(e))return{kind:"acknowledgement",message:"Holding fire, sir."};if(!(/^fire(?:\b|$)/.test(e)||/\b(?:open fire|fire away|fire as she bears|give (?:her|them) a broadside|let (?:them|em) have it)\b/.test(e)||/\b(?:port|larboard|starboard|stbd) (?:guns|battery|broadside)\b/.test(e)))return null;const i=/\b(?:port|larboard)\b/.test(e)?"port":/\b(?:starboard|stbd)\b/.test(e)?"starboard":void 0;return{kind:"intent",intent:i?{action:"fire_guns",side:i}:{action:"fire_guns"}}}function Ka(e){const t=/\b(?:main|mainsail|main sheet)\b/.test(e),n=/\b(?:jib|headsail|jib sheet)\b/.test(e);return t&&n?"all":t?"main":n?"jib":/\b(?:both sheets|the sheets|sheets|all sails?|all sail|all canvas|the sails|sails|everything)\b/.test(e)?"all":null}function Ba(e,t){return e==="main"?t.mainTrim:e==="jib"?t.jibTrim:(t.mainTrim+t.jibTrim)/2}function Ga(e,t){const n=Ka(e);if(n===null)return null;const i=ze(e,[/\bease(?: away| off)?\b/,/\blet (?:the )?.*\bout\b/,/\blet go\b/,/\bslacken\b/,/\bspill(?: .* )?wind\b/,/\bstart (?:the )?(?:sheet|sheets|main|jib)\b/]),a=ze(e,[/\bhaul(?: in)?\b/,/\bharden(?: up)?\b/,/\btighten(?: up)?\b/,/\bsheet(?:s)? (?:home|in)\b/,/\btrim (?:the )?.*\b(?:in|home)\b/,/\bpull (?:the )?.*\bin\b/,/\bbring (?:the )?.*\bin\b/,/\bmore on\b/,/\btake a pull\b/]),s=/\b(?:trim|set) (?:the )?(?:sails?|canvas|main|mainsail|jib|headsail)\b/.test(e);if(i&&a)return ye("ambiguous",jt);if(!i&&!a&&!s)return null;const o=e.match(/\b(\d{1,3})\s*(?:percent|%)\b/),r=/\bpercent\b/.test(e)?jn(e):null,c=o?.[1]===void 0?r:Number(o[1]);if(c!==null&&c>100)return ye("out_of_range","Sail trim must be between zero and one hundred percent, sir.");let d;if(c!==null&&/\b(?:to|at|set)\b/.test(e))d=c/100;else if(/\b(?:all the way|right|hard) in\b/.test(e))d=1;else if(/\b(?:all the way out|let go)\b/.test(e))d=0;else if(!i&&!a)d=tt(Math.abs(t.apparentWindAngle));else{const h=c===null?.15:c/100;d=Fa(Ba(n,t)+(a?h:-h))}return{kind:"intent",intent:{action:"trim_sail",sail:n,trim:d}}}function $n(e,t){const n=jn(e);return n!==null?n>35?ye("out_of_range","She will not take more than thirty-five degrees of helm, sir."):n:/\b(?:hard(?: over)?|full)\b/.test(e)?35:/\b(?:little|small|bit|touch|point|easy)\b/.test(e)?t.speedKts>=7?5:10:20}function Ua(e){const t="(?:turn|go|come|steer|point(?: us)?|bring (?:us|her)|give me(?: a)?(?: small)? turn|helm|rudder|hard)",n=/\bdegrees?\b/.test(e),i=n&&/\b(?:left|port|larboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:left|port|larboard)\\b|^(?:left|port|larboard)\\b|\\b(?:helm|hard) a port\\b)`).test(e),a=n&&/\b(?:right|starboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:right|starboard)\\b|^(?:right|starboard)\\b|\\b(?:helm|hard) a starboard\\b)`).test(e);return i&&a?"conflict":i?-1:a?1:null}function Ya(e,t){if(ze(e,[/\b(?:centre|center) (?:the )?(?:rudder|helm|home|hem|whole|hull|it)\b/,/\bstraighten(?: up| (?:the )?(?:rudder|helm|home|hem|whole|hull|ship))?\b/,/^(?:steady|midships|amidships)\b/,/\b(?:rudder|helm) amidships\b/,/\bmeet her\b/,/\bease her back to (?:centre|center)\b/]))return{kind:"intent",intent:{action:"helm",degrees:0}};if(ze(e,[/^(?:okay )+(?:enough|stop)\b/,/^whoa(?: whoa)+$/,/^too much$/,/^(?:no )+stop$/,/^(?:thats )?enough$/,/^easy(?: easy)+$/])&&Math.abs(t.rudderAngle)>2)return{kind:"intent",intent:{action:"helm",degrees:0}};if(/\b(?:other|wrong) way\b/.test(e))return Math.abs(t.rudderAngle)<=2?ye("ambiguous","The helm is already amidships, sir."):{kind:"intent",intent:{action:"helm",degrees:-Math.sign(t.rudderAngle)*Math.min(20,Math.abs(t.rudderAngle))}};const a=ze(e,[/\bluff(?: her)?(?: up)?\b/,/\bbring her up\b/,/\bcome up\b/,/\bpoint higher\b/,/\bharden up (?:the )?(?:helm|rudder)\b/]),s=ze(e,[/\bbear away\b/,/\bbear off\b/,/\bfall (?:off|away)\b/,/\brun off\b/,/\bbear up to leeward\b/]);if(a&&s)return ye("ambiguous",jt);if(a||s){if(Math.abs(t.apparentWindAngle)<1)return ye("ambiguous","The wind is dead ahead; name a side, sir.");const c=$n(e,t);if(typeof c!="number")return c;const d=Math.sign(t.apparentWindAngle);return{kind:"intent",intent:{action:"helm",degrees:(a?d:-d)*c}}}const o=Ua(e);if(o==="conflict")return ye("ambiguous","Port or starboard, sir, not both.");if(o!==null){const c=$n(e,t);return typeof c!="number"?c:{kind:"intent",intent:{action:"helm",degrees:o*c}}}return/\b(?:steer|set|make) (?:a )?(?:course|heading)\b/.test(e)||/\b(?:course|heading) \d{2,3}\b/.test(e)||/^steer \d{2,3}\b/.test(e)||/^steer (?:zero|one|two|three|four|five|six|seven|eight|nine|north|south|east|west)\b/.test(e)?ye("unsupported","Course-keeping is not fitted; order port, starboard, or amidships, sir."):null}function Ja(e,t){const n=za(e);if(n.length===0)return ye("empty","No order received, sir.");if(/\b(?:dont|do not|belay|cancel)\b/.test(n))return{kind:"acknowledgement",message:"Belay that, sir."};const i=[ja(n),$a(n),Ga(n,t),Ya(n,t),Wa(n)?{kind:"intent",intent:{action:"report_status"}}:null].filter(a=>a!==null);return i.length===0?ye("unknown",Ha):i.length>1?ye("ambiguous",jt):i[0]}const Kn=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"tack",description:"Come about: tack the ship through the wind onto the opposite board. Use for 'ready about', 'come about', 'put her about', 'tack'. The crew runs the whole manoeuvre; do not also send helm orders for it.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears. Pass side only when the captain names one ('fire the port guns') — that battery alone fires, wasted if she doesn't bear on it.",parameters:{type:"object",properties:{side:{type:"string",enum:["port","starboard"],description:"Which battery to fire, only when the captain names a side."}}}}}],Bn=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function Gn(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,a=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof a!="number"||!Number.isFinite(a)||a<0||a>1?null:{action:"trim_sail",sail:i,trim:a}}case"report_status":return{action:"report_status"};case"tack":return{action:"tack"};case"fire_guns":{const a=(t??{}).side;return a==="port"||a==="starboard"?{action:"fire_guns",side:a}:{action:"fire_guns"}}default:return null}}const Un={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function qa(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function Yn(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Xa=1500;async function Za(e){try{return await e()}catch(t){if(!Yn(t))throw t;return await new Promise(n=>setTimeout(n,Xa)),e()}}function Qa(e,t,n){const i=qa(t);if(i)return Un[i];const a=n.trim(),o=a.startsWith("<")||/<\/?[a-z][\s\S]*>/i.test(a.slice(0,200))?"":a.slice(0,140);return o.length>0?`${e} (${t}): ${o}`:`${e} (${t})`}const eo="https://api.openai.com/v1/chat/completions";function to(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const a=i,s=typeof a.content=="string"?a.content:null,o=[],r=a.tool_calls;if(Array.isArray(r))for(const c of r){if(typeof c!="object"||c===null)continue;const d=c.function;if(typeof d!="object"||d===null)continue;const u=d,h=u.name,g=u.arguments;typeof h!="string"||typeof g!="string"||o.push({name:h,argumentsJson:g})}return{content:s,toolCalls:o}}function no(e){try{return JSON.parse(e)}catch{return null}}async function io(e,t,n,i=$e.voice.intentModel,a=eo){const s=`${Bn}

Current ship state:
${JSON.stringify(t)}`,o={"Content-Type":"application/json"};n.length>0&&(o.Authorization=`Bearer ${n}`);let r;try{r=await Za(()=>fetch(a,{method:"POST",headers:o,body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:Kn,messages:[{role:"system",content:s},{role:"user",content:e}]})}))}catch(b){throw Yn(b)?new Error(Un.network):b}if(!r.ok){const b=await r.text();throw new Error(Qa("intent request failed",r.status,b))}const c=await r.json(),d=to(c);if(d===null)throw new Error("intent request returned an unrecognizable response body");const u=d.toolCalls[0];if(u===void 0)return{crewLine:d.content??"",intent:null};const h=no(u.argumentsJson),g=Gn(u.name,h);return g===null?{crewLine:L("unknown_order",t),intent:null}:{crewLine:"",intent:g}}const ao=new Set(["alloy","ash","ballad","coral","echo","sage","shimmer","verse","marin","cedar"]);function $t(e){return ao.has(e)?e:"marin"}function oo(){return Kn.map(({function:e})=>({type:"function",name:e.name,description:e.description,parameters:e.parameters}))}function so(e){if(typeof e!="object"||e===null)return[];const t=e.output;if(!Array.isArray(t))return[];const n=[];for(const i of t){if(typeof i!="object"||i===null)continue;const a=i;a.type==="function_call"&&(typeof a.name!="string"||typeof a.call_id!="string"||typeof a.arguments!="string"||n.push({name:a.name,callId:a.call_id,argumentsJson:a.arguments}))}return n}function ro(e){if(typeof e!="object"||e===null)return null;const t=e.output;if(!Array.isArray(t))return null;for(const n of t){if(typeof n!="object"||n===null)continue;const i=n.content;if(Array.isArray(i))for(const a of i){if(typeof a!="object"||a===null)continue;const s=a,o=typeof s.transcript=="string"?s.transcript.trim():"";if(o)return o;const r=typeof s.text=="string"?s.text.trim():"";if(r)return r}}return null}function Jn(e){return Bn+`

REALTIME RULES:
- Wait for a tool result before acknowledging an order.
- When a tool result arrives, speak its message exactly once and do not reinterpret it.
- Never claim the ship changed unless the tool result says the order was accepted.
- If speech is unclear or contains conflicting orders, ask for the order again and call no tool.

Current ship state:
`+JSON.stringify(e)}function lo(e,t){return{type:"session.update",session:{type:"realtime",output_modalities:["audio"],instructions:Jn(e),audio:{input:{transcription:{model:"gpt-4o-mini-transcribe"},turn_detection:{type:"semantic_vad",create_response:!0,interrupt_response:!0}},output:{voice:$t(t)}},tools:oo(),tool_choice:"auto"}}}function co(e){try{return Gn(e.name,JSON.parse(e.argumentsJson))}catch{return null}}function uo(e){let t=null,n=null,i=null,a=null,s=!1,o=!1,r=$t(e.voice??"marin"),c=Math.max(0,Math.min(1,e.volume??.55)),d=!0,u=!1,h=!1,g=!1;const b=new Set;let v=Promise.resolve();function w(S){n?.readyState==="open"&&n.send(JSON.stringify(S))}function R(){a!==null&&(a.volume=c,a.muted=!d)}function C(S,D){w({type:"conversation.item.create",item:{type:"function_call_output",call_id:S,output:JSON.stringify(D)}})}async function _(S){if(S.length===0)return;if(h||(e.onTranscript("Voice order"),h=!0),S.length>1){const x="One order at a time, sir.";for(const m of S)C(m.callId,{ok:!1,message:x});e.onResponseLine(x),e.onSystemNote(x),g=!0,w({type:"response.create"});return}const D=S[0],P=co(D);if(P===null){const x="I do not understand that order, sir.";C(D.callId,{ok:!1,message:x}),e.onResponseLine(x),e.onSystemNote(`Realtime returned an invalid ${D.name} call.`),g=!0,w({type:"response.create"});return}const p=await e.submitIntent(P);C(D.callId,{ok:p.ok,message:p.message,state:p.state}),g=!0,w({type:"response.create",response:{instructions:`Speak exactly this crew line: ${JSON.stringify(p.message)}`}})}async function V(S){let D;try{D=JSON.parse(S)}catch{return}switch(D.type){case"input_audio_buffer.speech_started":h=!1,g=!1,w({type:"session.update",session:{instructions:Jn(e.getState())}}),e.onStatus("listening","Hearing order");break;case"conversation.item.input_audio_transcription.completed":{const P=D.transcript?.trim(),p=D.item_id??P;P&&p&&!b.has(p)&&(b.add(p),h=!0,e.onTranscript(P));break}case"response.output_audio.delta":case"response.audio.delta":case"output_audio_buffer.started":u=!0,e.onStatus("speaking","Crew speaking");break;case"output_audio_buffer.stopped":e.onStatus("listening","Listening");break;case"response.done":{const P=so(D.response);if(await _(P),P.length===0){const p=ro(D.response);g?g=!1:p&&e.onResponseLine(p),e.onStatus("listening","Listening")}break}case"error":e.onStatus("error","Realtime session error");break}}function z(S){return S.readyState==="open"?Promise.resolve():new Promise((D,P)=>{const p=window.setTimeout(()=>P(new Error("Realtime data channel timed out.")),1e4);S.addEventListener("open",()=>{window.clearTimeout(p),D()},{once:!0}),S.addEventListener("error",()=>{window.clearTimeout(p),P(new Error("Realtime data channel failed."))},{once:!0})})}function A(){n?.close(),t?.close();for(const S of i?.getTracks()??[])S.stop();a?.remove(),t=null,n=null,i=null,a=null,s=!1,o=!1,u=!1,h=!1,g=!1,b.clear(),e.onStatus("disconnected","Mic disconnected")}async function W(){if(!(s||o)){s=!0,e.onStatus("connecting","Requesting microphone");try{i=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),t=new RTCPeerConnection,a=document.createElement("audio"),a.autoplay=!0,a.hidden=!0,R(),document.body.appendChild(a),t.addEventListener("track",m=>{a&&(a.srcObject=m.streams[0]??new MediaStream([m.track]))}),t.addEventListener("connectionstatechange",()=>{(t?.connectionState==="failed"||t?.connectionState==="disconnected")&&e.onStatus("error","Realtime connection lost")});for(const m of i.getTracks())t.addTrack(m,i);n=t.createDataChannel("oai-events"),n.addEventListener("message",m=>{v=v.then(()=>V(m.data)).catch(y=>{const T=y instanceof Error?y.message:String(y);e.onSystemNote(T)})});const S=await t.createOffer();if(await t.setLocalDescription(S),!S.sdp)throw new Error("Browser did not create a Realtime offer.");const D=e.getTransport?.()??{apiKey:"",endpoint:"/api/realtime/session",direct:!1},P=e.model??"gpt-realtime-mini";let p;if(D.direct){const m=await e.mintClientSecret?.(P);if(!m)throw new Error("No OpenAI key stored — add one under the settings cog.");const y=new FormData;y.set("sdp",S.sdp),y.set("session",JSON.stringify({type:"realtime",model:P})),p=await fetch(D.endpoint,{method:"POST",headers:{Authorization:`Bearer ${m}`},body:y})}else p=await fetch(D.endpoint,{method:"POST",headers:{"Content-Type":"application/sdp"},body:S.sdp});if(!p.ok){const m=(await p.text()).trim();throw new Error(m||`Realtime session failed (${p.status}).`)}const x=await p.text();await t.setRemoteDescription({type:"answer",sdp:x}),await z(n),w(lo(e.getState(),r)),s=!1,o=!0,e.onStatus("listening","Listening")}catch(S){const D=S instanceof Error?S.message:String(S);throw A(),e.onStatus("error",D),S}}}return{connect:W,disconnect:A,toggle:async()=>{o||s?A():await W()},isConnected:()=>o,setVoice:S=>{const D=$t(S);if(D!==r&&(r=D,!!o)){if(u){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");return}w({type:"session.update",session:{audio:{output:{voice:r}}}})}},setVolume:S=>{c=Math.max(0,Math.min(1,S)),R()},setAudioEnabled:S=>{d=S,R()}}}const qn=9.81,Xn=370,ho=.84,po=10/12,Kt=12,Zn=.45,mo=2.2,Qn=.6,go=50,ei=2,fo=16,ti=.2,bo=.9,yo=137.51,wo=251.33;function Bt(e){return Math.min(1,Math.max(0,e))}function vo(e){return Math.max(e*po,.1)}function xo(e){const t=vo(e),n=qn*(ho/t)**2;return 2*Math.PI/n}function So(e){const t=Bt(e/40),n=Math.sqrt(t);return ti+n*(bo-ti)}function ko(e){const t=Bt(e/40);return ei+t*(fo-ei)}function Mo(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function Eo(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=xo(n),a=ko(n),s=So(n),o=1+Bt(s)*3,r=t+180,c=[],d=[],u=[];let h=0;for(let v=0;v<Kt;v++){const w=v/(Kt-1),R=Zn*(mo/Zn)**w;c.push(R);const C=go*(2*w-1);d.push(C);const _=Math.log(R),V=Math.exp(-(_*_)/(2*Qn*Qn)),z=C*Math.PI/180,A=Math.max(0,Math.cos(z))**(2*o),W=V*A;u.push(W),W>h&&(h=W)}const g=[],b=h>0?h:1;for(let v=0;v<Kt;v++){const w=i*c[v],R=2*Math.PI/w,C=Math.sqrt(qn*R*(1+R*R/(Xn*Xn))),_=Mo(r+d[v]),V=a*(u[v]/b),z=v*yo,A=v*wo,W=-R*(_.x*z+_.z*A);g.push({amplitude:V,wavenumber:R,omega:C,dirX:_.x,dirZ:_.z,phase0:W})}return g}function _o(e,t,n,i){let a=0;for(const s of e){const o=s.wavenumber*(s.dirX*t+s.dirZ*n)-s.omega*i+s.phase0;a+=s.amplitude*Math.cos(o)}return a}const To=458.7,Ro=170;function Co(e){return{length:To*e,beam:Ro*e}}function Ao(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],a=[];for(const s of i)a.push({x:-n,z:s}),a.push({x:n,z:s});return a}function Do(e,t,n){const i=Math.cos(n),a=Math.sin(n);return{x:e*i+t*a,z:-e*a+t*i}}function Po(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,a=0,s=0,o=0,r=0,c=0,d=0;const u=e.length;for(let _=0;_<u;_++){const{x:V,z}=e[_],A=t[_];n+=V*V,i+=V*z,a+=V,s+=z*z,o+=z,r+=V*A,c+=z*A,d+=A}const h=n*(s*u-o*o)-i*(i*u-o*a)+a*(i*o-s*a);if(Math.abs(h)<1e-9)return{heave:d/u,pitchRad:0,rollRad:0};const g=r*(s*u-o*o)-i*(c*u-o*d)+a*(c*o-s*d),b=n*(c*u-d*o)-r*(i*u-o*a)+a*(i*d-c*a),v=n*(s*d-o*c)-i*(i*d-o*r)+r*(i*o-s*a),w=g/h,R=b/h;return{heave:v/h,pitchRad:Math.atan(-R),rollRad:Math.atan(w)}}function No(e,t,n,i,a,s){const o=-i*(Math.PI/180),r=Co(a),c=Ao(r),d=c.map(u=>{const h=Do(u.x,u.z,o);return _o(e,t+h.x,n+h.z,s)});return Po(c,d)}function Gt(e,t,n,i,a){if(a<=0||n<=0)return e;const s=e.position-t,o=e.velocity,r=1e-4;let c,d;if(Math.abs(i-1)<r){const u=Math.exp(-n*a),h=o+n*s;c=(s+h*a)*u,d=u*(o-n*a*h)}else if(i>1){const u=n*Math.sqrt(i*i-1),h=-n*i+u,g=-n*i-u,b=(o-g*s)/(h-g),v=s-b,w=Math.exp(h*a),R=Math.exp(g*a);c=b*w+v*R,d=b*h*w+v*g*R}else{const u=-n*i,h=n*Math.sqrt(1-i*i),g=Math.exp(u*a),b=Math.cos(h*a),v=Math.sin(h*a),w=(o-u*s)/h;c=g*(s*b+w*v),d=u*c+g*h*(-s*v+w*b)}return{position:t+c,velocity:d}}function ni(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(a,s,o,r,c,d,u,h){const g=No(u,o,r,c,d,s),b=g.heave*h.heaveScale,v=g.pitchRad*h.pitchScale,w=g.rollRad*h.rollScale;return a>0?(e=Gt(e,b,h.stiffness,h.damping,a),t=Gt(t,v,h.stiffness,h.damping,a),n=Gt(n,w,h.stiffness,h.damping,a)):(e={position:b,velocity:0},t={position:v,velocity:0},n={position:w,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const Oo=.514444,Ne=Math.PI/180,Io=1,Lo=512,Ho=4;function bt(e){return-e*Ne}function zo(e){const t=e*Ne;return{x:Math.sin(t),z:-Math.cos(t)}}function Ue(e,t){return{x:e.x*t,z:-e.y*t}}const ii=18,Fo=95,Vo=260;function Wo(e,t,n,i,a,s){const o=s*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Vo;e.position.x=t+i.x*o+a.x*r,e.position.z=n+i.z*o+a.z*r,e.position.y=ii+Math.random()*(Fo-ii)}function jo(e,t,n,i,a,s,o,r){if(e.length===0)return;const c=i+180,d=zo(c),u={x:-d.x,z:-d.z},h={x:-d.z,z:d.x},g=a*Oo*s,b=bt(c),v=o*o;for(const w of e){w.position.x+=d.x*g*r,w.position.z+=d.z*g*r,w.rotation.y=b;const R=w.position.x-t,C=w.position.z-n;R*R+C*C>v&&Wo(w,t,n,u,h,o)}}const $o=1.4,Ko=6,Bo=2;function Go(e,t,n,i,a=$e.visuals,s={}){const{camera:o=null,getStreamerNode:r,windStreaks:c=[],getEnemyShipNode:d,muzzleFlash:u=null,splash:h=null,hitFlash:g=null,rangeRing:b=null,cannonRangeM:v=0,getEnemyTiltNode:w}=s;let R=null,C=0,_=0,V=0;const z=ni(),A=ni();let W=null,S=[];function D(N,ne){const ie=`${N}:${ne}`;return ie!==W&&(S=Eo({windDirectionDeg:N,windSpeedKts:ne}),W=ie),S}const P=220,p=450;let x=null,m=null,y=null,T="follow";const G=o!==null?o.fov:null;function I(N){T=N,typeof window<"u"&&(window.__captainViewMode=N),o!==null&&N==="follow"&&G!==null&&(o.fov=G,o.updateProjectionMatrix())}function $(N,ne,ie){const{worldUnitsPerMetre:me,maxHeelDeg:xt,maxBraceDeg:Fe,heelSmoothingHz:Ve,boatScale:ue,streakFieldRadius:St}=a,ge=R===null?0:Math.min((N-R)/1e3,.5);R=N;const Y=e.getState(),Je=bt(ne.headingDeg);t.rotation.y=Je,t.scale.x=ue,t.scale.y=ue,t.scale.z=ue;const{x:ve,z:Ae}=Ue(ne,me);t.position.x=ve,t.position.z=Ae;const{buoyancy:re}=a,xe=D(Y.windDirection,Y.windSpeedKts),fe=N/1e3,qe=z.update(ge,fe,ve,Ae,ne.headingDeg,ue,xe,re),Q=n();if(Q!==null){const j=xt*Math.tanh(Y.apparentWindKts**2*((Y.mainTrim+Y.jibTrim)/2)*Math.abs(Math.sin(Y.apparentWindAngle*Ne))/Lo),ee=Math.sign(Y.apparentWindAngle)*j*Ne,he=ge>0?1-Math.exp(-ge*Ve):0,ke=C+(ee-C)*he,De=Ho*Ne*ge,Xe=Math.max(-De,Math.min(De,ke-C));C+=Xe;const Ie=re.enabled?qe.rollRad:0;Q.rotation.z=C+Ie,Q.rotation.x=re.enabled?qe.pitchRad:0;const lt=re.baseOffsetM*me;Q.position.y=re.enabled?qe.heave+lt:0}const Oe=i?i():null;if(Oe!==null){const j=(Y.mainTrim+Y.jibTrim)/2,ee=Math.sign(Y.apparentWindAngle)*j*Fe*Ne,he=ge>0?1-Math.exp(-ge*Io):0;_+=(ee-_)*he,Oe.rotation.y=_}if(b!==null){const j=a.showCannonRange&&v>0;if(b.visible=j,j){const ee=v*me;b.position.x=ve,b.position.z=Ae,b.scale.x=ee,b.scale.y=1,b.scale.z=ee}}jo(c,ve,Ae,Y.windDirection,Y.windSpeedKts,me,St,ge);const kt=r?r():null;if(kt!==null){const j=bt(Y.apparentWindAngle+180),ee=ge>0?1-Math.exp(-ge*Bo):0;let he=j-V;he=(he+Math.PI)%(2*Math.PI)-Math.PI,V+=he*ee;const ke=Ko*Ne*Math.sin(N/1e3*2*Math.PI*$o);kt.rotation.y=V+ke}if(o!==null&&T==="helm"){const{helmView:j}=a;o.position.x=j.x,o.position.y=j.y,o.position.z=j.z,o.rotation.x=j.pitchDeg*Ne,o.rotation.y=0,o.rotation.z=0,o.fov!==j.fov&&(o.fov=j.fov,o.updateProjectionMatrix())}const Se=d?d():null;if(Se!==null)if(ie!==null){const j=Ue(ie,me);Se.position.x=j.x,Se.position.z=j.z,Se.rotation.y=bt(ie.headingDeg),Se.scale.x=ue,Se.scale.y=ue,Se.scale.z=ue,Se.visible=!0;const ee=w?w():null,he=A.update(ge,fe,j.x,j.z,ie.headingDeg,ue,xe,re);if(ee!==null){const ke=re.baseOffsetM*me;ee.position.y=re.enabled?he.heave+ke:0,ee.rotation.x=re.enabled?he.pitchRad:0,ee.rotation.z=re.enabled?he.rollRad:0}}else Se.visible=!1;x!==null&&N>=x&&(u!==null&&(u.visible=!1),x=null),m!==null&&N>=m&&(h!==null&&(h.visible=!1),m=null),y!==null&&N>=y&&(g!==null&&(g.visible=!1),y=null)}function ce(){I(T==="follow"?"helm":"follow")}function te(N,ne,ie){u!==null&&(u.position.x=ne,u.position.y=90,u.position.z=ie,u.visible=!0,x=N+P)}function de(N,ne,ie){h!==null&&(h.position.x=ne,h.position.y=8,h.position.z=ie,h.visible=!0,m=N+P)}function U(N,ne,ie){g!==null&&(g.position.x=ne,g.position.y=55,g.position.z=ie,g.visible=!0,y=N+p)}return{update:$,toggleView:ce,getViewMode:()=>T,triggerMuzzleFlash:te,triggerSplash:de,triggerHitFlash:U}}window.__captainDriverActive=!0;const M=nt();window.__captainAmbientRock=M.visuals.ambientRock,window.__captainReflectionInterval=M.visuals.performance.reflectionInterval;const we=new Qi({},M),ai={current:null},le=Di(we,()=>ai.current),se=M.battle.enabled?new La(M.battle,M.physics,M.controls,{...we.getPose(),windDirectionDeg:le.getState().windDirection,windSpeedKts:le.getState().windSpeedKts}):null;ai.current=se;const Ut=document.createElement("div");Ut.id="hud-root",document.body.appendChild(Ut);function Yt(e){ha(e)}function at(e){kn(e)}function ot(e){gt(e)}async function oi(e){if(Yt(e),Jt==="ai"){const n=oa();try{const i=await io(e,le.getState(),n.apiKey,M.voice.intentModel,n.endpoint);if(i.intent===null){at(null),ot(i.crewLine);return}await yt(i.intent);return}catch(i){Uo(i,n.direct)}}const t=Ja(e,le.getState());if(t.kind==="error")throw at(null),ot(t.message),new Error(t.message);if(t.kind==="acknowledgement"){at(null),ot(t.message);return}await yt(t.intent)}let Jt=Sn(M.input.defaultMode),Re=null,si=!1;function Uo(e,t){if(si)return;si=!0;const n=e instanceof Error?e.message:String(e);Mn(t?`AI parsing failed (${n}). Orders are being parsed locally. Check your OpenAI key under ⚙ — a rejected or exhausted key looks like this.`:`AI parsing unavailable (${n}). Orders are being parsed locally. Add an OpenAI key under ⚙ to use AI Orders.`)}const Yo=ua(Ut,le,{injectTranscript:oi,setInputMode:e=>{Jt=e,e!=="realtime"&&Re?.disconnect()},toggleRealtime:()=>{Jt==="realtime"&&Re?.toggle().catch(()=>{})},setCrewAudioEnabled:e=>{Re?.setAudioEnabled(e)},setTtsVoice:e=>{M.voice.ttsVoice=e,Re?.setVoice(e)},setTtsVolume:e=>{M.voice.ttsVolume=e,Re?.setVolume(e)},setMuted:e=>{window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=e?0:M.visuals.ambientSoundVolume),Re?.setVolume(e?0:M.voice.ttsVolume)},getBattleStatus:()=>{if(!se)return null;const e=se.getView();return{guns:Mi(e),gunsReadyPct:e.guns.readyPct*100,hull:`${e.playerHullHp}/${ft}`,hullPct:e.playerHullHp/ft*100,enemy:ki(e)}}});async function yt(e){const t=await le.submit(e);if(pa(e,t.message),e.action==="fire_guns"&&se){const n=se.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),a=we.getPose(),s=se.getView().npc,o=Ue({x:a.x,y:a.y},M.visuals.worldUnitsPerMetre);if(Ce.triggerMuzzleFlash(i,o.x,o.z),n.kind==="hit"||n.kind==="miss"){const r=Ue({x:s.x,y:s.y},M.visuals.worldUnitsPerMetre);n.kind==="hit"?Ce.triggerHitFlash(i,r.x,r.z):Ce.triggerSplash(i,r.x,r.z)}}}return t}Re=uo({getState:()=>le.getState(),submitIntent:yt,onTranscript:Yt,onResponseLine:e=>{at(null),ot(e)},onSystemNote:Mn,onStatus:ma,voice:M.voice.ttsVoice,volume:M.voice.ttsVolume,getTransport:ra,mintClientSecret:sa});const Ye=document.getElementById("demo");let qt=!1;function Jo(e){return new Promise(t=>setTimeout(t,e))}const qo=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function ri(){if(!qt){qt=!0,Ye&&(Ye.disabled=!0);try{for(const e of qo){Yt(`[demo] ${e.label}`);const t=await le.submit(e.intent);at(e.intent),ot(t.message),await Jo(e.waitMs)}}finally{qt=!1,Ye&&(Ye.disabled=!1)}}}Ye&&Ye.addEventListener("click",()=>{ri()}),ga();const pe=window.DEMO;if(pe===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const Ce=Go(le,pe.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,M.visuals,{camera:pe.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:pe.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:pe.ms_MuzzleFlash,splash:pe.ms_Splash,hitFlash:pe.ms_HitFlash,rangeRing:pe.ms_RangeRing,cannonRangeM:M.battle.enabled?M.battle.cannonRangeM:0}),li=10/12,Xo=350,Zo=1400,ci=1.6,Qo=4.4,di=.2,es=.9;function ts(e){const t=e*li,n=9.81,i=.84,a=Math.max(t,.1),s=n*(i/a)**2,o=2*Math.PI/s,r=Math.min(Zo,Math.max(Xo,o*2)),c=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(c),u=ci+d*(Qo-ci),h=di+d*(es-di);return{size:r,choppiness:u,directionality:h}}function ui(e){return 1+Math.min(1,Math.max(0,e))*3}function Xt(e){we.setWind(M.environment.windDirectionDeg,M.environment.windSpeedKts);const t=window.DEMO;if(t===void 0)return;const n=(M.environment.windDirectionDeg+180)*Math.PI/180,i=M.environment.windSpeedKts*li;if(t.ms_Ocean.windX=Math.sin(n)*i,t.ms_Ocean.windY=-Math.cos(n)*i,M.visuals.seaStateFollowsWind){const a=ts(M.environment.windSpeedKts);e&&(t.ms_Ocean.size=a.size),t.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=a.choppiness,t.ms_Ocean.directionality=ui(a.directionality)}else e&&(t.ms_Ocean.size=M.visuals.oceanSize);t.ms_Ocean.changed=!0}function hi(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(He(M,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),He(M,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),He(M,"visuals.lighting.sunIntensity",e.sunIntensity),He(M,"visuals.lighting.ambientIntensity",e.ambientIntensity),He(M,"visuals.lighting.exposure",e.exposure),He(M,"visuals.lighting.fogDensity",e.fogDensity))}function ns(){window.DEMO?.SetLightingParams(M.visuals.lighting)}!(window.location.hash.length>1)&&pe.ms_Environment!==M.environment.skyPreset&&pe.UpdateEnvironment(M.environment.skyPreset),hi(),Xt(!0),pe.ms_soundWaves&&(pe.ms_soundWaves.volume=M.visuals.ambientSoundVolume);function is(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function as(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function os(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function ss(e,t){switch(He(M,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.performance.reflectionInterval":window.__captainReflectionInterval=t;break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=ui(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&Xt(!1);break;case"visuals.waterColor":{const n=is(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":as(t);break;case"visuals.streakOpacity":os(t);break;case"voice.ttsVolume":Re?.setVolume(t);break;case"voice.ttsVoice":Re?.setVoice(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":Xt(!1);break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),hi();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":ns();break}}fa(ss);const st=document.getElementById("view-toggle");function pi(e){return e==="helm"?"Follow Cam":"Helm View"}function rs(){Ce.toggleView(),st&&(st.textContent=pi(Ce.getViewMode()))}st&&(st.textContent=pi(Ce.getViewMode()),st.addEventListener("click",()=>{rs()}));const rt=document.createElement("div");rt.id="battle-hit-flash",rt.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(rt);let wt=null;const ls=180;function cs(){wt!==null&&clearTimeout(wt),rt.style.opacity="0.35",wt=setTimeout(()=>{rt.style.opacity="0",wt=null},ls)}const mi=15,ds=250;let vt=null;document.addEventListener("visibilitychange",()=>{document.hidden&&(vt=null)});function gi(e){if(vt!==null){const o=Math.min(e-vt,ds);if(we.tick(o),se){const r=we.getPose(),c=le.getState(),d=se.tick(o,{...r,windDirectionDeg:c.windDirection,windSpeedKts:c.windSpeedKts});if(we.setDriveMultiplier(se.getSpeedMultiplier()),d.some(u=>u.key==="enemy_fires")){const u=se.getView().npc,h=Ue({x:u.x,y:u.y},M.visuals.worldUnitsPerMetre);if(Ce.triggerMuzzleFlash(e,h.x,h.z),d.some(g=>g.key==="hit_taken"))cs();else{const g=u.x-r.x,b=u.y-r.y,v=Math.hypot(g,b)||1,w={x:r.x+g/v*mi,y:r.y+b/v*mi},R=Ue(w,M.visuals.worldUnitsPerMetre);Ce.triggerSplash(e,R.x,R.z)}}for(const u of d){const h=L(u.key,c,u);gt(h)}}}const t=we.takeTackEvent();t!==null&&gt(L(t==="through"?"tack_through":"tack_in_irons",le.getState())),vt=e;const n=we.getPose(),i={x:n.x,y:n.y,headingDeg:le.getState().heading},a=se?se.getView().npc:null,s=a?{x:a.x,y:a.y,headingDeg:a.heading}:null;Ce.update(e,i,s),Yo.update(),requestAnimationFrame(gi)}requestAnimationFrame(gi),window.__captain={bus:le,submitIntent:yt,injectTranscript:oi,setWind:(e,t)=>{we.setWind(e,t)},demo:ri,getConfig:()=>M,copyConfig:()=>{const e=JSON.stringify(M,null,2);return console.log(e),e},setConfig:e=>{Pt(e),location.reload()},resetConfig:()=>{pn(),location.reload()},getPlayerPose:()=>we.getPose(),get battle(){return se?se.getView():null}}})();
