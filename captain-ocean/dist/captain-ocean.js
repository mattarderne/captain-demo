(function(){"use strict";function yt(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function vt(e){return e.toFixed(1)}function K(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=yt(t.heading),o=vt(t.speedKts),s=yt(t.windDirection),a=vt(t.windSpeedKts);let r=`Steering ${i} at ${o} knots, wind ${s} at ${a}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const bn=-35,wn=35,yn=0,vn=1,xn=1;function Sn(e){return e==="main"||e==="jib"||e==="all"}function he(e,t){return{ok:!1,message:e,state:t}}function ve(e,t){return{ok:!0,message:e,state:t}}function En(e){function t(i){const o=i.action;if(o==="helm"){const s=i.degrees;if(typeof s!="number"||!Number.isFinite(s)||s<bn||s>wn)return Promise.resolve(he(K("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:s}).accepted)return Promise.resolve(he(K("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return r.speedKts<xn?Promise.resolve(ve(K("no_steerage_way",r),r)):s>0?Promise.resolve(ve(K("helm_ack_starboard",r),r)):s<0?Promise.resolve(ve(K("helm_ack_port",r),r)):Promise.resolve(ve(K("helm_ack_amidships",r),r))}if(o==="trim_sail"){const s=i.sail,a=i.trim;if(!Sn(s))return Promise.resolve(he(K("unknown_order",e.snapshot()),e.snapshot()));if(typeof a!="number"||!Number.isFinite(a)||a<yn||a>vn)return Promise.resolve(he(K("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:s,trim:a}).accepted)return Promise.resolve(he(K("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot(),d=s==="main"?"trim_ack_main":s==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(ve(K(d,l),l))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(he(K("unknown_order",e.snapshot()),e.snapshot()));const a=e.snapshot();return Promise.resolve(ve(K("status",a),a))}return Promise.resolve(he(K("unknown_order",e.snapshot()),e.snapshot()))}function n(){return e.snapshot()}return{submit:t,getState:n}}const Je=1.94384,ee=180/Math.PI,F=Math.PI/180;function xt(e){return e*Je}function Xe(e){return e/Je}function me(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function $(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function te(e,t,n){return e<t?t:e>n?n:e}const Mn=0,kn=12;function St(e={}){return{x:0,y:0,psi:$((e.heading??0)*F),u:Xe(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*F,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:$((e.windDirection??Mn)*F),windSpeedMs:Xe(e.windSpeedKts??kn)}}const Te=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Tn=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Cn=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function _n(e,t,n){return e+(t-e)*n}function Et(e,t){const n=te(t,0,180);let i=0;for(;i<Te.length-1&&Te[i+1]<=n;)i++;const o=Math.min(i+1,Te.length-1),s=Te[i],a=Te[o],r=a===s?0:(n-s)/(a-s);return _n(e[i],e[o],r)}function Rn(e){return{cl:Et(Tn,e),cd:Et(Cn,e)}}function Dn(e){const t=te(Math.abs(e),0,180),{cl:n,cd:i}=Rn(t),o=t*F,s=Math.sin(o),a=Math.cos(o),r=n*s-i*a,l=Math.abs(n*a+i*s);return{cDrive:r,cSide:l}}const Mt=.95,An=.2;function kt(e){const t=te(Math.abs(e),0,180)/180;return te(Mt-(Mt-An)*t*t,.15,1)}const Nn=.65;function Pn(e,t){const n=(e-kt(t))/Nn;return Math.max(0,1-n*n)}const Y={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx",whisperMode:!0,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:64,streakOpacity:.35,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25}},xe="captain.config";function oe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function In(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Tt(e,t,n,i){for(const o of Object.keys(t)){const s=t[o];if(!(o in e)){i.push(`${n}${o} (unknown key)`);continue}const a=e[o];oe(a)&&oe(s)?Tt(a,s,`${n}${o}.`,i):oe(a)||oe(s)||typeof a!=typeof s?i.push(`${n}${o} (expected ${typeof a}, got ${typeof s})`):e[o]=s}}function Ct(e,t){const n={...e};for(const i of Object.keys(t)){const o=t[i],s=n[i];n[i]=oe(s)&&oe(o)?Ct(s,o):o}return n}function Oe(){return typeof localStorage<"u"}function Ln(){if(!Oe())return{};const e=localStorage.getItem(xe);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return oe(t)?t:{}}catch{return{}}}function He(){const e=In(Y);if(!Oe())return e;const t=localStorage.getItem(xe);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${xe}"] is not valid JSON — ignoring it, using defaults.`),e}if(!oe(n))return console.warn(`captain.config: stored value in localStorage["${xe}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Tt(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function _t(e){if(!Oe())return;const t=Ln(),n=Ct(t,e);localStorage.setItem(xe,JSON.stringify(n))}function Rt(){Oe()&&localStorage.removeItem(xe)}function ge(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let s=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0||(s=s?.[r],s==null))return}s!=null&&(s[o]=n)}const On=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"voice.whisperMode",label:"Whisper mode (hands-free) by default",section:"Voice",type:"boolean",live:!1,note:"Live toggle lives in the ⚙ command-config popover next to the quarterdeck log; this only sets next boot's default."},{path:"voice.ttsVolume",label:"Crew voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"Applied to the crew's spoken replies. See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, the three 'manual' sliders above are overwritten from wind speed every time wind changes."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:64,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],Hn=Y.controls.rudderMaxDeg*F,zn=Y.physics;function Qe(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),a=-e.windSpeedMs*Math.cos(e.windFromRad),r=s-i,l=a-o,d=Math.hypot(r,l),g=r*t+l*n,c=r*n-l*t;return{awaDeg:Math.atan2(-c,-g)*ee,awsMs:d}}function Dt(e,t,n,i,o){const s=Math.abs(n),{cDrive:a,cSide:r}=Dn(s),l=Pn(t,s),d=.5*o*i*i,g=d*e*a*l,c=d*e*r*l,y=-Math.sign(n||1)*c;return{surge:g,sway:y}}function At(e,t,n=zn,i=Hn,o=1){const{awaDeg:s,awsMs:a}=Qe(e),r=Dt(n.areaMain,e.mainTrim,s,a,n.rhoAir),l=Dt(n.areaJib,e.jibTrim,s,a,n.rhoAir),d=(r.surge+l.surge)*o,g=(r.sway+l.sway)*o,c=e.u,y=e.v,m=e.r,E=c>=0?n.kSurgeLin:n.kSurgeLinAstern,x=-n.kSurgeQuad*c*Math.abs(c)-E*c,O=-n.kSwayQuad*y*Math.abs(y)-n.kSwayLin*y,M=te(e.rudder,-i,i),S=n.cRudder*M*c*Math.abs(c),C=-(n.kYawDamp+n.kYawDampU*Math.abs(c))*m,R=n.cWeather*Math.sin(s*F)*a*Math.min(1,Math.abs(c)),_=S+C+R,D=(d+x)/n.mass+y*m,T=(g+O)/n.mass-c*m,L=_/n.izz;e.u=c+D*t,e.v=y+T*t,e.r=m+L*t;const H=Math.sin(e.psi),u=Math.cos(e.psi),v=e.u*H+e.v*u,p=e.u*u-e.v*H;e.x+=v*t,e.y+=p*t,e.psi=$(e.psi+e.r*t)}function Nt(e){return Math.hypot(e.u,e.v)*Je}function Vn(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t;return $(Math.atan2(i,o))}function Fn(e){return Nt(e)<.2?0:me(e.psi-Vn(e))*ee}const Ce=.05,Pt=Ce*1e3;function Ze(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Wn{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=Y){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*F,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*F,this.state=St({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=te(t.degrees*F,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=te(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Pt;)this.state.rudder=Ze(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*Ce),this.state.mainTrim=Ze(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Ce),this.state.jibTrim=Ze(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Ce),At(this.state,Ce,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=Pt}snapshot(){const{awaDeg:t,awsMs:n}=Qe(this.state),i=Nt(this.state);return{heading:this.state.psi*ee%360,speedKts:i,windDirection:this.state.windFromRad*ee%360,windSpeedKts:xt(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:xt(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*ee,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:Fn(this.state)}}setWind(t,n){this.state.windFromRad=$(t*F),this.state.windSpeedMs=Xe(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const et="captain.openai_key",jn="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function Se(){return window.localStorage.getItem(et)}function It(e){window.localStorage.setItem(et,e)}function Kn(){window.localStorage.removeItem(et)}function Lt(e=document.body){const t=Se();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const o=document.createElement("div");o.style.background="#0e1f2e",o.style.color="#e8f4ff",o.style.padding="20px 24px",o.style.borderRadius="6px",o.style.maxWidth="360px",o.style.display="flex",o.style.flexDirection="column",o.style.gap="10px";const s=document.createElement("div");s.textContent="OpenAI API key",s.style.fontSize="15px",s.style.fontWeight="bold";const a=document.createElement("p");a.id="byok-copy",a.textContent=jn,a.style.margin="0",a.style.fontSize="12px",a.style.opacity="0.85";const r=document.createElement("input");r.id="byok-key-input",r.type="password",r.placeholder="sk-...",r.autocomplete="off",r.style.fontFamily="inherit",r.style.fontSize="13px",r.style.padding="6px 8px";const l=document.createElement("button");l.id="byok-save",l.type="button",l.textContent="Save",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 10px",l.style.cursor="pointer";function d(){const g=r.value.trim();g.length!==0&&(It(g),i.remove(),n(g))}l.addEventListener("click",d),r.addEventListener("keydown",g=>{g.key==="Enter"&&d()}),o.appendChild(s),o.appendChild(a),o.appendChild(r),o.appendChild(l),i.appendChild(o),e.appendChild(i),r.focus()})}const Bn=["alloy","ash","ballad","coral","echo","fable","nova","onyx","sage","shimmer","verse"];function $n(e,t,n){e.innerHTML="",ii();const i=document.createElement("div");i.id="hud",e.appendChild(i);const o=document.createElement("div");o.className="hud-panel hud-state",i.appendChild(o);const s=document.createElement("div");s.className="hud-panel-title",s.textContent="Ship State",o.appendChild(s);function a(h,b,A=!1){const I=document.createElement("div");I.id=h,I.className="hud-row";const ie=document.createElement("span");ie.className="hud-row-label",ie.textContent=b,I.appendChild(ie);const pe=document.createElement("span");pe.className="hud-row-colon",pe.textContent=": ",I.appendChild(pe);const ae=document.createElement("span");ae.className="hud-row-value",ae.textContent="--",I.appendChild(ae);let J=null;if(A){const X=document.createElement("div");X.className="hud-bar",J=document.createElement("div"),J.className="hud-bar-fill",X.appendChild(J),I.appendChild(X)}return o.appendChild(I),{setValue:X=>{ae.textContent=X},setFill:J?X=>{J&&(J.style.width=`${Math.max(0,Math.min(100,X))}%`)}:void 0}}const r=a("hud-heading","heading"),l=a("hud-speed","speed"),d=a("hud-wind","wind"),g=a("hud-awa","awa"),c=a("hud-main","main",!0),y=a("hud-jib","jib",!0),m=a("hud-rudder","rudder"),E="http://www.w3.org/2000/svg";function x(h,b){const A=document.createElementNS(E,h);for(const[I,ie]of Object.entries(b))A.setAttribute(I,ie);return A}const O=document.getElementById("hud-wind"),M=document.createElement("div");M.id="hud-windvane",M.className="hud-windvane";const S=x("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});S.appendChild(x("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),S.appendChild(x("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const C=x("g",{class:"hud-windvane-arrow"});C.appendChild(x("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),C.appendChild(x("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),S.appendChild(C),S.appendChild(x("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),M.appendChild(S),O.appendChild(M);const R=document.getElementById("hud-rudder"),_=document.createElement("div");_.className="hud-gauge";const D=document.createElement("div");D.className="hud-gauge-center-tick",_.appendChild(D);const T=document.createElement("div");T.className="hud-gauge-target",_.appendChild(T);const L=document.createElement("div");L.className="hud-gauge-needle",_.appendChild(L),R.appendChild(_);let H=null;function u(h){return(Math.max(-35,Math.min(35,h))+35)/70*100}function v(h){const b=u(h);L.style.left=`${b}%`,L.classList.toggle("port",h<-.5),L.classList.toggle("stbd",h>.5),H!==null&&Math.abs(h-H)>.5?(T.style.left=`${u(H)}%`,T.style.display="block"):T.style.display="none"}const p=document.createElement("div");p.id="hud-irons",p.className="hud-irons-row";const f=document.createElement("span");f.className="hud-visually-hidden",f.textContent="irons: false",p.appendChild(f),o.appendChild(p);const k=document.createElement("div");k.className="hud-panel hud-log",i.appendChild(k);const B=document.createElement("div");B.className="hud-log-header",k.appendChild(B);const W=document.createElement("div");W.className="hud-panel-title hud-log-title-text",W.textContent="Quarterdeck Log",B.appendChild(W);const z=document.createElement("button");z.id="command-config-toggle",z.type="button",z.title="Voice & key settings",z.setAttribute("aria-label","Command config"),z.textContent="⚙",z.className="hud-btn hud-command-config-toggle",B.appendChild(z);const N=document.createElement("div");N.id="hud-log-list",N.className="hud-log-list",k.appendChild(N);const V=6,U=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function ce(){N.innerHTML="";let h=-1;U.forEach((b,A)=>{b.kind==="exchange"&&(h=A)}),U.forEach((b,A)=>{const I=document.createElement("div");if(I.style.opacity=String(.45+.55*((A+1)/U.length)),b.kind==="system"){I.className="hud-log-entry hud-log-system-entry";const X=document.createElement("div");X.className="hud-log-system",X.textContent=`⚠ ${b.transcript}`,I.appendChild(X),N.appendChild(I);return}const ie=A===h;I.className="hud-log-entry";const pe=document.createElement("div");pe.className="hud-log-you",ie&&(pe.id="hud-transcript"),pe.textContent=`You: ${b.transcript}`,I.appendChild(pe);const ae=document.createElement("div");ae.className="hud-log-order",ie&&(ae.id="hud-intent"),ae.textContent=b.order,I.appendChild(ae);const J=document.createElement("div");J.className="hud-log-crew",ie&&(J.id="hud-crew"),J.textContent=`Crew: ${b.crew}`,I.appendChild(J),N.appendChild(I)}),N.scrollTop=N.scrollHeight}ce();function $e(h){if(h===null)return"→ no order";if(h.action==="helm"){const b=Math.round(h.degrees),A=b<0?"port":b>0?"stbd":"amidships";return`→ helm ${b}° (${A})`}return h.action==="trim_sail"?`→ trim ${h.sail} → ${h.trim.toFixed(2)}`:"→ status report"}function Ue(h){U.push({kind:"exchange",transcript:h,order:"→ …",crew:"…"}),U.length>V&&U.shift(),ce()}function Ge(h){const b=[...U].reverse().find(A=>A.kind==="exchange");b&&(b.order=$e(h)),h!==null&&h.action==="helm"&&(H=h.degrees),ce()}function G(h){const b=[...U].reverse().find(A=>A.kind==="exchange");b&&(b.crew=h),ce()}function j(h){U.push({kind:"system",transcript:h,order:"",crew:""}),U.length>V&&U.shift(),ce()}const Z=document.createElement("div");Z.className="hud-controls",k.insertBefore(Z,N);const P=document.createElement("input");P.id="transcript-input",P.type="text",P.placeholder="Speak or type your orders…",P.className="hud-input",Z.appendChild(P);const de=document.createElement("div");de.className="hud-button-row",Z.appendChild(de);const ue=document.createElement("button");ue.id="ptt",ue.type="button",ue.textContent="Hold to Talk",ue.className="hud-btn hud-btn-ptt",de.appendChild(ue);const ye=document.createElement("button");ye.id="view-toggle",ye.type="button",ye.textContent="Helm View",ye.className="hud-btn hud-btn-view-toggle",de.appendChild(ye);function Ie(){P.focus()}const gt=He().input,dn=2;let Le=null;function ft(){Le!==null&&(clearTimeout(Le),Le=null)}let bt=!1,Ye=null;async function wt(h){if(bt||(n.isPipelineBusy?.()??!1)){Ye=h;return}bt=!0,ft();try{await n.injectTranscript(h),P.value=""}catch(b){const A=b instanceof Error?b.message:String(b);G(A)}finally{if(bt=!1,Ie(),Ye!==null){const b=Ye;Ye=null,wt(b)}}}function un(h){if(!gt.autoSubmit)return;const b=h.trim();b.length<dn||wt(b)}P.addEventListener("input",h=>{if(ft(),!gt.autoSubmit)return;if(h.inputType==="insertFromPaste"){un(P.value);return}P.value.trim().length<dn||(Le=setTimeout(()=>{Le=null,un(P.value)},gt.autoSubmitDelayMs))}),P.addEventListener("keydown",h=>{if(h.key!=="Enter")return;ft();const b=P.value.trim();b.length!==0&&wt(b)}),document.addEventListener("click",h=>{h.target instanceof HTMLCanvasElement&&Ie()}),ei(i,Ie);const Ta=ni(k,z,n,Ie);function qe(h){return h.toFixed(1)}function pn(h){return h.toFixed(2)}const Ca=["N","NE","E","SE","S","SW","W","NW"];function hn(h){return(h%360+360)%360}function mn(h){const b=Math.round(hn(h)/45)%8;return Ca[b]??"N"}function gn(h){return String(Math.round(hn(h))%360).padStart(3,"0")}function _a(h){return`${gn(h)} ${mn(h)}`}function Ra(h,b){return`from ${gn(h)} @ ${qe(b)} kts (${mn(h)})`}function Da(h,b){const A=Math.round(h);if(A===0)return`dead ahead @ ${qe(b)} kts`;const I=A<0?"port":"starboard";return`${Math.abs(A)}° to ${I} @ ${qe(b)} kts`}function Aa(h){const b=Math.round(h),A=b<0?"port":b>0?"stbd":"amidships";return`${b}° ${A}`}function Na(h){r.setValue(_a(h.heading)),l.setValue(`${qe(h.speedKts)} kts`),d.setValue(Ra(h.windDirection,h.windSpeedKts)),C&&C.setAttribute("transform",`rotate(${h.windDirection-h.heading} 20 20)`),g.setValue(Da(h.apparentWindAngle,h.apparentWindKts)),c.setValue(pn(h.mainTrim)),c.setFill?.(h.mainTrim*100),y.setValue(pn(h.jibTrim)),y.setFill?.(h.jibTrim*100),m.setValue(Aa(h.rudderAngle)),v(h.rudderAngle),f.textContent=`irons: ${h.inIrons}`,p.classList.toggle("active",h.inIrons)}function fn(){Na(t.getState())}return fn(),_e={logTranscript:Ue,logIntent:Ge,logCrewLine:G,logSystemNote:j},zt={setVoiceModeChecked:Ta.setWhisperModeChecked},Vt={focus:Ie},{update:fn}}let _e=null;function Un(e){_e?.logTranscript(e)}function Ot(e){_e?.logIntent(e)}function tt(e){_e?.logCrewLine(e)}function Ht(e){_e?.logSystemNote(e)}function Gn(e,t){Ot(e),tt(t)}let zt=null;function nt(e){zt?.setVoiceModeChecked(e)}let Vt=null;function Yn(){Vt?.focus()}let Ft=[];function qn(e){Ft.push(e)}function Jn(e,t){for(const n of Ft)n(e,t)}function Xn(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function Qn(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function Zn(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let s=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0)return;const l=s[r];(typeof l!="object"||l===null)&&(s[r]={}),s=s[r]}s[o]=n}function Wt(e,t){const n={...e};for(const i of Object.keys(t)){const o=e[i],s=t[i];o!==null&&typeof o=="object"&&!Array.isArray(o)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=Wt(o,s):n[i]=s}return n}function ei(e,t){const n=He(),i={};let o=!1;const s=new Map,a=document.createElement("button");a.id="settings-toggle",a.type="button",a.title="Settings (S)",a.setAttribute("aria-label","Settings"),a.textContent="⚙",a.className="hud-btn hud-settings-toggle",e.appendChild(a);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);function g(){d.hidden=!o}function c(u,v){if(Zn(i,u.path,v),u.live)Jn(u.path,v);else{const p=s.get(u.path);p&&(p.hidden=!1),o=!0,g()}}function y(u,v){const p=document.createElement("div");p.className="hud-settings-control-row";const f=document.createElement("input");f.type="range",f.min=String(u.min??0),f.max=String(u.max??100),f.step=String(u.step??1),f.value=String(v),f.className="hud-settings-range";const k=document.createElement("input");k.type="number",k.min=f.min,k.max=f.max,k.step=f.step,k.value=String(v),k.className="hud-settings-numeric";const B=u.min??-1/0,W=u.max??1/0;function z(N){if(!Number.isFinite(N))return;const V=Math.min(W,Math.max(B,N));f.value=String(V),k.value=String(V),c(u,V)}return f.addEventListener("input",()=>z(Number(f.value))),k.addEventListener("input",()=>z(Number(k.value))),p.appendChild(f),p.appendChild(k),p}function m(u,v){const p=document.createElement("label");p.className="hud-settings-checkbox-label";const f=document.createElement("input");return f.type="checkbox",f.checked=v,f.addEventListener("change",()=>c(u,f.checked)),p.appendChild(f),p}function E(u,v){const p=document.createElement("select");p.className="hud-settings-select";for(const f of u.options??[]){const k=document.createElement("option");k.value=f,k.textContent=f,f===v&&(k.selected=!0),p.appendChild(k)}return p.addEventListener("change",()=>c(u,p.value)),p}function x(u,v){const p=document.createElement("input");return p.type="color",p.className="hud-settings-color",p.value=v,p.addEventListener("input",()=>c(u,p.value)),p}function O(u,v){const p=document.createElement("input");return p.type="text",p.className="hud-settings-text",p.value=v,p.addEventListener("change",()=>c(u,p.value)),p}function M(u){const v=document.createElement("div");v.className="hud-settings-field",v.dataset.configPath=u.path;const p=document.createElement("div");p.className="hud-settings-label-row";const f=document.createElement("span");if(f.className="hud-settings-label",f.textContent=u.label,p.appendChild(f),!u.live){const W=document.createElement("span");W.className="hud-settings-reload-dot",W.title="Staged — needs Save & Reload",W.hidden=!0,p.appendChild(W),s.set(u.path,W)}v.appendChild(p);const k=Qn(n,u.path);let B;switch(u.type){case"number":B=y(u,k);break;case"boolean":B=m(u,k);break;case"select":B=E(u,k);break;case"color":B=x(u,k);break;default:B=O(u,k);break}if(v.appendChild(B),u.note){const W=document.createElement("div");W.className="hud-settings-note",W.textContent=u.note,v.appendChild(W)}return v}const S=new Map;for(const u of On)S.has(u.section)||S.set(u.section,[]),S.get(u.section)?.push(u);const C=new Set(["Visuals","Environment","Lighting"]);for(const[u,v]of S){const p=document.createElement("details");p.className="hud-settings-section",p.open=C.has(u);const f=document.createElement("summary");f.textContent=u,p.appendChild(f);for(const k of v)p.appendChild(M(k));r.appendChild(p)}const R=document.createElement("div");R.className="hud-settings-footer";const _=document.createElement("button");_.id="settings-save-reload",_.type="button",_.textContent="Save & Reload",_.className="hud-btn",_.addEventListener("click",()=>{_t(i),location.reload()});const D=document.createElement("button");D.id="settings-copy-json",D.type="button",D.textContent="Copy JSON",D.className="hud-btn",D.addEventListener("click",()=>{(async()=>{const u=Wt(n,i),v=JSON.stringify(u,null,2);console.log(v);try{await navigator.clipboard?.writeText(v)}catch{}})()});const T=document.createElement("button");T.id="settings-reset-all",T.type="button",T.textContent="Reset All",T.className="hud-btn",T.addEventListener("click",()=>{Rt(),location.reload()}),R.appendChild(_),R.appendChild(D),R.appendChild(T),r.appendChild(R);let L=!1;function H(u){L=u,r.classList.toggle("open",u),a.classList.toggle("active",u),u||t()}a.addEventListener("click",()=>H(!L)),document.addEventListener("keydown",u=>{u.key!=="s"&&u.key!=="S"||Xn(document.activeElement)||H(!L)})}function ti(e){return e.length<=4?"•".repeat(e.length):`sk-…${e.slice(-4)}`}function ni(e,t,n,i){const o=He(),s=document.createElement("div");s.id="command-config",s.className="hud-panel hud-command-config",e.appendChild(s);function a(p){const f=document.createElement("div");return f.className="hud-command-config-section-title",f.textContent=p,f}s.appendChild(a("Voice Mode"));const r=document.createElement("div");r.className="hud-segmented";const l=document.createElement("label");l.className="hud-segmented-option";const d=document.createElement("input");d.type="radio",d.name="voice-mode",d.id="voice-mode-ptt",l.appendChild(d),l.appendChild(document.createTextNode("Push to talk"));const g=document.createElement("label");g.className="hud-segmented-option";const c=document.createElement("input");c.type="radio",c.name="voice-mode",c.id="voice-mode-whisper",g.appendChild(c),g.appendChild(document.createTextNode("Whisper (hands-free)")),c.checked=o.voice.whisperMode,d.checked=!o.voice.whisperMode,d.addEventListener("change",()=>{d.checked&&n.setWhisperMode(!1)}),c.addEventListener("change",()=>{c.checked&&n.setWhisperMode(!0)}),r.appendChild(l),r.appendChild(g),s.appendChild(r),s.appendChild(a("Crew Voice"));const y=document.createElement("div");y.className="hud-command-config-row";const m=document.createElement("label");m.className="hud-toggle-label";const E=document.createElement("input");E.id="tts-enabled",E.type="checkbox",E.checked=!0,m.appendChild(E),m.appendChild(document.createTextNode("Speak crew replies")),y.appendChild(m);const x=document.createElement("select");x.id="tts-voice-select",x.className="hud-settings-select hud-command-config-voice-select";for(const p of Bn){const f=document.createElement("option");f.value=p,f.textContent=p,p===o.voice.ttsVoice&&(f.selected=!0),x.appendChild(f)}x.addEventListener("change",()=>n.setTtsVoice(x.value)),y.appendChild(x),s.appendChild(y);const O=document.createElement("div");O.className="hud-command-config-row";const M=document.createElement("span");M.className="hud-command-config-volume-label",M.textContent="Volume",O.appendChild(M);const S=document.createElement("input");S.id="tts-volume",S.type="range",S.min="0",S.max="1",S.step="0.05",S.value=String(o.voice.ttsVolume),S.className="hud-settings-range",S.addEventListener("input",()=>n.setTtsVolume(Number(S.value))),O.appendChild(S),s.appendChild(O),s.appendChild(a("OpenAI Key"));const C=document.createElement("div");C.id="key-masked",C.className="hud-key-masked";function R(){const p=Se();C.textContent=p!==null&&p.length>0?ti(p):"(no key stored)"}R(),s.appendChild(C);const _=document.createElement("div");_.className="hud-command-config-row";const D=document.createElement("input");D.id="key-input",D.type="password",D.placeholder="sk-...",D.autocomplete="off",D.className="hud-settings-text",_.appendChild(D);const T=document.createElement("button");T.id="key-save",T.type="button",T.textContent="Save",T.className="hud-btn",T.addEventListener("click",()=>{const p=D.value.trim();p.length!==0&&(It(p),D.value="",R())}),_.appendChild(T);const L=document.createElement("button");L.id="key-clear",L.type="button",L.textContent="Clear",L.className="hud-btn",L.addEventListener("click",()=>{Kn(),R(),v(!1),Lt().then(()=>{R(),i()})}),_.appendChild(L),s.appendChild(_),s.appendChild(a("Actions"));const H=document.createElement("button");H.id="demo",H.type="button",H.textContent="Run Demo",H.className="hud-btn hud-btn-demo hud-command-config-demo",s.appendChild(H);let u=!1;function v(p){u=p,s.classList.toggle("open",u),t.classList.toggle("active",u),u?R():i()}return t.addEventListener("click",()=>v(!u)),document.addEventListener("mousedown",p=>{if(!u)return;const f=p.target;s.contains(f)||t.contains(f)||v(!1)}),document.addEventListener("keydown",p=>{p.key==="Escape"&&u&&v(!1)}),{setWhisperModeChecked:p=>{c.checked=p,d.checked=!p}}}function ii(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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
`,document.head.appendChild(e)}const it=.05,jt=it*1e3,ai=35,oi=40,at=50,Kt=15,si=8;function ot(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class ri{state;behavior="APPROACH";tackSide=null;tackHoldS=0;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=St({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*F,this.rudderRateRadPerS=t.rudderSlewDegPerS*F,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=$(t*F),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}planHeading(t){const n=t.x-this.state.x,i=t.y-this.state.y,o=Math.hypot(n,i),s=$(Math.atan2(n,i));o>this.engageRangeM*1.15?this.behavior="APPROACH":o<this.engageRangeM*.85&&(this.behavior="ENGAGE");let a;if(this.behavior==="APPROACH")a=s;else{const d=(o>this.engageRangeM?1:-1)*15*F;a=$(t.headingRad+d)}const r=me(this.state.windFromRad-a)*ee;if(this.tackSide!==null){this.tackHoldS-=it;const l=Math.abs(r)>=oi;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=si){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=Kt)}}}else if(Math.abs(r)<ai){const l=$(this.state.windFromRad-at*F),d=$(this.state.windFromRad+at*F),g=Math.abs(me(l-this.state.psi)),c=Math.abs(me(d-this.state.psi));this.tackSide=g<=c?1:-1,this.tackHoldS=Kt}return this.tackSide!==null?$(this.state.windFromRad-this.tackSide*at*F):a}step(t,n){const i=this.planHeading(n),o=me(i-this.state.psi);this.rudderTargetRad=te(this.headingKp*o-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:s}=Qe(this.state),a=kt(Math.abs(s));this.mainTrimTarget=a,this.jibTrimTarget=a,this.state.rudder=ot(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=ot(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=ot(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),At(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=jt;)this.step(it,n),this.accMs-=jt}headingDeg(){return this.state.psi*ee%360}}const li=30;function ci(){return{reloadRemainingS:0}}function di(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function ui(e,t,n,i,o,s){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t);const a=n<=o.cannonRangeM,r=i<=li,l=e.reloadRemainingS<=0;return!a||!r||!l?{fired:!1,hit:!1}:(e.reloadRemainingS=o.reloadS,{fired:!0,hit:s()<di(n,o.cannonRangeM)})}const pi=10,hi=5,mi=.8,gi=.5;function fi(){return{hullHp:pi}}function bi(e){e.hullHp=Math.max(0,e.hullHp-1)}function wi(e){return e.hullHp<=0?gi:e.hullHp<=hi?mi:1}function yi(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const vi=35;function xi(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class Si{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;constructor(t,n,i,o){this.cfg=t,this.rng=yi(t.seed);const s=te(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*s);const a=1.2+.6*s,r=this.rng()*2*Math.PI,l=o.x+t.spawnRangeM*Math.sin(r),d=o.y+t.spawnRangeM*Math.cos(r),g=$(r+Math.PI);this.npc=new ri({x:l,y:d,heading:g*ee,windDirection:o.windDirectionDeg,windSpeedKts:o.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||vi,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:a,phys:n}),this.damage=fi(),this.cannon=ci()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});const o=n.x-this.npc.x,s=n.y-this.npc.y,a=Math.hypot(o,s);if(!this.everSpotted&&a<=this.cfg.spawnRangeM){this.everSpotted=!0;const c=$(Math.atan2(-o,-s)),m=me(c-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:m})}!this.everClosing&&a<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"}));const r=$(Math.atan2(o,s)),l=me(r-this.npc.state.psi)*ee,d=Math.min(Math.abs(l-90),Math.abs(l+90)),g=ui(this.cannon,t/1e3,a,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);if(g.fired&&(i.push({key:"enemy_fires"}),g.hit&&(bi(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp}))),i.length>0){const c=i[i.length-1];c&&(this.lastEvent=c.key)}return i}getSpeedMultiplier(){return wi(this.damage)}getHullHp(){return this.damage.hullHp}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:xi(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent}}}const Re={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function Ei(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function De(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Mi=1500;async function ze(e){try{return await e()}catch(t){if(!De(t))throw t;return await new Promise(n=>setTimeout(n,Mi)),e()}}function Ve(e,t,n){const i=Ei(t);return i?Re[i]:`${e} (${t}): ${n}`}const ki="https://api.openai.com/v1/audio/speech",Ti="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let se=null,Fe=null;function Ci(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function _i(e){return se!==null?!0:Fe===null?!1:performance.now()-Fe<e}function st(){se!==null&&(se.pause(),se.src="",se=null,Fe=performance.now())}async function rt(e,t,n=Y.voice.ttsModel,i=Y.voice.ttsVoice,o=Y.voice.ttsVolume){if(e.trim().length===0||!Ci())return;st();let s;try{s=await ze(()=>fetch(ki,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:Ti})}))}catch(c){throw De(c)?new Error(Re.network):c}if(!s.ok){const c=await s.text();throw new Error(Ve("tts request failed",s.status,c))}const a=await s.arrayBuffer(),r=new Blob([a],{type:"audio/mpeg"}),l=URL.createObjectURL(r),d=new Audio(l);d.volume=Math.max(0,Math.min(1,o)),se=d;const g=()=>{URL.revokeObjectURL(l),se===d&&(se=null,Fe=performance.now())};d.addEventListener("ended",g,{once:!0}),d.addEventListener("error",g,{once:!0}),await d.play()}const Bt="audio/webm;codecs=opus";function Ri(e,t){let n=null,i=null,o=[],s=!1;function a(m){if(!(m instanceof HTMLElement))return!1;const E=m.tagName;return E==="INPUT"||E==="SELECT"||E==="TEXTAREA"||m.isContentEditable}async function r(){if(!s&&!(t.canStart&&!t.canStart())){s=!0,st(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),o=[],i=new MediaRecorder(n,{mimeType:Bt}),i.addEventListener("dataavailable",m=>{m.data.size>0&&o.push(m.data)}),i.start()}catch(m){s=!1,t.onRecordingChange(!1);const E=m instanceof Error?m:new Error(String(m));t.onError?.(E)}}}function l(){if(!s)return;s=!1,t.onRecordingChange(!1);const m=i,E=n;!m||m.state==="inactive"||(m.addEventListener("stop",()=>{const x=new Blob(o,{type:Bt});o=[],E?.getTracks().forEach(O=>O.stop()),t.onBlob(x)},{once:!0}),m.stop(),i=null,n=null)}function d(m){m.code==="Space"&&(a(m.target)||m.repeat||(m.preventDefault(),r()))}function g(m){m.code==="Space"&&(a(m.target)||l())}function c(m){m.preventDefault(),r()}function y(){l()}return window.addEventListener("keydown",d),window.addEventListener("keyup",g),e.addEventListener("mousedown",c),e.addEventListener("mouseup",y),e.addEventListener("mouseleave",y),e.addEventListener("touchstart",c,{passive:!1}),e.addEventListener("touchend",y),{destroy(){window.removeEventListener("keydown",d),window.removeEventListener("keyup",g),e.removeEventListener("mousedown",c),e.removeEventListener("mouseup",y),e.removeEventListener("mouseleave",y),e.removeEventListener("touchstart",c),e.removeEventListener("touchend",y)}}}const $t="audio/webm;codecs=opus",Di=512,Ai=250,Ni=300,Pi=2e3,Ut={calibrationMs:1e3,noiseFloorFactor:3.5,minSpeechMs:150,hangoverMs:700,minUtteranceMs:400,maxSegmentMs:1e4};function Ii(){return{phase:"calibrating",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:0,calibMs:0,calibSum:0,calibSamples:0}}function Li(e,t,n,i=Ut){if(e.phase==="calibrating"){const l=e.calibMs+n,d=e.calibSum+t,g=e.calibSamples+1;return l>=i.calibrationMs?{state:{phase:"idle",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:g>0?d/g:0,calibMs:l,calibSum:d,calibSamples:g},event:null}:{state:{...e,calibMs:l,calibSum:d,calibSamples:g},event:null}}const o=e.noiseFloor*i.noiseFloorFactor,s=t>=o;if(e.phase==="idle"){if(!s)return e.phaseMs===0?{state:e,event:null}:{state:{...e,phaseMs:0},event:null};const l=e.phaseMs+n;return l>=i.minSpeechMs?{state:{...e,phase:"speaking",phaseMs:0,segmentMs:l,speechMs:l},event:{type:"segment-start"}}:{state:{...e,phaseMs:l},event:null}}const a=e.segmentMs+n;if(a>=i.maxSegmentMs)return{state:{...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},event:{type:"segment-end"}};if(s){const l=e.speechMs+n;return{state:{...e,phase:"speaking",phaseMs:0,segmentMs:a,speechMs:l},event:null}}const r=e.phaseMs+n;if(r>=i.hangoverMs){const l={...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0};return e.speechMs<i.minUtteranceMs?{state:l,event:{type:"segment-dropped"}}:{state:l,event:{type:"segment-end"}}}return{state:{...e,phaseMs:r,segmentMs:a},event:null}}function Oi(e){let t=0;for(let n=0;n<e.length;n++){const i=e[n]??0;t+=i*i}return Math.sqrt(t/e.length)}async function Hi(e,t=Ut){st();const n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}});let i=!0,o=null,s=null;try{let a=function(){if(x!==null||m.length<=1)return;const M=performance.now()-Pi,S=m[0];if(S===void 0)return;const C=m.slice(1).filter(R=>R.tsMs>=M);m=[S,...C]},r=function(M){const S=x??M;x=null;const C=m.filter(T=>T.tsMs>=S&&T.tsMs<=M);if(C.length===0)return;const R=m[0],D=R!==void 0&&C[0]!==R?[R.blob,...C.map(T=>T.blob)]:C.map(T=>T.blob);e.onBlob(new Blob(D,{type:$t}))},l=function(){if(!i)return;const M=performance.now(),S=M-O;if(O=M,e.isSuppressed()){x!==null&&(x=null,E={...E,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},e.onSegmentChange(!1)),a(),requestAnimationFrame(l);return}c.getFloatTimeDomainData(y);const C=Oi(y),{state:R,event:_}=Li(E,C,S,t);E=R,_?.type==="segment-start"?(x=M-t.minSpeechMs-Ni,e.onSegmentChange(!0)):_?.type==="segment-end"?(r(M),e.onSegmentChange(!1)):_?.type==="segment-dropped"&&(x=null,e.onSegmentChange(!1)),a(),requestAnimationFrame(l)};const d=window.AudioContext??window.webkitAudioContext;o=new d;const g=o.createMediaStreamSource(n),c=o.createAnalyser();c.fftSize=Di,g.connect(c);const y=new Float32Array(c.fftSize);s=new MediaRecorder(n,{mimeType:$t});let m=[];s.addEventListener("dataavailable",M=>{M.data.size>0&&m.push({blob:M.data,tsMs:performance.now()})}),s.addEventListener("error",M=>{const S=M.error;e.onError?.(S instanceof Error?S:new Error("whisper mode: MediaRecorder error"))}),s.start(Ai);let E=Ii(),x=null,O=performance.now();requestAnimationFrame(l)}catch(a){throw i=!1,n.getTracks().forEach(r=>r.stop()),o?.close(),a instanceof Error?a:new Error(String(a))}return{stop(){i=!1,e.onSegmentChange(!1);const a=s;a&&a.state!=="inactive"&&a.stop(),n.getTracks().forEach(r=>r.stop()),o?.close()}}}const zi="https://api.openai.com/v1/audio/transcriptions";async function Gt(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const o=await fetch(zi,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!o.ok){const r=await o.text();return{ok:!1,text:"",status:o.status,errorBody:r}}const s=await o.json();return{ok:!0,text:typeof s=="object"&&s!==null&&"text"in s&&typeof s.text=="string"?s.text:"",status:o.status,errorBody:""}}function Vi(e,t){return e.includes(t)}async function Fi(e,t,n=Y.voice.sttModel,i=Y.voice.sttFallbackModel){let o;try{o=await ze(()=>Gt(e,t,n))}catch(a){throw De(a)?new Error(Re.network):a}if(o.ok)return o.text;if(o.status>=400&&o.status<500&&Vi(o.errorBody,n)){let a;try{a=await ze(()=>Gt(e,t,i))}catch(r){throw De(r)?new Error(Re.network):r}if(a.ok)return a.text;throw new Error(Ve(`stt failed: ${n} then ${i}`,a.status,a.errorBody))}throw new Error(Ve(`stt failed: ${n}`,o.status,o.errorBody))}const Wi=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}}],ji=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".`;function Ki(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,o=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof o!="number"||!Number.isFinite(o)||o<0||o>1?null:{action:"trim_sail",sail:i,trim:o}}case"report_status":return{action:"report_status"};default:return null}}const Bi="https://api.openai.com/v1/chat/completions";function $i(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const o=i,s=typeof o.content=="string"?o.content:null,a=[],r=o.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const d=l.function;if(typeof d!="object"||d===null)continue;const g=d,c=g.name,y=g.arguments;typeof c!="string"||typeof y!="string"||a.push({name:c,argumentsJson:y})}return{content:s,toolCalls:a}}function Ui(e){try{return JSON.parse(e)}catch{return null}}async function Gi(e,t,n,i=Y.voice.intentModel){const o=t.getState(),s=`${ji}

Current ship state:
${JSON.stringify(o)}`;let a;try{a=await ze(()=>fetch(Bi,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:Wi,messages:[{role:"system",content:s},{role:"user",content:e}]})}))}catch(m){throw De(m)?new Error(Re.network):m}if(!a.ok){const m=await a.text();throw new Error(Ve("intent request failed",a.status,m))}const r=await a.json(),l=$i(r);if(l===null)throw new Error("intent request returned an unrecognizable response body");const d=l.toolCalls[0];if(d===void 0)return{crewLine:l.content??"",intent:null};const g=Ui(d.argumentsJson),c=Ki(d.name,g);return c===null?{crewLine:K("unknown_order",o),intent:null}:{crewLine:(await t.submit(c)).message,intent:c}}const Yi=.514444,re=Math.PI/180,qi=1,Ji=512,Xi=4;function We(e){return-e*re}function Qi(e){const t=e*re;return{x:Math.sin(t),z:-Math.cos(t)}}function je(e,t){return{x:e.x*t,z:-e.y*t}}const lt=900,Yt=18,Zi=95,ea=260;function ta(e,t,n,i,o){const s=lt*(.7+Math.random()*.3),a=(Math.random()-.5)*2*ea;e.position.x=t+i.x*s+o.x*a,e.position.z=n+i.z*s+o.z*a,e.position.y=Yt+Math.random()*(Zi-Yt)}function na(e,t,n,i,o,s,a){if(e.length===0)return;const r=i+180,l=Qi(r),d={x:-l.x,z:-l.z},g={x:-l.z,z:l.x},c=o*Yi*s,y=We(r);for(const m of e){m.position.x+=l.x*c*a,m.position.z+=l.z*c*a,m.rotation.y=y;const E=m.position.x-t,x=m.position.z-n;E*E+x*x>lt*lt&&ta(m,t,n,d,g)}}const ia=1.4,aa=6,oa=2;function sa(e,t,n,i,o=Y.visuals,s={}){const{camera:a=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:d,muzzleFlash:g=null,splash:c=null}=s;let y=null,m=0,E=0,x=0;const O=220;let M=null,S=null,C="follow";const R=a!==null?a.fov:null;function _(u){C=u,typeof window<"u"&&(window.__captainViewMode=u),a!==null&&u==="follow"&&R!==null&&(a.fov=R,a.updateProjectionMatrix())}function D(u,v,p){const{worldUnitsPerMetre:f,maxHeelDeg:k,maxBraceDeg:B,heelSmoothingHz:W,boatScale:z}=o,N=y===null?0:Math.min((u-y)/1e3,.5);y=u;const V=e.getState(),U=We(v.headingDeg);t.rotation.y=U,t.scale.x=z,t.scale.y=z,t.scale.z=z;const{x:ce,z:$e}=je(v,f);if(t.position.x=ce,t.position.z=$e,n!==null){const j=k*Math.tanh(V.apparentWindKts**2*((V.mainTrim+V.jibTrim)/2)*Math.abs(Math.sin(V.apparentWindAngle*re))/Ji),Z=Math.sign(V.apparentWindAngle)*j*re,P=N>0?1-Math.exp(-N*W):0,de=m+(Z-m)*P,ue=Xi*re*N,ye=Math.max(-ue,Math.min(ue,de-m));m+=ye,n.rotation.z=m}const Ue=i?i():null;if(Ue!==null){const j=(V.mainTrim+V.jibTrim)/2,Z=Math.sign(V.apparentWindAngle)*j*B*re,P=N>0?1-Math.exp(-N*qi):0;E+=(Z-E)*P,Ue.rotation.y=E}na(l,ce,$e,V.windDirection,V.windSpeedKts,f,N);const Ge=r?r():null;if(Ge!==null){const j=We(V.apparentWindAngle+180),Z=N>0?1-Math.exp(-N*oa):0;let P=j-x;P=(P+Math.PI)%(2*Math.PI)-Math.PI,x+=P*Z;const de=aa*re*Math.sin(u/1e3*2*Math.PI*ia);Ge.rotation.y=x+de}if(a!==null&&C==="helm"){const{helmView:j}=o;a.position.x=j.x,a.position.y=j.y,a.position.z=j.z,a.rotation.x=j.pitchDeg*re,a.rotation.y=0,a.rotation.z=0,a.fov!==j.fov&&(a.fov=j.fov,a.updateProjectionMatrix())}const G=d?d():null;if(G!==null)if(p!==null){const j=je(p,f);G.position.x=j.x,G.position.z=j.z,G.rotation.y=We(p.headingDeg),G.scale.x=z,G.scale.y=z,G.scale.z=z,G.visible=!0}else G.visible=!1;M!==null&&u>=M&&(g!==null&&(g.visible=!1),M=null),S!==null&&u>=S&&(c!==null&&(c.visible=!1),S=null)}function T(){_(C==="follow"?"helm":"follow")}function L(u,v,p){g!==null&&(g.position.x=v,g.position.y=90,g.position.z=p,g.visible=!0,M=u+O)}function H(u,v,p){c!==null&&(c.position.x=v,c.position.y=8,c.position.z=p,c.visible=!0,S=u+O)}return{update:D,toggleView:T,getViewMode:()=>C,triggerMuzzleFlash:L,triggerSplash:H}}const ra=500;window.__captainDriverActive=!0;const w=He();window.__captainAmbientRock=w.visuals.ambientRock;const ne=new Wn({},w),Q=En(ne),le=w.battle.enabled?new Si(w.battle,w.physics,w.controls,{...ne.getPose(),windDirectionDeg:Q.getState().windDirection,windSpeedKts:Q.getState().windSpeedKts}):null,ct=document.createElement("div");ct.id="hud-root",document.body.appendChild(ct);function qt(e){Un(e)}function Jt(e){Ot(e)}function Ee(e){tt(e)}async function dt(e){const t=Se();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");qt(e);const n=await Gi(e,Q,t,w.voice.intentModel);Jt(n.intent),Ee(n.crewLine);try{await rt(n.crewLine,t,w.voice.ttsModel,w.voice.ttsVoice,w.voice.ttsVolume)}catch(i){const o=i instanceof Error?i.message:String(i);Ht(`⚠ Crew voice unavailable: ${o}`)}}const la=$n(ct,Q,{injectTranscript:dt,setWhisperMode:e=>{e?Zt():ha()},setTtsVoice:e=>{w.voice.ttsVoice=e},setTtsVolume:e=>{w.voice.ttsVolume=e},isPipelineBusy:()=>be});async function ca(e){const t=await Q.submit(e);return Gn(e,t.message),t}const Me=document.getElementById("demo");let ut=!1;function da(e){return new Promise(t=>setTimeout(t,e))}const ua=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function Xt(){if(!ut){ut=!0,Me&&(Me.disabled=!0);try{for(const e of ua){qt(`[demo] ${e.label}`);const t=await Q.submit(e.intent);Jt(e.intent),Ee(t.message);const n=Se();n!==null&&n.length>0&&rt(t.message,n,w.voice.ttsModel,w.voice.ttsVoice,w.voice.ttsVolume).catch(()=>{}),await da(e.waitMs)}}finally{ut=!1,Me&&(Me.disabled=!1)}}}Me&&Me.addEventListener("click",()=>{Xt()});const fe=document.getElementById("ptt");let be=!1;async function Qt(e){const t=Se();if(t===null||t.length===0){Ee("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await Fi(e,t,w.voice.sttModel,w.voice.sttFallbackModel);await dt(n)}catch(n){const i=n instanceof Error?n.message:String(n);Ee(i)}}let we=!1,pt=null,Ae=!1;function Ke(){we?(fe.textContent=Ae?"Listening… (capturing)":"Listening…",fe.classList.toggle("recording",Ae),fe.classList.toggle("listening",!Ae)):(fe.textContent="Hold to Talk",fe.classList.remove("recording","listening"))}async function pa(e){be=!0;try{await Qt(e)}finally{be=!1}}async function Zt(){if(!we)try{pt=await Hi({onBlob:e=>{pa(e)},onSegmentChange:e=>{Ae=e,Ke()},onError:e=>{Ee(e.message)},isSuppressed:()=>be||_i(ra)}),we=!0,nt(!0),Ke()}catch(e){throw we=!1,nt(!1),Ke(),e instanceof Error?e:new Error(String(e))}}function ha(){we&&(we=!1,Ae=!1,pt?.stop(),pt=null,nt(!1),Ke())}Ri(fe,{onRecordingChange:e=>{fe.classList.toggle("recording",e)},onBlob:e=>{be=!0,Qt(e).finally(()=>{be=!1})},onError:e=>{Ee(e.message)},canStart:()=>!be&&!we}),Lt().then(()=>{Yn(),w.voice.whisperMode&&Zt().catch(()=>{w.voice.whisperMode=!1,Ht("Microphone unavailable — switched to push-to-talk. Enable Whisper again anytime in ⚙ command config.")})});const q=window.DEMO;if(q===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const ke=sa(Q,q.ms_GroupShip,q.ms_BlackPearlShip,()=>window.DEMO?.ms_Sails??null,w.visuals,{camera:q.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:q.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,muzzleFlash:q.ms_MuzzleFlash,splash:q.ms_Splash}),en=10/12,ma=350,ga=1400,tn=1.6,fa=4.4,nn=.2,ba=.9;function wa(e){const t=e*en,n=9.81,i=.84,o=Math.max(t,.1),s=n*(i/o)**2,a=2*Math.PI/s,r=Math.min(ga,Math.max(ma,a*2)),l=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(l),g=tn+d*(fa-tn),c=nn+d*(ba-nn);return{size:r,choppiness:g,directionality:c}}function an(e){return 1+Math.min(1,Math.max(0,e))*3}function ht(){ne.setWind(w.environment.windDirectionDeg,w.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(w.environment.windDirectionDeg+180)*Math.PI/180,n=w.environment.windSpeedKts*en;if(e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,w.visuals.seaStateFollowsWind){const i=wa(w.environment.windSpeedKts);e.ms_Ocean.size=i.size,e.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=i.choppiness,e.ms_Ocean.directionality=an(i.directionality)}e.ms_Ocean.changed=!0}function on(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(ge(w,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),ge(w,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),ge(w,"visuals.lighting.sunIntensity",e.sunIntensity),ge(w,"visuals.lighting.ambientIntensity",e.ambientIntensity),ge(w,"visuals.lighting.exposure",e.exposure),ge(w,"visuals.lighting.fogDensity",e.fogDensity))}function ya(){window.DEMO?.SetLightingParams(w.visuals.lighting)}!(window.location.hash.length>1)&&q.ms_Environment!==w.environment.skyPreset&&q.UpdateEnvironment(w.environment.skyPreset),on(),ht(),q.ms_soundWaves&&(q.ms_soundWaves.volume=w.visuals.ambientSoundVolume);function va(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function xa(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Sa(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function Ea(e,t){switch(ge(w,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=an(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&ht();break;case"visuals.waterColor":{const n=va(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":xa(t);break;case"visuals.streakOpacity":Sa(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":ht();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),on();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":ya();break}}qn(Ea);const Ne=document.getElementById("view-toggle");function sn(e){return e==="helm"?"Follow Cam":"Helm View"}function rn(){ke.toggleView(),Ne&&(Ne.textContent=sn(ke.getViewMode()))}Ne&&(Ne.textContent=sn(ke.getViewMode()),Ne.addEventListener("click",()=>{rn()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}rn()});const Pe=document.createElement("div");Pe.id="battle-hit-flash",Pe.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(Pe);let Be=null;const Ma=180;function ka(){Be!==null&&clearTimeout(Be),Pe.style.opacity="0.35",Be=setTimeout(()=>{Pe.style.opacity="0",Be=null},Ma)}const ln=15;let mt=null;function cn(e){if(mt!==null){const s=e-mt;if(ne.tick(s),le){const a=ne.getPose(),r=Q.getState(),l=le.tick(s,{...a,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(ne.setDriveMultiplier(le.getSpeedMultiplier()),l.some(d=>d.key==="enemy_fires")){const d=le.getView().npc,g=je({x:d.x,y:d.y},w.visuals.worldUnitsPerMetre);if(ke.triggerMuzzleFlash(e,g.x,g.z),l.some(c=>c.key==="hit_taken"))ka();else{const c=d.x-a.x,y=d.y-a.y,m=Math.hypot(c,y)||1,E={x:a.x+c/m*ln,y:a.y+y/m*ln},x=je(E,w.visuals.worldUnitsPerMetre);ke.triggerSplash(e,x.x,x.z)}}for(const d of l){const g=K(d.key,r,d);tt(g);const c=Se();c!==null&&c.length>0&&rt(g,c,w.voice.ttsModel,w.voice.ttsVoice,w.voice.ttsVolume).catch(()=>{})}}}mt=e;const t=ne.getPose(),n={x:t.x,y:t.y,headingDeg:Q.getState().heading},i=le?le.getView().npc:null,o=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;ke.update(e,n,o),la.update(),requestAnimationFrame(cn)}requestAnimationFrame(cn),window.__captain={bus:Q,submitIntent:ca,injectTranscript:dt,setWind:(e,t)=>{ne.setWind(e,t)},demo:Xt,getConfig:()=>w,copyConfig:()=>{const e=JSON.stringify(w,null,2);return console.log(e),e},setConfig:e=>{_t(e),location.reload()},resetConfig:()=>{Rt(),location.reload()},getPlayerPose:()=>ne.getPose(),get battle(){return le?le.getView():null}}})();
