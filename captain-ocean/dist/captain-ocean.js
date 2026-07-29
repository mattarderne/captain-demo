(function(){"use strict";function Ji(e){if(e.enemyStruck)return"struck her colours";const t=e.npc;return`${{APPROACH:"closing",ENGAGE:"engaging",FLEE:"fleeing",STRUCK:"struck"}[t.behavior]??t.behavior.toLowerCase()}, ${Gt(t.speedKts)} kts, hull ${e.enemyHullHp}/10`}function Xi(e){if(e.enemyStruck)return"battle won";const t=e.guns,n=`${Math.round(t.rangeM)} m`;if(t.readyInS>0)return`reloading, ${Math.ceil(t.readyInS)} s`;if(!t.inRange)return`out of range, ${n}`;if(!t.inArc)return`she doesn't bear, ${n}`;const i=t.raking?", raking, 2x damage":"";return`she bears, ${n}, ${t.hitChancePct}% to hit${i}`}function Mn(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function Gt(e){return e.toFixed(1)}function W(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=Mn(t.heading),a=Gt(t.speedKts),s=Mn(t.windDirection),o=Gt(t.windSpeedKts);let r=`Steering ${i} at ${a} knots, wind ${s} at ${o}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"enemy_returns":return"She's put about, sir! Coming back at us!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"tack_ack":return"Ready about! Helm's a-lee!";case"tack_no_way":return"She's no way on her, sir — we'd be caught in stays.";case"tack_through":return"Through the wind, sir — she's full on the new board.";case"tack_in_irons":return"She's in irons, sir — we must bear away and try again.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Qi=-35,Zi=35,ea=0,ta=1,na=1;function ia(e){return e==="main"||e==="jib"||e==="all"}function _e(e,t){return{ok:!1,message:e,state:t}}function we(e,t){return{ok:!0,message:e,state:t}}function aa(e,t){function n(a){const s=a.action;if(s==="helm"){const o=a.degrees;if(typeof o!="number"||!Number.isFinite(o)||o<Qi||o>Zi)return Promise.resolve(_e(W("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:o}).accepted)return Promise.resolve(_e(W("unknown_order",e.snapshot()),e.snapshot()));const c=e.snapshot();return c.speedKts<na?Promise.resolve(we(W("no_steerage_way",c),c)):o>0?Promise.resolve(we(W("helm_ack_starboard",c),c)):o<0?Promise.resolve(we(W("helm_ack_port",c),c)):Promise.resolve(we(W("helm_ack_amidships",c),c))}if(s==="trim_sail"){const o=a.sail,r=a.trim;if(!ia(o))return Promise.resolve(_e(W("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<ea||r>ta)return Promise.resolve(_e(W("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:o,trim:r}).accepted)return Promise.resolve(_e(W("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),h=o==="main"?"trim_ack_main":o==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(we(W(h,d),d))}if(s==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(_e(W("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(we(W("status",r),r))}if(s==="tack"){const o=e.apply({action:"tack"}),r=e.snapshot();return o.accepted?Promise.resolve(we(W("tack_ack",r),r)):Promise.resolve(_e(W("tack_no_way",r),r))}if(s==="fire_guns"){const o=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(_e(W("no_target",o),o));const c=a.side,d=c==="port"||c==="starboard"?c:void 0,h=r.fireGuns(d);switch(h.kind){case"no_target":return Promise.resolve(_e(W("no_target",o),o));case"wasted":return Promise.resolve(we(W("shot_wasted",o),o));case"reloading":return Promise.resolve(we(W("guns_reloading",o),o));case"miss":return Promise.resolve(we(W("player_miss",o),o));case"hit":{const u=h.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(we(W(u,o,{enemyHullHp:h.enemyHullHp}),o))}default:{const u=h;throw new Error(`unhandled fire outcome: ${String(u)}`)}}}return Promise.resolve(_e(W("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const qt=1.94384,he=180/Math.PI,oe=Math.PI/180;function Tn(e){return e*qt}function Yt(e){return e/qt}function Ce(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function ie(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function Ne(e,t,n){return e<t?t:e>n?n:e}const oa=0,sa=12;function _n(e={}){return{x:0,y:0,psi:ie((e.heading??0)*oe),u:Yt(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*oe,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:ie((e.windDirection??oa)*oe),windSpeedMs:Yt(e.windSpeedKts??sa)}}const ct=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],ra=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],la=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function ca(e,t,n){return e+(t-e)*n}function Cn(e,t){const n=Ne(t,0,180);let i=0;for(;i<ct.length-1&&ct[i+1]<=n;)i++;const a=Math.min(i+1,ct.length-1),s=ct[i],o=ct[a],r=o===s?0:(n-s)/(o-s);return ca(e[i],e[a],r)}function da(e){return{cl:Cn(ra,e),cd:Cn(la,e)}}function ua(e){const t=Ne(Math.abs(e),0,180),{cl:n,cd:i}=da(t),a=t*oe,s=Math.sin(a),o=Math.cos(a),r=n*s-i*o,c=Math.abs(n*o+i*s);return{cDrive:r,cSide:c}}const Rn=.95,ha=.2;function Ve(e){const t=Ne(Math.abs(e),0,180)/180;return Ne(Rn-(Rn-ha)*t*t,.15,1)}const pa=.65;function ma(e,t){const n=(e-Ve(t))/pa;return Math.max(0,1-n*n)}const Re={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:330,cWeather:0},controls:{rudderSlewDegPerS:4,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"ash",whisperMode:!1,ttsVolume:.55,crewAccent:"royal-navy-officer",micEagerness:"low"},input:{autoSubmit:!0,autoSubmitDelayMs:1e3,defaultMode:"realtime",logView:"full"},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:.28,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6},performance:{oceanQuality:"medium",reflectionInterval:2},windRoseMode:"wind-up",showCannonRange:!0},battle:{enabled:!0,spawnRangeM:550,aggression:.95,seed:1337,cannonRangeM:250,reloadS:16,fleeBelowHullHp:3,rakeDamage:3,rejoinRangeM:420,playerReloadS:20}},Xe="captain.config";function Oe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ga(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function An(e,t,n,i){for(const a of Object.keys(t)){const s=t[a];if(!(a in e)){i.push(`${n}${a} (unknown key)`);continue}const o=e[a];Oe(o)&&Oe(s)?An(o,s,`${n}${a}.`,i):Oe(o)||Oe(s)||typeof o!=typeof s?i.push(`${n}${a} (expected ${typeof o}, got ${typeof s})`):e[a]=s}}function Nn(e,t){const n={...e};for(const i of Object.keys(t)){const a=t[i],s=n[i];n[i]=Oe(s)&&Oe(a)?Nn(s,a):a}return n}function _t(){return typeof localStorage<"u"}function fa(){if(!_t())return{};const e=localStorage.getItem(Xe);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return Oe(t)?t:{}}catch{return{}}}function Qe(){const e=ga(Re);if(!_t())return e;const t=localStorage.getItem(Xe);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Xe}"] is not valid JSON — ignoring it, using defaults.`),e}if(!Oe(n))return console.warn(`captain.config: stored value in localStorage["${Xe}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return An(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Ct(e){if(!_t())return;const t=fa(),n=Nn(t,e);localStorage.setItem(Xe,JSON.stringify(n))}function Pn(){_t()&&localStorage.removeItem(Xe)}function Fe(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0||(s=s?.[r],s==null))return}s!=null&&(s[a]=n)}const ba=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"Legacy STT model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.sttFallbackModel",label:"Legacy STT fallback",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.intentModel",label:"AI Orders intent model",section:"Voice",type:"text",live:!1,note:"Used by the AI Orders input mode. The server may pin its own model on public hosts."},{path:"voice.ttsModel",label:"Crew speech model",section:"Voice",type:"text",live:!1,note:"Speaks crew lines in the text order modes. Realtime uses its own model."},{path:"voice.ttsVoice",label:"Crew voice",section:"Voice",type:"select",options:["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],live:!0},{path:"voice.crewAccent",label:"Crew accent",section:"Voice",type:"select",options:["royal-navy-officer","west-country-bosun","scots-master","irish-gun-captain","plain-modern"],live:!0,note:"How the crew sounds. Also picked from the quarterdeck cog."},{path:"voice.micEagerness",label:"Mic patience (Realtime)",section:"Voice",type:"select",options:["low","medium","high","auto"],live:!1,note:"How long the mic waits for you to finish an order. Low waits longest (8s); high cuts in fastest (2s)."},{path:"voice.whisperMode",label:"Legacy VAD default",section:"Voice",type:"boolean",live:!1,hidden:!0},{path:"voice.ttsVolume",label:"Crew voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"input.defaultMode",label:"Boot input mode",section:"Input",type:"select",options:["ai","direct","realtime"],live:!1,note:"Which order-input mode the app starts in. AI falls back to the local parser when no server is available."},{path:"input.logView",label:"Quarterdeck log detail",section:"Input",type:"select",options:["full","plain"],live:!1,note:"Full shows each parsed order; plain shows only the spoken exchange. Also toggled from the log header."},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!1,note:"captain-ocean only. Reload required — live changes visibly rescale the whole ocean."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, choppiness/directionality above are overwritten from wind speed every time wind changes; the ocean wave scale slider only re-derives at boot/reload (see its own note)."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.windRoseMode",label:"Wind rose orientation",section:"Visuals",type:"select",options:["wind-up","north-up","bow-up"],live:!0,note:"Click the rose itself to cycle. Wind-up pins the wind at the top; north-up is the chart convention; bow-up fixes the ship."},{path:"visuals.showCannonRange",label:"Show cannon range ring",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Circle on the water at cannon range around your ship."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"visuals.performance.oceanQuality",label:"Ocean quality (GPU load)",section:"Performance",type:"select",options:["low","medium","high"],live:!1,note:"captain-ocean only. Reload required — FFT/geometry/cloud resolutions are built once at shell init. High = the original full-resolution ocean; medium ≈ a quarter of high's FFT pixel work."},{path:"visuals.performance.reflectionInterval",label:"Reflection every N frames",section:"Performance",type:"number",min:1,max:4,step:1,live:!0,note:"captain-ocean only. The mirror reflection is a full extra scene render — 2 halves its cost (~30Hz at 60fps) with at most a half-frame reflection lag; 1 = original every-frame behaviour."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.fleeBelowHullHp",label:"NPC breaks off below hull HP",section:"Battle",type:"number",min:0,max:10,step:1,live:!1,note:"Of 10. Lower means she fights on longer; 0 means to the death."},{path:"battle.rakeDamage",label:"Raking shot damage",section:"Battle",type:"number",min:1,max:10,step:1,live:!1,note:"Damage for a shot down the bow/stern axis, versus 1 for an ordinary hit. Applies to both ships."},{path:"battle.rejoinRangeM",label:"NPC rejoins the action at (m)",section:"Battle",type:"number",min:100,max:3e3,step:20,live:!1,note:"Sea room a fleeing ship opens before putting about. Above the spawn range she never returns."},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],ya=Re.controls.rudderMaxDeg*oe,wa=Re.physics;function Ze(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),o=-e.windSpeedMs*Math.cos(e.windFromRad),r=s-i,c=o-a,d=Math.hypot(r,c),h=r*t+c*n,u=r*n-c*t;return{awaDeg:Math.atan2(-u,-h)*he,awsMs:d}}function Dn(e,t,n,i,a){const s=Math.abs(n),{cDrive:o,cSide:r}=ua(s),c=ma(t,s),d=.5*a*i*i,h=d*e*o*c,u=d*e*r*c,m=-Math.sign(n||1)*u;return{surge:h,sway:m}}function On(e,t,n=wa,i=ya,a=1,s=0){const{awaDeg:o,awsMs:r}=Ze(e),c=Dn(n.areaMain,e.mainTrim,o,r,n.rhoAir),d=Dn(n.areaJib,e.jibTrim,o,r,n.rhoAir),h=(c.surge+d.surge)*a,u=(c.sway+d.sway)*a,m=e.u,b=e.v,w=e.r,E=m>=0?n.kSurgeLin:n.kSurgeLinAstern,C=-n.kSurgeQuad*m*Math.abs(m)-E*m,D=-n.kSwayQuad*b*Math.abs(b)-n.kSwayLin*b,T=Ne(e.rudder,-i,i),k=n.cRudder*T*m*Math.abs(m),R=-(n.kYawDamp+n.kYawDampU*Math.abs(m))*w,_=n.cWeather*Math.sin(o*oe)*r*Math.min(1,Math.abs(m)),B=k+R+_+s,N=(h+C)/n.mass+b*w,H=(u+D)/n.mass-m*w,ce=B/n.izz;e.u=m+N*t,e.v=b+H*t,e.r=w+ce*t;const f=Math.sin(e.psi),P=Math.cos(e.psi),p=e.u*f+e.v*P,g=e.u*P-e.v*f;e.x+=p*t,e.y+=g*t,e.psi=ie(e.psi+e.r*t)}function Jt(e){return Math.hypot(e.u,e.v)*qt}function va(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t;return ie(Math.atan2(i,a))}function xa(e){return Jt(e)<.2?0:Ce(e.psi-va(e))*he}const et=.05,In=et*1e3;function Xt(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}const ka=1.5,Sa=500,Ln=45,Ea=90,Ma=30;class Ta{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;tack=null;tackEvent=null;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=Re){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*oe,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*oe,this.state=_n({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.tack=null,this.rudderTargetRad=Ne(t.degrees*oe,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{this.tack=null;const n=Ne(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"tack":{if(Jt(this.state)<ka)return{accepted:!1,reason:"no_way"};const{awaDeg:n}=Ze(this.state);return this.tack={dir:n<0?-1:1,turnedDeg:0,elapsedS:0,throughEye:!1},this.tackEvent=null,{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=In;){const n=this.stepTack(et);this.state.rudder=Xt(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*et),this.state.mainTrim=Xt(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*et),this.state.jibTrim=Xt(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*et),On(this.state,et,this.physics,this.rudderMaxRad,this.driveMultiplier,n),this.accMs-=In}}stepTack(t){const n=this.tack;if(n===null)return 0;n.elapsedS+=t;const{awaDeg:i}=Ze(this.state),a=Math.abs(i);if(this.rudderTargetRad=n.dir*this.rudderMaxRad,this.mainTrimTarget=1,this.jibTrimTarget=1,n.turnedDeg+=this.state.r*he*t*n.dir,a<Ln&&(n.throughEye=!0),n.turnedDeg>=Ea){this.tack=null,this.rudderTargetRad=0;const s=Ve(Math.abs(Ze(this.state).awaDeg));return this.mainTrimTarget=s,this.jibTrimTarget=s,this.tackEvent="through",0}return n.elapsedS>Ma?(this.tack=null,this.rudderTargetRad=0,this.tackEvent="in_irons",0):a<Ln?n.dir*Sa:0}isTacking(){return this.tack!==null}takeTackEvent(){const t=this.tackEvent;return this.tackEvent=null,t}snapshot(){const{awaDeg:t,awsMs:n}=Ze(this.state),i=Jt(this.state);return{heading:this.state.psi*he%360,speedKts:i,windDirection:this.state.windFromRad*he%360,windSpeedKts:Tn(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Tn(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*he,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:xa(this.state)}}setWind(t,n){this.state.windFromRad=ie(t*oe),this.state.windSpeedMs=Yt(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const Qt="captain.openai_key";function Hn(){return window.localStorage.getItem(Qt)}function zn(e){window.localStorage.setItem(Qt,e)}function _a(){window.localStorage.removeItem(Qt)}const Ca="https://api.openai.com/v1/chat/completions",Ra="https://api.openai.com/v1/audio/speech",Aa="https://api.openai.com/v1/realtime/calls",Na="https://api.openai.com/v1/realtime/client_secrets";function Rt(){try{return Hn()?.trim()??""}catch{return""}}function At(){return Rt().length>0}function Pa(){const e=Rt();return e.length>0?{apiKey:e,endpoint:Ca,direct:!0}:{apiKey:"",endpoint:"/api/intent/parse",direct:!1}}function Vn(){const e=Rt();return e.length>0?{apiKey:e,endpoint:Ra,direct:!0}:{apiKey:"",endpoint:"/api/tts/speak",direct:!1}}async function Da(e){const t=Rt();if(t.length===0)return null;const n=await fetch(Na,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({session:{type:"realtime",model:e}})}),i=await n.json().catch(()=>null);if(!n.ok){const r=i?.error?.message??`OpenAI rejected the key (${n.status}).`;throw new Error(r)}const a=i?.value,s=i?.client_secret?.value,o=typeof a=="string"?a:typeof s=="string"?s:"";if(o.length===0)throw new Error("OpenAI returned no ephemeral key.");return o}function Oa(){return At()?{apiKey:"",endpoint:Aa,direct:!0}:{apiKey:"",endpoint:"/api/realtime/session",direct:!1}}const Ia="royal-navy-officer",Nt=[{id:"royal-navy-officer",label:"Royal Navy officer (1805)",hint:"Clipped, educated English. The quarterdeck voice.",voice:"ash",delivery:"You are the first lieutenant of a Royal Navy sloop of war in 1805, reporting to your captain on the quarterdeck. Speak in the clipped, educated English of a King's officer of that period: crisp consonants, short vowels, no drawl, no modern American colour. Pitch the voice to carry over wind and canvas — this is a man half-shouting across a deck, not talking across a desk. Brisk and businesslike, respectful but never obsequious; a note of dry steel under it. Land the final 'sir' firmly, as a full word, never trailing off. Deliver orders and reports at pace, with the tiny pause before a number that a man makes when he is reading it off an instrument."},{id:"west-country-bosun",label:"West Country bosun",hint:"Devon burr, weathered and warm. The old sea-dog voice.",voice:"ballad",delivery:"You are the bosun of a Royal Navy sloop in 1805, thirty years at sea, born in Devon. Speak with a broad West Country burr: rolled and lingering 'r' sounds, long open vowels, a rise-and-fall rhythm quite unlike an officer's clipped speech. Weathered, gravelly, unhurried even in a hurry, with warmth under the gruffness. Loud — this is a voice trained to reach the foretop in half a gale. Say 'sir' plainly and without ceremony."},{id:"scots-master",label:"Scots sailing master",hint:"Lowland Scots. Dry, precise, unimpressed.",voice:"cedar",delivery:"You are the sailing master of a Royal Navy sloop in 1805, a Lowland Scot from the Firth of Forth. Speak with a clear Scots accent: tapped 'r', tight vowels, the flat falling cadence of the east coast. Precise and unhurried, the voice of the man who actually navigates the ship and is quietly certain he is the best seaman aboard. Dry, faintly amused, never flustered. Report numbers exactly and without emphasis."},{id:"irish-gun-captain",label:"Irish gun captain",hint:"Cork lilt. Quick, cheerful, spoiling for a fight.",voice:"verse",delivery:"You are the captain of the maindeck guns aboard a Royal Navy sloop in 1805, from Cork. Speak with a warm Irish lilt: musical rising intonation at the end of phrases, soft 't' sounds, quick tempo. Cheerful and full of appetite for a fight, loud over the gundeck racket, the words tumbling out a little faster than they strictly should. Respectful to the captain, but plainly delighted whenever the answer involves the guns."},{id:"plain-modern",label:"Plain modern",hint:"No character. Neutral and easy to hear.",voice:"marin",delivery:"Read the line plainly in a neutral modern accent: clear, calm, moderate pace, no period affectation and no theatrical delivery. Prioritise intelligibility over character."}];function We(e){return Nt.find(t=>t.id===e)??Nt.find(t=>t.id===Ia)??Nt[0]}const Fn={mic:'<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',"mic-off":'<line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/>',loader:'<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',volume:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',"volume-off":'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',sliders:'<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',"chevron-down":'<path d="m6 9 6 6 6-6"/>',"chevron-up":'<path d="m18 15-6-6-6 6"/>',"chevron-right":'<path d="m9 18 6-6-6-6"/>',"alert-triangle":'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',key:'<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>'},Wn="http://www.w3.org/2000/svg";function Bn(e,t=22){const n=document.createElementNS(Wn,"svg");return n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("fill","none"),n.setAttribute("stroke","currentColor"),n.setAttribute("stroke-width","2"),n.setAttribute("stroke-linecap","round"),n.setAttribute("stroke-linejoin","round"),n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n.classList.add("hud-icon",`hud-icon-${e}`),n.innerHTML=Fn[e],n}function tt(e,t,n=22){e.replaceChildren(Bn(t,n))}function dt(e,t){const n=`<svg xmlns="${Wn}" viewBox="0 0 24 24" fill="none" stroke="${t}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${Fn[e]}</svg>`;return`url("data:image/svg+xml,${encodeURIComponent(n)}")`}const La=["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],jn=[];function $n(e){jn.push(e)}function Kn(){for(const e of jn)e()}let Zt=null;function Un(e){return e==="direct"||e==="realtime"||e==="ai"?e:"ai"}function Ha(e,t,n){e.innerHTML="",Ja();const i=document.createElement("div");i.id="hud",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel hud-state",i.appendChild(a);function s(l,y,A=!1){const M=document.createElement("div");M.id=l,M.className="hud-row";const F=document.createElement("span");F.className="hud-row-label",F.textContent=y,M.appendChild(F);const ee=document.createElement("span");ee.className="hud-row-colon",ee.textContent=": ",M.appendChild(ee);const ne=document.createElement("span");ne.className="hud-row-value",ne.textContent="--",M.appendChild(ne);let te=null,z=null;if(A){const U=document.createElement("div");U.className="hud-bar",te=document.createElement("div"),te.className="hud-bar-fill",U.appendChild(te),z=document.createElement("div"),z.className="hud-bar-marker",z.hidden=!0,U.appendChild(z),M.appendChild(U)}return a.appendChild(M),{setValue:U=>{ne.textContent=U},setFill:te?U=>{te&&(te.style.width=`${Math.max(0,Math.min(100,U))}%`)}:void 0,setMarker:z?U=>{z&&(z.hidden=U===null,U!==null&&(z.style.left=`${Math.max(0,Math.min(100,U))}%`))}:void 0}}const o=s("hud-heading","heading"),r=s("hud-speed","speed"),c=s("hud-wind","wind"),d=s("hud-awa","awa"),h=s("hud-main","main",!0),u=s("hud-jib","jib",!0),m=s("hud-rudder","rudder"),b=s("hud-guns","guns",!0),w=document.getElementById("hud-guns");w.hidden=!0;const E=s("hud-hull","hull",!0),C=document.getElementById("hud-hull");C.hidden=!0;const D=document.createElement("div");D.id="hud-enemy-divider",D.className="hud-enemy-divider",D.textContent="Enemy",D.hidden=!0,a.appendChild(D);const T=s("hud-enemy","she"),k=document.getElementById("hud-enemy");k.hidden=!0,k.classList.add("hud-enemy-row");const R="http://www.w3.org/2000/svg";function _(l,y){const A=document.createElementNS(R,l);for(const[M,F]of Object.entries(y))A.setAttribute(M,F);return A}const B=document.getElementById("hud-wind"),N=40,H=15,ce=document.createElement("div");ce.id="hud-windrose",ce.className="hud-windrose";const f=_("svg",{viewBox:"0 0 120 120",width:"88",height:"88","aria-hidden":"true",focusable:"false"});function P(l,y,A){const M=U=>{const Tt=U*Math.PI/180;return[60+Math.sin(Tt)*A,60-Math.cos(Tt)*A]},[F,ee]=M(l),[ne,te]=M(y),z=Math.abs(y-l)>180?1:0;return`M 60 60 L ${F} ${ee} A ${A} ${A} 0 ${z} 1 ${ne} ${te} Z`}f.appendChild(_("circle",{cx:"60",cy:"60",r:"52",class:"hud-windrose-ring"}));const p=_("g",{class:"hud-windrose-world"});for(const[l,y]of[["N",0],["E",90],["S",180],["W",270]]){const A=y*Math.PI/180,M=_("text",{x:String(60+Math.sin(A)*43),y:String(60-Math.cos(A)*43),class:l==="N"?"hud-windrose-letter hud-windrose-north":"hud-windrose-letter","text-anchor":"middle","dominant-baseline":"central"});M.textContent=l,p.appendChild(M)}f.appendChild(p);const g=_("g",{class:"hud-windrose-wind"});g.appendChild(_("path",{d:P(-N,N,52),class:"hud-windrose-nogo"})),g.appendChild(_("path",{d:P(180-H,180+H,52),class:"hud-windrose-deep"})),g.appendChild(_("line",{x1:"60",y1:"-2",x2:"60",y2:"44",class:"hud-windvane-arrow-shaft"})),g.appendChild(_("polygon",{points:"60,54 52,38 68,38",class:"hud-windvane-arrow-head"}));const v=_("text",{x:"60",y:"-10",class:"hud-windrose-windlabel","text-anchor":"middle","dominant-baseline":"central"});v.textContent="WIND",g.appendChild(v),f.appendChild(g);const S=_("g",{class:"hud-windrose-shipgroup"});S.appendChild(_("polygon",{points:"60,42 53,74 60,67 67,74",class:"hud-windrose-boat"})),f.appendChild(S),ce.appendChild(f);const O=document.createElement("div");O.id="hud-windrose-warn",O.className="hud-windrose-warn",O.textContent=" ",ce.appendChild(O);const I=["wind-up","north-up","bow-up"],j={"wind-up":"wind up","north-up":"north up","bow-up":"bow up"};function G(){const l=Qe().visuals.windRoseMode;return I.includes(l)?l:"wind-up"}let re=G();const $=document.createElement("button");$.id="hud-windrose-mode",$.type="button",$.className="hud-windrose-mode",$.title="Click to change which way the rose points",ce.appendChild($);function be(l){re=l,$.textContent=j[l],Ct({visuals:{windRoseMode:l}})}function gt(){be(I[(I.indexOf(re)+1)%I.length])}f.addEventListener("click",gt),$.addEventListener("click",gt),be(re),B.after(ce);const vn=document.getElementById("hud-rudder"),Ue=document.createElement("div");Ue.className="hud-gauge";const Vt=document.createElement("div");Vt.className="hud-gauge-center-tick",Ue.appendChild(Vt);const Ge=document.createElement("div");Ge.className="hud-gauge-target",Ue.appendChild(Ge);const qe=document.createElement("div");qe.className="hud-gauge-needle",Ue.appendChild(qe),vn.appendChild(Ue);let it=null;function Ft(l){return(Math.max(-35,Math.min(35,l))+35)/70*100}function V(l){const y=Ft(l);qe.style.left=`${y}%`,qe.classList.toggle("port",l<-.5),qe.classList.toggle("stbd",l>.5),it!==null&&Math.abs(l-it)>.5?(Ge.style.left=`${Ft(it)}%`,Ge.style.display="block"):Ge.style.display="none"}const X=document.createElement("div");X.id="hud-irons",X.className="hud-irons-row";const Q=document.createElement("span");Q.className="hud-visually-hidden",Q.textContent="irons: false",X.appendChild(Q),a.appendChild(X);const q=document.createElement("div");q.className="hud-panel hud-log",i.appendChild(q);const Ee=document.createElement("div");Ee.className="hud-log-header",q.appendChild(Ee);const Me=document.createElement("div");Me.className="hud-panel-title hud-log-title-text",Me.textContent="Quarterdeck Log",Ee.appendChild(Me);const He={full:"orders shown",plain:"speech only"};function Ae(l){return l==="plain"?"plain":"full"}let at=Ae(Qe().input.logView);const ae=document.createElement("button");ae.id="log-view-toggle",ae.type="button",ae.className="hud-btn hud-command-config-demo hud-log-view-toggle";const Y=document.createElement("button");Y.id="command-config-toggle",Y.type="button",Y.title="Command settings",Y.setAttribute("aria-label","Command config"),Y.className="hud-btn hud-command-config-toggle",tt(Y,"sliders",15),Ee.appendChild(Y);const ye=document.createElement("div");ye.id="hud-log-list",ye.className="hud-log-list",q.appendChild(ye);const Ye=14,de=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function le(){ye.innerHTML="",ye.dataset.view=at;let l=-1;de.forEach((y,A)=>{y.kind==="exchange"&&(l=A)}),de.forEach((y,A)=>{const M=document.createElement("div");if(y.kind==="system"){M.className="hud-log-entry hud-log-system-entry";const z=document.createElement("div");z.className="hud-log-system",z.textContent=y.transcript,M.appendChild(z),ye.appendChild(M);return}const F=A===l;M.className=F?"hud-log-entry latest":"hud-log-entry";const ee=document.createElement("div");ee.className="hud-log-you",F&&(ee.id="hud-transcript"),ee.textContent=`You: ${y.transcript}`,M.appendChild(ee);const ne=document.createElement("div");ne.className="hud-log-order",F&&(ne.id="hud-intent"),ne.textContent=y.order,M.appendChild(ne);const te=document.createElement("div");te.className="hud-log-crew",F&&(te.id="hud-crew"),te.textContent=`Crew: ${y.crew}`,M.appendChild(te),ye.appendChild(M)}),ye.scrollTop=ye.scrollHeight}function ft(l){at=l,ae.textContent=He[l],ae.title=l==="full"?"Showing each order as it was parsed. Click for speech only.":"Showing the spoken exchange only. Click to show parsed orders.",Ct({input:{logView:l}}),le()}ae.addEventListener("click",()=>{ft(at==="full"?"plain":"full"),De()}),ft(at);function Wt(l){if(l===null)return"→ no order";if(l.action==="helm"){const y=Math.round(l.degrees),A=y<0?"port":y>0?"stbd":"amidships";return`→ helm ${y}° (${A})`}return l.action==="trim_sail"?`→ trim ${l.sail} → ${l.trim.toFixed(2)}`:l.action==="fire_guns"?"→ fire guns":l.action==="tack"?"→ ready about":"→ status report"}function bt(l){de.push({kind:"exchange",transcript:l,order:"→ …",crew:"…"}),de.length>Ye&&de.shift(),le()}function ot(l){const y=[...de].reverse().find(A=>A.kind==="exchange");y&&(y.order=Wt(l)),l!==null&&l.action==="helm"&&(it=l.degrees),le()}function yt(l){const y=[...de].reverse().find(A=>A.kind==="exchange");y&&(y.crew=l),le()}function Bt(l){de.push({kind:"system",transcript:l,order:"",crew:""}),de.length>Ye&&de.shift(),le()}const ue=document.createElement("div");ue.className="hud-controls",q.insertBefore(ue,ye);const L=document.createElement("details");L.id="input-mode-details",L.className="hud-input-mode-details",L.open=!0;const K=document.createElement("summary");K.id="input-mode-summary",K.className="hud-input-mode-summary",L.appendChild(K);const J=document.createElement("div");J.id="input-mode",J.className="hud-input-mode",J.setAttribute("role","radiogroup"),J.setAttribute("aria-label","Command input mode"),L.appendChild(J);function fe(l,y,A,M=!1){const F=document.createElement("label");F.className="hud-input-mode-option",F.dataset.mode=l;const ee=document.createElement("input");ee.type="radio",ee.name="input-mode",ee.id=`input-mode-${l}`,ee.value=l,F.appendChild(ee);const ne=document.createElement("span");ne.className="hud-input-mode-copy";const te=document.createElement("span");te.className="hud-input-mode-name",te.textContent=y;const z=document.createElement("span");if(z.className="hud-input-mode-source",z.textContent=A,ne.appendChild(te),ne.appendChild(z),F.appendChild(ne),M){const U=document.createElement("button");U.type="button",U.className="hud-key-dot",U.dataset.mode=l;const Tt=()=>{const lt=At();U.classList.toggle("ok",lt),U.replaceChildren(Bn("key",11)),lt||U.append(" add key"),U.title=lt?"OpenAI key saved. Click to change it.":"No OpenAI key. Click to add one."};U.addEventListener("click",lt=>{lt.preventDefault(),lt.stopPropagation(),Zt?.()}),Tt(),$n(Tt),F.appendChild(U)}return J.appendChild(F),{label:F,radio:ee}}const st=fe("ai","AI Orders","Type or dictate. GPT works out what you mean.",!0),wt=fe("realtime","GPT Realtime","Talk over your mic. The crew answers aloud.",!0),vt=fe("direct","Direct Orders","Type or dictate. Instant, set phrases, no AI."),Z=document.createElement("input");Z.id="transcript-input",Z.type="text",Z.placeholder="Paste or dictate an order",Z.className="hud-input",ue.appendChild(Z);const ze=document.createElement("button");ze.id="no-key-warning",ze.type="button",ze.className="hud-no-key-warning",ze.textContent="No OpenAI key. Click to add one.",ze.hidden=!0,ze.addEventListener("click",()=>Zt?.()),ue.appendChild(ze);function Bi(){ze.hidden=At()||kt==="direct"}$n(Bi);const Pe=document.createElement("div");Pe.id="input-status",Pe.className="hud-input-status",Pe.setAttribute("role","status"),Pe.setAttribute("aria-live","polite"),Pe.hidden=!0,ue.appendChild(Pe);const se=document.createElement("button");se.id="ptt",se.type="button",se.className="hud-btn hud-rail-btn hud-btn-ptt",tt(se,"mic-off"),se.title="Connect the microphone",se.setAttribute("aria-label","Connect the microphone"),se.hidden=!0;const xt=document.createElement("button");xt.id="view-toggle",xt.type="button",xt.textContent="Helm View",xt.className="hud-btn hud-btn-view-toggle";let kt="direct",ji=null;function Je(l,y="neutral"){Pe.textContent=l,Pe.dataset.tone=y,Pe.hidden=y!=="error"}function St(){return kt!=="realtime"}const qs={ai:"AI Orders",realtime:"GPT Realtime",direct:"Direct Orders"};function xn(l,y=!0){kt=l,vt.radio.checked=l==="direct",st.radio.checked=l==="ai",wt.radio.checked=l==="realtime",K.textContent=`Orders: ${qs[l]}`,Z.disabled=l==="realtime",Z.hidden=l==="realtime",se.hidden=l!=="realtime",q.dataset.mode=l,l==="realtime"?($t(),Je("Mic disconnected")):(Z.placeholder="Paste or dictate an order",Je(l==="ai"?"Ready, GPT parses orders":"Ready locally"),window.setTimeout(()=>Z.focus(),0)),Bi(),y&&n.setInputMode(l)}function kn(l){xn(l),ji?.()}vt.radio.addEventListener("change",()=>{vt.radio.checked&&kn("direct")}),st.radio.addEventListener("change",()=>{st.radio.checked&&kn("ai")}),wt.radio.addEventListener("change",()=>{wt.radio.checked&&kn("realtime")}),se.addEventListener("click",()=>n.toggleRealtime());function De(){St()&&Z.focus()}const jt=Qe().input,$i=2;let Et=null;function $t(){Et!==null&&(clearTimeout(Et),Et=null)}let Sn=!1,Kt=null;async function En(l){if(!St())return;if(Sn||(n.isPipelineBusy?.()??!1)){Kt=l;return}Sn=!0,$t();const y=performance.now(),A=kt==="ai";Je(A?"Asking GPT…":"Processing locally");try{await n.injectTranscript(l),Z.value="";const M=Math.max(1,Math.round(performance.now()-y));Je(A?`Accepted in ${M} ms`:`Accepted locally in ${M} ms`,"ok")}catch(M){const F=M instanceof Error?M.message:String(M);yt(F),Je("Order not sent","error")}finally{if(Sn=!1,De(),Kt!==null){const M=Kt;Kt=null,En(M)}}}function Ki(l){if(!jt.autoSubmit)return;const y=l.trim();y.length<$i||En(y)}Z.addEventListener("input",l=>{if(!St()||($t(),!jt.autoSubmit))return;if(l.inputType==="insertFromPaste"){Ki(Z.value);return}Z.value.trim().length<$i||(Et=setTimeout(()=>{Et=null,Ki(Z.value)},jt.autoSubmitDelayMs))}),Z.addEventListener("keydown",l=>{if(!St()||l.key!=="Enter")return;$t();const y=Z.value.trim();y.length!==0&&En(y)}),document.addEventListener("click",l=>{const y=l.target;if(y instanceof HTMLCanvasElement){De();return}y instanceof Element&&y.closest("#env-selector")&&De()}),document.addEventListener("keydown",l=>{!St()||$a(l.target)||l.ctrlKey||l.metaKey||l.altKey||!(l.key.length===1)&&l.key!=="Backspace"||Z.focus()},{capture:!0}),xn(Un(jt.defaultMode),!1);const Mt=document.createElement("div");Mt.id="hud-rail",Mt.className="hud-rail",i.appendChild(Mt),Mt.appendChild(se);const Te=document.createElement("button");Te.id="mute-toggle",Te.type="button",Te.title="Mute all sound",Te.setAttribute("aria-label","Mute all sound"),Te.className="hud-btn hud-rail-btn hud-mute-toggle",tt(Te,"volume"),Mt.appendChild(Te);let rt=!1;Te.addEventListener("click",()=>{rt=!rt,tt(Te,rt?"volume-off":"volume"),Te.title=rt?"Unmute":"Mute all sound",Te.classList.toggle("muted",rt),n.setMuted?.(rt),De()}),Ga(i,De),Ya(i,()=>{Kn(),De()}),ji=qa(q,Y,n,De,{inputModeDetails:L,viewToggleButton:xt,logViewToggle:ae});function Ut(l){return l.toFixed(1)}function Ui(l){return l.toFixed(2)}const Ys=["N","NE","E","SE","S","SW","W","NW"];function Gi(l){return(l%360+360)%360}function Js(l){const y=Math.round(Gi(l)/45)%8;return Ys[y]??"N"}function qi(l){return String(Math.round(Gi(l))%360).padStart(3,"0")}function Xs(l){return`${qi(l)} ${Js(l)}`}function Qs(l,y){return`from ${qi(l)} @ ${Ut(y)} kts`}function Zs(l,y){const A=Math.round(l);if(A===0)return`dead ahead @ ${Ut(y)} kts`;const M=A<0?"port":"starboard";return`${Math.abs(A)}° to ${M} @ ${Ut(y)} kts`}function er(l){const y=Math.round(l),A=y<0?"port":y>0?"stbd":"amidships";return`${y}° ${A}`}function tr(l){o.setValue(Xs(l.heading)),r.setValue(`${Ut(l.speedKts)} kts`),c.setValue(Qs(l.windDirection,l.windSpeedKts));const y=l.heading,A=l.windDirection,M=re==="north-up"?{world:0,wind:A,ship:y}:re==="wind-up"?{world:-A,wind:0,ship:y-A}:{world:-y,wind:A-y,ship:0};p.setAttribute("transform",`rotate(${M.world} 60 60)`),g.setAttribute("transform",`rotate(${M.wind} 60 60)`),v.setAttribute("transform",`rotate(${-M.wind} 60 -10)`),S.setAttribute("transform",`rotate(${M.ship} 60 60)`);const F=Math.abs(l.apparentWindAngle),ee=F<45,ne=F>180-H;O.textContent=ee?"too close to the wind":ne?"running deep":" ",O.dataset.tone=ee||ne?"warn":"ok",d.setValue(Zs(l.apparentWindAngle,l.apparentWindKts)),h.setValue(Ui(l.mainTrim)),h.setFill?.(l.mainTrim*100),u.setValue(Ui(l.jibTrim)),u.setFill?.(l.jibTrim*100);const te=Ve(Math.abs(l.apparentWindAngle))*100;h.setMarker?.(te),u.setMarker?.(te),m.setValue(er(l.rudderAngle)),V(l.rudderAngle);const z=n.getBattleStatus?.()??null;w.hidden=z===null,C.hidden=z===null,k.hidden=z===null,D.hidden=z===null,z!==null&&(b.setValue(z.guns),b.setFill?.(z.gunsReadyPct),E.setValue(z.hull),E.setFill?.(z.hullPct),T.setValue(z.enemy)),Q.textContent=`irons: ${l.inIrons}`,X.classList.toggle("active",l.inIrons)}function Yi(){tr(t.getState())}return Yi(),ut={logTranscript:bt,logIntent:ot,logCrewLine:yt,logSystemNote:Bt},Yn={setInputMode:l=>xn(l,!1),setRealtimeState:(l,y)=>{se.classList.toggle("listening",l==="listening"),se.classList.toggle("recording",l==="speaking"),se.classList.toggle("failed",l==="error"),se.disabled=l==="connecting";const M={disconnected:{icon:"mic-off",title:"Connect the microphone"},connecting:{icon:"loader",title:"Connecting the microphone"},listening:{icon:"mic",title:"Microphone live. Click to mute it."},speaking:{icon:"mic",title:"Crew speaking. Click to mute the microphone."},error:{icon:"mic-off",title:"Microphone failed. Click to try again."}}[l];if(tt(se,M.icon),se.title=M.title,se.setAttribute("aria-label",M.title),kt!=="realtime")return;Je(y??{disconnected:"Mic disconnected",connecting:"Connecting to GPT Realtime",listening:"Listening",speaking:"Crew speaking",error:"Realtime unavailable"}[l],l==="error"?"error":"neutral")},setStatus:Je},Jn={focus:De},{update:Yi}}let ut=null;function za(e){ut?.logTranscript(e)}function Gn(e){ut?.logIntent(e)}function qn(e){ut?.logCrewLine(e)}function en(e){ut?.logSystemNote(e)}function Va(e,t){Gn(e),qn(t)}let Yn=null;function Fa(e,t){Yn?.setRealtimeState(e,t)}let Jn=null;function Wa(){Jn?.focus()}let Xn=[];function Ba(e){Xn.push(e)}function ja(e,t){for(const n of Xn)n(e,t)}function $a(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function Ka(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function Ua(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0)return;const c=s[r];(typeof c!="object"||c===null)&&(s[r]={}),s=s[r]}s[a]=n}function Qn(e,t){const n={...e};for(const i of Object.keys(t)){const a=e[i],s=t[i];a!==null&&typeof a=="object"&&!Array.isArray(a)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=Qn(a,s):n[i]=s}return n}function Ga(e,t){const n=Qe(),i={};let a=!1;const s=new Map,o=document.createElement("button");o.id="settings-toggle",o.type="button",o.title="Settings",o.setAttribute("aria-label","Settings"),o.className="hud-btn hud-rail-btn hud-settings-toggle",tt(o,"settings"),(document.getElementById("hud-rail")??e).appendChild(o);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const c=document.createElement("div");c.className="hud-panel-title",c.textContent="Settings",r.appendChild(c);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);{let f=function(){let $="";try{$=Hn()?.trim()??""}catch{$=""}const be=$.length>0;I.value="",I.placeholder=be?`saved (…${$.slice(-4)})`:"sk-...",re.textContent=be?"Saved in this browser. AI Orders and GPT Realtime will use it.":"Not set. AI Orders and GPT Realtime are unavailable; Direct Orders still work.",re.dataset.tone=be?"ok":"warn",G.hidden=!be,Kn()},P=function(){const $=I.value.trim();$.length!==0&&(zn($),f())};const p=document.createElement("details");p.className="hud-settings-section",p.id="openai-key-section",p.open=!0;const g=document.createElement("summary");g.textContent="OpenAI key",p.appendChild(g);const v=document.createElement("div");v.className="hud-settings-field",p.appendChild(v);const S=document.createElement("div");S.className="hud-settings-note",S.textContent="Needed for AI Orders and GPT Realtime. Stored in this browser only and sent straight to api.openai.com. Without one, Direct Orders still work through the local parser.",v.appendChild(S);const O=document.createElement("div");O.className="hud-settings-key-row",v.appendChild(O);const I=document.createElement("input");I.id="openai-key-input",I.type="password",I.autocomplete="off",I.className="hud-settings-text",O.appendChild(I);const j=document.createElement("button");j.id="openai-key-save",j.type="button",j.className="hud-btn",j.textContent="Save",O.appendChild(j);const G=document.createElement("button");G.id="openai-key-clear",G.type="button",G.className="hud-btn",G.textContent="Clear",O.appendChild(G);const re=document.createElement("div");re.id="openai-key-status",re.className="hud-settings-note",v.appendChild(re),j.addEventListener("click",P),I.addEventListener("keydown",$=>{$.key==="Enter"&&($.preventDefault(),P())}),G.addEventListener("click",()=>{_a(),f()}),f(),r.appendChild(p),Zt=()=>{ce(!0),p.open=!0,p.scrollIntoView({block:"nearest"}),window.setTimeout(()=>I.focus(),0)}}function h(){d.hidden=!a}function u(f,P){if(Ua(i,f.path,P),f.live)ja(f.path,P);else{const p=s.get(f.path);p&&(p.hidden=!1),a=!0,h()}}function m(f,P){const p=document.createElement("div");p.className="hud-settings-control-row";const g=document.createElement("input");g.type="range",g.min=String(f.min??0),g.max=String(f.max??100),g.step=String(f.step??1),g.value=String(P),g.className="hud-settings-range";const v=document.createElement("input");v.type="number",v.min=g.min,v.max=g.max,v.step=g.step,v.value=String(P),v.className="hud-settings-numeric";const S=f.min??-1/0,O=f.max??1/0;function I(j){if(!Number.isFinite(j))return;const G=Math.min(O,Math.max(S,j));g.value=String(G),v.value=String(G),u(f,G)}return g.addEventListener("input",()=>I(Number(g.value))),v.addEventListener("input",()=>I(Number(v.value))),p.appendChild(g),p.appendChild(v),p}function b(f,P){const p=document.createElement("label");p.className="hud-settings-checkbox-label";const g=document.createElement("input");return g.type="checkbox",g.checked=P,g.addEventListener("change",()=>u(f,g.checked)),p.appendChild(g),p}function w(f,P){const p=document.createElement("select");p.className="hud-settings-select";for(const g of f.options??[]){const v=document.createElement("option");v.value=g,v.textContent=g,g===P&&(v.selected=!0),p.appendChild(v)}return p.addEventListener("change",()=>u(f,p.value)),p}function E(f,P){const p=document.createElement("input");return p.type="color",p.className="hud-settings-color",p.value=P,p.addEventListener("input",()=>u(f,p.value)),p}function C(f,P){const p=document.createElement("input");return p.type="text",p.className="hud-settings-text",p.value=P,p.addEventListener("change",()=>u(f,p.value)),p}function D(f){const P=document.createElement("div");P.className="hud-settings-field",P.dataset.configPath=f.path;const p=document.createElement("div");p.className="hud-settings-label-row";const g=document.createElement("span");if(g.className="hud-settings-label",g.textContent=f.label,p.appendChild(g),!f.live){const O=document.createElement("span");O.className="hud-settings-reload-dot",O.title="Staged. Needs Save & Reload.",O.hidden=!0,p.appendChild(O),s.set(f.path,O)}P.appendChild(p);const v=Ka(n,f.path);let S;switch(f.type){case"number":S=m(f,v);break;case"boolean":S=b(f,v);break;case"select":S=w(f,v);break;case"color":S=E(f,v);break;default:S=C(f,v);break}if(P.appendChild(S),f.note){const O=document.createElement("div");O.className="hud-settings-note",O.textContent=f.note,P.appendChild(O)}return P}const T=new Map;for(const f of ba)f.hidden||(T.has(f.section)||T.set(f.section,[]),T.get(f.section)?.push(f));const k=new Set(["Visuals","Environment","Lighting"]);for(const[f,P]of T){const p=document.createElement("details");p.className="hud-settings-section",p.open=k.has(f);const g=document.createElement("summary");g.textContent=f,p.appendChild(g);for(const v of P)p.appendChild(D(v));r.appendChild(p)}const R=document.createElement("div");R.className="hud-settings-footer";const _=document.createElement("button");_.id="settings-save-reload",_.type="button",_.textContent="Save & Reload",_.className="hud-btn",_.addEventListener("click",()=>{Ct(i),location.reload()});const B=document.createElement("button");B.id="settings-copy-json",B.type="button",B.textContent="Copy JSON",B.className="hud-btn",B.addEventListener("click",()=>{(async()=>{const f=Qn(n,i),P=JSON.stringify(f,null,2);console.log(P);try{await navigator.clipboard?.writeText(P)}catch{}})()});const N=document.createElement("button");N.id="settings-reset-all",N.type="button",N.textContent="Reset All",N.className="hud-btn",N.addEventListener("click",()=>{Pn(),location.reload()}),R.appendChild(_),R.appendChild(B),R.appendChild(N),r.appendChild(R);let H=!1;function ce(f){H=f,r.classList.toggle("open",f),o.classList.toggle("active",f),f||t()}o.addEventListener("click",()=>ce(!H))}function qa(e,t,n,i,a){const s=Qe(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function r(N){const H=document.createElement("div");return H.className="hud-command-config-section-title",H.textContent=N,H}o.appendChild(r("Orders")),o.appendChild(a.inputModeDetails),o.appendChild(r("Crew Voice"));const c=document.createElement("div");c.className="hud-command-config-row";const d=document.createElement("label");d.className="hud-toggle-label";const h=document.createElement("input");h.id="tts-enabled",h.type="checkbox",h.checked=!0,h.addEventListener("change",()=>n.setCrewAudioEnabled(h.checked)),d.appendChild(h),d.appendChild(document.createTextNode("Hear crew replies")),c.appendChild(d);const u=document.createElement("select");u.id="tts-voice-select",u.className="hud-settings-select hud-command-config-voice-select";for(const N of La){const H=document.createElement("option");H.value=N,H.textContent=N,N===s.voice.ttsVoice&&(H.selected=!0),u.appendChild(H)}let m=!1;u.addEventListener("change",()=>{m=!0,n.setTtsVoice(u.value)}),c.appendChild(u),o.appendChild(c);const b=document.createElement("div");b.className="hud-command-config-row";const w=document.createElement("select");w.id="crew-accent-select",w.className="hud-settings-select hud-command-config-accent-select";for(const N of Nt){const H=document.createElement("option");H.value=N.id,H.textContent=N.label,N.id===We(s.voice.crewAccent).id&&(H.selected=!0),w.appendChild(H)}b.appendChild(w),o.appendChild(b);const E=document.createElement("div");E.id="crew-accent-hint",E.className="hud-command-config-hint",E.textContent=We(s.voice.crewAccent).hint,o.appendChild(E),w.addEventListener("change",()=>{const N=We(w.value);E.textContent=N.hint,n.setCrewAccent(N.id),m||(u.value=N.voice,n.setTtsVoice(N.voice))});const C=document.createElement("div");C.className="hud-command-config-row";const D=document.createElement("span");D.className="hud-command-config-volume-label",D.textContent="Volume",C.appendChild(D);const T=document.createElement("input");T.id="tts-volume",T.type="range",T.min="0",T.max="1",T.step="0.05",T.value=String(s.voice.ttsVolume),T.className="hud-settings-range",T.addEventListener("input",()=>n.setTtsVolume(Number(T.value))),C.appendChild(T),o.appendChild(C),o.appendChild(r("View")),a.viewToggleButton.classList.add("hud-command-config-demo"),o.appendChild(a.viewToggleButton),o.appendChild(a.logViewToggle),o.appendChild(r("Actions"));const k=document.createElement("button");k.id="demo",k.type="button",k.textContent="Run Demo",k.className="hud-btn hud-btn-demo hud-command-config-demo",o.appendChild(k);let R=!1;function _(N){R=N,o.classList.toggle("open",R),t.classList.toggle("active",R),R&&B(),R||i()}function B(){const N=e.getBoundingClientRect().top-18;o.style.maxHeight=`${Math.max(200,Math.min(540,N))}px`}return t.addEventListener("click",()=>_(!R)),document.addEventListener("mousedown",N=>{if(!R)return;const H=N.target;o.contains(H)||t.contains(H)||_(!1)}),document.addEventListener("keydown",N=>{N.key==="Escape"&&R&&_(!1)}),()=>_(!1)}function Ya(e,t){if(At())return;const n=document.createElement("div");n.id="key-prompt",n.className="hud-key-prompt-backdrop";const i=document.createElement("div");i.className="hud-panel hud-key-prompt",n.appendChild(i);const a=document.createElement("div");a.className="hud-panel-title",a.textContent="Before you take the deck",i.appendChild(a);const s=document.createElement("p");s.className="hud-key-prompt-blurb",s.textContent="Captain needs an OpenAI key to hear your orders and answer them. It is stored in this browser only, and is sent to OpenAI and nowhere else.",i.appendChild(s);const o=document.createElement("input");o.id="key-prompt-input",o.type="password",o.autocomplete="off",o.spellcheck=!1,o.placeholder="sk-...",o.className="hud-settings-text hud-key-prompt-input",i.appendChild(o);const r=document.createElement("div");r.className="hud-settings-note",i.appendChild(r);const c=document.createElement("div");c.className="hud-key-prompt-actions",i.appendChild(c);const d=document.createElement("button");d.id="key-prompt-save",d.type="button",d.className="hud-btn hud-key-prompt-save",d.textContent="Save key and sail",c.appendChild(d);const h=document.createElement("button");h.id="key-prompt-skip",h.type="button",h.className="hud-btn",h.textContent="Not now",h.title="Direct Orders still works without a key",c.appendChild(h);function u(){n.remove(),t()}d.addEventListener("click",()=>{const m=o.value.trim();if(m.length===0){r.textContent="Paste a key first, or choose Not now.",r.dataset.tone="warn",o.focus();return}zn(m),u()}),o.addEventListener("keydown",m=>{m.key==="Enter"&&d.click(),m.stopPropagation()}),h.addEventListener("click",u),e.appendChild(n),window.setTimeout(()=>o.focus(),0)}function Ja(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles";const t=dt("chevron-right","#7fa8c9"),n=dt("chevron-down","#7fa8c9"),i=dt("chevron-down","#d7ecfa"),a=dt("chevron-up","#d7ecfa"),s=dt("alert-triangle","#ffffff");e.textContent=`
/* Lucide icons inherit the button's colour and sit on the text baseline. */
.hud-icon {
  display: block;
  flex: 0 0 auto;
}
#hud {
  position: fixed;
  inset: 0;
  pointer-events: none;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: #e8f4ff;
  z-index: 10;
}

/* PATCH (voice-boat quarterdeck-slim round): [hidden] must always win.
   The UA sheet's own hidden rule is a plain type-less selector, so ANY class here that sets
   display outranks it — which is how the rail's mic button (.hud-rail-btn, display flex) and the
   no-key warning (display block) both stayed on screen with the attribute set. Every hidden/shown
   element in this HUD is toggled via .hidden, so this is the one place to fix it rather than
   auditing each display declaration. */
#hud [hidden] {
  display: none !important;
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
/* The guns/enemy lines ("she bears, 180 m, 49% to hit") are prose, not short numerics — let them
   wrap within the wider panel instead of overflowing their rows. */
.hud-state #hud-guns .hud-row-value,
.hud-state #hud-enemy .hud-row-value {
  white-space: normal;
}
/* Narrow (phone) viewports: the enlarged panel + wind rose + battle rows otherwise runs into the
   quarterdeck log (the mobile e2e bound) — scale back toward the pre-enlargement sizes there.
   PATCH (voice-boat quarterdeck-ux round): this block was malformed. A duplicated paste had left
   four unrelated rules (.hud-windrose svg, -windlabel, -mode, -mode:hover) nested INSIDE the
   media query, which closed the .hud-windrose svg selector early and swallowed the
   .hud-windrose-warn font-size that was meant to be the block's last rule. Nested rules are
   invalid in this position, so browsers dropped the lot: the mobile wind rose never actually
   shrank. Rewritten as the four declarations it was always meant to be — the identical
   desktop-scope copies of those four rules already exist further down this stylesheet. */
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
  /* The log panel's desktop height/width would swallow a phone screen whole. */
  .hud-log {
    width: calc(100vw - 24px);
    font-size: 13px;
  }
  .hud-log-list {
    max-height: 30vh;
    font-size: 13px;
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
  content: "IN IRONS";
  display: inline-flex;
  align-items: center;
  background: #c0392b;
  color: #fff;
  font-weight: 700;
  letter-spacing: 0.05em;
  padding: 3px 8px 3px 24px;
  border-radius: 3px;
  font-size: 11px;
  background-image: ${s};
  background-repeat: no-repeat;
  background-position: 6px center;
  background-size: 13px 13px;
}

/* -------------------------------------------------- quarterdeck log panel --------------- */

/* PATCH (voice-boat quarterdeck-ux round): the log is the panel the captain actually reads
   mid-sail, so it gets the real estate — 380 -> 460 wide, and the history below is roughly
   double its old height at a readable size instead of a dimmed 11.5px footnote. */
.hud-log {
  left: 12px;
  bottom: 12px;
  width: 460px;
  max-width: calc(100vw - 24px);
  font-size: 13px;
}

.hud-log-header {
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.12);
  padding-bottom: 5px;
  margin-bottom: 7px;
}
.hud-log-title-text {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 0;
  /* Pushes the two header buttons to the right edge. */
  flex: 1 1 auto;
}

