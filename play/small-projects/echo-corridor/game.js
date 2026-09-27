(() => {
"use strict";
// 난이도와 주요 밸런스 설정.
const CFG={W:960,H:540,ground:440,gravity:1750,playerSpeed:310,aimScale:.43,jump:650,mag:10,reserve:400,fireDelay:.19,bulletSpeed:1200,
diff:{easy:{label:"쉬움",speed:205,hp:2600,jump:5,density:.75,damage:22,reload:1.25},normal:{label:"보통",speed:225,hp:3600,jump:4,density:1,damage:18,reload:1.48},hard:{label:"어려움",speed:245,hp:4800,jump:3.2,density:1.25,damage:15,reload:1.72}}};
const rand=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),lerp=(a,b,t)=>a+(b-a)*t;
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
const timeText=t=>String(Math.floor(t/60)).padStart(2,"0")+":"+String(Math.floor(t%60)).padStart(2,"0")+"."+Math.floor(t%1*10);
const Store={get(k,d){try{return localStorage.getItem(k)??d}catch(_){return d}},set(k,v){try{localStorage.setItem(k,String(v))}catch(_){}}};

// Web Audio API 합성 효과음.
class AudioSystem{
constructor(){this.ctx=null;this.muted=Store.get("echo-muted","false")==="true"}
unlock(){if(this.muted)return;try{const A=window.AudioContext||window.webkitAudioContext;if(!A)return;this.ctx??=new A;if(this.ctx.state==="suspended")this.ctx.resume().catch(()=>{})}catch(_){}}
tone(f,d=.1,type="square",gain=.04,end=0,delay=0){if(this.muted)return;this.unlock();if(!this.ctx)return;const t=this.ctx.currentTime+delay,o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.setValueAtTime(f,t);if(end)o.frequency.exponentialRampToValueAtTime(end,t+d);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(gain,t+.006);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g).connect(this.ctx.destination);o.start(t);o.stop(t+d+.02)}
noise(d=.1,gain=.06){if(this.muted)return;this.unlock();if(!this.ctx)return;const n=Math.floor(this.ctx.sampleRate*d),b=this.ctx.createBuffer(1,n,this.ctx.sampleRate),a=b.getChannelData(0);for(let i=0;i<n;i++)a[i]=(Math.random()*2-1)*(1-i/n);const s=this.ctx.createBufferSource(),g=this.ctx.createGain();g.gain.setValueAtTime(gain,this.ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,this.ctx.currentTime+d);s.buffer=b;s.connect(g).connect(this.ctx.destination);s.start()}
play(n){try{if(n==="gun"){this.noise(.08,.11);this.tone(140,.1,"sawtooth",.05,60)}if(n==="empty")this.tone(800,.04,"square",.03);if(n==="reload"){this.tone(330,.04,"square",.025);this.tone(520,.05,"square",.025,0,.16)}if(n==="jump")this.tone(190,.1,"triangle",.035,360);if(n==="land"){this.noise(.08,.04);this.tone(75,.08,"sine",.03)}if(n==="roar"){this.tone(90,.38,"sawtooth",.06,45);this.noise(.25,.04)}if(n==="bossLand"){this.noise(.2,.12);this.tone(48,.3,"sine",.08)}if(n==="hit")this.tone(260,.05,"square",.025,120);if(n==="lose")this.tone(180,.55,"sawtooth",.055,45);if(n==="win")[392,494,587,784].forEach((f,i)=>this.tone(f,.35,"triangle",.04,0,i*.12))}catch(_){}}
toggle(){this.muted=!this.muted;Store.set("echo-muted",this.muted);if(!this.muted)this.unlock()}
}

