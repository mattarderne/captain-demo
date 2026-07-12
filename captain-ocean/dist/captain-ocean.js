(function(){"use strict";function Ze(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function Qe(e){return e.toFixed(1)}function V(e,t){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const n=Ze(t.heading),i=Qe(t.speedKts),o=Ze(t.windDirection),s=Qe(t.windSpeedKts);let a=`Steering ${n} at ${i} knots, wind ${o} at ${s}, sir.`;return t.inIrons&&(a+=" She's in irons."),a}default:{const n=e;throw new Error(`unhandled message key: ${String(n)}`)}}}const Bt=-35,Ut=35,Yt=0,Gt=1,Jt=1;function qt(e){return e==="main"||e==="jib"||e==="all"}function te(e,t){return{ok:!1,message:e,state:t}}function de(e,t){return{ok:!0,message:e,state:t}}function Xt(e){function t(i){const o=i.action;if(o==="helm"){const s=i.degrees;if(typeof s!="number"||!Number.isFinite(s)||s<Bt||s>Ut)return Promise.resolve(te(V("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:s}).accepted)return Promise.resolve(te(V("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Jt?Promise.resolve(de(V("no_steerage_way",l),l)):s>0?Promise.resolve(de(V("helm_ack_starboard",l),l)):s<0?Promise.resolve(de(V("helm_ack_port",l),l)):Promise.resolve(de(V("helm_ack_amidships",l),l))}if(o==="trim_sail"){const s=i.sail,a=i.trim;if(!qt(s))return Promise.resolve(te(V("unknown_order",e.snapshot()),e.snapshot()));if(typeof a!="number"||!Number.isFinite(a)||a<Yt||a>Gt)return Promise.resolve(te(V("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:s,trim:a}).accepted)return Promise.resolve(te(V("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot(),m=s==="main"?"trim_ack_main":s==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(de(V(m,r),r))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(te(V("unknown_order",e.snapshot()),e.snapshot()));const a=e.snapshot();return Promise.resolve(de(V("status",a),a))}return Promise.resolve(te(V("unknown_order",e.snapshot()),e.snapshot()))}function n(){return e.snapshot()}return{submit:t,getState:n}}const Pe=1.94384,fe=180/Math.PI,$=Math.PI/180;function et(e){return e*Pe}function ze(e){return e/Pe}function Zt(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function be(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function ne(e,t,n){return e<t?t:e>n?n:e}const Qt=0,en=12;function tn(e={}){return{x:0,y:0,psi:be((e.heading??0)*$),u:ze(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*$,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:be((e.windDirection??Qt)*$),windSpeedMs:ze(e.windSpeedKts??en)}}const we=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],nn=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],on=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function an(e,t,n){return e+(t-e)*n}function tt(e,t){const n=ne(t,0,180);let i=0;for(;i<we.length-1&&we[i+1]<=n;)i++;const o=Math.min(i+1,we.length-1),s=we[i],a=we[o],l=a===s?0:(n-s)/(a-s);return an(e[i],e[o],l)}function sn(e){return{cl:tt(nn,e),cd:tt(on,e)}}function rn(e){const t=ne(Math.abs(e),0,180),{cl:n,cd:i}=sn(t),o=t*$,s=Math.sin(o),a=Math.cos(o),l=n*s-i*a,r=Math.abs(n*a+i*s);return{cDrive:l,cSide:r}}const nt=.95,ln=.2;function cn(e){const t=ne(Math.abs(e),0,180)/180;return ne(nt-(nt-ln)*t*t,.15,1)}const dn=.65;function un(e,t){const n=(e-cn(t))/dn;return Math.max(0,1-n*n)}const K={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:12,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx",whisperMode:!0},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:64,streakOpacity:.35,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6}}},ue="captain.config";function q(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function pn(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function it(e,t,n,i){for(const o of Object.keys(t)){const s=t[o];if(!(o in e)){i.push(`${n}${o} (unknown key)`);continue}const a=e[o];q(a)&&q(s)?it(a,s,`${n}${o}.`,i):q(a)||q(s)||typeof a!=typeof s?i.push(`${n}${o} (expected ${typeof a}, got ${typeof s})`):e[o]=s}}function ot(e,t){const n={...e};for(const i of Object.keys(t)){const o=t[i],s=n[i];n[i]=q(s)&&q(o)?ot(s,o):o}return n}function Ne(){return typeof localStorage<"u"}function hn(){if(!Ne())return{};const e=localStorage.getItem(ue);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return q(t)?t:{}}catch{return{}}}function Ve(){const e=pn(K);if(!Ne())return e;const t=localStorage.getItem(ue);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${ue}"] is not valid JSON — ignoring it, using defaults.`),e}if(!q(n))return console.warn(`captain.config: stored value in localStorage["${ue}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return it(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function at(e){if(!Ne())return;const t=hn(),n=ot(t,e);localStorage.setItem(ue,JSON.stringify(n))}function st(){Ne()&&localStorage.removeItem(ue)}function ie(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let s=e;for(let a=0;a<i.length-1;a++){const l=i[a];if(l===void 0||(s=s?.[l],s==null))return}s!=null&&(s[o]=n)}const mn=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"voice.whisperMode",label:"Whisper mode (hands-free) by default",section:"Voice",type:"boolean",live:!1,note:"Live toggle lives in the ⚙ command-config popover next to the quarterdeck log; this only sets next boot's default."},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, the three 'manual' sliders above are overwritten from wind speed every time wind changes."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:64,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."}],gn=K.controls.rudderMaxDeg*$,fn=K.physics;function rt(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),a=-e.windSpeedMs*Math.cos(e.windFromRad),l=s-i,r=a-o,m=Math.hypot(l,r),u=l*t+r*n,g=l*n-r*t;return{awaDeg:Math.atan2(-g,-u)*fe,awsMs:m}}function lt(e,t,n,i,o){const s=Math.abs(n),{cDrive:a,cSide:l}=rn(s),r=un(t,s),m=.5*o*i*i,u=m*e*a*r,g=m*e*l*r,v=-Math.sign(n||1)*g;return{surge:u,sway:v}}function bn(e,t,n=fn,i=gn){const{awaDeg:o,awsMs:s}=rt(e),a=lt(n.areaMain,e.mainTrim,o,s,n.rhoAir),l=lt(n.areaJib,e.jibTrim,o,s,n.rhoAir),r=a.surge+l.surge,m=a.sway+l.sway,u=e.u,g=e.v,v=e.r,h=u>=0?n.kSurgeLin:n.kSurgeLinAstern,M=-n.kSurgeQuad*u*Math.abs(u)-h*u,x=-n.kSwayQuad*g*Math.abs(g)-n.kSwayLin*g,L=ne(e.rudder,-i,i),E=n.cRudder*L*u*Math.abs(u),_=-(n.kYawDamp+n.kYawDampU*Math.abs(u))*v,C=n.cWeather*Math.sin(o*$)*s*Math.min(1,Math.abs(u)),S=E+_+C,T=(r+M)/n.mass+g*v,I=(m+x)/n.mass-u*v,f=S/n.izz;e.u=u+T*t,e.v=g+I*t,e.r=v+f*t;const R=Math.sin(e.psi),d=Math.cos(e.psi),b=e.u*R+e.v*d,p=e.u*d-e.v*R;e.x+=b*t,e.y+=p*t,e.psi=be(e.psi+e.r*t)}function ct(e){return Math.hypot(e.u,e.v)*Pe}function wn(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t;return be(Math.atan2(i,o))}function yn(e){return ct(e)<.2?0:Zt(e.psi-wn(e))*fe}const ye=.05,dt=ye*1e3;function We(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class vn{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=K){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*$,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*$,this.state=tn({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=ne(t.degrees*$,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=ne(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=dt;)this.state.rudder=We(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*ye),this.state.mainTrim=We(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*ye),this.state.jibTrim=We(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*ye),bn(this.state,ye,this.physics,this.rudderMaxRad),this.accMs-=dt}snapshot(){const{awaDeg:t,awsMs:n}=rt(this.state),i=ct(this.state);return{heading:this.state.psi*fe%360,speedKts:i,windDirection:this.state.windFromRad*fe%360,windSpeedKts:et(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:et(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*fe,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:yn(this.state)}}setWind(t,n){this.state.windFromRad=be(t*$),this.state.windSpeedMs=ze(n)}}const je="captain.openai_key",xn="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function ve(){return window.localStorage.getItem(je)}function ut(e){window.localStorage.setItem(je,e)}function En(){window.localStorage.removeItem(je)}function pt(e=document.body){const t=ve();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const o=document.createElement("div");o.style.background="#0e1f2e",o.style.color="#e8f4ff",o.style.padding="20px 24px",o.style.borderRadius="6px",o.style.maxWidth="360px",o.style.display="flex",o.style.flexDirection="column",o.style.gap="10px";const s=document.createElement("div");s.textContent="OpenAI API key",s.style.fontSize="15px",s.style.fontWeight="bold";const a=document.createElement("p");a.id="byok-copy",a.textContent=xn,a.style.margin="0",a.style.fontSize="12px",a.style.opacity="0.85";const l=document.createElement("input");l.id="byok-key-input",l.type="password",l.placeholder="sk-...",l.autocomplete="off",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 8px";const r=document.createElement("button");r.id="byok-save",r.type="button",r.textContent="Save",r.style.fontFamily="inherit",r.style.fontSize="13px",r.style.padding="6px 10px",r.style.cursor="pointer";function m(){const u=l.value.trim();u.length!==0&&(ut(u),i.remove(),n(u))}r.addEventListener("click",m),l.addEventListener("keydown",u=>{u.key==="Enter"&&m()}),o.appendChild(s),o.appendChild(a),o.appendChild(l),o.appendChild(r),i.appendChild(o),e.appendChild(i),l.focus()})}const Sn=["alloy","ash","ballad","coral","echo","fable","nova","onyx","sage","shimmer","verse"];function Mn(e,t,n){e.innerHTML="",zn();const i=document.createElement("div");i.id="hud",e.appendChild(i);const o=document.createElement("div");o.className="hud-panel hud-state",i.appendChild(o);const s=document.createElement("div");s.className="hud-panel-title",s.textContent="Ship State",o.appendChild(s);function a(c,y,A=!1){const D=document.createElement("div");D.id=c,D.className="hud-row";const G=document.createElement("span");G.className="hud-row-label",G.textContent=y,D.appendChild(G);const ee=document.createElement("span");ee.className="hud-row-colon",ee.textContent=": ",D.appendChild(ee);const J=document.createElement("span");J.className="hud-row-value",J.textContent="--",D.appendChild(J);let F=null;if(A){const H=document.createElement("div");H.className="hud-bar",F=document.createElement("div"),F.className="hud-bar-fill",H.appendChild(F),D.appendChild(H)}return o.appendChild(D),{setValue:H=>{J.textContent=H},setFill:F?H=>{F&&(F.style.width=`${Math.max(0,Math.min(100,H))}%`)}:void 0}}const l=a("hud-heading","heading"),r=a("hud-speed","speed"),m=a("hud-wind","wind"),u=a("hud-awa","awa"),g=a("hud-main","main",!0),v=a("hud-jib","jib",!0),h=a("hud-rudder","rudder"),M="http://www.w3.org/2000/svg";function x(c,y){const A=document.createElementNS(M,c);for(const[D,G]of Object.entries(y))A.setAttribute(D,G);return A}const L=document.getElementById("hud-wind"),E=document.createElement("div");E.id="hud-windvane",E.className="hud-windvane";const _=x("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});_.appendChild(x("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),_.appendChild(x("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const C=x("g",{class:"hud-windvane-arrow"});C.appendChild(x("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),C.appendChild(x("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),_.appendChild(C),_.appendChild(x("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),E.appendChild(_),L.appendChild(E);const S=document.getElementById("hud-rudder"),T=document.createElement("div");T.className="hud-gauge";const I=document.createElement("div");I.className="hud-gauge-center-tick",T.appendChild(I);const f=document.createElement("div");f.className="hud-gauge-target",T.appendChild(f);const R=document.createElement("div");R.className="hud-gauge-needle",T.appendChild(R),S.appendChild(T);let d=null;function b(c){return(Math.max(-35,Math.min(35,c))+35)/70*100}function p(c){const y=b(c);R.style.left=`${y}%`,R.classList.toggle("port",c<-.5),R.classList.toggle("stbd",c>.5),d!==null&&Math.abs(c-d)>.5?(f.style.left=`${b(d)}%`,f.style.display="block"):f.style.display="none"}const w=document.createElement("div");w.id="hud-irons",w.className="hud-irons-row";const N=document.createElement("span");N.className="hud-visually-hidden",N.textContent="irons: false",w.appendChild(N),o.appendChild(w);const z=document.createElement("div");z.className="hud-panel hud-log",i.appendChild(z);const O=document.createElement("div");O.className="hud-log-header",z.appendChild(O);const U=document.createElement("div");U.className="hud-panel-title hud-log-title-text",U.textContent="Quarterdeck Log",O.appendChild(U);const W=document.createElement("button");W.id="command-config-toggle",W.type="button",W.title="Voice & key settings",W.setAttribute("aria-label","Command config"),W.textContent="⚙",W.className="hud-btn hud-command-config-toggle",O.appendChild(W);const P="captain.whisper_notice_dismissed";function le(){try{return window.localStorage.getItem(P)==="1"}catch{return!1}}function Y(){try{window.localStorage.setItem(P,"1")}catch{}}const B=document.createElement("div");B.id="whisper-notice",B.className="hud-whisper-notice",B.hidden=!0;const zt=document.createElement("span");zt.textContent="Hands-free Whisper mode is on — a live test of how well Whisper speech-to-text handles your orders. Allow the microphone and just speak: “helm a-starboard”, “ease the main”. Prefer buttons? Switch to push-to-talk in the ⚙ command config.",B.appendChild(zt);const ce=document.createElement("button");ce.id="whisper-notice-dismiss",ce.type="button",ce.textContent="×",ce.setAttribute("aria-label","Dismiss"),ce.className="hud-whisper-notice-dismiss",ce.addEventListener("click",()=>{B.hidden=!0,Y()}),B.appendChild(ce),z.appendChild(B);function Li(){le()||(B.hidden=!1)}const Z=document.createElement("div");Z.id="hud-log-list",Z.className="hud-log-list",z.appendChild(Z);const Vt=6,j=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function Me(){Z.innerHTML="";let c=-1;j.forEach((y,A)=>{y.kind==="exchange"&&(c=A)}),j.forEach((y,A)=>{const D=document.createElement("div");if(D.style.opacity=String(.45+.55*((A+1)/j.length)),y.kind==="system"){D.className="hud-log-entry hud-log-system-entry";const H=document.createElement("div");H.className="hud-log-system",H.textContent=`⚠ ${y.transcript}`,D.appendChild(H),Z.appendChild(D);return}const G=A===c;D.className="hud-log-entry";const ee=document.createElement("div");ee.className="hud-log-you",G&&(ee.id="hud-transcript"),ee.textContent=`You: ${y.transcript}`,D.appendChild(ee);const J=document.createElement("div");J.className="hud-log-order",G&&(J.id="hud-intent"),J.textContent=y.order,D.appendChild(J);const F=document.createElement("div");F.className="hud-log-crew",G&&(F.id="hud-crew"),F.textContent=`Crew: ${y.crew}`,D.appendChild(F),Z.appendChild(D)}),Z.scrollTop=Z.scrollHeight}Me();function Oi(c){if(c===null)return"→ no order";if(c.action==="helm"){const y=Math.round(c.degrees),A=y<0?"port":y>0?"stbd":"amidships";return`→ helm ${y}° (${A})`}return c.action==="trim_sail"?`→ trim ${c.sail} → ${c.trim.toFixed(2)}`:"→ status report"}function Pi(c){j.push({kind:"exchange",transcript:c,order:"→ …",crew:"…"}),j.length>Vt&&j.shift(),Me()}function zi(c){const y=[...j].reverse().find(A=>A.kind==="exchange");y&&(y.order=Oi(c)),c!==null&&c.action==="helm"&&(d=c.degrees),Me()}function Wt(c){const y=[...j].reverse().find(A=>A.kind==="exchange");y&&(y.crew=c),Me()}function Vi(c){j.push({kind:"system",transcript:c,order:"",crew:""}),j.length>Vt&&j.shift(),Me()}const Le=document.createElement("div");Le.className="hud-controls",z.appendChild(Le);const Q=document.createElement("input");Q.id="transcript-input",Q.type="text",Q.placeholder="Type an order and press Enter…",Q.className="hud-input",Le.appendChild(Q);const ke=document.createElement("div");ke.className="hud-button-row",Le.appendChild(ke);const Ce=document.createElement("button");Ce.id="ptt",Ce.type="button",Ce.textContent="Hold to Talk",Ce.className="hud-btn hud-btn-ptt",ke.appendChild(Ce);const Te=document.createElement("button");Te.id="demo",Te.type="button",Te.textContent="Run Demo",Te.className="hud-btn hud-btn-demo",ke.appendChild(Te);const _e=document.createElement("button");_e.id="view-toggle",_e.type="button",_e.textContent="Helm View",_e.className="hud-btn hud-btn-view-toggle",ke.appendChild(_e),Ln(i);const Wi=Pn(z,W,n);Q.addEventListener("keydown",c=>{if(c.key!=="Enter")return;const y=Q.value.trim();y.length!==0&&(Q.value="",n.injectTranscript(y).catch(A=>{const D=A instanceof Error?A.message:String(A);Wt(D)}))});function Oe(c){return c.toFixed(1)}function jt(c){return c.toFixed(2)}const ji=["N","NE","E","SE","S","SW","W","NW"];function Ft(c){return(c%360+360)%360}function Ht(c){const y=Math.round(Ft(c)/45)%8;return ji[y]??"N"}function $t(c){return String(Math.round(Ft(c))%360).padStart(3,"0")}function Fi(c){return`${$t(c)} ${Ht(c)}`}function Hi(c,y){return`from ${$t(c)} @ ${Oe(y)} kts (${Ht(c)})`}function $i(c,y){const A=Math.round(c);if(A===0)return`dead ahead @ ${Oe(y)} kts`;const D=A<0?"port":"starboard";return`${Math.abs(A)}° to ${D} @ ${Oe(y)} kts`}function Ki(c){const y=Math.round(c),A=y<0?"port":y>0?"stbd":"amidships";return`${y}° ${A}`}function Bi(c){l.setValue(Fi(c.heading)),r.setValue(`${Oe(c.speedKts)} kts`),m.setValue(Hi(c.windDirection,c.windSpeedKts)),C&&C.setAttribute("transform",`rotate(${c.windDirection-c.heading} 20 20)`),u.setValue($i(c.apparentWindAngle,c.apparentWindKts)),g.setValue(jt(c.mainTrim)),g.setFill?.(c.mainTrim*100),v.setValue(jt(c.jibTrim)),v.setFill?.(c.jibTrim*100),h.setValue(Ki(c.rudderAngle)),p(c.rudderAngle),N.textContent=`irons: ${c.inIrons}`,w.classList.toggle("active",c.inIrons)}function Kt(){Bi(t.getState())}return Kt(),xe={logTranscript:Pi,logIntent:zi,logCrewLine:Wt,logSystemNote:Vi},Fe={showNotice:Li,setVoiceModeChecked:Wi.setWhisperModeChecked},{update:Kt}}let xe=null;function kn(e){xe?.logTranscript(e)}function ht(e){xe?.logIntent(e)}function mt(e){xe?.logCrewLine(e)}function Cn(e){xe?.logSystemNote(e)}function Tn(e,t){ht(e),mt(t)}let Fe=null;function _n(){Fe?.showNotice()}function He(e){Fe?.setVoiceModeChecked(e)}let gt=[];function Nn(e){gt.push(e)}function Rn(e,t){for(const n of gt)n(e,t)}function An(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function Dn(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function In(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let s=e;for(let a=0;a<i.length-1;a++){const l=i[a];if(l===void 0)return;const r=s[l];(typeof r!="object"||r===null)&&(s[l]={}),s=s[l]}s[o]=n}function ft(e,t){const n={...e};for(const i of Object.keys(t)){const o=e[i],s=t[i];o!==null&&typeof o=="object"&&!Array.isArray(o)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=ft(o,s):n[i]=s}return n}function Ln(e){const t=Ve(),n={};let i=!1;const o=new Map,s=document.createElement("button");s.id="settings-toggle",s.type="button",s.title="Settings (S)",s.setAttribute("aria-label","Settings"),s.textContent="⚙",s.className="hud-btn hud-settings-toggle",e.appendChild(s);const a=document.createElement("div");a.id="settings-panel",a.className="hud-panel hud-settings-panel",e.appendChild(a);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",a.appendChild(l);const r=document.createElement("div");r.className="hud-settings-reload-banner",r.hidden=!0,r.textContent="Some changes need Save & Reload to take effect.",a.appendChild(r);function m(){r.hidden=!i}function u(d,b){if(In(n,d.path,b),d.live)Rn(d.path,b);else{const p=o.get(d.path);p&&(p.hidden=!1),i=!0,m()}}function g(d,b){const p=document.createElement("div");p.className="hud-settings-control-row";const w=document.createElement("input");w.type="range",w.min=String(d.min??0),w.max=String(d.max??100),w.step=String(d.step??1),w.value=String(b),w.className="hud-settings-range";const N=document.createElement("input");N.type="number",N.min=w.min,N.max=w.max,N.step=w.step,N.value=String(b),N.className="hud-settings-numeric";const z=d.min??-1/0,O=d.max??1/0;function U(W){if(!Number.isFinite(W))return;const P=Math.min(O,Math.max(z,W));w.value=String(P),N.value=String(P),u(d,P)}return w.addEventListener("input",()=>U(Number(w.value))),N.addEventListener("input",()=>U(Number(N.value))),p.appendChild(w),p.appendChild(N),p}function v(d,b){const p=document.createElement("label");p.className="hud-settings-checkbox-label";const w=document.createElement("input");return w.type="checkbox",w.checked=b,w.addEventListener("change",()=>u(d,w.checked)),p.appendChild(w),p}function h(d,b){const p=document.createElement("select");p.className="hud-settings-select";for(const w of d.options??[]){const N=document.createElement("option");N.value=w,N.textContent=w,w===b&&(N.selected=!0),p.appendChild(N)}return p.addEventListener("change",()=>u(d,p.value)),p}function M(d,b){const p=document.createElement("input");return p.type="color",p.className="hud-settings-color",p.value=b,p.addEventListener("input",()=>u(d,p.value)),p}function x(d,b){const p=document.createElement("input");return p.type="text",p.className="hud-settings-text",p.value=b,p.addEventListener("change",()=>u(d,p.value)),p}function L(d){const b=document.createElement("div");b.className="hud-settings-field",b.dataset.configPath=d.path;const p=document.createElement("div");p.className="hud-settings-label-row";const w=document.createElement("span");if(w.className="hud-settings-label",w.textContent=d.label,p.appendChild(w),!d.live){const O=document.createElement("span");O.className="hud-settings-reload-dot",O.title="Staged — needs Save & Reload",O.hidden=!0,p.appendChild(O),o.set(d.path,O)}b.appendChild(p);const N=Dn(t,d.path);let z;switch(d.type){case"number":z=g(d,N);break;case"boolean":z=v(d,N);break;case"select":z=h(d,N);break;case"color":z=M(d,N);break;default:z=x(d,N);break}if(b.appendChild(z),d.note){const O=document.createElement("div");O.className="hud-settings-note",O.textContent=d.note,b.appendChild(O)}return b}const E=new Map;for(const d of mn)E.has(d.section)||E.set(d.section,[]),E.get(d.section)?.push(d);const _=new Set(["Visuals","Environment","Lighting"]);for(const[d,b]of E){const p=document.createElement("details");p.className="hud-settings-section",p.open=_.has(d);const w=document.createElement("summary");w.textContent=d,p.appendChild(w);for(const N of b)p.appendChild(L(N));a.appendChild(p)}const C=document.createElement("div");C.className="hud-settings-footer";const S=document.createElement("button");S.id="settings-save-reload",S.type="button",S.textContent="Save & Reload",S.className="hud-btn",S.addEventListener("click",()=>{at(n),location.reload()});const T=document.createElement("button");T.id="settings-copy-json",T.type="button",T.textContent="Copy JSON",T.className="hud-btn",T.addEventListener("click",()=>{(async()=>{const d=ft(t,n),b=JSON.stringify(d,null,2);console.log(b);try{await navigator.clipboard?.writeText(b)}catch{}})()});const I=document.createElement("button");I.id="settings-reset-all",I.type="button",I.textContent="Reset All",I.className="hud-btn",I.addEventListener("click",()=>{st(),location.reload()}),C.appendChild(S),C.appendChild(T),C.appendChild(I),a.appendChild(C);let f=!1;function R(d){f=d,a.classList.toggle("open",d),s.classList.toggle("active",d)}s.addEventListener("click",()=>R(!f)),document.addEventListener("keydown",d=>{d.key!=="s"&&d.key!=="S"||An(document.activeElement)||R(!f)})}function On(e){return e.length<=4?"•".repeat(e.length):`sk-…${e.slice(-4)}`}function Pn(e,t,n){const i=Ve(),o=document.createElement("div");o.id="command-config",o.className="hud-panel hud-command-config",e.appendChild(o);function s(f){const R=document.createElement("div");return R.className="hud-command-config-section-title",R.textContent=f,R}o.appendChild(s("Voice Mode"));const a=document.createElement("div");a.className="hud-segmented";const l=document.createElement("label");l.className="hud-segmented-option";const r=document.createElement("input");r.type="radio",r.name="voice-mode",r.id="voice-mode-ptt",l.appendChild(r),l.appendChild(document.createTextNode("Push to talk"));const m=document.createElement("label");m.className="hud-segmented-option";const u=document.createElement("input");u.type="radio",u.name="voice-mode",u.id="voice-mode-whisper",m.appendChild(u),m.appendChild(document.createTextNode("Whisper (hands-free)")),u.checked=i.voice.whisperMode,r.checked=!i.voice.whisperMode,r.addEventListener("change",()=>{r.checked&&n.setWhisperMode(!1)}),u.addEventListener("change",()=>{u.checked&&n.setWhisperMode(!0)}),a.appendChild(l),a.appendChild(m),o.appendChild(a),o.appendChild(s("Crew Voice"));const g=document.createElement("div");g.className="hud-command-config-row";const v=document.createElement("label");v.className="hud-toggle-label";const h=document.createElement("input");h.id="tts-enabled",h.type="checkbox",h.checked=!1,v.appendChild(h),v.appendChild(document.createTextNode("Speak crew replies")),g.appendChild(v);const M=document.createElement("select");M.id="tts-voice-select",M.className="hud-settings-select hud-command-config-voice-select";for(const f of Sn){const R=document.createElement("option");R.value=f,R.textContent=f,f===i.voice.ttsVoice&&(R.selected=!0),M.appendChild(R)}M.addEventListener("change",()=>n.setTtsVoice(M.value)),g.appendChild(M),o.appendChild(g),o.appendChild(s("OpenAI Key"));const x=document.createElement("div");x.id="key-masked",x.className="hud-key-masked";function L(){const f=ve();x.textContent=f!==null&&f.length>0?On(f):"(no key stored)"}L(),o.appendChild(x);const E=document.createElement("div");E.className="hud-command-config-row";const _=document.createElement("input");_.id="key-input",_.type="password",_.placeholder="sk-...",_.autocomplete="off",_.className="hud-settings-text",E.appendChild(_);const C=document.createElement("button");C.id="key-save",C.type="button",C.textContent="Save",C.className="hud-btn",C.addEventListener("click",()=>{const f=_.value.trim();f.length!==0&&(ut(f),_.value="",L())}),E.appendChild(C);const S=document.createElement("button");S.id="key-clear",S.type="button",S.textContent="Clear",S.className="hud-btn",S.addEventListener("click",()=>{En(),L(),I(!1),pt().then(()=>L())}),E.appendChild(S),o.appendChild(E);let T=!1;function I(f){T=f,o.classList.toggle("open",T),t.classList.toggle("active",T),T&&L()}return t.addEventListener("click",()=>I(!T)),document.addEventListener("mousedown",f=>{if(!T)return;const R=f.target;o.contains(R)||t.contains(R)||I(!1)}),document.addEventListener("keydown",f=>{f.key==="Escape"&&T&&I(!1)}),{setWhisperModeChecked:f=>{u.checked=f,r.checked=!f}}}function zn(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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

.hud-log-list {
  max-height: 240px;
  overflow-y: auto;
  pointer-events: auto;
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

.hud-controls {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.14);
  pointer-events: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.hud-input {
  width: 100%;
  box-sizing: border-box;
  font-family: inherit;
  font-size: 12.5px;
  color: #eaf6ff;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 4px;
  padding: 6px 8px;
}
.hud-input::placeholder {
  color: rgba(232, 244, 255, 0.4);
}
.hud-input:focus {
  outline: none;
  border-color: #58c4ff;
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
`,document.head.appendChild(e)}const Vn="https://api.openai.com/v1/audio/speech",Wn="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let X=null,Re=null;function jn(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function Fn(e){return X!==null?!0:Re===null?!1:performance.now()-Re<e}function $e(){X!==null&&(X.pause(),X.src="",X=null,Re=performance.now())}async function bt(e,t,n=K.voice.ttsModel,i=K.voice.ttsVoice){if(e.trim().length===0||!jn())return;$e();const o=await fetch(Vn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:Wn})});if(!o.ok){const u=await o.text();throw new Error(`tts request failed (${o.status}): ${u}`)}const s=await o.arrayBuffer(),a=new Blob([s],{type:"audio/mpeg"}),l=URL.createObjectURL(a),r=new Audio(l);X=r;const m=()=>{URL.revokeObjectURL(l),X===r&&(X=null,Re=performance.now())};r.addEventListener("ended",m,{once:!0}),r.addEventListener("error",m,{once:!0}),await r.play()}const wt="audio/webm;codecs=opus";function Hn(e,t){let n=null,i=null,o=[],s=!1;function a(h){if(!(h instanceof HTMLElement))return!1;const M=h.tagName;return M==="INPUT"||M==="SELECT"||M==="TEXTAREA"||h.isContentEditable}async function l(){if(!s&&!(t.canStart&&!t.canStart())){s=!0,$e(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),o=[],i=new MediaRecorder(n,{mimeType:wt}),i.addEventListener("dataavailable",h=>{h.data.size>0&&o.push(h.data)}),i.start()}catch(h){s=!1,t.onRecordingChange(!1);const M=h instanceof Error?h:new Error(String(h));t.onError?.(M)}}}function r(){if(!s)return;s=!1,t.onRecordingChange(!1);const h=i,M=n;!h||h.state==="inactive"||(h.addEventListener("stop",()=>{const x=new Blob(o,{type:wt});o=[],M?.getTracks().forEach(L=>L.stop()),t.onBlob(x)},{once:!0}),h.stop(),i=null,n=null)}function m(h){h.code==="Space"&&(a(h.target)||h.repeat||(h.preventDefault(),l()))}function u(h){h.code==="Space"&&(a(h.target)||r())}function g(h){h.preventDefault(),l()}function v(){r()}return window.addEventListener("keydown",m),window.addEventListener("keyup",u),e.addEventListener("mousedown",g),e.addEventListener("mouseup",v),e.addEventListener("mouseleave",v),e.addEventListener("touchstart",g,{passive:!1}),e.addEventListener("touchend",v),{destroy(){window.removeEventListener("keydown",m),window.removeEventListener("keyup",u),e.removeEventListener("mousedown",g),e.removeEventListener("mouseup",v),e.removeEventListener("mouseleave",v),e.removeEventListener("touchstart",g),e.removeEventListener("touchend",v)}}}const yt="audio/webm;codecs=opus",$n=512,Kn=250,Bn=300,Un=2e3,vt={calibrationMs:1e3,noiseFloorFactor:3.5,minSpeechMs:150,hangoverMs:700,minUtteranceMs:400,maxSegmentMs:1e4};function Yn(){return{phase:"calibrating",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:0,calibMs:0,calibSum:0,calibSamples:0}}function Gn(e,t,n,i=vt){if(e.phase==="calibrating"){const r=e.calibMs+n,m=e.calibSum+t,u=e.calibSamples+1;return r>=i.calibrationMs?{state:{phase:"idle",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:u>0?m/u:0,calibMs:r,calibSum:m,calibSamples:u},event:null}:{state:{...e,calibMs:r,calibSum:m,calibSamples:u},event:null}}const o=e.noiseFloor*i.noiseFloorFactor,s=t>=o;if(e.phase==="idle"){if(!s)return e.phaseMs===0?{state:e,event:null}:{state:{...e,phaseMs:0},event:null};const r=e.phaseMs+n;return r>=i.minSpeechMs?{state:{...e,phase:"speaking",phaseMs:0,segmentMs:r,speechMs:r},event:{type:"segment-start"}}:{state:{...e,phaseMs:r},event:null}}const a=e.segmentMs+n;if(a>=i.maxSegmentMs)return{state:{...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},event:{type:"segment-end"}};if(s){const r=e.speechMs+n;return{state:{...e,phase:"speaking",phaseMs:0,segmentMs:a,speechMs:r},event:null}}const l=e.phaseMs+n;if(l>=i.hangoverMs){const r={...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0};return e.speechMs<i.minUtteranceMs?{state:r,event:{type:"segment-dropped"}}:{state:r,event:{type:"segment-end"}}}return{state:{...e,phaseMs:l,segmentMs:a},event:null}}function Jn(e){let t=0;for(let n=0;n<e.length;n++){const i=e[n]??0;t+=i*i}return Math.sqrt(t/e.length)}async function qn(e,t=vt){$e();const n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}});let i=!0,o=null,s=null;try{let a=function(){if(x!==null||h.length<=1)return;const E=performance.now()-Un,_=h[0];if(_===void 0)return;const C=h.slice(1).filter(S=>S.tsMs>=E);h=[_,...C]},l=function(E){const _=x??E;x=null;const C=h.filter(f=>f.tsMs>=_&&f.tsMs<=E);if(C.length===0)return;const S=h[0],I=S!==void 0&&C[0]!==S?[S.blob,...C.map(f=>f.blob)]:C.map(f=>f.blob);e.onBlob(new Blob(I,{type:yt}))},r=function(){if(!i)return;const E=performance.now(),_=E-L;if(L=E,e.isSuppressed()){x!==null&&(x=null,M={...M,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},e.onSegmentChange(!1)),a(),requestAnimationFrame(r);return}g.getFloatTimeDomainData(v);const C=Jn(v),{state:S,event:T}=Gn(M,C,_,t);M=S,T?.type==="segment-start"?(x=E-t.minSpeechMs-Bn,e.onSegmentChange(!0)):T?.type==="segment-end"?(l(E),e.onSegmentChange(!1)):T?.type==="segment-dropped"&&(x=null,e.onSegmentChange(!1)),a(),requestAnimationFrame(r)};const m=window.AudioContext??window.webkitAudioContext;o=new m;const u=o.createMediaStreamSource(n),g=o.createAnalyser();g.fftSize=$n,u.connect(g);const v=new Float32Array(g.fftSize);s=new MediaRecorder(n,{mimeType:yt});let h=[];s.addEventListener("dataavailable",E=>{E.data.size>0&&h.push({blob:E.data,tsMs:performance.now()})}),s.addEventListener("error",E=>{const _=E.error;e.onError?.(_ instanceof Error?_:new Error("whisper mode: MediaRecorder error"))}),s.start(Kn);let M=Yn(),x=null,L=performance.now();requestAnimationFrame(r)}catch(a){throw i=!1,n.getTracks().forEach(l=>l.stop()),o?.close(),a instanceof Error?a:new Error(String(a))}return{stop(){i=!1,e.onSegmentChange(!1);const a=s;a&&a.state!=="inactive"&&a.stop(),n.getTracks().forEach(l=>l.stop()),o?.close()}}}const Xn="https://api.openai.com/v1/audio/transcriptions";async function xt(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const o=await fetch(Xn,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!o.ok){const l=await o.text();return{ok:!1,text:"",status:o.status,errorBody:l}}const s=await o.json();return{ok:!0,text:typeof s=="object"&&s!==null&&"text"in s&&typeof s.text=="string"?s.text:"",status:o.status,errorBody:""}}function Zn(e,t){return e.includes(t)}async function Qn(e,t,n=K.voice.sttModel,i=K.voice.sttFallbackModel){const o=await xt(e,t,n);if(o.ok)return o.text;if(o.status>=400&&o.status<500&&Zn(o.errorBody,n)){const a=await xt(e,t,i);if(a.ok)return a.text;throw new Error(`stt failed: ${n} (${o.status}) then ${i} (${a.status}): ${a.errorBody}`)}throw new Error(`stt failed: ${n} (${o.status}): ${o.errorBody}`)}const ei=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}}],ti=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".`;function ni(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,o=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof o!="number"||!Number.isFinite(o)||o<0||o>1?null:{action:"trim_sail",sail:i,trim:o}}case"report_status":return{action:"report_status"};default:return null}}const ii="https://api.openai.com/v1/chat/completions";function oi(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const o=i,s=typeof o.content=="string"?o.content:null,a=[],l=o.tool_calls;if(Array.isArray(l))for(const r of l){if(typeof r!="object"||r===null)continue;const m=r.function;if(typeof m!="object"||m===null)continue;const u=m,g=u.name,v=u.arguments;typeof g!="string"||typeof v!="string"||a.push({name:g,argumentsJson:v})}return{content:s,toolCalls:a}}function ai(e){try{return JSON.parse(e)}catch{return null}}async function si(e,t,n,i=K.voice.intentModel){const o=t.getState(),s=`${ti}

Current ship state:
${JSON.stringify(o)}`,a=await fetch(ii,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:ei,messages:[{role:"system",content:s},{role:"user",content:e}]})});if(!a.ok){const h=await a.text();throw new Error(`intent request failed (${a.status}): ${h}`)}const l=await a.json(),r=oi(l);if(r===null)throw new Error("intent request returned an unrecognizable response body");const m=r.toolCalls[0];if(m===void 0)return{crewLine:r.content??"",intent:null};const u=ai(m.argumentsJson),g=ni(m.name,u);return g===null?{crewLine:V("unknown_order",o),intent:null}:{crewLine:(await t.submit(g)).message,intent:g}}const Et=.514444,oe=Math.PI/180,ri=1;function Ke(e){return-e*oe}function li(e){const t=e*oe;return{x:Math.sin(t),z:-Math.cos(t)}}const Be=900,St=18,ci=95,di=260;function ui(e,t,n,i,o){const s=Be*(.7+Math.random()*.3),a=(Math.random()-.5)*2*di;e.position.x=t+i.x*s+o.x*a,e.position.z=n+i.z*s+o.z*a,e.position.y=St+Math.random()*(ci-St)}function pi(e,t,n,i,o,s,a){if(e.length===0)return;const l=i+180,r=li(l),m={x:-r.x,z:-r.z},u={x:-r.z,z:r.x},g=o*Et*s,v=Ke(l);for(const h of e){h.position.x+=r.x*g*a,h.position.z+=r.z*g*a,h.rotation.y=v;const M=h.position.x-t,x=h.position.z-n;M*M+x*x>Be*Be&&ui(h,t,n,m,u)}}const hi=1.4,mi=6,gi=2;function fi(e,t,n,i,o=K.visuals,s={}){const{camera:a=null,getStreamerNode:l,windStreaks:r=[]}=s;let m=0,u=0,g=null,v=0,h=0,M=0,x="follow";const L=a!==null?a.fov:null;function E(S){x=S,typeof window<"u"&&(window.__captainViewMode=S),a!==null&&S==="follow"&&L!==null&&(a.fov=L,a.updateProjectionMatrix())}function _(S){const{worldUnitsPerMetre:T,maxHeelDeg:I,maxBraceDeg:f,heelSmoothingHz:R,boatScale:d}=o,b=g===null?0:Math.min((S-g)/1e3,.5);g=S;const p=e.getState(),w=Ke(p.heading);t.rotation.y=w,t.scale.x=d,t.scale.y=d,t.scale.z=d;const N=-Math.sin(w),z=-Math.cos(w),O=p.speedKts*Et;if(m+=N*O*b*T,u+=z*O*b*T,t.position.x=m,t.position.z=u,n!==null){const P=Math.min(I,.05*p.windSpeedKts**2*((p.mainTrim+p.jibTrim)/2)*Math.abs(Math.sin(p.apparentWindAngle*oe))),le=Math.sign(p.apparentWindAngle)*P*oe,Y=b>0?1-Math.exp(-b*R):0;v+=(le-v)*Y,n.rotation.z=v}const U=i?i():null;if(U!==null){const P=(p.mainTrim+p.jibTrim)/2,le=Math.sign(p.apparentWindAngle)*P*f*oe,Y=b>0?1-Math.exp(-b*ri):0;h+=(le-h)*Y,U.rotation.y=h}pi(r,m,u,p.windDirection,p.windSpeedKts,T,b);const W=l?l():null;if(W!==null){const P=Ke(p.apparentWindAngle+180),le=b>0?1-Math.exp(-b*gi):0;let Y=P-M;Y=(Y+Math.PI)%(2*Math.PI)-Math.PI,M+=Y*le;const B=mi*oe*Math.sin(S/1e3*2*Math.PI*hi);W.rotation.y=M+B}if(a!==null&&x==="helm"){const{helmView:P}=o;a.position.x=P.x,a.position.y=P.y,a.position.z=P.z,a.rotation.x=P.pitchDeg*oe,a.rotation.y=0,a.rotation.z=0,a.fov!==P.fov&&(a.fov=P.fov,a.updateProjectionMatrix())}}function C(){E(x==="follow"?"helm":"follow")}return{update:_,toggleView:C,getViewMode:()=>x}}const bi=500;window.__captainDriverActive=!0;const k=Ve();window.__captainAmbientRock=k.visuals.ambientRock;const Ae=new vn({},k),pe=Xt(Ae),Ue=document.createElement("div");Ue.id="hud-root",document.body.appendChild(Ue);function Mt(e){kn(e)}function kt(e){ht(e)}function he(e){mt(e)}async function Ye(e){const t=ve();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");Mt(e);const n=await si(e,pe,t,k.voice.intentModel);kt(n.intent),he(n.crewLine),await bt(n.crewLine,t,k.voice.ttsModel,k.voice.ttsVoice)}const wi=Mn(Ue,pe,{injectTranscript:Ye,setWhisperMode:e=>{e?_t():Si()},setTtsVoice:e=>{k.voice.ttsVoice=e}});async function yi(e){const t=await pe.submit(e);return Tn(e,t.message),t}const me=document.getElementById("demo");let Ge=!1;function vi(e){return new Promise(t=>setTimeout(t,e))}const xi=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function Ct(){if(!Ge){Ge=!0,me&&(me.disabled=!0);try{for(const e of xi){Mt(`[demo] ${e.label}`);const t=await pe.submit(e.intent);kt(e.intent),he(t.message);const n=ve();n!==null&&n.length>0&&bt(t.message,n,k.voice.ttsModel,k.voice.ttsVoice).catch(()=>{}),await vi(e.waitMs)}}finally{Ge=!1,me&&(me.disabled=!1)}}}me&&me.addEventListener("click",()=>{Ct()});const ae=document.getElementById("ptt");let ge=!1;async function Tt(e){const t=ve();if(t===null||t.length===0){he("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await Qn(e,t,k.voice.sttModel,k.voice.sttFallbackModel);await Ye(n)}catch(n){const i=n instanceof Error?n.message:String(n);he(i)}}let se=!1,Je=null,Ee=!1;function De(){se?(ae.textContent=Ee?"Listening… (capturing)":"Listening…",ae.classList.toggle("recording",Ee),ae.classList.toggle("listening",!Ee)):(ae.textContent="Hold to Talk",ae.classList.remove("recording","listening"))}async function Ei(e){ge=!0;try{await Tt(e)}finally{ge=!1}}async function _t(){if(!se)try{Je=await qn({onBlob:e=>{Ei(e)},onSegmentChange:e=>{Ee=e,De()},onError:e=>{he(e.message)},isSuppressed:()=>ge||Fn(bi)}),se=!0,He(!0),De()}catch(e){throw se=!1,He(!1),De(),e instanceof Error?e:new Error(String(e))}}function Si(){se&&(se=!1,Ee=!1,Je?.stop(),Je=null,He(!1),De())}Hn(ae,{onRecordingChange:e=>{ae.classList.toggle("recording",e)},onBlob:e=>{ge=!0,Tt(e).finally(()=>{ge=!1})},onError:e=>{he(e.message)},canStart:()=>!ge&&!se}),pt().then(()=>{k.voice.whisperMode&&_t().then(()=>{_n()}).catch(()=>{k.voice.whisperMode=!1,Cn("Microphone unavailable — switched to push-to-talk. Enable Whisper again anytime in ⚙ command config.")})});const re=window.DEMO;if(re===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const Ie=fi(pe,re.ms_GroupShip,re.ms_BlackPearlShip,()=>window.DEMO?.ms_Sails??null,k.visuals,{camera:re.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:re.ms_WindStreaks}),Nt=10/12,Mi=350,ki=1400,Rt=1.6,Ci=4.2,At=.2,Ti=.9;function _i(e){const t=e*Nt,n=9.81,i=.84,o=Math.max(t,.1),s=n*(i/o)**2,a=2*Math.PI/s,l=Math.min(ki,Math.max(Mi,a*2)),r=Math.min(1,Math.max(0,e/40)),m=Rt+r*(Ci-Rt),u=At+r*(Ti-At);return{size:l,choppiness:m,directionality:u}}function Dt(e){return 1+Math.min(1,Math.max(0,e))*3}function qe(){Ae.setWind(k.environment.windDirectionDeg,k.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(k.environment.windDirectionDeg+180)*Math.PI/180,n=k.environment.windSpeedKts*Nt;if(e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,k.visuals.seaStateFollowsWind){const i=_i(k.environment.windSpeedKts);e.ms_Ocean.size=i.size,e.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=i.choppiness,e.ms_Ocean.directionality=Dt(i.directionality)}e.ms_Ocean.changed=!0}function It(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(ie(k,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),ie(k,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),ie(k,"visuals.lighting.sunIntensity",e.sunIntensity),ie(k,"visuals.lighting.ambientIntensity",e.ambientIntensity),ie(k,"visuals.lighting.exposure",e.exposure),ie(k,"visuals.lighting.fogDensity",e.fogDensity))}function Ni(){window.DEMO?.SetLightingParams(k.visuals.lighting)}!(window.location.hash.length>1)&&re.ms_Environment!==k.environment.skyPreset&&re.UpdateEnvironment(k.environment.skyPreset),It(),qe();function Ri(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function Ai(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Di(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function Ii(e,t){switch(ie(k,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=Dt(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&qe();break;case"visuals.waterColor":{const n=Ri(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":Ai(t);break;case"visuals.streakOpacity":Di(t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":qe();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),It();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":Ni();break}}Nn(Ii);const Se=document.getElementById("view-toggle");function Lt(e){return e==="helm"?"Follow Cam":"Helm View"}function Ot(){Ie.toggleView(),Se&&(Se.textContent=Lt(Ie.getViewMode()))}Se&&(Se.textContent=Lt(Ie.getViewMode()),Se.addEventListener("click",()=>{Ot()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}Ot()});let Xe=null;function Pt(e){if(Xe!==null){const t=e-Xe;Ae.tick(t)}Xe=e,Ie.update(e),wi.update(),requestAnimationFrame(Pt)}requestAnimationFrame(Pt),window.__captain={bus:pe,submitIntent:yi,injectTranscript:Ye,setWind:(e,t)=>{Ae.setWind(e,t)},demo:Ct,getConfig:()=>k,copyConfig:()=>{const e=JSON.stringify(k,null,2);return console.log(e),e},setConfig:e=>{at(e),location.reload()},resetConfig:()=>{st(),location.reload()}}})();
