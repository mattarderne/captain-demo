(function(){"use strict";function Sa(e){if(e.enemyStruck)return"struck her colours";const t=e.npc;return`${{APPROACH:"closing",ENGAGE:"engaging",FLEE:"fleeing",STRUCK:"struck"}[t.behavior]??t.behavior.toLowerCase()}, ${on(t.speedKts)} kts, hull ${e.enemyHullHp}/10`}function Ea(e){if(e.enemyStruck)return"battle won";const t=e.guns,n=`${Math.round(t.rangeM)} m`;if(t.readyInS>0)return`reloading, ${Math.ceil(t.readyInS)} s`;if(!t.inRange)return`out of range, ${n}`;if(!t.inArc)return`she doesn't bear, ${n}`;const i=t.raking?", raking, 2x damage":"";return`she bears, ${n}, ${t.hitChancePct}% to hit${i}`}function $n(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function on(e){return e.toFixed(1)}function G(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=$n(t.heading),a=on(t.speedKts),s=$n(t.windDirection),o=on(t.windSpeedKts);let r=`Steering ${i} at ${a} knots, wind ${s} at ${o}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"enemy_returns":return"She's put about, sir! Coming back at us!";case"collision":return"We've run aboard her! Timbers, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":n?.zone==="bow"?"She's raked us through the bow, sir!":n?.zone==="stern"?"Raked from astern, sir! She's swept the deck!":"We're hit! Hull's holding, sir.";case"tack_ack":return"Ready about! Helm's a-lee!";case"tack_no_way":return"She's no way on her, sir — we'd be caught in stays.";case"tack_through":return"Through the wind, sir — she's full on the new board.";case"tack_in_irons":return"She's in irons, sir — we must bear away and try again.";case"helm_met":return"Met her, sir. Rudder amidships.";case"tack_already":return"Already coming about, sir!";case"back_jib_ack":return"Jib to windward, sir! She'll pay off.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return n?.zone==="bow"?"A hit, sir! Raked her clean through the bow!":n?.zone==="stern"?"Straight through her stern, sir! That's told!":"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Ma=-35,Ta=35,_a=0,Ca=1,Aa=1;function Ra(e){return e==="main"||e==="jib"||e==="all"}function Pe(e,t){return{ok:!1,message:e,state:t}}function ye(e,t){return{ok:!0,message:e,state:t}}function Na(e,t){function n(a){const s=a.action;if(s==="helm"){const o=a.degrees;if(typeof o!="number"||!Number.isFinite(o)||o<Ma||o>Ta)return Promise.resolve(Pe(G("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:o}).accepted)return Promise.resolve(Pe(G("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Aa?Promise.resolve(ye(G("no_steerage_way",l),l)):o>0?Promise.resolve(ye(G("helm_ack_starboard",l),l)):o<0?Promise.resolve(ye(G("helm_ack_port",l),l)):Promise.resolve(ye(G("helm_ack_amidships",l),l))}if(s==="trim_sail"){const o=a.sail,r=a.trim;if(!Ra(o))return Promise.resolve(Pe(G("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<_a||r>Ca)return Promise.resolve(Pe(G("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:o,trim:r}).accepted)return Promise.resolve(Pe(G("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),h=o==="main"?"trim_ack_main":o==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(ye(G(h,d),d))}if(s==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(Pe(G("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(ye(G("status",r),r))}if(s==="tack"){const o=e.apply({action:"tack"}),r=e.snapshot();return o.accepted?o.reason==="already_tacking"?Promise.resolve(ye(G("tack_already",r),r)):Promise.resolve(ye(G("tack_ack",r),r)):Promise.resolve(Pe(G("tack_no_way",r),r))}if(s==="back_jib"){e.apply({action:"back_jib"});const o=e.snapshot();return Promise.resolve(ye(G("back_jib_ack",o),o))}if(s==="fire_guns"){const o=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(Pe(G("no_target",o),o));const l=a.side,d=l==="port"||l==="starboard"?l:void 0,h=r.fireGuns(d);switch(h.kind){case"no_target":return Promise.resolve(Pe(G("no_target",o),o));case"wasted":return Promise.resolve(ye(G("shot_wasted",o),o));case"reloading":return Promise.resolve(ye(G("guns_reloading",o),o));case"miss":return Promise.resolve(ye(G("player_miss",o),o));case"hit":{const u=h.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(ye(G(u,o,{enemyHullHp:h.enemyHullHp,zone:h.zone}),o))}default:{const u=h;throw new Error(`unhandled fire outcome: ${String(u)}`)}}}return Promise.resolve(Pe(G("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const sn=1.94384,ue=180/Math.PI,oe=Math.PI/180;function Un(e){return e*sn}function rn(e){return e/sn}function Oe(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function se(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function ze(e,t,n){return e<t?t:e>n?n:e}const Ia=0,Da=12;function Gn(e={}){return{x:0,y:0,psi:se((e.heading??0)*oe),u:rn(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*oe,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:se((e.windDirection??Ia)*oe),windSpeedMs:rn(e.windSpeedKts??Da)}}const Mt=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Pa=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Oa=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function La(e,t,n){return e+(t-e)*n}function qn(e,t){const n=ze(t,0,180);let i=0;for(;i<Mt.length-1&&Mt[i+1]<=n;)i++;const a=Math.min(i+1,Mt.length-1),s=Mt[i],o=Mt[a],r=o===s?0:(n-s)/(o-s);return La(e[i],e[a],r)}function Ha(e){return{cl:qn(Pa,e),cd:qn(Oa,e)}}function za(e){const t=ze(Math.abs(e),0,180),{cl:n,cd:i}=Ha(t),a=t*oe,s=Math.sin(a),o=Math.cos(a),r=n*s-i*o,l=Math.abs(n*o+i*s);return{cDrive:r,cSide:l}}const Yn=.95,ja=.2;function je(e){const t=ze(Math.abs(e),0,180)/180;return ze(Yn-(Yn-ja)*t*t,.15,1)}const Va=.65;function Wa(e,t){const n=(e-je(t))/Va;return Math.max(0,1-n*n)}const Le={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:650,rudderExponent:2,cWeather:0},controls:{rudderSlewDegPerS:4,trimSlewPerS:.2,helmSwingPerDeg:2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"ash",whisperMode:!1,ttsVolume:.55,crewAccent:"royal-navy-officer",micEagerness:"high"},input:{autoSubmit:!0,autoSubmitDelayMs:1e3,defaultMode:"realtime",logDetail:"orders"},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:.08,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6},performance:{oceanQuality:"medium",reflectionInterval:2},windRoseMode:"wind-up",showCannonRange:!0},battle:{enabled:!0,spawnRangeM:550,aggression:.95,seed:1337,cannonRangeM:250,reloadS:16,fleeBelowHullHp:3,rakeDamage:3,minSeparationM:18,collisionDamage:1,rejoinRangeM:420,playerReloadS:20}},ft="captain.config";function $e(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Ba(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Jn(e,t,n,i){for(const a of Object.keys(t)){const s=t[a];if(!(a in e)){i.push(`${n}${a} (unknown key)`);continue}const o=e[a];$e(o)&&$e(s)?Jn(o,s,`${n}${a}.`,i):$e(o)||$e(s)||typeof o!=typeof s?i.push(`${n}${a} (expected ${typeof o}, got ${typeof s})`):e[a]=s}}function Xn(e,t){const n={...e};for(const i of Object.keys(t)){const a=t[i],s=n[i];n[i]=$e(s)&&$e(a)?Xn(s,a):a}return n}function jt(){return typeof localStorage<"u"}function Fa(){if(!jt())return{};const e=localStorage.getItem(ft);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return $e(t)?t:{}}catch{return{}}}function bt(){const e=Ba(Le);if(!jt())return e;const t=localStorage.getItem(ft);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${ft}"] is not valid JSON — ignoring it, using defaults.`),e}if(!$e(n))return console.warn(`captain.config: stored value in localStorage["${ft}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Jn(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Vt(e){if(!jt())return;const t=Fa(),n=Xn(t,e);localStorage.setItem(ft,JSON.stringify(n))}function Qn(){jt()&&localStorage.removeItem(ft)}function it(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0||(s=s?.[r],s==null))return}s!=null&&(s[a]=n)}const Ka=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.rudderExponent",label:"Helm response curve (exponent)",section:"Physics",type:"number",min:1,max:4,step:.1,live:!1,note:"1 = linear. Higher makes small helm orders gentler while leaving hard-over untouched."},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.helmSwingPerDeg",label:"Bow swing per degree of helm",section:"Controls",type:"number",min:0,max:6,step:.5,live:!1,note:"The helmsman meets her after this much turn per ordered degree. 2 = 'port twenty' turns about 40 deg. 0 = hold the helm until told otherwise."},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"Legacy STT model",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.sttFallbackModel",label:"Legacy STT fallback",section:"Voice",type:"text",live:!1,hidden:!0},{path:"voice.intentModel",label:"AI Orders intent model",section:"Voice",type:"text",live:!1,note:"Used by the AI Orders input mode. The server may pin its own model on public hosts."},{path:"voice.ttsModel",label:"Crew speech model",section:"Voice",type:"text",live:!1,note:"Speaks crew lines in the text order modes. Realtime uses its own model."},{path:"voice.ttsVoice",label:"Crew voice",section:"Voice",type:"select",options:["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],live:!0},{path:"voice.crewAccent",label:"Crew accent",section:"Voice",type:"select",options:["royal-navy-officer","west-country-bosun","scots-master","irish-gun-captain","plain-modern"],live:!0,note:"How the crew sounds. Also picked from the quarterdeck cog."},{path:"voice.micEagerness",label:"Mic patience (Realtime)",section:"Voice",type:"select",options:["low","medium","high","auto"],live:!1,note:"How long the mic waits for you to finish an order. Low waits longest (8s); high cuts in fastest (2s)."},{path:"voice.whisperMode",label:"Legacy VAD default",section:"Voice",type:"boolean",live:!1,hidden:!0},{path:"voice.ttsVolume",label:"Crew voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"input.defaultMode",label:"Boot input mode",section:"Input",type:"select",options:["ai","direct","realtime"],live:!1,note:"Which order-input mode the app starts in. AI falls back to the local parser when no server is available."},{path:"input.logDetail",label:"Quarterdeck log detail",section:"Input",type:"select",options:["orders","full"],live:!1,note:"Orders shows your words and what the ship did; full adds the crew's spoken reply. Also toggled from the cog."},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!1,note:"captain-ocean only. Reload required — live changes visibly rescale the whole ocean."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, choppiness/directionality above are overwritten from wind speed every time wind changes; the ocean wave scale slider only re-derives at boot/reload (see its own note)."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.windRoseMode",label:"Wind rose orientation",section:"Visuals",type:"select",options:["wind-up","north-up","bow-up"],live:!0,note:"Click the rose itself to cycle. Wind-up pins the wind at the top; north-up is the chart convention; bow-up fixes the ship."},{path:"visuals.showCannonRange",label:"Show cannon range ring",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Circle on the water at cannon range around your ship."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"visuals.performance.oceanQuality",label:"Ocean quality (GPU load)",section:"Performance",type:"select",options:["low","medium","high"],live:!1,note:"captain-ocean only. Reload required — FFT/geometry/cloud resolutions are built once at shell init. High = the original full-resolution ocean; medium ≈ a quarter of high's FFT pixel work."},{path:"visuals.performance.reflectionInterval",label:"Reflection every N frames",section:"Performance",type:"number",min:1,max:4,step:1,live:!0,note:"captain-ocean only. The mirror reflection is a full extra scene render — 2 halves its cost (~30Hz at 60fps) with at most a half-frame reflection lag; 1 = original every-frame behaviour."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.fleeBelowHullHp",label:"NPC breaks off below hull HP",section:"Battle",type:"number",min:0,max:10,step:1,live:!1,note:"Of 10. Lower means she fights on longer; 0 means to the death."},{path:"battle.minSeparationM",label:"Closest hulls may come (m)",section:"Battle",type:"number",min:10,max:120,step:5,live:!1,note:"The hull renders about 33 m long. Larger values read as an invisible force field."},{path:"battle.collisionDamage",label:"Collision damage (each ship)",section:"Battle",type:"number",min:0,max:5,step:1,live:!1,note:"Ramming hurts the rammer too. 0 makes contact harmless."},{path:"battle.rakeDamage",label:"Raking shot damage",section:"Battle",type:"number",min:1,max:10,step:1,live:!1,note:"Damage for a shot down the bow/stern axis, versus 1 for an ordinary hit. Applies to both ships."},{path:"battle.rejoinRangeM",label:"NPC rejoins the action at (m)",section:"Battle",type:"number",min:100,max:3e3,step:20,live:!1,note:"Sea room a fleeing ship opens before putting about. Above the spawn range she never returns."},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],$a=Le.controls.rudderMaxDeg*oe,Ua=Le.physics;function Ve(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),o=-e.windSpeedMs*Math.cos(e.windFromRad),r=s-i,l=o-a,d=Math.hypot(r,l),h=r*t+l*n,u=r*n-l*t;return{awaDeg:Math.atan2(-u,-h)*ue,awsMs:d}}function Zn(e,t,n,i,a){const s=Math.abs(n),{cDrive:o,cSide:r}=za(s),l=Wa(t,s),d=.5*a*i*i,h=d*e*o*l,u=d*e*r*l,p=-Math.sign(n||1)*u;return{surge:h,sway:p}}function ei(e,t,n=Ua,i=$a,a=1,s=0){const{awaDeg:o,awsMs:r}=Ve(e),l=Zn(n.areaMain,e.mainTrim,o,r,n.rhoAir),d=Zn(n.areaJib,e.jibTrim,o,r,n.rhoAir),h=(l.surge+d.surge)*a,u=(l.sway+d.sway)*a,p=e.u,m=e.v,f=e.r,x=p>=0?n.kSurgeLin:n.kSurgeLinAstern,D=-n.kSurgeQuad*p*Math.abs(p)-x*p,N=-n.kSwayQuad*m*Math.abs(m)-n.kSwayLin*m,T=ze(e.rudder,-i,i),j=i===0?0:T/i,k=Math.sign(j)*Math.pow(Math.abs(j),n.rudderExponent)*i,I=n.cRudder*k*p*Math.abs(p),K=-(n.kYawDamp+n.kYawDampU*Math.abs(p))*f,L=n.cWeather*Math.sin(o*oe)*r*Math.min(1,Math.abs(p)),z=I+K+L+s,ce=(h+D)/n.mass+m*f,b=(u+N)/n.mass-p*f,H=z/n.izz;e.u=p+ce*t,e.v=m+b*t,e.r=f+H*t;const y=Math.sin(e.psi),_=Math.cos(e.psi),P=e.u*y+e.v*_,X=e.u*_-e.v*y;e.x+=P*t,e.y+=X*t,e.psi=se(e.psi+e.r*t)}function Wt(e){return Math.hypot(e.u,e.v)*sn}function Ga(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,a=e.u*n-e.v*t;return se(Math.atan2(i,a))}function qa(e){return Wt(e)<.2?0:Oe(e.psi-Ga(e))*ue}const Ue=.05,ti=Ue*1e3;function ln(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}const Ya=1.5,Ja=500,ni=45,Xa=115,Qa=.6,Za=2,eo=145,to=3,no=0,ii=30,io=30,ao=1.5,oo=45,ai=9e3,so=65,ro=20;class lo{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;helmSwing=null;metHer=!1;inIrons=!1;ironsHeldS=0;ironsEvent=!1;backedJibS=0;tack=null;tackEvent=null;physics;rudderRateRadPerS;helmSwingPerDeg;trimRatePerS;rudderMaxRad;constructor(t={},n=Le){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*oe,this.helmSwingPerDeg=n.controls.helmSwingPerDeg,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*oe,this.state=Gn({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.tack=null,this.backedJibS=0,this.rudderTargetRad=ze(t.degrees*oe,-this.rudderMaxRad,this.rudderMaxRad),this.helmSwing=this.helmSwingPerDeg>0&&t.degrees!==0?{startPsi:this.state.psi,targetRad:Math.abs(t.degrees)*this.helmSwingPerDeg*oe,dir:t.degrees<0?-1:1}:null,{accepted:!0};case"trim_sail":{this.tack=null,this.backedJibS=0;const n=ze(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"back_jib":return this.tack=null,this.helmSwing=null,this.backedJibS=ro,{accepted:!0};case"tack":{if(this.tack!==null)return{accepted:!0,reason:"already_tacking"};if(Wt(this.state)<Ya)return{accepted:!1,reason:"no_way"};const{awaDeg:n}=Ve(this.state);return this.tack={dir:n<0?-1:1,turnedDeg:0,elapsedS:0,throughEye:!1,checking:!1},this.helmSwing=null,this.tackEvent=null,{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=ti;){const n=this.stepTack(Ue)+this.stepIronsRecovery(Ue)+this.stepBackedJib(Ue);this.stepHelmSwing(),this.state.rudder=ln(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*this.helmUrgency()*Ue),this.state.mainTrim=ln(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Ue),this.state.jibTrim=ln(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Ue),ei(this.state,Ue,this.physics,this.rudderMaxRad,this.driveMultiplier,n),this.accMs-=ti}}stepTack(t){const n=this.tack;if(n===null)return 0;n.elapsedS+=t;const{awaDeg:i}=Ve(this.state),a=Math.abs(i);if(this.rudderTargetRad=n.dir*this.rudderMaxRad,this.mainTrimTarget=1,this.jibTrimTarget=1,n.turnedDeg+=this.state.r*ue*t*n.dir,a<ni&&(n.throughEye=!0),n.checking){if(this.rudderTargetRad=-n.dir*this.rudderMaxRad*Qa,Math.abs(this.state.r)*ue<=Za||n.elapsedS>ii){this.tack=null,this.rudderTargetRad=0;const s=je(Math.abs(Ve(this.state).awaDeg));this.mainTrimTarget=s,this.jibTrimTarget=s,this.tackEvent="through"}return 0}return n.throughEye&&n.turnedDeg>=Xa-no||n.turnedDeg>=eo?(n.checking=!0,0):n.elapsedS>ii?(this.tack=null,this.rudderTargetRad=0,this.tackEvent="in_irons",0):a<ni?n.dir*Ja:0}isTacking(){return this.tack!==null}stepHelmSwing(){if(this.tack!==null)return;const t=this.helmSwing;if(t===null)return;let n=(this.state.psi-t.startPsi)%(2*Math.PI);n>Math.PI&&(n-=2*Math.PI),n<-Math.PI&&(n+=2*Math.PI),!(n*t.dir<t.targetRad)&&(this.helmSwing=null,this.rudderTargetRad=0,this.metHer=!0)}rudderTargetDeg(){return this.rudderTargetRad*ue}takeMetHerEvent(){const t=this.metHer;return this.metHer=!1,t}helmUrgency(){return this.tack!==null?to:1}stepBackedJib(t){if(this.backedJibS<=0)return 0;if(this.tack!==null)return this.backedJibS=0,0;const{awaDeg:n}=Ve(this.state);if(Math.abs(n)>so){this.backedJibS=0;const a=je(Math.abs(n));return this.mainTrimTarget=a,this.jibTrimTarget=a,0}this.backedJibS-=t;const i=n<0?1:-1;return this.jibTrimTarget=1,i*ai}stepIronsRecovery(t){if(this.tack!==null)return this.inIrons=!1,0;const{awaDeg:n}=Ve(this.state),i=Math.abs(n),a=Wt(this.state);if(this.inIrons){if(i>oo){this.inIrons=!1,this.ironsHeldS=0;const o=je(i);return this.mainTrimTarget=o,this.jibTrimTarget=o,this.rudderTargetRad=0,0}}else i<io&&a<ao&&(this.inIrons=!0,this.ironsHeldS=0,this.ironsEvent=!0);if(!this.inIrons)return 0;this.ironsHeldS+=t,this.helmSwing=null;const s=n<0?1:-1;return this.rudderTargetRad=s*this.rudderMaxRad,this.mainTrimTarget=1,this.jibTrimTarget=1,s*ai}takeIronsEvent(){const t=this.ironsEvent;return this.ironsEvent=!1,t}takeTackEvent(){const t=this.tackEvent;return this.tackEvent=null,t}snapshot(){const{awaDeg:t,awsMs:n}=Ve(this.state),i=Wt(this.state);return{heading:this.state.psi*ue%360,speedKts:i,windDirection:this.state.windFromRad*ue%360,windSpeedKts:Un(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Un(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*ue,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:qa(this.state)}}setWind(t,n){this.state.windFromRad=se(t*oe),this.state.windSpeedMs=rn(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const cn="captain.openai_key";function oi(){return window.localStorage.getItem(cn)}function si(e){window.localStorage.setItem(cn,e)}function co(){window.localStorage.removeItem(cn)}const uo="https://api.openai.com/v1/chat/completions",ho="https://api.openai.com/v1/audio/speech",po="https://api.openai.com/v1/realtime/calls",mo="https://api.openai.com/v1/realtime/client_secrets";function Bt(){try{return oi()?.trim()??""}catch{return""}}function Ft(){return Bt().length>0}function go(){const e=Bt();return e.length>0?{apiKey:e,endpoint:uo,direct:!0}:{apiKey:"",endpoint:"/api/intent/parse",direct:!1}}function ri(){const e=Bt();return e.length>0?{apiKey:e,endpoint:ho,direct:!0}:{apiKey:"",endpoint:"/api/tts/speak",direct:!1}}async function fo(e){const t=Bt();if(t.length===0)return null;const n=await fetch(mo,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({session:{type:"realtime",model:e}})}),i=await n.json().catch(()=>null);if(!n.ok){const r=i?.error?.message??`OpenAI rejected the key (${n.status}).`;throw new Error(r)}const a=i?.value,s=i?.client_secret?.value,o=typeof a=="string"?a:typeof s=="string"?s:"";if(o.length===0)throw new Error("OpenAI returned no ephemeral key.");return o}function bo(){return Ft()?{apiKey:"",endpoint:po,direct:!0}:{apiKey:"",endpoint:"/api/realtime/session",direct:!1}}const yo="royal-navy-officer",Kt=[{id:"royal-navy-officer",label:"Royal Navy officer (1805)",hint:"Clipped, educated English. The quarterdeck voice.",voice:"ash",delivery:"You are the first lieutenant of a Royal Navy sloop of war in 1805, reporting to your captain on the quarterdeck. Speak in the clipped, educated English of a King's officer of that period: crisp consonants, short vowels, no drawl, no modern American colour. Pitch the voice to carry over wind and canvas — this is a man half-shouting across a deck, not talking across a desk. Brisk and businesslike, respectful but never obsequious; a note of dry steel under it. Land the final 'sir' firmly, as a full word, never trailing off. Deliver orders and reports at pace, with the tiny pause before a number that a man makes when he is reading it off an instrument."},{id:"west-country-bosun",label:"West Country bosun",hint:"Devon burr, weathered and warm. The old sea-dog voice.",voice:"ballad",delivery:"You are the bosun of a Royal Navy sloop in 1805, thirty years at sea, born in Devon. Speak with a broad West Country burr: rolled and lingering 'r' sounds, long open vowels, a rise-and-fall rhythm quite unlike an officer's clipped speech. Weathered, gravelly, unhurried even in a hurry, with warmth under the gruffness. Loud — this is a voice trained to reach the foretop in half a gale. Say 'sir' plainly and without ceremony."},{id:"scots-master",label:"Scots sailing master",hint:"Lowland Scots. Dry, precise, unimpressed.",voice:"cedar",delivery:"You are the sailing master of a Royal Navy sloop in 1805, a Lowland Scot from the Firth of Forth. Speak with a clear Scots accent: tapped 'r', tight vowels, the flat falling cadence of the east coast. Precise and unhurried, the voice of the man who actually navigates the ship and is quietly certain he is the best seaman aboard. Dry, faintly amused, never flustered. Report numbers exactly and without emphasis."},{id:"irish-gun-captain",label:"Irish gun captain",hint:"Cork lilt. Quick, cheerful, spoiling for a fight.",voice:"verse",delivery:"You are the captain of the maindeck guns aboard a Royal Navy sloop in 1805, from Cork. Speak with a warm Irish lilt: musical rising intonation at the end of phrases, soft 't' sounds, quick tempo. Cheerful and full of appetite for a fight, loud over the gundeck racket, the words tumbling out a little faster than they strictly should. Respectful to the captain, but plainly delighted whenever the answer involves the guns."},{id:"plain-modern",label:"Plain modern",hint:"No character. Neutral and easy to hear.",voice:"marin",delivery:"Read the line plainly in a neutral modern accent: clear, calm, moderate pace, no period affectation and no theatrical delivery. Prioritise intelligibility over character."}];function at(e){return Kt.find(t=>t.id===e)??Kt.find(t=>t.id===yo)??Kt[0]}const li={mic:'<path d="M12 19v3"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><rect x="9" y="2" width="6" height="13" rx="3"/>',"mic-off":'<line x1="2" x2="22" y1="2" y2="22"/><path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2"/><path d="M5 10v2a7 7 0 0 0 12 5"/><path d="M15 9.34V5a3 3 0 0 0-5.68-1.33"/><path d="M9 9v3a3 3 0 0 0 5.12 2.12"/><line x1="12" x2="12" y1="19" y2="22"/>',loader:'<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',volume:'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>',"volume-off":'<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/>',settings:'<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',sliders:'<line x1="21" x2="14" y1="4" y2="4"/><line x1="10" x2="3" y1="4" y2="4"/><line x1="21" x2="12" y1="12" y2="12"/><line x1="8" x2="3" y1="12" y2="12"/><line x1="21" x2="16" y1="20" y2="20"/><line x1="12" x2="3" y1="20" y2="20"/><line x1="14" x2="14" y1="2" y2="6"/><line x1="8" x2="8" y1="10" y2="14"/><line x1="16" x2="16" y1="18" y2="22"/>',"chevron-down":'<path d="m6 9 6 6 6-6"/>',"chevron-up":'<path d="m18 15-6-6-6 6"/>',"chevron-right":'<path d="m9 18 6-6-6-6"/>',"alert-triangle":'<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3"/><path d="M12 9v4"/><path d="M12 17h.01"/>',help:'<circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/>',key:'<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>'},ci="http://www.w3.org/2000/svg";function dn(e,t=22){const n=document.createElementNS(ci,"svg");return n.setAttribute("viewBox","0 0 24 24"),n.setAttribute("width",String(t)),n.setAttribute("height",String(t)),n.setAttribute("fill","none"),n.setAttribute("stroke","currentColor"),n.setAttribute("stroke-width","2"),n.setAttribute("stroke-linecap","round"),n.setAttribute("stroke-linejoin","round"),n.setAttribute("aria-hidden","true"),n.setAttribute("focusable","false"),n.classList.add("hud-icon",`hud-icon-${e}`),n.innerHTML=li[e],n}function ot(e,t,n=22){e.replaceChildren(dn(t,n))}function Tt(e,t){const n=`<svg xmlns="${ci}" viewBox="0 0 24 24" fill="none" stroke="${t}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${li[e]}</svg>`;return`url("data:image/svg+xml,${encodeURIComponent(n)}")`}const wo=[{title:"Steering",note:"Held until she has come round, then the helmsman meets her.",examples:[{say:"turn to starboard twenty degrees",explain:"Puts the rudder over by the angle you name, up to 35 degrees. Small orders bite gently; only hard over turns her sharply. She holds the helm until she has swung about twice the ordered angle, then meets her.",does:"20° of helm",action:"helm"},{say:"hard a-port",explain:"Full helm, 35 degrees. The sharpest turn she has, and what a tack is built on.",does:"full helm",action:"helm"},{say:"come left a touch",explain:"About 10 degrees of helm. Use it to nudge a course rather than change it.",does:"a small turn",action:"helm"},{say:"steady as she goes",explain:"Rudder amidships. Stops a turn wherever she happens to be pointing; it does not hold a compass course.",also:["midships","meet her"],does:"rudder amidships",action:"helm"},{say:"bear away a little",explain:"Turns away from the wind, whichever board she is on. Reads the wind for you, so you need not work out which way that is.",also:["fall off"],does:"away from the wind",action:"helm"},{say:"come up into the wind",explain:"Turns toward the wind, whichever board she is on. Come up too far and she will stall head to wind.",also:["luff up"],does:"toward the wind",action:"helm"}]},{title:"Coming about",note:"The crew run the whole evolution. She needs way on to tack at all.",examples:[{say:"ready about",explain:"The drilled tack: helm a-lee, sheets hauled flat, the jib held aback across the eye to carry the bow round, then the helm reversed to meet her on the new board. Refused without steerage way, and any helm or trim order cancels it.",also:["put her about","helm's a-lee","come about"],does:"tacks her",action:"tack"}]},{title:"Backing the headsail",note:"Pushes the bow off when the rudder has nothing to bite on. The way out of irons.",examples:[{say:"back the jib",explain:"Sheets the headsail to windward so the wind pushes the bow off. The rudder needs way on to work; this does not, which is what makes it the way out of irons and the way to force her round when stopped. Note the sim carries the backed sail's turning force but not its drag, so this pays her head off rather than stopping her: it is not yet a full heave-to.",also:["back the headsail","box the jib","heave to"],does:"jib to windward",action:"back_jib"}]},{title:"Sails",note:"The crew know the right trim for this wind and will sail her to it.",examples:[{say:"sheet in the main",explain:"Hauls the mainsail in, most of the way toward the right trim for the wind she is in. Add 'a touch' for a small adjustment instead.",also:["harden the main"],does:"hauls it in",action:"trim_sail"},{say:"ease the jib",explain:"Lets the headsail out, most of the way toward the right trim. Add 'a touch' for a small adjustment instead.",also:["let the jib out"],does:"lets it out",action:"trim_sail"},{say:"sheet in both sheets",explain:"Trims main and jib together. 'The sheets' and 'both sheets' always mean both sails, whatever the verb.",does:"both together",action:"trim_sail"},{say:"ease the main a touch",explain:"A small step of about a tenth, rather than the usual move most of the way to the right trim.",does:"a small adjustment",action:"trim_sail"},{say:"trim the sails",explain:"Sets both sails straight to the best trim for the wind she is in now, with no direction needed from you.",does:"sets the best trim",action:"trim_sail"},{say:"haul the jib right in",explain:"All the way in. 'All the way out' or 'let go' does the opposite.",does:"hard in",action:"trim_sail"}]},{title:"Gunnery",note:"The gun captain judges whether she bears. Loaded guns always discharge.",examples:[{say:"fire",explain:"Discharges whichever battery bears. A loaded gun always goes off on the order, so a shot fired when she does not bear is wasted.",also:["open fire","give them a broadside"],does:"the broadside",action:"fire_guns"},{say:"fire the port guns",explain:"Fires only that battery. Wasted if she does not bear on that side, so name a side only when you mean it.",does:"that battery only",action:"fire_guns"}]},{title:"Reports",examples:[{say:"status report",explain:"Heading, speed, and the wind's direction and strength. Any question about how she is doing gets the same answer.",also:["what's our heading","how are we doing"],does:"heading, speed, wind",action:"report_status"}]}],vo=["Space pauses and resumes.","Crossing her bow or stern rakes her, for triple damage. She can do the same to you.","In irons she pays off on her own, but it costs you time and way.","Click the wind rose to change which way it points."],yt={"gpt-realtime-2.1":{textIn:4,textCachedIn:.4,textOut:24,audioIn:32,audioCachedIn:.4,audioOut:64},"gpt-4o-mini-tts":{textIn:.6,textCachedIn:.6,textOut:0,audioIn:null,audioCachedIn:null,audioOut:12},"gpt-4o-mini":{textIn:.15,textCachedIn:.075,textOut:.6,audioIn:null,audioCachedIn:null,audioOut:null}},xo=.017,we=e=>Number.isFinite(e)&&e>0?e:0,_e=(e,t)=>we(e)*t/1e6;function ko(e,t="gpt-realtime-2.1"){const n=yt[t]??yt["gpt-realtime-2.1"],i=e.input_token_details??{},a=e.output_token_details??{},s=we(i.cached_tokens_details?.audio_tokens),o=we(i.cached_tokens_details?.text_tokens),r=Math.max(0,we(i.audio_tokens)-s),l=Math.max(0,(i.text_tokens===void 0?Math.max(0,we(e.input_tokens)-we(i.audio_tokens)):we(i.text_tokens))-o),d=we(a.audio_tokens),h=a.text_tokens===void 0?Math.max(0,we(e.output_tokens)-d):we(a.text_tokens);return _e(l,n.textIn)+_e(o,n.textCachedIn)+_e(r,n.audioIn??n.textIn)+_e(s,n.audioCachedIn??n.textCachedIn)+_e(h,n.textOut)+_e(d,n.audioOut??n.textOut)}function So(e,t="gpt-4o-mini"){const n=yt[t]??yt["gpt-4o-mini"],i=we(e.prompt_tokens_details?.cached_tokens),a=Math.max(0,we(e.prompt_tokens)-i);return _e(a,n.textIn)+_e(i,n.textCachedIn)+_e(we(e.completion_tokens),n.textOut)}function Eo(e){return Math.max(0,e)/60*xo}const Mo=4,To=50;function _o(e,t,n="gpt-4o-mini-tts"){const i=yt[n]??yt["gpt-4o-mini-tts"],a=Math.ceil(e.length/Mo),s=Math.max(0,t)*To;return _e(a,i.textIn)+_e(s,i.audioOut??0)}function Co(){const e=new Map;let t=!1;return{add:n=>{!Number.isFinite(n.usd)||n.usd<=0||(e.set(n.source,(e.get(n.source)??0)+n.usd),n.estimated&&(t=!0))},totalUsd:()=>[...e.values()].reduce((n,i)=>n+i,0),hasEstimates:()=>t,breakdown:()=>[...e.entries()].map(([n,i])=>({source:n,usd:i})).sort((n,i)=>i.usd-n.usd),reset:()=>{e.clear(),t=!1}}}function di(e){return e<=0?"$0":e<.01?`${(e*100).toFixed(2)}c`:e<1?`${(e*100).toFixed(1)}c`:`$${e.toFixed(2)}`}const Ao=["marin","cedar","alloy","ash","ballad","coral","echo","sage","shimmer","verse"],ui=[];function hi(e){ui.push(e)}function pi(){for(const e of ui)e()}let un=null;function mi(e){return e==="direct"||e==="realtime"||e==="ai"?e:"ai"}function Ro(e){if(e===null)return"→ no order";switch(e.action){case"helm":{const t=Math.round(e.degrees),n=t<0?"port":t>0?"stbd":"amidships";return`→ helm ${t}° (${n})`}case"trim_sail":return`→ trim ${e.sail} → ${e.trim.toFixed(2)}`;case"fire_guns":return e.side===void 0?"→ fire guns":`→ fire ${e.side} guns`;case"tack":return"→ ready about";case"back_jib":return"→ back the jib";case"report_status":return"→ status report";default:{const t=e;throw new Error(`unhandled intent: ${JSON.stringify(t)}`)}}}function No(e,t,n){e.innerHTML="",$o();const i=document.createElement("div");i.id="hud",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel hud-state",i.appendChild(a);function s(c,g,C=!1){const E=document.createElement("div");E.id=c,E.className="hud-row";const U=document.createElement("span");U.className="hud-row-label",U.textContent=g,E.appendChild(U);const ee=document.createElement("span");ee.className="hud-row-colon",ee.textContent=": ",E.appendChild(ee);const A=document.createElement("span");A.className="hud-row-value",A.textContent="--",E.appendChild(A);let Y=null,F=null;if(C){const O=document.createElement("div");O.className="hud-bar",Y=document.createElement("div"),Y.className="hud-bar-fill",O.appendChild(Y),F=document.createElement("div"),F.className="hud-bar-marker",F.hidden=!0,O.appendChild(F),E.appendChild(O)}return a.appendChild(E),{setValue:O=>{A.textContent=O},setFill:Y?O=>{Y&&(Y.style.width=`${Math.max(0,Math.min(100,O))}%`)}:void 0,setMarker:F?O=>{F&&(F.hidden=O===null,O!==null&&(F.style.left=`${Math.max(0,Math.min(100,O))}%`))}:void 0}}const o=s("hud-heading","heading"),r=s("hud-speed","speed"),l=s("hud-wind","wind"),d=s("hud-awa","awa"),h=s("hud-main","main",!0),u=s("hud-jib","jib",!0),p=s("hud-rudder","rudder"),m=s("hud-guns","guns",!0),f=document.getElementById("hud-guns");f.hidden=!0;const x=s("hud-hull","hull",!0),D=document.getElementById("hud-hull");D.hidden=!0;const N=document.createElement("div");N.id="hud-enemy-divider",N.className="hud-enemy-divider",N.textContent="Enemy",N.hidden=!0,a.appendChild(N);const T=s("hud-enemy","she"),j=document.getElementById("hud-enemy");j.hidden=!0,j.classList.add("hud-enemy-row");const k="http://www.w3.org/2000/svg";function I(c,g){const C=document.createElementNS(k,c);for(const[E,U]of Object.entries(g))C.setAttribute(E,U);return C}const K=document.getElementById("hud-wind"),L=40,z=15,ce=document.createElement("div");ce.id="hud-windrose",ce.className="hud-windrose";const b=I("svg",{viewBox:"0 0 120 120",width:"88",height:"88","aria-hidden":"true",focusable:"false"});function H(c,g,C){const E=O=>{const pe=O*Math.PI/180;return[60+Math.sin(pe)*C,60-Math.cos(pe)*C]},[U,ee]=E(c),[A,Y]=E(g),F=Math.abs(g-c)>180?1:0;return`M 60 60 L ${U} ${ee} A ${C} ${C} 0 ${F} 1 ${A} ${Y} Z`}b.appendChild(I("circle",{cx:"60",cy:"60",r:"52",class:"hud-windrose-ring"}));const y=I("g",{class:"hud-windrose-world"});for(const[c,g]of[["N",0],["E",90],["S",180],["W",270]]){const C=g*Math.PI/180,E=I("text",{x:String(60+Math.sin(C)*43),y:String(60-Math.cos(C)*43),class:c==="N"?"hud-windrose-letter hud-windrose-north":"hud-windrose-letter","text-anchor":"middle","dominant-baseline":"central"});E.textContent=c,y.appendChild(E)}b.appendChild(y);const _=I("g",{class:"hud-windrose-wind"});_.appendChild(I("path",{d:H(-L,L,52),class:"hud-windrose-nogo"})),_.appendChild(I("path",{d:H(180-z,180+z,52),class:"hud-windrose-deep"})),_.appendChild(I("line",{x1:"60",y1:"-2",x2:"60",y2:"44",class:"hud-windvane-arrow-shaft"})),_.appendChild(I("polygon",{points:"60,54 52,38 68,38",class:"hud-windvane-arrow-head"}));const P=I("text",{x:"60",y:"-10",class:"hud-windrose-windlabel","text-anchor":"middle","dominant-baseline":"central"});P.textContent="WIND",_.appendChild(P),b.appendChild(_);const X=I("g",{class:"hud-windrose-shipgroup"});X.appendChild(I("polygon",{points:"60,42 53,74 60,67 67,74",class:"hud-windrose-boat"})),b.appendChild(X),ce.appendChild(b);const W=document.createElement("div");W.id="hud-windrose-warn",W.className="hud-windrose-warn",W.textContent=" ",ce.appendChild(W);const J=["wind-up","north-up","bow-up"],w={"wind-up":"wind up","north-up":"north up","bow-up":"bow up"};function v(){const c=bt().visuals.windRoseMode;return J.includes(c)?c:"wind-up"}let R=v();const S=document.createElement("button");S.id="hud-windrose-mode",S.type="button",S.className="hud-windrose-mode",S.title="Click to change which way the rose points",ce.appendChild(S);function te(c){R=c,S.textContent=w[c],Vt({visuals:{windRoseMode:c}})}function B(){te(J[(J.indexOf(R)+1)%J.length])}b.addEventListener("click",B),S.addEventListener("click",B),te(R),K.after(ce);const Se=document.getElementById("hud-rudder"),We=document.createElement("div");We.className="hud-gauge";const Jt=document.createElement("div");Jt.className="hud-gauge-center-tick",We.appendChild(Jt);const dt=document.createElement("div");dt.className="hud-gauge-target",We.appendChild(dt);const ut=document.createElement("div");ut.className="hud-gauge-needle",We.appendChild(ut),Se.appendChild(We);let ht=null;function Xt(c){return(Math.max(-35,Math.min(35,c))+35)/70*100}function Pn(c){const g=Xt(c);ut.style.left=`${g}%`,ut.classList.toggle("port",c<-.5),ut.classList.toggle("stbd",c>.5),ht!==null&&Math.abs(c-ht)>.5?(dt.style.left=`${Xt(ht)}%`,dt.style.display="block"):dt.style.display="none"}const V=document.createElement("div");V.id="hud-irons",V.className="hud-irons-row";const ne=document.createElement("span");ne.className="hud-visually-hidden",ne.textContent="irons: false",V.appendChild(ne),a.appendChild(V);const q=document.createElement("div");q.className="hud-panel hud-log",i.appendChild(q);const ie=document.createElement("div");ie.className="hud-log-header",q.appendChild(ie);const He=document.createElement("div");He.className="hud-panel-title hud-log-title-text",He.textContent="Quarterdeck Log",ie.appendChild(He);const Be={orders:"orders only",full:"with replies"};function Je(c){return c==="full"?"full":"orders"}let me=Je(bt().input.logDetail);const Fe=Co(),re=document.createElement("span");re.id="cost-tally",re.className="hud-cost-tally",re.hidden=!0,ie.appendChild(re);const ge={realtime:"voice session",transcribe:"transcription",speech:"crew speech",intent:"order parsing"};function On(){const c=Fe.totalUsd();if(c<=0)return;re.hidden=!1,re.textContent=`${Fe.hasEstimates()?"~":""}${di(c)}`;const g=Fe.breakdown().map(C=>`${ge[C.source]}  ${di(C.usd)}`);re.title=`Approximate spend this session
${g.join(`
`)}`+(Fe.hasEstimates()?`

The ~ means part of this is estimated: the speech API reports no usage, so the crew's spoken lines are inferred from text length and audio duration.`:`

Measured from the usage each API call reports.`)}const Me=document.createElement("button");Me.id="log-view-toggle",Me.type="button",Me.className="hud-btn hud-command-config-demo hud-log-view-toggle";const Ee=document.createElement("button");Ee.id="command-config-toggle",Ee.type="button",Ee.title="Command settings",Ee.setAttribute("aria-label","Command config"),Ee.className="hud-btn hud-command-config-toggle",ot(Ee,"sliders",15),ie.appendChild(Ee);const Q=document.createElement("div");Q.id="hud-log-list",Q.className="hud-log-list",q.appendChild(Q);const xt=14,de=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function Re(){Q.innerHTML="",Q.dataset.view=me;let c=-1;de.forEach((g,C)=>{g.kind==="exchange"&&(c=C)}),de.forEach((g,C)=>{const E=document.createElement("div");if(g.kind==="system"){E.className="hud-log-entry hud-log-system-entry";const F=document.createElement("div");F.className="hud-log-system",F.textContent=g.transcript,E.appendChild(F),Q.appendChild(E);return}if(g.kind==="crew"){E.className="hud-log-entry hud-log-crew-entry";const F=document.createElement("div");F.className="hud-log-crew",F.textContent=`Crew: ${g.crew}`,E.appendChild(F),Q.appendChild(E);return}const U=C===c;E.className=U?"hud-log-entry latest":"hud-log-entry";const ee=document.createElement("div");ee.className="hud-log-you",U&&(ee.id="hud-transcript"),ee.textContent=`You: ${g.transcript}`,E.appendChild(ee);const A=document.createElement("div");A.className="hud-log-order",U&&(A.id="hud-intent"),A.textContent=g.order,E.appendChild(A);const Y=document.createElement("div");Y.className="hud-log-crew",U&&(Y.id="hud-crew"),Y.textContent=g.crew,E.appendChild(Y),Q.appendChild(E)}),Q.scrollTop=Q.scrollHeight}function pt(c){me=c,Me.textContent=Be[c],Me.title=c==="orders"?"Showing your orders and what the ship did. Click to add the crew's spoken replies.":"Showing the full exchange. Click to hide the crew's spoken replies.",Vt({input:{logDetail:c}}),Re()}Me.addEventListener("click",()=>{pt(me==="orders"?"full":"orders"),De()}),pt(me);const Qt=Ro;function Zt(c){de.push({kind:"exchange",transcript:c,order:"→ …",crew:"…"}),de.length>xt&&de.shift(),Re()}function Ne(c){const g=[...de].reverse().find(C=>C.kind==="exchange");g&&(g.transcript=c,Re())}function $(c){const g=[...de].reverse().find(C=>C.kind==="exchange");g&&(g.order=Qt(c)),c!==null&&c.action==="helm"&&(ht=c.degrees),Re()}function Z(c){const g=[...de].reverse().find(C=>C.kind==="exchange");g&&(g.crew=c),Re()}function he(c){de.push({kind:"crew",transcript:"",order:"",crew:c}),de.length>xt&&de.shift(),Re()}function Ie(c){de.push({kind:"system",transcript:c,order:"",crew:""}),de.length>xt&&de.shift(),Re()}const Xe=document.createElement("div");Xe.className="hud-controls",q.insertBefore(Xe,Q);const Qe=document.createElement("details");Qe.id="input-mode-details",Qe.className="hud-input-mode-details",Qe.open=!0;const kt=document.createElement("summary");kt.id="input-mode-summary",kt.className="hud-input-mode-summary",Qe.appendChild(kt);const Ze=document.createElement("div");Ze.id="input-mode",Ze.className="hud-input-mode",Ze.setAttribute("role","radiogroup"),Ze.setAttribute("aria-label","Command input mode"),Qe.appendChild(Ze);function Ln(c,g,C,E=!1){const U=document.createElement("label");U.className="hud-input-mode-option",U.dataset.mode=c;const ee=document.createElement("input");ee.type="radio",ee.name="input-mode",ee.id=`input-mode-${c}`,ee.value=c,U.appendChild(ee);const A=document.createElement("span");A.className="hud-input-mode-copy";const Y=document.createElement("span");Y.className="hud-input-mode-name",Y.textContent=g;const F=document.createElement("span");if(F.className="hud-input-mode-source",F.textContent=C,A.appendChild(Y),A.appendChild(F),U.appendChild(A),E){const O=document.createElement("button");O.type="button",O.className="hud-key-dot",O.dataset.mode=c;const pe=()=>{const nt=Ft();O.classList.toggle("ok",nt),O.replaceChildren(dn("key",11)),nt||O.append(" add key"),O.title=nt?"OpenAI key saved. Click to change it.":"No OpenAI key. Click to add one."};O.addEventListener("click",nt=>{nt.preventDefault(),nt.stopPropagation(),un?.()}),pe(),hi(pe),U.appendChild(O)}return Ze.appendChild(U),{label:U,radio:ee}}const Hn=Ln("ai","AI Orders","Type or dictate. GPT works out what you mean.",!0),zn=Ln("realtime","GPT Realtime","Talk over your mic. The crew answers aloud.",!0),jn=Ln("direct","Direct Orders","Type or dictate. Instant, set phrases, no AI."),le=document.createElement("input");le.id="transcript-input",le.type="text",le.placeholder="Paste or dictate an order",le.className="hud-input",Xe.appendChild(le);const et=document.createElement("button");et.id="no-key-warning",et.type="button",et.className="hud-no-key-warning",et.textContent="No OpenAI key. Click to add one.",et.hidden=!0,et.addEventListener("click",()=>un?.()),Xe.appendChild(et);function ha(){et.hidden=Ft()||St==="direct"}hi(ha);const Ke=document.createElement("div");Ke.id="input-status",Ke.className="hud-input-status",Ke.setAttribute("role","status"),Ke.setAttribute("aria-live","polite"),Ke.hidden=!0,Xe.appendChild(Ke);const ae=document.createElement("button");ae.id="ptt",ae.type="button",ae.className="hud-btn hud-rail-btn hud-btn-ptt",ot(ae,"mic-off"),ae.title="Connect the microphone",ae.setAttribute("aria-label","Connect the microphone"),ae.hidden=!0;const It=document.createElement("button");It.id="view-toggle",It.type="button",It.textContent="Helm View",It.className="hud-btn hud-btn-view-toggle";let St="direct",Dt="disconnected",Pt=null,Vn=null,mt=!1,Ot=!1,pa=null;function gt(c,g="neutral"){Ke.textContent=c,Ke.dataset.tone=g,Ke.hidden=g!=="error"}function Lt(){return St!=="realtime"}const tl={ai:"AI Orders",realtime:"GPT Realtime",direct:"Direct Orders"};function Wn(c,g=!0){St=c,jn.radio.checked=c==="direct",Hn.radio.checked=c==="ai",zn.radio.checked=c==="realtime",kt.textContent=`Orders: ${tl[c]}`,le.disabled=c==="realtime",le.hidden=c==="realtime",ae.hidden=c!=="realtime",q.dataset.mode=c,c==="realtime"?(tn(),gt("Mic disconnected")):(le.placeholder="Paste or dictate an order",gt(c==="ai"?"Ready, GPT parses orders":"Ready locally"),window.setTimeout(()=>le.focus(),0)),ha(),zt(Dt),g&&n.setInputMode(c)}function Bn(c){Wn(c),pa?.()}jn.radio.addEventListener("change",()=>{jn.radio.checked&&Bn("direct")}),Hn.radio.addEventListener("change",()=>{Hn.radio.checked&&Bn("ai")}),zn.radio.addEventListener("change",()=>{zn.radio.checked&&Bn("realtime")}),ae.addEventListener("click",()=>n.toggleRealtime());function De(){Lt()&&le.focus()}const en=bt().input,ma=2;let Ht=null;function tn(){Ht!==null&&(clearTimeout(Ht),Ht=null)}let Fn=!1,nn=null;async function Kn(c){if(!Lt())return;if(Fn||(n.isPipelineBusy?.()??!1)){nn=c;return}Fn=!0,tn();const g=performance.now(),C=St==="ai";gt(C?"Asking GPT…":"Processing locally");try{await n.injectTranscript(c),le.value="";const E=Math.max(1,Math.round(performance.now()-g));gt(C?`Accepted in ${E} ms`:`Accepted locally in ${E} ms`,"ok")}catch(E){const U=E instanceof Error?E.message:String(E);Z(U),gt("Order not sent","error")}finally{if(Fn=!1,De(),nn!==null){const E=nn;nn=null,Kn(E)}}}function ga(c){if(!en.autoSubmit)return;const g=c.trim();g.length<ma||Kn(g)}le.addEventListener("input",c=>{if(!Lt()||(tn(),!en.autoSubmit))return;if(c.inputType==="insertFromPaste"){ga(le.value);return}le.value.trim().length<ma||(Ht=setTimeout(()=>{Ht=null,ga(le.value)},en.autoSubmitDelayMs))}),le.addEventListener("keydown",c=>{if(!Lt()||c.key!=="Enter")return;tn();const g=le.value.trim();g.length!==0&&Kn(g)}),document.addEventListener("click",c=>{const g=c.target;if(g instanceof HTMLCanvasElement){De();return}g instanceof Element&&g.closest("#env-selector")&&De()}),document.addEventListener("keydown",c=>{!Lt()||xi(c.target)||c.ctrlKey||c.metaKey||c.altKey||!(c.key.length===1)&&c.key!=="Backspace"||le.focus()},{capture:!0}),Wn(mi(en.defaultMode),!1);const Et=document.createElement("div");Et.id="hud-rail",Et.className="hud-rail",i.appendChild(Et),Et.appendChild(ae);const tt=document.createElement("button");tt.id="help-toggle",tt.type="button",tt.title="Orders you can give",tt.setAttribute("aria-label","Orders you can give"),tt.className="hud-btn hud-rail-btn hud-help-toggle",ot(tt,"help"),Et.appendChild(tt),Ko(i,tt,De);const Te=document.createElement("button");Te.id="mute-toggle",Te.type="button",Te.title="Mute all sound",Te.setAttribute("aria-label","Mute all sound"),Te.className="hud-btn hud-rail-btn hud-mute-toggle",ot(Te,"volume"),Et.appendChild(Te);function fa(c,g,C,E,U,ee){const A=document.createElement("button");A.id=c,A.type="button",A.className="hud-centre-callout",A.hidden=!0,A.title=E,A.setAttribute("aria-label",E);const Y=document.createElement("span");Y.className="hud-centre-callout-icon",Y.appendChild(dn(g,46)),A.appendChild(Y);const F=document.createElement("span");return F.className="hud-centre-callout-label",F.textContent=C,A.appendChild(F),A.addEventListener("click",ee),i.appendChild(A),{get visible(){return!A.hidden},show(){A.hidden&&(A.classList.remove("flying"),A.style.transform="",A.style.opacity="",A.hidden=!1)},dismiss(){if(A.hidden)return;const O=A.getBoundingClientRect(),pe=U?.getBoundingClientRect();if(window.matchMedia("(prefers-reduced-motion: reduce)").matches||O.width===0||pe===void 0||pe.width===0){A.hidden=!0;return}const nt=pe.left+pe.width/2-(O.left+O.width/2),dl=pe.top+pe.height/2-(O.top+O.height/2);A.classList.add("flying"),A.style.transform=`translate(${nt}px, ${dl}px) scale(${pe.width/O.width})`,A.style.opacity="0";const ka=()=>{A.hidden=!0,A.classList.remove("flying"),A.style.transform="",A.style.opacity=""};A.addEventListener("transitionend",ka,{once:!0}),window.setTimeout(ka,700)}}}Vn=fa("paused-overlay","loader","Paused","The ship is paused. Press space, or click, to resume.",null,()=>ba(!1)),Pt=fa("mic-overlay","mic-off","Connect Mic","The microphone is off. Click to connect it and take the deck.",ae,()=>n.toggleRealtime());function zt(c){if(Pt===null)return;!Ot&&St==="realtime"&&(c==="disconnected"||c==="error")?Pt.show():Pt.dismiss()}function nl(c){mt=c,ot(Te,mt?"volume-off":"volume"),Te.title=mt?"Unmute":"Mute all sound",Te.classList.toggle("muted",mt),zt(Dt),n.setMuted?.(mt),De()}Te.addEventListener("click",()=>nl(!mt));function ba(c){Ot=c,Ot?(Pt?.dismiss(),Vn?.show()):(Vn?.dismiss(),zt(Dt)),n.setPaused?.(Ot),De()}document.addEventListener("keydown",c=>{c.key!==" "&&c.code!=="Space"||xi(c.target)||c.ctrlKey||c.metaKey||c.altKey||(c.preventDefault(),ba(!Ot))}),zt(Dt),Wo(i,De),Fo(i,()=>{pi(),De()}),pa=Bo(q,Ee,n,De,{inputModeDetails:Qe,viewToggleButton:It,logViewToggle:Me});function an(c){return c.toFixed(1)}function ya(c){return c.toFixed(2)}const il=["N","NE","E","SE","S","SW","W","NW"];function wa(c){return(c%360+360)%360}function al(c){const g=Math.round(wa(c)/45)%8;return il[g]??"N"}function va(c){return String(Math.round(wa(c))%360).padStart(3,"0")}function ol(c){return`${va(c)} ${al(c)}`}function sl(c,g){return`from ${va(c)} @ ${an(g)} kts`}function rl(c,g){const C=Math.round(c);if(C===0)return`dead ahead @ ${an(g)} kts`;const E=C<0?"port":"starboard";return`${Math.abs(C)}° to ${E} @ ${an(g)} kts`}function ll(c){const g=Math.round(c),C=g<0?"port":g>0?"stbd":"amidships";return`${g}° ${C}`}function cl(c){o.setValue(ol(c.heading)),r.setValue(`${an(c.speedKts)} kts`),l.setValue(sl(c.windDirection,c.windSpeedKts));const g=c.heading,C=c.windDirection,E=R==="north-up"?{world:0,wind:C,ship:g}:R==="wind-up"?{world:-C,wind:0,ship:g-C}:{world:-g,wind:C-g,ship:0};y.setAttribute("transform",`rotate(${E.world} 60 60)`),_.setAttribute("transform",`rotate(${E.wind} 60 60)`),P.setAttribute("transform",`rotate(${-E.wind} 60 -10)`),X.setAttribute("transform",`rotate(${E.ship} 60 60)`);const U=Math.abs(c.apparentWindAngle),ee=U<45,A=U>180-z;W.textContent=ee?"too close to the wind":A?"running deep":" ",W.dataset.tone=ee||A?"warn":"ok",d.setValue(rl(c.apparentWindAngle,c.apparentWindKts)),h.setValue(ya(c.mainTrim)),h.setFill?.(c.mainTrim*100),u.setValue(ya(c.jibTrim)),u.setFill?.(c.jibTrim*100);const Y=je(Math.abs(c.apparentWindAngle))*100;h.setMarker?.(Y),u.setMarker?.(Y),p.setValue(ll(c.rudderAngle));const F=n.getRudderTargetDeg?.();F!==void 0&&(ht=F),Pn(c.rudderAngle);const O=n.getBattleStatus?.()??null;f.hidden=O===null,D.hidden=O===null,j.hidden=O===null,N.hidden=O===null,O!==null&&(m.setValue(O.guns),m.setFill?.(O.gunsReadyPct),x.setValue(O.hull),x.setFill?.(O.hullPct),T.setValue(O.enemy)),ne.textContent=`irons: ${c.inIrons}`,V.classList.toggle("active",c.inIrons);const pe=n.getMicLevel?.()??0;ae.classList.toggle("hearing",pe>.06),ae.style.setProperty("--mic-level",(Math.min(1,pe)*.75).toFixed(3)),Te.classList.toggle("sounding",!mt&&(n.isCrewAudible?.()??!1))}function xa(){cl(t.getState())}return xa(),st={logTranscript:Zt,amendTranscript:Ne,logIntent:$,logCrewLine:Z,logCrewEvent:he,logSystemNote:Ie},gi={add:(c,g,C)=>{Fe.add({source:g,usd:c,estimated:C}),On()}},yi={setInputMode:c=>Wn(c,!1),setRealtimeState:(c,g)=>{Dt=c,zt(c),ae.classList.toggle("listening",c==="listening"),ae.classList.toggle("recording",c==="speaking"),ae.classList.toggle("failed",c==="error"),ae.disabled=c==="connecting";const E={disconnected:{icon:"mic-off",title:"Connect the microphone"},connecting:{icon:"loader",title:"Connecting the microphone"},listening:{icon:"mic",title:"Microphone live. Click to mute it."},speaking:{icon:"mic",title:"Crew speaking. Click to mute the microphone."},error:{icon:"mic-off",title:"Microphone failed. Click to try again."}}[c];if(ot(ae,E.icon),ae.title=E.title,ae.setAttribute("aria-label",E.title),St!=="realtime")return;gt(g??{disconnected:"Mic disconnected",connecting:"Connecting to GPT Realtime",listening:"Listening",speaking:"Crew speaking",error:"Realtime unavailable"}[c],c==="error"?"error":"neutral")},setStatus:gt},wi={focus:De},{update:xa}}let gi=null;function hn(e,t,n=!1){gi?.add(e,t,n)}let st=null;function Io(e){st?.logTranscript(e)}function Do(e){st?.amendTranscript(e)}function fi(e){st?.logIntent(e)}function bi(e){st?.logCrewLine(e)}function pn(e){st?.logCrewEvent(e)}function mn(e){st?.logSystemNote(e)}function Po(e,t){fi(e),bi(t)}let yi=null;function Oo(e,t){yi?.setRealtimeState(e,t)}let wi=null;function Lo(){wi?.focus()}let vi=[];function Ho(e){vi.push(e)}function zo(e,t){for(const n of vi)n(e,t)}function xi(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function jo(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function Vo(e,t,n){const i=t.split("."),a=i[i.length-1];if(a===void 0)return;let s=e;for(let o=0;o<i.length-1;o++){const r=i[o];if(r===void 0)return;const l=s[r];(typeof l!="object"||l===null)&&(s[r]={}),s=s[r]}s[a]=n}function ki(e,t){const n={...e};for(const i of Object.keys(t)){const a=e[i],s=t[i];a!==null&&typeof a=="object"&&!Array.isArray(a)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=ki(a,s):n[i]=s}return n}function Wo(e,t){const n=bt(),i={};let a=!1;const s=new Map,o=document.createElement("button");o.id="settings-toggle",o.type="button",o.title="Settings",o.setAttribute("aria-label","Settings"),o.className="hud-btn hud-rail-btn hud-settings-toggle",ot(o,"settings"),(document.getElementById("hud-rail")??e).appendChild(o);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);{let b=function(){let S="";try{S=oi()?.trim()??""}catch{S=""}const te=S.length>0;J.value="",J.placeholder=te?`saved (…${S.slice(-4)})`:"sk-...",R.textContent=te?"Saved in this browser. AI Orders and GPT Realtime will use it.":"Not set. AI Orders and GPT Realtime are unavailable; Direct Orders still work.",R.dataset.tone=te?"ok":"warn",v.hidden=!te,pi()},H=function(){const S=J.value.trim();S.length!==0&&(si(S),b())};const y=document.createElement("details");y.className="hud-settings-section",y.id="openai-key-section",y.open=!0;const _=document.createElement("summary");_.textContent="OpenAI key",y.appendChild(_);const P=document.createElement("div");P.className="hud-settings-field",y.appendChild(P);const X=document.createElement("div");X.className="hud-settings-note",X.textContent="Needed for AI Orders and GPT Realtime. Stored in this browser only and sent straight to api.openai.com. Without one, Direct Orders still work through the local parser.",P.appendChild(X);const W=document.createElement("div");W.className="hud-settings-key-row",P.appendChild(W);const J=document.createElement("input");J.id="openai-key-input",J.type="password",J.autocomplete="off",J.className="hud-settings-text",W.appendChild(J);const w=document.createElement("button");w.id="openai-key-save",w.type="button",w.className="hud-btn",w.textContent="Save",W.appendChild(w);const v=document.createElement("button");v.id="openai-key-clear",v.type="button",v.className="hud-btn",v.textContent="Clear",W.appendChild(v);const R=document.createElement("div");R.id="openai-key-status",R.className="hud-settings-note",P.appendChild(R),w.addEventListener("click",H),J.addEventListener("keydown",S=>{S.key==="Enter"&&(S.preventDefault(),H())}),v.addEventListener("click",()=>{co(),b()}),b(),r.appendChild(y),un=()=>{ce(!0),y.open=!0,y.scrollIntoView({block:"nearest"}),window.setTimeout(()=>J.focus(),0)}}function h(){d.hidden=!a}function u(b,H){if(Vo(i,b.path,H),b.live)zo(b.path,H);else{const y=s.get(b.path);y&&(y.hidden=!1),a=!0,h()}}function p(b,H){const y=document.createElement("div");y.className="hud-settings-control-row";const _=document.createElement("input");_.type="range",_.min=String(b.min??0),_.max=String(b.max??100),_.step=String(b.step??1),_.value=String(H),_.className="hud-settings-range";const P=document.createElement("input");P.type="number",P.min=_.min,P.max=_.max,P.step=_.step,P.value=String(H),P.className="hud-settings-numeric";const X=b.min??-1/0,W=b.max??1/0;function J(w){if(!Number.isFinite(w))return;const v=Math.min(W,Math.max(X,w));_.value=String(v),P.value=String(v),u(b,v)}return _.addEventListener("input",()=>J(Number(_.value))),P.addEventListener("input",()=>J(Number(P.value))),y.appendChild(_),y.appendChild(P),y}function m(b,H){const y=document.createElement("label");y.className="hud-settings-checkbox-label";const _=document.createElement("input");return _.type="checkbox",_.checked=H,_.addEventListener("change",()=>u(b,_.checked)),y.appendChild(_),y}function f(b,H){const y=document.createElement("select");y.className="hud-settings-select";for(const _ of b.options??[]){const P=document.createElement("option");P.value=_,P.textContent=_,_===H&&(P.selected=!0),y.appendChild(P)}return y.addEventListener("change",()=>u(b,y.value)),y}function x(b,H){const y=document.createElement("input");return y.type="color",y.className="hud-settings-color",y.value=H,y.addEventListener("input",()=>u(b,y.value)),y}function D(b,H){const y=document.createElement("input");return y.type="text",y.className="hud-settings-text",y.value=H,y.addEventListener("change",()=>u(b,y.value)),y}function N(b){const H=document.createElement("div");H.className="hud-settings-field",H.dataset.configPath=b.path;const y=document.createElement("div");y.className="hud-settings-label-row";const _=document.createElement("span");if(_.className="hud-settings-label",_.textContent=b.label,y.appendChild(_),!b.live){const W=document.createElement("span");W.className="hud-settings-reload-dot",W.title="Staged. Needs Save & Reload.",W.hidden=!0,y.appendChild(W),s.set(b.path,W)}H.appendChild(y);const P=jo(n,b.path);let X;switch(b.type){case"number":X=p(b,P);break;case"boolean":X=m(b,P);break;case"select":X=f(b,P);break;case"color":X=x(b,P);break;default:X=D(b,P);break}if(H.appendChild(X),b.note){const W=document.createElement("div");W.className="hud-settings-note",W.textContent=b.note,H.appendChild(W)}return H}const T=new Map;for(const b of Ka)b.hidden||(T.has(b.section)||T.set(b.section,[]),T.get(b.section)?.push(b));const j=new Set(["Visuals","Environment","Lighting"]);for(const[b,H]of T){const y=document.createElement("details");y.className="hud-settings-section",y.open=j.has(b);const _=document.createElement("summary");_.textContent=b,y.appendChild(_);for(const P of H)y.appendChild(N(P));r.appendChild(y)}const k=document.createElement("div");k.className="hud-settings-footer";const I=document.createElement("button");I.id="settings-save-reload",I.type="button",I.textContent="Save & Reload",I.className="hud-btn",I.addEventListener("click",()=>{Vt(i),location.reload()});const K=document.createElement("button");K.id="settings-copy-json",K.type="button",K.textContent="Copy JSON",K.className="hud-btn",K.addEventListener("click",()=>{(async()=>{const b=ki(n,i),H=JSON.stringify(b,null,2);console.log(H);try{await navigator.clipboard?.writeText(H)}catch{}})()});const L=document.createElement("button");L.id="settings-reset-all",L.type="button",L.textContent="Reset All",L.className="hud-btn",L.addEventListener("click",()=>{Qn(),location.reload()}),k.appendChild(I),k.appendChild(K),k.appendChild(L),r.appendChild(k);let z=!1;function ce(b){z=b,r.classList.toggle("open",b),o.classList.toggle("active",b),b||t()}o.addEventListener("click",()=>ce(!z))}function Bo(e,t,n,i,a){const s=bt(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function r(L){const z=document.createElement("div");return z.className="hud-command-config-section-title",z.textContent=L,z}o.appendChild(r("Orders")),o.appendChild(a.inputModeDetails),o.appendChild(r("Crew Voice"));const l=document.createElement("div");l.className="hud-command-config-row";const d=document.createElement("label");d.className="hud-toggle-label";const h=document.createElement("input");h.id="tts-enabled",h.type="checkbox",h.checked=!0,h.addEventListener("change",()=>n.setCrewAudioEnabled(h.checked)),d.appendChild(h),d.appendChild(document.createTextNode("Hear crew replies")),l.appendChild(d);const u=document.createElement("select");u.id="tts-voice-select",u.className="hud-settings-select hud-command-config-voice-select";for(const L of Ao){const z=document.createElement("option");z.value=L,z.textContent=L,L===s.voice.ttsVoice&&(z.selected=!0),u.appendChild(z)}let p=!1;u.addEventListener("change",()=>{p=!0,n.setTtsVoice(u.value)}),l.appendChild(u),o.appendChild(l);const m=document.createElement("div");m.className="hud-command-config-row";const f=document.createElement("select");f.id="crew-accent-select",f.className="hud-settings-select hud-command-config-accent-select";for(const L of Kt){const z=document.createElement("option");z.value=L.id,z.textContent=L.label,L.id===at(s.voice.crewAccent).id&&(z.selected=!0),f.appendChild(z)}m.appendChild(f),o.appendChild(m);const x=document.createElement("div");x.id="crew-accent-hint",x.className="hud-command-config-hint",x.textContent=at(s.voice.crewAccent).hint,o.appendChild(x),f.addEventListener("change",()=>{const L=at(f.value);x.textContent=L.hint,n.setCrewAccent(L.id),p||(u.value=L.voice,n.setTtsVoice(L.voice))});const D=document.createElement("div");D.className="hud-command-config-row";const N=document.createElement("span");N.className="hud-command-config-volume-label",N.textContent="Volume",D.appendChild(N);const T=document.createElement("input");T.id="tts-volume",T.type="range",T.min="0",T.max="1",T.step="0.05",T.value=String(s.voice.ttsVolume),T.className="hud-settings-range",T.addEventListener("input",()=>n.setTtsVolume(Number(T.value))),D.appendChild(T),o.appendChild(D),o.appendChild(r("View")),a.viewToggleButton.classList.add("hud-command-config-demo"),o.appendChild(a.viewToggleButton),o.appendChild(a.logViewToggle),o.appendChild(r("Actions"));const j=document.createElement("button");j.id="demo",j.type="button",j.textContent="Run Demo",j.className="hud-btn hud-btn-demo hud-command-config-demo",o.appendChild(j);let k=!1;function I(L){k=L,o.classList.toggle("open",k),t.classList.toggle("active",k),k&&K(),k||i()}function K(){const L=e.getBoundingClientRect().top-18;o.style.maxHeight=`${Math.max(200,Math.min(540,L))}px`}return t.addEventListener("click",()=>I(!k)),document.addEventListener("mousedown",L=>{if(!k)return;const z=L.target;o.contains(z)||t.contains(z)||I(!1)}),document.addEventListener("keydown",L=>{L.key==="Escape"&&k&&I(!1)}),()=>I(!1)}function Fo(e,t){if(Ft())return;const n=document.createElement("div");n.id="key-prompt",n.className="hud-key-prompt-backdrop";const i=document.createElement("div");i.className="hud-panel hud-key-prompt",n.appendChild(i);const a=document.createElement("div");a.className="hud-panel-title",a.textContent="Before you take the deck",i.appendChild(a);const s=document.createElement("p");s.className="hud-key-prompt-blurb",s.textContent="Captain needs an OpenAI key to hear your orders and answer them. It is stored in this browser only, and is sent to OpenAI and nowhere else.",i.appendChild(s);const o=document.createElement("input");o.id="key-prompt-input",o.type="password",o.autocomplete="off",o.spellcheck=!1,o.placeholder="sk-...",o.className="hud-settings-text hud-key-prompt-input",i.appendChild(o);const r=document.createElement("div");r.className="hud-settings-note",i.appendChild(r);const l=document.createElement("div");l.className="hud-key-prompt-actions",i.appendChild(l);const d=document.createElement("button");d.id="key-prompt-save",d.type="button",d.className="hud-btn hud-key-prompt-save",d.textContent="Save key and sail",l.appendChild(d);const h=document.createElement("button");h.id="key-prompt-skip",h.type="button",h.className="hud-btn",h.textContent="Not now",h.title="Direct Orders still works without a key",l.appendChild(h);function u(){n.remove(),t()}d.addEventListener("click",()=>{const p=o.value.trim();if(p.length===0){r.textContent="Paste a key first, or choose Not now.",r.dataset.tone="warn",o.focus();return}si(p),u()}),o.addEventListener("keydown",p=>{p.key==="Enter"&&d.click(),p.stopPropagation()}),h.addEventListener("click",u),e.appendChild(n),window.setTimeout(()=>o.focus(),0)}function Ko(e,t,n){const i=document.createElement("div");i.id="help-panel",i.className="hud-panel hud-help-panel",e.appendChild(i);const a=document.createElement("div");a.className="hud-panel-title",a.textContent="Orders",i.appendChild(a);for(const l of wo){const d=document.createElement("div");if(d.className="hud-help-section",d.textContent=l.title,i.appendChild(d),l.note!==void 0){const h=document.createElement("div");h.className="hud-help-note",h.textContent=l.note,i.appendChild(h)}for(const h of l.examples){const u=document.createElement("div");u.className="hud-help-entry",u.title=h.explain;const p=document.createElement("div");p.className="hud-help-row";const m=document.createElement("span");m.className="hud-help-say",m.textContent=h.say;const f=document.createElement("span");if(f.className="hud-help-does",f.textContent=h.does,p.appendChild(m),p.appendChild(f),u.appendChild(p),h.also!==void 0&&h.also.length>0){const x=document.createElement("div");x.className="hud-help-also",x.textContent=h.also.join("   "),u.appendChild(x)}i.appendChild(u)}}const s=document.createElement("div");s.className="hud-help-section",s.textContent="Worth knowing",i.appendChild(s);for(const l of vo){const d=document.createElement("div");d.className="hud-help-note",d.textContent=l,i.appendChild(d)}let o=!1;function r(l){o=l,i.classList.toggle("open",o),t.classList.toggle("active",o),o||n()}t.addEventListener("click",()=>r(!o)),document.addEventListener("mousedown",l=>{if(!o)return;const d=l.target;i.contains(d)||t.contains(d)||r(!1)}),document.addEventListener("keydown",l=>{l.key==="Escape"&&o&&r(!1)})}function $o(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles";const t=Tt("chevron-right","#7fa8c9"),n=Tt("chevron-down","#7fa8c9"),i=Tt("chevron-down","#d7ecfa"),a=Tt("chevron-up","#d7ecfa"),s=Tt("alert-triangle","#ffffff");e.textContent=`
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
/* The running spend. Quiet by default — it is a fact about the session, not a warning. */
.hud-cost-tally {
  flex: 0 0 auto;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: #9ec8a8;
  cursor: help;
  padding: 0 2px;
}

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
/* The tool call is now first-class: same size as the captain's own words, because in the default
   view those two ARE the log. */
.hud-log-order {
  color: #ffd479;
  margin: 2px 0 2px 14px;
  font-weight: 600;
  white-space: normal;
  overflow-wrap: anywhere;
}
/* Orders view: EVERY crew line is hidden — the reply to an order, and the ship's own volunteered
   lines alike. Everything stays in the DOM (ids and textContent unchanged for both e2e suites, see
   renderLog); only the painting changes.

   PATCH (voice-boat crew-events round): the volunteered lines used to be exempt, on the reasoning
   that a hail answers to nothing so there is no order beside it to read instead. That was wrong in
   practice: "Met her, sir" now fires after every helm order, and a battle adds a hail, a closing
   report, a shot and a hit on top — so the log filled with crew chatter again and the setting
   looked broken for the fifth time. They are all spoken aloud, which was the whole argument for
   hiding the replies, and it applies to these just as well. The hull and enemy rows in the ship
   panel carry the battle state that matters. */
.hud-log-list[data-view="orders"] .hud-log-crew {
  display: none;
}
/* With its only line hidden, the entry itself would be an empty band of padding. */
.hud-log-list[data-view="orders"] .hud-log-crew-entry {
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
/* A volunteered crew line: indented slightly and without a "You:" above it, so it reads as the
   ship speaking up rather than as half of an exchange. */
.hud-log-crew-entry {
  padding: 5px 0;
}
.hud-log-crew-entry .hud-log-crew {
  color: #a6e7bd;
  font-style: italic;
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
  /* PATCH (voice-boat centre-callout round): above the centre callouts (25). A callout is an
     invitation to click something; a popover the captain has deliberately opened outranks it, and
     on a short viewport the two overlap. */
  z-index: 26;
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
/* PATCH (voice-boat live-indicator round): a ring that grows with what the mic is hearing.
   --mic-level is written per frame by render(); the ring is a pseudo-element so it can scale
   past the button's own bounds without moving anything in the rail. */
.hud-btn-ptt {
  position: relative;
  --mic-level: 0;
}
.hud-btn-ptt.listening::after,
.hud-btn-ptt.recording::after {
  content: "";
  position: absolute;
  inset: -3px;
  border-radius: 10px;
  border: 2px solid #6ee89a;
  opacity: calc(var(--mic-level) * 1.4);
  transform: scale(calc(1 + var(--mic-level) * 0.16));
  transition: opacity 60ms linear, transform 60ms linear;
  pointer-events: none;
}
/* Above the noise floor: the icon itself brightens, so a glance is enough. */
.hud-btn-ptt.hearing {
  border-color: #6ee89a;
  color: #b9f6c4;
}

/* -------------------------------------------------- centre callouts --------------------- */

/* Centred, unmissable, and on its way out it becomes a pointer to the control that produced it.
   Below the key prompt's z-index (30) — a captain with no key has a more pressing problem. */
.hud-centre-callout {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 25;
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 168px;
  height: 168px;
  margin: -84px 0 0 -84px;
  border-radius: 50%;
  font-family: inherit;
  color: #ffd0c6;
  background: rgba(120, 30, 22, 0.42);
  border: 2px solid rgba(255, 120, 100, 0.75);
  box-shadow: 0 8px 40px rgba(0, 0, 0, 0.5);
  cursor: pointer;
  animation: hud-mute-pop 220ms cubic-bezier(0.2, 0.9, 0.3, 1.2);
}
.hud-centre-callout:hover {
  background: rgba(150, 38, 28, 0.55);
  color: #fff;
}
/* The mic callout is an invitation, not a warning — the game is waiting to start, nothing is
   broken. Blue rather than the muted state's red. */
/* Paused is a neutral state, not a warning or an invitation — grey, so it reads as "the world is
   stopped" rather than "something is wrong". */
#paused-overlay {
  color: #dbe7f0;
  background: rgba(24, 34, 44, 0.62);
  border-color: rgba(219, 231, 240, 0.6);
}
#paused-overlay:hover {
  background: rgba(40, 54, 68, 0.75);
  color: #fff;
}
/* The loader icon spins by default; a paused world should not. */
#paused-overlay .hud-icon-loader {
  animation: none;
}

#mic-overlay {
  color: #cfe9ff;
  background: rgba(20, 62, 96, 0.5);
  border-color: rgba(88, 196, 255, 0.8);
}
#mic-overlay:hover {
  background: rgba(28, 86, 132, 0.65);
  color: #fff;
}
.hud-centre-callout-label {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.hud-centre-callout-icon {
  display: block;
}
@keyframes hud-mute-pop {
  from { transform: scale(0.7); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
/* The flight to the rail. transform-origin centre so the shrink tracks the translation. */
.hud-centre-callout.flying {
  animation: none;
  transition: transform 420ms cubic-bezier(0.4, 0, 0.2, 1), opacity 420ms ease-in;
  pointer-events: none;
}
@media (prefers-reduced-motion: reduce) {
  .hud-centre-callout {
    animation: none;
  }
}

/* The speaker lights while the crew is actually talking — the counterpart to the mic ring, and
   the quickest way to tell "she is not answering" from "she is answering and I cannot hear her". */
.hud-mute-toggle.sounding {
  border-color: #58c4ff;
  color: #b3e5ff;
  background: rgba(88, 196, 255, 0.22);
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

/* -------------------------------------------------- help panel -------------------------- */

.hud-help-panel {
  z-index: 26;
  top: 76px;
  right: 12px;
  width: 340px;
  max-width: calc(100vw - 24px);
  max-height: calc(100vh - 96px);
  overflow-y: auto;
  pointer-events: auto;
  font-size: 12.5px;
  display: none;
}
.hud-help-panel.open {
  display: block;
}
.hud-help-section {
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: #7fa8c9;
  margin: 12px 0 4px;
}
.hud-help-section:first-of-type {
  margin-top: 0;
}
.hud-help-note {
  color: #91aabd;
  font-size: 11px;
  line-height: 1.4;
  margin-bottom: 5px;
}
/* One hover target per order, carrying the full explanation in its title. */
.hud-help-entry {
  padding: 3px 4px;
  border-radius: 3px;
  cursor: help;
}
.hud-help-entry:hover {
  background: rgba(88, 196, 255, 0.12);
}
.hud-help-row {
  display: flex;
  gap: 10px;
  align-items: baseline;
}
.hud-help-say {
  color: #8ecbff;
  font-weight: 600;
  flex: 1 1 auto;
  min-width: 0;
}
/* nowrap is the point: a description that wraps into the narrow column is what made the first
   version hard to scan. render/help.ts caps these at 24 characters so they always fit. */
.hud-help-does {
  color: #7fa8c9;
  font-size: 11px;
  flex: 0 0 auto;
  white-space: nowrap;
}
.hud-help-also {
  color: #6f93ae;
  font-size: 10.5px;
  margin-top: 1px;
}
.hud-help-toggle.active {
  background: rgba(88, 196, 255, 0.25);
  border-color: #58c4ff;
}

.hud-settings-panel {
  /* Above the centre callouts, for the same reason as the command popover. */
  z-index: 26;
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
`,document.head.appendChild(e)}const gn=.05,Si=gn*1e3,Uo=35,Go=40,fn=50,qo=30,Yo=1.5,Jo=45,Xo=9e3,Ei=15,Qo=8;function bn(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Zo{state;behavior="APPROACH";tackSide=null;tackHoldS=0;inIrons=!1;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=Gn({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*oe,this.rudderRateRadPerS=t.rudderSlewDegPerS*oe,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=se(t*oe),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t,t===null&&(this.behavior="APPROACH")}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",se(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,a=Math.hypot(n,i),s=se(Math.atan2(n,i));a>this.engageRangeM*1.15?this.behavior="APPROACH":a<this.engageRangeM*.85&&(this.behavior="ENGAGE");let o;if(this.behavior==="APPROACH")o=s;else{const d=(a>this.engageRangeM?1:-1)*15*oe;o=se(t.headingRad+d)}const r=Oe(this.state.windFromRad-o)*ue;if(this.tackSide!==null){this.tackHoldS-=gn;const l=Math.abs(r)>=Go;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=Qo){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=Ei)}}}else if(Math.abs(r)<Uo){const l=se(this.state.windFromRad-fn*oe),d=se(this.state.windFromRad+fn*oe),h=Math.abs(Oe(l-this.state.psi)),u=Math.abs(Oe(d-this.state.psi));this.tackSide=h<=u?1:-1,this.tackHoldS=Ei}return this.tackSide!==null?se(this.state.windFromRad-this.tackSide*fn*oe):o}step(t,n){const i=this.planHeading(n),a=Oe(i-this.state.psi);this.rudderTargetRad=ze(this.headingKp*a-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:s}=Ve(this.state),o=je(Math.abs(s));this.mainTrimTarget=o,this.jibTrimTarget=o,this.state.rudder=bn(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=bn(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=bn(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),ei(this.state,t,this.phys,this.rudderMaxRad,1,this.stepIronsRecovery())}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Si;)this.step(gn,n),this.accMs-=Si}stepIronsRecovery(){const{awaDeg:t}=Ve(this.state),n=Math.abs(t),i=Math.hypot(this.state.u,this.state.v)*1.94384;if(this.inIrons?n>Jo&&(this.inIrons=!1,this.rudderTargetRad=0):n<qo&&i<Yo&&(this.inIrons=!0),!this.inIrons)return 0;this.mainTrimTarget=1,this.jibTrimTarget=1;const a=t<0?1:-1;return this.rudderTargetRad=a*this.rudderMaxRad,a*Xo}headingDeg(){return this.state.psi*ue%360}}const Mi=30;function Ti(){return{reloadRemainingS:0}}function yn(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function _i(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function Ci(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=Mi,ready:e.reloadRemainingS<=0}}function es(e,t,n,i,a,s){_i(e,t);const o=Ci(e,n,i,a);return!o.inRange||!o.inArc||!o.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=a.reloadS,{fired:!0,hit:s()<yn(n,a.cannonRangeM)})}function ts(e,t,n,i,a){const s=Ci(e,t,n,i);if(!s.ready)return{fired:!1,hit:!1,...s};e.reloadRemainingS=i.reloadS;const o=a();return{fired:!0,hit:s.inRange&&s.inArc&&o<yn(t,i.cannonRangeM),...s}}const wn=10,ns=5,is=.8,as=.5;function Ai(){return{hullHp:wn}}const Ri=30;function $t(e,t=1){e.hullHp=Math.max(0,e.hullHp-t)}function os(e){return e.hullHp<=0?as:e.hullHp<=ns?is:1}function Ni(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const ss=35,rs=4,ls=.45;function cs(e){return Math.hypot(e.state.u,e.state.v)*1.94384}function ds(e,t,n,i,a){return vn(e,t,n,i,a)!=="midships"}function vn(e,t,n,i,a){const s=se(Math.atan2(e-n,t-i)),o=Math.abs(Oe(s-a)*ue);return o<=Ri?"bow":o>=180-Ri?"stern":"midships"}class us{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;collisionCooldownS=0;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,a){this.cfg=t,this.rng=Ni(t.seed),this.playerRng=Ni(t.seed+1),this.lastPlayerPose=a;const s=ze(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*s);const o=1.2+.6*s,r=this.rng()*2*Math.PI,l=a.x+t.spawnRangeM*Math.sin(r),d=a.y+t.spawnRangeM*Math.cos(r),h=se(r+Math.PI);this.npc=new Zo({x:l,y:d,heading:h*ue,windDirection:a.windDirectionDeg,windSpeedKts:a.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||ss,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:o,phys:n}),this.damage=Ai(),this.cannon=Ti(),this.playerCannon=Ti(),this.enemyDamage=Ai()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,_i(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});let a=n.x-this.npc.x,s=n.y-this.npc.y,o=Math.hypot(a,s);this.collisionCooldownS=Math.max(0,this.collisionCooldownS-t/1e3);const r=this.cfg.minSeparationM;if(o>1e-6&&o<r){const l=r/o;this.npc.state.x=n.x-a*l,this.npc.state.y=n.y-s*l;const d=-a/o,h=-s/o,u=this.npc.state.psi,p=this.npc.state.u*Math.sin(u)+this.npc.state.v*Math.cos(u),m=this.npc.state.u*Math.cos(u)-this.npc.state.v*Math.sin(u),f=p*-d+m*-h;if(f>0){const x=f*(1+ls),D=p+d*x,N=m+h*x;this.npc.state.u=D*Math.sin(u)+N*Math.cos(u),this.npc.state.v=D*Math.cos(u)-N*Math.sin(u)}this.collisionCooldownS<=0&&!this.enemyStruck&&(this.collisionCooldownS=rs,$t(this.damage,this.cfg.collisionDamage),$t(this.enemyDamage,this.cfg.collisionDamage),i.push({key:"collision",hullHp:this.damage.hullHp,damage:this.cfg.collisionDamage}),this.enemyDamage.hullHp<=0&&(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"))),a=n.x-this.npc.state.x,s=n.y-this.npc.state.y,o=Math.hypot(a,s)}if(!this.everSpotted&&o<=this.cfg.spawnRangeM){this.everSpotted=!0;const l=se(Math.atan2(-a,-s)),h=Oe(l-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:h})}if(!this.everClosing&&o<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),this.fleeing&&!this.enemyStruck&&o>=this.cfg.rejoinRangeM&&(this.fleeing=!1,this.npc.setBehaviorOverride(null),i.push({key:"enemy_returns"})),!this.enemyStruck){const l=se(Math.atan2(a,s)),d=Oe(l-this.npc.state.psi)*ue,h=Math.min(Math.abs(d-90),Math.abs(d+90)),u=es(this.cannon,t/1e3,o,h,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);if(u.fired&&(i.push({key:"enemy_fires"}),u.hit)){const p=vn(this.npc.x,this.npc.y,n.x,n.y,n.headingRad),m=p==="midships"?1:this.cfg.rakeDamage;$t(this.damage,m),i.push({key:"hit_taken",hullHp:this.damage.hullHp,damage:m,zone:p})}}if(i.length>0){const l=i[i.length-1];l&&(this.lastEvent=l.key)}return i}fireGuns(t){const n=this.resolveFireGuns(t);return this.lastPlayerFireOutcome=n,n}resolveFireGuns(t){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const n=this.lastPlayerPose,i=n.x-this.npc.x,a=n.y-this.npc.y,s=Math.hypot(i,a),o=se(Math.atan2(-i,-a)),r=Oe(o-n.headingRad)*ue,l=t==="starboard"?Math.abs(r-90):t==="port"?Math.abs(r+90):Math.min(Math.abs(r-90),Math.abs(r+90)),d=ts(this.playerCannon,s,l,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);if(!d.fired)return{kind:"reloading"};if(!d.inRange||!d.inArc)return{kind:"wasted"};if(!d.hit)return{kind:"miss"};const h=vn(n.x,n.y,this.npc.x,this.npc.y,this.npc.state.psi),u=h==="midships"?1:this.cfg.rakeDamage;return $t(this.enemyDamage,u),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0,damage:u,zone:h}):(this.enemyDamage.hullHp<=this.cfg.fleeBelowHullHp&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1,damage:u,zone:h})}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return os(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:cs(this.npc),behavior:this.npc.behavior,mainTrim:this.npc.state.mainTrim,jibTrim:this.npc.state.jibTrim,rudderDeg:this.npc.state.rudder*ue},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck,guns:this.gunsView()}}gunsView(){const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,a=Math.hypot(n,i),s=se(Math.atan2(-n,-i)),o=Oe(s-t.headingRad)*ue,r=Math.min(Math.abs(o-90),Math.abs(o+90)),l=a<=this.cfg.cannonRangeM,d=r<=Mi,h=ds(t.x,t.y,this.npc.x,this.npc.y,this.npc.state.psi);return{readyInS:this.playerCannon.reloadRemainingS,readyPct:this.cfg.playerReloadS>0?Math.max(0,Math.min(1,1-this.playerCannon.reloadRemainingS/this.cfg.playerReloadS)):1,rangeM:a,inRange:l,inArc:d,hitChancePct:l&&d?Math.round(yn(a,this.cfg.cannonRangeM)*100):0,raking:h}}}const hs=.75,Ii=.1,ps="I do not understand that order, sir.",xn="One order at a time, sir.";function Ce(e,t){return{kind:"error",code:e,message:t}}function ms(e){return e.toLowerCase().replace(/['\u2018\u2019]/g,"").replace(/[^a-z0-9%]+/g," ").trim().replace(/\s+/g," ")}function kn(e){return Math.max(0,Math.min(1,e))}const Di={zero:0,one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19},gs={twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};function Pi(e){const t=e.match(/\b(\d{1,3})(?:st|nd|rd|th)?\b/);if(t?.[1]!==void 0)return Number(t[1]);const n=e.split(" ");for(let i=0;i<n.length;i++){const a=n[i],s=Di[a];if(s!==void 0)return s;const o=gs[a];if(o!==void 0){const r=n[i+1],l=r===void 0?void 0:Di[r];return o+(l!==void 0&&l<10?l:0)}}return null}function rt(e,t){return t.some(n=>n.test(e))}function fs(e){return rt(e,[/\bstatus(?: report)?\b/,/\breport(?: to me)?\b/,/\bhow (?:are|re) we doing\b/,/\bhow is she doing\b/,/\bwhats (?:our |the )?(?:heading|course|speed|position)\b/,/\bwhats the wind doing\b/,/\b(?:where are we|what is our position)\b/])}function bs(e){return/\bready about\b/.test(e)||/\bhelms? a[- ]?lee\b/.test(e)||/\b(?:come|bring|put) (?:her |the ship )?about\b/.test(e)||/\babout ship\b/.test(e)||/\b(?:tack|tacking)\b/.test(e)||/\bgo about\b/.test(e)?{kind:"intent",intent:{action:"tack"}}:null}function ys(e){return/\bback (?:the )?(?:jib|headsail|foresail|head sail)\b/.test(e)||/\bbox (?:the )?(?:jib|headsail)\b/.test(e)||/\b(?:jib|headsail) (?:to windward|aback)\b/.test(e)||/\bheave to\b/.test(e)?{kind:"intent",intent:{action:"back_jib"}}:null}function ws(e){if(/\b(?:hold|cease) (?:your )?fire\b/.test(e)||/\b(?:dont|do not) fire\b/.test(e)||/\bbelay\b/.test(e)&&/\bfire\b/.test(e))return{kind:"acknowledgement",message:"Holding fire, sir."};if(!(/^fire(?:\b|$)/.test(e)||/\b(?:open fire|fire away|fire as she bears|give (?:her|them) a broadside|let (?:them|em) have it)\b/.test(e)||/\b(?:port|larboard|starboard|stbd) (?:guns|battery|broadside)\b/.test(e)))return null;const i=/\b(?:port|larboard)\b/.test(e)?"port":/\b(?:starboard|stbd)\b/.test(e)?"starboard":void 0;return{kind:"intent",intent:i?{action:"fire_guns",side:i}:{action:"fire_guns"}}}function vs(e){const t=/\b(?:main|mainsail|main sheet)\b/.test(e),n=/\b(?:jib|headsail|jib sheet)\b/.test(e);return t&&n?"all":t?"main":n?"jib":/\b(?:both sheets|the sheets|sheets|all sails?|all sail|all canvas|the sails|sails|everything)\b/.test(e)?"all":null}function Oi(e,t){return e==="main"?t.mainTrim:e==="jib"?t.jibTrim:(t.mainTrim+t.jibTrim)/2}function xs(e,t){const n=vs(e);if(n===null)return null;const i=rt(e,[/\bease(?: away| off)?\b/,/\blet (?:the )?.*\bout\b/,/\blet go\b/,/\bslacken\b/,/\bspill(?: .* )?wind\b/,/\bstart (?:the )?(?:sheet|sheets|main|jib)\b/]),a=rt(e,[/\bhaul(?: in)?\b/,/\bharden(?: up)?\b/,/\btighten(?: up)?\b/,/\bsheet(?:s)? (?:home|in)\b/,/\btrim (?:the )?.*\b(?:in|home)\b/,/\bpull (?:the )?.*\bin\b/,/\bbring (?:the )?.*\bin\b/,/\bmore on\b/,/\btake a pull\b/]),s=/\b(?:trim|set) (?:the )?(?:sails?|canvas|main|mainsail|jib|headsail)\b/.test(e);if(i&&a)return Ce("ambiguous",xn);if(!i&&!a&&!s)return null;const o=e.match(/\b(\d{1,3})\s*(?:percent|%)\b/),r=/\bpercent\b/.test(e)?Pi(e):null,l=o?.[1]===void 0?r:Number(o[1]);if(l!==null&&l>100)return Ce("out_of_range","Sail trim must be between zero and one hundred percent, sir.");let d;if(l!==null&&/\b(?:to|at|set)\b/.test(e))d=l/100;else if(/\b(?:all the way|right|hard) in\b/.test(e))d=1;else if(/\b(?:all the way out|let go)\b/.test(e))d=0;else if(!i&&!a)d=je(Math.abs(t.apparentWindAngle));else if(l!==null)d=kn(Oi(n,t)+(a?l/100:-l/100));else{const u=Oi(n,t),p=je(Math.abs(t.apparentWindAngle)),m=a?p>u:p<u;d=kn(m?u+(p-u)*hs:u+(a?Ii:-Ii))}return{kind:"intent",intent:{action:"trim_sail",sail:n,trim:d}}}function Li(e,t){const n=Pi(e);return n!==null?n>35?Ce("out_of_range","She will not take more than thirty-five degrees of helm, sir."):n:/\b(?:hard(?: over)?|full)\b/.test(e)?35:/\b(?:little|small|bit|touch|point|easy)\b/.test(e)?t.speedKts>=7?5:10:20}function ks(e){const t="(?:turn|go|come|steer|point(?: us)?|bring (?:us|her)|give me(?: a)?(?: small)? turn|helm|rudder|hard)",n=/\bdegrees?\b/.test(e),i=n&&/\b(?:left|port|larboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:left|port|larboard)\\b|^(?:left|port|larboard)\\b|\\b(?:helm|hard) a port\\b)`).test(e),a=n&&/\b(?:right|starboard)\b/.test(e)||new RegExp(`(?:\\b${t}\\b[^.]*\\b(?:right|starboard)\\b|^(?:right|starboard)\\b|\\b(?:helm|hard) a starboard\\b)`).test(e);return i&&a?"conflict":i?-1:a?1:null}function Ss(e,t){if(rt(e,[/\b(?:centre|center) (?:the )?(?:rudder|helm|home|hem|whole|hull|it)\b/,/\bstraighten(?: up| (?:the )?(?:rudder|helm|home|hem|whole|hull|ship))?\b/,/^(?:steady|midships|amidships)\b/,/\b(?:rudder|helm) amidships\b/,/\bmeet her\b/,/\bease her back to (?:centre|center)\b/]))return{kind:"intent",intent:{action:"helm",degrees:0}};if(rt(e,[/^(?:okay )+(?:enough|stop)\b/,/^whoa(?: whoa)+$/,/^too much$/,/^(?:no )+stop$/,/^(?:thats )?enough$/,/^easy(?: easy)+$/])&&Math.abs(t.rudderAngle)>2)return{kind:"intent",intent:{action:"helm",degrees:0}};if(/\b(?:other|wrong) way\b/.test(e))return Math.abs(t.rudderAngle)<=2?Ce("ambiguous","The helm is already amidships, sir."):{kind:"intent",intent:{action:"helm",degrees:-Math.sign(t.rudderAngle)*Math.min(20,Math.abs(t.rudderAngle))}};const a=rt(e,[/\bluff(?: her)?(?: up)?\b/,/\bbring her up\b/,/\bcome up\b/,/\bpoint higher\b/,/\bharden up (?:the )?(?:helm|rudder)\b/]),s=rt(e,[/\bbear away\b/,/\bbear off\b/,/\bfall (?:off|away)\b/,/\brun off\b/,/\bbear up to leeward\b/]);if(a&&s)return Ce("ambiguous",xn);if(a||s){if(Math.abs(t.apparentWindAngle)<1)return Ce("ambiguous","The wind is dead ahead; name a side, sir.");const l=Li(e,t);if(typeof l!="number")return l;const d=Math.sign(t.apparentWindAngle);return{kind:"intent",intent:{action:"helm",degrees:(a?d:-d)*l}}}const o=ks(e);if(o==="conflict")return Ce("ambiguous","Port or starboard, sir, not both.");if(o!==null){const l=Li(e,t);return typeof l!="number"?l:{kind:"intent",intent:{action:"helm",degrees:o*l}}}return/\b(?:steer|set|make) (?:a )?(?:course|heading)\b/.test(e)||/\b(?:course|heading) \d{2,3}\b/.test(e)||/^steer \d{2,3}\b/.test(e)||/^steer (?:zero|one|two|three|four|five|six|seven|eight|nine|north|south|east|west)\b/.test(e)?Ce("unsupported","Course-keeping is not fitted; order port, starboard, or amidships, sir."):null}function Es(e,t){const n=ms(e);if(n.length===0)return Ce("empty","No order received, sir.");if(/\b(?:dont|do not|belay|cancel)\b/.test(n))return{kind:"acknowledgement",message:"Belay that, sir."};const i=[bs(n),ys(n),ws(n),xs(n,t),Ss(n,t),fs(n)?{kind:"intent",intent:{action:"report_status"}}:null].filter(a=>a!==null);return i.length===0?Ce("unknown",ps):i.length>1?Ce("ambiguous",xn):i[0]}function Hi(e){return{...e,optimalTrimNow:Number(je(Math.abs(e.apparentWindAngle)).toFixed(2))}}const zi=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. The state gives you optimalTrimNow, the correct trim for the current wind angle. For a relative order ('ease' = let out, 'sheet in/harden' = haul in), move MOST OF THE WAY from the sail's current value to optimalTrimNow in that direction, rather than nudging by a fixed step. Only use a small step when the captain asks for one ('a touch', 'a little').",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"tack",description:"Come about: tack the ship through the wind onto the opposite board. Use for 'ready about', 'come about', 'put her about', 'tack'. The crew runs the whole manoeuvre; do not also send helm orders for it.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears. Pass side only when the captain names one ('fire the port guns') — that battery alone fires, wasted if she doesn't bear on it.",parameters:{type:"object",properties:{side:{type:"string",enum:["port","starboard"],description:"Which battery to fire, only when the captain names a side."}}}}},{type:"function",function:{name:"back_jib",description:"Back the headsail: sheet the jib to windward so it pushes the bow off the wind. Use for 'back the jib', 'back the headsail', 'box the jib'. The way out of irons, and the way to force the bow round when the rudder has nothing to bite on. Pointless once she is sailing free.",parameters:{type:"object",properties:{}}}}],ji=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

BACKING THE HEADSAIL — the back_jib tool. "Back the jib / back the headsail / box the jib / jib to windward / heave to" sheet the headsail to windward so it pushes the bow off the wind. This is the way out of irons and the way to force her round when she has no way on for the rudder to bite. It is NOT a trim order: never answer it with trim_sail.

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`,Ms=`LANGUAGE — ABSOLUTE:
- The captain speaks English and only English. You speak English and only English. This never changes for any reason, in any turn of the conversation.
- Use British English spelling and idiom, and period Royal Navy vocabulary, throughout.
- If a transcript arrives in another language, that is a MISHEARING of an English order, not a change of language. Read it back as the nearest English nautical order it could have been and act on that; if nothing fits, ask for the order again — in English.
- Never translate, never mirror another language, never apologise in another language, and never remark on the language itself.
`,Ts=`BREVITY — HARD LIMIT:
- A reply is ONE short sentence. Never two. Never a sentence plus a follow-up.
- When a tool result gives you a line, SPEAK THAT LINE AND STOP. Not one word more. Do not restate it, expand it, explain it, or add what happens next.
- Never offer help, never ask what the captain wants next, never suggest an option, never narrate what you are about to do, never comment on the situation unless asked.
- Forbidden openers and fillers: "That's the first step", "Just let me know", "We should", "I'll go ahead and", "Would you like", "in a moment", "before we continue".
- A bare acknowledgement is the ideal reply. "Aye sir." is a complete and correct answer.
- The one exception is report_status, whose tool line carries the numbers: speak it verbatim, then stop.
`,_s=`ONE ORDER AT A TIME:
- Act only on the captain's most recent utterance. Earlier orders are already carried out; never revisit or re-execute them, and never treat your own reply as an order.
- If it is not an order and not a question about the ship, say nothing and call no tool.
- TWO ORDERS IN ONE BREATH: carry out the LAST one and say nothing about the other. Never refuse a compound order, never ask which one was meant, never explain that you can only do one. "Hard in on all the sails, and fire" is fire_guns. Doing one of two is always right; doing neither is always wrong.
- EVERY tool call must carry \`heard\`: the captain's order in his own words, as you heard it, verbatim and short. This is what is written in the ship's log as his order, so quote him, do not summarise him and do not tidy him up. If you are unsure of a word, write what it sounded like.
- NEVER ask which battery to fire. fire_guns takes a side only if the captain named one, and the gun captain judges whether she bears. A bare "fire" is a complete order.
- You are a naval officer, NEVER an assistant. These exact phrasings are forbidden: "I'm here to help", "could you clarify", "let's proceed", "that way we can", "I can only", anything containing "task" or "request". You do not offer help, seek confirmation, or explain your limits. If an order is genuinely unintelligible the entire reply is "Say again, sir?"
`,Cs=`EXAMPLES — the kind of thing this captain says, and what you do:
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
- "back the jib" / "heave to" -> back_jib
- "lovely morning, isn't it" -> no tool call; one short period reply
`;function Vi(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,a=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof a!="number"||!Number.isFinite(a)||a<0||a>1?null:{action:"trim_sail",sail:i,trim:a}}case"report_status":return{action:"report_status"};case"tack":return{action:"tack"};case"back_jib":return{action:"back_jib"};case"fire_guns":{const a=(t??{}).side;return a==="port"||a==="starboard"?{action:"fire_guns",side:a}:{action:"fire_guns"}}default:return null}}const lt={network:"OpenAI seems unreachable (their status page may say why); your order was kept, try again shortly.",unauthorized:"key rejected",rateLimited:"rate limited, a moment sir",serverError:"OpenAI is having trouble",autoplayBlocked:"your browser blocked audio until you click the page",audioStalled:"this browser would not play the audio"};function As(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function Sn(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Rs=1500;async function Wi(e){try{return await e()}catch(t){if(!Sn(t))throw t;return await new Promise(n=>setTimeout(n,Rs)),e()}}function Bi(e,t,n){const i=As(t);if(i)return lt[i];const a=n.trim(),o=a.startsWith("<")||/<\/?[a-z][\s\S]*>/i.test(a.slice(0,200))?"":a.slice(0,140);return o.length>0?`${e} (${t}): ${o}`:`${e} (${t})`}const Ns="https://api.openai.com/v1/chat/completions";function Is(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const a=i,s=typeof a.content=="string"?a.content:null,o=[],r=a.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const d=l.function;if(typeof d!="object"||d===null)continue;const h=d,u=h.name,p=h.arguments;typeof u!="string"||typeof p!="string"||o.push({name:u,argumentsJson:p})}return{content:s,toolCalls:o}}function Ds(e){try{return JSON.parse(e)}catch{return null}}async function Ps(e,t,n,i=Le.voice.intentModel,a=Ns,s){const o=`${ji}

Current ship state:
${JSON.stringify(Hi(t))}`,r={"Content-Type":"application/json"};n.length>0&&(r.Authorization=`Bearer ${n}`);let l;try{l=await Wi(()=>fetch(a,{method:"POST",headers:r,body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:zi,messages:[{role:"system",content:o},{role:"user",content:e}]})}))}catch(x){throw Sn(x)?new Error(lt.network):x}if(!l.ok){const x=await l.text();throw new Error(Bi("intent request failed",l.status,x))}const d=await l.json(),h=d?.usage;h&&s&&s(So(h));const u=Is(d);if(u===null)throw new Error("intent request returned an unrecognizable response body");const p=u.toolCalls[0];if(p===void 0)return{crewLine:u.content??"",intent:null};const m=Ds(p.argumentsJson),f=Vi(p.name,m);return f===null?{crewLine:G("unknown_order",t),intent:null}:{crewLine:"",intent:f}}const Os=["a-port","a-starboard","a-lee","helm's a-lee","hard a-port","hard a-starboard","larboard","starboard","amidships","abeam","broadside","bear away","ready about","close-hauled","mainsail","jib","sheet in","ease the main","aye sir"],Ls="gpt-live-transcribe";function Hs(){return{model:Ls,languages:["en"],prompt:"Spoken orders on the quarterdeck of a Royal Navy sailing ship, circa 1805, over wind and sea noise. Expect short commands and numbers of degrees. Vocabulary includes: "+Os.join(", ")+"."}}function Fi(e){const t=e.trim();if(t.length===0)return!0;const n=t.replace(/[^\p{L}]/gu,"");return n.length===0||n.replace(/[a-zA-Z]/g,"").length>0?!0:!/[a-zA-Z]{2,}/.test(t)}const zs=new Set(["alloy","ash","ballad","coral","echo","sage","shimmer","verse","marin","cedar"]);function Ki(e){return((e+180)%360+360)%360-180}function En(e){return zs.has(e)?e:"marin"}function js(){return zi.map(({function:e})=>({type:"function",name:e.name,description:e.description,parameters:{...e.parameters,properties:{...e.parameters.properties,heard:{type:"string",description:"The captain's order in his own words, as you heard it. A short verbatim quote, not a paraphrase and not a description. Always include this."}}}}))}function Vs(e){try{const t=JSON.parse(e);if(typeof t!="object"||t===null)return null;const n=t.heard;if(typeof n!="string")return null;const i=n.trim();return i.length>0&&!Fi(i)?i:null}catch{return null}}function Ws(e){if(typeof e!="object"||e===null)return[];const t=e.output;if(!Array.isArray(t))return[];const n=[];for(const i of t){if(typeof i!="object"||i===null)continue;const a=i;a.type==="function_call"&&(typeof a.name!="string"||typeof a.call_id!="string"||typeof a.arguments!="string"||n.push({name:a.name,callId:a.call_id,argumentsJson:a.arguments}))}return n}function Bs(e){if(typeof e!="object"||e===null)return null;const t=e.output;if(!Array.isArray(t))return null;for(const n of t){if(typeof n!="object"||n===null)continue;const i=n.content;if(Array.isArray(i))for(const a of i){if(typeof a!="object"||a===null)continue;const s=a,o=typeof s.transcript=="string"?s.transcript.trim():"";if(o)return o;const r=typeof s.text=="string"?s.text.trim():"";if(r)return r}}return null}function Mn(e,t){return ji+`

`+Ms+`
`+Ts+`
`+_s+`
`+Cs+`
REALTIME RULES:
- Wait for a tool result before acknowledging an order.
- When a tool result arrives, speak its message and then STOP — see the brevity rules above.
- Never claim the ship changed unless the tool result says the order was accepted.
- If speech is unclear or contains conflicting orders, ask once for the order again, in five words or fewer, and call no tool.

VOICE & DELIVERY:
`+at(t).delivery+`

Current ship state:
`+JSON.stringify(Hi(e))}function Fs(e,t,n,i){return{type:"session.update",session:{type:"realtime",output_modalities:["audio"],instructions:Mn(e,n),audio:{input:{transcription:Hs(),noise_reduction:{type:"near_field"},turn_detection:{type:"semantic_vad",eagerness:i,create_response:!0,interrupt_response:!0}},output:{voice:En(t)}},tools:js(),tool_choice:"auto"}}}function Ks(e){return e===void 0?!1:e==="session_expired"||e==="invalid_api_key"}function $s(e){try{return Vi(e.name,JSON.parse(e.argumentsJson))}catch{return null}}function Us(e){let t=null,n=null,i=null,a=null,s=null,o=null,r=null,l=!1,d=!1,h=!1,u=En(e.voice??"marin"),p=at(e.accentId??"").id;const m=e.eagerness??"high";let f=Math.max(0,Math.min(1,e.volume??.55)),x=!0,D=!1,N=!1,T=!1,j=null,k=null;const I=new Set,K=new Set;let L=Promise.resolve();function z(w){n?.readyState==="open"&&n.send(JSON.stringify(w))}function ce(w){z({type:"session.update",session:{type:"realtime",...w}})}function b(){const w=e.getState(),v=k;(v===null||Math.abs(Ki(w.heading-v.heading))>15||Math.abs(Ki(w.apparentWindAngle-v.apparentWindAngle))>15||Math.abs(w.mainTrim-v.mainTrim)>.1||Math.abs(w.jibTrim-v.jibTrim)>.1||w.inIrons!==v.inIrons)&&(k=w,ce({instructions:Mn(w,p)}))}function H(){a!==null&&(a.volume=f,a.muted=!x)}function y(w,v){z({type:"conversation.item.create",item:{type:"function_call_output",call_id:w,output:JSON.stringify(v)}})}async function _(w){if(w.length===0)return;const v=w.map(B=>Vs(B.argumentsJson)).find(B=>B!==null);if(N?v&&e.onTranscriptCorrection?.(v):(e.onTranscript(v??"Voice order"),N=!0),w.length>1){const B="One order at a time, sir.";for(const Se of w)y(Se.callId,{ok:!1,message:B});e.onResponseLine(B),e.onSystemNote(B),T=!0,z({type:"response.create"});return}const R=w[0],S=$s(R);if(S===null){const B="I do not understand that order, sir.";y(R.callId,{ok:!1,message:B}),e.onResponseLine(B),e.onSystemNote(`Realtime returned an invalid ${R.name} call.`),T=!0,z({type:"response.create"});return}const te=await e.submitIntent(S);y(R.callId,{ok:te.ok,message:te.message,state:te.state}),T=!0,j=te.message,z({type:"response.create",response:{instructions:`Say exactly this and nothing else, then stop: ${JSON.stringify(te.message)}. Add no other words. No preamble, no explanation, no offer of help, no follow-up question.`}})}async function P(w){let v;try{v=JSON.parse(w)}catch{return}switch(v.type){case"input_audio_buffer.speech_started":N=!1,T=!1,e.onStatus("listening","Hearing order");break;case"conversation.item.input_audio_transcription.completed":{typeof v.usage?.seconds=="number"&&e.onCost?.(Eo(v.usage.seconds),"transcribe");const R=v.transcript?.trim(),S=v.item_id??R;if(R&&S&&!I.has(S)){if(I.add(S),Fi(R)){N=!0;break}N=!0,e.onTranscript(R)}break}case"response.created":D=!0;break;case"response.output_audio.delta":case"response.audio.delta":case"output_audio_buffer.started":D=!0,l=!0,e.onStatus("speaking","Crew speaking");break;case"output_audio_buffer.stopped":l=!1,e.onStatus("listening","Listening");break;case"response.done":{v.response?.usage&&e.onCost?.(ko(v.response.usage,e.model??"gpt-realtime-2.1"),"realtime");const R=Ws(v.response);if(await _(R),R.length===0){const S=Bs(v.response);T?(T=!1,S&&S!==j&&e.onResponseLine(S)):S&&e.onResponseLine(S),e.onStatus("listening","Listening")}b();break}case"error":{const R=v.error,S=R?.message??"Realtime session error";if(Ks(R?.code)){e.onStatus("error",S);break}if(/voice if assistant audio is present/i.test(S)){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");break}(R?.code===void 0||!K.has(R.code))&&(R?.code!==void 0&&K.add(R.code),e.onSystemNote(`Realtime: ${S}`));break}}}function X(w){return w.readyState==="open"?Promise.resolve():new Promise((v,R)=>{const S=window.setTimeout(()=>R(new Error("Realtime data channel timed out.")),1e4);w.addEventListener("open",()=>{window.clearTimeout(S),v()},{once:!0}),w.addEventListener("error",()=>{window.clearTimeout(S),R(new Error("Realtime data channel failed."))},{once:!0})})}function W(){n?.close(),t?.close();for(const w of i?.getTracks()??[])w.stop();a?.remove(),s?.close().catch(()=>{}),s=null,o=null,r=null,l=!1,t=null,n=null,i=null,a=null,d=!1,h=!1,D=!1,N=!1,T=!1,I.clear(),K.clear(),k=null,e.onStatus("disconnected","Mic disconnected")}async function J(){if(!(d||h)){d=!0,e.onStatus("connecting","Requesting microphone");try{i=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0,autoGainControl:!0}}),t=new RTCPeerConnection,a=document.createElement("audio"),a.autoplay=!0,a.hidden=!0,H(),document.body.appendChild(a),t.addEventListener("track",B=>{a&&(a.srcObject=B.streams[0]??new MediaStream([B.track]))}),t.addEventListener("connectionstatechange",()=>{(t?.connectionState==="failed"||t?.connectionState==="disconnected")&&e.onStatus("error","Realtime connection lost")});for(const B of i.getTracks())t.addTrack(B,i);try{const B=window.AudioContext??window.webkitAudioContext;s=new B,o=s.createAnalyser(),o.fftSize=512,o.smoothingTimeConstant=.6,r=new Uint8Array(o.frequencyBinCount),s.createMediaStreamSource(i).connect(o)}catch{s=null,o=null,r=null}n=t.createDataChannel("oai-events"),n.addEventListener("message",B=>{L=L.then(()=>P(B.data)).catch(Se=>{const We=Se instanceof Error?Se.message:String(Se);e.onSystemNote(We)})});const w=await t.createOffer();if(await t.setLocalDescription(w),!w.sdp)throw new Error("Browser did not create a Realtime offer.");const v=e.getTransport?.()??{apiKey:"",endpoint:"/api/realtime/session",direct:!1},R=e.model??"gpt-realtime-2.1";let S;if(v.direct){const B=await e.mintClientSecret?.(R);if(!B)throw new Error("No OpenAI key stored — add one under the settings cog.");const Se=new FormData;Se.set("sdp",w.sdp),Se.set("session",JSON.stringify({type:"realtime",model:R})),S=await fetch(v.endpoint,{method:"POST",headers:{Authorization:`Bearer ${B}`},body:Se})}else S=await fetch(v.endpoint,{method:"POST",headers:{"Content-Type":"application/sdp"},body:w.sdp});if(!S.ok){const B=(await S.text()).trim();throw new Error(B||`Realtime session failed (${S.status}).`)}const te=await S.text();await t.setRemoteDescription({type:"answer",sdp:te}),await X(n),k=e.getState(),z(Fs(k,u,p,m)),d=!1,h=!0,e.onStatus("listening","Listening")}catch(w){const v=w instanceof Error?w.message:String(w);throw W(),e.onStatus("error",v),w}}}return{connect:J,disconnect:W,toggle:async()=>{h||d?W():await J()},isConnected:()=>h,getInputLevel:()=>{if(o===null||r===null)return 0;o.getByteTimeDomainData(r);let w=0;for(const R of r){const S=(R-128)/128;w+=S*S}const v=Math.sqrt(w/r.length);return Math.max(0,Math.min(1,v*4))},isCrewAudible:()=>l,setVoice:w=>{const v=En(w);if(v!==u&&(u=v,!!h)){if(D){e.onSystemNote("Realtime voice saved. Reconnect the mic to apply it.");return}ce({audio:{output:{voice:u}}})}},setAccent:w=>{const v=at(w).id;v!==p&&(p=v,h&&ce({instructions:Mn(e.getState(),p)}))},setVolume:w=>{f=Math.max(0,Math.min(1,w)),H()},setAudioEnabled:w=>{x=w,H()}}}const Gs="https://api.openai.com/v1/audio/speech",qs=2e4,Ys=4e3,Js=2;let Ge=null;function Xs(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function Qs(){return Ge!==null}function $i(){Ge!==null&&(Ge.pause(),Ge.src="",Ge=null,performance.now())}async function Zs(e,t={}){const{apiKey:n="",endpoint:i=Gs,model:a=Le.voice.ttsModel,voice:s=Le.voice.ttsVoice,volume:o=Le.voice.ttsVolume,accentId:r=Le.voice.crewAccent,onCostEstimate:l}=t;if(e.trim().length===0||!Xs())return;$i();let d;try{d=await Wi(()=>fetch(i,{method:"POST",headers:{"Content-Type":"application/json",...n.length>0?{Authorization:`Bearer ${n}`}:{}},body:JSON.stringify({model:a,voice:s,input:e,response_format:"mp3",instructions:at(r).delivery})}))}catch(k){throw Sn(k)?new Error(lt.network):k}if(!d.ok){const k=await d.text();throw new Error(Bi("tts request failed",d.status,k))}const h=await d.arrayBuffer(),u=new Blob([h],{type:"audio/mpeg"}),p=URL.createObjectURL(u),m=new Audio(p);m.volume=Math.max(0,Math.min(1,o)),Ge=m;const f=()=>{URL.revokeObjectURL(p),Ge===m&&(Ge=null,performance.now())};m.addEventListener("ended",f,{once:!0}),m.addEventListener("error",f,{once:!0}),l&&m.addEventListener("loadedmetadata",()=>{const k=Number.isFinite(m.duration)?m.duration:0;l(_o(e,k,a))},{once:!0});const x=new Promise(k=>{m.addEventListener("ended",()=>k(),{once:!0}),m.addEventListener("error",()=>k(),{once:!0})}),D=new Promise((k,I)=>{m.play().catch(K=>{f(),I(K instanceof DOMException&&K.name==="NotAllowedError"?new Error(lt.autoplayBlocked):K)})}),N=[],T=new Promise((k,I)=>{N.push(setTimeout(()=>{m.readyState>=Js||(f(),I(new Error(lt.audioStalled)))},Ys))}),j=new Promise(k=>{N.push(setTimeout(k,qs))});try{await Promise.race([x,D,T,j])}finally{for(const k of N)clearTimeout(k)}}const er=2;function tr(e){const t=[];let n=!1,i=!1,a=!1,s=!1,o=!1;async function r(){if(!n){n=!0;try{for(;t.length>0;){const l=t.shift();if(e.isRealtimeMode()||e.isMuted())continue;const d=e.getConfig(),h=ri();try{await Zs(l,{apiKey:h.apiKey,endpoint:h.endpoint,model:d.voice.ttsModel,voice:d.voice.ttsVoice,volume:d.voice.ttsVolume,accentId:d.voice.crewAccent,onCostEstimate:e.onCostEstimate})}catch(u){const p=u instanceof Error?u.message:String(u);p===lt.autoplayBlocked?s||(s=!0,e.onSystemNote("Click anywhere on the sea and the crew will speak up.")):p===lt.audioStalled?o||(o=!0,e.onSystemNote("This browser will not play the crew's audio, so they will keep quiet. Their lines are still in the log.")):a||(a=!0,e.onSystemNote(h.direct?`The crew has lost its voice (${p}). Check your OpenAI key under the cog.`:`The crew has lost its voice (${p}). This host has no speech route; add an OpenAI key under the cog.`))}}}finally{n=!1}}}return{speakCrewLine:l=>{if(l.trim().length===0||e.isRealtimeMode()||e.isMuted()||o)return;const d=ri();if(!(!d.direct&&a)){if(!d.direct&&!i&&window.location.protocol==="file:"){i=!0,e.onSystemNote("The crew has no voice on this host. Add an OpenAI key under the cog.");return}for(t.push(l);t.length>er;)t.shift();r()}},silence:()=>{t.length=0,$i()}}}const Ui=9.81,Gi=370,nr=.84,ir=10/12,Tn=12,qi=.45,ar=2.2,Yi=.6,or=50,Ji=2,sr=16,Xi=.2,rr=.9,lr=137.51,cr=251.33;function _n(e){return Math.min(1,Math.max(0,e))}function dr(e){return Math.max(e*ir,.1)}function ur(e){const t=dr(e),n=Ui*(nr/t)**2;return 2*Math.PI/n}function hr(e){const t=_n(e/40),n=Math.sqrt(t);return Xi+n*(rr-Xi)}function pr(e){const t=_n(e/40);return Ji+t*(sr-Ji)}function mr(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function gr(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=ur(n),a=pr(n),s=hr(n),o=1+_n(s)*3,r=t+180,l=[],d=[],h=[];let u=0;for(let f=0;f<Tn;f++){const x=f/(Tn-1),D=qi*(ar/qi)**x;l.push(D);const N=or*(2*x-1);d.push(N);const T=Math.log(D),j=Math.exp(-(T*T)/(2*Yi*Yi)),k=N*Math.PI/180,I=Math.max(0,Math.cos(k))**(2*o),K=j*I;h.push(K),K>u&&(u=K)}const p=[],m=u>0?u:1;for(let f=0;f<Tn;f++){const x=i*l[f],D=2*Math.PI/x,N=Math.sqrt(Ui*D*(1+D*D/(Gi*Gi))),T=mr(r+d[f]),j=a*(h[f]/m),k=f*lr,I=f*cr,K=-D*(T.x*k+T.z*I);p.push({amplitude:j,wavenumber:D,omega:N,dirX:T.x,dirZ:T.z,phase0:K})}return p}function fr(e,t,n,i){let a=0;for(const s of e){const o=s.wavenumber*(s.dirX*t+s.dirZ*n)-s.omega*i+s.phase0;a+=s.amplitude*Math.cos(o)}return a}const br=458.7,yr=170;function wr(e){return{length:br*e,beam:yr*e}}function vr(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],a=[];for(const s of i)a.push({x:-n,z:s}),a.push({x:n,z:s});return a}function xr(e,t,n){const i=Math.cos(n),a=Math.sin(n);return{x:e*i+t*a,z:-e*a+t*i}}function kr(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,a=0,s=0,o=0,r=0,l=0,d=0;const h=e.length;for(let T=0;T<h;T++){const{x:j,z:k}=e[T],I=t[T];n+=j*j,i+=j*k,a+=j,s+=k*k,o+=k,r+=j*I,l+=k*I,d+=I}const u=n*(s*h-o*o)-i*(i*h-o*a)+a*(i*o-s*a);if(Math.abs(u)<1e-9)return{heave:d/h,pitchRad:0,rollRad:0};const p=r*(s*h-o*o)-i*(l*h-o*d)+a*(l*o-s*d),m=n*(l*h-d*o)-r*(i*h-o*a)+a*(i*d-l*a),f=n*(s*d-o*l)-i*(i*d-o*r)+r*(i*o-s*a),x=p/u,D=m/u;return{heave:f/u,pitchRad:Math.atan(-D),rollRad:Math.atan(x)}}function Sr(e,t,n,i,a,s){const o=-i*(Math.PI/180),r=wr(a),l=vr(r),d=l.map(h=>{const u=xr(h.x,h.z,o);return fr(e,t+u.x,n+u.z,s)});return kr(l,d)}function Cn(e,t,n,i,a){if(a<=0||n<=0)return e;const s=e.position-t,o=e.velocity,r=1e-4;let l,d;if(Math.abs(i-1)<r){const h=Math.exp(-n*a),u=o+n*s;l=(s+u*a)*h,d=h*(o-n*a*u)}else if(i>1){const h=n*Math.sqrt(i*i-1),u=-n*i+h,p=-n*i-h,m=(o-p*s)/(u-p),f=s-m,x=Math.exp(u*a),D=Math.exp(p*a);l=m*x+f*D,d=m*u*x+f*p*D}else{const h=-n*i,u=n*Math.sqrt(1-i*i),p=Math.exp(h*a),m=Math.cos(u*a),f=Math.sin(u*a),x=(o-h*s)/u;l=p*(s*m+x*f),d=h*l+p*u*(-s*f+x*m)}return{position:t+l,velocity:d}}function Qi(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(a,s,o,r,l,d,h,u){const p=Sr(h,o,r,l,d,s),m=p.heave*u.heaveScale,f=p.pitchRad*u.pitchScale,x=p.rollRad*u.rollScale;return a>0?(e=Cn(e,m,u.stiffness,u.damping,a),t=Cn(t,f,u.stiffness,u.damping,a),n=Cn(n,x,u.stiffness,u.damping,a)):(e={position:m,velocity:0},t={position:f,velocity:0},n={position:x,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const Er=.514444,qe=Math.PI/180,Mr=1,Tr=512,_r=4;function Ut(e){return-e*qe}function Cr(e){const t=e*qe;return{x:Math.sin(t),z:-Math.cos(t)}}function Ye(e,t){return{x:e.x*t,z:-e.y*t}}const Zi=18,Ar=95,Rr=260;function Nr(e,t,n,i,a,s){const o=s*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Rr;e.position.x=t+i.x*o+a.x*r,e.position.z=n+i.z*o+a.z*r,e.position.y=Zi+Math.random()*(Ar-Zi)}function Ir(e,t,n,i,a,s,o,r){if(e.length===0)return;const l=i+180,d=Cr(l),h={x:-d.x,z:-d.z},u={x:-d.z,z:d.x},p=a*Er*s,m=Ut(l),f=o*o;for(const x of e){x.position.x+=d.x*p*r,x.position.z+=d.z*p*r,x.rotation.y=m;const D=x.position.x-t,N=x.position.z-n;D*D+N*N>f&&Nr(x,t,n,h,u,o)}}const Dr=1.4,Pr=6,Or=2;function Lr(e,t,n,i,a=Le.visuals,s={}){const{camera:o=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:d,muzzleFlash:h=null,splash:u=null,hitFlash:p=null,hitSmoke:m=null,rangeRing:f=null,cannonRangeM:x=0,getEnemyTiltNode:D}=s;let N=null,T=0,j=0,k=0;const I=Qi(),K=Qi();let L=null,z=[];function ce(V,ne){const q=`${V}:${ne}`;return q!==L&&(z=gr({windDirectionDeg:V,windSpeedKts:ne}),L=q),z}const b=480,H=900,y=2600,_=1400,P=130,X=260,W=150,J=70;let w=null,v=null,R=null,S=null,te="follow";const B=o!==null?o.fov:null;function Se(V){te=V,typeof window<"u"&&(window.__captainViewMode=V),o!==null&&V==="follow"&&B!==null&&(o.fov=B,o.updateProjectionMatrix())}function We(V,ne,q){const{worldUnitsPerMetre:ie,maxHeelDeg:He,maxBraceDeg:Be,heelSmoothingHz:Je,boatScale:me,streakFieldRadius:Fe}=a,re=N===null?0:Math.min((V-N)/1e3,.5);N=V;const ge=e.getState(),On=Ut(ne.headingDeg);t.rotation.y=On,t.scale.x=me,t.scale.y=me,t.scale.z=me;const{x:Me,z:Ee}=Ye(ne,ie);t.position.x=Me,t.position.z=Ee;const{buoyancy:Q}=a,xt=ce(ge.windDirection,ge.windSpeedKts),de=V/1e3,Re=I.update(re,de,Me,Ee,ne.headingDeg,me,xt,Q),pt=n();if(pt!==null){const $=He*Math.tanh(ge.apparentWindKts**2*((ge.mainTrim+ge.jibTrim)/2)*Math.abs(Math.sin(ge.apparentWindAngle*qe))/Tr),Z=Math.sign(ge.apparentWindAngle)*$*qe,he=re>0?1-Math.exp(-re*Je):0,Ie=T+(Z-T)*he,Xe=_r*qe*re,Qe=Math.max(-Xe,Math.min(Xe,Ie-T));T+=Qe;const kt=Q.enabled?Re.rollRad:0;pt.rotation.z=T+kt,pt.rotation.x=Q.enabled?Re.pitchRad:0;const Ze=Q.baseOffsetM*ie;pt.position.y=Q.enabled?Re.heave+Ze:0}const Qt=i?i():null;if(Qt!==null){const $=(ge.mainTrim+ge.jibTrim)/2,Z=Math.sign(ge.apparentWindAngle)*$*Be*qe,he=re>0?1-Math.exp(-re*Mr):0;j+=(Z-j)*he,Qt.rotation.y=j}if(f!==null){const $=a.showCannonRange&&x>0;if(f.visible=$,$){const Z=x*ie;f.position.x=Me,f.position.z=Ee,f.scale.x=Z,f.scale.y=1,f.scale.z=Z}}Ir(l,Me,Ee,ge.windDirection,ge.windSpeedKts,ie,Fe,re);const Zt=r?r():null;if(Zt!==null){const $=Ut(ge.apparentWindAngle+180),Z=re>0?1-Math.exp(-re*Or):0;let he=$-k;he=(he+Math.PI)%(2*Math.PI)-Math.PI,k+=he*Z;const Ie=Pr*qe*Math.sin(V/1e3*2*Math.PI*Dr);Zt.rotation.y=k+Ie}if(o!==null&&te==="helm"){const{helmView:$}=a;o.position.x=$.x,o.position.y=$.y,o.position.z=$.z,o.rotation.x=$.pitchDeg*qe,o.rotation.y=0,o.rotation.z=0,o.fov!==$.fov&&(o.fov=$.fov,o.updateProjectionMatrix())}const Ne=d?d():null;if(Ne!==null)if(q!==null){const $=Ye(q,ie);Ne.position.x=$.x,Ne.position.z=$.z,Ne.rotation.y=Ut(q.headingDeg),Ne.scale.x=me,Ne.scale.y=me,Ne.scale.z=me,Ne.visible=!0;const Z=D?D():null,he=K.update(re,de,$.x,$.z,q.headingDeg,me,xt,Q);if(Z!==null){const Ie=Q.baseOffsetM*ie;Z.position.y=Q.enabled?he.heave+Ie:0,Z.rotation.x=Q.enabled?he.pitchRad:0,Z.rotation.z=Q.enabled?he.rollRad:0}}else Ne.visible=!1;if(w!==null&&V>=w&&(h!==null&&(h.visible=!1),w=null),v!==null&&u!==null&&V<v){const $=1-(v-V)/_,Z=Math.min(1,$*3),he=P+(X-P)*Z,Ie=u;Ie.scale?.set(he,he,1),Ie.material&&(Ie.material.opacity=.9*(1-$*$)),u.position.y=8+46*Z}if(v!==null&&V>=v&&(u!==null&&(u.visible=!1),v=null),S!==null){if(V>=S)m!==null&&(m.visible=!1),S=null;else if(m!==null){const $=(S-V)/y,Z=m.material;Z&&(Z.opacity=.55*Math.max(0,Math.min(1,$))),m.position.y+=.35}}R!==null&&V>=R&&(p!==null&&(p.visible=!1),R=null)}function Jt(){Se(te==="follow"?"helm":"follow")}function dt(V,ne,q){h!==null&&(h.position.x=ne,h.position.y=90,h.position.z=q,h.visible=!0,w=V+b)}function ut(V,ne,q){if(u===null)return;u.position.x=ne,u.position.y=8,u.position.z=q;const ie=u;ie.scale?.set(P,P,1),ie.material&&(ie.material.opacity=.9),u.visible=!0,v=V+_}const ht=600;function Xt(V,ne,q,ie=1){if(p===null)return;if(u!==null&&v!==null){const me=u.position.x-ne,Fe=u.position.z-q;Math.hypot(me,Fe)<ht&&(u.visible=!1,v=null)}p.position.x=ne,p.position.y=55,p.position.z=q;const He=Math.max(1,ie),Be=W+J*(He-1);p.scale?.set(Be,Be,1),p.visible=!0,R=V+H*He}function Pn(V,ne,q,ie=1){if(m===null)return;const He=Math.max(1,ie);m.position.x=ne,m.position.y=60,m.position.z=q;const Be=220+90*(He-1),Je=m;Je.scale?.set(Be,Be,1),Je.material&&(Je.material.opacity=.55),m.visible=!0,S=V+y}return{update:We,toggleView:Jt,getViewMode:()=>te,triggerMuzzleFlash:dt,triggerSplash:ut,triggerHitFlash:Xt,triggerSmoke:Pn}}window.__captainDriverActive=!0;const M=bt();window.__captainAmbientRock=M.visuals.ambientRock,window.__captainReflectionInterval=M.visuals.performance.reflectionInterval;const ve=new lo({},M),ea={current:null},fe=Na(ve,()=>ea.current),be=M.battle.enabled?new us(M.battle,M.physics,M.controls,{...ve.getPose(),windDirectionDeg:fe.getState().windDirection,windSpeedKts:fe.getState().windSpeedKts}):null;ea.current=be;const An=document.createElement("div");An.id="hud-root",document.body.appendChild(An);function Rn(e){Io(e)}function _t(e){fi(e)}function Ct(e){bi(e),ct.speakCrewLine(e)}async function ta(e){if(Rn(e),wt==="ai"){const n=go();try{const i=await Ps(e,fe.getState(),n.apiKey,M.voice.intentModel,n.endpoint,a=>hn(a,"intent"));if(i.intent===null){_t(null),Ct(i.crewLine);return}await Gt(i.intent);return}catch(i){Hr(i,n.direct)}}const t=Es(e,fe.getState());if(t.kind==="error")throw _t(null),Ct(t.message),new Error(t.message);if(t.kind==="acknowledgement"){_t(null),Ct(t.message);return}await Gt(t.intent)}let wt=mi(M.input.defaultMode),xe=null,na=!1,Nn=!1;const ct=tr({getConfig:()=>M,isRealtimeMode:()=>wt==="realtime",isMuted:()=>na,onSystemNote:mn,onCostEstimate:e=>hn(e,"speech",!0)});let ia=!1;function Hr(e,t){if(ia)return;ia=!0;const n=e instanceof Error?e.message:String(e);mn(t?`AI parsing failed (${n}). Orders are being parsed locally. Check your OpenAI key under the cog; a rejected or exhausted key looks like this.`:`AI parsing unavailable (${n}). Orders are being parsed locally. Add an OpenAI key under the cog to use AI Orders.`)}const zr=No(An,fe,{injectTranscript:ta,setInputMode:e=>{wt=e,e!=="realtime"?xe?.disconnect():ct.silence()},toggleRealtime:()=>{wt==="realtime"&&xe?.toggle().catch(()=>{})},setCrewAudioEnabled:e=>{xe?.setAudioEnabled(e)},setTtsVoice:e=>{M.voice.ttsVoice=e,xe?.setVoice(e)},setTtsVolume:e=>{M.voice.ttsVolume=e,xe?.setVolume(e)},getMicLevel:()=>wt==="realtime"?xe?.getInputLevel()??0:0,isCrewAudible:()=>wt==="realtime"?xe?.isCrewAudible()??!1:Qs(),getRudderTargetDeg:()=>ve.rudderTargetDeg(),setPaused:e=>{Nn=e},setCrewAccent:e=>{M.voice.crewAccent=e,xe?.setAccent(e)},setMuted:e=>{window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=e?0:M.visuals.ambientSoundVolume),xe?.setVolume(e?0:M.voice.ttsVolume),na=e,e&&ct.silence()},getBattleStatus:()=>{if(!be)return null;const e=be.getView();return{guns:Ea(e),gunsReadyPct:e.guns.readyPct*100,hull:`${e.playerHullHp}/${wn}`,hullPct:e.playerHullHp/wn*100,enemy:Sa(e)}}});async function Gt(e){const t=await fe.submit(e);if(Po(e,t.message),ct.speakCrewLine(t.message),e.action==="fire_guns"&&be){const n=be.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),a=ve.getPose(),s=be.getView().npc,o=Ye({x:a.x,y:a.y},M.visuals.worldUnitsPerMetre);if(Ae.triggerMuzzleFlash(i,o.x,o.z),n.kind==="hit"||n.kind==="miss"){const r=Ye({x:s.x,y:s.y},M.visuals.worldUnitsPerMetre);if(n.kind==="hit")Ae.triggerHitFlash(i,r.x,r.z,n.damage),Ae.triggerSmoke(i,r.x,r.z,n.damage);else{const l=a.x-s.x,d=a.y-s.y,h=Math.hypot(l,d)||1,u=Ye({x:s.x+l/h*Yt,y:s.y+d/h*Yt},M.visuals.worldUnitsPerMetre);Ae.triggerSplash(i,u.x,u.z)}}}}return t}xe=Us({getState:()=>fe.getState(),submitIntent:Gt,onTranscript:Rn,onTranscriptCorrection:Do,onResponseLine:e=>{_t(null),Ct(e)},onSystemNote:mn,onCost:(e,t)=>hn(e,t),onStatus:Oo,voice:M.voice.ttsVoice,volume:M.voice.ttsVolume,accentId:M.voice.crewAccent,eagerness:M.voice.micEagerness,getTransport:bo,mintClientSecret:fo});const vt=document.getElementById("demo");let In=!1;function jr(e){return new Promise(t=>setTimeout(t,e))}const Vr=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function aa(){if(!In){In=!0,vt&&(vt.disabled=!0);try{for(const e of Vr){Rn(`[demo] ${e.label}`);const t=await fe.submit(e.intent);_t(e.intent),Ct(t.message),await jr(e.waitMs)}}finally{In=!1,vt&&(vt.disabled=!1)}}}vt&&vt.addEventListener("click",()=>{aa()}),Lo();const ke=window.DEMO;if(ke===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const Ae=Lr(fe,ke.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,M.visuals,{camera:ke.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:ke.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:ke.ms_MuzzleFlash,splash:ke.ms_Splash,hitFlash:ke.ms_HitFlash,hitSmoke:ke.ms_HitSmoke,rangeRing:ke.ms_RangeRing,cannonRangeM:M.battle.enabled?M.battle.cannonRangeM:0}),oa=10/12,Wr=350,Br=1400,sa=1.6,Fr=4.4,ra=.2,Kr=.9;function $r(e){const t=e*oa,n=9.81,i=.84,a=Math.max(t,.1),s=n*(i/a)**2,o=2*Math.PI/s,r=Math.min(Br,Math.max(Wr,o*2)),l=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(l),h=sa+d*(Fr-sa),u=ra+d*(Kr-ra);return{size:r,choppiness:h,directionality:u}}function la(e){return 1+Math.min(1,Math.max(0,e))*3}function Dn(e){ve.setWind(M.environment.windDirectionDeg,M.environment.windSpeedKts);const t=window.DEMO;if(t===void 0)return;const n=(M.environment.windDirectionDeg+180)*Math.PI/180,i=M.environment.windSpeedKts*oa;if(t.ms_Ocean.windX=Math.sin(n)*i,t.ms_Ocean.windY=-Math.cos(n)*i,M.visuals.seaStateFollowsWind){const a=$r(M.environment.windSpeedKts);e&&(t.ms_Ocean.size=a.size),t.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=a.choppiness,t.ms_Ocean.directionality=la(a.directionality)}else e&&(t.ms_Ocean.size=M.visuals.oceanSize);t.ms_Ocean.changed=!0}function ca(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(it(M,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),it(M,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),it(M,"visuals.lighting.sunIntensity",e.sunIntensity),it(M,"visuals.lighting.ambientIntensity",e.ambientIntensity),it(M,"visuals.lighting.exposure",e.exposure),it(M,"visuals.lighting.fogDensity",e.fogDensity))}function Ur(){window.DEMO?.SetLightingParams(M.visuals.lighting)}!(window.location.hash.length>1)&&ke.ms_Environment!==M.environment.skyPreset&&ke.UpdateEnvironment(M.environment.skyPreset),ca(),Dn(!0),ke.ms_soundWaves&&(ke.ms_soundWaves.volume=M.visuals.ambientSoundVolume);function Gr(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function qr(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Yr(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function Jr(e,t){switch(it(M,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.performance.reflectionInterval":window.__captainReflectionInterval=t;break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=la(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&Dn(!1);break;case"visuals.waterColor":{const n=Gr(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":qr(t);break;case"visuals.streakOpacity":Yr(t);break;case"voice.ttsVolume":M.voice.ttsVolume=t,xe?.setVolume(t);break;case"voice.ttsVoice":M.voice.ttsVoice=t,xe?.setVoice(t);break;case"voice.crewAccent":M.voice.crewAccent=t,xe?.setAccent(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":Dn(!1);break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),ca();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Ur();break}}Ho(Jr);const At=document.getElementById("view-toggle");function da(e){return e==="helm"?"Follow Cam":"Helm View"}function Xr(){Ae.toggleView(),At&&(At.textContent=da(Ae.getViewMode()))}At&&(At.textContent=da(Ae.getViewMode()),At.addEventListener("click",()=>{Xr()}));const Rt=document.createElement("div");Rt.id="battle-hit-flash",Rt.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(Rt);let qt=null;const Qr=180;function Zr(e=1){qt!==null&&clearTimeout(qt);const t=Math.max(1,e);Rt.style.opacity=String(Math.min(.7,.35+.15*(t-1))),qt=setTimeout(()=>{Rt.style.opacity="0",qt=null},Qr*t)}const Yt=45,el=250;let Nt=null;document.addEventListener("visibilitychange",()=>{document.hidden&&(Nt=null)});function ua(e){if(Nn&&(Nt=null),Nt!==null&&!Nn){const o=Math.min(e-Nt,el);if(ve.tick(o),be){const r=ve.getPose(),l=fe.getState(),d=be.tick(o,{...r,windDirectionDeg:l.windDirection,windSpeedKts:l.windSpeedKts});if(ve.setDriveMultiplier(be.getSpeedMultiplier()),d.some(h=>h.key==="enemy_fires")){const h=be.getView().npc,u=Ye({x:h.x,y:h.y},M.visuals.worldUnitsPerMetre);Ae.triggerMuzzleFlash(e,u.x,u.z);const p=d.find(m=>m.key==="hit_taken");if(p){Zr(p.damage??1);const m=Ye({x:r.x,y:r.y},M.visuals.worldUnitsPerMetre);Ae.triggerSmoke(e,m.x,m.z,p.damage??1)}else{const m=h.x-r.x,f=h.y-r.y,x=Math.hypot(m,f)||1,D={x:r.x+m/x*Yt,y:r.y+f/x*Yt},N=Ye(D,M.visuals.worldUnitsPerMetre);Ae.triggerSplash(e,N.x,N.z)}}for(const h of d){const u=G(h.key,l,h);pn(u),ct.speakCrewLine(u)}}}if(ve.takeMetHerEvent()){const o=G("helm_met",fe.getState());pn(o),ct.speakCrewLine(o)}const t=ve.takeTackEvent();if(t!==null){const o=G(t==="through"?"tack_through":"tack_in_irons",fe.getState());pn(o),ct.speakCrewLine(o)}Nt=e;const n=ve.getPose(),i={x:n.x,y:n.y,headingDeg:fe.getState().heading},a=be?be.getView().npc:null,s=a?{x:a.x,y:a.y,headingDeg:a.heading}:null;Ae.update(e,i,s),zr.update(),requestAnimationFrame(ua)}requestAnimationFrame(ua),window.__captain={bus:fe,submitIntent:Gt,injectTranscript:ta,setWind:(e,t)=>{ve.setWind(e,t)},demo:aa,getConfig:()=>M,copyConfig:()=>{const e=JSON.stringify(M,null,2);return console.log(e),e},setConfig:e=>{Vt(e),location.reload()},resetConfig:()=>{Qn(),location.reload()},getPlayerPose:()=>ve.getPose(),get battle(){return be?be.getView():null}}})();
