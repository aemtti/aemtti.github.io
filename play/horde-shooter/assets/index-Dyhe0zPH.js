(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const a of r.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&i(a)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();class kh{fixedDt;maxStepsPerFrame;accumulator=0;droppedSteps=0;constructor(t,e=5){this.fixedDt=1/t,this.maxStepsPerFrame=e}advance(t){const e=this.fixedDt*this.maxStepsPerFrame,i=t>e?e:t<0?0:t;t>e&&(this.droppedSteps+=Math.floor((t-e)/this.fixedDt)),this.accumulator+=i;let s=0;for(;this.accumulator>=this.fixedDt&&s<this.maxStepsPerFrame;)this.accumulator-=this.fixedDt,s++;return s}get alpha(){return this.accumulator/this.fixedDt}reset(){this.accumulator=0}}const Hh=1e-6,ba=Math.PI*2,He=Math.PI/180,Yo=180/Math.PI;function Ke(n=0,t=0,e=0){return{x:n,y:t,z:e}}function sn(n,t,e){return n<t?t:n>e?e:n}function _s(n){return n<0?0:n>1?1:n}function Li(n,t,e){return n+(t-n)*e}function wa(n){const t=_s(n);return t*t*(3-2*t)}function Vh(n){return n>0?1:n<0?-1:0}function Bc(n,t,e){const i=t-n;return Math.abs(i)<=e?t:n+Vh(i)*e}function qo(n,t,e,i){if(e<=Hh)return t;const s=Math.exp(-i/e);return t+(n-t)*s}function zc(n){let t=(n+Math.PI)%ba;return t<0&&(t+=ba),t-Math.PI}function kc(n,t){return zc(t-n)}function Hc(n,t,e){const i=Math.cos(e);return n.x=-Math.sin(t)*i,n.y=Math.sin(e),n.z=-Math.cos(t)*i,n}function Vc(n,t){return n.x=Math.cos(t),n.y=0,n.z=-Math.sin(t),n}function To(n,t){return n.x=-Math.sin(t),n.y=0,n.z=-Math.cos(t),n}const Ue={groundAccel:60,groundDecel:80,walkSpeed:4.2,sprintSpeed:6.6,backpedalScale:.82,strafeScale:.9,jumpSpeed:5.2,gravity:22,airControlScale:.25,adsSpeedScale:.55},_n={sensitivity:.0022,maxPitch:89*He,adsSensitivityScale:.75},ar={transitionTime:.18,hipFov:90,adsFov:65},Ii={patternNoise:.08,firstShotScale:.6,recoveryDelay:.12,recoveryTime:.4},or={normalHit:0,headshot:.045,bigKill:.09,maxHold:.12},Bn={fireAmplitude:.35*He,fireDecay:.08,explosionAmplitude:1.6*He,explosionDecay:.26,maxAmplitude:3*He},Dr={flashTime:.035,lightIntensity:2},Ve={showTime:.06,headshotToneHz:800,headshotToneTime:.04,killToneHz:140,killToneTime:.09,bigKillToneHz:70,bigKillToneTime:.16},ji={lifetime:.8,riseDistance:40,headshotScale:1.3,maxVisible:48},Je={tracerLifetime:.06,tracerMinDistance:8,shellLifetime:2,decalLifetime:20,maxDecals:128},Gc={lookRadiansPerPixel:.0062,moveDeadzone:.15};function Gh(){return{moveForward:0,moveRight:0,yaw:0,pitch:0,jump:!1,sprint:!1,fire:!1,ads:!1,reload:!1,use:!1,heal:!1,switchSlot:-1}}const Wh=["Digit1","Digit2","Digit3","Digit4","Digit5"];class Xh{command=Gh();sensitivity=_n.sensitivity;yaw=0;pitch=0;keys=new Set;mouseButtons=0;pendingDx=0;pendingDy=0;pendingSlot=-1;element=null;locked=!1;touchForward=0;touchRight=0;touchFire=!1;touchAds=!1;onKeyDown=t=>{this.keys.add(t.code);const e=Wh.indexOf(t.code);e>=0&&(this.pendingSlot=e),t.code==="Space"&&t.preventDefault()};onKeyUp=t=>{this.keys.delete(t.code)};onMouseDown=t=>{this.mouseButtons|=1<<t.button};onMouseUp=t=>{this.mouseButtons&=~(1<<t.button)};onMouseMove=t=>{this.locked&&(this.pendingDx+=t.movementX,this.pendingDy+=t.movementY)};onPointerLockChange=()=>{this.locked=document.pointerLockElement===this.element,this.locked||(this.keys.clear(),this.mouseButtons=0)};onContextMenu=t=>{t.preventDefault()};onBlur=()=>{this.keys.clear(),this.mouseButtons=0};attach(t){this.element=t,window.addEventListener("keydown",this.onKeyDown),window.addEventListener("keyup",this.onKeyUp),window.addEventListener("mousedown",this.onMouseDown),window.addEventListener("mouseup",this.onMouseUp),window.addEventListener("mousemove",this.onMouseMove),window.addEventListener("blur",this.onBlur),document.addEventListener("pointerlockchange",this.onPointerLockChange),t.addEventListener("contextmenu",this.onContextMenu)}detach(){window.removeEventListener("keydown",this.onKeyDown),window.removeEventListener("keyup",this.onKeyUp),window.removeEventListener("mousedown",this.onMouseDown),window.removeEventListener("mouseup",this.onMouseUp),window.removeEventListener("mousemove",this.onMouseMove),window.removeEventListener("blur",this.onBlur),document.removeEventListener("pointerlockchange",this.onPointerLockChange),this.element?.removeEventListener("contextmenu",this.onContextMenu),this.element=null}requestLock(){const t=this.element?.requestPointerLock();t instanceof Promise&&t.catch(()=>{})}get isLocked(){return this.locked}isKeyDown(t){return this.keys.has(t)}setTouchMove(t,e){this.touchForward=t,this.touchRight=e}setTouchFire(t){this.touchFire=t}setTouchAds(t){this.touchAds=t}addTouchLook(t,e){const i=Gc.lookRadiansPerPixel/_n.sensitivity;this.pendingDx+=t*i,this.pendingDy+=e*i}requestSlot(t){this.pendingSlot=t}releaseTouch(){this.touchForward=0,this.touchRight=0,this.touchFire=!1,this.touchAds=!1}buildCommand(t){const e=this.command,i=this.sensitivity*t;this.yaw-=this.pendingDx*i,this.pitch-=this.pendingDy*i,this.pitch=sn(this.pitch,-_n.maxPitch,_n.maxPitch),this.pendingDx=0,this.pendingDy=0,e.yaw=this.yaw,e.pitch=this.pitch;const s=(this.keys.has("KeyW")?1:0)-(this.keys.has("KeyS")?1:0),r=(this.keys.has("KeyD")?1:0)-(this.keys.has("KeyA")?1:0);return e.moveForward=sn(s+this.touchForward,-1,1),e.moveRight=sn(r+this.touchRight,-1,1),e.jump=this.keys.has("Space"),e.sprint=this.keys.has("ShiftLeft")||this.keys.has("ShiftRight"),e.reload=this.keys.has("KeyR"),e.use=this.keys.has("KeyE"),e.heal=this.keys.has("KeyF"),e.fire=(this.mouseButtons&1)!==0||this.touchFire,e.ads=(this.mouseButtons&2)!==0||this.touchAds,e.switchSlot=this.pendingSlot,this.pendingSlot=-1,e}}const Zo={hz:60,maxStepsPerFrame:5},Ko={perWave:.1,cap:2.5},bo={normal:{id:"normal",label:"Normal",zedHealth:1,zedDamage:1,zedSpeed:1,income:1,zedCount:1,maxAlive:1,specialWeight:1},hard:{id:"hard",label:"Hard",zedHealth:1.15,zedDamage:1.3,zedSpeed:1.06,income:.9,zedCount:1.25,maxAlive:1.3,specialWeight:1.5},hell:{id:"hell",label:"Hell",zedHealth:1.35,zedDamage:1.7,zedSpeed:1.12,income:.8,zedCount:1.55,maxAlive:1.7,specialWeight:2.2}},Wc={zedHealth:1,zedDamage:1},Jn={radius:.4,height:1.8,eyeHeight:1.65,stepHeight:.45,groundSnapDistance:.12},ei={maxHealth:100,armorAbsorb:.6,armorDrainPerDamage:1,waveStartInvulnerability:1},Aa={maxWeight:15,maxWeapons:5,holsterTime:.18};function Yh(n){let t=n|0;return()=>{t=t+2654435769|0;let e=t;return e=Math.imul(e^e>>>16,569420461),e=Math.imul(e^e>>>15,1935289751),(e^e>>>15)>>>0}}class ri{a;b;c;d;constructor(t){const e=Yh(Math.trunc(t)|0);this.a=e(),this.b=e(),this.c=e(),this.d=e();for(let i=0;i<8;i++)this.nextUint32()}nextUint32(){const t=this.a+this.b|0;this.a=this.b^this.b>>>9,this.b=this.c+(this.c<<3)|0,this.c=this.c<<21|this.c>>>11,this.d=this.d+1|0;const e=t+this.d|0;return this.c=this.c+e|0,e>>>0}next(){return this.nextUint32()/4294967296}range(t,e){return t+(e-t)*this.next()}int(t){return t<=0?0:Math.floor(this.next()*t)}intRange(t,e){return e<=t?t:t+this.int(e-t+1)}chance(t){return this.next()<t}pick(t){if(t.length!==0)return t[this.int(t.length)]}pickWeighted(t,e){let i=0;for(let r=0;r<t.length;r++){const a=e[r]??0;a>0&&(i+=a)}if(i<=0)return;let s=this.next()*i;for(let r=0;r<t.length;r++){const a=e[r]??0;if(!(a<=0)&&(s-=a,s<0))return t[r]}return t[t.length-1]}shuffle(t){for(let e=t.length-1;e>0;e--){const i=this.int(e+1),s=t[e];t[e]=t[i],t[i]=s}return t}jitter(t){return(this.next()*2-1)*t}gaussian(){const t=1-this.next(),e=this.next();return Math.sqrt(-2*Math.log(t))*Math.cos(Math.PI*2*e)}fork(t){return new ri(this.a^Math.imul(t|0,2654435769)|0)}saveState(){return[this.a,this.b,this.c,this.d]}restoreState(t){this.a=t[0],this.b=t[1],this.c=t[2],this.d=t[3]}}function xe(n,t,e,i,s,r){const a=i*.5,o=s*.5,c=r*.5;return{minX:n-a,minY:t-o,minZ:e-c,maxX:n+a,maxY:t+o,maxZ:e+c}}function qh(n,t){t.minX<n.minX&&(n.minX=t.minX),t.minY<n.minY&&(n.minY=t.minY),t.minZ<n.minZ&&(n.minZ=t.minZ),t.maxX>n.maxX&&(n.maxX=t.maxX),t.maxY>n.maxY&&(n.maxY=t.maxY),t.maxZ>n.maxZ&&(n.maxZ=t.maxZ)}function Zh(){return{minX:1/0,minY:1/0,minZ:1/0,maxX:-1/0,maxY:-1/0,maxZ:-1/0}}function Kh(){return{t:0,nx:0,ny:0,nz:0,boxIndex:-1}}function $h(n,t,e,i,s,r,a,o,c){const l=(n.minX-t)*s,h=(n.maxX-t)*s;let u=Math.min(l,h),f=Math.max(l,h),p=0;const g=(n.minY-e)*r,_=(n.maxY-e)*r,m=Math.min(g,_);m>u&&(u=m,p=1),f=Math.min(f,Math.max(g,_));const d=(n.minZ-i)*a,T=(n.maxZ-i)*a,v=Math.min(d,T);return v>u&&(u=v,p=2),f=Math.min(f,Math.max(d,T)),f<0||u>f||u>o?-1:u<0?(c.t=0,c.nx=0,c.ny=0,c.nz=0,0):(c.t=u,c.nx=0,c.ny=0,c.nz=0,p===0?c.nx=l>h?1:-1:p===1?c.ny=g>_?1:-1:c.nz=d>T?1:-1,u)}const jh=4;class Jh{boxes;bounds;cellSize;originX;originZ;cols;rows;cellStart;cellItems;stamps;queryStamp=0;constructor(t,e=jh){this.boxes=t,this.cellSize=e;const i=Zh();for(const c of t)qh(i,c);t.length===0&&(i.minX=i.minY=i.minZ=0,i.maxX=i.maxY=i.maxZ=0),this.bounds=i,this.originX=i.minX-e,this.originZ=i.minZ-e,this.cols=Math.max(1,Math.ceil((i.maxX-this.originX)/e)+1),this.rows=Math.max(1,Math.ceil((i.maxZ-this.originZ)/e)+1);const s=this.cols*this.rows,r=new Int32Array(s);for(const c of t){const l=this.clampCol(c.minX),h=this.clampCol(c.maxX),u=this.clampRow(c.minZ),f=this.clampRow(c.maxZ);for(let p=u;p<=f;p++)for(let g=l;g<=h;g++)r[p*this.cols+g]++}this.cellStart=new Int32Array(s+1);let a=0;for(let c=0;c<s;c++)this.cellStart[c]=a,a+=r[c];this.cellStart[s]=a;const o=Int32Array.from(this.cellStart.subarray(0,s));this.cellItems=new Int32Array(a);for(let c=0;c<t.length;c++){const l=t[c],h=this.clampCol(l.minX),u=this.clampCol(l.maxX),f=this.clampRow(l.minZ),p=this.clampRow(l.maxZ);for(let g=f;g<=p;g++)for(let _=h;_<=u;_++){const m=g*this.cols+_;this.cellItems[o[m]]=c,o[m]++}}this.stamps=new Int32Array(t.length)}clampCol(t){const e=Math.floor((t-this.originX)/this.cellSize);return e<0?0:e>=this.cols?this.cols-1:e}clampRow(t){const e=Math.floor((t-this.originZ)/this.cellSize);return e<0?0:e>=this.rows?this.rows-1:e}queryRegion(t,e,i,s,r){const a=++this.queryStamp,o=this.clampCol(t),c=this.clampCol(i),l=this.clampRow(e),h=this.clampRow(s);let u=0;for(let f=l;f<=h;f++){const p=f*this.cols;for(let g=o;g<=c;g++){const _=p+g,m=this.cellStart[_],d=this.cellStart[_+1];for(let T=m;T<d;T++){const v=this.cellItems[T];this.stamps[v]!==a&&(this.stamps[v]=a,r[u++]=v)}}}return u}raycast(t,e,i,s,r,a,o,c,l=this.scratchIndices){const h=t+s*o,u=i+a*o,f=this.queryRegion(Math.min(t,h),Math.min(i,u),Math.max(t,h),Math.max(i,u),l),p=1/(s===0?1e-30:s),g=1/(r===0?1e-30:r),_=1/(a===0?1e-30:a);let m=o,d=!1;const T=this.scratchHit;for(let v=0;v<f;v++){const S=l[v],A=$h(this.boxes[S],t,e,i,p,g,_,m,T);A<0||A>m||(m=A,d=!0,c.t=T.t,c.nx=T.nx,c.ny=T.ny,c.nz=T.nz,c.boxIndex=S)}return d}hasLineOfSight(t,e,i,s,r,a){const o=s-t,c=r-e,l=a-i,h=Math.sqrt(o*o+c*c+l*l);if(h<1e-6)return!0;const u=1/h;return!this.raycast(t,e,i,o*u,c*u,l*u,h,this.losHit,this.losIndices)}groundHeightAt(t,e,i){const s=this.queryRegion(t,e,t,e,this.scratchIndices);let r=-1/0;for(let a=0;a<s;a++){const o=this.boxes[this.scratchIndices[a]];t<o.minX||t>o.maxX||e<o.minZ||e>o.maxZ||o.maxY<=i&&o.maxY>r&&(r=o.maxY)}return r}isCapsuleClear(t,e,i,s,r){const a=this.queryRegion(t-s,i-s,t+s,i+s,this.scratchIndices),o=e+r;for(let c=0;c<a;c++){const l=this.boxes[this.scratchIndices[c]];if(l.maxY<=e||l.minY>=o)continue;const h=t<l.minX?l.minX:t>l.maxX?l.maxX:t,u=i<l.minZ?l.minZ:i>l.maxZ?l.maxZ:i,f=t-h,p=i-u;if(f*f+p*p<s*s)return!1}return!0}scratchIndices=[];losIndices=[];scratchHit={t:0,nx:0,ny:0,nz:0,boxIndex:-1};losHit={t:0,nx:0,ny:0,nz:0,boxIndex:-1}}function Qh(n){const t=[];for(const e of n.boxes)t.push(e.box);return t}function tu(n){return n.map(([t,e])=>({pitch:t*He,yaw:e*He}))}const Ra={id:"pistol_t1",name:"M9 Sidearm",family:"pistol",tier:1,perk:"ranger",damage:26,pellets:1,headshotMultiplier:1.5,rpm:380,fireMode:"semi",burstCount:1,burstCooldown:0,magazineSize:15,startingReserve:90,maxReserve:180,reloadTime:1.5,reloadTimeEmpty:2,weight:1,price:0,ammoPrice:12,ammoPerPurchase:30,recoilPattern:tu([[.55,.06],[.62,-.1],[.7,.14],[.74,-.16],[.8,.2],[.76,-.22],[.7,.18],[.66,-.12],[.6,.1],[.56,-.06]]),spreadHip:1.4*He,spreadAds:.25*He,spreadMoving:1.1*He,spreadPerShot:.45*He,spreadRecovery:5*He,spreadMax:4.5*He,penetration:0,penetrationFalloff:.5,range:90,falloffStart:35,falloffFloor:.7,equipTime:.28,adsTime:.16,sound:{bodyHz:165,bodyDecay:.09,noiseDecay:.05,brightness:.6,gain:.5}},eu={[Ra.id]:Ra};function Ui(n){return eu[n]}function nu(n){return 60/n.rpm}const $o=Ra.id,Fe=1e-4,iu=4;function Xc(){return{grounded:!1,hitWall:!1,steppedUp:!1,landed:!1,ceilingHit:!1}}const Pn=[];function Ca(n,t,e,i){const s=t<n.minX?n.minX:t>n.maxX?n.maxX:t,r=e<n.minZ?n.minZ:e>n.maxZ?n.maxZ:e,a=t-s,o=e-r;return a*a+o*o<i*i}function su(n,t,e,i,s,r){let a=!1;const o=e*e;for(let c=0;c<iu;c++){const l=n.queryRegion(t.x-e,t.z-e,t.x+e,t.z+e,Pn),h=t.y+i;let u=!1;for(let f=0;f<l;f++){const p=n.boxes[Pn[f]];if(p.maxY<=t.y+Fe||p.minY>=h-Fe||r&&p.maxY<=t.y+s)continue;const g=t.x<p.minX?p.minX:t.x>p.maxX?p.maxX:t.x,_=t.z<p.minZ?p.minZ:t.z>p.maxZ?p.maxZ:t.z,m=t.x-g,d=t.z-_,T=m*m+d*d;if(!(T>=o)){if(T>1e-12){const v=Math.sqrt(T),S=e-v+Fe;t.x+=m/v*S,t.z+=d/v*S}else{const v=t.x-p.minX+e,S=p.maxX-t.x+e,A=t.z-p.minZ+e,C=p.maxZ-t.z+e,R=Math.min(v,S,A,C);R===v?t.x-=v+Fe:R===S?t.x+=S+Fe:R===A?t.z-=A+Fe:t.z+=C+Fe}u=!0,a=!0}}if(!u)break}return a}function ru(n,t,e,i,s){const r=n.queryRegion(t.x-e,t.z-e,t.x+e,t.z+e,Pn),a=t.y+i;let o=t.y;for(let c=0;c<r;c++){const l=n.boxes[Pn[c]];l.maxY<=t.y+Fe||l.minY>=a||l.maxY>t.y+s||Ca(l,t.x,t.z,e)&&l.maxY>o&&(o=l.maxY)}return o}function Yc(n,t,e,i,s,r,a,o,c,l){l.grounded=!1,l.hitWall=!1,l.steppedUp=!1,l.landed=!1,l.ceilingHit=!1;const h=t.x,u=t.z,f=e.x*c,p=e.z*c;if(t.x+=f,t.z+=p,su(n,t,i,s,r,o)){l.hitWall=!0;const v=t.x-h,S=t.z-u,A=f*f+p*p,C=v*v+S*S;A>1e-12&&C<=A&&c>0&&(e.x=v/c,e.z=S/c)}if(o){const v=ru(n,t,i,s,r);v>t.y+Fe&&(n.isCapsuleClear(t.x,v+Fe,t.z,i,s)?(t.y=v,l.steppedUp=!0):(t.x=h,t.z=u,e.x=0,e.z=0,l.hitWall=!0))}const g=t.y;t.y+=e.y*c;const _=n.queryRegion(t.x-i,t.z-i,t.x+i,t.z+i,Pn);let m=-1/0,d=1/0;const T=t.y+s;for(let v=0;v<_;v++){const S=n.boxes[Pn[v]];Ca(S,t.x,t.z,i)&&(e.y<=0&&g>=S.maxY-Fe&&t.y<S.maxY?S.maxY>m&&(m=S.maxY):e.y>0&&g+s<=S.minY+Fe&&T>S.minY&&S.minY<d&&(d=S.minY))}if(m>-1/0?(t.y=m,e.y=0,l.grounded=!0,l.landed=!o):d<1/0&&(t.y=d-s,e.y=0,l.ceilingHit=!0),!l.grounded&&o&&e.y<=0&&a>0){const v=n.queryRegion(t.x-i,t.z-i,t.x+i,t.z+i,Pn);let S=-1/0;for(let A=0;A<v;A++){const C=n.boxes[Pn[A]];Ca(C,t.x,t.z,i)&&C.maxY<=t.y+Fe&&C.maxY>=t.y-a&&C.maxY>S&&(S=C.maxY)}S>-1/0&&(t.y=S,e.y=0,l.grounded=!0)}}function au(){return{pitch:0,yaw:0,sinceShot:1/0,recovering:!1,fromPitch:0,fromYaw:0,recoverElapsed:0}}function ou(n){n.pitch=0,n.yaw=0,n.sinceShot=1/0,n.recovering=!1,n.fromPitch=0,n.fromYaw=0,n.recoverElapsed=0}function lu(n,t,e,i){const s=t.recoilPattern;if(s.length===0)return;const r=s[e%s.length],a=e===0?Ii.firstShotScale:1,o=1+i.jitter(Ii.patternNoise),c=1+i.jitter(Ii.patternNoise);n.pitch+=r.pitch*a*o,n.yaw+=r.yaw*a*c,n.sinceShot=0,n.recovering=!1,n.recoverElapsed=0}function cu(n,t){if(n.sinceShot===1/0||(n.sinceShot+=t,n.sinceShot<Ii.recoveryDelay))return;n.recovering||(n.recovering=!0,n.fromPitch=n.pitch,n.fromYaw=n.yaw,n.recoverElapsed=0),n.recoverElapsed+=t;const e=_s(n.recoverElapsed/Ii.recoveryTime),i=wa(e);n.pitch=n.fromPitch*(1-i),n.yaw=n.fromYaw*(1-i),e>=1&&(n.pitch=0,n.yaw=0,n.sinceShot=1/0,n.recovering=!1)}function hu(n){return n.sinceShot>=Ii.recoveryDelay}function uu(n){return{defId:n.id,weight:n.weight,ammoInMagazine:n.magazineSize,reserve:n.startingReserve,phase:"equipping",phaseTimer:n.equipTime,shotCooldown:0,patternIndex:0,burstRemaining:0,triggerWasHeld:!1,spread:0,timeSinceShot:1/0}}function du(n,t){return n.ammoInMagazine>=t.magazineSize}function jo(n,t){return n.reserve>0&&!du(n,t)&&n.phase!=="reloading"}function fu(n,t){const e=t.magazineSize-n.ammoInMagazine,i=Math.min(e,n.reserve);n.ammoInMagazine+=i,n.reserve-=i}function pu(n,t,e){if(n.spread<=0){n.spread=0;return}n.spread=Math.max(0,n.spread-t.spreadRecovery*e)}function mu(n,t){n.spread=Math.min(t.spreadMax,n.spread+t.spreadPerShot)}function gu(n,t,e,i){const s=t.spreadHip+(t.spreadAds-t.spreadHip)*sn(e,0,1),r=t.spreadMoving*sn(i/Ue.sprintSpeed,0,1);return s+r+n.spread}function _u(){return{shotsFired:0,firstPatternIndex:-1,startedReload:!1,finishedReload:!1,dryFired:!1,equipped:!1,emptiedMagazine:!1}}function Jo(n,t){n.phase="reloading",n.phaseTimer=n.ammoInMagazine===0?t.reloadTimeEmpty:t.reloadTime,n.burstRemaining=0}function vu(n){return n.phase!=="reloading"?!1:(n.phase="idle",n.phaseTimer=0,!0)}function qc(n,t){n.phase="equipping",n.phaseTimer=t.equipTime,n.burstRemaining=0,n.triggerWasHeld=!0}function xu(n,t,e,i,s,r){r.shotsFired=0,r.firstPatternIndex=-1,r.startedReload=!1,r.finishedReload=!1,r.dryFired=!1,r.equipped=!1,r.emptiedMagazine=!1,n.timeSinceShot!==1/0&&(n.timeSinceShot+=s),pu(n,t,s),n.shotCooldown>0&&(n.shotCooldown-=s);const a=e.fire&&!n.triggerWasHeld;switch(n.phase){case"equipping":{n.phaseTimer-=s,n.phaseTimer<=0&&(n.phase="idle",n.phaseTimer=0,r.equipped=!0),n.triggerWasHeld=e.fire;return}case"reloading":{n.phaseTimer-=s,n.phaseTimer<=0&&(fu(n,t),n.phase="idle",n.phaseTimer=0,r.finishedReload=!0),n.triggerWasHeld=e.fire;return}case"firing":{n.shotCooldown<=0&&(n.phase="idle");break}}if(e.reload&&jo(n,t)){Jo(n,t),r.startedReload=!0,n.triggerWasHeld=e.fire;return}i&&(n.patternIndex=0,e.fire||(n.burstRemaining=0));let o=!1;switch(t.fireMode){case"auto":case"stream":o=e.fire;break;case"semi":case"melee":case"lobbed":o=a;break;case"burst":a&&n.burstRemaining===0&&(n.burstRemaining=t.burstCount),o=n.burstRemaining>0;break}o&&n.shotCooldown<=0&&(n.ammoInMagazine>0?(n.ammoInMagazine--,n.shotCooldown=nu(t),n.phase="firing",n.timeSinceShot=0,mu(n,t),r.shotsFired=1,r.firstPatternIndex=n.patternIndex,t.fireMode==="burst"&&(n.burstRemaining--,n.burstRemaining===0&&(n.shotCooldown=t.burstCooldown)),n.ammoInMagazine===0&&(r.emptiedMagazine=!0),n.patternIndex++):(n.burstRemaining=0,jo(n,t)?(Jo(n,t),r.startedReload=!0):a&&(r.dryFired=!0))),n.triggerWasHeld=e.fire}function Su(){return{weapons:[],activeSlot:-1,pendingSlot:-1,holsterTimer:0,totalWeight:0}}function Bi(n){return n.activeSlot<0?null:n.weapons[n.activeSlot]??null}function Pa(n){const t=Bi(n);return t===null?null:Ui(t.defId)??null}function Mu(n){let t=0;for(const e of n.weapons)t+=e.weight;n.totalWeight=t}function yu(n,t){return n.weapons.some(e=>e.defId===t)}function Eu(n,t){return yu(n,t.id)||n.weapons.length>=Aa.maxWeapons?!1:n.totalWeight+t.weight<=Aa.maxWeight}function Qo(n,t,e=!1){if(!Eu(n,t))return-1;const i=uu(t);n.weapons.push(i),Mu(n);const s=n.weapons.length-1;return n.activeSlot<0?(n.activeSlot=s,qc(i,t)):e&&Zc(n,s),s}function Zc(n,t){if(t<0||t>=n.weapons.length||t===n.activeSlot&&n.pendingSlot<0||t===n.pendingSlot)return!1;const e=Bi(n);return e!==null&&vu(e),n.pendingSlot=t,n.holsterTimer=Aa.holsterTime,!0}function Tu(n){return n.pendingSlot>=0}function bu(n,t){if(n.pendingSlot<0||(n.holsterTimer-=t,n.holsterTimer>0))return!1;n.activeSlot=n.pendingSlot,n.pendingSlot=-1,n.holsterTimer=0;const e=Bi(n);if(e!==null){const i=Ui(e.defId);i&&qc(e,i)}return!0}function wu(){return{pos:Ke(0,0,0),velocity:Ke(0,0,0),yaw:0,pitch:0,grounded:!1,adsProgress:0,sprinting:!1,speed:0,jumpCooldown:0,health:ei.maxHealth,armor:0,alive:!0,invulnerability:0,timeSinceDamage:1/0,move:Xc(),recoil:au(),inventory:Su()}}function lr(n){return n.yaw+n.recoil.yaw}function cr(n){return sn(n.pitch+n.recoil.pitch,-_n.maxPitch,_n.maxPitch)}function tl(n,t,e,i,s){n.pos.x=t,n.pos.y=e,n.pos.z=i,n.velocity.x=0,n.velocity.y=0,n.velocity.z=0,n.yaw=s,n.pitch=0,n.grounded=!1,n.adsProgress=0,n.sprinting=!1,n.speed=0,n.jumpCooldown=0,n.alive=!0,n.invulnerability=ei.waveStartInvulnerability,n.timeSinceDamage=1/0,ou(n.recoil)}const Au=.01,Ru=.1,Lr=Ke(),Ir=Ke();function Cu(n,t){const i=(n>=0?1:Ue.backpedalScale)*n,s=Ue.strafeScale*t;return Math.sqrt(i*i+s*s)}function Pu(n,t,e,i){n.yaw=t.yaw,n.pitch=sn(t.pitch,-_n.maxPitch,_n.maxPitch);const s=t.ads?1:0;n.adsProgress=Bc(n.adsProgress,s,i/ar.transitionTime),To(Lr,n.yaw),Vc(Ir,n.yaw);const r=sn(t.moveForward,-1,1),a=sn(t.moveRight,-1,1),o=Math.sqrt(r*r+a*a);let c=0,l=0,h=0;if(o>Au){const d=r/o,T=a/o;c=Lr.x*d+Ir.x*T,l=Lr.z*d+Ir.z*T,n.sprinting=t.sprint&&d>.5&&n.adsProgress<.5;const v=n.sprinting?Ue.sprintSpeed:Ue.walkSpeed,S=1+(Ue.adsSpeedScale-1)*n.adsProgress;h=v*Cu(d,T)*S*Math.min(1,o)}else n.sprinting=!1;const u=c*h,f=l*h,p=u-n.velocity.x,g=f-n.velocity.z,_=Math.sqrt(p*p+g*g);let m;if(h>0?m=(n.grounded?Ue.groundAccel:Ue.groundAccel*Ue.airControlScale)*i:n.grounded?m=Ue.groundDecel*i:m=0,_>0&&m>0)if(_<=m)n.velocity.x=u,n.velocity.z=f;else{const d=m/_;n.velocity.x+=p*d,n.velocity.z+=g*d}n.jumpCooldown>0&&(n.jumpCooldown-=i),t.jump&&n.grounded&&n.jumpCooldown<=0&&(n.velocity.y=Ue.jumpSpeed,n.grounded=!1,n.jumpCooldown=Ru),n.velocity.y-=Ue.gravity*i,n.velocity.y<-60&&(n.velocity.y=-60),Yc(e,n.pos,n.velocity,Jn.radius,Jn.height,Jn.stepHeight,Jn.groundSnapDistance,n.grounded,i,n.move),n.grounded=n.move.grounded,n.speed=Math.sqrt(n.velocity.x*n.velocity.x+n.velocity.z*n.velocity.z),n.invulnerability>0&&(n.invulnerability-=i),n.timeSinceDamage!==1/0&&(n.timeSinceDamage+=i)}function el(n){return ar.hipFov+(ar.adsFov-ar.hipFov)*n.adsProgress}function Du(n,t){const e=1+(_n.adsSensitivityScale-1)*n.adsProgress;return t*e}function Lu(){return{part:"torso",t:0,damageMultiplier:1,shapeIndex:-1}}function Iu(n,t,e,i,s,r,a,o,c,l,h,u){const f=o-h,p=o+h,g=l*l;let _=-1;const m=n-a,d=e-c,T=i*i+r*r;if(T>1e-12){const v=2*(m*i+d*r),S=m*m+d*d-g,A=v*v-4*T*S;if(A>=0){const C=Math.sqrt(A);for(const R of[(-v-C)/(2*T),(-v+C)/(2*T)]){if(R<0||R>u)continue;const D=t+s*R;if(D>=f&&D<=p){_=R;break}}}}for(const v of[f,p]){const S=n-a,A=t-v,C=e-c,R=2*(S*i+A*s+C*r),D=S*S+A*A+C*C-g,E=R*R-4*D;if(E<0)continue;const M=Math.sqrt(E);for(const w of[(-R-M)/2,(-R+M)/2])if(!(w<0||w>u)){(_<0||w<_)&&(_=w);break}}return _}function Uu(n,t,e,i,s,r,a,o,c,l,h,u,f,p=null){const g=r-t,_=a-e,m=o-i,d=Math.cos(-s),T=Math.sin(-s),v=g*d+m*T,S=-g*T+m*d,A=c*d+h*T,C=-c*T+h*d;let R=u,D=-1;for(let M=0;M<n.length;M++){if(p!==null&&p[M]!==0)continue;const w=n[M],N=Iu(v,_,S,A,l,C,w.ox,w.oy,w.oz,w.radius,w.halfHeight,R);N<0||N>=R||(R=N,D=M)}if(D<0)return!1;const E=n[D];return f.part=E.part,f.t=R,f.damageMultiplier=E.damageMultiplier,f.shapeIndex=D,!0}function Fu(n){let t=0;for(const e of n){const i=e.halfHeight+e.radius,s=Math.sqrt(e.ox*e.ox+e.oz*e.oz)+e.radius,r=Math.abs(e.oy)+i,a=s*s+r*r;a>t&&(t=a)}return Math.sqrt(t)}function Nu(n){let t=0;for(const e of n){const i=e.oy+e.halfHeight+e.radius;i>t&&(t=i)}return t}function Ou(){return{applied:0,killed:!1,detachedShapeIndex:-1,headshot:!1,staggerDamage:0}}function Bu(n,t,e,i){if(i.applied=0,i.killed=!1,i.detachedShapeIndex=-1,i.headshot=!1,i.staggerDamage=n.staggerDamage,!n.alive)return;const s=n.shapes[t];if(s===void 0||n.partDetached[t]!==0)return;const r=e*s.damageMultiplier;i.headshot=s.part==="head";const a=n.partHealth[t]-r;n.partHealth[t]=a,a<=0&&Number.isFinite(a)&&(n.partDetached[t]=1,i.detachedShapeIndex=t),n.health-=r,n.staggerDamage+=r,i.applied=r,i.staggerDamage=n.staggerDamage,n.health<=0&&(n.health=0,n.alive=!1,i.killed=!0)}function zu(n,t,e,i){if(n<=t)return 1;if(n>=e)return i;const s=e-t;if(s<=0)return i;const r=(n-t)/s;return 1+(i-1)*r}class ku{records;len=0;overflowCount=0;constructor(t,e){this.records=new Array(t);for(let i=0;i<t;i++)this.records[i]=e()}get length(){return this.len}get capacity(){return this.records.length}push(){return this.len>=this.records.length?(this.overflowCount++,null):this.records[this.len++]}at(t){return this.records[t]}clear(){this.len=0}}var re=(n=>(n[n.WeaponFired=0]="WeaponFired",n[n.DryFire=1]="DryFire",n[n.ReloadStarted=2]="ReloadStarted",n[n.ReloadFinished=3]="ReloadFinished",n[n.ReloadCancelled=4]="ReloadCancelled",n[n.WeaponEquipped=5]="WeaponEquipped",n[n.ImpactWorld=6]="ImpactWorld",n[n.TargetHit=7]="TargetHit",n[n.PartDetached=8]="PartDetached",n[n.TargetKilled=9]="TargetKilled",n[n.PlayerHurt=10]="PlayerHurt",n[n.PlayerDied=11]="PlayerDied",n))(re||{});const Da=1,Kc=2,_r=4,Hu=8,Vu=16;function Gu(){return{kind:0,x:0,y:0,z:0,nx:0,ny:0,nz:0,amount:0,entityId:-1,partIndex:-1,flags:0,key:""}}const Wu=512;class Xu extends ku{constructor(t=Wu){super(t,Gu)}emit(t,e,i,s){const r=this.push();return r===null?null:(r.kind=t,r.x=e,r.y=i,r.z=s,r.nx=0,r.ny=0,r.nz=0,r.amount=0,r.entityId=-1,r.partIndex=-1,r.flags=0,r.key="",r)}}const Fi=12,Yu=.99;function qu(){return{hits:0,totalDamage:0,headshots:0,kills:0,largeKill:!1,anyHeadshot:!1}}const Ji=Kh(),Ur=Lu(),Ge=Ou(),hr=new Int32Array(Fi),ur=new Int32Array(Fi),Ci=new Float64Array(Fi),oe={x:0,y:0,z:0};function Zu(n,t,e,i,s,r){if(i<=0){r.x=n,r.y=t,r.z=e;return}const a=Math.abs(t)>Yu,o=a?1:0,c=a?0:1;let l=c*e-0*t,h=0*n-o*e,u=o*t-c*n;const f=Math.sqrt(l*l+h*h+u*u)||1;l/=f,h/=f,u/=f;const p=t*u-e*h,g=e*l-n*u,_=n*h-t*l,m=s.next()*ba,d=Math.tan(i)*Math.sqrt(s.next()),T=Math.cos(m)*d,v=Math.sin(m)*d;let S=n+l*T+p*v,A=t+h*T+g*v,C=e+u*T+_*v;const R=Math.sqrt(S*S+A*A+C*C)||1;S/=R,A/=R,C/=R,r.x=S,r.y=A,r.z=C}function Ku(n,t,e,i){if(n>=Fi&&t>=Ci[n-1])return n;let s=Math.min(n,Fi-1);for(;s>0&&Ci[s-1]>t;)Ci[s]=Ci[s-1],hr[s]=hr[s-1],ur[s]=ur[s-1],s--;return Ci[s]=t,hr[s]=e,ur[s]=i,Math.min(n+1,Fi)}function $u(n,t,e,i,s,r,a,o,c,l,h){h.hits=0,h.totalDamage=0,h.headshots=0,h.kills=0,h.largeKill=!1,h.anyHeadshot=!1;const u=Math.max(1,t.pellets),f=t.penetration+1;for(let p=0;p<u;p++){Zu(r,a,o,c,n.rng,oe);let g=t.range,_=!1;n.collision.raycast(e,i,s,oe.x,oe.y,oe.z,t.range,Ji)&&(g=Ji.t,_=!0);let m=0;for(let T=0;T<n.targetCount;T++){const v=n.targets[T];if(!v.alive)continue;const S=v.x-e,A=v.y-i,C=v.z-s,R=S*oe.x+A*oe.y+C*oe.z,D=v.boundingRadius;R<-D||R>g+D||S*S+A*A+C*C-R*R>D*D||Uu(v.shapes,v.x,v.y,v.z,v.yaw,e,i,s,oe.x,oe.y,oe.z,g,Ur,v.partDetached)&&(m=Ku(m,Ur.t,T,Ur.shapeIndex))}const d=Math.min(m,f);for(let T=0;T<d;T++){const v=n.targets[hr[T]],S=Ci[T],A=zu(S,t.falloffStart,t.range,t.falloffFloor),C=T===0?1:Math.pow(t.penetrationFalloff,T),R=ur[T],E=(v.shapes[R]?.part??"torso")==="head"?t.headshotMultiplier:1;if(Bu(v,R,t.damage*l*A*C*E,Ge),Ge.applied<=0)continue;h.hits++,h.totalDamage+=Ge.applied,Ge.headshot&&(h.headshots++,h.anyHeadshot=!0);const M=e+oe.x*S,w=i+oe.y*S,N=s+oe.z*S,k=n.events.emit(re.TargetHit,M,w,N);if(k!==null&&(k.nx=oe.x,k.ny=oe.y,k.nz=oe.z,k.amount=Ge.applied,k.entityId=v.id,k.partIndex=R,k.flags=(Ge.headshot?Da:0)|(Ge.killed?Kc:0)|(v.large?_r:0)|(T>0?Hu:0)),Ge.detachedShapeIndex>=0){const G=n.events.emit(re.PartDetached,M,w,N);G!==null&&(G.entityId=v.id,G.partIndex=Ge.detachedShapeIndex,G.nx=oe.x,G.ny=oe.y,G.nz=oe.z)}if(Ge.killed){h.kills++,v.large&&(h.largeKill=!0);const G=n.events.emit(re.TargetKilled,v.x,v.y,v.z);G!==null&&(G.entityId=v.id,G.partIndex=R,G.flags=(Ge.headshot?Da:0)|(v.large?_r:0))}}if(_&&d<f){const T=n.events.emit(re.ImpactWorld,e+oe.x*g,i+oe.y*g,s+oe.z*g);T!==null&&(T.nx=Ji.nx,T.ny=Ji.ny,T.nz=Ji.nz,T.amount=g)}}}const ju=.34,Ju=1.75,Qu=40,td=.5;class ed{cellSize;originX;originZ;cols;rows;passable;floorY;constructor(t,e,i=ju,s=Ju){this.cellSize=e;const r=t.bounds;this.originX=r.minX,this.originZ=r.minZ,this.cols=Math.max(1,Math.ceil((r.maxX-r.minX)/e)),this.rows=Math.max(1,Math.ceil((r.maxZ-r.minZ)/e));const a=this.cols*this.rows;this.passable=new Uint8Array(a),this.floorY=new Float32Array(a);for(let o=0;o<this.rows;o++)for(let c=0;c<this.cols;c++){const l=o*this.cols+c,h=this.worldX(c),u=this.worldZ(o),f=t.groundHeightAt(h,u,r.maxY+Qu);if(this.floorY[l]=f,!Number.isFinite(f)){this.passable[l]=0;continue}this.passable[l]=t.isCapsuleClear(h,f,u,i,s)?1:0}}worldX(t){return this.originX+(t+.5)*this.cellSize}worldZ(t){return this.originZ+(t+.5)*this.cellSize}colOf(t){return Math.floor((t-this.originX)/this.cellSize)}rowOf(t){return Math.floor((t-this.originZ)/this.cellSize)}inBounds(t,e){return t>=0&&t<this.cols&&e>=0&&e<this.rows}index(t,e){return e*this.cols+t}isPassable(t,e){return this.inBounds(t,e)?this.passable[this.index(t,e)]===1:!1}isPassableAtWorld(t,e){return this.isPassable(this.colOf(t),this.rowOf(e))}floorAtWorld(t,e){const i=this.colOf(t),s=this.rowOf(e);return this.inBounds(i,s)?this.floorY[this.index(i,s)]:-1/0}connected(t,e){return this.passable[e]!==1?!1:Math.abs(this.floorY[e]-this.floorY[t])<=td}nearestPassableIndex(t,e,i=8){const s=this.colOf(t),r=this.rowOf(e);if(this.isPassable(s,r))return this.index(s,r);for(let a=1;a<=i;a++)for(let o=-a;o<=a;o++)for(let c=-a;c<=a;c++){if(Math.abs(o)!==a&&Math.abs(c)!==a)continue;const l=s+c,h=r+o;if(this.isPassable(l,h))return this.index(l,h)}return-1}countPassable(){let t=0;for(let e=0;e<this.passable.length;e++)t+=this.passable[e];return t}}const nl=6,ps=10,ms=14,Fr=ms+1,Sn=2147483647,nd=3,Qi=[1,-1,0,0,1,1,-1,-1],Nr=[0,0,1,-1,1,-1,1,-1],id=[ps,ps,ps,ps,ms,ms,ms,ms];class sd{grid;distance;dirX;dirZ;goalIndex=-1;sinceRebuild=nl;buckets=[];visited;constructor(t){this.grid=t;const e=t.cols*t.rows;this.distance=new Int32Array(e),this.dirX=new Float32Array(e),this.dirZ=new Float32Array(e),this.visited=new Uint8Array(e);for(let i=0;i<Fr;i++)this.buckets.push([]);this.distance.fill(Sn)}update(t,e,i=!1){return this.sinceRebuild++,!i&&this.sinceRebuild<nl?!1:(this.sinceRebuild=0,this.rebuild(t,e),!0)}rebuild(t,e){const i=this.grid,s=i.nearestPassableIndex(t,e);this.goalIndex=s,this.distance.fill(Sn),this.visited.fill(0);for(const o of this.buckets)o.length=0;if(s<0){this.dirX.fill(0),this.dirZ.fill(0);return}this.distance[s]=0,this.buckets[0].push(s);let r=1,a=0;for(;r>0;){const o=this.buckets[a%Fr];if(o.length===0){a++;continue}const c=o.pop();if(r--,this.visited[c]===1||this.distance[c]!==a)continue;this.visited[c]=1;const l=c%i.cols,h=(c-l)/i.cols;for(let u=0;u<Qi.length;u++){const f=l+Qi[u],p=h+Nr[u];if(!i.inBounds(f,p))continue;const g=i.index(f,p);if(this.visited[g]===1||!i.connected(c,g))continue;if(u>=4){const m=i.index(f,h),d=i.index(l,p);if(!i.connected(c,m)||!i.connected(c,d))continue}const _=a+id[u];_>=this.distance[g]||(this.distance[g]=_,this.buckets[_%Fr].push(g),r++)}}this.buildDirections()}buildDirections(){const t=this.grid;for(let e=0;e<t.rows;e++)for(let i=0;i<t.cols;i++){const s=t.index(i,e);if(this.dirX[s]=0,this.dirZ[s]=0,this.distance[s]===Sn)continue;let r=this.distance[s],a=0,o=0;for(let l=0;l<Qi.length;l++){const h=i+Qi[l],u=e+Nr[l];if(!t.inBounds(h,u))continue;const f=t.index(h,u),p=this.distance[f];p>=r||t.connected(s,f)&&(r=p,a=Qi[l],o=Nr[l])}if(a===0&&o===0)continue;const c=Math.sqrt(a*a+o*o);this.dirX[s]=a/c,this.dirZ[s]=o/c}}sample(t,e,i){const s=this.grid,r=s.colOf(t),a=s.rowOf(e);if(!s.inBounds(r,a))return i.x=0,i.z=0,!1;const o=s.index(r,a);return this.distance[o]===Sn?this.sampleEscape(t,e,i):(i.x=this.dirX[o],i.z=this.dirZ[o],i.x===0&&i.z===0?this.sampleEscape(t,e,i):!0)}sampleEscape(t,e,i){const s=this.grid,r=s.colOf(t),a=s.rowOf(e);let o=Sn,c=-1,l=-1;for(let p=1;p<=nd;p++){for(let g=-p;g<=p;g++)for(let _=-p;_<=p;_++){if(Math.abs(g)!==p&&Math.abs(_)!==p)continue;const m=r+_,d=a+g;if(!s.inBounds(m,d))continue;const T=this.distance[s.index(m,d)];T>=o||(o=T,c=m,l=d)}if(c>=0)break}if(c<0)return i.x=0,i.z=0,!1;const h=s.worldX(c)-t,u=s.worldZ(l)-e,f=Math.sqrt(h*h+u*u);return f<1e-6?(i.x=0,i.z=0,!1):(i.x=h/f,i.z=u/f,!0)}costAt(t,e){const i=this.grid,s=i.colOf(t),r=i.rowOf(e);return i.inBounds(s,r)?this.distance[i.index(s,r)]:Sn}isReachable(t,e){return this.costAt(t,e)!==Sn}worldDistanceAt(t,e){const i=this.costAt(t,e);return i===Sn?1/0:i/ps*this.grid.cellSize}}const rd=2;class ad{cellSize;buckets=new Map;constructor(t=rd){this.cellSize=t}key(t,e){return t<<16^e&65535}clear(){for(const t of this.buckets.values())t.length=0}insert(t,e,i){const s=Math.floor(e/this.cellSize),r=Math.floor(i/this.cellSize),a=this.key(s,r);let o=this.buckets.get(a);o===void 0&&(o=[],this.buckets.set(a,o)),o.push(t)}query(t,e,i,s){const r=Math.floor((t-i)/this.cellSize),a=Math.floor((t+i)/this.cellSize),o=Math.floor((e-i)/this.cellSize),c=Math.floor((e+i)/this.cellSize);let l=0;for(let h=o;h<=c;h++)for(let u=r;u<=a;u++){const f=this.buckets.get(this.key(u,h));if(f!==void 0)for(let p=0;p<f.length;p++)s[l++]=f[p]}return l}}const il=.35,Or=1;function od(n,t,e,i,s){s.x=0,s.z=0,s.neighbours=0;const r=n[t],a=r.radius+il*2+1,o=e.query(r.x,r.z,a,i);for(let l=0;l<o;l++){const h=i[l];if(h===t)continue;const u=n[h];if(u===void 0||!u.alive)continue;const f=r.x-u.x,p=r.z-u.z,g=f*f+p*p,_=r.radius+u.radius+il;if(g>=_*_)continue;const m=Math.sqrt(g);if(m<1e-5){const S=h>t?1:-1;s.x+=S*.5,s.z+=S*.5,s.neighbours++;continue}const d=(_-m)/_,T=u.mass/(r.mass+u.mass),v=d*T*2;s.x+=f/m*v,s.z+=p/m*v,s.neighbours++}const c=Math.sqrt(s.x*s.x+s.z*s.z);c>Or&&(s.x=s.x/c*Or,s.z=s.z/c*Or)}function ld(){return{x:0,z:0,neighbours:0}}class cd{items;count=0;exhaustedCount=0;resetFn;constructor(t,e,i){this.items=new Array(t);for(let s=0;s<t;s++)this.items[s]=e();this.resetFn=i}get capacity(){return this.items.length}get free(){return this.items.length-this.count}acquire(){if(this.count>=this.items.length)return this.exhaustedCount++,null;const t=this.items[this.count++];return this.resetFn?.(t),t}acquireRecycling(){const t=this.acquire();if(t!==null)return t;const e=this.items[0];return this.resetFn?.(e),e}releaseAt(t){if(t<0||t>=this.count)return;const e=this.count-1;if(t!==e){const i=this.items[t];this.items[t]=this.items[e],this.items[e]=i}this.count--}clear(){this.count=0}}function hd(n,t){n.shapes=t,n.partHealth=new Float32Array(t.length),n.partDetached=new Uint8Array(t.length),n.boundingRadius=Fu(t),n.height=Nu(t)}function ud(n,t){n.alive=!0,n.health=t,n.maxHealth=t,n.staggerDamage=0;for(let e=0;e<n.shapes.length;e++){const i=n.shapes[e].healthFraction;n.partHealth[e]=i===null?1/0:t*i,n.partDetached[e]=0}}function sl(n,t){for(let e=0;e<n.shapes.length;e++)if(n.shapes[e].part===t&&n.partDetached[e]===0)return!0;return!1}function dd(n){let t=0;for(let e=0;e<n.shapes.length;e++){const i=n.shapes[e].part;(i==="legL"||i==="legR")&&n.partDetached[e]===1&&t++}return t}function fd(n){return sl(n,"armL")||sl(n,"armR")}const rl={id:"husker",name:"Husker",class:"trash",behavior:"basic",baseHealth:60,bodyHeight:1.8,girth:1,radius:.34,mass:1,walkSpeed:2.2,turnRate:3.2,oneLegSpeedScale:.6,noLegSpeedScale:.28,attackDamage:9,attackRange:1.5,attackWindup:.42,attackRecovery:.5,attackArc:.6,staggerThreshold:.35,staggerWindow:.5,staggerDuration:.7,decapitates:!0,sightRange:42,hearingRange:18,killReward:12,xpValue:10,charge:null},al={id:"skitter",name:"Skitter",class:"trash",behavior:"swarmer",baseHealth:26,bodyHeight:1.05,girth:.8,radius:.26,mass:.6,walkSpeed:5.4,turnRate:6.5,oneLegSpeedScale:.5,noLegSpeedScale:.2,attackDamage:5,attackRange:1.2,attackWindup:.22,attackRecovery:.3,attackArc:.7,staggerThreshold:.5,staggerWindow:.4,staggerDuration:.4,decapitates:!0,sightRange:36,hearingRange:22,killReward:9,xpValue:7,charge:null},ol={id:"ripper",name:"Ripper",class:"special",behavior:"charger",baseHealth:130,bodyHeight:1.9,girth:1.1,radius:.38,mass:1.6,walkSpeed:2.8,turnRate:3.6,oneLegSpeedScale:.55,noLegSpeedScale:.25,attackDamage:22,attackRange:2.1,attackWindup:.35,attackRecovery:.65,attackArc:1.1,staggerThreshold:.3,staggerWindow:.5,staggerDuration:.8,decapitates:!0,sightRange:45,hearingRange:20,killReward:28,xpValue:24,charge:{triggerRange:16,chargeSpeed:8.4,windup:.45,duration:1.6,cleaveArc:1.1,cooldown:3.2}},pd={[rl.id]:rl,[al.id]:al,[ol.id]:ol},ll={capacity:160,corpseLinger:6};function La(n){return pd[n]}function md(n){return n.class==="large"||n.class==="boss"}const gd=1.8,ci={head:1.8,torso:1,arm:.75,leg:.8},ts={head:.35,arm:.25,leg:.3},he={legCenterY:.25,legHalfHeight:.178,legRadius:.085,legOffsetX:.075,torsoCenterY:.639,torsoHalfHeight:.122,torsoRadius:.122,armCenterY:.667,armHalfHeight:.156,armRadius:.05,armOffsetX:.178,headCenterY:.9,headRadius:.083};function _d(n,t=1){const e=n,i=t;return[{part:"head",ox:0,oy:he.headCenterY*e,oz:0,radius:he.headRadius*e*i,halfHeight:0,damageMultiplier:ci.head,healthFraction:ts.head},{part:"torso",ox:0,oy:he.torsoCenterY*e,oz:0,radius:he.torsoRadius*e*i,halfHeight:he.torsoHalfHeight*e,damageMultiplier:ci.torso,healthFraction:null},{part:"armL",ox:-.178*e*i,oy:he.armCenterY*e,oz:0,radius:he.armRadius*e*i,halfHeight:he.armHalfHeight*e,damageMultiplier:ci.arm,healthFraction:ts.arm},{part:"armR",ox:he.armOffsetX*e*i,oy:he.armCenterY*e,oz:0,radius:he.armRadius*e*i,halfHeight:he.armHalfHeight*e,damageMultiplier:ci.arm,healthFraction:ts.arm},{part:"legL",ox:-.075*e*i,oy:he.legCenterY*e,oz:0,radius:he.legRadius*e*i,halfHeight:he.legHalfHeight*e,damageMultiplier:ci.leg,healthFraction:ts.leg},{part:"legR",ox:he.legOffsetX*e*i,oy:he.legCenterY*e,oz:0,radius:he.legRadius*e*i,halfHeight:he.legHalfHeight*e,damageMultiplier:ci.leg,healthFraction:ts.leg}]}function vd(){return{id:-1,defId:"husker",alive:!1,x:0,y:0,z:0,yaw:0,health:0,maxHealth:0,shapes:[],partHealth:new Float32Array(0),partDetached:new Uint8Array(0),boundingRadius:0,height:0,large:!1,staggerDamage:0,radius:.34,mass:1,state:"idle",stateTime:0,stateTimer:0,vx:0,vz:0,vy:0,grounded:!1,speed:0,desiredYaw:0,attackCooldown:0,attackLanded:!1,chargeCooldown:0,staggerWindowTimer:0,staggerCount:0,spawnWave:0,aliveTime:0,rewarded:!1}}const cl=new Map;function xd(n){const t=cl.get(n.id);if(t!==void 0)return t;const e=_d(n.bodyHeight,n.girth);return cl.set(n.id,e),e}function Sd(n,t,e,i,s,r,a,o,c){n.id=e,n.defId=t.id;const l=xd(t);n.shapes!==l&&hd(n,l),ud(n,o),n.x=i,n.y=s,n.z=r,n.yaw=a,n.desiredYaw=a,n.radius=t.radius,n.mass=t.mass,n.large=md(t),n.state="seek",n.stateTime=0,n.stateTimer=0,n.vx=0,n.vz=0,n.vy=0,n.grounded=!1,n.speed=0,n.attackCooldown=0,n.attackLanded=!1,n.chargeCooldown=0,n.staggerWindowTimer=0,n.staggerCount=0,n.spawnWave=c,n.aliveTime=0,n.rewarded=!1}function hl(n,t,e){const i=dd(n);return i>=2?e*t.noLegSpeedScale:i===1?e*t.oneLegSpeedScale:e}function Md(n){return La(n.defId)}function yd(n){return new cd(n,vd)}function Ed(n){return sn(1+Ko.perWave*(n-1),1,Ko.cap)}function Td(n,t,e){return n*Ed(t)*bo[e].zedHealth*Wc.zedHealth}function bd(n,t){return n*bo[t].zedDamage*Wc.zedDamage}function ul(n,t){return n*bo[t].zedSpeed}const wd=22,Ps=1.4,Ad=.85,$c=.6,Rd=.45,Cd=.12,Br={x:0,z:0},es=ld(),Ia=Xc(),zn=Ke(),kn=Ke();function wo(n,t){const e=t.playerX-n.x,i=t.playerZ-n.z;return Math.sqrt(e*e+i*i)}function dl(n,t,e){if(wo(n,t)>e)return!1;const i=n.y+n.height*Ad;return t.collision.hasLineOfSight(n.x,i,n.z,t.playerX,t.playerY+1.2,t.playerZ)}function je(n,t,e=0){n.state=t,n.stateTime=0,n.stateTimer=e}function Pd(n,t,e){zn.x=n.x,zn.y=n.y,zn.z=n.z,kn.x=n.vx,kn.y=n.vy-Ue.gravity*e,kn.z=n.vz,Yc(t.collision,zn,kn,n.radius,n.height,Rd,Cd,n.grounded,e,Ia),n.x=zn.x,n.y=zn.y,n.z=zn.z,n.vx=kn.x,n.vy=kn.y,n.vz=kn.z,n.grounded=Ia.grounded,n.speed=Math.sqrt(n.vx*n.vx+n.vz*n.vz)}function hi(n,t,e,i,s){const r=t*i,a=e*i,o=r-n.vx,c=a-n.vz,l=Math.sqrt(o*o+c*c),h=wd*s;l<=h||l<1e-6?(n.vx=r,n.vz=a):(n.vx+=o/l*h,n.vz+=c/l*h),(t!==0||e!==0)&&(n.desiredYaw=Math.atan2(-t,-e))}function Dd(n,t,e){const i=kc(n.yaw,n.desiredYaw);n.yaw=zc(n.yaw+Bc(0,i,t.turnRate*e))}function fl(n,t,e,i){const s=t.field.sample(n.x,n.z,Br);od(t.agents,e,t.hash,t.scratch,es);let r=Br.x+es.x*Ps,a=Br.z+es.z*Ps;const o=wo(n,t);if(o<3){const l=(t.playerX-n.x)/(o||1),h=(t.playerZ-n.z)/(o||1);r=l+es.x*Ps*.5,a=h+es.z*Ps*.5}const c=Math.sqrt(r*r+a*a);return c<1e-6?(i.x=0,i.z=0,!1):(i.x=r/c,i.z=a/c,s||o<3)}function Ld(n,t,e){if(n.attackLanded||!e.playerAlive)return;n.attackLanded=!0;const i=e.playerX-n.x,s=e.playerZ-n.z,r=Math.sqrt(i*i+s*s);if(r>t.attackRange+$c)return;const a=Math.atan2(-i,-s);if(Math.abs(kc(n.yaw,a))>t.attackArc||!fd(n))return;e.pendingDamage+=bd(t.attackDamage,e.difficulty);const o=r>1e-5?1/r:0;e.pendingDamageDirX=-i*o,e.pendingDamageDirZ=-s*o}const ui={x:0,z:0};function Id(n,t,e,i,s){if(!n.alive){n.state!=="dead"&&je(n,"dead");return}n.aliveTime+=s,n.stateTime+=s,n.attackCooldown>0&&(n.attackCooldown-=s),n.chargeCooldown>0&&(n.chargeCooldown-=s),n.staggerWindowTimer-=s,n.staggerWindowTimer<=0&&(n.staggerDamage=0,n.staggerWindowTimer=t.staggerWindow),n.state!=="stagger"&&n.staggerDamage>=n.maxHealth*t.staggerThreshold&&(n.staggerDamage=0,n.vx=0,n.vz=0,n.staggerCount++,je(n,"stagger",t.staggerDuration));const r=hl(n,t,ul(t.walkSpeed,e.difficulty)),a=wo(n,e);switch(n.state){case"stagger":{n.stateTimer-=s,hi(n,0,0,0,s),n.stateTimer<=0&&je(n,"seek");break}case"attack":{n.stateTimer-=s,hi(n,0,0,0,s);const o=e.playerX-n.x,c=e.playerZ-n.z;(o!==0||c!==0)&&(n.desiredYaw=Math.atan2(-o,-c)),!n.attackLanded&&n.stateTime>=t.attackWindup&&Ld(n,t,e),n.stateTimer<=0&&(n.attackCooldown=t.attackRecovery,je(n,"seek"));break}case"charge":{const o=t.charge;if(o===null){je(n,"seek");break}if(n.stateTimer-=s,n.stateTime<o.windup){hi(n,0,0,0,s);const c=e.playerX-n.x,l=e.playerZ-n.z;(c!==0||l!==0)&&(n.desiredYaw=Math.atan2(-c,-l))}else fl(n,e,i,ui),hi(n,ui.x,ui.z,hl(n,t,ul(o.chargeSpeed,e.difficulty)),s);(a<=t.attackRange||n.stateTimer<=0||Ia.hitWall&&n.stateTime>o.windup)&&(n.chargeCooldown=o.cooldown,a<=t.attackRange+$c&&n.attackCooldown<=0?(n.attackLanded=!1,je(n,"attack",t.attackWindup+t.attackRecovery)):je(n,"seek"));break}case"idle":{hi(n,0,0,0,s),(a<=t.hearingRange||dl(n,e,t.sightRange))&&je(n,"seek");break}case"seek":default:{if(a<=t.attackRange&&n.attackCooldown<=0&&e.playerAlive){n.attackLanded=!1,je(n,"attack",t.attackWindup+t.attackRecovery);break}const o=t.charge;if(o!==null&&n.chargeCooldown<=0&&a<=o.triggerRange&&a>t.attackRange&&dl(n,e,o.triggerRange)){je(n,"charge",o.windup+o.duration);break}fl(n,e,i,ui),hi(n,ui.x,ui.z,r,s);break}}Dd(n,t,s),Pd(n,e,s)}function Ud(n,t,e,i,s){return{collision:n,field:t,playerX:0,playerY:0,playerZ:0,playerAlive:!0,agents:[],agentCount:0,hash:e,scratch:[],difficulty:s,rng:i,pendingDamage:0,pendingDamageDirX:0,pendingDamageDirZ:0}}function Fd(){return{healthLost:0,armorLost:0,killed:!1,applied:!1}}function Nd(n,t,e){if(e.healthLost=0,e.armorLost=0,e.killed=!1,e.applied=!1,!n.alive||t<=0||n.invulnerability>0)return;e.applied=!0;let i=t;if(n.armor>0){const s=Math.min(t*ei.armorAbsorb,n.armor/ei.armorDrainPerDamage);n.armor=Math.max(0,n.armor-s*ei.armorDrainPerDamage),e.armorLost=s,i-=s}n.health-=i,e.healthLost=i,n.timeSinceDamage=0,n.health<=0&&(n.health=0,n.alive=!1,e.killed=!0)}const Od=4,Bd=.55,zd=15,kd=.5;function Hd(){return{wave:0,remainingToSpawn:0,maxAlive:0,spawnTimer:0,intermission:1,fullySpawned:!1}}function Vd(n){return 6+n*4}function Gd(n){return Math.min(40,8+n*2)}function Wd(n,t){if(n<=1)return"husker";if(n<=3)return t.chance(.3)?"skitter":"husker";if(n<=5)return t.chance(.35)?"skitter":t.chance(.2)?"ripper":"husker";const e=t.next();return e<.3?"skitter":e<.5?"ripper":"husker"}function Xd(n,t){n.wave=t,n.remainingToSpawn=Vd(t),n.maxAlive=Gd(t),n.spawnTimer=0,n.intermission=0,n.fullySpawned=!1}const zr=Ke();function Yd(n,t,e,i,s){const r=n.zedSpawns;if(r.length===0)return null;To(zr,i);let a=null,o=-1;const c=[];for(const l of r){const h=l.x-t,u=l.z-e,f=Math.sqrt(h*h+u*u);f>o&&(o=f,a={x:l.x,z:l.z}),!(f<zd||(f>0?(h*zr.x+u*zr.z)/f:1)>kd)&&c.push({x:l.x,z:l.z})}return c.length>0?s.pick(c)??null:a}function qd(n,t,e){let i=!1,s=!1;return n.intermission>0?(n.intermission-=e,n.intermission<=0&&(Xd(n,n.wave+1),i=!0),{spawn:!1,waveStarted:i,waveCleared:s}):n.remainingToSpawn<=0?(n.fullySpawned=!0,t===0&&(n.intermission=Od,s=!0),{spawn:!1,waveStarted:i,waveCleared:s}):t>=n.maxAlive?{spawn:!1,waveStarted:i,waveCleared:s}:(n.spawnTimer-=e,n.spawnTimer>0?{spawn:!1,waveStarted:i,waveCleared:s}:(n.spawnTimer=Bd,n.remainingToSpawn--,{spawn:!0,waveStarted:i,waveCleared:s}))}const pl=4;class Zd{rng;map;collision;player;events=new Xu;difficulty;navGrid;flowField;zeds;hash=new ad;zedContext;nextZedId=1;targets=[];targetCount=0;currentWave=1;kills=0;waveState=Hd();godMode=!1;time=0;stepCount=0;lastShot=qu();weaponResult=_u();intent={fire:!1,reload:!1};aimDir=Ke();ballistics;playerDamage=Fd();constructor(t){this.rng=new ri(t.seed),this.map=t.map,this.difficulty=t.difficulty??"normal",this.collision=new Jh(Qh(t.map)),this.player=wu(),this.navGrid=new ed(this.collision,t.map.navCellSize),this.flowField=new sd(this.navGrid),this.zeds=yd(ll.capacity),this.targets=this.zeds.items,this.zedContext=Ud(this.collision,this.flowField,this.hash,this.rng,this.difficulty);const e=t.map.playerStart;tl(this.player,e.x,e.y,e.z,e.yaw);const i=this.collision.groundHeightAt(e.x,e.z,e.y+pl);Number.isFinite(i)&&(this.player.pos.y=i);const s=Ui($o);s&&Qo(this.player.inventory,s),this.ballistics={collision:this.collision,targets:this.targets,targetCount:0,rng:this.rng,events:this.events}}step(t,e){this.events.clear(),Pu(this.player,t,this.collision,e),cu(this.player.recoil,e),this.updateWeapons(t,e),this.updateZeds(e),this.updateWaves(e),this.time+=e,this.stepCount++}updateWaves(t){const e=this.aliveZedCount,i=qd(this.waveState,e,t);if(i.waveStarted&&(this.currentWave=this.waveState.wave),i.waveCleared)for(const a of this.player.inventory.weapons){const o=Ui(a.defId);o&&(a.reserve=o.maxReserve)}if(!i.spawn)return;const s=Yd(this.map,this.player.pos.x,this.player.pos.z,this.player.yaw,this.rng);if(s===null)return;const r=Wd(this.waveState.wave,this.rng);this.spawnZedAt(r,s.x+this.rng.range(-1.5,1.5),s.z+this.rng.range(-1.5,1.5),this.rng.range(-Math.PI,Math.PI))}killAllZeds(){for(let t=0;t<this.zeds.count;t++){const e=this.zeds.items[t];e.alive&&(e.alive=!1,e.health=0)}}skipWave(){this.killAllZeds(),this.waveState.remainingToSpawn=0,this.waveState.fullySpawned=!0}restart(){this.zeds.clear(),this.targetCount=0,this.kills=0,this.currentWave=1,this.nextZedId=1;const t=this.waveState;t.wave=0,t.remainingToSpawn=0,t.maxAlive=0,t.spawnTimer=0,t.intermission=1,t.fullySpawned=!1;const e=this.map.playerStart;tl(this.player,e.x,e.y,e.z,e.yaw);const i=this.collision.groundHeightAt(e.x,e.z,e.y+pl);Number.isFinite(i)&&(this.player.pos.y=i),this.player.health=ei.maxHealth,this.player.armor=0,this.player.inventory.weapons.length=0,this.player.inventory.activeSlot=-1,this.player.inventory.pendingSlot=-1,this.player.inventory.holsterTimer=0,this.player.inventory.totalWeight=0;const s=Ui($o);s&&Qo(this.player.inventory,s)}spawnZedAt(t,e,i,s=0,r=this.currentWave){const a=La(t);if(a===void 0)return null;const o=this.zeds.acquire();if(o===null)return null;const c=this.navGrid.floorAtWorld(e,i),l=Number.isFinite(c)?c:0,h=Td(a.baseHealth,r,this.difficulty);return Sd(o,a,this.nextZedId++,e,l,i,s,h,r),o}get aliveZedCount(){let t=0;for(let e=0;e<this.zeds.count;e++)this.zeds.items[e].alive&&t++;return t}updateZeds(t){const e=this.zedContext;this.flowField.update(this.player.pos.x,this.player.pos.z),this.hash.clear();for(let i=0;i<this.zeds.count;i++){const s=this.zeds.items[i];s.alive&&this.hash.insert(i,s.x,s.z)}e.playerX=this.player.pos.x,e.playerY=this.player.pos.y,e.playerZ=this.player.pos.z,e.playerAlive=this.player.alive,e.agents=this.zeds.items,e.agentCount=this.zeds.count,e.pendingDamage=0,e.pendingDamageDirX=0,e.pendingDamageDirZ=0;for(let i=0;i<this.zeds.count;i++){const s=this.zeds.items[i],r=La(s.defId);r!==void 0&&(s.alive?Id(s,r,e,i,t):s.rewarded||this.creditKill(s))}e.pendingDamage>0&&this.applyPlayerDamage(e),this.reclaimBodies(t),this.targetCount=this.zeds.count}creditKill(t){t.rewarded=!0,t.state="dead",this.kills++}applyPlayerDamage(t){if(this.godMode||(Nd(this.player,t.pendingDamage,this.playerDamage),!this.playerDamage.applied))return;const e=this.events.emit(re.PlayerHurt,this.player.pos.x,this.player.pos.y,this.player.pos.z);e!==null&&(e.amount=this.playerDamage.healthLost,e.nx=t.pendingDamageDirX,e.nz=t.pendingDamageDirZ),this.playerDamage.killed&&this.events.emit(re.PlayerDied,this.player.pos.x,this.player.pos.y,this.player.pos.z)}reclaimBodies(t){for(let e=this.zeds.count-1;e>=0;e--){const i=this.zeds.items[e];if(!i.alive){if(i.aliveTime+=t,i.stateTime>=ll.corpseLinger){this.zeds.releaseAt(e);continue}i.stateTime+=t}}}updateWeapons(t,e){const i=this.player.inventory;t.switchSlot>=0&&Zc(i,t.switchSlot);const s=bu(i,e),r=Bi(i),a=Pa(i);if(r===null||a===null)return;if(s){const u=this.events.emit(re.WeaponEquipped,this.player.pos.x,this.player.pos.y,this.player.pos.z);u!==null&&(u.key=a.id)}this.intent.fire=t.fire&&!Tu(i),this.intent.reload=t.reload;const o=this.weaponResult;xu(r,a,this.intent,hu(this.player.recoil),e,o);const c=this.player.pos.x,l=this.player.pos.y+Jn.eyeHeight,h=this.player.pos.z;if(o.startedReload){const u=this.events.emit(re.ReloadStarted,c,l,h);u!==null&&(u.key=a.id,u.amount=r.phaseTimer)}if(o.finishedReload){const u=this.events.emit(re.ReloadFinished,c,l,h);u!==null&&(u.key=a.id,u.amount=r.ammoInMagazine)}if(o.dryFired){const u=this.events.emit(re.DryFire,c,l,h);u!==null&&(u.key=a.id)}for(let u=0;u<o.shotsFired;u++)this.resolveShot(r,a,o.firstPatternIndex+u,c,l,h)}resolveShot(t,e,i,s,r,a){Hc(this.aimDir,lr(this.player),cr(this.player));const o=gu(t,e,this.player.adsProgress,this.player.speed),c=this.events.emit(re.WeaponFired,s,r,a);c!==null&&(c.key=e.id,c.nx=this.aimDir.x,c.ny=this.aimDir.y,c.nz=this.aimDir.z,c.amount=t.ammoInMagazine,t.ammoInMagazine===0&&(c.flags=Vu)),this.ballistics.targets=this.targets,this.ballistics.targetCount=this.targetCount,$u(this.ballistics,e,s,r,a,this.aimDir.x,this.aimDir.y,this.aimDir.z,o,1,this.lastShot),lu(this.player.recoil,e,i,this.rng)}}const Hn=30,Mn=6,Ds=1,jc=.35,ml=.9;function Se(n,t,e){n.push({box:t,surface:e})}function Kd(n,t,e,i,s){for(let r=0;r<s;r++){const a=jc*(r+1);Se(n,xe(t+ml*(r+.5),a*.5,e,ml,a,i),"concrete")}}function $d(){const n=[];Se(n,xe(0,-.5,0,Hn*2,1,Hn*2),"concrete");const t=Hn*2;Se(n,xe(0,Mn/2,-Hn,t,Mn,Ds),"concrete"),Se(n,xe(0,Mn/2,Hn,t,Mn,Ds),"concrete"),Se(n,xe(-Hn,Mn/2,0,Ds,Mn,t),"concrete"),Se(n,xe(Hn,Mn/2,0,Ds,Mn,t),"concrete"),Se(n,xe(0,2,0,10,4,10),"concrete"),Se(n,xe(-9.2,1.75,-16,11.5,3.5,1),"metal"),Se(n,xe(9.2,1.75,-16,11.5,3.5,1),"metal"),Kd(n,12,14,6,8);const e=jc*8;return Se(n,xe(21.6,e*.5,14,8,e,6),"metal"),Se(n,xe(-14,.6,8,2.4,1.2,2.4),"wood"),Se(n,xe(-11.5,.4,10,2,.8,2),"wood"),Se(n,xe(-16,1.2,11,2.4,2.4,2.4),"wood"),Se(n,xe(16,.2,-8,3,.4,3),"wood"),Se(n,xe(-20,1.5,-12,3,3,3),"concrete"),Se(n,xe(6,1.5,20,3,3,3),"concrete"),n}function jd(){const n=[];return[[-24,-24],[24,-24],[-24,24],[24,24]].forEach(([e,i],s)=>{for(let r=0;r<3;r++)n.push({x:e+(r-1)*2.5,y:0,z:i+r%2*2.5,cluster:s})}),n}const gl={id:"testarena",name:"Test Arena",boxes:$d(),playerStart:{x:0,y:0,z:20,yaw:0},zedSpawns:jd(),traderSpots:[{x:-22,y:0,z:0,yaw:Math.PI/2},{x:22,y:0,z:-20,yaw:-Math.PI/2},{x:0,y:0,z:25,yaw:Math.PI}],doors:[],ambientColor:2764856,fogColor:1119514,fogDensity:.012,navCellSize:1};/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ao="180",Jd=0,_l=1,Qd=2,Jc=1,tf=2,mn=3,Un=0,Ce=1,gn=2,Ln=0,Ni=1,vr=2,vl=3,xl=4,ef=5,$n=100,nf=101,sf=102,rf=103,af=104,of=200,lf=201,cf=202,hf=203,Ua=204,Fa=205,uf=206,df=207,ff=208,pf=209,mf=210,gf=211,_f=212,vf=213,xf=214,Na=0,Oa=1,Ba=2,zi=3,za=4,ka=5,Ha=6,Va=7,Qc=0,Sf=1,Mf=2,In=0,yf=1,Ef=2,Tf=3,th=4,bf=5,wf=6,Af=7,eh=300,ki=301,Hi=302,Ga=303,Wa=304,br=306,Ss=1e3,Qn=1001,Xa=1002,Oe=1003,Rf=1004,Ls=1005,tn=1006,kr=1007,ti=1008,rn=1009,nh=1010,ih=1011,Ms=1012,Ro=1013,ni=1014,en=1015,ws=1016,Co=1017,Po=1018,ys=1020,sh=35902,rh=35899,ah=1021,oh=1022,Ze=1023,Es=1026,Ts=1027,Do=1028,Lo=1029,lh=1030,Io=1031,Uo=1033,dr=33776,fr=33777,pr=33778,mr=33779,Ya=35840,qa=35841,Za=35842,Ka=35843,$a=36196,ja=37492,Ja=37496,Qa=37808,to=37809,eo=37810,no=37811,io=37812,so=37813,ro=37814,ao=37815,oo=37816,lo=37817,co=37818,ho=37819,uo=37820,fo=37821,po=36492,mo=36494,go=36495,_o=36283,vo=36284,xo=36285,So=36286,Cf=3200,Pf=3201,ch=0,Df=1,Cn="",Re="srgb",Vi="srgb-linear",xr="linear",Kt="srgb",di=7680,Sl=519,Lf=512,If=513,Uf=514,hh=515,Ff=516,Nf=517,Of=518,Bf=519,Ml=35044,zf=35048,yl="300 es",nn=2e3,Sr=2001;class Wi{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const i=this._listeners;i[t]===void 0&&(i[t]=[]),i[t].indexOf(e)===-1&&i[t].push(e)}hasEventListener(t,e){const i=this._listeners;return i===void 0?!1:i[t]!==void 0&&i[t].indexOf(e)!==-1}removeEventListener(t,e){const i=this._listeners;if(i===void 0)return;const s=i[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const i=e[t.type];if(i!==void 0){t.target=this;const s=i.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}}const _e=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Hr=Math.PI/180,Mo=180/Math.PI;function As(){const n=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,i=Math.random()*4294967295|0;return(_e[n&255]+_e[n>>8&255]+_e[n>>16&255]+_e[n>>24&255]+"-"+_e[t&255]+_e[t>>8&255]+"-"+_e[t>>16&15|64]+_e[t>>24&255]+"-"+_e[e&63|128]+_e[e>>8&255]+"-"+_e[e>>16&255]+_e[e>>24&255]+_e[i&255]+_e[i>>8&255]+_e[i>>16&255]+_e[i>>24&255]).toLowerCase()}function zt(n,t,e){return Math.max(t,Math.min(e,n))}function kf(n,t){return(n%t+t)%t}function Vr(n,t,e){return(1-e)*n+e*t}function ns(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return n/4294967295;case Uint16Array:return n/65535;case Uint8Array:return n/255;case Int32Array:return Math.max(n/2147483647,-1);case Int16Array:return Math.max(n/32767,-1);case Int8Array:return Math.max(n/127,-1);default:throw new Error("Invalid component type.")}}function Ae(n,t){switch(t.constructor){case Float32Array:return n;case Uint32Array:return Math.round(n*4294967295);case Uint16Array:return Math.round(n*65535);case Uint8Array:return Math.round(n*255);case Int32Array:return Math.round(n*2147483647);case Int16Array:return Math.round(n*32767);case Int8Array:return Math.round(n*127);default:throw new Error("Invalid component type.")}}class Wt{constructor(t=0,e=0){Wt.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,i=this.y,s=t.elements;return this.x=s[0]*e+s[3]*i+s[6],this.y=s[1]*e+s[4]*i+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(zt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(zt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y;return e*e+i*i}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const i=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*i-a*s+t.x,this.y=r*s+a*i+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Xi{constructor(t=0,e=0,i=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=i,this._w=s}static slerpFlat(t,e,i,s,r,a,o){let c=i[s+0],l=i[s+1],h=i[s+2],u=i[s+3];const f=r[a+0],p=r[a+1],g=r[a+2],_=r[a+3];if(o===0){t[e+0]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u;return}if(o===1){t[e+0]=f,t[e+1]=p,t[e+2]=g,t[e+3]=_;return}if(u!==_||c!==f||l!==p||h!==g){let m=1-o;const d=c*f+l*p+h*g+u*_,T=d>=0?1:-1,v=1-d*d;if(v>Number.EPSILON){const A=Math.sqrt(v),C=Math.atan2(A,d*T);m=Math.sin(m*C)/A,o=Math.sin(o*C)/A}const S=o*T;if(c=c*m+f*S,l=l*m+p*S,h=h*m+g*S,u=u*m+_*S,m===1-o){const A=1/Math.sqrt(c*c+l*l+h*h+u*u);c*=A,l*=A,h*=A,u*=A}}t[e]=c,t[e+1]=l,t[e+2]=h,t[e+3]=u}static multiplyQuaternionsFlat(t,e,i,s,r,a){const o=i[s],c=i[s+1],l=i[s+2],h=i[s+3],u=r[a],f=r[a+1],p=r[a+2],g=r[a+3];return t[e]=o*g+h*u+c*p-l*f,t[e+1]=c*g+h*f+l*u-o*p,t[e+2]=l*g+h*p+o*f-c*u,t[e+3]=h*g-o*u-c*f-l*p,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,i,s){return this._x=t,this._y=e,this._z=i,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const i=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,l=o(i/2),h=o(s/2),u=o(r/2),f=c(i/2),p=c(s/2),g=c(r/2);switch(a){case"XYZ":this._x=f*h*u+l*p*g,this._y=l*p*u-f*h*g,this._z=l*h*g+f*p*u,this._w=l*h*u-f*p*g;break;case"YXZ":this._x=f*h*u+l*p*g,this._y=l*p*u-f*h*g,this._z=l*h*g-f*p*u,this._w=l*h*u+f*p*g;break;case"ZXY":this._x=f*h*u-l*p*g,this._y=l*p*u+f*h*g,this._z=l*h*g+f*p*u,this._w=l*h*u-f*p*g;break;case"ZYX":this._x=f*h*u-l*p*g,this._y=l*p*u+f*h*g,this._z=l*h*g-f*p*u,this._w=l*h*u+f*p*g;break;case"YZX":this._x=f*h*u+l*p*g,this._y=l*p*u+f*h*g,this._z=l*h*g-f*p*u,this._w=l*h*u-f*p*g;break;case"XZY":this._x=f*h*u-l*p*g,this._y=l*p*u-f*h*g,this._z=l*h*g+f*p*u,this._w=l*h*u+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const i=e/2,s=Math.sin(i);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(i),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,i=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],l=e[2],h=e[6],u=e[10],f=i+o+u;if(f>0){const p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-c)*p,this._y=(r-l)*p,this._z=(a-s)*p}else if(i>o&&i>u){const p=2*Math.sqrt(1+i-o-u);this._w=(h-c)/p,this._x=.25*p,this._y=(s+a)/p,this._z=(r+l)/p}else if(o>u){const p=2*Math.sqrt(1+o-i-u);this._w=(r-l)/p,this._x=(s+a)/p,this._y=.25*p,this._z=(c+h)/p}else{const p=2*Math.sqrt(1+u-i-o);this._w=(a-s)/p,this._x=(r+l)/p,this._y=(c+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let i=t.dot(e)+1;return i<1e-8?(i=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=i):(this._x=0,this._y=-t.z,this._z=t.y,this._w=i)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=i),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(zt(this.dot(t),-1,1)))}rotateTowards(t,e){const i=this.angleTo(t);if(i===0)return this;const s=Math.min(1,e/i);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const i=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,l=e._z,h=e._w;return this._x=i*h+a*o+s*l-r*c,this._y=s*h+a*c+r*o-i*l,this._z=r*h+a*l+i*c-s*o,this._w=a*h-i*o-s*c-r*l,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const i=this._x,s=this._y,r=this._z,a=this._w;let o=a*t._w+i*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=i,this._y=s,this._z=r,this;const c=1-o*o;if(c<=Number.EPSILON){const p=1-e;return this._w=p*a+e*this._w,this._x=p*i+e*this._x,this._y=p*s+e*this._y,this._z=p*r+e*this._z,this.normalize(),this}const l=Math.sqrt(c),h=Math.atan2(l,o),u=Math.sin((1-e)*h)/l,f=Math.sin(e*h)/l;return this._w=a*u+this._w*f,this._x=i*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(t,e,i){return this.copy(t).slerp(e,i)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),i=Math.random(),s=Math.sqrt(1-i),r=Math.sqrt(i);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class F{constructor(t=0,e=0,i=0){F.prototype.isVector3=!0,this.x=t,this.y=e,this.z=i}set(t,e,i){return i===void 0&&(i=this.z),this.x=t,this.y=e,this.z=i,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(El.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(El.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*i+r[6]*s,this.y=r[1]*e+r[4]*i+r[7]*s,this.z=r[2]*e+r[5]*i+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,i=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*i+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*i+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*i+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*i+r[10]*s+r[14])*a,this}applyQuaternion(t){const e=this.x,i=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,l=2*(a*s-o*i),h=2*(o*e-r*s),u=2*(r*i-a*e);return this.x=e+c*l+a*u-o*h,this.y=i+c*h+o*l-r*u,this.z=s+c*u+r*h-a*l,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,i=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*i+r[8]*s,this.y=r[1]*e+r[5]*i+r[9]*s,this.z=r[2]*e+r[6]*i+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this.z=zt(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this.z=zt(this.z,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(zt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const i=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-i*c,this.z=i*o-s*a,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const i=t.dot(this)/e;return this.copy(t).multiplyScalar(i)}projectOnPlane(t){return Gr.copy(this).projectOnVector(t),this.sub(Gr)}reflect(t){return this.sub(Gr.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const i=this.dot(t)/e;return Math.acos(zt(i,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,i=this.y-t.y,s=this.z-t.z;return e*e+i*i+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,i){const s=Math.sin(e)*t;return this.x=s*Math.sin(i),this.y=Math.cos(e)*t,this.z=s*Math.cos(i),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,i){return this.x=t*Math.sin(e),this.y=i,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),i=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=i,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,i=Math.sqrt(1-e*e);return this.x=i*Math.cos(t),this.y=e,this.z=i*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Gr=new F,El=new Xi;class It{constructor(t,e,i,s,r,a,o,c,l){It.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,c,l)}set(t,e,i,s,r,a,o,c,l){const h=this.elements;return h[0]=t,h[1]=s,h[2]=o,h[3]=e,h[4]=r,h[5]=c,h[6]=i,h[7]=a,h[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],this}extractBasis(t,e,i){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),i.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[3],c=i[6],l=i[1],h=i[4],u=i[7],f=i[2],p=i[5],g=i[8],_=s[0],m=s[3],d=s[6],T=s[1],v=s[4],S=s[7],A=s[2],C=s[5],R=s[8];return r[0]=a*_+o*T+c*A,r[3]=a*m+o*v+c*C,r[6]=a*d+o*S+c*R,r[1]=l*_+h*T+u*A,r[4]=l*m+h*v+u*C,r[7]=l*d+h*S+u*R,r[2]=f*_+p*T+g*A,r[5]=f*m+p*v+g*C,r[8]=f*d+p*S+g*R,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8];return e*a*h-e*o*l-i*r*h+i*o*c+s*r*l-s*a*c}invert(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=h*a-o*l,f=o*c-h*r,p=l*r-a*c,g=e*u+i*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=u*_,t[1]=(s*l-h*i)*_,t[2]=(o*i-s*a)*_,t[3]=f*_,t[4]=(h*e-s*c)*_,t[5]=(s*r-o*e)*_,t[6]=p*_,t[7]=(i*c-l*e)*_,t[8]=(a*e-i*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,i,s,r,a,o){const c=Math.cos(r),l=Math.sin(r);return this.set(i*c,i*l,-i*(c*a+l*o)+a+t,-s*l,s*c,-s*(-l*a+c*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Wr.makeScale(t,e)),this}rotate(t){return this.premultiply(Wr.makeRotation(-t)),this}translate(t,e){return this.premultiply(Wr.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,i,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,i=t.elements;for(let s=0;s<9;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<9;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const Wr=new It;function uh(n){for(let t=n.length-1;t>=0;--t)if(n[t]>=65535)return!0;return!1}function Mr(n){return document.createElementNS("http://www.w3.org/1999/xhtml",n)}function Hf(){const n=Mr("canvas");return n.style.display="block",n}const Tl={};function bs(n){n in Tl||(Tl[n]=!0,console.warn(n))}function Vf(n,t,e){return new Promise(function(i,s){function r(){switch(n.clientWaitSync(t,n.SYNC_FLUSH_COMMANDS_BIT,0)){case n.WAIT_FAILED:s();break;case n.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:i()}}setTimeout(r,e)})}const bl=new It().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),wl=new It().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Gf(){const n={enabled:!0,workingColorSpace:Vi,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Kt&&(s.r=vn(s.r),s.g=vn(s.g),s.b=vn(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Kt&&(s.r=Oi(s.r),s.g=Oi(s.g),s.b=Oi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Cn?xr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return bs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),n.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return bs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),n.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],i=[.3127,.329];return n.define({[Vi]:{primaries:t,whitePoint:i,transfer:xr,toXYZ:bl,fromXYZ:wl,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:Re},outputColorSpaceConfig:{drawingBufferColorSpace:Re}},[Re]:{primaries:t,whitePoint:i,transfer:Kt,toXYZ:bl,fromXYZ:wl,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:Re}}}),n}const Gt=Gf();function vn(n){return n<.04045?n*.0773993808:Math.pow(n*.9478672986+.0521327014,2.4)}function Oi(n){return n<.0031308?n*12.92:1.055*Math.pow(n,.41666)-.055}let fi;class Wf{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let i;if(t instanceof HTMLCanvasElement)i=t;else{fi===void 0&&(fi=Mr("canvas")),fi.width=t.width,fi.height=t.height;const s=fi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),i=fi}return i.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Mr("canvas");e.width=t.width,e.height=t.height;const i=e.getContext("2d");i.drawImage(t,0,0,t.width,t.height);const s=i.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=vn(r[a]/255)*255;return i.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let i=0;i<e.length;i++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[i]=Math.floor(vn(e[i]/255)*255):e[i]=vn(e[i]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Xf=0;class Fo{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Xf++}),this.uuid=As(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const i={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Xr(s[a].image)):r.push(Xr(s[a]))}else r=Xr(s);i.url=r}return e||(t.images[this.uuid]=i),i}}function Xr(n){return typeof HTMLImageElement<"u"&&n instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&n instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&n instanceof ImageBitmap?Wf.getDataURL(n):n.data?{data:Array.from(n.data),width:n.width,height:n.height,type:n.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Yf=0;const Yr=new F;class Me extends Wi{constructor(t=Me.DEFAULT_IMAGE,e=Me.DEFAULT_MAPPING,i=Qn,s=Qn,r=tn,a=ti,o=Ze,c=rn,l=Me.DEFAULT_ANISOTROPY,h=Cn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Yf++}),this.uuid=As(),this.name="",this.source=new Fo(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=i,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Wt(0,0),this.repeat=new Wt(1,1),this.center=new Wt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new It,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Yr).x}get height(){return this.source.getSize(Yr).y}get depth(){return this.source.getSize(Yr).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const i=t[e];if(i===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}s&&i&&s.isVector2&&i.isVector2||s&&i&&s.isVector3&&i.isVector3||s&&i&&s.isMatrix3&&i.isMatrix3?s.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const i={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(i.userData=this.userData),e||(t.textures[this.uuid]=i),i}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==eh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Ss:t.x=t.x-Math.floor(t.x);break;case Qn:t.x=t.x<0?0:1;break;case Xa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Ss:t.y=t.y-Math.floor(t.y);break;case Qn:t.y=t.y<0?0:1;break;case Xa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}Me.DEFAULT_IMAGE=null;Me.DEFAULT_MAPPING=eh;Me.DEFAULT_ANISOTROPY=1;class $t{constructor(t=0,e=0,i=0,s=1){$t.prototype.isVector4=!0,this.x=t,this.y=e,this.z=i,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,i,s){return this.x=t,this.y=e,this.z=i,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,i=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*i+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*i+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*i+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*i+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,i,s,r;const c=t.elements,l=c[0],h=c[4],u=c[8],f=c[1],p=c[5],g=c[9],_=c[2],m=c[6],d=c[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(l+p+d-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const v=(l+1)/2,S=(p+1)/2,A=(d+1)/2,C=(h+f)/4,R=(u+_)/4,D=(g+m)/4;return v>S&&v>A?v<.01?(i=0,s=.707106781,r=.707106781):(i=Math.sqrt(v),s=C/i,r=R/i):S>A?S<.01?(i=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),i=C/s,r=D/s):A<.01?(i=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),i=R/r,s=D/r),this.set(i,s,r,e),this}let T=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(T)<.001&&(T=1),this.x=(m-g)/T,this.y=(u-_)/T,this.z=(f-h)/T,this.w=Math.acos((l+p+d-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=zt(this.x,t.x,e.x),this.y=zt(this.y,t.y,e.y),this.z=zt(this.z,t.z,e.z),this.w=zt(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=zt(this.x,t,e),this.y=zt(this.y,t,e),this.z=zt(this.z,t,e),this.w=zt(this.w,t,e),this}clampLength(t,e){const i=this.length();return this.divideScalar(i||1).multiplyScalar(zt(i,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,i){return this.x=t.x+(e.x-t.x)*i,this.y=t.y+(e.y-t.y)*i,this.z=t.z+(e.z-t.z)*i,this.w=t.w+(e.w-t.w)*i,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class qf extends Wi{constructor(t=1,e=1,i={}){super(),i=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:tn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},i),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=i.depth,this.scissor=new $t(0,0,t,e),this.scissorTest=!1,this.viewport=new $t(0,0,t,e);const s={width:t,height:e,depth:i.depth},r=new Me(s);this.textures=[];const a=i.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(i),this.depthBuffer=i.depthBuffer,this.stencilBuffer=i.stencilBuffer,this.resolveDepthBuffer=i.resolveDepthBuffer,this.resolveStencilBuffer=i.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=i.depthTexture,this.samples=i.samples,this.multiview=i.multiview}_setTextureOptions(t={}){const e={minFilter:tn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let i=0;i<this.textures.length;i++)this.textures[i].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,i=1){if(this.width!==t||this.height!==e||this.depth!==i){this.width=t,this.height=e,this.depth=i;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=i,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,i=t.textures.length;e<i;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new Fo(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ii extends qf{constructor(t=1,e=1,i={}){super(t,e,i),this.isWebGLRenderTarget=!0}}class dh extends Me{constructor(t=null,e=1,i=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Oe,this.minFilter=Oe,this.wrapR=Qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Zf extends Me{constructor(t=null,e=1,i=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:i,depth:s},this.magFilter=Oe,this.minFilter=Oe,this.wrapR=Qn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ai{constructor(t=new F(1/0,1/0,1/0),e=new F(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e+=3)this.expandByPoint(We.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,i=t.count;e<i;e++)this.expandByPoint(We.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,i=t.length;e<i;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const i=We.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(i),this.max.copy(t).add(i),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const i=t.geometry;if(i!==void 0){const r=i.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,We):We.fromBufferAttribute(r,a),We.applyMatrix4(t.matrixWorld),this.expandByPoint(We);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Is.copy(t.boundingBox)):(i.boundingBox===null&&i.computeBoundingBox(),Is.copy(i.boundingBox)),Is.applyMatrix4(t.matrixWorld),this.union(Is)}const s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,We),We.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,i;return t.normal.x>0?(e=t.normal.x*this.min.x,i=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,i=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,i+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,i+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,i+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,i+=t.normal.z*this.min.z),e<=-t.constant&&i>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(is),Us.subVectors(this.max,is),pi.subVectors(t.a,is),mi.subVectors(t.b,is),gi.subVectors(t.c,is),yn.subVectors(mi,pi),En.subVectors(gi,mi),Vn.subVectors(pi,gi);let e=[0,-yn.z,yn.y,0,-En.z,En.y,0,-Vn.z,Vn.y,yn.z,0,-yn.x,En.z,0,-En.x,Vn.z,0,-Vn.x,-yn.y,yn.x,0,-En.y,En.x,0,-Vn.y,Vn.x,0];return!qr(e,pi,mi,gi,Us)||(e=[1,0,0,0,1,0,0,0,1],!qr(e,pi,mi,gi,Us))?!1:(Fs.crossVectors(yn,En),e=[Fs.x,Fs.y,Fs.z],qr(e,pi,mi,gi,Us))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,We).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(We).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(cn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),cn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),cn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),cn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),cn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),cn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),cn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),cn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(cn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const cn=[new F,new F,new F,new F,new F,new F,new F,new F],We=new F,Is=new ai,pi=new F,mi=new F,gi=new F,yn=new F,En=new F,Vn=new F,is=new F,Us=new F,Fs=new F,Gn=new F;function qr(n,t,e,i,s){for(let r=0,a=n.length-3;r<=a;r+=3){Gn.fromArray(n,r);const o=s.x*Math.abs(Gn.x)+s.y*Math.abs(Gn.y)+s.z*Math.abs(Gn.z),c=t.dot(Gn),l=e.dot(Gn),h=i.dot(Gn);if(Math.max(-Math.max(c,l,h),Math.min(c,l,h))>o)return!1}return!0}const Kf=new ai,ss=new F,Zr=new F;class Yi{constructor(t=new F,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const i=this.center;e!==void 0?i.copy(e):Kf.setFromPoints(t).getCenter(i);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,i.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const i=this.center.distanceToSquared(t);return e.copy(t),i>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;ss.subVectors(t,this.center);const e=ss.lengthSq();if(e>this.radius*this.radius){const i=Math.sqrt(e),s=(i-this.radius)*.5;this.center.addScaledVector(ss,s/i),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Zr.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(ss.copy(t.center).add(Zr)),this.expandByPoint(ss.copy(t.center).sub(Zr))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}const hn=new F,Kr=new F,Ns=new F,Tn=new F,$r=new F,Os=new F,jr=new F;class fh{constructor(t=new F,e=new F(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,hn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const i=e.dot(this.direction);return i<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,i)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=hn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(hn.copy(this.origin).addScaledVector(this.direction,e),hn.distanceToSquared(t))}distanceSqToSegment(t,e,i,s){Kr.copy(t).add(e).multiplyScalar(.5),Ns.copy(e).sub(t).normalize(),Tn.copy(this.origin).sub(Kr);const r=t.distanceTo(e)*.5,a=-this.direction.dot(Ns),o=Tn.dot(this.direction),c=-Tn.dot(Ns),l=Tn.lengthSq(),h=Math.abs(1-a*a);let u,f,p,g;if(h>0)if(u=a*c-o,f=a*o-c,g=r*h,u>=0)if(f>=-g)if(f<=g){const _=1/h;u*=_,f*=_,p=u*(u+a*f+2*o)+f*(a*u+f+2*c)+l}else f=r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*c)+l;else f=-r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*c)+l;else f<=-g?(u=Math.max(0,-(-a*r+o)),f=u>0?-r:Math.min(Math.max(-r,-c),r),p=-u*u+f*(f+2*c)+l):f<=g?(u=0,f=Math.min(Math.max(-r,-c),r),p=f*(f+2*c)+l):(u=Math.max(0,-(a*r+o)),f=u>0?r:Math.min(Math.max(-r,-c),r),p=-u*u+f*(f+2*c)+l);else f=a>0?-r:r,u=Math.max(0,-(a*f+o)),p=-u*u+f*(f+2*c)+l;return i&&i.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Kr).addScaledVector(Ns,f),p}intersectSphere(t,e){hn.subVectors(t.center,this.origin);const i=hn.dot(this.direction),s=hn.dot(hn)-i*i,r=t.radius*t.radius;if(s>r)return null;const a=Math.sqrt(r-s),o=i-a,c=i+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const i=-(this.origin.dot(t.normal)+t.constant)/e;return i>=0?i:null}intersectPlane(t,e){const i=this.distanceToPlane(t);return i===null?null:this.at(i,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let i,s,r,a,o,c;const l=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return l>=0?(i=(t.min.x-f.x)*l,s=(t.max.x-f.x)*l):(i=(t.max.x-f.x)*l,s=(t.min.x-f.x)*l),h>=0?(r=(t.min.y-f.y)*h,a=(t.max.y-f.y)*h):(r=(t.max.y-f.y)*h,a=(t.min.y-f.y)*h),i>a||r>s||((r>i||isNaN(i))&&(i=r),(a<s||isNaN(s))&&(s=a),u>=0?(o=(t.min.z-f.z)*u,c=(t.max.z-f.z)*u):(o=(t.max.z-f.z)*u,c=(t.min.z-f.z)*u),i>c||o>s)||((o>i||i!==i)&&(i=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(i>=0?i:s,e)}intersectsBox(t){return this.intersectBox(t,hn)!==null}intersectTriangle(t,e,i,s,r){$r.subVectors(e,t),Os.subVectors(i,t),jr.crossVectors($r,Os);let a=this.direction.dot(jr),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Tn.subVectors(this.origin,t);const c=o*this.direction.dot(Os.crossVectors(Tn,Os));if(c<0)return null;const l=o*this.direction.dot($r.cross(Tn));if(l<0||c+l>a)return null;const h=-o*Tn.dot(jr);return h<0?null:this.at(h/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Jt{constructor(t,e,i,s,r,a,o,c,l,h,u,f,p,g,_,m){Jt.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,i,s,r,a,o,c,l,h,u,f,p,g,_,m)}set(t,e,i,s,r,a,o,c,l,h,u,f,p,g,_,m){const d=this.elements;return d[0]=t,d[4]=e,d[8]=i,d[12]=s,d[1]=r,d[5]=a,d[9]=o,d[13]=c,d[2]=l,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Jt().fromArray(this.elements)}copy(t){const e=this.elements,i=t.elements;return e[0]=i[0],e[1]=i[1],e[2]=i[2],e[3]=i[3],e[4]=i[4],e[5]=i[5],e[6]=i[6],e[7]=i[7],e[8]=i[8],e[9]=i[9],e[10]=i[10],e[11]=i[11],e[12]=i[12],e[13]=i[13],e[14]=i[14],e[15]=i[15],this}copyPosition(t){const e=this.elements,i=t.elements;return e[12]=i[12],e[13]=i[13],e[14]=i[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,i){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),i.setFromMatrixColumn(this,2),this}makeBasis(t,e,i){return this.set(t.x,e.x,i.x,0,t.y,e.y,i.y,0,t.z,e.z,i.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,i=t.elements,s=1/_i.setFromMatrixColumn(t,0).length(),r=1/_i.setFromMatrixColumn(t,1).length(),a=1/_i.setFromMatrixColumn(t,2).length();return e[0]=i[0]*s,e[1]=i[1]*s,e[2]=i[2]*s,e[3]=0,e[4]=i[4]*r,e[5]=i[5]*r,e[6]=i[6]*r,e[7]=0,e[8]=i[8]*a,e[9]=i[9]*a,e[10]=i[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,i=t.x,s=t.y,r=t.z,a=Math.cos(i),o=Math.sin(i),c=Math.cos(s),l=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(t.order==="XYZ"){const f=a*h,p=a*u,g=o*h,_=o*u;e[0]=c*h,e[4]=-c*u,e[8]=l,e[1]=p+g*l,e[5]=f-_*l,e[9]=-o*c,e[2]=_-f*l,e[6]=g+p*l,e[10]=a*c}else if(t.order==="YXZ"){const f=c*h,p=c*u,g=l*h,_=l*u;e[0]=f+_*o,e[4]=g*o-p,e[8]=a*l,e[1]=a*u,e[5]=a*h,e[9]=-o,e[2]=p*o-g,e[6]=_+f*o,e[10]=a*c}else if(t.order==="ZXY"){const f=c*h,p=c*u,g=l*h,_=l*u;e[0]=f-_*o,e[4]=-a*u,e[8]=g+p*o,e[1]=p+g*o,e[5]=a*h,e[9]=_-f*o,e[2]=-a*l,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){const f=a*h,p=a*u,g=o*h,_=o*u;e[0]=c*h,e[4]=g*l-p,e[8]=f*l+_,e[1]=c*u,e[5]=_*l+f,e[9]=p*l-g,e[2]=-l,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){const f=a*c,p=a*l,g=o*c,_=o*l;e[0]=c*h,e[4]=_-f*u,e[8]=g*u+p,e[1]=u,e[5]=a*h,e[9]=-o*h,e[2]=-l*h,e[6]=p*u+g,e[10]=f-_*u}else if(t.order==="XZY"){const f=a*c,p=a*l,g=o*c,_=o*l;e[0]=c*h,e[4]=-u,e[8]=l*h,e[1]=f*u+_,e[5]=a*h,e[9]=p*u-g,e[2]=g*u-p,e[6]=o*h,e[10]=_*u+f}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose($f,t,jf)}lookAt(t,e,i){const s=this.elements;return Le.subVectors(t,e),Le.lengthSq()===0&&(Le.z=1),Le.normalize(),bn.crossVectors(i,Le),bn.lengthSq()===0&&(Math.abs(i.z)===1?Le.x+=1e-4:Le.z+=1e-4,Le.normalize(),bn.crossVectors(i,Le)),bn.normalize(),Bs.crossVectors(Le,bn),s[0]=bn.x,s[4]=Bs.x,s[8]=Le.x,s[1]=bn.y,s[5]=Bs.y,s[9]=Le.y,s[2]=bn.z,s[6]=Bs.z,s[10]=Le.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const i=t.elements,s=e.elements,r=this.elements,a=i[0],o=i[4],c=i[8],l=i[12],h=i[1],u=i[5],f=i[9],p=i[13],g=i[2],_=i[6],m=i[10],d=i[14],T=i[3],v=i[7],S=i[11],A=i[15],C=s[0],R=s[4],D=s[8],E=s[12],M=s[1],w=s[5],N=s[9],k=s[13],G=s[2],W=s[6],H=s[10],q=s[14],V=s[3],it=s[7],ct=s[11],St=s[15];return r[0]=a*C+o*M+c*G+l*V,r[4]=a*R+o*w+c*W+l*it,r[8]=a*D+o*N+c*H+l*ct,r[12]=a*E+o*k+c*q+l*St,r[1]=h*C+u*M+f*G+p*V,r[5]=h*R+u*w+f*W+p*it,r[9]=h*D+u*N+f*H+p*ct,r[13]=h*E+u*k+f*q+p*St,r[2]=g*C+_*M+m*G+d*V,r[6]=g*R+_*w+m*W+d*it,r[10]=g*D+_*N+m*H+d*ct,r[14]=g*E+_*k+m*q+d*St,r[3]=T*C+v*M+S*G+A*V,r[7]=T*R+v*w+S*W+A*it,r[11]=T*D+v*N+S*H+A*ct,r[15]=T*E+v*k+S*q+A*St,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],i=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],l=t[13],h=t[2],u=t[6],f=t[10],p=t[14],g=t[3],_=t[7],m=t[11],d=t[15];return g*(+r*c*u-s*l*u-r*o*f+i*l*f+s*o*p-i*c*p)+_*(+e*c*p-e*l*f+r*a*f-s*a*p+s*l*h-r*c*h)+m*(+e*l*u-e*o*p-r*a*u+i*a*p+r*o*h-i*l*h)+d*(-s*o*h-e*c*u+e*o*f+s*a*u-i*a*f+i*c*h)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,i){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=i),this}invert(){const t=this.elements,e=t[0],i=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],l=t[7],h=t[8],u=t[9],f=t[10],p=t[11],g=t[12],_=t[13],m=t[14],d=t[15],T=u*m*l-_*f*l+_*c*p-o*m*p-u*c*d+o*f*d,v=g*f*l-h*m*l-g*c*p+a*m*p+h*c*d-a*f*d,S=h*_*l-g*u*l+g*o*p-a*_*p-h*o*d+a*u*d,A=g*u*c-h*_*c-g*o*f+a*_*f+h*o*m-a*u*m,C=e*T+i*v+s*S+r*A;if(C===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/C;return t[0]=T*R,t[1]=(_*f*r-u*m*r-_*s*p+i*m*p+u*s*d-i*f*d)*R,t[2]=(o*m*r-_*c*r+_*s*l-i*m*l-o*s*d+i*c*d)*R,t[3]=(u*c*r-o*f*r-u*s*l+i*f*l+o*s*p-i*c*p)*R,t[4]=v*R,t[5]=(h*m*r-g*f*r+g*s*p-e*m*p-h*s*d+e*f*d)*R,t[6]=(g*c*r-a*m*r-g*s*l+e*m*l+a*s*d-e*c*d)*R,t[7]=(a*f*r-h*c*r+h*s*l-e*f*l-a*s*p+e*c*p)*R,t[8]=S*R,t[9]=(g*u*r-h*_*r-g*i*p+e*_*p+h*i*d-e*u*d)*R,t[10]=(a*_*r-g*o*r+g*i*l-e*_*l-a*i*d+e*o*d)*R,t[11]=(h*o*r-a*u*r-h*i*l+e*u*l+a*i*p-e*o*p)*R,t[12]=A*R,t[13]=(h*_*s-g*u*s+g*i*f-e*_*f-h*i*m+e*u*m)*R,t[14]=(g*o*s-a*_*s-g*i*c+e*_*c+a*i*m-e*o*m)*R,t[15]=(a*u*s-h*o*s+h*i*c-e*u*c-a*i*f+e*o*f)*R,this}scale(t){const e=this.elements,i=t.x,s=t.y,r=t.z;return e[0]*=i,e[4]*=s,e[8]*=r,e[1]*=i,e[5]*=s,e[9]*=r,e[2]*=i,e[6]*=s,e[10]*=r,e[3]*=i,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],i=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,i,s))}makeTranslation(t,e,i){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,i,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),i=Math.sin(t);return this.set(1,0,0,0,0,e,-i,0,0,i,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,0,i,0,0,1,0,0,-i,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),i=Math.sin(t);return this.set(e,-i,0,0,i,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const i=Math.cos(e),s=Math.sin(e),r=1-i,a=t.x,o=t.y,c=t.z,l=r*a,h=r*o;return this.set(l*a+i,l*o-s*c,l*c+s*o,0,l*o+s*c,h*o+i,h*c-s*a,0,l*c-s*o,h*c+s*a,r*c*c+i,0,0,0,0,1),this}makeScale(t,e,i){return this.set(t,0,0,0,0,e,0,0,0,0,i,0,0,0,0,1),this}makeShear(t,e,i,s,r,a){return this.set(1,i,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,i){const s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,l=r+r,h=a+a,u=o+o,f=r*l,p=r*h,g=r*u,_=a*h,m=a*u,d=o*u,T=c*l,v=c*h,S=c*u,A=i.x,C=i.y,R=i.z;return s[0]=(1-(_+d))*A,s[1]=(p+S)*A,s[2]=(g-v)*A,s[3]=0,s[4]=(p-S)*C,s[5]=(1-(f+d))*C,s[6]=(m+T)*C,s[7]=0,s[8]=(g+v)*R,s[9]=(m-T)*R,s[10]=(1-(f+_))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,i){const s=this.elements;let r=_i.set(s[0],s[1],s[2]).length();const a=_i.set(s[4],s[5],s[6]).length(),o=_i.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],Xe.copy(this);const l=1/r,h=1/a,u=1/o;return Xe.elements[0]*=l,Xe.elements[1]*=l,Xe.elements[2]*=l,Xe.elements[4]*=h,Xe.elements[5]*=h,Xe.elements[6]*=h,Xe.elements[8]*=u,Xe.elements[9]*=u,Xe.elements[10]*=u,e.setFromRotationMatrix(Xe),i.x=r,i.y=a,i.z=o,this}makePerspective(t,e,i,s,r,a,o=nn,c=!1){const l=this.elements,h=2*r/(e-t),u=2*r/(i-s),f=(e+t)/(e-t),p=(i+s)/(i-s);let g,_;if(c)g=r/(a-r),_=a*r/(a-r);else if(o===nn)g=-(a+r)/(a-r),_=-2*a*r/(a-r);else if(o===Sr)g=-a/(a-r),_=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=f,l[12]=0,l[1]=0,l[5]=u,l[9]=p,l[13]=0,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(t,e,i,s,r,a,o=nn,c=!1){const l=this.elements,h=2/(e-t),u=2/(i-s),f=-(e+t)/(e-t),p=-(i+s)/(i-s);let g,_;if(c)g=1/(a-r),_=a/(a-r);else if(o===nn)g=-2/(a-r),_=-(a+r)/(a-r);else if(o===Sr)g=-1/(a-r),_=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=h,l[4]=0,l[8]=0,l[12]=f,l[1]=0,l[5]=u,l[9]=0,l[13]=p,l[2]=0,l[6]=0,l[10]=g,l[14]=_,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(t){const e=this.elements,i=t.elements;for(let s=0;s<16;s++)if(e[s]!==i[s])return!1;return!0}fromArray(t,e=0){for(let i=0;i<16;i++)this.elements[i]=t[i+e];return this}toArray(t=[],e=0){const i=this.elements;return t[e]=i[0],t[e+1]=i[1],t[e+2]=i[2],t[e+3]=i[3],t[e+4]=i[4],t[e+5]=i[5],t[e+6]=i[6],t[e+7]=i[7],t[e+8]=i[8],t[e+9]=i[9],t[e+10]=i[10],t[e+11]=i[11],t[e+12]=i[12],t[e+13]=i[13],t[e+14]=i[14],t[e+15]=i[15],t}}const _i=new F,Xe=new Jt,$f=new F(0,0,0),jf=new F(1,1,1),bn=new F,Bs=new F,Le=new F,Al=new Jt,Rl=new Xi;class an{constructor(t=0,e=0,i=0,s=an.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=i,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,i,s=this._order){return this._x=t,this._y=e,this._z=i,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,i=!0){const s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(e){case"XYZ":this._y=Math.asin(zt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(f,l),this._z=0);break;case"YXZ":this._x=Math.asin(-zt(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(o,p),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(zt(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-zt(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(zt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-h,l),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(o,p));break;case"XZY":this._z=Math.asin(-zt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(f,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,i===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,i){return Al.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Al,e,i)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Rl.setFromEuler(this),this.setFromQuaternion(Rl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}an.DEFAULT_ORDER="XYZ";class ph{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let Jf=0;const Cl=new F,vi=new Xi,un=new Jt,zs=new F,rs=new F,Qf=new F,tp=new Xi,Pl=new F(1,0,0),Dl=new F(0,1,0),Ll=new F(0,0,1),Il={type:"added"},ep={type:"removed"},xi={type:"childadded",child:null},Jr={type:"childremoved",child:null};class me extends Wi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Jf++}),this.uuid=As(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=me.DEFAULT_UP.clone();const t=new F,e=new an,i=new Xi,s=new F(1,1,1);function r(){i.setFromEuler(e,!1)}function a(){e.setFromQuaternion(i,void 0,!1)}e._onChange(r),i._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:i},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Jt},normalMatrix:{value:new It}}),this.matrix=new Jt,this.matrixWorld=new Jt,this.matrixAutoUpdate=me.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=me.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ph,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return vi.setFromAxisAngle(t,e),this.quaternion.multiply(vi),this}rotateOnWorldAxis(t,e){return vi.setFromAxisAngle(t,e),this.quaternion.premultiply(vi),this}rotateX(t){return this.rotateOnAxis(Pl,t)}rotateY(t){return this.rotateOnAxis(Dl,t)}rotateZ(t){return this.rotateOnAxis(Ll,t)}translateOnAxis(t,e){return Cl.copy(t).applyQuaternion(this.quaternion),this.position.add(Cl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Pl,t)}translateY(t){return this.translateOnAxis(Dl,t)}translateZ(t){return this.translateOnAxis(Ll,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(un.copy(this.matrixWorld).invert())}lookAt(t,e,i){t.isVector3?zs.copy(t):zs.set(t,e,i);const s=this.parent;this.updateWorldMatrix(!0,!1),rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?un.lookAt(rs,zs,this.up):un.lookAt(zs,rs,this.up),this.quaternion.setFromRotationMatrix(un),s&&(un.extractRotation(s.matrixWorld),vi.setFromRotationMatrix(un),this.quaternion.premultiply(vi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Il),xi.child=t,this.dispatchEvent(xi),xi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let i=0;i<arguments.length;i++)this.remove(arguments[i]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(ep),Jr.child=t,this.dispatchEvent(Jr),Jr.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),un.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),un.multiply(t.parent.matrixWorld)),t.applyMatrix4(un),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Il),xi.child=t,this.dispatchEvent(xi),xi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let i=0,s=this.children.length;i<s;i++){const a=this.children[i].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,i=[]){this[t]===e&&i.push(this);const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,i);return i}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rs,t,Qf),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(rs,tp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let i=0,s=e.length;i<s;i++)e[i].updateMatrixWorld(t)}updateWorldMatrix(t,e){const i=this.parent;if(t===!0&&i!==null&&i.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",i={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},i.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){const c=o.shapes;if(Array.isArray(c))for(let l=0,h=c.length;l<h;l++){const u=c[l];r(t.shapes,u)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){const c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){const o=a(t.geometries),c=a(t.materials),l=a(t.textures),h=a(t.images),u=a(t.shapes),f=a(t.skeletons),p=a(t.animations),g=a(t.nodes);o.length>0&&(i.geometries=o),c.length>0&&(i.materials=c),l.length>0&&(i.textures=l),h.length>0&&(i.images=h),u.length>0&&(i.shapes=u),f.length>0&&(i.skeletons=f),p.length>0&&(i.animations=p),g.length>0&&(i.nodes=g)}return i.object=s,i;function a(o){const c=[];for(const l in o){const h=o[l];delete h.metadata,c.push(h)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let i=0;i<t.children.length;i++){const s=t.children[i];this.add(s.clone())}return this}}me.DEFAULT_UP=new F(0,1,0);me.DEFAULT_MATRIX_AUTO_UPDATE=!0;me.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const Ye=new F,dn=new F,Qr=new F,fn=new F,Si=new F,Mi=new F,Ul=new F,ta=new F,ea=new F,na=new F,ia=new $t,sa=new $t,ra=new $t;class qe{constructor(t=new F,e=new F,i=new F){this.a=t,this.b=e,this.c=i}static getNormal(t,e,i,s){s.subVectors(i,e),Ye.subVectors(t,e),s.cross(Ye);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,i,s,r){Ye.subVectors(s,e),dn.subVectors(i,e),Qr.subVectors(t,e);const a=Ye.dot(Ye),o=Ye.dot(dn),c=Ye.dot(Qr),l=dn.dot(dn),h=dn.dot(Qr),u=a*l-o*o;if(u===0)return r.set(0,0,0),null;const f=1/u,p=(l*c-o*h)*f,g=(a*h-o*c)*f;return r.set(1-p-g,g,p)}static containsPoint(t,e,i,s){return this.getBarycoord(t,e,i,s,fn)===null?!1:fn.x>=0&&fn.y>=0&&fn.x+fn.y<=1}static getInterpolation(t,e,i,s,r,a,o,c){return this.getBarycoord(t,e,i,s,fn)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,fn.x),c.addScaledVector(a,fn.y),c.addScaledVector(o,fn.z),c)}static getInterpolatedAttribute(t,e,i,s,r,a){return ia.setScalar(0),sa.setScalar(0),ra.setScalar(0),ia.fromBufferAttribute(t,e),sa.fromBufferAttribute(t,i),ra.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(ia,r.x),a.addScaledVector(sa,r.y),a.addScaledVector(ra,r.z),a}static isFrontFacing(t,e,i,s){return Ye.subVectors(i,e),dn.subVectors(t,e),Ye.cross(dn).dot(s)<0}set(t,e,i){return this.a.copy(t),this.b.copy(e),this.c.copy(i),this}setFromPointsAndIndices(t,e,i,s){return this.a.copy(t[e]),this.b.copy(t[i]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,i,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,i),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return Ye.subVectors(this.c,this.b),dn.subVectors(this.a,this.b),Ye.cross(dn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return qe.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return qe.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,i,s,r){return qe.getInterpolation(t,this.a,this.b,this.c,e,i,s,r)}containsPoint(t){return qe.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return qe.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const i=this.a,s=this.b,r=this.c;let a,o;Si.subVectors(s,i),Mi.subVectors(r,i),ta.subVectors(t,i);const c=Si.dot(ta),l=Mi.dot(ta);if(c<=0&&l<=0)return e.copy(i);ea.subVectors(t,s);const h=Si.dot(ea),u=Mi.dot(ea);if(h>=0&&u<=h)return e.copy(s);const f=c*u-h*l;if(f<=0&&c>=0&&h<=0)return a=c/(c-h),e.copy(i).addScaledVector(Si,a);na.subVectors(t,r);const p=Si.dot(na),g=Mi.dot(na);if(g>=0&&p<=g)return e.copy(r);const _=p*l-c*g;if(_<=0&&l>=0&&g<=0)return o=l/(l-g),e.copy(i).addScaledVector(Mi,o);const m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return Ul.subVectors(r,s),o=(u-h)/(u-h+(p-g)),e.copy(s).addScaledVector(Ul,o);const d=1/(m+_+f);return a=_*d,o=f*d,e.copy(i).addScaledVector(Si,a).addScaledVector(Mi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const mh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},wn={h:0,s:0,l:0},ks={h:0,s:0,l:0};function aa(n,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?n+(t-n)*6*e:e<1/2?t:e<2/3?n+(t-n)*6*(2/3-e):n}class Ot{constructor(t,e,i){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,i)}set(t,e,i){if(e===void 0&&i===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,i);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=Re){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Gt.colorSpaceToWorking(this,e),this}setRGB(t,e,i,s=Gt.workingColorSpace){return this.r=t,this.g=e,this.b=i,Gt.colorSpaceToWorking(this,s),this}setHSL(t,e,i,s=Gt.workingColorSpace){if(t=kf(t,1),e=zt(e,0,1),i=zt(i,0,1),e===0)this.r=this.g=this.b=i;else{const r=i<=.5?i*(1+e):i+e-i*e,a=2*i-r;this.r=aa(a,r,t+1/3),this.g=aa(a,r,t),this.b=aa(a,r,t-1/3)}return Gt.colorSpaceToWorking(this,s),this}setStyle(t,e=Re){function i(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return i(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=Re){const i=mh[t.toLowerCase()];return i!==void 0?this.setHex(i,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=vn(t.r),this.g=vn(t.g),this.b=vn(t.b),this}copyLinearToSRGB(t){return this.r=Oi(t.r),this.g=Oi(t.g),this.b=Oi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=Re){return Gt.workingToColorSpace(ve.copy(this),t),Math.round(zt(ve.r*255,0,255))*65536+Math.round(zt(ve.g*255,0,255))*256+Math.round(zt(ve.b*255,0,255))}getHexString(t=Re){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Gt.workingColorSpace){Gt.workingToColorSpace(ve.copy(this),e);const i=ve.r,s=ve.g,r=ve.b,a=Math.max(i,s,r),o=Math.min(i,s,r);let c,l;const h=(o+a)/2;if(o===a)c=0,l=0;else{const u=a-o;switch(l=h<=.5?u/(a+o):u/(2-a-o),a){case i:c=(s-r)/u+(s<r?6:0);break;case s:c=(r-i)/u+2;break;case r:c=(i-s)/u+4;break}c/=6}return t.h=c,t.s=l,t.l=h,t}getRGB(t,e=Gt.workingColorSpace){return Gt.workingToColorSpace(ve.copy(this),e),t.r=ve.r,t.g=ve.g,t.b=ve.b,t}getStyle(t=Re){Gt.workingToColorSpace(ve.copy(this),t);const e=ve.r,i=ve.g,s=ve.b;return t!==Re?`color(${t} ${e.toFixed(3)} ${i.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(i*255)},${Math.round(s*255)})`}offsetHSL(t,e,i){return this.getHSL(wn),this.setHSL(wn.h+t,wn.s+e,wn.l+i)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,i){return this.r=t.r+(e.r-t.r)*i,this.g=t.g+(e.g-t.g)*i,this.b=t.b+(e.b-t.b)*i,this}lerpHSL(t,e){this.getHSL(wn),t.getHSL(ks);const i=Vr(wn.h,ks.h,e),s=Vr(wn.s,ks.s,e),r=Vr(wn.l,ks.l,e);return this.setHSL(i,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,i=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*i+r[6]*s,this.g=r[1]*e+r[4]*i+r[7]*s,this.b=r[2]*e+r[5]*i+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const ve=new Ot;Ot.NAMES=mh;let np=0;class qi extends Wi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=As(),this.name="",this.type="Material",this.blending=Ni,this.side=Un,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ua,this.blendDst=Fa,this.blendEquation=$n,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ot(0,0,0),this.blendAlpha=0,this.depthFunc=zi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Sl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=di,this.stencilZFail=di,this.stencilZPass=di,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const i=t[e];if(i===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(i):s&&s.isVector3&&i&&i.isVector3?s.copy(i):this[e]=i}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const i={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.color&&this.color.isColor&&(i.color=this.color.getHex()),this.roughness!==void 0&&(i.roughness=this.roughness),this.metalness!==void 0&&(i.metalness=this.metalness),this.sheen!==void 0&&(i.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(i.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(i.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(i.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(i.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(i.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(i.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(i.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(i.shininess=this.shininess),this.clearcoat!==void 0&&(i.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(i.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(i.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(i.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(i.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,i.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(i.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(i.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(i.dispersion=this.dispersion),this.iridescence!==void 0&&(i.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(i.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(i.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(i.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(i.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(i.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(i.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(i.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(i.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(i.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(i.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(i.lightMap=this.lightMap.toJSON(t).uuid,i.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(i.aoMap=this.aoMap.toJSON(t).uuid,i.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(i.bumpMap=this.bumpMap.toJSON(t).uuid,i.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(i.normalMap=this.normalMap.toJSON(t).uuid,i.normalMapType=this.normalMapType,i.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(i.displacementMap=this.displacementMap.toJSON(t).uuid,i.displacementScale=this.displacementScale,i.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(i.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(i.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(i.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(i.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(i.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(i.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(i.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(i.combine=this.combine)),this.envMapRotation!==void 0&&(i.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(i.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(i.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(i.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(i.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(i.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(i.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(i.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(i.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(i.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(i.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(i.size=this.size),this.shadowSide!==null&&(i.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(i.sizeAttenuation=this.sizeAttenuation),this.blending!==Ni&&(i.blending=this.blending),this.side!==Un&&(i.side=this.side),this.vertexColors===!0&&(i.vertexColors=!0),this.opacity<1&&(i.opacity=this.opacity),this.transparent===!0&&(i.transparent=!0),this.blendSrc!==Ua&&(i.blendSrc=this.blendSrc),this.blendDst!==Fa&&(i.blendDst=this.blendDst),this.blendEquation!==$n&&(i.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(i.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(i.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(i.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(i.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(i.blendAlpha=this.blendAlpha),this.depthFunc!==zi&&(i.depthFunc=this.depthFunc),this.depthTest===!1&&(i.depthTest=this.depthTest),this.depthWrite===!1&&(i.depthWrite=this.depthWrite),this.colorWrite===!1&&(i.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(i.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Sl&&(i.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(i.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(i.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==di&&(i.stencilFail=this.stencilFail),this.stencilZFail!==di&&(i.stencilZFail=this.stencilZFail),this.stencilZPass!==di&&(i.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(i.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(i.rotation=this.rotation),this.polygonOffset===!0&&(i.polygonOffset=!0),this.polygonOffsetFactor!==0&&(i.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(i.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(i.linewidth=this.linewidth),this.dashSize!==void 0&&(i.dashSize=this.dashSize),this.gapSize!==void 0&&(i.gapSize=this.gapSize),this.scale!==void 0&&(i.scale=this.scale),this.dithering===!0&&(i.dithering=!0),this.alphaTest>0&&(i.alphaTest=this.alphaTest),this.alphaHash===!0&&(i.alphaHash=!0),this.alphaToCoverage===!0&&(i.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(i.premultipliedAlpha=!0),this.forceSinglePass===!0&&(i.forceSinglePass=!0),this.wireframe===!0&&(i.wireframe=!0),this.wireframeLinewidth>1&&(i.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(i.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(i.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(i.flatShading=!0),this.visible===!1&&(i.visible=!1),this.toneMapped===!1&&(i.toneMapped=!1),this.fog===!1&&(i.fog=!1),Object.keys(this.userData).length>0&&(i.userData=this.userData);function s(r){const a=[];for(const o in r){const c=r[o];delete c.metadata,a.push(c)}return a}if(e){const r=s(t.textures),a=s(t.images);r.length>0&&(i.textures=r),a.length>0&&(i.images=a)}return i}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let i=null;if(e!==null){const s=e.length;i=new Array(s);for(let r=0;r!==s;++r)i[r]=e[r].clone()}return this.clippingPlanes=i,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class wr extends qi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ot(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new an,this.combine=Qc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const ce=new F,Hs=new Wt;let ip=0;class be{constructor(t,e,i=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ip++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=i,this.usage=Ml,this.updateRanges=[],this.gpuType=en,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,i){t*=this.itemSize,i*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[i+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,i=this.count;e<i;e++)Hs.fromBufferAttribute(this,e),Hs.applyMatrix3(t),this.setXY(e,Hs.x,Hs.y);else if(this.itemSize===3)for(let e=0,i=this.count;e<i;e++)ce.fromBufferAttribute(this,e),ce.applyMatrix3(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}applyMatrix4(t){for(let e=0,i=this.count;e<i;e++)ce.fromBufferAttribute(this,e),ce.applyMatrix4(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}applyNormalMatrix(t){for(let e=0,i=this.count;e<i;e++)ce.fromBufferAttribute(this,e),ce.applyNormalMatrix(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}transformDirection(t){for(let e=0,i=this.count;e<i;e++)ce.fromBufferAttribute(this,e),ce.transformDirection(t),this.setXYZ(e,ce.x,ce.y,ce.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let i=this.array[t*this.itemSize+e];return this.normalized&&(i=ns(i,this.array)),i}setComponent(t,e,i){return this.normalized&&(i=Ae(i,this.array)),this.array[t*this.itemSize+e]=i,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ns(e,this.array)),e}setX(t,e){return this.normalized&&(e=Ae(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ns(e,this.array)),e}setY(t,e){return this.normalized&&(e=Ae(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ns(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Ae(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ns(e,this.array)),e}setW(t,e){return this.normalized&&(e=Ae(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,i){return t*=this.itemSize,this.normalized&&(e=Ae(e,this.array),i=Ae(i,this.array)),this.array[t+0]=e,this.array[t+1]=i,this}setXYZ(t,e,i,s){return t*=this.itemSize,this.normalized&&(e=Ae(e,this.array),i=Ae(i,this.array),s=Ae(s,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this}setXYZW(t,e,i,s,r){return t*=this.itemSize,this.normalized&&(e=Ae(e,this.array),i=Ae(i,this.array),s=Ae(s,this.array),r=Ae(r,this.array)),this.array[t+0]=e,this.array[t+1]=i,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Ml&&(t.usage=this.usage),t}}class gh extends be{constructor(t,e,i){super(new Uint16Array(t),e,i)}}class _h extends be{constructor(t,e,i){super(new Uint32Array(t),e,i)}}class xn extends be{constructor(t,e,i){super(new Float32Array(t),e,i)}}let sp=0;const ke=new Jt,oa=new me,yi=new F,Ie=new ai,as=new ai,pe=new F;class on extends Wi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:sp++}),this.uuid=As(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(uh(t)?_h:gh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,i=0){this.groups.push({start:t,count:e,materialIndex:i})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const i=this.attributes.normal;if(i!==void 0){const r=new It().getNormalMatrix(t);i.applyNormalMatrix(r),i.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return ke.makeRotationFromQuaternion(t),this.applyMatrix4(ke),this}rotateX(t){return ke.makeRotationX(t),this.applyMatrix4(ke),this}rotateY(t){return ke.makeRotationY(t),this.applyMatrix4(ke),this}rotateZ(t){return ke.makeRotationZ(t),this.applyMatrix4(ke),this}translate(t,e,i){return ke.makeTranslation(t,e,i),this.applyMatrix4(ke),this}scale(t,e,i){return ke.makeScale(t,e,i),this.applyMatrix4(ke),this}lookAt(t){return oa.lookAt(t),oa.updateMatrix(),this.applyMatrix4(oa.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(yi).negate(),this.translate(yi.x,yi.y,yi.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const i=[];for(let s=0,r=t.length;s<r;s++){const a=t[s];i.push(a.x,a.y,a.z||0)}this.setAttribute("position",new xn(i,3))}else{const i=Math.min(t.length,e.count);for(let s=0;s<i;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ai);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new F(-1/0,-1/0,-1/0),new F(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let i=0,s=e.length;i<s;i++){const r=e[i];Ie.setFromBufferAttribute(r),this.morphTargetsRelative?(pe.addVectors(this.boundingBox.min,Ie.min),this.boundingBox.expandByPoint(pe),pe.addVectors(this.boundingBox.max,Ie.max),this.boundingBox.expandByPoint(pe)):(this.boundingBox.expandByPoint(Ie.min),this.boundingBox.expandByPoint(Ie.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Yi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new F,1/0);return}if(t){const i=this.boundingSphere.center;if(Ie.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){const o=e[r];as.setFromBufferAttribute(o),this.morphTargetsRelative?(pe.addVectors(Ie.min,as.min),Ie.expandByPoint(pe),pe.addVectors(Ie.max,as.max),Ie.expandByPoint(pe)):(Ie.expandByPoint(as.min),Ie.expandByPoint(as.max))}Ie.getCenter(i);let s=0;for(let r=0,a=t.count;r<a;r++)pe.fromBufferAttribute(t,r),s=Math.max(s,i.distanceToSquared(pe));if(e)for(let r=0,a=e.length;r<a;r++){const o=e[r],c=this.morphTargetsRelative;for(let l=0,h=o.count;l<h;l++)pe.fromBufferAttribute(o,l),c&&(yi.fromBufferAttribute(t,l),pe.add(yi)),s=Math.max(s,i.distanceToSquared(pe))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const i=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new be(new Float32Array(4*i.count),4));const a=this.getAttribute("tangent"),o=[],c=[];for(let D=0;D<i.count;D++)o[D]=new F,c[D]=new F;const l=new F,h=new F,u=new F,f=new Wt,p=new Wt,g=new Wt,_=new F,m=new F;function d(D,E,M){l.fromBufferAttribute(i,D),h.fromBufferAttribute(i,E),u.fromBufferAttribute(i,M),f.fromBufferAttribute(r,D),p.fromBufferAttribute(r,E),g.fromBufferAttribute(r,M),h.sub(l),u.sub(l),p.sub(f),g.sub(f);const w=1/(p.x*g.y-g.x*p.y);isFinite(w)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(w),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(w),o[D].add(_),o[E].add(_),o[M].add(_),c[D].add(m),c[E].add(m),c[M].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:t.count}]);for(let D=0,E=T.length;D<E;++D){const M=T[D],w=M.start,N=M.count;for(let k=w,G=w+N;k<G;k+=3)d(t.getX(k+0),t.getX(k+1),t.getX(k+2))}const v=new F,S=new F,A=new F,C=new F;function R(D){A.fromBufferAttribute(s,D),C.copy(A);const E=o[D];v.copy(E),v.sub(A.multiplyScalar(A.dot(E))).normalize(),S.crossVectors(C,E);const w=S.dot(c[D])<0?-1:1;a.setXYZW(D,v.x,v.y,v.z,w)}for(let D=0,E=T.length;D<E;++D){const M=T[D],w=M.start,N=M.count;for(let k=w,G=w+N;k<G;k+=3)R(t.getX(k+0)),R(t.getX(k+1)),R(t.getX(k+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let i=this.getAttribute("normal");if(i===void 0)i=new be(new Float32Array(e.count*3),3),this.setAttribute("normal",i);else for(let f=0,p=i.count;f<p;f++)i.setXYZ(f,0,0,0);const s=new F,r=new F,a=new F,o=new F,c=new F,l=new F,h=new F,u=new F;if(t)for(let f=0,p=t.count;f<p;f+=3){const g=t.getX(f+0),_=t.getX(f+1),m=t.getX(f+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),a.fromBufferAttribute(e,m),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),o.fromBufferAttribute(i,g),c.fromBufferAttribute(i,_),l.fromBufferAttribute(i,m),o.add(h),c.add(h),l.add(h),i.setXYZ(g,o.x,o.y,o.z),i.setXYZ(_,c.x,c.y,c.z),i.setXYZ(m,l.x,l.y,l.z)}else for(let f=0,p=e.count;f<p;f+=3)s.fromBufferAttribute(e,f+0),r.fromBufferAttribute(e,f+1),a.fromBufferAttribute(e,f+2),h.subVectors(a,r),u.subVectors(s,r),h.cross(u),i.setXYZ(f+0,h.x,h.y,h.z),i.setXYZ(f+1,h.x,h.y,h.z),i.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),i.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,i=t.count;e<i;e++)pe.fromBufferAttribute(t,e),pe.normalize(),t.setXYZ(e,pe.x,pe.y,pe.z)}toNonIndexed(){function t(o,c){const l=o.array,h=o.itemSize,u=o.normalized,f=new l.constructor(c.length*h);let p=0,g=0;for(let _=0,m=c.length;_<m;_++){o.isInterleavedBufferAttribute?p=c[_]*o.data.stride+o.offset:p=c[_]*h;for(let d=0;d<h;d++)f[g++]=l[p++]}return new be(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new on,i=this.index.array,s=this.attributes;for(const o in s){const c=s[o],l=t(c,i);e.setAttribute(o,l)}const r=this.morphAttributes;for(const o in r){const c=[],l=r[o];for(let h=0,u=l.length;h<u;h++){const f=l[h],p=t(f,i);c.push(p)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;const a=this.groups;for(let o=0,c=a.length;o<c;o++){const l=a[o];e.addGroup(l.start,l.count,l.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(t[l]=c[l]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const i=this.attributes;for(const c in i){const l=i[c];t.data.attributes[c]=l.toJSON(t.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],h=[];for(let u=0,f=l.length;u<f;u++){const p=l[u];h.push(p.toJSON(t.data))}h.length>0&&(s[c]=h,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));const o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const i=t.index;i!==null&&this.setIndex(i.clone());const s=t.attributes;for(const l in s){const h=s[l];this.setAttribute(l,h.clone(e))}const r=t.morphAttributes;for(const l in r){const h=[],u=r[l];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(e));this.morphAttributes[l]=h}this.morphTargetsRelative=t.morphTargetsRelative;const a=t.groups;for(let l=0,h=a.length;l<h;l++){const u=a[l];this.addGroup(u.start,u.count,u.materialIndex)}const o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());const c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Fl=new Jt,Wn=new fh,Vs=new Yi,Nl=new F,Gs=new F,Ws=new F,Xs=new F,la=new F,Ys=new F,Ol=new F,qs=new F;class Te extends me{constructor(t=new on,e=new wr){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){const i=this.geometry,s=i.attributes.position,r=i.morphAttributes.position,a=i.morphTargetsRelative;e.fromBufferAttribute(s,t);const o=this.morphTargetInfluences;if(r&&o){Ys.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const h=o[c],u=r[c];h!==0&&(la.fromBufferAttribute(u,t),a?Ys.addScaledVector(la,h):Ys.addScaledVector(la.sub(e),h))}e.add(Ys)}return e}raycast(t,e){const i=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(i.boundingSphere===null&&i.computeBoundingSphere(),Vs.copy(i.boundingSphere),Vs.applyMatrix4(r),Wn.copy(t.ray).recast(t.near),!(Vs.containsPoint(Wn.origin)===!1&&(Wn.intersectSphere(Vs,Nl)===null||Wn.origin.distanceToSquared(Nl)>(t.far-t.near)**2))&&(Fl.copy(r).invert(),Wn.copy(t.ray).applyMatrix4(Fl),!(i.boundingBox!==null&&Wn.intersectsBox(i.boundingBox)===!1)&&this._computeIntersections(t,e,Wn)))}_computeIntersections(t,e,i){let s;const r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(o!==null)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],d=a[m.materialIndex],T=Math.max(m.start,p.start),v=Math.min(o.count,Math.min(m.start+m.count,p.start+p.count));for(let S=T,A=v;S<A;S+=3){const C=o.getX(S),R=o.getX(S+1),D=o.getX(S+2);s=Zs(this,d,t,i,l,h,u,C,R,D),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(o.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){const T=o.getX(m),v=o.getX(m+1),S=o.getX(m+2);s=Zs(this,a,t,i,l,h,u,T,v,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let g=0,_=f.length;g<_;g++){const m=f[g],d=a[m.materialIndex],T=Math.max(m.start,p.start),v=Math.min(c.count,Math.min(m.start+m.count,p.start+p.count));for(let S=T,A=v;S<A;S+=3){const C=S,R=S+1,D=S+2;s=Zs(this,d,t,i,l,h,u,C,R,D),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,p.start),_=Math.min(c.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){const T=m,v=m+1,S=m+2;s=Zs(this,a,t,i,l,h,u,T,v,S),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function rp(n,t,e,i,s,r,a,o){let c;if(t.side===Ce?c=i.intersectTriangle(a,r,s,!0,o):c=i.intersectTriangle(s,r,a,t.side===Un,o),c===null)return null;qs.copy(o),qs.applyMatrix4(n.matrixWorld);const l=e.ray.origin.distanceTo(qs);return l<e.near||l>e.far?null:{distance:l,point:qs.clone(),object:n}}function Zs(n,t,e,i,s,r,a,o,c,l){n.getVertexPosition(o,Gs),n.getVertexPosition(c,Ws),n.getVertexPosition(l,Xs);const h=rp(n,t,e,i,Gs,Ws,Xs,Ol);if(h){const u=new F;qe.getBarycoord(Ol,Gs,Ws,Xs,u),s&&(h.uv=qe.getInterpolatedAttribute(s,o,c,l,u,new Wt)),r&&(h.uv1=qe.getInterpolatedAttribute(r,o,c,l,u,new Wt)),a&&(h.normal=qe.getInterpolatedAttribute(a,o,c,l,u,new F),h.normal.dot(i.direction)>0&&h.normal.multiplyScalar(-1));const f={a:o,b:c,c:l,normal:new F,materialIndex:0};qe.getNormal(Gs,Ws,Xs,f.normal),h.face=f,h.barycoord=u}return h}class oi extends on{constructor(t=1,e=1,i=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:i,widthSegments:s,heightSegments:r,depthSegments:a};const o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);const c=[],l=[],h=[],u=[];let f=0,p=0;g("z","y","x",-1,-1,i,e,t,a,r,0),g("z","y","x",1,-1,i,e,-t,a,r,1),g("x","z","y",1,1,t,i,e,s,a,2),g("x","z","y",1,-1,t,i,-e,s,a,3),g("x","y","z",1,-1,t,e,i,s,r,4),g("x","y","z",-1,-1,t,e,-i,s,r,5),this.setIndex(c),this.setAttribute("position",new xn(l,3)),this.setAttribute("normal",new xn(h,3)),this.setAttribute("uv",new xn(u,2));function g(_,m,d,T,v,S,A,C,R,D,E){const M=S/R,w=A/D,N=S/2,k=A/2,G=C/2,W=R+1,H=D+1;let q=0,V=0;const it=new F;for(let ct=0;ct<H;ct++){const St=ct*w-k;for(let Nt=0;Nt<W;Nt++){const Ht=Nt*M-N;it[_]=Ht*T,it[m]=St*v,it[d]=G,l.push(it.x,it.y,it.z),it[_]=0,it[m]=0,it[d]=C>0?1:-1,h.push(it.x,it.y,it.z),u.push(Nt/R),u.push(1-ct/D),q+=1}}for(let ct=0;ct<D;ct++)for(let St=0;St<R;St++){const Nt=f+St+W*ct,Ht=f+St+W*(ct+1),qt=f+(St+1)+W*(ct+1),Xt=f+(St+1)+W*ct;c.push(Nt,Ht,Xt),c.push(Ht,qt,Xt),V+=6}o.addGroup(p,V,E),p+=V,f+=q}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new oi(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function Gi(n){const t={};for(const e in n){t[e]={};for(const i in n[e]){const s=n[e][i];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][i]=null):t[e][i]=s.clone():Array.isArray(s)?t[e][i]=s.slice():t[e][i]=s}}return t}function Ee(n){const t={};for(let e=0;e<n.length;e++){const i=Gi(n[e]);for(const s in i)t[s]=i[s]}return t}function ap(n){const t=[];for(let e=0;e<n.length;e++)t.push(n[e].clone());return t}function vh(n){const t=n.getRenderTarget();return t===null?n.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Gt.workingColorSpace}const op={clone:Gi,merge:Ee};var lp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,cp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Fn extends qi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=lp,this.fragmentShader=cp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Gi(t.uniforms),this.uniformsGroups=ap(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const i={};for(const s in this.extensions)this.extensions[s]===!0&&(i[s]=!0);return Object.keys(i).length>0&&(e.extensions=i),e}}class xh extends me{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Jt,this.projectionMatrix=new Jt,this.projectionMatrixInverse=new Jt,this.coordinateSystem=nn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const An=new F,Bl=new Wt,zl=new Wt;class Ne extends xh{constructor(t=50,e=1,i=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=i,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=Mo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(Hr*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Mo*2*Math.atan(Math.tan(Hr*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,i){An.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(An.x,An.y).multiplyScalar(-t/An.z),An.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),i.set(An.x,An.y).multiplyScalar(-t/An.z)}getViewSize(t,e){return this.getViewBounds(t,Bl,zl),e.subVectors(zl,Bl)}setViewOffset(t,e,i,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(Hr*.5*this.fov)/this.zoom,i=2*e,s=this.aspect*i,r=-.5*s;const a=this.view;if(this.view!==null&&this.view.enabled){const c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*i/l,s*=a.width/c,i*=a.height/l}const o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-i,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const Ei=-90,Ti=1;class hp extends me{constructor(t,e,i){super(),this.type="CubeCamera",this.renderTarget=i,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ne(Ei,Ti,t,e);s.layers=this.layers,this.add(s);const r=new Ne(Ei,Ti,t,e);r.layers=this.layers,this.add(r);const a=new Ne(Ei,Ti,t,e);a.layers=this.layers,this.add(a);const o=new Ne(Ei,Ti,t,e);o.layers=this.layers,this.add(o);const c=new Ne(Ei,Ti,t,e);c.layers=this.layers,this.add(c);const l=new Ne(Ei,Ti,t,e);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[i,s,r,a,o,c]=e;for(const l of e)this.remove(l);if(t===nn)i.up.set(0,1,0),i.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===Sr)i.up.set(0,-1,0),i.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const l of e)this.add(l),l.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:i,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,a,o,c,l,h]=this.children,u=t.getRenderTarget(),f=t.getActiveCubeFace(),p=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=i.texture.generateMipmaps;i.texture.generateMipmaps=!1,t.setRenderTarget(i,0,s),t.render(e,r),t.setRenderTarget(i,1,s),t.render(e,a),t.setRenderTarget(i,2,s),t.render(e,o),t.setRenderTarget(i,3,s),t.render(e,c),t.setRenderTarget(i,4,s),t.render(e,l),i.texture.generateMipmaps=_,t.setRenderTarget(i,5,s),t.render(e,h),t.setRenderTarget(u,f,p),t.xr.enabled=g,i.texture.needsPMREMUpdate=!0}}class Sh extends Me{constructor(t=[],e=ki,i,s,r,a,o,c,l,h){super(t,e,i,s,r,a,o,c,l,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class up extends ii{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const i={width:t,height:t,depth:1},s=[i,i,i,i,i,i];this.texture=new Sh(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const i={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new oi(5,5,5),r=new Fn({name:"CubemapFromEquirect",uniforms:Gi(i.uniforms),vertexShader:i.vertexShader,fragmentShader:i.fragmentShader,side:Ce,blending:Ln});r.uniforms.tEquirect.value=e;const a=new Te(s,r),o=e.minFilter;return e.minFilter===ti&&(e.minFilter=tn),new hp(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,i=!0,s=!0){const r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,i,s);t.setRenderTarget(r)}}class Dn extends me{constructor(){super(),this.isGroup=!0,this.type="Group"}}const dp={type:"move"};class ca{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Dn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Dn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new F,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new F),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Dn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new F,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new F),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const i of t.hand.values())this._getHandJoint(e,i)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,i){let s=null,r=null,a=null;const o=this._targetRay,c=this._grip,l=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(l&&t.hand){a=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,i),d=this._getHandJoint(l,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}const h=l.joints["index-finger-tip"],u=l.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,g=.005;l.inputState.pinching&&f>p+g?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!l.inputState.pinching&&f<=p-g&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,i),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,i),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(dp)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const i=new Dn;i.matrixAutoUpdate=!1,i.visible=!1,t.joints[e.jointName]=i,t.add(i)}return t.joints[e.jointName]}}class No{constructor(t,e=25e-5){this.isFogExp2=!0,this.name="",this.color=new Ot(t),this.density=e}clone(){return new No(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class fp extends me{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new an,this.environmentIntensity=1,this.environmentRotation=new an,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class pp extends Me{constructor(t=null,e=1,i=1,s,r,a,o,c,l=Oe,h=Oe,u,f){super(null,a,o,c,l,h,s,r,u,f),this.isDataTexture=!0,this.image={data:t,width:e,height:i},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class kl extends be{constructor(t,e,i,s=1){super(t,e,i),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const bi=new Jt,Hl=new Jt,Ks=[],Vl=new ai,mp=new Jt,os=new Te,ls=new Yi;class Mh extends Te{constructor(t,e,i){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new kl(new Float32Array(i*16),16),this.instanceColor=null,this.morphTexture=null,this.count=i,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<i;s++)this.setMatrixAt(s,mp)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ai),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,bi),Vl.copy(t.boundingBox).applyMatrix4(bi),this.boundingBox.union(Vl)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Yi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let i=0;i<e;i++)this.getMatrixAt(i,bi),ls.copy(t.boundingSphere).applyMatrix4(bi),this.boundingSphere.union(ls)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const i=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=i.length+1,a=t*r+1;for(let o=0;o<i.length;o++)i[o]=s[a+o]}raycast(t,e){const i=this.matrixWorld,s=this.count;if(os.geometry=this.geometry,os.material=this.material,os.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ls.copy(this.boundingSphere),ls.applyMatrix4(i),t.ray.intersectsSphere(ls)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,bi),Hl.multiplyMatrices(i,bi),os.matrixWorld=Hl,os.raycast(t,Ks);for(let a=0,o=Ks.length;a<o;a++){const c=Ks[a];c.instanceId=r,c.object=this,e.push(c)}Ks.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new kl(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const i=e.morphTargetInfluences,s=i.length+1;this.morphTexture===null&&(this.morphTexture=new pp(new Float32Array(s*this.count),s,this.count,Do,en));const r=this.morphTexture.source.data.data;let a=0;for(let l=0;l<i.length;l++)a+=i[l];const o=this.geometry.morphTargetsRelative?1:1-a,c=s*t;r[c]=o,r.set(i,c+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const ha=new F,gp=new F,_p=new It;class Zn{constructor(t=new F(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,i,s){return this.normal.set(t,e,i),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,i){const s=ha.subVectors(i,e).cross(gp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const i=t.delta(ha),s=this.normal.dot(i);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(i,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),i=this.distanceToPoint(t.end);return e<0&&i>0||i<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const i=e||_p.getNormalMatrix(t),s=this.coplanarPoint(ha).applyMatrix4(t),r=this.normal.applyMatrix3(i).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Xn=new Yi,vp=new Wt(.5,.5),$s=new F;class Oo{constructor(t=new Zn,e=new Zn,i=new Zn,s=new Zn,r=new Zn,a=new Zn){this.planes=[t,e,i,s,r,a]}set(t,e,i,s,r,a){const o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(i),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){const e=this.planes;for(let i=0;i<6;i++)e[i].copy(t.planes[i]);return this}setFromProjectionMatrix(t,e=nn,i=!1){const s=this.planes,r=t.elements,a=r[0],o=r[1],c=r[2],l=r[3],h=r[4],u=r[5],f=r[6],p=r[7],g=r[8],_=r[9],m=r[10],d=r[11],T=r[12],v=r[13],S=r[14],A=r[15];if(s[0].setComponents(l-a,p-h,d-g,A-T).normalize(),s[1].setComponents(l+a,p+h,d+g,A+T).normalize(),s[2].setComponents(l+o,p+u,d+_,A+v).normalize(),s[3].setComponents(l-o,p-u,d-_,A-v).normalize(),i)s[4].setComponents(c,f,m,S).normalize(),s[5].setComponents(l-c,p-f,d-m,A-S).normalize();else if(s[4].setComponents(l-c,p-f,d-m,A-S).normalize(),e===nn)s[5].setComponents(l+c,p+f,d+m,A+S).normalize();else if(e===Sr)s[5].setComponents(c,f,m,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Xn.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Xn.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Xn)}intersectsSprite(t){Xn.center.set(0,0,0);const e=vp.distanceTo(t.center);return Xn.radius=.7071067811865476+e,Xn.applyMatrix4(t.matrixWorld),this.intersectsSphere(Xn)}intersectsSphere(t){const e=this.planes,i=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(i)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let i=0;i<6;i++){const s=e[i];if($s.x=s.normal.x>0?t.max.x:t.min.x,$s.y=s.normal.y>0?t.max.y:t.min.y,$s.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint($s)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let i=0;i<6;i++)if(e[i].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class yh extends qi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ot(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const yr=new F,Er=new F,Gl=new Jt,cs=new fh,js=new Yi,ua=new F,Wl=new F;class xp extends me{constructor(t=new on,e=new yh){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[0];for(let s=1,r=e.count;s<r;s++)yr.fromBufferAttribute(e,s-1),Er.fromBufferAttribute(e,s),i[s]=i[s-1],i[s]+=yr.distanceTo(Er);t.setAttribute("lineDistance",new xn(i,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const i=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=i.drawRange;if(i.boundingSphere===null&&i.computeBoundingSphere(),js.copy(i.boundingSphere),js.applyMatrix4(s),js.radius+=r,t.ray.intersectsSphere(js)===!1)return;Gl.copy(s).invert(),cs.copy(t.ray).applyMatrix4(Gl);const o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,h=i.index,f=i.attributes.position;if(h!==null){const p=Math.max(0,a.start),g=Math.min(h.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=l){const d=h.getX(_),T=h.getX(_+1),v=Js(this,t,cs,c,d,T,_);v&&e.push(v)}if(this.isLineLoop){const _=h.getX(g-1),m=h.getX(p),d=Js(this,t,cs,c,_,m,g-1);d&&e.push(d)}}else{const p=Math.max(0,a.start),g=Math.min(f.count,a.start+a.count);for(let _=p,m=g-1;_<m;_+=l){const d=Js(this,t,cs,c,_,_+1,_);d&&e.push(d)}if(this.isLineLoop){const _=Js(this,t,cs,c,g-1,p,g-1);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,i=Object.keys(e);if(i.length>0){const s=e[i[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){const o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}}function Js(n,t,e,i,s,r,a){const o=n.geometry.attributes.position;if(yr.fromBufferAttribute(o,s),Er.fromBufferAttribute(o,r),e.distanceSqToSegment(yr,Er,ua,Wl)>i)return;ua.applyMatrix4(n.matrixWorld);const l=t.ray.origin.distanceTo(ua);if(!(l<t.near||l>t.far))return{distance:l,point:Wl.clone().applyMatrix4(n.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:n}}const Xl=new F,Yl=new F;class Sp extends xp{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,i=[];for(let s=0,r=e.count;s<r;s+=2)Xl.fromBufferAttribute(e,s),Yl.fromBufferAttribute(e,s+1),i[s]=s===0?0:i[s-1],i[s+1]=i[s]+Xl.distanceTo(Yl);t.setAttribute("lineDistance",new xn(i,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Mp extends Me{constructor(t,e,i,s,r,a,o,c,l){super(t,e,i,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Eh extends Me{constructor(t,e,i=ni,s,r,a,o=Oe,c=Oe,l,h=Es,u=1){if(h!==Es&&h!==Ts)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const f={width:t,height:e,depth:u};super(f,s,r,a,o,c,h,i,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Fo(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class Th extends Me{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}class Zi extends on{constructor(t=1,e=1,i=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:i,heightSegments:s};const r=t/2,a=e/2,o=Math.floor(i),c=Math.floor(s),l=o+1,h=c+1,u=t/o,f=e/c,p=[],g=[],_=[],m=[];for(let d=0;d<h;d++){const T=d*f-a;for(let v=0;v<l;v++){const S=v*u-r;g.push(S,-T,0),_.push(0,0,1),m.push(v/o),m.push(1-d/c)}}for(let d=0;d<c;d++)for(let T=0;T<o;T++){const v=T+l*d,S=T+l*(d+1),A=T+1+l*(d+1),C=T+1+l*d;p.push(v,S,C),p.push(S,A,C)}this.setIndex(p),this.setAttribute("position",new xn(g,3)),this.setAttribute("normal",new xn(_,3)),this.setAttribute("uv",new xn(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Zi(t.width,t.height,t.widthSegments,t.heightSegments)}}class Bo extends qi{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ot(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ot(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ch,this.normalScale=new Wt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new an,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class yp extends qi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Cf,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class Ep extends qi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Ar extends me{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new Ot(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class Tp extends Ar{constructor(t,e,i){super(t,i),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(me.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ot(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const da=new Jt,ql=new F,Zl=new F;class bh{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Wt(512,512),this.mapType=rn,this.map=null,this.mapPass=null,this.matrix=new Jt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Oo,this._frameExtents=new Wt(1,1),this._viewportCount=1,this._viewports=[new $t(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,i=this.matrix;ql.setFromMatrixPosition(t.matrixWorld),e.position.copy(ql),Zl.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Zl),e.updateMatrixWorld(),da.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(da,e.coordinateSystem,e.reversedDepth),e.reversedDepth?i.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):i.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),i.multiply(da)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}const Kl=new Jt,hs=new F,fa=new F;class bp extends bh{constructor(){super(new Ne(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Wt(4,2),this._viewportCount=6,this._viewports=[new $t(2,1,1,1),new $t(0,1,1,1),new $t(3,1,1,1),new $t(1,1,1,1),new $t(3,0,1,1),new $t(1,0,1,1)],this._cubeDirections=[new F(1,0,0),new F(-1,0,0),new F(0,0,1),new F(0,0,-1),new F(0,1,0),new F(0,-1,0)],this._cubeUps=[new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,1,0),new F(0,0,1),new F(0,0,-1)]}updateMatrices(t,e=0){const i=this.camera,s=this.matrix,r=t.distance||i.far;r!==i.far&&(i.far=r,i.updateProjectionMatrix()),hs.setFromMatrixPosition(t.matrixWorld),i.position.copy(hs),fa.copy(i.position),fa.add(this._cubeDirections[e]),i.up.copy(this._cubeUps[e]),i.lookAt(fa),i.updateMatrixWorld(),s.makeTranslation(-hs.x,-hs.y,-hs.z),Kl.multiplyMatrices(i.projectionMatrix,i.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Kl,i.coordinateSystem,i.reversedDepth)}}class wp extends Ar{constructor(t,e,i=0,s=2){super(t,e),this.isPointLight=!0,this.type="PointLight",this.distance=i,this.decay=s,this.shadow=new bp}get power(){return this.intensity*4*Math.PI}set power(t){this.intensity=t/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(t,e){return super.copy(t,e),this.distance=t.distance,this.decay=t.decay,this.shadow=t.shadow.clone(),this}}class wh extends xh{constructor(t=-1,e=1,i=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=i,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,i,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=i,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),i=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=i-t,a=i+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=h*this.view.offsetY,c=o-h*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class Ap extends bh{constructor(){super(new wh(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class $l extends Ar{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(me.DEFAULT_UP),this.updateMatrix(),this.target=new me,this.shadow=new Ap}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class Rp extends Ar{constructor(t,e){super(t,e),this.isAmbientLight=!0,this.type="AmbientLight"}}class Cp extends Ne{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}function jl(n,t,e,i){const s=Pp(i);switch(e){case ah:return n*t;case Do:return n*t/s.components*s.byteLength;case Lo:return n*t/s.components*s.byteLength;case lh:return n*t*2/s.components*s.byteLength;case Io:return n*t*2/s.components*s.byteLength;case oh:return n*t*3/s.components*s.byteLength;case Ze:return n*t*4/s.components*s.byteLength;case Uo:return n*t*4/s.components*s.byteLength;case dr:case fr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case pr:case mr:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case qa:case Ka:return Math.max(n,16)*Math.max(t,8)/4;case Ya:case Za:return Math.max(n,8)*Math.max(t,8)/2;case $a:case ja:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*8;case Ja:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case Qa:return Math.floor((n+3)/4)*Math.floor((t+3)/4)*16;case to:return Math.floor((n+4)/5)*Math.floor((t+3)/4)*16;case eo:return Math.floor((n+4)/5)*Math.floor((t+4)/5)*16;case no:return Math.floor((n+5)/6)*Math.floor((t+4)/5)*16;case io:return Math.floor((n+5)/6)*Math.floor((t+5)/6)*16;case so:return Math.floor((n+7)/8)*Math.floor((t+4)/5)*16;case ro:return Math.floor((n+7)/8)*Math.floor((t+5)/6)*16;case ao:return Math.floor((n+7)/8)*Math.floor((t+7)/8)*16;case oo:return Math.floor((n+9)/10)*Math.floor((t+4)/5)*16;case lo:return Math.floor((n+9)/10)*Math.floor((t+5)/6)*16;case co:return Math.floor((n+9)/10)*Math.floor((t+7)/8)*16;case ho:return Math.floor((n+9)/10)*Math.floor((t+9)/10)*16;case uo:return Math.floor((n+11)/12)*Math.floor((t+9)/10)*16;case fo:return Math.floor((n+11)/12)*Math.floor((t+11)/12)*16;case po:case mo:case go:return Math.ceil(n/4)*Math.ceil(t/4)*16;case _o:case vo:return Math.ceil(n/4)*Math.ceil(t/4)*8;case xo:case So:return Math.ceil(n/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Pp(n){switch(n){case rn:case nh:return{byteLength:1,components:1};case Ms:case ih:case ws:return{byteLength:2,components:1};case Co:case Po:return{byteLength:2,components:4};case ni:case Ro:case en:return{byteLength:4,components:1};case sh:case rh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${n}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ao}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ao);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Ah(){let n=null,t=!1,e=null,i=null;function s(r,a){e(r,a),i=n.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(i=n.requestAnimationFrame(s),t=!0)},stop:function(){n.cancelAnimationFrame(i),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){n=r}}}function Dp(n){const t=new WeakMap;function e(o,c){const l=o.array,h=o.usage,u=l.byteLength,f=n.createBuffer();n.bindBuffer(c,f),n.bufferData(c,l,h),o.onUploadCallback();let p;if(l instanceof Float32Array)p=n.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)p=n.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?p=n.HALF_FLOAT:p=n.UNSIGNED_SHORT;else if(l instanceof Int16Array)p=n.SHORT;else if(l instanceof Uint32Array)p=n.UNSIGNED_INT;else if(l instanceof Int32Array)p=n.INT;else if(l instanceof Int8Array)p=n.BYTE;else if(l instanceof Uint8Array)p=n.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)p=n.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:f,type:p,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:u}}function i(o,c,l){const h=c.array,u=c.updateRanges;if(n.bindBuffer(l,o),u.length===0)n.bufferSubData(l,0,h);else{u.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<u.length;p++){const g=u[f],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,u[f]=_)}u.length=f+1;for(let p=0,g=u.length;p<g;p++){const _=u[p];n.bufferSubData(l,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);const c=t.get(o);c&&(n.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){const h=t.get(o);(!h||h.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}const l=t.get(o);if(l===void 0)t.set(o,e(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");i(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Lp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Ip=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Up=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Fp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Np=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Op=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Bp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,zp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,kp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,Hp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Vp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Wp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,Xp=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Yp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,qp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Kp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,jp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Jp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Qp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,tm=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,em=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,nm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,im=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,sm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,rm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,am=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,om=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,lm="gl_FragColor = linearToOutputTexel( gl_FragColor );",cm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,hm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,dm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,fm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,pm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,mm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,gm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,_m=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,vm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Sm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Mm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,ym=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Em=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Tm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,bm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,wm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Am=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Rm=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Cm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Pm=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Dm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Lm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Im=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Um=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Fm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Nm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Om=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Bm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,km=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,Hm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Vm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Gm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Wm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Xm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Ym=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,qm=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,Zm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Km=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,$m=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,tg=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,eg=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,ng=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,ig=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,sg=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,rg=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,ag=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,og=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,lg=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,cg=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,hg=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,ug=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,dg=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,fg=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,pg=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,mg=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,gg=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,_g=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,vg=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,xg=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Sg=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Mg=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,yg=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Eg=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Tg=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,bg=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,wg=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Ag=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Rg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Cg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,Pg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const Dg=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Lg=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Ig=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ug=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Fg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Ng=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Og=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,Bg=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,zg=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,kg=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,Hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Vg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gg=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Wg=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Xg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Yg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,qg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Zg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Kg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,$g=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,jg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Jg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Qg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,t_=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,e_=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,n_=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,i_=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,s_=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,r_=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,a_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,o_=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,l_=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,c_=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,h_=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ft={alphahash_fragment:Lp,alphahash_pars_fragment:Ip,alphamap_fragment:Up,alphamap_pars_fragment:Fp,alphatest_fragment:Np,alphatest_pars_fragment:Op,aomap_fragment:Bp,aomap_pars_fragment:zp,batching_pars_vertex:kp,batching_vertex:Hp,begin_vertex:Vp,beginnormal_vertex:Gp,bsdfs:Wp,iridescence_fragment:Xp,bumpmap_pars_fragment:Yp,clipping_planes_fragment:qp,clipping_planes_pars_fragment:Zp,clipping_planes_pars_vertex:Kp,clipping_planes_vertex:$p,color_fragment:jp,color_pars_fragment:Jp,color_pars_vertex:Qp,color_vertex:tm,common:em,cube_uv_reflection_fragment:nm,defaultnormal_vertex:im,displacementmap_pars_vertex:sm,displacementmap_vertex:rm,emissivemap_fragment:am,emissivemap_pars_fragment:om,colorspace_fragment:lm,colorspace_pars_fragment:cm,envmap_fragment:hm,envmap_common_pars_fragment:um,envmap_pars_fragment:dm,envmap_pars_vertex:fm,envmap_physical_pars_fragment:Tm,envmap_vertex:pm,fog_vertex:mm,fog_pars_vertex:gm,fog_fragment:_m,fog_pars_fragment:vm,gradientmap_pars_fragment:xm,lightmap_pars_fragment:Sm,lights_lambert_fragment:Mm,lights_lambert_pars_fragment:ym,lights_pars_begin:Em,lights_toon_fragment:bm,lights_toon_pars_fragment:wm,lights_phong_fragment:Am,lights_phong_pars_fragment:Rm,lights_physical_fragment:Cm,lights_physical_pars_fragment:Pm,lights_fragment_begin:Dm,lights_fragment_maps:Lm,lights_fragment_end:Im,logdepthbuf_fragment:Um,logdepthbuf_pars_fragment:Fm,logdepthbuf_pars_vertex:Nm,logdepthbuf_vertex:Om,map_fragment:Bm,map_pars_fragment:zm,map_particle_fragment:km,map_particle_pars_fragment:Hm,metalnessmap_fragment:Vm,metalnessmap_pars_fragment:Gm,morphinstance_vertex:Wm,morphcolor_vertex:Xm,morphnormal_vertex:Ym,morphtarget_pars_vertex:qm,morphtarget_vertex:Zm,normal_fragment_begin:Km,normal_fragment_maps:$m,normal_pars_fragment:jm,normal_pars_vertex:Jm,normal_vertex:Qm,normalmap_pars_fragment:tg,clearcoat_normal_fragment_begin:eg,clearcoat_normal_fragment_maps:ng,clearcoat_pars_fragment:ig,iridescence_pars_fragment:sg,opaque_fragment:rg,packing:ag,premultiplied_alpha_fragment:og,project_vertex:lg,dithering_fragment:cg,dithering_pars_fragment:hg,roughnessmap_fragment:ug,roughnessmap_pars_fragment:dg,shadowmap_pars_fragment:fg,shadowmap_pars_vertex:pg,shadowmap_vertex:mg,shadowmask_pars_fragment:gg,skinbase_vertex:_g,skinning_pars_vertex:vg,skinning_vertex:xg,skinnormal_vertex:Sg,specularmap_fragment:Mg,specularmap_pars_fragment:yg,tonemapping_fragment:Eg,tonemapping_pars_fragment:Tg,transmission_fragment:bg,transmission_pars_fragment:wg,uv_pars_fragment:Ag,uv_pars_vertex:Rg,uv_vertex:Cg,worldpos_vertex:Pg,background_vert:Dg,background_frag:Lg,backgroundCube_vert:Ig,backgroundCube_frag:Ug,cube_vert:Fg,cube_frag:Ng,depth_vert:Og,depth_frag:Bg,distanceRGBA_vert:zg,distanceRGBA_frag:kg,equirect_vert:Hg,equirect_frag:Vg,linedashed_vert:Gg,linedashed_frag:Wg,meshbasic_vert:Xg,meshbasic_frag:Yg,meshlambert_vert:qg,meshlambert_frag:Zg,meshmatcap_vert:Kg,meshmatcap_frag:$g,meshnormal_vert:jg,meshnormal_frag:Jg,meshphong_vert:Qg,meshphong_frag:t_,meshphysical_vert:e_,meshphysical_frag:n_,meshtoon_vert:i_,meshtoon_frag:s_,points_vert:r_,points_frag:a_,shadow_vert:o_,shadow_frag:l_,sprite_vert:c_,sprite_frag:h_},rt={common:{diffuse:{value:new Ot(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new It},alphaMap:{value:null},alphaMapTransform:{value:new It},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new It}},envmap:{envMap:{value:null},envMapRotation:{value:new It},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new It}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new It}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new It},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new It},normalScale:{value:new Wt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new It},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new It}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new It}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new It}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ot(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ot(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new It},alphaTest:{value:0},uvTransform:{value:new It}},sprite:{diffuse:{value:new Ot(16777215)},opacity:{value:1},center:{value:new Wt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new It},alphaMap:{value:null},alphaMapTransform:{value:new It},alphaTest:{value:0}}},Qe={basic:{uniforms:Ee([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.fog]),vertexShader:Ft.meshbasic_vert,fragmentShader:Ft.meshbasic_frag},lambert:{uniforms:Ee([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,rt.lights,{emissive:{value:new Ot(0)}}]),vertexShader:Ft.meshlambert_vert,fragmentShader:Ft.meshlambert_frag},phong:{uniforms:Ee([rt.common,rt.specularmap,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,rt.lights,{emissive:{value:new Ot(0)},specular:{value:new Ot(1118481)},shininess:{value:30}}]),vertexShader:Ft.meshphong_vert,fragmentShader:Ft.meshphong_frag},standard:{uniforms:Ee([rt.common,rt.envmap,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.roughnessmap,rt.metalnessmap,rt.fog,rt.lights,{emissive:{value:new Ot(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ft.meshphysical_vert,fragmentShader:Ft.meshphysical_frag},toon:{uniforms:Ee([rt.common,rt.aomap,rt.lightmap,rt.emissivemap,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.gradientmap,rt.fog,rt.lights,{emissive:{value:new Ot(0)}}]),vertexShader:Ft.meshtoon_vert,fragmentShader:Ft.meshtoon_frag},matcap:{uniforms:Ee([rt.common,rt.bumpmap,rt.normalmap,rt.displacementmap,rt.fog,{matcap:{value:null}}]),vertexShader:Ft.meshmatcap_vert,fragmentShader:Ft.meshmatcap_frag},points:{uniforms:Ee([rt.points,rt.fog]),vertexShader:Ft.points_vert,fragmentShader:Ft.points_frag},dashed:{uniforms:Ee([rt.common,rt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ft.linedashed_vert,fragmentShader:Ft.linedashed_frag},depth:{uniforms:Ee([rt.common,rt.displacementmap]),vertexShader:Ft.depth_vert,fragmentShader:Ft.depth_frag},normal:{uniforms:Ee([rt.common,rt.bumpmap,rt.normalmap,rt.displacementmap,{opacity:{value:1}}]),vertexShader:Ft.meshnormal_vert,fragmentShader:Ft.meshnormal_frag},sprite:{uniforms:Ee([rt.sprite,rt.fog]),vertexShader:Ft.sprite_vert,fragmentShader:Ft.sprite_frag},background:{uniforms:{uvTransform:{value:new It},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ft.background_vert,fragmentShader:Ft.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new It}},vertexShader:Ft.backgroundCube_vert,fragmentShader:Ft.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ft.cube_vert,fragmentShader:Ft.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ft.equirect_vert,fragmentShader:Ft.equirect_frag},distanceRGBA:{uniforms:Ee([rt.common,rt.displacementmap,{referencePosition:{value:new F},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ft.distanceRGBA_vert,fragmentShader:Ft.distanceRGBA_frag},shadow:{uniforms:Ee([rt.lights,rt.fog,{color:{value:new Ot(0)},opacity:{value:1}}]),vertexShader:Ft.shadow_vert,fragmentShader:Ft.shadow_frag}};Qe.physical={uniforms:Ee([Qe.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new It},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new It},clearcoatNormalScale:{value:new Wt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new It},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new It},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new It},sheen:{value:0},sheenColor:{value:new Ot(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new It},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new It},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new It},transmissionSamplerSize:{value:new Wt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new It},attenuationDistance:{value:0},attenuationColor:{value:new Ot(0)},specularColor:{value:new Ot(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new It},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new It},anisotropyVector:{value:new Wt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new It}}]),vertexShader:Ft.meshphysical_vert,fragmentShader:Ft.meshphysical_frag};const Qs={r:0,b:0,g:0},Yn=new an,u_=new Jt;function d_(n,t,e,i,s,r,a){const o=new Ot(0);let c=r===!0?0:1,l,h,u=null,f=0,p=null;function g(v){let S=v.isScene===!0?v.background:null;return S&&S.isTexture&&(S=(v.backgroundBlurriness>0?e:t).get(S)),S}function _(v){let S=!1;const A=g(v);A===null?d(o,c):A&&A.isColor&&(d(A,1),S=!0);const C=n.xr.getEnvironmentBlendMode();C==="additive"?i.buffers.color.setClear(0,0,0,1,a):C==="alpha-blend"&&i.buffers.color.setClear(0,0,0,0,a),(n.autoClear||S)&&(i.buffers.depth.setTest(!0),i.buffers.depth.setMask(!0),i.buffers.color.setMask(!0),n.clear(n.autoClearColor,n.autoClearDepth,n.autoClearStencil))}function m(v,S){const A=g(S);A&&(A.isCubeTexture||A.mapping===br)?(h===void 0&&(h=new Te(new oi(1,1,1),new Fn({name:"BackgroundCubeMaterial",uniforms:Gi(Qe.backgroundCube.uniforms),vertexShader:Qe.backgroundCube.vertexShader,fragmentShader:Qe.backgroundCube.fragmentShader,side:Ce,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(C,R,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Yn.copy(S.backgroundRotation),Yn.x*=-1,Yn.y*=-1,Yn.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(Yn.y*=-1,Yn.z*=-1),h.material.uniforms.envMap.value=A,h.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=S.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(u_.makeRotationFromEuler(Yn)),h.material.toneMapped=Gt.getTransfer(A.colorSpace)!==Kt,(u!==A||f!==A.version||p!==n.toneMapping)&&(h.material.needsUpdate=!0,u=A,f=A.version,p=n.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):A&&A.isTexture&&(l===void 0&&(l=new Te(new Zi(2,2),new Fn({name:"BackgroundMaterial",uniforms:Gi(Qe.background.uniforms),vertexShader:Qe.background.vertexShader,fragmentShader:Qe.background.fragmentShader,side:Un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(l)),l.material.uniforms.t2D.value=A,l.material.uniforms.backgroundIntensity.value=S.backgroundIntensity,l.material.toneMapped=Gt.getTransfer(A.colorSpace)!==Kt,A.matrixAutoUpdate===!0&&A.updateMatrix(),l.material.uniforms.uvTransform.value.copy(A.matrix),(u!==A||f!==A.version||p!==n.toneMapping)&&(l.material.needsUpdate=!0,u=A,f=A.version,p=n.toneMapping),l.layers.enableAll(),v.unshift(l,l.geometry,l.material,0,0,null))}function d(v,S){v.getRGB(Qs,vh(n)),i.buffers.color.setClear(Qs.r,Qs.g,Qs.b,S,a)}function T(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return o},setClearColor:function(v,S=1){o.set(v),c=S,d(o,c)},getClearAlpha:function(){return c},setClearAlpha:function(v){c=v,d(o,c)},render:_,addToRenderList:m,dispose:T}}function f_(n,t){const e=n.getParameter(n.MAX_VERTEX_ATTRIBS),i={},s=f(null);let r=s,a=!1;function o(M,w,N,k,G){let W=!1;const H=u(k,N,w);r!==H&&(r=H,l(r.object)),W=p(M,k,N,G),W&&g(M,k,N,G),G!==null&&t.update(G,n.ELEMENT_ARRAY_BUFFER),(W||a)&&(a=!1,S(M,w,N,k),G!==null&&n.bindBuffer(n.ELEMENT_ARRAY_BUFFER,t.get(G).buffer))}function c(){return n.createVertexArray()}function l(M){return n.bindVertexArray(M)}function h(M){return n.deleteVertexArray(M)}function u(M,w,N){const k=N.wireframe===!0;let G=i[M.id];G===void 0&&(G={},i[M.id]=G);let W=G[w.id];W===void 0&&(W={},G[w.id]=W);let H=W[k];return H===void 0&&(H=f(c()),W[k]=H),H}function f(M){const w=[],N=[],k=[];for(let G=0;G<e;G++)w[G]=0,N[G]=0,k[G]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:w,enabledAttributes:N,attributeDivisors:k,object:M,attributes:{},index:null}}function p(M,w,N,k){const G=r.attributes,W=w.attributes;let H=0;const q=N.getAttributes();for(const V in q)if(q[V].location>=0){const ct=G[V];let St=W[V];if(St===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(St=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(St=M.instanceColor)),ct===void 0||ct.attribute!==St||St&&ct.data!==St.data)return!0;H++}return r.attributesNum!==H||r.index!==k}function g(M,w,N,k){const G={},W=w.attributes;let H=0;const q=N.getAttributes();for(const V in q)if(q[V].location>=0){let ct=W[V];ct===void 0&&(V==="instanceMatrix"&&M.instanceMatrix&&(ct=M.instanceMatrix),V==="instanceColor"&&M.instanceColor&&(ct=M.instanceColor));const St={};St.attribute=ct,ct&&ct.data&&(St.data=ct.data),G[V]=St,H++}r.attributes=G,r.attributesNum=H,r.index=k}function _(){const M=r.newAttributes;for(let w=0,N=M.length;w<N;w++)M[w]=0}function m(M){d(M,0)}function d(M,w){const N=r.newAttributes,k=r.enabledAttributes,G=r.attributeDivisors;N[M]=1,k[M]===0&&(n.enableVertexAttribArray(M),k[M]=1),G[M]!==w&&(n.vertexAttribDivisor(M,w),G[M]=w)}function T(){const M=r.newAttributes,w=r.enabledAttributes;for(let N=0,k=w.length;N<k;N++)w[N]!==M[N]&&(n.disableVertexAttribArray(N),w[N]=0)}function v(M,w,N,k,G,W,H){H===!0?n.vertexAttribIPointer(M,w,N,G,W):n.vertexAttribPointer(M,w,N,k,G,W)}function S(M,w,N,k){_();const G=k.attributes,W=N.getAttributes(),H=w.defaultAttributeValues;for(const q in W){const V=W[q];if(V.location>=0){let it=G[q];if(it===void 0&&(q==="instanceMatrix"&&M.instanceMatrix&&(it=M.instanceMatrix),q==="instanceColor"&&M.instanceColor&&(it=M.instanceColor)),it!==void 0){const ct=it.normalized,St=it.itemSize,Nt=t.get(it);if(Nt===void 0)continue;const Ht=Nt.buffer,qt=Nt.type,Xt=Nt.bytesPerElement,Z=qt===n.INT||qt===n.UNSIGNED_INT||it.gpuType===Ro;if(it.isInterleavedBufferAttribute){const j=it.data,dt=j.stride,Ct=it.offset;if(j.isInstancedInterleavedBuffer){for(let yt=0;yt<V.locationSize;yt++)d(V.location+yt,j.meshPerAttribute);M.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let yt=0;yt<V.locationSize;yt++)m(V.location+yt);n.bindBuffer(n.ARRAY_BUFFER,Ht);for(let yt=0;yt<V.locationSize;yt++)v(V.location+yt,St/V.locationSize,qt,ct,dt*Xt,(Ct+St/V.locationSize*yt)*Xt,Z)}else{if(it.isInstancedBufferAttribute){for(let j=0;j<V.locationSize;j++)d(V.location+j,it.meshPerAttribute);M.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=it.meshPerAttribute*it.count)}else for(let j=0;j<V.locationSize;j++)m(V.location+j);n.bindBuffer(n.ARRAY_BUFFER,Ht);for(let j=0;j<V.locationSize;j++)v(V.location+j,St/V.locationSize,qt,ct,St*Xt,St/V.locationSize*j*Xt,Z)}}else if(H!==void 0){const ct=H[q];if(ct!==void 0)switch(ct.length){case 2:n.vertexAttrib2fv(V.location,ct);break;case 3:n.vertexAttrib3fv(V.location,ct);break;case 4:n.vertexAttrib4fv(V.location,ct);break;default:n.vertexAttrib1fv(V.location,ct)}}}}T()}function A(){D();for(const M in i){const w=i[M];for(const N in w){const k=w[N];for(const G in k)h(k[G].object),delete k[G];delete w[N]}delete i[M]}}function C(M){if(i[M.id]===void 0)return;const w=i[M.id];for(const N in w){const k=w[N];for(const G in k)h(k[G].object),delete k[G];delete w[N]}delete i[M.id]}function R(M){for(const w in i){const N=i[w];if(N[M.id]===void 0)continue;const k=N[M.id];for(const G in k)h(k[G].object),delete k[G];delete N[M.id]}}function D(){E(),a=!0,r!==s&&(r=s,l(r.object))}function E(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:D,resetDefaultState:E,dispose:A,releaseStatesOfGeometry:C,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:T}}function p_(n,t,e){let i;function s(l){i=l}function r(l,h){n.drawArrays(i,l,h),e.update(h,i,1)}function a(l,h,u){u!==0&&(n.drawArraysInstanced(i,l,h,u),e.update(h,i,u))}function o(l,h,u){if(u===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i,l,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];e.update(p,i,1)}function c(l,h,u,f){if(u===0)return;const p=t.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<l.length;g++)a(l[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(i,l,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*f[_];e.update(g,i,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=c}function m_(n,t,e,i){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const R=t.get("EXT_texture_filter_anisotropic");s=n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(R){return!(R!==Ze&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(R){const D=R===ws&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==rn&&i.convert(R)!==n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==en&&!D)}function c(R){if(R==="highp"){if(n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.HIGH_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&n.getShaderPrecisionFormat(n.VERTEX_SHADER,n.MEDIUM_FLOAT).precision>0&&n.getShaderPrecisionFormat(n.FRAGMENT_SHADER,n.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=e.precision!==void 0?e.precision:"highp";const h=c(l);h!==l&&(console.warn("THREE.WebGLRenderer:",l,"not supported, using",h,"instead."),l=h);const u=e.logarithmicDepthBuffer===!0,f=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),p=n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS),g=n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=n.getParameter(n.MAX_TEXTURE_SIZE),m=n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE),d=n.getParameter(n.MAX_VERTEX_ATTRIBS),T=n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS),v=n.getParameter(n.MAX_VARYING_VECTORS),S=n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS),A=g>0,C=n.getParameter(n.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:T,maxVaryings:v,maxFragmentUniforms:S,vertexTextures:A,maxSamples:C}}function g_(n){const t=this;let e=null,i=0,s=!1,r=!1;const a=new Zn,o=new It,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){const p=u.length!==0||f||i!==0||s;return s=f,i=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){e=h(u,f,0)},this.setState=function(u,f,p){const g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=n.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):l();else{const T=r?0:i,v=T*4;let S=d.clippingState||null;c.value=S,S=h(g,f,v,p);for(let A=0;A!==v;++A)S[A]=e[A];d.clippingState=S,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=T}};function l(){c.value!==e&&(c.value=e,c.needsUpdate=i>0),t.numPlanes=i,t.numIntersection=0}function h(u,f,p,g){const _=u!==null?u.length:0;let m=null;if(_!==0){if(m=c.value,g!==!0||m===null){const d=p+_*4,T=f.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<d)&&(m=new Float32Array(d));for(let v=0,S=p;v!==_;++v,S+=4)a.copy(u[v]).applyMatrix4(T,o),a.normal.toArray(m,S),m[S+3]=a.constant}c.value=m,c.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function __(n){let t=new WeakMap;function e(a,o){return o===Ga?a.mapping=ki:o===Wa&&(a.mapping=Hi),a}function i(a){if(a&&a.isTexture){const o=a.mapping;if(o===Ga||o===Wa)if(t.has(a)){const c=t.get(a).texture;return e(c,a.mapping)}else{const c=a.image;if(c&&c.height>0){const l=new up(c.height);return l.fromEquirectangularTexture(n,a),t.set(a,l),a.addEventListener("dispose",s),e(l.texture,a.mapping)}else return null}}return a}function s(a){const o=a.target;o.removeEventListener("dispose",s);const c=t.get(o);c!==void 0&&(t.delete(o),c.dispose())}function r(){t=new WeakMap}return{get:i,dispose:r}}const Pi=4,Jl=[.125,.215,.35,.446,.526,.582],jn=20,pa=new wh,Ql=new Ot;let ma=null,ga=0,_a=0,va=!1;const Kn=(1+Math.sqrt(5))/2,wi=1/Kn,tc=[new F(-Kn,wi,0),new F(Kn,wi,0),new F(-wi,0,Kn),new F(wi,0,Kn),new F(0,Kn,-wi),new F(0,Kn,wi),new F(-1,1,-1),new F(1,1,-1),new F(-1,1,1),new F(1,1,1)],v_=new F;class ec{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,i=.1,s=100,r={}){const{size:a=256,position:o=v_}=r;ma=this._renderer.getRenderTarget(),ga=this._renderer.getActiveCubeFace(),_a=this._renderer.getActiveMipmapLevel(),va=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);const c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,i,s,c,o),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=sc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=ic(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(ma,ga,_a),this._renderer.xr.enabled=va,t.scissorTest=!1,tr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ki||t.mapping===Hi?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),ma=this._renderer.getRenderTarget(),ga=this._renderer.getActiveCubeFace(),_a=this._renderer.getActiveMipmapLevel(),va=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const i=e||this._allocateTargets();return this._textureToCubeUV(t,i),this._applyPMREM(i),this._cleanup(i),i}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,i={magFilter:tn,minFilter:tn,generateMipmaps:!1,type:ws,format:Ze,colorSpace:Vi,depthBuffer:!1},s=nc(t,e,i);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=nc(t,e,i);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=x_(r)),this._blurMaterial=S_(r,t,e)}return s}_compileMaterial(t){const e=new Te(this._lodPlanes[0],t);this._renderer.compile(e,pa)}_sceneToCubeUV(t,e,i,s,r){const c=new Ne(90,1,e,i),l=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(Ql),u.toneMapping=In,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));const _=new wr({name:"PMREM.Background",side:Ce,depthWrite:!1,depthTest:!1}),m=new Te(new oi,_);let d=!1;const T=t.background;T?T.isColor&&(_.color.copy(T),t.background=null,d=!0):(_.color.copy(Ql),d=!0);for(let v=0;v<6;v++){const S=v%3;S===0?(c.up.set(0,l[v],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+h[v],r.y,r.z)):S===1?(c.up.set(0,0,l[v]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+h[v],r.z)):(c.up.set(0,l[v],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+h[v]));const A=this._cubeSize;tr(s,S*A,v>2?A:0,A,A),u.setRenderTarget(s),d&&u.render(m,c),u.render(t,c)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=f,t.background=T}_textureToCubeUV(t,e){const i=this._renderer,s=t.mapping===ki||t.mapping===Hi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=sc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=ic());const r=s?this._cubemapMaterial:this._equirectMaterial,a=new Te(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;const c=this._cubeSize;tr(e,0,0,3*c,2*c),i.setRenderTarget(e),i.render(a,pa)}_applyPMREM(t){const e=this._renderer,i=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=tc[(s-r-1)%tc.length];this._blur(t,r-1,r,a,o)}e.autoClear=i}_blur(t,e,i,s,r){const a=this._pingPongRenderTarget;this._halfBlur(t,a,e,i,s,"latitudinal",r),this._halfBlur(a,t,i,i,s,"longitudinal",r)}_halfBlur(t,e,i,s,r,a,o){const c=this._renderer,l=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Te(this._lodPlanes[s],l),f=l.uniforms,p=this._sizeLods[i]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*jn-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):jn;m>jn&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${jn}`);const d=[];let T=0;for(let R=0;R<jn;++R){const D=R/_,E=Math.exp(-D*D/2);d.push(E),R===0?T+=E:R<m&&(T+=2*E)}for(let R=0;R<d.length;R++)d[R]=d[R]/T;f.envMap.value=t.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=a==="latitudinal",o&&(f.poleAxis.value=o);const{_lodMax:v}=this;f.dTheta.value=g,f.mipInt.value=v-i;const S=this._sizeLods[s],A=3*S*(s>v-Pi?s-v+Pi:0),C=4*(this._cubeSize-S);tr(e,A,C,3*S,2*S),c.setRenderTarget(e),c.render(u,pa)}}function x_(n){const t=[],e=[],i=[];let s=n;const r=n-Pi+1+Jl.length;for(let a=0;a<r;a++){const o=Math.pow(2,s);e.push(o);let c=1/o;a>n-Pi?c=Jl[a-n+Pi-1]:a===0&&(c=0),i.push(c);const l=1/(o-2),h=-l,u=1+l,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,m=2,d=1,T=new Float32Array(_*g*p),v=new Float32Array(m*g*p),S=new Float32Array(d*g*p);for(let C=0;C<p;C++){const R=C%3*2/3-1,D=C>2?0:-1,E=[R,D,0,R+2/3,D,0,R+2/3,D+1,0,R,D,0,R+2/3,D+1,0,R,D+1,0];T.set(E,_*g*C),v.set(f,m*g*C);const M=[C,C,C,C,C,C];S.set(M,d*g*C)}const A=new on;A.setAttribute("position",new be(T,_)),A.setAttribute("uv",new be(v,m)),A.setAttribute("faceIndex",new be(S,d)),t.push(A),s>Pi&&s--}return{lodPlanes:t,sizeLods:e,sigmas:i}}function nc(n,t,e){const i=new ii(n,t,e);return i.texture.mapping=br,i.texture.name="PMREM.cubeUv",i.scissorTest=!0,i}function tr(n,t,e,i,s){n.viewport.set(t,e,i,s),n.scissor.set(t,e,i,s)}function S_(n,t,e){const i=new Float32Array(jn),s=new F(0,1,0);return new Fn({name:"SphericalGaussianBlur",defines:{n:jn,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${n}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:i},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function ic(){return new Fn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function sc(){return new Fn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:zo(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ln,depthTest:!1,depthWrite:!1})}function zo(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function M_(n){let t=new WeakMap,e=null;function i(o){if(o&&o.isTexture){const c=o.mapping,l=c===Ga||c===Wa,h=c===ki||c===Hi;if(l||h){let u=t.get(o);const f=u!==void 0?u.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==f)return e===null&&(e=new ec(n)),u=l?e.fromEquirectangular(o,u):e.fromCubemap(o,u),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),u.texture;if(u!==void 0)return u.texture;{const p=o.image;return l&&p&&p.height>0||h&&p&&s(p)?(e===null&&(e=new ec(n)),u=l?e.fromEquirectangular(o):e.fromCubemap(o),u.texture.pmremVersion=o.pmremVersion,t.set(o,u),o.addEventListener("dispose",r),u.texture):null}}}return o}function s(o){let c=0;const l=6;for(let h=0;h<l;h++)o[h]!==void 0&&c++;return c===l}function r(o){const c=o.target;c.removeEventListener("dispose",r);const l=t.get(c);l!==void 0&&(t.delete(c),l.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:i,dispose:a}}function y_(n){const t={};function e(i){if(t[i]!==void 0)return t[i];let s;switch(i){case"WEBGL_depth_texture":s=n.getExtension("WEBGL_depth_texture")||n.getExtension("MOZ_WEBGL_depth_texture")||n.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=n.getExtension("EXT_texture_filter_anisotropic")||n.getExtension("MOZ_EXT_texture_filter_anisotropic")||n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=n.getExtension("WEBGL_compressed_texture_s3tc")||n.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=n.getExtension("WEBGL_compressed_texture_pvrtc")||n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=n.getExtension(i)}return t[i]=s,s}return{has:function(i){return e(i)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(i){const s=e(i);return s===null&&bs("THREE.WebGLRenderer: "+i+" extension not supported."),s}}}function E_(n,t,e,i){const s={},r=new WeakMap;function a(u){const f=u.target;f.index!==null&&t.remove(f.index);for(const g in f.attributes)t.remove(f.attributes[g]);f.removeEventListener("dispose",a),delete s[f.id];const p=r.get(f);p&&(t.remove(p),r.delete(f)),i.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,e.memory.geometries--}function o(u,f){return s[f.id]===!0||(f.addEventListener("dispose",a),s[f.id]=!0,e.memory.geometries++),f}function c(u){const f=u.attributes;for(const p in f)t.update(f[p],n.ARRAY_BUFFER)}function l(u){const f=[],p=u.index,g=u.attributes.position;let _=0;if(p!==null){const T=p.array;_=p.version;for(let v=0,S=T.length;v<S;v+=3){const A=T[v+0],C=T[v+1],R=T[v+2];f.push(A,C,C,R,R,A)}}else if(g!==void 0){const T=g.array;_=g.version;for(let v=0,S=T.length/3-1;v<S;v+=3){const A=v+0,C=v+1,R=v+2;f.push(A,C,C,R,R,A)}}else return;const m=new(uh(f)?_h:gh)(f,1);m.version=_;const d=r.get(u);d&&t.remove(d),r.set(u,m)}function h(u){const f=r.get(u);if(f){const p=u.index;p!==null&&f.version<p.version&&l(u)}else l(u);return r.get(u)}return{get:o,update:c,getWireframeAttribute:h}}function T_(n,t,e){let i;function s(f){i=f}let r,a;function o(f){r=f.type,a=f.bytesPerElement}function c(f,p){n.drawElements(i,p,r,f*a),e.update(p,i,1)}function l(f,p,g){g!==0&&(n.drawElementsInstanced(i,p,r,f*a,g),e.update(p,i,g))}function h(f,p,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i,p,0,r,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];e.update(m,i,1)}function u(f,p,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)l(f[d]/a,p[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(i,p,0,r,f,0,_,0,g);let d=0;for(let T=0;T<g;T++)d+=p[T]*_[T];e.update(d,i,1)}}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function b_(n){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function i(r,a,o){switch(e.calls++,a){case n.TRIANGLES:e.triangles+=o*(r/3);break;case n.LINES:e.lines+=o*(r/2);break;case n.LINE_STRIP:e.lines+=o*(r-1);break;case n.LINE_LOOP:e.lines+=o*r;break;case n.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:i}}function w_(n,t,e){const i=new WeakMap,s=new $t;function r(a,o,c){const l=a.morphTargetInfluences,h=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,u=h!==void 0?h.length:0;let f=i.get(o);if(f===void 0||f.count!==u){let M=function(){D.dispose(),i.delete(o),o.removeEventListener("dispose",M)};var p=M;f!==void 0&&f.texture.dispose();const g=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,m=o.morphAttributes.color!==void 0,d=o.morphAttributes.position||[],T=o.morphAttributes.normal||[],v=o.morphAttributes.color||[];let S=0;g===!0&&(S=1),_===!0&&(S=2),m===!0&&(S=3);let A=o.attributes.position.count*S,C=1;A>t.maxTextureSize&&(C=Math.ceil(A/t.maxTextureSize),A=t.maxTextureSize);const R=new Float32Array(A*C*4*u),D=new dh(R,A,C,u);D.type=en,D.needsUpdate=!0;const E=S*4;for(let w=0;w<u;w++){const N=d[w],k=T[w],G=v[w],W=A*C*4*w;for(let H=0;H<N.count;H++){const q=H*E;g===!0&&(s.fromBufferAttribute(N,H),R[W+q+0]=s.x,R[W+q+1]=s.y,R[W+q+2]=s.z,R[W+q+3]=0),_===!0&&(s.fromBufferAttribute(k,H),R[W+q+4]=s.x,R[W+q+5]=s.y,R[W+q+6]=s.z,R[W+q+7]=0),m===!0&&(s.fromBufferAttribute(G,H),R[W+q+8]=s.x,R[W+q+9]=s.y,R[W+q+10]=s.z,R[W+q+11]=G.itemSize===4?s.w:1)}}f={count:u,texture:D,size:new Wt(A,C)},i.set(o,f),o.addEventListener("dispose",M)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(n,"morphTexture",a.morphTexture,e);else{let g=0;for(let m=0;m<l.length;m++)g+=l[m];const _=o.morphTargetsRelative?1:1-g;c.getUniforms().setValue(n,"morphTargetBaseInfluence",_),c.getUniforms().setValue(n,"morphTargetInfluences",l)}c.getUniforms().setValue(n,"morphTargetsTexture",f.texture,e),c.getUniforms().setValue(n,"morphTargetsTextureSize",f.size)}return{update:r}}function A_(n,t,e,i){let s=new WeakMap;function r(c){const l=i.render.frame,h=c.geometry,u=t.get(c,h);if(s.get(u)!==l&&(t.update(u),s.set(u,l)),c.isInstancedMesh&&(c.hasEventListener("dispose",o)===!1&&c.addEventListener("dispose",o),s.get(c)!==l&&(e.update(c.instanceMatrix,n.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,n.ARRAY_BUFFER),s.set(c,l))),c.isSkinnedMesh){const f=c.skeleton;s.get(f)!==l&&(f.update(),s.set(f,l))}return u}function a(){s=new WeakMap}function o(c){const l=c.target;l.removeEventListener("dispose",o),e.remove(l.instanceMatrix),l.instanceColor!==null&&e.remove(l.instanceColor)}return{update:r,dispose:a}}const Rh=new Me,rc=new Eh(1,1),Ch=new dh,Ph=new Zf,Dh=new Sh,ac=[],oc=[],lc=new Float32Array(16),cc=new Float32Array(9),hc=new Float32Array(4);function Ki(n,t,e){const i=n[0];if(i<=0||i>0)return n;const s=t*e;let r=ac[s];if(r===void 0&&(r=new Float32Array(s),ac[s]=r),t!==0){i.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,n[a].toArray(r,o)}return r}function ue(n,t){if(n.length!==t.length)return!1;for(let e=0,i=n.length;e<i;e++)if(n[e]!==t[e])return!1;return!0}function de(n,t){for(let e=0,i=t.length;e<i;e++)n[e]=t[e]}function Rr(n,t){let e=oc[t];e===void 0&&(e=new Int32Array(t),oc[t]=e);for(let i=0;i!==t;++i)e[i]=n.allocateTextureUnit();return e}function R_(n,t){const e=this.cache;e[0]!==t&&(n.uniform1f(this.addr,t),e[0]=t)}function C_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ue(e,t))return;n.uniform2fv(this.addr,t),de(e,t)}}function P_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(n.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(ue(e,t))return;n.uniform3fv(this.addr,t),de(e,t)}}function D_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ue(e,t))return;n.uniform4fv(this.addr,t),de(e,t)}}function L_(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(ue(e,t))return;n.uniformMatrix2fv(this.addr,!1,t),de(e,t)}else{if(ue(e,i))return;hc.set(i),n.uniformMatrix2fv(this.addr,!1,hc),de(e,i)}}function I_(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(ue(e,t))return;n.uniformMatrix3fv(this.addr,!1,t),de(e,t)}else{if(ue(e,i))return;cc.set(i),n.uniformMatrix3fv(this.addr,!1,cc),de(e,i)}}function U_(n,t){const e=this.cache,i=t.elements;if(i===void 0){if(ue(e,t))return;n.uniformMatrix4fv(this.addr,!1,t),de(e,t)}else{if(ue(e,i))return;lc.set(i),n.uniformMatrix4fv(this.addr,!1,lc),de(e,i)}}function F_(n,t){const e=this.cache;e[0]!==t&&(n.uniform1i(this.addr,t),e[0]=t)}function N_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ue(e,t))return;n.uniform2iv(this.addr,t),de(e,t)}}function O_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ue(e,t))return;n.uniform3iv(this.addr,t),de(e,t)}}function B_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ue(e,t))return;n.uniform4iv(this.addr,t),de(e,t)}}function z_(n,t){const e=this.cache;e[0]!==t&&(n.uniform1ui(this.addr,t),e[0]=t)}function k_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(n.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(ue(e,t))return;n.uniform2uiv(this.addr,t),de(e,t)}}function H_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(n.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(ue(e,t))return;n.uniform3uiv(this.addr,t),de(e,t)}}function V_(n,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(n.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(ue(e,t))return;n.uniform4uiv(this.addr,t),de(e,t)}}function G_(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s);let r;this.type===n.SAMPLER_2D_SHADOW?(rc.compareFunction=hh,r=rc):r=Rh,e.setTexture2D(t||r,s)}function W_(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture3D(t||Ph,s)}function X_(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTextureCube(t||Dh,s)}function Y_(n,t,e){const i=this.cache,s=e.allocateTextureUnit();i[0]!==s&&(n.uniform1i(this.addr,s),i[0]=s),e.setTexture2DArray(t||Ch,s)}function q_(n){switch(n){case 5126:return R_;case 35664:return C_;case 35665:return P_;case 35666:return D_;case 35674:return L_;case 35675:return I_;case 35676:return U_;case 5124:case 35670:return F_;case 35667:case 35671:return N_;case 35668:case 35672:return O_;case 35669:case 35673:return B_;case 5125:return z_;case 36294:return k_;case 36295:return H_;case 36296:return V_;case 35678:case 36198:case 36298:case 36306:case 35682:return G_;case 35679:case 36299:case 36307:return W_;case 35680:case 36300:case 36308:case 36293:return X_;case 36289:case 36303:case 36311:case 36292:return Y_}}function Z_(n,t){n.uniform1fv(this.addr,t)}function K_(n,t){const e=Ki(t,this.size,2);n.uniform2fv(this.addr,e)}function $_(n,t){const e=Ki(t,this.size,3);n.uniform3fv(this.addr,e)}function j_(n,t){const e=Ki(t,this.size,4);n.uniform4fv(this.addr,e)}function J_(n,t){const e=Ki(t,this.size,4);n.uniformMatrix2fv(this.addr,!1,e)}function Q_(n,t){const e=Ki(t,this.size,9);n.uniformMatrix3fv(this.addr,!1,e)}function t0(n,t){const e=Ki(t,this.size,16);n.uniformMatrix4fv(this.addr,!1,e)}function e0(n,t){n.uniform1iv(this.addr,t)}function n0(n,t){n.uniform2iv(this.addr,t)}function i0(n,t){n.uniform3iv(this.addr,t)}function s0(n,t){n.uniform4iv(this.addr,t)}function r0(n,t){n.uniform1uiv(this.addr,t)}function a0(n,t){n.uniform2uiv(this.addr,t)}function o0(n,t){n.uniform3uiv(this.addr,t)}function l0(n,t){n.uniform4uiv(this.addr,t)}function c0(n,t,e){const i=this.cache,s=t.length,r=Rr(e,s);ue(i,r)||(n.uniform1iv(this.addr,r),de(i,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||Rh,r[a])}function h0(n,t,e){const i=this.cache,s=t.length,r=Rr(e,s);ue(i,r)||(n.uniform1iv(this.addr,r),de(i,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Ph,r[a])}function u0(n,t,e){const i=this.cache,s=t.length,r=Rr(e,s);ue(i,r)||(n.uniform1iv(this.addr,r),de(i,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Dh,r[a])}function d0(n,t,e){const i=this.cache,s=t.length,r=Rr(e,s);ue(i,r)||(n.uniform1iv(this.addr,r),de(i,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||Ch,r[a])}function f0(n){switch(n){case 5126:return Z_;case 35664:return K_;case 35665:return $_;case 35666:return j_;case 35674:return J_;case 35675:return Q_;case 35676:return t0;case 5124:case 35670:return e0;case 35667:case 35671:return n0;case 35668:case 35672:return i0;case 35669:case 35673:return s0;case 5125:return r0;case 36294:return a0;case 36295:return o0;case 36296:return l0;case 35678:case 36198:case 36298:case 36306:case 35682:return c0;case 35679:case 36299:case 36307:return h0;case 35680:case 36300:case 36308:case 36293:return u0;case 36289:case 36303:case 36311:case 36292:return d0}}class p0{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.setValue=q_(e.type)}}class m0{constructor(t,e,i){this.id=t,this.addr=i,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=f0(e.type)}}class g0{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,i){const s=this.seq;for(let r=0,a=s.length;r!==a;++r){const o=s[r];o.setValue(t,e[o.id],i)}}}const xa=/(\w+)(\])?(\[|\.)?/g;function uc(n,t){n.seq.push(t),n.map[t.id]=t}function _0(n,t,e){const i=n.name,s=i.length;for(xa.lastIndex=0;;){const r=xa.exec(i),a=xa.lastIndex;let o=r[1];const c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){uc(e,l===void 0?new p0(o,n,t):new m0(o,n,t));break}else{let u=e.map[o];u===void 0&&(u=new g0(o),uc(e,u)),e=u}}}class gr{constructor(t,e){this.seq=[],this.map={};const i=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<i;++s){const r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);_0(r,a,this)}}setValue(t,e,i,s){const r=this.map[e];r!==void 0&&r.setValue(t,i,s)}setOptional(t,e,i){const s=e[i];s!==void 0&&this.setValue(t,i,s)}static upload(t,e,i,s){for(let r=0,a=e.length;r!==a;++r){const o=e[r],c=i[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){const i=[];for(let s=0,r=t.length;s!==r;++s){const a=t[s];a.id in e&&i.push(a)}return i}}function dc(n,t,e){const i=n.createShader(t);return n.shaderSource(i,e),n.compileShader(i),i}const v0=37297;let x0=0;function S0(n,t){const e=n.split(`
`),i=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){const o=a+1;i.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return i.join(`
`)}const fc=new It;function M0(n){Gt._getMatrix(fc,Gt.workingColorSpace,n);const t=`mat3( ${fc.elements.map(e=>e.toFixed(4))} )`;switch(Gt.getTransfer(n)){case xr:return[t,"LinearTransferOETF"];case Kt:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",n),[t,"LinearTransferOETF"]}}function pc(n,t,e){const i=n.getShaderParameter(t,n.COMPILE_STATUS),r=(n.getShaderInfoLog(t)||"").trim();if(i&&r==="")return"";const a=/ERROR: 0:(\d+)/.exec(r);if(a){const o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+S0(n.getShaderSource(t),o)}else return r}function y0(n,t){const e=M0(t);return[`vec4 ${n}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function E0(n,t){let e;switch(t){case yf:e="Linear";break;case Ef:e="Reinhard";break;case Tf:e="Cineon";break;case th:e="ACESFilmic";break;case wf:e="AgX";break;case Af:e="Neutral";break;case bf:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+n+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const er=new F;function T0(){Gt.getLuminanceCoefficients(er);const n=er.x.toFixed(4),t=er.y.toFixed(4),e=er.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${n}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function b0(n){return[n.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",n.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(gs).join(`
`)}function w0(n){const t=[];for(const e in n){const i=n[e];i!==!1&&t.push("#define "+e+" "+i)}return t.join(`
`)}function A0(n,t){const e={},i=n.getProgramParameter(t,n.ACTIVE_ATTRIBUTES);for(let s=0;s<i;s++){const r=n.getActiveAttrib(t,s),a=r.name;let o=1;r.type===n.FLOAT_MAT2&&(o=2),r.type===n.FLOAT_MAT3&&(o=3),r.type===n.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:n.getAttribLocation(t,a),locationSize:o}}return e}function gs(n){return n!==""}function mc(n,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return n.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function gc(n,t){return n.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const R0=/^[ \t]*#include +<([\w\d./]+)>/gm;function yo(n){return n.replace(R0,P0)}const C0=new Map;function P0(n,t){let e=Ft[t];if(e===void 0){const i=C0.get(t);if(i!==void 0)e=Ft[i],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,i);else throw new Error("Can not resolve #include <"+t+">")}return yo(e)}const D0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function _c(n){return n.replace(D0,L0)}function L0(n,t,e,i){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=i.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function vc(n){let t=`precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;return n.precision==="highp"?t+=`
#define HIGH_PRECISION`:n.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:n.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function I0(n){let t="SHADOWMAP_TYPE_BASIC";return n.shadowMapType===Jc?t="SHADOWMAP_TYPE_PCF":n.shadowMapType===tf?t="SHADOWMAP_TYPE_PCF_SOFT":n.shadowMapType===mn&&(t="SHADOWMAP_TYPE_VSM"),t}function U0(n){let t="ENVMAP_TYPE_CUBE";if(n.envMap)switch(n.envMapMode){case ki:case Hi:t="ENVMAP_TYPE_CUBE";break;case br:t="ENVMAP_TYPE_CUBE_UV";break}return t}function F0(n){let t="ENVMAP_MODE_REFLECTION";if(n.envMap)switch(n.envMapMode){case Hi:t="ENVMAP_MODE_REFRACTION";break}return t}function N0(n){let t="ENVMAP_BLENDING_NONE";if(n.envMap)switch(n.combine){case Qc:t="ENVMAP_BLENDING_MULTIPLY";break;case Sf:t="ENVMAP_BLENDING_MIX";break;case Mf:t="ENVMAP_BLENDING_ADD";break}return t}function O0(n){const t=n.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,i=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:i,maxMip:e}}function B0(n,t,e,i){const s=n.getContext(),r=e.defines;let a=e.vertexShader,o=e.fragmentShader;const c=I0(e),l=U0(e),h=F0(e),u=N0(e),f=O0(e),p=b0(e),g=w0(r),_=s.createProgram();let m,d,T=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(gs).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(gs).join(`
`),d.length>0&&(d+=`
`)):(m=[vc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(gs).join(`
`),d=[vc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+l:"",e.envMap?"#define "+h:"",e.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==In?"#define TONE_MAPPING":"",e.toneMapping!==In?Ft.tonemapping_pars_fragment:"",e.toneMapping!==In?E0("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Ft.colorspace_pars_fragment,y0("linearToOutputTexel",e.outputColorSpace),T0(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(gs).join(`
`)),a=yo(a),a=mc(a,e),a=gc(a,e),o=yo(o),o=mc(o,e),o=gc(o,e),a=_c(a),o=_c(o),e.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",e.glslVersion===yl?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===yl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);const v=T+m+a,S=T+d+o,A=dc(s,s.VERTEX_SHADER,v),C=dc(s,s.FRAGMENT_SHADER,S);s.attachShader(_,A),s.attachShader(_,C),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(w){if(n.debug.checkShaderErrors){const N=s.getProgramInfoLog(_)||"",k=s.getShaderInfoLog(A)||"",G=s.getShaderInfoLog(C)||"",W=N.trim(),H=k.trim(),q=G.trim();let V=!0,it=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(V=!1,typeof n.debug.onShaderError=="function")n.debug.onShaderError(s,_,A,C);else{const ct=pc(s,A,"vertex"),St=pc(s,C,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+W+`
`+ct+`
`+St)}else W!==""?console.warn("THREE.WebGLProgram: Program Info Log:",W):(H===""||q==="")&&(it=!1);it&&(w.diagnostics={runnable:V,programLog:W,vertexShader:{log:H,prefix:m},fragmentShader:{log:q,prefix:d}})}s.deleteShader(A),s.deleteShader(C),D=new gr(s,_),E=A0(s,_)}let D;this.getUniforms=function(){return D===void 0&&R(this),D};let E;this.getAttributes=function(){return E===void 0&&R(this),E};let M=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return M===!1&&(M=s.getProgramParameter(_,v0)),M},this.destroy=function(){i.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=x0++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=A,this.fragmentShader=C,this}let z0=0;class k0{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,i=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(i),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const i of e)i.usedTimes--,i.usedTimes===0&&this.shaderCache.delete(i.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let i=e.get(t);return i===void 0&&(i=new Set,e.set(t,i)),i}_getShaderStage(t){const e=this.shaderCache;let i=e.get(t);return i===void 0&&(i=new H0(t),e.set(t,i)),i}}class H0{constructor(t){this.id=z0++,this.code=t,this.usedTimes=0}}function V0(n,t,e,i,s,r,a){const o=new ph,c=new k0,l=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures;let p=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(E){return l.add(E),E===0?"uv":`uv${E}`}function m(E,M,w,N,k){const G=N.fog,W=k.geometry,H=E.isMeshStandardMaterial?N.environment:null,q=(E.isMeshStandardMaterial?e:t).get(E.envMap||H),V=q&&q.mapping===br?q.image.height:null,it=g[E.type];E.precision!==null&&(p=s.getMaxPrecision(E.precision),p!==E.precision&&console.warn("THREE.WebGLProgram.getParameters:",E.precision,"not supported, using",p,"instead."));const ct=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,St=ct!==void 0?ct.length:0;let Nt=0;W.morphAttributes.position!==void 0&&(Nt=1),W.morphAttributes.normal!==void 0&&(Nt=2),W.morphAttributes.color!==void 0&&(Nt=3);let Ht,qt,Xt,Z;if(it){const Yt=Qe[it];Ht=Yt.vertexShader,qt=Yt.fragmentShader}else Ht=E.vertexShader,qt=E.fragmentShader,c.update(E),Xt=c.getVertexShaderID(E),Z=c.getFragmentShaderID(E);const j=n.getRenderTarget(),dt=n.state.buffers.depth.getReversed(),Ct=k.isInstancedMesh===!0,yt=k.isBatchedMesh===!0,kt=!!E.map,ge=!!E.matcap,P=!!q,ee=!!E.aoMap,Dt=!!E.lightMap,At=!!E.bumpMap,mt=!!E.normalMap,ne=!!E.displacementMap,gt=!!E.emissiveMap,Ut=!!E.metalnessMap,fe=!!E.roughnessMap,le=E.anisotropy>0,b=E.clearcoat>0,x=E.dispersion>0,O=E.iridescence>0,Y=E.sheen>0,$=E.transmission>0,X=le&&!!E.anisotropyMap,Mt=b&&!!E.clearcoatMap,nt=b&&!!E.clearcoatNormalMap,_t=b&&!!E.clearcoatRoughnessMap,vt=O&&!!E.iridescenceMap,tt=O&&!!E.iridescenceThicknessMap,lt=Y&&!!E.sheenColorMap,wt=Y&&!!E.sheenRoughnessMap,xt=!!E.specularMap,at=!!E.specularColorMap,Lt=!!E.specularIntensityMap,L=$&&!!E.transmissionMap,et=$&&!!E.thicknessMap,st=!!E.gradientMap,ut=!!E.alphaMap,J=E.alphaTest>0,K=!!E.alphaHash,pt=!!E.extensions;let Pt=In;E.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Pt=n.toneMapping);const Qt={shaderID:it,shaderType:E.type,shaderName:E.name,vertexShader:Ht,fragmentShader:qt,defines:E.defines,customVertexShaderID:Xt,customFragmentShaderID:Z,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:p,batching:yt,batchingColor:yt&&k._colorsTexture!==null,instancing:Ct,instancingColor:Ct&&k.instanceColor!==null,instancingMorph:Ct&&k.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:j===null?n.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Vi,alphaToCoverage:!!E.alphaToCoverage,map:kt,matcap:ge,envMap:P,envMapMode:P&&q.mapping,envMapCubeUVHeight:V,aoMap:ee,lightMap:Dt,bumpMap:At,normalMap:mt,displacementMap:f&&ne,emissiveMap:gt,normalMapObjectSpace:mt&&E.normalMapType===Df,normalMapTangentSpace:mt&&E.normalMapType===ch,metalnessMap:Ut,roughnessMap:fe,anisotropy:le,anisotropyMap:X,clearcoat:b,clearcoatMap:Mt,clearcoatNormalMap:nt,clearcoatRoughnessMap:_t,dispersion:x,iridescence:O,iridescenceMap:vt,iridescenceThicknessMap:tt,sheen:Y,sheenColorMap:lt,sheenRoughnessMap:wt,specularMap:xt,specularColorMap:at,specularIntensityMap:Lt,transmission:$,transmissionMap:L,thicknessMap:et,gradientMap:st,opaque:E.transparent===!1&&E.blending===Ni&&E.alphaToCoverage===!1,alphaMap:ut,alphaTest:J,alphaHash:K,combine:E.combine,mapUv:kt&&_(E.map.channel),aoMapUv:ee&&_(E.aoMap.channel),lightMapUv:Dt&&_(E.lightMap.channel),bumpMapUv:At&&_(E.bumpMap.channel),normalMapUv:mt&&_(E.normalMap.channel),displacementMapUv:ne&&_(E.displacementMap.channel),emissiveMapUv:gt&&_(E.emissiveMap.channel),metalnessMapUv:Ut&&_(E.metalnessMap.channel),roughnessMapUv:fe&&_(E.roughnessMap.channel),anisotropyMapUv:X&&_(E.anisotropyMap.channel),clearcoatMapUv:Mt&&_(E.clearcoatMap.channel),clearcoatNormalMapUv:nt&&_(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:_t&&_(E.clearcoatRoughnessMap.channel),iridescenceMapUv:vt&&_(E.iridescenceMap.channel),iridescenceThicknessMapUv:tt&&_(E.iridescenceThicknessMap.channel),sheenColorMapUv:lt&&_(E.sheenColorMap.channel),sheenRoughnessMapUv:wt&&_(E.sheenRoughnessMap.channel),specularMapUv:xt&&_(E.specularMap.channel),specularColorMapUv:at&&_(E.specularColorMap.channel),specularIntensityMapUv:Lt&&_(E.specularIntensityMap.channel),transmissionMapUv:L&&_(E.transmissionMap.channel),thicknessMapUv:et&&_(E.thicknessMap.channel),alphaMapUv:ut&&_(E.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(mt||le),vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:k.isPoints===!0&&!!W.attributes.uv&&(kt||ut),fog:!!G,useFog:E.fog===!0,fogExp2:!!G&&G.isFogExp2,flatShading:E.flatShading===!0&&E.wireframe===!1,sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:dt,skinning:k.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:St,morphTextureStride:Nt,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:E.dithering,shadowMapEnabled:n.shadowMap.enabled&&w.length>0,shadowMapType:n.shadowMap.type,toneMapping:Pt,decodeVideoTexture:kt&&E.map.isVideoTexture===!0&&Gt.getTransfer(E.map.colorSpace)===Kt,decodeVideoTextureEmissive:gt&&E.emissiveMap.isVideoTexture===!0&&Gt.getTransfer(E.emissiveMap.colorSpace)===Kt,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===gn,flipSided:E.side===Ce,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:pt&&E.extensions.clipCullDistance===!0&&i.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(pt&&E.extensions.multiDraw===!0||yt)&&i.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:i.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return Qt.vertexUv1s=l.has(1),Qt.vertexUv2s=l.has(2),Qt.vertexUv3s=l.has(3),l.clear(),Qt}function d(E){const M=[];if(E.shaderID?M.push(E.shaderID):(M.push(E.customVertexShaderID),M.push(E.customFragmentShaderID)),E.defines!==void 0)for(const w in E.defines)M.push(w),M.push(E.defines[w]);return E.isRawShaderMaterial===!1&&(T(M,E),v(M,E),M.push(n.outputColorSpace)),M.push(E.customProgramCacheKey),M.join()}function T(E,M){E.push(M.precision),E.push(M.outputColorSpace),E.push(M.envMapMode),E.push(M.envMapCubeUVHeight),E.push(M.mapUv),E.push(M.alphaMapUv),E.push(M.lightMapUv),E.push(M.aoMapUv),E.push(M.bumpMapUv),E.push(M.normalMapUv),E.push(M.displacementMapUv),E.push(M.emissiveMapUv),E.push(M.metalnessMapUv),E.push(M.roughnessMapUv),E.push(M.anisotropyMapUv),E.push(M.clearcoatMapUv),E.push(M.clearcoatNormalMapUv),E.push(M.clearcoatRoughnessMapUv),E.push(M.iridescenceMapUv),E.push(M.iridescenceThicknessMapUv),E.push(M.sheenColorMapUv),E.push(M.sheenRoughnessMapUv),E.push(M.specularMapUv),E.push(M.specularColorMapUv),E.push(M.specularIntensityMapUv),E.push(M.transmissionMapUv),E.push(M.thicknessMapUv),E.push(M.combine),E.push(M.fogExp2),E.push(M.sizeAttenuation),E.push(M.morphTargetsCount),E.push(M.morphAttributeCount),E.push(M.numDirLights),E.push(M.numPointLights),E.push(M.numSpotLights),E.push(M.numSpotLightMaps),E.push(M.numHemiLights),E.push(M.numRectAreaLights),E.push(M.numDirLightShadows),E.push(M.numPointLightShadows),E.push(M.numSpotLightShadows),E.push(M.numSpotLightShadowsWithMaps),E.push(M.numLightProbes),E.push(M.shadowMapType),E.push(M.toneMapping),E.push(M.numClippingPlanes),E.push(M.numClipIntersection),E.push(M.depthPacking)}function v(E,M){o.disableAll(),M.supportsVertexTextures&&o.enable(0),M.instancing&&o.enable(1),M.instancingColor&&o.enable(2),M.instancingMorph&&o.enable(3),M.matcap&&o.enable(4),M.envMap&&o.enable(5),M.normalMapObjectSpace&&o.enable(6),M.normalMapTangentSpace&&o.enable(7),M.clearcoat&&o.enable(8),M.iridescence&&o.enable(9),M.alphaTest&&o.enable(10),M.vertexColors&&o.enable(11),M.vertexAlphas&&o.enable(12),M.vertexUv1s&&o.enable(13),M.vertexUv2s&&o.enable(14),M.vertexUv3s&&o.enable(15),M.vertexTangents&&o.enable(16),M.anisotropy&&o.enable(17),M.alphaHash&&o.enable(18),M.batching&&o.enable(19),M.dispersion&&o.enable(20),M.batchingColor&&o.enable(21),M.gradientMap&&o.enable(22),E.push(o.mask),o.disableAll(),M.fog&&o.enable(0),M.useFog&&o.enable(1),M.flatShading&&o.enable(2),M.logarithmicDepthBuffer&&o.enable(3),M.reversedDepthBuffer&&o.enable(4),M.skinning&&o.enable(5),M.morphTargets&&o.enable(6),M.morphNormals&&o.enable(7),M.morphColors&&o.enable(8),M.premultipliedAlpha&&o.enable(9),M.shadowMapEnabled&&o.enable(10),M.doubleSided&&o.enable(11),M.flipSided&&o.enable(12),M.useDepthPacking&&o.enable(13),M.dithering&&o.enable(14),M.transmission&&o.enable(15),M.sheen&&o.enable(16),M.opaque&&o.enable(17),M.pointsUvs&&o.enable(18),M.decodeVideoTexture&&o.enable(19),M.decodeVideoTextureEmissive&&o.enable(20),M.alphaToCoverage&&o.enable(21),E.push(o.mask)}function S(E){const M=g[E.type];let w;if(M){const N=Qe[M];w=op.clone(N.uniforms)}else w=E.uniforms;return w}function A(E,M){let w;for(let N=0,k=h.length;N<k;N++){const G=h[N];if(G.cacheKey===M){w=G,++w.usedTimes;break}}return w===void 0&&(w=new B0(n,M,E,r),h.push(w)),w}function C(E){if(--E.usedTimes===0){const M=h.indexOf(E);h[M]=h[h.length-1],h.pop(),E.destroy()}}function R(E){c.remove(E)}function D(){c.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:S,acquireProgram:A,releaseProgram:C,releaseShaderCache:R,programs:h,dispose:D}}function G0(){let n=new WeakMap;function t(a){return n.has(a)}function e(a){let o=n.get(a);return o===void 0&&(o={},n.set(a,o)),o}function i(a){n.delete(a)}function s(a,o,c){n.get(a)[o]=c}function r(){n=new WeakMap}return{has:t,get:e,remove:i,update:s,dispose:r}}function W0(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.material.id!==t.material.id?n.material.id-t.material.id:n.z!==t.z?n.z-t.z:n.id-t.id}function xc(n,t){return n.groupOrder!==t.groupOrder?n.groupOrder-t.groupOrder:n.renderOrder!==t.renderOrder?n.renderOrder-t.renderOrder:n.z!==t.z?t.z-n.z:n.id-t.id}function Sc(){const n=[];let t=0;const e=[],i=[],s=[];function r(){t=0,e.length=0,i.length=0,s.length=0}function a(u,f,p,g,_,m){let d=n[t];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},n[t]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),t++,d}function o(u,f,p,g,_,m){const d=a(u,f,p,g,_,m);p.transmission>0?i.push(d):p.transparent===!0?s.push(d):e.push(d)}function c(u,f,p,g,_,m){const d=a(u,f,p,g,_,m);p.transmission>0?i.unshift(d):p.transparent===!0?s.unshift(d):e.unshift(d)}function l(u,f){e.length>1&&e.sort(u||W0),i.length>1&&i.sort(f||xc),s.length>1&&s.sort(f||xc)}function h(){for(let u=t,f=n.length;u<f;u++){const p=n[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:e,transmissive:i,transparent:s,init:r,push:o,unshift:c,finish:h,sort:l}}function X0(){let n=new WeakMap;function t(i,s){const r=n.get(i);let a;return r===void 0?(a=new Sc,n.set(i,[a])):s>=r.length?(a=new Sc,r.push(a)):a=r[s],a}function e(){n=new WeakMap}return{get:t,dispose:e}}function Y0(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new F,color:new Ot};break;case"SpotLight":e={position:new F,direction:new F,color:new Ot,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new F,color:new Ot,distance:0,decay:0};break;case"HemisphereLight":e={direction:new F,skyColor:new Ot,groundColor:new Ot};break;case"RectAreaLight":e={color:new Ot,position:new F,halfWidth:new F,halfHeight:new F};break}return n[t.id]=e,e}}}function q0(){const n={};return{get:function(t){if(n[t.id]!==void 0)return n[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Wt,shadowCameraNear:1,shadowCameraFar:1e3};break}return n[t.id]=e,e}}}let Z0=0;function K0(n,t){return(t.castShadow?2:0)-(n.castShadow?2:0)+(t.map?1:0)-(n.map?1:0)}function $0(n){const t=new Y0,e=q0(),i={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)i.probe.push(new F);const s=new F,r=new Jt,a=new Jt;function o(l){let h=0,u=0,f=0;for(let E=0;E<9;E++)i.probe[E].set(0,0,0);let p=0,g=0,_=0,m=0,d=0,T=0,v=0,S=0,A=0,C=0,R=0;l.sort(K0);for(let E=0,M=l.length;E<M;E++){const w=l[E],N=w.color,k=w.intensity,G=w.distance,W=w.shadow&&w.shadow.map?w.shadow.map.texture:null;if(w.isAmbientLight)h+=N.r*k,u+=N.g*k,f+=N.b*k;else if(w.isLightProbe){for(let H=0;H<9;H++)i.probe[H].addScaledVector(w.sh.coefficients[H],k);R++}else if(w.isDirectionalLight){const H=t.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),w.castShadow){const q=w.shadow,V=e.get(w);V.shadowIntensity=q.intensity,V.shadowBias=q.bias,V.shadowNormalBias=q.normalBias,V.shadowRadius=q.radius,V.shadowMapSize=q.mapSize,i.directionalShadow[p]=V,i.directionalShadowMap[p]=W,i.directionalShadowMatrix[p]=w.shadow.matrix,T++}i.directional[p]=H,p++}else if(w.isSpotLight){const H=t.get(w);H.position.setFromMatrixPosition(w.matrixWorld),H.color.copy(N).multiplyScalar(k),H.distance=G,H.coneCos=Math.cos(w.angle),H.penumbraCos=Math.cos(w.angle*(1-w.penumbra)),H.decay=w.decay,i.spot[_]=H;const q=w.shadow;if(w.map&&(i.spotLightMap[A]=w.map,A++,q.updateMatrices(w),w.castShadow&&C++),i.spotLightMatrix[_]=q.matrix,w.castShadow){const V=e.get(w);V.shadowIntensity=q.intensity,V.shadowBias=q.bias,V.shadowNormalBias=q.normalBias,V.shadowRadius=q.radius,V.shadowMapSize=q.mapSize,i.spotShadow[_]=V,i.spotShadowMap[_]=W,S++}_++}else if(w.isRectAreaLight){const H=t.get(w);H.color.copy(N).multiplyScalar(k),H.halfWidth.set(w.width*.5,0,0),H.halfHeight.set(0,w.height*.5,0),i.rectArea[m]=H,m++}else if(w.isPointLight){const H=t.get(w);if(H.color.copy(w.color).multiplyScalar(w.intensity),H.distance=w.distance,H.decay=w.decay,w.castShadow){const q=w.shadow,V=e.get(w);V.shadowIntensity=q.intensity,V.shadowBias=q.bias,V.shadowNormalBias=q.normalBias,V.shadowRadius=q.radius,V.shadowMapSize=q.mapSize,V.shadowCameraNear=q.camera.near,V.shadowCameraFar=q.camera.far,i.pointShadow[g]=V,i.pointShadowMap[g]=W,i.pointShadowMatrix[g]=w.shadow.matrix,v++}i.point[g]=H,g++}else if(w.isHemisphereLight){const H=t.get(w);H.skyColor.copy(w.color).multiplyScalar(k),H.groundColor.copy(w.groundColor).multiplyScalar(k),i.hemi[d]=H,d++}}m>0&&(n.has("OES_texture_float_linear")===!0?(i.rectAreaLTC1=rt.LTC_FLOAT_1,i.rectAreaLTC2=rt.LTC_FLOAT_2):(i.rectAreaLTC1=rt.LTC_HALF_1,i.rectAreaLTC2=rt.LTC_HALF_2)),i.ambient[0]=h,i.ambient[1]=u,i.ambient[2]=f;const D=i.hash;(D.directionalLength!==p||D.pointLength!==g||D.spotLength!==_||D.rectAreaLength!==m||D.hemiLength!==d||D.numDirectionalShadows!==T||D.numPointShadows!==v||D.numSpotShadows!==S||D.numSpotMaps!==A||D.numLightProbes!==R)&&(i.directional.length=p,i.spot.length=_,i.rectArea.length=m,i.point.length=g,i.hemi.length=d,i.directionalShadow.length=T,i.directionalShadowMap.length=T,i.pointShadow.length=v,i.pointShadowMap.length=v,i.spotShadow.length=S,i.spotShadowMap.length=S,i.directionalShadowMatrix.length=T,i.pointShadowMatrix.length=v,i.spotLightMatrix.length=S+A-C,i.spotLightMap.length=A,i.numSpotLightShadowsWithMaps=C,i.numLightProbes=R,D.directionalLength=p,D.pointLength=g,D.spotLength=_,D.rectAreaLength=m,D.hemiLength=d,D.numDirectionalShadows=T,D.numPointShadows=v,D.numSpotShadows=S,D.numSpotMaps=A,D.numLightProbes=R,i.version=Z0++)}function c(l,h){let u=0,f=0,p=0,g=0,_=0;const m=h.matrixWorldInverse;for(let d=0,T=l.length;d<T;d++){const v=l[d];if(v.isDirectionalLight){const S=i.directional[u];S.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),u++}else if(v.isSpotLight){const S=i.spot[p];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),S.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),S.direction.sub(s),S.direction.transformDirection(m),p++}else if(v.isRectAreaLight){const S=i.rectArea[g];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),a.identity(),r.copy(v.matrixWorld),r.premultiply(m),a.extractRotation(r),S.halfWidth.set(v.width*.5,0,0),S.halfHeight.set(0,v.height*.5,0),S.halfWidth.applyMatrix4(a),S.halfHeight.applyMatrix4(a),g++}else if(v.isPointLight){const S=i.point[f];S.position.setFromMatrixPosition(v.matrixWorld),S.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){const S=i.hemi[_];S.direction.setFromMatrixPosition(v.matrixWorld),S.direction.transformDirection(m),_++}}}return{setup:o,setupView:c,state:i}}function Mc(n){const t=new $0(n),e=[],i=[];function s(h){l.camera=h,e.length=0,i.length=0}function r(h){e.push(h)}function a(h){i.push(h)}function o(){t.setup(e)}function c(h){t.setupView(e,h)}const l={lightsArray:e,shadowsArray:i,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:l,setupLights:o,setupLightsView:c,pushLight:r,pushShadow:a}}function j0(n){let t=new WeakMap;function e(s,r=0){const a=t.get(s);let o;return a===void 0?(o=new Mc(n),t.set(s,[o])):r>=a.length?(o=new Mc(n),a.push(o)):o=a[r],o}function i(){t=new WeakMap}return{get:e,dispose:i}}const J0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Q0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function tv(n,t,e){let i=new Oo;const s=new Wt,r=new Wt,a=new $t,o=new yp({depthPacking:Pf}),c=new Ep,l={},h=e.maxTextureSize,u={[Un]:Ce,[Ce]:Un,[gn]:gn},f=new Fn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Wt},radius:{value:4}},vertexShader:J0,fragmentShader:Q0}),p=f.clone();p.defines.HORIZONTAL_PASS=1;const g=new on;g.setAttribute("position",new be(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new Te(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Jc;let d=this.type;this.render=function(C,R,D){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||C.length===0)return;const E=n.getRenderTarget(),M=n.getActiveCubeFace(),w=n.getActiveMipmapLevel(),N=n.state;N.setBlending(Ln),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const k=d!==mn&&this.type===mn,G=d===mn&&this.type!==mn;for(let W=0,H=C.length;W<H;W++){const q=C[W],V=q.shadow;if(V===void 0){console.warn("THREE.WebGLShadowMap:",q,"has no shadow.");continue}if(V.autoUpdate===!1&&V.needsUpdate===!1)continue;s.copy(V.mapSize);const it=V.getFrameExtents();if(s.multiply(it),r.copy(V.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/it.x),s.x=r.x*it.x,V.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/it.y),s.y=r.y*it.y,V.mapSize.y=r.y)),V.map===null||k===!0||G===!0){const St=this.type!==mn?{minFilter:Oe,magFilter:Oe}:{};V.map!==null&&V.map.dispose(),V.map=new ii(s.x,s.y,St),V.map.texture.name=q.name+".shadowMap",V.camera.updateProjectionMatrix()}n.setRenderTarget(V.map),n.clear();const ct=V.getViewportCount();for(let St=0;St<ct;St++){const Nt=V.getViewport(St);a.set(r.x*Nt.x,r.y*Nt.y,r.x*Nt.z,r.y*Nt.w),N.viewport(a),V.updateMatrices(q,St),i=V.getFrustum(),S(R,D,V.camera,q,this.type)}V.isPointLightShadow!==!0&&this.type===mn&&T(V,D),V.needsUpdate=!1}d=this.type,m.needsUpdate=!1,n.setRenderTarget(E,M,w)};function T(C,R){const D=t.update(_);f.defines.VSM_SAMPLES!==C.blurSamples&&(f.defines.VSM_SAMPLES=C.blurSamples,p.defines.VSM_SAMPLES=C.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),C.mapPass===null&&(C.mapPass=new ii(s.x,s.y)),f.uniforms.shadow_pass.value=C.map.texture,f.uniforms.resolution.value=C.mapSize,f.uniforms.radius.value=C.radius,n.setRenderTarget(C.mapPass),n.clear(),n.renderBufferDirect(R,null,D,f,_,null),p.uniforms.shadow_pass.value=C.mapPass.texture,p.uniforms.resolution.value=C.mapSize,p.uniforms.radius.value=C.radius,n.setRenderTarget(C.map),n.clear(),n.renderBufferDirect(R,null,D,p,_,null)}function v(C,R,D,E){let M=null;const w=D.isPointLight===!0?C.customDistanceMaterial:C.customDepthMaterial;if(w!==void 0)M=w;else if(M=D.isPointLight===!0?c:o,n.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const N=M.uuid,k=R.uuid;let G=l[N];G===void 0&&(G={},l[N]=G);let W=G[k];W===void 0&&(W=M.clone(),G[k]=W,R.addEventListener("dispose",A)),M=W}if(M.visible=R.visible,M.wireframe=R.wireframe,E===mn?M.side=R.shadowSide!==null?R.shadowSide:R.side:M.side=R.shadowSide!==null?R.shadowSide:u[R.side],M.alphaMap=R.alphaMap,M.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,M.map=R.map,M.clipShadows=R.clipShadows,M.clippingPlanes=R.clippingPlanes,M.clipIntersection=R.clipIntersection,M.displacementMap=R.displacementMap,M.displacementScale=R.displacementScale,M.displacementBias=R.displacementBias,M.wireframeLinewidth=R.wireframeLinewidth,M.linewidth=R.linewidth,D.isPointLight===!0&&M.isMeshDistanceMaterial===!0){const N=n.properties.get(M);N.light=D}return M}function S(C,R,D,E,M){if(C.visible===!1)return;if(C.layers.test(R.layers)&&(C.isMesh||C.isLine||C.isPoints)&&(C.castShadow||C.receiveShadow&&M===mn)&&(!C.frustumCulled||i.intersectsObject(C))){C.modelViewMatrix.multiplyMatrices(D.matrixWorldInverse,C.matrixWorld);const k=t.update(C),G=C.material;if(Array.isArray(G)){const W=k.groups;for(let H=0,q=W.length;H<q;H++){const V=W[H],it=G[V.materialIndex];if(it&&it.visible){const ct=v(C,it,E,M);C.onBeforeShadow(n,C,R,D,k,ct,V),n.renderBufferDirect(D,null,k,ct,C,V),C.onAfterShadow(n,C,R,D,k,ct,V)}}}else if(G.visible){const W=v(C,G,E,M);C.onBeforeShadow(n,C,R,D,k,W,null),n.renderBufferDirect(D,null,k,W,C,null),C.onAfterShadow(n,C,R,D,k,W,null)}}const N=C.children;for(let k=0,G=N.length;k<G;k++)S(N[k],R,D,E,M)}function A(C){C.target.removeEventListener("dispose",A);for(const D in l){const E=l[D],M=C.target.uuid;M in E&&(E[M].dispose(),delete E[M])}}}const ev={[Na]:Oa,[Ba]:Ha,[za]:Va,[zi]:ka,[Oa]:Na,[Ha]:Ba,[Va]:za,[ka]:zi};function nv(n,t){function e(){let L=!1;const et=new $t;let st=null;const ut=new $t(0,0,0,0);return{setMask:function(J){st!==J&&!L&&(n.colorMask(J,J,J,J),st=J)},setLocked:function(J){L=J},setClear:function(J,K,pt,Pt,Qt){Qt===!0&&(J*=Pt,K*=Pt,pt*=Pt),et.set(J,K,pt,Pt),ut.equals(et)===!1&&(n.clearColor(J,K,pt,Pt),ut.copy(et))},reset:function(){L=!1,st=null,ut.set(-1,0,0,0)}}}function i(){let L=!1,et=!1,st=null,ut=null,J=null;return{setReversed:function(K){if(et!==K){const pt=t.get("EXT_clip_control");K?pt.clipControlEXT(pt.LOWER_LEFT_EXT,pt.ZERO_TO_ONE_EXT):pt.clipControlEXT(pt.LOWER_LEFT_EXT,pt.NEGATIVE_ONE_TO_ONE_EXT),et=K;const Pt=J;J=null,this.setClear(Pt)}},getReversed:function(){return et},setTest:function(K){K?j(n.DEPTH_TEST):dt(n.DEPTH_TEST)},setMask:function(K){st!==K&&!L&&(n.depthMask(K),st=K)},setFunc:function(K){if(et&&(K=ev[K]),ut!==K){switch(K){case Na:n.depthFunc(n.NEVER);break;case Oa:n.depthFunc(n.ALWAYS);break;case Ba:n.depthFunc(n.LESS);break;case zi:n.depthFunc(n.LEQUAL);break;case za:n.depthFunc(n.EQUAL);break;case ka:n.depthFunc(n.GEQUAL);break;case Ha:n.depthFunc(n.GREATER);break;case Va:n.depthFunc(n.NOTEQUAL);break;default:n.depthFunc(n.LEQUAL)}ut=K}},setLocked:function(K){L=K},setClear:function(K){J!==K&&(et&&(K=1-K),n.clearDepth(K),J=K)},reset:function(){L=!1,st=null,ut=null,J=null,et=!1}}}function s(){let L=!1,et=null,st=null,ut=null,J=null,K=null,pt=null,Pt=null,Qt=null;return{setTest:function(Yt){L||(Yt?j(n.STENCIL_TEST):dt(n.STENCIL_TEST))},setMask:function(Yt){et!==Yt&&!L&&(n.stencilMask(Yt),et=Yt)},setFunc:function(Yt,ln,$e){(st!==Yt||ut!==ln||J!==$e)&&(n.stencilFunc(Yt,ln,$e),st=Yt,ut=ln,J=$e)},setOp:function(Yt,ln,$e){(K!==Yt||pt!==ln||Pt!==$e)&&(n.stencilOp(Yt,ln,$e),K=Yt,pt=ln,Pt=$e)},setLocked:function(Yt){L=Yt},setClear:function(Yt){Qt!==Yt&&(n.clearStencil(Yt),Qt=Yt)},reset:function(){L=!1,et=null,st=null,ut=null,J=null,K=null,pt=null,Pt=null,Qt=null}}}const r=new e,a=new i,o=new s,c=new WeakMap,l=new WeakMap;let h={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,T=null,v=null,S=null,A=null,C=null,R=new Ot(0,0,0),D=0,E=!1,M=null,w=null,N=null,k=null,G=null;const W=n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let H=!1,q=0;const V=n.getParameter(n.VERSION);V.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(V)[1]),H=q>=1):V.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(V)[1]),H=q>=2);let it=null,ct={};const St=n.getParameter(n.SCISSOR_BOX),Nt=n.getParameter(n.VIEWPORT),Ht=new $t().fromArray(St),qt=new $t().fromArray(Nt);function Xt(L,et,st,ut){const J=new Uint8Array(4),K=n.createTexture();n.bindTexture(L,K),n.texParameteri(L,n.TEXTURE_MIN_FILTER,n.NEAREST),n.texParameteri(L,n.TEXTURE_MAG_FILTER,n.NEAREST);for(let pt=0;pt<st;pt++)L===n.TEXTURE_3D||L===n.TEXTURE_2D_ARRAY?n.texImage3D(et,0,n.RGBA,1,1,ut,0,n.RGBA,n.UNSIGNED_BYTE,J):n.texImage2D(et+pt,0,n.RGBA,1,1,0,n.RGBA,n.UNSIGNED_BYTE,J);return K}const Z={};Z[n.TEXTURE_2D]=Xt(n.TEXTURE_2D,n.TEXTURE_2D,1),Z[n.TEXTURE_CUBE_MAP]=Xt(n.TEXTURE_CUBE_MAP,n.TEXTURE_CUBE_MAP_POSITIVE_X,6),Z[n.TEXTURE_2D_ARRAY]=Xt(n.TEXTURE_2D_ARRAY,n.TEXTURE_2D_ARRAY,1,1),Z[n.TEXTURE_3D]=Xt(n.TEXTURE_3D,n.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(n.DEPTH_TEST),a.setFunc(zi),At(!1),mt(_l),j(n.CULL_FACE),ee(Ln);function j(L){h[L]!==!0&&(n.enable(L),h[L]=!0)}function dt(L){h[L]!==!1&&(n.disable(L),h[L]=!1)}function Ct(L,et){return u[L]!==et?(n.bindFramebuffer(L,et),u[L]=et,L===n.DRAW_FRAMEBUFFER&&(u[n.FRAMEBUFFER]=et),L===n.FRAMEBUFFER&&(u[n.DRAW_FRAMEBUFFER]=et),!0):!1}function yt(L,et){let st=p,ut=!1;if(L){st=f.get(et),st===void 0&&(st=[],f.set(et,st));const J=L.textures;if(st.length!==J.length||st[0]!==n.COLOR_ATTACHMENT0){for(let K=0,pt=J.length;K<pt;K++)st[K]=n.COLOR_ATTACHMENT0+K;st.length=J.length,ut=!0}}else st[0]!==n.BACK&&(st[0]=n.BACK,ut=!0);ut&&n.drawBuffers(st)}function kt(L){return g!==L?(n.useProgram(L),g=L,!0):!1}const ge={[$n]:n.FUNC_ADD,[nf]:n.FUNC_SUBTRACT,[sf]:n.FUNC_REVERSE_SUBTRACT};ge[rf]=n.MIN,ge[af]=n.MAX;const P={[of]:n.ZERO,[lf]:n.ONE,[cf]:n.SRC_COLOR,[Ua]:n.SRC_ALPHA,[mf]:n.SRC_ALPHA_SATURATE,[ff]:n.DST_COLOR,[uf]:n.DST_ALPHA,[hf]:n.ONE_MINUS_SRC_COLOR,[Fa]:n.ONE_MINUS_SRC_ALPHA,[pf]:n.ONE_MINUS_DST_COLOR,[df]:n.ONE_MINUS_DST_ALPHA,[gf]:n.CONSTANT_COLOR,[_f]:n.ONE_MINUS_CONSTANT_COLOR,[vf]:n.CONSTANT_ALPHA,[xf]:n.ONE_MINUS_CONSTANT_ALPHA};function ee(L,et,st,ut,J,K,pt,Pt,Qt,Yt){if(L===Ln){_===!0&&(dt(n.BLEND),_=!1);return}if(_===!1&&(j(n.BLEND),_=!0),L!==ef){if(L!==m||Yt!==E){if((d!==$n||S!==$n)&&(n.blendEquation(n.FUNC_ADD),d=$n,S=$n),Yt)switch(L){case Ni:n.blendFuncSeparate(n.ONE,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case vr:n.blendFunc(n.ONE,n.ONE);break;case vl:n.blendFuncSeparate(n.ZERO,n.ONE_MINUS_SRC_COLOR,n.ZERO,n.ONE);break;case xl:n.blendFuncSeparate(n.DST_COLOR,n.ONE_MINUS_SRC_ALPHA,n.ZERO,n.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}else switch(L){case Ni:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE_MINUS_SRC_ALPHA,n.ONE,n.ONE_MINUS_SRC_ALPHA);break;case vr:n.blendFuncSeparate(n.SRC_ALPHA,n.ONE,n.ONE,n.ONE);break;case vl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case xl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",L);break}T=null,v=null,A=null,C=null,R.set(0,0,0),D=0,m=L,E=Yt}return}J=J||et,K=K||st,pt=pt||ut,(et!==d||J!==S)&&(n.blendEquationSeparate(ge[et],ge[J]),d=et,S=J),(st!==T||ut!==v||K!==A||pt!==C)&&(n.blendFuncSeparate(P[st],P[ut],P[K],P[pt]),T=st,v=ut,A=K,C=pt),(Pt.equals(R)===!1||Qt!==D)&&(n.blendColor(Pt.r,Pt.g,Pt.b,Qt),R.copy(Pt),D=Qt),m=L,E=!1}function Dt(L,et){L.side===gn?dt(n.CULL_FACE):j(n.CULL_FACE);let st=L.side===Ce;et&&(st=!st),At(st),L.blending===Ni&&L.transparent===!1?ee(Ln):ee(L.blending,L.blendEquation,L.blendSrc,L.blendDst,L.blendEquationAlpha,L.blendSrcAlpha,L.blendDstAlpha,L.blendColor,L.blendAlpha,L.premultipliedAlpha),a.setFunc(L.depthFunc),a.setTest(L.depthTest),a.setMask(L.depthWrite),r.setMask(L.colorWrite);const ut=L.stencilWrite;o.setTest(ut),ut&&(o.setMask(L.stencilWriteMask),o.setFunc(L.stencilFunc,L.stencilRef,L.stencilFuncMask),o.setOp(L.stencilFail,L.stencilZFail,L.stencilZPass)),gt(L.polygonOffset,L.polygonOffsetFactor,L.polygonOffsetUnits),L.alphaToCoverage===!0?j(n.SAMPLE_ALPHA_TO_COVERAGE):dt(n.SAMPLE_ALPHA_TO_COVERAGE)}function At(L){M!==L&&(L?n.frontFace(n.CW):n.frontFace(n.CCW),M=L)}function mt(L){L!==Jd?(j(n.CULL_FACE),L!==w&&(L===_l?n.cullFace(n.BACK):L===Qd?n.cullFace(n.FRONT):n.cullFace(n.FRONT_AND_BACK))):dt(n.CULL_FACE),w=L}function ne(L){L!==N&&(H&&n.lineWidth(L),N=L)}function gt(L,et,st){L?(j(n.POLYGON_OFFSET_FILL),(k!==et||G!==st)&&(n.polygonOffset(et,st),k=et,G=st)):dt(n.POLYGON_OFFSET_FILL)}function Ut(L){L?j(n.SCISSOR_TEST):dt(n.SCISSOR_TEST)}function fe(L){L===void 0&&(L=n.TEXTURE0+W-1),it!==L&&(n.activeTexture(L),it=L)}function le(L,et,st){st===void 0&&(it===null?st=n.TEXTURE0+W-1:st=it);let ut=ct[st];ut===void 0&&(ut={type:void 0,texture:void 0},ct[st]=ut),(ut.type!==L||ut.texture!==et)&&(it!==st&&(n.activeTexture(st),it=st),n.bindTexture(L,et||Z[L]),ut.type=L,ut.texture=et)}function b(){const L=ct[it];L!==void 0&&L.type!==void 0&&(n.bindTexture(L.type,null),L.type=void 0,L.texture=void 0)}function x(){try{n.compressedTexImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function O(){try{n.compressedTexImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Y(){try{n.texSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function $(){try{n.texSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function X(){try{n.compressedTexSubImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function Mt(){try{n.compressedTexSubImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function nt(){try{n.texStorage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function _t(){try{n.texStorage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function vt(){try{n.texImage2D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function tt(){try{n.texImage3D(...arguments)}catch(L){console.error("THREE.WebGLState:",L)}}function lt(L){Ht.equals(L)===!1&&(n.scissor(L.x,L.y,L.z,L.w),Ht.copy(L))}function wt(L){qt.equals(L)===!1&&(n.viewport(L.x,L.y,L.z,L.w),qt.copy(L))}function xt(L,et){let st=l.get(et);st===void 0&&(st=new WeakMap,l.set(et,st));let ut=st.get(L);ut===void 0&&(ut=n.getUniformBlockIndex(et,L.name),st.set(L,ut))}function at(L,et){const ut=l.get(et).get(L);c.get(et)!==ut&&(n.uniformBlockBinding(et,ut,L.__bindingPointIndex),c.set(et,ut))}function Lt(){n.disable(n.BLEND),n.disable(n.CULL_FACE),n.disable(n.DEPTH_TEST),n.disable(n.POLYGON_OFFSET_FILL),n.disable(n.SCISSOR_TEST),n.disable(n.STENCIL_TEST),n.disable(n.SAMPLE_ALPHA_TO_COVERAGE),n.blendEquation(n.FUNC_ADD),n.blendFunc(n.ONE,n.ZERO),n.blendFuncSeparate(n.ONE,n.ZERO,n.ONE,n.ZERO),n.blendColor(0,0,0,0),n.colorMask(!0,!0,!0,!0),n.clearColor(0,0,0,0),n.depthMask(!0),n.depthFunc(n.LESS),a.setReversed(!1),n.clearDepth(1),n.stencilMask(4294967295),n.stencilFunc(n.ALWAYS,0,4294967295),n.stencilOp(n.KEEP,n.KEEP,n.KEEP),n.clearStencil(0),n.cullFace(n.BACK),n.frontFace(n.CCW),n.polygonOffset(0,0),n.activeTexture(n.TEXTURE0),n.bindFramebuffer(n.FRAMEBUFFER,null),n.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),n.bindFramebuffer(n.READ_FRAMEBUFFER,null),n.useProgram(null),n.lineWidth(1),n.scissor(0,0,n.canvas.width,n.canvas.height),n.viewport(0,0,n.canvas.width,n.canvas.height),h={},it=null,ct={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,T=null,v=null,S=null,A=null,C=null,R=new Ot(0,0,0),D=0,E=!1,M=null,w=null,N=null,k=null,G=null,Ht.set(0,0,n.canvas.width,n.canvas.height),qt.set(0,0,n.canvas.width,n.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:dt,bindFramebuffer:Ct,drawBuffers:yt,useProgram:kt,setBlending:ee,setMaterial:Dt,setFlipSided:At,setCullFace:mt,setLineWidth:ne,setPolygonOffset:gt,setScissorTest:Ut,activeTexture:fe,bindTexture:le,unbindTexture:b,compressedTexImage2D:x,compressedTexImage3D:O,texImage2D:vt,texImage3D:tt,updateUBOMapping:xt,uniformBlockBinding:at,texStorage2D:nt,texStorage3D:_t,texSubImage2D:Y,texSubImage3D:$,compressedTexSubImage2D:X,compressedTexSubImage3D:Mt,scissor:lt,viewport:wt,reset:Lt}}function iv(n,t,e,i,s,r,a){const o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Wt,h=new WeakMap;let u;const f=new WeakMap;let p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(b,x){return p?new OffscreenCanvas(b,x):Mr("canvas")}function _(b,x,O){let Y=1;const $=le(b);if(($.width>O||$.height>O)&&(Y=O/Math.max($.width,$.height)),Y<1)if(typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&b instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&b instanceof ImageBitmap||typeof VideoFrame<"u"&&b instanceof VideoFrame){const X=Math.floor(Y*$.width),Mt=Math.floor(Y*$.height);u===void 0&&(u=g(X,Mt));const nt=x?g(X,Mt):u;return nt.width=X,nt.height=Mt,nt.getContext("2d").drawImage(b,0,0,X,Mt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+$.width+"x"+$.height+") to ("+X+"x"+Mt+")."),nt}else return"data"in b&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+$.width+"x"+$.height+")."),b;return b}function m(b){return b.generateMipmaps}function d(b){n.generateMipmap(b)}function T(b){return b.isWebGLCubeRenderTarget?n.TEXTURE_CUBE_MAP:b.isWebGL3DRenderTarget?n.TEXTURE_3D:b.isWebGLArrayRenderTarget||b.isCompressedArrayTexture?n.TEXTURE_2D_ARRAY:n.TEXTURE_2D}function v(b,x,O,Y,$=!1){if(b!==null){if(n[b]!==void 0)return n[b];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+b+"'")}let X=x;if(x===n.RED&&(O===n.FLOAT&&(X=n.R32F),O===n.HALF_FLOAT&&(X=n.R16F),O===n.UNSIGNED_BYTE&&(X=n.R8)),x===n.RED_INTEGER&&(O===n.UNSIGNED_BYTE&&(X=n.R8UI),O===n.UNSIGNED_SHORT&&(X=n.R16UI),O===n.UNSIGNED_INT&&(X=n.R32UI),O===n.BYTE&&(X=n.R8I),O===n.SHORT&&(X=n.R16I),O===n.INT&&(X=n.R32I)),x===n.RG&&(O===n.FLOAT&&(X=n.RG32F),O===n.HALF_FLOAT&&(X=n.RG16F),O===n.UNSIGNED_BYTE&&(X=n.RG8)),x===n.RG_INTEGER&&(O===n.UNSIGNED_BYTE&&(X=n.RG8UI),O===n.UNSIGNED_SHORT&&(X=n.RG16UI),O===n.UNSIGNED_INT&&(X=n.RG32UI),O===n.BYTE&&(X=n.RG8I),O===n.SHORT&&(X=n.RG16I),O===n.INT&&(X=n.RG32I)),x===n.RGB_INTEGER&&(O===n.UNSIGNED_BYTE&&(X=n.RGB8UI),O===n.UNSIGNED_SHORT&&(X=n.RGB16UI),O===n.UNSIGNED_INT&&(X=n.RGB32UI),O===n.BYTE&&(X=n.RGB8I),O===n.SHORT&&(X=n.RGB16I),O===n.INT&&(X=n.RGB32I)),x===n.RGBA_INTEGER&&(O===n.UNSIGNED_BYTE&&(X=n.RGBA8UI),O===n.UNSIGNED_SHORT&&(X=n.RGBA16UI),O===n.UNSIGNED_INT&&(X=n.RGBA32UI),O===n.BYTE&&(X=n.RGBA8I),O===n.SHORT&&(X=n.RGBA16I),O===n.INT&&(X=n.RGBA32I)),x===n.RGB&&(O===n.UNSIGNED_INT_5_9_9_9_REV&&(X=n.RGB9_E5),O===n.UNSIGNED_INT_10F_11F_11F_REV&&(X=n.R11F_G11F_B10F)),x===n.RGBA){const Mt=$?xr:Gt.getTransfer(Y);O===n.FLOAT&&(X=n.RGBA32F),O===n.HALF_FLOAT&&(X=n.RGBA16F),O===n.UNSIGNED_BYTE&&(X=Mt===Kt?n.SRGB8_ALPHA8:n.RGBA8),O===n.UNSIGNED_SHORT_4_4_4_4&&(X=n.RGBA4),O===n.UNSIGNED_SHORT_5_5_5_1&&(X=n.RGB5_A1)}return(X===n.R16F||X===n.R32F||X===n.RG16F||X===n.RG32F||X===n.RGBA16F||X===n.RGBA32F)&&t.get("EXT_color_buffer_float"),X}function S(b,x){let O;return b?x===null||x===ni||x===ys?O=n.DEPTH24_STENCIL8:x===en?O=n.DEPTH32F_STENCIL8:x===Ms&&(O=n.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===ni||x===ys?O=n.DEPTH_COMPONENT24:x===en?O=n.DEPTH_COMPONENT32F:x===Ms&&(O=n.DEPTH_COMPONENT16),O}function A(b,x){return m(b)===!0||b.isFramebufferTexture&&b.minFilter!==Oe&&b.minFilter!==tn?Math.log2(Math.max(x.width,x.height))+1:b.mipmaps!==void 0&&b.mipmaps.length>0?b.mipmaps.length:b.isCompressedTexture&&Array.isArray(b.image)?x.mipmaps.length:1}function C(b){const x=b.target;x.removeEventListener("dispose",C),D(x),x.isVideoTexture&&h.delete(x)}function R(b){const x=b.target;x.removeEventListener("dispose",R),M(x)}function D(b){const x=i.get(b);if(x.__webglInit===void 0)return;const O=b.source,Y=f.get(O);if(Y){const $=Y[x.__cacheKey];$.usedTimes--,$.usedTimes===0&&E(b),Object.keys(Y).length===0&&f.delete(O)}i.remove(b)}function E(b){const x=i.get(b);n.deleteTexture(x.__webglTexture);const O=b.source,Y=f.get(O);delete Y[x.__cacheKey],a.memory.textures--}function M(b){const x=i.get(b);if(b.depthTexture&&(b.depthTexture.dispose(),i.remove(b.depthTexture)),b.isWebGLCubeRenderTarget)for(let Y=0;Y<6;Y++){if(Array.isArray(x.__webglFramebuffer[Y]))for(let $=0;$<x.__webglFramebuffer[Y].length;$++)n.deleteFramebuffer(x.__webglFramebuffer[Y][$]);else n.deleteFramebuffer(x.__webglFramebuffer[Y]);x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer[Y])}else{if(Array.isArray(x.__webglFramebuffer))for(let Y=0;Y<x.__webglFramebuffer.length;Y++)n.deleteFramebuffer(x.__webglFramebuffer[Y]);else n.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&n.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&n.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let Y=0;Y<x.__webglColorRenderbuffer.length;Y++)x.__webglColorRenderbuffer[Y]&&n.deleteRenderbuffer(x.__webglColorRenderbuffer[Y]);x.__webglDepthRenderbuffer&&n.deleteRenderbuffer(x.__webglDepthRenderbuffer)}const O=b.textures;for(let Y=0,$=O.length;Y<$;Y++){const X=i.get(O[Y]);X.__webglTexture&&(n.deleteTexture(X.__webglTexture),a.memory.textures--),i.remove(O[Y])}i.remove(b)}let w=0;function N(){w=0}function k(){const b=w;return b>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+b+" texture units while this GPU supports only "+s.maxTextures),w+=1,b}function G(b){const x=[];return x.push(b.wrapS),x.push(b.wrapT),x.push(b.wrapR||0),x.push(b.magFilter),x.push(b.minFilter),x.push(b.anisotropy),x.push(b.internalFormat),x.push(b.format),x.push(b.type),x.push(b.generateMipmaps),x.push(b.premultiplyAlpha),x.push(b.flipY),x.push(b.unpackAlignment),x.push(b.colorSpace),x.join()}function W(b,x){const O=i.get(b);if(b.isVideoTexture&&Ut(b),b.isRenderTargetTexture===!1&&b.isExternalTexture!==!0&&b.version>0&&O.__version!==b.version){const Y=b.image;if(Y===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(Y.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Z(O,b,x);return}}else b.isExternalTexture&&(O.__webglTexture=b.sourceTexture?b.sourceTexture:null);e.bindTexture(n.TEXTURE_2D,O.__webglTexture,n.TEXTURE0+x)}function H(b,x){const O=i.get(b);if(b.isRenderTargetTexture===!1&&b.version>0&&O.__version!==b.version){Z(O,b,x);return}e.bindTexture(n.TEXTURE_2D_ARRAY,O.__webglTexture,n.TEXTURE0+x)}function q(b,x){const O=i.get(b);if(b.isRenderTargetTexture===!1&&b.version>0&&O.__version!==b.version){Z(O,b,x);return}e.bindTexture(n.TEXTURE_3D,O.__webglTexture,n.TEXTURE0+x)}function V(b,x){const O=i.get(b);if(b.version>0&&O.__version!==b.version){j(O,b,x);return}e.bindTexture(n.TEXTURE_CUBE_MAP,O.__webglTexture,n.TEXTURE0+x)}const it={[Ss]:n.REPEAT,[Qn]:n.CLAMP_TO_EDGE,[Xa]:n.MIRRORED_REPEAT},ct={[Oe]:n.NEAREST,[Rf]:n.NEAREST_MIPMAP_NEAREST,[Ls]:n.NEAREST_MIPMAP_LINEAR,[tn]:n.LINEAR,[kr]:n.LINEAR_MIPMAP_NEAREST,[ti]:n.LINEAR_MIPMAP_LINEAR},St={[Lf]:n.NEVER,[Bf]:n.ALWAYS,[If]:n.LESS,[hh]:n.LEQUAL,[Uf]:n.EQUAL,[Of]:n.GEQUAL,[Ff]:n.GREATER,[Nf]:n.NOTEQUAL};function Nt(b,x){if(x.type===en&&t.has("OES_texture_float_linear")===!1&&(x.magFilter===tn||x.magFilter===kr||x.magFilter===Ls||x.magFilter===ti||x.minFilter===tn||x.minFilter===kr||x.minFilter===Ls||x.minFilter===ti)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),n.texParameteri(b,n.TEXTURE_WRAP_S,it[x.wrapS]),n.texParameteri(b,n.TEXTURE_WRAP_T,it[x.wrapT]),(b===n.TEXTURE_3D||b===n.TEXTURE_2D_ARRAY)&&n.texParameteri(b,n.TEXTURE_WRAP_R,it[x.wrapR]),n.texParameteri(b,n.TEXTURE_MAG_FILTER,ct[x.magFilter]),n.texParameteri(b,n.TEXTURE_MIN_FILTER,ct[x.minFilter]),x.compareFunction&&(n.texParameteri(b,n.TEXTURE_COMPARE_MODE,n.COMPARE_REF_TO_TEXTURE),n.texParameteri(b,n.TEXTURE_COMPARE_FUNC,St[x.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===Oe||x.minFilter!==Ls&&x.minFilter!==ti||x.type===en&&t.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||i.get(x).__currentAnisotropy){const O=t.get("EXT_texture_filter_anisotropic");n.texParameterf(b,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),i.get(x).__currentAnisotropy=x.anisotropy}}}function Ht(b,x){let O=!1;b.__webglInit===void 0&&(b.__webglInit=!0,x.addEventListener("dispose",C));const Y=x.source;let $=f.get(Y);$===void 0&&($={},f.set(Y,$));const X=G(x);if(X!==b.__cacheKey){$[X]===void 0&&($[X]={texture:n.createTexture(),usedTimes:0},a.memory.textures++,O=!0),$[X].usedTimes++;const Mt=$[b.__cacheKey];Mt!==void 0&&($[b.__cacheKey].usedTimes--,Mt.usedTimes===0&&E(x)),b.__cacheKey=X,b.__webglTexture=$[X].texture}return O}function qt(b,x,O){return Math.floor(Math.floor(b/O)/x)}function Xt(b,x,O,Y){const X=b.updateRanges;if(X.length===0)e.texSubImage2D(n.TEXTURE_2D,0,0,0,x.width,x.height,O,Y,x.data);else{X.sort((tt,lt)=>tt.start-lt.start);let Mt=0;for(let tt=1;tt<X.length;tt++){const lt=X[Mt],wt=X[tt],xt=lt.start+lt.count,at=qt(wt.start,x.width,4),Lt=qt(lt.start,x.width,4);wt.start<=xt+1&&at===Lt&&qt(wt.start+wt.count-1,x.width,4)===at?lt.count=Math.max(lt.count,wt.start+wt.count-lt.start):(++Mt,X[Mt]=wt)}X.length=Mt+1;const nt=n.getParameter(n.UNPACK_ROW_LENGTH),_t=n.getParameter(n.UNPACK_SKIP_PIXELS),vt=n.getParameter(n.UNPACK_SKIP_ROWS);n.pixelStorei(n.UNPACK_ROW_LENGTH,x.width);for(let tt=0,lt=X.length;tt<lt;tt++){const wt=X[tt],xt=Math.floor(wt.start/4),at=Math.ceil(wt.count/4),Lt=xt%x.width,L=Math.floor(xt/x.width),et=at,st=1;n.pixelStorei(n.UNPACK_SKIP_PIXELS,Lt),n.pixelStorei(n.UNPACK_SKIP_ROWS,L),e.texSubImage2D(n.TEXTURE_2D,0,Lt,L,et,st,O,Y,x.data)}b.clearUpdateRanges(),n.pixelStorei(n.UNPACK_ROW_LENGTH,nt),n.pixelStorei(n.UNPACK_SKIP_PIXELS,_t),n.pixelStorei(n.UNPACK_SKIP_ROWS,vt)}}function Z(b,x,O){let Y=n.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(Y=n.TEXTURE_2D_ARRAY),x.isData3DTexture&&(Y=n.TEXTURE_3D);const $=Ht(b,x),X=x.source;e.bindTexture(Y,b.__webglTexture,n.TEXTURE0+O);const Mt=i.get(X);if(X.version!==Mt.__version||$===!0){e.activeTexture(n.TEXTURE0+O);const nt=Gt.getPrimaries(Gt.workingColorSpace),_t=x.colorSpace===Cn?null:Gt.getPrimaries(x.colorSpace),vt=x.colorSpace===Cn||nt===_t?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,vt);let tt=_(x.image,!1,s.maxTextureSize);tt=fe(x,tt);const lt=r.convert(x.format,x.colorSpace),wt=r.convert(x.type);let xt=v(x.internalFormat,lt,wt,x.colorSpace,x.isVideoTexture);Nt(Y,x);let at;const Lt=x.mipmaps,L=x.isVideoTexture!==!0,et=Mt.__version===void 0||$===!0,st=X.dataReady,ut=A(x,tt);if(x.isDepthTexture)xt=S(x.format===Ts,x.type),et&&(L?e.texStorage2D(n.TEXTURE_2D,1,xt,tt.width,tt.height):e.texImage2D(n.TEXTURE_2D,0,xt,tt.width,tt.height,0,lt,wt,null));else if(x.isDataTexture)if(Lt.length>0){L&&et&&e.texStorage2D(n.TEXTURE_2D,ut,xt,Lt[0].width,Lt[0].height);for(let J=0,K=Lt.length;J<K;J++)at=Lt[J],L?st&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,at.width,at.height,lt,wt,at.data):e.texImage2D(n.TEXTURE_2D,J,xt,at.width,at.height,0,lt,wt,at.data);x.generateMipmaps=!1}else L?(et&&e.texStorage2D(n.TEXTURE_2D,ut,xt,tt.width,tt.height),st&&Xt(x,tt,lt,wt)):e.texImage2D(n.TEXTURE_2D,0,xt,tt.width,tt.height,0,lt,wt,tt.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){L&&et&&e.texStorage3D(n.TEXTURE_2D_ARRAY,ut,xt,Lt[0].width,Lt[0].height,tt.depth);for(let J=0,K=Lt.length;J<K;J++)if(at=Lt[J],x.format!==Ze)if(lt!==null)if(L){if(st)if(x.layerUpdates.size>0){const pt=jl(at.width,at.height,x.format,x.type);for(const Pt of x.layerUpdates){const Qt=at.data.subarray(Pt*pt/at.data.BYTES_PER_ELEMENT,(Pt+1)*pt/at.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,Pt,at.width,at.height,1,lt,Qt)}x.clearLayerUpdates()}else e.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,at.width,at.height,tt.depth,lt,at.data)}else e.compressedTexImage3D(n.TEXTURE_2D_ARRAY,J,xt,at.width,at.height,tt.depth,0,at.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else L?st&&e.texSubImage3D(n.TEXTURE_2D_ARRAY,J,0,0,0,at.width,at.height,tt.depth,lt,wt,at.data):e.texImage3D(n.TEXTURE_2D_ARRAY,J,xt,at.width,at.height,tt.depth,0,lt,wt,at.data)}else{L&&et&&e.texStorage2D(n.TEXTURE_2D,ut,xt,Lt[0].width,Lt[0].height);for(let J=0,K=Lt.length;J<K;J++)at=Lt[J],x.format!==Ze?lt!==null?L?st&&e.compressedTexSubImage2D(n.TEXTURE_2D,J,0,0,at.width,at.height,lt,at.data):e.compressedTexImage2D(n.TEXTURE_2D,J,xt,at.width,at.height,0,at.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):L?st&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,at.width,at.height,lt,wt,at.data):e.texImage2D(n.TEXTURE_2D,J,xt,at.width,at.height,0,lt,wt,at.data)}else if(x.isDataArrayTexture)if(L){if(et&&e.texStorage3D(n.TEXTURE_2D_ARRAY,ut,xt,tt.width,tt.height,tt.depth),st)if(x.layerUpdates.size>0){const J=jl(tt.width,tt.height,x.format,x.type);for(const K of x.layerUpdates){const pt=tt.data.subarray(K*J/tt.data.BYTES_PER_ELEMENT,(K+1)*J/tt.data.BYTES_PER_ELEMENT);e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,K,tt.width,tt.height,1,lt,wt,pt)}x.clearLayerUpdates()}else e.texSubImage3D(n.TEXTURE_2D_ARRAY,0,0,0,0,tt.width,tt.height,tt.depth,lt,wt,tt.data)}else e.texImage3D(n.TEXTURE_2D_ARRAY,0,xt,tt.width,tt.height,tt.depth,0,lt,wt,tt.data);else if(x.isData3DTexture)L?(et&&e.texStorage3D(n.TEXTURE_3D,ut,xt,tt.width,tt.height,tt.depth),st&&e.texSubImage3D(n.TEXTURE_3D,0,0,0,0,tt.width,tt.height,tt.depth,lt,wt,tt.data)):e.texImage3D(n.TEXTURE_3D,0,xt,tt.width,tt.height,tt.depth,0,lt,wt,tt.data);else if(x.isFramebufferTexture){if(et)if(L)e.texStorage2D(n.TEXTURE_2D,ut,xt,tt.width,tt.height);else{let J=tt.width,K=tt.height;for(let pt=0;pt<ut;pt++)e.texImage2D(n.TEXTURE_2D,pt,xt,J,K,0,lt,wt,null),J>>=1,K>>=1}}else if(Lt.length>0){if(L&&et){const J=le(Lt[0]);e.texStorage2D(n.TEXTURE_2D,ut,xt,J.width,J.height)}for(let J=0,K=Lt.length;J<K;J++)at=Lt[J],L?st&&e.texSubImage2D(n.TEXTURE_2D,J,0,0,lt,wt,at):e.texImage2D(n.TEXTURE_2D,J,xt,lt,wt,at);x.generateMipmaps=!1}else if(L){if(et){const J=le(tt);e.texStorage2D(n.TEXTURE_2D,ut,xt,J.width,J.height)}st&&e.texSubImage2D(n.TEXTURE_2D,0,0,0,lt,wt,tt)}else e.texImage2D(n.TEXTURE_2D,0,xt,lt,wt,tt);m(x)&&d(Y),Mt.__version=X.version,x.onUpdate&&x.onUpdate(x)}b.__version=x.version}function j(b,x,O){if(x.image.length!==6)return;const Y=Ht(b,x),$=x.source;e.bindTexture(n.TEXTURE_CUBE_MAP,b.__webglTexture,n.TEXTURE0+O);const X=i.get($);if($.version!==X.__version||Y===!0){e.activeTexture(n.TEXTURE0+O);const Mt=Gt.getPrimaries(Gt.workingColorSpace),nt=x.colorSpace===Cn?null:Gt.getPrimaries(x.colorSpace),_t=x.colorSpace===Cn||Mt===nt?n.NONE:n.BROWSER_DEFAULT_WEBGL;n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL,x.flipY),n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),n.pixelStorei(n.UNPACK_ALIGNMENT,x.unpackAlignment),n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL,_t);const vt=x.isCompressedTexture||x.image[0].isCompressedTexture,tt=x.image[0]&&x.image[0].isDataTexture,lt=[];for(let K=0;K<6;K++)!vt&&!tt?lt[K]=_(x.image[K],!0,s.maxCubemapSize):lt[K]=tt?x.image[K].image:x.image[K],lt[K]=fe(x,lt[K]);const wt=lt[0],xt=r.convert(x.format,x.colorSpace),at=r.convert(x.type),Lt=v(x.internalFormat,xt,at,x.colorSpace),L=x.isVideoTexture!==!0,et=X.__version===void 0||Y===!0,st=$.dataReady;let ut=A(x,wt);Nt(n.TEXTURE_CUBE_MAP,x);let J;if(vt){L&&et&&e.texStorage2D(n.TEXTURE_CUBE_MAP,ut,Lt,wt.width,wt.height);for(let K=0;K<6;K++){J=lt[K].mipmaps;for(let pt=0;pt<J.length;pt++){const Pt=J[pt];x.format!==Ze?xt!==null?L?st&&e.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt,0,0,Pt.width,Pt.height,xt,Pt.data):e.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt,Lt,Pt.width,Pt.height,0,Pt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):L?st&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt,0,0,Pt.width,Pt.height,xt,at,Pt.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt,Lt,Pt.width,Pt.height,0,xt,at,Pt.data)}}}else{if(J=x.mipmaps,L&&et){J.length>0&&ut++;const K=le(lt[0]);e.texStorage2D(n.TEXTURE_CUBE_MAP,ut,Lt,K.width,K.height)}for(let K=0;K<6;K++)if(tt){L?st&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,lt[K].width,lt[K].height,xt,at,lt[K].data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Lt,lt[K].width,lt[K].height,0,xt,at,lt[K].data);for(let pt=0;pt<J.length;pt++){const Qt=J[pt].image[K].image;L?st&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt+1,0,0,Qt.width,Qt.height,xt,at,Qt.data):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt+1,Lt,Qt.width,Qt.height,0,xt,at,Qt.data)}}else{L?st&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,0,0,xt,at,lt[K]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,0,Lt,xt,at,lt[K]);for(let pt=0;pt<J.length;pt++){const Pt=J[pt];L?st&&e.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt+1,0,0,xt,at,Pt.image[K]):e.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X+K,pt+1,Lt,xt,at,Pt.image[K])}}}m(x)&&d(n.TEXTURE_CUBE_MAP),X.__version=$.version,x.onUpdate&&x.onUpdate(x)}b.__version=x.version}function dt(b,x,O,Y,$,X){const Mt=r.convert(O.format,O.colorSpace),nt=r.convert(O.type),_t=v(O.internalFormat,Mt,nt,O.colorSpace),vt=i.get(x),tt=i.get(O);if(tt.__renderTarget=x,!vt.__hasExternalTextures){const lt=Math.max(1,x.width>>X),wt=Math.max(1,x.height>>X);$===n.TEXTURE_3D||$===n.TEXTURE_2D_ARRAY?e.texImage3D($,X,_t,lt,wt,x.depth,0,Mt,nt,null):e.texImage2D($,X,_t,lt,wt,0,Mt,nt,null)}e.bindFramebuffer(n.FRAMEBUFFER,b),gt(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,Y,$,tt.__webglTexture,0,ne(x)):($===n.TEXTURE_2D||$>=n.TEXTURE_CUBE_MAP_POSITIVE_X&&$<=n.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&n.framebufferTexture2D(n.FRAMEBUFFER,Y,$,tt.__webglTexture,X),e.bindFramebuffer(n.FRAMEBUFFER,null)}function Ct(b,x,O){if(n.bindRenderbuffer(n.RENDERBUFFER,b),x.depthBuffer){const Y=x.depthTexture,$=Y&&Y.isDepthTexture?Y.type:null,X=S(x.stencilBuffer,$),Mt=x.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,nt=ne(x);gt(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,nt,X,x.width,x.height):O?n.renderbufferStorageMultisample(n.RENDERBUFFER,nt,X,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,X,x.width,x.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,Mt,n.RENDERBUFFER,b)}else{const Y=x.textures;for(let $=0;$<Y.length;$++){const X=Y[$],Mt=r.convert(X.format,X.colorSpace),nt=r.convert(X.type),_t=v(X.internalFormat,Mt,nt,X.colorSpace),vt=ne(x);O&&gt(x)===!1?n.renderbufferStorageMultisample(n.RENDERBUFFER,vt,_t,x.width,x.height):gt(x)?o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER,vt,_t,x.width,x.height):n.renderbufferStorage(n.RENDERBUFFER,_t,x.width,x.height)}}n.bindRenderbuffer(n.RENDERBUFFER,null)}function yt(b,x){if(x&&x.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(n.FRAMEBUFFER,b),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const Y=i.get(x.depthTexture);Y.__renderTarget=x,(!Y.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),W(x.depthTexture,0);const $=Y.__webglTexture,X=ne(x);if(x.depthTexture.format===Es)gt(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0,X):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_ATTACHMENT,n.TEXTURE_2D,$,0);else if(x.depthTexture.format===Ts)gt(x)?o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0,X):n.framebufferTexture2D(n.FRAMEBUFFER,n.DEPTH_STENCIL_ATTACHMENT,n.TEXTURE_2D,$,0);else throw new Error("Unknown depthTexture format")}function kt(b){const x=i.get(b),O=b.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==b.depthTexture){const Y=b.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),Y){const $=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,Y.removeEventListener("dispose",$)};Y.addEventListener("dispose",$),x.__depthDisposeCallback=$}x.__boundDepthTexture=Y}if(b.depthTexture&&!x.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");const Y=b.texture.mipmaps;Y&&Y.length>0?yt(x.__webglFramebuffer[0],b):yt(x.__webglFramebuffer,b)}else if(O){x.__webglDepthbuffer=[];for(let Y=0;Y<6;Y++)if(e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[Y]),x.__webglDepthbuffer[Y]===void 0)x.__webglDepthbuffer[Y]=n.createRenderbuffer(),Ct(x.__webglDepthbuffer[Y],b,!1);else{const $=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer[Y];n.bindRenderbuffer(n.RENDERBUFFER,X),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,X)}}else{const Y=b.texture.mipmaps;if(Y&&Y.length>0?e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer[0]):e.bindFramebuffer(n.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=n.createRenderbuffer(),Ct(x.__webglDepthbuffer,b,!1);else{const $=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,X=x.__webglDepthbuffer;n.bindRenderbuffer(n.RENDERBUFFER,X),n.framebufferRenderbuffer(n.FRAMEBUFFER,$,n.RENDERBUFFER,X)}}e.bindFramebuffer(n.FRAMEBUFFER,null)}function ge(b,x,O){const Y=i.get(b);x!==void 0&&dt(Y.__webglFramebuffer,b,b.texture,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,0),O!==void 0&&kt(b)}function P(b){const x=b.texture,O=i.get(b),Y=i.get(x);b.addEventListener("dispose",R);const $=b.textures,X=b.isWebGLCubeRenderTarget===!0,Mt=$.length>1;if(Mt||(Y.__webglTexture===void 0&&(Y.__webglTexture=n.createTexture()),Y.__version=x.version,a.memory.textures++),X){O.__webglFramebuffer=[];for(let nt=0;nt<6;nt++)if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer[nt]=[];for(let _t=0;_t<x.mipmaps.length;_t++)O.__webglFramebuffer[nt][_t]=n.createFramebuffer()}else O.__webglFramebuffer[nt]=n.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){O.__webglFramebuffer=[];for(let nt=0;nt<x.mipmaps.length;nt++)O.__webglFramebuffer[nt]=n.createFramebuffer()}else O.__webglFramebuffer=n.createFramebuffer();if(Mt)for(let nt=0,_t=$.length;nt<_t;nt++){const vt=i.get($[nt]);vt.__webglTexture===void 0&&(vt.__webglTexture=n.createTexture(),a.memory.textures++)}if(b.samples>0&&gt(b)===!1){O.__webglMultisampledFramebuffer=n.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(n.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let nt=0;nt<$.length;nt++){const _t=$[nt];O.__webglColorRenderbuffer[nt]=n.createRenderbuffer(),n.bindRenderbuffer(n.RENDERBUFFER,O.__webglColorRenderbuffer[nt]);const vt=r.convert(_t.format,_t.colorSpace),tt=r.convert(_t.type),lt=v(_t.internalFormat,vt,tt,_t.colorSpace,b.isXRRenderTarget===!0),wt=ne(b);n.renderbufferStorageMultisample(n.RENDERBUFFER,wt,lt,b.width,b.height),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+nt,n.RENDERBUFFER,O.__webglColorRenderbuffer[nt])}n.bindRenderbuffer(n.RENDERBUFFER,null),b.depthBuffer&&(O.__webglDepthRenderbuffer=n.createRenderbuffer(),Ct(O.__webglDepthRenderbuffer,b,!0)),e.bindFramebuffer(n.FRAMEBUFFER,null)}}if(X){e.bindTexture(n.TEXTURE_CUBE_MAP,Y.__webglTexture),Nt(n.TEXTURE_CUBE_MAP,x);for(let nt=0;nt<6;nt++)if(x.mipmaps&&x.mipmaps.length>0)for(let _t=0;_t<x.mipmaps.length;_t++)dt(O.__webglFramebuffer[nt][_t],b,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,_t);else dt(O.__webglFramebuffer[nt],b,x,n.COLOR_ATTACHMENT0,n.TEXTURE_CUBE_MAP_POSITIVE_X+nt,0);m(x)&&d(n.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Mt){for(let nt=0,_t=$.length;nt<_t;nt++){const vt=$[nt],tt=i.get(vt);let lt=n.TEXTURE_2D;(b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(lt=b.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(lt,tt.__webglTexture),Nt(lt,vt),dt(O.__webglFramebuffer,b,vt,n.COLOR_ATTACHMENT0+nt,lt,0),m(vt)&&d(lt)}e.unbindTexture()}else{let nt=n.TEXTURE_2D;if((b.isWebGL3DRenderTarget||b.isWebGLArrayRenderTarget)&&(nt=b.isWebGL3DRenderTarget?n.TEXTURE_3D:n.TEXTURE_2D_ARRAY),e.bindTexture(nt,Y.__webglTexture),Nt(nt,x),x.mipmaps&&x.mipmaps.length>0)for(let _t=0;_t<x.mipmaps.length;_t++)dt(O.__webglFramebuffer[_t],b,x,n.COLOR_ATTACHMENT0,nt,_t);else dt(O.__webglFramebuffer,b,x,n.COLOR_ATTACHMENT0,nt,0);m(x)&&d(nt),e.unbindTexture()}b.depthBuffer&&kt(b)}function ee(b){const x=b.textures;for(let O=0,Y=x.length;O<Y;O++){const $=x[O];if(m($)){const X=T(b),Mt=i.get($).__webglTexture;e.bindTexture(X,Mt),d(X),e.unbindTexture()}}}const Dt=[],At=[];function mt(b){if(b.samples>0){if(gt(b)===!1){const x=b.textures,O=b.width,Y=b.height;let $=n.COLOR_BUFFER_BIT;const X=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT,Mt=i.get(b),nt=x.length>1;if(nt)for(let vt=0;vt<x.length;vt++)e.bindFramebuffer(n.FRAMEBUFFER,Mt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+vt,n.RENDERBUFFER,null),e.bindFramebuffer(n.FRAMEBUFFER,Mt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+vt,n.TEXTURE_2D,null,0);e.bindFramebuffer(n.READ_FRAMEBUFFER,Mt.__webglMultisampledFramebuffer);const _t=b.texture.mipmaps;_t&&_t.length>0?e.bindFramebuffer(n.DRAW_FRAMEBUFFER,Mt.__webglFramebuffer[0]):e.bindFramebuffer(n.DRAW_FRAMEBUFFER,Mt.__webglFramebuffer);for(let vt=0;vt<x.length;vt++){if(b.resolveDepthBuffer&&(b.depthBuffer&&($|=n.DEPTH_BUFFER_BIT),b.stencilBuffer&&b.resolveStencilBuffer&&($|=n.STENCIL_BUFFER_BIT)),nt){n.framebufferRenderbuffer(n.READ_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.RENDERBUFFER,Mt.__webglColorRenderbuffer[vt]);const tt=i.get(x[vt]).__webglTexture;n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0,n.TEXTURE_2D,tt,0)}n.blitFramebuffer(0,0,O,Y,0,0,O,Y,$,n.NEAREST),c===!0&&(Dt.length=0,At.length=0,Dt.push(n.COLOR_ATTACHMENT0+vt),b.depthBuffer&&b.resolveDepthBuffer===!1&&(Dt.push(X),At.push(X),n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,At)),n.invalidateFramebuffer(n.READ_FRAMEBUFFER,Dt))}if(e.bindFramebuffer(n.READ_FRAMEBUFFER,null),e.bindFramebuffer(n.DRAW_FRAMEBUFFER,null),nt)for(let vt=0;vt<x.length;vt++){e.bindFramebuffer(n.FRAMEBUFFER,Mt.__webglMultisampledFramebuffer),n.framebufferRenderbuffer(n.FRAMEBUFFER,n.COLOR_ATTACHMENT0+vt,n.RENDERBUFFER,Mt.__webglColorRenderbuffer[vt]);const tt=i.get(x[vt]).__webglTexture;e.bindFramebuffer(n.FRAMEBUFFER,Mt.__webglFramebuffer),n.framebufferTexture2D(n.DRAW_FRAMEBUFFER,n.COLOR_ATTACHMENT0+vt,n.TEXTURE_2D,tt,0)}e.bindFramebuffer(n.DRAW_FRAMEBUFFER,Mt.__webglMultisampledFramebuffer)}else if(b.depthBuffer&&b.resolveDepthBuffer===!1&&c){const x=b.stencilBuffer?n.DEPTH_STENCIL_ATTACHMENT:n.DEPTH_ATTACHMENT;n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER,[x])}}}function ne(b){return Math.min(s.maxSamples,b.samples)}function gt(b){const x=i.get(b);return b.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function Ut(b){const x=a.render.frame;h.get(b)!==x&&(h.set(b,x),b.update())}function fe(b,x){const O=b.colorSpace,Y=b.format,$=b.type;return b.isCompressedTexture===!0||b.isVideoTexture===!0||O!==Vi&&O!==Cn&&(Gt.getTransfer(O)===Kt?(Y!==Ze||$!==rn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),x}function le(b){return typeof HTMLImageElement<"u"&&b instanceof HTMLImageElement?(l.width=b.naturalWidth||b.width,l.height=b.naturalHeight||b.height):typeof VideoFrame<"u"&&b instanceof VideoFrame?(l.width=b.displayWidth,l.height=b.displayHeight):(l.width=b.width,l.height=b.height),l}this.allocateTextureUnit=k,this.resetTextureUnits=N,this.setTexture2D=W,this.setTexture2DArray=H,this.setTexture3D=q,this.setTextureCube=V,this.rebindTextures=ge,this.setupRenderTarget=P,this.updateRenderTargetMipmap=ee,this.updateMultisampleRenderTarget=mt,this.setupDepthRenderbuffer=kt,this.setupFrameBufferTexture=dt,this.useMultisampledRTT=gt}function sv(n,t){function e(i,s=Cn){let r;const a=Gt.getTransfer(s);if(i===rn)return n.UNSIGNED_BYTE;if(i===Co)return n.UNSIGNED_SHORT_4_4_4_4;if(i===Po)return n.UNSIGNED_SHORT_5_5_5_1;if(i===sh)return n.UNSIGNED_INT_5_9_9_9_REV;if(i===rh)return n.UNSIGNED_INT_10F_11F_11F_REV;if(i===nh)return n.BYTE;if(i===ih)return n.SHORT;if(i===Ms)return n.UNSIGNED_SHORT;if(i===Ro)return n.INT;if(i===ni)return n.UNSIGNED_INT;if(i===en)return n.FLOAT;if(i===ws)return n.HALF_FLOAT;if(i===ah)return n.ALPHA;if(i===oh)return n.RGB;if(i===Ze)return n.RGBA;if(i===Es)return n.DEPTH_COMPONENT;if(i===Ts)return n.DEPTH_STENCIL;if(i===Do)return n.RED;if(i===Lo)return n.RED_INTEGER;if(i===lh)return n.RG;if(i===Io)return n.RG_INTEGER;if(i===Uo)return n.RGBA_INTEGER;if(i===dr||i===fr||i===pr||i===mr)if(a===Kt)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(i===dr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(i===fr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(i===pr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(i===mr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(i===dr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(i===fr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(i===pr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(i===mr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(i===Ya||i===qa||i===Za||i===Ka)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(i===Ya)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(i===qa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(i===Za)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(i===Ka)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(i===$a||i===ja||i===Ja)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(i===$a||i===ja)return a===Kt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(i===Ja)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(i===Qa||i===to||i===eo||i===no||i===io||i===so||i===ro||i===ao||i===oo||i===lo||i===co||i===ho||i===uo||i===fo)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(i===Qa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(i===to)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(i===eo)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(i===no)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(i===io)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(i===so)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(i===ro)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(i===ao)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(i===oo)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(i===lo)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(i===co)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(i===ho)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(i===uo)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(i===fo)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(i===po||i===mo||i===go)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(i===po)return a===Kt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(i===mo)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(i===go)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(i===_o||i===vo||i===xo||i===So)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(i===_o)return r.COMPRESSED_RED_RGTC1_EXT;if(i===vo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(i===xo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(i===So)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return i===ys?n.UNSIGNED_INT_24_8:n[i]!==void 0?n[i]:null}return{convert:e}}const rv=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,av=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class ov{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const i=new Th(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=i}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,i=new Fn({vertexShader:rv,fragmentShader:av,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Te(new Zi(20,20),i)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class lv extends Wi{constructor(t,e){super();const i=this;let s=null,r=1,a=null,o="local-floor",c=1,l=null,h=null,u=null,f=null,p=null,g=null;const _=typeof XRWebGLBinding<"u",m=new ov,d={},T=e.getContextAttributes();let v=null,S=null;const A=[],C=[],R=new Wt;let D=null;const E=new Ne;E.viewport=new $t;const M=new Ne;M.viewport=new $t;const w=[E,M],N=new Cp;let k=null,G=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Z){let j=A[Z];return j===void 0&&(j=new ca,A[Z]=j),j.getTargetRaySpace()},this.getControllerGrip=function(Z){let j=A[Z];return j===void 0&&(j=new ca,A[Z]=j),j.getGripSpace()},this.getHand=function(Z){let j=A[Z];return j===void 0&&(j=new ca,A[Z]=j),j.getHandSpace()};function W(Z){const j=C.indexOf(Z.inputSource);if(j===-1)return;const dt=A[j];dt!==void 0&&(dt.update(Z.inputSource,Z.frame,l||a),dt.dispatchEvent({type:Z.type,data:Z.inputSource}))}function H(){s.removeEventListener("select",W),s.removeEventListener("selectstart",W),s.removeEventListener("selectend",W),s.removeEventListener("squeeze",W),s.removeEventListener("squeezestart",W),s.removeEventListener("squeezeend",W),s.removeEventListener("end",H),s.removeEventListener("inputsourceschange",q);for(let Z=0;Z<A.length;Z++){const j=C[Z];j!==null&&(C[Z]=null,A[Z].disconnect(j))}k=null,G=null,m.reset();for(const Z in d)delete d[Z];t.setRenderTarget(v),p=null,f=null,u=null,s=null,S=null,Xt.stop(),i.isPresenting=!1,t.setPixelRatio(D),t.setSize(R.width,R.height,!1),i.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Z){r=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Z){o=Z,i.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(Z){l=Z},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,e)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(Z){if(s=Z,s!==null){if(v=t.getRenderTarget(),s.addEventListener("select",W),s.addEventListener("selectstart",W),s.addEventListener("selectend",W),s.addEventListener("squeeze",W),s.addEventListener("squeezestart",W),s.addEventListener("squeezeend",W),s.addEventListener("end",H),s.addEventListener("inputsourceschange",q),T.xrCompatible!==!0&&await e.makeXRCompatible(),D=t.getPixelRatio(),t.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let dt=null,Ct=null,yt=null;T.depth&&(yt=T.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,dt=T.stencil?Ts:Es,Ct=T.stencil?ys:ni);const kt={colorFormat:e.RGBA8,depthFormat:yt,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(kt),s.updateRenderState({layers:[f]}),t.setPixelRatio(1),t.setSize(f.textureWidth,f.textureHeight,!1),S=new ii(f.textureWidth,f.textureHeight,{format:Ze,type:rn,depthTexture:new Eh(f.textureWidth,f.textureHeight,Ct,void 0,void 0,void 0,void 0,void 0,void 0,dt),stencilBuffer:T.stencil,colorSpace:t.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{const dt={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,e,dt),s.updateRenderState({baseLayer:p}),t.setPixelRatio(1),t.setSize(p.framebufferWidth,p.framebufferHeight,!1),S=new ii(p.framebufferWidth,p.framebufferHeight,{format:Ze,type:rn,colorSpace:t.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),Xt.setContext(s),Xt.start(),i.isPresenting=!0,i.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function q(Z){for(let j=0;j<Z.removed.length;j++){const dt=Z.removed[j],Ct=C.indexOf(dt);Ct>=0&&(C[Ct]=null,A[Ct].disconnect(dt))}for(let j=0;j<Z.added.length;j++){const dt=Z.added[j];let Ct=C.indexOf(dt);if(Ct===-1){for(let kt=0;kt<A.length;kt++)if(kt>=C.length){C.push(dt),Ct=kt;break}else if(C[kt]===null){C[kt]=dt,Ct=kt;break}if(Ct===-1)break}const yt=A[Ct];yt&&yt.connect(dt)}}const V=new F,it=new F;function ct(Z,j,dt){V.setFromMatrixPosition(j.matrixWorld),it.setFromMatrixPosition(dt.matrixWorld);const Ct=V.distanceTo(it),yt=j.projectionMatrix.elements,kt=dt.projectionMatrix.elements,ge=yt[14]/(yt[10]-1),P=yt[14]/(yt[10]+1),ee=(yt[9]+1)/yt[5],Dt=(yt[9]-1)/yt[5],At=(yt[8]-1)/yt[0],mt=(kt[8]+1)/kt[0],ne=ge*At,gt=ge*mt,Ut=Ct/(-At+mt),fe=Ut*-At;if(j.matrixWorld.decompose(Z.position,Z.quaternion,Z.scale),Z.translateX(fe),Z.translateZ(Ut),Z.matrixWorld.compose(Z.position,Z.quaternion,Z.scale),Z.matrixWorldInverse.copy(Z.matrixWorld).invert(),yt[10]===-1)Z.projectionMatrix.copy(j.projectionMatrix),Z.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{const le=ge+Ut,b=P+Ut,x=ne-fe,O=gt+(Ct-fe),Y=ee*P/b*le,$=Dt*P/b*le;Z.projectionMatrix.makePerspective(x,O,Y,$,le,b),Z.projectionMatrixInverse.copy(Z.projectionMatrix).invert()}}function St(Z,j){j===null?Z.matrixWorld.copy(Z.matrix):Z.matrixWorld.multiplyMatrices(j.matrixWorld,Z.matrix),Z.matrixWorldInverse.copy(Z.matrixWorld).invert()}this.updateCamera=function(Z){if(s===null)return;let j=Z.near,dt=Z.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(dt=m.depthFar)),N.near=M.near=E.near=j,N.far=M.far=E.far=dt,(k!==N.near||G!==N.far)&&(s.updateRenderState({depthNear:N.near,depthFar:N.far}),k=N.near,G=N.far),N.layers.mask=Z.layers.mask|6,E.layers.mask=N.layers.mask&3,M.layers.mask=N.layers.mask&5;const Ct=Z.parent,yt=N.cameras;St(N,Ct);for(let kt=0;kt<yt.length;kt++)St(yt[kt],Ct);yt.length===2?ct(N,E,M):N.projectionMatrix.copy(E.projectionMatrix),Nt(Z,N,Ct)};function Nt(Z,j,dt){dt===null?Z.matrix.copy(j.matrixWorld):(Z.matrix.copy(dt.matrixWorld),Z.matrix.invert(),Z.matrix.multiply(j.matrixWorld)),Z.matrix.decompose(Z.position,Z.quaternion,Z.scale),Z.updateMatrixWorld(!0),Z.projectionMatrix.copy(j.projectionMatrix),Z.projectionMatrixInverse.copy(j.projectionMatrixInverse),Z.isPerspectiveCamera&&(Z.fov=Mo*2*Math.atan(1/Z.projectionMatrix.elements[5]),Z.zoom=1)}this.getCamera=function(){return N},this.getFoveation=function(){if(!(f===null&&p===null))return c},this.setFoveation=function(Z){c=Z,f!==null&&(f.fixedFoveation=Z),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=Z)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(N)},this.getCameraTexture=function(Z){return d[Z]};let Ht=null;function qt(Z,j){if(h=j.getViewerPose(l||a),g=j,h!==null){const dt=h.views;p!==null&&(t.setRenderTargetFramebuffer(S,p.framebuffer),t.setRenderTarget(S));let Ct=!1;dt.length!==N.cameras.length&&(N.cameras.length=0,Ct=!0);for(let P=0;P<dt.length;P++){const ee=dt[P];let Dt=null;if(p!==null)Dt=p.getViewport(ee);else{const mt=u.getViewSubImage(f,ee);Dt=mt.viewport,P===0&&(t.setRenderTargetTextures(S,mt.colorTexture,mt.depthStencilTexture),t.setRenderTarget(S))}let At=w[P];At===void 0&&(At=new Ne,At.layers.enable(P),At.viewport=new $t,w[P]=At),At.matrix.fromArray(ee.transform.matrix),At.matrix.decompose(At.position,At.quaternion,At.scale),At.projectionMatrix.fromArray(ee.projectionMatrix),At.projectionMatrixInverse.copy(At.projectionMatrix).invert(),At.viewport.set(Dt.x,Dt.y,Dt.width,Dt.height),P===0&&(N.matrix.copy(At.matrix),N.matrix.decompose(N.position,N.quaternion,N.scale)),Ct===!0&&N.cameras.push(At)}const yt=s.enabledFeatures;if(yt&&yt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=i.getBinding();const P=u.getDepthInformation(dt[0]);P&&P.isValid&&P.texture&&m.init(P,s.renderState)}if(yt&&yt.includes("camera-access")&&_){t.state.unbindTexture(),u=i.getBinding();for(let P=0;P<dt.length;P++){const ee=dt[P].camera;if(ee){let Dt=d[ee];Dt||(Dt=new Th,d[ee]=Dt);const At=u.getCameraImage(ee);Dt.sourceTexture=At}}}}for(let dt=0;dt<A.length;dt++){const Ct=C[dt],yt=A[dt];Ct!==null&&yt!==void 0&&yt.update(Ct,j,l||a)}Ht&&Ht(Z,j),j.detectedPlanes&&i.dispatchEvent({type:"planesdetected",data:j}),g=null}const Xt=new Ah;Xt.setAnimationLoop(qt),this.setAnimationLoop=function(Z){Ht=Z},this.dispose=function(){}}}const qn=new an,cv=new Jt;function hv(n,t){function e(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function i(m,d){d.color.getRGB(m.fogColor.value,vh(n)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,T,v,S){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,S)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),_(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(a(m,d),d.isLineDashedMaterial&&o(m,d)):d.isPointsMaterial?c(m,d,T,v):d.isSpriteMaterial?l(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,e(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Ce&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,e(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Ce&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,e(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,e(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,e(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);const T=t.get(d),v=T.envMap,S=T.envMapRotation;v&&(m.envMap.value=v,qn.copy(S),qn.x*=-1,qn.y*=-1,qn.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(qn.y*=-1,qn.z*=-1),m.envMapRotation.value.setFromMatrix4(cv.makeRotationFromEuler(qn)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,e(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,e(d.aoMap,m.aoMapTransform))}function a(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform))}function o(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function c(m,d,T,v){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*T,m.scale.value=v*.5,d.map&&(m.map.value=d.map,e(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function l(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,e(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,e(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,e(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,e(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,T){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,e(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,e(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,e(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,e(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,e(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Ce&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,e(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,e(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,e(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,e(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,e(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,e(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,e(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){const T=t.get(d).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:i,refreshMaterialUniforms:s}}function uv(n,t,e,i){let s={},r={},a=[];const o=n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);function c(T,v){const S=v.program;i.uniformBlockBinding(T,S)}function l(T,v){let S=s[T.id];S===void 0&&(g(T),S=h(T),s[T.id]=S,T.addEventListener("dispose",m));const A=v.program;i.updateUBOMapping(T,A);const C=t.render.frame;r[T.id]!==C&&(f(T),r[T.id]=C)}function h(T){const v=u();T.__bindingPointIndex=v;const S=n.createBuffer(),A=T.__size,C=T.usage;return n.bindBuffer(n.UNIFORM_BUFFER,S),n.bufferData(n.UNIFORM_BUFFER,A,C),n.bindBuffer(n.UNIFORM_BUFFER,null),n.bindBufferBase(n.UNIFORM_BUFFER,v,S),S}function u(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(T){const v=s[T.id],S=T.uniforms,A=T.__cache;n.bindBuffer(n.UNIFORM_BUFFER,v);for(let C=0,R=S.length;C<R;C++){const D=Array.isArray(S[C])?S[C]:[S[C]];for(let E=0,M=D.length;E<M;E++){const w=D[E];if(p(w,C,E,A)===!0){const N=w.__offset,k=Array.isArray(w.value)?w.value:[w.value];let G=0;for(let W=0;W<k.length;W++){const H=k[W],q=_(H);typeof H=="number"||typeof H=="boolean"?(w.__data[0]=H,n.bufferSubData(n.UNIFORM_BUFFER,N+G,w.__data)):H.isMatrix3?(w.__data[0]=H.elements[0],w.__data[1]=H.elements[1],w.__data[2]=H.elements[2],w.__data[3]=0,w.__data[4]=H.elements[3],w.__data[5]=H.elements[4],w.__data[6]=H.elements[5],w.__data[7]=0,w.__data[8]=H.elements[6],w.__data[9]=H.elements[7],w.__data[10]=H.elements[8],w.__data[11]=0):(H.toArray(w.__data,G),G+=q.storage/Float32Array.BYTES_PER_ELEMENT)}n.bufferSubData(n.UNIFORM_BUFFER,N,w.__data)}}}n.bindBuffer(n.UNIFORM_BUFFER,null)}function p(T,v,S,A){const C=T.value,R=v+"_"+S;if(A[R]===void 0)return typeof C=="number"||typeof C=="boolean"?A[R]=C:A[R]=C.clone(),!0;{const D=A[R];if(typeof C=="number"||typeof C=="boolean"){if(D!==C)return A[R]=C,!0}else if(D.equals(C)===!1)return D.copy(C),!0}return!1}function g(T){const v=T.uniforms;let S=0;const A=16;for(let R=0,D=v.length;R<D;R++){const E=Array.isArray(v[R])?v[R]:[v[R]];for(let M=0,w=E.length;M<w;M++){const N=E[M],k=Array.isArray(N.value)?N.value:[N.value];for(let G=0,W=k.length;G<W;G++){const H=k[G],q=_(H),V=S%A,it=V%q.boundary,ct=V+it;S+=it,ct!==0&&A-ct<q.storage&&(S+=A-ct),N.__data=new Float32Array(q.storage/Float32Array.BYTES_PER_ELEMENT),N.__offset=S,S+=q.storage}}}const C=S%A;return C>0&&(S+=A-C),T.__size=S,T.__cache={},this}function _(T){const v={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(v.boundary=4,v.storage=4):T.isVector2?(v.boundary=8,v.storage=8):T.isVector3||T.isColor?(v.boundary=16,v.storage=12):T.isVector4?(v.boundary=16,v.storage=16):T.isMatrix3?(v.boundary=48,v.storage=48):T.isMatrix4?(v.boundary=64,v.storage=64):T.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",T),v}function m(T){const v=T.target;v.removeEventListener("dispose",m);const S=a.indexOf(v.__bindingPointIndex);a.splice(S,1),n.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function d(){for(const T in s)n.deleteBuffer(s[T]);a=[],s={},r={}}return{bind:c,update:l,dispose:d}}class dv{constructor(t={}){const{canvas:e=Hf(),context:i=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=t;this.isWebGLRenderer=!0;let p;if(i!==null){if(typeof WebGLRenderingContext<"u"&&i instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=i.getContextAttributes().alpha}else p=a;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,d=null;const T=[],v=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=In,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const S=this;let A=!1;this._outputColorSpace=Re;let C=0,R=0,D=null,E=-1,M=null;const w=new $t,N=new $t;let k=null;const G=new Ot(0);let W=0,H=e.width,q=e.height,V=1,it=null,ct=null;const St=new $t(0,0,H,q),Nt=new $t(0,0,H,q);let Ht=!1;const qt=new Oo;let Xt=!1,Z=!1;const j=new Jt,dt=new F,Ct=new $t,yt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let kt=!1;function ge(){return D===null?V:1}let P=i;function ee(y,I){return e.getContext(y,I)}try{const y={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Ao}`),e.addEventListener("webglcontextlost",st,!1),e.addEventListener("webglcontextrestored",ut,!1),e.addEventListener("webglcontextcreationerror",J,!1),P===null){const I="webgl2";if(P=ee(I,y),P===null)throw ee(I)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(y){throw console.error("THREE.WebGLRenderer: "+y.message),y}let Dt,At,mt,ne,gt,Ut,fe,le,b,x,O,Y,$,X,Mt,nt,_t,vt,tt,lt,wt,xt,at,Lt;function L(){Dt=new y_(P),Dt.init(),xt=new sv(P,Dt),At=new m_(P,Dt,t,xt),mt=new nv(P,Dt),At.reversedDepthBuffer&&f&&mt.buffers.depth.setReversed(!0),ne=new b_(P),gt=new G0,Ut=new iv(P,Dt,mt,gt,At,xt,ne),fe=new __(S),le=new M_(S),b=new Dp(P),at=new f_(P,b),x=new E_(P,b,ne,at),O=new A_(P,x,b,ne),tt=new w_(P,At,Ut),nt=new g_(gt),Y=new V0(S,fe,le,Dt,At,at,nt),$=new hv(S,gt),X=new X0,Mt=new j0(Dt),vt=new d_(S,fe,le,mt,O,p,c),_t=new tv(S,O,At),Lt=new uv(P,ne,At,mt),lt=new p_(P,Dt,ne),wt=new T_(P,Dt,ne),ne.programs=Y.programs,S.capabilities=At,S.extensions=Dt,S.properties=gt,S.renderLists=X,S.shadowMap=_t,S.state=mt,S.info=ne}L();const et=new lv(S,P);this.xr=et,this.getContext=function(){return P},this.getContextAttributes=function(){return P.getContextAttributes()},this.forceContextLoss=function(){const y=Dt.get("WEBGL_lose_context");y&&y.loseContext()},this.forceContextRestore=function(){const y=Dt.get("WEBGL_lose_context");y&&y.restoreContext()},this.getPixelRatio=function(){return V},this.setPixelRatio=function(y){y!==void 0&&(V=y,this.setSize(H,q,!1))},this.getSize=function(y){return y.set(H,q)},this.setSize=function(y,I,B=!0){if(et.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}H=y,q=I,e.width=Math.floor(y*V),e.height=Math.floor(I*V),B===!0&&(e.style.width=y+"px",e.style.height=I+"px"),this.setViewport(0,0,y,I)},this.getDrawingBufferSize=function(y){return y.set(H*V,q*V).floor()},this.setDrawingBufferSize=function(y,I,B){H=y,q=I,V=B,e.width=Math.floor(y*B),e.height=Math.floor(I*B),this.setViewport(0,0,y,I)},this.getCurrentViewport=function(y){return y.copy(w)},this.getViewport=function(y){return y.copy(St)},this.setViewport=function(y,I,B,z){y.isVector4?St.set(y.x,y.y,y.z,y.w):St.set(y,I,B,z),mt.viewport(w.copy(St).multiplyScalar(V).round())},this.getScissor=function(y){return y.copy(Nt)},this.setScissor=function(y,I,B,z){y.isVector4?Nt.set(y.x,y.y,y.z,y.w):Nt.set(y,I,B,z),mt.scissor(N.copy(Nt).multiplyScalar(V).round())},this.getScissorTest=function(){return Ht},this.setScissorTest=function(y){mt.setScissorTest(Ht=y)},this.setOpaqueSort=function(y){it=y},this.setTransparentSort=function(y){ct=y},this.getClearColor=function(y){return y.copy(vt.getClearColor())},this.setClearColor=function(){vt.setClearColor(...arguments)},this.getClearAlpha=function(){return vt.getClearAlpha()},this.setClearAlpha=function(){vt.setClearAlpha(...arguments)},this.clear=function(y=!0,I=!0,B=!0){let z=0;if(y){let U=!1;if(D!==null){const Q=D.texture.format;U=Q===Uo||Q===Io||Q===Lo}if(U){const Q=D.texture.type,ot=Q===rn||Q===ni||Q===Ms||Q===ys||Q===Co||Q===Po,ft=vt.getClearColor(),ht=vt.getClearAlpha(),bt=ft.r,Rt=ft.g,Et=ft.b;ot?(g[0]=bt,g[1]=Rt,g[2]=Et,g[3]=ht,P.clearBufferuiv(P.COLOR,0,g)):(_[0]=bt,_[1]=Rt,_[2]=Et,_[3]=ht,P.clearBufferiv(P.COLOR,0,_))}else z|=P.COLOR_BUFFER_BIT}I&&(z|=P.DEPTH_BUFFER_BIT),B&&(z|=P.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),P.clear(z)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",st,!1),e.removeEventListener("webglcontextrestored",ut,!1),e.removeEventListener("webglcontextcreationerror",J,!1),vt.dispose(),X.dispose(),Mt.dispose(),gt.dispose(),fe.dispose(),le.dispose(),O.dispose(),at.dispose(),Lt.dispose(),Y.dispose(),et.dispose(),et.removeEventListener("sessionstart",$e),et.removeEventListener("sessionend",ko),Nn.stop()};function st(y){y.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function ut(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const y=ne.autoReset,I=_t.enabled,B=_t.autoUpdate,z=_t.needsUpdate,U=_t.type;L(),ne.autoReset=y,_t.enabled=I,_t.autoUpdate=B,_t.needsUpdate=z,_t.type=U}function J(y){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",y.statusMessage)}function K(y){const I=y.target;I.removeEventListener("dispose",K),pt(I)}function pt(y){Pt(y),gt.remove(y)}function Pt(y){const I=gt.get(y).programs;I!==void 0&&(I.forEach(function(B){Y.releaseProgram(B)}),y.isShaderMaterial&&Y.releaseShaderCache(y))}this.renderBufferDirect=function(y,I,B,z,U,Q){I===null&&(I=yt);const ot=U.isMesh&&U.matrixWorld.determinant()<0,ft=Uh(y,I,B,z,U);mt.setMaterial(z,ot);let ht=B.index,bt=1;if(z.wireframe===!0){if(ht=x.getWireframeAttribute(B),ht===void 0)return;bt=2}const Rt=B.drawRange,Et=B.attributes.position;let Bt=Rt.start*bt,Zt=(Rt.start+Rt.count)*bt;Q!==null&&(Bt=Math.max(Bt,Q.start*bt),Zt=Math.min(Zt,(Q.start+Q.count)*bt)),ht!==null?(Bt=Math.max(Bt,0),Zt=Math.min(Zt,ht.count)):Et!=null&&(Bt=Math.max(Bt,0),Zt=Math.min(Zt,Et.count));const ae=Zt-Bt;if(ae<0||ae===1/0)return;at.setup(U,z,ft,B,ht);let te,jt=lt;if(ht!==null&&(te=b.get(ht),jt=wt,jt.setIndex(te)),U.isMesh)z.wireframe===!0?(mt.setLineWidth(z.wireframeLinewidth*ge()),jt.setMode(P.LINES)):jt.setMode(P.TRIANGLES);else if(U.isLine){let Tt=z.linewidth;Tt===void 0&&(Tt=1),mt.setLineWidth(Tt*ge()),U.isLineSegments?jt.setMode(P.LINES):U.isLineLoop?jt.setMode(P.LINE_LOOP):jt.setMode(P.LINE_STRIP)}else U.isPoints?jt.setMode(P.POINTS):U.isSprite&&jt.setMode(P.TRIANGLES);if(U.isBatchedMesh)if(U._multiDrawInstances!==null)bs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),jt.renderMultiDrawInstances(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount,U._multiDrawInstances);else if(Dt.get("WEBGL_multi_draw"))jt.renderMultiDraw(U._multiDrawStarts,U._multiDrawCounts,U._multiDrawCount);else{const Tt=U._multiDrawStarts,ie=U._multiDrawCounts,Vt=U._multiDrawCount,Pe=ht?b.get(ht).bytesPerElement:1,li=gt.get(z).currentProgram.getUniforms();for(let De=0;De<Vt;De++)li.setValue(P,"_gl_DrawID",De),jt.render(Tt[De]/Pe,ie[De])}else if(U.isInstancedMesh)jt.renderInstances(Bt,ae,U.count);else if(B.isInstancedBufferGeometry){const Tt=B._maxInstanceCount!==void 0?B._maxInstanceCount:1/0,ie=Math.min(B.instanceCount,Tt);jt.renderInstances(Bt,ae,ie)}else jt.render(Bt,ae)};function Qt(y,I,B){y.transparent===!0&&y.side===gn&&y.forceSinglePass===!1?(y.side=Ce,y.needsUpdate=!0,Cs(y,I,B),y.side=Un,y.needsUpdate=!0,Cs(y,I,B),y.side=gn):Cs(y,I,B)}this.compile=function(y,I,B=null){B===null&&(B=y),d=Mt.get(B),d.init(I),v.push(d),B.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(d.pushLight(U),U.castShadow&&d.pushShadow(U))}),y!==B&&y.traverseVisible(function(U){U.isLight&&U.layers.test(I.layers)&&(d.pushLight(U),U.castShadow&&d.pushShadow(U))}),d.setupLights();const z=new Set;return y.traverse(function(U){if(!(U.isMesh||U.isPoints||U.isLine||U.isSprite))return;const Q=U.material;if(Q)if(Array.isArray(Q))for(let ot=0;ot<Q.length;ot++){const ft=Q[ot];Qt(ft,B,U),z.add(ft)}else Qt(Q,B,U),z.add(Q)}),d=v.pop(),z},this.compileAsync=function(y,I,B=null){const z=this.compile(y,I,B);return new Promise(U=>{function Q(){if(z.forEach(function(ot){gt.get(ot).currentProgram.isReady()&&z.delete(ot)}),z.size===0){U(y);return}setTimeout(Q,10)}Dt.get("KHR_parallel_shader_compile")!==null?Q():setTimeout(Q,10)})};let Yt=null;function ln(y){Yt&&Yt(y)}function $e(){Nn.stop()}function ko(){Nn.start()}const Nn=new Ah;Nn.setAnimationLoop(ln),typeof self<"u"&&Nn.setContext(self),this.setAnimationLoop=function(y){Yt=y,et.setAnimationLoop(y),y===null?Nn.stop():Nn.start()},et.addEventListener("sessionstart",$e),et.addEventListener("sessionend",ko),this.render=function(y,I){if(I!==void 0&&I.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(y.matrixWorldAutoUpdate===!0&&y.updateMatrixWorld(),I.parent===null&&I.matrixWorldAutoUpdate===!0&&I.updateMatrixWorld(),et.enabled===!0&&et.isPresenting===!0&&(et.cameraAutoUpdate===!0&&et.updateCamera(I),I=et.getCamera()),y.isScene===!0&&y.onBeforeRender(S,y,I,D),d=Mt.get(y,v.length),d.init(I),v.push(d),j.multiplyMatrices(I.projectionMatrix,I.matrixWorldInverse),qt.setFromProjectionMatrix(j,nn,I.reversedDepth),Z=this.localClippingEnabled,Xt=nt.init(this.clippingPlanes,Z),m=X.get(y,T.length),m.init(),T.push(m),et.enabled===!0&&et.isPresenting===!0){const Q=S.xr.getDepthSensingMesh();Q!==null&&Cr(Q,I,-1/0,S.sortObjects)}Cr(y,I,0,S.sortObjects),m.finish(),S.sortObjects===!0&&m.sort(it,ct),kt=et.enabled===!1||et.isPresenting===!1||et.hasDepthSensing()===!1,kt&&vt.addToRenderList(m,y),this.info.render.frame++,Xt===!0&&nt.beginShadows();const B=d.state.shadowsArray;_t.render(B,y,I),Xt===!0&&nt.endShadows(),this.info.autoReset===!0&&this.info.reset();const z=m.opaque,U=m.transmissive;if(d.setupLights(),I.isArrayCamera){const Q=I.cameras;if(U.length>0)for(let ot=0,ft=Q.length;ot<ft;ot++){const ht=Q[ot];Vo(z,U,y,ht)}kt&&vt.render(y);for(let ot=0,ft=Q.length;ot<ft;ot++){const ht=Q[ot];Ho(m,y,ht,ht.viewport)}}else U.length>0&&Vo(z,U,y,I),kt&&vt.render(y),Ho(m,y,I);D!==null&&R===0&&(Ut.updateMultisampleRenderTarget(D),Ut.updateRenderTargetMipmap(D)),y.isScene===!0&&y.onAfterRender(S,y,I),at.resetDefaultState(),E=-1,M=null,v.pop(),v.length>0?(d=v[v.length-1],Xt===!0&&nt.setGlobalState(S.clippingPlanes,d.state.camera)):d=null,T.pop(),T.length>0?m=T[T.length-1]:m=null};function Cr(y,I,B,z){if(y.visible===!1)return;if(y.layers.test(I.layers)){if(y.isGroup)B=y.renderOrder;else if(y.isLOD)y.autoUpdate===!0&&y.update(I);else if(y.isLight)d.pushLight(y),y.castShadow&&d.pushShadow(y);else if(y.isSprite){if(!y.frustumCulled||qt.intersectsSprite(y)){z&&Ct.setFromMatrixPosition(y.matrixWorld).applyMatrix4(j);const ot=O.update(y),ft=y.material;ft.visible&&m.push(y,ot,ft,B,Ct.z,null)}}else if((y.isMesh||y.isLine||y.isPoints)&&(!y.frustumCulled||qt.intersectsObject(y))){const ot=O.update(y),ft=y.material;if(z&&(y.boundingSphere!==void 0?(y.boundingSphere===null&&y.computeBoundingSphere(),Ct.copy(y.boundingSphere.center)):(ot.boundingSphere===null&&ot.computeBoundingSphere(),Ct.copy(ot.boundingSphere.center)),Ct.applyMatrix4(y.matrixWorld).applyMatrix4(j)),Array.isArray(ft)){const ht=ot.groups;for(let bt=0,Rt=ht.length;bt<Rt;bt++){const Et=ht[bt],Bt=ft[Et.materialIndex];Bt&&Bt.visible&&m.push(y,ot,Bt,B,Ct.z,Et)}}else ft.visible&&m.push(y,ot,ft,B,Ct.z,null)}}const Q=y.children;for(let ot=0,ft=Q.length;ot<ft;ot++)Cr(Q[ot],I,B,z)}function Ho(y,I,B,z){const U=y.opaque,Q=y.transmissive,ot=y.transparent;d.setupLightsView(B),Xt===!0&&nt.setGlobalState(S.clippingPlanes,B),z&&mt.viewport(w.copy(z)),U.length>0&&Rs(U,I,B),Q.length>0&&Rs(Q,I,B),ot.length>0&&Rs(ot,I,B),mt.buffers.depth.setTest(!0),mt.buffers.depth.setMask(!0),mt.buffers.color.setMask(!0),mt.setPolygonOffset(!1)}function Vo(y,I,B,z){if((B.isScene===!0?B.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[z.id]===void 0&&(d.state.transmissionRenderTarget[z.id]=new ii(1,1,{generateMipmaps:!0,type:Dt.has("EXT_color_buffer_half_float")||Dt.has("EXT_color_buffer_float")?ws:rn,minFilter:ti,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Gt.workingColorSpace}));const Q=d.state.transmissionRenderTarget[z.id],ot=z.viewport||w;Q.setSize(ot.z*S.transmissionResolutionScale,ot.w*S.transmissionResolutionScale);const ft=S.getRenderTarget(),ht=S.getActiveCubeFace(),bt=S.getActiveMipmapLevel();S.setRenderTarget(Q),S.getClearColor(G),W=S.getClearAlpha(),W<1&&S.setClearColor(16777215,.5),S.clear(),kt&&vt.render(B);const Rt=S.toneMapping;S.toneMapping=In;const Et=z.viewport;if(z.viewport!==void 0&&(z.viewport=void 0),d.setupLightsView(z),Xt===!0&&nt.setGlobalState(S.clippingPlanes,z),Rs(y,B,z),Ut.updateMultisampleRenderTarget(Q),Ut.updateRenderTargetMipmap(Q),Dt.has("WEBGL_multisampled_render_to_texture")===!1){let Bt=!1;for(let Zt=0,ae=I.length;Zt<ae;Zt++){const te=I[Zt],jt=te.object,Tt=te.geometry,ie=te.material,Vt=te.group;if(ie.side===gn&&jt.layers.test(z.layers)){const Pe=ie.side;ie.side=Ce,ie.needsUpdate=!0,Go(jt,B,z,Tt,ie,Vt),ie.side=Pe,ie.needsUpdate=!0,Bt=!0}}Bt===!0&&(Ut.updateMultisampleRenderTarget(Q),Ut.updateRenderTargetMipmap(Q))}S.setRenderTarget(ft,ht,bt),S.setClearColor(G,W),Et!==void 0&&(z.viewport=Et),S.toneMapping=Rt}function Rs(y,I,B){const z=I.isScene===!0?I.overrideMaterial:null;for(let U=0,Q=y.length;U<Q;U++){const ot=y[U],ft=ot.object,ht=ot.geometry,bt=ot.group;let Rt=ot.material;Rt.allowOverride===!0&&z!==null&&(Rt=z),ft.layers.test(B.layers)&&Go(ft,I,B,ht,Rt,bt)}}function Go(y,I,B,z,U,Q){y.onBeforeRender(S,I,B,z,U,Q),y.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,y.matrixWorld),y.normalMatrix.getNormalMatrix(y.modelViewMatrix),U.onBeforeRender(S,I,B,z,y,Q),U.transparent===!0&&U.side===gn&&U.forceSinglePass===!1?(U.side=Ce,U.needsUpdate=!0,S.renderBufferDirect(B,I,z,U,y,Q),U.side=Un,U.needsUpdate=!0,S.renderBufferDirect(B,I,z,U,y,Q),U.side=gn):S.renderBufferDirect(B,I,z,U,y,Q),y.onAfterRender(S,I,B,z,U,Q)}function Cs(y,I,B){I.isScene!==!0&&(I=yt);const z=gt.get(y),U=d.state.lights,Q=d.state.shadowsArray,ot=U.state.version,ft=Y.getParameters(y,U.state,Q,I,B),ht=Y.getProgramCacheKey(ft);let bt=z.programs;z.environment=y.isMeshStandardMaterial?I.environment:null,z.fog=I.fog,z.envMap=(y.isMeshStandardMaterial?le:fe).get(y.envMap||z.environment),z.envMapRotation=z.environment!==null&&y.envMap===null?I.environmentRotation:y.envMapRotation,bt===void 0&&(y.addEventListener("dispose",K),bt=new Map,z.programs=bt);let Rt=bt.get(ht);if(Rt!==void 0){if(z.currentProgram===Rt&&z.lightsStateVersion===ot)return Xo(y,ft),Rt}else ft.uniforms=Y.getUniforms(y),y.onBeforeCompile(ft,S),Rt=Y.acquireProgram(ft,ht),bt.set(ht,Rt),z.uniforms=ft.uniforms;const Et=z.uniforms;return(!y.isShaderMaterial&&!y.isRawShaderMaterial||y.clipping===!0)&&(Et.clippingPlanes=nt.uniform),Xo(y,ft),z.needsLights=Nh(y),z.lightsStateVersion=ot,z.needsLights&&(Et.ambientLightColor.value=U.state.ambient,Et.lightProbe.value=U.state.probe,Et.directionalLights.value=U.state.directional,Et.directionalLightShadows.value=U.state.directionalShadow,Et.spotLights.value=U.state.spot,Et.spotLightShadows.value=U.state.spotShadow,Et.rectAreaLights.value=U.state.rectArea,Et.ltc_1.value=U.state.rectAreaLTC1,Et.ltc_2.value=U.state.rectAreaLTC2,Et.pointLights.value=U.state.point,Et.pointLightShadows.value=U.state.pointShadow,Et.hemisphereLights.value=U.state.hemi,Et.directionalShadowMap.value=U.state.directionalShadowMap,Et.directionalShadowMatrix.value=U.state.directionalShadowMatrix,Et.spotShadowMap.value=U.state.spotShadowMap,Et.spotLightMatrix.value=U.state.spotLightMatrix,Et.spotLightMap.value=U.state.spotLightMap,Et.pointShadowMap.value=U.state.pointShadowMap,Et.pointShadowMatrix.value=U.state.pointShadowMatrix),z.currentProgram=Rt,z.uniformsList=null,Rt}function Wo(y){if(y.uniformsList===null){const I=y.currentProgram.getUniforms();y.uniformsList=gr.seqWithValue(I.seq,y.uniforms)}return y.uniformsList}function Xo(y,I){const B=gt.get(y);B.outputColorSpace=I.outputColorSpace,B.batching=I.batching,B.batchingColor=I.batchingColor,B.instancing=I.instancing,B.instancingColor=I.instancingColor,B.instancingMorph=I.instancingMorph,B.skinning=I.skinning,B.morphTargets=I.morphTargets,B.morphNormals=I.morphNormals,B.morphColors=I.morphColors,B.morphTargetsCount=I.morphTargetsCount,B.numClippingPlanes=I.numClippingPlanes,B.numIntersection=I.numClipIntersection,B.vertexAlphas=I.vertexAlphas,B.vertexTangents=I.vertexTangents,B.toneMapping=I.toneMapping}function Uh(y,I,B,z,U){I.isScene!==!0&&(I=yt),Ut.resetTextureUnits();const Q=I.fog,ot=z.isMeshStandardMaterial?I.environment:null,ft=D===null?S.outputColorSpace:D.isXRRenderTarget===!0?D.texture.colorSpace:Vi,ht=(z.isMeshStandardMaterial?le:fe).get(z.envMap||ot),bt=z.vertexColors===!0&&!!B.attributes.color&&B.attributes.color.itemSize===4,Rt=!!B.attributes.tangent&&(!!z.normalMap||z.anisotropy>0),Et=!!B.morphAttributes.position,Bt=!!B.morphAttributes.normal,Zt=!!B.morphAttributes.color;let ae=In;z.toneMapped&&(D===null||D.isXRRenderTarget===!0)&&(ae=S.toneMapping);const te=B.morphAttributes.position||B.morphAttributes.normal||B.morphAttributes.color,jt=te!==void 0?te.length:0,Tt=gt.get(z),ie=d.state.lights;if(Xt===!0&&(Z===!0||y!==M)){const ye=y===M&&z.id===E;nt.setState(z,y,ye)}let Vt=!1;z.version===Tt.__version?(Tt.needsLights&&Tt.lightsStateVersion!==ie.state.version||Tt.outputColorSpace!==ft||U.isBatchedMesh&&Tt.batching===!1||!U.isBatchedMesh&&Tt.batching===!0||U.isBatchedMesh&&Tt.batchingColor===!0&&U.colorTexture===null||U.isBatchedMesh&&Tt.batchingColor===!1&&U.colorTexture!==null||U.isInstancedMesh&&Tt.instancing===!1||!U.isInstancedMesh&&Tt.instancing===!0||U.isSkinnedMesh&&Tt.skinning===!1||!U.isSkinnedMesh&&Tt.skinning===!0||U.isInstancedMesh&&Tt.instancingColor===!0&&U.instanceColor===null||U.isInstancedMesh&&Tt.instancingColor===!1&&U.instanceColor!==null||U.isInstancedMesh&&Tt.instancingMorph===!0&&U.morphTexture===null||U.isInstancedMesh&&Tt.instancingMorph===!1&&U.morphTexture!==null||Tt.envMap!==ht||z.fog===!0&&Tt.fog!==Q||Tt.numClippingPlanes!==void 0&&(Tt.numClippingPlanes!==nt.numPlanes||Tt.numIntersection!==nt.numIntersection)||Tt.vertexAlphas!==bt||Tt.vertexTangents!==Rt||Tt.morphTargets!==Et||Tt.morphNormals!==Bt||Tt.morphColors!==Zt||Tt.toneMapping!==ae||Tt.morphTargetsCount!==jt)&&(Vt=!0):(Vt=!0,Tt.__version=z.version);let Pe=Tt.currentProgram;Vt===!0&&(Pe=Cs(z,I,U));let li=!1,De=!1,$i=!1;const se=Pe.getUniforms(),Be=Tt.uniforms;if(mt.useProgram(Pe.program)&&(li=!0,De=!0,$i=!0),z.id!==E&&(E=z.id,De=!0),li||M!==y){mt.buffers.depth.getReversed()&&y.reversedDepth!==!0&&(y._reversedDepth=!0,y.updateProjectionMatrix()),se.setValue(P,"projectionMatrix",y.projectionMatrix),se.setValue(P,"viewMatrix",y.matrixWorldInverse);const we=se.map.cameraPosition;we!==void 0&&we.setValue(P,dt.setFromMatrixPosition(y.matrixWorld)),At.logarithmicDepthBuffer&&se.setValue(P,"logDepthBufFC",2/(Math.log(y.far+1)/Math.LN2)),(z.isMeshPhongMaterial||z.isMeshToonMaterial||z.isMeshLambertMaterial||z.isMeshBasicMaterial||z.isMeshStandardMaterial||z.isShaderMaterial)&&se.setValue(P,"isOrthographic",y.isOrthographicCamera===!0),M!==y&&(M=y,De=!0,$i=!0)}if(U.isSkinnedMesh){se.setOptional(P,U,"bindMatrix"),se.setOptional(P,U,"bindMatrixInverse");const ye=U.skeleton;ye&&(ye.boneTexture===null&&ye.computeBoneTexture(),se.setValue(P,"boneTexture",ye.boneTexture,Ut))}U.isBatchedMesh&&(se.setOptional(P,U,"batchingTexture"),se.setValue(P,"batchingTexture",U._matricesTexture,Ut),se.setOptional(P,U,"batchingIdTexture"),se.setValue(P,"batchingIdTexture",U._indirectTexture,Ut),se.setOptional(P,U,"batchingColorTexture"),U._colorsTexture!==null&&se.setValue(P,"batchingColorTexture",U._colorsTexture,Ut));const ze=B.morphAttributes;if((ze.position!==void 0||ze.normal!==void 0||ze.color!==void 0)&&tt.update(U,B,Pe),(De||Tt.receiveShadow!==U.receiveShadow)&&(Tt.receiveShadow=U.receiveShadow,se.setValue(P,"receiveShadow",U.receiveShadow)),z.isMeshGouraudMaterial&&z.envMap!==null&&(Be.envMap.value=ht,Be.flipEnvMap.value=ht.isCubeTexture&&ht.isRenderTargetTexture===!1?-1:1),z.isMeshStandardMaterial&&z.envMap===null&&I.environment!==null&&(Be.envMapIntensity.value=I.environmentIntensity),De&&(se.setValue(P,"toneMappingExposure",S.toneMappingExposure),Tt.needsLights&&Fh(Be,$i),Q&&z.fog===!0&&$.refreshFogUniforms(Be,Q),$.refreshMaterialUniforms(Be,z,V,q,d.state.transmissionRenderTarget[y.id]),gr.upload(P,Wo(Tt),Be,Ut)),z.isShaderMaterial&&z.uniformsNeedUpdate===!0&&(gr.upload(P,Wo(Tt),Be,Ut),z.uniformsNeedUpdate=!1),z.isSpriteMaterial&&se.setValue(P,"center",U.center),se.setValue(P,"modelViewMatrix",U.modelViewMatrix),se.setValue(P,"normalMatrix",U.normalMatrix),se.setValue(P,"modelMatrix",U.matrixWorld),z.isShaderMaterial||z.isRawShaderMaterial){const ye=z.uniformsGroups;for(let we=0,Pr=ye.length;we<Pr;we++){const On=ye[we];Lt.update(On,Pe),Lt.bind(On,Pe)}}return Pe}function Fh(y,I){y.ambientLightColor.needsUpdate=I,y.lightProbe.needsUpdate=I,y.directionalLights.needsUpdate=I,y.directionalLightShadows.needsUpdate=I,y.pointLights.needsUpdate=I,y.pointLightShadows.needsUpdate=I,y.spotLights.needsUpdate=I,y.spotLightShadows.needsUpdate=I,y.rectAreaLights.needsUpdate=I,y.hemisphereLights.needsUpdate=I}function Nh(y){return y.isMeshLambertMaterial||y.isMeshToonMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isShadowMaterial||y.isShaderMaterial&&y.lights===!0}this.getActiveCubeFace=function(){return C},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return D},this.setRenderTargetTextures=function(y,I,B){const z=gt.get(y);z.__autoAllocateDepthBuffer=y.resolveDepthBuffer===!1,z.__autoAllocateDepthBuffer===!1&&(z.__useRenderToTexture=!1),gt.get(y.texture).__webglTexture=I,gt.get(y.depthTexture).__webglTexture=z.__autoAllocateDepthBuffer?void 0:B,z.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(y,I){const B=gt.get(y);B.__webglFramebuffer=I,B.__useDefaultFramebuffer=I===void 0};const Oh=P.createFramebuffer();this.setRenderTarget=function(y,I=0,B=0){D=y,C=I,R=B;let z=!0,U=null,Q=!1,ot=!1;if(y){const ht=gt.get(y);if(ht.__useDefaultFramebuffer!==void 0)mt.bindFramebuffer(P.FRAMEBUFFER,null),z=!1;else if(ht.__webglFramebuffer===void 0)Ut.setupRenderTarget(y);else if(ht.__hasExternalTextures)Ut.rebindTextures(y,gt.get(y.texture).__webglTexture,gt.get(y.depthTexture).__webglTexture);else if(y.depthBuffer){const Et=y.depthTexture;if(ht.__boundDepthTexture!==Et){if(Et!==null&&gt.has(Et)&&(y.width!==Et.image.width||y.height!==Et.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ut.setupDepthRenderbuffer(y)}}const bt=y.texture;(bt.isData3DTexture||bt.isDataArrayTexture||bt.isCompressedArrayTexture)&&(ot=!0);const Rt=gt.get(y).__webglFramebuffer;y.isWebGLCubeRenderTarget?(Array.isArray(Rt[I])?U=Rt[I][B]:U=Rt[I],Q=!0):y.samples>0&&Ut.useMultisampledRTT(y)===!1?U=gt.get(y).__webglMultisampledFramebuffer:Array.isArray(Rt)?U=Rt[B]:U=Rt,w.copy(y.viewport),N.copy(y.scissor),k=y.scissorTest}else w.copy(St).multiplyScalar(V).floor(),N.copy(Nt).multiplyScalar(V).floor(),k=Ht;if(B!==0&&(U=Oh),mt.bindFramebuffer(P.FRAMEBUFFER,U)&&z&&mt.drawBuffers(y,U),mt.viewport(w),mt.scissor(N),mt.setScissorTest(k),Q){const ht=gt.get(y.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_CUBE_MAP_POSITIVE_X+I,ht.__webglTexture,B)}else if(ot){const ht=I;for(let bt=0;bt<y.textures.length;bt++){const Rt=gt.get(y.textures[bt]);P.framebufferTextureLayer(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0+bt,Rt.__webglTexture,B,ht)}}else if(y!==null&&B!==0){const ht=gt.get(y.texture);P.framebufferTexture2D(P.FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,ht.__webglTexture,B)}E=-1},this.readRenderTargetPixels=function(y,I,B,z,U,Q,ot,ft=0){if(!(y&&y.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ht=gt.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ot!==void 0&&(ht=ht[ot]),ht){mt.bindFramebuffer(P.FRAMEBUFFER,ht);try{const bt=y.textures[ft],Rt=bt.format,Et=bt.type;if(!At.textureFormatReadable(Rt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!At.textureTypeReadable(Et)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}I>=0&&I<=y.width-z&&B>=0&&B<=y.height-U&&(y.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+ft),P.readPixels(I,B,z,U,xt.convert(Rt),xt.convert(Et),Q))}finally{const bt=D!==null?gt.get(D).__webglFramebuffer:null;mt.bindFramebuffer(P.FRAMEBUFFER,bt)}}},this.readRenderTargetPixelsAsync=async function(y,I,B,z,U,Q,ot,ft=0){if(!(y&&y.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ht=gt.get(y).__webglFramebuffer;if(y.isWebGLCubeRenderTarget&&ot!==void 0&&(ht=ht[ot]),ht)if(I>=0&&I<=y.width-z&&B>=0&&B<=y.height-U){mt.bindFramebuffer(P.FRAMEBUFFER,ht);const bt=y.textures[ft],Rt=bt.format,Et=bt.type;if(!At.textureFormatReadable(Rt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!At.textureTypeReadable(Et))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Bt=P.createBuffer();P.bindBuffer(P.PIXEL_PACK_BUFFER,Bt),P.bufferData(P.PIXEL_PACK_BUFFER,Q.byteLength,P.STREAM_READ),y.textures.length>1&&P.readBuffer(P.COLOR_ATTACHMENT0+ft),P.readPixels(I,B,z,U,xt.convert(Rt),xt.convert(Et),0);const Zt=D!==null?gt.get(D).__webglFramebuffer:null;mt.bindFramebuffer(P.FRAMEBUFFER,Zt);const ae=P.fenceSync(P.SYNC_GPU_COMMANDS_COMPLETE,0);return P.flush(),await Vf(P,ae,4),P.bindBuffer(P.PIXEL_PACK_BUFFER,Bt),P.getBufferSubData(P.PIXEL_PACK_BUFFER,0,Q),P.deleteBuffer(Bt),P.deleteSync(ae),Q}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(y,I=null,B=0){const z=Math.pow(2,-B),U=Math.floor(y.image.width*z),Q=Math.floor(y.image.height*z),ot=I!==null?I.x:0,ft=I!==null?I.y:0;Ut.setTexture2D(y,0),P.copyTexSubImage2D(P.TEXTURE_2D,B,0,0,ot,ft,U,Q),mt.unbindTexture()};const Bh=P.createFramebuffer(),zh=P.createFramebuffer();this.copyTextureToTexture=function(y,I,B=null,z=null,U=0,Q=null){Q===null&&(U!==0?(bs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Q=U,U=0):Q=0);let ot,ft,ht,bt,Rt,Et,Bt,Zt,ae;const te=y.isCompressedTexture?y.mipmaps[Q]:y.image;if(B!==null)ot=B.max.x-B.min.x,ft=B.max.y-B.min.y,ht=B.isBox3?B.max.z-B.min.z:1,bt=B.min.x,Rt=B.min.y,Et=B.isBox3?B.min.z:0;else{const ze=Math.pow(2,-U);ot=Math.floor(te.width*ze),ft=Math.floor(te.height*ze),y.isDataArrayTexture?ht=te.depth:y.isData3DTexture?ht=Math.floor(te.depth*ze):ht=1,bt=0,Rt=0,Et=0}z!==null?(Bt=z.x,Zt=z.y,ae=z.z):(Bt=0,Zt=0,ae=0);const jt=xt.convert(I.format),Tt=xt.convert(I.type);let ie;I.isData3DTexture?(Ut.setTexture3D(I,0),ie=P.TEXTURE_3D):I.isDataArrayTexture||I.isCompressedArrayTexture?(Ut.setTexture2DArray(I,0),ie=P.TEXTURE_2D_ARRAY):(Ut.setTexture2D(I,0),ie=P.TEXTURE_2D),P.pixelStorei(P.UNPACK_FLIP_Y_WEBGL,I.flipY),P.pixelStorei(P.UNPACK_PREMULTIPLY_ALPHA_WEBGL,I.premultiplyAlpha),P.pixelStorei(P.UNPACK_ALIGNMENT,I.unpackAlignment);const Vt=P.getParameter(P.UNPACK_ROW_LENGTH),Pe=P.getParameter(P.UNPACK_IMAGE_HEIGHT),li=P.getParameter(P.UNPACK_SKIP_PIXELS),De=P.getParameter(P.UNPACK_SKIP_ROWS),$i=P.getParameter(P.UNPACK_SKIP_IMAGES);P.pixelStorei(P.UNPACK_ROW_LENGTH,te.width),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,te.height),P.pixelStorei(P.UNPACK_SKIP_PIXELS,bt),P.pixelStorei(P.UNPACK_SKIP_ROWS,Rt),P.pixelStorei(P.UNPACK_SKIP_IMAGES,Et);const se=y.isDataArrayTexture||y.isData3DTexture,Be=I.isDataArrayTexture||I.isData3DTexture;if(y.isDepthTexture){const ze=gt.get(y),ye=gt.get(I),we=gt.get(ze.__renderTarget),Pr=gt.get(ye.__renderTarget);mt.bindFramebuffer(P.READ_FRAMEBUFFER,we.__webglFramebuffer),mt.bindFramebuffer(P.DRAW_FRAMEBUFFER,Pr.__webglFramebuffer);for(let On=0;On<ht;On++)se&&(P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,gt.get(y).__webglTexture,U,Et+On),P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,gt.get(I).__webglTexture,Q,ae+On)),P.blitFramebuffer(bt,Rt,ot,ft,Bt,Zt,ot,ft,P.DEPTH_BUFFER_BIT,P.NEAREST);mt.bindFramebuffer(P.READ_FRAMEBUFFER,null),mt.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else if(U!==0||y.isRenderTargetTexture||gt.has(y)){const ze=gt.get(y),ye=gt.get(I);mt.bindFramebuffer(P.READ_FRAMEBUFFER,Bh),mt.bindFramebuffer(P.DRAW_FRAMEBUFFER,zh);for(let we=0;we<ht;we++)se?P.framebufferTextureLayer(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,ze.__webglTexture,U,Et+we):P.framebufferTexture2D(P.READ_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,ze.__webglTexture,U),Be?P.framebufferTextureLayer(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,ye.__webglTexture,Q,ae+we):P.framebufferTexture2D(P.DRAW_FRAMEBUFFER,P.COLOR_ATTACHMENT0,P.TEXTURE_2D,ye.__webglTexture,Q),U!==0?P.blitFramebuffer(bt,Rt,ot,ft,Bt,Zt,ot,ft,P.COLOR_BUFFER_BIT,P.NEAREST):Be?P.copyTexSubImage3D(ie,Q,Bt,Zt,ae+we,bt,Rt,ot,ft):P.copyTexSubImage2D(ie,Q,Bt,Zt,bt,Rt,ot,ft);mt.bindFramebuffer(P.READ_FRAMEBUFFER,null),mt.bindFramebuffer(P.DRAW_FRAMEBUFFER,null)}else Be?y.isDataTexture||y.isData3DTexture?P.texSubImage3D(ie,Q,Bt,Zt,ae,ot,ft,ht,jt,Tt,te.data):I.isCompressedArrayTexture?P.compressedTexSubImage3D(ie,Q,Bt,Zt,ae,ot,ft,ht,jt,te.data):P.texSubImage3D(ie,Q,Bt,Zt,ae,ot,ft,ht,jt,Tt,te):y.isDataTexture?P.texSubImage2D(P.TEXTURE_2D,Q,Bt,Zt,ot,ft,jt,Tt,te.data):y.isCompressedTexture?P.compressedTexSubImage2D(P.TEXTURE_2D,Q,Bt,Zt,te.width,te.height,jt,te.data):P.texSubImage2D(P.TEXTURE_2D,Q,Bt,Zt,ot,ft,jt,Tt,te);P.pixelStorei(P.UNPACK_ROW_LENGTH,Vt),P.pixelStorei(P.UNPACK_IMAGE_HEIGHT,Pe),P.pixelStorei(P.UNPACK_SKIP_PIXELS,li),P.pixelStorei(P.UNPACK_SKIP_ROWS,De),P.pixelStorei(P.UNPACK_SKIP_IMAGES,$i),Q===0&&I.generateMipmaps&&P.generateMipmap(ie),mt.unbindTexture()},this.initRenderTarget=function(y){gt.get(y).__webglFramebuffer===void 0&&Ut.setupRenderTarget(y)},this.initTexture=function(y){y.isCubeTexture?Ut.setTextureCube(y,0):y.isData3DTexture?Ut.setTexture3D(y,0):y.isDataArrayTexture||y.isCompressedArrayTexture?Ut.setTexture2DArray(y,0):Ut.setTexture2D(y,0),mt.unbindTexture()},this.resetState=function(){C=0,R=0,D=null,mt.reset(),at.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return nn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=Gt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Gt._getUnpackColorSpace()}}const pn=256;function fv(n,t){const e=new Float32Array(t*t);for(let s=0;s<e.length;s++)e[s]=n.next();const i=(s,r)=>{const a=(s%t+t)%t,o=(r%t+t)%t;return e[o*t+a]};return(s,r)=>{const a=Math.floor(s),o=Math.floor(r),c=wa(s-a),l=wa(r-o),h=Li(i(a,o),i(a+1,o),c),u=Li(i(a,o+1),i(a+1,o+1),c);return Li(h,u,l)}}function pv(n,t,e,i,s=2,r=.5){let a=0,o=1,c=1,l=0;for(let h=0;h<i;h++)a+=n(t*c,e*c)*o,l+=o,o*=r,c*=s;return a/l}function mv(n){const t=document.createElement("canvas");t.width=n,t.height=n;const e=t.getContext("2d");if(!e)throw new Error("2D canvas context unavailable — procedural textures cannot be generated");return{canvas:t,ctx:e}}function gv(n,t){const e=new Mp(n);return e.wrapS=Ss,e.wrapT=Ss,e.repeat.set(t,t),e.colorSpace=Re,e.anisotropy=4,e}const _v={concrete:{base:[104,104,108],contrast:.34,octaves:5,period:16},metal:{base:[88,94,104],contrast:.26,octaves:4,period:8},wood:{base:[116,84,52],contrast:.38,octaves:4,period:12},dirt:{base:[86,72,54],contrast:.44,octaves:5,period:20}};function vv(n,t,e,i){const s=fv(i,e.period),r=n.createImageData(t,t),a=r.data,o=e.period/t;for(let c=0;c<t;c++)for(let l=0;l<t;l++){const u=1+(pv(s,l*o,c*o,e.octaves)-.5)*2*e.contrast,f=(c*t+l)*4;a[f]=_s(e.base[0]*u/255)*255,a[f+1]=_s(e.base[1]*u/255)*255,a[f+2]=_s(e.base[2]*u/255)*255,a[f+3]=255}n.putImageData(r,0,0)}function yc(n,t,e,i){n.strokeStyle=`rgba(0,0,0,${i})`,n.lineWidth=2;const s=t/e;n.beginPath();for(let r=1;r<e;r++){const a=Math.round(r*s)+.5;n.moveTo(a,0),n.lineTo(a,t),n.moveTo(0,a),n.lineTo(t,a)}n.stroke()}function xv(n,t,e){n.globalAlpha=.18;for(let i=0;i<60;i++){const s=e.next()*t;n.strokeStyle=e.chance(.5)?"#000":"#d8b98a",n.lineWidth=e.range(.5,2.2),n.beginPath(),n.moveTo(s,0),n.bezierCurveTo(s+e.jitter(6),t*.33,s+e.jitter(6),t*.66,s+e.jitter(4),t),n.stroke()}n.globalAlpha=1}function nr(n,t,e,i,s){for(let r=0;r<i;r++){const a=e.next()*t,o=e.next()*t,c=e.range(t*.03,t*.16),l=n.createRadialGradient(a,o,0,a,o,c);l.addColorStop(0,s),l.addColorStop(1,"rgba(0,0,0,0)"),n.fillStyle=l,n.fillRect(a-c,o-c,c*2,c*2)}}function Sv(n,t,e){const i=new ri(t),{canvas:s,ctx:r}=mv(pn),a=_v[n];switch(vv(r,pn,a,i),n){case"concrete":yc(r,pn,2,.35),nr(r,pn,i,14,"rgba(30,28,26,0.30)");break;case"metal":yc(r,pn,4,.45),nr(r,pn,i,18,"rgba(122,64,28,0.32)");break;case"wood":xv(r,pn,i),nr(r,pn,i,8,"rgba(40,24,10,0.28)");break;case"dirt":nr(r,pn,i,26,"rgba(28,22,14,0.34)");break}return gv(s,e)}const Ec=new Map;function Mv(n){const t=Ec.get(n);if(t)return t;const e=1374486528+n.length*977+(n.charCodeAt(0)<<8),i=Sv(n,e,1);return Ec.set(n,i),i}const Tc=.5,yv=[{n:[1,0,0],t:[0,0,-1],b:[0,1,0]},{n:[-1,0,0],t:[0,0,1],b:[0,1,0]},{n:[0,1,0],t:[1,0,0],b:[0,0,-1]},{n:[0,-1,0],t:[1,0,0],b:[0,0,1]},{n:[0,0,1],t:[1,0,0],b:[0,1,0]},{n:[0,0,-1],t:[-1,0,0],b:[0,1,0]}];function Ev(){return{positions:[],normals:[],uvs:[],indices:[]}}function Tv(n,t){const e=(t.minX+t.maxX)*.5,i=(t.minY+t.maxY)*.5,s=(t.minZ+t.maxZ)*.5,r=(t.maxX-t.minX)*.5,a=(t.maxY-t.minY)*.5,o=(t.maxZ-t.minZ)*.5;for(const c of yv){const[l,h,u]=c.n,[f,p,g]=c.t,[_,m,d]=c.b,T=e+l*r,v=i+h*a,S=s+u*o,A=Math.abs(f)*r+Math.abs(p)*a+Math.abs(g)*o,C=Math.abs(_)*r+Math.abs(m)*a+Math.abs(d)*o,R=n.positions.length/3,D=[[-1,-1],[1,-1],[1,1],[-1,1]];for(const[E,M]of D)n.positions.push(T+f*A*E+_*C*M,v+p*A*E+m*C*M,S+g*A*E+d*C*M),n.normals.push(l,h,u),n.uvs.push((E+1)*A*Tc,(M+1)*C*Tc);n.indices.push(R,R+1,R+2,R,R+2,R+3)}}function bv(n){const t=new on;return t.setAttribute("position",new be(new Float32Array(n.positions),3)),t.setAttribute("normal",new be(new Float32Array(n.normals),3)),t.setAttribute("uv",new be(new Float32Array(n.uvs),2)),t.setIndex(n.indices),t.computeBoundingSphere(),t}const wv={concrete:{roughness:.95,metalness:0},metal:{roughness:.55,metalness:.65},wood:{roughness:.85,metalness:0},dirt:{roughness:1,metalness:0}};function Av(n){const t=new Map;for(const r of n.boxes){let a=t.get(r.surface);a||(a=Ev(),t.set(r.surface,a)),Tv(a,r.box)}const e=new Dn;e.name="world";const i=[],s=[];for(const[r,a]of t){const o=bv(a),c=Mv(r),l=wv[r],h=new Bo({map:c,roughness:l.roughness,metalness:l.metalness}),u=new Te(o,h);u.name=`world-${r}`,u.castShadow=!1,u.receiveShadow=!0,e.add(u),i.push(o),s.push(h)}return{group:e,dispose(){for(const r of i)r.dispose();for(const r of s)r.dispose()}}}const Rv=.05,Cv=400;class Pv{renderer;scene;camera;worldMesh=null;canvas;constructor(t){this.canvas=t,this.renderer=new dv({canvas:t,antialias:!0,powerPreference:"high-performance"}),this.renderer.outputColorSpace=Re,this.renderer.toneMapping=th,this.renderer.toneMappingExposure=1.1,this.renderer.setPixelRatio(Math.min(globalThis.devicePixelRatio||1,2)),this.scene=new fp,this.camera=new Ne(90,1,Rv,Cv),this.camera.rotation.order="YXZ",this.scene.add(this.camera),this.resize()}loadMap(t){this.worldMesh&&(this.scene.remove(this.worldMesh.group),this.worldMesh.dispose(),this.worldMesh=null);for(const a of[...this.scene.children])a.type.endsWith("Light")&&this.scene.remove(a);this.scene.background=new Ot(t.fogColor),this.scene.fog=new No(t.fogColor,t.fogDensity);const e=new Rp(t.ambientColor,1.2);this.scene.add(e);const i=new Tp(9413821,2761760,.85);this.scene.add(i);const s=new $l(16773341,1.15);s.position.set(.4,1,.25),this.scene.add(s);const r=new $l(5599400,.45);r.position.set(-.6,.4,-.7),this.scene.add(r),this.worldMesh=Av(t),this.scene.add(this.worldMesh.group)}resize(){const t=Math.max(1,this.canvas.clientWidth||globalThis.innerWidth||1),e=Math.max(1,this.canvas.clientHeight||globalThis.innerHeight||1);this.renderer.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix()}updateCamera(t,e,i,s,r,a,o=0,c=0){this.camera.position.set(t,e+Jn.eyeHeight,i),this.camera.rotation.set(r+c,s+o,0),Math.abs(this.camera.fov-a)>.001&&(this.camera.fov=a,this.camera.updateProjectionMatrix())}render(){this.renderer.render(this.scene,this.camera)}dispose(){this.worldMesh?.dispose(),this.worldMesh=null,this.renderer.dispose()}}const Dv=2,Lv=219540062,Iv=24,Uv={master:.8,sfx:1,ambient:.6};class Fv{context;master=null;sfx=null;ambient=null;noiseBuffer=null;volumes={...Uv};voices=0;voiceWindowEnd=0;constructor(){const t=typeof AudioContext<"u"?AudioContext:void 0;if(t===void 0){this.context=null;return}this.context=new t,this.master=this.context.createGain(),this.sfx=this.context.createGain(),this.ambient=this.context.createGain(),this.sfx.connect(this.master),this.ambient.connect(this.master),this.master.connect(this.context.destination),this.noiseBuffer=this.buildNoiseBuffer(this.context),this.applyVolumes()}buildNoiseBuffer(t){const e=Math.floor(t.sampleRate*Dv),i=t.createBuffer(1,e,t.sampleRate),s=i.getChannelData(0),r=new ri(Lv);for(let a=0;a<e;a++)s[a]=r.next()*2-1;return i}get available(){return this.context!==null&&this.sfx!==null}get now(){return this.context?.currentTime??0}resume(){this.context!==null&&this.context.state==="suspended"&&this.context.resume().catch(()=>{})}setVolumes(t){this.volumes={...this.volumes,...t},this.applyVolumes()}getVolumes(){return{...this.volumes}}applyVolumes(){this.master===null||this.sfx===null||this.ambient===null||(this.master.gain.value=this.volumes.master,this.sfx.gain.value=this.volumes.sfx,this.ambient.gain.value=this.volumes.ambient)}claimVoice(){const t=this.now;return t>this.voiceWindowEnd&&(this.voiceWindowEnd=t+1/60,this.voices=0),this.voices>=Iv?!1:(this.voices++,!0)}setPlaybackPitch(t){this.pitchScale=t}pitchScale=1;dispose(){this.context?.close().catch(()=>{})}}function si(n,t,e,i){n.gain.setValueAtTime(Math.max(e,8e-4),t),n.gain.exponentialRampToValueAtTime(8e-4,t+Math.max(i,.01))}const Nv=380,Ov=2800,Bv=.4,zv=.9,bc=.03;function kv(n,t){const e=n.context,i=n.sfx;if(e===null||i===null||n.noiseBuffer===null||!n.claimVoice())return;const s=e.currentTime,r=n.pitchScale,a=e.createBufferSource();a.buffer=n.noiseBuffer,a.loop=!0;const o=e.createBiquadFilter();o.type="highpass",o.frequency.value=(Nv+t.brightness*Ov)*r,o.Q.value=.7;const c=e.createGain();si(c,s,t.gain,t.noiseDecay),a.connect(o),o.connect(c),c.connect(i),a.start(s),a.stop(s+t.noiseDecay+bc);const l=e.createOscillator();l.type="triangle",l.frequency.setValueAtTime(t.bodyHz*r,s),l.frequency.exponentialRampToValueAtTime(t.bodyHz*Bv*r,s+t.bodyDecay);const h=e.createGain();si(h,s,t.gain*zv,t.bodyDecay),l.connect(h),h.connect(i),l.start(s),l.stop(s+t.bodyDecay+bc)}function Hv(n){const t=n.context,e=n.sfx;if(t===null||e===null||n.noiseBuffer===null||!n.claimVoice())return;const i=t.currentTime,s=t.createBufferSource();s.buffer=n.noiseBuffer;const r=t.createBiquadFilter();r.type="bandpass",r.frequency.value=2400*n.pitchScale,r.Q.value=6;const a=t.createGain();si(a,i,.22,.03),s.connect(r),r.connect(a),a.connect(e),s.start(i),s.stop(i+.06)}function Vv(n,t){const e=n.context,i=n.sfx;if(e===null||i===null||n.noiseBuffer===null)return;const s=e.currentTime,r=[0,t*.55,t*.92],a=[1400,900,2e3];r.forEach((o,c)=>{if(!n.claimVoice())return;const l=s+o,h=e.createBufferSource();h.buffer=n.noiseBuffer;const u=e.createBiquadFilter();u.type="bandpass",u.frequency.value=a[c]*n.pitchScale,u.Q.value=4.5;const f=e.createGain();si(f,l,.18,.045),h.connect(u),u.connect(f),f.connect(i),h.start(l),h.stop(l+.09)})}const wc=.16,Sa=.28,Gv=.02;function vs(n,t,e,i,s){const r=n.context,a=n.sfx;if(r===null||a===null||!n.claimVoice())return;const o=r.currentTime,c=r.createOscillator();c.type=s,c.frequency.value=t*n.pitchScale;const l=r.createGain();si(l,o,i,e),c.connect(l),l.connect(a),c.start(o),c.stop(o+e+Gv)}function Wv(n,t){t?vs(n,Ve.headshotToneHz,Ve.headshotToneTime,wc,"sine"):vs(n,Ve.headshotToneHz*.45,Ve.headshotToneTime*.8,wc*.7,"triangle")}function Xv(n,t){t?(vs(n,Ve.bigKillToneHz,Ve.bigKillToneTime,Sa,"sawtooth"),vs(n,Ve.bigKillToneHz*1.5,Ve.bigKillToneTime*.6,Sa*.5,"triangle")):vs(n,Ve.killToneHz,Ve.killToneTime,Sa,"triangle")}function Yv(n,t){const e=n.context,i=n.sfx;if(e===null||i===null||n.noiseBuffer===null||!n.claimVoice())return;const s=e.currentTime,r=e.createBufferSource();r.buffer=n.noiseBuffer;const a=e.createBiquadFilter();a.type="bandpass",a.frequency.value=(900+t*2600)*n.pitchScale,a.Q.value=2.4;const o=e.createGain();si(o,s,.12,.05+(1-t)*.04),r.connect(a),a.connect(o),o.connect(i),r.start(s),r.stop(s+.12)}function qv(n){const t=n.context,e=n.sfx;if(t===null||e===null||n.noiseBuffer===null||!n.claimVoice())return;const i=t.currentTime,s=t.createBufferSource();s.buffer=n.noiseBuffer;const r=t.createBiquadFilter();r.type="lowpass",r.frequency.value=620*n.pitchScale;const a=t.createGain();si(a,i,.2,.07),s.connect(r),r.connect(a),a.connect(e),s.start(i),s.stop(i+.12)}const Zv=41.3,Kv=33.7,$v=.75,jv=6005985;class Jv{fireAmplitude=0;blastAmplitude=0;elapsed=0;phase=0;rng=new ri(jv);yawOffset=0;pitchOffset=0;addFire(t=1){this.fireAmplitude=Math.min(Bn.maxAmplitude,this.fireAmplitude+Bn.fireAmplitude*t),this.phase=this.rng.next()*Math.PI*2}addBlast(t=1){this.blastAmplitude=Math.min(Bn.maxAmplitude,this.blastAmplitude+Bn.explosionAmplitude*t),this.phase=this.rng.next()*Math.PI*2}update(t){this.elapsed+=t,this.fireAmplitude=qo(this.fireAmplitude,0,Bn.fireDecay,t),this.blastAmplitude=qo(this.blastAmplitude,0,Bn.explosionDecay,t);const e=Math.min(Bn.maxAmplitude,this.fireAmplitude+this.blastAmplitude);if(e<1e-6){this.yawOffset=0,this.pitchOffset=0;return}this.yawOffset=e*$v*Math.sin(this.elapsed*Zv+this.phase),this.pitchOffset=e*Math.sin(this.elapsed*Kv+this.phase*2)}reset(){this.fireAmplitude=0,this.blastAmplitude=0,this.yawOffset=0,this.pitchOffset=0}}class Qv{remaining=0;request(t){t<=0||(this.remaining=Math.min(or.maxHold,Math.max(this.remaining,t)))}get active(){return this.remaining>0}consume(t){if(this.remaining<=0)return t;const e=Math.min(this.remaining,t);return this.remaining-=e,this.remaining<1e-6&&(this.remaining=0),t-e}clear(){this.remaining=0}}function tx(n,t){return t?or.bigKill:n?or.headshot:or.normalHit}const Ma=48,Ac=.28,ex=9;class nx{light;sprite;remaining=0;material;geometry;constructor(t){this.light=new wp(16765850,0,ex,2),this.light.visible=!1,t.add(this.light),this.geometry=new Zi(Ac,Ac),this.material=new wr({color:16770224,transparent:!0,opacity:0,blending:vr,depthWrite:!1}),this.sprite=new Te(this.geometry,this.material),this.sprite.visible=!1,t.add(this.sprite)}trigger(t,e,i){this.remaining=Dr.flashTime,this.light.position.set(t,e,i),this.sprite.position.set(t,e,i),this.light.visible=!0,this.sprite.visible=!0}update(t){if(this.remaining<=0)return;if(this.remaining-=t,this.remaining<=0){this.remaining=0,this.light.visible=!1,this.sprite.visible=!1,this.light.intensity=0,this.material.opacity=0;return}const e=this.remaining/Dr.flashTime;this.light.intensity=Dr.lightIntensity*e,this.material.opacity=e,this.sprite.scale.setScalar(.7+e*.6)}faceCamera(t){this.sprite.visible&&this.sprite.quaternion.copy(t.quaternion)}dispose(){this.geometry.dispose(),this.material.dispose()}}class ix{mesh;slots=[];positions;attribute;geometry;material;active=0;constructor(t){this.positions=new Float32Array(Ma*6),this.geometry=new on,this.attribute=new be(this.positions,3),this.attribute.setUsage(zf),this.geometry.setAttribute("position",this.attribute),this.geometry.setDrawRange(0,0),this.material=new yh({color:new Ot(16767392),transparent:!0,opacity:.85,blending:vr,depthWrite:!1}),this.mesh=new Sp(this.geometry,this.material),this.mesh.frustumCulled=!1,t.add(this.mesh);for(let e=0;e<Ma;e++)this.slots.push({life:0,fromX:0,fromY:0,fromZ:0,toX:0,toY:0,toZ:0})}spawn(t,e,i,s,r,a){const o=s-t,c=r-e,l=a-i;if(o*o+c*c+l*l<Je.tracerMinDistance*Je.tracerMinDistance)return;const h=this.active<Ma?this.active++:0,u=this.slots[h];u.life=Je.tracerLifetime,u.fromX=t,u.fromY=e,u.fromZ=i,u.toX=s,u.toY=r,u.toZ=a}update(t){let e=0;for(let i=this.active-1;i>=0;i--){const s=this.slots[i];if(s.life-=t,s.life<=0){const r=this.slots[this.active-1];this.slots[this.active-1]=s,this.slots[i]=r,this.active--}}for(let i=0;i<this.active;i++){const s=this.slots[i];this.positions[e++]=s.fromX,this.positions[e++]=s.fromY,this.positions[e++]=s.fromZ,this.positions[e++]=s.toX,this.positions[e++]=s.toY,this.positions[e++]=s.toZ}this.geometry.setDrawRange(0,this.active*2),this.attribute.needsUpdate=!0,this.mesh.visible=this.active>0}clear(){this.active=0,this.geometry.setDrawRange(0,0),this.mesh.visible=!1}dispose(){this.geometry.dispose(),this.material.dispose()}}const ir=64,Rc=.022,sx=.055,rx=16,sr=.32,Cc=.16,ya=.012,ax=24081,Di=new Jt,Tr=new F,xs=new Xi,Eo=new F(1,1,1),Rn=new F,Lh=new F(0,0,1),ox=new F(0,-1e4,0);class lx{mesh;next=0;used=0;geometry;material;ages;constructor(t){this.geometry=new Zi(Cc,Cc),this.material=new wr({color:new Ot(1314830),transparent:!0,opacity:.85,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2}),this.mesh=new Mh(this.geometry,this.material,Je.maxDecals),this.mesh.frustumCulled=!1,this.mesh.count=0,this.ages=new Float32Array(Je.maxDecals),t.add(this.mesh)}spawn(t,e,i,s,r,a){const o=this.next;this.next=(this.next+1)%Je.maxDecals,this.used<Je.maxDecals&&this.used++,this.mesh.count=this.used,this.ages[o]=0,Rn.set(s,r,a),Rn.lengthSq()<1e-6?Rn.set(0,1,0):Rn.normalize(),Tr.set(t+Rn.x*ya,e+Rn.y*ya,i+Rn.z*ya),xs.setFromUnitVectors(Lh,Rn),Di.compose(Tr,xs,Eo),this.mesh.setMatrixAt(o,Di),this.mesh.instanceMatrix.needsUpdate=!0}update(t){if(this.used===0)return;let e=!1;for(let i=0;i<this.used;i++){const s=this.ages[i]+t;s>Je.decalLifetime&&s-t<=Je.decalLifetime&&(Di.compose(ox,xs,Eo),this.mesh.setMatrixAt(i,Di),e=!0),this.ages[i]=s}e&&(this.mesh.instanceMatrix.needsUpdate=!0)}clear(){this.used=0,this.next=0,this.mesh.count=0}dispose(){this.geometry.dispose(),this.material.dispose(),this.mesh.dispose()}}class cx{mesh;shells=[];active=0;geometry;material;rng=new ri(ax);constructor(t){this.geometry=new oi(Rc,Rc,sx),this.material=new Bo({color:new Ot(13214247),roughness:.35,metalness:.85}),this.mesh=new Mh(this.geometry,this.material,ir),this.mesh.frustumCulled=!1,this.mesh.count=0,t.add(this.mesh);for(let e=0;e<ir;e++)this.shells.push({x:0,y:0,z:0,vx:0,vy:0,vz:0,spin:0,angle:0,life:0,groundY:0})}eject(t,e,i,s,r,a){const o=this.active<ir?this.active++:this.rng.int(ir),c=this.shells[o];c.x=t,c.y=e,c.z=i;const l=this.rng.range(1.4,2.4);c.vx=s*l+this.rng.jitter(.5),c.vy=this.rng.range(1.1,2),c.vz=r*l+this.rng.jitter(.5),c.spin=this.rng.range(-14,14),c.angle=this.rng.next()*Math.PI*2,c.life=Je.shellLifetime,c.groundY=a,this.mesh.count=this.active}update(t){if(this.active!==0){for(let e=this.active-1;e>=0;e--){const i=this.shells[e];if(i.life-=t,i.life<=0){const s=this.shells[this.active-1];this.shells[this.active-1]=i,this.shells[e]=s,this.active--;continue}i.vy-=rx*t,i.x+=i.vx*t,i.y+=i.vy*t,i.z+=i.vz*t,i.angle+=i.spin*t,i.y<=i.groundY&&(i.y=i.groundY,i.vy=-i.vy*sr,i.vx*=sr,i.vz*=sr,i.spin*=sr,Math.abs(i.vy)<.35&&(i.vy=0,i.vx=0,i.vz=0,i.spin=0))}for(let e=0;e<this.active;e++){const i=this.shells[e];Tr.set(i.x,i.y,i.z),xs.setFromAxisAngle(Lh,i.angle),Di.compose(Tr,xs,Eo),this.mesh.setMatrixAt(e,Di)}this.mesh.count=this.active,this.mesh.instanceMatrix.needsUpdate=!0}}clear(){this.active=0,this.mesh.count=0}dispose(){this.geometry.dispose(),this.material.dispose(),this.mesh.dispose()}}const Ea=.55,Pc=.16,hx=.14,ux=.25,dx=.65,fx=3,rr=Ke(),us=Ke();class px{constructor(t,e,i,s){this.mixer=e,this.feed=i,this.collision=s,this.muzzle=new nx(t),this.tracers=new ix(t),this.decals=new lx(t),this.shells=new cx(t)}shake=new Jv;hitStop=new Qv;muzzle;tracers;decals;shells;muzzleX=0;muzzleY=0;muzzleZ=0;consume(t,e,i,s,r,a){Hc(rr,r,a),Vc(us,r);const o=i+Jn.eyeHeight;this.muzzleX=e+rr.x*Ea+us.x*Pc,this.muzzleY=o+rr.y*Ea-hx,this.muzzleZ=s+rr.z*Ea+us.z*Pc;for(let c=0;c<t.length;c++){const l=t.at(c);switch(l.kind){case re.WeaponFired:this.onWeaponFired(l.key,i);break;case re.DryFire:Hv(this.mixer);break;case re.ReloadStarted:Vv(this.mixer,l.amount);break;case re.ImpactWorld:this.decals.spawn(l.x,l.y,l.z,l.nx,l.ny,l.nz),this.tracers.spawn(this.muzzleX,this.muzzleY,this.muzzleZ,l.x,l.y,l.z),Yv(this.mixer,dx);break;case re.TargetHit:{const h=(l.flags&Da)!==0,u=(l.flags&Kc)!==0,f=(l.flags&_r)!==0;this.tracers.spawn(this.muzzleX,this.muzzleY,this.muzzleZ,l.x,l.y,l.z),this.feed.showHitmarker(h),this.feed.addDamagePopup(l.x,l.y+ux,l.z,l.amount,h),qv(this.mixer),Wv(this.mixer,h),this.hitStop.request(tx(h,u&&f));break}case re.TargetKilled:Xv(this.mixer,(l.flags&_r)!==0);break;case re.ReloadFinished:case re.WeaponEquipped:case re.PartDetached:case re.PlayerHurt:case re.PlayerDied:break}}}onWeaponFired(t,e){const i=Ui(t);this.muzzle.trigger(this.muzzleX,this.muzzleY,this.muzzleZ),this.shake.addFire(),i&&kv(this.mixer,i.sound);const s=this.collision.groundHeightAt(this.muzzleX,this.muzzleZ,this.muzzleY);this.shells.eject(this.muzzleX,this.muzzleY,this.muzzleZ,us.x,us.z,Number.isFinite(s)?s:e-fx)}update(t,e){this.shake.update(t),this.muzzle.update(t),this.muzzle.faceCamera(e),this.tracers.update(t),this.decals.update(t),this.shells.update(t),this.feed.update(t)}clear(){this.shake.reset(),this.hitStop.clear(),this.tracers.clear(),this.decals.clear(),this.shells.clear(),this.feed.clear()}dispose(){this.muzzle.dispose(),this.tracers.dispose(),this.decals.dispose(),this.shells.dispose()}}const mx=.9,gx=1.6,_x=3,Ai={torso:{sx:.46,sy:.62,sz:.3,ox:0,oy:1.15,oz:0},head:{sx:.26,sy:.28,sz:.26,ox:0,oy:1.62,oz:0},armL:{sx:.14,sy:.62,sz:.14,ox:-.32,oy:1.2,oz:0},armR:{sx:.14,sy:.62,sz:.14,ox:.32,oy:1.2,oz:0},legL:{sx:.17,sy:.75,sz:.17,ox:-.135,oy:.44,oz:0},legR:{sx:.17,sy:.75,sz:.17,ox:.135,oy:.44,oz:0}},vx={husker:7306600,skitter:11032138,ripper:8010566},xx=7368816;function Ri(n,t,e,i){const s=new Dn,r=new Te(n,t);return r.scale.set(e.sx,e.sy,e.sz),i?(s.position.set(e.ox,e.oy+e.sy*.5,e.oz),r.position.set(0,-e.sy*.5,0)):s.position.set(e.ox,e.oy,e.oz),s.add(r),s}class Sx{visuals=[];geometry=new oi(1,1,1);materials=new Map;root=new Dn;constructor(t){this.root.name="zeds",t.add(this.root)}materialFor(t){const e=this.materials.get(t);if(e)return e;const i=new Bo({color:new Ot(vx[t]??xx),roughness:.85,metalness:.05});return this.materials.set(t,i),i}buildVisual(t){const e=this.materialFor(t),i=new Dn;i.add(Ri(this.geometry,e,Ai.torso,!1)),i.add(Ri(this.geometry,e,Ai.head,!1));const s=Ri(this.geometry,e,Ai.armL,!0),r=Ri(this.geometry,e,Ai.armR,!0),a=Ri(this.geometry,e,Ai.legL,!0),o=Ri(this.geometry,e,Ai.legR,!0);return i.add(s,r,a,o),i.visible=!1,this.root.add(i),{group:i,armL:s,armR:r,legL:a,legR:o,phase:0,defId:t}}retint(t,e){const i=this.materialFor(e);t.group.traverse(s=>{s instanceof Te&&(s.material=i)}),t.defId=e}sync(t,e){for(let i=0;i<t.count;i++){const s=t.items[i],r=Md(s);if(r===void 0)continue;let a=this.visuals[i];a===void 0&&(a=this.buildVisual(s.defId),this.visuals[i]=a),a.defId!==s.defId&&this.retint(a,s.defId);const o=r.bodyHeight/gd;if(a.group.visible=!0,a.group.position.set(s.x,s.y,s.z),a.group.scale.set(o*r.girth,o,o*r.girth),!s.alive){a.group.rotation.set(-Math.PI/2,s.yaw,0),a.group.position.y=s.y+.15*o;continue}a.group.rotation.set(0,s.yaw,0),a.phase+=s.speed*gx*e;const c=Math.min(1,s.speed/_x)*mx,l=Math.sin(a.phase)*c;a.legL.rotation.x=l,a.legR.rotation.x=-l,s.state==="attack"?(a.armL.rotation.x=-1.5,a.armR.rotation.x=-1.5):(a.armL.rotation.x=-l*.6,a.armR.rotation.x=l*.6)}for(let i=t.count;i<this.visuals.length;i++){const s=this.visuals[i];s!==void 0&&(s.group.visible=!1)}}dispose(){this.geometry.dispose();for(const t of this.materials.values())t.dispose();this.materials.clear(),this.visuals.length=0}}const Mx=4,yx=7,Ex=2,Dc=5,Lc=11,Ic="rgba(226,238,255,0.85)",Tx="rgba(255,196,92,0.95)",bx="226,238,255",wx="255,196,92",ds=new F;class Ax{canvas;ctx;popups=[];hitmarkerRemaining=0;hitmarkerHeadshot=!1;visible=!0;constructor(t=document.body){this.canvas=document.createElement("canvas"),this.canvas.id="combat-feed",this.canvas.setAttribute("style","position:fixed;inset:0;z-index:10;pointer-events:none;width:100%;height:100%"),t.appendChild(this.canvas);const e=this.canvas.getContext("2d");if(!e)throw new Error("2D canvas context unavailable — the combat HUD cannot be drawn");this.ctx=e;for(let i=0;i<ji.maxVisible;i++)this.popups.push({active:!1,worldX:0,worldY:0,worldZ:0,amount:0,headshot:!1,age:0})}showHitmarker(t){this.hitmarkerRemaining=Ve.showTime,t?this.hitmarkerHeadshot=!0:this.hitmarkerRemaining<=0&&(this.hitmarkerHeadshot=!1)}addDamagePopup(t,e,i,s,r){let a=null,o=this.popups[0];for(const l of this.popups){if(!l.active){a=l;break}l.age>o.age&&(o=l)}const c=a??o;c.active=!0,c.worldX=t,c.worldY=e,c.worldZ=i,c.amount=s,c.headshot=r,c.age=0}update(t){this.hitmarkerRemaining>0&&(this.hitmarkerRemaining-=t,this.hitmarkerRemaining<=0&&(this.hitmarkerRemaining=0,this.hitmarkerHeadshot=!1));for(const e of this.popups)e.active&&(e.age+=t,e.age>=ji.lifetime&&(e.active=!1))}draw(t){const e=Math.min(globalThis.devicePixelRatio||1,2),i=Math.max(1,this.canvas.clientWidth||globalThis.innerWidth||1),s=Math.max(1,this.canvas.clientHeight||globalThis.innerHeight||1);(this.canvas.width!==Math.floor(i*e)||this.canvas.height!==Math.floor(s*e))&&(this.canvas.width=Math.floor(i*e),this.canvas.height=Math.floor(s*e));const r=this.ctx;if(r.setTransform(e,0,0,e,0,0),r.clearRect(0,0,i,s),!this.visible)return;const a=i/2,o=s/2;this.drawCrosshair(r,a,o),this.hitmarkerRemaining>0&&this.drawHitmarker(r,a,o),this.drawPopups(r,t,i,s)}drawCrosshair(t,e,i){t.fillStyle=Ic;const s=Ex,r=Mx,a=yx;t.fillRect(e-s/2,i-r-a,s,a),t.fillRect(e-s/2,i+r,s,a),t.fillRect(e-r-a,i-s/2,a,s),t.fillRect(e+r,i-s/2,a,s)}drawHitmarker(t,e,i){const s=Math.min(1,this.hitmarkerRemaining/Ve.showTime);t.strokeStyle=this.hitmarkerHeadshot?Tx:Ic,t.globalAlpha=s,t.lineWidth=2,t.beginPath();for(const[r,a]of[[1,1],[1,-1],[-1,1],[-1,-1]])t.moveTo(e+r*Dc,i+a*Dc),t.lineTo(e+r*Lc,i+a*Lc);t.stroke(),t.globalAlpha=1}drawPopups(t,e,i,s){t.textAlign="center",t.textBaseline="middle";for(const r of this.popups){if(!r.active||(ds.set(r.worldX,r.worldY,r.worldZ),ds.project(e),ds.z>1))continue;const a=r.age/ji.lifetime,o=(ds.x*.5+.5)*i,c=(1-(ds.y*.5+.5))*s-a*ji.riseDistance,l=1-a*a,h=r.headshot?20*ji.headshotScale:20;t.font=`600 ${h.toFixed(0)}px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`;const u=r.headshot?wx:bx,f=Math.round(r.amount).toString();t.fillStyle=`rgba(0,0,0,${(l*.55).toFixed(3)})`,t.fillText(f,o+1,c+1),t.fillStyle=`rgba(${u},${l.toFixed(3)})`,t.fillText(f,o,c)}}clear(){for(const t of this.popups)t.active=!1;this.hitmarkerRemaining=0}dispose(){this.canvas.remove()}}const Rx=["position:fixed","inset:0","z-index:20","pointer-events:none","font:600 15px/1.4 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace","color:#dfe9f5","text-shadow:0 1px 3px rgba(0,0,0,0.85)"].join(";"),Uc="position:absolute;left:24px;bottom:22px",Fc="position:absolute;right:24px;bottom:22px;text-align:right",Nc="position:absolute;left:0;right:0;top:18px;text-align:center",Cx=["position:absolute","left:0","right:0","top:44%","text-align:center","font-size:30px","letter-spacing:0.08em"].join(";");function fs(n){const t=document.createElement("div");return t.setAttribute("style",n),t}class Px{root;healthEl;ammoEl;waveEl;messageEl;lastHealth="";lastAmmo="";lastWave="";lastMessage="";touchLayout=!1;constructor(t=document.body){this.root=fs(Rx),this.healthEl=fs(Uc),this.ammoEl=fs(Fc),this.waveEl=fs(Nc),this.messageEl=fs(Cx),this.root.append(this.healthEl,this.ammoEl,this.waveEl,this.messageEl),t.appendChild(this.root)}set visible(t){this.root.style.display=t?"block":"none"}setTouchLayout(t){this.touchLayout=t,this.root.classList.toggle("hud-touch",t),this.healthEl.setAttribute("style",t?"":Uc),this.ammoEl.setAttribute("style",t?"text-align:right":Fc),this.waveEl.setAttribute("style",t?"text-align:center":Nc),this.healthEl.className=t?"hud-health":"",this.ammoEl.className=t?"hud-ammo":"",this.waveEl.className=t?"hud-wave":"",this.lastMessage=""}update(t){const i=`<span style="color:${t.health<=t.maxHealth*.25?"#ff6b6b":"#dfe9f5"}">HP ${Math.ceil(t.health)}</span>`+(t.armor>0?`  <span style="color:#7fb4ff">AR ${Math.ceil(t.armor)}</span>`:"")+(t.godMode?'  <span style="color:#ffd166">[GOD]</span>':"");i!==this.lastHealth&&(this.healthEl.innerHTML=i,this.lastHealth=i);const s=`${t.weaponName}
${t.magazine} / ${t.reserve}`;s!==this.lastAmmo&&(this.ammoEl.innerText=s,this.lastAmmo=s);const r=t.intermission>0?`WAVE ${t.wave+1} IN ${Math.ceil(t.intermission)}`:`WAVE ${t.wave}   ENEMIES ${t.enemiesLeft}`;r!==this.lastWave&&(this.waveEl.innerText=r,this.lastWave=r);const a=t.alive?"":this.touchLayout?`YOU DIED
tap RESTART`:`YOU DIED
press R to restart`;a!==this.lastMessage&&(this.messageEl.innerText=a,this.messageEl.style.color="#ff6b6b",this.lastMessage=a)}dispose(){this.root.remove()}}const Dx=["position:fixed","top:8px","left:8px","z-index:50","padding:8px 10px","background:rgba(8,10,14,0.78)","border:1px solid rgba(120,170,220,0.35)","border-radius:4px","color:#cfe4ff","font:12px/1.45 ui-monospace,SFMono-Regular,Menlo,Consolas,monospace","white-space:pre","pointer-events:none","display:none"].join(";"),Ta=60;class Lx{element;rows=new Map;frameTimes=new Float32Array(Ta);frameIndex=0;frameCount=0;visible=!1;constructor(t=document.body){this.element=document.createElement("div"),this.element.id="debug-overlay",this.element.setAttribute("style",Dx),t.appendChild(this.element)}toggle(){this.visible=!this.visible,this.element.style.display=this.visible?"block":"none"}get isVisible(){return this.visible}sampleFrame(t){this.frameTimes[this.frameIndex]=t,this.frameIndex=(this.frameIndex+1)%Ta,this.frameCount<Ta&&this.frameCount++}get fps(){if(this.frameCount===0)return 0;let t=0;for(let i=0;i<this.frameCount;i++)t+=this.frameTimes[i];const e=t/this.frameCount;return e>0?1/e:0}set(t,e){this.rows.set(t,e)}flush(){if(!this.visible)return;let t="";for(const[e,i]of this.rows)t+=`${e.padEnd(11)} ${i}
`;this.element.textContent=t}dispose(){this.element.remove()}}(function(){if(window.TouchKit)return;const n={Space:[" ",32],Enter:["Enter",13],Escape:["Escape",27],Tab:["Tab",9],ShiftLeft:["Shift",16],ControlLeft:["Control",17],AltLeft:["Alt",18],ArrowLeft:["ArrowLeft",37],ArrowUp:["ArrowUp",38],ArrowRight:["ArrowRight",39],ArrowDown:["ArrowDown",40],Backspace:["Backspace",8]},t=p=>n[p]?n[p]:/^Key[A-Z]$/.test(p)?[p[3].toLowerCase(),p.charCodeAt(3)]:/^Digit\d$/.test(p)?[p[5],p.charCodeAt(5)]:[p,0],e=new Map;function i(p,g){const[_,m]=t(g),d=new KeyboardEvent(p,{key:_,code:g,bubbles:!0,cancelable:!0,composed:!0});try{Object.defineProperty(d,"keyCode",{get:()=>m}),Object.defineProperty(d,"which",{get:()=>m})}catch{}(document.activeElement&&document.activeElement!==document.body?document.activeElement:document).dispatchEvent(d)}function s(p){const g=e.get(p)||0;e.set(p,g+1),g===0&&i("keydown",p)}function r(p){const g=e.get(p)||0;g<=1?(e.delete(p),g===1&&i("keyup",p)):e.set(p,g-1)}function a(p){s(p),setTimeout(()=>r(p),80)}const o=()=>matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,c=`
.tk-root{position:fixed;inset:0;pointer-events:none;z-index:2147483000;font:600 11px/1 system-ui,-apple-system,'Segoe UI',sans-serif;
  letter-spacing:.06em;color:#fff;-webkit-user-select:none;user-select:none;-webkit-touch-callout:none}
.tk-root.tk-off{display:none}
.tk-zone{position:absolute;bottom:0;top:22%;pointer-events:auto;touch-action:none}
.tk-zone.l{left:0;width:42%}.tk-zone.r{right:0;width:42%}
.tk-base{position:absolute;width:128px;height:128px;margin:-64px 0 0 -64px;border-radius:50%;border:2px solid rgba(255,255,255,.28);
  background:radial-gradient(circle,rgba(255,255,255,.07),rgba(255,255,255,.02) 70%);transition:opacity .15s;opacity:.55}
.tk-knob{position:absolute;left:50%;top:50%;width:56px;height:56px;margin:-28px 0 0 -28px;border-radius:50%;
  background:rgba(255,255,255,.28);border:2px solid rgba(255,255,255,.55);box-shadow:0 2px 10px rgba(0,0,0,.35)}
.tk-base.on{opacity:.95}
.tk-lab{position:absolute;left:0;right:0;top:50%;margin-top:-5px;text-align:center;opacity:.75;text-shadow:0 1px 2px #000;pointer-events:none}
.tk-btns{position:absolute;display:flex;gap:12px;pointer-events:none}
.tk-btns.br{right:calc(18px + env(safe-area-inset-right));bottom:calc(20px + env(safe-area-inset-bottom));flex-direction:column-reverse;align-items:flex-end}
.tk-btns.tr{right:calc(12px + env(safe-area-inset-right));top:calc(10px + env(safe-area-inset-top));flex-direction:row-reverse}
.tk-btns.tl{left:calc(12px + env(safe-area-inset-left));top:calc(10px + env(safe-area-inset-top))}
.tk-btns.bl{left:calc(18px + env(safe-area-inset-left));bottom:calc(20px + env(safe-area-inset-bottom));flex-direction:column-reverse}
.tk-row{display:flex;gap:12px;flex-direction:row-reverse;align-items:flex-end}
.tk-btn{pointer-events:auto;touch-action:none;width:68px;height:68px;border-radius:50%;border:2px solid rgba(255,255,255,.5);
  background:rgba(20,22,30,.42);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:4px;
  box-shadow:0 2px 12px rgba(0,0,0,.35);-webkit-backdrop-filter:blur(2px);backdrop-filter:blur(2px)}
.tk-btn.s{width:48px;height:48px;font-size:9px}.tk-btn.l{width:84px;height:84px}
.tk-btn i{font-style:normal;font-size:22px;line-height:1}.tk-btn.s i{font-size:17px}
.tk-btn.on{background:rgba(255,255,255,.34);border-color:#fff;transform:scale(.94)}
.tk-rot{position:fixed;inset:0;z-index:2147483600;display:none;align-items:center;justify-content:center;flex-direction:column;gap:16px;
  background:rgba(8,9,14,.94);color:#eee;font:500 16px/1.5 system-ui,sans-serif;text-align:center;pointer-events:auto;padding:24px}
.tk-rot b{font-size:44px;display:block;animation:tkr 1.8s ease-in-out infinite}
.tk-rot button{margin-top:6px;background:none;border:1px solid #666;color:#bbb;border-radius:20px;padding:8px 18px;font:inherit;font-size:13px}
@keyframes tkr{0%,20%{transform:rotate(0)}55%,100%{transform:rotate(-90deg)}}
@media (orientation:portrait){.tk-rot.need{display:flex}}
`;function l(p,g,_,m){const d=document.createElement(p);return g&&(d.className=g),m!=null&&(d.innerHTML=m),_&&_.appendChild(d),d}function h(p){if(p=p||{},!document.getElementById("tk-style")){const v=l("style");v.id="tk-style",v.textContent=c,document.head.appendChild(v)}const g=l("div","tk-root",document.body),_={root:g,sticks:{},buttons:{},visible:!1};for(const v of p.sticks||[]){const S=v.side==="right"?"r":"l",A=l("div","tk-zone "+S,g);v.zone&&Object.assign(A.style,v.zone);const C=l("div","tk-base",A),R=l("div","tk-knob",C);v.label&&l("div","tk-lab",R,v.label);const D=v.radius||52,E=v.deadzone==null?.3:v.deadzone,M=v.keys==="wasd"?{up:"KeyW",down:"KeyS",left:"KeyA",right:"KeyD"}:v.keys==="arrows"?{up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"}:v.keys||null,w={x:0,y:0,on:!1,pid:null,cx:0,cy:0,dirs:{}};_.sticks[v.id||S]=w;const N=()=>{const H=A.getBoundingClientRect();let q=S==="l"?96:H.width-96;if(S==="r"&&m.br){const V=m.br.getBoundingClientRect();V.width&&(q=Math.min(q,V.left-H.left-80))}C.style.left=q+"px",C.style.top=H.height-110+"px"},k=H=>{if(M)for(const q of["up","down","left","right"])H[q]&&!w.dirs[q]?(w.dirs[q]=!0,s(M[q])):!H[q]&&w.dirs[q]&&(w.dirs[q]=!1,r(M[q]))},G=(H,q)=>{let V=H-w.cx,it=q-w.cy;const ct=Math.hypot(V,it);ct>D&&(V*=D/ct,it*=D/ct),R.style.transform=`translate(${V}px,${it}px)`,w.x=V/D,w.y=it/D;const St=Math.hypot(w.x,w.y),Nt=Math.atan2(w.y,w.x),Ht={up:!1,down:!1,left:!1,right:!1};if(St>E){const qt=Math.round(Nt/(Math.PI/4));Ht.right=[0,1,-1].includes(qt),Ht.left=[4,-4,3,-3].includes(qt),Ht.down=[1,2,3].includes(qt),Ht.up=[-1,-2,-3].includes(qt)}k(Ht),v.onMove&&v.onMove(w.x,w.y,!0)};A.addEventListener("pointerdown",H=>{if(w.pid!==null)return;H.preventDefault(),w.pid=H.pointerId;try{A.setPointerCapture(H.pointerId)}catch{}const q=A.getBoundingClientRect();w.cx=H.clientX,w.cy=H.clientY,C.style.left=H.clientX-q.left+"px",C.style.top=H.clientY-q.top+"px",C.classList.add("on"),w.on=!0,G(H.clientX,H.clientY),v.onStart&&v.onStart()}),A.addEventListener("pointermove",H=>{H.pointerId===w.pid&&(H.preventDefault(),G(H.clientX,H.clientY))});const W=H=>{H.pointerId===w.pid&&(w.pid=null,w.on=!1,w.x=w.y=0,R.style.transform="",C.classList.remove("on"),k({}),N(),v.onMove&&v.onMove(0,0,!1),v.onEnd&&v.onEnd())};A.addEventListener("pointerup",W),A.addEventListener("pointercancel",W),w.reset=()=>{w.pid!==null&&W({pointerId:w.pid})},requestAnimationFrame(N),addEventListener("resize",N)}const m={};for(const v of p.buttons||[]){const S=v.place||"bottom-right",A={"bottom-right":"br","top-right":"tr","top-left":"tl","bottom-left":"bl"}[S]||"br";m[A]||(m[A]=l("div","tk-btns "+A,g));let C=m[A];A==="br"&&v.row!=null&&(C=m["br"+v.row]||(m["br"+v.row]=l("div","tk-row",m.br)));const R=l("div","tk-btn"+(v.size?" "+v.size:""),C,(v.icon?`<i>${v.icon}</i>`:"")+(v.label?`<span>${v.label}</span>`:"")),D={down:!1,pid:null,el:R};_.buttons[v.id||v.label]=D;const E=w=>{if(w.preventDefault(),w.stopPropagation(),v.toggle){D.down=!D.down,R.classList.toggle("on",D.down),v.key&&(D.down?s:r)(v.key),(D.down?v.onDown:v.onUp)&&(D.down?v.onDown:v.onUp)();return}if(D.pid===null){D.pid=w.pointerId;try{R.setPointerCapture(w.pointerId)}catch{}if(D.down=!0,R.classList.add("on"),v.key&&(v.tap?a(v.key):s(v.key)),v.onDown&&v.onDown(),navigator.vibrate&&v.buzz!==!1)try{navigator.vibrate(8)}catch{}}},M=w=>{v.toggle||w.pointerId!==D.pid||(D.pid=null,D.down=!1,R.classList.remove("on"),v.key&&!v.tap&&r(v.key),v.onUp&&v.onUp())};R.addEventListener("pointerdown",E),R.addEventListener("pointerup",M),R.addEventListener("pointercancel",M),R.addEventListener("contextmenu",w=>w.preventDefault())}let d=null;if(p.landscape&&(d=l("div","tk-rot",document.body,`<b>⟳</b><div>${p.rotateText||"휴대폰을 가로로 돌려 주세요"}<br><small style="opacity:.6">Rotate your phone</small></div><button type="button">그래도 세로로 하기</button>`),d.querySelector("button").addEventListener("click",()=>d.classList.remove("need"))),p.preventGestures!==!1){document.documentElement.style.overscrollBehavior="none",document.addEventListener("gesturestart",S=>S.preventDefault());let v=0;document.addEventListener("touchend",S=>{const A=Date.now();A-v<300&&!(S.target.closest&&S.target.closest("input,textarea,select,a,button"))&&S.preventDefault(),v=A},{passive:!1})}_.show=v=>{if(_.visible=v,g.classList.toggle("tk-off",!v),d&&d.classList.toggle("need",v&&!!p.landscape),!v){for(const S of Object.values(_.sticks))S.reset&&S.reset();for(const[S]of e)i("keyup",S);e.clear();for(const S of Object.values(_.buttons))S.down=!1,S.pid=null,S.el.classList.remove("on")}},_.stick=v=>_.sticks[v]||{x:0,y:0,on:!1},_.pressed=v=>!!(_.buttons[v]&&_.buttons[v].down),_.destroy=()=>{_.show(!1),g.remove(),d&&d.remove()};const T=p.show||"auto";return _.show(T==="always"||T==="auto"&&o()),T==="auto"&&!_.visible&&addEventListener("touchstart",function v(){removeEventListener("touchstart",v),_.show(!0)},{passive:!0}),_}function u(p,g,_,m,d){const T=new MouseEvent(g,Object.assign({clientX:_,clientY:m,bubbles:!0,cancelable:!0,button:0,buttons:g==="mouseup"?0:1},d||{}));(p||document.elementFromPoint(_,m)||document).dispatchEvent(T)}function f(){const p=new Set,g=window.AudioContext||window.webkitAudioContext;if(g&&!g.__tk){const m=function(...d){const T=new g(...d);return p.add(T),T};m.prototype=g.prototype,m.__tk=!0,window.AudioContext=m,window.webkitAudioContext&&(window.webkitAudioContext=m)}const _=()=>{for(const m of p)m.state==="suspended"&&m.resume().catch(()=>{})};addEventListener("pointerdown",_,!0),addEventListener("touchend",_,!0)}window.TouchKit={create:h,press:s,release:r,tapKey:a,sendKey:i,mouse:u,unlockAudio:f,isTouch:o}})();class Ix{input;hooks;kit=null;lookPad=null;restartButton=null;rotateHint=null;rotateDismissed=!1;engagedFlag=!1;pausedFlag=!1;dead=!1;canSwap=!1;lookPointer=-1;lastX=0;lastY=0;constructor(t,e){this.input=t,this.hooks=e}get engaged(){return this.engagedFlag}get paused(){return this.pausedFlag}begin(){this.kit===null&&this.build(),this.engagedFlag=!0,this.pausedFlag=!1,this.kit?.show(!0),this.rotateDismissed&&this.rotateHint?.classList.remove("need"),this.lookPad&&(this.lookPad.hidden=!1),this.syncButtons()}pause(){!this.engagedFlag||this.pausedFlag||(this.pausedFlag=!0,this.lookPointer=-1,this.kit?.show(!1),this.input.releaseTouch(),this.lookPad&&(this.lookPad.hidden=!0),this.syncButtons(),this.hooks.onPause())}update(t,e){const i=!t,s=e>1;i===this.dead&&s===this.canSwap||(this.dead=i,this.canSwap=s,this.syncButtons())}dispose(){document.removeEventListener("visibilitychange",this.onVisibility),this.kit?.destroy(),this.lookPad?.remove(),this.restartButton?.remove(),this.kit=null,this.lookPad=null,this.restartButton=null}onVisibility=()=>{document.hidden&&this.pause()};startLook=t=>{this.lookPointer=t.pointerId,this.lastX=t.clientX,this.lastY=t.clientY};moveLook=t=>{t.pointerId===this.lookPointer&&(this.input.addTouchLook(t.clientX-this.lastX,t.clientY-this.lastY),this.lastX=t.clientX,this.lastY=t.clientY)};endLook=t=>{t.pointerId===this.lookPointer&&(this.lookPointer=-1)};syncButtons(){this.restartButton&&(this.restartButton.hidden=!this.dead||this.pausedFlag||!this.engagedFlag);const t=this.kit?.buttons.swap?.el;t&&(t.style.display=this.canSwap?"":"none")}build(){const t=this.input;this.kit=window.TouchKit.create({show:"manual",landscape:!0,sticks:[{id:"move",side:"left",label:"MOVE",onMove:(r,a,o)=>{!o||Math.hypot(r,a)<Gc.moveDeadzone?t.setTouchMove(0,0):t.setTouchMove(-a,r)}}],buttons:[{id:"fire",label:"FIRE",icon:"✦",size:"l",row:0,onDown:()=>t.setTouchFire(!0),onUp:()=>t.setTouchFire(!1)},{id:"aim",label:"AIM",icon:"◎",row:0,toggle:!0,onDown:()=>t.setTouchAds(!0),onUp:()=>t.setTouchAds(!1)},{id:"jump",label:"JUMP",icon:"⤒",size:"s",row:1,key:"Space"},{id:"reload",label:"RELOAD",icon:"↻",size:"s",row:1,key:"KeyR",tap:!0},{id:"sprint",label:"RUN",icon:"»",size:"s",row:1,key:"ShiftLeft",toggle:!0},{id:"swap",label:"SWAP",icon:"⇄",size:"s",row:2,onDown:()=>this.hooks.onSwap()},{id:"pause",label:"PAUSE",icon:"II",size:"s",place:"top-right",onDown:()=>this.pause()}]}),this.rotateHint=document.querySelector(".tk-rot"),this.rotateHint?.querySelector("button")?.addEventListener("click",()=>{this.rotateDismissed=!0});const e=this.kit.buttons.fire?.el;e&&(e.addEventListener("pointerdown",this.startLook),e.addEventListener("pointermove",this.moveLook),e.addEventListener("pointerup",this.endLook),e.addEventListener("pointercancel",this.endLook));const i=document.createElement("div");i.id="touch-look",i.addEventListener("pointerdown",r=>{if(this.lookPointer===-1){r.preventDefault(),this.startLook(r);try{i.setPointerCapture(r.pointerId)}catch{}}}),i.addEventListener("pointermove",this.moveLook),i.addEventListener("pointerup",this.endLook),i.addEventListener("pointercancel",this.endLook),i.addEventListener("contextmenu",r=>r.preventDefault()),document.body.appendChild(i),this.lookPad=i;const s=document.createElement("button");s.type="button",s.id="touch-restart",s.textContent="↻ RESTART",s.hidden=!0,s.addEventListener("click",()=>this.hooks.onRestart()),document.body.appendChild(s),this.restartButton=s,document.addEventListener("visibilitychange",this.onVisibility)}}const Oc=1592594996;function Ux(){const n=new URLSearchParams(globalThis.location?.search??"").get("seed");if(n===null)return Oc;const t=Number.parseInt(n,10);return Number.isFinite(t)?t:Oc}function Ih(n){const t=document.getElementById("boot-error");t&&(t.hidden=!1,t.textContent=n)}function Fx(){const n=document.getElementById("game");if(!(n instanceof HTMLCanvasElement)){Ih("Boot failed: #game canvas is missing from the document.");return}const t=document.getElementById("start-screen"),e=document.getElementById("start-button"),i=new Zd({seed:Ux(),map:gl}),s=new Pv(n);s.loadMap(gl);const r=new Fv,a=new Ax,o=new px(s.scene,r,a,i.collision),c=new Sx(s.scene),l=new Px,h=new Xh;h.attach(n),h.yaw=i.map.playerStart.yaw;const u=new kh(Zo.hz,Zo.maxStepsPerFrame),f=new Lx;let p=i.player.pos.x,g=i.player.pos.y,_=i.player.pos.z,m=!1;const d=M=>{t&&(t.hidden=!M),a.visible=!M,l.visible=!M};l.visible=!1;const T=globalThis.matchMedia?.("(pointer: coarse)").matches===!0;e&&T&&(e.textContent="Tap to start");const v=new Ix(h,{onPause:()=>{m&&(m=!1,d(!0),e&&(e.textContent="Tap to resume"))},onRestart:()=>{i.player.alive||(i.restart(),o.clear())},onSwap:()=>{const M=i.player.inventory;M.weapons.length>1&&h.requestSlot((M.activeSlot+1)%M.weapons.length)}}),S=(M=!1)=>{d(!1),m=!0,M?(v.begin(),l.setTouchLayout(!0)):h.requestLock(),r.resume(),u.reset()};let A=!1;e?.addEventListener("pointerdown",M=>{A=M.pointerType==="touch"}),e?.addEventListener("click",()=>{S(A),A=!1}),document.addEventListener("pointerlockchange",()=>{!h.isLocked&&m&&(m=!1,d(!0))});const C=Ke();window.addEventListener("keydown",M=>{switch(M.code){case"F1":M.preventDefault(),f.toggle();break;case"F2":M.preventDefault(),i.godMode=!i.godMode;break;case"F3":M.preventDefault(),i.killAllZeds();break;case"F4":M.preventDefault(),i.skipWave();break;case"F6":{M.preventDefault(),To(C,i.player.yaw);for(let w=0;w<5;w++){const N=(w-2)*1.6;i.spawnZedAt(w%2===0?"husker":"skitter",i.player.pos.x+C.x*9-C.z*N,i.player.pos.z+C.z*9+C.x*N)}break}case"KeyR":i.player.alive||(i.restart(),o.clear());break}}),window.addEventListener("resize",()=>s.resize());const R=M=>{const w=u.advance(M);for(let N=0;N<w;N++){p=i.player.pos.x,g=i.player.pos.y,_=i.player.pos.z;const k=h.buildCommand(Du(i.player,1));i.step(k,u.fixedDt),o.consume(i.events,i.player.pos.x,i.player.pos.y,i.player.pos.z,lr(i.player),cr(i.player))}};let D=performance.now();const E=M=>{requestAnimationFrame(E);const w=(M-D)/1e3;D=M,f.sampleFrame(w),s.resize();const N=o.hitStop.consume(w);m&&N>0&&R(N),v.update(i.player.alive,i.player.inventory.weapons.length),o.update(w,s.camera);const k=m?u.alpha:1;s.updateCamera(Li(p,i.player.pos.x,k),Li(g,i.player.pos.y,k),Li(_,i.player.pos.z,k),lr(i.player),cr(i.player),el(i.player),o.shake.yawOffset,o.shake.pitchOffset),c.sync(i.zeds,w),s.render(),a.draw(s.camera);{const G=Bi(i.player.inventory),W=Pa(i.player.inventory);l.update({health:i.player.health,maxHealth:ei.maxHealth,armor:i.player.armor,magazine:G?.ammoInMagazine??0,reserve:G?.reserve??0,weaponName:W?.name??"-",wave:i.waveState.wave,enemiesLeft:i.aliveZedCount+i.waveState.remainingToSpawn,intermission:i.waveState.intermission,alive:i.player.alive,godMode:i.godMode})}if(f.isVisible){const G=i.player,W=Bi(G.inventory),H=Pa(G.inventory);f.set("fps",f.fps.toFixed(1)),f.set("sim",`${i.stepCount} steps  t=${i.time.toFixed(1)}s`),f.set("pos",`${G.pos.x.toFixed(2)} ${G.pos.y.toFixed(2)} ${G.pos.z.toFixed(2)}`),f.set("speed",`${G.speed.toFixed(2)} u/s${G.sprinting?"  sprint":""}`),f.set("ground",G.grounded?"yes":"no"),f.set("ads",G.adsProgress.toFixed(2)),f.set("weapon",H===null||W===null?"none":`${H.name}  ${W.ammoInMagazine}/${W.reserve}  ${W.phase}`),f.set("recoil",`${(G.recoil.pitch*Yo).toFixed(2)}deg`),f.set("spread",`${((W?.spread??0)*Yo).toFixed(3)}deg`),f.set("weight",`${G.inventory.totalWeight}`),f.set("targets",String(i.targetCount)),f.flush()}};requestAnimationFrame(E),Object.defineProperty(globalThis,"__horde",{value:{sim:i,renderer:s,input:h,timestep:u,debug:f,feedback:o,start:S,touch:v,isRunning:()=>m,stepSim(M=1){for(let w=0;w<M;w++){const N=h.buildCommand(1);i.step(N,u.fixedDt)}},zedRenderer:c,hud:l,renderOnce(){c.sync(i.zeds,1/60),s.updateCamera(i.player.pos.x,i.player.pos.y,i.player.pos.z,lr(i.player),cr(i.player),el(i.player)),s.render(),a.draw(s.camera)}},writable:!1,configurable:!0})}try{Fx()}catch(n){throw Ih(`Boot failed: ${n instanceof Error?n.message:String(n)}`),n}