// 키보드 및 마우스 입력.
class Input{
constructor(canvas,cross){this.keys=new Set();this.pressed=new Set();this.mouse={x:100,y:300,down:false};this.canvas=canvas;this.cross=cross;
addEventListener("keydown",e=>{if(["ArrowLeft","ArrowRight","KeyA","KeyD","KeyS","KeyR","Space","KeyP","Escape","Enter"].includes(e.code))e.preventDefault();if(!this.keys.has(e.code))this.pressed.add(e.code);this.keys.add(e.code)},{passive:false});
addEventListener("keyup",e=>this.keys.delete(e.code));canvas.addEventListener("pointermove",e=>this.move(e));canvas.addEventListener("pointerenter",e=>this.move(e));canvas.addEventListener("pointerleave",()=>{this.mouse.down=false;cross.style.opacity=0});
canvas.addEventListener("pointerdown",e=>{if(e.button===0){e.preventDefault();this.mouse.down=true;this.move(e);canvas.focus()}});addEventListener("pointerup",e=>{if(e.button===0)this.mouse.down=false});canvas.oncontextmenu=e=>e.preventDefault()}
move(e){const r=this.canvas.getBoundingClientRect();if(!r.width)return;this.mouse.x=(e.clientX-r.left)*CFG.W/r.width;this.mouse.y=(e.clientY-r.top)*CFG.H/r.height;this.cross.style.left=e.clientX-r.left+"px";this.cross.style.top=e.clientY-r.top+"px";this.cross.style.opacity=.85}
down(...codes){return codes.some(x=>this.keys.has(x))}take(code){if(!this.pressed.has(code))return false;this.pressed.delete(code);return true}end(){this.pressed.clear()}reset(){this.keys.clear();this.pressed.clear();this.mouse.down=false}
}

// 만화적인 먼지, 액체, 충격파.
class ParticleSystem{
constructor(){this.items=[]}clear(){this.items=[]}
burst(x,y,n,color,s=120,g=160,life=.5){for(let i=0;i<n;i++){const a=rand(0,Math.PI*2),v=rand(s*.3,s);this.items.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g,life:rand(life*.7,life),max:life,color,size:rand(2,5),ring:false})}}
ring(x,y,color){this.items.push({x,y,vx:0,vy:0,g:0,life:.35,max:.35,color,size:8,ring:true})}
update(dt){for(let i=this.items.length-1;i>=0;i--){const p=this.items[i];p.life-=dt;if(p.life<=0){this.items.splice(i,1);continue}p.vy+=p.g*dt;p.x+=p.vx*dt;p.y+=p.vy*dt}}
draw(c){for(const p of this.items){const a=p.life/p.max;c.globalAlpha=a;c.fillStyle=p.color;c.strokeStyle=p.color;if(p.ring){const r=8+(1-a)*65;c.lineWidth=3*a;c.beginPath();c.ellipse(p.x,p.y,r,r*.2,0,0,Math.PI*2);c.stroke()}else c.fillRect(p.x,p.y,p.size*2,p.size)}c.globalAlpha=1}
}

// 총알과 궤적.
class Bullet{
constructor(x,y,vx,vy,damage){Object.assign(this,{x,y,px:x,py:y,vx,vy,damage,life:1.1,dead:false})}
update(dt){this.px=this.x;this.py=this.y;this.x+=this.vx*dt;this.y+=this.vy*dt;this.life-=dt;if(this.life<=0)this.dead=true}
draw(c){c.strokeStyle="#ffb64d";c.lineWidth=2;c.beginPath();c.moveTo(this.px,this.py);c.lineTo(this.x,this.y);c.stroke();c.fillStyle="#fff4b0";c.fillRect(this.x-2,this.y-1,5,2)}
}

// 책상, CRT, 케이블, 의자, 상자 장애물.
class Obstacle{
constructor(type,x,w,h){Object.assign(this,{type,x,w,h,y:CFG.ground-h})}
draw(c){const{x,y,w,h,type}=this;c.save();c.translate(x,y);c.fillStyle=type==="box"?"#4a3c29":"#34352a";c.fillRect(0,0,w,h);c.strokeStyle="#716046";c.strokeRect(3,3,w-6,h-6);
if(type==="crt"){c.fillStyle="#53694f";c.fillRect(6,6,w-12,h-23);c.fillStyle="#151713";c.fillRect(12,h-12,w-24,8)}
if(type==="desk"){c.fillStyle="#55513c";c.fillRect(-4,4,w+8,10);c.fillStyle="#11130f";c.fillRect(15,18,w-30,h-18)}
if(type==="cable"){c.clearRect(0,0,w,h);c.strokeStyle="#5f4930";c.lineWidth=7;c.beginPath();c.moveTo(0,h);c.bezierCurveTo(w*.3,-8,w*.65,h+8,w,2);c.stroke()}
if(type==="chair"){c.fillStyle="#151713";c.fillRect(12,8,w-24,18);c.fillRect(16,30,w-32,h-30)}c.restore()}
}