/* The plain/full view switch. Deliberately quiet — it is a preference, not a control. */
.hud-log-view-toggle {
  pointer-events: auto;
  flex: 0 0 auto;
  font-size: 10px;
  font-weight: 400;
  letter-spacing: 0.04em;
  color: #7fa8c9;
  background: none;
  border-color: rgba(255, 255, 255, 0.14);
  padding: 3px 7px;
}
.hud-log-view-toggle:hover {
  color: #eaf6ff;
}

/* PATCH (voice-boat quarterdeck-ux round): un-dimmed and enlarged. text2 made this a deliberately
   secondary surface (opacity 0.75, 11.5px) so the order box could dominate; the live verdict is
   that the conversation is what wants reading at a glance, and the order box already dominates by
   being 18px and glowing. Height is viewport-relative so a big screen actually shows history. */
.hud-log-list {
  max-height: min(42vh, 420px);
  overflow-y: auto;
  pointer-events: auto;
  font-size: 16px;
}

/* PATCH (voice-boat realtime-tuning round): in GPT Realtime the panel is nothing BUT the
   conversation — no order box, no auto-submit, just what was said either way. So it gets the
   space the box was using and a size you can read from across the room, which is the point when
   your hands are off the keyboard and your eyes are on the sea. */
.hud-log[data-mode="realtime"] .hud-log-list {
  max-height: min(52vh, 560px);
  font-size: 18px;
}
.hud-log[data-mode="realtime"] .hud-log-order {
  font-size: 13px;
}

