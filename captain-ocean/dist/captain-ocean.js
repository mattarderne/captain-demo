(function(){"use strict";function _t(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function Ct(e){return e.toFixed(1)}function z(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=_t(t.heading),s=Ct(t.speedKts),o=_t(t.windDirection),a=Ct(t.windSpeedKts);let r=`Steering ${i} at ${s} knots, wind ${o} at ${a}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"no_target":return"No sail in range, sir.";case"shot_wasted":return"She doesn't bear — shot's wasted, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Hn=-35,zn=35,Fn=0,Vn=1,Wn=1;function Bn(e){return e==="main"||e==="jib"||e==="all"}function ce(e,t){return{ok:!1,message:e,state:t}}function ie(e,t){return{ok:!0,message:e,state:t}}function jn(e,t){function n(s){const o=s.action;if(o==="helm"){const a=s.degrees;if(typeof a!="number"||!Number.isFinite(a)||a<Hn||a>zn)return Promise.resolve(ce(z("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:a}).accepted)return Promise.resolve(ce(z("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Wn?Promise.resolve(ie(z("no_steerage_way",l),l)):a>0?Promise.resolve(ie(z("helm_ack_starboard",l),l)):a<0?Promise.resolve(ie(z("helm_ack_port",l),l)):Promise.resolve(ie(z("helm_ack_amidships",l),l))}if(o==="trim_sail"){const a=s.sail,r=s.trim;if(!Bn(a))return Promise.resolve(ce(z("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<Fn||r>Vn)return Promise.resolve(ce(z("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:a,trim:r}).accepted)return Promise.resolve(ce(z("unknown_order",e.snapshot()),e.snapshot()));const c=e.snapshot(),u=a==="main"?"trim_ack_main":a==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(ie(z(u,c),c))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(ce(z("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(ie(z("status",r),r))}if(o==="fire_guns"){const a=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(ce(z("no_target",a),a));const l=r.fireGuns();switch(l.kind){case"no_target":return Promise.resolve(ce(z("no_target",a),a));case"wasted":return Promise.resolve(ie(z("shot_wasted",a),a));case"reloading":return Promise.resolve(ie(z("guns_reloading",a),a));case"miss":return Promise.resolve(ie(z("player_miss",a),a));case"hit":{const c=l.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(ie(z(c,a,{enemyHullHp:l.enemyHullHp}),a))}default:{const c=l;throw new Error(`unhandled fire outcome: ${String(c)}`)}}}return Promise.resolve(ce(z("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const it=1.94384,ae=180/Math.PI,W=Math.PI/180;function Rt(e){return e*it}function at(e){return e/it}function pe(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function j(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function de(e,t,n){return e<t?t:e>n?n:e}const Kn=0,$n=12;function Dt(e={}){return{x:0,y:0,psi:j((e.heading??0)*W),u:at(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*W,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:j((e.windDirection??Kn)*W),windSpeedMs:at(e.windSpeedKts??$n)}}const Fe=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Un=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Gn=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function Yn(e,t,n){return e+(t-e)*n}function At(e,t){const n=de(t,0,180);let i=0;for(;i<Fe.length-1&&Fe[i+1]<=n;)i++;const s=Math.min(i+1,Fe.length-1),o=Fe[i],a=Fe[s],r=a===o?0:(n-o)/(a-o);return Yn(e[i],e[s],r)}function qn(e){return{cl:At(Un,e),cd:At(Gn,e)}}function Xn(e){const t=de(Math.abs(e),0,180),{cl:n,cd:i}=qn(t),s=t*W,o=Math.sin(s),a=Math.cos(s),r=n*o-i*a,l=Math.abs(n*a+i*o);return{cDrive:r,cSide:l}}const Pt=.95,Jn=.2;function Nt(e){const t=de(Math.abs(e),0,180)/180;return de(Pt-(Pt-Jn)*t*t,.15,1)}const Zn=.65;function Qn(e,t){const n=(e-Nt(t))/Zn;return Math.max(0,1-n*n)}const ee={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:128,streakOpacity:.35,streakFieldRadius:3150,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1,buoyancy:{enabled:!0,heaveScale:.82,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1,baseOffsetM:.6}},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Pe="captain.config";function me(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ei(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Lt(e,t,n,i){for(const s of Object.keys(t)){const o=t[s];if(!(s in e)){i.push(`${n}${s} (unknown key)`);continue}const a=e[s];me(a)&&me(o)?Lt(a,o,`${n}${s}.`,i):me(a)||me(o)||typeof a!=typeof o?i.push(`${n}${s} (expected ${typeof a}, got ${typeof o})`):e[s]=o}}function It(e,t){const n={...e};for(const i of Object.keys(t)){const s=t[i],o=n[i];n[i]=me(o)&&me(s)?It(o,s):s}return n}function Ge(){return typeof localStorage<"u"}function ti(){if(!Ge())return{};const e=localStorage.getItem(Pe);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return me(t)?t:{}}catch{return{}}}function Ye(){const e=ei(ee);if(!Ge())return e;const t=localStorage.getItem(Pe);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Pe}"] is not valid JSON — ignoring it, using defaults.`),e}if(!me(n))return console.warn(`captain.config: stored value in localStorage["${Pe}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Lt(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Ot(e){if(!Ge())return;const t=ti(),n=It(t,e);localStorage.setItem(Pe,JSON.stringify(n))}function Ht(){Ge()&&localStorage.removeItem(Pe)}function Me(e,t,n){const i=t.split("."),s=i[i.length-1];if(s===void 0)return;let o=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0||(o=o?.[r],o==null))return}o!=null&&(o[s]=n)}const ni=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"voice.whisperMode",label:"Ship's mic (hands-free) by default",section:"Voice",type:"boolean",live:!1,note:"Live toggle lives in the ⚙ command-config popover next to the quarterdeck log; this only sets next boot's default."},{path:"voice.ttsVolume",label:"Crew voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"Applied to the crew's spoken replies. See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, the three 'manual' sliders above are overwritten from wind speed every time wind changes."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:128,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.streakFieldRadius",label:"Wind streak field radius",section:"Visuals",type:"number",min:300,max:8e3,step:50,live:!0,note:"captain-ocean only. World-unit radius the streak pool drifts/recycles within, centred on the ship."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.buoyancy.baseOffsetM",label:"Buoyancy base flotation offset (m)",section:"Visuals",type:"number",min:0,max:3,step:.1,live:!0,note:"captain-ocean only. Constant upward bias added to sampled heave while buoyancy is enabled — compensates for the CPU wave sampler not matching the rendered surface wave-for-wave, so troughs don't bury the deck."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],ii=ee.controls.rudderMaxDeg*W,ai=ee.physics;function st(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,s=e.u*n-e.v*t,o=-e.windSpeedMs*Math.sin(e.windFromRad),a=-e.windSpeedMs*Math.cos(e.windFromRad),r=o-i,l=a-s,c=Math.hypot(r,l),u=r*t+l*n,d=r*n-l*t;return{awaDeg:Math.atan2(-d,-u)*ae,awsMs:c}}function zt(e,t,n,i,s){const o=Math.abs(n),{cDrive:a,cSide:r}=Xn(o),l=Qn(t,o),c=.5*s*i*i,u=c*e*a*l,d=c*e*r*l,f=-Math.sign(n||1)*d;return{surge:u,sway:f}}function Ft(e,t,n=ai,i=ii,s=1){const{awaDeg:o,awsMs:a}=st(e),r=zt(n.areaMain,e.mainTrim,o,a,n.rhoAir),l=zt(n.areaJib,e.jibTrim,o,a,n.rhoAir),c=(r.surge+l.surge)*s,u=(r.sway+l.sway)*s,d=e.u,f=e.v,p=e.r,b=d>=0?n.kSurgeLin:n.kSurgeLinAstern,y=-n.kSurgeQuad*d*Math.abs(d)-b*d,E=-n.kSwayQuad*f*Math.abs(f)-n.kSwayLin*f,M=de(e.rudder,-i,i),w=n.cRudder*M*d*Math.abs(d),k=-(n.kYawDamp+n.kYawDampU*Math.abs(d))*p,T=n.cWeather*Math.sin(o*W)*a*Math.min(1,Math.abs(d)),C=w+k+T,P=(c+y)/n.mass+f*p,R=(u+E)/n.mass-d*p,I=C/n.izz;e.u=d+P*t,e.v=f+R*t,e.r=p+I*t;const F=Math.sin(e.psi),g=Math.cos(e.psi),_=e.u*F+e.v*g,m=e.u*g-e.v*F;e.x+=_*t,e.y+=m*t,e.psi=j(e.psi+e.r*t)}function Vt(e){return Math.hypot(e.u,e.v)*it}function si(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,s=e.u*n-e.v*t;return j(Math.atan2(i,s))}function oi(e){return Vt(e)<.2?0:pe(e.psi-si(e))*ae}const Ve=.05,Wt=Ve*1e3;function ot(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class ri{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=ee){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*W,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*W,this.state=Dt({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=de(t.degrees*W,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=de(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Wt;)this.state.rudder=ot(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*Ve),this.state.mainTrim=ot(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Ve),this.state.jibTrim=ot(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Ve),Ft(this.state,Ve,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=Wt}snapshot(){const{awaDeg:t,awsMs:n}=st(this.state),i=Vt(this.state);return{heading:this.state.psi*ae%360,speedKts:i,windDirection:this.state.windFromRad*ae%360,windSpeedKts:Rt(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Rt(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*ae,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:oi(this.state)}}setWind(t,n){this.state.windFromRad=j(t*W),this.state.windSpeedMs=at(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const rt="captain.openai_key",li="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function Ne(){return window.localStorage.getItem(rt)}function Bt(e){window.localStorage.setItem(rt,e)}function ci(){window.localStorage.removeItem(rt)}function jt(e=document.body){const t=Ne();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const s=document.createElement("div");s.style.background="#0e1f2e",s.style.color="#e8f4ff",s.style.padding="20px 24px",s.style.borderRadius="6px",s.style.maxWidth="360px",s.style.display="flex",s.style.flexDirection="column",s.style.gap="10px";const o=document.createElement("div");o.textContent="OpenAI API key",o.style.fontSize="15px",o.style.fontWeight="bold";const a=document.createElement("p");a.id="byok-copy",a.textContent=li,a.style.margin="0",a.style.fontSize="12px",a.style.opacity="0.85";const r=document.createElement("input");r.id="byok-key-input",r.type="password",r.placeholder="sk-...",r.autocomplete="off",r.style.fontFamily="inherit",r.style.fontSize="13px",r.style.padding="6px 8px";const l=document.createElement("button");l.id="byok-save",l.type="button",l.textContent="Save",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 10px",l.style.cursor="pointer";function c(){const u=r.value.trim();u.length!==0&&(Bt(u),i.remove(),n(u))}l.addEventListener("click",c),r.addEventListener("keydown",u=>{u.key==="Enter"&&c()}),s.appendChild(o),s.appendChild(a),s.appendChild(r),s.appendChild(l),i.appendChild(s),e.appendChild(i),r.focus()})}const di=["alloy","ash","ballad","coral","echo","fable","nova","onyx","sage","shimmer","verse"];function ui(e,t,n){e.innerHTML="",Mi();const i=document.createElement("div");i.id="hud",e.appendChild(i);const s=document.createElement("div");s.className="hud-panel hud-state",i.appendChild(s);const o=document.createElement("div");o.className="hud-panel-title",o.textContent="Ship State",s.appendChild(o);function a(h,x,L=!1){const V=document.createElement("div");V.id=h,V.className="hud-row";const ue=document.createElement("span");ue.className="hud-row-label",ue.textContent=x,V.appendChild(ue);const Se=document.createElement("span");Se.className="hud-row-colon",Se.textContent=": ",V.appendChild(Se);const he=document.createElement("span");he.className="hud-row-value",he.textContent="--",V.appendChild(he);let te=null;if(L){const ne=document.createElement("div");ne.className="hud-bar",te=document.createElement("div"),te.className="hud-bar-fill",ne.appendChild(te),V.appendChild(ne)}return s.appendChild(V),{setValue:ne=>{he.textContent=ne},setFill:te?ne=>{te&&(te.style.width=`${Math.max(0,Math.min(100,ne))}%`)}:void 0}}const r=a("hud-heading","heading"),l=a("hud-speed","speed"),c=a("hud-wind","wind"),u=a("hud-awa","awa"),d=a("hud-main","main",!0),f=a("hud-jib","jib",!0),p=a("hud-rudder","rudder"),b="http://www.w3.org/2000/svg";function y(h,x){const L=document.createElementNS(b,h);for(const[V,ue]of Object.entries(x))L.setAttribute(V,ue);return L}const E=document.getElementById("hud-wind"),M=document.createElement("div");M.id="hud-windvane",M.className="hud-windvane";const w=y("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});w.appendChild(y("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),w.appendChild(y("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const k=y("g",{class:"hud-windvane-arrow"});k.appendChild(y("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),k.appendChild(y("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),w.appendChild(k),w.appendChild(y("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),M.appendChild(w),E.appendChild(M);const T=document.getElementById("hud-rudder"),C=document.createElement("div");C.className="hud-gauge";const P=document.createElement("div");P.className="hud-gauge-center-tick",C.appendChild(P);const R=document.createElement("div");R.className="hud-gauge-target",C.appendChild(R);const I=document.createElement("div");I.className="hud-gauge-needle",C.appendChild(I),T.appendChild(C);let F=null;function g(h){return(Math.max(-35,Math.min(35,h))+35)/70*100}function _(h){const x=g(h);I.style.left=`${x}%`,I.classList.toggle("port",h<-.5),I.classList.toggle("stbd",h>.5),F!==null&&Math.abs(h-F)>.5?(R.style.left=`${g(F)}%`,R.style.display="block"):R.style.display="none"}const m=document.createElement("div");m.id="hud-irons",m.className="hud-irons-row";const v=document.createElement("span");v.className="hud-visually-hidden",v.textContent="irons: false",m.appendChild(v),s.appendChild(m);const A=document.createElement("div");A.className="hud-panel hud-log",i.appendChild(A);const $=document.createElement("div");$.className="hud-log-header",A.appendChild($);const D=document.createElement("div");D.className="hud-panel-title hud-log-title-text",D.textContent="Quarterdeck Log",$.appendChild(D);const O=document.createElement("button");O.id="command-config-toggle",O.type="button",O.title="Voice & key settings",O.setAttribute("aria-label","Command config"),O.textContent="⚙",O.className="hud-btn hud-command-config-toggle",$.appendChild(O);const N=document.createElement("div");N.id="hud-log-list",N.className="hud-log-list",A.appendChild(N);const Q=6,q=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function _e(){N.innerHTML="";let h=-1;q.forEach((x,L)=>{x.kind==="exchange"&&(h=L)}),q.forEach((x,L)=>{const V=document.createElement("div");if(V.style.opacity=String(.45+.55*((L+1)/q.length)),x.kind==="system"){V.className="hud-log-entry hud-log-system-entry";const ne=document.createElement("div");ne.className="hud-log-system",ne.textContent=`⚠ ${x.transcript}`,V.appendChild(ne),N.appendChild(V);return}const ue=L===h;V.className="hud-log-entry";const Se=document.createElement("div");Se.className="hud-log-you",ue&&(Se.id="hud-transcript"),Se.textContent=`You: ${x.transcript}`,V.appendChild(Se);const he=document.createElement("div");he.className="hud-log-order",ue&&(he.id="hud-intent"),he.textContent=x.order,V.appendChild(he);const te=document.createElement("div");te.className="hud-log-crew",ue&&(te.id="hud-crew"),te.textContent=`Crew: ${x.crew}`,V.appendChild(te),N.appendChild(V)}),N.scrollTop=N.scrollHeight}_e();function Et(h){if(h===null)return"→ no order";if(h.action==="helm"){const x=Math.round(h.degrees),L=x<0?"port":x>0?"stbd":"amidships";return`→ helm ${x}° (${L})`}return h.action==="trim_sail"?`→ trim ${h.sail} → ${h.trim.toFixed(2)}`:h.action==="fire_guns"?"→ fire guns":"→ status report"}function le(h){q.push({kind:"exchange",transcript:h,order:"→ …",crew:"…"}),q.length>Q&&q.shift(),_e()}function kt(h){const x=[...q].reverse().find(L=>L.kind==="exchange");x&&(x.order=Et(h)),h!==null&&h.action==="helm"&&(F=h.degrees),_e()}function X(h){const x=[...q].reverse().find(L=>L.kind==="exchange");x&&(x.crew=h),_e()}function U(h){q.push({kind:"system",transcript:h,order:"",crew:""}),q.length>Q&&q.shift(),_e()}const He=document.createElement("div");He.className="hud-controls",A.insertBefore(He,N);const B=document.createElement("input");B.id="transcript-input",B.type="text",B.placeholder="Speak or type your orders…",B.className="hud-input",He.appendChild(B);const be=document.createElement("div");be.className="hud-button-row",He.appendChild(be);const K=document.createElement("button");K.id="ptt",K.type="button",K.textContent="Hold to Talk",K.className="hud-btn hud-btn-ptt",be.appendChild(K);const we=document.createElement("button");we.id="view-toggle",we.type="button",we.textContent="Helm View",we.className="hud-btn hud-btn-view-toggle",be.appendChild(we);function ve(){B.focus()}const Ce=Ye().input,Re=2;let xe=null;function ze(){xe!==null&&(clearTimeout(xe),xe=null)}let J=!1,H=null;async function G(h){if(J||(n.isPipelineBusy?.()??!1)){H=h;return}J=!0,ze();try{await n.injectTranscript(h),B.value=""}catch(x){const L=x instanceof Error?x.message:String(x);X(L)}finally{if(J=!1,ve(),H!==null){const x=H;H=null,G(x)}}}function Y(h){if(!Ce.autoSubmit)return;const x=h.trim();x.length<Re||G(x)}B.addEventListener("input",h=>{if(ze(),!Ce.autoSubmit)return;if(h.inputType==="insertFromPaste"){Y(B.value);return}B.value.trim().length<Re||(xe=setTimeout(()=>{xe=null,Y(B.value)},Ce.autoSubmitDelayMs))}),B.addEventListener("keydown",h=>{if(h.key!=="Enter")return;ze();const x=B.value.trim();x.length!==0&&G(x)}),document.addEventListener("click",h=>{h.target instanceof HTMLCanvasElement&&ve()}),vi(i,ve);const De=Si(A,O,n,ve);function Ae(h){return h.toFixed(1)}function tt(h){return h.toFixed(2)}const Tt=["N","NE","E","SE","S","SW","W","NW"];function nt(h){return(h%360+360)%360}function Ln(h){const x=Math.round(nt(h)/45)%8;return Tt[x]??"N"}function In(h){return String(Math.round(nt(h))%360).padStart(3,"0")}function cs(h){return`${In(h)} ${Ln(h)}`}function ds(h,x){return`from ${In(h)} @ ${Ae(x)} kts (${Ln(h)})`}function us(h,x){const L=Math.round(h);if(L===0)return`dead ahead @ ${Ae(x)} kts`;const V=L<0?"port":"starboard";return`${Math.abs(L)}° to ${V} @ ${Ae(x)} kts`}function hs(h){const x=Math.round(h),L=x<0?"port":x>0?"stbd":"amidships";return`${x}° ${L}`}function ps(h){r.setValue(cs(h.heading)),l.setValue(`${Ae(h.speedKts)} kts`),c.setValue(ds(h.windDirection,h.windSpeedKts)),k&&k.setAttribute("transform",`rotate(${h.windDirection-h.heading} 20 20)`),u.setValue(us(h.apparentWindAngle,h.apparentWindKts)),d.setValue(tt(h.mainTrim)),d.setFill?.(h.mainTrim*100),f.setValue(tt(h.jibTrim)),f.setFill?.(h.jibTrim*100),p.setValue(hs(h.rudderAngle)),_(h.rudderAngle),v.textContent=`irons: ${h.inIrons}`,m.classList.toggle("active",h.inIrons)}function On(){ps(t.getState())}return On(),We={logTranscript:le,logIntent:kt,logCrewLine:X,logSystemNote:U},Ut={setVoiceModeChecked:De.setWhisperModeChecked},Gt={focus:ve},{update:On}}let We=null;function hi(e){We?.logTranscript(e)}function Kt(e){We?.logIntent(e)}function lt(e){We?.logCrewLine(e)}function $t(e){We?.logSystemNote(e)}function pi(e,t){Kt(e),lt(t)}let Ut=null;function ct(e){Ut?.setVoiceModeChecked(e)}let Gt=null;function mi(){Gt?.focus()}let Yt=[];function gi(e){Yt.push(e)}function fi(e,t){for(const n of Yt)n(e,t)}function yi(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function bi(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function wi(e,t,n){const i=t.split("."),s=i[i.length-1];if(s===void 0)return;let o=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0)return;const l=o[r];(typeof l!="object"||l===null)&&(o[r]={}),o=o[r]}o[s]=n}function qt(e,t){const n={...e};for(const i of Object.keys(t)){const s=e[i],o=t[i];s!==null&&typeof s=="object"&&!Array.isArray(s)&&o!==null&&typeof o=="object"&&!Array.isArray(o)?n[i]=qt(s,o):n[i]=o}return n}function vi(e,t){const n=Ye(),i={};let s=!1;const o=new Map,a=document.createElement("button");a.id="settings-toggle",a.type="button",a.title="Settings (S)",a.setAttribute("aria-label","Settings"),a.textContent="⚙",a.className="hud-btn hud-settings-toggle",e.appendChild(a);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const c=document.createElement("div");c.className="hud-settings-reload-banner",c.hidden=!0,c.textContent="Some changes need Save & Reload to take effect.",r.appendChild(c);function u(){c.hidden=!s}function d(g,_){if(wi(i,g.path,_),g.live)fi(g.path,_);else{const m=o.get(g.path);m&&(m.hidden=!1),s=!0,u()}}function f(g,_){const m=document.createElement("div");m.className="hud-settings-control-row";const v=document.createElement("input");v.type="range",v.min=String(g.min??0),v.max=String(g.max??100),v.step=String(g.step??1),v.value=String(_),v.className="hud-settings-range";const A=document.createElement("input");A.type="number",A.min=v.min,A.max=v.max,A.step=v.step,A.value=String(_),A.className="hud-settings-numeric";const $=g.min??-1/0,D=g.max??1/0;function O(N){if(!Number.isFinite(N))return;const Q=Math.min(D,Math.max($,N));v.value=String(Q),A.value=String(Q),d(g,Q)}return v.addEventListener("input",()=>O(Number(v.value))),A.addEventListener("input",()=>O(Number(A.value))),m.appendChild(v),m.appendChild(A),m}function p(g,_){const m=document.createElement("label");m.className="hud-settings-checkbox-label";const v=document.createElement("input");return v.type="checkbox",v.checked=_,v.addEventListener("change",()=>d(g,v.checked)),m.appendChild(v),m}function b(g,_){const m=document.createElement("select");m.className="hud-settings-select";for(const v of g.options??[]){const A=document.createElement("option");A.value=v,A.textContent=v,v===_&&(A.selected=!0),m.appendChild(A)}return m.addEventListener("change",()=>d(g,m.value)),m}function y(g,_){const m=document.createElement("input");return m.type="color",m.className="hud-settings-color",m.value=_,m.addEventListener("input",()=>d(g,m.value)),m}function E(g,_){const m=document.createElement("input");return m.type="text",m.className="hud-settings-text",m.value=_,m.addEventListener("change",()=>d(g,m.value)),m}function M(g){const _=document.createElement("div");_.className="hud-settings-field",_.dataset.configPath=g.path;const m=document.createElement("div");m.className="hud-settings-label-row";const v=document.createElement("span");if(v.className="hud-settings-label",v.textContent=g.label,m.appendChild(v),!g.live){const D=document.createElement("span");D.className="hud-settings-reload-dot",D.title="Staged — needs Save & Reload",D.hidden=!0,m.appendChild(D),o.set(g.path,D)}_.appendChild(m);const A=bi(n,g.path);let $;switch(g.type){case"number":$=f(g,A);break;case"boolean":$=p(g,A);break;case"select":$=b(g,A);break;case"color":$=y(g,A);break;default:$=E(g,A);break}if(_.appendChild($),g.note){const D=document.createElement("div");D.className="hud-settings-note",D.textContent=g.note,_.appendChild(D)}return _}const w=new Map;for(const g of ni)w.has(g.section)||w.set(g.section,[]),w.get(g.section)?.push(g);const k=new Set(["Visuals","Environment","Lighting"]);for(const[g,_]of w){const m=document.createElement("details");m.className="hud-settings-section",m.open=k.has(g);const v=document.createElement("summary");v.textContent=g,m.appendChild(v);for(const A of _)m.appendChild(M(A));r.appendChild(m)}const T=document.createElement("div");T.className="hud-settings-footer";const C=document.createElement("button");C.id="settings-save-reload",C.type="button",C.textContent="Save & Reload",C.className="hud-btn",C.addEventListener("click",()=>{Ot(i),location.reload()});const P=document.createElement("button");P.id="settings-copy-json",P.type="button",P.textContent="Copy JSON",P.className="hud-btn",P.addEventListener("click",()=>{(async()=>{const g=qt(n,i),_=JSON.stringify(g,null,2);console.log(_);try{await navigator.clipboard?.writeText(_)}catch{}})()});const R=document.createElement("button");R.id="settings-reset-all",R.type="button",R.textContent="Reset All",R.className="hud-btn",R.addEventListener("click",()=>{Ht(),location.reload()}),T.appendChild(C),T.appendChild(P),T.appendChild(R),r.appendChild(T);let I=!1;function F(g){I=g,r.classList.toggle("open",g),a.classList.toggle("active",g),g||t()}a.addEventListener("click",()=>F(!I)),document.addEventListener("keydown",g=>{g.key!=="s"&&g.key!=="S"||yi(document.activeElement)||F(!I)})}function xi(e){return e.length<=4?"•".repeat(e.length):`sk-…${e.slice(-4)}`}function Si(e,t,n,i){const s=Ye(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function a(m){const v=document.createElement("div");return v.className="hud-command-config-section-title",v.textContent=m,v}o.appendChild(a("Voice Mode"));const r=document.createElement("div");r.className="hud-segmented";const l=document.createElement("label");l.className="hud-segmented-option";const c=document.createElement("input");c.type="radio",c.name="voice-mode",c.id="voice-mode-ptt",l.appendChild(c),l.appendChild(document.createTextNode("Push to talk"));const u=document.createElement("label");u.className="hud-segmented-option";const d=document.createElement("input");d.type="radio",d.name="voice-mode",d.id="voice-mode-whisper",u.appendChild(d),u.appendChild(document.createTextNode("Ship's mic (hands-free)")),d.checked=s.voice.whisperMode,c.checked=!s.voice.whisperMode,c.addEventListener("change",()=>{c.checked&&n.setWhisperMode(!1)}),d.addEventListener("change",()=>{d.checked&&n.setWhisperMode(!0)}),r.appendChild(l),r.appendChild(u),o.appendChild(r),o.appendChild(a("Crew Voice"));const f=document.createElement("div");f.className="hud-command-config-row";const p=document.createElement("label");p.className="hud-toggle-label";const b=document.createElement("input");b.id="tts-enabled",b.type="checkbox",b.checked=!0,p.appendChild(b),p.appendChild(document.createTextNode("Speak crew replies")),f.appendChild(p);const y=document.createElement("select");y.id="tts-voice-select",y.className="hud-settings-select hud-command-config-voice-select";for(const m of di){const v=document.createElement("option");v.value=m,v.textContent=m,m===s.voice.ttsVoice&&(v.selected=!0),y.appendChild(v)}y.addEventListener("change",()=>n.setTtsVoice(y.value)),f.appendChild(y),o.appendChild(f);const E=document.createElement("div");E.className="hud-command-config-row";const M=document.createElement("span");M.className="hud-command-config-volume-label",M.textContent="Volume",E.appendChild(M);const w=document.createElement("input");w.id="tts-volume",w.type="range",w.min="0",w.max="1",w.step="0.05",w.value=String(s.voice.ttsVolume),w.className="hud-settings-range",w.addEventListener("input",()=>n.setTtsVolume(Number(w.value))),E.appendChild(w),o.appendChild(E),o.appendChild(a("OpenAI Key"));const k=document.createElement("div");k.id="key-masked",k.className="hud-key-masked";function T(){const m=Ne();k.textContent=m!==null&&m.length>0?xi(m):"(no key stored)"}T(),o.appendChild(k);const C=document.createElement("div");C.className="hud-command-config-row";const P=document.createElement("input");P.id="key-input",P.type="password",P.placeholder="sk-...",P.autocomplete="off",P.className="hud-settings-text",C.appendChild(P);const R=document.createElement("button");R.id="key-save",R.type="button",R.textContent="Save",R.className="hud-btn",R.addEventListener("click",()=>{const m=P.value.trim();m.length!==0&&(Bt(m),P.value="",T())}),C.appendChild(R);const I=document.createElement("button");I.id="key-clear",I.type="button",I.textContent="Clear",I.className="hud-btn",I.addEventListener("click",()=>{ci(),T(),_(!1),jt().then(()=>{T(),i()})}),C.appendChild(I),o.appendChild(C),o.appendChild(a("Actions"));const F=document.createElement("button");F.id="demo",F.type="button",F.textContent="Run Demo",F.className="hud-btn hud-btn-demo hud-command-config-demo",o.appendChild(F);let g=!1;function _(m){g=m,o.classList.toggle("open",g),t.classList.toggle("active",g),g?T():i()}return t.addEventListener("click",()=>_(!g)),document.addEventListener("mousedown",m=>{if(!g)return;const v=m.target;o.contains(v)||t.contains(v)||_(!1)}),document.addEventListener("keydown",m=>{m.key==="Escape"&&g&&_(!1)}),{setWhisperModeChecked:m=>{d.checked=m,c.checked=!m}}}function Mi(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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

.hud-button-row {
  display: flex;
  align-items: center;
  gap: 8px;
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

/* Whisper mode idle-listening indicator (#ptt, gated by main.ts/app.ts) — a calmer, slower blue
   pulse than the urgent red .recording state above, which whisper mode also reuses (unchanged)
   for "actively capturing a confirmed segment right now". */
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
`,document.head.appendChild(e)}const dt=.05,Xt=dt*1e3,Ei=35,ki=40,ut=50,Jt=15,Ti=8;function ht(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class _i{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=Dt({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*W,this.rudderRateRadPerS=t.rudderSlewDegPerS*W,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=j(t*W),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",j(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,s=Math.hypot(n,i),o=j(Math.atan2(n,i));s>this.engageRangeM*1.15?this.behavior="APPROACH":s<this.engageRangeM*.85&&(this.behavior="ENGAGE");let a;if(this.behavior==="APPROACH")a=o;else{const c=(s>this.engageRangeM?1:-1)*15*W;a=j(t.headingRad+c)}const r=pe(this.state.windFromRad-a)*ae;if(this.tackSide!==null){this.tackHoldS-=dt;const l=Math.abs(r)>=ki;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=Ti){const c=r>=0?1:-1;c!==this.tackSide&&(this.tackSide=c,this.tackHoldS=Jt)}}}else if(Math.abs(r)<Ei){const l=j(this.state.windFromRad-ut*W),c=j(this.state.windFromRad+ut*W),u=Math.abs(pe(l-this.state.psi)),d=Math.abs(pe(c-this.state.psi));this.tackSide=u<=d?1:-1,this.tackHoldS=Jt}return this.tackSide!==null?j(this.state.windFromRad-this.tackSide*ut*W):a}step(t,n){const i=this.planHeading(n),s=pe(i-this.state.psi);this.rudderTargetRad=de(this.headingKp*s-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:o}=st(this.state),a=Nt(Math.abs(o));this.mainTrimTarget=a,this.jibTrimTarget=a,this.state.rudder=ht(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=ht(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=ht(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),Ft(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Xt;)this.step(dt,n),this.accMs-=Xt}headingDeg(){return this.state.psi*ae%360}}const Ci=30;function Zt(){return{reloadRemainingS:0}}function Qt(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function en(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function tn(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=Ci,ready:e.reloadRemainingS<=0}}function Ri(e,t,n,i,s,o){en(e,t);const a=tn(e,n,i,s);return!a.inRange||!a.inArc||!a.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=s.reloadS,{fired:!0,hit:o()<Qt(n,s.cannonRangeM)})}function Di(e,t,n,i,s){const o=tn(e,t,n,i);if(!o.ready)return{fired:!1,hit:!1,...o};e.reloadRemainingS=i.reloadS;const a=s();return{fired:!0,hit:o.inRange&&o.inArc&&a<Qt(t,i.cannonRangeM),...o}}const nn=10,Ai=5,Pi=.8,Ni=.5;function an(){return{hullHp:nn}}function sn(e){e.hullHp=Math.max(0,e.hullHp-1)}function Li(e){return e.hullHp<=0?Ni:e.hullHp<=Ai?Pi:1}function on(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Ii=35;function Oi(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class Hi{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,s){this.cfg=t,this.rng=on(t.seed),this.playerRng=on(t.seed+1),this.lastPlayerPose=s;const o=de(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*o);const a=1.2+.6*o,r=this.rng()*2*Math.PI,l=s.x+t.spawnRangeM*Math.sin(r),c=s.y+t.spawnRangeM*Math.cos(r),u=j(r+Math.PI);this.npc=new _i({x:l,y:c,heading:u*ae,windDirection:s.windDirectionDeg,windSpeedKts:s.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Ii,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:a,phys:n}),this.damage=an(),this.cannon=Zt(),this.playerCannon=Zt(),this.enemyDamage=an()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,en(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});const s=n.x-this.npc.x,o=n.y-this.npc.y,a=Math.hypot(s,o);if(!this.everSpotted&&a<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=j(Math.atan2(-s,-o)),c=pe(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:c})}if(!this.everClosing&&a<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=j(Math.atan2(s,o)),l=pe(r-this.npc.state.psi)*ae,c=Math.min(Math.abs(l-90),Math.abs(l+90)),u=Ri(this.cannon,t/1e3,a,c,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);u.fired&&(i.push({key:"enemy_fires"}),u.hit&&(sn(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp})))}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(){const t=this.resolveFireGuns();return this.lastPlayerFireOutcome=t,t}resolveFireGuns(){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,s=Math.hypot(n,i),o=j(Math.atan2(-n,-i)),a=pe(o-t.headingRad)*ae,r=Math.min(Math.abs(a-90),Math.abs(a+90)),l=Di(this.playerCannon,s,r,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);return l.fired?!l.inRange||!l.inArc?{kind:"wasted"}:l.hit?(sn(this.enemyDamage),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=nn/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})):{kind:"miss"}:{kind:"reloading"}}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return Li(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:Oi(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck}}}const Be={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function zi(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function je(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Fi=1500;async function qe(e){try{return await e()}catch(t){if(!je(t))throw t;return await new Promise(n=>setTimeout(n,Fi)),e()}}function Xe(e,t,n){const i=zi(t);return i?Be[i]:`${e} (${t}): ${n}`}const Vi="https://api.openai.com/v1/audio/speech",Wi="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let ge=null,Je=null;function Bi(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function ji(e){return ge!==null?!0:Je===null?!1:performance.now()-Je<e}function pt(){ge!==null&&(ge.pause(),ge.src="",ge=null,Je=performance.now())}async function mt(e,t,n=ee.voice.ttsModel,i=ee.voice.ttsVoice,s=ee.voice.ttsVolume){if(e.trim().length===0||!Bi())return;pt();let o;try{o=await qe(()=>fetch(Vi,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:Wi})}))}catch(d){throw je(d)?new Error(Be.network):d}if(!o.ok){const d=await o.text();throw new Error(Xe("tts request failed",o.status,d))}const a=await o.arrayBuffer(),r=new Blob([a],{type:"audio/mpeg"}),l=URL.createObjectURL(r),c=new Audio(l);c.volume=Math.max(0,Math.min(1,s)),ge=c;const u=()=>{URL.revokeObjectURL(l),ge===c&&(ge=null,Je=performance.now())};c.addEventListener("ended",u,{once:!0}),c.addEventListener("error",u,{once:!0}),await c.play()}const rn="audio/webm;codecs=opus";function Ki(e,t){let n=null,i=null,s=[],o=!1;function a(p){if(!(p instanceof HTMLElement))return!1;const b=p.tagName;return b==="INPUT"||b==="SELECT"||b==="TEXTAREA"||p.isContentEditable}async function r(){if(!o&&!(t.canStart&&!t.canStart())){o=!0,pt(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),s=[],i=new MediaRecorder(n,{mimeType:rn}),i.addEventListener("dataavailable",p=>{p.data.size>0&&s.push(p.data)}),i.start()}catch(p){o=!1,t.onRecordingChange(!1);const b=p instanceof Error?p:new Error(String(p));t.onError?.(b)}}}function l(){if(!o)return;o=!1,t.onRecordingChange(!1);const p=i,b=n;!p||p.state==="inactive"||(p.addEventListener("stop",()=>{const y=new Blob(s,{type:rn});s=[],b?.getTracks().forEach(E=>E.stop()),t.onBlob(y)},{once:!0}),p.stop(),i=null,n=null)}function c(p){p.code==="Space"&&(a(p.target)||p.repeat||(p.preventDefault(),r()))}function u(p){p.code==="Space"&&(a(p.target)||l())}function d(p){p.preventDefault(),r()}function f(){l()}return window.addEventListener("keydown",c),window.addEventListener("keyup",u),e.addEventListener("mousedown",d),e.addEventListener("mouseup",f),e.addEventListener("mouseleave",f),e.addEventListener("touchstart",d,{passive:!1}),e.addEventListener("touchend",f),{destroy(){window.removeEventListener("keydown",c),window.removeEventListener("keyup",u),e.removeEventListener("mousedown",d),e.removeEventListener("mouseup",f),e.removeEventListener("mouseleave",f),e.removeEventListener("touchstart",d),e.removeEventListener("touchend",f)}}}const ln="audio/webm;codecs=opus",$i=512,Ui=250,Gi=300,Yi=2e3,cn={calibrationMs:1e3,noiseFloorFactor:3.5,minSpeechMs:150,hangoverMs:700,minUtteranceMs:400,maxSegmentMs:1e4};function qi(){return{phase:"calibrating",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:0,calibMs:0,calibSum:0,calibSamples:0}}function Xi(e,t,n,i=cn){if(e.phase==="calibrating"){const l=e.calibMs+n,c=e.calibSum+t,u=e.calibSamples+1;return l>=i.calibrationMs?{state:{phase:"idle",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:u>0?c/u:0,calibMs:l,calibSum:c,calibSamples:u},event:null}:{state:{...e,calibMs:l,calibSum:c,calibSamples:u},event:null}}const s=e.noiseFloor*i.noiseFloorFactor,o=t>=s;if(e.phase==="idle"){if(!o)return e.phaseMs===0?{state:e,event:null}:{state:{...e,phaseMs:0},event:null};const l=e.phaseMs+n;return l>=i.minSpeechMs?{state:{...e,phase:"speaking",phaseMs:0,segmentMs:l,speechMs:l},event:{type:"segment-start"}}:{state:{...e,phaseMs:l},event:null}}const a=e.segmentMs+n;if(a>=i.maxSegmentMs)return{state:{...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},event:{type:"segment-end"}};if(o){const l=e.speechMs+n;return{state:{...e,phase:"speaking",phaseMs:0,segmentMs:a,speechMs:l},event:null}}const r=e.phaseMs+n;if(r>=i.hangoverMs){const l={...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0};return e.speechMs<i.minUtteranceMs?{state:l,event:{type:"segment-dropped"}}:{state:l,event:{type:"segment-end"}}}return{state:{...e,phaseMs:r,segmentMs:a},event:null}}function Ji(e){let t=0;for(let n=0;n<e.length;n++){const i=e[n]??0;t+=i*i}return Math.sqrt(t/e.length)}async function Zi(e,t=cn){pt();const n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}});let i=!0,s=null,o=null;try{let a=function(){if(y!==null||p.length<=1)return;const M=performance.now()-Yi,w=p[0];if(w===void 0)return;const k=p.slice(1).filter(T=>T.tsMs>=M);p=[w,...k]},r=function(M){const w=y??M;y=null;const k=p.filter(R=>R.tsMs>=w&&R.tsMs<=M);if(k.length===0)return;const T=p[0],P=T!==void 0&&k[0]!==T?[T.blob,...k.map(R=>R.blob)]:k.map(R=>R.blob);e.onBlob(new Blob(P,{type:ln}))},l=function(){if(!i)return;const M=performance.now(),w=M-E;if(E=M,e.isSuppressed()){y!==null&&(y=null,b={...b,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},e.onSegmentChange(!1)),a(),requestAnimationFrame(l);return}d.getFloatTimeDomainData(f);const k=Ji(f),{state:T,event:C}=Xi(b,k,w,t);b=T,C?.type==="segment-start"?(y=M-t.minSpeechMs-Gi,e.onSegmentChange(!0)):C?.type==="segment-end"?(r(M),e.onSegmentChange(!1)):C?.type==="segment-dropped"&&(y=null,e.onSegmentChange(!1)),a(),requestAnimationFrame(l)};const c=window.AudioContext??window.webkitAudioContext;s=new c;const u=s.createMediaStreamSource(n),d=s.createAnalyser();d.fftSize=$i,u.connect(d);const f=new Float32Array(d.fftSize);o=new MediaRecorder(n,{mimeType:ln});let p=[];o.addEventListener("dataavailable",M=>{M.data.size>0&&p.push({blob:M.data,tsMs:performance.now()})}),o.addEventListener("error",M=>{const w=M.error;e.onError?.(w instanceof Error?w:new Error("whisper mode: MediaRecorder error"))}),o.start(Ui);let b=qi(),y=null,E=performance.now();requestAnimationFrame(l)}catch(a){throw i=!1,n.getTracks().forEach(r=>r.stop()),s?.close(),a instanceof Error?a:new Error(String(a))}return{stop(){i=!1,e.onSegmentChange(!1);const a=o;a&&a.state!=="inactive"&&a.stop(),n.getTracks().forEach(r=>r.stop()),s?.close()}}}const Qi="https://api.openai.com/v1/audio/transcriptions";async function dn(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const s=await fetch(Qi,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!s.ok){const r=await s.text();return{ok:!1,text:"",status:s.status,errorBody:r}}const o=await s.json();return{ok:!0,text:typeof o=="object"&&o!==null&&"text"in o&&typeof o.text=="string"?o.text:"",status:s.status,errorBody:""}}function ea(e,t){return e.includes(t)}async function ta(e,t,n=ee.voice.sttModel,i=ee.voice.sttFallbackModel){let s;try{s=await qe(()=>dn(e,t,n))}catch(a){throw je(a)?new Error(Be.network):a}if(s.ok)return s.text;if(s.status>=400&&s.status<500&&ea(s.errorBody,n)){let a;try{a=await qe(()=>dn(e,t,i))}catch(r){throw je(r)?new Error(Be.network):r}if(a.ok)return a.text;throw new Error(Xe(`stt failed: ${n} then ${i}`,a.status,a.errorBody))}throw new Error(Xe(`stt failed: ${n}`,s.status,s.errorBody))}const na=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears.",parameters:{type:"object",properties:{}}}}],ia=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function aa(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,s=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof s!="number"||!Number.isFinite(s)||s<0||s>1?null:{action:"trim_sail",sail:i,trim:s}}case"report_status":return{action:"report_status"};case"fire_guns":return{action:"fire_guns"};default:return null}}const sa="https://api.openai.com/v1/chat/completions";function oa(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const s=i,o=typeof s.content=="string"?s.content:null,a=[],r=s.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const c=l.function;if(typeof c!="object"||c===null)continue;const u=c,d=u.name,f=u.arguments;typeof d!="string"||typeof f!="string"||a.push({name:d,argumentsJson:f})}return{content:o,toolCalls:a}}function ra(e){try{return JSON.parse(e)}catch{return null}}async function la(e,t,n,i=ee.voice.intentModel){const s=t.getState(),o=`${ia}

Current ship state:
${JSON.stringify(s)}`;let a;try{a=await qe(()=>fetch(sa,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:na,messages:[{role:"system",content:o},{role:"user",content:e}]})}))}catch(p){throw je(p)?new Error(Be.network):p}if(!a.ok){const p=await a.text();throw new Error(Xe("intent request failed",a.status,p))}const r=await a.json(),l=oa(r);if(l===null)throw new Error("intent request returned an unrecognizable response body");const c=l.toolCalls[0];if(c===void 0)return{crewLine:l.content??"",intent:null};const u=ra(c.argumentsJson),d=aa(c.name,u);return d===null?{crewLine:z("unknown_order",s),intent:null}:{crewLine:(await t.submit(d)).message,intent:d}}const un=9.81,hn=370,ca=.84,da=10/12,gt=12,pn=.45,ua=2.2,mn=.6,ha=50,gn=2,pa=16,fn=.2,ma=.9,ga=137.51,fa=251.33;function ft(e){return Math.min(1,Math.max(0,e))}function ya(e){return Math.max(e*da,.1)}function ba(e){const t=ya(e),n=un*(ca/t)**2;return 2*Math.PI/n}function wa(e){const t=ft(e/40),n=Math.sqrt(t);return fn+n*(ma-fn)}function va(e){const t=ft(e/40);return gn+t*(pa-gn)}function xa(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function Sa(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=ba(n),s=va(n),o=wa(n),a=1+ft(o)*3,r=t+180,l=[],c=[],u=[];let d=0;for(let b=0;b<gt;b++){const y=b/(gt-1),E=pn*(ua/pn)**y;l.push(E);const M=ha*(2*y-1);c.push(M);const w=Math.log(E),k=Math.exp(-(w*w)/(2*mn*mn)),T=M*Math.PI/180,C=Math.max(0,Math.cos(T))**(2*a),P=k*C;u.push(P),P>d&&(d=P)}const f=[],p=d>0?d:1;for(let b=0;b<gt;b++){const y=i*l[b],E=2*Math.PI/y,M=Math.sqrt(un*E*(1+E*E/(hn*hn))),w=xa(r+c[b]),k=s*(u[b]/p),T=b*ga,C=b*fa,P=-E*(w.x*T+w.z*C);f.push({amplitude:k,wavenumber:E,omega:M,dirX:w.x,dirZ:w.z,phase0:P})}return f}function Ma(e,t,n,i){let s=0;for(const o of e){const a=o.wavenumber*(o.dirX*t+o.dirZ*n)-o.omega*i+o.phase0;s+=o.amplitude*Math.cos(a)}return s}const Ea=458.7,ka=170;function Ta(e){return{length:Ea*e,beam:ka*e}}function _a(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],s=[];for(const o of i)s.push({x:-n,z:o}),s.push({x:n,z:o});return s}function Ca(e,t,n){const i=Math.cos(n),s=Math.sin(n);return{x:e*i+t*s,z:-e*s+t*i}}function Ra(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,s=0,o=0,a=0,r=0,l=0,c=0;const u=e.length;for(let w=0;w<u;w++){const{x:k,z:T}=e[w],C=t[w];n+=k*k,i+=k*T,s+=k,o+=T*T,a+=T,r+=k*C,l+=T*C,c+=C}const d=n*(o*u-a*a)-i*(i*u-a*s)+s*(i*a-o*s);if(Math.abs(d)<1e-9)return{heave:c/u,pitchRad:0,rollRad:0};const f=r*(o*u-a*a)-i*(l*u-a*c)+s*(l*a-o*c),p=n*(l*u-c*a)-r*(i*u-a*s)+s*(i*c-l*s),b=n*(o*c-a*l)-i*(i*c-a*r)+r*(i*a-o*s),y=f/d,E=p/d;return{heave:b/d,pitchRad:Math.atan(-E),rollRad:Math.atan(y)}}function Da(e,t,n,i,s,o){const a=-i*(Math.PI/180),r=Ta(s),l=_a(r),c=l.map(u=>{const d=Ca(u.x,u.z,a);return Ma(e,t+d.x,n+d.z,o)});return Ra(l,c)}function yt(e,t,n,i,s){if(s<=0||n<=0)return e;const o=e.position-t,a=e.velocity,r=1e-4;let l,c;if(Math.abs(i-1)<r){const u=Math.exp(-n*s),d=a+n*o;l=(o+d*s)*u,c=u*(a-n*s*d)}else if(i>1){const u=n*Math.sqrt(i*i-1),d=-n*i+u,f=-n*i-u,p=(a-f*o)/(d-f),b=o-p,y=Math.exp(d*s),E=Math.exp(f*s);l=p*y+b*E,c=p*d*y+b*f*E}else{const u=-n*i,d=n*Math.sqrt(1-i*i),f=Math.exp(u*s),p=Math.cos(d*s),b=Math.sin(d*s),y=(a-u*o)/d;l=f*(o*p+y*b),c=u*l+f*d*(-o*b+y*p)}return{position:t+l,velocity:c}}function yn(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(s,o,a,r,l,c,u,d){const f=Da(u,a,r,l,c,o),p=f.heave*d.heaveScale,b=f.pitchRad*d.pitchScale,y=f.rollRad*d.rollScale;return s>0?(e=yt(e,p,d.stiffness,d.damping,s),t=yt(t,b,d.stiffness,d.damping,s),n=yt(n,y,d.stiffness,d.damping,s)):(e={position:p,velocity:0},t={position:b,velocity:0},n={position:y,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const Aa=.514444,fe=Math.PI/180,Pa=1,Na=512,La=4;function Ze(e){return-e*fe}function Ia(e){const t=e*fe;return{x:Math.sin(t),z:-Math.cos(t)}}function Le(e,t){return{x:e.x*t,z:-e.y*t}}const bn=18,Oa=95,Ha=260;function za(e,t,n,i,s,o){const a=o*(.7+Math.random()*.3),r=(Math.random()-.5)*2*Ha;e.position.x=t+i.x*a+s.x*r,e.position.z=n+i.z*a+s.z*r,e.position.y=bn+Math.random()*(Oa-bn)}function Fa(e,t,n,i,s,o,a,r){if(e.length===0)return;const l=i+180,c=Ia(l),u={x:-c.x,z:-c.z},d={x:-c.z,z:c.x},f=s*Aa*o,p=Ze(l),b=a*a;for(const y of e){y.position.x+=c.x*f*r,y.position.z+=c.z*f*r,y.rotation.y=p;const E=y.position.x-t,M=y.position.z-n;E*E+M*M>b&&za(y,t,n,u,d,a)}}const Va=1.4,Wa=6,Ba=2;function ja(e,t,n,i,s=ee.visuals,o={}){const{camera:a=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:c,muzzleFlash:u=null,splash:d=null,getEnemyTiltNode:f}=o;let p=null,b=0,y=0,E=0;const M=yn(),w=yn();let k=null,T=[];function C(D,O){const N=`${D}:${O}`;return N!==k&&(T=Sa({windDirectionDeg:D,windSpeedKts:O}),k=N),T}const P=220;let R=null,I=null,F="follow";const g=a!==null?a.fov:null;function _(D){F=D,typeof window<"u"&&(window.__captainViewMode=D),a!==null&&D==="follow"&&g!==null&&(a.fov=g,a.updateProjectionMatrix())}function m(D,O,N){const{worldUnitsPerMetre:Q,maxHeelDeg:q,maxBraceDeg:_e,heelSmoothingHz:Et,boatScale:le,streakFieldRadius:kt}=s,X=p===null?0:Math.min((D-p)/1e3,.5);p=D;const U=e.getState(),He=Ze(O.headingDeg);t.rotation.y=He,t.scale.x=le,t.scale.y=le,t.scale.z=le;const{x:B,z:be}=Le(O,Q);t.position.x=B,t.position.z=be;const{buoyancy:K}=s,we=C(U.windDirection,U.windSpeedKts),ve=D/1e3,Ce=M.update(X,ve,B,be,O.headingDeg,le,we,K),Re=n();if(Re!==null){const H=q*Math.tanh(U.apparentWindKts**2*((U.mainTrim+U.jibTrim)/2)*Math.abs(Math.sin(U.apparentWindAngle*fe))/Na),G=Math.sign(U.apparentWindAngle)*H*fe,Y=X>0?1-Math.exp(-X*Et):0,De=b+(G-b)*Y,Ae=La*fe*X,tt=Math.max(-Ae,Math.min(Ae,De-b));b+=tt;const Tt=K.enabled?Ce.rollRad:0;Re.rotation.z=b+Tt,Re.rotation.x=K.enabled?Ce.pitchRad:0;const nt=K.baseOffsetM*Q;Re.position.y=K.enabled?Ce.heave+nt:0}const xe=i?i():null;if(xe!==null){const H=(U.mainTrim+U.jibTrim)/2,G=Math.sign(U.apparentWindAngle)*H*_e*fe,Y=X>0?1-Math.exp(-X*Pa):0;y+=(G-y)*Y,xe.rotation.y=y}Fa(l,B,be,U.windDirection,U.windSpeedKts,Q,kt,X);const ze=r?r():null;if(ze!==null){const H=Ze(U.apparentWindAngle+180),G=X>0?1-Math.exp(-X*Ba):0;let Y=H-E;Y=(Y+Math.PI)%(2*Math.PI)-Math.PI,E+=Y*G;const De=Wa*fe*Math.sin(D/1e3*2*Math.PI*Va);ze.rotation.y=E+De}if(a!==null&&F==="helm"){const{helmView:H}=s;a.position.x=H.x,a.position.y=H.y,a.position.z=H.z,a.rotation.x=H.pitchDeg*fe,a.rotation.y=0,a.rotation.z=0,a.fov!==H.fov&&(a.fov=H.fov,a.updateProjectionMatrix())}const J=c?c():null;if(J!==null)if(N!==null){const H=Le(N,Q);J.position.x=H.x,J.position.z=H.z,J.rotation.y=Ze(N.headingDeg),J.scale.x=le,J.scale.y=le,J.scale.z=le,J.visible=!0;const G=f?f():null,Y=w.update(X,ve,H.x,H.z,N.headingDeg,le,we,K);if(G!==null){const De=K.baseOffsetM*Q;G.position.y=K.enabled?Y.heave+De:0,G.rotation.x=K.enabled?Y.pitchRad:0,G.rotation.z=K.enabled?Y.rollRad:0}}else J.visible=!1;R!==null&&D>=R&&(u!==null&&(u.visible=!1),R=null),I!==null&&D>=I&&(d!==null&&(d.visible=!1),I=null)}function v(){_(F==="follow"?"helm":"follow")}function A(D,O,N){u!==null&&(u.position.x=O,u.position.y=90,u.position.z=N,u.visible=!0,R=D+P)}function $(D,O,N){d!==null&&(d.position.x=O,d.position.y=8,d.position.z=N,d.visible=!0,I=D+P)}return{update:m,toggleView:v,getViewMode:()=>F,triggerMuzzleFlash:A,triggerSplash:$}}const Ka=500;window.__captainDriverActive=!0;const S=Ye();window.__captainAmbientRock=S.visuals.ambientRock;const se=new ri({},S),wn={current:null},oe=jn(se,()=>wn.current),Z=S.battle.enabled?new Hi(S.battle,S.physics,S.controls,{...se.getPose(),windDirectionDeg:oe.getState().windDirection,windSpeedKts:oe.getState().windSpeedKts}):null;wn.current=Z;const bt=document.createElement("div");bt.id="hud-root",document.body.appendChild(bt);function vn(e){hi(e)}function xn(e){Kt(e)}function Ie(e){lt(e)}async function wt(e){const t=Ne();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");vn(e);const n=await la(e,oe,t,S.voice.intentModel);xn(n.intent),Ie(n.crewLine);try{await mt(n.crewLine,t,S.voice.ttsModel,S.voice.ttsVoice,S.voice.ttsVolume)}catch(i){const s=i instanceof Error?i.message:String(i);$t(`⚠ Crew voice unavailable: ${s}`)}}const $a=ui(bt,oe,{injectTranscript:wt,setWhisperMode:e=>{e?En():Xa()},setTtsVoice:e=>{S.voice.ttsVoice=e},setTtsVolume:e=>{S.voice.ttsVolume=e},isPipelineBusy:()=>ke});async function Ua(e){const t=await oe.submit(e);if(pi(e,t.message),e.action==="fire_guns"&&Z){const n=Z.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss"||n.kind==="wasted")){const i=performance.now(),s=se.getPose(),o=Z.getView().npc,a=Le({x:s.x,y:s.y},S.visuals.worldUnitsPerMetre);if(ye.triggerMuzzleFlash(i,a.x,a.z),n.kind==="hit"||n.kind==="miss"){const r=Le({x:o.x,y:o.y},S.visuals.worldUnitsPerMetre);ye.triggerSplash(i,r.x,r.z)}}}return t}const Oe=document.getElementById("demo");let vt=!1;function Ga(e){return new Promise(t=>setTimeout(t,e))}const Ya=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function Sn(){if(!vt){vt=!0,Oe&&(Oe.disabled=!0);try{for(const e of Ya){vn(`[demo] ${e.label}`);const t=await oe.submit(e.intent);xn(e.intent),Ie(t.message);const n=Ne();n!==null&&n.length>0&&mt(t.message,n,S.voice.ttsModel,S.voice.ttsVoice,S.voice.ttsVolume).catch(()=>{}),await Ga(e.waitMs)}}finally{vt=!1,Oe&&(Oe.disabled=!1)}}}Oe&&Oe.addEventListener("click",()=>{Sn()});const Ee=document.getElementById("ptt");let ke=!1;async function Mn(e){const t=Ne();if(t===null||t.length===0){Ie("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await ta(e,t,S.voice.sttModel,S.voice.sttFallbackModel);await wt(n)}catch(n){const i=n instanceof Error?n.message:String(n);Ie(i)}}let Te=!1,xt=null,Ke=!1;function Qe(){Te?(Ee.textContent=Ke?"Listening… (capturing)":"Listening…",Ee.classList.toggle("recording",Ke),Ee.classList.toggle("listening",!Ke)):(Ee.textContent="Hold to Talk",Ee.classList.remove("recording","listening"))}async function qa(e){ke=!0;try{await Mn(e)}finally{ke=!1}}async function En(){if(!Te)try{xt=await Zi({onBlob:e=>{qa(e)},onSegmentChange:e=>{Ke=e,Qe()},onError:e=>{Ie(e.message)},isSuppressed:()=>ke||ji(Ka)}),Te=!0,ct(!0),Qe()}catch(e){throw Te=!1,ct(!1),Qe(),e instanceof Error?e:new Error(String(e))}}function Xa(){Te&&(Te=!1,Ke=!1,xt?.stop(),xt=null,ct(!1),Qe())}Ki(Ee,{onRecordingChange:e=>{Ee.classList.toggle("recording",e)},onBlob:e=>{ke=!0,Mn(e).finally(()=>{ke=!1})},onError:e=>{Ie(e.message)},canStart:()=>!ke&&!Te}),jt().then(()=>{mi(),S.voice.whisperMode&&En().catch(()=>{S.voice.whisperMode=!1,$t("Microphone unavailable — switched to push-to-talk. Enable Whisper again anytime in ⚙ command config.")})});const re=window.DEMO;if(re===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const ye=ja(oe,re.ms_GroupShip,()=>window.DEMO?.ms_ShipTilt??null,()=>window.DEMO?.ms_Sails??null,S.visuals,{camera:re.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:re.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,getEnemyTiltNode:()=>window.DEMO?.ms_EnemyTilt??null,muzzleFlash:re.ms_MuzzleFlash,splash:re.ms_Splash}),kn=10/12,Ja=350,Za=1400,Tn=1.6,Qa=4.4,_n=.2,es=.9;function ts(e){const t=e*kn,n=9.81,i=.84,s=Math.max(t,.1),o=n*(i/s)**2,a=2*Math.PI/o,r=Math.min(Za,Math.max(Ja,a*2)),l=Math.min(1,Math.max(0,e/40)),c=Math.sqrt(l),u=Tn+c*(Qa-Tn),d=_n+c*(es-_n);return{size:r,choppiness:u,directionality:d}}function Cn(e){return 1+Math.min(1,Math.max(0,e))*3}function St(){se.setWind(S.environment.windDirectionDeg,S.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(S.environment.windDirectionDeg+180)*Math.PI/180,n=S.environment.windSpeedKts*kn;if(e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,S.visuals.seaStateFollowsWind){const i=ts(S.environment.windSpeedKts);e.ms_Ocean.size=i.size,e.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=i.choppiness,e.ms_Ocean.directionality=Cn(i.directionality)}e.ms_Ocean.changed=!0}function Rn(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(Me(S,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),Me(S,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),Me(S,"visuals.lighting.sunIntensity",e.sunIntensity),Me(S,"visuals.lighting.ambientIntensity",e.ambientIntensity),Me(S,"visuals.lighting.exposure",e.exposure),Me(S,"visuals.lighting.fogDensity",e.fogDensity))}function ns(){window.DEMO?.SetLightingParams(S.visuals.lighting)}!(window.location.hash.length>1)&&re.ms_Environment!==S.environment.skyPreset&&re.UpdateEnvironment(S.environment.skyPreset),Rn(),St(),re.ms_soundWaves&&(re.ms_soundWaves.volume=S.visuals.ambientSoundVolume);function is(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function as(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function ss(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function os(e,t){switch(Me(S,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=Cn(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&St();break;case"visuals.waterColor":{const n=is(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":as(t);break;case"visuals.streakOpacity":ss(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":St();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),Rn();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":ns();break}}gi(os);const $e=document.getElementById("view-toggle");function Dn(e){return e==="helm"?"Follow Cam":"Helm View"}function An(){ye.toggleView(),$e&&($e.textContent=Dn(ye.getViewMode()))}$e&&($e.textContent=Dn(ye.getViewMode()),$e.addEventListener("click",()=>{An()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}An()});const Ue=document.createElement("div");Ue.id="battle-hit-flash",Ue.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(Ue);let et=null;const rs=180;function ls(){et!==null&&clearTimeout(et),Ue.style.opacity="0.35",et=setTimeout(()=>{Ue.style.opacity="0",et=null},rs)}const Pn=15;let Mt=null;function Nn(e){if(Mt!==null){const o=e-Mt;if(se.tick(o),Z){const a=se.getPose(),r=oe.getState(),l=Z.tick(o,{...a,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(se.setDriveMultiplier(Z.getSpeedMultiplier()),l.some(c=>c.key==="enemy_fires")){const c=Z.getView().npc,u=Le({x:c.x,y:c.y},S.visuals.worldUnitsPerMetre);if(ye.triggerMuzzleFlash(e,u.x,u.z),l.some(d=>d.key==="hit_taken"))ls();else{const d=c.x-a.x,f=c.y-a.y,p=Math.hypot(d,f)||1,b={x:a.x+d/p*Pn,y:a.y+f/p*Pn},y=Le(b,S.visuals.worldUnitsPerMetre);ye.triggerSplash(e,y.x,y.z)}}for(const c of l){const u=z(c.key,r,c);lt(u);const d=Ne();d!==null&&d.length>0&&mt(u,d,S.voice.ttsModel,S.voice.ttsVoice,S.voice.ttsVolume).catch(()=>{})}}}Mt=e;const t=se.getPose(),n={x:t.x,y:t.y,headingDeg:oe.getState().heading},i=Z?Z.getView().npc:null,s=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;ye.update(e,n,s),$a.update(),requestAnimationFrame(Nn)}requestAnimationFrame(Nn),window.__captain={bus:oe,submitIntent:Ua,injectTranscript:wt,setWind:(e,t)=>{se.setWind(e,t)},demo:Sn,getConfig:()=>S,copyConfig:()=>{const e=JSON.stringify(S,null,2);return console.log(e),e},setConfig:e=>{Ot(e),location.reload()},resetConfig:()=>{Ht(),location.reload()},getPlayerPose:()=>se.getPose(),get battle(){return Z?Z.getView():null}}})();