// 통과 불가능한 조합을 피하는 스테이지 생성 및 충돌.
class Stage{
constructor(){this.reset()}reset(){this.obstacles=[];this.pits=[];this.next=1650}
isPit(x){return this.pits.some(p=>x>p.x+5&&x<p.x+p.w-5)}
generate(px,time,d){while(this.next<px+2600){this.next+=rand(330,510)/d.density;if(time<10){this.next+=170;continue}
if(Math.random()<.11*d.density){const w=rand(82,122);this.pits.push({x:this.next,w});this.next+=w+150;continue}
const r=Math.random();let t,w,h;if(r<.2){t="cable";w=75;h=18}else if(r<.4){t="chair";w=48;h=54}else if(r<.6){t="crt";w=58;h=61}else if(r<.82){t="box";w=rand(50,67);h=rand(45,78)}else{t="desk";w=92;h=72}this.obstacles.push(new Obstacle(t,this.next,w,h));this.next+=w}
this.obstacles=this.obstacles.filter(o=>o.x+o.w>px-1500);this.pits=this.pits.filter(p=>p.x+p.w>px-1500)}
bulletHit(x,y){return this.obstacles.some(o=>x>o.x&&x<o.x+o.w&&y>o.y&&y<o.y+o.h)}
resolve(p,ox,oy){const oldBottom=oy+p.h,box={x:p.x,y:p.y,w:p.w,h:p.h};for(const o of this.obstacles){if(!overlap(box,o))continue;
if(p.vy>=0&&oldBottom<=o.y+7){p.y=o.y-p.h;p.vy=0;p.onGround=true;p.land(o.y)}
else if(ox+p.w<=o.x+4){p.x=o.x-p.w;p.vx=Math.min(0,p.vx)}
else if(ox>=o.x+o.w-4){p.x=o.x+o.w;p.vx=Math.max(0,p.vx)}
else if(oy>=o.y+o.h-4){p.y=o.y+o.h;p.vy=Math.max(0,p.vy)}box.x=p.x;box.y=p.y}
const foot=p.x+p.w/2;if(p.vy>=0&&p.y+p.h>=CFG.ground&&!this.isPit(foot)){const landed=!p.onGround&&oldBottom<CFG.ground-2;p.y=CFG.ground-p.h;p.vy=0;p.onGround=true;if(landed)p.land(CFG.ground)}}
draw(c,from,to){c.fillStyle="#24261e";c.fillRect(from,CFG.ground,to-from,CFG.H-CFG.ground);c.fillStyle="#3d4031";c.fillRect(from,CFG.ground,to-from,7);
for(const p of this.pits){c.fillStyle="#030403";c.fillRect(p.x,CFG.ground-2,p.w,CFG.H-CFG.ground+4);c.strokeStyle="#62462d";c.lineWidth=3;c.strokeRect(p.x,CFG.ground-2,p.w,8)}}
}

