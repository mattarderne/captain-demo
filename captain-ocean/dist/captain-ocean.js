(function(){"use strict";function je(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function ze(e){return e.toFixed(1)}function A(e,t){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const n=je(t.heading),i=ze(t.speedKts),o=je(t.windDirection),a=ze(t.windSpeedKts);let s=`Steering ${n} at ${i} knots, wind ${o} at ${a}, sir.`;return t.inIrons&&(s+=" She's in irons."),s}default:{const n=e;throw new Error(`unhandled message key: ${String(n)}`)}}}const xt=-35,St=35,Et=0,kt=1,Mt=1;function Tt(e){return e==="main"||e==="jib"||e==="all"}function G(e,t){return{ok:!1,message:e,state:t}}function te(e,t){return{ok:!0,message:e,state:t}}function Ct(e){function t(i){const o=i.action;if(o==="helm"){const a=i.degrees;if(typeof a!="number"||!Number.isFinite(a)||a<xt||a>St)return Promise.resolve(G(A("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:a}).accepted)return Promise.resolve(G(A("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Mt?Promise.resolve(te(A("no_steerage_way",l),l)):a>0?Promise.resolve(te(A("helm_ack_starboard",l),l)):a<0?Promise.resolve(te(A("helm_ack_port",l),l)):Promise.resolve(te(A("helm_ack_amidships",l),l))}if(o==="trim_sail"){const a=i.sail,s=i.trim;if(!Tt(a))return Promise.resolve(G(A("unknown_order",e.snapshot()),e.snapshot()));if(typeof s!="number"||!Number.isFinite(s)||s<Et||s>kt)return Promise.resolve(G(A("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:a,trim:s}).accepted)return Promise.resolve(G(A("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),g=a==="main"?"trim_ack_main":a==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(te(A(g,d),d))}if(o==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(G(A("unknown_order",e.snapshot()),e.snapshot()));const s=e.snapshot();return Promise.resolve(te(A("status",s),s))}return Promise.resolve(G(A("unknown_order",e.snapshot()),e.snapshot()))}function n(){return e.snapshot()}return{submit:t,getState:n}}const Te=1.94384,le=180/Math.PI,V=Math.PI/180;function Ve(e){return e*Te}function Ce(e){return e/Te}function _t(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function ce(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function ne(e,t,n){return e<t?t:e>n?n:e}const Rt=0,Nt=12;function Dt(e={}){return{x:0,y:0,psi:ce((e.heading??0)*V),u:Ce(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*V,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:ce((e.windDirection??Rt)*V),windSpeedMs:Ce(e.windSpeedKts??Nt)}}const de=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],At=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Pt=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function It(e,t,n){return e+(t-e)*n}function $e(e,t){const n=ne(t,0,180);let i=0;for(;i<de.length-1&&de[i+1]<=n;)i++;const o=Math.min(i+1,de.length-1),a=de[i],s=de[o],l=s===a?0:(n-a)/(s-a);return It(e[i],e[o],l)}function Ot(e){return{cl:$e(At,e),cd:$e(Pt,e)}}function Lt(e){const t=ne(Math.abs(e),0,180),{cl:n,cd:i}=Ot(t),o=t*V,a=Math.sin(o),s=Math.cos(o),l=n*a-i*s,d=Math.abs(n*s+i*a);return{cDrive:l,cSide:d}}function jt(e){return ne(Math.abs(e)/180,.15,1)}function zt(e,t){return Math.max(0,1-2*Math.abs(e-jt(t)))}const $={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:30,kSurgeLin:100,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:12,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx"},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:200,oceanChoppiness:3.6,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:64,streakOpacity:.35,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70}}},ie="captain.config";function U(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Vt(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function We(e,t,n,i){for(const o of Object.keys(t)){const a=t[o];if(!(o in e)){i.push(`${n}${o} (unknown key)`);continue}const s=e[o];U(s)&&U(a)?We(s,a,`${n}${o}.`,i):U(s)||U(a)||typeof s!=typeof a?i.push(`${n}${o} (expected ${typeof s}, got ${typeof a})`):e[o]=a}}function He(e,t){const n={...e};for(const i of Object.keys(t)){const o=t[i],a=n[i];n[i]=U(a)&&U(o)?He(a,o):o}return n}function be(){return typeof localStorage<"u"}function $t(){if(!be())return{};const e=localStorage.getItem(ie);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return U(t)?t:{}}catch{return{}}}function Ke(){const e=Vt($);if(!be())return e;const t=localStorage.getItem(ie);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${ie}"] is not valid JSON — ignoring it, using defaults.`),e}if(!U(n))return console.warn(`captain.config: stored value in localStorage["${ie}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return We(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function Fe(e){if(!be())return;const t=$t(),n=He(t,e);localStorage.setItem(ie,JSON.stringify(n))}function Be(){be()&&localStorage.removeItem(ie)}function Wt(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let a=e;for(let s=0;s<i.length-1;s++){const l=i[s];if(l===void 0||(a=a?.[l],a==null))return}a!=null&&(a[o]=n)}const Ht=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["night","morning","day","cloudy","sunset","interstellar","apocalypse"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:64,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."}],Kt=$.controls.rudderMaxDeg*V,Ft=$.physics;function Ue(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t,a=-e.windSpeedMs*Math.sin(e.windFromRad),s=-e.windSpeedMs*Math.cos(e.windFromRad),l=a-i,d=s-o,g=Math.hypot(l,d),p=l*t+d*n,b=l*n-d*t;return{awaDeg:Math.atan2(-b,-p)*le,awsMs:g}}function Ye(e,t,n,i,o){const a=Math.abs(n),{cDrive:s,cSide:l}=Lt(a),d=zt(t,a),g=.5*o*i*i,p=g*e*s*d,b=g*e*l*d,v=-Math.sign(n||1)*b;return{surge:p,sway:v}}function Bt(e,t,n=Ft,i=Kt){const{awaDeg:o,awsMs:a}=Ue(e),s=Ye(n.areaMain,e.mainTrim,o,a,n.rhoAir),l=Ye(n.areaJib,e.jibTrim,o,a,n.rhoAir),d=s.surge+l.surge,g=s.sway+l.sway,p=e.u,b=e.v,v=e.r,h=p>=0?n.kSurgeLin:n.kSurgeLinAstern,E=-n.kSurgeQuad*p*Math.abs(p)-h*p,S=-n.kSwayQuad*b*Math.abs(b)-n.kSwayLin*b,W=ne(e.rudder,-i,i),P=n.cRudder*W*p*Math.abs(p),z=-(n.kYawDamp+n.kYawDampU*Math.abs(p))*v,D=n.cWeather*Math.sin(o*V)*a*Math.min(1,Math.abs(p)),C=P+z+D,_=(d+E)/n.mass+b*v,I=(g+S)/n.mass-p*v,O=C/n.izz;e.u=p+_*t,e.v=b+I*t,e.r=v+O*t;const L=Math.sin(e.psi),c=Math.cos(e.psi),m=e.u*L+e.v*c,u=e.u*c-e.v*L;e.x+=m*t,e.y+=u*t,e.psi=ce(e.psi+e.r*t)}function Je(e){return Math.hypot(e.u,e.v)*Te}function Ut(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t;return ce(Math.atan2(i,o))}function Yt(e){return Je(e)<.2?0:_t(e.psi-Ut(e))*le}const ue=.05,Ge=ue*1e3;function _e(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class Jt{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=$){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*V,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*V,this.state=Dt({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=ne(t.degrees*V,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=ne(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Ge;)this.state.rudder=_e(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*ue),this.state.mainTrim=_e(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*ue),this.state.jibTrim=_e(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*ue),Bt(this.state,ue,this.physics,this.rudderMaxRad),this.accMs-=Ge}snapshot(){const{awaDeg:t,awsMs:n}=Ue(this.state),i=Je(this.state);return{heading:this.state.psi*le%360,speedKts:i,windDirection:this.state.windFromRad*le%360,windSpeedKts:Ve(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:Ve(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*le,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:Yt(this.state)}}setWind(t,n){this.state.windFromRad=ce(t*V),this.state.windSpeedMs=Ce(n)}}function Gt(e,t,n){e.innerHTML="",an();const i=document.createElement("div");i.id="hud",e.appendChild(i);const o=document.createElement("div");o.className="hud-panel hud-state",i.appendChild(o);const a=document.createElement("div");a.className="hud-panel-title",a.textContent="Ship State",o.appendChild(a);function s(r,w,k=!1){const M=document.createElement("div");M.id=r,M.className="hud-row";const K=document.createElement("span");K.className="hud-row-label",K.textContent=w,M.appendChild(K);const J=document.createElement("span");J.className="hud-row-colon",J.textContent=": ",M.appendChild(J);const B=document.createElement("span");B.className="hud-row-value",B.textContent="--",M.appendChild(B);let re=null;if(k){const ee=document.createElement("div");ee.className="hud-bar",re=document.createElement("div"),re.className="hud-bar-fill",ee.appendChild(re),M.appendChild(ee)}return o.appendChild(M),{setValue:ee=>{B.textContent=ee},setFill:re?ee=>{re&&(re.style.width=`${Math.max(0,Math.min(100,ee))}%`)}:void 0}}const l=s("hud-heading","heading"),d=s("hud-speed","speed"),g=s("hud-wind","wind"),p=s("hud-awa","awa"),b=s("hud-main","main",!0),v=s("hud-jib","jib",!0),h=s("hud-rudder","rudder"),E="http://www.w3.org/2000/svg";function S(r,w){const k=document.createElementNS(E,r);for(const[M,K]of Object.entries(w))k.setAttribute(M,K);return k}const W=document.getElementById("hud-wind"),P=document.createElement("div");P.id="hud-windvane",P.className="hud-windvane";const z=S("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});z.appendChild(S("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),z.appendChild(S("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const D=S("g",{class:"hud-windvane-arrow"});D.appendChild(S("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),D.appendChild(S("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),z.appendChild(D),z.appendChild(S("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),P.appendChild(z),W.appendChild(P);const C=document.getElementById("hud-rudder"),_=document.createElement("div");_.className="hud-gauge";const I=document.createElement("div");I.className="hud-gauge-center-tick",_.appendChild(I);const O=document.createElement("div");O.className="hud-gauge-target",_.appendChild(O);const L=document.createElement("div");L.className="hud-gauge-needle",_.appendChild(L),C.appendChild(_);let c=null;function m(r){return(Math.max(-35,Math.min(35,r))+35)/70*100}function u(r){const w=m(r);L.style.left=`${w}%`,L.classList.toggle("port",r<-.5),L.classList.toggle("stbd",r>.5),c!==null&&Math.abs(r-c)>.5?(O.style.left=`${m(c)}%`,O.style.display="block"):O.style.display="none"}const f=document.createElement("div");f.id="hud-irons",f.className="hud-irons-row";const y=document.createElement("span");y.className="hud-visually-hidden",y.textContent="irons: false",f.appendChild(y),o.appendChild(f);const N=document.createElement("div");N.className="hud-panel hud-log",i.appendChild(N);const R=document.createElement("div");R.className="hud-panel-title",R.textContent="Quarterdeck Log",N.appendChild(R);const j=document.createElement("div");j.id="hud-log-list",j.className="hud-log-list",N.appendChild(j);const Z=6,x=[{transcript:"--",order:"--",crew:"--"}];function H(){j.innerHTML="",x.forEach((r,w)=>{const k=w===x.length-1,M=document.createElement("div");M.className="hud-log-entry",M.style.opacity=String(.45+.55*((w+1)/x.length));const K=document.createElement("div");K.className="hud-log-you",k&&(K.id="hud-transcript"),K.textContent=`You: ${r.transcript}`,M.appendChild(K);const J=document.createElement("div");J.className="hud-log-order",k&&(J.id="hud-intent"),J.textContent=r.order,M.appendChild(J);const B=document.createElement("div");B.className="hud-log-crew",k&&(B.id="hud-crew"),B.textContent=`Crew: ${r.crew}`,M.appendChild(B),j.appendChild(M)}),j.scrollTop=j.scrollHeight}H();function F(r){if(r===null)return"→ no order";if(r.action==="helm"){const w=Math.round(r.degrees),k=w<0?"port":w>0?"stbd":"amidships";return`→ helm ${w}° (${k})`}return r.action==="trim_sail"?`→ trim ${r.sail} → ${r.trim.toFixed(2)}`:"→ status report"}function Le(r){x.push({transcript:r,order:"→ …",crew:"…"}),x.length>Z&&x.shift(),H()}function Kn(r){const w=x[x.length-1];w&&(w.order=F(r)),r!==null&&r.action==="helm"&&(c=r.degrees),H()}function ft(r){const w=x[x.length-1];w&&(w.crew=r),H()}const Se=document.createElement("div");Se.className="hud-controls",N.appendChild(Se);const Y=document.createElement("input");Y.id="transcript-input",Y.type="text",Y.placeholder="Type an order and press Enter…",Y.className="hud-input",Se.appendChild(Y);const se=document.createElement("div");se.className="hud-button-row",Se.appendChild(se);const me=document.createElement("button");me.id="ptt",me.type="button",me.textContent="Hold to Talk",me.className="hud-btn hud-btn-ptt",se.appendChild(me);const fe=document.createElement("button");fe.id="demo",fe.type="button",fe.textContent="Run Demo",fe.className="hud-btn hud-btn-demo",se.appendChild(fe);const ge=document.createElement("button");ge.id="view-toggle",ge.type="button",ge.textContent="Helm View",ge.className="hud-btn hud-btn-view-toggle",se.appendChild(ge);const Ee=document.createElement("label");Ee.className="hud-tts-label";const ke=document.createElement("input");ke.id="tts-enabled",ke.type="checkbox",ke.checked=!1,Ee.appendChild(ke),Ee.appendChild(document.createTextNode("TTS")),se.appendChild(Ee),on(i),Y.addEventListener("keydown",r=>{if(r.key!=="Enter")return;const w=Y.value.trim();w.length!==0&&(Y.value="",n.injectTranscript(w).catch(k=>{const M=k instanceof Error?k.message:String(k);ft(M)}))});function Me(r){return r.toFixed(1)}function gt(r){return r.toFixed(2)}const Fn=["N","NE","E","SE","S","SW","W","NW"];function bt(r){return(r%360+360)%360}function wt(r){const w=Math.round(bt(r)/45)%8;return Fn[w]??"N"}function yt(r){return String(Math.round(bt(r))%360).padStart(3,"0")}function Bn(r){return`${yt(r)} ${wt(r)}`}function Un(r,w){return`from ${yt(r)} @ ${Me(w)} kts (${wt(r)})`}function Yn(r,w){const k=Math.round(r);if(k===0)return`dead ahead @ ${Me(w)} kts`;const M=k<0?"port":"starboard";return`${Math.abs(k)}° to ${M} @ ${Me(w)} kts`}function Jn(r){const w=Math.round(r),k=w<0?"port":w>0?"stbd":"amidships";return`${w}° ${k}`}function Gn(r){l.setValue(Bn(r.heading)),d.setValue(`${Me(r.speedKts)} kts`),g.setValue(Un(r.windDirection,r.windSpeedKts)),D&&D.setAttribute("transform",`rotate(${r.windDirection-r.heading} 20 20)`),p.setValue(Yn(r.apparentWindAngle,r.apparentWindKts)),b.setValue(gt(r.mainTrim)),b.setFill?.(r.mainTrim*100),v.setValue(gt(r.jibTrim)),v.setFill?.(r.jibTrim*100),h.setValue(Jn(r.rudderAngle)),u(r.rudderAngle),y.textContent=`irons: ${r.inIrons}`,f.classList.toggle("active",r.inIrons)}function vt(){Gn(t.getState())}return vt(),we={logTranscript:Le,logIntent:Kn,logCrewLine:ft},{update:vt}}let we=null;function qt(e){we?.logTranscript(e)}function qe(e){we?.logIntent(e)}function Xe(e){we?.logCrewLine(e)}function Xt(e,t){qe(e),Xe(t)}let Qe=[];function Qt(e){Qe.push(e)}function Zt(e,t){for(const n of Qe)n(e,t)}function en(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function tn(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function nn(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let a=e;for(let s=0;s<i.length-1;s++){const l=i[s];if(l===void 0)return;const d=a[l];(typeof d!="object"||d===null)&&(a[l]={}),a=a[l]}a[o]=n}function Ze(e,t){const n={...e};for(const i of Object.keys(t)){const o=e[i],a=t[i];o!==null&&typeof o=="object"&&!Array.isArray(o)&&a!==null&&typeof a=="object"&&!Array.isArray(a)?n[i]=Ze(o,a):n[i]=a}return n}function on(e){const t=Ke(),n={};let i=!1;const o=new Map,a=document.createElement("button");a.id="settings-toggle",a.type="button",a.title="Settings (S)",a.setAttribute("aria-label","Settings"),a.textContent="⚙",a.className="hud-btn hud-settings-toggle",e.appendChild(a);const s=document.createElement("div");s.id="settings-panel",s.className="hud-panel hud-settings-panel",e.appendChild(s);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",s.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",s.appendChild(d);function g(){d.hidden=!i}function p(c,m){if(nn(n,c.path,m),c.live)Zt(c.path,m);else{const u=o.get(c.path);u&&(u.hidden=!1),i=!0,g()}}function b(c,m){const u=document.createElement("div");u.className="hud-settings-control-row";const f=document.createElement("input");f.type="range",f.min=String(c.min??0),f.max=String(c.max??100),f.step=String(c.step??1),f.value=String(m),f.className="hud-settings-range";const y=document.createElement("input");y.type="number",y.min=f.min,y.max=f.max,y.step=f.step,y.value=String(m),y.className="hud-settings-numeric";const N=c.min??-1/0,R=c.max??1/0;function j(Z){if(!Number.isFinite(Z))return;const x=Math.min(R,Math.max(N,Z));f.value=String(x),y.value=String(x),p(c,x)}return f.addEventListener("input",()=>j(Number(f.value))),y.addEventListener("input",()=>j(Number(y.value))),u.appendChild(f),u.appendChild(y),u}function v(c,m){const u=document.createElement("label");u.className="hud-settings-checkbox-label";const f=document.createElement("input");return f.type="checkbox",f.checked=m,f.addEventListener("change",()=>p(c,f.checked)),u.appendChild(f),u}function h(c,m){const u=document.createElement("select");u.className="hud-settings-select";for(const f of c.options??[]){const y=document.createElement("option");y.value=f,y.textContent=f,f===m&&(y.selected=!0),u.appendChild(y)}return u.addEventListener("change",()=>p(c,u.value)),u}function E(c,m){const u=document.createElement("input");return u.type="color",u.className="hud-settings-color",u.value=m,u.addEventListener("input",()=>p(c,u.value)),u}function S(c,m){const u=document.createElement("input");return u.type="text",u.className="hud-settings-text",u.value=m,u.addEventListener("change",()=>p(c,u.value)),u}function W(c){const m=document.createElement("div");m.className="hud-settings-field",m.dataset.configPath=c.path;const u=document.createElement("div");u.className="hud-settings-label-row";const f=document.createElement("span");if(f.className="hud-settings-label",f.textContent=c.label,u.appendChild(f),!c.live){const R=document.createElement("span");R.className="hud-settings-reload-dot",R.title="Staged — needs Save & Reload",R.hidden=!0,u.appendChild(R),o.set(c.path,R)}m.appendChild(u);const y=tn(t,c.path);let N;switch(c.type){case"number":N=b(c,y);break;case"boolean":N=v(c,y);break;case"select":N=h(c,y);break;case"color":N=E(c,y);break;default:N=S(c,y);break}if(m.appendChild(N),c.note){const R=document.createElement("div");R.className="hud-settings-note",R.textContent=c.note,m.appendChild(R)}return m}const P=new Map;for(const c of Ht)P.has(c.section)||P.set(c.section,[]),P.get(c.section)?.push(c);const z=new Set(["Visuals","Environment"]);for(const[c,m]of P){const u=document.createElement("details");u.className="hud-settings-section",u.open=z.has(c);const f=document.createElement("summary");f.textContent=c,u.appendChild(f);for(const y of m)u.appendChild(W(y));s.appendChild(u)}const D=document.createElement("div");D.className="hud-settings-footer";const C=document.createElement("button");C.id="settings-save-reload",C.type="button",C.textContent="Save & Reload",C.className="hud-btn",C.addEventListener("click",()=>{Fe(n),location.reload()});const _=document.createElement("button");_.id="settings-copy-json",_.type="button",_.textContent="Copy JSON",_.className="hud-btn",_.addEventListener("click",()=>{(async()=>{const c=Ze(t,n),m=JSON.stringify(c,null,2);console.log(m);try{await navigator.clipboard?.writeText(m)}catch{}})()});const I=document.createElement("button");I.id="settings-reset-all",I.type="button",I.textContent="Reset All",I.className="hud-btn",I.addEventListener("click",()=>{Be(),location.reload()}),D.appendChild(C),D.appendChild(_),D.appendChild(I),s.appendChild(D);let O=!1;function L(c){O=c,s.classList.toggle("open",c),a.classList.toggle("active",c)}a.addEventListener("click",()=>L(!O)),document.addEventListener("keydown",c=>{c.key!=="s"&&c.key!=="S"||en(document.activeElement)||L(!O)})}function an(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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

.hud-tts-label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #b7cfe0;
  margin-left: auto;
  cursor: pointer;
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
`,document.head.appendChild(e)}const et="captain.openai_key",sn="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function ye(){return window.localStorage.getItem(et)}function rn(e){window.localStorage.setItem(et,e)}function ln(e=document.body){const t=ye();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const o=document.createElement("div");o.style.background="#0e1f2e",o.style.color="#e8f4ff",o.style.padding="20px 24px",o.style.borderRadius="6px",o.style.maxWidth="360px",o.style.display="flex",o.style.flexDirection="column",o.style.gap="10px";const a=document.createElement("div");a.textContent="OpenAI API key",a.style.fontSize="15px",a.style.fontWeight="bold";const s=document.createElement("p");s.id="byok-copy",s.textContent=sn,s.style.margin="0",s.style.fontSize="12px",s.style.opacity="0.85";const l=document.createElement("input");l.id="byok-key-input",l.type="password",l.placeholder="sk-...",l.autocomplete="off",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 8px";const d=document.createElement("button");d.id="byok-save",d.type="button",d.textContent="Save",d.style.fontFamily="inherit",d.style.fontSize="13px",d.style.padding="6px 10px",d.style.cursor="pointer";function g(){const p=l.value.trim();p.length!==0&&(rn(p),i.remove(),n(p))}d.addEventListener("click",g),l.addEventListener("keydown",p=>{p.key==="Enter"&&g()}),o.appendChild(a),o.appendChild(s),o.appendChild(l),o.appendChild(d),i.appendChild(o),e.appendChild(i),l.focus()})}const cn="https://api.openai.com/v1/audio/speech",dn="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let q=null;function un(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function tt(){q!==null&&(q.pause(),q.src="",q=null)}async function nt(e,t,n=$.voice.ttsModel,i=$.voice.ttsVoice){if(e.trim().length===0||!un())return;tt();const o=await fetch(cn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:dn})});if(!o.ok){const p=await o.text();throw new Error(`tts request failed (${o.status}): ${p}`)}const a=await o.arrayBuffer(),s=new Blob([a],{type:"audio/mpeg"}),l=URL.createObjectURL(s),d=new Audio(l);q=d;const g=()=>{URL.revokeObjectURL(l),q===d&&(q=null)};d.addEventListener("ended",g,{once:!0}),d.addEventListener("error",g,{once:!0}),await d.play()}const it="audio/webm;codecs=opus";function pn(e,t){let n=null,i=null,o=[],a=!1;function s(h){if(!(h instanceof HTMLElement))return!1;const E=h.tagName;return E==="INPUT"||E==="SELECT"||E==="TEXTAREA"||h.isContentEditable}async function l(){if(!a&&!(t.canStart&&!t.canStart())){a=!0,tt(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),o=[],i=new MediaRecorder(n,{mimeType:it}),i.addEventListener("dataavailable",h=>{h.data.size>0&&o.push(h.data)}),i.start()}catch(h){a=!1,t.onRecordingChange(!1);const E=h instanceof Error?h:new Error(String(h));t.onError?.(E)}}}function d(){if(!a)return;a=!1,t.onRecordingChange(!1);const h=i,E=n;!h||h.state==="inactive"||(h.addEventListener("stop",()=>{const S=new Blob(o,{type:it});o=[],E?.getTracks().forEach(W=>W.stop()),t.onBlob(S)},{once:!0}),h.stop(),i=null,n=null)}function g(h){h.code==="Space"&&(s(h.target)||h.repeat||(h.preventDefault(),l()))}function p(h){h.code==="Space"&&(s(h.target)||d())}function b(h){h.preventDefault(),l()}function v(){d()}return window.addEventListener("keydown",g),window.addEventListener("keyup",p),e.addEventListener("mousedown",b),e.addEventListener("mouseup",v),e.addEventListener("mouseleave",v),e.addEventListener("touchstart",b,{passive:!1}),e.addEventListener("touchend",v),{destroy(){window.removeEventListener("keydown",g),window.removeEventListener("keyup",p),e.removeEventListener("mousedown",b),e.removeEventListener("mouseup",v),e.removeEventListener("mouseleave",v),e.removeEventListener("touchstart",b),e.removeEventListener("touchend",v)}}}const hn="https://api.openai.com/v1/audio/transcriptions";async function ot(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const o=await fetch(hn,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!o.ok){const l=await o.text();return{ok:!1,text:"",status:o.status,errorBody:l}}const a=await o.json();return{ok:!0,text:typeof a=="object"&&a!==null&&"text"in a&&typeof a.text=="string"?a.text:"",status:o.status,errorBody:""}}function mn(e,t){return e.includes(t)}async function fn(e,t,n=$.voice.sttModel,i=$.voice.sttFallbackModel){const o=await ot(e,t,n);if(o.ok)return o.text;if(o.status>=400&&o.status<500&&mn(o.errorBody,n)){const s=await ot(e,t,i);if(s.ok)return s.text;throw new Error(`stt failed: ${n} (${o.status}) then ${i} (${s.status}): ${s.errorBody}`)}throw new Error(`stt failed: ${n} (${o.status}): ${o.errorBody}`)}const gn=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}}],bn=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

Rules: emit exactly one tool call for any order or ship question; never more than one; never invent a second order. If an order is embedded in other speech, act on the single dominant order. Be brief and period-correct, and end spoken acknowledgements with "sir".`;function wn(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,o=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof o!="number"||!Number.isFinite(o)||o<0||o>1?null:{action:"trim_sail",sail:i,trim:o}}case"report_status":return{action:"report_status"};default:return null}}const yn="https://api.openai.com/v1/chat/completions";function vn(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const o=i,a=typeof o.content=="string"?o.content:null,s=[],l=o.tool_calls;if(Array.isArray(l))for(const d of l){if(typeof d!="object"||d===null)continue;const g=d.function;if(typeof g!="object"||g===null)continue;const p=g,b=p.name,v=p.arguments;typeof b!="string"||typeof v!="string"||s.push({name:b,argumentsJson:v})}return{content:a,toolCalls:s}}function xn(e){try{return JSON.parse(e)}catch{return null}}async function Sn(e,t,n,i=$.voice.intentModel){const o=t.getState(),a=`${bn}

Current ship state:
${JSON.stringify(o)}`,s=await fetch(yn,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:gn,messages:[{role:"system",content:a},{role:"user",content:e}]})});if(!s.ok){const h=await s.text();throw new Error(`intent request failed (${s.status}): ${h}`)}const l=await s.json(),d=vn(l);if(d===null)throw new Error("intent request returned an unrecognizable response body");const g=d.toolCalls[0];if(g===void 0)return{crewLine:d.content??"",intent:null};const p=xn(g.argumentsJson),b=wn(g.name,p);return b===null?{crewLine:A("unknown_order",o),intent:null}:{crewLine:(await t.submit(b)).message,intent:b}}const at=.514444,X=Math.PI/180,En=1;function Re(e){return-e*X}function kn(e){const t=e*X;return{x:Math.sin(t),z:-Math.cos(t)}}const Ne=900,st=18,Mn=95,Tn=260;function Cn(e,t,n,i,o){const a=Ne*(.7+Math.random()*.3),s=(Math.random()-.5)*2*Tn;e.position.x=t+i.x*a+o.x*s,e.position.z=n+i.z*a+o.z*s,e.position.y=st+Math.random()*(Mn-st)}function _n(e,t,n,i,o,a,s){if(e.length===0)return;const l=i+180,d=kn(l),g={x:-d.x,z:-d.z},p={x:-d.z,z:d.x},b=o*at*a,v=Re(l);for(const h of e){h.position.x+=d.x*b*s,h.position.z+=d.z*b*s,h.rotation.y=v;const E=h.position.x-t,S=h.position.z-n;E*E+S*S>Ne*Ne&&Cn(h,t,n,g,p)}}const Rn=1.4,Nn=6,Dn=2;function An(e,t,n,i,o=$.visuals,a={}){const{camera:s=null,getStreamerNode:l,windStreaks:d=[]}=a;let g=0,p=0,b=null,v=0,h=0,E=0,S="follow";const W=s!==null?s.fov:null;function P(C){S=C,typeof window<"u"&&(window.__captainViewMode=C),s!==null&&C==="follow"&&W!==null&&(s.fov=W,s.updateProjectionMatrix())}function z(C){const{worldUnitsPerMetre:_,maxHeelDeg:I,maxBraceDeg:O,heelSmoothingHz:L,boatScale:c}=o,m=b===null?0:Math.min((C-b)/1e3,.5);b=C;const u=e.getState(),f=Re(u.heading);t.rotation.y=f,t.scale.x=c,t.scale.y=c,t.scale.z=c;const y=-Math.sin(f),N=-Math.cos(f),R=u.speedKts*at;if(g+=y*R*m*_,p+=N*R*m*_,t.position.x=g,t.position.z=p,n!==null){const x=Math.min(I,.05*u.windSpeedKts**2*((u.mainTrim+u.jibTrim)/2)*Math.abs(Math.sin(u.apparentWindAngle*X))),H=Math.sign(u.apparentWindAngle)*x*X,F=m>0?1-Math.exp(-m*L):0;v+=(H-v)*F,n.rotation.z=v}const j=i?i():null;if(j!==null){const x=(u.mainTrim+u.jibTrim)/2,H=Math.sign(u.apparentWindAngle)*x*O*X,F=m>0?1-Math.exp(-m*En):0;h+=(H-h)*F,j.rotation.y=h}_n(d,g,p,u.windDirection,u.windSpeedKts,_,m);const Z=l?l():null;if(Z!==null){const x=Re(u.apparentWindAngle+180),H=m>0?1-Math.exp(-m*Dn):0;let F=x-E;F=(F+Math.PI)%(2*Math.PI)-Math.PI,E+=F*H;const Le=Nn*X*Math.sin(C/1e3*2*Math.PI*Rn);Z.rotation.y=E+Le}if(s!==null&&S==="helm"){const{helmView:x}=o;s.position.x=x.x,s.position.y=x.y,s.position.z=x.z,s.rotation.x=x.pitchDeg*X,s.rotation.y=0,s.rotation.z=0,s.fov!==x.fov&&(s.fov=x.fov,s.updateProjectionMatrix())}}function D(){P(S==="follow"?"helm":"follow")}return{update:z,toggleView:D,getViewMode:()=>S}}window.__captainDriverActive=!0;const T=Ke();window.__captainAmbientRock=T.visuals.ambientRock;const ve=new Jt({},T),oe=Ct(ve),De=document.createElement("div");De.id="hud-root",document.body.appendChild(De);function rt(e){qt(e)}function lt(e){qe(e)}function pe(e){Xe(e)}async function Ae(e){const t=ye();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");rt(e);const n=await Sn(e,oe,t,T.voice.intentModel);lt(n.intent),pe(n.crewLine),await nt(n.crewLine,t,T.voice.ttsModel,T.voice.ttsVoice)}const Pn=Gt(De,oe,{injectTranscript:Ae});async function In(e){const t=await oe.submit(e);return Xt(e,t.message),t}const ae=document.getElementById("demo");let Pe=!1;function On(e){return new Promise(t=>setTimeout(t,e))}const Ln=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.28},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function ct(){if(!Pe){Pe=!0,ae&&(ae.disabled=!0);try{for(const e of Ln){rt(`[demo] ${e.label}`);const t=await oe.submit(e.intent);lt(e.intent),pe(t.message);const n=ye();n!==null&&n.length>0&&nt(t.message,n,T.voice.ttsModel,T.voice.ttsVoice).catch(()=>{}),await On(e.waitMs)}}finally{Pe=!1,ae&&(ae.disabled=!1)}}}ae&&ae.addEventListener("click",()=>{ct()});const dt=document.getElementById("ptt");let Ie=!1;async function jn(e){const t=ye();if(t===null||t.length===0){pe("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await fn(e,t,T.voice.sttModel,T.voice.sttFallbackModel);await Ae(n)}catch(n){const i=n instanceof Error?n.message:String(n);pe(i)}}pn(dt,{onRecordingChange:e=>{dt.classList.toggle("recording",e)},onBlob:e=>{Ie=!0,jn(e).finally(()=>{Ie=!1})},onError:e=>{pe(e.message)},canStart:()=>!Ie}),ln();const Q=window.DEMO;if(Q===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const xe=An(oe,Q.ms_GroupShip,Q.ms_BlackPearlShip,()=>window.DEMO?.ms_Sails??null,T.visuals,{camera:Q.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:Q.ms_WindStreaks}),zn=10/12;function ut(){ve.setWind(T.environment.windDirectionDeg,T.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(T.environment.windDirectionDeg+180)*Math.PI/180,n=T.environment.windSpeedKts*zn;e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,e.ms_Ocean.changed=!0}!(window.location.hash.length>1)&&Q.ms_Environment!==T.environment.skyPreset&&Q.UpdateEnvironment(T.environment.skyPreset),ut();function Vn(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function $n(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function Wn(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function Hn(e,t){switch(Wt(T,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waterColor":{const n=Vn(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":$n(t);break;case"visuals.streakOpacity":Wn(t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":ut();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t);break}}Qt(Hn);const he=document.getElementById("view-toggle");function pt(e){return e==="helm"?"Follow Cam":"Helm View"}function ht(){xe.toggleView(),he&&(he.textContent=pt(xe.getViewMode()))}he&&(he.textContent=pt(xe.getViewMode()),he.addEventListener("click",()=>{ht()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}ht()});let Oe=null;function mt(e){if(Oe!==null){const t=e-Oe;ve.tick(t)}Oe=e,xe.update(e),Pn.update(),requestAnimationFrame(mt)}requestAnimationFrame(mt),window.__captain={bus:oe,submitIntent:In,injectTranscript:Ae,setWind:(e,t)=>{ve.setWind(e,t)},demo:ct,getConfig:()=>T,copyConfig:()=>{const e=JSON.stringify(T,null,2);return console.log(e),e},setConfig:e=>{Fe(e),location.reload()},resetConfig:()=>{Be(),location.reload()}}})();
