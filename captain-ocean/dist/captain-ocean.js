(function(){"use strict";function wt(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function vt(e){return e.toFixed(1)}function P(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=wt(t.heading),s=vt(t.speedKts),o=wt(t.windDirection),a=vt(t.windSpeedKts);let r=`Steering ${i} at ${s} knots, wind ${o} at ${a}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"no_target":return"No sail in range, sir.";case"guns_dont_bear":return"She doesn't bear, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Tn=-35,_n=35,Cn=0,Rn=1,Dn=1;function An(e){return e==="main"||e==="jib"||e==="all"}function ae(e,t){return{ok:!1,message:e,state:t}}function Z(e,t){return{ok:!0,message:e,state:t}}function Pn(e,t){function n(s){const o=s.action;if(o==="helm"){const a=s.degrees;if(typeof a!="number"||!Number.isFinite(a)||a<Tn||a>_n)return Promise.resolve(ae(P("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:a}).accepted)return Promise.resolve(ae(P("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Dn?Promise.resolve(Z(P("no_steerage_way",l),l)):a>0?Promise.resolve(Z(P("helm_ack_starboard",l),l)):a<0?Promise.resolve(Z(P("helm_ack_port",l),l)):Promise.resolve(Z(P("helm_ack_amidships",l),l))}if(o==="trim_sail"){const a=s.sail,r=s.trim;if(!An(a))return Promise.resolve(ae(P("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<Cn||r>Rn)return Promise.resolve(ae(P("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:a,trim:r}).accepted)return Promise.resolve(ae(P("unknown_order",e.snapshot()),e.snapshot()));const c=e.snapshot(),g=a==="main"?"trim_ack_main":a==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(Z(P(g,c),c))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(ae(P("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(Z(P("status",r),r))}if(o==="fire_guns"){const a=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(ae(P("no_target",a),a));const l=r.fireGuns();switch(l.kind){case"no_target":return Promise.resolve(ae(P("no_target",a),a));case"dont_bear":return Promise.resolve(Z(P("guns_dont_bear",a),a));case"reloading":return Promise.resolve(Z(P("guns_reloading",a),a));case"miss":return Promise.resolve(Z(P("player_miss",a),a));case"hit":{const c=l.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(Z(P(c,a,{enemyHullHp:l.enemyHullHp}),a))}default:{const c=l;throw new Error(`unhandled fire outcome: ${String(c)}`)}}}return Promise.resolve(ae(P("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const Je=1.94384,ee=180/Math.PI,W=Math.PI/180;function xt(e){return e*Je}function Xe(e){return e/Je}function le(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function B(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function se(e,t,n){return e<t?t:e>n?n:e}const Nn=0,In=12;function St(e={}){return{x:0,y:0,psi:B((e.heading??0)*W),u:Xe(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*W,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:B((e.windDirection??Nn)*W),windSpeedMs:Xe(e.windSpeedKts??In)}}const _e=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Ln=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],On=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function Hn(e,t,n){return e+(t-e)*n}function Et(e,t){const n=se(t,0,180);let i=0;for(;i<_e.length-1&&_e[i+1]<=n;)i++;const s=Math.min(i+1,_e.length-1),o=_e[i],a=_e[s],r=a===o?0:(n-o)/(a-o);return Hn(e[i],e[s],r)}function zn(e){return{cl:Et(Ln,e),cd:Et(On,e)}}function Fn(e){const t=se(Math.abs(e),0,180),{cl:n,cd:i}=zn(t),s=t*W,o=Math.sin(s),a=Math.cos(s),r=n*o-i*a,l=Math.abs(n*a+i*o);return{cDrive:r,cSide:l}}const Mt=.95,Vn=.2;function kt(e){const t=se(Math.abs(e),0,180)/180;return se(Mt-(Mt-Vn)*t*t,.15,1)}const Wn=.65;function jn(e,t){const n=(e-kt(t))/Wn;return Math.max(0,1-n*n)}const q={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:64,streakOpacity:.35,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Se="captain.config";function ce(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Kn(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Tt(e,t,n,i){for(const s of Object.keys(t)){const o=t[s];if(!(s in e)){i.push(`${n}${s} (unknown key)`);continue}const a=e[s];ce(a)&&ce(o)?Tt(a,o,`${n}${s}.`,i):ce(a)||ce(o)||typeof a!=typeof o?i.push(`${n}${s} (expected ${typeof a}, got ${typeof o})`):e[s]=o}}function _t(e,t){const n={...e};for(const i of Object.keys(t)){const s=t[i],o=n[i];n[i]=ce(o)&&ce(s)?_t(o,s):s}return n}function He(){return typeof localStorage<"u"}function Bn(){if(!He())return{};const e=localStorage.getItem(Se);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return ce(t)?t:{}}catch{return{}}}function ze(){const e=Kn(q);if(!He())return e;const t=localStorage.getItem(Se);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Se}"] is not valid JSON — ignoring it, using defaults.`),e}if(!ce(n))return console.warn(`captain.config: stored value in localStorage["${Se}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Tt(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Ct(e){if(!He())return;const t=Bn(),n=_t(t,e);localStorage.setItem(Se,JSON.stringify(n))}function Rt(){He()&&localStorage.removeItem(Se)}function be(e,t,n){const i=t.split("."),s=i[i.length-1];if(s===void 0)return;let o=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0||(o=o?.[r],o==null))return}o!=null&&(o[s]=n)}const $n=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"voice.whisperMode",label:"Ship's mic (hands-free) by default",section:"Voice",type:"boolean",live:!1,note:"Live toggle lives in the ⚙ command-config popover next to the quarterdeck log; this only sets next boot's default."},{path:"voice.ttsVolume",label:"Crew voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"Applied to the crew's spoken replies. See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, the three 'manual' sliders above are overwritten from wind speed every time wind changes."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:64,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],Un=q.controls.rudderMaxDeg*W,Gn=q.physics;function Qe(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,s=e.u*n-e.v*t,o=-e.windSpeedMs*Math.sin(e.windFromRad),a=-e.windSpeedMs*Math.cos(e.windFromRad),r=o-i,l=a-s,c=Math.hypot(r,l),g=r*t+l*n,p=r*n-l*t;return{awaDeg:Math.atan2(-p,-g)*ee,awsMs:c}}function Dt(e,t,n,i,s){const o=Math.abs(n),{cDrive:a,cSide:r}=Fn(o),l=jn(t,o),c=.5*s*i*i,g=c*e*a*l,p=c*e*r*l,w=-Math.sign(n||1)*p;return{surge:g,sway:w}}function At(e,t,n=Gn,i=Un,s=1){const{awaDeg:o,awsMs:a}=Qe(e),r=Dt(n.areaMain,e.mainTrim,o,a,n.rhoAir),l=Dt(n.areaJib,e.jibTrim,o,a,n.rhoAir),c=(r.surge+l.surge)*s,g=(r.sway+l.sway)*s,p=e.u,w=e.v,m=e.r,E=p>=0?n.kSurgeLin:n.kSurgeLinAstern,x=-n.kSurgeQuad*p*Math.abs(p)-E*p,H=-n.kSwayQuad*w*Math.abs(w)-n.kSwayLin*w,M=se(e.rudder,-i,i),S=n.cRudder*M*p*Math.abs(p),_=-(n.kYawDamp+n.kYawDampU*Math.abs(p))*m,R=n.cWeather*Math.sin(o*W)*a*Math.min(1,Math.abs(p)),C=S+_+R,D=(c+x)/n.mass+w*m,T=(g+H)/n.mass-p*m,O=C/n.izz;e.u=p+D*t,e.v=w+T*t,e.r=m+O*t;const z=Math.sin(e.psi),d=Math.cos(e.psi),v=e.u*z+e.v*d,u=e.u*d-e.v*z;e.x+=v*t,e.y+=u*t,e.psi=B(e.psi+e.r*t)}function Pt(e){return Math.hypot(e.u,e.v)*Je}function Yn(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,s=e.u*n-e.v*t;return B(Math.atan2(i,s))}function qn(e){return Pt(e)<.2?0:le(e.psi-Yn(e))*ee}const Ce=.05,Nt=Ce*1e3;function Ze(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Jn{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=q){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*W,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*W,this.state=St({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=se(t.degrees*W,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=se(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Nt;)this.state.rudder=Ze(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*Ce),this.state.mainTrim=Ze(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Ce),this.state.jibTrim=Ze(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Ce),At(this.state,Ce,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=Nt}snapshot(){const{awaDeg:t,awsMs:n}=Qe(this.state),i=Pt(this.state);return{heading:this.state.psi*ee%360,speedKts:i,windDirection:this.state.windFromRad*ee%360,windSpeedKts:xt(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:xt(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*ee,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:qn(this.state)}}setWind(t,n){this.state.windFromRad=B(t*W),this.state.windSpeedMs=Xe(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const et="captain.openai_key",Xn="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function Ee(){return window.localStorage.getItem(et)}function It(e){window.localStorage.setItem(et,e)}function Qn(){window.localStorage.removeItem(et)}function Lt(e=document.body){const t=Ee();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const s=document.createElement("div");s.style.background="#0e1f2e",s.style.color="#e8f4ff",s.style.padding="20px 24px",s.style.borderRadius="6px",s.style.maxWidth="360px",s.style.display="flex",s.style.flexDirection="column",s.style.gap="10px";const o=document.createElement("div");o.textContent="OpenAI API key",o.style.fontSize="15px",o.style.fontWeight="bold";const a=document.createElement("p");a.id="byok-copy",a.textContent=Xn,a.style.margin="0",a.style.fontSize="12px",a.style.opacity="0.85";const r=document.createElement("input");r.id="byok-key-input",r.type="password",r.placeholder="sk-...",r.autocomplete="off",r.style.fontFamily="inherit",r.style.fontSize="13px",r.style.padding="6px 8px";const l=document.createElement("button");l.id="byok-save",l.type="button",l.textContent="Save",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 10px",l.style.cursor="pointer";function c(){const g=r.value.trim();g.length!==0&&(It(g),i.remove(),n(g))}l.addEventListener("click",c),r.addEventListener("keydown",g=>{g.key==="Enter"&&c()}),s.appendChild(o),s.appendChild(a),s.appendChild(r),s.appendChild(l),i.appendChild(s),e.appendChild(i),r.focus()})}const Zn=["alloy","ash","ballad","coral","echo","fable","nova","onyx","sage","shimmer","verse"];function ei(e,t,n){e.innerHTML="",hi();const i=document.createElement("div");i.id="hud",e.appendChild(i);const s=document.createElement("div");s.className="hud-panel hud-state",i.appendChild(s);const o=document.createElement("div");o.className="hud-panel-title",o.textContent="Ship State",s.appendChild(o);function a(h,b,A=!1){const L=document.createElement("div");L.id=h,L.className="hud-row";const oe=document.createElement("span");oe.className="hud-row-label",oe.textContent=b,L.appendChild(oe);const fe=document.createElement("span");fe.className="hud-row-colon",fe.textContent=": ",L.appendChild(fe);const re=document.createElement("span");re.className="hud-row-value",re.textContent="--",L.appendChild(re);let X=null;if(A){const Q=document.createElement("div");Q.className="hud-bar",X=document.createElement("div"),X.className="hud-bar-fill",Q.appendChild(X),L.appendChild(Q)}return s.appendChild(L),{setValue:Q=>{re.textContent=Q},setFill:X?Q=>{X&&(X.style.width=`${Math.max(0,Math.min(100,Q))}%`)}:void 0}}const r=a("hud-heading","heading"),l=a("hud-speed","speed"),c=a("hud-wind","wind"),g=a("hud-awa","awa"),p=a("hud-main","main",!0),w=a("hud-jib","jib",!0),m=a("hud-rudder","rudder"),E="http://www.w3.org/2000/svg";function x(h,b){const A=document.createElementNS(E,h);for(const[L,oe]of Object.entries(b))A.setAttribute(L,oe);return A}const H=document.getElementById("hud-wind"),M=document.createElement("div");M.id="hud-windvane",M.className="hud-windvane";const S=x("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});S.appendChild(x("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),S.appendChild(x("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const _=x("g",{class:"hud-windvane-arrow"});_.appendChild(x("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),_.appendChild(x("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),S.appendChild(_),S.appendChild(x("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),M.appendChild(S),H.appendChild(M);const R=document.getElementById("hud-rudder"),C=document.createElement("div");C.className="hud-gauge";const D=document.createElement("div");D.className="hud-gauge-center-tick",C.appendChild(D);const T=document.createElement("div");T.className="hud-gauge-target",C.appendChild(T);const O=document.createElement("div");O.className="hud-gauge-needle",C.appendChild(O),R.appendChild(C);let z=null;function d(h){return(Math.max(-35,Math.min(35,h))+35)/70*100}function v(h){const b=d(h);O.style.left=`${b}%`,O.classList.toggle("port",h<-.5),O.classList.toggle("stbd",h>.5),z!==null&&Math.abs(h-z)>.5?(T.style.left=`${d(z)}%`,T.style.display="block"):T.style.display="none"}const u=document.createElement("div");u.id="hud-irons",u.className="hud-irons-row";const f=document.createElement("span");f.className="hud-visually-hidden",f.textContent="irons: false",u.appendChild(f),s.appendChild(u);const k=document.createElement("div");k.className="hud-panel hud-log",i.appendChild(k);const $=document.createElement("div");$.className="hud-log-header",k.appendChild($);const j=document.createElement("div");j.className="hud-panel-title hud-log-title-text",j.textContent="Quarterdeck Log",$.appendChild(j);const F=document.createElement("button");F.id="command-config-toggle",F.type="button",F.title="Voice & key settings",F.setAttribute("aria-label","Command config"),F.textContent="⚙",F.className="hud-btn hud-command-config-toggle",$.appendChild(F);const N=document.createElement("div");N.id="hud-log-list",N.className="hud-log-list",k.appendChild(N);const V=6,U=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function pe(){N.innerHTML="";let h=-1;U.forEach((b,A)=>{b.kind==="exchange"&&(h=A)}),U.forEach((b,A)=>{const L=document.createElement("div");if(L.style.opacity=String(.45+.55*((A+1)/U.length)),b.kind==="system"){L.className="hud-log-entry hud-log-system-entry";const Q=document.createElement("div");Q.className="hud-log-system",Q.textContent=`⚠ ${b.transcript}`,L.appendChild(Q),N.appendChild(L);return}const oe=A===h;L.className="hud-log-entry";const fe=document.createElement("div");fe.className="hud-log-you",oe&&(fe.id="hud-transcript"),fe.textContent=`You: ${b.transcript}`,L.appendChild(fe);const re=document.createElement("div");re.className="hud-log-order",oe&&(re.id="hud-intent"),re.textContent=b.order,L.appendChild(re);const X=document.createElement("div");X.className="hud-log-crew",oe&&(X.id="hud-crew"),X.textContent=`Crew: ${b.crew}`,L.appendChild(X),N.appendChild(L)}),N.scrollTop=N.scrollHeight}pe();function $e(h){if(h===null)return"→ no order";if(h.action==="helm"){const b=Math.round(h.degrees),A=b<0?"port":b>0?"stbd":"amidships";return`→ helm ${b}° (${A})`}return h.action==="trim_sail"?`→ trim ${h.sail} → ${h.trim.toFixed(2)}`:h.action==="fire_guns"?"→ fire guns":"→ status report"}function Ue(h){U.push({kind:"exchange",transcript:h,order:"→ …",crew:"…"}),U.length>V&&U.shift(),pe()}function Ge(h){const b=[...U].reverse().find(A=>A.kind==="exchange");b&&(b.order=$e(h)),h!==null&&h.action==="helm"&&(z=h.degrees),pe()}function Y(h){const b=[...U].reverse().find(A=>A.kind==="exchange");b&&(b.crew=h),pe()}function K(h){U.push({kind:"system",transcript:h,order:"",crew:""}),U.length>V&&U.shift(),pe()}const ie=document.createElement("div");ie.className="hud-controls",k.insertBefore(ie,N);const I=document.createElement("input");I.id="transcript-input",I.type="text",I.placeholder="Speak or type your orders…",I.className="hud-input",ie.appendChild(I);const me=document.createElement("div");me.className="hud-button-row",ie.appendChild(me);const ge=document.createElement("button");ge.id="ptt",ge.type="button",ge.textContent="Hold to Talk",ge.className="hud-btn hud-btn-ptt",me.appendChild(ge);const xe=document.createElement("button");xe.id="view-toggle",xe.type="button",xe.textContent="Helm View",xe.className="hud-btn hud-btn-view-toggle",me.appendChild(xe);function Le(){I.focus()}const gt=ze().input,wn=2;let Oe=null;function ft(){Oe!==null&&(clearTimeout(Oe),Oe=null)}let bt=!1,Ye=null;async function yt(h){if(bt||(n.isPipelineBusy?.()??!1)){Ye=h;return}bt=!0,ft();try{await n.injectTranscript(h),I.value=""}catch(b){const A=b instanceof Error?b.message:String(b);Y(A)}finally{if(bt=!1,Le(),Ye!==null){const b=Ye;Ye=null,yt(b)}}}function vn(h){if(!gt.autoSubmit)return;const b=h.trim();b.length<wn||yt(b)}I.addEventListener("input",h=>{if(ft(),!gt.autoSubmit)return;if(h.inputType==="insertFromPaste"){vn(I.value);return}I.value.trim().length<wn||(Oe=setTimeout(()=>{Oe=null,vn(I.value)},gt.autoSubmitDelayMs))}),I.addEventListener("keydown",h=>{if(h.key!=="Enter")return;ft();const b=I.value.trim();b.length!==0&&yt(b)}),document.addEventListener("click",h=>{h.target instanceof HTMLCanvasElement&&Le()}),ci(i,Le);const Da=ui(k,F,n,Le);function qe(h){return h.toFixed(1)}function xn(h){return h.toFixed(2)}const Aa=["N","NE","E","SE","S","SW","W","NW"];function Sn(h){return(h%360+360)%360}function En(h){const b=Math.round(Sn(h)/45)%8;return Aa[b]??"N"}function Mn(h){return String(Math.round(Sn(h))%360).padStart(3,"0")}function Pa(h){return`${Mn(h)} ${En(h)}`}function Na(h,b){return`from ${Mn(h)} @ ${qe(b)} kts (${En(h)})`}function Ia(h,b){const A=Math.round(h);if(A===0)return`dead ahead @ ${qe(b)} kts`;const L=A<0?"port":"starboard";return`${Math.abs(A)}° to ${L} @ ${qe(b)} kts`}function La(h){const b=Math.round(h),A=b<0?"port":b>0?"stbd":"amidships";return`${b}° ${A}`}function Oa(h){r.setValue(Pa(h.heading)),l.setValue(`${qe(h.speedKts)} kts`),c.setValue(Na(h.windDirection,h.windSpeedKts)),_&&_.setAttribute("transform",`rotate(${h.windDirection-h.heading} 20 20)`),g.setValue(Ia(h.apparentWindAngle,h.apparentWindKts)),p.setValue(xn(h.mainTrim)),p.setFill?.(h.mainTrim*100),w.setValue(xn(h.jibTrim)),w.setFill?.(h.jibTrim*100),m.setValue(La(h.rudderAngle)),v(h.rudderAngle),f.textContent=`irons: ${h.inIrons}`,u.classList.toggle("active",h.inIrons)}function kn(){Oa(t.getState())}return kn(),Re={logTranscript:Ue,logIntent:Ge,logCrewLine:Y,logSystemNote:K},zt={setVoiceModeChecked:Da.setWhisperModeChecked},Ft={focus:Le},{update:kn}}let Re=null;function ti(e){Re?.logTranscript(e)}function Ot(e){Re?.logIntent(e)}function tt(e){Re?.logCrewLine(e)}function Ht(e){Re?.logSystemNote(e)}function ni(e,t){Ot(e),tt(t)}let zt=null;function nt(e){zt?.setVoiceModeChecked(e)}let Ft=null;function ii(){Ft?.focus()}let Vt=[];function ai(e){Vt.push(e)}function si(e,t){for(const n of Vt)n(e,t)}function oi(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function ri(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function li(e,t,n){const i=t.split("."),s=i[i.length-1];if(s===void 0)return;let o=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0)return;const l=o[r];(typeof l!="object"||l===null)&&(o[r]={}),o=o[r]}o[s]=n}function Wt(e,t){const n={...e};for(const i of Object.keys(t)){const s=e[i],o=t[i];s!==null&&typeof s=="object"&&!Array.isArray(s)&&o!==null&&typeof o=="object"&&!Array.isArray(o)?n[i]=Wt(s,o):n[i]=o}return n}function ci(e,t){const n=ze(),i={};let s=!1;const o=new Map,a=document.createElement("button");a.id="settings-toggle",a.type="button",a.title="Settings (S)",a.setAttribute("aria-label","Settings"),a.textContent="⚙",a.className="hud-btn hud-settings-toggle",e.appendChild(a);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const c=document.createElement("div");c.className="hud-settings-reload-banner",c.hidden=!0,c.textContent="Some changes need Save & Reload to take effect.",r.appendChild(c);function g(){c.hidden=!s}function p(d,v){if(li(i,d.path,v),d.live)si(d.path,v);else{const u=o.get(d.path);u&&(u.hidden=!1),s=!0,g()}}function w(d,v){const u=document.createElement("div");u.className="hud-settings-control-row";const f=document.createElement("input");f.type="range",f.min=String(d.min??0),f.max=String(d.max??100),f.step=String(d.step??1),f.value=String(v),f.className="hud-settings-range";const k=document.createElement("input");k.type="number",k.min=f.min,k.max=f.max,k.step=f.step,k.value=String(v),k.className="hud-settings-numeric";const $=d.min??-1/0,j=d.max??1/0;function F(N){if(!Number.isFinite(N))return;const V=Math.min(j,Math.max($,N));f.value=String(V),k.value=String(V),p(d,V)}return f.addEventListener("input",()=>F(Number(f.value))),k.addEventListener("input",()=>F(Number(k.value))),u.appendChild(f),u.appendChild(k),u}function m(d,v){const u=document.createElement("label");u.className="hud-settings-checkbox-label";const f=document.createElement("input");return f.type="checkbox",f.checked=v,f.addEventListener("change",()=>p(d,f.checked)),u.appendChild(f),u}function E(d,v){const u=document.createElement("select");u.className="hud-settings-select";for(const f of d.options??[]){const k=document.createElement("option");k.value=f,k.textContent=f,f===v&&(k.selected=!0),u.appendChild(k)}return u.addEventListener("change",()=>p(d,u.value)),u}function x(d,v){const u=document.createElement("input");return u.type="color",u.className="hud-settings-color",u.value=v,u.addEventListener("input",()=>p(d,u.value)),u}function H(d,v){const u=document.createElement("input");return u.type="text",u.className="hud-settings-text",u.value=v,u.addEventListener("change",()=>p(d,u.value)),u}function M(d){const v=document.createElement("div");v.className="hud-settings-field",v.dataset.configPath=d.path;const u=document.createElement("div");u.className="hud-settings-label-row";const f=document.createElement("span");if(f.className="hud-settings-label",f.textContent=d.label,u.appendChild(f),!d.live){const j=document.createElement("span");j.className="hud-settings-reload-dot",j.title="Staged — needs Save & Reload",j.hidden=!0,u.appendChild(j),o.set(d.path,j)}v.appendChild(u);const k=ri(n,d.path);let $;switch(d.type){case"number":$=w(d,k);break;case"boolean":$=m(d,k);break;case"select":$=E(d,k);break;case"color":$=x(d,k);break;default:$=H(d,k);break}if(v.appendChild($),d.note){const j=document.createElement("div");j.className="hud-settings-note",j.textContent=d.note,v.appendChild(j)}return v}const S=new Map;for(const d of $n)S.has(d.section)||S.set(d.section,[]),S.get(d.section)?.push(d);const _=new Set(["Visuals","Environment","Lighting"]);for(const[d,v]of S){const u=document.createElement("details");u.className="hud-settings-section",u.open=_.has(d);const f=document.createElement("summary");f.textContent=d,u.appendChild(f);for(const k of v)u.appendChild(M(k));r.appendChild(u)}const R=document.createElement("div");R.className="hud-settings-footer";const C=document.createElement("button");C.id="settings-save-reload",C.type="button",C.textContent="Save & Reload",C.className="hud-btn",C.addEventListener("click",()=>{Ct(i),location.reload()});const D=document.createElement("button");D.id="settings-copy-json",D.type="button",D.textContent="Copy JSON",D.className="hud-btn",D.addEventListener("click",()=>{(async()=>{const d=Wt(n,i),v=JSON.stringify(d,null,2);console.log(v);try{await navigator.clipboard?.writeText(v)}catch{}})()});const T=document.createElement("button");T.id="settings-reset-all",T.type="button",T.textContent="Reset All",T.className="hud-btn",T.addEventListener("click",()=>{Rt(),location.reload()}),R.appendChild(C),R.appendChild(D),R.appendChild(T),r.appendChild(R);let O=!1;function z(d){O=d,r.classList.toggle("open",d),a.classList.toggle("active",d),d||t()}a.addEventListener("click",()=>z(!O)),document.addEventListener("keydown",d=>{d.key!=="s"&&d.key!=="S"||oi(document.activeElement)||z(!O)})}function di(e){return e.length<=4?"•".repeat(e.length):`sk-…${e.slice(-4)}`}function ui(e,t,n,i){const s=ze(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function a(u){const f=document.createElement("div");return f.className="hud-command-config-section-title",f.textContent=u,f}o.appendChild(a("Voice Mode"));const r=document.createElement("div");r.className="hud-segmented";const l=document.createElement("label");l.className="hud-segmented-option";const c=document.createElement("input");c.type="radio",c.name="voice-mode",c.id="voice-mode-ptt",l.appendChild(c),l.appendChild(document.createTextNode("Push to talk"));const g=document.createElement("label");g.className="hud-segmented-option";const p=document.createElement("input");p.type="radio",p.name="voice-mode",p.id="voice-mode-whisper",g.appendChild(p),g.appendChild(document.createTextNode("Ship's mic (hands-free)")),p.checked=s.voice.whisperMode,c.checked=!s.voice.whisperMode,c.addEventListener("change",()=>{c.checked&&n.setWhisperMode(!1)}),p.addEventListener("change",()=>{p.checked&&n.setWhisperMode(!0)}),r.appendChild(l),r.appendChild(g),o.appendChild(r),o.appendChild(a("Crew Voice"));const w=document.createElement("div");w.className="hud-command-config-row";const m=document.createElement("label");m.className="hud-toggle-label";const E=document.createElement("input");E.id="tts-enabled",E.type="checkbox",E.checked=!0,m.appendChild(E),m.appendChild(document.createTextNode("Speak crew replies")),w.appendChild(m);const x=document.createElement("select");x.id="tts-voice-select",x.className="hud-settings-select hud-command-config-voice-select";for(const u of Zn){const f=document.createElement("option");f.value=u,f.textContent=u,u===s.voice.ttsVoice&&(f.selected=!0),x.appendChild(f)}x.addEventListener("change",()=>n.setTtsVoice(x.value)),w.appendChild(x),o.appendChild(w);const H=document.createElement("div");H.className="hud-command-config-row";const M=document.createElement("span");M.className="hud-command-config-volume-label",M.textContent="Volume",H.appendChild(M);const S=document.createElement("input");S.id="tts-volume",S.type="range",S.min="0",S.max="1",S.step="0.05",S.value=String(s.voice.ttsVolume),S.className="hud-settings-range",S.addEventListener("input",()=>n.setTtsVolume(Number(S.value))),H.appendChild(S),o.appendChild(H),o.appendChild(a("OpenAI Key"));const _=document.createElement("div");_.id="key-masked",_.className="hud-key-masked";function R(){const u=Ee();_.textContent=u!==null&&u.length>0?di(u):"(no key stored)"}R(),o.appendChild(_);const C=document.createElement("div");C.className="hud-command-config-row";const D=document.createElement("input");D.id="key-input",D.type="password",D.placeholder="sk-...",D.autocomplete="off",D.className="hud-settings-text",C.appendChild(D);const T=document.createElement("button");T.id="key-save",T.type="button",T.textContent="Save",T.className="hud-btn",T.addEventListener("click",()=>{const u=D.value.trim();u.length!==0&&(It(u),D.value="",R())}),C.appendChild(T);const O=document.createElement("button");O.id="key-clear",O.type="button",O.textContent="Clear",O.className="hud-btn",O.addEventListener("click",()=>{Qn(),R(),v(!1),Lt().then(()=>{R(),i()})}),C.appendChild(O),o.appendChild(C),o.appendChild(a("Actions"));const z=document.createElement("button");z.id="demo",z.type="button",z.textContent="Run Demo",z.className="hud-btn hud-btn-demo hud-command-config-demo",o.appendChild(z);let d=!1;function v(u){d=u,o.classList.toggle("open",d),t.classList.toggle("active",d),d?R():i()}return t.addEventListener("click",()=>v(!d)),document.addEventListener("mousedown",u=>{if(!d)return;const f=u.target;o.contains(f)||t.contains(f)||v(!1)}),document.addEventListener("keydown",u=>{u.key==="Escape"&&d&&v(!1)}),{setWhisperModeChecked:u=>{p.checked=u,c.checked=!u}}}function hi(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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
  top: 34px;
  right: 8px;
  width: 260px;
  display: none;
  pointer-events: auto;
  font-size: 12px;
  z-index: 12;
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
`,document.head.appendChild(e)}const it=.05,jt=it*1e3,pi=35,mi=40,at=50,Kt=15,gi=8;function st(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class fi{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=St({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*W,this.rudderRateRadPerS=t.rudderSlewDegPerS*W,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=B(t*W),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",B(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,s=Math.hypot(n,i),o=B(Math.atan2(n,i));s>this.engageRangeM*1.15?this.behavior="APPROACH":s<this.engageRangeM*.85&&(this.behavior="ENGAGE");let a;if(this.behavior==="APPROACH")a=o;else{const c=(s>this.engageRangeM?1:-1)*15*W;a=B(t.headingRad+c)}const r=le(this.state.windFromRad-a)*ee;if(this.tackSide!==null){this.tackHoldS-=it;const l=Math.abs(r)>=mi;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=gi){const c=r>=0?1:-1;c!==this.tackSide&&(this.tackSide=c,this.tackHoldS=Kt)}}}else if(Math.abs(r)<pi){const l=B(this.state.windFromRad-at*W),c=B(this.state.windFromRad+at*W),g=Math.abs(le(l-this.state.psi)),p=Math.abs(le(c-this.state.psi));this.tackSide=g<=p?1:-1,this.tackHoldS=Kt}return this.tackSide!==null?B(this.state.windFromRad-this.tackSide*at*W):a}step(t,n){const i=this.planHeading(n),s=le(i-this.state.psi);this.rudderTargetRad=se(this.headingKp*s-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:o}=Qe(this.state),a=kt(Math.abs(o));this.mainTrimTarget=a,this.jibTrimTarget=a,this.state.rudder=st(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=st(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=st(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),At(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=jt;)this.step(it,n),this.accMs-=jt}headingDeg(){return this.state.psi*ee%360}}const bi=30;function Bt(){return{reloadRemainingS:0}}function $t(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function Ut(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function Gt(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=bi,ready:e.reloadRemainingS<=0}}function yi(e,t,n,i,s,o){Ut(e,t);const a=Gt(e,n,i,s);return!a.inRange||!a.inArc||!a.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=s.reloadS,{fired:!0,hit:o()<$t(n,s.cannonRangeM)})}function wi(e,t,n,i,s){const o=Gt(e,t,n,i);return!o.inRange||!o.inArc||!o.ready?{fired:!1,hit:!1,...o}:(e.reloadRemainingS=i.reloadS,{fired:!0,hit:s()<$t(t,i.cannonRangeM),...o})}const Yt=10,vi=5,xi=.8,Si=.5;function qt(){return{hullHp:Yt}}function Jt(e){e.hullHp=Math.max(0,e.hullHp-1)}function Ei(e){return e.hullHp<=0?Si:e.hullHp<=vi?xi:1}function Xt(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Mi=35;function ki(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class Ti{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,s){this.cfg=t,this.rng=Xt(t.seed),this.playerRng=Xt(t.seed+1),this.lastPlayerPose=s;const o=se(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*o);const a=1.2+.6*o,r=this.rng()*2*Math.PI,l=s.x+t.spawnRangeM*Math.sin(r),c=s.y+t.spawnRangeM*Math.cos(r),g=B(r+Math.PI);this.npc=new fi({x:l,y:c,heading:g*ee,windDirection:s.windDirectionDeg,windSpeedKts:s.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Mi,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:a,phys:n}),this.damage=qt(),this.cannon=Bt(),this.playerCannon=Bt(),this.enemyDamage=qt()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,Ut(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});const s=n.x-this.npc.x,o=n.y-this.npc.y,a=Math.hypot(s,o);if(!this.everSpotted&&a<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=B(Math.atan2(-s,-o)),c=le(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:c})}if(!this.everClosing&&a<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=B(Math.atan2(s,o)),l=le(r-this.npc.state.psi)*ee,c=Math.min(Math.abs(l-90),Math.abs(l+90)),g=yi(this.cannon,t/1e3,a,c,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);g.fired&&(i.push({key:"enemy_fires"}),g.hit&&(Jt(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp})))}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(){const t=this.resolveFireGuns();return this.lastPlayerFireOutcome=t,t}resolveFireGuns(){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,s=Math.hypot(n,i),o=B(Math.atan2(-n,-i)),a=le(o-t.headingRad)*ee,r=Math.min(Math.abs(a-90),Math.abs(a+90)),l=wi(this.playerCannon,s,r,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);return l.fired?l.hit?(Jt(this.enemyDamage),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=Yt/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})):{kind:"miss"}:!l.inRange||!l.inArc?{kind:"dont_bear"}:{kind:"reloading"}}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return Ei(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:ki(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck}}}const De={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function _i(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function Ae(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Ci=1500;async function Fe(e){try{return await e()}catch(t){if(!Ae(t))throw t;return await new Promise(n=>setTimeout(n,Ci)),e()}}function Ve(e,t,n){const i=_i(t);return i?De[i]:`${e} (${t}): ${n}`}const Ri="https://api.openai.com/v1/audio/speech",Di="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let de=null,We=null;function Ai(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function Pi(e){return de!==null?!0:We===null?!1:performance.now()-We<e}function ot(){de!==null&&(de.pause(),de.src="",de=null,We=performance.now())}async function rt(e,t,n=q.voice.ttsModel,i=q.voice.ttsVoice,s=q.voice.ttsVolume){if(e.trim().length===0||!Ai())return;ot();let o;try{o=await Fe(()=>fetch(Ri,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:Di})}))}catch(p){throw Ae(p)?new Error(De.network):p}if(!o.ok){const p=await o.text();throw new Error(Ve("tts request failed",o.status,p))}const a=await o.arrayBuffer(),r=new Blob([a],{type:"audio/mpeg"}),l=URL.createObjectURL(r),c=new Audio(l);c.volume=Math.max(0,Math.min(1,s)),de=c;const g=()=>{URL.revokeObjectURL(l),de===c&&(de=null,We=performance.now())};c.addEventListener("ended",g,{once:!0}),c.addEventListener("error",g,{once:!0}),await c.play()}const Qt="audio/webm;codecs=opus";function Ni(e,t){let n=null,i=null,s=[],o=!1;function a(m){if(!(m instanceof HTMLElement))return!1;const E=m.tagName;return E==="INPUT"||E==="SELECT"||E==="TEXTAREA"||m.isContentEditable}async function r(){if(!o&&!(t.canStart&&!t.canStart())){o=!0,ot(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),s=[],i=new MediaRecorder(n,{mimeType:Qt}),i.addEventListener("dataavailable",m=>{m.data.size>0&&s.push(m.data)}),i.start()}catch(m){o=!1,t.onRecordingChange(!1);const E=m instanceof Error?m:new Error(String(m));t.onError?.(E)}}}function l(){if(!o)return;o=!1,t.onRecordingChange(!1);const m=i,E=n;!m||m.state==="inactive"||(m.addEventListener("stop",()=>{const x=new Blob(s,{type:Qt});s=[],E?.getTracks().forEach(H=>H.stop()),t.onBlob(x)},{once:!0}),m.stop(),i=null,n=null)}function c(m){m.code==="Space"&&(a(m.target)||m.repeat||(m.preventDefault(),r()))}function g(m){m.code==="Space"&&(a(m.target)||l())}function p(m){m.preventDefault(),r()}function w(){l()}return window.addEventListener("keydown",c),window.addEventListener("keyup",g),e.addEventListener("mousedown",p),e.addEventListener("mouseup",w),e.addEventListener("mouseleave",w),e.addEventListener("touchstart",p,{passive:!1}),e.addEventListener("touchend",w),{destroy(){window.removeEventListener("keydown",c),window.removeEventListener("keyup",g),e.removeEventListener("mousedown",p),e.removeEventListener("mouseup",w),e.removeEventListener("mouseleave",w),e.removeEventListener("touchstart",p),e.removeEventListener("touchend",w)}}}const Zt="audio/webm;codecs=opus",Ii=512,Li=250,Oi=300,Hi=2e3,en={calibrationMs:1e3,noiseFloorFactor:3.5,minSpeechMs:150,hangoverMs:700,minUtteranceMs:400,maxSegmentMs:1e4};function zi(){return{phase:"calibrating",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:0,calibMs:0,calibSum:0,calibSamples:0}}function Fi(e,t,n,i=en){if(e.phase==="calibrating"){const l=e.calibMs+n,c=e.calibSum+t,g=e.calibSamples+1;return l>=i.calibrationMs?{state:{phase:"idle",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:g>0?c/g:0,calibMs:l,calibSum:c,calibSamples:g},event:null}:{state:{...e,calibMs:l,calibSum:c,calibSamples:g},event:null}}const s=e.noiseFloor*i.noiseFloorFactor,o=t>=s;if(e.phase==="idle"){if(!o)return e.phaseMs===0?{state:e,event:null}:{state:{...e,phaseMs:0},event:null};const l=e.phaseMs+n;return l>=i.minSpeechMs?{state:{...e,phase:"speaking",phaseMs:0,segmentMs:l,speechMs:l},event:{type:"segment-start"}}:{state:{...e,phaseMs:l},event:null}}const a=e.segmentMs+n;if(a>=i.maxSegmentMs)return{state:{...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},event:{type:"segment-end"}};if(o){const l=e.speechMs+n;return{state:{...e,phase:"speaking",phaseMs:0,segmentMs:a,speechMs:l},event:null}}const r=e.phaseMs+n;if(r>=i.hangoverMs){const l={...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0};return e.speechMs<i.minUtteranceMs?{state:l,event:{type:"segment-dropped"}}:{state:l,event:{type:"segment-end"}}}return{state:{...e,phaseMs:r,segmentMs:a},event:null}}function Vi(e){let t=0;for(let n=0;n<e.length;n++){const i=e[n]??0;t+=i*i}return Math.sqrt(t/e.length)}async function Wi(e,t=en){ot();const n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}});let i=!0,s=null,o=null;try{let a=function(){if(x!==null||m.length<=1)return;const M=performance.now()-Hi,S=m[0];if(S===void 0)return;const _=m.slice(1).filter(R=>R.tsMs>=M);m=[S,..._]},r=function(M){const S=x??M;x=null;const _=m.filter(T=>T.tsMs>=S&&T.tsMs<=M);if(_.length===0)return;const R=m[0],D=R!==void 0&&_[0]!==R?[R.blob,..._.map(T=>T.blob)]:_.map(T=>T.blob);e.onBlob(new Blob(D,{type:Zt}))},l=function(){if(!i)return;const M=performance.now(),S=M-H;if(H=M,e.isSuppressed()){x!==null&&(x=null,E={...E,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},e.onSegmentChange(!1)),a(),requestAnimationFrame(l);return}p.getFloatTimeDomainData(w);const _=Vi(w),{state:R,event:C}=Fi(E,_,S,t);E=R,C?.type==="segment-start"?(x=M-t.minSpeechMs-Oi,e.onSegmentChange(!0)):C?.type==="segment-end"?(r(M),e.onSegmentChange(!1)):C?.type==="segment-dropped"&&(x=null,e.onSegmentChange(!1)),a(),requestAnimationFrame(l)};const c=window.AudioContext??window.webkitAudioContext;s=new c;const g=s.createMediaStreamSource(n),p=s.createAnalyser();p.fftSize=Ii,g.connect(p);const w=new Float32Array(p.fftSize);o=new MediaRecorder(n,{mimeType:Zt});let m=[];o.addEventListener("dataavailable",M=>{M.data.size>0&&m.push({blob:M.data,tsMs:performance.now()})}),o.addEventListener("error",M=>{const S=M.error;e.onError?.(S instanceof Error?S:new Error("whisper mode: MediaRecorder error"))}),o.start(Li);let E=zi(),x=null,H=performance.now();requestAnimationFrame(l)}catch(a){throw i=!1,n.getTracks().forEach(r=>r.stop()),s?.close(),a instanceof Error?a:new Error(String(a))}return{stop(){i=!1,e.onSegmentChange(!1);const a=o;a&&a.state!=="inactive"&&a.stop(),n.getTracks().forEach(r=>r.stop()),s?.close()}}}const ji="https://api.openai.com/v1/audio/transcriptions";async function tn(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const s=await fetch(ji,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!s.ok){const r=await s.text();return{ok:!1,text:"",status:s.status,errorBody:r}}const o=await s.json();return{ok:!0,text:typeof o=="object"&&o!==null&&"text"in o&&typeof o.text=="string"?o.text:"",status:s.status,errorBody:""}}function Ki(e,t){return e.includes(t)}async function Bi(e,t,n=q.voice.sttModel,i=q.voice.sttFallbackModel){let s;try{s=await Fe(()=>tn(e,t,n))}catch(a){throw Ae(a)?new Error(De.network):a}if(s.ok)return s.text;if(s.status>=400&&s.status<500&&Ki(s.errorBody,n)){let a;try{a=await Fe(()=>tn(e,t,i))}catch(r){throw Ae(r)?new Error(De.network):r}if(a.ok)return a.text;throw new Error(Ve(`stt failed: ${n} then ${i}`,a.status,a.errorBody))}throw new Error(Ve(`stt failed: ${n}`,s.status,s.errorBody))}const $i=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears.",parameters:{type:"object",properties:{}}}}],Ui=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

STEERING — the helm tool. Negative = port (turn left); positive = starboard (turn right); 0 = amidships (straight).
- Fixed side words set the SIGN and override the wind. LEFT SIDE → NEGATIVE degrees: "left, port, to port, a-port, come to port, larboard" (so "turn left" and "hard a-port" are both negative). RIGHT SIDE → POSITIVE degrees: "right, starboard, to starboard, a-starboard, come to starboard" (so "turn right" and "hard a-starboard" are both positive). Whenever one of these words appears, use its sign no matter what the wind is doing.
- "straighten up / steady / steady as she goes / steady as you go / midships / amidships / rudder amidships / meet her / centre the rudder / centre (or center) the helm / helm amidships / ease her back to centre" → helm 0. These are helm orders even though "ease ... back to centre" contains the word "ease" — it is not a sail order unless a sail (main/jib/sheet) is named.
- Decide the SIGN first (port = negative, starboard = positive), then the magnitude: a small turn ("a little / a bit / a touch / a point") ≈ 10°, an ordinary turn ≈ 20°, a hard turn ("hard", "hard over", "hard a-port/a-starboard") ≈ 35°. If a number of degrees is named, use it (never beyond 35). "a point" only sets the size — it never changes the direction.
- Wind-relative orders: read apparentWindAngle from the state — a NEGATIVE value means the wind is on the PORT side, POSITIVE means the STARBOARD side. "Come up / luff / luff up / point higher / bring her up / harden up (helm) / helm a-lee / hard a-lee / ready about" mean turn TOWARD the wind: the helm takes the SAME sign as apparentWindAngle. "Bear away / bear off / fall off / fall away / run off / bear up to leeward" mean turn AWAY from the wind: the helm takes the OPPOSITE sign to apparentWindAngle. Use an ordinary turn unless told otherwise. Note: "helm a-lee", "hard a-lee" and "ready about" are the order to TACK — bring the bow UP through the wind (turn TOWARD the wind, same sign as apparentWindAngle); never steer to leeward for these.

SAILS — the trim_sail tool. trim 0 = fully eased/let out, 1 = hauled fully in.
- Choose the sail: "main / mainsail / main sheet" → main; "jib / headsail / jib sheet" → jib; "sails / the sails / all sail / all canvas / everything / trim the sails" → all.
- "Ease / ease away / ease off / let out / let go / start / slacken / spill wind" LOWER the trim by ~0.15 from the sail's CURRENT value (compute the absolute result from state — e.g. main at 0.5 becomes 0.35). "Haul in / haul / harden / harden up / tighten / sheet in / sheet home / trim in / take a pull / bring her in" RAISE the trim by ~0.15. "a touch / a bit / a little / a hair / slightly / some / more" still means ~0.15. "hard in / right in / all the way in" → toward 1; "let go / all the way out" → toward 0.

REPORTS — the report_status tool. ANY question or request about heading, course, speed, wind, position, or how she is doing ("report", "status", "how are we doing", "what's our heading", "what's the wind doing") MUST be answered by CALLING report_status. Never answer these in text yourself; always make the tool call.

CHATTER — only when the captain says something that is genuinely NOT an order and NOT a question about the ship (small talk, jokes, musings, personal requests) do you make NO tool call; reply in character in one short period sentence.

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function Gi(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,s=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof s!="number"||!Number.isFinite(s)||s<0||s>1?null:{action:"trim_sail",sail:i,trim:s}}case"report_status":return{action:"report_status"};case"fire_guns":return{action:"fire_guns"};default:return null}}const Yi="https://api.openai.com/v1/chat/completions";function qi(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const s=i,o=typeof s.content=="string"?s.content:null,a=[],r=s.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const c=l.function;if(typeof c!="object"||c===null)continue;const g=c,p=g.name,w=g.arguments;typeof p!="string"||typeof w!="string"||a.push({name:p,argumentsJson:w})}return{content:o,toolCalls:a}}function Ji(e){try{return JSON.parse(e)}catch{return null}}async function Xi(e,t,n,i=q.voice.intentModel){const s=t.getState(),o=`${Ui}

Current ship state:
${JSON.stringify(s)}`;let a;try{a=await Fe(()=>fetch(Yi,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:$i,messages:[{role:"system",content:o},{role:"user",content:e}]})}))}catch(m){throw Ae(m)?new Error(De.network):m}if(!a.ok){const m=await a.text();throw new Error(Ve("intent request failed",a.status,m))}const r=await a.json(),l=qi(r);if(l===null)throw new Error("intent request returned an unrecognizable response body");const c=l.toolCalls[0];if(c===void 0)return{crewLine:l.content??"",intent:null};const g=Ji(c.argumentsJson),p=Gi(c.name,g);return p===null?{crewLine:P("unknown_order",s),intent:null}:{crewLine:(await t.submit(p)).message,intent:p}}const Qi=.514444,ue=Math.PI/180,Zi=1,ea=512,ta=4;function je(e){return-e*ue}function na(e){const t=e*ue;return{x:Math.sin(t),z:-Math.cos(t)}}function Me(e,t){return{x:e.x*t,z:-e.y*t}}const lt=900,nn=18,ia=95,aa=260;function sa(e,t,n,i,s){const o=lt*(.7+Math.random()*.3),a=(Math.random()-.5)*2*aa;e.position.x=t+i.x*o+s.x*a,e.position.z=n+i.z*o+s.z*a,e.position.y=nn+Math.random()*(ia-nn)}function oa(e,t,n,i,s,o,a){if(e.length===0)return;const r=i+180,l=na(r),c={x:-l.x,z:-l.z},g={x:-l.z,z:l.x},p=s*Qi*o,w=je(r);for(const m of e){m.position.x+=l.x*p*a,m.position.z+=l.z*p*a,m.rotation.y=w;const E=m.position.x-t,x=m.position.z-n;E*E+x*x>lt*lt&&sa(m,t,n,c,g)}}const ra=1.4,la=6,ca=2;function da(e,t,n,i,s=q.visuals,o={}){const{camera:a=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:c,muzzleFlash:g=null,splash:p=null}=o;let w=null,m=0,E=0,x=0;const H=220;let M=null,S=null,_="follow";const R=a!==null?a.fov:null;function C(d){_=d,typeof window<"u"&&(window.__captainViewMode=d),a!==null&&d==="follow"&&R!==null&&(a.fov=R,a.updateProjectionMatrix())}function D(d,v,u){const{worldUnitsPerMetre:f,maxHeelDeg:k,maxBraceDeg:$,heelSmoothingHz:j,boatScale:F}=s,N=w===null?0:Math.min((d-w)/1e3,.5);w=d;const V=e.getState(),U=je(v.headingDeg);t.rotation.y=U,t.scale.x=F,t.scale.y=F,t.scale.z=F;const{x:pe,z:$e}=Me(v,f);if(t.position.x=pe,t.position.z=$e,n!==null){const K=k*Math.tanh(V.apparentWindKts**2*((V.mainTrim+V.jibTrim)/2)*Math.abs(Math.sin(V.apparentWindAngle*ue))/ea),ie=Math.sign(V.apparentWindAngle)*K*ue,I=N>0?1-Math.exp(-N*j):0,me=m+(ie-m)*I,ge=ta*ue*N,xe=Math.max(-ge,Math.min(ge,me-m));m+=xe,n.rotation.z=m}const Ue=i?i():null;if(Ue!==null){const K=(V.mainTrim+V.jibTrim)/2,ie=Math.sign(V.apparentWindAngle)*K*$*ue,I=N>0?1-Math.exp(-N*Zi):0;E+=(ie-E)*I,Ue.rotation.y=E}oa(l,pe,$e,V.windDirection,V.windSpeedKts,f,N);const Ge=r?r():null;if(Ge!==null){const K=je(V.apparentWindAngle+180),ie=N>0?1-Math.exp(-N*ca):0;let I=K-x;I=(I+Math.PI)%(2*Math.PI)-Math.PI,x+=I*ie;const me=la*ue*Math.sin(d/1e3*2*Math.PI*ra);Ge.rotation.y=x+me}if(a!==null&&_==="helm"){const{helmView:K}=s;a.position.x=K.x,a.position.y=K.y,a.position.z=K.z,a.rotation.x=K.pitchDeg*ue,a.rotation.y=0,a.rotation.z=0,a.fov!==K.fov&&(a.fov=K.fov,a.updateProjectionMatrix())}const Y=c?c():null;if(Y!==null)if(u!==null){const K=Me(u,f);Y.position.x=K.x,Y.position.z=K.z,Y.rotation.y=je(u.headingDeg),Y.scale.x=F,Y.scale.y=F,Y.scale.z=F,Y.visible=!0}else Y.visible=!1;M!==null&&d>=M&&(g!==null&&(g.visible=!1),M=null),S!==null&&d>=S&&(p!==null&&(p.visible=!1),S=null)}function T(){C(_==="follow"?"helm":"follow")}function O(d,v,u){g!==null&&(g.position.x=v,g.position.y=90,g.position.z=u,g.visible=!0,M=d+H)}function z(d,v,u){p!==null&&(p.position.x=v,p.position.y=8,p.position.z=u,p.visible=!0,S=d+H)}return{update:D,toggleView:T,getViewMode:()=>_,triggerMuzzleFlash:O,triggerSplash:z}}const ua=500;window.__captainDriverActive=!0;const y=ze();window.__captainAmbientRock=y.visuals.ambientRock;const te=new Jn({},y),an={current:null},ne=Pn(te,()=>an.current),G=y.battle.enabled?new Ti(y.battle,y.physics,y.controls,{...te.getPose(),windDirectionDeg:ne.getState().windDirection,windSpeedKts:ne.getState().windSpeedKts}):null;an.current=G;const ct=document.createElement("div");ct.id="hud-root",document.body.appendChild(ct);function sn(e){ti(e)}function on(e){Ot(e)}function ke(e){tt(e)}async function dt(e){const t=Ee();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");sn(e);const n=await Xi(e,ne,t,y.voice.intentModel);on(n.intent),ke(n.crewLine);try{await rt(n.crewLine,t,y.voice.ttsModel,y.voice.ttsVoice,y.voice.ttsVolume)}catch(i){const s=i instanceof Error?i.message:String(i);Ht(`⚠ Crew voice unavailable: ${s}`)}}const ha=ei(ct,ne,{injectTranscript:dt,setWhisperMode:e=>{e?cn():ba()},setTtsVoice:e=>{y.voice.ttsVoice=e},setTtsVolume:e=>{y.voice.ttsVolume=e},isPipelineBusy:()=>we});async function pa(e){const t=await ne.submit(e);if(ni(e,t.message),e.action==="fire_guns"&&G){const n=G.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss")){const i=performance.now(),s=te.getPose(),o=G.getView().npc,a=Me({x:s.x,y:s.y},y.visuals.worldUnitsPerMetre);he.triggerMuzzleFlash(i,a.x,a.z);const r=Me({x:o.x,y:o.y},y.visuals.worldUnitsPerMetre);he.triggerSplash(i,r.x,r.z)}}return t}const Te=document.getElementById("demo");let ut=!1;function ma(e){return new Promise(t=>setTimeout(t,e))}const ga=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function rn(){if(!ut){ut=!0,Te&&(Te.disabled=!0);try{for(const e of ga){sn(`[demo] ${e.label}`);const t=await ne.submit(e.intent);on(e.intent),ke(t.message);const n=Ee();n!==null&&n.length>0&&rt(t.message,n,y.voice.ttsModel,y.voice.ttsVoice,y.voice.ttsVolume).catch(()=>{}),await ma(e.waitMs)}}finally{ut=!1,Te&&(Te.disabled=!1)}}}Te&&Te.addEventListener("click",()=>{rn()});const ye=document.getElementById("ptt");let we=!1;async function ln(e){const t=Ee();if(t===null||t.length===0){ke("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await Bi(e,t,y.voice.sttModel,y.voice.sttFallbackModel);await dt(n)}catch(n){const i=n instanceof Error?n.message:String(n);ke(i)}}let ve=!1,ht=null,Pe=!1;function Ke(){ve?(ye.textContent=Pe?"Listening… (capturing)":"Listening…",ye.classList.toggle("recording",Pe),ye.classList.toggle("listening",!Pe)):(ye.textContent="Hold to Talk",ye.classList.remove("recording","listening"))}async function fa(e){we=!0;try{await ln(e)}finally{we=!1}}async function cn(){if(!ve)try{ht=await Wi({onBlob:e=>{fa(e)},onSegmentChange:e=>{Pe=e,Ke()},onError:e=>{ke(e.message)},isSuppressed:()=>we||Pi(ua)}),ve=!0,nt(!0),Ke()}catch(e){throw ve=!1,nt(!1),Ke(),e instanceof Error?e:new Error(String(e))}}function ba(){ve&&(ve=!1,Pe=!1,ht?.stop(),ht=null,nt(!1),Ke())}Ni(ye,{onRecordingChange:e=>{ye.classList.toggle("recording",e)},onBlob:e=>{we=!0,ln(e).finally(()=>{we=!1})},onError:e=>{ke(e.message)},canStart:()=>!we&&!ve}),Lt().then(()=>{ii(),y.voice.whisperMode&&cn().catch(()=>{y.voice.whisperMode=!1,Ht("Microphone unavailable — switched to push-to-talk. Enable Whisper again anytime in ⚙ command config.")})});const J=window.DEMO;if(J===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const he=da(ne,J.ms_GroupShip,J.ms_BlackPearlShip,()=>window.DEMO?.ms_Sails??null,y.visuals,{camera:J.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:J.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,muzzleFlash:J.ms_MuzzleFlash,splash:J.ms_Splash}),dn=10/12,ya=350,wa=1400,un=1.6,va=4.4,hn=.2,xa=.9;function Sa(e){const t=e*dn,n=9.81,i=.84,s=Math.max(t,.1),o=n*(i/s)**2,a=2*Math.PI/o,r=Math.min(wa,Math.max(ya,a*2)),l=Math.min(1,Math.max(0,e/40)),c=Math.sqrt(l),g=un+c*(va-un),p=hn+c*(xa-hn);return{size:r,choppiness:g,directionality:p}}function pn(e){return 1+Math.min(1,Math.max(0,e))*3}function pt(){te.setWind(y.environment.windDirectionDeg,y.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(y.environment.windDirectionDeg+180)*Math.PI/180,n=y.environment.windSpeedKts*dn;if(e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,y.visuals.seaStateFollowsWind){const i=Sa(y.environment.windSpeedKts);e.ms_Ocean.size=i.size,e.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=i.choppiness,e.ms_Ocean.directionality=pn(i.directionality)}e.ms_Ocean.changed=!0}function mn(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(be(y,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),be(y,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),be(y,"visuals.lighting.sunIntensity",e.sunIntensity),be(y,"visuals.lighting.ambientIntensity",e.ambientIntensity),be(y,"visuals.lighting.exposure",e.exposure),be(y,"visuals.lighting.fogDensity",e.fogDensity))}function Ea(){window.DEMO?.SetLightingParams(y.visuals.lighting)}!(window.location.hash.length>1)&&J.ms_Environment!==y.environment.skyPreset&&J.UpdateEnvironment(y.environment.skyPreset),mn(),pt(),J.ms_soundWaves&&(J.ms_soundWaves.volume=y.visuals.ambientSoundVolume);function Ma(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function ka(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Ta(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function _a(e,t){switch(be(y,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=pn(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&pt();break;case"visuals.waterColor":{const n=Ma(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":ka(t);break;case"visuals.streakOpacity":Ta(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":pt();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),mn();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Ea();break}}ai(_a);const Ne=document.getElementById("view-toggle");function gn(e){return e==="helm"?"Follow Cam":"Helm View"}function fn(){he.toggleView(),Ne&&(Ne.textContent=gn(he.getViewMode()))}Ne&&(Ne.textContent=gn(he.getViewMode()),Ne.addEventListener("click",()=>{fn()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}fn()});const Ie=document.createElement("div");Ie.id="battle-hit-flash",Ie.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(Ie);let Be=null;const Ca=180;function Ra(){Be!==null&&clearTimeout(Be),Ie.style.opacity="0.35",Be=setTimeout(()=>{Ie.style.opacity="0",Be=null},Ca)}const bn=15;let mt=null;function yn(e){if(mt!==null){const o=e-mt;if(te.tick(o),G){const a=te.getPose(),r=ne.getState(),l=G.tick(o,{...a,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(te.setDriveMultiplier(G.getSpeedMultiplier()),l.some(c=>c.key==="enemy_fires")){const c=G.getView().npc,g=Me({x:c.x,y:c.y},y.visuals.worldUnitsPerMetre);if(he.triggerMuzzleFlash(e,g.x,g.z),l.some(p=>p.key==="hit_taken"))Ra();else{const p=c.x-a.x,w=c.y-a.y,m=Math.hypot(p,w)||1,E={x:a.x+p/m*bn,y:a.y+w/m*bn},x=Me(E,y.visuals.worldUnitsPerMetre);he.triggerSplash(e,x.x,x.z)}}for(const c of l){const g=P(c.key,r,c);tt(g);const p=Ee();p!==null&&p.length>0&&rt(g,p,y.voice.ttsModel,y.voice.ttsVoice,y.voice.ttsVolume).catch(()=>{})}}}mt=e;const t=te.getPose(),n={x:t.x,y:t.y,headingDeg:ne.getState().heading},i=G?G.getView().npc:null,s=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;he.update(e,n,s),ha.update(),requestAnimationFrame(yn)}requestAnimationFrame(yn),window.__captain={bus:ne,submitIntent:pa,injectTranscript:dt,setWind:(e,t)=>{te.setWind(e,t)},demo:rn,getConfig:()=>y,copyConfig:()=>{const e=JSON.stringify(y,null,2);return console.log(e),e},setConfig:e=>{Ct(e),location.reload()},resetConfig:()=>{Rt(),location.reload()},getPlayerPose:()=>te.getPose(),get battle(){return G?G.getView():null}}})();