// 플레이어 이동, 점프, 발사, 재장전.
class Player{
constructor(g){this.g=g;this.w=30;this.h=56;this.reset()}
reset(){Object.assign(this,{x:650,y:CFG.ground-56,vx:0,vy:0,onGround:true,run:0,angle:Math.PI,back:false,recoil:0,muzzle:0,ammo:CFG.mag,reserve:CFG.reserve,reload:0,cool:0,empty:0})}
get box(){return{x:this.x+4,y:this.y+3,w:this.w-8,h:this.h-3}}
land(y){this.g.fx.burst(this.x+15,y,6,"#8d8266",90,120,.4);this.g.fx.ring(this.x+15,y,"#7c765f");this.g.audio.play("land")}
startReload(){if(this.reload||this.ammo===CFG.mag||!this.reserve)return;this.reload=this.g.diff.reload;this.g.audio.play("reload");this.g.toast("탄창 교체 중")}
shoot(){if(this.reload||this.cool)return;if(!this.ammo){if(!this.empty){this.g.audio.play("empty");this.g.toast("찰칵! 탄창이 비었다");this.empty=.3}return}
const sx=this.x+15,sy=this.y+21;let dx=this.g.input.mouse.x+this.g.camera-sx,dy=this.g.input.mouse.y-sy,l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const a=rand(-.018,.018),cs=Math.cos(a),sn=Math.sin(a),vx=dx*cs-dy*sn,vy=dx*sn+dy*cs;
this.g.bullets.push(new Bullet(sx+vx*31,sy+vy*31,vx*CFG.bulletSpeed,vy*CFG.bulletSpeed,this.g.diff.damage));this.ammo--;this.cool=CFG.fireDelay;this.muzzle=.055;this.recoil=.13;this.vx-=vx*24;this.g.audio.play("gun");this.g.shake(1,.08)}
update(dt){const i=this.g.input;this.cool=Math.max(0,this.cool-dt);this.empty=Math.max(0,this.empty-dt);this.muzzle=Math.max(0,this.muzzle-dt);this.recoil=Math.max(0,this.recoil-dt);
this.angle=Math.atan2(i.mouse.y-this.y-21,i.mouse.x+this.g.camera-this.x-15);this.back=Math.cos(this.angle)<-.1||i.mouse.down;
const move=(i.down("KeyD","ArrowRight")?1:0)-(i.down("KeyA","ArrowLeft")?1:0),target=move*CFG.playerSpeed*(this.back?CFG.aimScale:1),rate=move?1900:2200;this.vx+=clamp(target-this.vx,-rate*dt,rate*dt);
if(i.take("Space")&&this.onGround){this.vy=-CFG.jump;this.onGround=false;this.g.audio.play("jump")}if(i.take("KeyS")||i.take("KeyR"))this.startReload();if(i.mouse.down)this.shoot();
if(this.reload){this.reload-=dt;if(this.reload<=0){const n=Math.min(CFG.mag-this.ammo,this.reserve);this.ammo+=n;this.reserve-=n;this.reload=0;this.g.audio.play("reload")}}
const ox=this.x,oy=this.y;this.x+=this.vx*dt;this.vy+=CFG.gravity*dt;this.y+=this.vy*dt;this.onGround=false;this.g.stage.resolve(this,ox,oy);if(Math.abs(this.vx)>20&&this.onGround)this.run+=dt*Math.abs(this.vx)/65;if(this.y>CFG.H+100)this.g.gameOver("바닥이 사라졌다")}
draw(c){const x=this.x+15,y=this.y,s=Math.sin(this.run)*(this.onGround?10:3),lean=clamp(this.vx/CFG.playerSpeed,-1,1)*3;c.save();c.translate(x,y);c.strokeStyle="#070807";c.fillStyle="#070807";c.lineWidth=7;c.beginPath();c.moveTo(lean,31);c.lineTo(-7+s,52);c.moveTo(lean+2,31);c.lineTo(8-s,52);c.stroke();c.fillRect(-8+lean,14,17,25);c.beginPath();c.arc(2+lean,9,9,0,Math.PI*2);c.fill();
const rr=this.recoil?5:0,ax=Math.cos(this.angle)*(22-rr),ay=21+Math.sin(this.angle)*(22-rr);c.beginPath();c.moveTo(0,20);c.lineTo(ax,ay);c.stroke();c.save();c.translate(ax,ay);c.rotate(this.angle);c.fillStyle="#30332a";c.fillRect(-2,-3,25,6);if(this.muzzle){c.fillStyle="#ffb23f";c.beginPath();c.moveTo(23,0);c.lineTo(39,-8);c.lineTo(34,0);c.lineTo(39,8);c.fill()}c.restore();if(this.back){c.fillStyle="#e08b37";c.fillRect(-6+lean,5,3,2)}c.restore()}
}

