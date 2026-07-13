(function(){"use strict";function kt(e){return((Math.round(e)%360+360)%360).toString().padStart(3,"0")}function Tt(e){return e.toFixed(1)}function F(e,t,n){switch(e){case"helm_ack_starboard":return"Helm a-starboard, aye sir.";case"helm_ack_port":return"Helm a-port, aye sir.";case"helm_ack_amidships":return"Rudder amidships, sir.";case"trim_ack_main":return"Trimming the main, sir.";case"trim_ack_jib":return"Trimming the jib, sir.";case"trim_ack_all":return"Trimming all sail, sir.";case"no_steerage_way":return"She's barely got steerage way, sir — she'll answer slow.";case"in_irons":return"She's in irons, sir — we've lost the wind over the bow.";case"helm_out_of_range":return"She won't take more than thirty-five degrees of helm, sir.";case"trim_out_of_range":return"Can't trim beyond all the way in or out, sir.";case"unknown_order":return"I don't understand that order, sir.";case"status":{const i=kt(t.heading),o=Tt(t.speedKts),s=kt(t.windDirection),a=Tt(t.windSpeedKts);let r=`Steering ${i} at ${o} knots, wind ${s} at ${a}, sir.`;return t.inIrons&&(r+=" She's in irons."),r}case"sail_ho":return`Sail ho! Three points off the ${n?.side??"starboard"} bow, sir!`;case"enemy_closing":return"She's closing fast, sir!";case"enemy_fires":return"She's opening fire, sir!";case"hit_taken":return(n?.hullHp??1)<=0?"We're hulled, sir — she's answering slow!":"We're hit! Hull's holding, sir.";case"no_target":return"No sail in range, sir.";case"guns_dont_bear":return"She doesn't bear, sir!";case"guns_reloading":return"Guns are loading, sir!";case"player_hit":return"A hit! Right in her hull, sir!";case"player_miss":return"Short, sir — splash off her bow.";case"enemy_struck":return"She's struck her colours, sir!";default:{const i=e;throw new Error(`unhandled message key: ${String(i)}`)}}}const Hn=-35,zn=35,Fn=0,Vn=1,Wn=1;function Bn(e){return e==="main"||e==="jib"||e==="all"}function re(e,t){return{ok:!1,message:e,state:t}}function ne(e,t){return{ok:!0,message:e,state:t}}function jn(e,t){function n(o){const s=o.action;if(s==="helm"){const a=o.degrees;if(typeof a!="number"||!Number.isFinite(a)||a<Hn||a>zn)return Promise.resolve(re(F("helm_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"helm",degrees:a}).accepted)return Promise.resolve(re(F("unknown_order",e.snapshot()),e.snapshot()));const l=e.snapshot();return l.speedKts<Wn?Promise.resolve(ne(F("no_steerage_way",l),l)):a>0?Promise.resolve(ne(F("helm_ack_starboard",l),l)):a<0?Promise.resolve(ne(F("helm_ack_port",l),l)):Promise.resolve(ne(F("helm_ack_amidships",l),l))}if(s==="trim_sail"){const a=o.sail,r=o.trim;if(!Bn(a))return Promise.resolve(re(F("unknown_order",e.snapshot()),e.snapshot()));if(typeof r!="number"||!Number.isFinite(r)||r<Fn||r>Vn)return Promise.resolve(re(F("trim_out_of_range",e.snapshot()),e.snapshot()));if(!e.apply({action:"trim_sail",sail:a,trim:r}).accepted)return Promise.resolve(re(F("unknown_order",e.snapshot()),e.snapshot()));const d=e.snapshot(),u=a==="main"?"trim_ack_main":a==="jib"?"trim_ack_jib":"trim_ack_all";return Promise.resolve(ne(F(u,d),d))}if(s==="report_status"){if(!e.apply({action:"report_status"}).accepted)return Promise.resolve(re(F("unknown_order",e.snapshot()),e.snapshot()));const r=e.snapshot();return Promise.resolve(ne(F("status",r),r))}if(s==="fire_guns"){const a=e.snapshot(),r=t?t():null;if(!r)return Promise.resolve(re(F("no_target",a),a));const l=r.fireGuns();switch(l.kind){case"no_target":return Promise.resolve(re(F("no_target",a),a));case"dont_bear":return Promise.resolve(ne(F("guns_dont_bear",a),a));case"reloading":return Promise.resolve(ne(F("guns_reloading",a),a));case"miss":return Promise.resolve(ne(F("player_miss",a),a));case"hit":{const d=l.enemyStruck?"enemy_struck":"player_hit";return Promise.resolve(ne(F(d,a,{enemyHullHp:l.enemyHullHp}),a))}default:{const d=l;throw new Error(`unhandled fire outcome: ${String(d)}`)}}}return Promise.resolve(re(F("unknown_order",e.snapshot()),e.snapshot()))}function i(){return e.snapshot()}return{submit:n,getState:i}}const nt=1.94384,ie=180/Math.PI,B=Math.PI/180;function _t(e){return e*nt}function it(e){return e/nt}function he(e){let t=e%(2*Math.PI);return t<=-Math.PI&&(t+=2*Math.PI),t>Math.PI&&(t-=2*Math.PI),t}function j(e){return(e%(2*Math.PI)+2*Math.PI)%(2*Math.PI)}function le(e,t,n){return e<t?t:e>n?n:e}const Kn=0,$n=12;function Ct(e={}){return{x:0,y:0,psi:j((e.heading??0)*B),u:it(e.speedKts??0),v:0,r:0,rudder:(e.rudderDeg??0)*B,mainTrim:e.mainTrim??1,jibTrim:e.jibTrim??1,windFromRad:j((e.windDirection??Kn)*B),windSpeedMs:it(e.windSpeedKts??$n)}}const Oe=[0,11,12,15,20,25,30,35,40,45,50,55,60,90,110,140,150,160,165,170,171,180],Un=[0,.33,.39,.48,.71,.97,1.2,1.34,1.3,1.17,1.1,1.06,1,.43,-.06,-.76,-.97,-1.12,-1.16,-1.13,-1.1,0],Gn=[.25,.12,.11,.13,.18,.25,.34,.46,.53,.6,.68,.8,.89,1.27,1.33,1.23,1.1,.89,.76,.6,.57,.25];function Yn(e,t,n){return e+(t-e)*n}function Rt(e,t){const n=le(t,0,180);let i=0;for(;i<Oe.length-1&&Oe[i+1]<=n;)i++;const o=Math.min(i+1,Oe.length-1),s=Oe[i],a=Oe[o],r=a===s?0:(n-s)/(a-s);return Yn(e[i],e[o],r)}function Xn(e){return{cl:Rt(Un,e),cd:Rt(Gn,e)}}function qn(e){const t=le(Math.abs(e),0,180),{cl:n,cd:i}=Xn(t),o=t*B,s=Math.sin(o),a=Math.cos(o),r=n*s-i*a,l=Math.abs(n*a+i*s);return{cDrive:r,cSide:l}}const Dt=.95,Jn=.2;function At(e){const t=le(Math.abs(e),0,180)/180;return le(Dt-(Dt-Jn)*t*t,.15,1)}const Zn=.65;function Qn(e,t){const n=(e-At(t))/Zn;return Math.max(0,1-n*n)}const J={physics:{rhoAir:1.225,mass:4e3,izz:5200,areaMain:25,areaJib:12,kSurgeQuad:28,kSurgeLin:0,kSurgeLinAstern:500,kSwayQuad:2e3,kSwayLin:7e3,kYawDamp:4200,kYawDampU:5200,cRudder:550,cWeather:0},controls:{rudderSlewDegPerS:10,trimSlewPerS:.2,rudderMaxDeg:35},environment:{windDirectionDeg:0,windSpeedKts:20,skyPreset:"day"},initialState:{headingDeg:90,speedKts:2,mainTrim:.5,jibTrim:.5,rudderDeg:0},voice:{sttModel:"gpt-4o-mini-transcribe",sttFallbackModel:"whisper-1",intentModel:"gpt-4o-mini",ttsModel:"gpt-4o-mini-tts",ttsVoice:"onyx",whisperMode:!1,ttsVolume:.55},input:{autoSubmit:!0,autoSubmitDelayMs:1e3},visuals:{worldUnitsPerMetre:14,maxHeelDeg:18,maxBraceDeg:12,heelSmoothingHz:1,ambientRock:0,oceanSize:500,oceanChoppiness:3.6,waveDirectionality:0,seaStateFollowsWind:!0,waterColor:"#596673",sunExposure:.15,boatScale:1,streakCount:64,streakOpacity:.35,helmView:{x:0,y:125,z:150,pitchDeg:-10,fov:70},lighting:{sunElevationDeg:50,sunAzimuthDeg:0,sunIntensity:1.1,ambientIntensity:.55,exposure:1,fogDensity:8e-6},ambientSoundVolume:1,buoyancy:{enabled:!0,heaveScale:1,pitchScale:1,rollScale:.5,stiffness:2.2,damping:1}},battle:{enabled:!0,spawnRangeM:550,aggression:.5,seed:1337,cannonRangeM:250,reloadS:25,playerReloadS:20}},Re="captain.config";function pe(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function ei(e){return typeof structuredClone=="function"?structuredClone(e):JSON.parse(JSON.stringify(e))}function Pt(e,t,n,i){for(const o of Object.keys(t)){const s=t[o];if(!(o in e)){i.push(`${n}${o} (unknown key)`);continue}const a=e[o];pe(a)&&pe(s)?Pt(a,s,`${n}${o}.`,i):pe(a)||pe(s)||typeof a!=typeof s?i.push(`${n}${o} (expected ${typeof a}, got ${typeof s})`):e[o]=s}}function Nt(e,t){const n={...e};for(const i of Object.keys(t)){const o=t[i],s=n[i];n[i]=pe(s)&&pe(o)?Nt(s,o):o}return n}function $e(){return typeof localStorage<"u"}function ti(){if(!$e())return{};const e=localStorage.getItem(Re);if(e===null||e.length===0)return{};try{const t=JSON.parse(e);return pe(t)?t:{}}catch{return{}}}function Ue(){const e=ei(J);if(!$e())return e;const t=localStorage.getItem(Re);if(t===null||t.length===0)return e;let n;try{n=JSON.parse(t)}catch{return console.warn(`captain.config: stored value in localStorage["${Re}"] is not valid JSON — ignoring it, using defaults.`),e}if(!pe(n))return console.warn(`captain.config: stored value in localStorage["${Re}"] is not a JSON object — ignoring it, using defaults.`),e;const i=[];return Pt(e,n,"",i),i.length>0&&console.warn(`captain.config: ignored ${i.length} invalid override(s): ${i.join("; ")}`),e}function It(e){if(!$e())return;const t=ti(),n=Nt(t,e);localStorage.setItem(Re,JSON.stringify(n))}function Lt(){$e()&&localStorage.removeItem(Re)}function Me(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let s=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0||(s=s?.[r],s==null))return}s!=null&&(s[o]=n)}const ni=[{path:"physics.rhoAir",label:"Air density",section:"Physics",type:"number",min:.5,max:2,step:.005,live:!1},{path:"physics.mass",label:"Mass (kg)",section:"Physics",type:"number",min:500,max:2e4,step:50,live:!1},{path:"physics.izz",label:"Yaw inertia",section:"Physics",type:"number",min:500,max:3e4,step:50,live:!1},{path:"physics.areaMain",label:"Main sail area (m²)",section:"Physics",type:"number",min:1,max:100,step:.5,live:!1},{path:"physics.areaJib",label:"Jib area (m²)",section:"Physics",type:"number",min:1,max:60,step:.5,live:!1},{path:"physics.kSurgeQuad",label:"Surge drag (quad)",section:"Physics",type:"number",min:0,max:200,step:1,live:!1},{path:"physics.kSurgeLin",label:"Surge drag (linear)",section:"Physics",type:"number",min:0,max:1e3,step:5,live:!1},{path:"physics.kSurgeLinAstern",label:"Sternway drag (linear)",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.kSwayQuad",label:"Sway drag (quad)",section:"Physics",type:"number",min:0,max:1e4,step:50,live:!1},{path:"physics.kSwayLin",label:"Sway drag (linear)",section:"Physics",type:"number",min:0,max:3e4,step:100,live:!1},{path:"physics.kYawDamp",label:"Yaw damping",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.kYawDampU",label:"Yaw damping (speed-coupled)",section:"Physics",type:"number",min:0,max:2e4,step:100,live:!1},{path:"physics.cRudder",label:"Rudder yaw coefficient",section:"Physics",type:"number",min:0,max:3e3,step:10,live:!1},{path:"physics.cWeather",label:"Weathercock coefficient",section:"Physics",type:"number",min:-500,max:500,step:5,live:!1},{path:"controls.rudderSlewDegPerS",label:"Rudder slew rate (deg/s)",section:"Controls",type:"number",min:1,max:60,step:1,live:!1},{path:"controls.trimSlewPerS",label:"Trim slew rate (/s)",section:"Controls",type:"number",min:.01,max:2,step:.01,live:!1},{path:"controls.rudderMaxDeg",label:"Max rudder deflection (deg)",section:"Controls",type:"number",min:5,max:45,step:1,live:!1},{path:"environment.windDirectionDeg",label:"Wind direction (deg true, FROM)",section:"Environment",type:"number",min:0,max:360,step:1,live:!0},{path:"environment.windSpeedKts",label:"Wind speed (kts)",section:"Environment",type:"number",min:0,max:40,step:.5,live:!0},{path:"environment.skyPreset",label:"Sky / lighting preset",section:"Environment",type:"select",options:["dawn","day","dusk"],live:!0,note:"captain-ocean only — ignored by the standalone captain scene."},{path:"initialState.headingDeg",label:"Initial heading (deg true)",section:"Initial State",type:"number",min:0,max:360,step:1,live:!1},{path:"initialState.speedKts",label:"Initial speed (kts)",section:"Initial State",type:"number",min:0,max:20,step:.1,live:!1},{path:"initialState.mainTrim",label:"Initial main trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.jibTrim",label:"Initial jib trim",section:"Initial State",type:"number",min:0,max:1,step:.01,live:!1},{path:"initialState.rudderDeg",label:"Initial rudder (deg)",section:"Initial State",type:"number",min:-35,max:35,step:1,live:!1},{path:"voice.sttModel",label:"STT model",section:"Voice",type:"text",live:!1},{path:"voice.sttFallbackModel",label:"STT fallback model",section:"Voice",type:"text",live:!1},{path:"voice.intentModel",label:"Intent model",section:"Voice",type:"text",live:!1},{path:"voice.ttsModel",label:"TTS model",section:"Voice",type:"text",live:!1},{path:"voice.ttsVoice",label:"TTS voice",section:"Voice",type:"text",live:!1},{path:"voice.whisperMode",label:"Ship's mic (hands-free) by default",section:"Voice",type:"boolean",live:!1,note:"Live toggle lives in the ⚙ command-config popover next to the quarterdeck log; this only sets next boot's default."},{path:"voice.ttsVolume",label:"Crew voice volume",section:"Voice",type:"number",min:0,max:1,step:.05,live:!0,note:"Applied to the crew's spoken replies. See also Visuals' Ambient sea volume."},{path:"input.autoSubmit",label:"Auto-submit on paste / typing pause",section:"Input",type:"boolean",live:!1,note:"Enter always submits regardless of this."},{path:"input.autoSubmitDelayMs",label:"Auto-submit pause delay (ms)",section:"Input",type:"number",min:200,max:5e3,step:50,live:!1},{path:"visuals.worldUnitsPerMetre",label:"World units per metre",section:"Visuals",type:"number",min:1,max:50,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxHeelDeg",label:"Max heel (deg)",section:"Visuals",type:"number",min:0,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.maxBraceDeg",label:"Max sail brace (deg)",section:"Visuals",type:"number",min:0,max:30,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.heelSmoothingHz",label:"Heel smoothing (Hz)",section:"Visuals",type:"number",min:.1,max:5,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientRock",label:"Ambient rock (stock wobble)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.oceanSize",label:"Ocean wave scale (manual, see Sea state follows wind)",section:"Visuals",type:"number",min:10,max:2e3,step:10,live:!0,note:"captain-ocean only."},{path:"visuals.oceanChoppiness",label:"Ocean choppiness (manual)",section:"Visuals",type:"number",min:.1,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.waveDirectionality",label:"Wave directionality / spread tightness (manual)",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. 0 = original spread shape, 1 = tightest downwind cone."},{path:"visuals.seaStateFollowsWind",label:"Sea state follows wind speed",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. When on, the three 'manual' sliders above are overwritten from wind speed every time wind changes."},{path:"visuals.waterColor",label:"Water color",section:"Visuals",type:"color",live:!0,note:"captain-ocean only."},{path:"visuals.sunExposure",label:"Sun exposure",section:"Visuals",type:"number",min:0,max:.5,step:.01,live:!0,note:"captain-ocean only."},{path:"visuals.boatScale",label:"Boat scale",section:"Visuals",type:"number",min:.2,max:5,step:.05,live:!0},{path:"visuals.streakCount",label:"Wind streak count",section:"Visuals",type:"number",min:0,max:64,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.streakOpacity",label:"Wind streak opacity",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.x",label:"Helm eye X (starboard+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.y",label:"Helm eye Y (up+)",section:"Visuals",type:"number",min:0,max:400,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.z",label:"Helm eye Z (aft+)",section:"Visuals",type:"number",min:-300,max:300,step:5,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.pitchDeg",label:"Helm pitch (deg, up+)",section:"Visuals",type:"number",min:-45,max:45,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.helmView.fov",label:"Helm FOV (deg)",section:"Visuals",type:"number",min:30,max:120,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.ambientSoundVolume",label:"Ambient sea volume",section:"Visuals",type:"number",min:0,max:1,step:.05,live:!0,note:"captain-ocean only. The shell's own ambient wave-loop audio, independent of crew voice volume above."},{path:"visuals.buoyancy.enabled",label:"Buoyancy (heave/pitch/roll over waves)",section:"Visuals",type:"boolean",live:!0,note:"captain-ocean only. Off = ships glide dead-flat (position.y=0, no wave pitch/roll) exactly like before this round."},{path:"visuals.buoyancy.heaveScale",label:"Buoyancy heave scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.pitchScale",label:"Buoyancy pitch scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.rollScale",label:"Buoyancy roll scale",section:"Visuals",type:"number",min:0,max:2,step:.05,live:!0,note:"captain-ocean only. Adds to (does not replace) the existing wind-heel roll."},{path:"visuals.buoyancy.stiffness",label:"Buoyancy spring stiffness (rad/s)",section:"Visuals",type:"number",min:.2,max:8,step:.1,live:!0,note:"captain-ocean only."},{path:"visuals.buoyancy.damping",label:"Buoyancy spring damping ratio",section:"Visuals",type:"number",min:.5,max:3,step:.05,live:!0,note:"captain-ocean only. 1.0 = critically damped (default, recommended); below 1 risks visible bobbing."},{path:"visuals.lighting.sunElevationDeg",label:"Sun elevation (deg)",section:"Lighting",type:"number",min:0,max:90,step:1,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.sunAzimuthDeg",label:"Sun azimuth (deg, bearing)",section:"Lighting",type:"number",min:-180,max:180,step:1,live:!0,note:"captain-ocean only. 0 = 90 deg clear of the default camera view axis (see LightingConfig comment) — steer away from +-90/+-270 to avoid reintroducing the glare complaint."},{path:"visuals.lighting.sunIntensity",label:"Sun intensity",section:"Lighting",type:"number",min:0,max:2.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.ambientIntensity",label:"Ambient fill intensity",section:"Lighting",type:"number",min:0,max:1.5,step:.05,live:!0,note:"captain-ocean only."},{path:"visuals.lighting.exposure",label:"Lighting exposure (global)",section:"Lighting",type:"number",min:.2,max:2,step:.05,live:!0,note:"captain-ocean only. Distinct from Visuals' Sun exposure, which only feeds the ocean shader."},{path:"visuals.lighting.fogDensity",label:"Fog density (mountain haze)",section:"Lighting",type:"number",min:0,max:5e-5,step:5e-7,live:!0,note:"captain-ocean only."},{path:"battle.enabled",label:"Battle enabled (spawn an AI NPC)",section:"Battle",type:"boolean",live:!1},{path:"battle.spawnRangeM",label:"NPC spawn range (m)",section:"Battle",type:"number",min:100,max:3e3,step:50,live:!1},{path:"battle.aggression",label:"NPC aggression (0-1)",section:"Battle",type:"number",min:0,max:1,step:.05,live:!1},{path:"battle.seed",label:"Battle RNG seed",section:"Battle",type:"number",min:0,max:999999,step:1,live:!1},{path:"battle.cannonRangeM",label:"Cannon range (m)",section:"Battle",type:"number",min:20,max:500,step:10,live:!1},{path:"battle.reloadS",label:"Cannon reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1},{path:"battle.playerReloadS",label:"Player battery reload time (s)",section:"Battle",type:"number",min:5,max:120,step:1,live:!1}],ii=J.controls.rudderMaxDeg*B,ai=J.physics;function at(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t,s=-e.windSpeedMs*Math.sin(e.windFromRad),a=-e.windSpeedMs*Math.cos(e.windFromRad),r=s-i,l=a-o,d=Math.hypot(r,l),u=r*t+l*n,c=r*n-l*t;return{awaDeg:Math.atan2(-c,-u)*ie,awsMs:d}}function Ot(e,t,n,i,o){const s=Math.abs(n),{cDrive:a,cSide:r}=qn(s),l=Qn(t,s),d=.5*o*i*i,u=d*e*a*l,c=d*e*r*l,f=-Math.sign(n||1)*c;return{surge:u,sway:f}}function Ht(e,t,n=ai,i=ii,o=1){const{awaDeg:s,awsMs:a}=at(e),r=Ot(n.areaMain,e.mainTrim,s,a,n.rhoAir),l=Ot(n.areaJib,e.jibTrim,s,a,n.rhoAir),d=(r.surge+l.surge)*o,u=(r.sway+l.sway)*o,c=e.u,f=e.v,h=e.r,y=c>=0?n.kSurgeLin:n.kSurgeLinAstern,b=-n.kSurgeQuad*c*Math.abs(c)-y*c,A=-n.kSwayQuad*f*Math.abs(f)-n.kSwayLin*f,T=le(e.rudder,-i,i),w=n.cRudder*T*c*Math.abs(c),M=-(n.kYawDamp+n.kYawDampU*Math.abs(c))*h,_=n.cWeather*Math.sin(s*B)*a*Math.min(1,Math.abs(c)),E=w+M+_,C=(d+b)/n.mass+f*h,R=(u+A)/n.mass-c*h,L=E/n.izz;e.u=c+C*t,e.v=f+R*t,e.r=h+L*t;const W=Math.sin(e.psi),g=Math.cos(e.psi),k=e.u*W+e.v*g,m=e.u*g-e.v*W;e.x+=k*t,e.y+=m*t,e.psi=j(e.psi+e.r*t)}function zt(e){return Math.hypot(e.u,e.v)*nt}function oi(e){const t=Math.sin(e.psi),n=Math.cos(e.psi),i=e.u*t+e.v*n,o=e.u*n-e.v*t;return j(Math.atan2(i,o))}function si(e){return zt(e)<.2?0:he(e.psi-oi(e))*ie}const He=.05,Ft=He*1e3;function ot(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class ri{state;rudderTargetRad;mainTrimTarget;jibTrimTarget;accMs=0;driveMultiplier=1;physics;rudderRateRadPerS;trimRatePerS;rudderMaxRad;constructor(t={},n=J){this.physics=n.physics,this.rudderRateRadPerS=n.controls.rudderSlewDegPerS*B,this.trimRatePerS=n.controls.trimSlewPerS,this.rudderMaxRad=n.controls.rudderMaxDeg*B,this.state=Ct({heading:t.heading??n.initialState.headingDeg,speedKts:t.speedKts??n.initialState.speedKts,windDirection:t.windDirection??n.environment.windDirectionDeg,windSpeedKts:t.windSpeedKts??n.environment.windSpeedKts,mainTrim:t.mainTrim??n.initialState.mainTrim,jibTrim:t.jibTrim??n.initialState.jibTrim,rudderDeg:t.rudderAngle??n.initialState.rudderDeg}),this.rudderTargetRad=this.state.rudder,this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim}apply(t){switch(t.action){case"helm":return this.rudderTargetRad=le(t.degrees*B,-this.rudderMaxRad,this.rudderMaxRad),{accepted:!0};case"trim_sail":{const n=le(t.trim,0,1);return(t.sail==="main"||t.sail==="all")&&(this.mainTrimTarget=n),(t.sail==="jib"||t.sail==="all")&&(this.jibTrimTarget=n),{accepted:!0}}case"report_status":return{accepted:!0};case"fire_guns":return{accepted:!0};default:return{accepted:!1,reason:`unknown intent: ${JSON.stringify(t)}`}}}tick(t){if(t>0)for(this.accMs+=t;this.accMs>=Ft;)this.state.rudder=ot(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*He),this.state.mainTrim=ot(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*He),this.state.jibTrim=ot(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*He),Ht(this.state,He,this.physics,this.rudderMaxRad,this.driveMultiplier),this.accMs-=Ft}snapshot(){const{awaDeg:t,awsMs:n}=at(this.state),i=zt(this.state);return{heading:this.state.psi*ie%360,speedKts:i,windDirection:this.state.windFromRad*ie%360,windSpeedKts:_t(this.state.windSpeedMs),apparentWindAngle:t,apparentWindKts:_t(n),mainTrim:this.state.mainTrim,jibTrim:this.state.jibTrim,rudderAngle:this.state.rudder*ie,inIrons:Math.abs(t)<30&&i<.5,leewayDeg:si(this.state)}}setWind(t,n){this.state.windFromRad=j(t*B),this.state.windSpeedMs=it(n)}getPose(){return{x:this.state.x,y:this.state.y,headingRad:this.state.psi}}setDriveMultiplier(t){this.driveMultiplier=t}}const st="captain.openai_key",li="Your OpenAI API key stays in this browser's localStorage and is sent only to api.openai.com";function De(){return window.localStorage.getItem(st)}function Vt(e){window.localStorage.setItem(st,e)}function ci(){window.localStorage.removeItem(st)}function Wt(e=document.body){const t=De();return t!==null&&t.length>0?Promise.resolve(t):new Promise(n=>{const i=document.createElement("div");i.id="byok-modal",i.style.position="fixed",i.style.inset="0",i.style.display="flex",i.style.alignItems="center",i.style.justifyContent="center",i.style.background="rgba(0, 10, 20, 0.75)",i.style.zIndex="100",i.style.fontFamily="ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";const o=document.createElement("div");o.style.background="#0e1f2e",o.style.color="#e8f4ff",o.style.padding="20px 24px",o.style.borderRadius="6px",o.style.maxWidth="360px",o.style.display="flex",o.style.flexDirection="column",o.style.gap="10px";const s=document.createElement("div");s.textContent="OpenAI API key",s.style.fontSize="15px",s.style.fontWeight="bold";const a=document.createElement("p");a.id="byok-copy",a.textContent=li,a.style.margin="0",a.style.fontSize="12px",a.style.opacity="0.85";const r=document.createElement("input");r.id="byok-key-input",r.type="password",r.placeholder="sk-...",r.autocomplete="off",r.style.fontFamily="inherit",r.style.fontSize="13px",r.style.padding="6px 8px";const l=document.createElement("button");l.id="byok-save",l.type="button",l.textContent="Save",l.style.fontFamily="inherit",l.style.fontSize="13px",l.style.padding="6px 10px",l.style.cursor="pointer";function d(){const u=r.value.trim();u.length!==0&&(Vt(u),i.remove(),n(u))}l.addEventListener("click",d),r.addEventListener("keydown",u=>{u.key==="Enter"&&d()}),o.appendChild(s),o.appendChild(a),o.appendChild(r),o.appendChild(l),i.appendChild(o),e.appendChild(i),r.focus()})}const di=["alloy","ash","ballad","coral","echo","fable","nova","onyx","sage","shimmer","verse"];function ui(e,t,n){e.innerHTML="",Mi();const i=document.createElement("div");i.id="hud",e.appendChild(i);const o=document.createElement("div");o.className="hud-panel hud-state",i.appendChild(o);const s=document.createElement("div");s.className="hud-panel-title",s.textContent="Ship State",o.appendChild(s);function a(p,x,I=!1){const V=document.createElement("div");V.id=p,V.className="hud-row";const de=document.createElement("span");de.className="hud-row-label",de.textContent=x,V.appendChild(de);const Se=document.createElement("span");Se.className="hud-row-colon",Se.textContent=": ",V.appendChild(Se);const ue=document.createElement("span");ue.className="hud-row-value",ue.textContent="--",V.appendChild(ue);let ee=null;if(I){const te=document.createElement("div");te.className="hud-bar",ee=document.createElement("div"),ee.className="hud-bar-fill",te.appendChild(ee),V.appendChild(te)}return o.appendChild(V),{setValue:te=>{ue.textContent=te},setFill:ee?te=>{ee&&(ee.style.width=`${Math.max(0,Math.min(100,te))}%`)}:void 0}}const r=a("hud-heading","heading"),l=a("hud-speed","speed"),d=a("hud-wind","wind"),u=a("hud-awa","awa"),c=a("hud-main","main",!0),f=a("hud-jib","jib",!0),h=a("hud-rudder","rudder"),y="http://www.w3.org/2000/svg";function b(p,x){const I=document.createElementNS(y,p);for(const[V,de]of Object.entries(x))I.setAttribute(V,de);return I}const A=document.getElementById("hud-wind"),T=document.createElement("div");T.id="hud-windvane",T.className="hud-windvane";const w=b("svg",{viewBox:"0 0 40 40",width:"26",height:"26","aria-hidden":"true",focusable:"false"});w.appendChild(b("circle",{cx:"20",cy:"20",r:"17",class:"hud-windvane-ring"})),w.appendChild(b("polygon",{points:"20,2 16,11 24,11",class:"hud-windvane-bow"}));const M=b("g",{class:"hud-windvane-arrow"});M.appendChild(b("line",{x1:"20",y1:"8",x2:"20",y2:"21",class:"hud-windvane-arrow-shaft"})),M.appendChild(b("polygon",{points:"20,26 14,16 26,16",class:"hud-windvane-arrow-head"})),w.appendChild(M),w.appendChild(b("circle",{cx:"20",cy:"20",r:"1.6",class:"hud-windvane-hub"})),T.appendChild(w),A.appendChild(T);const _=document.getElementById("hud-rudder"),E=document.createElement("div");E.className="hud-gauge";const C=document.createElement("div");C.className="hud-gauge-center-tick",E.appendChild(C);const R=document.createElement("div");R.className="hud-gauge-target",E.appendChild(R);const L=document.createElement("div");L.className="hud-gauge-needle",E.appendChild(L),_.appendChild(E);let W=null;function g(p){return(Math.max(-35,Math.min(35,p))+35)/70*100}function k(p){const x=g(p);L.style.left=`${x}%`,L.classList.toggle("port",p<-.5),L.classList.toggle("stbd",p>.5),W!==null&&Math.abs(p-W)>.5?(R.style.left=`${g(W)}%`,R.style.display="block"):R.style.display="none"}const m=document.createElement("div");m.id="hud-irons",m.className="hud-irons-row";const v=document.createElement("span");v.className="hud-visually-hidden",v.textContent="irons: false",m.appendChild(v),o.appendChild(m);const D=document.createElement("div");D.className="hud-panel hud-log",i.appendChild(D);const P=document.createElement("div");P.className="hud-log-header",D.appendChild(P);const N=document.createElement("div");N.className="hud-panel-title hud-log-title-text",N.textContent="Quarterdeck Log",P.appendChild(N);const O=document.createElement("button");O.id="command-config-toggle",O.type="button",O.title="Voice & key settings",O.setAttribute("aria-label","Command config"),O.textContent="⚙",O.className="hud-btn hud-command-config-toggle",P.appendChild(O);const K=document.createElement("div");K.id="hud-log-list",K.className="hud-log-list",D.appendChild(K);const ye=6,G=[{kind:"exchange",transcript:"--",order:"--",crew:"--"}];function _e(){K.innerHTML="";let p=-1;G.forEach((x,I)=>{x.kind==="exchange"&&(p=I)}),G.forEach((x,I)=>{const V=document.createElement("div");if(V.style.opacity=String(.45+.55*((I+1)/G.length)),x.kind==="system"){V.className="hud-log-entry hud-log-system-entry";const te=document.createElement("div");te.className="hud-log-system",te.textContent=`⚠ ${x.transcript}`,V.appendChild(te),K.appendChild(V);return}const de=I===p;V.className="hud-log-entry";const Se=document.createElement("div");Se.className="hud-log-you",de&&(Se.id="hud-transcript"),Se.textContent=`You: ${x.transcript}`,V.appendChild(Se);const ue=document.createElement("div");ue.className="hud-log-order",de&&(ue.id="hud-intent"),ue.textContent=x.order,V.appendChild(ue);const ee=document.createElement("div");ee.className="hud-log-crew",de&&(ee.id="hud-crew"),ee.textContent=`Crew: ${x.crew}`,V.appendChild(ee),K.appendChild(V)}),K.scrollTop=K.scrollHeight}_e();function se(p){if(p===null)return"→ no order";if(p.action==="helm"){const x=Math.round(p.degrees),I=x<0?"port":x>0?"stbd":"amidships";return`→ helm ${x}° (${I})`}return p.action==="trim_sail"?`→ trim ${p.sail} → ${p.trim.toFixed(2)}`:p.action==="fire_guns"?"→ fire guns":"→ status report"}function q(p){G.push({kind:"exchange",transcript:p,order:"→ …",crew:"…"}),G.length>ye&&G.shift(),_e()}function $(p){const x=[...G].reverse().find(I=>I.kind==="exchange");x&&(x.order=se(p)),p!==null&&p.action==="helm"&&(W=p.degrees),_e()}function Qe(p){const x=[...G].reverse().find(I=>I.kind==="exchange");x&&(x.crew=p),_e()}function Ke(p){G.push({kind:"system",transcript:p,order:"",crew:""}),G.length>ye&&G.shift(),_e()}const be=document.createElement("div");be.className="hud-controls",D.insertBefore(be,K);const z=document.createElement("input");z.id="transcript-input",z.type="text",z.placeholder="Speak or type your orders…",z.className="hud-input",be.appendChild(z);const Ce=document.createElement("div");Ce.className="hud-button-row",be.appendChild(Ce);const we=document.createElement("button");we.id="ptt",we.type="button",we.textContent="Hold to Talk",we.className="hud-btn hud-btn-ptt",Ce.appendChild(we);const ce=document.createElement("button");ce.id="view-toggle",ce.type="button",ce.textContent="Helm View",ce.className="hud-btn hud-btn-view-toggle",Ce.appendChild(ce);function ve(){z.focus()}const Ie=Ue().input,U=2;let H=null;function Y(){H!==null&&(clearTimeout(H),H=null)}let Q=!1,xe=null;async function Le(p){if(Q||(n.isPipelineBusy?.()??!1)){xe=p;return}Q=!0,Y();try{await n.injectTranscript(p),z.value=""}catch(x){const I=x instanceof Error?x.message:String(x);Qe(I)}finally{if(Q=!1,ve(),xe!==null){const x=xe;xe=null,Le(x)}}}function et(p){if(!Ie.autoSubmit)return;const x=p.trim();x.length<U||Le(x)}z.addEventListener("input",p=>{if(Y(),!Ie.autoSubmit)return;if(p.inputType==="insertFromPaste"){et(z.value);return}z.value.trim().length<U||(H=setTimeout(()=>{H=null,et(z.value)},Ie.autoSubmitDelayMs))}),z.addEventListener("keydown",p=>{if(p.key!=="Enter")return;Y();const x=z.value.trim();x.length!==0&&Le(x)}),document.addEventListener("click",p=>{p.target instanceof HTMLCanvasElement&&ve()}),vi(i,ve);const Et=Si(D,O,n,ve);function tt(p){return p.toFixed(1)}function Pn(p){return p.toFixed(2)}const co=["N","NE","E","SE","S","SW","W","NW"];function Nn(p){return(p%360+360)%360}function In(p){const x=Math.round(Nn(p)/45)%8;return co[x]??"N"}function Ln(p){return String(Math.round(Nn(p))%360).padStart(3,"0")}function uo(p){return`${Ln(p)} ${In(p)}`}function ho(p,x){return`from ${Ln(p)} @ ${tt(x)} kts (${In(p)})`}function po(p,x){const I=Math.round(p);if(I===0)return`dead ahead @ ${tt(x)} kts`;const V=I<0?"port":"starboard";return`${Math.abs(I)}° to ${V} @ ${tt(x)} kts`}function mo(p){const x=Math.round(p),I=x<0?"port":x>0?"stbd":"amidships";return`${x}° ${I}`}function go(p){r.setValue(uo(p.heading)),l.setValue(`${tt(p.speedKts)} kts`),d.setValue(ho(p.windDirection,p.windSpeedKts)),M&&M.setAttribute("transform",`rotate(${p.windDirection-p.heading} 20 20)`),u.setValue(po(p.apparentWindAngle,p.apparentWindKts)),c.setValue(Pn(p.mainTrim)),c.setFill?.(p.mainTrim*100),f.setValue(Pn(p.jibTrim)),f.setFill?.(p.jibTrim*100),h.setValue(mo(p.rudderAngle)),k(p.rudderAngle),v.textContent=`irons: ${p.inIrons}`,m.classList.toggle("active",p.inIrons)}function On(){go(t.getState())}return On(),ze={logTranscript:q,logIntent:$,logCrewLine:Qe,logSystemNote:Ke},Kt={setVoiceModeChecked:Et.setWhisperModeChecked},$t={focus:ve},{update:On}}let ze=null;function hi(e){ze?.logTranscript(e)}function Bt(e){ze?.logIntent(e)}function rt(e){ze?.logCrewLine(e)}function jt(e){ze?.logSystemNote(e)}function pi(e,t){Bt(e),rt(t)}let Kt=null;function lt(e){Kt?.setVoiceModeChecked(e)}let $t=null;function mi(){$t?.focus()}let Ut=[];function gi(e){Ut.push(e)}function fi(e,t){for(const n of Ut)n(e,t)}function yi(e){if(!(e instanceof HTMLElement))return!1;const t=e.tagName;return t==="INPUT"||t==="SELECT"||t==="TEXTAREA"||e.isContentEditable}function bi(e,t){return t.split(".").reduce((n,i)=>{if(!(n===null||typeof n!="object"))return n[i]},e)}function wi(e,t,n){const i=t.split("."),o=i[i.length-1];if(o===void 0)return;let s=e;for(let a=0;a<i.length-1;a++){const r=i[a];if(r===void 0)return;const l=s[r];(typeof l!="object"||l===null)&&(s[r]={}),s=s[r]}s[o]=n}function Gt(e,t){const n={...e};for(const i of Object.keys(t)){const o=e[i],s=t[i];o!==null&&typeof o=="object"&&!Array.isArray(o)&&s!==null&&typeof s=="object"&&!Array.isArray(s)?n[i]=Gt(o,s):n[i]=s}return n}function vi(e,t){const n=Ue(),i={};let o=!1;const s=new Map,a=document.createElement("button");a.id="settings-toggle",a.type="button",a.title="Settings (S)",a.setAttribute("aria-label","Settings"),a.textContent="⚙",a.className="hud-btn hud-settings-toggle",e.appendChild(a);const r=document.createElement("div");r.id="settings-panel",r.className="hud-panel hud-settings-panel",e.appendChild(r);const l=document.createElement("div");l.className="hud-panel-title",l.textContent="Settings",r.appendChild(l);const d=document.createElement("div");d.className="hud-settings-reload-banner",d.hidden=!0,d.textContent="Some changes need Save & Reload to take effect.",r.appendChild(d);function u(){d.hidden=!o}function c(g,k){if(wi(i,g.path,k),g.live)fi(g.path,k);else{const m=s.get(g.path);m&&(m.hidden=!1),o=!0,u()}}function f(g,k){const m=document.createElement("div");m.className="hud-settings-control-row";const v=document.createElement("input");v.type="range",v.min=String(g.min??0),v.max=String(g.max??100),v.step=String(g.step??1),v.value=String(k),v.className="hud-settings-range";const D=document.createElement("input");D.type="number",D.min=v.min,D.max=v.max,D.step=v.step,D.value=String(k),D.className="hud-settings-numeric";const P=g.min??-1/0,N=g.max??1/0;function O(K){if(!Number.isFinite(K))return;const ye=Math.min(N,Math.max(P,K));v.value=String(ye),D.value=String(ye),c(g,ye)}return v.addEventListener("input",()=>O(Number(v.value))),D.addEventListener("input",()=>O(Number(D.value))),m.appendChild(v),m.appendChild(D),m}function h(g,k){const m=document.createElement("label");m.className="hud-settings-checkbox-label";const v=document.createElement("input");return v.type="checkbox",v.checked=k,v.addEventListener("change",()=>c(g,v.checked)),m.appendChild(v),m}function y(g,k){const m=document.createElement("select");m.className="hud-settings-select";for(const v of g.options??[]){const D=document.createElement("option");D.value=v,D.textContent=v,v===k&&(D.selected=!0),m.appendChild(D)}return m.addEventListener("change",()=>c(g,m.value)),m}function b(g,k){const m=document.createElement("input");return m.type="color",m.className="hud-settings-color",m.value=k,m.addEventListener("input",()=>c(g,m.value)),m}function A(g,k){const m=document.createElement("input");return m.type="text",m.className="hud-settings-text",m.value=k,m.addEventListener("change",()=>c(g,m.value)),m}function T(g){const k=document.createElement("div");k.className="hud-settings-field",k.dataset.configPath=g.path;const m=document.createElement("div");m.className="hud-settings-label-row";const v=document.createElement("span");if(v.className="hud-settings-label",v.textContent=g.label,m.appendChild(v),!g.live){const N=document.createElement("span");N.className="hud-settings-reload-dot",N.title="Staged — needs Save & Reload",N.hidden=!0,m.appendChild(N),s.set(g.path,N)}k.appendChild(m);const D=bi(n,g.path);let P;switch(g.type){case"number":P=f(g,D);break;case"boolean":P=h(g,D);break;case"select":P=y(g,D);break;case"color":P=b(g,D);break;default:P=A(g,D);break}if(k.appendChild(P),g.note){const N=document.createElement("div");N.className="hud-settings-note",N.textContent=g.note,k.appendChild(N)}return k}const w=new Map;for(const g of ni)w.has(g.section)||w.set(g.section,[]),w.get(g.section)?.push(g);const M=new Set(["Visuals","Environment","Lighting"]);for(const[g,k]of w){const m=document.createElement("details");m.className="hud-settings-section",m.open=M.has(g);const v=document.createElement("summary");v.textContent=g,m.appendChild(v);for(const D of k)m.appendChild(T(D));r.appendChild(m)}const _=document.createElement("div");_.className="hud-settings-footer";const E=document.createElement("button");E.id="settings-save-reload",E.type="button",E.textContent="Save & Reload",E.className="hud-btn",E.addEventListener("click",()=>{It(i),location.reload()});const C=document.createElement("button");C.id="settings-copy-json",C.type="button",C.textContent="Copy JSON",C.className="hud-btn",C.addEventListener("click",()=>{(async()=>{const g=Gt(n,i),k=JSON.stringify(g,null,2);console.log(k);try{await navigator.clipboard?.writeText(k)}catch{}})()});const R=document.createElement("button");R.id="settings-reset-all",R.type="button",R.textContent="Reset All",R.className="hud-btn",R.addEventListener("click",()=>{Lt(),location.reload()}),_.appendChild(E),_.appendChild(C),_.appendChild(R),r.appendChild(_);let L=!1;function W(g){L=g,r.classList.toggle("open",g),a.classList.toggle("active",g),g||t()}a.addEventListener("click",()=>W(!L)),document.addEventListener("keydown",g=>{g.key!=="s"&&g.key!=="S"||yi(document.activeElement)||W(!L)})}function xi(e){return e.length<=4?"•".repeat(e.length):`sk-…${e.slice(-4)}`}function Si(e,t,n,i){const o=Ue(),s=document.createElement("div");s.id="command-config",s.className="hud-panel hud-command-config",e.appendChild(s);function a(m){const v=document.createElement("div");return v.className="hud-command-config-section-title",v.textContent=m,v}s.appendChild(a("Voice Mode"));const r=document.createElement("div");r.className="hud-segmented";const l=document.createElement("label");l.className="hud-segmented-option";const d=document.createElement("input");d.type="radio",d.name="voice-mode",d.id="voice-mode-ptt",l.appendChild(d),l.appendChild(document.createTextNode("Push to talk"));const u=document.createElement("label");u.className="hud-segmented-option";const c=document.createElement("input");c.type="radio",c.name="voice-mode",c.id="voice-mode-whisper",u.appendChild(c),u.appendChild(document.createTextNode("Ship's mic (hands-free)")),c.checked=o.voice.whisperMode,d.checked=!o.voice.whisperMode,d.addEventListener("change",()=>{d.checked&&n.setWhisperMode(!1)}),c.addEventListener("change",()=>{c.checked&&n.setWhisperMode(!0)}),r.appendChild(l),r.appendChild(u),s.appendChild(r),s.appendChild(a("Crew Voice"));const f=document.createElement("div");f.className="hud-command-config-row";const h=document.createElement("label");h.className="hud-toggle-label";const y=document.createElement("input");y.id="tts-enabled",y.type="checkbox",y.checked=!0,h.appendChild(y),h.appendChild(document.createTextNode("Speak crew replies")),f.appendChild(h);const b=document.createElement("select");b.id="tts-voice-select",b.className="hud-settings-select hud-command-config-voice-select";for(const m of di){const v=document.createElement("option");v.value=m,v.textContent=m,m===o.voice.ttsVoice&&(v.selected=!0),b.appendChild(v)}b.addEventListener("change",()=>n.setTtsVoice(b.value)),f.appendChild(b),s.appendChild(f);const A=document.createElement("div");A.className="hud-command-config-row";const T=document.createElement("span");T.className="hud-command-config-volume-label",T.textContent="Volume",A.appendChild(T);const w=document.createElement("input");w.id="tts-volume",w.type="range",w.min="0",w.max="1",w.step="0.05",w.value=String(o.voice.ttsVolume),w.className="hud-settings-range",w.addEventListener("input",()=>n.setTtsVolume(Number(w.value))),A.appendChild(w),s.appendChild(A),s.appendChild(a("OpenAI Key"));const M=document.createElement("div");M.id="key-masked",M.className="hud-key-masked";function _(){const m=De();M.textContent=m!==null&&m.length>0?xi(m):"(no key stored)"}_(),s.appendChild(M);const E=document.createElement("div");E.className="hud-command-config-row";const C=document.createElement("input");C.id="key-input",C.type="password",C.placeholder="sk-...",C.autocomplete="off",C.className="hud-settings-text",E.appendChild(C);const R=document.createElement("button");R.id="key-save",R.type="button",R.textContent="Save",R.className="hud-btn",R.addEventListener("click",()=>{const m=C.value.trim();m.length!==0&&(Vt(m),C.value="",_())}),E.appendChild(R);const L=document.createElement("button");L.id="key-clear",L.type="button",L.textContent="Clear",L.className="hud-btn",L.addEventListener("click",()=>{ci(),_(),k(!1),Wt().then(()=>{_(),i()})}),E.appendChild(L),s.appendChild(E),s.appendChild(a("Actions"));const W=document.createElement("button");W.id="demo",W.type="button",W.textContent="Run Demo",W.className="hud-btn hud-btn-demo hud-command-config-demo",s.appendChild(W);let g=!1;function k(m){g=m,s.classList.toggle("open",g),t.classList.toggle("active",g),g?_():i()}return t.addEventListener("click",()=>k(!g)),document.addEventListener("mousedown",m=>{if(!g)return;const v=m.target;s.contains(v)||t.contains(v)||k(!1)}),document.addEventListener("keydown",m=>{m.key==="Escape"&&g&&k(!1)}),{setWhisperModeChecked:m=>{c.checked=m,d.checked=!m}}}function Mi(){if(document.getElementById("hud-styles"))return;const e=document.createElement("style");e.id="hud-styles",e.textContent=`
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
`,document.head.appendChild(e)}const ct=.05,Yt=ct*1e3,Ei=35,ki=40,dt=50,Xt=15,Ti=8;function ut(e,t,n){const i=t-e;return Math.abs(i)<=n?t:e+Math.sign(i)*n}class _i{state;behavior="APPROACH";tackSide=null;tackHoldS=0;behaviorOverride=null;rudderTargetRad=0;mainTrimTarget;jibTrimTarget;accMs=0;engageRangeM;rudderMaxRad;rudderRateRadPerS;trimRatePerS;headingKp;headingKd;phys;constructor(t){this.state=Ct({heading:t.heading??0,speedKts:t.speedKts??2,windDirection:t.windDirection??0,windSpeedKts:t.windSpeedKts??12,mainTrim:t.mainTrim??.5,jibTrim:t.jibTrim??.5}),t.x!==void 0&&(this.state.x=t.x),t.y!==void 0&&(this.state.y=t.y),this.mainTrimTarget=this.state.mainTrim,this.jibTrimTarget=this.state.jibTrim,this.engageRangeM=t.engageRangeM,this.rudderMaxRad=t.rudderMaxDeg*B,this.rudderRateRadPerS=t.rudderSlewDegPerS*B,this.trimRatePerS=t.trimSlewPerS,this.headingKp=t.headingKp??1.4,this.headingKd=t.headingKd??.6,this.phys=t.phys}setWind(t,n){this.state.windFromRad=j(t*B),this.state.windSpeedMs=n/1.94384}get x(){return this.state.x}get y(){return this.state.y}setBehaviorOverride(t){this.behaviorOverride=t}planHeading(t){if(this.behaviorOverride==="STRUCK")return this.behavior="STRUCK",this.state.psi;if(this.behaviorOverride==="FLEE")return this.behavior="FLEE",j(this.state.windFromRad+Math.PI);const n=t.x-this.state.x,i=t.y-this.state.y,o=Math.hypot(n,i),s=j(Math.atan2(n,i));o>this.engageRangeM*1.15?this.behavior="APPROACH":o<this.engageRangeM*.85&&(this.behavior="ENGAGE");let a;if(this.behavior==="APPROACH")a=s;else{const d=(o>this.engageRangeM?1:-1)*15*B;a=j(t.headingRad+d)}const r=he(this.state.windFromRad-a)*ie;if(this.tackSide!==null){this.tackHoldS-=ct;const l=Math.abs(r)>=ki;if(this.tackHoldS<=0){if(l)this.tackSide=null;else if(Math.abs(r)>=Ti){const d=r>=0?1:-1;d!==this.tackSide&&(this.tackSide=d,this.tackHoldS=Xt)}}}else if(Math.abs(r)<Ei){const l=j(this.state.windFromRad-dt*B),d=j(this.state.windFromRad+dt*B),u=Math.abs(he(l-this.state.psi)),c=Math.abs(he(d-this.state.psi));this.tackSide=u<=c?1:-1,this.tackHoldS=Xt}return this.tackSide!==null?j(this.state.windFromRad-this.tackSide*dt*B):a}step(t,n){const i=this.planHeading(n),o=he(i-this.state.psi);this.rudderTargetRad=le(this.headingKp*o-this.headingKd*this.state.r,-this.rudderMaxRad,this.rudderMaxRad);const{awaDeg:s}=at(this.state),a=At(Math.abs(s));this.mainTrimTarget=a,this.jibTrimTarget=a,this.state.rudder=ut(this.state.rudder,this.rudderTargetRad,this.rudderRateRadPerS*t),this.state.mainTrim=ut(this.state.mainTrim,this.mainTrimTarget,this.trimRatePerS*t),this.state.jibTrim=ut(this.state.jibTrim,this.jibTrimTarget,this.trimRatePerS*t),Ht(this.state,t,this.phys,this.rudderMaxRad)}tick(t,n){if(t>0)for(this.accMs+=t;this.accMs>=Yt;)this.step(ct,n),this.accMs-=Yt}headingDeg(){return this.state.psi*ie%360}}const Ci=30;function qt(){return{reloadRemainingS:0}}function Jt(e,t){return .65-.5*Math.max(0,Math.min(1,e/t))}function Zt(e,t){e.reloadRemainingS=Math.max(0,e.reloadRemainingS-t)}function Qt(e,t,n,i){return{inRange:t<=i.cannonRangeM,inArc:n<=Ci,ready:e.reloadRemainingS<=0}}function Ri(e,t,n,i,o,s){Zt(e,t);const a=Qt(e,n,i,o);return!a.inRange||!a.inArc||!a.ready?{fired:!1,hit:!1}:(e.reloadRemainingS=o.reloadS,{fired:!0,hit:s()<Jt(n,o.cannonRangeM)})}function Di(e,t,n,i,o){const s=Qt(e,t,n,i);return!s.inRange||!s.inArc||!s.ready?{fired:!1,hit:!1,...s}:(e.reloadRemainingS=i.reloadS,{fired:!0,hit:o()<Jt(t,i.cannonRangeM),...s})}const en=10,Ai=5,Pi=.8,Ni=.5;function tn(){return{hullHp:en}}function nn(e){e.hullHp=Math.max(0,e.hullHp-1)}function Ii(e){return e.hullHp<=0?Ni:e.hullHp<=Ai?Pi:1}function an(e){let t=e>>>0;return function(){t=t+1831565813|0;let i=Math.imul(t^t>>>15,1|t);return i=i+Math.imul(i^i>>>7,61|i)^i,((i^i>>>14)>>>0)/4294967296}}const Li=35;function Oi(e){return Math.hypot(e.state.u,e.state.v)*1.94384}class Hi{npc;damage;cannon;rng;cfg;engageRangeM;everSpotted=!1;everClosing=!1;lastEvent=null;playerCannon;enemyDamage;playerRng;fleeing=!1;enemyStruck=!1;lastPlayerFireOutcome=null;lastPlayerPose;constructor(t,n,i,o){this.cfg=t,this.rng=an(t.seed),this.playerRng=an(t.seed+1),this.lastPlayerPose=o;const s=le(t.aggression,0,1);this.engageRangeM=t.cannonRangeM*(.9-.4*s);const a=1.2+.6*s,r=this.rng()*2*Math.PI,l=o.x+t.spawnRangeM*Math.sin(r),d=o.y+t.spawnRangeM*Math.cos(r),u=j(r+Math.PI);this.npc=new _i({x:l,y:d,heading:u*ie,windDirection:o.windDirectionDeg,windSpeedKts:o.windSpeedKts,engageRangeM:this.engageRangeM,rudderMaxDeg:i.rudderMaxDeg||Li,rudderSlewDegPerS:i.rudderSlewDegPerS,trimSlewPerS:i.trimSlewPerS,headingKp:a,phys:n}),this.damage=tn(),this.cannon=qt(),this.playerCannon=qt(),this.enemyDamage=tn()}tick(t,n){const i=[];if(!this.cfg.enabled)return i;this.lastPlayerPose=n,Zt(this.playerCannon,t/1e3),this.npc.setWind(n.windDirectionDeg,n.windSpeedKts),this.npc.tick(t,{x:n.x,y:n.y,headingRad:n.headingRad});const o=n.x-this.npc.x,s=n.y-this.npc.y,a=Math.hypot(o,s);if(!this.everSpotted&&a<=this.cfg.spawnRangeM){this.everSpotted=!0;const r=j(Math.atan2(-o,-s)),d=he(r-n.headingRad)>=0?"starboard":"port";i.push({key:"sail_ho",side:d})}if(!this.everClosing&&a<=this.engageRangeM*2&&(this.everClosing=!0,i.push({key:"enemy_closing"})),!this.enemyStruck){const r=j(Math.atan2(o,s)),l=he(r-this.npc.state.psi)*ie,d=Math.min(Math.abs(l-90),Math.abs(l+90)),u=Ri(this.cannon,t/1e3,a,d,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.reloadS},this.rng);u.fired&&(i.push({key:"enemy_fires"}),u.hit&&(nn(this.damage),i.push({key:"hit_taken",hullHp:this.damage.hullHp})))}if(i.length>0){const r=i[i.length-1];r&&(this.lastEvent=r.key)}return i}fireGuns(){const t=this.resolveFireGuns();return this.lastPlayerFireOutcome=t,t}resolveFireGuns(){if(!this.cfg.enabled)return{kind:"no_target"};if(this.enemyStruck)return{kind:"no_target"};const t=this.lastPlayerPose,n=t.x-this.npc.x,i=t.y-this.npc.y,o=Math.hypot(n,i),s=j(Math.atan2(-n,-i)),a=he(s-t.headingRad)*ie,r=Math.min(Math.abs(a-90),Math.abs(a+90)),l=Di(this.playerCannon,o,r,{cannonRangeM:this.cfg.cannonRangeM,reloadS:this.cfg.playerReloadS},this.playerRng);return l.fired?l.hit?(nn(this.enemyDamage),this.enemyDamage.hullHp<=0?(this.enemyStruck=!0,this.npc.setBehaviorOverride("STRUCK"),{kind:"hit",enemyHullHp:0,enemyStruck:!0}):(this.enemyDamage.hullHp<=en/2&&!this.fleeing&&(this.fleeing=!0,this.npc.setBehaviorOverride("FLEE")),{kind:"hit",enemyHullHp:this.enemyDamage.hullHp,enemyStruck:!1})):{kind:"miss"}:!l.inRange||!l.inArc?{kind:"dont_bear"}:{kind:"reloading"}}getLastPlayerFireOutcome(){return this.lastPlayerFireOutcome}getSpeedMultiplier(){return Ii(this.damage)}getHullHp(){return this.damage.hullHp}getEnemyHullHp(){return this.enemyDamage.hullHp}isEnemyStruck(){return this.enemyStruck}getView(){return{npc:{x:this.npc.x,y:this.npc.y,heading:this.npc.headingDeg(),speedKts:Oi(this.npc),behavior:this.npc.behavior},playerHullHp:this.damage.hullHp,lastEvent:this.lastEvent,enemyHullHp:this.enemyDamage.hullHp,enemyStruck:this.enemyStruck}}}const Fe={network:"OpenAI seems unreachable (their status page may say why) — your order was kept, try again shortly.",unauthorized:"key rejected — check it in ⚙",rateLimited:"rate limited — a moment, sir",serverError:"OpenAI is having trouble"};function zi(e){return e===401||e===403?"unauthorized":e===429?"rateLimited":e>=500?"serverError":null}function Ve(e){if(!(e instanceof TypeError))return!1;const t=e.message.toLowerCase();return t.includes("failed to fetch")||t.includes("networkerror")||t.includes("load failed")}const Fi=1500;async function Ge(e){try{return await e()}catch(t){if(!Ve(t))throw t;return await new Promise(n=>setTimeout(n,Fi)),e()}}function Ye(e,t,n){const i=zi(t);return i?Fe[i]:`${e} (${t}): ${n}`}const Vi="https://api.openai.com/v1/audio/speech",Wi="A gruff but respectful Royal Navy lieutenant, early 19th century, acknowledging his captain's orders.";let me=null,Xe=null;function Bi(){const e=document.getElementById("tts-enabled");return e instanceof HTMLInputElement?e.checked:!0}function ji(e){return me!==null?!0:Xe===null?!1:performance.now()-Xe<e}function ht(){me!==null&&(me.pause(),me.src="",me=null,Xe=performance.now())}async function pt(e,t,n=J.voice.ttsModel,i=J.voice.ttsVoice,o=J.voice.ttsVolume){if(e.trim().length===0||!Bi())return;ht();let s;try{s=await Ge(()=>fetch(Vi,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${t}`},body:JSON.stringify({model:n,voice:i,input:e,response_format:"mp3",instructions:Wi})}))}catch(c){throw Ve(c)?new Error(Fe.network):c}if(!s.ok){const c=await s.text();throw new Error(Ye("tts request failed",s.status,c))}const a=await s.arrayBuffer(),r=new Blob([a],{type:"audio/mpeg"}),l=URL.createObjectURL(r),d=new Audio(l);d.volume=Math.max(0,Math.min(1,o)),me=d;const u=()=>{URL.revokeObjectURL(l),me===d&&(me=null,Xe=performance.now())};d.addEventListener("ended",u,{once:!0}),d.addEventListener("error",u,{once:!0}),await d.play()}const on="audio/webm;codecs=opus";function Ki(e,t){let n=null,i=null,o=[],s=!1;function a(h){if(!(h instanceof HTMLElement))return!1;const y=h.tagName;return y==="INPUT"||y==="SELECT"||y==="TEXTAREA"||h.isContentEditable}async function r(){if(!s&&!(t.canStart&&!t.canStart())){s=!0,ht(),t.onRecordingChange(!0);try{n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}}),o=[],i=new MediaRecorder(n,{mimeType:on}),i.addEventListener("dataavailable",h=>{h.data.size>0&&o.push(h.data)}),i.start()}catch(h){s=!1,t.onRecordingChange(!1);const y=h instanceof Error?h:new Error(String(h));t.onError?.(y)}}}function l(){if(!s)return;s=!1,t.onRecordingChange(!1);const h=i,y=n;!h||h.state==="inactive"||(h.addEventListener("stop",()=>{const b=new Blob(o,{type:on});o=[],y?.getTracks().forEach(A=>A.stop()),t.onBlob(b)},{once:!0}),h.stop(),i=null,n=null)}function d(h){h.code==="Space"&&(a(h.target)||h.repeat||(h.preventDefault(),r()))}function u(h){h.code==="Space"&&(a(h.target)||l())}function c(h){h.preventDefault(),r()}function f(){l()}return window.addEventListener("keydown",d),window.addEventListener("keyup",u),e.addEventListener("mousedown",c),e.addEventListener("mouseup",f),e.addEventListener("mouseleave",f),e.addEventListener("touchstart",c,{passive:!1}),e.addEventListener("touchend",f),{destroy(){window.removeEventListener("keydown",d),window.removeEventListener("keyup",u),e.removeEventListener("mousedown",c),e.removeEventListener("mouseup",f),e.removeEventListener("mouseleave",f),e.removeEventListener("touchstart",c),e.removeEventListener("touchend",f)}}}const sn="audio/webm;codecs=opus",$i=512,Ui=250,Gi=300,Yi=2e3,rn={calibrationMs:1e3,noiseFloorFactor:3.5,minSpeechMs:150,hangoverMs:700,minUtteranceMs:400,maxSegmentMs:1e4};function Xi(){return{phase:"calibrating",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:0,calibMs:0,calibSum:0,calibSamples:0}}function qi(e,t,n,i=rn){if(e.phase==="calibrating"){const l=e.calibMs+n,d=e.calibSum+t,u=e.calibSamples+1;return l>=i.calibrationMs?{state:{phase:"idle",phaseMs:0,segmentMs:0,speechMs:0,noiseFloor:u>0?d/u:0,calibMs:l,calibSum:d,calibSamples:u},event:null}:{state:{...e,calibMs:l,calibSum:d,calibSamples:u},event:null}}const o=e.noiseFloor*i.noiseFloorFactor,s=t>=o;if(e.phase==="idle"){if(!s)return e.phaseMs===0?{state:e,event:null}:{state:{...e,phaseMs:0},event:null};const l=e.phaseMs+n;return l>=i.minSpeechMs?{state:{...e,phase:"speaking",phaseMs:0,segmentMs:l,speechMs:l},event:{type:"segment-start"}}:{state:{...e,phaseMs:l},event:null}}const a=e.segmentMs+n;if(a>=i.maxSegmentMs)return{state:{...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},event:{type:"segment-end"}};if(s){const l=e.speechMs+n;return{state:{...e,phase:"speaking",phaseMs:0,segmentMs:a,speechMs:l},event:null}}const r=e.phaseMs+n;if(r>=i.hangoverMs){const l={...e,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0};return e.speechMs<i.minUtteranceMs?{state:l,event:{type:"segment-dropped"}}:{state:l,event:{type:"segment-end"}}}return{state:{...e,phaseMs:r,segmentMs:a},event:null}}function Ji(e){let t=0;for(let n=0;n<e.length;n++){const i=e[n]??0;t+=i*i}return Math.sqrt(t/e.length)}async function Zi(e,t=rn){ht();const n=await navigator.mediaDevices.getUserMedia({audio:{echoCancellation:!0,noiseSuppression:!0}});let i=!0,o=null,s=null;try{let a=function(){if(b!==null||h.length<=1)return;const T=performance.now()-Yi,w=h[0];if(w===void 0)return;const M=h.slice(1).filter(_=>_.tsMs>=T);h=[w,...M]},r=function(T){const w=b??T;b=null;const M=h.filter(R=>R.tsMs>=w&&R.tsMs<=T);if(M.length===0)return;const _=h[0],C=_!==void 0&&M[0]!==_?[_.blob,...M.map(R=>R.blob)]:M.map(R=>R.blob);e.onBlob(new Blob(C,{type:sn}))},l=function(){if(!i)return;const T=performance.now(),w=T-A;if(A=T,e.isSuppressed()){b!==null&&(b=null,y={...y,phase:"idle",phaseMs:0,segmentMs:0,speechMs:0},e.onSegmentChange(!1)),a(),requestAnimationFrame(l);return}c.getFloatTimeDomainData(f);const M=Ji(f),{state:_,event:E}=qi(y,M,w,t);y=_,E?.type==="segment-start"?(b=T-t.minSpeechMs-Gi,e.onSegmentChange(!0)):E?.type==="segment-end"?(r(T),e.onSegmentChange(!1)):E?.type==="segment-dropped"&&(b=null,e.onSegmentChange(!1)),a(),requestAnimationFrame(l)};const d=window.AudioContext??window.webkitAudioContext;o=new d;const u=o.createMediaStreamSource(n),c=o.createAnalyser();c.fftSize=$i,u.connect(c);const f=new Float32Array(c.fftSize);s=new MediaRecorder(n,{mimeType:sn});let h=[];s.addEventListener("dataavailable",T=>{T.data.size>0&&h.push({blob:T.data,tsMs:performance.now()})}),s.addEventListener("error",T=>{const w=T.error;e.onError?.(w instanceof Error?w:new Error("whisper mode: MediaRecorder error"))}),s.start(Ui);let y=Xi(),b=null,A=performance.now();requestAnimationFrame(l)}catch(a){throw i=!1,n.getTracks().forEach(r=>r.stop()),o?.close(),a instanceof Error?a:new Error(String(a))}return{stop(){i=!1,e.onSegmentChange(!1);const a=s;a&&a.state!=="inactive"&&a.stop(),n.getTracks().forEach(r=>r.stop()),o?.close()}}}const Qi="https://api.openai.com/v1/audio/transcriptions";async function ln(e,t,n){const i=new FormData;i.append("file",e,"order.webm"),i.append("model",n);const o=await fetch(Qi,{method:"POST",headers:{Authorization:`Bearer ${t}`},body:i});if(!o.ok){const r=await o.text();return{ok:!1,text:"",status:o.status,errorBody:r}}const s=await o.json();return{ok:!0,text:typeof s=="object"&&s!==null&&"text"in s&&typeof s.text=="string"?s.text:"",status:o.status,errorBody:""}}function ea(e,t){return e.includes(t)}async function ta(e,t,n=J.voice.sttModel,i=J.voice.sttFallbackModel){let o;try{o=await Ge(()=>ln(e,t,n))}catch(a){throw Ve(a)?new Error(Fe.network):a}if(o.ok)return o.text;if(o.status>=400&&o.status<500&&ea(o.errorBody,n)){let a;try{a=await Ge(()=>ln(e,t,i))}catch(r){throw Ve(r)?new Error(Fe.network):r}if(a.ok)return a.text;throw new Error(Ye(`stt failed: ${n} then ${i}`,a.status,a.errorBody))}throw new Error(Ye(`stt failed: ${n}`,o.status,o.errorBody))}const na=[{type:"function",function:{name:"helm",description:"Set the rudder to an absolute angle. Negative = port (turn left), positive = starboard (turn right). 0 = amidships (straighten up).",parameters:{type:"object",properties:{degrees:{type:"number",minimum:-35,maximum:35}},required:["degrees"]}}},{type:"function",function:{name:"trim_sail",description:"Set a sail's trim as an absolute value. 0 = fully eased/let out, 1 = hauled fully in. Use the current state to compute the new absolute value for relative orders like 'ease' (reduce) or 'harden/haul in' (increase), moving by about 0.15 unless the order says otherwise.",parameters:{type:"object",properties:{sail:{type:"string",enum:["main","jib","all"]},trim:{type:"number",minimum:0,maximum:1}},required:["sail","trim"]}}},{type:"function",function:{name:"report_status",description:"Report heading, speed and wind to the captain.",parameters:{type:"object",properties:{}}}},{type:"function",function:{name:"fire_guns",description:"Fire a broadside at the enemy when she bears.",parameters:{type:"object",properties:{}}}}],ia=`You are the first lieutenant aboard a Royal Navy sloop, circa 1805. The captain speaks orders aloud and you translate each order into exactly one tool call. You are given the current ship state as JSON; use it. Map casual modern AND period nautical speech generously (easy mode).

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

GUNNERY: any order to shoot — "fire!", "open fire", "fire away", "let them have it" — means call fire_guns immediately; the gun captain judges whether she bears, never you. But "hold your fire" or "belay" countermands (no call), and a mere mention of a fire (a galley fire, a signal fire) is not a gunnery order.`;function aa(e,t){if(typeof t!="object"||t===null)return null;const n=t;switch(e){case"helm":{const i=n.degrees;return typeof i!="number"||!Number.isFinite(i)||i<-35||i>35?null:{action:"helm",degrees:i}}case"trim_sail":{const i=n.sail,o=n.trim;return i!=="main"&&i!=="jib"&&i!=="all"||typeof o!="number"||!Number.isFinite(o)||o<0||o>1?null:{action:"trim_sail",sail:i,trim:o}}case"report_status":return{action:"report_status"};case"fire_guns":return{action:"fire_guns"};default:return null}}const oa="https://api.openai.com/v1/chat/completions";function sa(e){if(typeof e!="object"||e===null)return null;const t=e.choices;if(!Array.isArray(t)||t.length===0)return null;const n=t[0];if(typeof n!="object"||n===null)return null;const i=n.message;if(typeof i!="object"||i===null)return null;const o=i,s=typeof o.content=="string"?o.content:null,a=[],r=o.tool_calls;if(Array.isArray(r))for(const l of r){if(typeof l!="object"||l===null)continue;const d=l.function;if(typeof d!="object"||d===null)continue;const u=d,c=u.name,f=u.arguments;typeof c!="string"||typeof f!="string"||a.push({name:c,argumentsJson:f})}return{content:s,toolCalls:a}}function ra(e){try{return JSON.parse(e)}catch{return null}}async function la(e,t,n,i=J.voice.intentModel){const o=t.getState(),s=`${ia}

Current ship state:
${JSON.stringify(o)}`;let a;try{a=await Ge(()=>fetch(oa,{method:"POST",headers:{"Content-Type":"application/json",Authorization:`Bearer ${n}`},body:JSON.stringify({model:i,temperature:0,tool_choice:"auto",tools:na,messages:[{role:"system",content:s},{role:"user",content:e}]})}))}catch(h){throw Ve(h)?new Error(Fe.network):h}if(!a.ok){const h=await a.text();throw new Error(Ye("intent request failed",a.status,h))}const r=await a.json(),l=sa(r);if(l===null)throw new Error("intent request returned an unrecognizable response body");const d=l.toolCalls[0];if(d===void 0)return{crewLine:l.content??"",intent:null};const u=ra(d.argumentsJson),c=aa(d.name,u);return c===null?{crewLine:F("unknown_order",o),intent:null}:{crewLine:(await t.submit(c)).message,intent:c}}const cn=9.81,dn=370,ca=.84,da=10/12,mt=12,un=.45,ua=2.2,hn=.6,ha=50,pn=2,pa=16,mn=.2,ma=.9,ga=137.51,fa=251.33;function gt(e){return Math.min(1,Math.max(0,e))}function ya(e){return Math.max(e*da,.1)}function ba(e){const t=ya(e),n=cn*(ca/t)**2;return 2*Math.PI/n}function wa(e){const t=gt(e/40),n=Math.sqrt(t);return mn+n*(ma-mn)}function va(e){const t=gt(e/40);return pn+t*(pa-pn)}function xa(e){const t=e*Math.PI/180;return{x:Math.sin(t),z:-Math.cos(t)}}function Sa(e){const{windDirectionDeg:t,windSpeedKts:n}=e,i=ba(n),o=va(n),s=wa(n),a=1+gt(s)*3,r=t+180,l=[],d=[],u=[];let c=0;for(let y=0;y<mt;y++){const b=y/(mt-1),A=un*(ua/un)**b;l.push(A);const T=ha*(2*b-1);d.push(T);const w=Math.log(A),M=Math.exp(-(w*w)/(2*hn*hn)),_=T*Math.PI/180,E=Math.max(0,Math.cos(_))**(2*a),C=M*E;u.push(C),C>c&&(c=C)}const f=[],h=c>0?c:1;for(let y=0;y<mt;y++){const b=i*l[y],A=2*Math.PI/b,T=Math.sqrt(cn*A*(1+A*A/(dn*dn))),w=xa(r+d[y]),M=o*(u[y]/h),_=y*ga,E=y*fa,C=-A*(w.x*_+w.z*E);f.push({amplitude:M,wavenumber:A,omega:T,dirX:w.x,dirZ:w.z,phase0:C})}return f}function Ma(e,t,n,i){let o=0;for(const s of e){const a=s.wavenumber*(s.dirX*t+s.dirZ*n)-s.omega*i+s.phase0;o+=s.amplitude*Math.cos(a)}return o}const Ea=458.7,ka=170;function Ta(e){return{length:Ea*e,beam:ka*e}}function _a(e){const t=e.length/2,n=e.beam/2,i=[-t,-t/3,t/3,t],o=[];for(const s of i)o.push({x:-n,z:s}),o.push({x:n,z:s});return o}function Ca(e,t,n){const i=Math.cos(n),o=Math.sin(n);return{x:e*i+t*o,z:-e*o+t*i}}function Ra(e,t){if(e.length!==t.length||e.length===0)return{heave:0,pitchRad:0,rollRad:0};let n=0,i=0,o=0,s=0,a=0,r=0,l=0,d=0;const u=e.length;for(let w=0;w<u;w++){const{x:M,z:_}=e[w],E=t[w];n+=M*M,i+=M*_,o+=M,s+=_*_,a+=_,r+=M*E,l+=_*E,d+=E}const c=n*(s*u-a*a)-i*(i*u-a*o)+o*(i*a-s*o);if(Math.abs(c)<1e-9)return{heave:d/u,pitchRad:0,rollRad:0};const f=r*(s*u-a*a)-i*(l*u-a*d)+o*(l*a-s*d),h=n*(l*u-d*a)-r*(i*u-a*o)+o*(i*d-l*o),y=n*(s*d-a*l)-i*(i*d-a*r)+r*(i*a-s*o),b=f/c,A=h/c;return{heave:y/c,pitchRad:Math.atan(-A),rollRad:Math.atan(b)}}function Da(e,t,n,i,o,s){const a=-i*(Math.PI/180),r=Ta(o),l=_a(r),d=l.map(u=>{const c=Ca(u.x,u.z,a);return Ma(e,t+c.x,n+c.z,s)});return Ra(l,d)}function ft(e,t,n,i,o){if(o<=0||n<=0)return e;const s=e.position-t,a=e.velocity,r=1e-4;let l,d;if(Math.abs(i-1)<r){const u=Math.exp(-n*o),c=a+n*s;l=(s+c*o)*u,d=u*(a-n*o*c)}else if(i>1){const u=n*Math.sqrt(i*i-1),c=-n*i+u,f=-n*i-u,h=(a-f*s)/(c-f),y=s-h,b=Math.exp(c*o),A=Math.exp(f*o);l=h*b+y*A,d=h*c*b+y*f*A}else{const u=-n*i,c=n*Math.sqrt(1-i*i),f=Math.exp(u*o),h=Math.cos(c*o),y=Math.sin(c*o),b=(a-u*s)/c;l=f*(s*h+b*y),d=u*l+f*c*(-s*y+b*h)}return{position:t+l,velocity:d}}function gn(){let e={position:0,velocity:0},t={position:0,velocity:0},n={position:0,velocity:0};function i(o,s,a,r,l,d,u,c){const f=Da(u,a,r,l,d,s),h=f.heave*c.heaveScale,y=f.pitchRad*c.pitchScale,b=f.rollRad*c.rollScale;return o>0?(e=ft(e,h,c.stiffness,c.damping,o),t=ft(t,y,c.stiffness,c.damping,o),n=ft(n,b,c.stiffness,c.damping,o)):(e={position:h,velocity:0},t={position:y,velocity:0},n={position:b,velocity:0}),{heave:e.position,pitchRad:t.position,rollRad:n.position}}return{update:i}}const Aa=.514444,ge=Math.PI/180,Pa=1,Na=512,Ia=4;function qe(e){return-e*ge}function La(e){const t=e*ge;return{x:Math.sin(t),z:-Math.cos(t)}}function Ae(e,t){return{x:e.x*t,z:-e.y*t}}const yt=900,fn=18,Oa=95,Ha=260;function za(e,t,n,i,o){const s=yt*(.7+Math.random()*.3),a=(Math.random()-.5)*2*Ha;e.position.x=t+i.x*s+o.x*a,e.position.z=n+i.z*s+o.z*a,e.position.y=fn+Math.random()*(Oa-fn)}function Fa(e,t,n,i,o,s,a){if(e.length===0)return;const r=i+180,l=La(r),d={x:-l.x,z:-l.z},u={x:-l.z,z:l.x},c=o*Aa*s,f=qe(r);for(const h of e){h.position.x+=l.x*c*a,h.position.z+=l.z*c*a,h.rotation.y=f;const y=h.position.x-t,b=h.position.z-n;y*y+b*b>yt*yt&&za(h,t,n,d,u)}}const Va=1.4,Wa=6,Ba=2;function ja(e,t,n,i,o=J.visuals,s={}){const{camera:a=null,getStreamerNode:r,windStreaks:l=[],getEnemyShipNode:d,muzzleFlash:u=null,splash:c=null}=s;let f=null,h=0,y=0,b=0;const A=gn(),T=gn();let w=null,M=[];function _(P,N){const O=`${P}:${N}`;return O!==w&&(M=Sa({windDirectionDeg:P,windSpeedKts:N}),w=O),M}const E=220;let C=null,R=null,L="follow";const W=a!==null?a.fov:null;function g(P){L=P,typeof window<"u"&&(window.__captainViewMode=P),a!==null&&P==="follow"&&W!==null&&(a.fov=W,a.updateProjectionMatrix())}function k(P,N,O){const{worldUnitsPerMetre:K,maxHeelDeg:ye,maxBraceDeg:G,heelSmoothingHz:_e,boatScale:se}=o,q=f===null?0:Math.min((P-f)/1e3,.5);f=P;const $=e.getState(),Qe=qe(N.headingDeg);t.rotation.y=Qe,t.scale.x=se,t.scale.y=se,t.scale.z=se;const{x:Ke,z:be}=Ae(N,K);t.position.x=Ke,t.position.z=be;const{buoyancy:z}=o,Ce=_($.windDirection,$.windSpeedKts),we=P/1e3,ce=A.update(q,we,Ke,be,N.headingDeg,se,Ce,z);if(t.position.y=z.enabled?ce.heave:0,n!==null){const H=ye*Math.tanh($.apparentWindKts**2*(($.mainTrim+$.jibTrim)/2)*Math.abs(Math.sin($.apparentWindAngle*ge))/Na),Y=Math.sign($.apparentWindAngle)*H*ge,Q=q>0?1-Math.exp(-q*_e):0,xe=h+(Y-h)*Q,Le=Ia*ge*q,et=Math.max(-Le,Math.min(Le,xe-h));h+=et;const Et=z.enabled?ce.rollRad:0;n.rotation.z=h+Et,n.rotation.x=z.enabled?ce.pitchRad:0}const ve=i?i():null;if(ve!==null){const H=($.mainTrim+$.jibTrim)/2,Y=Math.sign($.apparentWindAngle)*H*G*ge,Q=q>0?1-Math.exp(-q*Pa):0;y+=(Y-y)*Q,ve.rotation.y=y}Fa(l,Ke,be,$.windDirection,$.windSpeedKts,K,q);const Ie=r?r():null;if(Ie!==null){const H=qe($.apparentWindAngle+180),Y=q>0?1-Math.exp(-q*Ba):0;let Q=H-b;Q=(Q+Math.PI)%(2*Math.PI)-Math.PI,b+=Q*Y;const xe=Wa*ge*Math.sin(P/1e3*2*Math.PI*Va);Ie.rotation.y=b+xe}if(a!==null&&L==="helm"){const{helmView:H}=o;a.position.x=H.x,a.position.y=H.y,a.position.z=H.z,a.rotation.x=H.pitchDeg*ge,a.rotation.y=0,a.rotation.z=0,a.fov!==H.fov&&(a.fov=H.fov,a.updateProjectionMatrix())}const U=d?d():null;if(U!==null)if(O!==null){const H=Ae(O,K);U.position.x=H.x,U.position.z=H.z,U.rotation.y=qe(O.headingDeg),U.scale.x=se,U.scale.y=se,U.scale.z=se,U.visible=!0;const Y=T.update(q,we,H.x,H.z,O.headingDeg,se,Ce,z);U.position.y=z.enabled?Y.heave:0,U.rotation.x=z.enabled?Y.pitchRad:0,U.rotation.z=z.enabled?Y.rollRad:0}else U.visible=!1;C!==null&&P>=C&&(u!==null&&(u.visible=!1),C=null),R!==null&&P>=R&&(c!==null&&(c.visible=!1),R=null)}function m(){g(L==="follow"?"helm":"follow")}function v(P,N,O){u!==null&&(u.position.x=N,u.position.y=90,u.position.z=O,u.visible=!0,C=P+E)}function D(P,N,O){c!==null&&(c.position.x=N,c.position.y=8,c.position.z=O,c.visible=!0,R=P+E)}return{update:k,toggleView:m,getViewMode:()=>L,triggerMuzzleFlash:v,triggerSplash:D}}const Ka=500;window.__captainDriverActive=!0;const S=Ue();window.__captainAmbientRock=S.visuals.ambientRock;const ae=new ri({},S),yn={current:null},oe=jn(ae,()=>yn.current),X=S.battle.enabled?new Hi(S.battle,S.physics,S.controls,{...ae.getPose(),windDirectionDeg:oe.getState().windDirection,windSpeedKts:oe.getState().windSpeedKts}):null;yn.current=X;const bt=document.createElement("div");bt.id="hud-root",document.body.appendChild(bt);function bn(e){hi(e)}function wn(e){Bt(e)}function Pe(e){rt(e)}async function wt(e){const t=De();if(t===null||t.length===0)throw new Error("no OpenAI API key set — reload and enter one in the BYOK modal");bn(e);const n=await la(e,oe,t,S.voice.intentModel);wn(n.intent),Pe(n.crewLine);try{await pt(n.crewLine,t,S.voice.ttsModel,S.voice.ttsVoice,S.voice.ttsVolume)}catch(i){const o=i instanceof Error?i.message:String(i);jt(`⚠ Crew voice unavailable: ${o}`)}}const $a=ui(bt,oe,{injectTranscript:wt,setWhisperMode:e=>{e?Sn():qa()},setTtsVoice:e=>{S.voice.ttsVoice=e},setTtsVolume:e=>{S.voice.ttsVolume=e},isPipelineBusy:()=>ke});async function Ua(e){const t=await oe.submit(e);if(pi(e,t.message),e.action==="fire_guns"&&X){const n=X.getLastPlayerFireOutcome();if(n&&(n.kind==="hit"||n.kind==="miss")){const i=performance.now(),o=ae.getPose(),s=X.getView().npc,a=Ae({x:o.x,y:o.y},S.visuals.worldUnitsPerMetre);fe.triggerMuzzleFlash(i,a.x,a.z);const r=Ae({x:s.x,y:s.y},S.visuals.worldUnitsPerMetre);fe.triggerSplash(i,r.x,r.z)}}return t}const Ne=document.getElementById("demo");let vt=!1;function Ga(e){return new Promise(t=>setTimeout(t,e))}const Ya=[{label:"report status",intent:{action:"report_status"},waitMs:1600},{label:"trim main & jib for close-hauled",intent:{action:"trim_sail",sail:"all",trim:.9},waitMs:3500},{label:"helm up — bring her hard on the wind",intent:{action:"helm",degrees:-12},waitMs:5e3},{label:"steady on the wind",intent:{action:"helm",degrees:0},waitMs:4e3},{label:"ready about — tack through the wind",intent:{action:"helm",degrees:-35},waitMs:2e4},{label:"helm amidships, settle on the new board",intent:{action:"helm",degrees:0},waitMs:5e3},{label:"report status",intent:{action:"report_status"},waitMs:1600}];async function vn(){if(!vt){vt=!0,Ne&&(Ne.disabled=!0);try{for(const e of Ya){bn(`[demo] ${e.label}`);const t=await oe.submit(e.intent);wn(e.intent),Pe(t.message);const n=De();n!==null&&n.length>0&&pt(t.message,n,S.voice.ttsModel,S.voice.ttsVoice,S.voice.ttsVolume).catch(()=>{}),await Ga(e.waitMs)}}finally{vt=!1,Ne&&(Ne.disabled=!1)}}}Ne&&Ne.addEventListener("click",()=>{vn()});const Ee=document.getElementById("ptt");let ke=!1;async function xn(e){const t=De();if(t===null||t.length===0){Pe("no OpenAI API key set — reload and enter one in the BYOK modal");return}try{const n=await ta(e,t,S.voice.sttModel,S.voice.sttFallbackModel);await wt(n)}catch(n){const i=n instanceof Error?n.message:String(n);Pe(i)}}let Te=!1,xt=null,We=!1;function Je(){Te?(Ee.textContent=We?"Listening… (capturing)":"Listening…",Ee.classList.toggle("recording",We),Ee.classList.toggle("listening",!We)):(Ee.textContent="Hold to Talk",Ee.classList.remove("recording","listening"))}async function Xa(e){ke=!0;try{await xn(e)}finally{ke=!1}}async function Sn(){if(!Te)try{xt=await Zi({onBlob:e=>{Xa(e)},onSegmentChange:e=>{We=e,Je()},onError:e=>{Pe(e.message)},isSuppressed:()=>ke||ji(Ka)}),Te=!0,lt(!0),Je()}catch(e){throw Te=!1,lt(!1),Je(),e instanceof Error?e:new Error(String(e))}}function qa(){Te&&(Te=!1,We=!1,xt?.stop(),xt=null,lt(!1),Je())}Ki(Ee,{onRecordingChange:e=>{Ee.classList.toggle("recording",e)},onBlob:e=>{ke=!0,xn(e).finally(()=>{ke=!1})},onError:e=>{Pe(e.message)},canStart:()=>!ke&&!Te}),Wt().then(()=>{mi(),S.voice.whisperMode&&Sn().catch(()=>{S.voice.whisperMode=!1,jt("Microphone unavailable — switched to push-to-talk. Enable Whisper again anytime in ⚙ command config.")})});const Z=window.DEMO;if(Z===void 0)throw new Error("captain-ocean: window.DEMO not found — this bundle must load after fft-ocean's own inline init script");const fe=ja(oe,Z.ms_GroupShip,Z.ms_BlackPearlShip,()=>window.DEMO?.ms_Sails??null,S.visuals,{camera:Z.ms_Camera,getStreamerNode:()=>window.DEMO?.ms_Streamer??null,windStreaks:Z.ms_WindStreaks,getEnemyShipNode:()=>window.DEMO?.ms_EnemyShip??null,muzzleFlash:Z.ms_MuzzleFlash,splash:Z.ms_Splash}),Mn=10/12,Ja=350,Za=1400,En=1.6,Qa=4.4,kn=.2,eo=.9;function to(e){const t=e*Mn,n=9.81,i=.84,o=Math.max(t,.1),s=n*(i/o)**2,a=2*Math.PI/s,r=Math.min(Za,Math.max(Ja,a*2)),l=Math.min(1,Math.max(0,e/40)),d=Math.sqrt(l),u=En+d*(Qa-En),c=kn+d*(eo-kn);return{size:r,choppiness:u,directionality:c}}function Tn(e){return 1+Math.min(1,Math.max(0,e))*3}function St(){ae.setWind(S.environment.windDirectionDeg,S.environment.windSpeedKts);const e=window.DEMO;if(e===void 0)return;const t=(S.environment.windDirectionDeg+180)*Math.PI/180,n=S.environment.windSpeedKts*Mn;if(e.ms_Ocean.windX=Math.sin(t)*n,e.ms_Ocean.windY=-Math.cos(t)*n,S.visuals.seaStateFollowsWind){const i=to(S.environment.windSpeedKts);e.ms_Ocean.size=i.size,e.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=i.choppiness,e.ms_Ocean.directionality=Tn(i.directionality)}e.ms_Ocean.changed=!0}function _n(){const e=window.DEMO?.ms_LightingParams;e!==void 0&&(Me(S,"visuals.lighting.sunElevationDeg",e.sunElevationDeg),Me(S,"visuals.lighting.sunAzimuthDeg",e.sunAzimuthDeg),Me(S,"visuals.lighting.sunIntensity",e.sunIntensity),Me(S,"visuals.lighting.ambientIntensity",e.ambientIntensity),Me(S,"visuals.lighting.exposure",e.exposure),Me(S,"visuals.lighting.fogDensity",e.fogDensity))}function no(){window.DEMO?.SetLightingParams(S.visuals.lighting)}!(window.location.hash.length>1)&&Z.ms_Environment!==S.environment.skyPreset&&Z.UpdateEnvironment(S.environment.skyPreset),_n(),St(),Z.ms_soundWaves&&(Z.ms_soundWaves.volume=S.visuals.ambientSoundVolume);function io(e){const n=/^#?([0-9a-fA-F]{6})$/.exec(e)?.[1];if(n===void 0)return null;const i=parseInt(n,16);return{r:(i>>16&255)/255,g:(i>>8&255)/255,b:(i&255)/255}}function ao(e){(window.DEMO?.ms_WindStreaks??[]).forEach((n,i)=>{n.visible=i<e})}function oo(e){const t=window.DEMO?.ms_WindStreaks?.[0];t!==void 0&&(t.material.opacity=e)}function so(e,t){switch(Me(S,e,t),e){case"visuals.ambientRock":window.__captainAmbientRock=t;break;case"visuals.oceanSize":window.DEMO&&(window.DEMO.ms_Ocean.size=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.oceanChoppiness":window.DEMO&&(window.DEMO.ms_Ocean.materialSpectrum.uniforms.u_choppiness.value=t);break;case"visuals.waveDirectionality":window.DEMO&&(window.DEMO.ms_Ocean.directionality=Tn(t),window.DEMO.ms_Ocean.changed=!0);break;case"visuals.seaStateFollowsWind":t&&St();break;case"visuals.waterColor":{const n=io(t);n&&window.DEMO&&(window.DEMO.ms_Ocean.oceanColor.x=n.r,window.DEMO.ms_Ocean.oceanColor.y=n.g,window.DEMO.ms_Ocean.oceanColor.z=n.b);break}case"visuals.sunExposure":window.DEMO&&(window.DEMO.ms_Ocean.exposure=t,window.DEMO.ms_Ocean.changed=!0);break;case"visuals.streakCount":ao(t);break;case"visuals.streakOpacity":oo(t);break;case"visuals.ambientSoundVolume":window.DEMO?.ms_soundWaves&&(window.DEMO.ms_soundWaves.volume=t);break;case"environment.windDirectionDeg":case"environment.windSpeedKts":St();break;case"environment.skyPreset":window.DEMO?.UpdateEnvironment(t),_n();break;case"visuals.lighting.sunElevationDeg":case"visuals.lighting.sunAzimuthDeg":case"visuals.lighting.sunIntensity":case"visuals.lighting.ambientIntensity":case"visuals.lighting.exposure":case"visuals.lighting.fogDensity":no();break}}gi(so);const Be=document.getElementById("view-toggle");function Cn(e){return e==="helm"?"Follow Cam":"Helm View"}function Rn(){fe.toggleView(),Be&&(Be.textContent=Cn(fe.getViewMode()))}Be&&(Be.textContent=Cn(fe.getViewMode()),Be.addEventListener("click",()=>{Rn()})),document.addEventListener("keydown",e=>{if(e.key!=="v"&&e.key!=="V")return;const t=document.activeElement;if(t instanceof HTMLElement){const n=t.tagName;if(n==="INPUT"||n==="SELECT"||n==="TEXTAREA"||t.isContentEditable)return}Rn()});const je=document.createElement("div");je.id="battle-hit-flash",je.style.cssText="position:fixed;inset:0;background:#c81414;opacity:0;pointer-events:none;z-index:9999;transition:opacity 120ms ease-out;",document.body.appendChild(je);let Ze=null;const ro=180;function lo(){Ze!==null&&clearTimeout(Ze),je.style.opacity="0.35",Ze=setTimeout(()=>{je.style.opacity="0",Ze=null},ro)}const Dn=15;let Mt=null;function An(e){if(Mt!==null){const s=e-Mt;if(ae.tick(s),X){const a=ae.getPose(),r=oe.getState(),l=X.tick(s,{...a,windDirectionDeg:r.windDirection,windSpeedKts:r.windSpeedKts});if(ae.setDriveMultiplier(X.getSpeedMultiplier()),l.some(d=>d.key==="enemy_fires")){const d=X.getView().npc,u=Ae({x:d.x,y:d.y},S.visuals.worldUnitsPerMetre);if(fe.triggerMuzzleFlash(e,u.x,u.z),l.some(c=>c.key==="hit_taken"))lo();else{const c=d.x-a.x,f=d.y-a.y,h=Math.hypot(c,f)||1,y={x:a.x+c/h*Dn,y:a.y+f/h*Dn},b=Ae(y,S.visuals.worldUnitsPerMetre);fe.triggerSplash(e,b.x,b.z)}}for(const d of l){const u=F(d.key,r,d);rt(u);const c=De();c!==null&&c.length>0&&pt(u,c,S.voice.ttsModel,S.voice.ttsVoice,S.voice.ttsVolume).catch(()=>{})}}}Mt=e;const t=ae.getPose(),n={x:t.x,y:t.y,headingDeg:oe.getState().heading},i=X?X.getView().npc:null,o=i?{x:i.x,y:i.y,headingDeg:i.heading}:null;fe.update(e,n,o),$a.update(),requestAnimationFrame(An)}requestAnimationFrame(An),window.__captain={bus:oe,submitIntent:Ua,injectTranscript:wt,setWind:(e,t)=>{ae.setWind(e,t)},demo:vn,getConfig:()=>S,copyConfig:()=>{const e=JSON.stringify(S,null,2);return console.log(e),e},setConfig:e=>{It(e),location.reload()},resetConfig:()=>{Lt(),location.reload()},getPlayerPose:()=>ae.getPose(),get battle(){return X?X.getView():null}}})();