.hud-log-entry {
  padding: 7px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
}
.hud-log-entry:last-child {
  border-bottom: none;
  padding-bottom: 2px;
}
/* Recency reads from an accent on the newest entry rather than from fading every older one out
   (see renderLog's own comment on dropping the opacity ramp). */
.hud-log-entry.latest {
  border-left: 2px solid rgba(88, 196, 255, 0.55);
  padding-left: 8px;
  margin-left: -10px;
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
  margin: 2px 0 2px 14px;
  font-size: 12px;
  white-space: normal;
  overflow-wrap: anywhere;
}
/* Plain view: the spoken exchange only. The tag stays in the DOM (ids and textContent unchanged
   for both e2e suites — see renderLog) and is hidden here. */
.hud-log-list[data-view="plain"] .hud-log-order {
  display: none;
}
.hud-log-crew {
  color: #b9f6c4;
  white-space: normal;
  overflow-wrap: anywhere;
  line-height: 1.4;
}
.hud-log-system-entry {
  padding: 5px 0;
}
.hud-log-system {
  color: #ffb454;
  font-size: 12px;
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
  content: "";
  width: 14px;
  height: 14px;
  margin-left: auto;
  background-image: ${i};
  background-repeat: no-repeat;
  background-size: contain;
}
.hud-input-mode-summary {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hud-input-mode-details[open] .hud-input-mode-summary {
  border-bottom: 1px solid rgba(255, 255, 255, 0.15);
}
.hud-input-mode-details[open] .hud-input-mode-summary::after {
  background-image: ${a};
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
/* With the order box hidden, the controls block is just the mic button + status line. */
.hud-log[data-mode="realtime"] .hud-controls {
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 8px;
}

/* Exception-only now (see setStatus) — so it reads as a warning, not as a caption. */
.hud-input-status {
  min-width: 0;
  color: #ffad9f;
  font-size: 12px;
  line-height: 1.3;
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
  line-height: 1;
  padding: 5px 6px;
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  color: #7fa8c9;
}
.hud-command-config-toggle:hover {
  color: #eaf6ff;
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
  /* PATCH (voice-boat quarterdeck-ux round): widened/heightened for its new tenants (the order
     mode selector and the accent picker). */
  width: 300px;
  max-width: calc(100vw - 24px);
  display: none;
  pointer-events: auto;
  font-size: 12px;
  z-index: 12;
  /* Starting value only — the real budget is measured against the space above the log panel each
     time the popover opens (see buildCommandConfig's clampToSpaceAbove). */
  max-height: min(70vh, 540px);
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

.hud-command-config-accent-select {
  flex: 1 1 auto;
}

.hud-command-config-hint {
  color: #7fa8c9;
  font-size: 10.5px;
  line-height: 1.35;
  margin: -1px 0 6px;
}

/* The relocated order-mode selector sits flush inside the popover: the popover is the collapse,
   so the <details> keeps its summary as a heading but loses its own box. */
.hud-command-config .hud-input-mode-details {
  border: 1px solid rgba(255, 255, 255, 0.15);
  margin-bottom: 4px;
}
.hud-command-config .hud-input-mode-summary {
  font-size: 11.5px;
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

/* PATCH (voice-boat quarterdeck-slim round): the top-right rail — mic, sound, settings. Sized to
   be hit without looking while the boat is moving, which is the whole reason they were pulled out
   of the quarterdeck and grouped. */
.hud-rail {
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
  z-index: 11;
  pointer-events: none;
}
.hud-rail-btn {
  pointer-events: auto;
  font-size: 22px;
  line-height: 1;
  width: 52px;
  height: 52px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(6, 20, 34, 0.82);
  border: 1px solid rgba(255, 255, 255, 0.22);
  box-shadow: 0 4px 18px rgba(0, 0, 0, 0.35);
}
.hud-rail-btn:hover {
  background: rgba(28, 58, 84, 0.9);
}
.hud-mute-toggle.muted {
  background: rgba(200, 60, 40, 0.4);
  border-color: rgba(255, 120, 100, 0.7);
}
/* A live mic must LOOK live — this is what replaced the "Disconnect Mic" word-label. */
.hud-btn-ptt.listening,
.hud-btn-ptt.recording {
  background: rgba(46, 160, 90, 0.35);
  border-color: #4fd08a;
}
.hud-btn-ptt.failed {
  background: rgba(200, 60, 40, 0.35);
  border-color: rgba(255, 120, 100, 0.7);
}
@media (max-width: 480px) {
  .hud-rail-btn {
    width: 44px;
    height: 44px;
    font-size: 18px;
  }
}
.hud-settings-toggle.active {
  background: rgba(88, 196, 255, 0.25);
  border-color: #58c4ff;
}

/* -------------------------------------------------- enemy block ------------------------- */

/* PATCH (voice-boat panel-clarity round): everything above this line is OUR ship. */
.hud-enemy-divider {
  margin: 8px 0 4px;
  padding-top: 6px;
  border-top: 1px solid rgba(255, 138, 117, 0.35);
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #ff8a75;
}
.hud-enemy-row .hud-row-label {
  color: #ff8a75;
}
.hud-enemy-row .hud-row-value {
  color: #ffd8d0;
}

/* -------------------------------------------------- first-run key prompt ---------------- */

.hud-key-prompt-backdrop {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(3, 10, 18, 0.72);
  pointer-events: auto;
  z-index: 30;
}
.hud-key-prompt {
  position: relative;
  width: min(440px, calc(100vw - 32px));
  pointer-events: auto;
  padding: 18px 20px 16px;
}
.hud-key-prompt-blurb {
  margin: 0 0 12px;
  color: #cfe4f5;
  font-size: 13px;
  line-height: 1.5;
}
.hud-key-prompt-input {
  font-size: 15px;
  padding: 9px 10px;
}
.hud-key-prompt-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.hud-key-prompt-actions .hud-btn {
  pointer-events: auto;
  font-size: 13px;
  padding: 9px 14px;
}
.hud-key-prompt-save {
  background: rgba(88, 196, 255, 0.25);
  border-color: #58c4ff;
}

/* -------------------------------------------------- no-key warning ---------------------- */

.hud-no-key-warning {
  pointer-events: auto;
  display: block;
  width: 100%;
  box-sizing: border-box;
  text-align: left;
  font-family: inherit;
  font-size: 12px;
  font-weight: 600;
  color: #ffb84d;
  background: rgba(255, 184, 77, 0.14);
  border: 1px solid rgba(255, 184, 77, 0.45);
  border-radius: 4px;
  padding: 7px 9px;
  cursor: pointer;
}
.hud-no-key-warning:hover {
  background: rgba(255, 184, 77, 0.24);
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
/* The spinner, while a Realtime session is negotiating. */
.hud-icon-loader {
  animation: hud-spin 0.9s linear infinite;
}
@keyframes hud-spin {
  to { transform: rotate(360deg); }
}

.hud-key-dot {
  display: inline-flex;
  align-items: center;
  gap: 3px;
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
.hud-settings-section > summary {
  display: flex;
  align-items: center;
  gap: 6px;
}
.hud-settings-section > summary::before {
  content: "";
  flex: 0 0 auto;
  width: 14px;
  height: 14px;
  background-image: ${t};
  background-repeat: no-repeat;
  background-size: contain;
}
.hud-settings-section[open] > summary::before {
  background-image: ${n};
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
`,document.head.appendChild(e)}const tn=.05,Zn=tn*1e3,Xa=35,Qa=40,nn=50,ei=15,Za=8;function an(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class eo{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=_n({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*oe,this.rudderRateRadPerS=t.rudderSlewDegPerS*oe,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=ie(t*oe),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t,t===null&&(this.behavior="APPROACH")}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",ie(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,a=Math.hypot(n,i),s=ie(Math.atan2(n,i));a>this.engageRangeM*1.15?this.behavior="APPROACH":a<this.engageRangeM*.85&&(this.behavior="ENGAGE");let o;if(this.behavior==="APPROACH")o=s;else{const d=(a>this.engageRangeM?1:-1)*15*oe;o=ie(t.headingRad+d)}const r=Ce(this.state.windFromRad-o)*he;if(this.tackSide!==null){this.tackHoldS-=tn;const c=Math.abs(r)>=Qa;if(this.tackHoldS<=0){if(c)this.tackSide=null;else if(Math.abs(r)>=Za){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=ei)}}}else if(Math.abs(r)<Xa){const c=ie(this.state.windFromRad-nn*oe),d=ie(this.state.windFromRad+nn*oe),h=Math.abs(Ce(c-this.state.psi)),u=Math.abs(Ce(d-this.state.psi));this.tackSide=h<=u?1:-1,this.tackHoldS=ei}return this.tackSide!==null?ie(this.state.windFromRad-this.tackSide*nn*oe):o}step(t,n){const i=this.planHeading(n),a=Ce(i-this.state.psi);this.rudderTargetRad=Ne(this.headingKp*a-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:s}=Ze(this.state),o=Ve(Math.abs(s));this.mainTrimTarget=o,this.jibTrimTarget=o,this.state.rudder=an(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=an(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=an(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),On(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Zn;)this.step(tn,n),this.accMs-=Zn}headingDeg(){return this.state.psi*he%360}}const ti=30;function ni(){return{reloadRemainingS:0}}function on(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function ii(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function ai(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=ti,ready:e.reloadRemainingS<=0}}function to(e,t,n,i,a,s){ii(e,t);const o=ai(e,n,i,a);return!o.inRange||!o.inArc||!o.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=a.reloadS,{fired:!0,hit:s()<on(n,a.cannonRangeM)})}function no(e,t,n,i,a){const s=ai(e,t,n,i);if(!s.ready)return{fired:!1,hit:!1,...s};e.reloadRemainingS=i.reloadS;const o=a();return{fired:!0,hit:s.inRange&&s.inArc&&o<on(t,i.cannonRangeM),...s}}const sn=10,io=5,ao=.8,oo=.5;function oi(){return{hullHp:sn}}const si=30;function ri(e,t=1){e.hullHp=Math.max(0,e.hullHp-t)}function so(e){return e.hullHp<=0?oo:e.hullHp<=io?ao:1}function li(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const ro=35,ci=45;function lo(e){return Math.hypot(e.state.u,e.state.v)*1.94384}function rn(e,t,n,i,a){const s=ie(Math.atan2(e-n,t-i)),o=Math.abs(Ce(s-a)*he);return o<=si||o>=180-si}class co{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,a){this.cfg=t,this.rng=li(t.seed),this.playerRng=li(t.seed+1),this.lastPlayerPose=a;const s=Ne(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*s);const o=1.2+.6*s,r=this.rng()*2*Math.PI,c=a.x+t.spawnRangeM*Math.sin(r),d=a.y+t.spawnRangeM*Math.cos(r),h=ie(r+Math.PI);this.npc=new eo({x:c,y:d,heading:h*he,windDirection:a.windDirectionDeg,windSpeedKts:a.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||ro,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:o,phys:n}),this.damage=oi(),this.cannon=ni(),this.playerCannon=ni(),this.enemyDamage=oi()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,ii(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});let a=n.x-this.npc.x,s=n.y-this.npc.y,o=Math.hypot(a,s);if(o>1e-6&&o<ci){const r=ci/o;this.npc.state.x=n.x-a*r,this.npc.state.y=n.y-s*r,a=n.x-this.npc.state.x,s=n.y-this.npc.state.y,o=Math.hypot(a,s)}if(!this.everSpotted&&o<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=ie(Math.atan2(-a,-s)),d=Ce(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:d})}if(!this.everClosing&&o<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),this.fleeing&&!this.enemyStruck&&o>=this.cfg.rejoinRangeM&&(this.fleeing=!1,this.npc.setBehaviorOverride(null),i.push({key:"enemy_returns"})),!this.enemyStruck){const r=ie(Math.atan2(a,s)),c=Ce(r-this.npc.state.psi)*he,d=Math.min(Math.abs(c-90),Math.abs(c+90)),h=to(this.cannon,t/1e3,o,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);if(h.fired&&(i.push({key:"enemy_fires"}),h.hit)){const m=rn(this.npc.x,this.npc.y,n.x,n.y,n.headingRad)?this.cfg.rakeDamage:1;ri(this.damage,m),i.push({key:"hit_taken",hullHp:this.damage.hullHp,damage:m})}}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(t){const n=this.resolveFireGuns(t);return this.lastPlayerFireOutcome=n,n}resolveFireGuns(t){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const n=this.lastPlayerPose,i=n.x-this.npc.x,a=n.y-this.npc.y,s=Math.hypot(i,a),o=ie(Math.atan2(-i,-a)),r=Ce(o-n.headingRad)*he,c=t==="starboard"?Math.abs(r-90):t==="port"?Math.abs(r+90):Math.min(Math.abs(r-90),Math.abs(r+90)),d=no(this.playerCannon,s,c,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);if(!d.fired)return{kind:"reloading"};if(!d.inRange||!d.inArc)return{kind:"wasted"};if(!d.hit)return{kind:"miss"};const u=rn(n.x,n.y,this.npc.x,this.npc.y,this.npc.state.psi)?this.cfg.rakeDamage:1;return ri(this.enemyDamage,u),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0,damage:u}):(this.enemyDamage.hullHp<=this.cfg.fleeBelowHullHp&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1,damage:u})}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return so(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:lo(this.npc),behavior:this.npc.behavior,mainTrim:this.npc.state.mainTrim,jibTrim:this.npc.state.jibTrim,rudderDeg:this.npc.state.rudder*he},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck,guns:this.gunsView()}}gunsView(){const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),s=ie(Math.atan2(-n,-i)),o=Ce(s-t.headingRad)*he,r=Math.min(Math.abs(o-90),Math.abs(o+90)),c=a<=this.cfg.cannonRangeM,d=r<=ti,h=rn(t.x,t.y,this.npc.x,this.npc.y,this.npc.state.psi);return{readyInS:this.playerCannon.reloadRemainingS,readyPct:this.cfg.playerReloadS>0?Math.max(0,Math.min(1,1-this.playerCannon.reloadRemainingS/this.cfg.playerReloadS)):1,rangeM:a,inRange:c,inArc:d,hitChancePct:c&&d?Math.round(on(a,this.cfg.cannonRangeM)*100):0,raking:h}}}const uo=.75,di=.1,ho="I do not understand that order, sir.",ln="One order at a time, sir.";function ve(e,t){return{kind:"error",code:e,message:t}}function po(e){return e.toLowerCase().replace(/['\u2018\u2019]/g,"").replace(/[^a-z0-9%]+/g," ").trim().replace(/\s+/g," ")}function cn(e){return Math.max(0,Math.min(1,e))}const ui={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},mo={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};function hi(e){const t=e.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/);if(t?.[1]!==void 0)return Number(t[1]);const n=e.split(" ");for(let i=0;i<n.length;i++){const a=n[i],s=ui[a];if(s!==void 0)return s;const o=mo[a];if(o!==void 0){const r=n[i+1],c=r===void 0?void 0:ui[r];return o+(c!==void 0&&c<10?c:0)}}return null}function Be(e,t){return t.some(n=>n.test(e))}function go(e){return Be(e,[/\bstatus(?: report)?\b/,/\breport(?: to me)?\b/,/\bhow (?:are|re) we doing\b/,/\bhow is she doing\b/,/\bwhats (?:our |the )?(?:heading|course|speed|position)\b/,/\bwhats the wind doing\b/,/\b(?:where are we|what is our position)\b/])}function fo(e){return/\bready about\b/.test(e)||/\bhelms? a[- ]?lee\b/.test(e)||/\b(?:come|bring|put) (?:her |the ship )?about\b/.test(e)||/\babout ship\b/.test(e)||/\b(?:tack|tacking)\b/.test(e)||/\bgo about\b/.test(e)?{kind:"intent",intent:{action:"tack"}}:null}function bo(e){if(/\b(?:hold|cease) (?:your )?fire\b/.test(e)||/\b(?:dont|do not) fire\b/.test(e)||/\bbelay\b/.test(e)&&/\bfire\b/.test(e))return{kind:"acknowledgement",message:"Holding fire, sir."};if(!(/^fire(?:\b|$)/.test(e)||/\b(?:open fire|fire away|fire as she bears|give (?:her|them) a broadside|let (?:them|em) have it)\b/.test(e)||/\b(?:port|larboard|starboard|stbd) (?:guns|battery|broadside)\b/.test(e)))return null;const i=/\b(?:port|larboard)\b/.test(e)?"port":/\b(?:starboard|stbd)\b/.test(e)?"starboard":void 0;return{kind:"intent",intent:i?{action:"fire_guns",side:i}:{action:"fire_guns"}}}function yo(e){const t=/\b(?:main|mainsail|main sheet)\b/.test(e),n=/\b(?:jib|headsail|jib sheet)\b/.test(e);return t&&n?"all":t?"main":n?"jib":/\b(?:both sheets|the sheets|sheets|all sails?|all sail|all canvas|the sails|sails|everything)\b/.test(e)?"all":null}function pi(e,t){return e==="main"?t.mainTrim:e==="jib"?t.jibTrim:(t.mainTrim+t.jibTrim)/2}function wo(e,t){const n=yo(e);if(n===null)return null;const i=Be(e,[/\bease(?: away| off)?\b/,/\blet (?:the )?.*\bout\b/,/\blet go\b/,/\bslacken\b/,/\bspill(?: .* )?wind\b/,/\bstart (?:the )?(?:sheet|sheets|main|jib)\b/]),a=Be(e,[/\bhaul(?: in)?\b/,/\bharden(?: up)?\b/,/\btighten(?: up)?\b/,/\bsheet(?:s)? (?:home|in)\b/,/\btrim (?:the )?.*\b(?:in|home)\b/,/\bpull (?:the )?.*\bin\b/,/\bbring (?:the )?.*\bin\b/,/\bmore on\b/,/\btake a pull\b/]),s=/\b(?:trim|set) (?:the )?(?:sails?|canvas|main|mainsail|jib|headsail)\b/.test(e);if(i&&a)return ve("ambiguous",ln);if(!i&&!a&&!s)return null;const o=e.match(/\b(\d{1,3})\s*(?:percent|%)\b/),r=/\bpercent\b/.test(e)?hi(e):null,c=o?.[1]===void 0?r:Number(o[1]);if(c!==null&&c>100)return ve("out_of_range","Sail trim must be between zero and one hundred percent, sir.");let d;if(c!==null&&/\b(?:to|at|set)\b/.test(e))d=c/100;else if(/\b(?:all the way|right|hard) in\b/.test(e))d=1;else if(/\b(?:all the way out|let go)\b/.test(e))d=0;else if(!i&&!a)d=Ve(Math.abs(t.apparentWindAngle));else if(c!==null)d=cn(pi(n,t)+(a?c/100:-c/100));else{const u=pi(n,t),m=Ve(Math.abs(t.apparentWindAngle)),b=a?m>u:m<u;d=cn(b?u+(m-u)*uo:u+(a?di:-di))}return{kind:"intent",intent:{action:"trim_sail",sail:n,trim:d}}}function mi(e,t){const n=hi(e);return n!==null?n>35?ve("out_of_range","She will not take more than thirty-five degrees of helm, sir."):n:/\b(?:hard(?: over)?|full)\b/.test(e)?35:/\b(?:little|small|bit|touch|point|easy)\b/.test(e)?t.speedKts>=7?5:10:20}function vo(e){const t="(?:turn|go|come|steer|point(?: us)?|bring (?:us|her)|give me(?: a)?(?: small)? turn|helm|rudder|hard)",n=/\bdegrees?\b/.test(e),i=n&&/\b(?:left|port|larboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:left|port|larboard)\\b|^(?:left|port|larboard)\\b|\\b(?:helm|hard) a port\\b)`).test(e),a=n&&/\b(?:right|starboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:right|starboard)\\b|^(?:right|starboard)\\b|\\b(?:helm|hard) a starboard\\b)`).test(e);return i&&a?"conflict":i?-1:a?1:null}function xo(e,t){if(Be(e,[/\b(?:centre|center) (?:the )?(?:rudder|helm|home|hem|whole|hull|it)\b/,/\bstraighten(?: up| (?:the )?(?:rudder|helm|home|hem|whole|hull|ship))?\b/,/^(?:steady|midships|amidships)\b/,/\b(?:rudder|helm) amidships\b/,/\bmeet her\b/,/\bease her back to (?:centre|center)\b/]))return{kind:"intent",intent:{action:"helm",degrees:0}};if(Be(e,[/^(?:okay )+(?:enough|stop)\b/,/^whoa(?: whoa)+$/,/^too much$/,/^(?:no )+stop$/,/^(?:thats )?enough$/,/^easy(?: easy)+$/])&&Math.abs(t.rudderAngle)>2)return{kind:"intent",intent:{action:"helm",degrees:0}};if(/\b(?:other|wrong) way\b/.test(e))return Math.abs(t.rudderAngle)<=2?ve("ambiguous","The helm is already amidships, sir."):{kind:"intent",intent:{action:"helm",degrees:-Math.sign(t.rudderAngle)*Math.min(20,Math.abs(t.rudderAngle))}};const a=Be(e,[/\bluff(?: her)?(?: up)?\b/,/\bbring her up\b/,/\bcome up\b/,/\bpoint higher\b/,/\bharden up (?:the )?(?:helm|rudder)\b/]),s=Be(e,[/\bbear away\b/,/\bbear off\b/,/\bfall (?:off|away)\b/,/\brun off\b/,/\bbear up to leeward\b/]);if(a&&s)return ve("ambiguous",ln);if(a||s){if(Math.abs(t.apparentWindAngle)<1)return ve("ambiguous","The wind is dead ahead; name a side, sir.");const c=mi(e,t);if(typeof c!="number")return c;const d=Math.sign(t.apparentWindAngle);return{kind:"intent",intent:{action:"helm",degrees:(a?d:-d)*c}}}const o=vo(e);if(o==="conflict")return ve("ambiguous","Port or starboard, sir, not both.");if(o!==null){const c=mi(e,t);return typeof c!="number"?c:{kind:"intent",intent:{action:"helm",degrees:o*c}}}return/\b(?:steer|set|make) (?:a )?(?:course|heading)\b/.test(e)||/\b(?:course|heading) \d{2,3}\b/.test(e)||/^steer \d{2,3}\b/.test(e)||/^steer (?:zero|one|two|three|four|five|six|seven|eight|nine|north|south|east|west)\b/.test(e)?ve("unsupported","Course-keeping is not fitted; order port, starboard, or amidships, sir."):null}function ko(e,t){const n=po(e);if(n.length===0)return ve("empty","No order received, sir.");if(/\b(?:dont|do not|belay|cancel)\b/.test(n))return{kind:"acknowledgement",message:"Belay that, sir."};const i=[fo(n),bo(n),wo(n,t),xo(n,t),go(n)?{kind:"intent",intent:{action:"report_status"}}:null].filter(a=>a!==null);return i.length===0?ve("unknown",ho):i.length>1?ve("ambiguous",ln):i[0]}function gi(e){return{...e,optimalTrimNow:Number(Ve(Math.abs(e.apparentWindAngle)).toFixed(2))}}const fi=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. The state gives you optimalTrimNow, the correct trim for the current wind angle. For a relative order ('ease' = let out, 'sheet in/harden' = haul in), move MOST OF THE WAY from the sail's current value to optimalTrimNow in that direction, rather than nudging by a fixed step. Only use a small step when the captain asks for one ('a touch', 'a little').",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"tack",description:"Come about: tack the ship through the wind onto the opposite board. Use for 'ready about', 'come about', 'put her about', 'tack'. The crew runs the whole manoeuvre; do not also send helm orders for it.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears. Pass side only when the captain names one ('fire the port guns') — that battery alone fires, wasted if she doesn't bear on it.",parameters:{type:"object",properties:{side:{type:"string",enum:["port","starboard"],description:"Which battery to fire, only when the captain names a side."}}}}}],bi=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

STEERING — the helm tool. Negative = port (turn left); positive = starboard (turn right); 0 = amidships (straight).
- Fixed side words set the SIGN and override the wind. LEFT SIDE → NEGATIVE degrees: "left, port, to port, a-port, come to port, larboard" (so "turn left" and "hard a-port" are both negative). RIGHT SIDE → POSITIVE degrees: "right, starboard, to starboard, a-starboard, come to starboard" (so "turn right" and "hard a-starboard" are both positive). Whenever one of these words appears, use its sign no matter what the wind is doing.
- "straighten up / steady / steady as she goes / steady as you go / midships / amidships / rudder amidships / meet her / centre the rudder / centre (or center) the helm / helm amidships / ease her back to centre" → helm 0. These are helm orders even though "ease ... back to centre" contains the word "ease" — it is not a sail order unless a sail (main/jib/sheet) is named.
- Decide the SIGN first (port = negative, starboard = positive), then the magnitude: a small turn ("a little / a bit / a touch / a point") ≈ 10°, an ordinary turn ≈ 20°, a hard turn ("hard", "hard over", "hard a-port/a-starboard") ≈ 35°. If a number of degrees is named, use it (never beyond 35). "a point" only sets the size — it never changes the direction.
- Wind-relative orders: read apparentWindAngle from the state — a NEGATIVE value means the wind is on the PORT side, POSITIVE means the STARBOARD side. "Come up / luff / luff up / point higher / bring her up / harden up (helm) / helm a-lee / hard a-lee / ready about" mean turn TOWARD the wind: the helm takes the SAME sign as apparentWindAngle. "Bear away / bear off / fall off / fall away / run off / bear up to leeward" mean turn AWAY from the wind: the helm takes the OPPOSITE sign to apparentWindAngle. Use an ordinary turn unless told otherwise. Note: "helm a-lee", "hard a-lee" and "ready about" are the order to TACK — bring the bow UP through the wind (turn TOWARD the wind, same sign as apparentWindAngle); never steer to leeward for these.
- Dictation note: voice-to-text sometimes mishears "helm" as "home", "hem", "whole", or "hull". If the sentence is otherwise steering-shaped — it contains a centering/straightening verb (center, centre, straighten, steady) or is the bare command "center/centre it" — and one of those words sits where "helm" belongs, read it as "helm" and apply the centering rule above (→ helm 0). Do not apply this outside a steering-shaped sentence: "hull" still means the ship's hull with no centering verb present (e.g. "put a ball in her hull" stays a gunnery/damage matter, not a helm order).

SAILS — the trim_sail tool. trim 0 = fully eased/let out, 1 = hauled fully in.
- Choose the sail: "main / mainsail / main sheet" → main; "jib / headsail / jib sheet" → jib; "sails / the sails / all sail / all canvas / everything / trim the sails" → all. "Both sheets" or "the sheets" (plural, no main/jib named) ALWAYS means ALL, no matter the verb — e.g. "sheet in both sheets" and "ease both sheets" both apply to ALL, never just the main sheet.
- The state carries optimalTrimNow: the RIGHT trim for the wind she is in now. Sail the boat well by default — an unqualified trim order means "get her close to right", not "nudge her a fraction".
- "Haul in / haul / harden / harden up / tighten / sheet in / sheet home / trim in / take a pull / bring her in" mean haul IN (raise the number). "Ease / ease away / ease off / let out / let go / start / slacken / spill wind" mean let OUT (lower it).
- SIZE OF THE MOVE. Unqualified ("sheet in the main", "ease the sheets"): go about three quarters of the way from the sail's CURRENT value to optimalTrimNow — e.g. main at 0.50 with optimalTrimNow 0.80 and an order to sheet in becomes about 0.72. If optimalTrimNow lies in the OPPOSITE direction to the order, move ~0.15 the way the captain asked and no further: obey the order, do not overrule it. Only "a touch / a bit / a little / a hair / slightly" means a small ~0.10 step. "hard in / right in / all the way in" → toward 1; "let go / all the way out" → toward 0. "Trim the sails / trim her properly / set her right" (no direction named) → go straight to optimalTrimNow.

REPORTS — the report_status tool. ANY question or request about heading, course, speed, wind, position, or how she is doing ("report", "status", "how are we doing", "what's our heading", "what's the wind doing") MUST be answered by CALLING report_status. Never answer these in text yourself; always make the tool call.

CHATTER — only when the captain says something that is genuinely NOT an order and NOT a question about the ship (small talk, jokes, musings, personal requests) do you make NO tool call; reply in character in one short period sentence.

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`,So=`LANGUAGE — ABSOLUTE:
- The captain speaks English and only English. You speak English and only English. This never changes for any reason, in any turn of the conversation.
- Use British English spelling and idiom, and period Royal Navy vocabulary, throughout.
- If a transcript arrives in another language, that is a MISHEARING of an English order, not a change of language. Read it back as the nearest English nautical order it could have been and act on that; if nothing fits, ask for the order again — in English.
- Never translate, never mirror another language, never apologise in another language, and never remark on the language itself.
`,Eo=`BREVITY — HARD LIMIT:
- A reply is ONE short sentence. Never two. Never a sentence plus a follow-up.
- When a tool result gives you a line, SPEAK THAT LINE AND STOP. Not one word more. Do not restate it, expand it, explain it, or add what happens next.
- Never offer help, never ask what the captain wants next, never suggest an option, never narrate what you are about to do, never comment on the situation unless asked.
- Forbidden openers and fillers: "That's the first step", "Just let me know", "We should", "I'll go ahead and", "Would you like", "in a moment", "before we continue".
- A bare acknowledgement is the ideal reply. "Aye sir." is a complete and correct answer.
- The one exception is report_status, whose tool line carries the numbers: speak it verbatim, then stop.
`,Mo=`ONE ORDER AT A TIME:
- Act only on the captain's most recent utterance. Earlier orders are already carried out; never revisit or re-execute them, and never treat your own reply as an order.
- If it is not an order and not a question about the ship, say nothing and call no tool.
- You are a naval officer, never an assistant. Never mention tasks, requests or clarifying, and never apologise like a chatbot. If you must query an order: "Say again, sir?"
`,To=`EXAMPLES — the kind of thing this captain says, and what you do:
- "turn to starboard twenty degrees" -> helm 20
- "hard a-port" -> helm -35
- "come left a touch" -> helm -10
- "steady as she goes" -> helm 0
- "centre the helm" -> helm 0
- "bear away a little" -> helm, ordinary turn, sign OPPOSITE to apparentWindAngle
- "come up into the wind" -> helm, ordinary turn, SAME sign as apparentWindAngle
- "ready about" / "helm's a-lee" / "put her about" -> tack (no helm order as well)
- "ease the main" -> trim_sail main, 0.15 below its current value
- "sheet in both sheets" -> trim_sail all, 0.15 above the current value
- "haul the jib right in" -> trim_sail jib, toward 1
- "what's our heading" / "status report" / "how are we doing" -> report_status
- "fire!" / "give them a broadside" -> fire_guns
- "fire the port guns" -> fire_guns with side port
- "lovely morning, isn't it" -> no tool call; one short period reply
`;function yi(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,a=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof a!="number"||!Number.isFinite(a)||a<0||a>1?null:{action:"trim_sail",sail:i,trim:a}}case"report_status":return{action:"report_status"};case"tack":return{action:"tack"};case"fire_guns":{const a=(t??{}).side;return a==="port"||a==="starboard"?{action:"fire_guns",side:a}:{action:"fire_guns"}}default:return null}}const je={network:"OpenAI seems unreachable (their status page may say why); your order was kept, try again shortly.",unauthorized:"key rejected",rateLimited:"rate limited, a moment sir",serverError:"OpenAI is having trouble",autoplayBlocked:"your browser blocked audio until you click the page",audioStalled:"this browser would not play the audio"};function _o(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function dn(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Co=1500;async function wi(e){try{return await e()}catch(t){if(!dn(t))throw t;return await new Promise(n=>setTimeout(n,Co)),e()}}function vi(e,t,n){const i=_o(t);if(i)return je[i];const a=n.trim(),o=a.startsWith("<")||/<\/?[a-z][\s\S]*>/i.test(a.slice(0,200))?"":a.slice(0,140);return o.length>0?`${e} (${t}): ${o}`:`${e} (${t})`}const Ro="https://api.openai.com/v1/chat/completions";function Ao(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const a=i,s=typeof a.content=="string"?a.content:null,o=[],r=a.tool_calls;if(Array.isArray(r))for(const c of r){if(typeof c!="object"||c===null)continue;const d=c.function;if(typeof d!="object"||d===null)continue;const h=d,u=h.name,m=h.arguments;typeof u!="string"||typeof m!="string"||o.push({name:u,argumentsJson:m})}return{content:s,toolCalls:o}}function No(e){try{return JSON.parse(e)}catch{return null}}async function Po(e,t,n,i=Re.voice.intentModel,a=Ro){const s=`${bi}

Current ship state:
${JSON.stringify(gi(t))}`,o={"Content-Type":"application/json"};n.length>0&&(o.Authorization=`Bearer ${n}`);let r;try{r=await wi(()=>fetch(a,{method:"POST",headers:o,body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:fi,messages:[{role:"system",content:s},{role:"user",content:e}]})}))}catch(b){throw dn(b)?new Error(je.network):b}if(!r.ok){const b=await r.text();throw new Error(vi("intent request failed",r.status,b))}const c=await r.json(),d=Ao(c);if(d===null)throw new Error("intent request returned an unrecognizable response body");const h=d.toolCalls[0];if(h===void 0)return{crewLine:d.content??"",intent:null};const u=No(h.argumentsJson),m=yi(h.name,u);return m===null?{crewLine:W("unknown_order",t),intent:null}:{crewLine:"",intent:m}}const Do=new Set(["alloy","ash","ballad","coral","echo","sage","shimmer","verse","marin","cedar"]);function un(e){return Do.has(e)?e:"marin"}function Oo(){return fi.map(({function:e})=>({type:"function",name:e.name,description:e.description,parameters:e.parameters}))}function Io(e){if(typeof e!="object"||e===null)return[];const t=e.output;if(!Array.isArray(t))return[];const n=[];for(const i of t){if(typeof i!="object"||i===null)continue;const a=i;a.type==="function_call"&&(typeof a.name!="string"||typeof a.call_id!="string"||typeof a.arguments!="string"||n.push({name:a.name,callId:a.call_id,argumentsJson:a.arguments}))}return n}function Lo(e){if(typeof e!="object"||e===null)return null;const t=e.output;if(!Array.isArray(t))return null;for(const n of t){if(typeof n!="object"||n===null)continue;const i=n.content;if(Array.isArray(i))for(const a of i){if(typeof a!="object"||a===null)continue;const s=a,o=typeof s.transcript=="string"?s.transcript.trim():"";if(o)return o;const r=typeof s.text=="string"?s.text.trim():"";if(r)return r}}return null}function hn(e,t){return bi+`

`+So+`
`+Eo+`
`+Mo+`
`+To+`
REALTIME RULES:
- Wait for a tool result before acknowledging an order.
- When a tool result arrives, speak its message and then STOP — see the brevity rules above.
- Never claim the ship changed unless the tool result says the order was accepted.
- If speech is unclear or contains conflicting orders, ask once for the order again, in five words or fewer, and call no tool.

VOICE & DELIVERY:
`+We(t).delivery+`

Current ship state:
`+JSON.stringify(gi(e))}function Ho(e,t,n,i){return{type:"session.update",session:{type:"realtime",output_modalities:["audio"],instructions:hn(e,n),audio:{input:{transcription:{model:"gpt-4o-mini-transcribe",language:"en"},noise_reduction:{type:"near_field"},turn_detection:{type:"semantic_vad",eagerness:i,create_response:!0,interrupt_response:!1}},output:{voice:un(t)}},tools:Oo(),tool_choice:"auto"}}}function zo(e){return e===void 0?!1:e==="session_expired"||e==="invalid_api_key"}function Vo(e){try{return yi(e.name,JSON.parse(e.argumentsJson))}catch{return null}}function Fo(e){let t=null,n=null,i=null,a=null,s=!1,o=!1,r=un(e.voice??"marin"),c=We(e.accentId??"").id;const d=e.eagerness??"low";let h=Math.max(0,Math.min(1,e.volume??.55)),u=!0,m=!1,b=!1,w=!1,E=null;const C=new Set,D=new Set;let T=Promise.resolve();function k(p){n?.readyState==="open"&&n.send(JSON.stringify(p))}function R(p){k({type:"session.update",session:{type:"realtime",...p}})}function _(){a!==null&&(a.volume=h,a.muted=!u)}function B(p,g){k({type:"conversation.item.create",item:{type:"function_call_output",call_id:p,output:JSON.stringify(g)}})}async function N(p){if(p.length===0)return;if(b||(e.onTranscript("Voice order"),b=!0),p.length>1){const O="One order at a time, sir.";for(const I of p)B(I.callId,{ok:!1,message:O});e.onResponseLine(O),e.onSystemNote(O),w=!0,k({type:"response.create"});return}const g=p[0],v=Vo(g);if(v===null){const O="I do not understand that order, sir.";B(g.callId,{ok:!1,message:O}),e.onResponseLine(O),e.onSystemNote(`Realtime returned an invalid ${g.name} call.`),w=!0,k({type:"response.create"});return}const S=await e.submitIntent(v);B(g.callId,{ok:S.ok,message:S.message,state:S.state}),w=!0,E=S.message,k({type:"response.create",response:{instructions:`Say exactly this and nothing else, then stop: ${JSON.stringify(S.message)}. Add no other words. No preamble, no explanation, no offer of help, no follow-up question.`}})}async function H(p){let g;try{g=JSON.parse(p)}catch{return}switch(g.type){case"input_audio_buffer.speech_started":b=!1,w=!1,R({instructions:hn(e.getState(),c)}),e.onStatus("listening","Hearing order");break;case"conversation.item.input_audio_transcription.completed":{const v=g.transcript?.trim(),S=g.item_id??v;v&&S&&!C.has(S)&&(C.add(S),b=!0,e.onTranscript(v));break}case"response.output_audio.delta":case"response.audio.delta":case"output_audio_buffer.started":m=!0,e.onStatus("speaking","Crew speaking");break;case"output_audio_buffer.stopped":e.onStatus("listening","Listening");break;case"response.done":{const v=Io(g.response);if(await N(v),v.length===0){const S=Lo(g.response);w?(w=!1,S&&S!==E&&e.onResponseLine(S)):S&&e.onResponseLine(S),e.onStatus("listening","Listening")}break}case"error":{const v=g.error,S=v?.message??"Realtime session error";if(zo(v?.code)){e.onStatus("error",S);break}(v?.code===void 0||!D.has(v.code))&&(v?.code!==void 0&&D.add(v.code),e.onSystemNote(`Realtime: ${S}`));break}}}function ce(p){return p.readyState==="open"?Promise.resolve():new Promise((g,v)=>{const S=window.setTimeout(()=>v(new Error("Realtime data channel timed out.")),1e4);p.addEventListener("open",()=>{window.clearTimeout(S),g()},{once:!0}),p.addEventListener("error",()=>{window.clearTimeout(S),v(new Error("Realtime data channel failed."))},{once:!0})})}function f(){n?.close(),t?.close();for(const p of i?.getTracks()??[])p.stop();a?.remove(),t=null,n=null,i=null,a=null,s=!1,o=!1,m=!1,b=!1,w=!1,C.clear(),D.clear(),e.onStatus("disconnected","Mic disconnected")}async function P(){if(!(s||o)){s=!0,e.onStatus("connecting","Requesting microphone");try{i=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),t=new RTCPeerConnection,a=document.createElement("audio"),a.autoplay=!0,a.hidden=!0,_(),document.body.appendChild(a),t.addEventListener("track",I=>{a&&(a.srcObject=I.streams[0]??new MediaStream([I.track]))}),t.addEventListener("connectionstatechange",()=>{(t?.connectionState==="failed"||t?.connectionState==="disconnected")&&e.onStatus("error","Realtime connection lost")});for(const I of i.getTracks())t.addTrack(I,i);n=t.createDataChannel("oai-events"),n.addEventListener("message",I=>{T=T.then(()=>H(I.data)).catch(j=>{const G=j instanceof Error?j.message:String(j);e.onSystemNote(G)})});const p=await t.createOffer();if(await t.setLocalDescription(p),!p.sdp)throw new Error("Browser did not create a Realtime offer.");const g=e.getTransport?.()??{apiKey:"",endpoint:"/api/realtime/session",direct:!1},v=e.model??"gpt-realtime-mini";let S;if(g.direct){const I=await e.mintClientSecret?.(v);if(!I)throw new Error("No OpenAI key stored — add one under the settings cog.");const j=new FormData;j.set("sdp",p.sdp),j.set("session",JSON.stringify({type:"realtime",model:v})),S=await fetch(g.endpoint,{method:"POST",headers:{Authorization:`Bearer ${I}`},body:j})}else S=await fetch(g.endpoint,{method:"POST",headers:{"Content-Type":"application/sdp"},body:p.sdp});if(!S.ok){const I=(await S.text()).trim();throw new Error(I||`Realtime session failed (${S.status}).`)}const O=await S.text();await t.setRemoteDescription({type:"answer",sdp:O}),await ce(n),k(Ho(e.getState(),r,c,d)),s=!1,o=!0,e.onStatus("listening","Listening")}catch(p){const g=p instanceof Error?p.message:String(p);throw f(),e.onStatus("error",g),p}}}return{connect:P,disconnect:f,toggle:async()=>{o||s?f():await P()},isConnected:()=>o,setVoice:p=>{const g=un(p);if(g!==r&&(r=g,!!o)){if(m){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");return}R({audio:{output:{voice:r}}})}},setAccent:p=>{const g=We(p).id;g!==c&&(c=g,o&&R({instructions:hn(e.getState(),c)}))},setVolume:p=>{h=Math.max(0,Math.min(1,p)),_()},setAudioEnabled:p=>{u=p,_()}}}const Wo="https://api.openai.com/v1/audio/speech",Bo=2e4,jo=4e3,$o=2;let $e=null;function Ko(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function xi(){$e!==null&&($e.pause(),$e.src="",$e=null,performance.now())}async function Uo(e,t={}){const{apiKey:n="",endpoint:i=Wo,model:a=Re.voice.ttsModel,voice:s=Re.voice.ttsVoice,volume:o=Re.voice.ttsVolume,accentId:r=Re.voice.crewAccent}=t;if(e.trim().length===0||!Ko())return;xi();let c;try{c=await wi(()=>fetch(i,{method:"POST",headers:{"Content-Type":"application/json",...n.length>0?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({model:a,voice:s,input:e,response_format:"mp3",instructions:We(r).delivery})}))}catch(k){throw dn(k)?new Error(je.network):k}if(!c.ok){const k=await c.text();throw new Error(vi("tts request failed",c.status,k))}const d=await c.arrayBuffer(),h=new Blob([d],{type:"audio/mpeg"}),u=URL.createObjectURL(h),m=new Audio(u);m.volume=Math.max(0,Math.min(1,o)),$e=m;const b=()=>{URL.revokeObjectURL(u),$e===m&&($e=null,performance.now())};m.addEventListener("ended",b,{once:!0}),m.addEventListener("error",b,{once:!0});const w=new Promise(k=>{m.addEventListener("ended",()=>k(),{once:!0}),m.addEventListener("error",()=>k(),{once:!0})}),E=new Promise((k,R)=>{m.play().catch(_=>{b(),R(_ instanceof DOMException&&_.name==="NotAllowedError"?new Error(je.autoplayBlocked):_)})}),C=[],D=new Promise((k,R)=>{C.push(setTimeout(()=>{m.readyState>=$o||(b(),R(new Error(je.audioStalled)))},jo))}),T=new Promise(k=>{C.push(setTimeout(k,Bo))});try{await Promise.race([w,E,D,T])}finally{for(const k of C)clearTimeout(k)}}const Go=2;function qo(e){const t=[];let n=!1,i=!1,a=!1,s=!1,o=!1;async function r(){if(!n){n=!0;try{for(;t.length>0;){const c=t.shift();if(e.isRealtimeMode()||e.isMuted())continue;const d=e.getConfig(),h=Vn();try{await Uo(c,{apiKey:h.apiKey,endpoint:h.endpoint,model:d.voice.ttsModel,voice:d.voice.ttsVoice,volume:d.voice.ttsVolume,accentId:d.voice.crewAccent})}catch(u){const m=u instanceof Error?u.message:String(u);m===je.autoplayBlocked?s||(s=!0,e.onSystemNote("Click anywhere on the sea and the crew will speak up.")):m===je.audioStalled?o||(o=!0,e.onSystemNote("This browser will not play the crew's audio, so they will keep quiet. Their lines are still in the log.")):a||(a=!0,e.onSystemNote(h.direct?`The crew has lost its voice (${m}). Check your OpenAI key under the cog.`:`The crew has lost its voice (${m}). This host has no speech route; add an OpenAI key under the cog.`))}}}finally{n=!1}}}return{speakCrewLine:c=>{if(c.trim().length===0||e.isRealtimeMode()||e.isMuted()||o)return;const d=Vn();if(!(!d.direct&&a)){if(!d.direct&&!i&&window.location.protocol==="file:"){i=!0,e.onSystemNote("The crew has no voice on this host. Add an OpenAI key under the cog.");return}for(t.push(c);t.length>Go;)t.shift();r()}},silence:()=>{t.length=0,xi()}}}const ki=9.81,Si=370,Yo=.84,Jo=10/12,pn=12,Ei=.45,Xo=2.2,Mi=.6,Qo=50,Ti=2,Zo=16,_i=.2,es=.9,ts=137.51,ns=251.33;function mn(e){return Math.min(1,Math.max(0,e))}function is(e){return Math.max(e*Jo,.1)}function as(e){const t=is(e),n=ki*(Yo/t)**2;return 2*Math.PI/n}function os(e){const t=mn(e/40),n=Math.sqrt(t);return _i+n*(es-_i)}function ss(e){const t=mn(e/40);return Ti+t*(Zo-Ti)}function rs(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function ls(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=as(n),a=ss(n),s=os(n),o=1+mn(s)*3,r=t+180,c=[],d=[],h=[];let u=0;for(let w=0;w<pn;w++){const E=w/(pn-1),C=Ei*(Xo/Ei)**E;c.push(C);const D=Qo*(2*E-1);d.push(D);const T=Math.log(C),k=Math.exp(-(T*T)/(2*Mi*Mi)),R=D*Math.PI/180,_=Math.max(0,Math.cos(R))**(2*o),B=k*_;h.push(B),B>u&&(u=B)}const m=[],b=u>0?u:1;for(let w=0;w<pn;w++){const E=i*c[w],C=2*Math.PI/E,D=Math.sqrt(ki*C*(1+C*C/(Si*Si))),T=rs(r+d[w]),k=a*(h[w]/b),R=w*ts,_=w*ns,B=-C*(T.x*R+T.z*_);m.push({amplitude:k,wavenumber:C,omega:D,dirX:T.x,dirZ:T.z,phase0:B})}return m}function cs(e,t,n,i){let a=0;for(const s of e){const o=s.wavenumber*(s.dirX*t+s.dirZ*n)-s.omega*i+s.phase0;a+=s.amplitude*Math.cos(o)}return a}const ds=458.7,us=170;function hs(e){return{length:ds*e,beam:us*e}}function ps(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],a=[];for(const s of i)a.push({x:-n,z:s}),a.push({x:n,z:s});return a}function ms(e,t,n){const i=Math.cos(n),a=Math.sin(n);return{x:e*i+t*a,z:-e*a+t*i}}function gs(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,a=0,s=0,o=0,r=0,c=0,d=0;const h=e.length;for(let T=0;T<h;T++){const{x:k,z:R}=e[T],_=t[T];n+=k*k,i+=k*R,a+=k,s+=R*R,o+=R,r+=k*_,c+=R*_,d+=_}const u=n*(s*h-o*o)-i*(i*h-o*a)+a*(i*o-s*a);if(Math.abs(u)<1e-9)return{heave:d/h,pitchRad:0,rollRad:0};const m=r*(s*h-o*o)-i*(c*h-o*d)+a*(c*o-s*d),b=n*(c*h-d*o)-r*(i*h-o*a)+a*(i*d-c*a),w=n*(s*d-o*c)-i*(i*d-o*r)+r*(i*o-s*a),E=m/u,C=b/u;return{heave:w/u,pitchRad:Math.atan(-C),rollRad:Math.atan(E)}}function fs(e,t,n,i,a,s){const o=-i*(Math.PI/180),r=hs(a),c=ps(r),d=c.map(h=>{const u=ms(h.x,h.z,o);return cs(e,t+u.x,n+u.z,s)});return gs(c,d)}function gn(e,t,n,i,a){if(a<=0||n<=0)return e;const s=e.position-t,o=e.velocity,r=1e-4;let c,d;if(Math.abs(i-1)<r){const h=Math.exp(-n*a),u=o+n*s;c=(s+u*a)*h,d=h*(o-n*a*u)}else if(i>1){const h=n*Math.sqrt(i*i-1),u=-n*i+h,m=-n*i-h,b=(o-m*s)/(u-m),w=s-b,E=Math.exp(u*a),C=Math.exp(m*a);c=b*E+w*C,d=b*u*E+w*m*C}else{const h=-n*i,u=n*Math.sqrt(1-i*i),m=Math.exp(h*a),b=Math.cos(u*a),w=Math.sin(u*a),E=(o-h*s)/u;c=m*(s*b+E*w),d=h*c+m*u*(-s*w+E*b)}return{position:t+c,velocity:d}}function Ci(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(a,s,o,r,c,d,h,u){const m=fs(h,o,r,c,d,s),b=m.heave*u.heaveScale,w=m.pitchRad*u.pitchScale,E=m.rollRad*u.rollScale;return a>0?(e=gn(e,b,u.stiffness,u.damping,a),t=gn(t,w,u.stiffness,u.damping,a),n=gn(n,E,u.stiffness,u.damping,a)):(e={position:b,velocity:0},t={position:w,velocity:0},n={position:E,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const bs=.514444,Ie=Math.PI/180,ys=1,ws=512,vs=4;function Pt(e){return-e*Ie}function xs(e){const t=e*Ie;return{x:Math.sin(t),z:-Math.cos(t)}}function Le(e,t){return{x:e.x*t,z:-e.y*t}}const Ri=18,ks=95,Ss=260;function Es(e,t,n,i,a,s){const o=s*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Ss;e.position.x=t+i.x*o+a.x*r,e.position.z=n+i.z*o+a.z*r,e.position.y=Ri+Math.random()*(ks-Ri)}function Ms(e,t,n,i,a,s,o,r){if(e.length===0)return;const c=i+180,d=xs(c),h={x:-d.x,z:-d.z},u={x:-d.z,z:d.x},m=a*bs*s,b=Pt(c),w=o*o;for(const E of e){E.position.x+=d.x*m*r,E.position.z+=d.z*m*r,E.rotation.y=b;const C=E.position.x-t,D=E.position.z-n;C*C+D*D>w&&Es(E,t,n,h,u,o)}}const Ts=1.4,_s=6,Cs=2;function Rs(e,t,n,i,a=Re.visuals,s={}){const{camera:o=null,getStreamerNode:r,windStreaks:c=[],getEnemyShipNode:d,muzzleFlash:h=null,splash:u=null,hitFlash:m=null,hitSmoke:b=null,rangeRing:w=null,cannonRangeM:E=0,getEnemyTiltNode:C}=s;let D=null,T=0,k=0,R=0;const _=Ci(),B=Ci();let N=null,H=[];function ce(V,X){const Q=`${V}:${X}`;return Q!==N&&(H=ls({windDirectionDeg:V,windSpeedKts:X}),N=Q),H}const f=480,P=900,p=2600,g=1400,v=130,S=260,O=150,I=70;let j=null,G=null,re=null,$=null,be="follow";const gt=o!==null?o.fov:null;function vn(V){be=V,typeof window<"u"&&(window.__captainViewMode=V),o!==null&&V==="follow"&&gt!==null&&(o.fov=gt,o.updateProjectionMatrix())}function Ue(V,X,Q){const{worldUnitsPerMetre:q,maxHeelDeg:Ee,maxBraceDeg:Me,heelSmoothingHz:He,boatScale:Ae,streakFieldRadius:at}=a,ae=D===null?0:Math.min((V-D)/1e3,.5);D=V;const Y=e.getState(),ye=Pt(X.headingDeg);t.rotation.y=ye,t.scale.x=Ae,t.scale.y=Ae,t.scale.z=Ae;const{x:Ye,z:de}=Le(X,q);t.position.x=Ye,t.position.z=de;const{buoyancy:le}=a,ft=ce(Y.windDirection,Y.windSpeedKts),Wt=V/1e3,bt=_.update(ae,Wt,Ye,de,X.headingDeg,Ae,ft,le),ot=n();if(ot!==null){const L=Ee*Math.tanh(Y.apparentWindKts**2*((Y.mainTrim+Y.jibTrim)/2)*Math.abs(Math.sin(Y.apparentWindAngle*Ie))/ws),K=Math.sign(Y.apparentWindAngle)*L*Ie,J=ae>0?1-Math.exp(-ae*He):0,fe=T+(K-T)*J,st=vs*Ie*ae,wt=Math.max(-st,Math.min(st,fe-T));T+=wt;const vt=le.enabled?bt.rollRad:0;ot.rotation.z=T+vt,ot.rotation.x=le.enabled?bt.pitchRad:0;const Z=le.baseOffsetM*q;ot.position.y=le.enabled?bt.heave+Z:0}const yt=i?i():null;if(yt!==null){const L=(Y.mainTrim+Y.jibTrim)/2,K=Math.sign(Y.apparentWindAngle)*L*Me*Ie,J=ae>0?1-Math.exp(-ae*ys):0;k+=(K-k)*J,yt.rotation.y=k}if(w!==null){const L=a.showCannonRange&&E>0;if(w.visible=L,L){const K=E*q;w.position.x=Ye,w.position.z=de,w.scale.x=K,w.scale.y=1,w.scale.z=K}}Ms(c,Ye,de,Y.windDirection,Y.windSpeedKts,q,at,ae);const Bt=r?r():null;if(Bt!==null){const L=Pt(Y.apparentWindAngle+180),K=ae>0?1-Math.exp(-ae*Cs):0;let J=L-R;J=(J+Math.PI)%(2*Math.PI)-Math.PI,R+=J*K;const fe=_s*Ie*Math.sin(V/1e3*2*Math.PI*Ts);Bt.rotation.y=R+fe}if(o!==null&&be==="helm"){const{helmView:L}=a;o.position.x=L.x,o.position.y=L.y,o.position.z=L.z,o.rotation.x=L.pitchDeg*Ie,o.rotation.y=0,o.rotation.z=0,o.fov!==L.fov&&(o.fov=L.fov,o.updateProjectionMatrix())}const ue=d?d():null;if(ue!==null)if(Q!==null){const L=Le(Q,q);ue.position.x=L.x,ue.position.z=L.z,ue.rotation.y=Pt(Q.headingDeg),ue.scale.x=Ae,ue.scale.y=Ae,ue.scale.z=Ae,ue.visible=!0;const K=C?C():null,J=B.update(ae,Wt,L.x,L.z,Q.headingDeg,Ae,ft,le);if(K!==null){const fe=le.baseOffsetM*q;K.position.y=le.enabled?J.heave+fe:0,K.rotation.x=le.enabled?J.pitchRad:0,K.rotation.z=le.enabled?J.rollRad:0}}else ue.visible=!1;if(j!==null&&V>=j&&(h!==null&&(h.visible=!1),j=null),G!==null&&u!==null&&V<G){const L=1-(G-V)/g,K=Math.min(1,L*3),J=v+(S-v)*K,fe=u;fe.scale?.set(J,J,1),fe.material&&(fe.material.opacity=.9*(1-L*L)),u.position.y=8+46*K}if(G!==null&&V>=G&&(u!==null&&(u.visible=!1),G=null),$!==null){if(V>=$)b!==null&&(b.visible=!1),$=null;else if(b!==null){const L=($-V)/p,K=b.material;K&&(K.opacity=.55*Math.max(0,Math.min(1,L))),b.position.y+=.35}}re!==null&&V>=re&&(m!==null&&(m.visible=!1),re=null)}function Vt(){vn(be==="follow"?"helm":"follow")}function Ge(V,X,Q){h!==null&&(h.position.x=X,h.position.y=90,h.position.z=Q,h.visible=!0,j=V+f)}function qe(V,X,Q){if(u===null)return;u.position.x=X,u.position.y=8,u.position.z=Q;const q=u;q.scale?.set(v,v,1),q.material&&(q.material.opacity=.9),u.visible=!0,G=V+g}function it(V,X,Q,q=1){if(m===null)return;m.position.x=X,m.position.y=55,m.position.z=Q;const Ee=Math.max(1,q),Me=O+I*(Ee-1);m.scale?.set(Me,Me,1),m.visible=!0,re=V+P*Ee}function Ft(V,X,Q,q=1){if(b===null)return;const Ee=Math.max(1,q);b.position.x=X,b.position.y=60,b.position.z=Q;const Me=220+90*(Ee-1),He=b;He.scale?.set(Me,Me,1),He.material&&(He.material.opacity=.55),b.visible=!0,$=V+p}return{update:Ue,toggleView:Vt,getViewMode:()=>be,triggerMuzzleFlash:Ge,triggerSplash:qe,triggerHitFlash:it,triggerSmoke:Ft}}window.__captainDriverActive=!0;const x=Qe();window.__captainAmbientRock=x.visuals.ambientRock,window.__captainReflectionInterval=x.visuals.performance.reflectionInterval;const xe=new Ta({},x),Ai={current:null},me=aa(xe,()=>Ai.current),pe=x.battle.enabled?new co(x.battle,x.physics,x.controls,{...xe.getPose(),windDirectionDeg:me.getState().windDirection,windSpeedKts:me.getState().windSpeedKts}):null;Ai.current=pe;const fn=document.createElement("div");fn.id="hud-root",document.body.appendChild(fn);function bn(e){za(e)}function ht(e){Gn(e)}function Ke(e){qn(e),Ot.speakCrewLine(e)}async function Ni(e){if(bn(e),Dt==="ai"){const n=Pa();try{const i=await Po(e,me.getState(),n.apiKey,x.voice.intentModel,n.endpoint);if(i.intent===null){ht(null),Ke(i.crewLine);return}await It(i.intent);return}catch(i){As(i,n.direct)}}const t=ko(e,me.getState());if(t.kind==="error")throw ht(null),Ke(t.message),new Error(t.message);if(t.kind==="acknowledgement"){ht(null),Ke(t.message);return}await It(t.intent)}let Dt=Un(x.input.defaultMode),ke=null,Pi=!1;const Ot=qo({getConfig:()=>x,isRealtimeMode:()=>Dt==="realtime",isMuted:()=>Pi,onSystemNote:en});let Di=!1;function As(e,t){if(Di)return;Di=!0;const n=e instanceof Error?e.message:String(e);en(t?`AI parsing failed (${n}). Orders are being parsed locally. Check your OpenAI key under the cog; a rejected or exhausted key looks like this.`:`AI parsing unavailable (${n}). Orders are being parsed locally. Add an OpenAI key under the cog to use AI Orders.`)}const Ns=Ha(fn,me,{injectTranscript:Ni,setInputMode:e=>{Dt=e,e!=="realtime"?ke?.disconnect():Ot.silence()},toggleRealtime:()=>{Dt==="realtime"&&ke?.toggle().catch(()=>{})},setCrewAudioEnabled:e=>{ke?.setAudioEnabled(e)},setTtsVoice:e=>{x.voice.ttsVoice=e,ke?.setVoice(e)},setTtsVolume:e=>{x.voice.ttsVolume=e,ke?.setVolume(e)},setCrewAccent:e=>{x.voice.crewAccent=e,ke?.setAccent(e)},setMuted:e=>{window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=e?0:x.visuals.ambientSoundVolume),ke?.setVolume(e?0:x.voice.ttsVolume),Pi=e,e&&Ot.silence()},getBattleStatus:()=>{if(!pe)return null;const e=pe.getView();return{guns:Xi(e),gunsReadyPct:e.guns.readyPct*100,hull:`${e.playerHullHp}/${sn}`,hullPct:e.playerHullHp/sn*100,enemy:Ji(e)}}});async function It(e){const t=await me.submit(e);if(Va(e,t.message),Ot.speakCrewLine(t.message),e.action==="fire_guns"&&pe){const n=pe.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),a=xe.getPose(),s=pe.getView().npc,o=Le({x:a.x,y:a.y},x.visuals.worldUnitsPerMetre);if(Se.triggerMuzzleFlash(i,o.x,o.z),n.kind==="hit"||n.kind==="miss"){const r=Le({x:s.x,y:s.y},x.visuals.worldUnitsPerMetre);if(n.kind==="hit")Se.triggerHitFlash(i,r.x,r.z,n.damage),Se.triggerSmoke(i,r.x,r.z,n.damage);else{const c=a.x-s.x,d=a.y-s.y,h=Math.hypot(c,d)||1,u=Le({x:s.x+c/h*Ht,y:s.y+d/h*Ht},x.visuals.worldUnitsPerMetre);Se.triggerSplash(i,u.x,u.z)}}}}return t}ke=Fo({getState:()=>me.getState(),submitIntent:It,onTranscript:bn,onResponseLine:e=>{ht(null),Ke(e)},onSystemNote:en,onStatus:Fa,voice:x.voice.ttsVoice,volume:x.voice.ttsVolume,accentId:x.voice.crewAccent,eagerness:x.voice.micEagerness,getTransport:Oa,mintClientSecret:Da});const nt=document.getElementById("demo");let yn=!1;function Ps(e){return new Promise(t=>setTimeout(t,e))}const Ds=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function Oi(){if(!yn){yn=!0,nt&&(nt.disabled=!0);try{for(const e of Ds){bn(`[demo] ${e.label}`);const t=await me.submit(e.intent);ht(e.intent),Ke(t.message),await Ps(e.waitMs)}}finally{yn=!1,nt&&(nt.disabled=!1)}}}nt&&nt.addEventListener("click",()=>{Oi()}),Wa();const ge=window.DEMO;if(ge===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const Se=Rs(me,ge.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,x.visuals,{camera:ge.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:ge.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:ge.ms_MuzzleFlash,splash:ge.ms_Splash,hitFlash:ge.ms_HitFlash,hitSmoke:ge.ms_HitSmoke,rangeRing:ge.ms_RangeRing,cannonRangeM:x.battle.enabled?x.battle.cannonRangeM:0}),Ii=10/12,Os=350,Is=1400,Li=1.6,Ls=4.4,Hi=.2,Hs=.9;function zs(e){const t=e*Ii,n=9.81,i=.84,a=Math.max(t,.1),s=n*(i/a)**2,o=2*Math.PI/s,r=Math.min(Is,Math.max(Os,o*2)),c=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(c),h=Li+d*(Ls-Li),u=Hi+d*(Hs-Hi);return{size:r,choppiness:h,directionality:u}}function zi(e){return 1+Math.min(1,Math.max(0,e))*3}function wn(e){xe.setWind(x.environment.windDirectionDeg,x.environment.windSpeedKts);const t=window.DEMO;if(t===void 0)return;const n=(x.environment.windDirectionDeg+180)*Math.PI/180,i=x.environment.windSpeedKts*Ii;if(t.ms_Ocean.windX=Math.sin(n)*i,t.ms_Ocean.windY=-Math.cos(n)*i,x.visuals.seaStateFollowsWind){const a=zs(x.environment.windSpeedKts);e&&(t.ms_Ocean.size=a.size),t.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=a.choppiness,t.ms_Ocean.directionality=zi(a.directionality)}else e&&(t.ms_Ocean.size=x.visuals.oceanSize);t.ms_Ocean.changed=!0}function Vi(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(Fe(x,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),Fe(x,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),Fe(x,"visuals.lighting.sunIntensity",e.sunIntensity),Fe(x,"visuals.lighting.ambientIntensity",e.ambientIntensity),Fe(x,"visuals.lighting.exposure",e.exposure),Fe(x,"visuals.lighting.fogDensity",e.fogDensity))}function Vs(){window.DEMO?.SetLightingParams(x.visuals.lighting)}!(window.location.hash.length>1)&&ge.ms_Environment!==x.environment.skyPreset&&ge.UpdateEnvironment(x.environment.skyPreset),Vi(),wn(!0),ge.ms_soundWaves&&(ge.ms_soundWaves.volume=x.visuals.ambientSoundVolume);function Fs(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function Ws(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Bs(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function js(e,t){switch(Fe(x,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.performance.reflectionInterval":window.__captainReflectionInterval=t;break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=zi(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&wn(!1);break;case"visuals.waterColor":{const n=Fs(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":Ws(t);break;case"visuals.streakOpacity":Bs(t);break;case"voice.ttsVolume":x.voice.ttsVolume=t,ke?.setVolume(t);break;case"voice.ttsVoice":x.voice.ttsVoice=t,ke?.setVoice(t);break;case"voice.crewAccent":x.voice.crewAccent=t,ke?.setAccent(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":wn(!1);break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),Vi();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Vs();break}}Ba(js);const pt=document.getElementById("view-toggle");function Fi(e){return e==="helm"?"Follow Cam":"Helm View"}function $s(){Se.toggleView(),pt&&(pt.textContent=Fi(Se.getViewMode()))}pt&&(pt.textContent=Fi(Se.getViewMode()),pt.addEventListener("click",()=>{$s()}));const mt=document.createElement("div");mt.id="battle-hit-flash",mt.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(mt);let Lt=null;const Ks=180;function Us(e=1){Lt!==null&&clearTimeout(Lt);const t=Math.max(1,e);mt.style.opacity=String(Math.min(.7,.35+.15*(t-1))),Lt=setTimeout(()=>{mt.style.opacity="0",Lt=null},Ks*t)}const Ht=45,Gs=250;let zt=null;document.addEventListener("visibilitychange",()=>{document.hidden&&(zt=null)});function Wi(e){if(zt!==null){const o=Math.min(e-zt,Gs);if(xe.tick(o),pe){const r=xe.getPose(),c=me.getState(),d=pe.tick(o,{...r,windDirectionDeg:c.windDirection,windSpeedKts:c.windSpeedKts});if(xe.setDriveMultiplier(pe.getSpeedMultiplier()),d.some(h=>h.key==="enemy_fires")){const h=pe.getView().npc,u=Le({x:h.x,y:h.y},x.visuals.worldUnitsPerMetre);Se.triggerMuzzleFlash(e,u.x,u.z);const m=d.find(b=>b.key==="hit_taken");if(m){Us(m.damage??1);const b=Le({x:r.x,y:r.y},x.visuals.worldUnitsPerMetre);Se.triggerSmoke(e,b.x,b.z,m.damage??1)}else{const b=h.x-r.x,w=h.y-r.y,E=Math.hypot(b,w)||1,C={x:r.x+b/E*Ht,y:r.y+w/E*Ht},D=Le(C,x.visuals.worldUnitsPerMetre);Se.triggerSplash(e,D.x,D.z)}}for(const h of d){const u=W(h.key,c,h);Ke(u)}}}const t=xe.takeTackEvent();t!==null&&Ke(W(t==="through"?"tack_through":"tack_in_irons",me.getState())),zt=e;const n=xe.getPose(),i={x:n.x,y:n.y,headingDeg:me.getState().heading},a=pe?pe.getView().npc:null,s=a?{x:a.x,y:a.y,headingDeg:a.heading}:null;Se.update(e,i,s),Ns.update(),requestAnimationFrame(Wi)}requestAnimationFrame(Wi),window.__captain={bus:me,submitIntent:It,injectTranscript:Ni,setWind:(e,t)=>{xe.setWind(e,t)},demo:Oi,getConfig:()=>x,copyConfig:()=>{const e=JSON.stringify(x,null,2);return console.log(e),e},setConfig:e=>{Ct(e),location.reload()},resetConfig:()=>{Pn(),location.reload()},getPlayerPose:()=>xe.getPose(),get battle(){return pe?pe.getView():null}}})();