// 보스 추격, 경고 도약, 세 페이즈와 피격 반응.
class Boss{
constructor(g){this.g=g;this.w=142;this.h=88;this.reset()}
reset(){Object.assign(this,{maxHp:this.g.diff.hp,hp:this.g.diff.hp,x:0,y:CFG.ground-88,vx:0,vy:0,phase:1,state:"ground",timer:0,jump:rand(this.g.diff.jump*.8,this.g.diff.jump*1.2),flash:0,legs:0,dead:false})}
get box(){return{x:this.x+12,y:this.y+9,w:this.w-24,h:this.h-12}}
update(dt){if(this.dead){this.vy+=CFG.gravity*.45*dt;this.y+=this.vy*dt;this.x+=this.vx*dt;return}this.flash=Math.max(0,this.flash-dt);
const ratio=this.hp/this.maxHp,newPhase=ratio<=.3?3:ratio<=.6?2:1;if(newPhase!==this.phase){this.phase=newPhase;this.g.audio.play("roar");this.g.toast("위험: 포식자 PHASE "+newPhase);this.g.shake(6,.35);this.state="stun";this.timer=.35}
const dist=this.g.player.x-this.x-this.w,speed=this.g.diff.speed*(this.phase===1?1:this.phase===2?1.13:1.28)*(dist>760?1.32:dist>560?1.12:1);this.legs+=dt*speed/55;
if(this.state==="stun"){this.timer-=dt;this.vx=lerp(this.vx,0,dt*9);if(this.timer<=0)this.state="ground"}
else if(this.state==="warn"){this.timer-=dt;this.vx=speed*.42;if(this.timer<=0){this.state="air";this.vy=-rand(560,650);this.vx=speed*rand(1.35,1.62);this.g.audio.play("roar")}}
else if(this.state==="air"){this.vy+=CFG.gravity*.82*dt;this.y+=this.vy*dt;if(this.y+this.h>=CFG.ground){this.y=CFG.ground-this.h;this.vy=0;this.state="ground";this.jump=rand(this.g.diff.jump*.8,this.g.diff.jump*1.2);this.g.audio.play("bossLand");this.g.shake(11,.42);this.g.fx.burst(this.x+80,CFG.ground,18,"#756849",190,160,.65);this.g.fx.ring(this.x+80,CFG.ground,"#b0713d")}}
else{this.vx=lerp(this.vx,speed,clamp(dt*3.3,0,1));this.jump-=dt;if(this.jump<=0&&dist>150){this.state="warn";this.timer=.7;this.g.toast("도약 경고!")}}
this.x+=this.vx*dt;if(this.state!=="air")this.y=CFG.ground-this.h+Math.sin(this.legs*2)*2}
takeHit(b){this.hp=Math.max(0,this.hp-b.damage);this.flash=.075;this.x-=9;this.vx*=.78;if(this.state!=="warn"&&this.state!=="air"){this.state="stun";this.timer=.055}this.g.registerHit(b.x,b.y);if(this.hp<=0){this.dead=true;this.vx=-85;this.vy=-160;this.g.fx.burst(this.x+70,this.y+44,34,"#9fc151",240,260,1.25);this.g.beginVictory()}}
draw(c){const crouch=this.state==="warn"?16:0,col=this.flash?"#e8edc3":["#59633d","#74613a","#803f2f"][this.phase-1];c.save();c.translate(this.x,this.y+crouch);
if(this.state==="warn"){c.strokeStyle="#ef7f36";c.lineWidth=3;c.globalAlpha=.5+Math.sin(this.timer*28)*.35;c.strokeRect(4,-10,this.w-8,this.h+11);c.globalAlpha=1}
c.strokeStyle="#12150e";c.lineWidth=7;for(let i=0;i<6;i++){const x=22+i*18,s=Math.sin(this.legs+i*1.6)*12;c.beginPath();c.moveTo(x,55);c.lineTo(x-16+s,79);c.lineTo(x-25+s,84);c.stroke()}
c.fillStyle=col;c.strokeStyle="#1b1e13";c.lineWidth=4;for(let i=0;i<5;i++){c.beginPath();c.ellipse(25+i*23,39+Math.sin(this.legs*.6+i)*4,27,24-i*1.5,-.08,0,Math.PI*2);c.fill();c.stroke()}
c.beginPath();c.ellipse(119,34,25,29,-.3,0,Math.PI*2);c.fill();c.stroke();c.strokeStyle="#282b1d";c.beginPath();c.moveTo(129,15);c.quadraticCurveTo(151,-10,159,7);c.moveTo(124,12);c.quadraticCurveTo(135,-14,144,2);c.stroke();
const eye=["#d9b84e","#f07b36","#ff3f2b"][this.phase-1];c.fillStyle=eye;c.shadowColor=eye;c.shadowBlur=10;c.fillRect(125,24,7,5);c.fillRect(136,29,6,5);c.shadowBlur=0;if(this.phase>1){c.fillStyle=this.phase===3?"#9f4b32":"#89733e";for(let i=0;i<4;i++){c.beginPath();c.moveTo(42+i*22,17);c.lineTo(51+i*22,-4-i%2*5);c.lineTo(58+i*22,19);c.fill()}}c.restore()}
}

