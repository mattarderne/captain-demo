(function(){"use strict";function Mt(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function kt(e){return e.toFixed(1)}function K(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=Mt(t.heading),s=kt(t.speedKts),o=Mt(t.windDirection),a=kt(t.windSpeedKts);let r=`Steering ${i} at ${s} knots, wind ${o} at ${a}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Sn=-35,En=35,Mn=0,kn=1,Tn=1;function Cn(e){return e==="main"||e==="jib"||e==="all"}function ue(e,t){return{ok:!1,message:e,state:t}}function we(e,t){return{ok:!0,message:e,state:t}}function _n(e){function t(i){const s=i.action;if(s==="helm"){const o=i.degrees;if(typeof o!="number"||!Number.isFinite(o)||o<Sn||o>En)return Promise.resolve(ue(K("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:o}).accepted)return Promise.resolve(ue(K("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return r.speedKts<Tn?Promise.resolve(we(K("no_steerage_way",r),r)):o>0?Promise.resolve(we(K("helm_ack_starboard",r),r)):o<0?Promise.resolve(we(K("helm_ack_port",r),r)):Promise.resolve(we(K("helm_ack_amidships",r),r))}if(s==="trim_sail"){const o=i.sail,a=i.trim;if(!Cn(o))return Promise.resolve(ue(K("unknown_order",e.snapshot()),e.snapshot()));if(typeof a!="number"||!Number.isFinite(a)||a<Mn||a>kn)return Promise.resolve(ue(K("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:o,trim:a}).accepted)return Promise.resolve(ue(K("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot(),d=o==="main"?"trim_ack_main":o==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(we(K(d,l),l))}if(s==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(ue(K("unknown_order",e.snapshot()),e.snapshot()));const a=e.snapshot();return Promise.resolve(we(K("status",a),a))}return Promise.resolve(ue(K("unknown_order",e.snapshot()),e.snapshot()))}function n(){return e.snapshot()}return{submit:t,getState:n}}const Qe=1.94384,te=180/Math.PI,F=Math.PI/180;function Tt(e){return e*Qe}function Ze(e){return e/Qe}function pe(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function $(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function ne(e,t,n){return e<t?t:e>n?n:e}const Rn=0,Dn=12;function Ct(e={}){return{x:0,y:0,psi:$((e.heading??0)*F),u:Ze(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*F,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:$((e.windDirection??Rn)*F),windSpeedMs:Ze(e.windSpeedKts??Dn)}}const ke=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],An=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Nn=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function In(e,t,n){return e+(t-e)*n}function _t(e,t){const n=ne(t,0,180);let i=0;for(;i<ke.length-1&&ke[i+1]<=n;)i++;const s=Math.min(i+1,ke.length-1),o=ke[i],a=ke[s],r=a===o?0:(n-o)/(a-o);return In(e[i],e[s],r)}function Pn(e){return{cl:_t(An,e),cd:_t(Nn,e)}}function Ln(e){const t=ne(Math.abs(e),0,180),{cl:n,cd:i}=Pn(t),s=t*F,o=Math.sin(s),a=Math.cos(s),r=n*o-i*a,l=Math.abs(n*a+i*o);return{cDrive:r,cSide:l}}const Rt=.95,On=.2;function Dt(e){const t=ne(Math.abs(e),0,180)/180;return ne(Rt-(Rt-On)*t*t,.15,1)}const Hn=.65;function zn(e,t){const n=(e-Dt(t))/Hn;return Math.max(0,1-n*n)}const Q={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:12,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx",whisperMode:!1},input:{autoSubmit:!0,autoSubmitDelayMs:1e3},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:64,streakOpacity:.35,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6}},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25}},ye="captain.config";function re(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Fn(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function At(e,t,n,i){for(const s of Object.keys(t)){const o=t[s];if(!(s in e)){i.push(`${n}${s} (unknown key)`);continue}const a=e[s];re(a)&&re(o)?At(a,o,`${n}${s}.`,i):re(a)||re(o)||typeof a!=typeof o?i.push(`${n}${s} (expected ${typeof a}, got ${typeof o})`):e[s]=o}}function Nt(e,t){const n={...e};for(const i of Object.keys(t)){const s=t[i],o=n[i];n[i]=re(o)&&re(s)?Nt(o,s):s}return n}function Fe(){return typeof localStorage<"u"}function Vn(){if(!Fe())return{};const e=localStorage.getItem(ye);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return re(t)?t:{}}catch{return{}}}function Ve(){const e=Fn(Q);if(!Fe())return e;const t=localStorage.getItem(ye);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${ye}"] is not valid JSON — ignoring it, using defaults.`),e}if(!re(n))return console.warn(`captain.config: stored value in localStorage["${ye}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return At(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function It(e){if(!Fe())return;const t=Vn(),n=Nt(t,e);localStorage.setItem(ye,JSON.stringify(n))}function Pt(){Fe()&&localStorage.removeItem(ye)}function he(e,t,n){const i=t.split("."),s=i[i.length-1];if(s===void 0)return;let o=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0||(o=o?.[r],o==null))return}o!=null&&(o[s]=n)}const Wn=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"voice.whisperMode",label:"Whisper mode (hands-free) by default",section:"Voice",type:"boolean",live:!1,note:"Live toggle lives in the ⚙ command-config popover next to the quarterdeck log; this only sets next boot's default."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, the three 'manual' sliders above are overwritten from wind speed every time wind changes."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:64,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],jn=Q.controls.rudderMaxDeg*F,Kn=Q.physics;function et(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,s=e.u*n-e.v*t,o=-e.windSpeedMs*Math.sin(e.windFromRad),a=-e.windSpeedMs*Math.cos(e.windFromRad),r=o-i,l=a-s,d=Math.hypot(r,l),m=r*t+l*n,u=r*n-l*t;return{awaDeg:Math.atan2(-u,-m)*te,awsMs:d}}function Lt(e,t,n,i,s){const o=Math.abs(n),{cDrive:a,cSide:r}=Ln(o),l=zn(t,o),d=.5*s*i*i,m=d*e*a*l,u=d*e*r*l,b=-Math.sign(n||1)*u;return{surge:m,sway:b}}function Ot(e,t,n=Kn,i=jn,s=1){const{awaDeg:o,awsMs:a}=et(e),r=Lt(n.areaMain,e.mainTrim,o,a,n.rhoAir),l=Lt(n.areaJib,e.jibTrim,o,a,n.rhoAir),d=(r.surge+l.surge)*s,m=(r.sway+l.sway)*s,u=e.u,b=e.v,h=e.r,T=u>=0?n.kSurgeLin:n.kSurgeLinAstern,v=-n.kSurgeQuad*u*Math.abs(u)-T*u,L=-n.kSwayQuad*b*Math.abs(b)-n.kSwayLin*b,E=ne(e.rudder,-i,i),M=n.cRudder*E*u*Math.abs(u),C=-(n.kYawDamp+n.kYawDampU*Math.abs(u))*h,D=n.cWeather*Math.sin(o*F)*a*Math.min(1,Math.abs(u)),_=M+C+D,I=(d+v)/n.mass+b*h,R=(m+L)/n.mass-u*h,S=_/n.izz;e.u=u+I*t,e.v=b+R*t,e.r=h+S*t;const A=Math.sin(e.psi),p=Math.cos(e.psi),x=e.u*A+e.v*p,g=e.u*p-e.v*A;e.x+=x*t,e.y+=g*t,e.psi=$(e.psi+e.r*t)}function Ht(e){return Math.hypot(e.u,e.v)*Qe}function Bn(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,s=e.u*n-e.v*t;return $(Math.atan2(i,s))}function $n(e){return Ht(e)<.2?0:pe(e.psi-Bn(e))*te}const Te=.05,zt=Te*1e3;function tt(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Un{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=Q){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*F,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*F,this.state=Ct({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=ne(t.degrees*F,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=ne(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=zt;)this.state.rudder=tt(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*Te),this.state.mainTrim=tt(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*Te),this.state.jibTrim=tt(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*Te),Ot(this.state,Te,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=zt}snapshot(){const{awaDeg:t,awsMs:n}=et(this.state),i=Ht(this.state);return{heading:this.state.psi*te%360,speedKts:i,windDirection:this.state.windFromRad*te%360,windSpeedKts:Tt(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Tt(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*te,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:$n(this.state)}}setWind(t,n){this.state.windFromRad=$(t*F),this.state.windSpeedMs=Ze(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const nt="captain.openai_key",Yn="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function ve(){return window.localStorage.getItem(nt)}function Ft(e){window.localStorage.setItem(nt,e)}function Gn(){window.localStorage.removeItem(nt)}function Vt(e=document.body){const t=ve();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const s=document.createElement("div");s.style.background="#0e1f2e",s.style.color="#e8f4ff",s.style.padding="20px 24px",s.style.borderRadius="6px",s.style.maxWidth="360px",s.style.display="flex",s.style.flexDirection="column",s.style.gap="10px";const o=document.createElement("div");o.textContent="OpenAI API key",o.style.fontSize="15px",o.style.fontWeight="bold";const a=document.createElement("p");a.id="byok-copy",a.textContent=Yn,a.style.margin="0",a.style.fontSize="12px",a.style.opacity="0.85";const r=document.createElement("input");r.id="byok-key-input",r.type="password",r.placeholder="sk-...",r.autocomplete="off",r.style.fontFamily="inherit",r.style.fontSize="13px",r.style.padding="6px 8px";const l=document.createElement("button");l.id="byok-save",l.type="button",l.textContent="Save",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 10px",l.style.cursor="pointer";function d(){const m=r.value.trim();m.length!==0&&(Ft(m),i.remove(),n(m))}l.addEventListener("click",d),r.addEventListener("keydown",m=>{m.key==="Enter"&&d()}),s.appendChild(o),s.appendChild(a),s.appendChild(r),s.appendChild(l),i.appendChild(s),e.appendChild(i),r.focus()})}const qn=["alloy","ash","ballad","coral","echo","fable","nova","onyx","sage","shimmer","verse"];function Jn(e,t,n){e.innerHTML="",ci();const i=document.createElement("div");i.id="hud",e.appendChild(i);const s=document.createElement("div");s.className="hud-panel hud-state",i.appendChild(s);const o=document.createElement("div");o.className="hud-panel-title",o.textContent="Ship State",s.appendChild(o);function a(c,f,N=!1){const P=document.createElement("div");P.id=c,P.className="hud-row";const se=document.createElement("span");se.className="hud-row-label",se.textContent=f,P.appendChild(se);const de=document.createElement("span");de.className="hud-row-colon",de.textContent=": ",P.appendChild(de);const oe=document.createElement("span");oe.className="hud-row-value",oe.textContent="--",P.appendChild(oe);let J=null;if(N){const X=document.createElement("div");X.className="hud-bar",J=document.createElement("div"),J.className="hud-bar-fill",X.appendChild(J),P.appendChild(X)}return s.appendChild(P),{setValue:X=>{oe.textContent=X},setFill:J?X=>{J&&(J.style.width=`${Math.max(0,Math.min(100,X))}%`)}:void 0}}const r=a("hud-heading","heading"),l=a("hud-speed","speed"),d=a("hud-wind","wind"),m=a("hud-awa","awa"),u=a("hud-main","main",!0),b=a("hud-jib","jib",!0),h=a("hud-rudder","rudder"),T="http://www.w3.org/2000/svg";function v(c,f){const N=document.createElementNS(T,c);for(const[P,se]of Object.entries(f))N.setAttribute(P,se);return N}const L=document.getElementById("hud-wind"),E=document.createElement("div");E.id="hud-windvane",E.className="hud-windvane";const M=v("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});M.appendChild(v("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),M.appendChild(v("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const C=v("g",{class:"hud-windvane-arrow"});C.appendChild(v("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),C.appendChild(v("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),M.appendChild(C),M.appendChild(v("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),E.appendChild(M),L.appendChild(E);const D=document.getElementById("hud-rudder"),_=document.createElement("div");_.className="hud-gauge";const I=document.createElement("div");I.className="hud-gauge-center-tick",_.appendChild(I);const R=document.createElement("div");R.className="hud-gauge-target",_.appendChild(R);const S=document.createElement("div");S.className="hud-gauge-needle",_.appendChild(S),D.appendChild(_);let A=null;function p(c){return(Math.max(-35,Math.min(35,c))+35)/70*100}function x(c){const f=p(c);S.style.left=`${f}%`,S.classList.toggle("port",c<-.5),S.classList.toggle("stbd",c>.5),A!==null&&Math.abs(c-A)>.5?(R.style.left=`${p(A)}%`,R.style.display="block"):R.style.display="none"}const g=document.createElement("div");g.id="hud-irons",g.className="hud-irons-row";const y=document.createElement("span");y.className="hud-visually-hidden",y.textContent="irons: false",g.appendChild(y),s.appendChild(g);const k=document.createElement("div");k.className="hud-panel hud-log",i.appendChild(k);const B=document.createElement("div");B.className="hud-log-header",k.appendChild(B);const V=document.createElement("div");V.className="hud-panel-title hud-log-title-text",V.textContent="Quarterdeck Log",B.appendChild(V);const O=document.createElement("button");O.id="command-config-toggle",O.type="button",O.title="Voice & key settings",O.setAttribute("aria-label","Command config"),O.textContent="⚙",O.className="hud-btn hud-command-config-toggle",B.appendChild(O);const U="captain.whisper_notice_dismissed";function W(){try{return window.localStorage.getItem(U)==="1"}catch{return!1}}function wt(){try{window.localStorage.setItem(U,"1")}catch{}}const q=document.createElement("div");q.id="whisper-notice",q.className="hud-whisper-notice",q.hidden=!0;const Ie=document.createElement("span");Ie.textContent="Type or dictate your orders — any dictation tool works (Wispr Flow, macOS dictation…). Orders send automatically when you pause. Hands-free mic mode and spoken crew replies are in the ⚙ command config.",q.appendChild(Ie);const ee=document.createElement("button");ee.id="whisper-notice-dismiss",ee.type="button",ee.textContent="×",ee.setAttribute("aria-label","Dismiss"),ee.className="hud-whisper-notice-dismiss",ee.addEventListener("click",()=>{q.hidden=!0,wt(),Me()}),q.appendChild(ee),k.appendChild(q);function Ge(){W()||(q.hidden=!1)}const H=document.createElement("div");H.id="hud-log-list",H.className="hud-log-list",k.appendChild(H);const z=6,j=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function Y(){H.innerHTML="";let c=-1;j.forEach((f,N)=>{f.kind==="exchange"&&(c=N)}),j.forEach((f,N)=>{const P=document.createElement("div");if(P.style.opacity=String(.45+.55*((N+1)/j.length)),f.kind==="system"){P.className="hud-log-entry hud-log-system-entry";const X=document.createElement("div");X.className="hud-log-system",X.textContent=`⚠ ${f.transcript}`,P.appendChild(X),H.appendChild(P);return}const se=N===c;P.className="hud-log-entry";const de=document.createElement("div");de.className="hud-log-you",se&&(de.id="hud-transcript"),de.textContent=`You: ${f.transcript}`,P.appendChild(de);const oe=document.createElement("div");oe.className="hud-log-order",se&&(oe.id="hud-intent"),oe.textContent=f.order,P.appendChild(oe);const J=document.createElement("div");J.className="hud-log-crew",se&&(J.id="hud-crew"),J.textContent=`Crew: ${f.crew}`,P.appendChild(J),H.appendChild(P)}),H.scrollTop=H.scrollHeight}Y();function yt(c){if(c===null)return"→ no order";if(c.action==="helm"){const f=Math.round(c.degrees),N=f<0?"port":f>0?"stbd":"amidships";return`→ helm ${f}° (${N})`}return c.action==="trim_sail"?`→ trim ${c.sail} → ${c.trim.toFixed(2)}`:"→ status report"}function Da(c){j.push({kind:"exchange",transcript:c,order:"→ …",crew:"…"}),j.length>z&&j.shift(),Y()}function Aa(c){const f=[...j].reverse().find(N=>N.kind==="exchange");f&&(f.order=yt(c)),c!==null&&c.action==="helm"&&(A=c.degrees),Y()}function mn(c){const f=[...j].reverse().find(N=>N.kind==="exchange");f&&(f.crew=c),Y()}function Na(c){j.push({kind:"system",transcript:c,order:"",crew:""}),j.length>z&&j.shift(),Y()}const qe=document.createElement("div");qe.className="hud-controls",k.insertBefore(qe,q);const G=document.createElement("input");G.id="transcript-input",G.type="text",G.placeholder="Speak or type your orders…",G.className="hud-input",qe.appendChild(G);const Pe=document.createElement("div");Pe.className="hud-button-row",qe.appendChild(Pe);const Le=document.createElement("button");Le.id="ptt",Le.type="button",Le.textContent="Hold to Talk",Le.className="hud-btn hud-btn-ptt",Pe.appendChild(Le);const Oe=document.createElement("button");Oe.id="demo",Oe.type="button",Oe.textContent="Run Demo",Oe.className="hud-btn hud-btn-demo",Pe.appendChild(Oe);const He=document.createElement("button");He.id="view-toggle",He.type="button",He.textContent="Helm View",He.className="hud-btn hud-btn-view-toggle",Pe.appendChild(He);function Me(){G.focus()}const vt=Ve().input,gn=2;let ze=null;function xt(){ze!==null&&(clearTimeout(ze),ze=null)}let St=!1,Je=null;async function Et(c){if(St||(n.isPipelineBusy?.()??!1)){Je=c;return}St=!0,xt();try{await n.injectTranscript(c),G.value=""}catch(f){const N=f instanceof Error?f.message:String(f);mn(N)}finally{if(St=!1,Me(),Je!==null){const f=Je;Je=null,Et(f)}}}function fn(c){if(!vt.autoSubmit)return;const f=c.trim();f.length<gn||Et(f)}G.addEventListener("input",c=>{if(xt(),!vt.autoSubmit)return;if(c.inputType==="insertFromPaste"){fn(G.value);return}G.value.trim().length<gn||(ze=setTimeout(()=>{ze=null,fn(G.value)},vt.autoSubmitDelayMs))}),G.addEventListener("keydown",c=>{if(c.key!=="Enter")return;xt();const f=G.value.trim();f.length!==0&&Et(f)}),document.addEventListener("click",c=>{c.target instanceof HTMLCanvasElement&&Me()}),oi(i,Me);const Ia=li(k,O,n,Me);function Xe(c){return c.toFixed(1)}function bn(c){return c.toFixed(2)}const Pa=["N","NE","E","SE","S","SW","W","NW"];function wn(c){return(c%360+360)%360}function yn(c){const f=Math.round(wn(c)/45)%8;return Pa[f]??"N"}function vn(c){return String(Math.round(wn(c))%360).padStart(3,"0")}function La(c){return`${vn(c)} ${yn(c)}`}function Oa(c,f){return`from ${vn(c)} @ ${Xe(f)} kts (${yn(c)})`}function Ha(c,f){const N=Math.round(c);if(N===0)return`dead ahead @ ${Xe(f)} kts`;const P=N<0?"port":"starboard";return`${Math.abs(N)}° to ${P} @ ${Xe(f)} kts`}function za(c){const f=Math.round(c),N=f<0?"port":f>0?"stbd":"amidships";return`${f}° ${N}`}function Fa(c){r.setValue(La(c.heading)),l.setValue(`${Xe(c.speedKts)} kts`),d.setValue(Oa(c.windDirection,c.windSpeedKts)),C&&C.setAttribute("transform",`rotate(${c.windDirection-c.heading} 20 20)`),m.setValue(Ha(c.apparentWindAngle,c.apparentWindKts)),u.setValue(bn(c.mainTrim)),u.setFill?.(c.mainTrim*100),b.setValue(bn(c.jibTrim)),b.setFill?.(c.jibTrim*100),h.setValue(za(c.rudderAngle)),x(c.rudderAngle),y.textContent=`irons: ${c.inIrons}`,g.classList.toggle("active",c.inIrons)}function xn(){Fa(t.getState())}return xn(),Ce={logTranscript:Da,logIntent:Aa,logCrewLine:mn,logSystemNote:Na},at={showNotice:Ge,setVoiceModeChecked:Ia.setWhisperModeChecked},Kt={focus:Me},{update:xn}}let Ce=null;function Xn(e){Ce?.logTranscript(e)}function Wt(e){Ce?.logIntent(e)}function it(e){Ce?.logCrewLine(e)}function jt(e){Ce?.logSystemNote(e)}function Qn(e,t){Wt(e),it(t)}let at=null;function Zn(){at?.showNotice()}function st(e){at?.setVoiceModeChecked(e)}let Kt=null;function ei(){Kt?.focus()}let Bt=[];function ti(e){Bt.push(e)}function ni(e,t){for(const n of Bt)n(e,t)}function ii(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function ai(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function si(e,t,n){const i=t.split("."),s=i[i.length-1];if(s===void 0)return;let o=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0)return;const l=o[r];(typeof l!="object"||l===null)&&(o[r]={}),o=o[r]}o[s]=n}function $t(e,t){const n={...e};for(const i of Object.keys(t)){const s=e[i],o=t[i];s!==null&&typeof s=="object"&&!Array.isArray(s)&&o!==null&&typeof o=="object"&&!Array.isArray(o)?n[i]=$t(s,o):n[i]=o}return n}function oi(e,t){const n=Ve(),i={};let s=!1;const o=new Map,a=document.createElement("button");a.id="settings-toggle",a.type="button",a.title="Settings (S)",a.setAttribute("aria-label","Settings"),a.textContent="⚙",a.className="hud-btn hud-settings-toggle",e.appendChild(a);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);function m(){d.hidden=!s}function u(p,x){if(si(i,p.path,x),p.live)ni(p.path,x);else{const g=o.get(p.path);g&&(g.hidden=!1),s=!0,m()}}function b(p,x){const g=document.createElement("div");g.className="hud-settings-control-row";const y=document.createElement("input");y.type="range",y.min=String(p.min??0),y.max=String(p.max??100),y.step=String(p.step??1),y.value=String(x),y.className="hud-settings-range";const k=document.createElement("input");k.type="number",k.min=y.min,k.max=y.max,k.step=y.step,k.value=String(x),k.className="hud-settings-numeric";const B=p.min??-1/0,V=p.max??1/0;function O(U){if(!Number.isFinite(U))return;const W=Math.min(V,Math.max(B,U));y.value=String(W),k.value=String(W),u(p,W)}return y.addEventListener("input",()=>O(Number(y.value))),k.addEventListener("input",()=>O(Number(k.value))),g.appendChild(y),g.appendChild(k),g}function h(p,x){const g=document.createElement("label");g.className="hud-settings-checkbox-label";const y=document.createElement("input");return y.type="checkbox",y.checked=x,y.addEventListener("change",()=>u(p,y.checked)),g.appendChild(y),g}function T(p,x){const g=document.createElement("select");g.className="hud-settings-select";for(const y of p.options??[]){const k=document.createElement("option");k.value=y,k.textContent=y,y===x&&(k.selected=!0),g.appendChild(k)}return g.addEventListener("change",()=>u(p,g.value)),g}function v(p,x){const g=document.createElement("input");return g.type="color",g.className="hud-settings-color",g.value=x,g.addEventListener("input",()=>u(p,g.value)),g}function L(p,x){const g=document.createElement("input");return g.type="text",g.className="hud-settings-text",g.value=x,g.addEventListener("change",()=>u(p,g.value)),g}function E(p){const x=document.createElement("div");x.className="hud-settings-field",x.dataset.configPath=p.path;const g=document.createElement("div");g.className="hud-settings-label-row";const y=document.createElement("span");if(y.className="hud-settings-label",y.textContent=p.label,g.appendChild(y),!p.live){const V=document.createElement("span");V.className="hud-settings-reload-dot",V.title="Staged — needs Save & Reload",V.hidden=!0,g.appendChild(V),o.set(p.path,V)}x.appendChild(g);const k=ai(n,p.path);let B;switch(p.type){case"number":B=b(p,k);break;case"boolean":B=h(p,k);break;case"select":B=T(p,k);break;case"color":B=v(p,k);break;default:B=L(p,k);break}if(x.appendChild(B),p.note){const V=document.createElement("div");V.className="hud-settings-note",V.textContent=p.note,x.appendChild(V)}return x}const M=new Map;for(const p of Wn)M.has(p.section)||M.set(p.section,[]),M.get(p.section)?.push(p);const C=new Set(["Visuals","Environment","Lighting"]);for(const[p,x]of M){const g=document.createElement("details");g.className="hud-settings-section",g.open=C.has(p);const y=document.createElement("summary");y.textContent=p,g.appendChild(y);for(const k of x)g.appendChild(E(k));r.appendChild(g)}const D=document.createElement("div");D.className="hud-settings-footer";const _=document.createElement("button");_.id="settings-save-reload",_.type="button",_.textContent="Save & Reload",_.className="hud-btn",_.addEventListener("click",()=>{It(i),location.reload()});const I=document.createElement("button");I.id="settings-copy-json",I.type="button",I.textContent="Copy JSON",I.className="hud-btn",I.addEventListener("click",()=>{(async()=>{const p=$t(n,i),x=JSON.stringify(p,null,2);console.log(x);try{await navigator.clipboard?.writeText(x)}catch{}})()});const R=document.createElement("button");R.id="settings-reset-all",R.type="button",R.textContent="Reset All",R.className="hud-btn",R.addEventListener("click",()=>{Pt(),location.reload()}),D.appendChild(_),D.appendChild(I),D.appendChild(R),r.appendChild(D);let S=!1;function A(p){S=p,r.classList.toggle("open",p),a.classList.toggle("active",p),p||t()}a.addEventListener("click",()=>A(!S)),document.addEventListener("keydown",p=>{p.key!=="s"&&p.key!=="S"||ii(document.activeElement)||A(!S)})}function ri(e){return e.length<=4?"•".repeat(e.length):`sk-…${e.slice(-4)}`}function li(e,t,n,i){const s=Ve(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function a(S){const A=document.createElement("div");return A.className="hud-command-config-section-title",A.textContent=S,A}o.appendChild(a("Voice Mode"));const r=document.createElement("div");r.className="hud-segmented";const l=document.createElement("label");l.className="hud-segmented-option";const d=document.createElement("input");d.type="radio",d.name="voice-mode",d.id="voice-mode-ptt",l.appendChild(d),l.appendChild(document.createTextNode("Push to talk"));const m=document.createElement("label");m.className="hud-segmented-option";const u=document.createElement("input");u.type="radio",u.name="voice-mode",u.id="voice-mode-whisper",m.appendChild(u),m.appendChild(document.createTextNode("Whisper (hands-free)")),u.checked=s.voice.whisperMode,d.checked=!s.voice.whisperMode,d.addEventListener("change",()=>{d.checked&&n.setWhisperMode(!1)}),u.addEventListener("change",()=>{u.checked&&n.setWhisperMode(!0)}),r.appendChild(l),r.appendChild(m),o.appendChild(r),o.appendChild(a("Crew Voice"));const b=document.createElement("div");b.className="hud-command-config-row";const h=document.createElement("label");h.className="hud-toggle-label";const T=document.createElement("input");T.id="tts-enabled",T.type="checkbox",T.checked=!1,h.appendChild(T),h.appendChild(document.createTextNode("Speak crew replies")),b.appendChild(h);const v=document.createElement("select");v.id="tts-voice-select",v.className="hud-settings-select hud-command-config-voice-select";for(const S of qn){const A=document.createElement("option");A.value=S,A.textContent=S,S===s.voice.ttsVoice&&(A.selected=!0),v.appendChild(A)}v.addEventListener("change",()=>n.setTtsVoice(v.value)),b.appendChild(v),o.appendChild(b),o.appendChild(a("OpenAI Key"));const L=document.createElement("div");L.id="key-masked",L.className="hud-key-masked";function E(){const S=ve();L.textContent=S!==null&&S.length>0?ri(S):"(no key stored)"}E(),o.appendChild(L);const M=document.createElement("div");M.className="hud-command-config-row";const C=document.createElement("input");C.id="key-input",C.type="password",C.placeholder="sk-...",C.autocomplete="off",C.className="hud-settings-text",M.appendChild(C);const D=document.createElement("button");D.id="key-save",D.type="button",D.textContent="Save",D.className="hud-btn",D.addEventListener("click",()=>{const S=C.value.trim();S.length!==0&&(Ft(S),C.value="",E())}),M.appendChild(D);const _=document.createElement("button");_.id="key-clear",_.type="button",_.textContent="Clear",_.className="hud-btn",_.addEventListener("click",()=>{Gn(),E(),R(!1),Vt().then(()=>{E(),i()})}),M.appendChild(_),o.appendChild(M);let I=!1;function R(S){I=S,o.classList.toggle("open",I),t.classList.toggle("active",I),I?E():i()}return t.addEventListener("click",()=>R(!I)),document.addEventListener("mousedown",S=>{if(!I)return;const A=S.target;o.contains(A)||t.contains(A)||R(!1)}),document.addEventListener("keydown",S=>{S.key==="Escape"&&I&&R(!1)}),{setWhisperModeChecked:S=>{u.checked=S,d.checked=!S}}}function ci(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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

.hud-whisper-notice {
  position: relative;
  display: flex;
  align-items: flex-start;
  background: rgba(88, 196, 255, 0.12);
  border: 1px solid rgba(88, 196, 255, 0.35);
  border-radius: 4px;
  padding: 8px 26px 8px 8px;
  margin-bottom: 8px;
  font-size: 11px;
  line-height: 1.4;
  color: #cfe9ff;
  pointer-events: auto;
}
.hud-whisper-notice-dismiss {
  position: absolute;
  top: 3px;
  right: 5px;
  background: none;
  border: none;
  color: #cfe9ff;
  font-size: 15px;
  line-height: 1;
  cursor: pointer;
  padding: 2px 5px;
}
.hud-whisper-notice-dismiss:hover {
  color: #fff;
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
`,document.head.appendChild(e)}const ot=.05,Ut=ot*1e3,di=35,ui=40,rt=50,Yt=15,pi=8;function lt(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class hi{state;behavior="APPROACH";tackSide=null;tackHoldS=0;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=Ct({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*F,this.rudderRateRadPerS=t.rudderSlewDegPerS*F,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=$(t*F),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}planHeading(t){const n=t.x-this.state.x,i=t.y-this.state.y,s=Math.hypot(n,i),o=$(Math.atan2(n,i));s>this.engageRangeM*1.15?this.behavior="APPROACH":s<this.engageRangeM*.85&&(this.behavior="ENGAGE");let a;if(this.behavior==="APPROACH")a=o;else{const d=(s>this.engageRangeM?1:-1)*15*F;a=$(t.headingRad+d)}const r=pe(this.state.windFromRad-a)*te;if(this.tackSide!==null){this.tackHoldS-=ot;const l=Math.abs(r)>=ui;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=pi){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=Yt)}}}else if(Math.abs(r)<di){const l=$(this.state.windFromRad-rt*F),d=$(this.state.windFromRad+rt*F),m=Math.abs(pe(l-this.state.psi)),u=Math.abs(pe(d-this.state.psi));this.tackSide=m<=u?1:-1,this.tackHoldS=Yt}return this.tackSide!==null?$(this.state.windFromRad-this.tackSide*rt*F):a}step(t,n){const i=this.planHeading(n),s=pe(i-this.state.psi);this.rudderTargetRad=ne(this.headingKp*s-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:o}=et(this.state),a=Dt(Math.abs(o));this.mainTrimTarget=a,this.jibTrimTarget=a,this.state.rudder=lt(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=lt(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=lt(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),Ot(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Ut;)this.step(ot,n),this.accMs-=Ut}headingDeg(){return this.state.psi*te%360}}const mi=30;function gi(){return{reloadRemainingS:0}}function fi(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function bi(e,t,n,i,s,o){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t);const a=n<=s.cannonRangeM,r=i<=mi,l=e.reloadRemainingS<=0;return!a||!r||!l?{fired:!1,hit:!1}:(e.reloadRemainingS=s.reloadS,{fired:!0,hit:o()<fi(n,s.cannonRangeM)})}const wi=10,yi=5,vi=.8,xi=.5;function Si(){return{hullHp:wi}}function Ei(e){e.hullHp=Math.max(0,e.hullHp-1)}function Mi(e){return e.hullHp<=0?xi:e.hullHp<=yi?vi:1}function ki(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Ti=35;function Ci(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class _i{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;constructor(t,n,i,s){this.cfg=t,this.rng=ki(t.seed);const o=ne(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*o);const a=1.2+.6*o,r=this.rng()*2*Math.PI,l=s.x+t.spawnRangeM*Math.sin(r),d=s.y+t.spawnRangeM*Math.cos(r),m=$(r+Math.PI);this.npc=new hi({x:l,y:d,heading:m*te,windDirection:s.windDirectionDeg,windSpeedKts:s.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Ti,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:a,phys:n}),this.damage=Si(),this.cannon=gi()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});const s=n.x-this.npc.x,o=n.y-this.npc.y,a=Math.hypot(s,o);if(!this.everSpotted&&a<=this.cfg.spawnRangeM){this.everSpotted=!0;const u=$(Math.atan2(-s,-o)),h=pe(u-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:h})}!this.everClosing&&a<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"}));const r=$(Math.atan2(s,o)),l=pe(r-this.npc.state.psi)*te,d=Math.min(Math.abs(l-90),Math.abs(l+90)),m=bi(this.cannon,t/1e3,a,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);if(m.fired&&(i.push({key:"enemy_fires"}),m.hit&&(Ei(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp}))),i.length>0){const u=i[i.length-1];u&&(this.lastEvent=u.key)}return i}getSpeedMultiplier(){return Mi(this.damage)}getHullHp(){return this.damage.hullHp}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:Ci(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent}}}const _e={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function Ri(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function Re(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Di=1500;async function We(e){try{return await e()}catch(t){if(!Re(t))throw t;return await new Promise(n=>setTimeout(n,Di)),e()}}function je(e,t,n){const i=Ri(t);return i?_e[i]:`${e} (${t}): ${n}`}const Ai="https://api.openai.com/v1/audio/speech",Ni="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let le=null,Ke=null;function Ii(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function Pi(e){return le!==null?!0:Ke===null?!1:performance.now()-Ke<e}function ct(){le!==null&&(le.pause(),le.src="",le=null,Ke=performance.now())}async function dt(e,t,n=Q.voice.ttsModel,i=Q.voice.ttsVoice){if(e.trim().length===0||!Ii())return;ct();let s;try{s=await We(()=>fetch(Ai,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:Ni})}))}catch(m){throw Re(m)?new Error(_e.network):m}if(!s.ok){const m=await s.text();throw new Error(je("tts request failed",s.status,m))}const o=await s.arrayBuffer(),a=new Blob([o],{type:"audio/mpeg"}),r=URL.createObjectURL(a),l=new Audio(r);le=l;const d=()=>{URL.revokeObjectURL(r),le===l&&(le=null,Ke=performance.now())};l.addEventListener("ended",d,{once:!0}),l.addEventListener("error",d,{once:!0}),await l.play()}const Gt="audio/webm;codecs=opus";function Li(e,t){let n=null,i=null,s=[],o=!1;function a(h){if(!(h instanceof HTMLElement))return!1;const T=h.tagName;return T==="INPUT"||T==="SELECT"||T==="TEXTAREA"||h.isContentEditable}async function r(){if(!o&&!(t.canStart&&!t.canStart())){o=!0,ct(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),s=[],i=new MediaRecorder(n,{mimeType:Gt}),i.addEventListener("dataavailable",h=>{h.data.size>0&&s.push(h.data)}),i.start()}catch(h){o=!1,t.onRecordingChange(!1);const T=h instanceof Error?h:new Error(String(h));t.onError?.(T)}}}function l(){if(!o)return;o=!1,t.onRecordingChange(!1);const h=i,T=n;!h||h.state==="inactive"||(h.addEventListener("stop",()=>{const v=new Blob(s,{type:Gt});s=[],T?.getTracks().forEach(L=>L.stop()),t.onBlob(v)},{once:!0}),h.stop(),i=null,n=null)}function d(h){h.code==="Space"&&(a(h.target)||h.repeat||(h.preventDefault(),r()))}function m(h){h.code==="Space"&&(a(h.target)||l())}function u(h){h.preventDefault(),r()}function b(){l()}return window.addEventListener("keydown",d),window.addEventListener("keyup",m),e.addEventListener("mousedown",u),e.addEventListener("mouseup",b),e.addEventListener("mouseleave",b),e.addEventListener("touchstart",u,{passive:!1}),e.addEventListener("touchend",b),{destroy(){window.removeEventListener("keydown",d),window.removeEventListener("keyup",m),e.removeEventListener("mousedown",u),e.removeEventListener("mouseup",b),e.removeEventListener("mouseleave",b),e.removeEventListener("touchstart",u),e.removeEventListener("touchend",b)}}}const qt="audio/webm;codecs=opus",Oi=512,Hi=250,zi=300,Fi=2e3,Jt={calibrationMs:1e3,noiseFloorFactor:3.5,minSpeechMs:150,hangoverMs:700,minUtteranceMs:400,maxSegmentMs:1e4};function Vi(){return{phase:"calibrating",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:0,calibMs:0,calibSum:0,calibSamples:0}}function Wi(e,t,n,i=Jt){if(e.phase==="calibrating"){const l=e.calibMs+n,d=e.calibSum+t,m=e.calibSamples+1;return l>=i.calibrationMs?{state:{phase:"idle",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:m>0?d/m:0,calibMs:l,calibSum:d,calibSamples:m},event:null}:{state:{...e,calibMs:l,calibSum:d,calibSamples:m},event:null}}const s=e.noiseFloor*i.noiseFloorFactor,o=t>=s;if(e.phase==="idle"){if(!o)return e.phaseMs===0?{state:e,event:null}:{state:{...e,phaseMs:0},event:null};const l=e.phaseMs+n;return l>=i.minSpeechMs?{state:{...e,phase:"speaking",phaseMs:0,segmentMs:l,speechMs:l},event:{type:"segment-start"}}:{state:{...e,phaseMs:l},event:null}}const a=e.segmentMs+n;if(a>=i.maxSegmentMs)return{state:{...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},event:{type:"segment-end"}};if(o){const l=e.speechMs+n;return{state:{...e,phase:"speaking",phaseMs:0,segmentMs:a,speechMs:l},event:null}}const r=e.phaseMs+n;if(r>=i.hangoverMs){const l={...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0};return e.speechMs<i.minUtteranceMs?{state:l,event:{type:"segment-dropped"}}:{state:l,event:{type:"segment-end"}}}return{state:{...e,phaseMs:r,segmentMs:a},event:null}}function ji(e){let t=0;for(let n=0;n<e.length;n++){const i=e[n]??0;t+=i*i}return Math.sqrt(t/e.length)}async function Ki(e,t=Jt){ct();const n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}});let i=!0,s=null,o=null;try{let a=function(){if(v!==null||h.length<=1)return;const E=performance.now()-Fi,M=h[0];if(M===void 0)return;const C=h.slice(1).filter(D=>D.tsMs>=E);h=[M,...C]},r=function(E){const M=v??E;v=null;const C=h.filter(R=>R.tsMs>=M&&R.tsMs<=E);if(C.length===0)return;const D=h[0],I=D!==void 0&&C[0]!==D?[D.blob,...C.map(R=>R.blob)]:C.map(R=>R.blob);e.onBlob(new Blob(I,{type:qt}))},l=function(){if(!i)return;const E=performance.now(),M=E-L;if(L=E,e.isSuppressed()){v!==null&&(v=null,T={...T,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},e.onSegmentChange(!1)),a(),requestAnimationFrame(l);return}u.getFloatTimeDomainData(b);const C=ji(b),{state:D,event:_}=Wi(T,C,M,t);T=D,_?.type==="segment-start"?(v=E-t.minSpeechMs-zi,e.onSegmentChange(!0)):_?.type==="segment-end"?(r(E),e.onSegmentChange(!1)):_?.type==="segment-dropped"&&(v=null,e.onSegmentChange(!1)),a(),requestAnimationFrame(l)};const d=window.AudioContext??window.webkitAudioContext;s=new d;const m=s.createMediaStreamSource(n),u=s.createAnalyser();u.fftSize=Oi,m.connect(u);const b=new Float32Array(u.fftSize);o=new MediaRecorder(n,{mimeType:qt});let h=[];o.addEventListener("dataavailable",E=>{E.data.size>0&&h.push({blob:E.data,tsMs:performance.now()})}),o.addEventListener("error",E=>{const M=E.error;e.onError?.(M instanceof Error?M:new Error("whisper mode: MediaRecorder error"))}),o.start(Hi);let T=Vi(),v=null,L=performance.now();requestAnimationFrame(l)}catch(a){throw i=!1,n.getTracks().forEach(r=>r.stop()),s?.close(),a instanceof Error?a:new Error(String(a))}return{stop(){i=!1,e.onSegmentChange(!1);const a=o;a&&a.state!=="inactive"&&a.stop(),n.getTracks().forEach(r=>r.stop()),s?.close()}}}const Bi="https://api.openai.com/v1/audio/transcriptions";async function Xt(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const s=await fetch(Bi,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!s.ok){const r=await s.text();return{ok:!1,text:"",status:s.status,errorBody:r}}const o=await s.json();return{ok:!0,text:typeof o=="object"&&o!==null&&"text"in o&&typeof o.text=="string"?o.text:"",status:s.status,errorBody:""}}function $i(e,t){return e.includes(t)}async function Ui(e,t,n=Q.voice.sttModel,i=Q.voice.sttFallbackModel){let s;try{s=await We(()=>Xt(e,t,n))}catch(a){throw Re(a)?new Error(_e.network):a}if(s.ok)return s.text;if(s.status>=400&&s.status<500&&$i(s.errorBody,n)){let a;try{a=await We(()=>Xt(e,t,i))}catch(r){throw Re(r)?new Error(_e.network):r}if(a.ok)return a.text;throw new Error(je(`stt failed: ${n} then ${i}`,a.status,a.errorBody))}throw new Error(je(`stt failed: ${n}`,s.status,s.errorBody))}const Yi=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}}],Gi=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".`;function qi(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,s=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof s!="number"||!Number.isFinite(s)||s<0||s>1?null:{action:"trim_sail",sail:i,trim:s}}case"report_status":return{action:"report_status"};default:return null}}const Ji="https://api.openai.com/v1/chat/completions";function Xi(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const s=i,o=typeof s.content=="string"?s.content:null,a=[],r=s.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const d=l.function;if(typeof d!="object"||d===null)continue;const m=d,u=m.name,b=m.arguments;typeof u!="string"||typeof b!="string"||a.push({name:u,argumentsJson:b})}return{content:o,toolCalls:a}}function Qi(e){try{return JSON.parse(e)}catch{return null}}async function Zi(e,t,n,i=Q.voice.intentModel){const s=t.getState(),o=`${Gi}

Current ship state:
${JSON.stringify(s)}`;let a;try{a=await We(()=>fetch(Ji,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:Yi,messages:[{role:"system",content:o},{role:"user",content:e}]})}))}catch(h){throw Re(h)?new Error(_e.network):h}if(!a.ok){const h=await a.text();throw new Error(je("intent request failed",a.status,h))}const r=await a.json(),l=Xi(r);if(l===null)throw new Error("intent request returned an unrecognizable response body");const d=l.toolCalls[0];if(d===void 0)return{crewLine:l.content??"",intent:null};const m=Qi(d.argumentsJson),u=qi(d.name,m);return u===null?{crewLine:K("unknown_order",s),intent:null}:{crewLine:(await t.submit(u)).message,intent:u}}const ea=.514444,me=Math.PI/180,ta=1;function Be(e){return-e*me}function na(e){const t=e*me;return{x:Math.sin(t),z:-Math.cos(t)}}function $e(e,t){return{x:e.x*t,z:-e.y*t}}const ut=900,Qt=18,ia=95,aa=260;function sa(e,t,n,i,s){const o=ut*(.7+Math.random()*.3),a=(Math.random()-.5)*2*aa;e.position.x=t+i.x*o+s.x*a,e.position.z=n+i.z*o+s.z*a,e.position.y=Qt+Math.random()*(ia-Qt)}function oa(e,t,n,i,s,o,a){if(e.length===0)return;const r=i+180,l=na(r),d={x:-l.x,z:-l.z},m={x:-l.z,z:l.x},u=s*ea*o,b=Be(r);for(const h of e){h.position.x+=l.x*u*a,h.position.z+=l.z*u*a,h.rotation.y=b;const T=h.position.x-t,v=h.position.z-n;T*T+v*v>ut*ut&&sa(h,t,n,d,m)}}const ra=1.4,la=6,ca=2;function da(e,t,n,i,s=Q.visuals,o={}){const{camera:a=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:d,muzzleFlash:m=null,splash:u=null}=o;let b=null,h=0,T=0,v=0;const L=220;let E=null,M=null,C="follow";const D=a!==null?a.fov:null;function _(p){C=p,typeof window<"u"&&(window.__captainViewMode=p),a!==null&&p==="follow"&&D!==null&&(a.fov=D,a.updateProjectionMatrix())}function I(p,x,g){const{worldUnitsPerMetre:y,maxHeelDeg:k,maxBraceDeg:B,heelSmoothingHz:V,boatScale:O}=s,U=b===null?0:Math.min((p-b)/1e3,.5);b=p;const W=e.getState(),wt=Be(x.headingDeg);t.rotation.y=wt,t.scale.x=O,t.scale.y=O,t.scale.z=O;const{x:q,z:Ie}=$e(x,y);if(t.position.x=q,t.position.z=Ie,n!==null){const z=Math.min(k,.05*W.windSpeedKts**2*((W.mainTrim+W.jibTrim)/2)*Math.abs(Math.sin(W.apparentWindAngle*me))),j=Math.sign(W.apparentWindAngle)*z*me,Y=U>0?1-Math.exp(-U*V):0;h+=(j-h)*Y,n.rotation.z=h}const ee=i?i():null;if(ee!==null){const z=(W.mainTrim+W.jibTrim)/2,j=Math.sign(W.apparentWindAngle)*z*B*me,Y=U>0?1-Math.exp(-U*ta):0;T+=(j-T)*Y,ee.rotation.y=T}oa(l,q,Ie,W.windDirection,W.windSpeedKts,y,U);const Ge=r?r():null;if(Ge!==null){const z=Be(W.apparentWindAngle+180),j=U>0?1-Math.exp(-U*ca):0;let Y=z-v;Y=(Y+Math.PI)%(2*Math.PI)-Math.PI,v+=Y*j;const yt=la*me*Math.sin(p/1e3*2*Math.PI*ra);Ge.rotation.y=v+yt}if(a!==null&&C==="helm"){const{helmView:z}=s;a.position.x=z.x,a.position.y=z.y,a.position.z=z.z,a.rotation.x=z.pitchDeg*me,a.rotation.y=0,a.rotation.z=0,a.fov!==z.fov&&(a.fov=z.fov,a.updateProjectionMatrix())}const H=d?d():null;if(H!==null)if(g!==null){const z=$e(g,y);H.position.x=z.x,H.position.z=z.z,H.rotation.y=Be(g.headingDeg),H.scale.x=O,H.scale.y=O,H.scale.z=O,H.visible=!0}else H.visible=!1;E!==null&&p>=E&&(m!==null&&(m.visible=!1),E=null),M!==null&&p>=M&&(u!==null&&(u.visible=!1),M=null)}function R(){_(C==="follow"?"helm":"follow")}function S(p,x,g){m!==null&&(m.position.x=x,m.position.y=90,m.position.z=g,m.visible=!0,E=p+L)}function A(p,x,g){u!==null&&(u.position.x=x,u.position.y=8,u.position.z=g,u.visible=!0,M=p+L)}return{update:I,toggleView:R,getViewMode:()=>C,triggerMuzzleFlash:S,triggerSplash:A}}const ua=500;window.__captainDriverActive=!0;const w=Ve();window.__captainAmbientRock=w.visuals.ambientRock;const ie=new Un({},w),Z=_n(ie),ce=w.battle.enabled?new _i(w.battle,w.physics,w.controls,{...ie.getPose(),windDirectionDeg:Z.getState().windDirection,windSpeedKts:Z.getState().windSpeedKts}):null,pt=document.createElement("div");pt.id="hud-root",document.body.appendChild(pt);function Zt(e){Xn(e)}function en(e){Wt(e)}function xe(e){it(e)}async function ht(e){const t=ve();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");Zt(e);const n=await Zi(e,Z,t,w.voice.intentModel);en(n.intent),xe(n.crewLine);try{await dt(n.crewLine,t,w.voice.ttsModel,w.voice.ttsVoice)}catch(i){const s=i instanceof Error?i.message:String(i);jt(`⚠ Crew voice unavailable: ${s}`)}}const pa=Jn(pt,Z,{injectTranscript:ht,setWhisperMode:e=>{e?an():ba()},setTtsVoice:e=>{w.voice.ttsVoice=e},isPipelineBusy:()=>fe});async function ha(e){const t=await Z.submit(e);return Qn(e,t.message),t}const Se=document.getElementById("demo");let mt=!1;function ma(e){return new Promise(t=>setTimeout(t,e))}const ga=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function tn(){if(!mt){mt=!0,Se&&(Se.disabled=!0);try{for(const e of ga){Zt(`[demo] ${e.label}`);const t=await Z.submit(e.intent);en(e.intent),xe(t.message);const n=ve();n!==null&&n.length>0&&dt(t.message,n,w.voice.ttsModel,w.voice.ttsVoice).catch(()=>{}),await ma(e.waitMs)}}finally{mt=!1,Se&&(Se.disabled=!1)}}}Se&&Se.addEventListener("click",()=>{tn()});const ge=document.getElementById("ptt");let fe=!1;async function nn(e){const t=ve();if(t===null||t.length===0){xe("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await Ui(e,t,w.voice.sttModel,w.voice.sttFallbackModel);await ht(n)}catch(n){const i=n instanceof Error?n.message:String(n);xe(i)}}let be=!1,gt=null,De=!1;function Ue(){be?(ge.textContent=De?"Listening… (capturing)":"Listening…",ge.classList.toggle("recording",De),ge.classList.toggle("listening",!De)):(ge.textContent="Hold to Talk",ge.classList.remove("recording","listening"))}async function fa(e){fe=!0;try{await nn(e)}finally{fe=!1}}async function an(){if(!be)try{gt=await Ki({onBlob:e=>{fa(e)},onSegmentChange:e=>{De=e,Ue()},onError:e=>{xe(e.message)},isSuppressed:()=>fe||Pi(ua)}),be=!0,st(!0),Ue()}catch(e){throw be=!1,st(!1),Ue(),e instanceof Error?e:new Error(String(e))}}function ba(){be&&(be=!1,De=!1,gt?.stop(),gt=null,st(!1),Ue())}Li(ge,{onRecordingChange:e=>{ge.classList.toggle("recording",e)},onBlob:e=>{fe=!0,nn(e).finally(()=>{fe=!1})},onError:e=>{xe(e.message)},canStart:()=>!fe&&!be}),Vt().then(()=>{ei(),Zn(),w.voice.whisperMode&&an().catch(()=>{w.voice.whisperMode=!1,jt("Microphone unavailable — switched to push-to-talk. Enable Whisper again anytime in ⚙ command config.")})});const ae=window.DEMO;if(ae===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const Ee=da(Z,ae.ms_GroupShip,ae.ms_BlackPearlShip,()=>window.DEMO?.ms_Sails??null,w.visuals,{camera:ae.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:ae.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,muzzleFlash:ae.ms_MuzzleFlash,splash:ae.ms_Splash}),sn=10/12,wa=350,ya=1400,on=1.6,va=4.2,rn=.2,xa=.9;function Sa(e){const t=e*sn,n=9.81,i=.84,s=Math.max(t,.1),o=n*(i/s)**2,a=2*Math.PI/o,r=Math.min(ya,Math.max(wa,a*2)),l=Math.min(1,Math.max(0,e/40)),d=on+l*(va-on),m=rn+l*(xa-rn);return{size:r,choppiness:d,directionality:m}}function ln(e){return 1+Math.min(1,Math.max(0,e))*3}function ft(){ie.setWind(w.environment.windDirectionDeg,w.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(w.environment.windDirectionDeg+180)*Math.PI/180,n=w.environment.windSpeedKts*sn;if(e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,w.visuals.seaStateFollowsWind){const i=Sa(w.environment.windSpeedKts);e.ms_Ocean.size=i.size,e.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=i.choppiness,e.ms_Ocean.directionality=ln(i.directionality)}e.ms_Ocean.changed=!0}function cn(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(he(w,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),he(w,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),he(w,"visuals.lighting.sunIntensity",e.sunIntensity),he(w,"visuals.lighting.ambientIntensity",e.ambientIntensity),he(w,"visuals.lighting.exposure",e.exposure),he(w,"visuals.lighting.fogDensity",e.fogDensity))}function Ea(){window.DEMO?.SetLightingParams(w.visuals.lighting)}!(window.location.hash.length>1)&&ae.ms_Environment!==w.environment.skyPreset&&ae.UpdateEnvironment(w.environment.skyPreset),cn(),ft();function Ma(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function ka(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Ta(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function Ca(e,t){switch(he(w,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=ln(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&ft();break;case"visuals.waterColor":{const n=Ma(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":ka(t);break;case"visuals.streakOpacity":Ta(t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":ft();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),cn();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Ea();break}}ti(Ca);const Ae=document.getElementById("view-toggle");function dn(e){return e==="helm"?"Follow Cam":"Helm View"}function un(){Ee.toggleView(),Ae&&(Ae.textContent=dn(Ee.getViewMode()))}Ae&&(Ae.textContent=dn(Ee.getViewMode()),Ae.addEventListener("click",()=>{un()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}un()});const Ne=document.createElement("div");Ne.id="battle-hit-flash",Ne.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(Ne);let Ye=null;const _a=180;function Ra(){Ye!==null&&clearTimeout(Ye),Ne.style.opacity="0.35",Ye=setTimeout(()=>{Ne.style.opacity="0",Ye=null},_a)}const pn=15;let bt=null;function hn(e){if(bt!==null){const o=e-bt;if(ie.tick(o),ce){const a=ie.getPose(),r=Z.getState(),l=ce.tick(o,{...a,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(ie.setDriveMultiplier(ce.getSpeedMultiplier()),l.some(d=>d.key==="enemy_fires")){const d=ce.getView().npc,m=$e({x:d.x,y:d.y},w.visuals.worldUnitsPerMetre);if(Ee.triggerMuzzleFlash(e,m.x,m.z),l.some(u=>u.key==="hit_taken"))Ra();else{const u=d.x-a.x,b=d.y-a.y,h=Math.hypot(u,b)||1,T={x:a.x+u/h*pn,y:a.y+b/h*pn},v=$e(T,w.visuals.worldUnitsPerMetre);Ee.triggerSplash(e,v.x,v.z)}}for(const d of l){const m=K(d.key,r,d);it(m);const u=ve();u!==null&&u.length>0&&dt(m,u,w.voice.ttsModel,w.voice.ttsVoice).catch(()=>{})}}}bt=e;const t=ie.getPose(),n={x:t.x,y:t.y,headingDeg:Z.getState().heading},i=ce?ce.getView().npc:null,s=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;Ee.update(e,n,s),pa.update(),requestAnimationFrame(hn)}requestAnimationFrame(hn),window.__captain={bus:Z,submitIntent:ha,injectTranscript:ht,setWind:(e,t)=>{ie.setWind(e,t)},demo:tn,getConfig:()=>w,copyConfig:()=>{const e=JSON.stringify(w,null,2);return console.log(e),e},setConfig:e=>{It(e),location.reload()},resetConfig:()=>{Pt(),location.reload()},getPlayerPose:()=>ie.getPose(),get battle(){return ce?ce.getView():null}}})();