// HUD 및 화면 DOM 연결.
class UI{
constructor(){const $=id=>document.getElementById(id);const ids={canvas:"gameCanvas",hud:"hud",title:"titleScreen",how:"howScreen",pause:"pauseScreen",victory:"victoryScreen",over:"gameOverScreen",bar:"bossBar",hp:"bossHpText",phase:"phaseText",distance:"distanceText",time:"timeText",score:"scoreText",ammo:"ammoText",reserve:"reserveText",reload:"reloadTrack",reloadBar:"reloadBar",comboBox:"comboBox",combo:"comboText",warning:"offscreenWarning",warningDistance:"warningDistance",toast:"toast",cross:"crosshair",best:"bestSummary",vScore:"victoryScore",vStats:"victoryStats",oScore:"gameOverScore",oStats:"gameOverStats",mute:"muteButton",shake:"shakeButton",start:"startButton",howButton:"howButton",howStart:"howStartButton",back:"backButton",resume:"resumeButton"};for(const[k,id]of Object.entries(ids))this[k]=$(id);this.restarts=[...document.querySelectorAll(".restart-button")];this.diffs=[...document.querySelectorAll("[data-difficulty]")]}
hideScreens(){[this.title,this.how,this.pause,this.victory,this.over].forEach(x=>x.hidden=true)}
}

// 게임 상태 관리, 충돌 처리, 렌더링과 저장.
class Game{
constructor(){this.ui=new UI();this.ctx=this.ui.canvas.getContext("2d",{alpha:false});if(!this.ctx)throw Error("Canvas unavailable");this.ctx.imageSmoothingEnabled=false;this.audio=new AudioSystem();this.input=new Input(this.ui.canvas,this.ui.cross);this.fx=new ParticleSystem();this.stage=new Stage();this.diffKey="normal";this.diff=CFG.diff.normal;this.player=new Player(this);this.boss=new Boss(this);this.bullets=[];this.state="title";this.camera=0;this.elapsed=0;this.score=0;this.combo=0;this.comboTimer=0;this.shakeEnabled=Store.get("echo-shake","true")!=="false";this.shakePower=0;this.shakeTimer=0;this.last=performance.now();this.bind();this.settings();this.best();this.reset();requestAnimationFrame(t=>this.loop(t))}
bind(){const u=this.ui;u.start.onclick=u.howStart.onclick=()=>this.start();u.howButton.onclick=()=>{this.state="how";u.title.hidden=true;u.how.hidden=false};u.back.onclick=()=>{this.state="title";u.how.hidden=true;u.title.hidden=false};u.resume.onclick=()=>this.pause(false);u.restarts.forEach(b=>b.onclick=()=>this.start());u.diffs.forEach(b=>b.onclick=()=>this.selectDifficulty(b.dataset.difficulty));u.mute.onclick=()=>{this.audio.toggle();this.settings()};u.shake.onclick=()=>{this.shakeEnabled=!this.shakeEnabled;Store.set("echo-shake",this.shakeEnabled);this.settings()};
addEventListener("keydown",e=>{if(e.code==="Enter"&&["title","how","over","victory"].includes(this.state))this.start();if((e.code==="KeyP"||e.code==="Escape")&&["playing","paused"].includes(this.state))this.pause()});document.addEventListener("visibilitychange",()=>{if(document.hidden&&this.state==="playing")this.pause(true)});addEventListener("blur",()=>{if(this.state==="playing")this.pause(true)})}
selectDifficulty(k){if(!CFG.diff[k])return;this.diffKey=k;this.diff=CFG.diff[k];this.ui.diffs.forEach(b=>b.classList.toggle("selected",b.dataset.difficulty===k));this.best()}
settings(){this.ui.mute.textContent=this.audio.muted?"소리 OFF":"소리 ON";this.ui.shake.textContent=this.shakeEnabled?"흔들림 ON":"흔들림 OFF"}
best(){const n=+Store.get("echo-best-"+this.diffKey,0);this.ui.best.textContent=n?this.diff.label+" 최고 점수 · "+n.toLocaleString("ko-KR"):this.diff.label+" 최고 기록 없음"}
reset(){this.stage.reset();this.fx.clear();this.bullets=[];this.player.reset();this.boss=new Boss(this);this.boss.x=this.player.x-650;this.camera=this.player.x-620;this.elapsed=this.score=this.combo=this.comboTimer=0;this.startX=this.player.x;this.victoryTimer=this.shakePower=this.shakeTimer=0;this.stage.generate(this.player.x,0,this.diff);this.updateHUD()}
start(){this.audio.unlock();this.diff=CFG.diff[this.diffKey];this.reset();this.input.reset();this.state="playing";this.ui.hideScreens();this.ui.hud.hidden=false;this.last=performance.now();this.ui.canvas.focus();this.toast("10초 동안은 통로가 안전하다")}
pause(force){if(!["playing","paused"].includes(this.state))return;const on=force===true?true:this.state==="playing";this.state=on?"paused":"playing";this.ui.pause.hidden=!on;this.input.mouse.down=false;if(!on){this.last=performance.now();this.audio.unlock();this.ui.canvas.focus()}}
toast(s){clearTimeout(this.toastId);this.ui.toast.textContent=s;this.ui.toast.classList.add("show");this.toastId=setTimeout(()=>this.ui.toast.classList.remove("show"),1300)}
shake(p,t){if(this.shakeEnabled){this.shakePower=Math.max(this.shakePower,p);this.shakeTimer=Math.max(this.shakeTimer,t)}}
registerHit(x,y){this.combo++;this.comboTimer=1.8;this.score+=45+this.combo*7;this.audio.play("hit");this.fx.burst(x,y,8,this.boss.phase===3?"#b34a38":"#8fb64e",155,190,.58);this.shake(2.2,.1)}
beginVictory(){if(this.state!=="playing")return;this.state="cinematic";this.victoryTimer=2.1;this.input.mouse.down=false;this.audio.play("win");this.score+=Math.max(0,Math.floor(10000-this.elapsed*18))+this.combo*50;this.shake(8,.5)}
finishVictory(){this.state="victory";this.ui.victory.hidden=false;this.ui.hud.hidden=true;this.saveBest();this.ui.vScore.textContent=Math.floor(this.score).toLocaleString("ko-KR")+"점";this.ui.vStats.textContent="생존 "+timeText(this.elapsed)+" · 이동 "+Math.max(0,Math.floor((this.player.x-this.startX)/10))+"m · 연속 "+this.combo+"회"}
gameOver(reason){if(this.state!=="playing")return;this.state="over";this.input.mouse.down=false;this.audio.play("lose");this.saveBest();this.ui.over.hidden=false;this.ui.hud.hidden=true;this.ui.oScore.textContent=Math.floor(this.score).toLocaleString("ko-KR")+"점";this.ui.oStats.textContent=reason+" · 생존 "+timeText(this.elapsed)+" · 보스 체력 "+Math.ceil(this.boss.hp/this.boss.maxHp*100)+"%"}
saveBest(){const k="echo-best-"+this.diffKey,n=+Store.get(k,0);if(this.score>n)Store.set(k,Math.floor(this.score));this.best()}
updateBullets(dt){for(const b of this.bullets){b.update(dt);if(b.dead)continue;const q=this.boss.box;if(!this.boss.dead&&b.x>q.x&&b.x<q.x+q.w&&b.y>q.y&&b.y<q.y+q.h){b.dead=true;this.boss.takeHit(b)}else if(this.stage.bulletHit(b.x,b.y)){b.dead=true;this.fx.burst(b.x,b.y,4,"#8d7955",75,120,.32)}}this.bullets=this.bullets.filter(b=>!b.dead)}
update(dt){this.elapsed+=dt;this.stage.generate(this.player.x,this.elapsed,this.diff);this.player.update(dt);this.boss.update(dt);this.updateBullets(dt);this.fx.update(dt);this.camera=lerp(this.camera,this.player.x-620,clamp(dt*7,0,1));if(this.comboTimer>0){this.comboTimer-=dt;if(this.comboTimer<=0)this.combo=0}this.score+=dt*8+Math.max(0,this.player.vx)*dt*.035;if(!this.boss.dead&&overlap(this.player.box,this.boss.box))this.gameOver("포식자에게 붙잡혔다");this.updateHUD()}
updateCinematic(dt){this.victoryTimer-=dt;this.boss.update(dt*.22);this.fx.update(dt*.22);this.camera=lerp(this.camera,this.boss.x+this.boss.w/2-CFG.W/2,dt*1.2);if(this.victoryTimer<=0)this.finishVictory()}
updateHUD(){const u=this.ui,h=clamp(this.boss.hp/this.boss.maxHp,0,1),d=Math.max(0,this.player.x-this.boss.x-this.boss.w);u.bar.style.width=h*100+"%";u.hp.textContent=Math.ceil(h*100)+"%";u.phase.textContent="PHASE "+this.boss.phase;u.distance.textContent=Math.floor(d/10)+" m";u.time.textContent=timeText(this.elapsed);u.score.textContent=Math.floor(this.score).toString().padStart(6,"0");u.ammo.textContent=this.player.ammo;u.reserve.textContent=this.player.reserve;u.reload.hidden=!this.player.reload;u.reloadBar.style.width=this.player.reload?(1-this.player.reload/this.diff.reload)*100+"%":"0%";u.combo.textContent="×"+this.combo;u.comboBox.classList.toggle("active",this.combo>1);const off=this.boss.x+this.boss.w-this.camera<0&&this.state==="playing";u.warning.hidden=!off;u.warningDistance.textContent=Math.floor(d/10)+" m"}
drawBackground(c){const cam=this.camera;c.fillStyle="#11140f";c.fillRect(0,0,CFG.W,CFG.H);c.fillStyle="#20251d";c.fillRect(0,92,CFG.W,348);
for(let i=-2;i<8;i++){const x=((i*320-cam*.28)%3200+3200)%3200-400;c.fillStyle="#151913";c.fillRect(x,128,190,148);c.strokeStyle="#48523d";c.lineWidth=5;c.strokeRect(x+5,133,180,138);c.fillStyle="#334235";c.fillRect(x+15,143,76,118);c.fillRect(x+99,143,76,118)}
c.strokeStyle="#393c2e";c.lineWidth=4;c.beginPath();c.moveTo(0,88);for(let x=0;x<=CFG.W;x+=80)c.lineTo(x,88+Math.sin((x+cam*.18)*.025)*16);c.stroke();
for(let i=-2;i<9;i++){const x=((i*250-cam*.52)%2750+2750)%2750-300;c.fillStyle="#24271e";c.fillRect(x,343,105,9);c.fillRect(x+8,352,7,88);c.fillRect(x+90,352,7,88);c.fillStyle="#303429";c.fillRect(x+30,306,48,37);c.fillStyle="#172018";c.fillRect(x+36,312,36,24)}}
render(){const c=this.ctx,s=this.shakeTimer&&this.shakeEnabled?rand(-this.shakePower,this.shakePower):0,t=this.shakeTimer&&this.shakeEnabled?rand(-this.shakePower,this.shakePower):0;c.save();c.translate(s,t);this.drawBackground(c);c.save();c.translate(-Math.round(this.camera),0);this.stage.draw(c,this.camera-20,this.camera+CFG.W+40);this.stage.obstacles.forEach(o=>o.draw(c));this.bullets.forEach(b=>b.draw(c));this.boss.draw(c);this.player.draw(c);this.fx.draw(c);c.restore();
c.strokeStyle="#090b08";c.lineWidth=8;c.globalAlpha=.75;const off=-(this.camera*1.25%300);for(let i=-1;i<5;i++){const x=off+i*300;c.beginPath();c.moveTo(x,520);c.bezierCurveTo(x+80,455,x+170,565,x+280,495);c.stroke()}c.globalAlpha=1;if(this.state==="cinematic"){c.fillStyle="rgba(222,197,111,.08)";c.fillRect(0,0,CFG.W,CFG.H)}c.restore()}
loop(now){const dt=Math.min(.033,Math.max(0,(now-this.last)/1000));this.last=now;if(this.state==="playing")this.update(dt);else if(this.state==="cinematic")this.updateCinematic(dt);else this.fx.update(Math.min(dt,.016));if(this.shakeTimer>0){this.shakeTimer-=dt;if(this.shakeTimer<=0)this.shakePower=0}this.render();this.input.end();requestAnimationFrame(t=>this.loop(t))}
}
try{window.echoGame=new Game()}catch(e){console.error("잔향 통로 초기화 실패:",e);const f=document.getElementById("gameFrame");if(f)f.innerHTML='<div style="padding:2rem;color:#ffc078">게임을 시작할 수 없습니다. 새로고침해 주세요.</div>'}
})();
