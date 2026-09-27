(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))n(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();(function(){if(window.TouchKit)return;const i={Space:[" ",32],Enter:["Enter",13],Escape:["Escape",27],Tab:["Tab",9],ShiftLeft:["Shift",16],ControlLeft:["Control",17],AltLeft:["Alt",18],ArrowLeft:["ArrowLeft",37],ArrowUp:["ArrowUp",38],ArrowRight:["ArrowRight",39],ArrowDown:["ArrowDown",40],Backspace:["Backspace",8]},t=f=>i[f]?i[f]:/^Key[A-Z]$/.test(f)?[f[3].toLowerCase(),f.charCodeAt(3)]:/^Digit\d$/.test(f)?[f[5],f.charCodeAt(5)]:[f,0],e=new Map;function n(f,g){const[_,m]=t(g),p=new KeyboardEvent(f,{key:_,code:g,bubbles:!0,cancelable:!0,composed:!0});try{Object.defineProperty(p,"keyCode",{get:()=>m}),Object.defineProperty(p,"which",{get:()=>m})}catch{}(document.activeElement&&document.activeElement!==document.body?document.activeElement:document).dispatchEvent(p)}function s(f){const g=e.get(f)||0;e.set(f,g+1),g===0&&n("keydown",f)}function r(f){const g=e.get(f)||0;g<=1?(e.delete(f),g===1&&n("keyup",f)):e.set(f,g-1)}function o(f){s(f),setTimeout(()=>r(f),80)}const a=()=>matchMedia("(pointer: coarse)").matches||navigator.maxTouchPoints>0,l=`
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
`;function c(f,g,_,m){const p=document.createElement(f);return g&&(p.className=g),m!=null&&(p.innerHTML=m),_&&_.appendChild(p),p}function u(f){if(f=f||{},!document.getElementById("tk-style")){const v=c("style");v.id="tk-style",v.textContent=l,document.head.appendChild(v)}const g=c("div","tk-root",document.body),_={root:g,sticks:{},buttons:{},visible:!1};for(const v of f.sticks||[]){const y=v.side==="right"?"r":"l",A=c("div","tk-zone "+y,g);v.zone&&Object.assign(A.style,v.zone);const T=c("div","tk-base",A),R=c("div","tk-knob",T);v.label&&c("div","tk-lab",R,v.label);const P=v.radius||52,E=v.deadzone==null?.3:v.deadzone,w=v.keys==="wasd"?{up:"KeyW",down:"KeyS",left:"KeyA",right:"KeyD"}:v.keys==="arrows"?{up:"ArrowUp",down:"ArrowDown",left:"ArrowLeft",right:"ArrowRight"}:v.keys||null,L={x:0,y:0,on:!1,pid:null,cx:0,cy:0,dirs:{}};_.sticks[v.id||y]=L;const k=()=>{const G=A.getBoundingClientRect();let X=y==="l"?96:G.width-96;if(y==="r"&&m.br){const B=m.br.getBoundingClientRect();B.width&&(X=Math.min(X,B.left-G.left-80))}T.style.left=X+"px",T.style.top=G.height-110+"px"},V=G=>{if(w)for(const X of["up","down","left","right"])G[X]&&!L.dirs[X]?(L.dirs[X]=!0,s(w[X])):!G[X]&&L.dirs[X]&&(L.dirs[X]=!1,r(w[X]))},Z=(G,X)=>{let B=G-L.cx,st=X-L.cy;const at=Math.hypot(B,st);at>P&&(B*=P/at,st*=P/at),R.style.transform=`translate(${B}px,${st}px)`,L.x=B/P,L.y=st/P;const gt=Math.hypot(L.x,L.y),Ot=Math.atan2(L.y,L.x),Kt={up:!1,down:!1,left:!1,right:!1};if(gt>E){const Nt=Math.round(Ot/(Math.PI/4));Kt.right=[0,1,-1].includes(Nt),Kt.left=[4,-4,3,-3].includes(Nt),Kt.down=[1,2,3].includes(Nt),Kt.up=[-1,-2,-3].includes(Nt)}V(Kt),v.onMove&&v.onMove(L.x,L.y,!0)};A.addEventListener("pointerdown",G=>{if(L.pid!==null)return;G.preventDefault(),L.pid=G.pointerId;try{A.setPointerCapture(G.pointerId)}catch{}const X=A.getBoundingClientRect();L.cx=G.clientX,L.cy=G.clientY,T.style.left=G.clientX-X.left+"px",T.style.top=G.clientY-X.top+"px",T.classList.add("on"),L.on=!0,Z(G.clientX,G.clientY),v.onStart&&v.onStart()}),A.addEventListener("pointermove",G=>{G.pointerId===L.pid&&(G.preventDefault(),Z(G.clientX,G.clientY))});const q=G=>{G.pointerId===L.pid&&(L.pid=null,L.on=!1,L.x=L.y=0,R.style.transform="",T.classList.remove("on"),V({}),k(),v.onMove&&v.onMove(0,0,!1),v.onEnd&&v.onEnd())};A.addEventListener("pointerup",q),A.addEventListener("pointercancel",q),L.reset=()=>{L.pid!==null&&q({pointerId:L.pid})},requestAnimationFrame(k),addEventListener("resize",k)}const m={};for(const v of f.buttons||[]){const y=v.place||"bottom-right",A={"bottom-right":"br","top-right":"tr","top-left":"tl","bottom-left":"bl"}[y]||"br";m[A]||(m[A]=c("div","tk-btns "+A,g));let T=m[A];A==="br"&&v.row!=null&&(T=m["br"+v.row]||(m["br"+v.row]=c("div","tk-row",m.br)));const R=c("div","tk-btn"+(v.size?" "+v.size:""),T,(v.icon?`<i>${v.icon}</i>`:"")+(v.label?`<span>${v.label}</span>`:"")),P={down:!1,pid:null,el:R};_.buttons[v.id||v.label]=P;const E=L=>{if(L.preventDefault(),L.stopPropagation(),v.toggle){P.down=!P.down,R.classList.toggle("on",P.down),v.key&&(P.down?s:r)(v.key),(P.down?v.onDown:v.onUp)&&(P.down?v.onDown:v.onUp)();return}if(P.pid===null){P.pid=L.pointerId;try{R.setPointerCapture(L.pointerId)}catch{}if(P.down=!0,R.classList.add("on"),v.key&&(v.tap?o(v.key):s(v.key)),v.onDown&&v.onDown(),navigator.vibrate&&v.buzz!==!1)try{navigator.vibrate(8)}catch{}}},w=L=>{v.toggle||L.pointerId!==P.pid||(P.pid=null,P.down=!1,R.classList.remove("on"),v.key&&!v.tap&&r(v.key),v.onUp&&v.onUp())};R.addEventListener("pointerdown",E),R.addEventListener("pointerup",w),R.addEventListener("pointercancel",w),R.addEventListener("contextmenu",L=>L.preventDefault())}let p=null;if(f.landscape&&(p=c("div","tk-rot",document.body,`<b>⟳</b><div>${f.rotateText||"휴대폰을 가로로 돌려 주세요"}<br><small style="opacity:.6">Rotate your phone</small></div><button type="button">그래도 세로로 하기</button>`),p.querySelector("button").addEventListener("click",()=>p.classList.remove("need"))),f.preventGestures!==!1){document.documentElement.style.overscrollBehavior="none",document.addEventListener("gesturestart",y=>y.preventDefault());let v=0;document.addEventListener("touchend",y=>{const A=Date.now();A-v<300&&!(y.target.closest&&y.target.closest("input,textarea,select,a,button"))&&y.preventDefault(),v=A},{passive:!1})}_.show=v=>{if(_.visible=v,g.classList.toggle("tk-off",!v),p&&p.classList.toggle("need",v&&!!f.landscape),!v){for(const y of Object.values(_.sticks))y.reset&&y.reset();for(const[y]of e)n("keyup",y);e.clear();for(const y of Object.values(_.buttons))y.down=!1,y.pid=null,y.el.classList.remove("on")}},_.stick=v=>_.sticks[v]||{x:0,y:0,on:!1},_.pressed=v=>!!(_.buttons[v]&&_.buttons[v].down),_.destroy=()=>{_.show(!1),g.remove(),p&&p.remove()};const x=f.show||"auto";return _.show(x==="always"||x==="auto"&&a()),x==="auto"&&!_.visible&&addEventListener("touchstart",function v(){removeEventListener("touchstart",v),_.show(!0)},{passive:!0}),_}function h(f,g,_,m,p){const x=new MouseEvent(g,Object.assign({clientX:_,clientY:m,bubbles:!0,cancelable:!0,button:0,buttons:g==="mouseup"?0:1},p||{}));(f||document.elementFromPoint(_,m)||document).dispatchEvent(x)}function d(){const f=new Set,g=window.AudioContext||window.webkitAudioContext;if(g&&!g.__tk){const m=function(...p){const x=new g(...p);return f.add(x),x};m.prototype=g.prototype,m.__tk=!0,window.AudioContext=m,window.webkitAudioContext&&(window.webkitAudioContext=m)}const _=()=>{for(const m of f)m.state==="suspended"&&m.resume().catch(()=>{})};addEventListener("pointerdown",_,!0),addEventListener("touchend",_,!0)}window.TouchKit={create:u,press:s,release:r,tapKey:o,sendKey:n,mouse:h,unlockAudio:d,isTouch:a}})();const xt=16,du=4,Xt=128,fu=7,jn=52,bl=xt*xt*Xt;function dn(i,t,e){return(i<<du|e)<<fu|t}const wl=32,pu=1200,Wr=Object.freeze({SURVIVAL:0,CREATIVE:1}),b=Object.freeze({AIR:0,STONE:1,GRASS:2,DIRT:3,COBBLESTONE:4,OAK_PLANKS:5,BEDROCK:6,WATER:7,LAVA:8,SAND:9,GRAVEL:10,GOLD_ORE:11,IRON_ORE:12,COAL_ORE:13,DIAMOND_ORE:14,OAK_LOG:15,OAK_LEAVES:16,GLASS:17,SANDSTONE:18,CRAFTING_TABLE:19,FURNACE:20,FURNACE_LIT:21,TORCH:22,SNOW_BLOCK:23,SNOWY_GRASS:24,BRICKS:25,GLOWSTONE:26,CACTUS:27,TALL_GRASS:28,POPPY:29,DANDELION:30,BIRCH_LOG:31,BIRCH_LEAVES:32,BIRCH_PLANKS:33,OBSIDIAN:34,ICE:35,STONE_BRICKS:36,WOOL:37,BOOKSHELF:38,TNT:39,MOSSY_COBBLESTONE:40,DEAD_BUSH:41,SPRUCE_LOG:42,SPRUCE_LEAVES:43,SPRUCE_PLANKS:44,CHEST:45,CLAY:46,OAK_SAPLING:47,IRON_BLOCK:48,GOLD_BLOCK:49,DIAMOND_BLOCK:50,LAPIS_ORE:51,LAPIS_BLOCK:52,BROWN_MUSHROOM:53,RED_MUSHROOM:54,PUMPKIN:55,COAL_BLOCK:56,SMOOTH_STONE:57,RED_WOOL:58,BLUE_WOOL:59,GREEN_WOOL:60,YELLOW_WOOL:61,BLACK_WOOL:62,WATER_FLOW_1:71,WATER_FLOW_2:72,WATER_FLOW_3:73,WATER_FLOW_4:74,WATER_FLOW_5:75,WATER_FLOW_6:76,WATER_FLOW_7:77,WATER_FALL:78,LAVA_FLOW_2:79,LAVA_FLOW_4:80,LAVA_FLOW_6:81,LAVA_FALL:82}),Y=Object.freeze({STICK:256,COAL:257,IRON_INGOT:258,GOLD_INGOT:259,DIAMOND:260,APPLE:261,PORKCHOP:262,COOKED_PORKCHOP:263,BEEF:264,COOKED_BEEF:265,CHICKEN:266,COOKED_CHICKEN:267,ROTTEN_FLESH:268,BONE:269,GUNPOWDER:270,FLINT:271,ARROW:272,FEATHER:273,MUTTON:274,COOKED_MUTTON:275,LAPIS:276,BREAD:277,WHEAT:278,BOW:279,WOODEN_PICKAXE:280,WOODEN_AXE:281,WOODEN_SHOVEL:282,WOODEN_SWORD:283,STONE_PICKAXE:284,STONE_AXE:285,STONE_SHOVEL:286,STONE_SWORD:287,IRON_PICKAXE:288,IRON_AXE:289,IRON_SHOVEL:290,IRON_SWORD:291,DIAMOND_PICKAXE:292,DIAMOND_AXE:293,DIAMOND_SHOVEL:294,DIAMOND_SWORD:295,GOLDEN_APPLE:296,LEATHER:297,BUCKET:298,WATER_BUCKET:299,LAVA_BUCKET:300}),ps=[];function ft(i,t,e,n={}){const s={id:i,name:t,tex:typeof e=="string"?{all:e}:e,render:"cube",solid:!0,opaque:!0,opacity:0,light:0,hardness:1,tool:null,minTier:0,drops:null,replaceable:!1,cullSame:!1,sound:"stone",interact:null,plant:!1,gravity:!1,flammable:!1,...n};return(s.render==="cross"||s.render==="torch"||s.render==="none")&&(s.solid=n.solid??!1,s.opaque=!1),s.render==="liquid"&&(s.solid=!1,s.opaque=!1),ps[i]=s,s}ft(b.AIR,"Air","none",{render:"none",solid:!1,opaque:!1,replaceable:!0,hardness:0});ft(b.STONE,"Stone","stone",{hardness:1.5,tool:"pickaxe",minTier:1,drops:[{id:b.COBBLESTONE,count:1}]});ft(b.GRASS,"Grass Block",{top:"grass_top",bottom:"dirt",side:"grass_side"},{hardness:.6,tool:"shovel",drops:[{id:b.DIRT,count:1}],sound:"grass"});ft(b.DIRT,"Dirt","dirt",{hardness:.5,tool:"shovel",sound:"gravel"});ft(b.COBBLESTONE,"Cobblestone","cobblestone",{hardness:2,tool:"pickaxe",minTier:1});ft(b.OAK_PLANKS,"Oak Planks","planks_oak",{hardness:2,tool:"axe",sound:"wood",flammable:!0});ft(b.BEDROCK,"Bedrock","bedrock",{hardness:-1});ft(b.WATER,"Water","water",{render:"liquid",opacity:2,hardness:-1,replaceable:!0,cullSame:!0,drops:[]});ft(b.LAVA,"Lava","lava",{render:"liquid",opacity:0,light:15,hardness:-1,replaceable:!0,cullSame:!0,drops:[]});ft(b.SAND,"Sand","sand",{hardness:.5,tool:"shovel",sound:"sand",gravity:!0});ft(b.GRAVEL,"Gravel","gravel",{hardness:.6,tool:"shovel",sound:"gravel",gravity:!0,drops:[{id:Y.FLINT,count:1,chance:.1,else:b.GRAVEL}]});ft(b.GOLD_ORE,"Gold Ore","gold_ore",{hardness:3,tool:"pickaxe",minTier:3});ft(b.IRON_ORE,"Iron Ore","iron_ore",{hardness:3,tool:"pickaxe",minTier:2});ft(b.COAL_ORE,"Coal Ore","coal_ore",{hardness:3,tool:"pickaxe",minTier:1,drops:[{id:Y.COAL,count:1}]});ft(b.DIAMOND_ORE,"Diamond Ore","diamond_ore",{hardness:3,tool:"pickaxe",minTier:3,drops:[{id:Y.DIAMOND,count:1}]});ft(b.OAK_LOG,"Oak Log",{top:"log_oak_top",bottom:"log_oak_top",side:"log_oak"},{hardness:2,tool:"axe",sound:"wood",flammable:!0});ft(b.OAK_LEAVES,"Oak Leaves","leaves_oak",{opaque:!1,opacity:1,hardness:.2,sound:"grass",flammable:!0,drops:[{id:b.OAK_SAPLING,count:1,chance:.06},{id:Y.APPLE,count:1,chance:.02}]});ft(b.GLASS,"Glass","glass",{opaque:!1,opacity:0,cullSame:!0,hardness:.3,sound:"glass",drops:[]});ft(b.SANDSTONE,"Sandstone",{top:"sandstone_top",bottom:"sandstone_bottom",side:"sandstone_side"},{hardness:.8,tool:"pickaxe",minTier:1});ft(b.CRAFTING_TABLE,"Crafting Table",{top:"crafting_table_top",bottom:"planks_oak",north:"crafting_table_front",south:"crafting_table_front",east:"crafting_table_side",west:"crafting_table_side"},{hardness:2.5,tool:"axe",sound:"wood",interact:"crafting",flammable:!0});ft(b.FURNACE,"Furnace",{top:"furnace_top",bottom:"furnace_top",north:"furnace_front",south:"furnace_side",east:"furnace_side",west:"furnace_side"},{hardness:3.5,tool:"pickaxe",minTier:1,interact:"furnace"});ft(b.FURNACE_LIT,"Furnace",{top:"furnace_top",bottom:"furnace_top",north:"furnace_front_lit",south:"furnace_side",east:"furnace_side",west:"furnace_side"},{hardness:3.5,tool:"pickaxe",minTier:1,interact:"furnace",light:13,drops:[{id:b.FURNACE,count:1}]});ft(b.TORCH,"Torch","torch",{render:"torch",light:14,hardness:0,sound:"wood",plant:!1});ft(b.SNOW_BLOCK,"Snow Block","snow",{hardness:.2,tool:"shovel",sound:"snow"});ft(b.SNOWY_GRASS,"Snowy Grass",{top:"snow",bottom:"dirt",side:"grass_side_snow"},{hardness:.6,tool:"shovel",drops:[{id:b.DIRT,count:1}],sound:"snow"});ft(b.BRICKS,"Bricks","bricks",{hardness:2,tool:"pickaxe",minTier:1});ft(b.GLOWSTONE,"Glowstone","glowstone",{hardness:.3,light:15,sound:"glass"});ft(b.CACTUS,"Cactus",{top:"cactus_top",bottom:"cactus_bottom",side:"cactus_side"},{opaque:!1,opacity:0,hardness:.4,sound:"cloth",plant:!0,damage:1});ft(b.TALL_GRASS,"Grass","tallgrass",{render:"cross",hardness:0,replaceable:!0,sound:"grass",plant:!0,drops:[]});ft(b.POPPY,"Poppy","flower_red",{render:"cross",hardness:0,replaceable:!0,sound:"grass",plant:!0});ft(b.DANDELION,"Dandelion","flower_yellow",{render:"cross",hardness:0,replaceable:!0,sound:"grass",plant:!0});ft(b.BIRCH_LOG,"Birch Log",{top:"log_birch_top",bottom:"log_birch_top",side:"log_birch"},{hardness:2,tool:"axe",sound:"wood",flammable:!0});ft(b.BIRCH_LEAVES,"Birch Leaves","leaves_birch",{opaque:!1,opacity:1,hardness:.2,sound:"grass",flammable:!0,drops:[{id:b.OAK_SAPLING,count:1,chance:.05}]});ft(b.BIRCH_PLANKS,"Birch Planks","planks_birch",{hardness:2,tool:"axe",sound:"wood",flammable:!0});ft(b.OBSIDIAN,"Obsidian","obsidian",{hardness:50,tool:"pickaxe",minTier:4});ft(b.ICE,"Ice","ice",{opaque:!1,opacity:1,cullSame:!0,hardness:.5,tool:"pickaxe",sound:"glass",drops:[],slippery:!0});ft(b.STONE_BRICKS,"Stone Bricks","stone_bricks",{hardness:1.5,tool:"pickaxe",minTier:1});ft(b.WOOL,"White Wool","wool",{hardness:.8,sound:"cloth",flammable:!0});ft(b.BOOKSHELF,"Bookshelf",{top:"planks_oak",bottom:"planks_oak",side:"bookshelf"},{hardness:1.5,tool:"axe",sound:"wood",flammable:!0});ft(b.TNT,"TNT",{top:"tnt_top",bottom:"tnt_bottom",side:"tnt_side"},{hardness:0,sound:"grass",interact:"tnt"});ft(b.MOSSY_COBBLESTONE,"Mossy Cobblestone","mossy_cobblestone",{hardness:2,tool:"pickaxe",minTier:1});ft(b.DEAD_BUSH,"Dead Bush","dead_bush",{render:"cross",hardness:0,replaceable:!0,sound:"grass",plant:!0,drops:[{id:Y.STICK,count:1,chance:.5}]});ft(b.SPRUCE_LOG,"Spruce Log",{top:"log_spruce_top",bottom:"log_spruce_top",side:"log_spruce"},{hardness:2,tool:"axe",sound:"wood",flammable:!0});ft(b.SPRUCE_LEAVES,"Spruce Leaves","leaves_spruce",{opaque:!1,opacity:1,hardness:.2,sound:"grass",flammable:!0,drops:[{id:b.OAK_SAPLING,count:1,chance:.05}]});ft(b.SPRUCE_PLANKS,"Spruce Planks","planks_spruce",{hardness:2,tool:"axe",sound:"wood",flammable:!0});ft(b.CHEST,"Chest",{top:"chest_top",bottom:"chest_top",north:"chest_front",south:"chest_side",east:"chest_side",west:"chest_side"},{hardness:2.5,tool:"axe",sound:"wood",interact:"chest",flammable:!0});ft(b.CLAY,"Clay","clay",{hardness:.6,tool:"shovel",sound:"gravel"});ft(b.OAK_SAPLING,"Oak Sapling","sapling",{render:"cross",hardness:0,sound:"grass",plant:!0,sapling:!0});ft(b.IRON_BLOCK,"Block of Iron","iron_block",{hardness:5,tool:"pickaxe",minTier:2,sound:"metal"});ft(b.GOLD_BLOCK,"Block of Gold","gold_block",{hardness:3,tool:"pickaxe",minTier:3,sound:"metal"});ft(b.DIAMOND_BLOCK,"Block of Diamond","diamond_block",{hardness:5,tool:"pickaxe",minTier:3,sound:"metal"});ft(b.LAPIS_ORE,"Lapis Lazuli Ore","lapis_ore",{hardness:3,tool:"pickaxe",minTier:2,drops:[{id:Y.LAPIS,count:4,extra:4}]});ft(b.LAPIS_BLOCK,"Block of Lapis","lapis_block",{hardness:3,tool:"pickaxe",minTier:2});ft(b.BROWN_MUSHROOM,"Brown Mushroom","mushroom_brown",{render:"cross",hardness:0,replaceable:!0,sound:"grass",plant:!0,light:1});ft(b.RED_MUSHROOM,"Red Mushroom","mushroom_red",{render:"cross",hardness:0,replaceable:!0,sound:"grass",plant:!0});ft(b.PUMPKIN,"Pumpkin",{top:"pumpkin_top",bottom:"pumpkin_top",north:"pumpkin_face",south:"pumpkin_side",east:"pumpkin_side",west:"pumpkin_side"},{hardness:1,tool:"axe",sound:"wood"});ft(b.COAL_BLOCK,"Block of Coal","coal_block",{hardness:5,tool:"pickaxe",minTier:1});ft(b.SMOOTH_STONE,"Smooth Stone","smooth_stone",{hardness:2,tool:"pickaxe",minTier:1});ft(b.RED_WOOL,"Red Wool","wool_red",{hardness:.8,sound:"cloth",flammable:!0});ft(b.BLUE_WOOL,"Blue Wool","wool_blue",{hardness:.8,sound:"cloth",flammable:!0});ft(b.GREEN_WOOL,"Green Wool","wool_green",{hardness:.8,sound:"cloth",flammable:!0});ft(b.YELLOW_WOOL,"Yellow Wool","wool_yellow",{hardness:.8,sound:"cloth",flammable:!0});ft(b.BLACK_WOOL,"Black Wool","wool_black",{hardness:.8,sound:"cloth",flammable:!0});for(let i=1;i<=7;i++)ft(70+i,"Water","water",{render:"liquid",opacity:2,hardness:-1,replaceable:!0,cullSame:!0,drops:[],hidden:!0});ft(b.WATER_FALL,"Water","water",{render:"liquid",opacity:2,hardness:-1,replaceable:!0,cullSame:!0,drops:[],hidden:!0});for(const i of[b.LAVA_FLOW_2,b.LAVA_FLOW_4,b.LAVA_FLOW_6,b.LAVA_FALL])ft(i,"Lava","lava",{render:"liquid",opacity:0,light:15,hardness:-1,replaceable:!0,cullSame:!0,drops:[],hidden:!0});const Vs=ps;ps.length;function de(i){return ps[i]||ps[0]}const ai=new Uint8Array(256),vn=new Uint8Array(256),li=new Uint8Array(256),Nr=new Uint8Array(256),wn=new Uint8Array(256),ci=new Uint8Array(256),jt=new Uint8Array(256),rn=new Uint8Array(256),hi=new Uint8Array(256),Ws=new Uint8Array(256);jt[b.WATER]=1;rn[b.WATER]=8;hi[b.WATER]=1;for(let i=1;i<=7;i++)jt[70+i]=1,rn[70+i]=i;jt[b.WATER_FALL]=1;rn[b.WATER_FALL]=8;Ws[b.WATER_FALL]=1;jt[b.LAVA]=2;rn[b.LAVA]=8;hi[b.LAVA]=1;jt[b.LAVA_FLOW_2]=2;rn[b.LAVA_FLOW_2]=2;jt[b.LAVA_FLOW_4]=2;rn[b.LAVA_FLOW_4]=4;jt[b.LAVA_FLOW_6]=2;rn[b.LAVA_FLOW_6]=6;jt[b.LAVA_FALL]=2;rn[b.LAVA_FALL]=8;Ws[b.LAVA_FALL]=1;function Vi(i,t,e){if(i===1)return e?b.WATER_FALL:t>=8?b.WATER:70+Math.max(1,Math.min(7,t));if(e)return b.LAVA_FALL;if(t>=8)return b.LAVA;const n=Math.max(2,Math.min(6,t&-2));return n===2?b.LAVA_FLOW_2:n===4?b.LAVA_FLOW_4:b.LAVA_FLOW_6}function $o(i){if(Ws[i])return 1;const t=rn[i];return t>=8?.875:(t+.5)/9}const on=Object.freeze({NONE:0,CUBE:1,CROSS:2,TORCH:3,LIQUID:4}),mu={none:0,cube:1,cross:2,torch:3,liquid:4};for(let i=0;i<256;i++){const t=ps[i];t&&(ai[i]=t.opaque?1:0,vn[i]=t.solid?1:0,li[i]=t.opaque?15:t.opacity,Nr[i]=t.light,wn[i]=mu[t.render],ci[i]=t.replaceable?1:0)}function mn(i,t){const e=i.tex;if(e.all)return e.all;switch(t){case 2:return e.top;case 3:return e.bottom;case 0:return e.east||e.side;case 1:return e.west||e.side;case 4:return e.south||e.side;case 5:return e.north||e.side}return e.side}function Ri(i,t){return i+32768<<16|t+32768&65535}class gu{constructor(t,e){this.cx=t,this.cz=e,this.key=Ri(t,e),this.blocks=new Uint8Array(bl),this.light=new Uint8Array(bl),this.heightMap=new Uint8Array(xt*xt),this.generated=!1,this.lit=!1,this.dirty=!1,this.meshed=!1,this.mesh=null,this.edits=new Map,this.blockEntities=new Map,this.lastAccess=0,this.nonAirCount=0}getBlock(t,e,n){return e<0||e>=Xt?0:this.blocks[dn(t,e,n)]}setBlock(t,e,n,s){e<0||e>=Xt||(this.blocks[dn(t,e,n)]=s)}getSky(t,e,n){return e>=Xt?15:e<0?0:this.light[dn(t,e,n)]>>4}getBlockLight(t,e,n){return e<0||e>=Xt?0:this.light[dn(t,e,n)]&15}setSky(t,e,n,s){const r=dn(t,e,n);this.light[r]=this.light[r]&15|s<<4}setBlockLight(t,e,n,s){const r=dn(t,e,n);this.light[r]=this.light[r]&240|s}computeHeightMap(){const t=this.blocks;for(let e=0;e<xt;e++)for(let n=0;n<xt;n++){const s=(e<<4|n)<<7;let r=0;for(let o=Xt-1;o>=0;o--)if(li[t[s+o]]>0){r=o+1;break}this.heightMap[e<<4|n]=r}}updateHeightAt(t,e){const n=(t<<4|e)<<7,s=this.blocks;let r=0;for(let a=Xt-1;a>=0;a--)if(li[s[n+a]]>0){r=a+1;break}const o=this.heightMap[t<<4|e];return this.heightMap[t<<4|e]=r,o}height(t,e){return this.heightMap[t<<4|e]}serializeEdits(){if(this.edits.size===0&&this.blockEntities.size===0)return null;const t=[];for(const[n,s]of this.edits)t.push(n,s);const e=[];for(const[n,s]of this.blockEntities)e.push([n,s]);return{e:t,be:e}}}function di(i){let t=i>>>0;return function(){t=t+1831565813>>>0;let e=t;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}}function _u(i){let t=2166136261;for(let e=0;e<i.length;e++)t^=i.charCodeAt(e),t=Math.imul(t,16777619)>>>0;return t>>>0}function xi(i,t,e){let n=Math.imul(i|0,374761393)+Math.imul(t|0,668265263)+Math.imul(e|0,1274126177)|0;return n=Math.imul(n^n>>>13,1103515245),n^=n>>>16,(n>>>0)/4294967296}function vu(i,t,e,n){let s=Math.imul(i|0,374761393)+Math.imul(t|0,1911520717)+Math.imul(e|0,668265263)+Math.imul(n|0,1274126177)|0;return s=Math.imul(s^s>>>13,1103515245),s^=s>>>16,(s>>>0)/4294967296}const yi=[[1,1,0],[-1,1,0],[1,-1,0],[-1,-1,0],[1,0,1],[-1,0,1],[1,0,-1],[-1,0,-1],[0,1,1],[0,-1,1],[0,1,-1],[0,-1,-1]],xu=.5*(Math.sqrt(3)-1),Ls=(3-Math.sqrt(3))/6,yu=1/3,Ln=1/6;class Dn{constructor(t=0){const e=di(t),n=new Uint8Array(256);for(let s=0;s<256;s++)n[s]=s;for(let s=255;s>0;s--){const r=Math.floor(e()*(s+1)),o=n[s];n[s]=n[r],n[r]=o}this.perm=new Uint8Array(512),this.permMod12=new Uint8Array(512);for(let s=0;s<512;s++)this.perm[s]=n[s&255],this.permMod12[s]=this.perm[s]%12}noise2(t,e){const n=this.perm,s=this.permMod12;let r=0,o=0,a=0;const l=(t+e)*xu,c=Math.floor(t+l),u=Math.floor(e+l),h=(c+u)*Ls,d=t-(c-h),f=e-(u-h);let g,_;d>f?(g=1,_=0):(g=0,_=1);const m=d-g+Ls,p=f-_+Ls,x=d-1+2*Ls,v=f-1+2*Ls,y=c&255,A=u&255;let T=.5-d*d-f*f;if(T>=0){const E=yi[s[y+n[A]]];T*=T,r=T*T*(E[0]*d+E[1]*f)}let R=.5-m*m-p*p;if(R>=0){const E=yi[s[y+g+n[A+_]]];R*=R,o=R*R*(E[0]*m+E[1]*p)}let P=.5-x*x-v*v;if(P>=0){const E=yi[s[y+1+n[A+1]]];P*=P,a=P*P*(E[0]*x+E[1]*v)}return 70.14*(r+o+a)}noise3(t,e,n){const s=this.perm,r=this.permMod12;let o=0,a=0,l=0,c=0;const u=(t+e+n)*yu,h=Math.floor(t+u),d=Math.floor(e+u),f=Math.floor(n+u),g=(h+d+f)*Ln,_=t-(h-g),m=e-(d-g),p=n-(f-g);let x,v,y,A,T,R;_>=m?m>=p?(x=1,v=0,y=0,A=1,T=1,R=0):_>=p?(x=1,v=0,y=0,A=1,T=0,R=1):(x=0,v=0,y=1,A=1,T=0,R=1):m<p?(x=0,v=0,y=1,A=0,T=1,R=1):_<p?(x=0,v=1,y=0,A=0,T=1,R=1):(x=0,v=1,y=0,A=1,T=1,R=0);const P=_-x+Ln,E=m-v+Ln,w=p-y+Ln,L=_-A+2*Ln,k=m-T+2*Ln,V=p-R+2*Ln,Z=_-1+3*Ln,q=m-1+3*Ln,G=p-1+3*Ln,X=h&255,B=d&255,st=f&255;let at=.6-_*_-m*m-p*p;if(at>=0){const Nt=yi[r[X+s[B+s[st]]]];at*=at,o=at*at*(Nt[0]*_+Nt[1]*m+Nt[2]*p)}let gt=.6-P*P-E*E-w*w;if(gt>=0){const Nt=yi[r[X+x+s[B+v+s[st+y]]]];gt*=gt,a=gt*gt*(Nt[0]*P+Nt[1]*E+Nt[2]*w)}let Ot=.6-L*L-k*k-V*V;if(Ot>=0){const Nt=yi[r[X+A+s[B+T+s[st+R]]]];Ot*=Ot,l=Ot*Ot*(Nt[0]*L+Nt[1]*k+Nt[2]*V)}let Kt=.6-Z*Z-q*q-G*G;if(Kt>=0){const Nt=yi[r[X+1+s[B+1+s[st+1]]]];Kt*=Kt,c=Kt*Kt*(Nt[0]*Z+Nt[1]*q+Nt[2]*G)}return 32*(o+a+l+c)}fbm2(t,e,n,s=2,r=.5){let o=0,a=1,l=1,c=0;for(let u=0;u<n;u++)o+=a*this.noise2(t*l,e*l),c+=a,a*=r,l*=s;return o/c}fbm3(t,e,n,s,r=2,o=.5){let a=0,l=1,c=1,u=0;for(let h=0;h<s;h++)a+=l*this.noise3(t*c,e*c,n*c),u+=l,l*=o,c*=r;return a/u}}const qt=Object.freeze({OCEAN:0,BEACH:1,PLAINS:2,FOREST:3,BIRCH_FOREST:4,DESERT:5,TAIGA:6,MOUNTAINS:7,SNOWY_PEAKS:8}),Mu=["Ocean","Beach","Plains","Forest","Birch Forest","Desert","Taiga","Mountains","Snowy Peaks"];function Su(i,t,e){const n=Math.min(1,Math.max(0,(e-i)/(t-i)));return n*n*(3-2*n)}const ri=4,Mn=xt/ri+1,Wi=Xt/ri+1;class Eu{constructor(t){this.seed=t|0,this.nCont=new Dn(t+1),this.nEro=new Dn(t+2),this.nMount=new Dn(t+3),this.nMask=new Dn(t+4),this.nDetail=new Dn(t+5),this.nTemp=new Dn(t+6),this.nHum=new Dn(t+7),this.nCave=new Dn(t+8),this.nWorm1=new Dn(t+9),this.nWorm2=new Dn(t+10),this._cave=new Float32Array(Mn*Mn*Wi),this._worm1=new Float32Array(Mn*Mn*Wi),this._worm2=new Float32Array(Mn*Mn*Wi)}terrain(t,e){const n=this.nCont.fbm2(t*.0016,e*.0016,4),s=this.nEro.fbm2(t*.007+100,e*.007,3),r=this.nMask.noise2(t*.0022+300,e*.0022-200),o=Su(.12,.55,r);let a=1-Math.abs(this.nMount.noise2(t*.0045,e*.0045));a=a*a;const l=this.nDetail.noise2(t*.035,e*.035),c=this.nTemp.fbm2(t*.0025+500,e*.0025,2)-o*.35,u=this.nHum.fbm2(t*.0025,e*.0025+500,2);let h=jn+3+n*16+s*7*(.5+.5*n)+l*2.5;n<-.2&&(h-=(-.2-n)*30),h+=o*(18+a*44),h=Math.max(6,Math.min(Xt-8,h));const d=Math.floor(h);let f;return d<jn-1?f=qt.OCEAN:d<=jn+1&&o<.4?f=qt.BEACH:o>.5&&d>=90?f=qt.SNOWY_PEAKS:o>.5?f=qt.MOUNTAINS:c<-.28?f=qt.TAIGA:c>.3&&u<.1?f=qt.DESERT:u>.22?f=c<.05&&u>.45?qt.BIRCH_FOREST:qt.FOREST:f=qt.PLAINS,{height:d,biome:f,temp:c,hum:u,mask:o}}height(t,e){return this.terrain(t,e).height}_sampleCaves(t,e){const n=t*xt,s=e*xt;let r=0;for(let o=0;o<Mn;o++)for(let a=0;a<Mn;a++)for(let l=0;l<Wi;l++){const c=n+o*ri,u=l*ri,h=s+a*ri;this._cave[r]=this.nCave.fbm3(c*.022,u*.03,h*.022,2),this._worm1[r]=this.nWorm1.noise3(c*.018,u*.026,h*.018),this._worm2[r]=this.nWorm2.noise3(c*.018+40,u*.026,h*.018-40),r++}}_caveAt(t,e,n,s){const r=e/ri,o=n/ri,a=s/ri,l=r|0,c=o|0,u=a|0,h=r-l,d=o-c,f=a-u,g=Math.min(l+1,Mn-1),_=Math.min(c+1,Wi-1),m=Math.min(u+1,Mn-1),p=(P,E,w)=>(P*Mn+w)*Wi+E,x=t[p(l,c,u)]*(1-h)+t[p(g,c,u)]*h,v=t[p(l,_,u)]*(1-h)+t[p(g,_,u)]*h,y=t[p(l,c,m)]*(1-h)+t[p(g,c,m)]*h,A=t[p(l,_,m)]*(1-h)+t[p(g,_,m)]*h,T=x*(1-d)+v*d,R=y*(1-d)+A*d;return T*(1-f)+R*f}generateChunk(t){const e=t.blocks,n=t.cx,s=t.cz,r=n*xt,o=s*xt,a=this.seed,l=new Array(xt*xt);this._sampleCaves(n,s);for(let c=0;c<xt;c++)for(let u=0;u<xt;u++){const h=r+c,d=o+u,f=this.terrain(h,d);l[c<<4|u]=f;const g=f.height,_=(c<<4|u)<<7,m=xi(h,d,a);let p=b.GRASS,x=b.DIRT,v=3+(m*2|0),y=b.STONE,A=0;switch(f.biome){case qt.OCEAN:{const T=xi(h,d,a+11);g>jn-6?(p=b.SAND,x=b.SAND):T<.25?(p=b.CLAY,x=b.CLAY):T<.55?(p=b.GRAVEL,x=b.GRAVEL):(p=b.SAND,x=b.SAND);break}case qt.BEACH:p=b.SAND,x=b.SAND,y=b.SANDSTONE,A=3;break;case qt.DESERT:p=b.SAND,x=b.SAND,y=b.SANDSTONE,A=4;break;case qt.TAIGA:p=b.SNOWY_GRASS,x=b.DIRT;break;case qt.SNOWY_PEAKS:p=b.SNOW_BLOCK,x=b.SNOW_BLOCK,v=2;break;case qt.MOUNTAINS:g>78+m*6?(p=b.STONE,x=b.STONE,v=0):f.temp<-.2&&(p=b.SNOWY_GRASS);break}for(let T=0;T<Xt;T++){let R=b.AIR;if(T===0)R=b.BEDROCK;else if(T<g){if(T<4&&vu(h,T,d,a)<(4-T)/4?R=b.BEDROCK:T>=g-1?R=p:T>=g-1-v?R=x:T>=g-1-v-A?R=y:R=b.STONE,(R===b.STONE||R!==b.BEDROCK&&T<g-5)&&T>2&&T<g-4){let E=this._caveAt(this._cave,c,T,u)>.62-Math.max(0,(20-T)*.004);if(!E){const w=this._caveAt(this._worm1,c,T,u);if(Math.abs(w)<.075){const L=this._caveAt(this._worm2,c,T,u);E=Math.abs(L)<.075}}E&&(R=T<=10?b.LAVA:b.AIR)}}else T<jn&&(R=b.WATER,T===jn-1&&f.temp<-.32&&(R=b.ICE));e[_+T]=R}}this._placeOres(t),this._placeTrees(t,l),this._placeVegetation(t,l),t.computeHeightMap(),t.generated=!0}_placeOres(t){const e=di(xi(t.cx,t.cz,this.seed+99)*4294967295),n=t.blocks,s=(r,o,a,l,c,u=b.STONE)=>{for(let h=0;h<o;h++){let d=e()*xt|0,f=e()*xt|0,g=a+(e()*(l-a)|0);for(let _=0;_<c;_++){if(d>=0&&d<xt&&f>=0&&f<xt&&g>0&&g<Xt){const p=dn(d,g,f);n[p]===u&&(n[p]=r)}const m=e();m<.33?d+=e()<.5?1:-1:m<.66?f+=e()<.5?1:-1:g+=e()<.5?1:-1}}};s(b.DIRT,4,10,100,14),s(b.GRAVEL,3,10,100,12),s(b.COAL_ORE,14,5,110,9),s(b.IRON_ORE,10,4,66,6),s(b.GOLD_ORE,3,4,34,5),s(b.LAPIS_ORE,2,8,30,5),s(b.DIAMOND_ORE,2,2,16,5)}treeCandidates(t,e){const n=di(xi(t,e,this.seed+7)*4294967295),s=this.terrain(t*xt+8,e*xt+8);let r=0;switch(s.biome){case qt.FOREST:r=6+(n()*4|0);break;case qt.BIRCH_FOREST:r=5+(n()*3|0);break;case qt.TAIGA:r=5+(n()*3|0);break;case qt.PLAINS:r=n()<.35?1:0;break;case qt.MOUNTAINS:r=n()<.5?2:0;break;case qt.DESERT:r=0;break;default:r=0}const o=[];for(let a=0;a<r;a++){const l=t*xt+(n()*xt|0),c=e*xt+(n()*xt|0),u=this.terrain(l,c);if(u.height<jn+1)continue;let h="oak";const d=n();switch(u.biome){case qt.FOREST:h=d<.15?"birch":d<.2?"bigoak":"oak";break;case qt.BIRCH_FOREST:h=d<.8?"birch":"oak";break;case qt.TAIGA:h="spruce";break;case qt.MOUNTAINS:if(u.height>78)continue;h=d<.6?"spruce":"oak";break;case qt.PLAINS:h=d<.3?"bigoak":"oak";break;case qt.BEACH:case qt.OCEAN:case qt.DESERT:case qt.SNOWY_PEAKS:continue}o.push({x:l,z:c,y:u.height,type:h})}return o}treeBlocks(t){const e=di(xi(t.x,t.z,this.seed+31)*4294967295),n=[],{x:s,y:r,z:o}=t;let a=b.OAK_LOG,l=b.OAK_LEAVES;if(t.type==="birch"&&(a=b.BIRCH_LOG,l=b.BIRCH_LEAVES),t.type==="spruce"&&(a=b.SPRUCE_LOG,l=b.SPRUCE_LEAVES),t.type==="spruce"){const f=7+(e()*4|0);for(let _=0;_<f;_++)n.push([s,r+_,o,a]);n.push([s,r+f,o,l]);let g=1;for(let _=r+f-1;_>=r+2;_--){const m=g;for(let p=-m;p<=m;p++)for(let x=-m;x<=m;x++)p===0&&x===0||Math.abs(p)===m&&Math.abs(x)===m&&m>1||n.push([s+p,_,o+x,l]);if(g=g===1?2:1,_-r<=3&&e()<.5)break}return n}const c=t.type==="bigoak",u=c?6+(e()*3|0):4+(e()*3|0);for(let f=0;f<u;f++)n.push([s,r+f,o,a]);const h=r+u-1,d=c?3:2;for(let f=h-2;f<=h+1;f++){const g=f>=h?1:d;for(let _=-g;_<=g;_++)for(let m=-g;m<=g;m++)_===0&&m===0&&f<=h||Math.abs(_)===g&&Math.abs(m)===g&&(f===h+1||e()<.5)||n.push([s+_,f,o+m,l])}if(c)for(let f=0;f<3;f++){const g=s+(e()*5|0)-2,_=o+(e()*5|0)-2,m=h-3-(e()*2|0);for(let p=-1;p<=1;p++)for(let x=-1;x<=1;x++)n.push([g+p,m,_+x,l]);n.push([g,m+1,_,l])}return n}_placeTrees(t,e){const n=t.blocks,s=t.cx*xt,r=t.cz*xt;for(let o=-1;o<=1;o++)for(let a=-1;a<=1;a++){const l=this.treeCandidates(t.cx+o,t.cz+a);for(const c of l){const u=c.x-s,h=c.z-r;if(u>=0&&u<xt&&h>=0&&h<xt){const d=n[dn(u,c.y-1,h)];if(d!==b.GRASS&&d!==b.SNOWY_GRASS&&d!==b.DIRT)continue}for(const[d,f,g,_]of this.treeBlocks(c)){const m=d-s,p=g-r;if(m<0||m>=xt||p<0||p>=xt||f<0||f>=Xt)continue;const x=dn(m,f,p),v=n[x];_===b.OAK_LEAVES||_===b.BIRCH_LEAVES||_===b.SPRUCE_LEAVES?v===b.AIR&&(n[x]=_):(v===b.AIR||v===b.OAK_LEAVES||v===b.BIRCH_LEAVES||v===b.SPRUCE_LEAVES||v===b.TALL_GRASS)&&(n[x]=_)}}}}_placeVegetation(t,e){const n=t.blocks,s=t.cx*xt,r=t.cz*xt,o=this.seed;for(let a=0;a<xt;a++)for(let l=0;l<xt;l++){const c=e[a<<4|l],u=c.height;if(u<1||u>=Xt-3)continue;const h=dn(a,u-1,l),d=dn(a,u,l),f=n[h];if(n[d]!==b.AIR)continue;const g=xi(s+a,r+l,o+5);if(f===b.GRASS){const _=c.biome===qt.PLAINS?.22:c.biome===qt.FOREST||c.biome===qt.BIRCH_FOREST?.1:.04;g<_?n[d]=b.TALL_GRASS:g<_+.012?n[d]=b.POPPY:g<_+.024?n[d]=b.DANDELION:g<_+.026&&c.biome===qt.PLAINS?n[d]=b.PUMPKIN:g>.995&&c.biome!==qt.PLAINS&&(n[d]=g>.9975?b.RED_MUSHROOM:b.BROWN_MUSHROOM)}else if(f===b.SAND&&c.biome===qt.DESERT)if(g<.012){const _=1+(xi(s+a,r+l,o+6)*3|0);for(let m=0;m<_;m++)n[dn(a,u+m,l)]=b.CACTUS}else g<.03&&(n[d]=b.DEAD_BUSH);else f===b.SNOWY_GRASS&&g<.03&&(n[d]=b.TALL_GRASS)}}findSpawn(){let t=null;for(let e=0;e<1200&&!t;e+=8)for(let n=0;n<16;n++){const s=n/16*Math.PI*2,r=Math.round(Math.cos(s)*e),o=Math.round(Math.sin(s)*e),a=this.terrain(r,o);if(a.height>=jn+2&&a.height<78&&(a.biome===qt.PLAINS||a.biome===qt.FOREST||a.biome===qt.BIRCH_FOREST)){t={x:r+.5,y:a.height,z:o+.5};break}}return t||{x:.5,y:80,z:.5}}}const Bn=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]],Tl=3;class bu{constructor(t){this.world=t,this.queue=[],this.removeQueue=[]}_chunk(t,e){return this.world.chunkAt(t,e)}getSky(t,e,n){if(e>=Xt)return 15;if(e<0)return 0;const s=this._chunk(t,n);return s?s.light[((t&15)<<4|n&15)<<7|e]>>4:0}getBlockLight(t,e,n){if(e<0||e>=Xt)return 0;const s=this._chunk(t,n);return s?s.light[((t&15)<<4|n&15)<<7|e]&15:0}propagate(t,e){const n=this.world;let s=0;for(;s<t.length;){const r=t[s],o=t[s+1],a=t[s+2];s+=3;const l=n.chunkAt(r,a);if(!l)continue;const c=((r&15)<<4|a&15)<<7|o,u=e?l.light[c]>>4:l.light[c]&15;if(!(u<=1))for(let h=0;h<6;h++){const d=r+Bn[h][0],f=o+Bn[h][1],g=a+Bn[h][2];if(f<0||f>=Xt)continue;const _=d>>4===r>>4&&g>>4===a>>4?l:n.chunkAt(d,g);if(!_)continue;const m=((d&15)<<4|g&15)<<7|f,p=li[_.blocks[m]];if(p>=15)continue;let x;if(e&&h===Tl&&u===15?x=15-p:x=u-(p>1?p:1),x<=0)continue;const v=_.light[m];(e?v>>4:v&15)>=x||(_.light[m]=e?v&15|x<<4:v&240|x,n.markLightChanged(_,d&15,g&15),t.push(d,f,g))}}t.length=0}removeLight(t,e,n,s){const r=this.world,o=r.chunkAt(t,n);if(!o)return;const a=((t&15)<<4|n&15)<<7|e,l=o.light[a],c=s?l>>4:l&15;if(c===0)return;o.light[a]=s?l&15:l&240,r.markLightChanged(o,t&15,n&15);const u=this.removeQueue,h=this.queue;u.length=0,u.push(t,e,n,c);let d=0;for(;d<u.length;){const f=u[d],g=u[d+1],_=u[d+2],m=u[d+3];d+=4;for(let p=0;p<6;p++){const x=f+Bn[p][0],v=g+Bn[p][1],y=_+Bn[p][2];if(v<0||v>=Xt)continue;const A=r.chunkAt(x,y);if(!A)continue;const T=((x&15)<<4|y&15)<<7|v,R=A.light[T],P=s?R>>4:R&15;P!==0&&(P<m||s&&p===Tl&&m===15&&P===15?(A.light[T]=s?R&15:R&240,r.markLightChanged(A,x&15,y&15),u.push(x,v,y,P)):h.push(x,v,y))}}u.length=0,this.propagate(h,s)}refill(t,e,n,s){const r=this.queue;for(let o=0;o<6;o++){const a=t+Bn[o][0],l=e+Bn[o][1],c=n+Bn[o][2];if(l<0)continue;if(l>=Xt){if(s){const h=this.world.chunkAt(t,n);if(h){const d=((t&15)<<4|n&15)<<7|e,f=li[h.blocks[d]];f<15&&(h.light[d]=h.light[d]&15|15-f<<4,this.world.markLightChanged(h,t&15,n&15),r.push(t,e,n))}}continue}(s?this.getSky(a,l,c):this.getBlockLight(a,l,c))>1&&r.push(a,l,c)}this.propagate(r,s)}onBlockChanged(t,e,n,s,r){const o=li[s],a=li[r],l=Nr[s],c=Nr[r];if((l>0||a>o)&&this.removeLight(t,e,n,!1),c>0){const u=this.world.chunkAt(t,n);if(u){const h=((t&15)<<4|n&15)<<7|e;u.light[h]=u.light[h]&240|c,this.world.markLightChanged(u,t&15,n&15),this.queue.push(t,e,n),this.propagate(this.queue,!1)}}else a<o&&this.refill(t,e,n,!1);a>o?this.removeLight(t,e,n,!0):a<o&&this.refill(t,e,n,!0)}initChunk(t){const e=this.world,n=t.cx,s=t.cz,r=n*xt,o=s*xt,a=t.light,l=t.blocks,c=t.heightMap,u=this.queue;u.length=0;for(let d=0;d<xt;d++)for(let f=0;f<xt;f++){const g=(d<<4|f)<<7,_=c[d<<4|f];for(let p=_;p<Xt;p++)a[g+p]=a[g+p]&15|240;let m=15;for(let p=_-1;p>=0;p--){const x=li[l[g+p]];if(x>=15||(m-=x>1?x:1,m<=0))break;a[g+p]=a[g+p]&15|m<<4,u.push(r+d,p,o+f)}}const h=(d,f)=>{if(d>=0&&d<xt&&f>=0&&f<xt)return c[d<<4|f];const g=e.chunkAt(r+d,o+f);return!g||!g.lit?-1:g.heightMap[(d&15)<<4|f&15]};for(let d=0;d<xt;d++)for(let f=0;f<xt;f++){const g=c[d<<4|f];let _=g;const m=h(d+1,f),p=h(d-1,f),x=h(d,f+1),v=h(d,f-1);if(m>_&&(_=m),p>_&&(_=p),x>_&&(_=x),v>_&&(_=v),_>g)for(let y=g;y<_;y++)u.push(r+d,y,o+f)}this._pushNeighbourBorders(t,!0,u),this.propagate(u,!0);for(let d=0;d<xt;d++)for(let f=0;f<xt;f++){const g=(d<<4|f)<<7;for(let _=0;_<Xt;_++){const m=Nr[l[g+_]];m>0&&(a[g+_]=a[g+_]&240|m,u.push(r+d,_,o+f))}}this._pushNeighbourBorders(t,!1,u),this.propagate(u,!1),t.lit=!0}_pushNeighbourBorders(t,e,n){const s=this.world,r=t.cx*xt,o=t.cz*xt,a=[[r-1,o,0,1],[r+xt,o,0,1],[r,o-1,1,0],[r,o+xt,1,0]];for(const[l,c,u,h]of a){const d=s.chunkAt(l,c);if(!(!d||!d.lit))for(let f=0;f<xt;f++){const g=l+u*f,_=c+h*f,m=((g&15)<<4|_&15)<<7;for(let p=0;p<Xt;p++){const x=d.light[m+p];(e?x>>4:x&15)>1&&n.push(g,p,_)}}}}}const Al=(()=>{const i=[];for(let e=-20;e<=20;e++)for(let n=-20;n<=20;n++)i.push([e,n,e*e+n*n]);return i.sort((e,n)=>e[2]-n[2]),i})();class Xr{constructor(t){this.seed=t|0,this.gen=new Eu(this.seed),this.light=new bu(this),this.chunks=new Map,this._lastChunk=null,this._lastCx=NaN,this._lastCz=NaN,this.dirtyChunks=new Set,this.savedEdits=new Map,this.blockListeners=[],this.scheduled=[],this.time=360,this.onChunkGeometry=null,this.onChunkUnload=null,this.stats={generated:0,meshed:0}}chunkAt(t,e){const n=t>>4,s=e>>4;if(n===this._lastCx&&s===this._lastCz)return this._lastChunk;const r=this.chunks.get(Ri(n,s))||null;return this._lastCx=n,this._lastCz=s,this._lastChunk=r,r}getChunk(t,e){return this.chunks.get(Ri(t,e))||null}_invalidateCache(){this._lastCx=NaN,this._lastCz=NaN,this._lastChunk=null}getBlock(t,e,n){if(e<0||e>=Xt)return 0;const s=this.chunkAt(t,n);return s?s.blocks[((t&15)<<4|n&15)<<7|e]:0}getBlockForPhysics(t,e,n){if(e<0)return b.BEDROCK;if(e>=Xt)return 0;const s=this.chunkAt(t,n);return s?s.blocks[((t&15)<<4|n&15)<<7|e]:b.STONE}isSolid(t,e,n){return vn[this.getBlock(t,e,n)]===1}getSky(t,e,n){if(e>=Xt)return 15;if(e<0)return 0;const s=this.chunkAt(t,n);return s?s.light[((t&15)<<4|n&15)<<7|e]>>4:15}getBlockLight(t,e,n){if(e<0||e>=Xt)return 0;const s=this.chunkAt(t,n);return s?s.light[((t&15)<<4|n&15)<<7|e]&15:0}surfaceY(t,e){const n=this.chunkAt(t,e);if(!n)return-1;const s=((t&15)<<4|e&15)<<7;for(let r=Xt-1;r>=0;r--)if(n.blocks[s+r]!==0)return r;return-1}setBlock(t,e,n,s,r=null){if(e<0||e>=Xt)return!1;const o=this.chunkAt(t,n);if(!o)return!1;const a=t&15,l=n&15,c=(a<<4|l)<<7|e,u=o.blocks[c];if(u===s)return!1;o.blocks[c]=s,o.edits.set(c,s),o.blockEntities.has(c)&&de(u).interact!==de(s).interact&&o.blockEntities.delete(c),o.updateHeightAt(a,l),this.light.onBlockChanged(t,e,n,u,s),this.markDirtyAt(o,a,l);for(const h of this.blockListeners)h(t,e,n,u,s,r);return!0}onBlockChanged(t){this.blockListeners.push(t)}markDirtyAt(t,e,n){t.dirty=!0,this.dirtyChunks.add(t),e===0?this._markNeighbour(t.cx-1,t.cz):e===15&&this._markNeighbour(t.cx+1,t.cz),n===0?this._markNeighbour(t.cx,t.cz-1):n===15&&this._markNeighbour(t.cx,t.cz+1),e===0&&n===0?this._markNeighbour(t.cx-1,t.cz-1):e===0&&n===15?this._markNeighbour(t.cx-1,t.cz+1):e===15&&n===0?this._markNeighbour(t.cx+1,t.cz-1):e===15&&n===15&&this._markNeighbour(t.cx+1,t.cz+1)}markLightChanged(t,e,n){this.markDirtyAt(t,e,n)}_markNeighbour(t,e){const n=this.chunks.get(Ri(t,e));n&&(n.dirty=!0,this.dirtyChunks.add(n))}getBlockEntity(t,e,n){const s=this.chunkAt(t,n);return s&&s.blockEntities.get(((t&15)<<4|n&15)<<7|e)||null}setBlockEntity(t,e,n,s){const r=this.chunkAt(t,n);if(!r)return;const o=((t&15)<<4|n&15)<<7|e;s?r.blockEntities.set(o,s):r.blockEntities.delete(o)}schedule(t,e,n,s,r){this.scheduled.push({x:t,y:e,z:n,time:this.time+s,type:r})}ensureChunk(t,e){const n=Ri(t,e);let s=this.chunks.get(n);if(s)return s;s=new gu(t,e),this.gen.generateChunk(s);const r=this.savedEdits.get(n);r&&(this._applyEdits(s,r),this.savedEdits.delete(n)),this.chunks.set(n,s),this._invalidateCache(),this.light.initChunk(s),s.dirty=!0,this.dirtyChunks.add(s);for(let o=-1;o<=1;o++)for(let a=-1;a<=1;a++)(o||a)&&this._markNeighbour(t+o,e+a);return this.stats.generated++,s}_applyEdits(t,e){const n=e.e||[];for(let s=0;s<n.length;s+=2)t.blocks[n[s]]=n[s+1],t.edits.set(n[s],n[s+1]);for(const[s,r]of e.be||[])t.blockEntities.set(s,r);t.computeHeightMap()}unloadChunk(t){const e=t.serializeEdits();e&&this.savedEdits.set(t.key,e),this.onChunkUnload&&this.onChunkUnload(t),this.chunks.delete(t.key),this.dirtyChunks.delete(t),this._invalidateCache()}updateLoading(t,e,n,s){const r=Math.floor(t)>>4,o=Math.floor(e)>>4,a=performance.now(),l=(n+.5)*(n+.5);let c=!0;for(let h=0;h<Al.length;h++){const[d,f,g]=Al[h];if(g>l)break;const _=Ri(r+d,o+f);if(!this.chunks.has(_)){if(performance.now()-a>s){c=!1;break}this.ensureChunk(r+d,o+f)}}const u=(n+2.5)*(n+2.5);for(const h of this.chunks.values()){const d=h.cx-r,f=h.cz-o;d*d+f*f>u&&this.unloadChunk(h)}return c}_neighboursLit(t){for(let e=-1;e<=1;e++)for(let n=-1;n<=1;n++){if(!e&&!n)continue;const s=this.chunks.get(Ri(t.cx+e,t.cz+n));if(!s||!s.lit)return!1}return!0}updateMeshing(t,e,n,s,r=1e9){if(this.dirtyChunks.size===0)return 0;const o=Math.floor(t)>>4,a=Math.floor(e)>>4,l=performance.now(),c=[];for(const h of this.dirtyChunks){const d=h.cx-o,f=h.cz-a,g=d*d+f*f;g>r*r||c.push([g,h])}c.sort((h,d)=>h[0]-d[0]);let u=0;for(const[,h]of c){if(!this._neighboursLit(h))continue;const d=s(h);if(h.dirty=!1,h.meshed=!0,this.dirtyChunks.delete(h),this.onChunkGeometry&&this.onChunkGeometry(h,d),u++,this.stats.meshed++,performance.now()-l>n)break}return u}raycast(t,e,n,s,r,o,a,l=!1){let c=Math.floor(t),u=Math.floor(e),h=Math.floor(n);const d=s>0?1:s<0?-1:0,f=r>0?1:r<0?-1:0,g=o>0?1:o<0?-1:0,_=d?Math.abs(1/s):1/0,m=f?Math.abs(1/r):1/0,p=g?Math.abs(1/o):1/0;let x=d?d>0?(c+1-t)/s:(c-t)/s:1/0,v=f?f>0?(u+1-e)/r:(u-e)/r:1/0,y=g?g>0?(h+1-n)/o:(h-n)/o:1/0,A=-1,T=0;for(let R=0;R<256;R++){const P=this.getBlock(c,u,h);if(P!==0&&(l||wn[P]!==on.LIQUID)){A===-1&&(A=2);const E=[[1,0,0],[-1,0,0],[0,1,0],[0,-1,0],[0,0,1],[0,0,-1]][A];return{x:c,y:u,z:h,id:P,face:A,px:c+E[0],py:u+E[1],pz:h+E[2],dist:T}}if(x<v&&x<y){if(T=x,T>a)return null;c+=d,x+=_,A=d>0?1:0}else if(v<y){if(T=v,T>a)return null;u+=f,v+=m,A=f>0?3:2}else{if(T=y,T>a)return null;h+=g,y+=p,A=g>0?5:4}if(u<0||u>=Xt)return null}return null}serialize(){const t={};for(const[e,n]of this.savedEdits)t[e]=n;for(const e of this.chunks.values()){const n=e.serializeEdits();n&&(t[e.key]=n)}return{seed:this.seed,time:this.time,chunks:t,scheduled:this.scheduled.map(e=>({...e,time:e.time-this.time}))}}static deserialize(t){const e=new Xr(t.seed);e.time=t.time??e.time;for(const n of Object.keys(t.chunks||{}))e.savedEdits.set(Number(n),t.chunks[n]);if(t.scheduled)for(const n of t.scheduled)e.scheduled.push({...n,time:e.time+n.time});return e}}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Va="180",wu=0,Rl=1,Tu=2,ch=1,Au=2,qn=3,Nn=0,qe=1,Ye=2,fi=0,hs=1,Cl=2,Ll=3,Dl=4,Ru=5,Pi=100,Cu=101,Lu=102,Du=103,Pu=104,Iu=200,Uu=201,Ou=202,Nu=203,Zo=204,jo=205,Fu=206,ku=207,Bu=208,zu=209,Gu=210,Hu=211,Vu=212,Wu=213,Xu=214,Jo=0,Qo=1,ta=2,ms=3,ea=4,na=5,ia=6,sa=7,Wa=0,qu=1,Ku=2,pi=0,Yu=1,$u=2,Zu=3,ju=4,Ju=5,Qu=6,td=7,hh=300,gs=301,_s=302,ra=303,oa=304,no=306,qr=1e3,Yn=1001,aa=1002,we=1003,ed=1004,zs=1005,In=1006,lo=1007,Ui=1008,Tn=1009,uh=1010,dh=1011,Xs=1012,Xa=1013,Ni=1014,Un=1015,js=1016,qa=1017,Ka=1018,qs=1020,fh=35902,ph=35899,mh=1021,gh=1022,gn=1023,Ks=1026,Ys=1027,Ya=1028,$a=1029,_h=1030,Za=1031,ja=1033,Fr=33776,kr=33777,Br=33778,zr=33779,la=35840,ca=35841,ha=35842,ua=35843,da=36196,fa=37492,pa=37496,ma=37808,ga=37809,_a=37810,va=37811,xa=37812,ya=37813,Ma=37814,Sa=37815,Ea=37816,ba=37817,wa=37818,Ta=37819,Aa=37820,Ra=37821,Ca=36492,La=36494,Da=36495,Pa=36283,Ia=36284,Ua=36285,Oa=36286,nd=3200,id=3201,vh=0,sd=1,Kn="",un="srgb",vs="srgb-linear",Kr="linear",ae="srgb",Xi=7680,Pl=519,rd=512,od=513,ad=514,xh=515,ld=516,cd=517,hd=518,ud=519,Il=35044,Na=35048,Yr="300 es",On=2e3,$r=2001;class bs{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){const n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){const n=this._listeners;if(n===void 0)return;const s=n[t];if(s!==void 0){const r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){const e=this._listeners;if(e===void 0)return;const n=e[t.type];if(n!==void 0){t.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,t);t.target=null}}}const Ie=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Ul=1234567;const us=Math.PI/180,$s=180/Math.PI;function ws(){const i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ie[i&255]+Ie[i>>8&255]+Ie[i>>16&255]+Ie[i>>24&255]+"-"+Ie[t&255]+Ie[t>>8&255]+"-"+Ie[t>>16&15|64]+Ie[t>>24&255]+"-"+Ie[e&63|128]+Ie[e>>8&255]+"-"+Ie[e>>16&255]+Ie[e>>24&255]+Ie[n&255]+Ie[n>>8&255]+Ie[n>>16&255]+Ie[n>>24&255]).toLowerCase()}function $t(i,t,e){return Math.max(t,Math.min(e,i))}function Ja(i,t){return(i%t+t)%t}function dd(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function fd(i,t,e){return i!==t?(e-i)/(t-i):0}function Hs(i,t,e){return(1-e)*i+e*t}function pd(i,t,e,n){return Hs(i,t,1-Math.exp(-e*n))}function md(i,t=1){return t-Math.abs(Ja(i,t*2)-t)}function gd(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function _d(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function vd(i,t){return i+Math.floor(Math.random()*(t-i+1))}function xd(i,t){return i+Math.random()*(t-i)}function yd(i){return i*(.5-Math.random())}function Md(i){i!==void 0&&(Ul=i);let t=Ul+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function Sd(i){return i*us}function Ed(i){return i*$s}function bd(i){return(i&i-1)===0&&i!==0}function wd(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Td(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function Ad(i,t,e,n,s){const r=Math.cos,o=Math.sin,a=r(e/2),l=o(e/2),c=r((t+n)/2),u=o((t+n)/2),h=r((t-n)/2),d=o((t-n)/2),f=r((n-t)/2),g=o((n-t)/2);switch(s){case"XYX":i.set(a*u,l*h,l*d,a*c);break;case"YZY":i.set(l*d,a*u,l*h,a*c);break;case"ZXZ":i.set(l*h,l*d,a*u,a*c);break;case"XZX":i.set(a*u,l*g,l*f,a*c);break;case"YXY":i.set(l*f,a*u,l*g,a*c);break;case"ZYZ":i.set(l*g,l*f,a*u,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function as(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function ze(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}const Rd={DEG2RAD:us,RAD2DEG:$s,generateUUID:ws,clamp:$t,euclideanModulo:Ja,mapLinear:dd,inverseLerp:fd,lerp:Hs,damp:pd,pingpong:md,smoothstep:gd,smootherstep:_d,randInt:vd,randFloat:xd,randFloatSpread:yd,seededRandom:Md,degToRad:Sd,radToDeg:Ed,isPowerOfTwo:bd,ceilPowerOfTwo:wd,floorPowerOfTwo:Td,setQuaternionFromProperEuler:Ad,normalize:ze,denormalize:as};class ee{constructor(t=0,e=0){ee.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){const e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=$t(this.x,t.x,e.x),this.y=$t(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=$t(this.x,t,e),this.y=$t(this.y,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar($t(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos($t(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){const n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,o=this.y-t.y;return this.x=r*n-o*s+t.x,this.y=r*s+o*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class Ts{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,o,a){let l=n[s+0],c=n[s+1],u=n[s+2],h=n[s+3];const d=r[o+0],f=r[o+1],g=r[o+2],_=r[o+3];if(a===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h;return}if(a===1){t[e+0]=d,t[e+1]=f,t[e+2]=g,t[e+3]=_;return}if(h!==_||l!==d||c!==f||u!==g){let m=1-a;const p=l*d+c*f+u*g+h*_,x=p>=0?1:-1,v=1-p*p;if(v>Number.EPSILON){const A=Math.sqrt(v),T=Math.atan2(A,p*x);m=Math.sin(m*T)/A,a=Math.sin(a*T)/A}const y=a*x;if(l=l*m+d*y,c=c*m+f*y,u=u*m+g*y,h=h*m+_*y,m===1-a){const A=1/Math.sqrt(l*l+c*c+u*u+h*h);l*=A,c*=A,u*=A,h*=A}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=h}static multiplyQuaternionsFlat(t,e,n,s,r,o){const a=n[s],l=n[s+1],c=n[s+2],u=n[s+3],h=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return t[e]=a*g+u*h+l*f-c*d,t[e+1]=l*g+u*d+c*h-a*f,t[e+2]=c*g+u*f+a*d-l*h,t[e+3]=u*g-a*h-l*d-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){const n=t._x,s=t._y,r=t._z,o=t._order,a=Math.cos,l=Math.sin,c=a(n/2),u=a(s/2),h=a(r/2),d=l(n/2),f=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"YXZ":this._x=d*u*h+c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"ZXY":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h-d*f*g;break;case"ZYX":this._x=d*u*h-c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h+d*f*g;break;case"YZX":this._x=d*u*h+c*f*g,this._y=c*f*h+d*u*g,this._z=c*u*g-d*f*h,this._w=c*u*h-d*f*g;break;case"XZY":this._x=d*u*h-c*f*g,this._y=c*f*h-d*u*g,this._z=c*u*g+d*f*h,this._w=c*u*h+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){const n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){const e=t.elements,n=e[0],s=e[4],r=e[8],o=e[1],a=e[5],l=e[9],c=e[2],u=e[6],h=e[10],d=n+a+h;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(o-s)*f}else if(n>a&&n>h){const f=2*Math.sqrt(1+n-a-h);this._w=(u-l)/f,this._x=.25*f,this._y=(s+o)/f,this._z=(r+c)/f}else if(a>h){const f=2*Math.sqrt(1+a-n-h);this._w=(r-c)/f,this._x=(s+o)/f,this._y=.25*f,this._z=(l+u)/f}else{const f=2*Math.sqrt(1+h-n-a);this._w=(o-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs($t(this.dot(t),-1,1)))}rotateTowards(t,e){const n=this.angleTo(t);if(n===0)return this;const s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){const n=t._x,s=t._y,r=t._z,o=t._w,a=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+o*a+s*c-r*l,this._y=s*u+o*l+r*a-n*c,this._z=r*u+o*c+n*l-s*a,this._w=o*u-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);const n=this._x,s=this._y,r=this._z,o=this._w;let a=o*t._w+n*t._x+s*t._y+r*t._z;if(a<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,a=-a):this.copy(t),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-e;return this._w=f*o+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}const c=Math.sqrt(l),u=Math.atan2(c,a),h=Math.sin((1-e)*u)/c,d=Math.sin(e*u)/c;return this._w=o*h+this._w*d,this._x=n*h+this._x*d,this._y=s*h+this._y*d,this._z=r*h+this._z*d,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){const t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class O{constructor(t=0,e=0,n=0){O.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Ol.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Ol.setFromAxisAngle(t,e))}applyMatrix3(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=t.elements,o=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(t){const e=this.x,n=this.y,s=this.z,r=t.x,o=t.y,a=t.z,l=t.w,c=2*(o*s-a*n),u=2*(a*e-r*s),h=2*(r*n-o*e);return this.x=e+l*c+o*h-a*u,this.y=n+l*u+a*c-r*h,this.z=s+l*h+r*u-o*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){const e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=$t(this.x,t.x,e.x),this.y=$t(this.y,t.y,e.y),this.z=$t(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=$t(this.x,t,e),this.y=$t(this.y,t,e),this.z=$t(this.z,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar($t(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){const n=t.x,s=t.y,r=t.z,o=e.x,a=e.y,l=e.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(t){const e=t.lengthSq();if(e===0)return this.set(0,0,0);const n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return co.copy(this).projectOnVector(t),this.sub(co)}reflect(t){return this.sub(co.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){const e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;const n=this.dot(t)/e;return Math.acos($t(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){const e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){const s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){const e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const co=new O,Ol=new Ts;class Ht{constructor(t,e,n,s,r,o,a,l,c){Ht.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c)}set(t,e,n,s,r,o,a,l,c){const u=this.elements;return u[0]=t,u[1]=s,u[2]=a,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=o,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){const e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],u=n[4],h=n[7],d=n[2],f=n[5],g=n[8],_=s[0],m=s[3],p=s[6],x=s[1],v=s[4],y=s[7],A=s[2],T=s[5],R=s[8];return r[0]=o*_+a*x+l*A,r[3]=o*m+a*v+l*T,r[6]=o*p+a*y+l*R,r[1]=c*_+u*x+h*A,r[4]=c*m+u*v+h*T,r[7]=c*p+u*y+h*R,r[2]=d*_+f*x+g*A,r[5]=d*m+f*v+g*T,r[8]=d*p+f*y+g*R,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8];return e*o*u-e*a*c-n*r*u+n*a*l+s*r*c-s*o*l}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=u*o-a*c,d=a*l-u*r,f=c*r-o*l,g=e*h+n*d+s*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const _=1/g;return t[0]=h*_,t[1]=(s*c-u*n)*_,t[2]=(a*n-s*o)*_,t[3]=d*_,t[4]=(u*e-s*l)*_,t[5]=(s*r-a*e)*_,t[6]=f*_,t[7]=(n*l-c*e)*_,t[8]=(o*e-n*r)*_,this}transpose(){let t;const e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){const e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+t,-s*c,s*l,-s*(-c*o+l*a)+a+e,0,0,1),this}scale(t,e){return this.premultiply(ho.makeScale(t,e)),this}rotate(t){return this.premultiply(ho.makeRotation(-t)),this}translate(t,e){return this.premultiply(ho.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}}const ho=new Ht;function yh(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Zr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Cd(){const i=Zr("canvas");return i.style.display="block",i}const Nl={};function Zs(i){i in Nl||(Nl[i]=!0,console.warn(i))}function Ld(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}const Fl=new Ht().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),kl=new Ht().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Dd(){const i={enabled:!0,workingColorSpace:vs,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ae&&(s.r=Zn(s.r),s.g=Zn(s.g),s.b=Zn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ae&&(s.r=ds(s.r),s.g=ds(s.g),s.b=ds(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Kn?Kr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Zs("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Zs("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[vs]:{primaries:t,whitePoint:n,transfer:Kr,toXYZ:Fl,fromXYZ:kl,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:un},outputColorSpaceConfig:{drawingBufferColorSpace:un}},[un]:{primaries:t,whitePoint:n,transfer:ae,toXYZ:Fl,fromXYZ:kl,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:un}}}),i}const Qt=Dd();function Zn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function ds(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let qi;class Pd{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{qi===void 0&&(qi=Zr("canvas")),qi.width=t.width,qi.height=t.height;const s=qi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=qi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){const e=Zr("canvas");e.width=t.width,e.height=t.height;const n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);const s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Zn(r[o]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){const e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Zn(e[n]/255)*255):e[n]=Zn(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}}let Id=0;class Qa{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:Id++}),this.uuid=ws(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){const e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(uo(s[o].image)):r.push(uo(s[o]))}else r=uo(s);n.url=r}return e||(t.images[this.uuid]=n),n}}function uo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Pd.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let Ud=0;const fo=new O;class ke extends bs{constructor(t=ke.DEFAULT_IMAGE,e=ke.DEFAULT_MAPPING,n=Yn,s=Yn,r=In,o=Ui,a=gn,l=Tn,c=ke.DEFAULT_ANISOTROPY,u=Kn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Ud++}),this.uuid=ws(),this.name="",this.source=new Qa(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new ee(0,0),this.repeat=new ee(1,1),this.center=new ee(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ht,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(fo).x}get height(){return this.source.getSize(fo).y}get depth(){return this.source.getSize(fo).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==hh)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case qr:t.x=t.x-Math.floor(t.x);break;case Yn:t.x=t.x<0?0:1;break;case aa:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case qr:t.y=t.y-Math.floor(t.y);break;case Yn:t.y=t.y<0?0:1;break;case aa:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}}ke.DEFAULT_IMAGE=null;ke.DEFAULT_MAPPING=hh;ke.DEFAULT_ANISOTROPY=1;class Me{constructor(t=0,e=0,n=0,s=1){Me.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){const e=this.x,n=this.y,s=this.z,r=this.w,o=t.elements;return this.x=o[0]*e+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*e+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*e+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*e+o[7]*n+o[11]*s+o[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);const e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r;const l=t.elements,c=l[0],u=l[4],h=l[8],d=l[1],f=l[5],g=l[9],_=l[2],m=l[6],p=l[10];if(Math.abs(u-d)<.01&&Math.abs(h-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(u+d)<.1&&Math.abs(h+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;const v=(c+1)/2,y=(f+1)/2,A=(p+1)/2,T=(u+d)/4,R=(h+_)/4,P=(g+m)/4;return v>y&&v>A?v<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(v),s=T/n,r=R/n):y>A?y<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(y),n=T/s,r=P/s):A<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(A),n=R/r,s=P/r),this.set(n,s,r,e),this}let x=Math.sqrt((m-g)*(m-g)+(h-_)*(h-_)+(d-u)*(d-u));return Math.abs(x)<.001&&(x=1),this.x=(m-g)/x,this.y=(h-_)/x,this.z=(d-u)/x,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){const e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=$t(this.x,t.x,e.x),this.y=$t(this.y,t.y,e.y),this.z=$t(this.z,t.z,e.z),this.w=$t(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=$t(this.x,t,e),this.y=$t(this.y,t,e),this.z=$t(this.z,t,e),this.w=$t(this.w,t,e),this}clampLength(t,e){const n=this.length();return this.divideScalar(n||1).multiplyScalar($t(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class Od extends bs{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:In,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Me(0,0,t,e),this.scissorTest=!1,this.viewport=new Me(0,0,t,e);const s={width:t,height:e,depth:n.depth},r=new ke(s);this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){const e={minFilter:In,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;const s=Object.assign({},t.textures[e].image);this.textures[e].source=new Qa(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Fi extends Od{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}}class tl extends ke{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=we,this.minFilter=we,this.wrapR=Yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}}class Nd extends ke{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=we,this.minFilter=we,this.wrapR=Yn,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class ki{constructor(t=new O(1/0,1/0,1/0),e=new O(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(Sn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(Sn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){const n=Sn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);const n=t.geometry;if(n!==void 0){const r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)t.isMesh===!0?t.getVertexPosition(o,Sn):Sn.fromBufferAttribute(r,o),Sn.applyMatrix4(t.matrixWorld),this.expandByPoint(Sn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),rr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),rr.copy(n.boundingBox)),rr.applyMatrix4(t.matrixWorld),this.union(rr)}const s=t.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,Sn),Sn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ds),or.subVectors(this.max,Ds),Ki.subVectors(t.a,Ds),Yi.subVectors(t.b,Ds),$i.subVectors(t.c,Ds),Jn.subVectors(Yi,Ki),Qn.subVectors($i,Yi),Mi.subVectors(Ki,$i);let e=[0,-Jn.z,Jn.y,0,-Qn.z,Qn.y,0,-Mi.z,Mi.y,Jn.z,0,-Jn.x,Qn.z,0,-Qn.x,Mi.z,0,-Mi.x,-Jn.y,Jn.x,0,-Qn.y,Qn.x,0,-Mi.y,Mi.x,0];return!po(e,Ki,Yi,$i,or)||(e=[1,0,0,0,1,0,0,0,1],!po(e,Ki,Yi,$i,or))?!1:(ar.crossVectors(Jn,Qn),e=[ar.x,ar.y,ar.z],po(e,Ki,Yi,$i,or))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,Sn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(Sn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(zn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),zn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),zn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),zn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),zn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),zn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),zn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),zn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(zn),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}}const zn=[new O,new O,new O,new O,new O,new O,new O,new O],Sn=new O,rr=new ki,Ki=new O,Yi=new O,$i=new O,Jn=new O,Qn=new O,Mi=new O,Ds=new O,or=new O,ar=new O,Si=new O;function po(i,t,e,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){Si.fromArray(i,r);const a=s.x*Math.abs(Si.x)+s.y*Math.abs(Si.y)+s.z*Math.abs(Si.z),l=t.dot(Si),c=e.dot(Si),u=n.dot(Si);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>a)return!1}return!0}const Fd=new ki,Ps=new O,mo=new O;class Bi{constructor(t=new O,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){const n=this.center;e!==void 0?n.copy(e):Fd.setFromPoints(t).getCenter(n);let s=0;for(let r=0,o=t.length;r<o;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){const e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){const n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Ps.subVectors(t,this.center);const e=Ps.lengthSq();if(e>this.radius*this.radius){const n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Ps,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(mo.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Ps.copy(t.center).add(mo)),this.expandByPoint(Ps.copy(t.center).sub(mo))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}}const Gn=new O,go=new O,lr=new O,ti=new O,_o=new O,cr=new O,vo=new O;class el{constructor(t=new O,e=new O(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Gn)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);const n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){const e=Gn.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Gn.copy(this.origin).addScaledVector(this.direction,e),Gn.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){go.copy(t).add(e).multiplyScalar(.5),lr.copy(e).sub(t).normalize(),ti.copy(this.origin).sub(go);const r=t.distanceTo(e)*.5,o=-this.direction.dot(lr),a=ti.dot(this.direction),l=-ti.dot(lr),c=ti.lengthSq(),u=Math.abs(1-o*o);let h,d,f,g;if(u>0)if(h=o*l-a,d=o*a-l,g=r*u,h>=0)if(d>=-g)if(d<=g){const _=1/u;h*=_,d*=_,f=h*(h+o*d+2*a)+d*(o*h+d+2*l)+c}else d=r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d=-r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;else d<=-g?(h=Math.max(0,-(-o*r+a)),d=h>0?-r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c):d<=g?(h=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(h=Math.max(0,-(o*r+a)),d=h>0?r:Math.min(Math.max(-r,-l),r),f=-h*h+d*(d+2*l)+c);else d=o>0?-r:r,h=Math.max(0,-(o*d+a)),f=-h*h+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,h),s&&s.copy(go).addScaledVector(lr,d),f}intersectSphere(t,e){Gn.subVectors(t.center,this.origin);const n=Gn.dot(this.direction),s=Gn.dot(Gn)-n*n,r=t.radius*t.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,e):this.at(a,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){const e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){const n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){const e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,o,a,l;const c=1/this.direction.x,u=1/this.direction.y,h=1/this.direction.z,d=this.origin;return c>=0?(n=(t.min.x-d.x)*c,s=(t.max.x-d.x)*c):(n=(t.max.x-d.x)*c,s=(t.min.x-d.x)*c),u>=0?(r=(t.min.y-d.y)*u,o=(t.max.y-d.y)*u):(r=(t.max.y-d.y)*u,o=(t.min.y-d.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),h>=0?(a=(t.min.z-d.z)*h,l=(t.max.z-d.z)*h):(a=(t.max.z-d.z)*h,l=(t.min.z-d.z)*h),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Gn)!==null}intersectTriangle(t,e,n,s,r){_o.subVectors(e,t),cr.subVectors(n,t),vo.crossVectors(_o,cr);let o=this.direction.dot(vo),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;ti.subVectors(this.origin,t);const l=a*this.direction.dot(cr.crossVectors(ti,cr));if(l<0)return null;const c=a*this.direction.dot(_o.cross(ti));if(c<0||l+c>o)return null;const u=-a*ti.dot(vo);return u<0?null:this.at(u/o,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class ce{constructor(t,e,n,s,r,o,a,l,c,u,h,d,f,g,_,m){ce.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,o,a,l,c,u,h,d,f,g,_,m)}set(t,e,n,s,r,o,a,l,c,u,h,d,f,g,_,m){const p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=u,p[10]=h,p[14]=d,p[3]=f,p[7]=g,p[11]=_,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ce().fromArray(this.elements)}copy(t){const e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){const e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){const e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){const e=this.elements,n=t.elements,s=1/Zi.setFromMatrixColumn(t,0).length(),r=1/Zi.setFromMatrixColumn(t,1).length(),o=1/Zi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*o,e[9]=n[9]*o,e[10]=n[10]*o,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){const e=this.elements,n=t.x,s=t.y,r=t.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),h=Math.sin(r);if(t.order==="XYZ"){const d=o*u,f=o*h,g=a*u,_=a*h;e[0]=l*u,e[4]=-l*h,e[8]=c,e[1]=f+g*c,e[5]=d-_*c,e[9]=-a*l,e[2]=_-d*c,e[6]=g+f*c,e[10]=o*l}else if(t.order==="YXZ"){const d=l*u,f=l*h,g=c*u,_=c*h;e[0]=d+_*a,e[4]=g*a-f,e[8]=o*c,e[1]=o*h,e[5]=o*u,e[9]=-a,e[2]=f*a-g,e[6]=_+d*a,e[10]=o*l}else if(t.order==="ZXY"){const d=l*u,f=l*h,g=c*u,_=c*h;e[0]=d-_*a,e[4]=-o*h,e[8]=g+f*a,e[1]=f+g*a,e[5]=o*u,e[9]=_-d*a,e[2]=-o*c,e[6]=a,e[10]=o*l}else if(t.order==="ZYX"){const d=o*u,f=o*h,g=a*u,_=a*h;e[0]=l*u,e[4]=g*c-f,e[8]=d*c+_,e[1]=l*h,e[5]=_*c+d,e[9]=f*c-g,e[2]=-c,e[6]=a*l,e[10]=o*l}else if(t.order==="YZX"){const d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*u,e[4]=_-d*h,e[8]=g*h+f,e[1]=h,e[5]=o*u,e[9]=-a*u,e[2]=-c*u,e[6]=f*h+g,e[10]=d-_*h}else if(t.order==="XZY"){const d=o*l,f=o*c,g=a*l,_=a*c;e[0]=l*u,e[4]=-h,e[8]=c*u,e[1]=d*h+_,e[5]=o*u,e[9]=f*h-g,e[2]=g*h-f,e[6]=a*u,e[10]=_*h+d}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(kd,t,Bd)}lookAt(t,e,n){const s=this.elements;return tn.subVectors(t,e),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),ei.crossVectors(n,tn),ei.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),ei.crossVectors(n,tn)),ei.normalize(),hr.crossVectors(tn,ei),s[0]=ei.x,s[4]=hr.x,s[8]=tn.x,s[1]=ei.y,s[5]=hr.y,s[9]=tn.y,s[2]=ei.z,s[6]=hr.z,s[10]=tn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){const n=t.elements,s=e.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],u=n[1],h=n[5],d=n[9],f=n[13],g=n[2],_=n[6],m=n[10],p=n[14],x=n[3],v=n[7],y=n[11],A=n[15],T=s[0],R=s[4],P=s[8],E=s[12],w=s[1],L=s[5],k=s[9],V=s[13],Z=s[2],q=s[6],G=s[10],X=s[14],B=s[3],st=s[7],at=s[11],gt=s[15];return r[0]=o*T+a*w+l*Z+c*B,r[4]=o*R+a*L+l*q+c*st,r[8]=o*P+a*k+l*G+c*at,r[12]=o*E+a*V+l*X+c*gt,r[1]=u*T+h*w+d*Z+f*B,r[5]=u*R+h*L+d*q+f*st,r[9]=u*P+h*k+d*G+f*at,r[13]=u*E+h*V+d*X+f*gt,r[2]=g*T+_*w+m*Z+p*B,r[6]=g*R+_*L+m*q+p*st,r[10]=g*P+_*k+m*G+p*at,r[14]=g*E+_*V+m*X+p*gt,r[3]=x*T+v*w+y*Z+A*B,r[7]=x*R+v*L+y*q+A*st,r[11]=x*P+v*k+y*G+A*at,r[15]=x*E+v*V+y*X+A*gt,this}multiplyScalar(t){const e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){const t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],o=t[1],a=t[5],l=t[9],c=t[13],u=t[2],h=t[6],d=t[10],f=t[14],g=t[3],_=t[7],m=t[11],p=t[15];return g*(+r*l*h-s*c*h-r*a*d+n*c*d+s*a*f-n*l*f)+_*(+e*l*f-e*c*d+r*o*d-s*o*f+s*c*u-r*l*u)+m*(+e*c*h-e*a*f-r*o*h+n*o*f+r*a*u-n*c*u)+p*(-s*a*u-e*l*h+e*a*d+s*o*h-n*o*d+n*l*u)}transpose(){const t=this.elements;let e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){const s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){const t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],o=t[4],a=t[5],l=t[6],c=t[7],u=t[8],h=t[9],d=t[10],f=t[11],g=t[12],_=t[13],m=t[14],p=t[15],x=h*m*c-_*d*c+_*l*f-a*m*f-h*l*p+a*d*p,v=g*d*c-u*m*c-g*l*f+o*m*f+u*l*p-o*d*p,y=u*_*c-g*h*c+g*a*f-o*_*f-u*a*p+o*h*p,A=g*h*l-u*_*l-g*a*d+o*_*d+u*a*m-o*h*m,T=e*x+n*v+s*y+r*A;if(T===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/T;return t[0]=x*R,t[1]=(_*d*r-h*m*r-_*s*f+n*m*f+h*s*p-n*d*p)*R,t[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*p+n*l*p)*R,t[3]=(h*l*r-a*d*r-h*s*c+n*d*c+a*s*f-n*l*f)*R,t[4]=v*R,t[5]=(u*m*r-g*d*r+g*s*f-e*m*f-u*s*p+e*d*p)*R,t[6]=(g*l*r-o*m*r-g*s*c+e*m*c+o*s*p-e*l*p)*R,t[7]=(o*d*r-u*l*r+u*s*c-e*d*c-o*s*f+e*l*f)*R,t[8]=y*R,t[9]=(g*h*r-u*_*r-g*n*f+e*_*f+u*n*p-e*h*p)*R,t[10]=(o*_*r-g*a*r+g*n*c-e*_*c-o*n*p+e*a*p)*R,t[11]=(u*a*r-o*h*r-u*n*c+e*h*c+o*n*f-e*a*f)*R,t[12]=A*R,t[13]=(u*_*s-g*h*s+g*n*d-e*_*d-u*n*m+e*h*m)*R,t[14]=(g*a*s-o*_*s-g*n*l+e*_*l+o*n*m-e*a*m)*R,t[15]=(o*h*s-u*a*s+u*n*l-e*h*l-o*n*d+e*a*d)*R,this}scale(t){const e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){const t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){const e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){const e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){const n=Math.cos(e),s=Math.sin(e),r=1-n,o=t.x,a=t.y,l=t.z,c=r*o,u=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,u*a+n,u*l-s*o,0,c*l-s*a,u*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,o){return this.set(1,n,r,0,t,1,o,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){const s=this.elements,r=e._x,o=e._y,a=e._z,l=e._w,c=r+r,u=o+o,h=a+a,d=r*c,f=r*u,g=r*h,_=o*u,m=o*h,p=a*h,x=l*c,v=l*u,y=l*h,A=n.x,T=n.y,R=n.z;return s[0]=(1-(_+p))*A,s[1]=(f+y)*A,s[2]=(g-v)*A,s[3]=0,s[4]=(f-y)*T,s[5]=(1-(d+p))*T,s[6]=(m+x)*T,s[7]=0,s[8]=(g+v)*R,s[9]=(m-x)*R,s[10]=(1-(d+_))*R,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){const s=this.elements;let r=Zi.set(s[0],s[1],s[2]).length();const o=Zi.set(s[4],s[5],s[6]).length(),a=Zi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],En.copy(this);const c=1/r,u=1/o,h=1/a;return En.elements[0]*=c,En.elements[1]*=c,En.elements[2]*=c,En.elements[4]*=u,En.elements[5]*=u,En.elements[6]*=u,En.elements[8]*=h,En.elements[9]*=h,En.elements[10]*=h,e.setFromRotationMatrix(En),n.x=r,n.y=o,n.z=a,this}makePerspective(t,e,n,s,r,o,a=On,l=!1){const c=this.elements,u=2*r/(e-t),h=2*r/(n-s),d=(e+t)/(e-t),f=(n+s)/(n-s);let g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===On)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===$r)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=h,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,o,a=On,l=!1){const c=this.elements,u=2/(e-t),h=2/(n-s),d=-(e+t)/(e-t),f=-(n+s)/(n-s);let g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===On)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===$r)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=u,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=h,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){const e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){const n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}}const Zi=new O,En=new ce,kd=new O(0,0,0),Bd=new O(1,1,1),ei=new O,hr=new O,tn=new O,Bl=new ce,zl=new Ts;class xn{constructor(t=0,e=0,n=0,s=xn.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){const s=t.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],u=s[9],h=s[2],d=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin($t(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-$t(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-h,r),this._z=0);break;case"ZXY":this._x=Math.asin($t(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-h,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-$t(h,-1,1)),Math.abs(h)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin($t(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-h,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-$t(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Bl.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Bl,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return zl.setFromEuler(this),this.setFromQuaternion(zl,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}xn.DEFAULT_ORDER="XYZ";class Mh{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}}let zd=0;const Gl=new O,ji=new Ts,Hn=new ce,ur=new O,Is=new O,Gd=new O,Hd=new Ts,Hl=new O(1,0,0),Vl=new O(0,1,0),Wl=new O(0,0,1),Xl={type:"added"},Vd={type:"removed"},Ji={type:"childadded",child:null},xo={type:"childremoved",child:null};class Te extends bs{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:zd++}),this.uuid=ws(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Te.DEFAULT_UP.clone();const t=new O,e=new xn,n=new Ts,s=new O(1,1,1);function r(){n.setFromEuler(e,!1)}function o(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ce},normalMatrix:{value:new Ht}}),this.matrix=new ce,this.matrixWorld=new ce,this.matrixAutoUpdate=Te.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Mh,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return ji.setFromAxisAngle(t,e),this.quaternion.multiply(ji),this}rotateOnWorldAxis(t,e){return ji.setFromAxisAngle(t,e),this.quaternion.premultiply(ji),this}rotateX(t){return this.rotateOnAxis(Hl,t)}rotateY(t){return this.rotateOnAxis(Vl,t)}rotateZ(t){return this.rotateOnAxis(Wl,t)}translateOnAxis(t,e){return Gl.copy(t).applyQuaternion(this.quaternion),this.position.add(Gl.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Hl,t)}translateY(t){return this.translateOnAxis(Vl,t)}translateZ(t){return this.translateOnAxis(Wl,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Hn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?ur.copy(t):ur.set(t,e,n);const s=this.parent;this.updateWorldMatrix(!0,!1),Is.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Hn.lookAt(Is,ur,this.up):Hn.lookAt(ur,Is,this.up),this.quaternion.setFromRotationMatrix(Hn),s&&(Hn.extractRotation(s.matrixWorld),ji.setFromRotationMatrix(Hn),this.quaternion.premultiply(ji.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Xl),Ji.child=t,this.dispatchEvent(Ji),Ji.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Vd),xo.child=t,this.dispatchEvent(xo),xo.child=null),this}removeFromParent(){const t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Hn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Hn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Hn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Xl),Ji.child=t,this.dispatchEvent(Ji),Ji.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(t,e);if(o!==void 0)return o}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Is,t,Gd),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Is,Hd,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);const e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){const e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);const e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){const n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){const e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){const h=l[c];r(t.shapes,h)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(t.materials,this.material[l]));s.material=a}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];s.animations.push(r(t.animations,l))}}if(e){const a=o(t.geometries),l=o(t.materials),c=o(t.textures),u=o(t.images),h=o(t.shapes),d=o(t.skeletons),f=o(t.animations),g=o(t.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),h.length>0&&(n.shapes=h),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){const l=[];for(const c in a){const u=a[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){const s=t.children[n];this.add(s.clone())}return this}}Te.DEFAULT_UP=new O(0,1,0);Te.DEFAULT_MATRIX_AUTO_UPDATE=!0;Te.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const bn=new O,Vn=new O,yo=new O,Wn=new O,Qi=new O,ts=new O,ql=new O,Mo=new O,So=new O,Eo=new O,bo=new Me,wo=new Me,To=new Me;class pn{constructor(t=new O,e=new O,n=new O){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),bn.subVectors(t,e),s.cross(bn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){bn.subVectors(s,e),Vn.subVectors(n,e),yo.subVectors(t,e);const o=bn.dot(bn),a=bn.dot(Vn),l=bn.dot(yo),c=Vn.dot(Vn),u=Vn.dot(yo),h=o*c-a*a;if(h===0)return r.set(0,0,0),null;const d=1/h,f=(c*l-a*u)*d,g=(o*u-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Wn)===null?!1:Wn.x>=0&&Wn.y>=0&&Wn.x+Wn.y<=1}static getInterpolation(t,e,n,s,r,o,a,l){return this.getBarycoord(t,e,n,s,Wn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Wn.x),l.addScaledVector(o,Wn.y),l.addScaledVector(a,Wn.z),l)}static getInterpolatedAttribute(t,e,n,s,r,o){return bo.setScalar(0),wo.setScalar(0),To.setScalar(0),bo.fromBufferAttribute(t,e),wo.fromBufferAttribute(t,n),To.fromBufferAttribute(t,s),o.setScalar(0),o.addScaledVector(bo,r.x),o.addScaledVector(wo,r.y),o.addScaledVector(To,r.z),o}static isFrontFacing(t,e,n,s){return bn.subVectors(n,e),Vn.subVectors(t,e),bn.cross(Vn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return bn.subVectors(this.c,this.b),Vn.subVectors(this.a,this.b),bn.cross(Vn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return pn.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return pn.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return pn.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return pn.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return pn.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){const n=this.a,s=this.b,r=this.c;let o,a;Qi.subVectors(s,n),ts.subVectors(r,n),Mo.subVectors(t,n);const l=Qi.dot(Mo),c=ts.dot(Mo);if(l<=0&&c<=0)return e.copy(n);So.subVectors(t,s);const u=Qi.dot(So),h=ts.dot(So);if(u>=0&&h<=u)return e.copy(s);const d=l*h-u*c;if(d<=0&&l>=0&&u<=0)return o=l/(l-u),e.copy(n).addScaledVector(Qi,o);Eo.subVectors(t,r);const f=Qi.dot(Eo),g=ts.dot(Eo);if(g>=0&&f<=g)return e.copy(r);const _=f*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),e.copy(n).addScaledVector(ts,a);const m=u*g-f*h;if(m<=0&&h-u>=0&&f-g>=0)return ql.subVectors(r,s),a=(h-u)/(h-u+(f-g)),e.copy(s).addScaledVector(ql,a);const p=1/(m+_+d);return o=_*p,a=d*p,e.copy(n).addScaledVector(Qi,o).addScaledVector(ts,a)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}}const Sh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ni={h:0,s:0,l:0},dr={h:0,s:0,l:0};function Ao(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}class kt{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){const s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=un){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Qt.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Qt.workingColorSpace){return this.r=t,this.g=e,this.b=n,Qt.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Qt.workingColorSpace){if(t=Ja(t,1),e=$t(e,0,1),n=$t(n,0,1),e===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+e):n+e-n*e,o=2*n-r;this.r=Ao(o,r,t+1/3),this.g=Ao(o,r,t),this.b=Ao(o,r,t-1/3)}return Qt.colorSpaceToWorking(this,s),this}setStyle(t,e=un){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(o===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=un){const n=Sh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Zn(t.r),this.g=Zn(t.g),this.b=Zn(t.b),this}copyLinearToSRGB(t){return this.r=ds(t.r),this.g=ds(t.g),this.b=ds(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=un){return Qt.workingToColorSpace(Ue.copy(this),t),Math.round($t(Ue.r*255,0,255))*65536+Math.round($t(Ue.g*255,0,255))*256+Math.round($t(Ue.b*255,0,255))}getHexString(t=un){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Qt.workingColorSpace){Qt.workingToColorSpace(Ue.copy(this),e);const n=Ue.r,s=Ue.g,r=Ue.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let l,c;const u=(a+o)/2;if(a===o)l=0,c=0;else{const h=o-a;switch(c=u<=.5?h/(o+a):h/(2-o-a),o){case n:l=(s-r)/h+(s<r?6:0);break;case s:l=(r-n)/h+2;break;case r:l=(n-s)/h+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=Qt.workingColorSpace){return Qt.workingToColorSpace(Ue.copy(this),e),t.r=Ue.r,t.g=Ue.g,t.b=Ue.b,t}getStyle(t=un){Qt.workingToColorSpace(Ue.copy(this),t);const e=Ue.r,n=Ue.g,s=Ue.b;return t!==un?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(ni),this.setHSL(ni.h+t,ni.s+e,ni.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ni),t.getHSL(dr);const n=Hs(ni.h,dr.h,e),s=Hs(ni.s,dr.s,e),r=Hs(ni.l,dr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){const e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Ue=new kt;kt.NAMES=Sh;let Wd=0;class zi extends bs{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Wd++}),this.uuid=ws(),this.name="",this.type="Material",this.blending=hs,this.side=Nn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zo,this.blendDst=jo,this.blendEquation=Pi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new kt(0,0,0),this.blendAlpha=0,this.depthFunc=ms,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Pl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Xi,this.stencilZFail=Xi,this.stencilZPass=Xi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(const e in t){const n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}const s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){const e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==hs&&(n.blending=this.blending),this.side!==Nn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Zo&&(n.blendSrc=this.blendSrc),this.blendDst!==jo&&(n.blendDst=this.blendDst),this.blendEquation!==Pi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ms&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==Pl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==Xi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==Xi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==Xi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(e){const r=s(t.textures),o=s(t.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;const e=t.clippingPlanes;let n=null;if(e!==null){const s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}}class xs extends zi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new kt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xn,this.combine=Wa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}}const be=new O,fr=new ee;let Xd=0;class Ae{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Xd++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Il,this.updateRanges=[],this.gpuType=Un,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)fr.fromBufferAttribute(this,e),fr.applyMatrix3(t),this.setXY(e,fr.x,fr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.applyMatrix3(t),this.setXYZ(e,be.x,be.y,be.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.applyMatrix4(t),this.setXYZ(e,be.x,be.y,be.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.applyNormalMatrix(t),this.setXYZ(e,be.x,be.y,be.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)be.fromBufferAttribute(this,e),be.transformDirection(t),this.setXYZ(e,be.x,be.y,be.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=as(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=ze(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=as(e,this.array)),e}setX(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=as(e,this.array)),e}setY(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=as(e,this.array)),e}setZ(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=as(e,this.array)),e}setW(t,e){return this.normalized&&(e=ze(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array),s=ze(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=ze(e,this.array),n=ze(n,this.array),s=ze(s,this.array),r=ze(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==Il&&(t.usage=this.usage),t}}class Eh extends Ae{constructor(t,e,n){super(new Uint16Array(t),e,n)}}class bh extends Ae{constructor(t,e,n){super(new Uint32Array(t),e,n)}}class an extends Ae{constructor(t,e,n){super(new Float32Array(t),e,n)}}let qd=0;const hn=new ce,Ro=new Te,es=new O,en=new ki,Us=new ki,De=new O;class Ze extends bs{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:qd++}),this.uuid=ws(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(yh(t)?bh:Eh)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){const e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ht().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return hn.makeRotationFromQuaternion(t),this.applyMatrix4(hn),this}rotateX(t){return hn.makeRotationX(t),this.applyMatrix4(hn),this}rotateY(t){return hn.makeRotationY(t),this.applyMatrix4(hn),this}rotateZ(t){return hn.makeRotationZ(t),this.applyMatrix4(hn),this}translate(t,e,n){return hn.makeTranslation(t,e,n),this.applyMatrix4(hn),this}scale(t,e,n){return hn.makeScale(t,e,n),this.applyMatrix4(hn),this}lookAt(t){return Ro.lookAt(t),Ro.updateMatrix(),this.applyMatrix4(Ro.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(es).negate(),this.translate(es.x,es.y,es.z),this}setFromPoints(t){const e=this.getAttribute("position");if(e===void 0){const n=[];for(let s=0,r=t.length;s<r;s++){const o=t[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new an(n,3))}else{const n=Math.min(t.length,e.count);for(let s=0;s<n;s++){const r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ki);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new O(-1/0,-1/0,-1/0),new O(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){const r=e[n];en.setFromBufferAttribute(r),this.morphTargetsRelative?(De.addVectors(this.boundingBox.min,en.min),this.boundingBox.expandByPoint(De),De.addVectors(this.boundingBox.max,en.max),this.boundingBox.expandByPoint(De)):(this.boundingBox.expandByPoint(en.min),this.boundingBox.expandByPoint(en.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Bi);const t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new O,1/0);return}if(t){const n=this.boundingSphere.center;if(en.setFromBufferAttribute(t),e)for(let r=0,o=e.length;r<o;r++){const a=e[r];Us.setFromBufferAttribute(a),this.morphTargetsRelative?(De.addVectors(en.min,Us.min),en.expandByPoint(De),De.addVectors(en.max,Us.max),en.expandByPoint(De)):(en.expandByPoint(Us.min),en.expandByPoint(Us.max))}en.getCenter(n);let s=0;for(let r=0,o=t.count;r<o;r++)De.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(De));if(e)for(let r=0,o=e.length;r<o;r++){const a=e[r],l=this.morphTargetsRelative;for(let c=0,u=a.count;c<u;c++)De.fromBufferAttribute(a,c),l&&(es.fromBufferAttribute(t,c),De.add(es)),s=Math.max(s,n.distanceToSquared(De))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Ae(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let P=0;P<n.count;P++)a[P]=new O,l[P]=new O;const c=new O,u=new O,h=new O,d=new ee,f=new ee,g=new ee,_=new O,m=new O;function p(P,E,w){c.fromBufferAttribute(n,P),u.fromBufferAttribute(n,E),h.fromBufferAttribute(n,w),d.fromBufferAttribute(r,P),f.fromBufferAttribute(r,E),g.fromBufferAttribute(r,w),u.sub(c),h.sub(c),f.sub(d),g.sub(d);const L=1/(f.x*g.y-g.x*f.y);isFinite(L)&&(_.copy(u).multiplyScalar(g.y).addScaledVector(h,-f.y).multiplyScalar(L),m.copy(h).multiplyScalar(f.x).addScaledVector(u,-g.x).multiplyScalar(L),a[P].add(_),a[E].add(_),a[w].add(_),l[P].add(m),l[E].add(m),l[w].add(m))}let x=this.groups;x.length===0&&(x=[{start:0,count:t.count}]);for(let P=0,E=x.length;P<E;++P){const w=x[P],L=w.start,k=w.count;for(let V=L,Z=L+k;V<Z;V+=3)p(t.getX(V+0),t.getX(V+1),t.getX(V+2))}const v=new O,y=new O,A=new O,T=new O;function R(P){A.fromBufferAttribute(s,P),T.copy(A);const E=a[P];v.copy(E),v.sub(A.multiplyScalar(A.dot(E))).normalize(),y.crossVectors(T,E);const L=y.dot(l[P])<0?-1:1;o.setXYZW(P,v.x,v.y,v.z,L)}for(let P=0,E=x.length;P<E;++P){const w=x[P],L=w.start,k=w.count;for(let V=L,Z=L+k;V<Z;V+=3)R(t.getX(V+0)),R(t.getX(V+1)),R(t.getX(V+2))}}computeVertexNormals(){const t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Ae(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const s=new O,r=new O,o=new O,a=new O,l=new O,c=new O,u=new O,h=new O;if(t)for(let d=0,f=t.count;d<f;d+=3){const g=t.getX(d+0),_=t.getX(d+1),m=t.getX(d+2);s.fromBufferAttribute(e,g),r.fromBufferAttribute(e,_),o.fromBufferAttribute(e,m),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(u),l.add(u),c.add(u),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=e.count;d<f;d+=3)s.fromBufferAttribute(e,d+0),r.fromBufferAttribute(e,d+1),o.fromBufferAttribute(e,d+2),u.subVectors(o,r),h.subVectors(s,r),u.cross(h),n.setXYZ(d+0,u.x,u.y,u.z),n.setXYZ(d+1,u.x,u.y,u.z),n.setXYZ(d+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)De.fromBufferAttribute(t,e),De.normalize(),t.setXYZ(e,De.x,De.y,De.z)}toNonIndexed(){function t(a,l){const c=a.array,u=a.itemSize,h=a.normalized,d=new c.constructor(l.length*u);let f=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?f=l[_]*a.data.stride+a.offset:f=l[_]*u;for(let p=0;p<u;p++)d[g++]=c[f++]}return new Ae(d,u,h)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const e=new Ze,n=this.index.array,s=this.attributes;for(const a in s){const l=s[a],c=t(l,n);e.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let u=0,h=c.length;u<h;u++){const d=c[u],f=t(d,n);l.push(f)}e.morphAttributes[a]=l}e.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){const t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};const e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});const n=this.attributes;for(const l in n){const c=n[l];t.data.attributes[l]=c.toJSON(t.data)}const s={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],u=[];for(let h=0,d=c.length;h<d;h++){const f=c[h];u.push(f.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(t.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(t.data.boundingSphere=a.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const e={};this.name=t.name;const n=t.index;n!==null&&this.setIndex(n.clone());const s=t.attributes;for(const c in s){const u=s[c];this.setAttribute(c,u.clone(e))}const r=t.morphAttributes;for(const c in r){const u=[],h=r[c];for(let d=0,f=h.length;d<f;d++)u.push(h[d].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;const o=t.groups;for(let c=0,u=o.length;c<u;c++){const h=o[c];this.addGroup(h.start,h.count,h.materialIndex)}const a=t.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const Kl=new ce,Ei=new el,pr=new Bi,Yl=new O,mr=new O,gr=new O,_r=new O,Co=new O,vr=new O,$l=new O,xr=new O;class te extends Te{constructor(t=new Ze,e=new xs){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(t,e){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;e.fromBufferAttribute(s,t);const a=this.morphTargetInfluences;if(r&&a){vr.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const u=a[l],h=r[l];u!==0&&(Co.fromBufferAttribute(h,t),o?vr.addScaledVector(Co,u):vr.addScaledVector(Co.sub(e),u))}e.add(vr)}return e}raycast(t,e){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),pr.copy(n.boundingSphere),pr.applyMatrix4(r),Ei.copy(t.ray).recast(t.near),!(pr.containsPoint(Ei.origin)===!1&&(Ei.intersectSphere(pr,Yl)===null||Ei.origin.distanceToSquared(Yl)>(t.far-t.near)**2))&&(Kl.copy(r).invert(),Ei.copy(t.ray).applyMatrix4(Kl),!(n.boundingBox!==null&&Ei.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Ei)))}_computeIntersections(t,e,n){let s;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,h=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),v=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let y=x,A=v;y<A;y+=3){const T=a.getX(y),R=a.getX(y+1),P=a.getX(y+2);s=yr(this,p,t,n,c,u,h,T,R,P),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(a.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const x=a.getX(m),v=a.getX(m+1),y=a.getX(m+2);s=yr(this,o,t,n,c,u,h,x,v,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=d.length;g<_;g++){const m=d[g],p=o[m.materialIndex],x=Math.max(m.start,f.start),v=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let y=x,A=v;y<A;y+=3){const T=y,R=y+1,P=y+2;s=yr(this,p,t,n,c,u,h,T,R,P),s&&(s.faceIndex=Math.floor(y/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{const g=Math.max(0,f.start),_=Math.min(l.count,f.start+f.count);for(let m=g,p=_;m<p;m+=3){const x=m,v=m+1,y=m+2;s=yr(this,o,t,n,c,u,h,x,v,y),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}}function Kd(i,t,e,n,s,r,o,a){let l;if(t.side===qe?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,t.side===Nn,a),l===null)return null;xr.copy(a),xr.applyMatrix4(i.matrixWorld);const c=e.ray.origin.distanceTo(xr);return c<e.near||c>e.far?null:{distance:c,point:xr.clone(),object:i}}function yr(i,t,e,n,s,r,o,a,l,c){i.getVertexPosition(a,mr),i.getVertexPosition(l,gr),i.getVertexPosition(c,_r);const u=Kd(i,t,e,n,mr,gr,_r,$l);if(u){const h=new O;pn.getBarycoord($l,mr,gr,_r,h),s&&(u.uv=pn.getInterpolatedAttribute(s,a,l,c,h,new ee)),r&&(u.uv1=pn.getInterpolatedAttribute(r,a,l,c,h,new ee)),o&&(u.normal=pn.getInterpolatedAttribute(o,a,l,c,h,new O),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new O,materialIndex:0};pn.getNormal(mr,gr,_r,d.normal),u.face=d,u.barycoord=h}return u}class Ee extends Ze{constructor(t=1,e=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],u=[],h=[];let d=0,f=0;g("z","y","x",-1,-1,n,e,t,o,r,0),g("z","y","x",1,-1,n,e,-t,o,r,1),g("x","z","y",1,1,t,n,e,s,o,2),g("x","z","y",1,-1,t,n,-e,s,o,3),g("x","y","z",1,-1,t,e,n,s,r,4),g("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new an(c,3)),this.setAttribute("normal",new an(u,3)),this.setAttribute("uv",new an(h,2));function g(_,m,p,x,v,y,A,T,R,P,E){const w=y/R,L=A/P,k=y/2,V=A/2,Z=T/2,q=R+1,G=P+1;let X=0,B=0;const st=new O;for(let at=0;at<G;at++){const gt=at*L-V;for(let Ot=0;Ot<q;Ot++){const Kt=Ot*w-k;st[_]=Kt*x,st[m]=gt*v,st[p]=Z,c.push(st.x,st.y,st.z),st[_]=0,st[m]=0,st[p]=T>0?1:-1,u.push(st.x,st.y,st.z),h.push(Ot/R),h.push(1-at/P),X+=1}}for(let at=0;at<P;at++)for(let gt=0;gt<R;gt++){const Ot=d+gt+q*at,Kt=d+gt+q*(at+1),Nt=d+(gt+1)+q*(at+1),ne=d+(gt+1)+q*at;l.push(Ot,Kt,ne),l.push(Kt,Nt,ne),B+=6}a.addGroup(f,B,E),f+=B,d+=X}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new Ee(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}}function ys(i){const t={};for(const e in i){t[e]={};for(const n in i[e]){const s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function He(i){const t={};for(let e=0;e<i.length;e++){const n=ys(i[e]);for(const s in n)t[s]=n[s]}return t}function Yd(i){const t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function wh(i){const t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Qt.workingColorSpace}const $d={clone:ys,merge:He};var Zd=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,jd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class yn extends zi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Zd,this.fragmentShader=jd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=ys(t.uniforms),this.uniformsGroups=Yd(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){const e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?e.uniforms[s]={type:"t",value:o.toJSON(t).uuid}:o&&o.isColor?e.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?e.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?e.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?e.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?e.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?e.uniforms[s]={type:"m4",value:o.toArray()}:e.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}}class Th extends Te{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ce,this.projectionMatrix=new ce,this.projectionMatrixInverse=new ce,this.coordinateSystem=On,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const ii=new O,Zl=new ee,jl=new ee;class sn extends Th{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){const e=.5*this.getFilmHeight()/t;this.fov=$s*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){const t=Math.tan(us*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return $s*2*Math.atan(Math.tan(us*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){ii.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ii.x,ii.y).multiplyScalar(-t/ii.z),ii.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ii.x,ii.y).multiplyScalar(-t/ii.z)}getViewSize(t,e){return this.getViewBounds(t,Zl,jl),e.subVectors(jl,Zl)}setViewOffset(t,e,n,s,r,o){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=this.near;let e=t*Math.tan(us*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,e-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=t*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}}const ns=-90,is=1;class Jd extends Te{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new sn(ns,is,t,e);s.layers=this.layers,this.add(s);const r=new sn(ns,is,t,e);r.layers=this.layers,this.add(r);const o=new sn(ns,is,t,e);o.layers=this.layers,this.add(o);const a=new sn(ns,is,t,e);a.layers=this.layers,this.add(a);const l=new sn(ns,is,t,e);l.layers=this.layers,this.add(l);const c=new sn(ns,is,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const t=this.coordinateSystem,e=this.children.concat(),[n,s,r,o,a,l]=e;for(const c of e)this.remove(c);if(t===On)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===$r)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(const c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,u]=this.children,h=t.getRenderTarget(),d=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),g=t.xr.enabled;t.xr.enabled=!1;const _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,o),t.setRenderTarget(n,2,s),t.render(e,a),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=_,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(h,d,f),t.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class Ah extends ke{constructor(t=[],e=gs,n,s,r,o,a,l,c,u){super(t,e,n,s,r,o,a,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}}class Qd extends Fi{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;const n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Ah(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ee(5,5,5),r=new yn({name:"CubemapFromEquirect",uniforms:ys(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:qe,blending:fi});r.uniforms.tEquirect.value=e;const o=new te(s,r),a=e.minFilter;return e.minFilter===Ui&&(e.minFilter=In),new Jd(1,10,this).update(t,o),e.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){const r=t.getRenderTarget();for(let o=0;o<6;o++)t.setRenderTarget(this,o),t.clear(e,n,s);t.setRenderTarget(r)}}class We extends Te{constructor(){super(),this.isGroup=!0,this.type="Group"}}const tf={type:"move"};class Lo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new We,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new We,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new O,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new O),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new We,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new O,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new O),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){const e=this._hand;if(e)for(const n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){o=!0;for(const _ of t.hand.values()){const m=e.getJointPose(_,n),p=this._getHandJoint(c,_);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const u=c.joints["index-finger-tip"],h=c.joints["thumb-tip"],d=u.position.distanceTo(h.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(tf)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){const n=new We;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}}class nl{constructor(t,e=1,n=1e3){this.isFog=!0,this.name="",this.color=new kt(t),this.near=e,this.far=n}clone(){return new nl(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class Jl extends Te{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new xn,this.environmentIntensity=1,this.environmentRotation=new xn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){const e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}}class ef extends ke{constructor(t=null,e=1,n=1,s,r,o,a,l,c=we,u=we,h,d){super(null,o,a,l,c,u,s,r,h,d),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Ql extends Ae{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){const t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}}const ss=new ce,tc=new ce,Mr=[],ec=new ki,nf=new ce,Os=new te,Ns=new Bi;class sf extends te{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Ql(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,nf)}computeBoundingBox(){const t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new ki),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ss),ec.copy(t.boundingBox).applyMatrix4(ss),this.boundingBox.union(ec)}computeBoundingSphere(){const t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new Bi),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,ss),Ns.copy(t.boundingSphere).applyMatrix4(ss),this.boundingSphere.union(Ns)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){const n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=t*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(t,e){const n=this.matrixWorld,s=this.count;if(Os.geometry=this.geometry,Os.material=this.material,Os.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ns.copy(this.boundingSphere),Ns.applyMatrix4(n),t.ray.intersectsSphere(Ns)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,ss),tc.multiplyMatrices(n,ss),Os.matrixWorld=tc,Os.raycast(t,Mr);for(let o=0,a=Mr.length;o<a;o++){const l=Mr[o];l.instanceId=r,l.object=this,e.push(l)}Mr.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Ql(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){const n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new ef(new Float32Array(s*this.count),s,this.count,Ya,Un));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=s*t;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const Do=new O,rf=new O,of=new Ht;class Ci{constructor(t=new O(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){const s=Do.subVectors(n,e).cross(rf.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){const t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){const n=t.delta(Do),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;const r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){const e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){const n=e||of.getNormalMatrix(t),s=this.coplanarPoint(Do).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}}const bi=new Bi,af=new ee(.5,.5),Sr=new O;class il{constructor(t=new Ci,e=new Ci,n=new Ci,s=new Ci,r=new Ci,o=new Ci){this.planes=[t,e,n,s,r,o]}set(t,e,n,s,r,o){const a=this.planes;return a[0].copy(t),a[1].copy(e),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(t){const e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=On,n=!1){const s=this.planes,r=t.elements,o=r[0],a=r[1],l=r[2],c=r[3],u=r[4],h=r[5],d=r[6],f=r[7],g=r[8],_=r[9],m=r[10],p=r[11],x=r[12],v=r[13],y=r[14],A=r[15];if(s[0].setComponents(c-o,f-u,p-g,A-x).normalize(),s[1].setComponents(c+o,f+u,p+g,A+x).normalize(),s[2].setComponents(c+a,f+h,p+_,A+v).normalize(),s[3].setComponents(c-a,f-h,p-_,A-v).normalize(),n)s[4].setComponents(l,d,m,y).normalize(),s[5].setComponents(c-l,f-d,p-m,A-y).normalize();else if(s[4].setComponents(c-l,f-d,p-m,A-y).normalize(),e===On)s[5].setComponents(c+l,f+d,p+m,A+y).normalize();else if(e===$r)s[5].setComponents(l,d,m,y).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),bi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{const e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),bi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(bi)}intersectsSprite(t){bi.center.set(0,0,0);const e=af.distanceTo(t.center);return bi.radius=.7071067811865476+e,bi.applyMatrix4(t.matrixWorld),this.intersectsSphere(bi)}intersectsSphere(t){const e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){const e=this.planes;for(let n=0;n<6;n++){const s=e[n];if(Sr.x=s.normal.x>0?t.max.x:t.min.x,Sr.y=s.normal.y>0?t.max.y:t.min.y,Sr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(Sr)<0)return!1}return!0}containsPoint(t){const e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class Rh extends zi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new kt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}}const jr=new O,Jr=new O,nc=new ce,Fs=new el,Er=new Bi,Po=new O,ic=new O;class lf extends Te{constructor(t=new Ze,e=new Rh){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)jr.fromBufferAttribute(e,s-1),Jr.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=jr.distanceTo(Jr);t.setAttribute("lineDistance",new an(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Er.copy(n.boundingSphere),Er.applyMatrix4(s),Er.radius+=r,t.ray.intersectsSphere(Er)===!1)return;nc.copy(s).invert(),Fs.copy(t.ray).applyMatrix4(nc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,u=n.index,d=n.attributes.position;if(u!==null){const f=Math.max(0,o.start),g=Math.min(u.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=u.getX(_),x=u.getX(_+1),v=br(this,t,Fs,l,p,x,_);v&&e.push(v)}if(this.isLineLoop){const _=u.getX(g-1),m=u.getX(f),p=br(this,t,Fs,l,_,m,g-1);p&&e.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let _=f,m=g-1;_<m;_+=c){const p=br(this,t,Fs,l,_,_+1,_);p&&e.push(p)}if(this.isLineLoop){const _=br(this,t,Fs,l,g-1,f,g-1);_&&e.push(_)}}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function br(i,t,e,n,s,r,o){const a=i.geometry.attributes.position;if(jr.fromBufferAttribute(a,s),Jr.fromBufferAttribute(a,r),e.distanceSqToSegment(jr,Jr,Po,ic)>n)return;Po.applyMatrix4(i.matrixWorld);const c=t.ray.origin.distanceTo(Po);if(!(c<t.near||c>t.far))return{distance:c,point:ic.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const sc=new O,rc=new O;class cf extends lf{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const t=this.geometry;if(t.index===null){const e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)sc.fromBufferAttribute(e,s),rc.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+sc.distanceTo(rc);t.setAttribute("lineDistance",new an(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class Ch extends zi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new kt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}}const oc=new ce,Fa=new el,wr=new Bi,Tr=new O;class hf extends Te{constructor(t=new Ze,e=new Ch){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}raycast(t,e){const n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),wr.copy(n.boundingSphere),wr.applyMatrix4(s),wr.radius+=r,t.ray.intersectsSphere(wr)===!1)return;oc.copy(s).invert(),Fa.copy(t.ray).applyMatrix4(oc);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,h=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,_=f;g<_;g++){const m=c.getX(g);Tr.fromBufferAttribute(h,m),ac(Tr,m,l,s,t,e,this)}}else{const d=Math.max(0,o.start),f=Math.min(h.count,o.start+o.count);for(let g=d,_=f;g<_;g++)Tr.fromBufferAttribute(h,g),ac(Tr,g,l,s,t,e,this)}}updateMorphTargets(){const e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){const s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function ac(i,t,e,n,s,r,o){const a=Fa.distanceSqToPoint(i);if(a<e){const l=new O;Fa.closestPointToPoint(i,l),l.applyMatrix4(n);const c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:o})}}class sl extends ke{constructor(t,e,n,s,r,o,a,l,c){super(t,e,n,s,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class Lh extends ke{constructor(t,e,n=Ni,s,r,o,a=we,l=we,c,u=Ks,h=1){if(u!==Ks&&u!==Ys)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:t,height:e,depth:h};super(d,s,r,o,a,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new Qa(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){const e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}}class Dh extends ke{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}}const Ar=new O,Rr=new O,Io=new O,Cr=new pn;class uf extends Ze{constructor(t=null,e=1){if(super(),this.type="EdgesGeometry",this.parameters={geometry:t,thresholdAngle:e},t!==null){const s=Math.pow(10,4),r=Math.cos(us*e),o=t.getIndex(),a=t.getAttribute("position"),l=o?o.count:a.count,c=[0,0,0],u=["a","b","c"],h=new Array(3),d={},f=[];for(let g=0;g<l;g+=3){o?(c[0]=o.getX(g),c[1]=o.getX(g+1),c[2]=o.getX(g+2)):(c[0]=g,c[1]=g+1,c[2]=g+2);const{a:_,b:m,c:p}=Cr;if(_.fromBufferAttribute(a,c[0]),m.fromBufferAttribute(a,c[1]),p.fromBufferAttribute(a,c[2]),Cr.getNormal(Io),h[0]=`${Math.round(_.x*s)},${Math.round(_.y*s)},${Math.round(_.z*s)}`,h[1]=`${Math.round(m.x*s)},${Math.round(m.y*s)},${Math.round(m.z*s)}`,h[2]=`${Math.round(p.x*s)},${Math.round(p.y*s)},${Math.round(p.z*s)}`,!(h[0]===h[1]||h[1]===h[2]||h[2]===h[0]))for(let x=0;x<3;x++){const v=(x+1)%3,y=h[x],A=h[v],T=Cr[u[x]],R=Cr[u[v]],P=`${y}_${A}`,E=`${A}_${y}`;E in d&&d[E]?(Io.dot(d[E].normal)<=r&&(f.push(T.x,T.y,T.z),f.push(R.x,R.y,R.z)),d[E]=null):P in d||(d[P]={index0:c[x],index1:c[v],normal:Io.clone()})}}for(const g in d)if(d[g]){const{index0:_,index1:m}=d[g];Ar.fromBufferAttribute(a,_),Rr.fromBufferAttribute(a,m),f.push(Ar.x,Ar.y,Ar.z),f.push(Rr.x,Rr.y,Rr.z)}this.setAttribute("position",new an(f,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}}class mi extends Ze{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};const r=t/2,o=e/2,a=Math.floor(n),l=Math.floor(s),c=a+1,u=l+1,h=t/a,d=e/l,f=[],g=[],_=[],m=[];for(let p=0;p<u;p++){const x=p*d-o;for(let v=0;v<c;v++){const y=v*h-r;g.push(y,-x,0),_.push(0,0,1),m.push(v/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let x=0;x<a;x++){const v=x+c*p,y=x+c*(p+1),A=x+1+c*(p+1),T=x+1+c*p;f.push(v,y,T),f.push(y,A,T)}this.setIndex(f),this.setAttribute("position",new an(g,3)),this.setAttribute("normal",new an(_,3)),this.setAttribute("uv",new an(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new mi(t.width,t.height,t.widthSegments,t.heightSegments)}}class rl extends Ze{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const u=[],h=new O,d=new O,f=[],g=[],_=[],m=[];for(let p=0;p<=n;p++){const x=[],v=p/n;let y=0;p===0&&o===0?y=.5/e:p===n&&l===Math.PI&&(y=-.5/e);for(let A=0;A<=e;A++){const T=A/e;h.x=-t*Math.cos(s+T*r)*Math.sin(o+v*a),h.y=t*Math.cos(o+v*a),h.z=t*Math.sin(s+T*r)*Math.sin(o+v*a),g.push(h.x,h.y,h.z),d.copy(h).normalize(),_.push(d.x,d.y,d.z),m.push(T+y,1-v),x.push(c++)}u.push(x)}for(let p=0;p<n;p++)for(let x=0;x<e;x++){const v=u[p][x+1],y=u[p][x],A=u[p+1][x],T=u[p+1][x+1];(p!==0||o>0)&&f.push(v,y,T),(p!==n-1||l<Math.PI)&&f.push(y,A,T)}this.setIndex(f),this.setAttribute("position",new an(g,3)),this.setAttribute("normal",new an(_,3)),this.setAttribute("uv",new an(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new rl(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}}class $e extends zi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new kt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new kt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=vh,this.normalScale=new ee(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new xn,this.combine=Wa,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}}class df extends zi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=nd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}}class ff extends zi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}}class Ph extends Te{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new kt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){const e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}}class lc extends Ph{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Te.DEFAULT_UP),this.updateMatrix(),this.groundColor=new kt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}}const Uo=new ce,cc=new O,hc=new O;class pf{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ee(512,512),this.mapType=Tn,this.map=null,this.mapPass=null,this.matrix=new ce,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new il,this._frameExtents=new ee(1,1),this._viewportCount=1,this._viewports=[new Me(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){const e=this.camera,n=this.matrix;cc.setFromMatrixPosition(t.matrixWorld),e.position.copy(cc),hc.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(hc),e.updateMatrixWorld(),Uo.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Uo,e.coordinateSystem,e.reversedDepth),e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(Uo)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}}class Ih extends Th{constructor(t=-1,e=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-t,o=n+t,a=s+e,l=s-e;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=u*this.view.offsetY,l=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){const e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}}class mf extends pf{constructor(){super(new Ih(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class gf extends Ph{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Te.DEFAULT_UP),this.updateMatrix(),this.target=new Te,this.shadow=new mf}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}}class _f extends sn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}}function uc(i,t,e,n){const s=vf(n);switch(e){case mh:return i*t;case Ya:return i*t/s.components*s.byteLength;case $a:return i*t/s.components*s.byteLength;case _h:return i*t*2/s.components*s.byteLength;case Za:return i*t*2/s.components*s.byteLength;case gh:return i*t*3/s.components*s.byteLength;case gn:return i*t*4/s.components*s.byteLength;case ja:return i*t*4/s.components*s.byteLength;case Fr:case kr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Br:case zr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ca:case ua:return Math.max(i,16)*Math.max(t,8)/4;case la:case ha:return Math.max(i,8)*Math.max(t,8)/2;case da:case fa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case pa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ma:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case ga:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case _a:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case va:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case xa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case ya:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Ma:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Sa:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ea:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case ba:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case wa:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Ta:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Aa:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Ra:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Ca:case La:case Da:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Pa:case Ia:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Ua:case Oa:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function vf(i){switch(i){case Tn:case uh:return{byteLength:1,components:1};case Xs:case dh:case js:return{byteLength:2,components:1};case qa:case Ka:return{byteLength:2,components:4};case Ni:case Xa:case Un:return{byteLength:4,components:1};case fh:case ph:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Va}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Va);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Uh(){let i=null,t=!1,e=null,n=null;function s(r,o){e(r,o),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function xf(i){const t=new WeakMap;function e(a,l){const c=a.array,u=a.usage,h=c.byteLength,d=i.createBuffer();i.bindBuffer(l,d),i.bufferData(l,c,u),a.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:h}}function n(a,l,c){const u=l.array,h=l.updateRanges;if(i.bindBuffer(c,a),h.length===0)i.bufferSubData(c,0,u);else{h.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<h.length;f++){const g=h[d],_=h[f];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++d,h[d]=_)}h.length=d+1;for(let f=0,g=h.length;f<g;f++){const _=h[f];i.bufferSubData(c,_.start*u.BYTES_PER_ELEMENT,u,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),t.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=t.get(a);l&&(i.deleteBuffer(l.buffer),t.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=t.get(a);(!u||u.version<a.version)&&t.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=t.get(a);if(c===void 0)t.set(a,e(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var yf=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Mf=`#ifdef USE_ALPHAHASH
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
#endif`,Sf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Ef=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,bf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,wf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Tf=`#ifdef USE_AOMAP
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
#endif`,Af=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Rf=`#ifdef USE_BATCHING
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
#endif`,Cf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Lf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Df=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Pf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,If=`#ifdef USE_IRIDESCENCE
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
#endif`,Uf=`#ifdef USE_BUMPMAP
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
#endif`,Of=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Nf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ff=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,kf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Bf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,zf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Gf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Hf=`#if defined( USE_COLOR_ALPHA )
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
#endif`,Vf=`#define PI 3.141592653589793
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
} // validated`,Wf=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Xf=`vec3 transformedNormal = objectNormal;
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
#endif`,qf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Kf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Yf=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,$f=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Zf="gl_FragColor = linearToOutputTexel( gl_FragColor );",jf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Jf=`#ifdef USE_ENVMAP
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
#endif`,Qf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,tp=`#ifdef USE_ENVMAP
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
#endif`,ep=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,np=`#ifdef USE_ENVMAP
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
#endif`,ip=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,sp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,rp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,op=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,ap=`#ifdef USE_GRADIENTMAP
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
}`,lp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,cp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,hp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,up=`uniform bool receiveShadow;
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
#endif`,dp=`#ifdef USE_ENVMAP
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
#endif`,fp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,pp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,mp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,gp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,_p=`PhysicalMaterial material;
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
#endif`,vp=`struct PhysicalMaterial {
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
}`,xp=`
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
#endif`,yp=`#if defined( RE_IndirectDiffuse )
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
#endif`,Mp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Sp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Ep=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,bp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,wp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Tp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Ap=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Rp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Cp=`#if defined( USE_POINTS_UV )
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
#endif`,Lp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Dp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Pp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Ip=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Up=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Op=`#ifdef USE_MORPHTARGETS
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
#endif`,Np=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Fp=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,kp=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Bp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,zp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Gp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Hp=`#ifdef USE_NORMALMAP
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
#endif`,Vp=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Wp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Xp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,qp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Kp=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Yp=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,$p=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Zp=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,jp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Jp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Qp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,tm=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,em=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,nm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,im=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,sm=`float getShadowMask() {
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
}`,rm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,om=`#ifdef USE_SKINNING
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
#endif`,am=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,lm=`#ifdef USE_SKINNING
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
#endif`,cm=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,hm=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,um=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,dm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,fm=`#ifdef USE_TRANSMISSION
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
#endif`,pm=`#ifdef USE_TRANSMISSION
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
#endif`,mm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,gm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,_m=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,vm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const xm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ym=`uniform sampler2D t2D;
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
}`,Mm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Sm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,Em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,bm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,wm=`#include <common>
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
}`,Tm=`#if DEPTH_PACKING == 3200
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
}`,Am=`#define DISTANCE
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
}`,Rm=`#define DISTANCE
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
}`,Cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Lm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Dm=`uniform float scale;
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
}`,Pm=`uniform vec3 diffuse;
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
}`,Im=`#include <common>
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
}`,Um=`uniform vec3 diffuse;
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
}`,Om=`#define LAMBERT
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
}`,Nm=`#define LAMBERT
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
}`,Fm=`#define MATCAP
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
}`,km=`#define MATCAP
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
}`,Bm=`#define NORMAL
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
}`,zm=`#define NORMAL
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
}`,Gm=`#define PHONG
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
}`,Hm=`#define PHONG
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
}`,Vm=`#define STANDARD
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
}`,Wm=`#define STANDARD
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
}`,Xm=`#define TOON
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
}`,qm=`#define TOON
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
}`,Km=`uniform float size;
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
}`,Ym=`uniform vec3 diffuse;
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
}`,$m=`#include <common>
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
}`,Zm=`uniform vec3 color;
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
}`,jm=`uniform float rotation;
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
}`,Jm=`uniform vec3 diffuse;
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
}`,Wt={alphahash_fragment:yf,alphahash_pars_fragment:Mf,alphamap_fragment:Sf,alphamap_pars_fragment:Ef,alphatest_fragment:bf,alphatest_pars_fragment:wf,aomap_fragment:Tf,aomap_pars_fragment:Af,batching_pars_vertex:Rf,batching_vertex:Cf,begin_vertex:Lf,beginnormal_vertex:Df,bsdfs:Pf,iridescence_fragment:If,bumpmap_pars_fragment:Uf,clipping_planes_fragment:Of,clipping_planes_pars_fragment:Nf,clipping_planes_pars_vertex:Ff,clipping_planes_vertex:kf,color_fragment:Bf,color_pars_fragment:zf,color_pars_vertex:Gf,color_vertex:Hf,common:Vf,cube_uv_reflection_fragment:Wf,defaultnormal_vertex:Xf,displacementmap_pars_vertex:qf,displacementmap_vertex:Kf,emissivemap_fragment:Yf,emissivemap_pars_fragment:$f,colorspace_fragment:Zf,colorspace_pars_fragment:jf,envmap_fragment:Jf,envmap_common_pars_fragment:Qf,envmap_pars_fragment:tp,envmap_pars_vertex:ep,envmap_physical_pars_fragment:dp,envmap_vertex:np,fog_vertex:ip,fog_pars_vertex:sp,fog_fragment:rp,fog_pars_fragment:op,gradientmap_pars_fragment:ap,lightmap_pars_fragment:lp,lights_lambert_fragment:cp,lights_lambert_pars_fragment:hp,lights_pars_begin:up,lights_toon_fragment:fp,lights_toon_pars_fragment:pp,lights_phong_fragment:mp,lights_phong_pars_fragment:gp,lights_physical_fragment:_p,lights_physical_pars_fragment:vp,lights_fragment_begin:xp,lights_fragment_maps:yp,lights_fragment_end:Mp,logdepthbuf_fragment:Sp,logdepthbuf_pars_fragment:Ep,logdepthbuf_pars_vertex:bp,logdepthbuf_vertex:wp,map_fragment:Tp,map_pars_fragment:Ap,map_particle_fragment:Rp,map_particle_pars_fragment:Cp,metalnessmap_fragment:Lp,metalnessmap_pars_fragment:Dp,morphinstance_vertex:Pp,morphcolor_vertex:Ip,morphnormal_vertex:Up,morphtarget_pars_vertex:Op,morphtarget_vertex:Np,normal_fragment_begin:Fp,normal_fragment_maps:kp,normal_pars_fragment:Bp,normal_pars_vertex:zp,normal_vertex:Gp,normalmap_pars_fragment:Hp,clearcoat_normal_fragment_begin:Vp,clearcoat_normal_fragment_maps:Wp,clearcoat_pars_fragment:Xp,iridescence_pars_fragment:qp,opaque_fragment:Kp,packing:Yp,premultiplied_alpha_fragment:$p,project_vertex:Zp,dithering_fragment:jp,dithering_pars_fragment:Jp,roughnessmap_fragment:Qp,roughnessmap_pars_fragment:tm,shadowmap_pars_fragment:em,shadowmap_pars_vertex:nm,shadowmap_vertex:im,shadowmask_pars_fragment:sm,skinbase_vertex:rm,skinning_pars_vertex:om,skinning_vertex:am,skinnormal_vertex:lm,specularmap_fragment:cm,specularmap_pars_fragment:hm,tonemapping_fragment:um,tonemapping_pars_fragment:dm,transmission_fragment:fm,transmission_pars_fragment:pm,uv_pars_fragment:mm,uv_pars_vertex:gm,uv_vertex:_m,worldpos_vertex:vm,background_vert:xm,background_frag:ym,backgroundCube_vert:Mm,backgroundCube_frag:Sm,cube_vert:Em,cube_frag:bm,depth_vert:wm,depth_frag:Tm,distanceRGBA_vert:Am,distanceRGBA_frag:Rm,equirect_vert:Cm,equirect_frag:Lm,linedashed_vert:Dm,linedashed_frag:Pm,meshbasic_vert:Im,meshbasic_frag:Um,meshlambert_vert:Om,meshlambert_frag:Nm,meshmatcap_vert:Fm,meshmatcap_frag:km,meshnormal_vert:Bm,meshnormal_frag:zm,meshphong_vert:Gm,meshphong_frag:Hm,meshphysical_vert:Vm,meshphysical_frag:Wm,meshtoon_vert:Xm,meshtoon_frag:qm,points_vert:Km,points_frag:Ym,shadow_vert:$m,shadow_frag:Zm,sprite_vert:jm,sprite_frag:Jm},ct={common:{diffuse:{value:new kt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ht}},envmap:{envMap:{value:null},envMapRotation:{value:new Ht},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ht}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ht}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ht},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ht},normalScale:{value:new ee(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ht},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ht}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ht}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ht}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new kt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new kt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0},uvTransform:{value:new Ht}},sprite:{diffuse:{value:new kt(16777215)},opacity:{value:1},center:{value:new ee(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ht},alphaMap:{value:null},alphaMapTransform:{value:new Ht},alphaTest:{value:0}}},Pn={basic:{uniforms:He([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.fog]),vertexShader:Wt.meshbasic_vert,fragmentShader:Wt.meshbasic_frag},lambert:{uniforms:He([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new kt(0)}}]),vertexShader:Wt.meshlambert_vert,fragmentShader:Wt.meshlambert_frag},phong:{uniforms:He([ct.common,ct.specularmap,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,ct.lights,{emissive:{value:new kt(0)},specular:{value:new kt(1118481)},shininess:{value:30}}]),vertexShader:Wt.meshphong_vert,fragmentShader:Wt.meshphong_frag},standard:{uniforms:He([ct.common,ct.envmap,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.roughnessmap,ct.metalnessmap,ct.fog,ct.lights,{emissive:{value:new kt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Wt.meshphysical_vert,fragmentShader:Wt.meshphysical_frag},toon:{uniforms:He([ct.common,ct.aomap,ct.lightmap,ct.emissivemap,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.gradientmap,ct.fog,ct.lights,{emissive:{value:new kt(0)}}]),vertexShader:Wt.meshtoon_vert,fragmentShader:Wt.meshtoon_frag},matcap:{uniforms:He([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,ct.fog,{matcap:{value:null}}]),vertexShader:Wt.meshmatcap_vert,fragmentShader:Wt.meshmatcap_frag},points:{uniforms:He([ct.points,ct.fog]),vertexShader:Wt.points_vert,fragmentShader:Wt.points_frag},dashed:{uniforms:He([ct.common,ct.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Wt.linedashed_vert,fragmentShader:Wt.linedashed_frag},depth:{uniforms:He([ct.common,ct.displacementmap]),vertexShader:Wt.depth_vert,fragmentShader:Wt.depth_frag},normal:{uniforms:He([ct.common,ct.bumpmap,ct.normalmap,ct.displacementmap,{opacity:{value:1}}]),vertexShader:Wt.meshnormal_vert,fragmentShader:Wt.meshnormal_frag},sprite:{uniforms:He([ct.sprite,ct.fog]),vertexShader:Wt.sprite_vert,fragmentShader:Wt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ht},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Wt.background_vert,fragmentShader:Wt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ht}},vertexShader:Wt.backgroundCube_vert,fragmentShader:Wt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Wt.cube_vert,fragmentShader:Wt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Wt.equirect_vert,fragmentShader:Wt.equirect_frag},distanceRGBA:{uniforms:He([ct.common,ct.displacementmap,{referencePosition:{value:new O},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Wt.distanceRGBA_vert,fragmentShader:Wt.distanceRGBA_frag},shadow:{uniforms:He([ct.lights,ct.fog,{color:{value:new kt(0)},opacity:{value:1}}]),vertexShader:Wt.shadow_vert,fragmentShader:Wt.shadow_frag}};Pn.physical={uniforms:He([Pn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ht},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ht},clearcoatNormalScale:{value:new ee(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ht},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ht},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ht},sheen:{value:0},sheenColor:{value:new kt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ht},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ht},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ht},transmissionSamplerSize:{value:new ee},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ht},attenuationDistance:{value:0},attenuationColor:{value:new kt(0)},specularColor:{value:new kt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ht},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ht},anisotropyVector:{value:new ee},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ht}}]),vertexShader:Wt.meshphysical_vert,fragmentShader:Wt.meshphysical_frag};const Lr={r:0,b:0,g:0},wi=new xn,Qm=new ce;function t0(i,t,e,n,s,r,o){const a=new kt(0);let l=r===!0?0:1,c,u,h=null,d=0,f=null;function g(v){let y=v.isScene===!0?v.background:null;return y&&y.isTexture&&(y=(v.backgroundBlurriness>0?e:t).get(y)),y}function _(v){let y=!1;const A=g(v);A===null?p(a,l):A&&A.isColor&&(p(A,1),y=!0);const T=i.xr.getEnvironmentBlendMode();T==="additive"?n.buffers.color.setClear(0,0,0,1,o):T==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||y)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(v,y){const A=g(y);A&&(A.isCubeTexture||A.mapping===no)?(u===void 0&&(u=new te(new Ee(1,1,1),new yn({name:"BackgroundCubeMaterial",uniforms:ys(Pn.backgroundCube.uniforms),vertexShader:Pn.backgroundCube.vertexShader,fragmentShader:Pn.backgroundCube.fragmentShader,side:qe,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(T,R,P){this.matrixWorld.copyPosition(P.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),wi.copy(y.backgroundRotation),wi.x*=-1,wi.y*=-1,wi.z*=-1,A.isCubeTexture&&A.isRenderTargetTexture===!1&&(wi.y*=-1,wi.z*=-1),u.material.uniforms.envMap.value=A,u.material.uniforms.flipEnvMap.value=A.isCubeTexture&&A.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Qm.makeRotationFromEuler(wi)),u.material.toneMapped=Qt.getTransfer(A.colorSpace)!==ae,(h!==A||d!==A.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,h=A,d=A.version,f=i.toneMapping),u.layers.enableAll(),v.unshift(u,u.geometry,u.material,0,0,null)):A&&A.isTexture&&(c===void 0&&(c=new te(new mi(2,2),new yn({name:"BackgroundMaterial",uniforms:ys(Pn.background.uniforms),vertexShader:Pn.background.vertexShader,fragmentShader:Pn.background.fragmentShader,side:Nn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=A,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=Qt.getTransfer(A.colorSpace)!==ae,A.matrixAutoUpdate===!0&&A.updateMatrix(),c.material.uniforms.uvTransform.value.copy(A.matrix),(h!==A||d!==A.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,h=A,d=A.version,f=i.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function p(v,y){v.getRGB(Lr,wh(i)),n.buffers.color.setClear(Lr.r,Lr.g,Lr.b,y,o)}function x(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(v,y=1){a.set(v),l=y,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,p(a,l)},render:_,addToRenderList:m,dispose:x}}function e0(i,t){const e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=d(null);let r=s,o=!1;function a(w,L,k,V,Z){let q=!1;const G=h(V,k,L);r!==G&&(r=G,c(r.object)),q=f(w,V,k,Z),q&&g(w,V,k,Z),Z!==null&&t.update(Z,i.ELEMENT_ARRAY_BUFFER),(q||o)&&(o=!1,y(w,L,k,V),Z!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(Z).buffer))}function l(){return i.createVertexArray()}function c(w){return i.bindVertexArray(w)}function u(w){return i.deleteVertexArray(w)}function h(w,L,k){const V=k.wireframe===!0;let Z=n[w.id];Z===void 0&&(Z={},n[w.id]=Z);let q=Z[L.id];q===void 0&&(q={},Z[L.id]=q);let G=q[V];return G===void 0&&(G=d(l()),q[V]=G),G}function d(w){const L=[],k=[],V=[];for(let Z=0;Z<e;Z++)L[Z]=0,k[Z]=0,V[Z]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:L,enabledAttributes:k,attributeDivisors:V,object:w,attributes:{},index:null}}function f(w,L,k,V){const Z=r.attributes,q=L.attributes;let G=0;const X=k.getAttributes();for(const B in X)if(X[B].location>=0){const at=Z[B];let gt=q[B];if(gt===void 0&&(B==="instanceMatrix"&&w.instanceMatrix&&(gt=w.instanceMatrix),B==="instanceColor"&&w.instanceColor&&(gt=w.instanceColor)),at===void 0||at.attribute!==gt||gt&&at.data!==gt.data)return!0;G++}return r.attributesNum!==G||r.index!==V}function g(w,L,k,V){const Z={},q=L.attributes;let G=0;const X=k.getAttributes();for(const B in X)if(X[B].location>=0){let at=q[B];at===void 0&&(B==="instanceMatrix"&&w.instanceMatrix&&(at=w.instanceMatrix),B==="instanceColor"&&w.instanceColor&&(at=w.instanceColor));const gt={};gt.attribute=at,at&&at.data&&(gt.data=at.data),Z[B]=gt,G++}r.attributes=Z,r.attributesNum=G,r.index=V}function _(){const w=r.newAttributes;for(let L=0,k=w.length;L<k;L++)w[L]=0}function m(w){p(w,0)}function p(w,L){const k=r.newAttributes,V=r.enabledAttributes,Z=r.attributeDivisors;k[w]=1,V[w]===0&&(i.enableVertexAttribArray(w),V[w]=1),Z[w]!==L&&(i.vertexAttribDivisor(w,L),Z[w]=L)}function x(){const w=r.newAttributes,L=r.enabledAttributes;for(let k=0,V=L.length;k<V;k++)L[k]!==w[k]&&(i.disableVertexAttribArray(k),L[k]=0)}function v(w,L,k,V,Z,q,G){G===!0?i.vertexAttribIPointer(w,L,k,Z,q):i.vertexAttribPointer(w,L,k,V,Z,q)}function y(w,L,k,V){_();const Z=V.attributes,q=k.getAttributes(),G=L.defaultAttributeValues;for(const X in q){const B=q[X];if(B.location>=0){let st=Z[X];if(st===void 0&&(X==="instanceMatrix"&&w.instanceMatrix&&(st=w.instanceMatrix),X==="instanceColor"&&w.instanceColor&&(st=w.instanceColor)),st!==void 0){const at=st.normalized,gt=st.itemSize,Ot=t.get(st);if(Ot===void 0)continue;const Kt=Ot.buffer,Nt=Ot.type,ne=Ot.bytesPerElement,$=Nt===i.INT||Nt===i.UNSIGNED_INT||st.gpuType===Xa;if(st.isInterleavedBufferAttribute){const Q=st.data,_t=Q.stride,Ft=st.offset;if(Q.isInstancedInterleavedBuffer){for(let Rt=0;Rt<B.locationSize;Rt++)p(B.location+Rt,Q.meshPerAttribute);w.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=Q.meshPerAttribute*Q.count)}else for(let Rt=0;Rt<B.locationSize;Rt++)m(B.location+Rt);i.bindBuffer(i.ARRAY_BUFFER,Kt);for(let Rt=0;Rt<B.locationSize;Rt++)v(B.location+Rt,gt/B.locationSize,Nt,at,_t*ne,(Ft+gt/B.locationSize*Rt)*ne,$)}else{if(st.isInstancedBufferAttribute){for(let Q=0;Q<B.locationSize;Q++)p(B.location+Q,st.meshPerAttribute);w.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=st.meshPerAttribute*st.count)}else for(let Q=0;Q<B.locationSize;Q++)m(B.location+Q);i.bindBuffer(i.ARRAY_BUFFER,Kt);for(let Q=0;Q<B.locationSize;Q++)v(B.location+Q,gt/B.locationSize,Nt,at,gt*ne,gt/B.locationSize*Q*ne,$)}}else if(G!==void 0){const at=G[X];if(at!==void 0)switch(at.length){case 2:i.vertexAttrib2fv(B.location,at);break;case 3:i.vertexAttrib3fv(B.location,at);break;case 4:i.vertexAttrib4fv(B.location,at);break;default:i.vertexAttrib1fv(B.location,at)}}}}x()}function A(){P();for(const w in n){const L=n[w];for(const k in L){const V=L[k];for(const Z in V)u(V[Z].object),delete V[Z];delete L[k]}delete n[w]}}function T(w){if(n[w.id]===void 0)return;const L=n[w.id];for(const k in L){const V=L[k];for(const Z in V)u(V[Z].object),delete V[Z];delete L[k]}delete n[w.id]}function R(w){for(const L in n){const k=n[L];if(k[w.id]===void 0)continue;const V=k[w.id];for(const Z in V)u(V[Z].object),delete V[Z];delete k[w.id]}}function P(){E(),o=!0,r!==s&&(r=s,c(r.object))}function E(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:P,resetDefaultState:E,dispose:A,releaseStatesOfGeometry:T,releaseStatesOfProgram:R,initAttributes:_,enableAttribute:m,disableUnusedAttributes:x}}function n0(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function o(c,u,h){h!==0&&(i.drawArraysInstanced(n,c,u,h),e.update(u,n,h))}function a(c,u,h){if(h===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,h);let f=0;for(let g=0;g<h;g++)f+=u[g];e.update(f,n,1)}function l(c,u,h,d){if(h===0)return;const f=t.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],u[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,d,0,h);let g=0;for(let _=0;_<h;_++)g+=u[_]*d[_];e.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function i0(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){const R=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(R){return!(R!==gn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const P=R===js&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(R!==Tn&&n.convert(R)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Un&&!P)}function l(R){if(R==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp";const u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);const h=e.logarithmicDepthBuffer===!0,d=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),v=i.getParameter(i.MAX_VARYING_VECTORS),y=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),A=g>0,T=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:h,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:x,maxVaryings:v,maxFragmentUniforms:y,vertexTextures:A,maxSamples:T}}function s0(i){const t=this;let e=null,n=0,s=!1,r=!1;const o=new Ci,a=new Ht,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(h,d){const f=h.length!==0||d||n!==0||s;return s=d,n=h.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(h,d){e=u(h,d,0)},this.setState=function(h,d,f){const g=h.clippingPlanes,_=h.clipIntersection,m=h.clipShadows,p=i.get(h);if(!s||g===null||g.length===0||r&&!m)r?u(null):c();else{const x=r?0:n,v=x*4;let y=p.clippingState||null;l.value=y,y=u(g,d,v,f);for(let A=0;A!==v;++A)y[A]=e[A];p.clippingState=y,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=x}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(h,d,f,g){const _=h!==null?h.length:0;let m=null;if(_!==0){if(m=l.value,g!==!0||m===null){const p=f+_*4,x=d.matrixWorldInverse;a.getNormalMatrix(x),(m===null||m.length<p)&&(m=new Float32Array(p));for(let v=0,y=f;v!==_;++v,y+=4)o.copy(h[v]).applyMatrix4(x,a),o.normal.toArray(m,y),m[y+3]=o.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=_,t.numIntersection=0,m}}function r0(i){let t=new WeakMap;function e(o,a){return a===ra?o.mapping=gs:a===oa&&(o.mapping=_s),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===ra||a===oa)if(t.has(o)){const l=t.get(o).texture;return e(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Qd(l.height);return c.fromEquirectangularTexture(i,o),t.set(o,c),o.addEventListener("dispose",s),e(c.texture,o.mapping)}else return null}}return o}function s(o){const a=o.target;a.removeEventListener("dispose",s);const l=t.get(a);l!==void 0&&(t.delete(a),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}const cs=4,dc=[.125,.215,.35,.446,.526,.582],Ii=20,Oo=new Ih,fc=new kt;let No=null,Fo=0,ko=0,Bo=!1;const Li=(1+Math.sqrt(5))/2,rs=1/Li,pc=[new O(-Li,rs,0),new O(Li,rs,0),new O(-rs,0,Li),new O(rs,0,Li),new O(0,Li,-rs),new O(0,Li,rs),new O(-1,1,-1),new O(1,1,-1),new O(-1,1,1),new O(1,1,1)],o0=new O;class mc{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100,r={}){const{size:o=256,position:a=o0}=r;No=this._renderer.getRenderTarget(),Fo=this._renderer.getActiveCubeFace(),ko=this._renderer.getActiveMipmapLevel(),Bo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,a),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=vc(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=_c(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(No,Fo,ko),this._renderer.xr.enabled=Bo,t.scissorTest=!1,Dr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===gs||t.mapping===_s?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),No=this._renderer.getRenderTarget(),Fo=this._renderer.getActiveCubeFace(),ko=this._renderer.getActiveMipmapLevel(),Bo=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:In,minFilter:In,generateMipmaps:!1,type:js,format:gn,colorSpace:vs,depthBuffer:!1},s=gc(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=gc(t,e,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=a0(r)),this._blurMaterial=l0(r,t,e)}return s}_compileMaterial(t){const e=new te(this._lodPlanes[0],t);this._renderer.compile(e,Oo)}_sceneToCubeUV(t,e,n,s,r){const l=new sn(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],h=this._renderer,d=h.autoClear,f=h.toneMapping;h.getClearColor(fc),h.toneMapping=pi,h.autoClear=!1,h.state.buffers.depth.getReversed()&&(h.setRenderTarget(s),h.clearDepth(),h.setRenderTarget(null));const _=new xs({name:"PMREM.Background",side:qe,depthWrite:!1,depthTest:!1}),m=new te(new Ee,_);let p=!1;const x=t.background;x?x.isColor&&(_.color.copy(x),t.background=null,p=!0):(_.color.copy(fc),p=!0);for(let v=0;v<6;v++){const y=v%3;y===0?(l.up.set(0,c[v],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[v],r.y,r.z)):y===1?(l.up.set(0,0,c[v]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[v],r.z)):(l.up.set(0,c[v],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[v]));const A=this._cubeSize;Dr(s,y*A,v>2?A:0,A,A),h.setRenderTarget(s),p&&h.render(m,l),h.render(t,l)}m.geometry.dispose(),m.material.dispose(),h.toneMapping=f,h.autoClear=d,t.background=x}_textureToCubeUV(t,e){const n=this._renderer,s=t.mapping===gs||t.mapping===_s;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=vc()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=_c());const r=s?this._cubemapMaterial:this._equirectMaterial,o=new te(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=t;const l=this._cubeSize;Dr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(o,Oo)}_applyPMREM(t){const e=this._renderer,n=e.autoClear;e.autoClear=!1;const s=this._lodPlanes.length;for(let r=1;r<s;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=pc[(s-r-1)%pc.length];this._blur(t,r-1,r,o,a)}e.autoClear=n}_blur(t,e,n,s,r){const o=this._pingPongRenderTarget;this._halfBlur(t,o,e,n,s,"latitudinal",r),this._halfBlur(o,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const u=3,h=new te(this._lodPlanes[s],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Ii-1),_=r/g,m=isFinite(r)?1+Math.floor(u*_):Ii;m>Ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ii}`);const p=[];let x=0;for(let R=0;R<Ii;++R){const P=R/_,E=Math.exp(-P*P/2);p.push(E),R===0?x+=E:R<m&&(x+=2*E)}for(let R=0;R<p.length;R++)p[R]=p[R]/x;d.envMap.value=t.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:v}=this;d.dTheta.value=g,d.mipInt.value=v-n;const y=this._sizeLods[s],A=3*y*(s>v-cs?s-v+cs:0),T=4*(this._cubeSize-y);Dr(e,A,T,3*y,2*y),l.setRenderTarget(e),l.render(h,Oo)}}function a0(i){const t=[],e=[],n=[];let s=i;const r=i-cs+1+dc.length;for(let o=0;o<r;o++){const a=Math.pow(2,s);e.push(a);let l=1/a;o>i-cs?l=dc[o-i+cs-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),u=-c,h=1+c,d=[u,u,h,u,h,h,u,u,h,h,u,h],f=6,g=6,_=3,m=2,p=1,x=new Float32Array(_*g*f),v=new Float32Array(m*g*f),y=new Float32Array(p*g*f);for(let T=0;T<f;T++){const R=T%3*2/3-1,P=T>2?0:-1,E=[R,P,0,R+2/3,P,0,R+2/3,P+1,0,R,P,0,R+2/3,P+1,0,R,P+1,0];x.set(E,_*g*T),v.set(d,m*g*T);const w=[T,T,T,T,T,T];y.set(w,p*g*T)}const A=new Ze;A.setAttribute("position",new Ae(x,_)),A.setAttribute("uv",new Ae(v,m)),A.setAttribute("faceIndex",new Ae(y,p)),t.push(A),s>cs&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function gc(i,t,e){const n=new Fi(i,t,e);return n.texture.mapping=no,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Dr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function l0(i,t,e){const n=new Float32Array(Ii),s=new O(0,1,0);return new yn({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:ol(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function _c(){return new yn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ol(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function vc(){return new yn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ol(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function ol(){return`

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
	`}function c0(i){let t=new WeakMap,e=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===ra||l===oa,u=l===gs||l===_s;if(c||u){let h=t.get(a);const d=h!==void 0?h.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return e===null&&(e=new mc(i)),h=c?e.fromEquirectangular(a,h):e.fromCubemap(a,h),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),h.texture;if(h!==void 0)return h.texture;{const f=a.image;return c&&f&&f.height>0||u&&f&&s(f)?(e===null&&(e=new mc(i)),h=c?e.fromEquirectangular(a):e.fromCubemap(a),h.texture.pmremVersion=a.pmremVersion,t.set(a,h),a.addEventListener("dispose",r),h.texture):null}}}return a}function s(a){let l=0;const c=6;for(let u=0;u<c;u++)a[u]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function o(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:o}}function h0(i){const t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){const s=e(n);return s===null&&Zs("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function u0(i,t,e,n){const s={},r=new WeakMap;function o(h){const d=h.target;d.index!==null&&t.remove(d.index);for(const g in d.attributes)t.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete s[d.id];const f=r.get(d);f&&(t.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,e.memory.geometries--}function a(h,d){return s[d.id]===!0||(d.addEventListener("dispose",o),s[d.id]=!0,e.memory.geometries++),d}function l(h){const d=h.attributes;for(const f in d)t.update(d[f],i.ARRAY_BUFFER)}function c(h){const d=[],f=h.index,g=h.attributes.position;let _=0;if(f!==null){const x=f.array;_=f.version;for(let v=0,y=x.length;v<y;v+=3){const A=x[v+0],T=x[v+1],R=x[v+2];d.push(A,T,T,R,R,A)}}else if(g!==void 0){const x=g.array;_=g.version;for(let v=0,y=x.length/3-1;v<y;v+=3){const A=v+0,T=v+1,R=v+2;d.push(A,T,T,R,R,A)}}else return;const m=new(yh(d)?bh:Eh)(d,1);m.version=_;const p=r.get(h);p&&t.remove(p),r.set(h,m)}function u(h){const d=r.get(h);if(d){const f=h.index;f!==null&&d.version<f.version&&c(h)}else c(h);return r.get(h)}return{get:a,update:l,getWireframeAttribute:u}}function d0(i,t,e){let n;function s(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){i.drawElements(n,f,r,d*o),e.update(f,n,1)}function c(d,f,g){g!==0&&(i.drawElementsInstanced(n,f,r,d*o,g),e.update(f,n,g))}function u(d,f,g){if(g===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];e.update(m,n,1)}function h(d,f,g,_){if(g===0)return;const m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],_[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,_,0,g);let p=0;for(let x=0;x<g;x++)p+=f[x]*_[x];e.update(p,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=h}function f0(i){const t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(e.calls++,o){case i.TRIANGLES:e.triangles+=a*(r/3);break;case i.LINES:e.lines+=a*(r/2);break;case i.LINE_STRIP:e.lines+=a*(r-1);break;case i.LINE_LOOP:e.lines+=a*r;break;case i.POINTS:e.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function p0(i,t,e){const n=new WeakMap,s=new Me;function r(o,a,l){const c=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,h=u!==void 0?u.length:0;let d=n.get(a);if(d===void 0||d.count!==h){let w=function(){P.dispose(),n.delete(a),a.removeEventListener("dispose",w)};var f=w;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,_=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],x=a.morphAttributes.normal||[],v=a.morphAttributes.color||[];let y=0;g===!0&&(y=1),_===!0&&(y=2),m===!0&&(y=3);let A=a.attributes.position.count*y,T=1;A>t.maxTextureSize&&(T=Math.ceil(A/t.maxTextureSize),A=t.maxTextureSize);const R=new Float32Array(A*T*4*h),P=new tl(R,A,T,h);P.type=Un,P.needsUpdate=!0;const E=y*4;for(let L=0;L<h;L++){const k=p[L],V=x[L],Z=v[L],q=A*T*4*L;for(let G=0;G<k.count;G++){const X=G*E;g===!0&&(s.fromBufferAttribute(k,G),R[q+X+0]=s.x,R[q+X+1]=s.y,R[q+X+2]=s.z,R[q+X+3]=0),_===!0&&(s.fromBufferAttribute(V,G),R[q+X+4]=s.x,R[q+X+5]=s.y,R[q+X+6]=s.z,R[q+X+7]=0),m===!0&&(s.fromBufferAttribute(Z,G),R[q+X+8]=s.x,R[q+X+9]=s.y,R[q+X+10]=s.z,R[q+X+11]=Z.itemSize===4?s.w:1)}}d={count:h,texture:P,size:new ee(A,T)},n.set(a,d),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,e);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const _=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",d.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",d.size)}return{update:r}}function m0(i,t,e,n){let s=new WeakMap;function r(l){const c=n.render.frame,u=l.geometry,h=t.get(l,u);if(s.get(h)!==c&&(t.update(h),s.set(h,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;s.get(d)!==c&&(d.update(),s.set(d,c))}return h}function o(){s=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:o}}const Oh=new ke,xc=new Lh(1,1),Nh=new tl,Fh=new Nd,kh=new Ah,yc=[],Mc=[],Sc=new Float32Array(16),Ec=new Float32Array(9),bc=new Float32Array(4);function As(i,t,e){const n=i[0];if(n<=0||n>0)return i;const s=t*e;let r=yc[s];if(r===void 0&&(r=new Float32Array(s),yc[s]=r),t!==0){n.toArray(r,0);for(let o=1,a=0;o!==t;++o)a+=e,i[o].toArray(r,a)}return r}function Re(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function Ce(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function io(i,t){let e=Mc[t];e===void 0&&(e=new Int32Array(t),Mc[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function g0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function _0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Re(e,t))return;i.uniform2fv(this.addr,t),Ce(e,t)}}function v0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(Re(e,t))return;i.uniform3fv(this.addr,t),Ce(e,t)}}function x0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Re(e,t))return;i.uniform4fv(this.addr,t),Ce(e,t)}}function y0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Re(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),Ce(e,t)}else{if(Re(e,n))return;bc.set(n),i.uniformMatrix2fv(this.addr,!1,bc),Ce(e,n)}}function M0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Re(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),Ce(e,t)}else{if(Re(e,n))return;Ec.set(n),i.uniformMatrix3fv(this.addr,!1,Ec),Ce(e,n)}}function S0(i,t){const e=this.cache,n=t.elements;if(n===void 0){if(Re(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),Ce(e,t)}else{if(Re(e,n))return;Sc.set(n),i.uniformMatrix4fv(this.addr,!1,Sc),Ce(e,n)}}function E0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function b0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Re(e,t))return;i.uniform2iv(this.addr,t),Ce(e,t)}}function w0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Re(e,t))return;i.uniform3iv(this.addr,t),Ce(e,t)}}function T0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Re(e,t))return;i.uniform4iv(this.addr,t),Ce(e,t)}}function A0(i,t){const e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function R0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(Re(e,t))return;i.uniform2uiv(this.addr,t),Ce(e,t)}}function C0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(Re(e,t))return;i.uniform3uiv(this.addr,t),Ce(e,t)}}function L0(i,t){const e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(Re(e,t))return;i.uniform4uiv(this.addr,t),Ce(e,t)}}function D0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(xc.compareFunction=xh,r=xc):r=Oh,e.setTexture2D(t||r,s)}function P0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Fh,s)}function I0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||kh,s)}function U0(i,t,e){const n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||Nh,s)}function O0(i){switch(i){case 5126:return g0;case 35664:return _0;case 35665:return v0;case 35666:return x0;case 35674:return y0;case 35675:return M0;case 35676:return S0;case 5124:case 35670:return E0;case 35667:case 35671:return b0;case 35668:case 35672:return w0;case 35669:case 35673:return T0;case 5125:return A0;case 36294:return R0;case 36295:return C0;case 36296:return L0;case 35678:case 36198:case 36298:case 36306:case 35682:return D0;case 35679:case 36299:case 36307:return P0;case 35680:case 36300:case 36308:case 36293:return I0;case 36289:case 36303:case 36311:case 36292:return U0}}function N0(i,t){i.uniform1fv(this.addr,t)}function F0(i,t){const e=As(t,this.size,2);i.uniform2fv(this.addr,e)}function k0(i,t){const e=As(t,this.size,3);i.uniform3fv(this.addr,e)}function B0(i,t){const e=As(t,this.size,4);i.uniform4fv(this.addr,e)}function z0(i,t){const e=As(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function G0(i,t){const e=As(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function H0(i,t){const e=As(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function V0(i,t){i.uniform1iv(this.addr,t)}function W0(i,t){i.uniform2iv(this.addr,t)}function X0(i,t){i.uniform3iv(this.addr,t)}function q0(i,t){i.uniform4iv(this.addr,t)}function K0(i,t){i.uniform1uiv(this.addr,t)}function Y0(i,t){i.uniform2uiv(this.addr,t)}function $0(i,t){i.uniform3uiv(this.addr,t)}function Z0(i,t){i.uniform4uiv(this.addr,t)}function j0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Re(n,r)||(i.uniform1iv(this.addr,r),Ce(n,r));for(let o=0;o!==s;++o)e.setTexture2D(t[o]||Oh,r[o])}function J0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Re(n,r)||(i.uniform1iv(this.addr,r),Ce(n,r));for(let o=0;o!==s;++o)e.setTexture3D(t[o]||Fh,r[o])}function Q0(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Re(n,r)||(i.uniform1iv(this.addr,r),Ce(n,r));for(let o=0;o!==s;++o)e.setTextureCube(t[o]||kh,r[o])}function tg(i,t,e){const n=this.cache,s=t.length,r=io(e,s);Re(n,r)||(i.uniform1iv(this.addr,r),Ce(n,r));for(let o=0;o!==s;++o)e.setTexture2DArray(t[o]||Nh,r[o])}function eg(i){switch(i){case 5126:return N0;case 35664:return F0;case 35665:return k0;case 35666:return B0;case 35674:return z0;case 35675:return G0;case 35676:return H0;case 5124:case 35670:return V0;case 35667:case 35671:return W0;case 35668:case 35672:return X0;case 35669:case 35673:return q0;case 5125:return K0;case 36294:return Y0;case 36295:return $0;case 36296:return Z0;case 35678:case 36198:case 36298:case 36306:case 35682:return j0;case 35679:case 36299:case 36307:return J0;case 35680:case 36300:case 36308:case 36293:return Q0;case 36289:case 36303:case 36311:case 36292:return tg}}class ng{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=O0(e.type)}}class ig{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=eg(e.type)}}class sg{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(t,e[a.id],n)}}}const zo=/(\w+)(\])?(\[|\.)?/g;function wc(i,t){i.seq.push(t),i.map[t.id]=t}function rg(i,t,e){const n=i.name,s=n.length;for(zo.lastIndex=0;;){const r=zo.exec(n),o=zo.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){wc(e,c===void 0?new ng(a,i,t):new ig(a,i,t));break}else{let h=e.map[a];h===void 0&&(h=new sg(a),wc(e,h)),e=h}}}class Gr{constructor(t,e){this.seq=[],this.map={};const n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){const r=t.getActiveUniform(e,s),o=t.getUniformLocation(e,r.name);rg(r,o,this)}}setValue(t,e,n,s){const r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){const s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,o=e.length;r!==o;++r){const a=e[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(t,l.value,s)}}static seqWithValue(t,e){const n=[];for(let s=0,r=t.length;s!==r;++s){const o=t[s];o.id in e&&n.push(o)}return n}}function Tc(i,t,e){const n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}const og=37297;let ag=0;function lg(i,t){const e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===t?">":" "} ${a}: ${e[o]}`)}return n.join(`
`)}const Ac=new Ht;function cg(i){Qt._getMatrix(Ac,Qt.workingColorSpace,i);const t=`mat3( ${Ac.elements.map(e=>e.toFixed(4))} )`;switch(Qt.getTransfer(i)){case Kr:return[t,"LinearTransferOETF"];case ae:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Rc(i,t,e){const n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return e.toUpperCase()+`

`+r+`

`+lg(i.getShaderSource(t),a)}else return r}function hg(i,t){const e=cg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function ug(i,t){let e;switch(t){case Yu:e="Linear";break;case $u:e="Reinhard";break;case Zu:e="Cineon";break;case ju:e="ACESFilmic";break;case Qu:e="AgX";break;case td:e="Neutral";break;case Ju:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}const Pr=new O;function dg(){Qt.getLuminanceCoefficients(Pr);const i=Pr.x.toFixed(4),t=Pr.y.toFixed(4),e=Pr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function fg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Gs).join(`
`)}function pg(i){const t=[];for(const e in i){const n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function mg(i,t){const e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(t,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),e[o]={type:r.type,location:i.getAttribLocation(t,o),locationSize:a}}return e}function Gs(i){return i!==""}function Cc(i,t){const e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function Lc(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}const gg=/^[ \t]*#include +<([\w\d./]+)>/gm;function ka(i){return i.replace(gg,vg)}const _g=new Map;function vg(i,t){let e=Wt[t];if(e===void 0){const n=_g.get(t);if(n!==void 0)e=Wt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return ka(e)}const xg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Dc(i){return i.replace(xg,yg)}function yg(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Pc(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function Mg(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===ch?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===Au?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===qn&&(t="SHADOWMAP_TYPE_VSM"),t}function Sg(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case gs:case _s:t="ENVMAP_TYPE_CUBE";break;case no:t="ENVMAP_TYPE_CUBE_UV";break}return t}function Eg(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case _s:t="ENVMAP_MODE_REFRACTION";break}return t}function bg(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case Wa:t="ENVMAP_BLENDING_MULTIPLY";break;case qu:t="ENVMAP_BLENDING_MIX";break;case Ku:t="ENVMAP_BLENDING_ADD";break}return t}function wg(i){const t=i.envMapCubeUVHeight;if(t===null)return null;const e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function Tg(i,t,e,n){const s=i.getContext(),r=e.defines;let o=e.vertexShader,a=e.fragmentShader;const l=Mg(e),c=Sg(e),u=Eg(e),h=bg(e),d=wg(e),f=fg(e),g=pg(r),_=s.createProgram();let m,p,x=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Gs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g].filter(Gs).join(`
`),p.length>0&&(p+=`
`)):(m=[Pc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Gs).join(`
`),p=[Pc(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,g,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+h:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==pi?"#define TONE_MAPPING":"",e.toneMapping!==pi?Wt.tonemapping_pars_fragment:"",e.toneMapping!==pi?ug("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Wt.colorspace_pars_fragment,hg("linearToOutputTexel",e.outputColorSpace),dg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Gs).join(`
`)),o=ka(o),o=Cc(o,e),o=Lc(o,e),a=ka(a),a=Cc(a,e),a=Lc(a,e),o=Dc(o),a=Dc(a),e.isRawShaderMaterial!==!0&&(x=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Yr?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Yr?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const v=x+m+o,y=x+p+a,A=Tc(s,s.VERTEX_SHADER,v),T=Tc(s,s.FRAGMENT_SHADER,y);s.attachShader(_,A),s.attachShader(_,T),e.index0AttributeName!==void 0?s.bindAttribLocation(_,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function R(L){if(i.debug.checkShaderErrors){const k=s.getProgramInfoLog(_)||"",V=s.getShaderInfoLog(A)||"",Z=s.getShaderInfoLog(T)||"",q=k.trim(),G=V.trim(),X=Z.trim();let B=!0,st=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(B=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,A,T);else{const at=Rc(s,A,"vertex"),gt=Rc(s,T,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+L.name+`
Material Type: `+L.type+`

Program Info Log: `+q+`
`+at+`
`+gt)}else q!==""?console.warn("THREE.WebGLProgram: Program Info Log:",q):(G===""||X==="")&&(st=!1);st&&(L.diagnostics={runnable:B,programLog:q,vertexShader:{log:G,prefix:m},fragmentShader:{log:X,prefix:p}})}s.deleteShader(A),s.deleteShader(T),P=new Gr(s,_),E=mg(s,_)}let P;this.getUniforms=function(){return P===void 0&&R(this),P};let E;this.getAttributes=function(){return E===void 0&&R(this),E};let w=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return w===!1&&(w=s.getProgramParameter(_,og)),w},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=ag++,this.cacheKey=t,this.usedTimes=1,this.program=_,this.vertexShader=A,this.fragmentShader=T,this}let Ag=0;class Rg{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){const e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(t);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(t){const e=this.materialCache.get(t);for(const n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){const e=this.materialCache;let n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){const e=this.shaderCache;let n=e.get(t);return n===void 0&&(n=new Cg(t),e.set(t,n)),n}}class Cg{constructor(t){this.id=Ag++,this.code=t,this.usedTimes=0}}function Lg(i,t,e,n,s,r,o){const a=new Mh,l=new Rg,c=new Set,u=[],h=s.logarithmicDepthBuffer,d=s.vertexTextures;let f=s.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(E){return c.add(E),E===0?"uv":`uv${E}`}function m(E,w,L,k,V){const Z=k.fog,q=V.geometry,G=E.isMeshStandardMaterial?k.environment:null,X=(E.isMeshStandardMaterial?e:t).get(E.envMap||G),B=X&&X.mapping===no?X.image.height:null,st=g[E.type];E.precision!==null&&(f=s.getMaxPrecision(E.precision),f!==E.precision&&console.warn("THREE.WebGLProgram.getParameters:",E.precision,"not supported, using",f,"instead."));const at=q.morphAttributes.position||q.morphAttributes.normal||q.morphAttributes.color,gt=at!==void 0?at.length:0;let Ot=0;q.morphAttributes.position!==void 0&&(Ot=1),q.morphAttributes.normal!==void 0&&(Ot=2),q.morphAttributes.color!==void 0&&(Ot=3);let Kt,Nt,ne,$;if(st){const ie=Pn[st];Kt=ie.vertexShader,Nt=ie.fragmentShader}else Kt=E.vertexShader,Nt=E.fragmentShader,l.update(E),ne=l.getVertexShaderID(E),$=l.getFragmentShaderID(E);const Q=i.getRenderTarget(),_t=i.state.buffers.depth.getReversed(),Ft=V.isInstancedMesh===!0,Rt=V.isBatchedMesh===!0,Zt=!!E.map,Pe=!!E.matcap,D=!!X,fe=!!E.aoMap,zt=!!E.lightMap,It=!!E.bumpMap,Mt=!!E.normalMap,pe=!!E.displacementMap,St=!!E.emissiveMap,Vt=!!E.metalnessMap,Le=!!E.roughnessMap,Se=E.anisotropy>0,C=E.clearcoat>0,M=E.dispersion>0,F=E.iridescence>0,K=E.sheen>0,J=E.transmission>0,W=Se&&!!E.anisotropyMap,At=C&&!!E.clearcoatMap,rt=C&&!!E.clearcoatNormalMap,Et=C&&!!E.clearcoatRoughnessMap,wt=F&&!!E.iridescenceMap,nt=F&&!!E.iridescenceThicknessMap,dt=K&&!!E.sheenColorMap,Pt=K&&!!E.sheenRoughnessMap,Tt=!!E.specularMap,ht=!!E.specularColorMap,Gt=!!E.specularIntensityMap,I=J&&!!E.transmissionMap,it=J&&!!E.thicknessMap,ot=!!E.gradientMap,mt=!!E.alphaMap,tt=E.alphaTest>0,j=!!E.alphaHash,yt=!!E.extensions;let Bt=pi;E.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Bt=i.toneMapping);const he={shaderID:st,shaderType:E.type,shaderName:E.name,vertexShader:Kt,fragmentShader:Nt,defines:E.defines,customVertexShaderID:ne,customFragmentShaderID:$,isRawShaderMaterial:E.isRawShaderMaterial===!0,glslVersion:E.glslVersion,precision:f,batching:Rt,batchingColor:Rt&&V._colorsTexture!==null,instancing:Ft,instancingColor:Ft&&V.instanceColor!==null,instancingMorph:Ft&&V.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:Q===null?i.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:vs,alphaToCoverage:!!E.alphaToCoverage,map:Zt,matcap:Pe,envMap:D,envMapMode:D&&X.mapping,envMapCubeUVHeight:B,aoMap:fe,lightMap:zt,bumpMap:It,normalMap:Mt,displacementMap:d&&pe,emissiveMap:St,normalMapObjectSpace:Mt&&E.normalMapType===sd,normalMapTangentSpace:Mt&&E.normalMapType===vh,metalnessMap:Vt,roughnessMap:Le,anisotropy:Se,anisotropyMap:W,clearcoat:C,clearcoatMap:At,clearcoatNormalMap:rt,clearcoatRoughnessMap:Et,dispersion:M,iridescence:F,iridescenceMap:wt,iridescenceThicknessMap:nt,sheen:K,sheenColorMap:dt,sheenRoughnessMap:Pt,specularMap:Tt,specularColorMap:ht,specularIntensityMap:Gt,transmission:J,transmissionMap:I,thicknessMap:it,gradientMap:ot,opaque:E.transparent===!1&&E.blending===hs&&E.alphaToCoverage===!1,alphaMap:mt,alphaTest:tt,alphaHash:j,combine:E.combine,mapUv:Zt&&_(E.map.channel),aoMapUv:fe&&_(E.aoMap.channel),lightMapUv:zt&&_(E.lightMap.channel),bumpMapUv:It&&_(E.bumpMap.channel),normalMapUv:Mt&&_(E.normalMap.channel),displacementMapUv:pe&&_(E.displacementMap.channel),emissiveMapUv:St&&_(E.emissiveMap.channel),metalnessMapUv:Vt&&_(E.metalnessMap.channel),roughnessMapUv:Le&&_(E.roughnessMap.channel),anisotropyMapUv:W&&_(E.anisotropyMap.channel),clearcoatMapUv:At&&_(E.clearcoatMap.channel),clearcoatNormalMapUv:rt&&_(E.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:Et&&_(E.clearcoatRoughnessMap.channel),iridescenceMapUv:wt&&_(E.iridescenceMap.channel),iridescenceThicknessMapUv:nt&&_(E.iridescenceThicknessMap.channel),sheenColorMapUv:dt&&_(E.sheenColorMap.channel),sheenRoughnessMapUv:Pt&&_(E.sheenRoughnessMap.channel),specularMapUv:Tt&&_(E.specularMap.channel),specularColorMapUv:ht&&_(E.specularColorMap.channel),specularIntensityMapUv:Gt&&_(E.specularIntensityMap.channel),transmissionMapUv:I&&_(E.transmissionMap.channel),thicknessMapUv:it&&_(E.thicknessMap.channel),alphaMapUv:mt&&_(E.alphaMap.channel),vertexTangents:!!q.attributes.tangent&&(Mt||Se),vertexColors:E.vertexColors,vertexAlphas:E.vertexColors===!0&&!!q.attributes.color&&q.attributes.color.itemSize===4,pointsUvs:V.isPoints===!0&&!!q.attributes.uv&&(Zt||mt),fog:!!Z,useFog:E.fog===!0,fogExp2:!!Z&&Z.isFogExp2,flatShading:E.flatShading===!0&&E.wireframe===!1,sizeAttenuation:E.sizeAttenuation===!0,logarithmicDepthBuffer:h,reversedDepthBuffer:_t,skinning:V.isSkinnedMesh===!0,morphTargets:q.morphAttributes.position!==void 0,morphNormals:q.morphAttributes.normal!==void 0,morphColors:q.morphAttributes.color!==void 0,morphTargetsCount:gt,morphTextureStride:Ot,numDirLights:w.directional.length,numPointLights:w.point.length,numSpotLights:w.spot.length,numSpotLightMaps:w.spotLightMap.length,numRectAreaLights:w.rectArea.length,numHemiLights:w.hemi.length,numDirLightShadows:w.directionalShadowMap.length,numPointLightShadows:w.pointShadowMap.length,numSpotLightShadows:w.spotShadowMap.length,numSpotLightShadowsWithMaps:w.numSpotLightShadowsWithMaps,numLightProbes:w.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:E.dithering,shadowMapEnabled:i.shadowMap.enabled&&L.length>0,shadowMapType:i.shadowMap.type,toneMapping:Bt,decodeVideoTexture:Zt&&E.map.isVideoTexture===!0&&Qt.getTransfer(E.map.colorSpace)===ae,decodeVideoTextureEmissive:St&&E.emissiveMap.isVideoTexture===!0&&Qt.getTransfer(E.emissiveMap.colorSpace)===ae,premultipliedAlpha:E.premultipliedAlpha,doubleSided:E.side===Ye,flipSided:E.side===qe,useDepthPacking:E.depthPacking>=0,depthPacking:E.depthPacking||0,index0AttributeName:E.index0AttributeName,extensionClipCullDistance:yt&&E.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(yt&&E.extensions.multiDraw===!0||Rt)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:E.customProgramCacheKey()};return he.vertexUv1s=c.has(1),he.vertexUv2s=c.has(2),he.vertexUv3s=c.has(3),c.clear(),he}function p(E){const w=[];if(E.shaderID?w.push(E.shaderID):(w.push(E.customVertexShaderID),w.push(E.customFragmentShaderID)),E.defines!==void 0)for(const L in E.defines)w.push(L),w.push(E.defines[L]);return E.isRawShaderMaterial===!1&&(x(w,E),v(w,E),w.push(i.outputColorSpace)),w.push(E.customProgramCacheKey),w.join()}function x(E,w){E.push(w.precision),E.push(w.outputColorSpace),E.push(w.envMapMode),E.push(w.envMapCubeUVHeight),E.push(w.mapUv),E.push(w.alphaMapUv),E.push(w.lightMapUv),E.push(w.aoMapUv),E.push(w.bumpMapUv),E.push(w.normalMapUv),E.push(w.displacementMapUv),E.push(w.emissiveMapUv),E.push(w.metalnessMapUv),E.push(w.roughnessMapUv),E.push(w.anisotropyMapUv),E.push(w.clearcoatMapUv),E.push(w.clearcoatNormalMapUv),E.push(w.clearcoatRoughnessMapUv),E.push(w.iridescenceMapUv),E.push(w.iridescenceThicknessMapUv),E.push(w.sheenColorMapUv),E.push(w.sheenRoughnessMapUv),E.push(w.specularMapUv),E.push(w.specularColorMapUv),E.push(w.specularIntensityMapUv),E.push(w.transmissionMapUv),E.push(w.thicknessMapUv),E.push(w.combine),E.push(w.fogExp2),E.push(w.sizeAttenuation),E.push(w.morphTargetsCount),E.push(w.morphAttributeCount),E.push(w.numDirLights),E.push(w.numPointLights),E.push(w.numSpotLights),E.push(w.numSpotLightMaps),E.push(w.numHemiLights),E.push(w.numRectAreaLights),E.push(w.numDirLightShadows),E.push(w.numPointLightShadows),E.push(w.numSpotLightShadows),E.push(w.numSpotLightShadowsWithMaps),E.push(w.numLightProbes),E.push(w.shadowMapType),E.push(w.toneMapping),E.push(w.numClippingPlanes),E.push(w.numClipIntersection),E.push(w.depthPacking)}function v(E,w){a.disableAll(),w.supportsVertexTextures&&a.enable(0),w.instancing&&a.enable(1),w.instancingColor&&a.enable(2),w.instancingMorph&&a.enable(3),w.matcap&&a.enable(4),w.envMap&&a.enable(5),w.normalMapObjectSpace&&a.enable(6),w.normalMapTangentSpace&&a.enable(7),w.clearcoat&&a.enable(8),w.iridescence&&a.enable(9),w.alphaTest&&a.enable(10),w.vertexColors&&a.enable(11),w.vertexAlphas&&a.enable(12),w.vertexUv1s&&a.enable(13),w.vertexUv2s&&a.enable(14),w.vertexUv3s&&a.enable(15),w.vertexTangents&&a.enable(16),w.anisotropy&&a.enable(17),w.alphaHash&&a.enable(18),w.batching&&a.enable(19),w.dispersion&&a.enable(20),w.batchingColor&&a.enable(21),w.gradientMap&&a.enable(22),E.push(a.mask),a.disableAll(),w.fog&&a.enable(0),w.useFog&&a.enable(1),w.flatShading&&a.enable(2),w.logarithmicDepthBuffer&&a.enable(3),w.reversedDepthBuffer&&a.enable(4),w.skinning&&a.enable(5),w.morphTargets&&a.enable(6),w.morphNormals&&a.enable(7),w.morphColors&&a.enable(8),w.premultipliedAlpha&&a.enable(9),w.shadowMapEnabled&&a.enable(10),w.doubleSided&&a.enable(11),w.flipSided&&a.enable(12),w.useDepthPacking&&a.enable(13),w.dithering&&a.enable(14),w.transmission&&a.enable(15),w.sheen&&a.enable(16),w.opaque&&a.enable(17),w.pointsUvs&&a.enable(18),w.decodeVideoTexture&&a.enable(19),w.decodeVideoTextureEmissive&&a.enable(20),w.alphaToCoverage&&a.enable(21),E.push(a.mask)}function y(E){const w=g[E.type];let L;if(w){const k=Pn[w];L=$d.clone(k.uniforms)}else L=E.uniforms;return L}function A(E,w){let L;for(let k=0,V=u.length;k<V;k++){const Z=u[k];if(Z.cacheKey===w){L=Z,++L.usedTimes;break}}return L===void 0&&(L=new Tg(i,w,E,r),u.push(L)),L}function T(E){if(--E.usedTimes===0){const w=u.indexOf(E);u[w]=u[u.length-1],u.pop(),E.destroy()}}function R(E){l.remove(E)}function P(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:y,acquireProgram:A,releaseProgram:T,releaseShaderCache:R,programs:u,dispose:P}}function Dg(){let i=new WeakMap;function t(o){return i.has(o)}function e(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Pg(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function Ic(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Uc(){const i=[];let t=0;const e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function o(h,d,f,g,_,m){let p=i[t];return p===void 0?(p={id:h.id,object:h,geometry:d,material:f,groupOrder:g,renderOrder:h.renderOrder,z:_,group:m},i[t]=p):(p.id=h.id,p.object=h,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=h.renderOrder,p.z=_,p.group=m),t++,p}function a(h,d,f,g,_,m){const p=o(h,d,f,g,_,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):e.push(p)}function l(h,d,f,g,_,m){const p=o(h,d,f,g,_,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):e.unshift(p)}function c(h,d){e.length>1&&e.sort(h||Pg),n.length>1&&n.sort(d||Ic),s.length>1&&s.sort(d||Ic)}function u(){for(let h=t,d=i.length;h<d;h++){const f=i[h];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:u,sort:c}}function Ig(){let i=new WeakMap;function t(n,s){const r=i.get(n);let o;return r===void 0?(o=new Uc,i.set(n,[o])):s>=r.length?(o=new Uc,r.push(o)):o=r[s],o}function e(){i=new WeakMap}return{get:t,dispose:e}}function Ug(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new O,color:new kt};break;case"SpotLight":e={position:new O,direction:new O,color:new kt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new O,color:new kt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new O,skyColor:new kt,groundColor:new kt};break;case"RectAreaLight":e={color:new kt,position:new O,halfWidth:new O,halfHeight:new O};break}return i[t.id]=e,e}}}function Og(){const i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ee,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}let Ng=0;function Fg(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function kg(i){const t=new Ug,e=Og(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new O);const s=new O,r=new ce,o=new ce;function a(c){let u=0,h=0,d=0;for(let E=0;E<9;E++)n.probe[E].set(0,0,0);let f=0,g=0,_=0,m=0,p=0,x=0,v=0,y=0,A=0,T=0,R=0;c.sort(Fg);for(let E=0,w=c.length;E<w;E++){const L=c[E],k=L.color,V=L.intensity,Z=L.distance,q=L.shadow&&L.shadow.map?L.shadow.map.texture:null;if(L.isAmbientLight)u+=k.r*V,h+=k.g*V,d+=k.b*V;else if(L.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(L.sh.coefficients[G],V);R++}else if(L.isDirectionalLight){const G=t.get(L);if(G.color.copy(L.color).multiplyScalar(L.intensity),L.castShadow){const X=L.shadow,B=e.get(L);B.shadowIntensity=X.intensity,B.shadowBias=X.bias,B.shadowNormalBias=X.normalBias,B.shadowRadius=X.radius,B.shadowMapSize=X.mapSize,n.directionalShadow[f]=B,n.directionalShadowMap[f]=q,n.directionalShadowMatrix[f]=L.shadow.matrix,x++}n.directional[f]=G,f++}else if(L.isSpotLight){const G=t.get(L);G.position.setFromMatrixPosition(L.matrixWorld),G.color.copy(k).multiplyScalar(V),G.distance=Z,G.coneCos=Math.cos(L.angle),G.penumbraCos=Math.cos(L.angle*(1-L.penumbra)),G.decay=L.decay,n.spot[_]=G;const X=L.shadow;if(L.map&&(n.spotLightMap[A]=L.map,A++,X.updateMatrices(L),L.castShadow&&T++),n.spotLightMatrix[_]=X.matrix,L.castShadow){const B=e.get(L);B.shadowIntensity=X.intensity,B.shadowBias=X.bias,B.shadowNormalBias=X.normalBias,B.shadowRadius=X.radius,B.shadowMapSize=X.mapSize,n.spotShadow[_]=B,n.spotShadowMap[_]=q,y++}_++}else if(L.isRectAreaLight){const G=t.get(L);G.color.copy(k).multiplyScalar(V),G.halfWidth.set(L.width*.5,0,0),G.halfHeight.set(0,L.height*.5,0),n.rectArea[m]=G,m++}else if(L.isPointLight){const G=t.get(L);if(G.color.copy(L.color).multiplyScalar(L.intensity),G.distance=L.distance,G.decay=L.decay,L.castShadow){const X=L.shadow,B=e.get(L);B.shadowIntensity=X.intensity,B.shadowBias=X.bias,B.shadowNormalBias=X.normalBias,B.shadowRadius=X.radius,B.shadowMapSize=X.mapSize,B.shadowCameraNear=X.camera.near,B.shadowCameraFar=X.camera.far,n.pointShadow[g]=B,n.pointShadowMap[g]=q,n.pointShadowMatrix[g]=L.shadow.matrix,v++}n.point[g]=G,g++}else if(L.isHemisphereLight){const G=t.get(L);G.skyColor.copy(L.color).multiplyScalar(V),G.groundColor.copy(L.groundColor).multiplyScalar(V),n.hemi[p]=G,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ct.LTC_FLOAT_1,n.rectAreaLTC2=ct.LTC_FLOAT_2):(n.rectAreaLTC1=ct.LTC_HALF_1,n.rectAreaLTC2=ct.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=h,n.ambient[2]=d;const P=n.hash;(P.directionalLength!==f||P.pointLength!==g||P.spotLength!==_||P.rectAreaLength!==m||P.hemiLength!==p||P.numDirectionalShadows!==x||P.numPointShadows!==v||P.numSpotShadows!==y||P.numSpotMaps!==A||P.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=x,n.directionalShadowMap.length=x,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=y,n.spotShadowMap.length=y,n.directionalShadowMatrix.length=x,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=y+A-T,n.spotLightMap.length=A,n.numSpotLightShadowsWithMaps=T,n.numLightProbes=R,P.directionalLength=f,P.pointLength=g,P.spotLength=_,P.rectAreaLength=m,P.hemiLength=p,P.numDirectionalShadows=x,P.numPointShadows=v,P.numSpotShadows=y,P.numSpotMaps=A,P.numLightProbes=R,n.version=Ng++)}function l(c,u){let h=0,d=0,f=0,g=0,_=0;const m=u.matrixWorldInverse;for(let p=0,x=c.length;p<x;p++){const v=c[p];if(v.isDirectionalLight){const y=n.directional[h];y.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),h++}else if(v.isSpotLight){const y=n.spot[f];y.position.setFromMatrixPosition(v.matrixWorld),y.position.applyMatrix4(m),y.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),y.direction.sub(s),y.direction.transformDirection(m),f++}else if(v.isRectAreaLight){const y=n.rectArea[g];y.position.setFromMatrixPosition(v.matrixWorld),y.position.applyMatrix4(m),o.identity(),r.copy(v.matrixWorld),r.premultiply(m),o.extractRotation(r),y.halfWidth.set(v.width*.5,0,0),y.halfHeight.set(0,v.height*.5,0),y.halfWidth.applyMatrix4(o),y.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){const y=n.point[d];y.position.setFromMatrixPosition(v.matrixWorld),y.position.applyMatrix4(m),d++}else if(v.isHemisphereLight){const y=n.hemi[_];y.direction.setFromMatrixPosition(v.matrixWorld),y.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function Oc(i){const t=new kg(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function o(u){n.push(u)}function a(){t.setup(e)}function l(u){t.setupView(e,u)}const c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function Bg(i){let t=new WeakMap;function e(s,r=0){const o=t.get(s);let a;return o===void 0?(a=new Oc(i),t.set(s,[a])):r>=o.length?(a=new Oc(i),o.push(a)):a=o[r],a}function n(){t=new WeakMap}return{get:e,dispose:n}}const zg=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Gg=`uniform sampler2D shadow_pass;
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
}`;function Hg(i,t,e){let n=new il;const s=new ee,r=new ee,o=new Me,a=new df({depthPacking:id}),l=new ff,c={},u=e.maxTextureSize,h={[Nn]:qe,[qe]:Nn,[Ye]:Ye},d=new yn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ee},radius:{value:4}},vertexShader:zg,fragmentShader:Gg}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new Ze;g.setAttribute("position",new Ae(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const _=new te(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ch;let p=this.type;this.render=function(T,R,P){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||T.length===0)return;const E=i.getRenderTarget(),w=i.getActiveCubeFace(),L=i.getActiveMipmapLevel(),k=i.state;k.setBlending(fi),k.buffers.depth.getReversed()===!0?k.buffers.color.setClear(0,0,0,0):k.buffers.color.setClear(1,1,1,1),k.buffers.depth.setTest(!0),k.setScissorTest(!1);const V=p!==qn&&this.type===qn,Z=p===qn&&this.type!==qn;for(let q=0,G=T.length;q<G;q++){const X=T[q],B=X.shadow;if(B===void 0){console.warn("THREE.WebGLShadowMap:",X,"has no shadow.");continue}if(B.autoUpdate===!1&&B.needsUpdate===!1)continue;s.copy(B.mapSize);const st=B.getFrameExtents();if(s.multiply(st),r.copy(B.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/st.x),s.x=r.x*st.x,B.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/st.y),s.y=r.y*st.y,B.mapSize.y=r.y)),B.map===null||V===!0||Z===!0){const gt=this.type!==qn?{minFilter:we,magFilter:we}:{};B.map!==null&&B.map.dispose(),B.map=new Fi(s.x,s.y,gt),B.map.texture.name=X.name+".shadowMap",B.camera.updateProjectionMatrix()}i.setRenderTarget(B.map),i.clear();const at=B.getViewportCount();for(let gt=0;gt<at;gt++){const Ot=B.getViewport(gt);o.set(r.x*Ot.x,r.y*Ot.y,r.x*Ot.z,r.y*Ot.w),k.viewport(o),B.updateMatrices(X,gt),n=B.getFrustum(),y(R,P,B.camera,X,this.type)}B.isPointLightShadow!==!0&&this.type===qn&&x(B,P),B.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(E,w,L)};function x(T,R){const P=t.update(_);d.defines.VSM_SAMPLES!==T.blurSamples&&(d.defines.VSM_SAMPLES=T.blurSamples,f.defines.VSM_SAMPLES=T.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),T.mapPass===null&&(T.mapPass=new Fi(s.x,s.y)),d.uniforms.shadow_pass.value=T.map.texture,d.uniforms.resolution.value=T.mapSize,d.uniforms.radius.value=T.radius,i.setRenderTarget(T.mapPass),i.clear(),i.renderBufferDirect(R,null,P,d,_,null),f.uniforms.shadow_pass.value=T.mapPass.texture,f.uniforms.resolution.value=T.mapSize,f.uniforms.radius.value=T.radius,i.setRenderTarget(T.map),i.clear(),i.renderBufferDirect(R,null,P,f,_,null)}function v(T,R,P,E){let w=null;const L=P.isPointLight===!0?T.customDistanceMaterial:T.customDepthMaterial;if(L!==void 0)w=L;else if(w=P.isPointLight===!0?l:a,i.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const k=w.uuid,V=R.uuid;let Z=c[k];Z===void 0&&(Z={},c[k]=Z);let q=Z[V];q===void 0&&(q=w.clone(),Z[V]=q,R.addEventListener("dispose",A)),w=q}if(w.visible=R.visible,w.wireframe=R.wireframe,E===qn?w.side=R.shadowSide!==null?R.shadowSide:R.side:w.side=R.shadowSide!==null?R.shadowSide:h[R.side],w.alphaMap=R.alphaMap,w.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,w.map=R.map,w.clipShadows=R.clipShadows,w.clippingPlanes=R.clippingPlanes,w.clipIntersection=R.clipIntersection,w.displacementMap=R.displacementMap,w.displacementScale=R.displacementScale,w.displacementBias=R.displacementBias,w.wireframeLinewidth=R.wireframeLinewidth,w.linewidth=R.linewidth,P.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const k=i.properties.get(w);k.light=P}return w}function y(T,R,P,E,w){if(T.visible===!1)return;if(T.layers.test(R.layers)&&(T.isMesh||T.isLine||T.isPoints)&&(T.castShadow||T.receiveShadow&&w===qn)&&(!T.frustumCulled||n.intersectsObject(T))){T.modelViewMatrix.multiplyMatrices(P.matrixWorldInverse,T.matrixWorld);const V=t.update(T),Z=T.material;if(Array.isArray(Z)){const q=V.groups;for(let G=0,X=q.length;G<X;G++){const B=q[G],st=Z[B.materialIndex];if(st&&st.visible){const at=v(T,st,E,w);T.onBeforeShadow(i,T,R,P,V,at,B),i.renderBufferDirect(P,null,V,at,T,B),T.onAfterShadow(i,T,R,P,V,at,B)}}}else if(Z.visible){const q=v(T,Z,E,w);T.onBeforeShadow(i,T,R,P,V,q,null),i.renderBufferDirect(P,null,V,q,T,null),T.onAfterShadow(i,T,R,P,V,q,null)}}const k=T.children;for(let V=0,Z=k.length;V<Z;V++)y(k[V],R,P,E,w)}function A(T){T.target.removeEventListener("dispose",A);for(const P in c){const E=c[P],w=T.target.uuid;w in E&&(E[w].dispose(),delete E[w])}}}const Vg={[Jo]:Qo,[ta]:ia,[ea]:sa,[ms]:na,[Qo]:Jo,[ia]:ta,[sa]:ea,[na]:ms};function Wg(i,t){function e(){let I=!1;const it=new Me;let ot=null;const mt=new Me(0,0,0,0);return{setMask:function(tt){ot!==tt&&!I&&(i.colorMask(tt,tt,tt,tt),ot=tt)},setLocked:function(tt){I=tt},setClear:function(tt,j,yt,Bt,he){he===!0&&(tt*=Bt,j*=Bt,yt*=Bt),it.set(tt,j,yt,Bt),mt.equals(it)===!1&&(i.clearColor(tt,j,yt,Bt),mt.copy(it))},reset:function(){I=!1,ot=null,mt.set(-1,0,0,0)}}}function n(){let I=!1,it=!1,ot=null,mt=null,tt=null;return{setReversed:function(j){if(it!==j){const yt=t.get("EXT_clip_control");j?yt.clipControlEXT(yt.LOWER_LEFT_EXT,yt.ZERO_TO_ONE_EXT):yt.clipControlEXT(yt.LOWER_LEFT_EXT,yt.NEGATIVE_ONE_TO_ONE_EXT),it=j;const Bt=tt;tt=null,this.setClear(Bt)}},getReversed:function(){return it},setTest:function(j){j?Q(i.DEPTH_TEST):_t(i.DEPTH_TEST)},setMask:function(j){ot!==j&&!I&&(i.depthMask(j),ot=j)},setFunc:function(j){if(it&&(j=Vg[j]),mt!==j){switch(j){case Jo:i.depthFunc(i.NEVER);break;case Qo:i.depthFunc(i.ALWAYS);break;case ta:i.depthFunc(i.LESS);break;case ms:i.depthFunc(i.LEQUAL);break;case ea:i.depthFunc(i.EQUAL);break;case na:i.depthFunc(i.GEQUAL);break;case ia:i.depthFunc(i.GREATER);break;case sa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}mt=j}},setLocked:function(j){I=j},setClear:function(j){tt!==j&&(it&&(j=1-j),i.clearDepth(j),tt=j)},reset:function(){I=!1,ot=null,mt=null,tt=null,it=!1}}}function s(){let I=!1,it=null,ot=null,mt=null,tt=null,j=null,yt=null,Bt=null,he=null;return{setTest:function(ie){I||(ie?Q(i.STENCIL_TEST):_t(i.STENCIL_TEST))},setMask:function(ie){it!==ie&&!I&&(i.stencilMask(ie),it=ie)},setFunc:function(ie,kn,Cn){(ot!==ie||mt!==kn||tt!==Cn)&&(i.stencilFunc(ie,kn,Cn),ot=ie,mt=kn,tt=Cn)},setOp:function(ie,kn,Cn){(j!==ie||yt!==kn||Bt!==Cn)&&(i.stencilOp(ie,kn,Cn),j=ie,yt=kn,Bt=Cn)},setLocked:function(ie){I=ie},setClear:function(ie){he!==ie&&(i.clearStencil(ie),he=ie)},reset:function(){I=!1,it=null,ot=null,mt=null,tt=null,j=null,yt=null,Bt=null,he=null}}}const r=new e,o=new n,a=new s,l=new WeakMap,c=new WeakMap;let u={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,x=null,v=null,y=null,A=null,T=null,R=new kt(0,0,0),P=0,E=!1,w=null,L=null,k=null,V=null,Z=null;const q=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let G=!1,X=0;const B=i.getParameter(i.VERSION);B.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(B)[1]),G=X>=1):B.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(B)[1]),G=X>=2);let st=null,at={};const gt=i.getParameter(i.SCISSOR_BOX),Ot=i.getParameter(i.VIEWPORT),Kt=new Me().fromArray(gt),Nt=new Me().fromArray(Ot);function ne(I,it,ot,mt){const tt=new Uint8Array(4),j=i.createTexture();i.bindTexture(I,j),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let yt=0;yt<ot;yt++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(it,0,i.RGBA,1,1,mt,0,i.RGBA,i.UNSIGNED_BYTE,tt):i.texImage2D(it+yt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,tt);return j}const $={};$[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),$[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),$[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),$[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),Q(i.DEPTH_TEST),o.setFunc(ms),It(!1),Mt(Rl),Q(i.CULL_FACE),fe(fi);function Q(I){u[I]!==!0&&(i.enable(I),u[I]=!0)}function _t(I){u[I]!==!1&&(i.disable(I),u[I]=!1)}function Ft(I,it){return h[I]!==it?(i.bindFramebuffer(I,it),h[I]=it,I===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=it),I===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=it),!0):!1}function Rt(I,it){let ot=f,mt=!1;if(I){ot=d.get(it),ot===void 0&&(ot=[],d.set(it,ot));const tt=I.textures;if(ot.length!==tt.length||ot[0]!==i.COLOR_ATTACHMENT0){for(let j=0,yt=tt.length;j<yt;j++)ot[j]=i.COLOR_ATTACHMENT0+j;ot.length=tt.length,mt=!0}}else ot[0]!==i.BACK&&(ot[0]=i.BACK,mt=!0);mt&&i.drawBuffers(ot)}function Zt(I){return g!==I?(i.useProgram(I),g=I,!0):!1}const Pe={[Pi]:i.FUNC_ADD,[Cu]:i.FUNC_SUBTRACT,[Lu]:i.FUNC_REVERSE_SUBTRACT};Pe[Du]=i.MIN,Pe[Pu]=i.MAX;const D={[Iu]:i.ZERO,[Uu]:i.ONE,[Ou]:i.SRC_COLOR,[Zo]:i.SRC_ALPHA,[Gu]:i.SRC_ALPHA_SATURATE,[Bu]:i.DST_COLOR,[Fu]:i.DST_ALPHA,[Nu]:i.ONE_MINUS_SRC_COLOR,[jo]:i.ONE_MINUS_SRC_ALPHA,[zu]:i.ONE_MINUS_DST_COLOR,[ku]:i.ONE_MINUS_DST_ALPHA,[Hu]:i.CONSTANT_COLOR,[Vu]:i.ONE_MINUS_CONSTANT_COLOR,[Wu]:i.CONSTANT_ALPHA,[Xu]:i.ONE_MINUS_CONSTANT_ALPHA};function fe(I,it,ot,mt,tt,j,yt,Bt,he,ie){if(I===fi){_===!0&&(_t(i.BLEND),_=!1);return}if(_===!1&&(Q(i.BLEND),_=!0),I!==Ru){if(I!==m||ie!==E){if((p!==Pi||y!==Pi)&&(i.blendEquation(i.FUNC_ADD),p=Pi,y=Pi),ie)switch(I){case hs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Cl:i.blendFunc(i.ONE,i.ONE);break;case Ll:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Dl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case hs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Cl:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ll:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Dl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}x=null,v=null,A=null,T=null,R.set(0,0,0),P=0,m=I,E=ie}return}tt=tt||it,j=j||ot,yt=yt||mt,(it!==p||tt!==y)&&(i.blendEquationSeparate(Pe[it],Pe[tt]),p=it,y=tt),(ot!==x||mt!==v||j!==A||yt!==T)&&(i.blendFuncSeparate(D[ot],D[mt],D[j],D[yt]),x=ot,v=mt,A=j,T=yt),(Bt.equals(R)===!1||he!==P)&&(i.blendColor(Bt.r,Bt.g,Bt.b,he),R.copy(Bt),P=he),m=I,E=!1}function zt(I,it){I.side===Ye?_t(i.CULL_FACE):Q(i.CULL_FACE);let ot=I.side===qe;it&&(ot=!ot),It(ot),I.blending===hs&&I.transparent===!1?fe(fi):fe(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),o.setFunc(I.depthFunc),o.setTest(I.depthTest),o.setMask(I.depthWrite),r.setMask(I.colorWrite);const mt=I.stencilWrite;a.setTest(mt),mt&&(a.setMask(I.stencilWriteMask),a.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),a.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),St(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?Q(i.SAMPLE_ALPHA_TO_COVERAGE):_t(i.SAMPLE_ALPHA_TO_COVERAGE)}function It(I){w!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),w=I)}function Mt(I){I!==wu?(Q(i.CULL_FACE),I!==L&&(I===Rl?i.cullFace(i.BACK):I===Tu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):_t(i.CULL_FACE),L=I}function pe(I){I!==k&&(G&&i.lineWidth(I),k=I)}function St(I,it,ot){I?(Q(i.POLYGON_OFFSET_FILL),(V!==it||Z!==ot)&&(i.polygonOffset(it,ot),V=it,Z=ot)):_t(i.POLYGON_OFFSET_FILL)}function Vt(I){I?Q(i.SCISSOR_TEST):_t(i.SCISSOR_TEST)}function Le(I){I===void 0&&(I=i.TEXTURE0+q-1),st!==I&&(i.activeTexture(I),st=I)}function Se(I,it,ot){ot===void 0&&(st===null?ot=i.TEXTURE0+q-1:ot=st);let mt=at[ot];mt===void 0&&(mt={type:void 0,texture:void 0},at[ot]=mt),(mt.type!==I||mt.texture!==it)&&(st!==ot&&(i.activeTexture(ot),st=ot),i.bindTexture(I,it||$[I]),mt.type=I,mt.texture=it)}function C(){const I=at[st];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function M(){try{i.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function F(){try{i.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{i.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function J(){try{i.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function W(){try{i.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function At(){try{i.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function rt(){try{i.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Et(){try{i.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function wt(){try{i.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function nt(){try{i.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function dt(I){Kt.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),Kt.copy(I))}function Pt(I){Nt.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),Nt.copy(I))}function Tt(I,it){let ot=c.get(it);ot===void 0&&(ot=new WeakMap,c.set(it,ot));let mt=ot.get(I);mt===void 0&&(mt=i.getUniformBlockIndex(it,I.name),ot.set(I,mt))}function ht(I,it){const mt=c.get(it).get(I);l.get(it)!==mt&&(i.uniformBlockBinding(it,mt,I.__bindingPointIndex),l.set(it,mt))}function Gt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},st=null,at={},h={},d=new WeakMap,f=[],g=null,_=!1,m=null,p=null,x=null,v=null,y=null,A=null,T=null,R=new kt(0,0,0),P=0,E=!1,w=null,L=null,k=null,V=null,Z=null,Kt.set(0,0,i.canvas.width,i.canvas.height),Nt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:Q,disable:_t,bindFramebuffer:Ft,drawBuffers:Rt,useProgram:Zt,setBlending:fe,setMaterial:zt,setFlipSided:It,setCullFace:Mt,setLineWidth:pe,setPolygonOffset:St,setScissorTest:Vt,activeTexture:Le,bindTexture:Se,unbindTexture:C,compressedTexImage2D:M,compressedTexImage3D:F,texImage2D:wt,texImage3D:nt,updateUBOMapping:Tt,uniformBlockBinding:ht,texStorage2D:rt,texStorage3D:Et,texSubImage2D:K,texSubImage3D:J,compressedTexSubImage2D:W,compressedTexSubImage3D:At,scissor:dt,viewport:Pt,reset:Gt}}function Xg(i,t,e,n,s,r,o){const a=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new ee,u=new WeakMap;let h;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(C,M){return f?new OffscreenCanvas(C,M):Zr("canvas")}function _(C,M,F){let K=1;const J=Se(C);if((J.width>F||J.height>F)&&(K=F/Math.max(J.width,J.height)),K<1)if(typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&C instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&C instanceof ImageBitmap||typeof VideoFrame<"u"&&C instanceof VideoFrame){const W=Math.floor(K*J.width),At=Math.floor(K*J.height);h===void 0&&(h=g(W,At));const rt=M?g(W,At):h;return rt.width=W,rt.height=At,rt.getContext("2d").drawImage(C,0,0,W,At),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+J.width+"x"+J.height+") to ("+W+"x"+At+")."),rt}else return"data"in C&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+J.width+"x"+J.height+")."),C;return C}function m(C){return C.generateMipmaps}function p(C){i.generateMipmap(C)}function x(C){return C.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:C.isWebGL3DRenderTarget?i.TEXTURE_3D:C.isWebGLArrayRenderTarget||C.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(C,M,F,K,J=!1){if(C!==null){if(i[C]!==void 0)return i[C];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+C+"'")}let W=M;if(M===i.RED&&(F===i.FLOAT&&(W=i.R32F),F===i.HALF_FLOAT&&(W=i.R16F),F===i.UNSIGNED_BYTE&&(W=i.R8)),M===i.RED_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.R8UI),F===i.UNSIGNED_SHORT&&(W=i.R16UI),F===i.UNSIGNED_INT&&(W=i.R32UI),F===i.BYTE&&(W=i.R8I),F===i.SHORT&&(W=i.R16I),F===i.INT&&(W=i.R32I)),M===i.RG&&(F===i.FLOAT&&(W=i.RG32F),F===i.HALF_FLOAT&&(W=i.RG16F),F===i.UNSIGNED_BYTE&&(W=i.RG8)),M===i.RG_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RG8UI),F===i.UNSIGNED_SHORT&&(W=i.RG16UI),F===i.UNSIGNED_INT&&(W=i.RG32UI),F===i.BYTE&&(W=i.RG8I),F===i.SHORT&&(W=i.RG16I),F===i.INT&&(W=i.RG32I)),M===i.RGB_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RGB8UI),F===i.UNSIGNED_SHORT&&(W=i.RGB16UI),F===i.UNSIGNED_INT&&(W=i.RGB32UI),F===i.BYTE&&(W=i.RGB8I),F===i.SHORT&&(W=i.RGB16I),F===i.INT&&(W=i.RGB32I)),M===i.RGBA_INTEGER&&(F===i.UNSIGNED_BYTE&&(W=i.RGBA8UI),F===i.UNSIGNED_SHORT&&(W=i.RGBA16UI),F===i.UNSIGNED_INT&&(W=i.RGBA32UI),F===i.BYTE&&(W=i.RGBA8I),F===i.SHORT&&(W=i.RGBA16I),F===i.INT&&(W=i.RGBA32I)),M===i.RGB&&(F===i.UNSIGNED_INT_5_9_9_9_REV&&(W=i.RGB9_E5),F===i.UNSIGNED_INT_10F_11F_11F_REV&&(W=i.R11F_G11F_B10F)),M===i.RGBA){const At=J?Kr:Qt.getTransfer(K);F===i.FLOAT&&(W=i.RGBA32F),F===i.HALF_FLOAT&&(W=i.RGBA16F),F===i.UNSIGNED_BYTE&&(W=At===ae?i.SRGB8_ALPHA8:i.RGBA8),F===i.UNSIGNED_SHORT_4_4_4_4&&(W=i.RGBA4),F===i.UNSIGNED_SHORT_5_5_5_1&&(W=i.RGB5_A1)}return(W===i.R16F||W===i.R32F||W===i.RG16F||W===i.RG32F||W===i.RGBA16F||W===i.RGBA32F)&&t.get("EXT_color_buffer_float"),W}function y(C,M){let F;return C?M===null||M===Ni||M===qs?F=i.DEPTH24_STENCIL8:M===Un?F=i.DEPTH32F_STENCIL8:M===Xs&&(F=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Ni||M===qs?F=i.DEPTH_COMPONENT24:M===Un?F=i.DEPTH_COMPONENT32F:M===Xs&&(F=i.DEPTH_COMPONENT16),F}function A(C,M){return m(C)===!0||C.isFramebufferTexture&&C.minFilter!==we&&C.minFilter!==In?Math.log2(Math.max(M.width,M.height))+1:C.mipmaps!==void 0&&C.mipmaps.length>0?C.mipmaps.length:C.isCompressedTexture&&Array.isArray(C.image)?M.mipmaps.length:1}function T(C){const M=C.target;M.removeEventListener("dispose",T),P(M),M.isVideoTexture&&u.delete(M)}function R(C){const M=C.target;M.removeEventListener("dispose",R),w(M)}function P(C){const M=n.get(C);if(M.__webglInit===void 0)return;const F=C.source,K=d.get(F);if(K){const J=K[M.__cacheKey];J.usedTimes--,J.usedTimes===0&&E(C),Object.keys(K).length===0&&d.delete(F)}n.remove(C)}function E(C){const M=n.get(C);i.deleteTexture(M.__webglTexture);const F=C.source,K=d.get(F);delete K[M.__cacheKey],o.memory.textures--}function w(C){const M=n.get(C);if(C.depthTexture&&(C.depthTexture.dispose(),n.remove(C.depthTexture)),C.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(M.__webglFramebuffer[K]))for(let J=0;J<M.__webglFramebuffer[K].length;J++)i.deleteFramebuffer(M.__webglFramebuffer[K][J]);else i.deleteFramebuffer(M.__webglFramebuffer[K]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[K])}else{if(Array.isArray(M.__webglFramebuffer))for(let K=0;K<M.__webglFramebuffer.length;K++)i.deleteFramebuffer(M.__webglFramebuffer[K]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let K=0;K<M.__webglColorRenderbuffer.length;K++)M.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[K]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}const F=C.textures;for(let K=0,J=F.length;K<J;K++){const W=n.get(F[K]);W.__webglTexture&&(i.deleteTexture(W.__webglTexture),o.memory.textures--),n.remove(F[K])}n.remove(C)}let L=0;function k(){L=0}function V(){const C=L;return C>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+C+" texture units while this GPU supports only "+s.maxTextures),L+=1,C}function Z(C){const M=[];return M.push(C.wrapS),M.push(C.wrapT),M.push(C.wrapR||0),M.push(C.magFilter),M.push(C.minFilter),M.push(C.anisotropy),M.push(C.internalFormat),M.push(C.format),M.push(C.type),M.push(C.generateMipmaps),M.push(C.premultiplyAlpha),M.push(C.flipY),M.push(C.unpackAlignment),M.push(C.colorSpace),M.join()}function q(C,M){const F=n.get(C);if(C.isVideoTexture&&Vt(C),C.isRenderTargetTexture===!1&&C.isExternalTexture!==!0&&C.version>0&&F.__version!==C.version){const K=C.image;if(K===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{$(F,C,M);return}}else C.isExternalTexture&&(F.__webglTexture=C.sourceTexture?C.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,F.__webglTexture,i.TEXTURE0+M)}function G(C,M){const F=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&F.__version!==C.version){$(F,C,M);return}e.bindTexture(i.TEXTURE_2D_ARRAY,F.__webglTexture,i.TEXTURE0+M)}function X(C,M){const F=n.get(C);if(C.isRenderTargetTexture===!1&&C.version>0&&F.__version!==C.version){$(F,C,M);return}e.bindTexture(i.TEXTURE_3D,F.__webglTexture,i.TEXTURE0+M)}function B(C,M){const F=n.get(C);if(C.version>0&&F.__version!==C.version){Q(F,C,M);return}e.bindTexture(i.TEXTURE_CUBE_MAP,F.__webglTexture,i.TEXTURE0+M)}const st={[qr]:i.REPEAT,[Yn]:i.CLAMP_TO_EDGE,[aa]:i.MIRRORED_REPEAT},at={[we]:i.NEAREST,[ed]:i.NEAREST_MIPMAP_NEAREST,[zs]:i.NEAREST_MIPMAP_LINEAR,[In]:i.LINEAR,[lo]:i.LINEAR_MIPMAP_NEAREST,[Ui]:i.LINEAR_MIPMAP_LINEAR},gt={[rd]:i.NEVER,[ud]:i.ALWAYS,[od]:i.LESS,[xh]:i.LEQUAL,[ad]:i.EQUAL,[hd]:i.GEQUAL,[ld]:i.GREATER,[cd]:i.NOTEQUAL};function Ot(C,M){if(M.type===Un&&t.has("OES_texture_float_linear")===!1&&(M.magFilter===In||M.magFilter===lo||M.magFilter===zs||M.magFilter===Ui||M.minFilter===In||M.minFilter===lo||M.minFilter===zs||M.minFilter===Ui)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(C,i.TEXTURE_WRAP_S,st[M.wrapS]),i.texParameteri(C,i.TEXTURE_WRAP_T,st[M.wrapT]),(C===i.TEXTURE_3D||C===i.TEXTURE_2D_ARRAY)&&i.texParameteri(C,i.TEXTURE_WRAP_R,st[M.wrapR]),i.texParameteri(C,i.TEXTURE_MAG_FILTER,at[M.magFilter]),i.texParameteri(C,i.TEXTURE_MIN_FILTER,at[M.minFilter]),M.compareFunction&&(i.texParameteri(C,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(C,i.TEXTURE_COMPARE_FUNC,gt[M.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===we||M.minFilter!==zs&&M.minFilter!==Ui||M.type===Un&&t.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){const F=t.get("EXT_texture_filter_anisotropic");i.texParameterf(C,F.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function Kt(C,M){let F=!1;C.__webglInit===void 0&&(C.__webglInit=!0,M.addEventListener("dispose",T));const K=M.source;let J=d.get(K);J===void 0&&(J={},d.set(K,J));const W=Z(M);if(W!==C.__cacheKey){J[W]===void 0&&(J[W]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,F=!0),J[W].usedTimes++;const At=J[C.__cacheKey];At!==void 0&&(J[C.__cacheKey].usedTimes--,At.usedTimes===0&&E(M)),C.__cacheKey=W,C.__webglTexture=J[W].texture}return F}function Nt(C,M,F){return Math.floor(Math.floor(C/F)/M)}function ne(C,M,F,K){const W=C.updateRanges;if(W.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,F,K,M.data);else{W.sort((nt,dt)=>nt.start-dt.start);let At=0;for(let nt=1;nt<W.length;nt++){const dt=W[At],Pt=W[nt],Tt=dt.start+dt.count,ht=Nt(Pt.start,M.width,4),Gt=Nt(dt.start,M.width,4);Pt.start<=Tt+1&&ht===Gt&&Nt(Pt.start+Pt.count-1,M.width,4)===ht?dt.count=Math.max(dt.count,Pt.start+Pt.count-dt.start):(++At,W[At]=Pt)}W.length=At+1;const rt=i.getParameter(i.UNPACK_ROW_LENGTH),Et=i.getParameter(i.UNPACK_SKIP_PIXELS),wt=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let nt=0,dt=W.length;nt<dt;nt++){const Pt=W[nt],Tt=Math.floor(Pt.start/4),ht=Math.ceil(Pt.count/4),Gt=Tt%M.width,I=Math.floor(Tt/M.width),it=ht,ot=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Gt),i.pixelStorei(i.UNPACK_SKIP_ROWS,I),e.texSubImage2D(i.TEXTURE_2D,0,Gt,I,it,ot,F,K,M.data)}C.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,rt),i.pixelStorei(i.UNPACK_SKIP_PIXELS,Et),i.pixelStorei(i.UNPACK_SKIP_ROWS,wt)}}function $(C,M,F){let K=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(K=i.TEXTURE_3D);const J=Kt(C,M),W=M.source;e.bindTexture(K,C.__webglTexture,i.TEXTURE0+F);const At=n.get(W);if(W.version!==At.__version||J===!0){e.activeTexture(i.TEXTURE0+F);const rt=Qt.getPrimaries(Qt.workingColorSpace),Et=M.colorSpace===Kn?null:Qt.getPrimaries(M.colorSpace),wt=M.colorSpace===Kn||rt===Et?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,wt);let nt=_(M.image,!1,s.maxTextureSize);nt=Le(M,nt);const dt=r.convert(M.format,M.colorSpace),Pt=r.convert(M.type);let Tt=v(M.internalFormat,dt,Pt,M.colorSpace,M.isVideoTexture);Ot(K,M);let ht;const Gt=M.mipmaps,I=M.isVideoTexture!==!0,it=At.__version===void 0||J===!0,ot=W.dataReady,mt=A(M,nt);if(M.isDepthTexture)Tt=y(M.format===Ys,M.type),it&&(I?e.texStorage2D(i.TEXTURE_2D,1,Tt,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,Tt,nt.width,nt.height,0,dt,Pt,null));else if(M.isDataTexture)if(Gt.length>0){I&&it&&e.texStorage2D(i.TEXTURE_2D,mt,Tt,Gt[0].width,Gt[0].height);for(let tt=0,j=Gt.length;tt<j;tt++)ht=Gt[tt],I?ot&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,ht.width,ht.height,dt,Pt,ht.data):e.texImage2D(i.TEXTURE_2D,tt,Tt,ht.width,ht.height,0,dt,Pt,ht.data);M.generateMipmaps=!1}else I?(it&&e.texStorage2D(i.TEXTURE_2D,mt,Tt,nt.width,nt.height),ot&&ne(M,nt,dt,Pt)):e.texImage2D(i.TEXTURE_2D,0,Tt,nt.width,nt.height,0,dt,Pt,nt.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){I&&it&&e.texStorage3D(i.TEXTURE_2D_ARRAY,mt,Tt,Gt[0].width,Gt[0].height,nt.depth);for(let tt=0,j=Gt.length;tt<j;tt++)if(ht=Gt[tt],M.format!==gn)if(dt!==null)if(I){if(ot)if(M.layerUpdates.size>0){const yt=uc(ht.width,ht.height,M.format,M.type);for(const Bt of M.layerUpdates){const he=ht.data.subarray(Bt*yt/ht.data.BYTES_PER_ELEMENT,(Bt+1)*yt/ht.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,Bt,ht.width,ht.height,1,dt,he)}M.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,ht.width,ht.height,nt.depth,dt,ht.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,tt,Tt,ht.width,ht.height,nt.depth,0,ht.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?ot&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,tt,0,0,0,ht.width,ht.height,nt.depth,dt,Pt,ht.data):e.texImage3D(i.TEXTURE_2D_ARRAY,tt,Tt,ht.width,ht.height,nt.depth,0,dt,Pt,ht.data)}else{I&&it&&e.texStorage2D(i.TEXTURE_2D,mt,Tt,Gt[0].width,Gt[0].height);for(let tt=0,j=Gt.length;tt<j;tt++)ht=Gt[tt],M.format!==gn?dt!==null?I?ot&&e.compressedTexSubImage2D(i.TEXTURE_2D,tt,0,0,ht.width,ht.height,dt,ht.data):e.compressedTexImage2D(i.TEXTURE_2D,tt,Tt,ht.width,ht.height,0,ht.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?ot&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,ht.width,ht.height,dt,Pt,ht.data):e.texImage2D(i.TEXTURE_2D,tt,Tt,ht.width,ht.height,0,dt,Pt,ht.data)}else if(M.isDataArrayTexture)if(I){if(it&&e.texStorage3D(i.TEXTURE_2D_ARRAY,mt,Tt,nt.width,nt.height,nt.depth),ot)if(M.layerUpdates.size>0){const tt=uc(nt.width,nt.height,M.format,M.type);for(const j of M.layerUpdates){const yt=nt.data.subarray(j*tt/nt.data.BYTES_PER_ELEMENT,(j+1)*tt/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,j,nt.width,nt.height,1,dt,Pt,yt)}M.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,dt,Pt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Tt,nt.width,nt.height,nt.depth,0,dt,Pt,nt.data);else if(M.isData3DTexture)I?(it&&e.texStorage3D(i.TEXTURE_3D,mt,Tt,nt.width,nt.height,nt.depth),ot&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,dt,Pt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,Tt,nt.width,nt.height,nt.depth,0,dt,Pt,nt.data);else if(M.isFramebufferTexture){if(it)if(I)e.texStorage2D(i.TEXTURE_2D,mt,Tt,nt.width,nt.height);else{let tt=nt.width,j=nt.height;for(let yt=0;yt<mt;yt++)e.texImage2D(i.TEXTURE_2D,yt,Tt,tt,j,0,dt,Pt,null),tt>>=1,j>>=1}}else if(Gt.length>0){if(I&&it){const tt=Se(Gt[0]);e.texStorage2D(i.TEXTURE_2D,mt,Tt,tt.width,tt.height)}for(let tt=0,j=Gt.length;tt<j;tt++)ht=Gt[tt],I?ot&&e.texSubImage2D(i.TEXTURE_2D,tt,0,0,dt,Pt,ht):e.texImage2D(i.TEXTURE_2D,tt,Tt,dt,Pt,ht);M.generateMipmaps=!1}else if(I){if(it){const tt=Se(nt);e.texStorage2D(i.TEXTURE_2D,mt,Tt,tt.width,tt.height)}ot&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,dt,Pt,nt)}else e.texImage2D(i.TEXTURE_2D,0,Tt,dt,Pt,nt);m(M)&&p(K),At.__version=W.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function Q(C,M,F){if(M.image.length!==6)return;const K=Kt(C,M),J=M.source;e.bindTexture(i.TEXTURE_CUBE_MAP,C.__webglTexture,i.TEXTURE0+F);const W=n.get(J);if(J.version!==W.__version||K===!0){e.activeTexture(i.TEXTURE0+F);const At=Qt.getPrimaries(Qt.workingColorSpace),rt=M.colorSpace===Kn?null:Qt.getPrimaries(M.colorSpace),Et=M.colorSpace===Kn||At===rt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Et);const wt=M.isCompressedTexture||M.image[0].isCompressedTexture,nt=M.image[0]&&M.image[0].isDataTexture,dt=[];for(let j=0;j<6;j++)!wt&&!nt?dt[j]=_(M.image[j],!0,s.maxCubemapSize):dt[j]=nt?M.image[j].image:M.image[j],dt[j]=Le(M,dt[j]);const Pt=dt[0],Tt=r.convert(M.format,M.colorSpace),ht=r.convert(M.type),Gt=v(M.internalFormat,Tt,ht,M.colorSpace),I=M.isVideoTexture!==!0,it=W.__version===void 0||K===!0,ot=J.dataReady;let mt=A(M,Pt);Ot(i.TEXTURE_CUBE_MAP,M);let tt;if(wt){I&&it&&e.texStorage2D(i.TEXTURE_CUBE_MAP,mt,Gt,Pt.width,Pt.height);for(let j=0;j<6;j++){tt=dt[j].mipmaps;for(let yt=0;yt<tt.length;yt++){const Bt=tt[yt];M.format!==gn?Tt!==null?I?ot&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt,0,0,Bt.width,Bt.height,Tt,Bt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt,Gt,Bt.width,Bt.height,0,Bt.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt,0,0,Bt.width,Bt.height,Tt,ht,Bt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt,Gt,Bt.width,Bt.height,0,Tt,ht,Bt.data)}}}else{if(tt=M.mipmaps,I&&it){tt.length>0&&mt++;const j=Se(dt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,mt,Gt,j.width,j.height)}for(let j=0;j<6;j++)if(nt){I?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,dt[j].width,dt[j].height,Tt,ht,dt[j].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Gt,dt[j].width,dt[j].height,0,Tt,ht,dt[j].data);for(let yt=0;yt<tt.length;yt++){const he=tt[yt].image[j].image;I?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt+1,0,0,he.width,he.height,Tt,ht,he.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt+1,Gt,he.width,he.height,0,Tt,ht,he.data)}}else{I?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,0,0,Tt,ht,dt[j]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,0,Gt,Tt,ht,dt[j]);for(let yt=0;yt<tt.length;yt++){const Bt=tt[yt];I?ot&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt+1,0,0,Tt,ht,Bt.image[j]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+j,yt+1,Gt,Tt,ht,Bt.image[j])}}}m(M)&&p(i.TEXTURE_CUBE_MAP),W.__version=J.version,M.onUpdate&&M.onUpdate(M)}C.__version=M.version}function _t(C,M,F,K,J,W){const At=r.convert(F.format,F.colorSpace),rt=r.convert(F.type),Et=v(F.internalFormat,At,rt,F.colorSpace),wt=n.get(M),nt=n.get(F);if(nt.__renderTarget=M,!wt.__hasExternalTextures){const dt=Math.max(1,M.width>>W),Pt=Math.max(1,M.height>>W);J===i.TEXTURE_3D||J===i.TEXTURE_2D_ARRAY?e.texImage3D(J,W,Et,dt,Pt,M.depth,0,At,rt,null):e.texImage2D(J,W,Et,dt,Pt,0,At,rt,null)}e.bindFramebuffer(i.FRAMEBUFFER,C),St(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,J,nt.__webglTexture,0,pe(M)):(J===i.TEXTURE_2D||J>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&J<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,J,nt.__webglTexture,W),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ft(C,M,F){if(i.bindRenderbuffer(i.RENDERBUFFER,C),M.depthBuffer){const K=M.depthTexture,J=K&&K.isDepthTexture?K.type:null,W=y(M.stencilBuffer,J),At=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,rt=pe(M);St(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,rt,W,M.width,M.height):F?i.renderbufferStorageMultisample(i.RENDERBUFFER,rt,W,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,W,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,At,i.RENDERBUFFER,C)}else{const K=M.textures;for(let J=0;J<K.length;J++){const W=K[J],At=r.convert(W.format,W.colorSpace),rt=r.convert(W.type),Et=v(W.internalFormat,At,rt,W.colorSpace),wt=pe(M);F&&St(M)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,wt,Et,M.width,M.height):St(M)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,wt,Et,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Et,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Rt(C,M){if(M&&M.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,C),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const K=n.get(M.depthTexture);K.__renderTarget=M,(!K.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),q(M.depthTexture,0);const J=K.__webglTexture,W=pe(M);if(M.depthTexture.format===Ks)St(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,J,0);else if(M.depthTexture.format===Ys)St(M)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0,W):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,J,0);else throw new Error("Unknown depthTexture format")}function Zt(C){const M=n.get(C),F=C.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==C.depthTexture){const K=C.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),K){const J=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,K.removeEventListener("dispose",J)};K.addEventListener("dispose",J),M.__depthDisposeCallback=J}M.__boundDepthTexture=K}if(C.depthTexture&&!M.__autoAllocateDepthBuffer){if(F)throw new Error("target.depthTexture not supported in Cube render targets");const K=C.texture.mipmaps;K&&K.length>0?Rt(M.__webglFramebuffer[0],C):Rt(M.__webglFramebuffer,C)}else if(F){M.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[K]),M.__webglDepthbuffer[K]===void 0)M.__webglDepthbuffer[K]=i.createRenderbuffer(),Ft(M.__webglDepthbuffer[K],C,!1);else{const J=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=M.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,W)}}else{const K=C.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),Ft(M.__webglDepthbuffer,C,!1);else{const J=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,W=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,W),i.framebufferRenderbuffer(i.FRAMEBUFFER,J,i.RENDERBUFFER,W)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Pe(C,M,F){const K=n.get(C);M!==void 0&&_t(K.__webglFramebuffer,C,C.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),F!==void 0&&Zt(C)}function D(C){const M=C.texture,F=n.get(C),K=n.get(M);C.addEventListener("dispose",R);const J=C.textures,W=C.isWebGLCubeRenderTarget===!0,At=J.length>1;if(At||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=M.version,o.memory.textures++),W){F.__webglFramebuffer=[];for(let rt=0;rt<6;rt++)if(M.mipmaps&&M.mipmaps.length>0){F.__webglFramebuffer[rt]=[];for(let Et=0;Et<M.mipmaps.length;Et++)F.__webglFramebuffer[rt][Et]=i.createFramebuffer()}else F.__webglFramebuffer[rt]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){F.__webglFramebuffer=[];for(let rt=0;rt<M.mipmaps.length;rt++)F.__webglFramebuffer[rt]=i.createFramebuffer()}else F.__webglFramebuffer=i.createFramebuffer();if(At)for(let rt=0,Et=J.length;rt<Et;rt++){const wt=n.get(J[rt]);wt.__webglTexture===void 0&&(wt.__webglTexture=i.createTexture(),o.memory.textures++)}if(C.samples>0&&St(C)===!1){F.__webglMultisampledFramebuffer=i.createFramebuffer(),F.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,F.__webglMultisampledFramebuffer);for(let rt=0;rt<J.length;rt++){const Et=J[rt];F.__webglColorRenderbuffer[rt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,F.__webglColorRenderbuffer[rt]);const wt=r.convert(Et.format,Et.colorSpace),nt=r.convert(Et.type),dt=v(Et.internalFormat,wt,nt,Et.colorSpace,C.isXRRenderTarget===!0),Pt=pe(C);i.renderbufferStorageMultisample(i.RENDERBUFFER,Pt,dt,C.width,C.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.RENDERBUFFER,F.__webglColorRenderbuffer[rt])}i.bindRenderbuffer(i.RENDERBUFFER,null),C.depthBuffer&&(F.__webglDepthRenderbuffer=i.createRenderbuffer(),Ft(F.__webglDepthRenderbuffer,C,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(W){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),Ot(i.TEXTURE_CUBE_MAP,M);for(let rt=0;rt<6;rt++)if(M.mipmaps&&M.mipmaps.length>0)for(let Et=0;Et<M.mipmaps.length;Et++)_t(F.__webglFramebuffer[rt][Et],C,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+rt,Et);else _t(F.__webglFramebuffer[rt],C,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0);m(M)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(At){for(let rt=0,Et=J.length;rt<Et;rt++){const wt=J[rt],nt=n.get(wt);let dt=i.TEXTURE_2D;(C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(dt=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(dt,nt.__webglTexture),Ot(dt,wt),_t(F.__webglFramebuffer,C,wt,i.COLOR_ATTACHMENT0+rt,dt,0),m(wt)&&p(dt)}e.unbindTexture()}else{let rt=i.TEXTURE_2D;if((C.isWebGL3DRenderTarget||C.isWebGLArrayRenderTarget)&&(rt=C.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(rt,K.__webglTexture),Ot(rt,M),M.mipmaps&&M.mipmaps.length>0)for(let Et=0;Et<M.mipmaps.length;Et++)_t(F.__webglFramebuffer[Et],C,M,i.COLOR_ATTACHMENT0,rt,Et);else _t(F.__webglFramebuffer,C,M,i.COLOR_ATTACHMENT0,rt,0);m(M)&&p(rt),e.unbindTexture()}C.depthBuffer&&Zt(C)}function fe(C){const M=C.textures;for(let F=0,K=M.length;F<K;F++){const J=M[F];if(m(J)){const W=x(C),At=n.get(J).__webglTexture;e.bindTexture(W,At),p(W),e.unbindTexture()}}}const zt=[],It=[];function Mt(C){if(C.samples>0){if(St(C)===!1){const M=C.textures,F=C.width,K=C.height;let J=i.COLOR_BUFFER_BIT;const W=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,At=n.get(C),rt=M.length>1;if(rt)for(let wt=0;wt<M.length;wt++)e.bindFramebuffer(i.FRAMEBUFFER,At.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,At.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,At.__webglMultisampledFramebuffer);const Et=C.texture.mipmaps;Et&&Et.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglFramebuffer);for(let wt=0;wt<M.length;wt++){if(C.resolveDepthBuffer&&(C.depthBuffer&&(J|=i.DEPTH_BUFFER_BIT),C.stencilBuffer&&C.resolveStencilBuffer&&(J|=i.STENCIL_BUFFER_BIT)),rt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,At.__webglColorRenderbuffer[wt]);const nt=n.get(M[wt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,nt,0)}i.blitFramebuffer(0,0,F,K,0,0,F,K,J,i.NEAREST),l===!0&&(zt.length=0,It.length=0,zt.push(i.COLOR_ATTACHMENT0+wt),C.depthBuffer&&C.resolveDepthBuffer===!1&&(zt.push(W),It.push(W),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,It)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,zt))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),rt)for(let wt=0;wt<M.length;wt++){e.bindFramebuffer(i.FRAMEBUFFER,At.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.RENDERBUFFER,At.__webglColorRenderbuffer[wt]);const nt=n.get(M[wt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,At.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+wt,i.TEXTURE_2D,nt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglMultisampledFramebuffer)}else if(C.depthBuffer&&C.resolveDepthBuffer===!1&&l){const M=C.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function pe(C){return Math.min(s.maxSamples,C.samples)}function St(C){const M=n.get(C);return C.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function Vt(C){const M=o.render.frame;u.get(C)!==M&&(u.set(C,M),C.update())}function Le(C,M){const F=C.colorSpace,K=C.format,J=C.type;return C.isCompressedTexture===!0||C.isVideoTexture===!0||F!==vs&&F!==Kn&&(Qt.getTransfer(F)===ae?(K!==gn||J!==Tn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",F)),M}function Se(C){return typeof HTMLImageElement<"u"&&C instanceof HTMLImageElement?(c.width=C.naturalWidth||C.width,c.height=C.naturalHeight||C.height):typeof VideoFrame<"u"&&C instanceof VideoFrame?(c.width=C.displayWidth,c.height=C.displayHeight):(c.width=C.width,c.height=C.height),c}this.allocateTextureUnit=V,this.resetTextureUnits=k,this.setTexture2D=q,this.setTexture2DArray=G,this.setTexture3D=X,this.setTextureCube=B,this.rebindTextures=Pe,this.setupRenderTarget=D,this.updateRenderTargetMipmap=fe,this.updateMultisampleRenderTarget=Mt,this.setupDepthRenderbuffer=Zt,this.setupFrameBufferTexture=_t,this.useMultisampledRTT=St}function qg(i,t){function e(n,s=Kn){let r;const o=Qt.getTransfer(s);if(n===Tn)return i.UNSIGNED_BYTE;if(n===qa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ka)return i.UNSIGNED_SHORT_5_5_5_1;if(n===fh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===ph)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===uh)return i.BYTE;if(n===dh)return i.SHORT;if(n===Xs)return i.UNSIGNED_SHORT;if(n===Xa)return i.INT;if(n===Ni)return i.UNSIGNED_INT;if(n===Un)return i.FLOAT;if(n===js)return i.HALF_FLOAT;if(n===mh)return i.ALPHA;if(n===gh)return i.RGB;if(n===gn)return i.RGBA;if(n===Ks)return i.DEPTH_COMPONENT;if(n===Ys)return i.DEPTH_STENCIL;if(n===Ya)return i.RED;if(n===$a)return i.RED_INTEGER;if(n===_h)return i.RG;if(n===Za)return i.RG_INTEGER;if(n===ja)return i.RGBA_INTEGER;if(n===Fr||n===kr||n===Br||n===zr)if(o===ae)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Fr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Fr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===kr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Br)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===zr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===la||n===ca||n===ha||n===ua)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===la)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ca)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===ha)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ua)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===da||n===fa||n===pa)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===da||n===fa)return o===ae?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===pa)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===ma||n===ga||n===_a||n===va||n===xa||n===ya||n===Ma||n===Sa||n===Ea||n===ba||n===wa||n===Ta||n===Aa||n===Ra)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===ma)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===ga)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===_a)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===va)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===xa)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===ya)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ma)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Sa)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ea)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ba)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===wa)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Ta)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Aa)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ra)return o===ae?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Ca||n===La||n===Da)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Ca)return o===ae?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===La)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Da)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Pa||n===Ia||n===Ua||n===Oa)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Pa)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Ia)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ua)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Oa)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===qs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}const Kg=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Yg=`
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

}`;class $g{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){const n=new Dh(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){const e=t.cameras[0].viewport,n=new yn({vertexShader:Kg,fragmentShader:Yg,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new te(new mi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class Zg extends bs{constructor(t,e){super();const n=this;let s=null,r=1,o=null,a="local-floor",l=1,c=null,u=null,h=null,d=null,f=null,g=null;const _=typeof XRWebGLBinding<"u",m=new $g,p={},x=e.getContextAttributes();let v=null,y=null;const A=[],T=[],R=new ee;let P=null;const E=new sn;E.viewport=new Me;const w=new sn;w.viewport=new Me;const L=[E,w],k=new _f;let V=null,Z=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function($){let Q=A[$];return Q===void 0&&(Q=new Lo,A[$]=Q),Q.getTargetRaySpace()},this.getControllerGrip=function($){let Q=A[$];return Q===void 0&&(Q=new Lo,A[$]=Q),Q.getGripSpace()},this.getHand=function($){let Q=A[$];return Q===void 0&&(Q=new Lo,A[$]=Q),Q.getHandSpace()};function q($){const Q=T.indexOf($.inputSource);if(Q===-1)return;const _t=A[Q];_t!==void 0&&(_t.update($.inputSource,$.frame,c||o),_t.dispatchEvent({type:$.type,data:$.inputSource}))}function G(){s.removeEventListener("select",q),s.removeEventListener("selectstart",q),s.removeEventListener("selectend",q),s.removeEventListener("squeeze",q),s.removeEventListener("squeezestart",q),s.removeEventListener("squeezeend",q),s.removeEventListener("end",G),s.removeEventListener("inputsourceschange",X);for(let $=0;$<A.length;$++){const Q=T[$];Q!==null&&(T[$]=null,A[$].disconnect(Q))}V=null,Z=null,m.reset();for(const $ in p)delete p[$];t.setRenderTarget(v),f=null,d=null,h=null,s=null,y=null,ne.stop(),n.isPresenting=!1,t.setPixelRatio(P),t.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function($){r=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function($){a=$,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function($){c=$},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return h===null&&_&&(h=new XRWebGLBinding(s,e)),h},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function($){if(s=$,s!==null){if(v=t.getRenderTarget(),s.addEventListener("select",q),s.addEventListener("selectstart",q),s.addEventListener("selectend",q),s.addEventListener("squeeze",q),s.addEventListener("squeezestart",q),s.addEventListener("squeezeend",q),s.addEventListener("end",G),s.addEventListener("inputsourceschange",X),x.xrCompatible!==!0&&await e.makeXRCompatible(),P=t.getPixelRatio(),t.getSize(R),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let _t=null,Ft=null,Rt=null;x.depth&&(Rt=x.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,_t=x.stencil?Ys:Ks,Ft=x.stencil?qs:Ni);const Zt={colorFormat:e.RGBA8,depthFormat:Rt,scaleFactor:r};h=this.getBinding(),d=h.createProjectionLayer(Zt),s.updateRenderState({layers:[d]}),t.setPixelRatio(1),t.setSize(d.textureWidth,d.textureHeight,!1),y=new Fi(d.textureWidth,d.textureHeight,{format:gn,type:Tn,depthTexture:new Lh(d.textureWidth,d.textureHeight,Ft,void 0,void 0,void 0,void 0,void 0,void 0,_t),stencilBuffer:x.stencil,colorSpace:t.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const _t={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,_t),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),y=new Fi(f.framebufferWidth,f.framebufferHeight,{format:gn,type:Tn,colorSpace:t.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}y.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),ne.setContext(s),ne.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function X($){for(let Q=0;Q<$.removed.length;Q++){const _t=$.removed[Q],Ft=T.indexOf(_t);Ft>=0&&(T[Ft]=null,A[Ft].disconnect(_t))}for(let Q=0;Q<$.added.length;Q++){const _t=$.added[Q];let Ft=T.indexOf(_t);if(Ft===-1){for(let Zt=0;Zt<A.length;Zt++)if(Zt>=T.length){T.push(_t),Ft=Zt;break}else if(T[Zt]===null){T[Zt]=_t,Ft=Zt;break}if(Ft===-1)break}const Rt=A[Ft];Rt&&Rt.connect(_t)}}const B=new O,st=new O;function at($,Q,_t){B.setFromMatrixPosition(Q.matrixWorld),st.setFromMatrixPosition(_t.matrixWorld);const Ft=B.distanceTo(st),Rt=Q.projectionMatrix.elements,Zt=_t.projectionMatrix.elements,Pe=Rt[14]/(Rt[10]-1),D=Rt[14]/(Rt[10]+1),fe=(Rt[9]+1)/Rt[5],zt=(Rt[9]-1)/Rt[5],It=(Rt[8]-1)/Rt[0],Mt=(Zt[8]+1)/Zt[0],pe=Pe*It,St=Pe*Mt,Vt=Ft/(-It+Mt),Le=Vt*-It;if(Q.matrixWorld.decompose($.position,$.quaternion,$.scale),$.translateX(Le),$.translateZ(Vt),$.matrixWorld.compose($.position,$.quaternion,$.scale),$.matrixWorldInverse.copy($.matrixWorld).invert(),Rt[10]===-1)$.projectionMatrix.copy(Q.projectionMatrix),$.projectionMatrixInverse.copy(Q.projectionMatrixInverse);else{const Se=Pe+Vt,C=D+Vt,M=pe-Le,F=St+(Ft-Le),K=fe*D/C*Se,J=zt*D/C*Se;$.projectionMatrix.makePerspective(M,F,K,J,Se,C),$.projectionMatrixInverse.copy($.projectionMatrix).invert()}}function gt($,Q){Q===null?$.matrixWorld.copy($.matrix):$.matrixWorld.multiplyMatrices(Q.matrixWorld,$.matrix),$.matrixWorldInverse.copy($.matrixWorld).invert()}this.updateCamera=function($){if(s===null)return;let Q=$.near,_t=$.far;m.texture!==null&&(m.depthNear>0&&(Q=m.depthNear),m.depthFar>0&&(_t=m.depthFar)),k.near=w.near=E.near=Q,k.far=w.far=E.far=_t,(V!==k.near||Z!==k.far)&&(s.updateRenderState({depthNear:k.near,depthFar:k.far}),V=k.near,Z=k.far),k.layers.mask=$.layers.mask|6,E.layers.mask=k.layers.mask&3,w.layers.mask=k.layers.mask&5;const Ft=$.parent,Rt=k.cameras;gt(k,Ft);for(let Zt=0;Zt<Rt.length;Zt++)gt(Rt[Zt],Ft);Rt.length===2?at(k,E,w):k.projectionMatrix.copy(E.projectionMatrix),Ot($,k,Ft)};function Ot($,Q,_t){_t===null?$.matrix.copy(Q.matrixWorld):($.matrix.copy(_t.matrixWorld),$.matrix.invert(),$.matrix.multiply(Q.matrixWorld)),$.matrix.decompose($.position,$.quaternion,$.scale),$.updateMatrixWorld(!0),$.projectionMatrix.copy(Q.projectionMatrix),$.projectionMatrixInverse.copy(Q.projectionMatrixInverse),$.isPerspectiveCamera&&($.fov=$s*2*Math.atan(1/$.projectionMatrix.elements[5]),$.zoom=1)}this.getCamera=function(){return k},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function($){l=$,d!==null&&(d.fixedFoveation=$),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=$)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(k)},this.getCameraTexture=function($){return p[$]};let Kt=null;function Nt($,Q){if(u=Q.getViewerPose(c||o),g=Q,u!==null){const _t=u.views;f!==null&&(t.setRenderTargetFramebuffer(y,f.framebuffer),t.setRenderTarget(y));let Ft=!1;_t.length!==k.cameras.length&&(k.cameras.length=0,Ft=!0);for(let D=0;D<_t.length;D++){const fe=_t[D];let zt=null;if(f!==null)zt=f.getViewport(fe);else{const Mt=h.getViewSubImage(d,fe);zt=Mt.viewport,D===0&&(t.setRenderTargetTextures(y,Mt.colorTexture,Mt.depthStencilTexture),t.setRenderTarget(y))}let It=L[D];It===void 0&&(It=new sn,It.layers.enable(D),It.viewport=new Me,L[D]=It),It.matrix.fromArray(fe.transform.matrix),It.matrix.decompose(It.position,It.quaternion,It.scale),It.projectionMatrix.fromArray(fe.projectionMatrix),It.projectionMatrixInverse.copy(It.projectionMatrix).invert(),It.viewport.set(zt.x,zt.y,zt.width,zt.height),D===0&&(k.matrix.copy(It.matrix),k.matrix.decompose(k.position,k.quaternion,k.scale)),Ft===!0&&k.cameras.push(It)}const Rt=s.enabledFeatures;if(Rt&&Rt.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){h=n.getBinding();const D=h.getDepthInformation(_t[0]);D&&D.isValid&&D.texture&&m.init(D,s.renderState)}if(Rt&&Rt.includes("camera-access")&&_){t.state.unbindTexture(),h=n.getBinding();for(let D=0;D<_t.length;D++){const fe=_t[D].camera;if(fe){let zt=p[fe];zt||(zt=new Dh,p[fe]=zt);const It=h.getCameraImage(fe);zt.sourceTexture=It}}}}for(let _t=0;_t<A.length;_t++){const Ft=T[_t],Rt=A[_t];Ft!==null&&Rt!==void 0&&Rt.update(Ft,Q,c||o)}Kt&&Kt($,Q),Q.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:Q}),g=null}const ne=new Uh;ne.setAnimationLoop(Nt),this.setAnimationLoop=function($){Kt=$},this.dispose=function(){}}}const Ti=new xn,jg=new ce;function Jg(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,wh(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,x,v,y){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),h(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,y)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),_(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,x,v):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===qe&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===qe&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const x=t.get(p),v=x.envMap,y=x.envMapRotation;v&&(m.envMap.value=v,Ti.copy(y),Ti.x*=-1,Ti.y*=-1,Ti.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Ti.y*=-1,Ti.z*=-1),m.envMapRotation.value.setFromMatrix4(jg.makeRotationFromEuler(Ti)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,x,v){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*x,m.scale.value=v*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function h(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,x){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===qe&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=x.texture,m.transmissionSamplerSize.value.set(x.width,x.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function _(m,p){const x=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(x.matrixWorld),m.nearDistance.value=x.shadow.camera.near,m.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Qg(i,t,e,n){let s={},r={},o=[];const a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(x,v){const y=v.program;n.uniformBlockBinding(x,y)}function c(x,v){let y=s[x.id];y===void 0&&(g(x),y=u(x),s[x.id]=y,x.addEventListener("dispose",m));const A=v.program;n.updateUBOMapping(x,A);const T=t.render.frame;r[x.id]!==T&&(d(x),r[x.id]=T)}function u(x){const v=h();x.__bindingPointIndex=v;const y=i.createBuffer(),A=x.__size,T=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,A,T),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,y),y}function h(){for(let x=0;x<a;x++)if(o.indexOf(x)===-1)return o.push(x),x;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(x){const v=s[x.id],y=x.uniforms,A=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let T=0,R=y.length;T<R;T++){const P=Array.isArray(y[T])?y[T]:[y[T]];for(let E=0,w=P.length;E<w;E++){const L=P[E];if(f(L,T,E,A)===!0){const k=L.__offset,V=Array.isArray(L.value)?L.value:[L.value];let Z=0;for(let q=0;q<V.length;q++){const G=V[q],X=_(G);typeof G=="number"||typeof G=="boolean"?(L.__data[0]=G,i.bufferSubData(i.UNIFORM_BUFFER,k+Z,L.__data)):G.isMatrix3?(L.__data[0]=G.elements[0],L.__data[1]=G.elements[1],L.__data[2]=G.elements[2],L.__data[3]=0,L.__data[4]=G.elements[3],L.__data[5]=G.elements[4],L.__data[6]=G.elements[5],L.__data[7]=0,L.__data[8]=G.elements[6],L.__data[9]=G.elements[7],L.__data[10]=G.elements[8],L.__data[11]=0):(G.toArray(L.__data,Z),Z+=X.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,k,L.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(x,v,y,A){const T=x.value,R=v+"_"+y;if(A[R]===void 0)return typeof T=="number"||typeof T=="boolean"?A[R]=T:A[R]=T.clone(),!0;{const P=A[R];if(typeof T=="number"||typeof T=="boolean"){if(P!==T)return A[R]=T,!0}else if(P.equals(T)===!1)return P.copy(T),!0}return!1}function g(x){const v=x.uniforms;let y=0;const A=16;for(let R=0,P=v.length;R<P;R++){const E=Array.isArray(v[R])?v[R]:[v[R]];for(let w=0,L=E.length;w<L;w++){const k=E[w],V=Array.isArray(k.value)?k.value:[k.value];for(let Z=0,q=V.length;Z<q;Z++){const G=V[Z],X=_(G),B=y%A,st=B%X.boundary,at=B+st;y+=st,at!==0&&A-at<X.storage&&(y+=A-at),k.__data=new Float32Array(X.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=y,y+=X.storage}}}const T=y%A;return T>0&&(y+=A-T),x.__size=y,x.__cache={},this}function _(x){const v={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(v.boundary=4,v.storage=4):x.isVector2?(v.boundary=8,v.storage=8):x.isVector3||x.isColor?(v.boundary=16,v.storage=12):x.isVector4?(v.boundary=16,v.storage=16):x.isMatrix3?(v.boundary=48,v.storage=48):x.isMatrix4?(v.boundary=64,v.storage=64):x.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",x),v}function m(x){const v=x.target;v.removeEventListener("dispose",m);const y=o.indexOf(v.__bindingPointIndex);o.splice(y,1),i.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function p(){for(const x in s)i.deleteBuffer(s[x]);o=[],s={},r={}}return{bind:l,update:c,dispose:p}}class t_{constructor(t={}){const{canvas:e=Cd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:h=!1,reversedDepthBuffer:d=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),_=new Int32Array(4);let m=null,p=null;const x=[],v=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=pi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const y=this;let A=!1;this._outputColorSpace=un;let T=0,R=0,P=null,E=-1,w=null;const L=new Me,k=new Me;let V=null;const Z=new kt(0);let q=0,G=e.width,X=e.height,B=1,st=null,at=null;const gt=new Me(0,0,G,X),Ot=new Me(0,0,G,X);let Kt=!1;const Nt=new il;let ne=!1,$=!1;const Q=new ce,_t=new O,Ft=new Me,Rt={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let Zt=!1;function Pe(){return P===null?B:1}let D=n;function fe(S,U){return e.getContext(S,U)}try{const S={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:h};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${Va}`),e.addEventListener("webglcontextlost",ot,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",tt,!1),D===null){const U="webgl2";if(D=fe(U,S),D===null)throw fe(U)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(S){throw console.error("THREE.WebGLRenderer: "+S.message),S}let zt,It,Mt,pe,St,Vt,Le,Se,C,M,F,K,J,W,At,rt,Et,wt,nt,dt,Pt,Tt,ht,Gt;function I(){zt=new h0(D),zt.init(),Tt=new qg(D,zt),It=new i0(D,zt,t,Tt),Mt=new Wg(D,zt),It.reversedDepthBuffer&&d&&Mt.buffers.depth.setReversed(!0),pe=new f0(D),St=new Dg,Vt=new Xg(D,zt,Mt,St,It,Tt,pe),Le=new r0(y),Se=new c0(y),C=new xf(D),ht=new e0(D,C),M=new u0(D,C,pe,ht),F=new m0(D,M,C,pe),nt=new p0(D,It,Vt),rt=new s0(St),K=new Lg(y,Le,Se,zt,It,ht,rt),J=new Jg(y,St),W=new Ig,At=new Bg(zt),wt=new t0(y,Le,Se,Mt,F,f,l),Et=new Hg(y,F,It),Gt=new Qg(D,pe,It,Mt),dt=new n0(D,zt,pe),Pt=new d0(D,zt,pe),pe.programs=K.programs,y.capabilities=It,y.extensions=zt,y.properties=St,y.renderLists=W,y.shadowMap=Et,y.state=Mt,y.info=pe}I();const it=new Zg(y,D);this.xr=it,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){const S=zt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){const S=zt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return B},this.setPixelRatio=function(S){S!==void 0&&(B=S,this.setSize(G,X,!1))},this.getSize=function(S){return S.set(G,X)},this.setSize=function(S,U,z=!0){if(it.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}G=S,X=U,e.width=Math.floor(S*B),e.height=Math.floor(U*B),z===!0&&(e.style.width=S+"px",e.style.height=U+"px"),this.setViewport(0,0,S,U)},this.getDrawingBufferSize=function(S){return S.set(G*B,X*B).floor()},this.setDrawingBufferSize=function(S,U,z){G=S,X=U,B=z,e.width=Math.floor(S*z),e.height=Math.floor(U*z),this.setViewport(0,0,S,U)},this.getCurrentViewport=function(S){return S.copy(L)},this.getViewport=function(S){return S.copy(gt)},this.setViewport=function(S,U,z,H){S.isVector4?gt.set(S.x,S.y,S.z,S.w):gt.set(S,U,z,H),Mt.viewport(L.copy(gt).multiplyScalar(B).round())},this.getScissor=function(S){return S.copy(Ot)},this.setScissor=function(S,U,z,H){S.isVector4?Ot.set(S.x,S.y,S.z,S.w):Ot.set(S,U,z,H),Mt.scissor(k.copy(Ot).multiplyScalar(B).round())},this.getScissorTest=function(){return Kt},this.setScissorTest=function(S){Mt.setScissorTest(Kt=S)},this.setOpaqueSort=function(S){st=S},this.setTransparentSort=function(S){at=S},this.getClearColor=function(S){return S.copy(wt.getClearColor())},this.setClearColor=function(){wt.setClearColor(...arguments)},this.getClearAlpha=function(){return wt.getClearAlpha()},this.setClearAlpha=function(){wt.setClearAlpha(...arguments)},this.clear=function(S=!0,U=!0,z=!0){let H=0;if(S){let N=!1;if(P!==null){const et=P.texture.format;N=et===ja||et===Za||et===$a}if(N){const et=P.texture.type,ut=et===Tn||et===Ni||et===Xs||et===qs||et===qa||et===Ka,vt=wt.getClearColor(),pt=wt.getClearAlpha(),Dt=vt.r,Ut=vt.g,Ct=vt.b;ut?(g[0]=Dt,g[1]=Ut,g[2]=Ct,g[3]=pt,D.clearBufferuiv(D.COLOR,0,g)):(_[0]=Dt,_[1]=Ut,_[2]=Ct,_[3]=pt,D.clearBufferiv(D.COLOR,0,_))}else H|=D.COLOR_BUFFER_BIT}U&&(H|=D.DEPTH_BUFFER_BIT),z&&(H|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(H)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",ot,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",tt,!1),wt.dispose(),W.dispose(),At.dispose(),St.dispose(),Le.dispose(),Se.dispose(),F.dispose(),ht.dispose(),Gt.dispose(),K.dispose(),it.dispose(),it.removeEventListener("sessionstart",Cn),it.removeEventListener("sessionend",vl),_i.stop()};function ot(S){S.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),A=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),A=!1;const S=pe.autoReset,U=Et.enabled,z=Et.autoUpdate,H=Et.needsUpdate,N=Et.type;I(),pe.autoReset=S,Et.enabled=U,Et.autoUpdate=z,Et.needsUpdate=H,Et.type=N}function tt(S){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function j(S){const U=S.target;U.removeEventListener("dispose",j),yt(U)}function yt(S){Bt(S),St.remove(S)}function Bt(S){const U=St.get(S).programs;U!==void 0&&(U.forEach(function(z){K.releaseProgram(z)}),S.isShaderMaterial&&K.releaseShaderCache(S))}this.renderBufferDirect=function(S,U,z,H,N,et){U===null&&(U=Rt);const ut=N.isMesh&&N.matrixWorld.determinant()<0,vt=ou(S,U,z,H,N);Mt.setMaterial(H,ut);let pt=z.index,Dt=1;if(H.wireframe===!0){if(pt=M.getWireframeAttribute(z),pt===void 0)return;Dt=2}const Ut=z.drawRange,Ct=z.attributes.position;let Yt=Ut.start*Dt,oe=(Ut.start+Ut.count)*Dt;et!==null&&(Yt=Math.max(Yt,et.start*Dt),oe=Math.min(oe,(et.start+et.count)*Dt)),pt!==null?(Yt=Math.max(Yt,0),oe=Math.min(oe,pt.count)):Ct!=null&&(Yt=Math.max(Yt,0),oe=Math.min(oe,Ct.count));const ye=oe-Yt;if(ye<0||ye===1/0)return;ht.setup(N,H,vt,z,pt);let ue,le=dt;if(pt!==null&&(ue=C.get(pt),le=Pt,le.setIndex(ue)),N.isMesh)H.wireframe===!0?(Mt.setLineWidth(H.wireframeLinewidth*Pe()),le.setMode(D.LINES)):le.setMode(D.TRIANGLES);else if(N.isLine){let Lt=H.linewidth;Lt===void 0&&(Lt=1),Mt.setLineWidth(Lt*Pe()),N.isLineSegments?le.setMode(D.LINES):N.isLineLoop?le.setMode(D.LINE_LOOP):le.setMode(D.LINE_STRIP)}else N.isPoints?le.setMode(D.POINTS):N.isSprite&&le.setMode(D.TRIANGLES);if(N.isBatchedMesh)if(N._multiDrawInstances!==null)Zs("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),le.renderMultiDrawInstances(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount,N._multiDrawInstances);else if(zt.get("WEBGL_multi_draw"))le.renderMultiDraw(N._multiDrawStarts,N._multiDrawCounts,N._multiDrawCount);else{const Lt=N._multiDrawStarts,ge=N._multiDrawCounts,Jt=N._multiDrawCount,Je=pt?C.get(pt).bytesPerElement:1,Hi=St.get(H).currentProgram.getUniforms();for(let Qe=0;Qe<Jt;Qe++)Hi.setValue(D,"_gl_DrawID",Qe),le.render(Lt[Qe]/Je,ge[Qe])}else if(N.isInstancedMesh)le.renderInstances(Yt,ye,N.count);else if(z.isInstancedBufferGeometry){const Lt=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,ge=Math.min(z.instanceCount,Lt);le.renderInstances(Yt,ye,ge)}else le.render(Yt,ye)};function he(S,U,z){S.transparent===!0&&S.side===Ye&&S.forceSinglePass===!1?(S.side=qe,S.needsUpdate=!0,sr(S,U,z),S.side=Nn,S.needsUpdate=!0,sr(S,U,z),S.side=Ye):sr(S,U,z)}this.compile=function(S,U,z=null){z===null&&(z=S),p=At.get(z),p.init(U),v.push(p),z.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),S!==z&&S.traverseVisible(function(N){N.isLight&&N.layers.test(U.layers)&&(p.pushLight(N),N.castShadow&&p.pushShadow(N))}),p.setupLights();const H=new Set;return S.traverse(function(N){if(!(N.isMesh||N.isPoints||N.isLine||N.isSprite))return;const et=N.material;if(et)if(Array.isArray(et))for(let ut=0;ut<et.length;ut++){const vt=et[ut];he(vt,z,N),H.add(vt)}else he(et,z,N),H.add(et)}),p=v.pop(),H},this.compileAsync=function(S,U,z=null){const H=this.compile(S,U,z);return new Promise(N=>{function et(){if(H.forEach(function(ut){St.get(ut).currentProgram.isReady()&&H.delete(ut)}),H.size===0){N(S);return}setTimeout(et,10)}zt.get("KHR_parallel_shader_compile")!==null?et():setTimeout(et,10)})};let ie=null;function kn(S){ie&&ie(S)}function Cn(){_i.stop()}function vl(){_i.start()}const _i=new Uh;_i.setAnimationLoop(kn),typeof self<"u"&&_i.setContext(self),this.setAnimationLoop=function(S){ie=S,it.setAnimationLoop(S),S===null?_i.stop():_i.start()},it.addEventListener("sessionstart",Cn),it.addEventListener("sessionend",vl),this.render=function(S,U){if(U!==void 0&&U.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(A===!0)return;if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),U.parent===null&&U.matrixWorldAutoUpdate===!0&&U.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(it.cameraAutoUpdate===!0&&it.updateCamera(U),U=it.getCamera()),S.isScene===!0&&S.onBeforeRender(y,S,U,P),p=At.get(S,v.length),p.init(U),v.push(p),Q.multiplyMatrices(U.projectionMatrix,U.matrixWorldInverse),Nt.setFromProjectionMatrix(Q,On,U.reversedDepth),$=this.localClippingEnabled,ne=rt.init(this.clippingPlanes,$),m=W.get(S,x.length),m.init(),x.push(m),it.enabled===!0&&it.isPresenting===!0){const et=y.xr.getDepthSensingMesh();et!==null&&oo(et,U,-1/0,y.sortObjects)}oo(S,U,0,y.sortObjects),m.finish(),y.sortObjects===!0&&m.sort(st,at),Zt=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,Zt&&wt.addToRenderList(m,S),this.info.render.frame++,ne===!0&&rt.beginShadows();const z=p.state.shadowsArray;Et.render(z,S,U),ne===!0&&rt.endShadows(),this.info.autoReset===!0&&this.info.reset();const H=m.opaque,N=m.transmissive;if(p.setupLights(),U.isArrayCamera){const et=U.cameras;if(N.length>0)for(let ut=0,vt=et.length;ut<vt;ut++){const pt=et[ut];yl(H,N,S,pt)}Zt&&wt.render(S);for(let ut=0,vt=et.length;ut<vt;ut++){const pt=et[ut];xl(m,S,pt,pt.viewport)}}else N.length>0&&yl(H,N,S,U),Zt&&wt.render(S),xl(m,S,U);P!==null&&R===0&&(Vt.updateMultisampleRenderTarget(P),Vt.updateRenderTargetMipmap(P)),S.isScene===!0&&S.onAfterRender(y,S,U),ht.resetDefaultState(),E=-1,w=null,v.pop(),v.length>0?(p=v[v.length-1],ne===!0&&rt.setGlobalState(y.clippingPlanes,p.state.camera)):p=null,x.pop(),x.length>0?m=x[x.length-1]:m=null};function oo(S,U,z,H){if(S.visible===!1)return;if(S.layers.test(U.layers)){if(S.isGroup)z=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(U);else if(S.isLight)p.pushLight(S),S.castShadow&&p.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||Nt.intersectsSprite(S)){H&&Ft.setFromMatrixPosition(S.matrixWorld).applyMatrix4(Q);const ut=F.update(S),vt=S.material;vt.visible&&m.push(S,ut,vt,z,Ft.z,null)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||Nt.intersectsObject(S))){const ut=F.update(S),vt=S.material;if(H&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),Ft.copy(S.boundingSphere.center)):(ut.boundingSphere===null&&ut.computeBoundingSphere(),Ft.copy(ut.boundingSphere.center)),Ft.applyMatrix4(S.matrixWorld).applyMatrix4(Q)),Array.isArray(vt)){const pt=ut.groups;for(let Dt=0,Ut=pt.length;Dt<Ut;Dt++){const Ct=pt[Dt],Yt=vt[Ct.materialIndex];Yt&&Yt.visible&&m.push(S,ut,Yt,z,Ft.z,Ct)}}else vt.visible&&m.push(S,ut,vt,z,Ft.z,null)}}const et=S.children;for(let ut=0,vt=et.length;ut<vt;ut++)oo(et[ut],U,z,H)}function xl(S,U,z,H){const N=S.opaque,et=S.transmissive,ut=S.transparent;p.setupLightsView(z),ne===!0&&rt.setGlobalState(y.clippingPlanes,z),H&&Mt.viewport(L.copy(H)),N.length>0&&ir(N,U,z),et.length>0&&ir(et,U,z),ut.length>0&&ir(ut,U,z),Mt.buffers.depth.setTest(!0),Mt.buffers.depth.setMask(!0),Mt.buffers.color.setMask(!0),Mt.setPolygonOffset(!1)}function yl(S,U,z,H){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[H.id]===void 0&&(p.state.transmissionRenderTarget[H.id]=new Fi(1,1,{generateMipmaps:!0,type:zt.has("EXT_color_buffer_half_float")||zt.has("EXT_color_buffer_float")?js:Tn,minFilter:Ui,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:Qt.workingColorSpace}));const et=p.state.transmissionRenderTarget[H.id],ut=H.viewport||L;et.setSize(ut.z*y.transmissionResolutionScale,ut.w*y.transmissionResolutionScale);const vt=y.getRenderTarget(),pt=y.getActiveCubeFace(),Dt=y.getActiveMipmapLevel();y.setRenderTarget(et),y.getClearColor(Z),q=y.getClearAlpha(),q<1&&y.setClearColor(16777215,.5),y.clear(),Zt&&wt.render(z);const Ut=y.toneMapping;y.toneMapping=pi;const Ct=H.viewport;if(H.viewport!==void 0&&(H.viewport=void 0),p.setupLightsView(H),ne===!0&&rt.setGlobalState(y.clippingPlanes,H),ir(S,z,H),Vt.updateMultisampleRenderTarget(et),Vt.updateRenderTargetMipmap(et),zt.has("WEBGL_multisampled_render_to_texture")===!1){let Yt=!1;for(let oe=0,ye=U.length;oe<ye;oe++){const ue=U[oe],le=ue.object,Lt=ue.geometry,ge=ue.material,Jt=ue.group;if(ge.side===Ye&&le.layers.test(H.layers)){const Je=ge.side;ge.side=qe,ge.needsUpdate=!0,Ml(le,z,H,Lt,ge,Jt),ge.side=Je,ge.needsUpdate=!0,Yt=!0}}Yt===!0&&(Vt.updateMultisampleRenderTarget(et),Vt.updateRenderTargetMipmap(et))}y.setRenderTarget(vt,pt,Dt),y.setClearColor(Z,q),Ct!==void 0&&(H.viewport=Ct),y.toneMapping=Ut}function ir(S,U,z){const H=U.isScene===!0?U.overrideMaterial:null;for(let N=0,et=S.length;N<et;N++){const ut=S[N],vt=ut.object,pt=ut.geometry,Dt=ut.group;let Ut=ut.material;Ut.allowOverride===!0&&H!==null&&(Ut=H),vt.layers.test(z.layers)&&Ml(vt,U,z,pt,Ut,Dt)}}function Ml(S,U,z,H,N,et){S.onBeforeRender(y,U,z,H,N,et),S.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),N.onBeforeRender(y,U,z,H,S,et),N.transparent===!0&&N.side===Ye&&N.forceSinglePass===!1?(N.side=qe,N.needsUpdate=!0,y.renderBufferDirect(z,U,H,N,S,et),N.side=Nn,N.needsUpdate=!0,y.renderBufferDirect(z,U,H,N,S,et),N.side=Ye):y.renderBufferDirect(z,U,H,N,S,et),S.onAfterRender(y,U,z,H,N,et)}function sr(S,U,z){U.isScene!==!0&&(U=Rt);const H=St.get(S),N=p.state.lights,et=p.state.shadowsArray,ut=N.state.version,vt=K.getParameters(S,N.state,et,U,z),pt=K.getProgramCacheKey(vt);let Dt=H.programs;H.environment=S.isMeshStandardMaterial?U.environment:null,H.fog=U.fog,H.envMap=(S.isMeshStandardMaterial?Se:Le).get(S.envMap||H.environment),H.envMapRotation=H.environment!==null&&S.envMap===null?U.environmentRotation:S.envMapRotation,Dt===void 0&&(S.addEventListener("dispose",j),Dt=new Map,H.programs=Dt);let Ut=Dt.get(pt);if(Ut!==void 0){if(H.currentProgram===Ut&&H.lightsStateVersion===ut)return El(S,vt),Ut}else vt.uniforms=K.getUniforms(S),S.onBeforeCompile(vt,y),Ut=K.acquireProgram(vt,pt),Dt.set(pt,Ut),H.uniforms=vt.uniforms;const Ct=H.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Ct.clippingPlanes=rt.uniform),El(S,vt),H.needsLights=lu(S),H.lightsStateVersion=ut,H.needsLights&&(Ct.ambientLightColor.value=N.state.ambient,Ct.lightProbe.value=N.state.probe,Ct.directionalLights.value=N.state.directional,Ct.directionalLightShadows.value=N.state.directionalShadow,Ct.spotLights.value=N.state.spot,Ct.spotLightShadows.value=N.state.spotShadow,Ct.rectAreaLights.value=N.state.rectArea,Ct.ltc_1.value=N.state.rectAreaLTC1,Ct.ltc_2.value=N.state.rectAreaLTC2,Ct.pointLights.value=N.state.point,Ct.pointLightShadows.value=N.state.pointShadow,Ct.hemisphereLights.value=N.state.hemi,Ct.directionalShadowMap.value=N.state.directionalShadowMap,Ct.directionalShadowMatrix.value=N.state.directionalShadowMatrix,Ct.spotShadowMap.value=N.state.spotShadowMap,Ct.spotLightMatrix.value=N.state.spotLightMatrix,Ct.spotLightMap.value=N.state.spotLightMap,Ct.pointShadowMap.value=N.state.pointShadowMap,Ct.pointShadowMatrix.value=N.state.pointShadowMatrix),H.currentProgram=Ut,H.uniformsList=null,Ut}function Sl(S){if(S.uniformsList===null){const U=S.currentProgram.getUniforms();S.uniformsList=Gr.seqWithValue(U.seq,S.uniforms)}return S.uniformsList}function El(S,U){const z=St.get(S);z.outputColorSpace=U.outputColorSpace,z.batching=U.batching,z.batchingColor=U.batchingColor,z.instancing=U.instancing,z.instancingColor=U.instancingColor,z.instancingMorph=U.instancingMorph,z.skinning=U.skinning,z.morphTargets=U.morphTargets,z.morphNormals=U.morphNormals,z.morphColors=U.morphColors,z.morphTargetsCount=U.morphTargetsCount,z.numClippingPlanes=U.numClippingPlanes,z.numIntersection=U.numClipIntersection,z.vertexAlphas=U.vertexAlphas,z.vertexTangents=U.vertexTangents,z.toneMapping=U.toneMapping}function ou(S,U,z,H,N){U.isScene!==!0&&(U=Rt),Vt.resetTextureUnits();const et=U.fog,ut=H.isMeshStandardMaterial?U.environment:null,vt=P===null?y.outputColorSpace:P.isXRRenderTarget===!0?P.texture.colorSpace:vs,pt=(H.isMeshStandardMaterial?Se:Le).get(H.envMap||ut),Dt=H.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Ut=!!z.attributes.tangent&&(!!H.normalMap||H.anisotropy>0),Ct=!!z.morphAttributes.position,Yt=!!z.morphAttributes.normal,oe=!!z.morphAttributes.color;let ye=pi;H.toneMapped&&(P===null||P.isXRRenderTarget===!0)&&(ye=y.toneMapping);const ue=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,le=ue!==void 0?ue.length:0,Lt=St.get(H),ge=p.state.lights;if(ne===!0&&($===!0||S!==w)){const Be=S===w&&H.id===E;rt.setState(H,S,Be)}let Jt=!1;H.version===Lt.__version?(Lt.needsLights&&Lt.lightsStateVersion!==ge.state.version||Lt.outputColorSpace!==vt||N.isBatchedMesh&&Lt.batching===!1||!N.isBatchedMesh&&Lt.batching===!0||N.isBatchedMesh&&Lt.batchingColor===!0&&N.colorTexture===null||N.isBatchedMesh&&Lt.batchingColor===!1&&N.colorTexture!==null||N.isInstancedMesh&&Lt.instancing===!1||!N.isInstancedMesh&&Lt.instancing===!0||N.isSkinnedMesh&&Lt.skinning===!1||!N.isSkinnedMesh&&Lt.skinning===!0||N.isInstancedMesh&&Lt.instancingColor===!0&&N.instanceColor===null||N.isInstancedMesh&&Lt.instancingColor===!1&&N.instanceColor!==null||N.isInstancedMesh&&Lt.instancingMorph===!0&&N.morphTexture===null||N.isInstancedMesh&&Lt.instancingMorph===!1&&N.morphTexture!==null||Lt.envMap!==pt||H.fog===!0&&Lt.fog!==et||Lt.numClippingPlanes!==void 0&&(Lt.numClippingPlanes!==rt.numPlanes||Lt.numIntersection!==rt.numIntersection)||Lt.vertexAlphas!==Dt||Lt.vertexTangents!==Ut||Lt.morphTargets!==Ct||Lt.morphNormals!==Yt||Lt.morphColors!==oe||Lt.toneMapping!==ye||Lt.morphTargetsCount!==le)&&(Jt=!0):(Jt=!0,Lt.__version=H.version);let Je=Lt.currentProgram;Jt===!0&&(Je=sr(H,U,N));let Hi=!1,Qe=!1,Cs=!1;const _e=Je.getUniforms(),ln=Lt.uniforms;if(Mt.useProgram(Je.program)&&(Hi=!0,Qe=!0,Cs=!0),H.id!==E&&(E=H.id,Qe=!0),Hi||w!==S){Mt.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),_e.setValue(D,"projectionMatrix",S.projectionMatrix),_e.setValue(D,"viewMatrix",S.matrixWorldInverse);const Ke=_e.map.cameraPosition;Ke!==void 0&&Ke.setValue(D,_t.setFromMatrixPosition(S.matrixWorld)),It.logarithmicDepthBuffer&&_e.setValue(D,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(H.isMeshPhongMaterial||H.isMeshToonMaterial||H.isMeshLambertMaterial||H.isMeshBasicMaterial||H.isMeshStandardMaterial||H.isShaderMaterial)&&_e.setValue(D,"isOrthographic",S.isOrthographicCamera===!0),w!==S&&(w=S,Qe=!0,Cs=!0)}if(N.isSkinnedMesh){_e.setOptional(D,N,"bindMatrix"),_e.setOptional(D,N,"bindMatrixInverse");const Be=N.skeleton;Be&&(Be.boneTexture===null&&Be.computeBoneTexture(),_e.setValue(D,"boneTexture",Be.boneTexture,Vt))}N.isBatchedMesh&&(_e.setOptional(D,N,"batchingTexture"),_e.setValue(D,"batchingTexture",N._matricesTexture,Vt),_e.setOptional(D,N,"batchingIdTexture"),_e.setValue(D,"batchingIdTexture",N._indirectTexture,Vt),_e.setOptional(D,N,"batchingColorTexture"),N._colorsTexture!==null&&_e.setValue(D,"batchingColorTexture",N._colorsTexture,Vt));const cn=z.morphAttributes;if((cn.position!==void 0||cn.normal!==void 0||cn.color!==void 0)&&nt.update(N,z,Je),(Qe||Lt.receiveShadow!==N.receiveShadow)&&(Lt.receiveShadow=N.receiveShadow,_e.setValue(D,"receiveShadow",N.receiveShadow)),H.isMeshGouraudMaterial&&H.envMap!==null&&(ln.envMap.value=pt,ln.flipEnvMap.value=pt.isCubeTexture&&pt.isRenderTargetTexture===!1?-1:1),H.isMeshStandardMaterial&&H.envMap===null&&U.environment!==null&&(ln.envMapIntensity.value=U.environmentIntensity),Qe&&(_e.setValue(D,"toneMappingExposure",y.toneMappingExposure),Lt.needsLights&&au(ln,Cs),et&&H.fog===!0&&J.refreshFogUniforms(ln,et),J.refreshMaterialUniforms(ln,H,B,X,p.state.transmissionRenderTarget[S.id]),Gr.upload(D,Sl(Lt),ln,Vt)),H.isShaderMaterial&&H.uniformsNeedUpdate===!0&&(Gr.upload(D,Sl(Lt),ln,Vt),H.uniformsNeedUpdate=!1),H.isSpriteMaterial&&_e.setValue(D,"center",N.center),_e.setValue(D,"modelViewMatrix",N.modelViewMatrix),_e.setValue(D,"normalMatrix",N.normalMatrix),_e.setValue(D,"modelMatrix",N.matrixWorld),H.isShaderMaterial||H.isRawShaderMaterial){const Be=H.uniformsGroups;for(let Ke=0,ao=Be.length;Ke<ao;Ke++){const vi=Be[Ke];Gt.update(vi,Je),Gt.bind(vi,Je)}}return Je}function au(S,U){S.ambientLightColor.needsUpdate=U,S.lightProbe.needsUpdate=U,S.directionalLights.needsUpdate=U,S.directionalLightShadows.needsUpdate=U,S.pointLights.needsUpdate=U,S.pointLightShadows.needsUpdate=U,S.spotLights.needsUpdate=U,S.spotLightShadows.needsUpdate=U,S.rectAreaLights.needsUpdate=U,S.hemisphereLights.needsUpdate=U}function lu(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return T},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return P},this.setRenderTargetTextures=function(S,U,z){const H=St.get(S);H.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,H.__autoAllocateDepthBuffer===!1&&(H.__useRenderToTexture=!1),St.get(S.texture).__webglTexture=U,St.get(S.depthTexture).__webglTexture=H.__autoAllocateDepthBuffer?void 0:z,H.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,U){const z=St.get(S);z.__webglFramebuffer=U,z.__useDefaultFramebuffer=U===void 0};const cu=D.createFramebuffer();this.setRenderTarget=function(S,U=0,z=0){P=S,T=U,R=z;let H=!0,N=null,et=!1,ut=!1;if(S){const pt=St.get(S);if(pt.__useDefaultFramebuffer!==void 0)Mt.bindFramebuffer(D.FRAMEBUFFER,null),H=!1;else if(pt.__webglFramebuffer===void 0)Vt.setupRenderTarget(S);else if(pt.__hasExternalTextures)Vt.rebindTextures(S,St.get(S.texture).__webglTexture,St.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){const Ct=S.depthTexture;if(pt.__boundDepthTexture!==Ct){if(Ct!==null&&St.has(Ct)&&(S.width!==Ct.image.width||S.height!==Ct.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Vt.setupDepthRenderbuffer(S)}}const Dt=S.texture;(Dt.isData3DTexture||Dt.isDataArrayTexture||Dt.isCompressedArrayTexture)&&(ut=!0);const Ut=St.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(Ut[U])?N=Ut[U][z]:N=Ut[U],et=!0):S.samples>0&&Vt.useMultisampledRTT(S)===!1?N=St.get(S).__webglMultisampledFramebuffer:Array.isArray(Ut)?N=Ut[z]:N=Ut,L.copy(S.viewport),k.copy(S.scissor),V=S.scissorTest}else L.copy(gt).multiplyScalar(B).floor(),k.copy(Ot).multiplyScalar(B).floor(),V=Kt;if(z!==0&&(N=cu),Mt.bindFramebuffer(D.FRAMEBUFFER,N)&&H&&Mt.drawBuffers(S,N),Mt.viewport(L),Mt.scissor(k),Mt.setScissorTest(V),et){const pt=St.get(S.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+U,pt.__webglTexture,z)}else if(ut){const pt=U;for(let Dt=0;Dt<S.textures.length;Dt++){const Ut=St.get(S.textures[Dt]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Dt,Ut.__webglTexture,z,pt)}}else if(S!==null&&z!==0){const pt=St.get(S.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,pt.__webglTexture,z)}E=-1},this.readRenderTargetPixels=function(S,U,z,H,N,et,ut,vt=0){if(!(S&&S.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let pt=St.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ut!==void 0&&(pt=pt[ut]),pt){Mt.bindFramebuffer(D.FRAMEBUFFER,pt);try{const Dt=S.textures[vt],Ut=Dt.format,Ct=Dt.type;if(!It.textureFormatReadable(Ut)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!It.textureTypeReadable(Ct)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}U>=0&&U<=S.width-H&&z>=0&&z<=S.height-N&&(S.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+vt),D.readPixels(U,z,H,N,Tt.convert(Ut),Tt.convert(Ct),et))}finally{const Dt=P!==null?St.get(P).__webglFramebuffer:null;Mt.bindFramebuffer(D.FRAMEBUFFER,Dt)}}},this.readRenderTargetPixelsAsync=async function(S,U,z,H,N,et,ut,vt=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let pt=St.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&ut!==void 0&&(pt=pt[ut]),pt)if(U>=0&&U<=S.width-H&&z>=0&&z<=S.height-N){Mt.bindFramebuffer(D.FRAMEBUFFER,pt);const Dt=S.textures[vt],Ut=Dt.format,Ct=Dt.type;if(!It.textureFormatReadable(Ut))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!It.textureTypeReadable(Ct))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const Yt=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,Yt),D.bufferData(D.PIXEL_PACK_BUFFER,et.byteLength,D.STREAM_READ),S.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+vt),D.readPixels(U,z,H,N,Tt.convert(Ut),Tt.convert(Ct),0);const oe=P!==null?St.get(P).__webglFramebuffer:null;Mt.bindFramebuffer(D.FRAMEBUFFER,oe);const ye=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await Ld(D,ye,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,Yt),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,et),D.deleteBuffer(Yt),D.deleteSync(ye),et}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,U=null,z=0){const H=Math.pow(2,-z),N=Math.floor(S.image.width*H),et=Math.floor(S.image.height*H),ut=U!==null?U.x:0,vt=U!==null?U.y:0;Vt.setTexture2D(S,0),D.copyTexSubImage2D(D.TEXTURE_2D,z,0,0,ut,vt,N,et),Mt.unbindTexture()};const hu=D.createFramebuffer(),uu=D.createFramebuffer();this.copyTextureToTexture=function(S,U,z=null,H=null,N=0,et=null){et===null&&(N!==0?(Zs("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),et=N,N=0):et=0);let ut,vt,pt,Dt,Ut,Ct,Yt,oe,ye;const ue=S.isCompressedTexture?S.mipmaps[et]:S.image;if(z!==null)ut=z.max.x-z.min.x,vt=z.max.y-z.min.y,pt=z.isBox3?z.max.z-z.min.z:1,Dt=z.min.x,Ut=z.min.y,Ct=z.isBox3?z.min.z:0;else{const cn=Math.pow(2,-N);ut=Math.floor(ue.width*cn),vt=Math.floor(ue.height*cn),S.isDataArrayTexture?pt=ue.depth:S.isData3DTexture?pt=Math.floor(ue.depth*cn):pt=1,Dt=0,Ut=0,Ct=0}H!==null?(Yt=H.x,oe=H.y,ye=H.z):(Yt=0,oe=0,ye=0);const le=Tt.convert(U.format),Lt=Tt.convert(U.type);let ge;U.isData3DTexture?(Vt.setTexture3D(U,0),ge=D.TEXTURE_3D):U.isDataArrayTexture||U.isCompressedArrayTexture?(Vt.setTexture2DArray(U,0),ge=D.TEXTURE_2D_ARRAY):(Vt.setTexture2D(U,0),ge=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,U.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,U.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,U.unpackAlignment);const Jt=D.getParameter(D.UNPACK_ROW_LENGTH),Je=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Hi=D.getParameter(D.UNPACK_SKIP_PIXELS),Qe=D.getParameter(D.UNPACK_SKIP_ROWS),Cs=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,ue.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,ue.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Dt),D.pixelStorei(D.UNPACK_SKIP_ROWS,Ut),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Ct);const _e=S.isDataArrayTexture||S.isData3DTexture,ln=U.isDataArrayTexture||U.isData3DTexture;if(S.isDepthTexture){const cn=St.get(S),Be=St.get(U),Ke=St.get(cn.__renderTarget),ao=St.get(Be.__renderTarget);Mt.bindFramebuffer(D.READ_FRAMEBUFFER,Ke.__webglFramebuffer),Mt.bindFramebuffer(D.DRAW_FRAMEBUFFER,ao.__webglFramebuffer);for(let vi=0;vi<pt;vi++)_e&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,St.get(S).__webglTexture,N,Ct+vi),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,St.get(U).__webglTexture,et,ye+vi)),D.blitFramebuffer(Dt,Ut,ut,vt,Yt,oe,ut,vt,D.DEPTH_BUFFER_BIT,D.NEAREST);Mt.bindFramebuffer(D.READ_FRAMEBUFFER,null),Mt.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(N!==0||S.isRenderTargetTexture||St.has(S)){const cn=St.get(S),Be=St.get(U);Mt.bindFramebuffer(D.READ_FRAMEBUFFER,hu),Mt.bindFramebuffer(D.DRAW_FRAMEBUFFER,uu);for(let Ke=0;Ke<pt;Ke++)_e?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,cn.__webglTexture,N,Ct+Ke):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,cn.__webglTexture,N),ln?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Be.__webglTexture,et,ye+Ke):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Be.__webglTexture,et),N!==0?D.blitFramebuffer(Dt,Ut,ut,vt,Yt,oe,ut,vt,D.COLOR_BUFFER_BIT,D.NEAREST):ln?D.copyTexSubImage3D(ge,et,Yt,oe,ye+Ke,Dt,Ut,ut,vt):D.copyTexSubImage2D(ge,et,Yt,oe,Dt,Ut,ut,vt);Mt.bindFramebuffer(D.READ_FRAMEBUFFER,null),Mt.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else ln?S.isDataTexture||S.isData3DTexture?D.texSubImage3D(ge,et,Yt,oe,ye,ut,vt,pt,le,Lt,ue.data):U.isCompressedArrayTexture?D.compressedTexSubImage3D(ge,et,Yt,oe,ye,ut,vt,pt,le,ue.data):D.texSubImage3D(ge,et,Yt,oe,ye,ut,vt,pt,le,Lt,ue):S.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,et,Yt,oe,ut,vt,le,Lt,ue.data):S.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,et,Yt,oe,ue.width,ue.height,le,ue.data):D.texSubImage2D(D.TEXTURE_2D,et,Yt,oe,ut,vt,le,Lt,ue);D.pixelStorei(D.UNPACK_ROW_LENGTH,Jt),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,Je),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Hi),D.pixelStorei(D.UNPACK_SKIP_ROWS,Qe),D.pixelStorei(D.UNPACK_SKIP_IMAGES,Cs),et===0&&U.generateMipmaps&&D.generateMipmap(ge),Mt.unbindTexture()},this.initRenderTarget=function(S){St.get(S).__webglFramebuffer===void 0&&Vt.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?Vt.setTextureCube(S,0):S.isData3DTexture?Vt.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?Vt.setTexture2DArray(S,0):Vt.setTexture2D(S,0),Mt.unbindTexture()},this.resetState=function(){T=0,R=0,P=null,Mt.reset(),ht.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return On}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;const e=this.getContext();e.drawingBufferColorSpace=Qt._getDrawingBufferColorSpace(t),e.unpackColorSpace=Qt._getUnpackColorSpace()}}const fn=16,lt=fn,Rn=new Map,Bh=new Map,fs=[];function Ir(i){return i<0?0:i>255?255:i|0}class e_{constructor(t){this.px=new Uint8Array(lt*lt*4),this.rng=di(t)}set(t,e,n){if(t<0||e<0||t>=lt||e>=lt)return;const s=(e*lt+t)*4;this.px[s]=Ir(n[0]),this.px[s+1]=Ir(n[1]),this.px[s+2]=Ir(n[2]),this.px[s+3]=n.length>3?Ir(n[3]):255}get(t,e){const n=(e*lt+t)*4;return[this.px[n],this.px[n+1],this.px[n+2],this.px[n+3]]}fill(t){for(let e=0;e<lt;e++)for(let n=0;n<lt;n++)this.set(n,e,t)}noise(t,e,n=255){for(let s=0;s<lt;s++)for(let r=0;r<lt;r++){const o=(this.rng()-.5)*2*e;this.set(r,s,[t[0]+o,t[1]+o,t[2]+o,n])}}blotch(t,e,n=2,s=255){const r=Math.ceil(lt/n),o=[];for(let a=0;a<r*r;a++)o.push((this.rng()-.5)*2*e);for(let a=0;a<lt;a++)for(let l=0;l<lt;l++){const c=o[Math.floor(a/n)*r+Math.floor(l/n)]+(this.rng()-.5)*e*.5;this.set(l,a,[t[0]+c,t[1]+c,t[2]+c,s])}}rect(t,e,n,s,r){for(let o=e;o<e+s;o++)for(let a=t;a<t+n;a++)this.set(a,o,r)}pattern(t,e,n=0,s=0){for(let r=0;r<t.length;r++){const o=t[r];for(let a=0;a<o.length;a++){const l=o[a];if(l==="."||l===" ")continue;const c=e[l];c&&this.set(a+n,r+s,c)}}}spots(t,e,n=2){for(let s=0;s<e;s++){const r=Math.floor(this.rng()*(lt-n)),o=Math.floor(this.rng()*(lt-n));for(let a=0;a<n;a++)for(let l=0;l<n;l++)if(this.rng()<.85){const c=(this.rng()-.5)*30;this.set(r+l,o+a,[t[0]+c,t[1]+c,t[2]+c])}}}shade(t,e,n){const s=this.get(t,e);this.set(t,e,[s[0]+n,s[1]+n,s[2]+n,s[3]])}border(t){for(let e=0;e<lt;e++)this.shade(e,0,t),this.shade(0,e,t),this.shade(e,lt-1,-t),this.shade(lt-1,e,-t)}}function bt(i,t){const e=new e_(n_(i));return t(e),Rn.set(i,e.px),e.px}function n_(i){let t=5381;for(let e=0;e<i.length;e++)t=Math.imul(t,33)+i.charCodeAt(e)|0;return t>>>0}const so=[125,125,125],al=[134,96,67],Hr=[104,164,62],ll=[166,134,82],zh=[102,80,48],i_=[219,207,163];function Gh(i){i.blotch(so,14,2);for(let t=0;t<5;t++){const e=Math.floor(i.rng()*lt),n=Math.floor(i.rng()*lt);i.shade(e,n,-25),i.shade((e+1)%lt,n,-18)}}function Js(i,t){bt(i,e=>{Gh(e);for(let n=0;n<4;n++){const s=1+Math.floor(e.rng()*12),r=1+Math.floor(e.rng()*12);e.set(s,r,t),e.set(s+1,r,[t[0]-30,t[1]-30,t[2]-30]),e.set(s,r+1,[t[0]-20,t[1]-20,t[2]-20]),e.rng()<.6&&e.set(s+1,r+1,t),e.rng()<.5&&e.set(s+2,r,[t[0]+20,t[1]+20,t[2]+20])}})}function cl(i,t){bt(i,e=>{for(let n=0;n<lt;n++)for(let s=0;s<lt;s++){let r=(e.rng()-.5)*12+(s*3%5===0?-6:0);const o=Math.floor(n/4),a=n%4===0,l=(s+o%2*8)%16===0;a||l?r-=45:n%4===1&&(r+=8),e.set(s,n,[t[0]+r,t[1]+r,t[2]+r])}})}function hl(i,t,e){bt(i,n=>{for(let s=0;s<lt;s++)for(let r=0;r<lt;r++){const o=(r*7+Math.floor(s/5))%4;let a=(n.rng()-.5)*14;o===0&&(a-=22),o===2&&(a+=10);const l=e&&r%6===2&&(s+r)%5===0?e:t;n.set(r,s,[l[0]+a,l[1]+a,l[2]+a])}})}function ul(i,t,e){bt(i,n=>{n.noise(t,12);for(let s=2;s<14;s++)for(let r=2;r<14;r++){const o=Math.max(Math.abs(r-7.5),Math.abs(s-7.5)),a=Math.floor(o)%2===0?10:-12,l=(n.rng()-.5)*8+a;n.set(r,s,[e[0]+l,e[1]+l,e[2]+l])}})}function dl(i,t,e=.12){bt(i,n=>{for(let s=0;s<lt;s++)for(let r=0;r<lt;r++){const o=(n.rng()-.5)*50,a=n.rng()<e?0:255;n.set(r,s,[t[0]+o,t[1]+o*1.2,t[2]+o*.6,a])}})}function Rs(i,t){bt(i,e=>{e.blotch(t,14,2);for(let n=0;n<lt;n++)for(let s=0;s<lt;s++)(s+n*3)%7===0&&e.shade(s,n,-14)})}function fl(i,t,e){bt(i,n=>{for(let s=0;s<lt;s++)for(let r=0;r<lt;r++){const o=Math.floor(s/4),a=(r+o%2*2)%lt,l=s%4===0||a%4===0,c=(Math.floor(a/4)*7+o*13)%5*6-12;let u=(n.rng()-.5)*16+c;l&&(u-=40);let h=t;e&&n.rng()<.28&&!l&&(h=e),n.set(r,s,[h[0]+u,h[1]+u,h[2]+u])}})}function ro(i,t){bt(i,e=>{e.noise(t,6),e.border(35);for(let n=1;n<lt-1;n++)e.shade(n,1,18),e.shade(1,n,18),e.shade(n,lt-2,-18),e.shade(lt-2,n,-18)})}function Gi(i,t,e){bt(i,n=>{n.fill([0,0,0,0]),n.pattern(t,e)})}function ve(i,t,e){bt(i,n=>{n.fill([0,0,0,0]),n.pattern(t,e)})}bt("none",i=>i.fill([0,0,0,0]));bt("stone",Gh);bt("smooth_stone",i=>{i.noise([158,158,158],5),i.border(12)});bt("dirt",i=>{i.blotch(al,18,2),i.spots([110,78,52],6,1)});bt("grass_top",i=>{i.blotch(Hr,16,2),i.spots([90,145,50],8,1)});bt("grass_side",i=>{i.blotch(al,18,2);for(let t=0;t<lt;t++){const e=2+Math.floor(i.rng()*3);for(let n=0;n<e;n++){const s=(i.rng()-.5)*24;i.set(t,n,[Hr[0]+s,Hr[1]+s,Hr[2]+s])}}});bt("grass_side_snow",i=>{i.blotch(al,18,2);for(let t=0;t<lt;t++){const e=3+Math.floor(i.rng()*2);for(let n=0;n<e;n++)i.set(t,n,[240+(i.rng()-.5)*10,245,250])}});fl("cobblestone",so,null);fl("mossy_cobblestone",so,[86,120,60]);cl("planks_oak",ll);cl("planks_birch",[196,180,128]);cl("planks_spruce",[116,86,52]);bt("bedrock",i=>{i.blotch([70,70,70],40,2)});bt("water",i=>{i.blotch([48,92,220],14,2,175);for(let t=0;t<4;t++){const e=Math.floor(i.rng()*lt),n=Math.floor(i.rng()*lt);for(let s=0;s<4;s++)i.set((n+s)%lt,e,[110,150,240,190])}});bt("lava",i=>{i.blotch([215,80,20],20,2),i.spots([255,200,60],5,3),i.spots([120,30,10],4,2)});bt("sand",i=>{i.blotch(i_,12,2),i.spots([200,188,140],5,1)});bt("gravel",i=>{i.blotch([132,126,120],30,2),i.spots([90,85,80],6,1),i.spots([170,165,160],4,1)});bt("clay",i=>{i.blotch([158,162,172],12,2)});Js("gold_ore",[250,215,70]);Js("iron_ore",[215,170,140]);Js("coal_ore",[40,40,40]);Js("diamond_ore",[95,230,235]);Js("lapis_ore",[35,70,190]);hl("log_oak",zh,null);ul("log_oak_top",zh,[190,154,100]);hl("log_birch",[222,222,214],[30,30,30]);ul("log_birch_top",[222,222,214],[206,190,140]);hl("log_spruce",[66,44,24],null);ul("log_spruce_top",[66,44,24],[150,110,70]);dl("leaves_oak",[58,118,30]);dl("leaves_birch",[96,142,60]);dl("leaves_spruce",[42,88,44]);bt("glass",i=>{i.fill([0,0,0,0]),i.border(0);for(let t=0;t<lt;t++)i.set(t,0,[225,240,245]),i.set(t,lt-1,[225,240,245]),i.set(0,t,[225,240,245]),i.set(lt-1,t,[225,240,245]);for(let t=2;t<6;t++)i.set(t,7-t+2,[255,255,255,200]);for(let t=3;t<8;t++)i.set(t+1,12-t+3,[255,255,255,160])});bt("ice",i=>{i.blotch([150,190,250],14,2,210);for(let t=2;t<8;t++)i.set(t,12-t,[225,240,255,230]);for(let t=8;t<14;t++)i.set(t,t-4,[225,240,255,230])});bt("sandstone_top",i=>{i.blotch([222,208,162],8,2)});bt("sandstone_bottom",i=>{i.blotch([210,196,150],8,2)});bt("sandstone_side",i=>{i.blotch([222,208,162],8,2);for(let t=0;t<lt;t++)i.shade(t,0,14),i.shade(t,3,-14),i.shade(t,6,-8),i.shade(t,9,-14),i.shade(t,12,-8),i.shade(t,15,-14)});bt("crafting_table_top",i=>{i.noise([170,135,82],10);for(let t=0;t<lt;t++)i.set(t,0,[110,84,50]),i.set(t,lt-1,[110,84,50]),i.set(0,t,[110,84,50]),i.set(lt-1,t,[110,84,50]),i.set(t,7,[120,92,55]),i.set(t,8,[120,92,55]),i.set(7,t,[120,92,55]),i.set(8,t,[120,92,55])});bt("crafting_table_side",i=>{i.noise(ll,10);for(let t=0;t<lt;t++)for(let e=0;e<4;e++)i.set(t,e,[150,118,70]);for(let t=0;t<lt;t++)i.set(t,4,[110,84,50]);for(let t=4;t<lt;t++)i.set(0,t,[120,92,55]),i.set(lt-1,t,[120,92,55])});bt("crafting_table_front",i=>{i.noise(ll,10);for(let t=0;t<lt;t++)for(let e=0;e<4;e++)i.set(t,e,[150,118,70]);for(let t=0;t<lt;t++)i.set(t,4,[110,84,50]);i.pattern(["................","................","................","................","................","..hh.......ss...","..hhh.....s.s...","...hh....s..s...","....h...s...s...",".....h.s........","......s.........",".....s..........","....s...........","................","................","................"],{h:[120,120,130],s:[80,60,36]})});bt("furnace_top",i=>{fl("__tmp",so,null),i.px.set(Rn.get("__tmp"))});bt("furnace_side",i=>{i.px.set(Rn.get("cobblestone"))});bt("furnace_front",i=>{i.px.set(Rn.get("cobblestone")),i.rect(3,6,10,7,[30,30,30]),i.rect(3,12,10,2,[70,70,70])});bt("furnace_front_lit",i=>{i.px.set(Rn.get("cobblestone")),i.rect(3,6,10,7,[30,30,30]),i.pattern(["..........","..........","...o..o...","..oyo.oy..",".oyyyoyyo.","oyyyyyyyyo","yyyyyyyyyy"],{o:[240,120,20],y:[255,220,80]},3,6)});bt("torch",i=>{i.fill([0,0,0,0]),i.pattern(["................","................","................","................","................","................",".......yy.......","......yooy......","......yooy......",".......oo.......",".......ss.......",".......ss.......",".......ss.......",".......ss.......",".......ss.......",".......ss......."],{y:[255,240,120],o:[255,170,40],s:[120,90,50]})});bt("snow",i=>{i.blotch([242,247,252],6,2)});bt("bricks",i=>{for(let t=0;t<lt;t++)for(let e=0;e<lt;e++){const n=Math.floor(t/4),s=t%4===3||(e+n%2*4)%8===7,r=(i.rng()-.5)*14;s?i.set(e,t,[170+r,160+r,150+r]):i.set(e,t,[150+r,78+r,62+r])}});bt("glowstone",i=>{i.blotch([225,175,90],24,2),i.spots([255,235,160],6,2),i.spots([170,120,60],4,2)});bt("cactus_side",i=>{i.noise([84,138,52],10);for(let t=0;t<lt;t++)for(let e=0;e<lt;e++)e%4===0&&i.shade(e,t,-28),e%4===2&&t%3===1&&i.set(e,t,[200,210,170])});bt("cactus_top",i=>{i.noise([84,138,52],10),i.border(-20),i.rect(3,3,10,10,[110,165,70])});bt("cactus_bottom",i=>{i.noise([84,138,52],10),i.border(-20)});bt("obsidian",i=>{i.blotch([22,16,34],14,2),i.spots([70,40,110],5,1)});bt("stone_bricks",i=>{for(let t=0;t<lt;t++)for(let e=0;e<lt;e++){const n=Math.floor(t/8),s=t%8===7||(e+n%2*8)%16===15,r=(i.rng()-.5)*14;s?i.set(e,t,[85+r,85+r,85+r]):i.set(e,t,[128+r+(t%8===0?10:0),128+r,128+r])}});Rs("wool",[228,228,228]);Rs("wool_red",[180,46,42]);Rs("wool_blue",[46,66,170]);Rs("wool_green",[56,120,40]);Rs("wool_yellow",[222,196,50]);Rs("wool_black",[32,32,36]);bt("bookshelf",i=>{i.px.set(Rn.get("planks_oak"));const t=[[150,40,40],[40,80,160],[50,130,60],[190,160,60],[120,60,140],[200,200,200]];for(let e=0;e<2;e++){const n=2+e*7;i.rect(1,n,14,5,[60,44,26]);let s=1,r=0;for(;s<15;){const o=1+Math.floor(i.rng()*2),a=t[(r+e*2)%t.length],l=4+Math.floor(i.rng()*2);i.rect(s,n+(5-l),Math.min(o,15-s),l,a),s+=o,r++}}});bt("tnt_side",i=>{i.noise([196,48,36],10),i.rect(0,5,lt,6,[230,230,220]),i.pattern(["x.x.xxx.x.x.xxx.","xxx..x..xx..x...","x.x..x..x.x.x..."],{x:[30,30,30]},0,6),i.rect(0,0,lt,1,[150,30,24]),i.rect(0,15,lt,1,[150,30,24])});bt("tnt_top",i=>{i.noise([196,48,36],10),i.rect(3,3,10,10,[150,30,24]),i.rect(5,5,6,6,[60,40,30])});bt("tnt_bottom",i=>{i.noise([150,30,24],10)});bt("chest_top",i=>{i.noise([150,105,55],8),i.border(40)});bt("chest_side",i=>{i.noise([150,105,55],8),i.rect(0,6,lt,1,[90,62,30]),i.border(40)});bt("chest_front",i=>{i.noise([150,105,55],8),i.rect(0,6,lt,1,[90,62,30]),i.rect(6,4,4,5,[60,60,60]),i.rect(7,5,2,3,[140,140,140]),i.border(40)});ro("iron_block",[220,220,220]);ro("gold_block",[248,222,80]);ro("diamond_block",[112,228,222]);ro("lapis_block",[38,78,190]);bt("coal_block",i=>{i.blotch([36,36,38],10,2),i.border(12)});bt("pumpkin_side",i=>{i.noise([210,118,28],10);for(let t=0;t<lt;t++)for(let e=0;e<lt;e++)e%5===0&&i.shade(e,t,-34)});bt("pumpkin_top",i=>{i.noise([200,110,24],10),i.rect(6,6,4,4,[60,90,30]),i.rect(7,7,2,2,[100,130,50])});bt("pumpkin_face",i=>{i.px.set(Rn.get("pumpkin_side")),i.pattern(["..xx......xx....",".xxxx....xxxx...","................",".......xx.......","......xxxx......",".x............x.",".xx..........xx.","..xxx.xx.xx.xx..","....xxxxxxxxx..."],{x:[20,20,20]},0,4)});Gi("tallgrass",["................","................","......g.........","..g...g...g.....","..g..gg...g..g..",".gg..g...gg..g..",".g...g..gg...gg.",".gg.gg..g....g..","..g.g...g...gg..","..g.g..gg...g...",".gg.gg.g...gg...","..ggg..g...g....","..gg..gg..gg....","...g..g...g.....","...gg.g..gg.....","....g.g.gg......"],{g:[86,150,50]});Gi("flower_red",["................","................","................",".......rr.......","......rrrr......","......ryyr......","......rrrr......",".......rr.......",".......gg.......",".......g........","......gg..g.....",".......g.g......",".......gg.......",".......g........",".......g........",".......g........"],{r:[210,40,40],y:[240,220,60],g:[60,130,40]});Gi("flower_yellow",["................","................","................","................",".......yy.......","......yyyy......","......yyyy......",".......yy.......",".......g........",".......g........",".......g........","......gg.g......",".......gg.......",".......g........",".......g........",".......g........"],{y:[250,220,60],g:[60,130,40]});Gi("dead_bush",["................","................",".b......b.......","..b....b........","..b...b....b....","...b.b....b.....","....bb...b......",".....b..b.......",".....bbb........","......b.........","......b.........","......b.........",".....bb.........",".....b..........",".....b..........","................"],{b:[128,90,40]});Gi("sapling",["................","................","................","......ll........",".....llll.......","....llllll......","....llllll......",".....llll.......","......ll........",".......s........",".......s........",".......s........",".......s........",".......s........","................","................"],{l:[70,140,40],s:[100,70,40]});Gi("mushroom_brown",["................","................","................","................","................","......cccc......",".....cccccc.....","....cccccccc....",".......ss.......",".......ss.......",".......ss.......",".......ss.......",".......ss.......","................","................","................"],{c:[150,110,80],s:[210,200,180]});Gi("mushroom_red",["................","................","................","................","................","......rwrr......",".....rrrrwr.....","....rwrrrrrr....",".......ss.......",".......ss.......",".......ss.......",".......ss.......",".......ss.......","................","................","................"],{r:[200,40,40],w:[240,240,240],s:[210,200,180]});for(let i=0;i<10;i++)bt("crack_"+i,t=>{t.fill([0,0,0,0]);const e=di(777),n=3+i*2;for(let s=0;s<n;s++){let r=Math.floor(e()*lt),o=Math.floor(e()*lt);const a=3+Math.floor(e()*6);for(let l=0;l<a;l++)t.set(r,o,[10,10,10,140+i*8]),r+=Math.floor(e()*3)-1,o+=Math.floor(e()*3)-1}});const s_={wooden:{h:[140,105,60],H:[100,72,40]},stone:{h:[130,130,130],H:[90,90,90]},iron:{h:[220,220,220],H:[150,150,150]},diamond:{h:[90,225,220],H:[40,160,160]}},Hh={s:[140,100,55],S:[100,70,40]},r_=["................","......hhhhhh....",".....hhHHHHhh...","....hh..s...hh..","....h..sS....h..","....H.sS.....H..",".....sS.........","....sS..........","...sS...........","..sS............",".sS.............","................","................","................","................","................"],o_=["................","......hhh.......",".....hhhhh......","....hhHHhhh.....","....hhH.sSh.....",".....hhsS.......","......sS........",".....sS.........","....sS..........","...sS...........","..sS............",".sS.............","................","................","................","................"],a_=["................",".......hhh......","......hhhhh.....","......hhHHh.....","......hHHHh.....",".......sS.......","......sS........",".....sS.........","....sS..........","...sS...........","..sS............",".sS.............","................","................","................","................"],l_=["................","..........hh....",".........hhH....","........hhH.....",".......hhH......","......hhH.......",".....hhH........","..s.hhH.........","..ss.H..........","..sSs...........","..s.sS..........",".sS..S..........","sS..............","................","................","................"];for(const i of["wooden","stone","iron","diamond"]){const t={...s_[i],...Hh};ve(i+"_pickaxe",r_,t),ve(i+"_axe",o_,t),ve(i+"_shovel",a_,t),ve(i+"_sword",l_,t)}ve("stick",["................","..........ss....",".........ssS....","........ssS.....",".......ssS......","......ssS.......",".....ssS........","....ssS.........","...ssS..........","..ssS...........","..sS............","................","................","................","................","................"],Hh);ve("coal",["................","................","................",".....cccc.......","....ccCCcc......","...ccCCCCcc.....","...cCCCCCCc.....","...cCCCCCCcc....","...ccCCCCCcc....","....ccCCCcc.....",".....ccccc......","......ccc.......","................","................","................","................"],{c:[30,30,30],C:[55,55,58]});const Vh=(i,t,e)=>ve(i,["................","................","................","................","......aaaaaaaa..",".....aAAAAAAab..","....aAAAAAAAbb..","...aAAAAAAAbb...","..aAAAAAAAbb....","..aaaaaaaabb....","..bbbbbbbbb.....","................","................","................","................","................"],{a:t,A:t.map(n=>n+25),b:e});Vh("iron_ingot",[200,200,200],[140,140,140]);Vh("gold_ingot",[240,205,60],[170,130,30]);ve("diamond",["................","................","................",".....dddddd.....","....dDDDDDDd....","...dDDwwwDDDd...","...dDDwDDDDDd...","...dDDDDDDDDd...","....dDDDDDDd....",".....dDDDDd.....","......dDDd......",".......dd.......","................","................","................","................"],{d:[40,160,160],D:[110,235,230],w:[230,255,255]});ve("lapis",["................","................","................","......llll......",".....lLLLLl.....","....lLLwLLLl....","....lLLLLLLl....","....lLLLLLLl....",".....lLLLLl.....","......llll......","................","................","................","................","................","................"],{l:[30,60,160],L:[50,100,220],w:[170,200,255]});ve("apple",["................","........s.......",".......s........","......gg........","....rrrrrr......","...rrRrrrrr.....","...rRrrrrrrr....","...rrrrrrrrr....","...rrrrrrrrr....","....rrrrrrr.....",".....rrrrr......","................","................","................","................","................"],{r:[200,40,40],R:[240,120,120],g:[60,140,40],s:[90,60,30]});ve("golden_apple",["................","........s.......",".......s........","......gg........","....rrrrrr......","...rrRrrrrr.....","...rRrrrrrrr....","...rrrrrrrrr....","...rrrrrrrrr....","....rrrrrrr.....",".....rrrrr......","................","................","................","................","................"],{r:[240,200,50],R:[255,240,150],g:[60,140,40],s:[90,60,30]});const Fn=(i,t,e)=>ve(i,["................","................","................","....mmmmm.......","...mmMMmmmm.....","...mMMmmmmmm....","...mmmmmmmmmm...","....mmmmmmmmm...",".....mmmmmmm....","......bbbbbb....",".......bbbb.....","................","................","................","................","................"],{m:t,M:e,b:[220,220,210]});Fn("porkchop_raw",[240,150,160],[255,200,205]);Fn("porkchop_cooked",[190,120,70],[225,165,110]);Fn("beef_raw",[200,60,60],[235,120,110]);Fn("beef_cooked",[120,70,40],[170,110,70]);Fn("chicken_raw",[240,200,190],[255,230,220]);Fn("chicken_cooked",[200,140,70],[230,180,110]);Fn("mutton_raw",[210,80,80],[240,130,120]);Fn("mutton_cooked",[140,80,50],[180,120,80]);Fn("rotten_flesh",[120,90,50],[150,130,70]);Fn("leather",[170,110,60],[200,140,80]);ve("bone",["................","................","..........ww....",".........wwww...","........wwWw....",".......wwW......","......wwW.......",".....wwW........","....wwW.........","...wwW..........","..wwww..........","..wwW...........","................","................","................","................"],{w:[235,235,225],W:[200,200,190]});ve("gunpowder",["................","................","................","................","......gg........","....ggGGgg......","...gGGggGGg.....","...ggGGGggg.....","..ggGGgGGGgg....","..gggggggggg....","................","................","................","................","................","................"],{g:[70,70,70],G:[110,110,110]});ve("flint",["................","................","................","......fff.......",".....fFFff......","....fFFFFff.....","....fFFFFFf.....","....ffFFFFf.....",".....ffFFf......","......fff.......","................","................","................","................","................","................"],{f:[40,40,44],F:[70,70,76]});ve("arrow",["................","............ww..","...........www..","..........wsww..",".........ss.....","........ss......",".......ss.......","......ss........",".....ss.........","....ss..........","..fff...........","..ff............","..f.f...........","................","................","................"],{w:[220,220,220],s:[130,95,55],f:[200,200,200]});ve("feather",["................","...........ww...","..........wwW...",".........wwWW...","........wwWW....",".......wwWW.....","......wwWW......",".....wwWW.......","....wwWW........","...wwWW.........","..wwW...........","..sS............",".sS.............","................","................","................"],{w:[240,240,240],W:[200,200,205],s:[180,180,180],S:[140,140,140]});ve("bread",["................","................","................","................","..........bb....","........bbBBb...","......bbBBbbb...","....bbBBbbbb....","..bbBBbbbb......","..bBbbbbb.......","..bbbbbb........","...bbb..........","................","................","................","................"],{b:[170,120,50],B:[220,180,100]});ve("wheat",["................","......y.........",".....yyy..y.....","......y..yyy....",".....yyy..y.....","......y..yyy....",".....yyy..y.....","......y..yyy....","......g...y.....","......g..g......","......g.g.......","......gg........","......g.........","................","................","................"],{y:[210,180,70],g:[130,150,60]});ve("bow",["................","......ss........",".....s..s.......","....s....w......","....s.....w.....","....s......w....","....s.......w...","....s.......w...","....s.......w...","....s......w....","....s.....w.....","....s....w......",".....s..s.......","......ss........","................","................"],{s:[130,95,55],w:[230,230,230]});const Wh=["................","................","....gggggggg....","...g........g...","...gGGGGGGGGg...","...gGGGGGGGGg...","...gGGGGGGGGg...","...gGGGGGGGGg...","....gGGGGGGg....","....gGGGGGGg....",".....gGGGGg.....",".....gggggg.....","................","................","................","................"],Xh=Wh.map((i,t)=>t===4||t===5?i.replace(/G/g,"f"):i);ve("bucket",Wh,{g:[110,110,110],G:[190,190,190]});ve("water_bucket",Xh,{g:[110,110,110],G:[190,190,190],f:[50,100,230]});ve("lava_bucket",Xh,{g:[110,110,110],G:[190,190,190],f:[235,100,20]});bt("sun",i=>{i.fill([0,0,0,0]);for(let t=0;t<lt;t++)for(let e=0;e<lt;e++){const n=Math.hypot(e-7.5,t-7.5);n<6.5?i.set(e,t,[255,240,150,255]):n<7.5&&i.set(e,t,[255,220,120,140])}});bt("moon",i=>{i.fill([0,0,0,0]);for(let t=0;t<lt;t++)for(let e=0;e<lt;e++)Math.hypot(e-7.5,t-7.5)<5.5&&i.set(e,t,[225,228,240,255]);i.set(6,5,[180,185,200]),i.set(9,8,[180,185,200]),i.set(5,9,[180,185,200])});for(const i of Rn.keys())i.startsWith("__")||(Bh.set(i,fs.length),fs.push(i));function c_(i){const t=Bh.get(i);if(t===void 0)throw new Error("Unknown texture "+i);return t}function h_(i){return Rn.get(i)}const Nc=fs.length;function u_(){const i=new Uint8Array(lt*lt*4*fs.length);for(let t=0;t<fs.length;t++)i.set(Rn.get(fs[t]),t*lt*lt*4);return i}function d_(i){const t=Rn.get(i);let e=0,n=0,s=0,r=0;for(let o=0;o<t.length;o+=4)t[o+3]<128||(e+=t[o],n+=t[o+1],s+=t[o+2],r++);return r?[e/r,n/r,s/r]:[128,128,128]}function f_(){const i=u_(),t=new Uint8Array(i.length),e=fn*4,n=fn*e;for(let r=0;r<Nc;r++)for(let o=0;o<fn;o++){const a=r*n+o*e,l=r*n+(fn-1-o)*e;t.set(i.subarray(a,a+e),l)}const s=new tl(t,fn,fn,Nc);return s.format=gn,s.type=Tn,s.magFilter=we,s.minFilter=zs,s.generateMipmaps=!0,s.wrapS=Yn,s.wrapT=Yn,s.needsUpdate=!0,s}const Fc=`
in vec4 aLight;
out vec2 vUv;
flat out float vLayer;
out float vSky;
out float vBlock;
out float vShade;
out float vDist;
out vec3 vWorld;
void main() {
  vUv = uv;
  vLayer = aLight.x;
  vSky = aLight.y / 15.0;
  vBlock = aLight.z / 15.0;
  vShade = aLight.w;
  vec4 wp = modelMatrix * vec4(position, 1.0);
  vWorld = wp.xyz;
  vec4 mv = viewMatrix * wp;
  vDist = length(mv.xyz);
  gl_Position = projectionMatrix * mv;
}
`,kc=`
precision highp sampler2DArray;
uniform sampler2DArray atlas;
uniform float daylight;
uniform vec3 fogColor;
uniform float fogNear;
uniform float fogFar;
uniform float alphaTest;
uniform float uTime;
uniform float uWave;
uniform vec3 skyTint;
in vec2 vUv;
flat in float vLayer;
in float vSky;
in float vBlock;
in float vShade;
in float vDist;
in vec3 vWorld;
out vec4 outColor;

float curve(float a) {
  // Minecraft-like brightness ramp, softened
  float b = a / (4.0 - 3.0 * a);
  return mix(b, a, 0.3);
}

void main() {
  vec2 uv = vUv;
  if (uWave > 0.5) {
    uv += vec2(sin(uTime * 0.7 + vWorld.x * 0.8) * 0.02, cos(uTime * 0.5 + vWorld.z * 0.8) * 0.02);
    uv = clamp(uv, 0.02, 0.98);
  }
  vec4 tex = texture(atlas, vec3(uv, vLayer));
  if (tex.a < alphaTest) discard;
  float sky = curve(vSky) * daylight;
  float blk = curve(vBlock);
  vec3 skyCol = vec3(sky) * skyTint;
  vec3 blockCol = vec3(blk) * vec3(1.0, 0.86, 0.66);
  vec3 light = max(skyCol, blockCol);
  light = max(light, vec3(0.045, 0.045, 0.06));
  vec3 col = tex.rgb * light * vShade;
  float f = smoothstep(fogNear, fogFar, vDist);
  col = mix(col, fogColor, f);
  outColor = vec4(col, tex.a);
}
`;function p_(i){const t={atlas:{value:i},daylight:{value:1},fogColor:{value:new kt(.6,.75,1)},fogNear:{value:80},fogFar:{value:120},alphaTest:{value:.5},uTime:{value:0},uWave:{value:0},skyTint:{value:new O(1,1,1)}},e=new yn({glslVersion:Yr,vertexShader:Fc,fragmentShader:kc,uniforms:t,side:Nn}),n={...t,alphaTest:{value:.01},uWave:{value:1}},s=new yn({glslVersion:Yr,vertexShader:Fc,fragmentShader:kc,uniforms:n,transparent:!0,depthWrite:!1,side:Ye});return{opaque:e,water:s,uniforms:t}}const An=[],m_={wooden:1,stone:2,iron:3,diamond:4},g_={wooden:2,stone:4,iron:6,diamond:8},__={wooden:59,stone:131,iron:250,diamond:1561},Bc={wooden:4,stone:5,iron:6,diamond:7};function se(i,t,e,n={}){An[i]={id:i,name:t,tex:e,stack:64,tool:null,food:0,...n}}se(Y.STICK,"Stick","stick",{fuel:5});se(Y.COAL,"Coal","coal",{fuel:80});se(Y.IRON_INGOT,"Iron Ingot","iron_ingot");se(Y.GOLD_INGOT,"Gold Ingot","gold_ingot");se(Y.DIAMOND,"Diamond","diamond");se(Y.APPLE,"Apple","apple",{food:4});se(Y.PORKCHOP,"Raw Porkchop","porkchop_raw",{food:3});se(Y.COOKED_PORKCHOP,"Cooked Porkchop","porkchop_cooked",{food:8});se(Y.BEEF,"Raw Beef","beef_raw",{food:3});se(Y.COOKED_BEEF,"Steak","beef_cooked",{food:8});se(Y.CHICKEN,"Raw Chicken","chicken_raw",{food:2});se(Y.COOKED_CHICKEN,"Cooked Chicken","chicken_cooked",{food:6});se(Y.ROTTEN_FLESH,"Rotten Flesh","rotten_flesh",{food:2});se(Y.BONE,"Bone","bone");se(Y.GUNPOWDER,"Gunpowder","gunpowder");se(Y.FLINT,"Flint","flint");se(Y.ARROW,"Arrow","arrow");se(Y.FEATHER,"Feather","feather");se(Y.MUTTON,"Raw Mutton","mutton_raw",{food:2});se(Y.COOKED_MUTTON,"Cooked Mutton","mutton_cooked",{food:6});se(Y.LAPIS,"Lapis Lazuli","lapis");se(Y.BREAD,"Bread","bread",{food:5});se(Y.WHEAT,"Wheat","wheat");se(Y.BOW,"Bow","bow",{stack:1,durability:384,bow:!0});se(Y.GOLDEN_APPLE,"Golden Apple","golden_apple",{food:4,heal:10});se(Y.LEATHER,"Leather","leather");se(Y.BUCKET,"Bucket","bucket",{stack:16,bucket:0});se(Y.WATER_BUCKET,"Water Bucket","water_bucket",{stack:1,bucket:1});se(Y.LAVA_BUCKET,"Lava Bucket","lava_bucket",{stack:1,bucket:2,fuel:1e3});const zc=["pickaxe","axe","shovel","sword"],Gc=["wooden","stone","iron","diamond"],Hc=i=>i.charAt(0).toUpperCase()+i.slice(1);for(let i=0;i<Gc.length;i++)for(let t=0;t<zc.length;t++){const e=Gc[i],n=zc[t],s=Y.WOODEN_PICKAXE+i*4+t;se(s,Hc(e)+" "+Hc(n),e+"_"+n,{stack:1,durability:__[e],tool:{type:n,tier:m_[e],speed:g_[e],damage:n==="sword"?Bc[e]:n==="axe"?Bc[e]-1:2},fuel:e==="wooden"?10:0})}function Ne(i){return i<256?de(i):An[i]||null}function Qr(i){const t=Ne(i);return t?t.name:"Unknown"}function Ge(i){if(i<256)return 64;const t=An[i];return t?t.stack:64}function Ba(i){if(i<256)return i===b.COAL_BLOCK?800:de(i).flammable?15:i===b.OAK_SAPLING?5:0;const t=An[i];return t&&t.fuel||0}const v_=new Map([[b.IRON_ORE,Y.IRON_INGOT],[b.GOLD_ORE,Y.GOLD_INGOT],[b.SAND,b.GLASS],[b.COBBLESTONE,b.STONE],[b.STONE,b.SMOOTH_STONE],[b.CLAY,b.BRICKS],[b.OAK_LOG,Y.COAL],[b.BIRCH_LOG,Y.COAL],[b.SPRUCE_LOG,Y.COAL],[b.CACTUS,b.GREEN_WOOL],[Y.PORKCHOP,Y.COOKED_PORKCHOP],[Y.BEEF,Y.COOKED_BEEF],[Y.CHICKEN,Y.COOKED_CHICKEN],[Y.MUTTON,Y.COOKED_MUTTON]]);function qh(i){return v_.get(i)??0}function x_(){const i=[];for(const t of Vs)!t||t.id===0||t.id===b.FURNACE_LIT||t.hidden||i.push(t.id);for(const t of An)t&&i.push(t.id);return i}function y_(i,t){const e=de(i);if(e.hardness<0)return 1/0;if(e.hardness===0)return .05;const n=t>=256&&An[t]?An[t].tool:null,s=e.minTier>0,r=!!(n&&e.tool&&n.type===e.tool),o=!s||r&&n.tier>=e.minTier;let a=1;r?a=n.speed:n&&n.type==="sword"&&e.render==="cross"&&(a=1.5);const l=e.hardness*(o?1.5:5)/a;return Math.max(.05,l)}function M_(i,t){const e=de(i);if(e.minTier===0)return!0;const n=t>=256&&An[t]?An[t].tool:null;return!!(n&&n.type===e.tool&&n.tier>=e.minTier)}function S_(i){const t=i>=256&&An[i]?An[i].tool:null;return t?t.damage:1}const Vc=new Map,Wc=new Map,Xc=new Map;function ls(i){let t=Vc.get(i);if(t)return t;const e=h_(i);t=document.createElement("canvas"),t.width=fn,t.height=fn;const n=t.getContext("2d"),s=n.createImageData(fn,fn);return s.data.set(e),n.putImageData(s,0,0),Vc.set(i,t),t}function Oi(i){let t=Wc.get(i);return t||(t=new sl(ls(i)),t.magFilter=we,t.minFilter=we,t.colorSpace=Kn,Wc.set(i,t),t)}function za(i){let t=Xc.get(i);if(t)return t;const e=48,n=document.createElement("canvas");n.width=e,n.height=e;const s=n.getContext("2d");if(s.imageSmoothingEnabled=!1,i<256){const r=de(i);wn[i]===on.CUBE||wn[i]===on.LIQUID?E_(s,e,ls(mn(r,2)),ls(mn(r,1)),ls(mn(r,4))):s.drawImage(ls(mn(r,0)),4,4,e-8,e-8)}else{const r=Ne(i);r&&s.drawImage(ls(r.tex),4,4,e-8,e-8)}return t=n.toDataURL(),Xc.set(i,t),t}function E_(i,t,e,n,s){const r=t*.42,o=r/2,a=t/2,l=t/2,c=fn;i.setTransform(r/c,-o/c,r/c,o/c,a-r,l-o),i.drawImage(e,0,0),i.setTransform(r/c,o/c,0,r/c,a-r,l-o),i.drawImage(n,0,0),i.fillStyle="rgba(0,0,0,0.35)",i.fillRect(0,0,c,c),i.setTransform(r/c,-o/c,0,r/c,a,l),i.drawImage(s,0,0),i.fillStyle="rgba(0,0,0,0.18)",i.fillRect(0,0,c,c),i.setTransform(1,0,0,1,0,0)}const b_=`
varying vec3 vDir;
void main() {
  vDir = position;
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;
}`,w_=`
uniform vec3 top;
uniform vec3 horizon;
uniform vec3 sunDir;
uniform vec3 sunGlow;
varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir);
  float h = d.y;
  float t = pow(max(h, 0.0), 0.55);
  vec3 c = mix(horizon, top, t);
  if (h < 0.0) c = mix(horizon * 0.85, horizon, smoothstep(-0.3, 0.0, h));
  float s = max(dot(d, sunDir), 0.0);
  c += sunGlow * (pow(s, 6.0) * 0.5 + pow(s, 64.0) * 0.5) * smoothstep(-0.2, 0.1, h);
  gl_FragColor = vec4(c, 1.0);
}`;function qc(i,t,e,n){return i.r=t[0]+(e[0]-t[0])*n,i.g=t[1]+(e[1]-t[1])*n,i.b=t[2]+(e[2]-t[2])*n,i}class T_{constructor(t){this.group=new We,t.add(this.group),this.uniforms={top:{value:new kt(.35,.55,.95)},horizon:{value:new kt(.7,.82,1)},sunDir:{value:new O(0,1,0)},sunGlow:{value:new kt(0,0,0)}};const e=new te(new rl(600,24,12),new yn({uniforms:this.uniforms,vertexShader:b_,fragmentShader:w_,side:qe,depthWrite:!1,fog:!1}));e.renderOrder=-10,e.frustumCulled=!1,this.group.add(e);const n=(_,m)=>{const p=new xs({map:Oi(_),transparent:!0,depthWrite:!1,depthTest:!0,fog:!1}),x=new te(new mi(m,m),p);return x.renderOrder=-9,x.frustumCulled=!1,this.group.add(x),x};this.sun=n("sun",60),this.moon=n("moon",40);const s=di(12345),r=700,o=new Float32Array(r*3);for(let _=0;_<r;_++){const m=s()*2-1,p=s()*Math.PI*2,x=Math.sqrt(1-m*m);o[_*3]=Math.cos(p)*x*500,o[_*3+1]=m*500,o[_*3+2]=Math.sin(p)*x*500}const a=new Ze;a.setAttribute("position",new Ae(o,3)),this.starMat=new Ch({color:16777215,size:2,sizeAttenuation:!1,transparent:!0,opacity:0,depthWrite:!1,fog:!1}),this.stars=new hf(a,this.starMat),this.stars.renderOrder=-9,this.stars.frustumCulled=!1,this.group.add(this.stars);const l=128,c=document.createElement("canvas");c.width=l,c.height=l;const u=c.getContext("2d"),h=u.createImageData(l,l),d=di(999),f=[];for(let _=0;_<256;_++)f.push(d());for(let _=0;_<l;_++)for(let m=0;m<l;m++){const p=m/l*16,x=_/l*16,v=p|0,y=x|0,A=p-v,T=x-y,R=(L,k)=>f[(k+16)%16*16+(L+16)%16],E=(R(v,y)*(1-A)+R(v+1,y)*A)*(1-T)+(R(v,y+1)*(1-A)+R(v+1,y+1)*A)*T>.56?255:0,w=(_*l+m)*4;h.data[w]=255,h.data[w+1]=255,h.data[w+2]=255,h.data[w+3]=E}u.putImageData(h,0,0);const g=new sl(c);g.magFilter=we,g.minFilter=we,g.wrapS=g.wrapT=qr,g.repeat.set(3,3),this.cloudTex=g,this.cloudMat=new xs({map:g,transparent:!0,opacity:.75,depthWrite:!1,fog:!1,side:Ye}),this.clouds=new te(new mi(1400,1400),this.cloudMat),this.clouds.rotation.x=-Math.PI/2,this.clouds.position.y=140,this.clouds.renderOrder=-8,this.clouds.frustumCulled=!1,t.add(this.clouds),this.state={daylight:1,fogColor:new kt,skyTint:new O(1,1,1),sunDir:new O,elevation:1},this.cloudOffset=0}update(t,e,n){const s=(t-.25)*Math.PI*2,r=new O(Math.cos(s),Math.sin(s),.25).normalize(),o=r.y;this.uniforms.sunDir.value.copy(r),this.state.sunDir.copy(r),this.state.elevation=o;const a=Rd.smoothstep(o,-.18,.28),l=.14+.86*a;this.state.daylight=l;const c=[.36,.56,.96],u=[.7,.83,1],h=[.01,.015,.05],d=[.03,.04,.1];qc(this.uniforms.top.value,h,c,a),qc(this.uniforms.horizon.value,d,u,a);const f=Math.max(0,1-Math.abs(o+.03)/.3),g=f*f;if(this.uniforms.horizon.value.r+=g*.35,this.uniforms.horizon.value.g+=g*.08,this.uniforms.horizon.value.b-=g*.15,this.uniforms.sunGlow.value.setRGB(.9*(.4+g),.6*(.4+g*.5),.3*.4),this.state.fogColor.copy(this.uniforms.horizon.value),this.state.skyTint.set(1-g*.05,1-g*.12,1-g*.22),a<.5){const m=1-a*2;this.state.skyTint.x*=1-m*.35,this.state.skyTint.y*=1-m*.25}this.group.position.copy(e),this.sun.position.copy(r).multiplyScalar(500),this.sun.lookAt(e),this.moon.position.copy(r).multiplyScalar(-500),this.moon.lookAt(e),this.stars.rotation.z=s,this.starMat.opacity=Math.max(0,1-a*1.6),this.moon.material.opacity=.35+.65*Math.max(0,1-a*1.2),this.moon.visible=r.y<.35,this.sun.visible=r.y>-.35,this.cloudOffset+=n*.4,this.clouds.position.x=e.x,this.clouds.position.z=e.z,this.cloudTex.offset.set((e.x+this.cloudOffset)/1400*3,-e.z/1400*3);const _=.25+.75*a;return this.cloudMat.color.setRGB(_,_,_*1.05),this.state}}function Kh(i=1){const t=new We,e=(n,s,r,o,a,l=0,c=0)=>{const u=new te(new Ee(n*i,s*i,r*i),new $e({color:o}));return u.position.set(c*i,l*i,a*i),u.userData.base=new kt(o),t.add(u),u};return e(.045,.045,.74,11570519,.02),e(.1,.1,.12,6250335,.43),e(.062,.062,.1,9211020,.53),e(.02,.16,.2,16053492,-.3),e(.16,.02,.2,16053492,-.3),e(.024,.16,.05,13777980,-.37),e(.16,.024,.05,13777980,-.37),e(.05,.05,.04,3811866,-.42),t}function A_(i,t){for(const e of i.children)e.userData.base&&e.material.color.copy(e.userData.base).multiplyScalar(t)}function R_(i){for(const t of i.children)t.geometry&&t.geometry.dispose(),t.material&&t.material.dispose()}const C_=`
attribute float aAlpha;
varying float vAlpha;
void main() {
  vAlpha = aAlpha;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,L_=`
uniform vec3 uColor;
varying float vAlpha;
void main() {
  gl_FragColor = vec4(uColor, vAlpha);
}`;class D_{constructor(t=16775400,e=.06,n=16){this.n=n,this.width=e,this.points=[],this.pos=new Float32Array(n*2*3),this.alpha=new Float32Array(n*2);const s=new Uint16Array((n-1)*6);for(let r=0;r<n-1;r++){const o=r*2;s.set([o,o+1,o+2,o+1,o+3,o+2],r*6)}this.geo=new Ze,this.geo.setAttribute("position",new Ae(this.pos,3).setUsage(Na)),this.geo.setAttribute("aAlpha",new Ae(this.alpha,1).setUsage(Na)),this.geo.setIndex(new Ae(s,1)),this.geo.setDrawRange(0,0),this.mat=new yn({uniforms:{uColor:{value:new kt(t)}},vertexShader:C_,fragmentShader:L_,transparent:!0,depthWrite:!1,side:Ye}),this.mesh=new te(this.geo,this.mat),this.mesh.frustumCulled=!1,this.mesh.renderOrder=6,this._dir=new O,this._toCam=new O,this._side=new O}push(t,e,n){this.points.unshift([t,e,n]),this.points.length>this.n&&(this.points.length=this.n)}clear(){this.points.length=0,this.geo.setDrawRange(0,0),this.mesh.visible=!1}update(t,e=1){const n=this.points;if(n.length<2){this.mesh.visible=!1;return}this.mesh.visible=!0;const s=n.length;for(let r=0;r<s;r++){const o=n[r],a=n[Math.max(0,r-1)],l=n[Math.min(s-1,r+1)];this._dir.set(a[0]-l[0],a[1]-l[1],a[2]-l[2]).normalize(),this._toCam.set(t.x-o[0],t.y-o[1],t.z-o[2]).normalize(),this._side.crossVectors(this._dir,this._toCam).normalize();const c=r/(s-1),u=this.width*(1-c*.7),h=r*6;this.pos[h]=o[0]+this._side.x*u,this.pos[h+1]=o[1]+this._side.y*u,this.pos[h+2]=o[2]+this._side.z*u,this.pos[h+3]=o[0]-this._side.x*u,this.pos[h+4]=o[1]-this._side.y*u,this.pos[h+5]=o[2]-this._side.z*u;const d=(1-c)*(1-c)*.32*e;this.alpha[r*2]=d,this.alpha[r*2+1]=d}this.geo.attributes.position.needsUpdate=!0,this.geo.attributes.aAlpha.needsUpdate=!0,this.geo.setDrawRange(0,(s-1)*6)}dispose(){this.geo.dispose(),this.mat.dispose()}}const P_=9069624,I_=11897429,U_=15592941,O_=14264710,N_=5981750,Go=6,ks=.075,Ho=.048,F_=.36,Xn={pos:new O(.5,-.4,-1.05),rot:new xn(.15,1.15,.55),scale:.85},Bs={pos:new O(.3,-.27,-.75),rot:new xn(.26,.33,-.45),scale:1};class k_{constructor(){this.group=new We,this.bow=new We,this.group.add(this.bow),this.matWoodA=new $e({color:P_}),this.matWoodB=new $e({color:I_}),this.matString=new $e({color:U_}),this.matSkin=new $e({color:O_}),this.matGrip=new $e({color:N_});const t=new te(new Ee(Ho*1.25,.2,Ho*1.5),this.matGrip);this.bow.add(t),this.upper=this._limb(1),this.lower=this._limb(-1),this.bow.add(this.upper.root,this.lower.root),this.stringUp=new te(new Ee(.014,1,.014),this.matString),this.stringDown=new te(new Ee(.014,1,.014),this.matString),this.bow.add(this.stringUp,this.stringDown),this.arrow=new We,this.arrowModel=Kh(.9),this.arrowModel.rotation.y=Math.PI,this.arrowModel.position.z=-.42*.9,this.arrow.add(this.arrowModel),this.arrow.visible=!1,this.bow.add(this.arrow),this.handGrip=new te(new Ee(.11,.17,.12),this.matSkin),this.handGrip.position.set(0,-.02,.05),this.bow.add(this.handGrip),this.handPull=new te(new Ee(.11,.12,.12),this.matSkin),this.handPull.visible=!1,this.bow.add(this.handPull),this.pull=0,this.release=0,this.hasArrow=!0,this._dir=new O,this._up=new O(0,1,0),this._q=new Ts,this.tipUp=new O,this.tipDown=new O,this.nock=new O,this._applyPose(0)}_limb(t){const e=new We;e.position.y=t*.1;const n=[];let s=e;for(let r=0;r<Go;r++){const o=new We,a=Ho*(1-r*.1),l=new te(new Ee(a,ks+.004,a*1.5),r%2?this.matWoodB:this.matWoodA);l.position.y=t*ks/2,o.add(l),s.add(o),n.push(o);const c=new Te;c.position.y=t*ks,o.add(c),s=c}return{root:e,joints:n,sign:t}}_tip(t,e){let n=t.root.position.y,s=0,r=0;for(let o=0;o<Go;o++)r+=t.joints[o].rotation.x,n+=t.sign*ks*Math.cos(r),s+=t.sign*ks*Math.sin(r);e.set(0,n,s)}_placeString(t,e,n){this._dir.subVectors(n,e);const s=this._dir.length();t.position.copy(e).add(n).multiplyScalar(.5),t.scale.set(1,Math.max(.001,s),1),this._q.setFromUnitVectors(this._up,this._dir.normalize()),t.quaternion.copy(this._q)}_applyPose(t){const e=t*t*(3-2*t);this.group.position.lerpVectors(Xn.pos,Bs.pos,e);const n=Xn.scale+(Bs.scale-Xn.scale)*e;this.group.scale.setScalar(n),this.group.rotation.set(Xn.rot.x+(Bs.rot.x-Xn.rot.x)*e,Xn.rot.y+(Bs.rot.y-Xn.rot.y)*e,Xn.rot.z+(Bs.rot.z-Xn.rot.z)*e)}triggerRelease(){this.release=1}update(t,e,n){this.hasArrow=n;const s=e<this.pull?1:Math.min(1,t*16);this.pull+=(e-this.pull)*s,this.release>0&&(this.release=Math.max(0,this.release-t*3.5));const r=this.release>0?-.05*Math.sin(this.release*Math.PI)*(1-this.pull):0,o=this.pull*.075+r;for(const u of[this.upper,this.lower])for(let h=0;h<Go;h++)u.joints[h].rotation.x=u.sign*(.14+o*(.6+h*.25));this._tip(this.upper,this.tipUp),this._tip(this.lower,this.tipDown);const a=this.release>0?Math.sin(this.release*40)*.03*this.release:0,l=(this.tipUp.z+this.tipDown.z)*.5;this.nock.set(0,0,l+this.pull*F_+a),this._placeString(this.stringUp,this.tipUp,this.nock),this._placeString(this.stringDown,this.nock,this.tipDown);const c=this.pull>.03;this.arrow.visible=c&&n,this.arrow.position.set(0,0,this.nock.z),this.handPull.visible=c,this.handPull.position.set(.03,-.02,this.nock.z+.07),this._applyPose(Math.min(1,this.pull/.35))}setLight(t){}}const Vo=400;class B_{constructor(t){this.canvas=t,this.gl=new t_({canvas:t,antialias:!1,powerPreference:"high-performance"}),this.gl.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)),this.gl.autoClear=!1,this.scene=new Jl,this.camera=new sn(70,1,.05,1200),this.camera.rotation.order="YXZ",this.atlas=f_();const e=p_(this.atlas);this.matOpaque=e.opaque,this.matWater=e.water,this.uniforms=e.uniforms,this.waterUniforms=this.matWater.uniforms,this.sky=new T_(this.scene),this.chunkMeshes=new Map,this.chunkGroup=new We,this.scene.add(this.chunkGroup),this.world=null,this.renderDistance=8,this.time=0,this.fov=70,this.hemi=new lc(16777215,8947848,1),this.scene.add(this.hemi),this.sun=new gf(16777215,.8),this.scene.add(this.sun),this.scene.fog=new nl(10535167,80,120),this.selection=new cf(new uf(new Ee(1.004,1.004,1.004)),new Rh({color:0,transparent:!0,opacity:.55,depthTest:!0})),this.selection.visible=!1,this.scene.add(this.selection),this.crackMats=[];for(let n=0;n<10;n++)this.crackMats.push(new xs({map:Oi("crack_"+n),transparent:!0,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2}));this.crack=new te(new Ee(1.002,1.002,1.002),this.crackMats[0]),this.crack.visible=!1,this.scene.add(this.crack),this.particleGeo=new Ee(.12,.12,.12),this.particleMesh=new sf(this.particleGeo,new xs({color:16777215}),Vo),this.particleMesh.instanceMatrix.setUsage(Na),this.particleMesh.count=0,this.particleMesh.frustumCulled=!1,this.scene.add(this.particleMesh),this.particles=[],this._m4=new ce,this._color=new kt,this.handScene=new Jl,this.handCamera=new sn(60,1,.01,10),this.handHolder=new We,this.handScene.add(this.handHolder),this.handLight=new lc(16777215,7829367,1.2),this.handScene.add(this.handLight),this.heldId=-1,this.heldMesh=null,this.heldOwnedMaterial=null,this.swing=0,this.bob=0,this.bowPull=0,this.bowHasArrow=!0,this.bowModel=null,this.faceMatCache=new Map,this.resize(),window.addEventListener("resize",()=>this.resize())}resize(){const t=window.innerWidth||1280,e=window.innerHeight||720;this.gl.setSize(t,e,!1),this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.handCamera.aspect=t/e,this.handCamera.updateProjectionMatrix()}setRenderDistance(t){this.renderDistance=t;const e=t*xt;this.uniforms.fogFar.value=e-4,this.uniforms.fogNear.value=Math.max(16,e*.65),this.waterUniforms.fogFar.value=e-4,this.waterUniforms.fogNear.value=Math.max(16,e*.65),this.scene.fog.near=Math.max(16,e*.65),this.scene.fog.far=e-4}setChunkGeometry(t,e){this.removeChunk(t);const n={opaque:null,water:null},s=(r,o)=>{if(!r)return null;const a=new Ze;a.setAttribute("position",new Ae(r.pos,3)),a.setAttribute("uv",new Ae(r.uv,2)),a.setAttribute("aLight",new Ae(r.light,4)),a.setIndex(new Ae(r.idx,1)),a.computeBoundingSphere();const l=new te(a,o);return l.position.set(t.cx*xt,0,t.cz*xt),l.matrixAutoUpdate=!1,l.updateMatrix(),this.chunkGroup.add(l),l};n.opaque=s(e.opaque,this.matOpaque),n.water=s(e.water,this.matWater),n.water&&(n.water.renderOrder=5),this.chunkMeshes.set(t.key,n)}removeChunk(t){const e=this.chunkMeshes.get(t.key);if(e){for(const n of[e.opaque,e.water])n&&(this.chunkGroup.remove(n),n.geometry.dispose());this.chunkMeshes.delete(t.key)}}setSelection(t,e){if(!t){this.selection.visible=!1,this.crack.visible=!1;return}this.selection.visible=!0,this.selection.position.set(t.x+.5,t.y+.5,t.z+.5),e>0?(this.crack.visible=!0,this.crack.position.copy(this.selection.position),this.crack.material=this.crackMats[Math.min(9,Math.floor(e*10))]):this.crack.visible=!1}spawnBlockParticles(t,e,n,s,r=12){const o=de(s),a=d_(mn(o,4)),l=this.lightFactorAt(t+.5,e+.5,n+.5);for(let c=0;c<r;c++)this.particles.length>=Vo&&this.particles.shift(),this.particles.push({x:t+Math.random(),y:e+Math.random(),z:n+Math.random(),vx:(Math.random()-.5)*4,vy:Math.random()*5+1,vz:(Math.random()-.5)*4,life:.6+Math.random()*.6,r:a[0]/255*l*(.7+Math.random()*.3),g:a[1]/255*l*(.7+Math.random()*.3),b:a[2]/255*l*(.7+Math.random()*.3)})}spawnParticle(t){this.particles.length>=Vo&&this.particles.shift(),this.particles.push(t)}_updateParticles(t){const e=this.particles,n=this.world;for(let r=e.length-1;r>=0;r--){const o=e[r];if(o.life-=t,o.life<=0){e[r]=e[e.length-1],e.pop();continue}o.noGravity||(o.vy-=20*t);const a=o.x+o.vx*t,l=o.y+o.vy*t,c=o.z+o.vz*t;n&&n.isSolid(Math.floor(a),Math.floor(l),Math.floor(c))?(o.vx*=.5,o.vz*=.5,o.vy=0):(o.x=a,o.y=l,o.z=c)}const s=this.particleMesh;s.count=e.length;for(let r=0;r<e.length;r++){const o=e[r],a=o.size||1;this._m4.makeScale(a,a,a),this._m4.setPosition(o.x,o.y,o.z),s.setMatrixAt(r,this._m4),s.setColorAt(r,this._color.setRGB(o.r,o.g,o.b))}s.instanceMatrix.needsUpdate=!0,s.instanceColor&&(s.instanceColor.needsUpdate=!0)}lightFactorAt(t,e,n){if(!this.world)return 1;const s=Math.floor(t),r=Math.floor(e),o=Math.floor(n);let a=this.world.getSky(s,r,o)/15,l=this.world.getBlockLight(s,r,o)/15;this.world.isSolid(s,r,o)&&(a=this.world.getSky(s,r+1,o)/15,l=this.world.getBlockLight(s,r+1,o)/15);const c=u=>u/(4-3*u)*.7+u*.3;return Math.max(.06,Math.max(c(a)*this.sky.state.daylight,c(l)))}_faceMaterial(t){let e=this.faceMatCache.get(t);return e||(e=new $e({map:Oi(t),transparent:!0,alphaTest:.5}),this.faceMatCache.set(t,e)),e}setHeldItem(t){if(t===this.heldId)return;this.heldId=t,this.heldMesh&&(this.handHolder.remove(this.heldMesh),this.heldMesh.geometry&&this.heldMesh.geometry.dispose(),this.heldOwnedMaterial&&(this.heldOwnedMaterial.dispose(),this.heldOwnedMaterial=null),this.heldMesh=null);let e;if(t===Y.BOW)this.bowModel||(this.bowModel=new k_),e=this.bowModel.group;else if(t===0)this.heldOwnedMaterial=new $e({color:14264710}),e=new te(new Ee(.16,.16,.55),this.heldOwnedMaterial),e.position.set(.62,-.62,-1),e.rotation.set(.55,-.35,.35);else if(t<256&&(wn[t]===on.CUBE||wn[t]===on.LIQUID)){const n=de(t),s=[0,1,2,3,4,5].map(r=>this._faceMaterial(mn(n,r)));e=new te(new Ee(1,1,1),s),e.scale.setScalar(.28),e.position.set(.62,-.55,-1),e.rotation.set(.15,-.7,0)}else{const n=t<256?mn(de(t),0):Ne(t)?Ne(t).tex:"none";this.heldOwnedMaterial=new $e({map:Oi(n),transparent:!0,alphaTest:.5,side:Ye}),e=new te(new mi(1,1),this.heldOwnedMaterial),e.scale.setScalar(.42),e.position.set(.58,-.5,-1),e.rotation.set(.1,-.5,.3)}this.heldMesh=e,this.handHolder.add(e)}triggerSwing(){if(this.heldId===Y.BOW&&this.bowModel){this.bowModel.triggerRelease();return}this.swing=1}update(t,e,n,s){this.time+=t;const r=this.camera,o=n.getEyePos();r.position.set(o.x,o.y,o.z),r.rotation.set(n.pitch,n.yaw,0);const a=this.fov+(n.sprinting?8:0)+(n.flying?4:0)-this.bowPull*12;Math.abs(r.fov-a)>.01&&(r.fov+=(a-r.fov)*Math.min(1,t*10),r.updateProjectionMatrix());const l=this.sky.update(e,r.position,t);this.uniforms.daylight.value=l.daylight,this.uniforms.uTime.value=this.time,this.uniforms.skyTint.value.copy(l.skyTint),this.waterUniforms.daylight.value=l.daylight,this.waterUniforms.uTime.value=this.time,this.waterUniforms.skyTint.value.copy(l.skyTint);const c=this.renderDistance*xt;s?(this.uniforms.fogColor.value.setRGB(.05,.15,.4).multiplyScalar(l.daylight),this.uniforms.fogNear.value=2,this.uniforms.fogFar.value=18):(this.uniforms.fogColor.value.copy(l.fogColor),this.uniforms.fogNear.value=Math.max(16,c*.65),this.uniforms.fogFar.value=c-4),this.waterUniforms.fogColor.value.copy(this.uniforms.fogColor.value),this.waterUniforms.fogNear.value=this.uniforms.fogNear.value,this.waterUniforms.fogFar.value=this.uniforms.fogFar.value,this.scene.fog.color.copy(this.uniforms.fogColor.value),this.scene.fog.near=this.uniforms.fogNear.value,this.scene.fog.far=this.uniforms.fogFar.value,this.gl.setClearColor(this.uniforms.fogColor.value,1);const u=l.daylight;this.hemi.intensity=.35+u*.9,this.sun.intensity=u*.9,this.sun.position.copy(l.sunDir).multiplyScalar(100).add(r.position),this.sun.target.position.copy(r.position),this.sun.target.updateMatrixWorld(),this._updateParticles(t),this.swing>0&&(this.swing=Math.max(0,this.swing-t*3.2));const h=n.moveAmount||0;this.bob+=t*h*9;const d=Math.sin(this.swing*Math.PI);if(this.heldId===Y.BOW&&this.bowModel){this.bowModel.update(t,this.bowPull,this.bowHasArrow);const g=h*(1-this.bowPull*.8);this.handHolder.position.set(Math.sin(this.bob)*.02*g,Math.abs(Math.cos(this.bob))*.02*g,0),this.handHolder.rotation.set(0,0,0)}else this.handHolder.position.set(Math.sin(this.bob)*.02*h-d*.25,Math.abs(Math.cos(this.bob))*.02*h-d*.35,0),this.handHolder.rotation.set(-d*.9,d*.4,0);const f=this.lightFactorAt(o.x,o.y,o.z);this.handLight.intensity=.4+f*1.6}render(){this.gl.clear(!0,!0,!0),this.gl.render(this.scene,this.camera),this.heldMesh&&(this.gl.clearDepth(),this.gl.render(this.handScene,this.handCamera))}dispose(){for(const t of this.chunkMeshes.values())for(const e of[t.opaque,t.water])e&&(this.chunkGroup.remove(e),e.geometry.dispose());this.chunkMeshes.clear(),this.particles.length=0}}class z_{constructor(t){this.canvas=t,this.keys=new Set,this.pressed=new Set,this.released=new Set,this.mouse=[!1,!1,!1],this.mousePressed=[!1,!1,!1],this.dx=0,this.dy=0,this.wheel=0,this.locked=!1,this.enabled=!0,this.lastW=0,this.doubleTapW=!1,this.lastSpace=0,this.doubleTapSpace=!1,this.onKeyDown=null,this.noPointerLock=!1,this.touchMode=!1,this.touchSprint=!1,this._tapUp=0,this.sprintKey="KeyR",this.keyboardLocked=!1,window.addEventListener("keydown",e=>{if((e.ctrlKey||e.metaKey)&&["Equal","Minus","Digit0","NumpadAdd","NumpadSubtract","Numpad0"].includes(e.code)&&this.locked&&e.preventDefault(),this.locked&&(e.code==="AltLeft"||e.code==="AltRight"||e.altKey)&&e.preventDefault(),this.locked&&this.keyboardLocked&&e.ctrlKey&&e.preventDefault(),e.repeat){this._isGameKey(e.code)&&e.preventDefault();return}if(this.keys.add(e.code),this.pressed.add(e.code),e.code==="KeyW"){const n=performance.now();n-this.lastW<300&&(this.doubleTapW=!0),this.lastW=n}if(e.code==="Space"){const n=performance.now();n-this.lastSpace<300&&(this.doubleTapSpace=!0),this.lastSpace=n}this.onKeyDown&&this.onKeyDown(e),this._isGameKey(e.code)&&e.preventDefault()}),window.addEventListener("keyup",e=>{this.locked&&(e.code==="AltLeft"||e.code==="AltRight")&&e.preventDefault(),this.keys.delete(e.code),this.released.add(e.code)}),window.addEventListener("blur",()=>{this.keys.clear(),this.mouse=[!1,!1,!1]}),t.addEventListener("mousedown",e=>{this.locked&&(this.mouse[e.button]=!0,this.mousePressed[e.button]=!0,e.preventDefault())}),window.addEventListener("mouseup",e=>{this.mouse[e.button]=!1}),t.addEventListener("contextmenu",e=>e.preventDefault()),window.addEventListener("mousemove",e=>{this.locked&&(this.dx+=e.movementX,this.dy+=e.movementY)}),window.addEventListener("wheel",e=>{this.locked&&(e.preventDefault(),this.wheel+=Math.sign(e.deltaY))},{passive:!1}),document.addEventListener("pointerlockchange",()=>{this.locked=document.pointerLockElement===t,this.locked||(this.keys.clear(),this.mouse=[!1,!1,!1]),this.onLockChange&&this.onLockChange(this.locked)})}_isGameKey(t){return["Space","Tab","KeyW","KeyA","KeyS","KeyD","ShiftLeft","KeyE","KeyQ","KeyR","F3","F5","AltLeft"].includes(t)}lock(){if(this.noPointerLock||this.touchMode){this.locked=!0,this.onLockChange&&this.onLockChange(!0);return}if(!this.locked)try{const t=this.canvas.requestPointerLock({unadjustedMovement:!0});t&&t.catch&&t.catch(()=>this.canvas.requestPointerLock())}catch{this.canvas.requestPointerLock()}}unlock(){if(document.pointerLockElement===this.canvas){document.exitPointerLock();return}if(this.noPointerLock||this.touchMode){this.locked=!1,this.onLockChange&&this.onLockChange(!1);return}this.locked&&document.exitPointerLock()}press(t,e){e?(this.mouse[t]=!0,this.mousePressed[t]=!0):this.mouse[t]=!1}tap(t){this.press(t,!0),this._tapUp|=1<<t}down(t){return this.enabled&&this.keys.has(t)}sprintHeld(){return this.enabled?this.touchSprint||this.keys.has(this.sprintKey)&&(this.sprintKey!=="ControlLeft"||this.keyboardLocked)?!0:this.keyboardLocked&&(this.keys.has("ControlLeft")||this.keys.has("ControlRight")):!1}justPressed(t){return this.enabled&&this.pressed.has(t)}mouseDown(t){return this.enabled&&this.mouse[t]}mouseJustPressed(t){return this.enabled&&this.mousePressed[t]}consumeMouseDelta(){const t=[this.dx,this.dy];return this.dx=0,this.dy=0,t}endFrame(){if(this.pressed.clear(),this.released.clear(),this._tapUp){for(let t=0;t<3;t++)this._tapUp&1<<t&&(this.mouse[t]=!1);this._tapUp=0}this.mousePressed=[!1,!1,!1],this.wheel=0,this.doubleTapW=!1,this.doubleTapSpace=!1}}const Ve=1e-4;function Yh(i,t,e,n={}){const r=Math.max(Math.abs(t.vx),Math.abs(t.vy),Math.abs(t.vz))*e,o=Math.max(1,Math.ceil(r/.45)),a=e/o;t.onGround=!1,t.collidedH=!1;for(let l=0;l<o;l++){if(t.vx!==0){const c=t.x+t.vx*a,u=Wo(i,t,c,t.y,t.z,0);u!==null?(t.x=u,t.vx=0,t.collidedH=!0):t.x=c}if(t.vz!==0){const c=t.z+t.vz*a,u=Wo(i,t,t.x,t.y,c,2);u!==null?(t.z=u,t.vz=0,t.collidedH=!0):t.z=c}if(t.vy!==0){const c=t.y+t.vy*a,u=Wo(i,t,t.x,c,t.z,1);u!==null?(t.vy<0&&(t.onGround=!0),t.y=u,t.vy=0):t.y=c}else n.checkGround!==!1&&$h(i,t.x,t.y-.02,t.z,t.w,.02)&&(t.onGround=!0)}}function Wo(i,t,e,n,s,r){const o=t.w,a=t.h,l=Math.floor(e-o),c=Math.floor(e+o-Ve),u=Math.floor(n),h=Math.floor(n+a-Ve),d=Math.floor(s-o),f=Math.floor(s+o-Ve);let g=null;for(let _=l;_<=c;_++)for(let m=u;m<=h;m++)for(let p=d;p<=f;p++){if(!vn[i.getBlockForPhysics(_,m,p)])continue;let x;r===0?x=t.vx>0?_-o-Ve:_+1+o+Ve:r===1?x=t.vy>0?m-a-Ve:m+1+Ve:x=t.vz>0?p-o-Ve:p+1+o+Ve,g===null?g=x:g=(r===0?t.vx:r===1?t.vy:t.vz)>0?Math.min(g,x):Math.max(g,x)}return g}function $h(i,t,e,n,s,r){const o=Math.floor(t-s),a=Math.floor(t+s-Ve),l=Math.floor(e),c=Math.floor(e+r-Ve),u=Math.floor(n-s),h=Math.floor(n+s-Ve);for(let d=o;d<=a;d++)for(let f=l;f<=c;f++)for(let g=u;g<=h;g++)if(vn[i.getBlockForPhysics(d,f,g)])return!0;return!1}function Zh(i,t){const e=t.w,n=Math.floor(t.x-e),s=Math.floor(t.x+e-Ve),r=Math.floor(t.y),o=Math.floor(t.y+t.h-Ve),a=Math.floor(t.z-e),l=Math.floor(t.z+e-Ve);let c=!1,u=!1,h=!1;for(let _=n;_<=s;_++)for(let m=r;m<=o;m++)for(let p=a;p<=l;p++){const x=i.getBlock(_,m,p);jt[x]===1?c=!0:jt[x]===2&&(u=!0)}for(let _=n-1;_<=s+1;_++)for(let m=r;m<=o;m++)for(let p=a-1;p<=l+1;p++)i.getBlock(_,m,p)===b.CACTUS&&t.x+e>_+1/16-.001&&t.x-e<_+15/16+.001&&t.z+e>p+1/16-.001&&t.z-e<p+15/16+.001&&(h=!0);const d=t.y+(t.eyeHeight||t.h*.9),f=i.getBlock(Math.floor(t.x),Math.floor(d),Math.floor(t.z)),g=jt[f]===1&&d-Math.floor(d)<$o(f);return{water:c,lava:u,headWater:g,cactus:h}}function Ga(i,t,e){e?(i.vy-=wl*.15*t,i.vy*=Math.pow(.15,t),i.vy<-3&&(i.vy=-3)):(i.vy-=wl*t,i.vy<-78&&(i.vy=-78))}function Kc(i,t){return Math.abs(i.x-t.x)<i.w+t.w&&i.y<t.y+t.h&&t.y<i.y+i.h&&Math.abs(i.z-t.z)<i.w+t.w}function G_(i,t,e,n,s,r,o,a,l,c,u,h){let d=0,f=1/0;const g=[i,t,e],_=[n,s,r],m=[o,a,l],p=[c,u,h];for(let x=0;x<3;x++)if(Math.abs(_[x])<1e-9){if(g[x]<m[x]||g[x]>p[x])return-1}else{let v=(m[x]-g[x])/_[x],y=(p[x]-g[x])/_[x];if(v>y){const A=v;v=y,y=A}if(v>d&&(d=v),y<f&&(f=y),d>f)return-1}return d}class H_{constructor(t){this.slots=new Array(t).fill(null)}get size(){return this.slots.length}add(t,e=1){const n=Ge(t);for(let s=0;s<this.slots.length&&e>0;s++){const r=this.slots[s];if(r&&r.id===t&&r.count<n&&!r.dur){const o=Math.min(n-r.count,e);r.count+=o,e-=o}}for(let s=0;s<this.slots.length&&e>0;s++)if(!this.slots[s]){const r=Math.min(n,e);this.slots[s]={id:t,count:r},e-=r}return e}addStack(t){if(!t)return null;if(t.dur){for(let n=0;n<this.slots.length;n++)if(!this.slots[n])return this.slots[n]=t,null;return t}const e=this.add(t.id,t.count);return e===0?null:{id:t.id,count:e}}count(t){let e=0;for(const n of this.slots)n&&n.id===t&&(e+=n.count);return e}remove(t,e){let n=0;for(let s=0;s<this.slots.length&&n<e;s++){const r=this.slots[s];if(r&&r.id===t){const o=Math.min(r.count,e-n);r.count-=o,n+=o,r.count<=0&&(this.slots[s]=null)}}return n}consumeSlot(t,e=1){const n=this.slots[t];n&&(n.count-=e,n.count<=0&&(this.slots[t]=null))}damageTool(t,e=1){const n=this.slots[t];if(!n)return!1;const s=Ne(n.id);return!s||!s.durability?!1:(n.dur=(n.dur||0)+e,n.dur>=s.durability?(this.slots[t]=null,!0):!1)}clear(){this.slots.fill(null)}serialize(){return this.slots.map(t=>t?[t.id,t.count,t.dur||0]:0)}deserialize(t){for(let e=0;e<this.slots.length;e++){const n=t[e];this.slots[e]=n&&n[0]?{id:n[0],count:n[1],dur:n[2]||0}:null}}}const Yc=4.3,V_=5.8,W_=1.3,X_=2.4,q_=11,K_=22,Y_=9.2;class $_{constructor(t){this.game=t,this.x=0,this.y=80,this.z=0,this.vx=0,this.vy=0,this.vz=0,this.yaw=0,this.pitch=0,this.w=.3,this.h=1.8,this.eyeHeight=1.62,this.onGround=!1,this.inWater=!1,this.headWater=!1,this.inLava=!1,this.flying=!1,this.sprinting=!1,this.sneaking=!1,this.health=20,this.maxHealth=20,this.food=20,this.foodTimer=0,this.healTimer=0,this.starveTimer=0,this.air=300,this.mode=Wr.SURVIVAL,this.inventory=new H_(36),this.selected=0,this.hurtTime=0,this.fallStart=null,this.dead=!1,this.moveAmount=0,this.exhaustion=0,this.sensitivity=.0022,this.spawn={x:0,y:80,z:0},this.stepDist=0,this.lastDamageCause="",this.fireTime=0,this.drawing=!1}get heldItem(){return this.inventory.slots[this.selected]}get heldId(){const t=this.inventory.slots[this.selected];return t?t.id:0}get creative(){return this.mode===Wr.CREATIVE}getEyePos(){return{x:this.x,y:this.y+this.eyeHeight,z:this.z}}getLookDir(){const t=Math.cos(this.pitch);return{x:-Math.sin(this.yaw)*t,y:Math.sin(this.pitch),z:-Math.cos(this.yaw)*t}}teleport(t,e,n){this.x=t,this.y=e,this.z=n,this.vx=this.vy=this.vz=0,this.fallStart=null}update(t,e,n){if(this.dead)return;const[s,r]=e.consumeMouseDelta();if(e.enabled){this.yaw-=s*this.sensitivity,this.pitch-=r*this.sensitivity;const T=Math.PI/2-.001;this.pitch>T&&(this.pitch=T),this.pitch<-T&&(this.pitch=-T)}const o=Zh(n,this);this.inWater=o.water,this.headWater=o.headWater,this.inLava=o.lava;const a=e.down("ShiftLeft")||e.down("ShiftRight");this.sneaking=a&&!this.flying,this.eyeHeight=this.sneaking?1.42:1.62;const l=e.down("KeyW");e.doubleTapW&&l&&!this.sneaking&&this.food>6&&(this.sprinting=!0),e.sprintHeld()&&l&&!this.sneaking&&this.food>6&&(this.sprinting=!0),(!l||this.sneaking||this.food<=6&&!this.creative)&&(this.sprinting=!1),this.creative&&e.doubleTapSpace&&(this.flying=!this.flying,this.vy=0),this.creative||(this.flying=!1);let c=0,u=0;l&&(u+=1),e.down("KeyS")&&(u-=1),e.down("KeyA")&&(c-=1),e.down("KeyD")&&(c+=1);const h=Math.hypot(c,u);h>0&&(c/=h,u/=h);const d=Math.sin(this.yaw),f=Math.cos(this.yaw),g=-d*u+f*c,_=-f*u-d*c;let m=Yc;this.flying?m=this.sprinting?K_:q_:this.inWater?m=X_:this.sneaking?m=W_:this.sprinting&&(m=V_),this.drawing&&!this.flying&&(m*=.25);const p=g*m,x=_*m;let v;this.flying?v=8:this.inWater?v=4:this.onGround?v=14:v=2.5;const y=1-Math.exp(-v*t);if(this.vx+=(p-this.vx)*y,this.vz+=(x-this.vz)*y,this.flying){let T=0;e.down("Space")&&(T+=m),a&&(T-=m),this.vy+=(T-this.vy)*(1-Math.exp(-8*t))}else this.inWater?(Ga(this,t,!0),e.down("Space")&&(this.vy=Math.min(this.vy+30*t,3.2)),this.onGround&&e.down("Space")&&!o.headWater&&(this.vy=5)):(Ga(this,t,!1),e.down("Space")&&this.onGround&&(this.vy=Y_,this.onGround=!1,this.exhaustion+=this.sprinting?.2:.05));if(this.sneaking&&this.onGround&&!this.flying){const T=this.x+this.vx*t,R=this.z+this.vz*t,P=(E,w)=>$h(n,E,this.y-.05,w,this.w,.05);P(T,this.z)||(this.vx=0),P(this.x,R)||(this.vz=0),!P(T,R)&&this.vx!==0&&this.vz!==0&&(this.vx=0,this.vz=0)}if(this.onGround,this.y,Yh(n,this,t),this.flying&&(this.onGround=!1),!this.onGround&&!this.inWater&&!this.flying&&(this.fallStart===null||this.y>this.fallStart)&&(this.fallStart=this.y),this.onGround&&this.fallStart!==null){const T=this.fallStart-this.y;this.fallStart=null,T>3.2&&!this.creative&&!this.inWater?(this.damage(Math.floor(T-3),"fall"),this.game.audio.play("fall")):T>.5&&this.game.audio.play("land")}(this.inWater||this.flying)&&(this.fallStart=null);const A=Math.hypot(this.vx,this.vz);if(this.moveAmount=this.onGround?Math.min(1,A/Yc):0,this.stepDist+=A*t,this.onGround&&this.stepDist>(this.sprinting?2.2:1.9)&&A>1){this.stepDist=0;const T=n.getBlock(Math.floor(this.x),Math.floor(this.y-.1),Math.floor(this.z));this.game.audio.playStep(T)}A>.5&&this.onGround&&(this.exhaustion+=(this.sprinting?.1:.01)*t*A),this.creative?(this.health=this.maxHealth,this.food=20,this.air=300):(this.inLava&&(this.damage(4*t+.001,"lava",!0),this.fireTime=3),this.fireTime>0&&(this.fireTime-=t,this.inLava||this.damage(1*t,"fire",!0),this.inWater&&(this.fireTime=0)),o.cactus&&this.damage(1*t+.001,"cactus",!0),this.headWater?(this.air-=t*20,this.air<=0&&(this.air=0,this.damage(2*t,"drown",!0))):this.air=Math.min(300,this.air+t*60),this.y<-10&&this.damage(4*t+.1,"void",!0),this._updateHunger(t)),this.hurtTime>0&&(this.hurtTime-=t)}_updateHunger(t){this.exhaustion>=4&&(this.exhaustion-=4,this.food>0&&(this.food-=1)),this.foodTimer+=t,this.foodTimer>45&&(this.foodTimer=0,this.food>0&&(this.food-=1)),this.food>=18&&this.health<this.maxHealth&&(this.healTimer+=t,this.healTimer>3&&(this.healTimer=0,this.health=Math.min(this.maxHealth,this.health+1),this.exhaustion+=.6)),this.food<=0&&(this.starveTimer+=t,this.starveTimer>4&&(this.starveTimer=0,this.health>1&&this.damage(1,"starve",!0)))}damage(t,e="",n=!1){return this.dead||t<=0||this.creative||!n&&this.hurtTime>0?!1:(this.health-=t,this.lastDamageCause=e,n?this.game.onPlayerHurt(0):(this.hurtTime=.5,this.game.onPlayerHurt(t)),this.health<=0&&(this.health=0,this.dead=!0,this.game.onPlayerDeath(e)),!0)}heal(t){this.health=Math.min(this.maxHealth,this.health+t)}eat(t,e=0){this.food=Math.min(20,this.food+t),e&&this.heal(e)}knockback(t,e,n=6){const s=Math.hypot(t,e)||1;this.vx+=t/s*n,this.vz+=e/s*n,this.vy=Math.max(this.vy,4)}respawn(){this.dead=!1,this.health=this.maxHealth,this.food=20,this.air=300,this.fireTime=0,this.hurtTime=0,this.fallStart=null,this.teleport(this.spawn.x,this.spawn.y,this.spawn.z)}serialize(){return{x:this.x,y:this.y,z:this.z,yaw:this.yaw,pitch:this.pitch,health:this.health,food:this.food,mode:this.mode,flying:this.flying,selected:this.selected,inventory:this.inventory.serialize(),spawn:this.spawn}}deserialize(t){this.x=t.x,this.y=t.y,this.z=t.z,this.yaw=t.yaw||0,this.pitch=t.pitch||0,this.health=t.health??20,this.food=t.food??20,this.mode=t.mode??0,this.flying=!!t.flying,this.selected=t.selected||0,t.inventory&&this.inventory.deserialize(t.inventory),t.spawn&&(this.spawn=t.spawn)}}let Z_=1;class Qs{constructor(t,e,n,s){this.id=Z_++,this.type=t,this.x=e,this.y=n,this.z=s,this.vx=0,this.vy=0,this.vz=0,this.w=.3,this.h=1.8,this.onGround=!1,this.inWater=!1,this.dead=!1,this.age=0,this.mesh=null,this.gravity=!0,this.persistent=!1}physics(t,e){const n=Zh(t,this);this.inWater=n.water,this.inLava=n.lava,this.gravity&&Ga(this,e,this.inWater);const s=this.onGround?Math.pow(.02,e):Math.pow(.4,e);this.friction!==!1&&(this.vx*=s,this.vz*=s),Yh(t,this,e)}update(t,e){this.age+=t}syncMesh(t){this.mesh&&this.mesh.position.set(this.x,this.y,this.z)}remove(){this.dead=!0}dispose(t){this.mesh&&(t.remove(this.mesh),this.mesh.traverse(e=>{e.geometry&&e.geometry.dispose()}),this.mesh=null)}distanceTo(t){return Math.hypot(this.x-t.x,this.y-t.y,this.z-t.z)}}class j_{constructor(t){this.game=t,this.list=[]}add(t){return this.list.push(t),t.mesh&&this.game.renderer.scene.add(t.mesh),t}update(t){const e=this.game,n=this.list;for(let s=0;s<n.length;s++){const r=n[s];r.dead||(r.update(t,e),r.dead||r.syncMesh(e))}for(let s=n.length-1;s>=0;s--)n[s].dead&&(n[s].dispose(e.renderer.scene),n[s]=n[n.length-1],n.pop())}raycast(t,e,n,s,r,o,a,l=null){let c=null;for(const u of this.list){if(u.dead||l&&!l(u))continue;const h=G_(t,e,n,s,r,o,u.x-u.w,u.y,u.z-u.w,u.x+u.w,u.y+u.h,u.z+u.w);h>=0&&h<=a&&(!c||h<c.dist)&&(c={entity:u,dist:h})}return c}nearby(t,e,n,s,r=null){const o=[];for(const a of this.list)a.dead||r&&!r(a)||Math.hypot(a.x-t,a.y-e,a.z-n)<=s&&o.push(a);return o}count(t){let e=0;for(const n of this.list)!n.dead&&t(n)&&e++;return e}clear(){for(const t of this.list)t.dispose(this.game.renderer.scene);this.list.length=0}serialize(){const t=[];for(const e of this.list)!e.dead&&e.serialize&&t.push(e.serialize());return t}}const $c=new Map;function Zc(i,t=!1){const e=i+(t?":d":"");let n=$c.get(e);return n||(n=new $e({map:Oi(i),transparent:!0,alphaTest:.5,side:t?Ye:Nn}),$c.set(e,n)),n}function J_(i,t=1){let e;if(i<256&&(wn[i]===on.CUBE||wn[i]===on.LIQUID)){const n=de(i);e=new te(new Ee(.25*t,.25*t,.25*t),[0,1,2,3,4,5].map(s=>Zc(mn(n,s))))}else{const n=i<256?mn(de(i),0):Ne(i)?Ne(i).tex:"none";e=new te(new mi(.35*t,.35*t),Zc(n,!0))}return e}class jc extends Qs{constructor(t,e,n,s){super("item",t,e,n),this.stack=s,this.w=.12,this.h=.25,this.pickupDelay=.6,this.mesh=new We,this.inner=J_(s.id),this.mesh.add(this.inner),this.mesh.position.set(t,e,n),this.spin=Math.random()*Math.PI*2,this.persistent=!1}update(t,e){if(this.age+=t,this.age>300){this.dead=!0;return}if(this.pickupDelay>0&&(this.pickupDelay-=t),this.physics(e.world,t),this.y<-5){this.dead=!0;return}this.inWater&&(this.vy=Math.max(this.vy,.8)),this.spin+=t*2;const n=e.player;if(this.pickupDelay<=0&&!n.dead){const s=Math.hypot(n.x-this.x,n.y+.9-this.y,n.z-this.z);if(s<2){const r=n.inventory.addStack({...this.stack});r?r.count!==this.stack.count?(this.stack.count=r.count,e.audio.play("pop"),e.hud.inventoryChanged()):this.pickupDelay=1:(this.dead=!0,e.audio.play("pop",{pitch:.9+Math.random()*.3}),e.hud.inventoryChanged())}else s<4.5&&(this.vx+=(n.x-this.x)*t*6,this.vz+=(n.z-this.z)*t*6)}if(this.age>1&&Math.random()<t*2)for(const s of e.entities.nearby(this.x,this.y,this.z,.8,r=>r.type==="item"&&r!==this&&!r.dead))s.stack.id===this.stack.id&&!s.stack.dur&&!this.stack.dur&&this.stack.count+s.stack.count<=64&&(this.stack.count+=s.stack.count,s.dead=!0)}syncMesh(t){this.mesh.position.set(this.x,this.y+.1+Math.sin(this.spin)*.05,this.z),this.inner.rotation.y=this.spin;const e=t.renderer.lightFactorAt(this.x,this.y+.2,this.z),n=Array.isArray(this.inner.material)?this.inner.material:[this.inner.material];for(const s of n)s.color.setScalar(e)}serialize(){return{type:"item",x:this.x,y:this.y,z:this.z,stack:this.stack}}}class jh extends Qs{constructor(t,e,n,s,r,o,a,l=3,c=!1){super("arrow",t,e,n),this.vx=s,this.vy=r,this.vz=o,this.shooter=a,this.fromPlayer=!!(a&&a.inventory),this.w=.1,this.h=.1,this.stuck=!1,this.stuckTime=0,this.damageAmount=l,this.crit=c,this.gravity=!1,this.friction=!1,this.mesh=Kh(1),this.mesh.position.set(t,e,n),this.mesh.lookAt(t+s,e+r,n+o),this.spin=Math.random()*Math.PI*2,this.trail=new D_(c?16767082:16052454,c?.045:.03,c?14:10),this._camDist=0,this.trailAdded=!1,this.trailDist=0,this._axis=new O(0,0,1)}dispose(t){this.trail&&(t.remove(this.trail.mesh),this.trail.dispose(),this.trail=null),this.mesh&&(t.remove(this.mesh),R_(this.mesh),this.mesh=null)}update(t,e){this.age+=t;const n=e.world,s=e.player;if(this.trailAdded||(e.renderer.scene.add(this.trail.mesh),this.trailAdded=!0),this.stuck){if(this.stuckTime+=t,this.trail.points.length&&(this.trail.update(e.renderer.camera.position,Math.max(0,1-this.stuckTime*4)),this.stuckTime>.3&&this.trail.clear()),this.stuckTime>60){this.dead=!0;return}this.fromPlayer&&this.stuckTime>.4&&!s.dead&&Math.hypot(s.x-this.x,s.y+.9-this.y,s.z-this.z)<1.5&&(s.creative||s.inventory.add(Y.ARROW,1)===0)&&(this.dead=!0,e.audio.play("pop",{pitch:1.2}),e.hud.inventoryChanged());return}if(this.age>45){this.dead=!0;return}const r=jt[n.getBlock(Math.floor(this.x),Math.floor(this.y),Math.floor(this.z))]===1;this.vy-=17*t;const o=Math.pow(r?.2:.9,t);this.vx*=o,this.vy*=o,this.vz*=o;const a=this.x,l=this.y,c=this.z,u=a+this.vx*t,h=l+this.vy*t,d=c+this.vz*t,f=u-a,g=h-l,_=d-c,m=Math.hypot(f,g,_);if(m<1e-6)return;const p=e.entities.raycast(a,l,c,f/m,g/m,_/m,m,A=>A.damage&&A!==this.shooter&&A.type!=="item"&&A.type!=="arrow"&&!(A.dying>0));if(p){p.entity.damage(this.damageAmount,f,_,e,this.fromPlayer?"player":"arrow"),this.fromPlayer&&(p.entity.lastAttacker=this.shooter),e.audio.play("arrow_hit",{x:this.x,y:this.y,z:this.z});for(let A=0;A<8;A++)e.renderer.spawnParticle({x:p.entity.x+(Math.random()-.5)*.4,y:p.entity.y+p.entity.h*.6,z:p.entity.z+(Math.random()-.5)*.4,vx:(Math.random()-.5)*3,vy:Math.random()*3+1,vz:(Math.random()-.5)*3,life:.5,r:.8,g:.1,b:.1,size:1});if(this.crit)for(let A=0;A<6;A++)e.renderer.spawnParticle({x:p.entity.x,y:p.entity.y+p.entity.h*.6,z:p.entity.z,vx:(Math.random()-.5)*3,vy:Math.random()*3,vz:(Math.random()-.5)*3,life:.5,r:1,g:.9,b:.4,size:1.2});this.dead=!0;return}if(!this.fromPlayer&&!s.dead){const A=Q_(a,l,c,f,g,_,s);if(A>=0&&A<=1){s.damage(this.damageAmount,"arrow")&&s.knockback(f,_,3),this.dead=!0;return}}const x=Math.max(1,Math.ceil(m/.25));for(let A=1;A<=x;A++){const T=A/x,R=a+f*T,P=l+g*T,E=c+_*T;if(vn[n.getBlockForPhysics(Math.floor(R),Math.floor(P),Math.floor(E))]){const w=(A-1)/x;this.x=a+f*w,this.y=l+g*w,this.z=c+_*w,this.stuck=!0,this.stuckTime=0,e.audio.play("arrow_hit",{x:this.x,y:this.y,z:this.z});const L=n.getBlock(Math.floor(R),Math.floor(P),Math.floor(E));L&&e.renderer.spawnBlockParticles(Math.floor(R),Math.floor(P),Math.floor(E),L,5);return}}this.x=u,this.y=h,this.z=d,this.spin+=t*20;const v=e.renderer.camera.position;this._camDist=Math.hypot(v.x-this.x,v.y-this.y,v.z-this.z);const y=Math.min(1,Math.max(0,(this._camDist-2)/5));this.trail.push(this.x,this.y,this.z),this.trail.update(v,y),this.trailDist+=m,this.crit&&this.trailDist>1.2&&y>.5&&(this.trailDist=0,e.renderer.spawnParticle({x:this.x,y:this.y,z:this.z,vx:(Math.random()-.5)*.8,vy:(Math.random()-.5)*.8,vz:(Math.random()-.5)*.8,life:.35,r:1,g:.88,b:.45,size:.45,noGravity:!0})),this.y<-5&&(this.dead=!0)}syncMesh(t){this.mesh.position.set(this.x,this.y,this.z),this.stuck||(this.mesh.lookAt(this.x+this.vx,this.y+this.vy,this.z+this.vz),this.mesh.rotateOnAxis(this._axis,this.spin)),A_(this.mesh,t.renderer.lightFactorAt(this.x,this.y,this.z))}}function Q_(i,t,e,n,s,r,o){let a=0,l=1;const c=[i,t,e],u=[n,s,r],h=[o.x-o.w,o.y,o.z-o.w],d=[o.x+o.w,o.y+o.h,o.z+o.w];for(let f=0;f<3;f++){if(Math.abs(u[f])<1e-9){if(c[f]<h[f]||c[f]>d[f])return-1;continue}let g=(h[f]-c[f])/u[f],_=(d[f]-c[f])/u[f];if(g>_){const m=g;g=_,_=m}if(a=Math.max(a,g),l=Math.min(l,_),a>l)return-1}return a}class Jc extends Qs{constructor(t,e,n,s=4){super("tnt",t,e,n),this.w=.49,this.h=.98,this.fuse=s;const r=de(b.TNT);this.mesh=new te(new Ee(.98,.98,.98),[0,1,2,3,4,5].map(o=>new $e({map:Oi(mn(r,o))}))),this.mesh.position.set(t,e+.49,n),this.vy=2}update(t,e){this.age+=t,this.fuse-=t,this.physics(e.world,t),this.fuse<=0&&(this.dead=!0,e.explode(this.x,this.y+.5,this.z,4,this))}syncMesh(t){this.mesh.position.set(this.x,this.y+.49,this.z);const e=Math.floor(this.fuse*6)%2===0?2.5:1;for(const n of this.mesh.material)n.color.setScalar(e*t.renderer.lightFactorAt(this.x,this.y+.5,this.z))}}class Qc extends Qs{constructor(t,e,n,s){super("falling",t+.5,e,n+.5),this.blockId=s,this.w=.49,this.h=.98;const r=de(s);this.mesh=new te(new Ee(.98,.98,.98),[0,1,2,3,4,5].map(o=>new $e({map:Oi(mn(r,o))}))),this.mesh.position.set(this.x,e+.49,this.z),this.friction=!1}update(t,e){if(this.age+=t,this.physics(e.world,t),this.onGround||this.age>30){this.dead=!0;const n=Math.floor(this.x),s=Math.round(this.y),r=Math.floor(this.z),o=e.world.getBlock(n,s,r);ci[o]&&s>=0?e.world.setBlock(n,s,r,this.blockId,"fall"):e.dropItem(this.x,this.y,this.z,{id:this.blockId,count:1})}this.y<-5&&(this.dead=!0)}syncMesh(t){this.mesh.position.set(this.x,this.y+.49,this.z);const e=t.renderer.lightFactorAt(this.x,this.y+.5,this.z);for(const n of this.mesh.material)n.color.setScalar(e)}}const Jh={pig:{hostile:!1,health:10,speed:1.6,w:.45,h:.9,drops:[[Y.PORKCHOP,1,3]],sound:"pig"},cow:{hostile:!1,health:10,speed:1.4,w:.45,h:1.4,drops:[[Y.BEEF,1,3],[Y.LEATHER,0,2]],sound:"cow"},sheep:{hostile:!1,health:8,speed:1.4,w:.45,h:1.3,drops:[[b.WOOL,1,1],[Y.MUTTON,1,2]],sound:"sheep"},chicken:{hostile:!1,health:4,speed:1.3,w:.2,h:.7,drops:[[Y.CHICKEN,1,1],[Y.FEATHER,0,2]],sound:"chicken"},zombie:{hostile:!0,health:20,speed:2.4,w:.3,h:1.95,damage:3,drops:[[Y.ROTTEN_FLESH,0,2]],sound:"zombie",burns:!0},skeleton:{hostile:!0,health:20,speed:2.6,w:.3,h:1.95,damage:2,drops:[[Y.BONE,0,2],[Y.ARROW,0,2]],sound:"skeleton",burns:!0,ranged:!0},creeper:{hostile:!0,health:20,speed:2.6,w:.3,h:1.7,damage:0,drops:[[Y.GUNPOWDER,0,2]],sound:"creeper"}},Xo=["pig","cow","sheep","chicken"],qo=new Map;function Ai(i,t,e){if(qo.has(i))return qo.get(i);const n=document.createElement("canvas");n.width=8,n.height=8;const s=n.getContext("2d");s.fillStyle=t,s.fillRect(0,0,8,8),e(s);const r=new sl(n);return r.magFilter=we,r.minFilter=we,qo.set(i,r),r}const re=(i,t,e,n,s,r)=>{i.fillStyle=r,i.fillRect(t,e,n,s)},os={pig:()=>Ai("pig","#f0a0a0",i=>{re(i,1,2,1,1,"#222"),re(i,6,2,1,1,"#222"),re(i,2,4,4,3,"#e08a8a"),re(i,3,5,1,1,"#c66"),re(i,5,5,1,1,"#c66")}),cow:()=>Ai("cow","#4a3626",i=>{re(i,1,2,1,1,"#222"),re(i,6,2,1,1,"#222"),re(i,2,5,4,3,"#d8c8c0"),re(i,3,6,1,1,"#a88"),re(i,5,6,1,1,"#a88")}),sheep:()=>Ai("sheep","#e8e0d8",i=>{re(i,1,3,1,1,"#222"),re(i,6,3,1,1,"#222"),re(i,2,5,4,3,"#c9b8a8")}),chicken:()=>Ai("chicken","#f4f4f4",i=>{re(i,1,2,1,1,"#222"),re(i,6,2,1,1,"#222"),re(i,3,4,2,2,"#e8b020"),re(i,3,6,2,2,"#d03030")}),zombie:()=>Ai("zombie","#5a9a4a",i=>{re(i,1,3,2,1,"#111"),re(i,5,3,2,1,"#111"),re(i,3,6,2,1,"#2a4a24")}),skeleton:()=>Ai("skeleton","#d8d8d8",i=>{re(i,1,3,2,1,"#333"),re(i,5,3,2,1,"#333"),re(i,2,6,4,1,"#666"),re(i,3,5,2,1,"#888")}),creeper:()=>Ai("creeper","#4aa04a",i=>{re(i,1,2,2,2,"#111"),re(i,5,2,2,2,"#111"),re(i,3,4,2,3,"#111"),re(i,2,5,1,3,"#111"),re(i,5,5,1,3,"#111")})};function nn(i,t,e,n,s=null){const r=new Ee(i/16,t/16,e/16),o=new $e({color:n});let a=o;s&&(a=[o,o,o,o,o,new $e({map:s,color:16777215})]);const l=new te(r,a);return l.userData.baseColor=new kt(n),l}function tv(i){const t=new We,e={group:t,legs:[],arms:[],head:null,body:null},n=(s,r,o,a)=>(s.position.set(r/16,o/16,a/16),t.add(s),s);switch(i){case"pig":{e.body=n(nn(10,8,16,15769760),0,10,0),e.head=n(nn(8,8,8,15769760,os.pig()),0,12,-10);for(const[s,r]of[[-3,-5],[3,-5],[-3,5],[3,5]])e.legs.push(n(si(4,6,4,14717072),s,6,r));break}case"cow":{e.body=n(nn(12,10,18,4863526),0,17,0),e.head=n(nn(8,8,6,4863526,os.cow()),0,20,-12);for(const[s,r]of[[-4,-6],[4,-6],[-4,6],[4,6]])e.legs.push(n(si(4,12,4,3811868),s,12,r));break}case"sheep":{e.body=n(nn(10,9,16,15261912),0,15,0),e.head=n(nn(6,6,8,15261912,os.sheep()),0,18,-10);for(const[s,r]of[[-3,-5],[3,-5],[-3,5],[3,5]])e.legs.push(n(si(4,12,4,13682880),s,12,r));break}case"chicken":{e.body=n(nn(6,6,8,16053492),0,8,0),e.head=n(nn(4,6,3,16053492,os.chicken()),0,12,-4);for(const[s]of[[-1.5],[1.5]])e.legs.push(n(si(1,5,3,15249440),s,5,0));break}case"zombie":case"skeleton":{const s=i==="zombie"?5937738:14211288,r=i==="zombie"?2780835:13158600,o=i==="zombie"?3820170:12632256,a=i==="zombie"?4:2;e.body=n(nn(8,12,4,r),0,18,0),e.head=n(nn(8,8,8,s,os[i]()),0,28,0),e.arms.push(n(th(a,12,a,s),-(4+a/2),22,0)),e.arms.push(n(th(a,12,a,s),4+a/2,22,0)),e.legs.push(n(si(a,12,a,o),-2,12,0)),e.legs.push(n(si(a,12,a,o),2,12,0));break}case"creeper":{e.body=n(nn(8,12,4,4890698),0,14,0),e.head=n(nn(8,8,8,4890698,os.creeper()),0,24,0);for(const[s,r]of[[-2,-3],[2,-3],[-2,3],[2,3]])e.legs.push(n(si(4,6,4,3836474),s,6,r));break}}return e}function si(i,t,e,n){const s=nn(i,t,e,n);return s.geometry.translate(0,-t/32,0),s.position.y=0,s.userData.pivotTop=!0,s}function th(i,t,e,n){return si(i,t,e,n)}class ev extends Qs{constructor(t,e,n,s){super(t,e,n,s);const r=Jh[t];this.def=r,this.w=r.w,this.h=r.h,this.health=r.health,this.maxHealth=r.health,this.yaw=Math.random()*Math.PI*2,this.state="idle",this.stateTimer=Math.random()*3,this.moveDirX=0,this.moveDirZ=0,this.attackCooldown=0,this.hurtTime=0,this.dying=0,this.fuse=-1,this.noiseTimer=2+Math.random()*8,this.burning=!1,this.animTime=0,this.fleeTimer=0,this.persistent=!0,this.model=tv(t),this.mesh=this.model.group,this.mesh.position.set(e,n,s),this.lastAttacker=null,this.despawnTimer=0}get hostile(){return this.def.hostile}update(t,e){this.age+=t;const n=e.world,s=e.player;if(this.dying>0){this.dying-=t,this.mesh.rotation.z=Math.min(Math.PI/2,(1.2-this.dying)*4),this.dying<=0&&(this.dead=!0);return}this.hurtTime>0&&(this.hurtTime-=t),this.attackCooldown>0&&(this.attackCooldown-=t),this.stateTimer-=t;const r=s.x-this.x,o=s.z-this.z,a=s.y-this.y,l=Math.hypot(r,o),c=Math.hypot(r,a,o),u=this.def;if(c>90){this.dead=!0;return}if(c>45&&!this.persistentTamed){if(this.despawnTimer+=t,this.despawnTimer>40){this.dead=!0;return}}else this.despawnTimer=0;if(this.noiseTimer-=t,this.noiseTimer<=0&&(this.noiseTimer=4+Math.random()*12,c<20&&u.sound!=="creeper"&&e.audio.play(u.sound,{x:this.x,y:this.y,z:this.z,pitch:.9+Math.random()*.2})),u.burns){const v=n.getSky(Math.floor(this.x),Math.floor(this.y+1),Math.floor(this.z));this.burning=v>=14&&e.daylight>.75&&!this.inWater,this.burning&&(this.burnTimer=(this.burnTimer||0)+t,this.burnTimer>1&&(this.burnTimer=0,this.damage(1,0,0,e,"fire")),Math.random()<t*8&&e.renderer.spawnParticle({x:this.x+(Math.random()-.5)*.6,y:this.y+Math.random()*this.h,z:this.z+(Math.random()-.5)*.6,vx:0,vy:1.5,vz:0,life:.5,r:1,g:.5+Math.random()*.4,b:.1,size:.8,noGravity:!0}))}this.inLava&&this.damage(2*t+.01,0,0,e,"lava",!0);let h=0,d=0,f=u.speed;const g=c<16&&!s.dead;switch(u.hostile&&g?this.state="chase":this.state==="chase"&&(c>24||s.dead)&&(this.state="idle",this.stateTimer=1),this.fleeTimer>0?(this.fleeTimer-=t,this.state="flee"):this.state==="flee"&&(this.state="idle"),this.state){case"idle":if(this.stateTimer<=0){this.state="wander",this.stateTimer=2+Math.random()*4;const v=Math.random()*Math.PI*2;this.moveDirX=Math.sin(v),this.moveDirZ=Math.cos(v)}break;case"wander":if(h=this.moveDirX,d=this.moveDirZ,f*=.55,this.stateTimer<=0&&(this.state="idle",this.stateTimer=1+Math.random()*5),this.onGround){const v=Math.floor(this.x+h*1.2),y=Math.floor(this.z+d*1.2),A=Math.floor(this.y),T=!n.isSolid(v,A-1,y)&&!n.isSolid(v,A-2,y)&&!n.isSolid(v,A-3,y),R=jt[n.getBlock(v,A,y)]!==0||jt[n.getBlock(v,A-1,y)]===2;(T||R)&&(this.moveDirX=-this.moveDirX,this.moveDirZ=-this.moveDirZ,h=this.moveDirX,d=this.moveDirZ)}break;case"flee":{const v=l||1;h=-r/v,d=-o/v,f*=1.3;break}case"chase":{const v=l||1;if(u.ranged){if(l<5?(h=-r/v,d=-o/v):l>9&&(h=r/v,d=o/v),this.shootTimer=(this.shootTimer||0)-t,this.shootTimer<=0&&c<16){this.shootTimer=2.2;const y=s.x-this.x,A=s.y+1.2-(this.y+1.5),T=s.z-this.z,R=Math.hypot(y,A,T)||1,P=22,E=new jh(this.x,this.y+1.5,this.z,y/R*P,A/R*P+R*.35,T/R*P,this);e.entities.add(E),e.audio.play("bow",{x:this.x,y:this.y,z:this.z})}}else this.type==="creeper"?(c<3?this.fuse<0&&(this.fuse=1.5,e.audio.play("creeper",{x:this.x,y:this.y,z:this.z})):c>6&&this.fuse>=0&&(this.fuse=-1),this.fuse<0&&(h=r/v,d=o/v)):(l>1.2&&(h=r/v,d=o/v),l<1.7&&Math.abs(a)<2&&this.attackCooldown<=0&&(this.attackCooldown=1.1,s.damage(u.damage,this.type)&&s.knockback(r,o,5)));break}}if(this.fuse>=0&&(this.fuse-=t,this.fuse<=0)){this.dead=!0,e.explode(this.x,this.y+.6,this.z,3,this);return}const _=this.onGround?10:2,m=1-Math.exp(-_*t);if(this.vx+=(h*f-this.vx)*m,this.vz+=(d*f-this.vz)*m,h||d){let y=Math.atan2(-h,-d)-this.yaw;for(;y>Math.PI;)y-=Math.PI*2;for(;y<-Math.PI;)y+=Math.PI*2;this.yaw+=y*Math.min(1,t*8)}const p=this.onGround;this.friction=!1,this.physics(n,t),this.collidedH&&p&&(h||d)&&(this.vy=8.5),this.inWater&&(this.vy=Math.max(this.vy,1.5)),this.y<-5&&(this.dead=!0);const x=Math.hypot(this.vx,this.vz);this.animTime+=t*x*3}damage(t,e,n,s,r="player",o=!1){if(!(this.dying>0)&&!(!o&&this.hurtTime>0)){if(this.health-=t,!o){this.hurtTime=.4;const a=Math.hypot(e,n)||1;this.vx+=e/a*6,this.vz+=n/a*6,this.vy=Math.max(this.vy,4.5),s.audio.play("mob_hurt",{x:this.x,y:this.y,z:this.z,pitch:this.def.hostile?.7:1.3}),this.def.hostile?r==="player"&&(this.state="chase"):this.fleeTimer=4}this.health<=0&&this.die(s)}}die(t){this.dying=1.2,this.vx=this.vz=0;for(const[e,n,s]of this.def.drops){const r=n+Math.floor(Math.random()*(s-n+1));r>0&&t.dropItem(this.x,this.y+.5,this.z,{id:e,count:r},!0)}}syncMesh(t){const e=this.model;this.mesh.position.set(this.x,this.y,this.z),this.mesh.rotation.y=this.yaw;const n=Math.sin(this.animTime)*.7;for(let o=0;o<e.legs.length;o++)e.legs[o].rotation.x=n*(o%2===0?1:-1)*(o>=2?-1:1);for(let o=0;o<e.arms.length;o++)this.type==="zombie"?e.arms[o].rotation.x=-Math.PI/2+Math.sin(this.animTime*.5)*.1:e.arms[o].rotation.x=n*(o===0?-1:1)*.8;let s=t.renderer.lightFactorAt(this.x,this.y+this.h*.5,this.z);this.fuse>=0&&Math.floor(this.fuse*8)%2===0&&(s=2.5);const r=this.hurtTime>.2;if(this.mesh.traverse(o=>{if(!o.isMesh)return;const a=Array.isArray(o.material)?o.material:[o.material];for(const l of a)l.map?l.color.setScalar(s):l.color.copy(o.userData.baseColor).multiplyScalar(s),r&&(l.color.r=Math.min(1,l.color.r+.6),l.color.g*=.5,l.color.b*=.5),this.burning&&(l.color.r=Math.min(1,l.color.r+.3))}),this.fuse>=0){const o=1+(1.5-this.fuse)*.15;this.mesh.scale.set(o,o,o)}}serialize(){return{type:this.type,x:this.x,y:this.y,z:this.z,health:this.health}}}function Ur(i,t,e,n){return Jh[i]?new ev(i,t,e,n):null}class nv{constructor(t){this.game=t,this.root=document.getElementById("hud"),this.hotbar=document.getElementById("hotbar"),this.hearts=document.getElementById("hearts"),this.hunger=document.getElementById("hunger"),this.airEl=document.getElementById("air"),this.itemName=document.getElementById("item-name"),this.debug=document.getElementById("debug"),this.hurtOverlay=document.getElementById("hurt-overlay"),this.waterOverlay=document.getElementById("water-overlay"),this.toast=document.getElementById("toast"),this.crosshair=document.getElementById("crosshair"),this.dirty=!0,this.lastSig="",this.nameTimer=0,this.lastSelected=-1,this.showDebug=!1,this.fps=0,this.frames=0,this.fpsTimer=0,this.toastTimer=0,this.lastHealth=-1,this.lastFood=-1,this.lastAir=-1}inventoryChanged(){this.dirty=!0}showMessage(t,e=2.5){this.toast.textContent=t,this.toast.style.opacity="1",this.toastTimer=e}setVisible(t){this.root.style.display=t?"":"none"}update(t){const e=this.game.player;if(!e)return;this.frames++,this.fpsTimer+=t,this.fpsTimer>=.5&&(this.fps=Math.round(this.frames/this.fpsTimer),this.frames=0,this.fpsTimer=0);const n=e.inventory.slots.slice(0,9).map(r=>r?r.id+":"+r.count+":"+(r.dur||0):"0").join(",")+"|"+e.selected;if(n!==this.lastSig||this.dirty){this.lastSig=n,this.dirty=!1;let r="";for(let o=0;o<9;o++){const a=e.inventory.slots[o];if(r+=`<div class="slot${o===e.selected?" selected":""}">`,a){r+=`<img src="${za(a.id)}" draggable="false">`,a.count>1&&(r+=`<span class="count">${a.count}</span>`);const l=Ne(a.id);if(l&&l.durability&&a.dur){const c=1-a.dur/l.durability;r+=`<div class="dur"><div style="width:${Math.round(c*100)}%;background:${c>.5?"#4c4":c>.25?"#cc4":"#c44"}"></div></div>`}}r+="</div>"}this.hotbar.innerHTML=r}if(e.selected!==this.lastSelected){this.lastSelected=e.selected;const r=e.inventory.slots[e.selected];this.itemName.textContent=r?Qr(r.id):"",this.nameTimer=2}this.nameTimer>0&&(this.nameTimer-=t,this.itemName.style.opacity=String(Math.min(1,this.nameTimer*2)));const s=!e.creative;if(this.hearts.style.display=s?"":"none",this.hunger.style.display=s?"":"none",s){const r=Math.ceil(e.health);if(r!==this.lastHealth){this.lastHealth=r;let c="";for(let u=0;u<10;u++){const h=r-u*2;c+=`<span class="heart ${h>=2?"full":h===1?"half":"empty"}"></span>`}this.hearts.innerHTML=c}this.hearts.classList.toggle("shake",e.hurtTime>.3);const o=Math.ceil(e.food);if(o!==this.lastFood){this.lastFood=o;let c="";for(let u=0;u<10;u++){const h=o-u*2;c+=`<span class="food ${h>=2?"full":h===1?"half":"empty"}"></span>`}this.hunger.innerHTML=c}const a=e.headWater||e.air<300;this.airEl.style.display=a?"":"none";const l=Math.ceil(e.air/30);if(l!==this.lastAir){this.lastAir=l;let c="";for(let u=0;u<10;u++)c+=`<span class="bubble ${u<l?"full":"empty"}"></span>`;this.airEl.innerHTML=c}}else this.airEl.style.display="none";if(this.hurtOverlay.style.opacity=e.hurtTime>0?String(Math.min(.5,e.hurtTime)):"0",this.waterOverlay.style.opacity=e.headWater?"0.35":"0",this.toastTimer>0&&(this.toastTimer-=t,this.toastTimer<=.5&&(this.toast.style.opacity=String(Math.max(0,this.toastTimer*2)))),this.showDebug){const r=this.game,o=r.world.gen.terrain(Math.floor(e.x),Math.floor(e.z)),a=Math.floor(e.x),l=Math.floor(e.y),c=Math.floor(e.z),u=(e.yaw*180/Math.PI%360+360)%360,h=["S","W","N","E"][Math.round(u/90)%4];this.debug.style.display="",this.debug.textContent=[`VoxelCraft  ${this.fps} fps`,`XYZ: ${e.x.toFixed(2)} / ${e.y.toFixed(2)} / ${e.z.toFixed(2)}`,`Block: ${a} ${l} ${c}  Chunk: ${a>>4} ${c>>4}  Facing: ${h}`,`Biome: ${Mu[o.biome]}  Light: sky ${r.world.getSky(a,l,c)} block ${r.world.getBlockLight(a,l,c)}`,`Chunks: ${r.world.chunks.size} loaded, ${r.renderer.chunkMeshes.size} meshed, ${r.world.dirtyChunks.size} dirty`,`Entities: ${r.entities.list.length}  Time: ${(r.timeOfDay*24).toFixed(1)}h  Mode: ${e.creative?"Creative":"Survival"}${e.flying?" (flying)":""}`,`Target: ${r.target?`${r.target.x} ${r.target.y} ${r.target.z} (${Qr(r.target.id)})`:"-"}`].join(`
`)}else this.debug.style.display="none"}}const Qh="voxelcraft_worlds",tu="voxelcraft_settings";function tr(){try{return JSON.parse(localStorage.getItem(Qh)||"[]")}catch{return[]}}function pl(i){localStorage.setItem(Qh,JSON.stringify(i))}function eu(i,t,e){const n=tr(),r={id:"w"+Date.now().toString(36)+Math.floor(Math.random()*1e4).toString(36),name:i,seed:t,mode:e,created:Date.now(),lastPlayed:Date.now()};return n.unshift(r),pl(n),r}function iv(i){const t=tr(),e=t.find(n=>n.id===i);e&&(e.lastPlayed=Date.now(),pl(t))}function sv(i,t){try{return localStorage.setItem("voxelcraft_world_"+i,JSON.stringify(t)),iv(i),!0}catch(e){return console.warn("save failed",e),!1}}function rv(i){try{return JSON.parse(localStorage.getItem("voxelcraft_world_"+i)||"null")}catch{return null}}function ov(i){pl(tr().filter(t=>t.id!==i)),localStorage.removeItem("voxelcraft_world_"+i)}function av(){const i={renderDistance:8,sensitivity:1,volume:.8,fov:70,sprintKey:"KeyR"};try{return{...i,...JSON.parse(localStorage.getItem(tu)||"{}")}}catch{return i}}function lv(i){localStorage.setItem(tu,JSON.stringify(i))}const me={active:!1,lastTouch:!1,alt:!1,shift:!1},eh=2.2,cv=280,hv=380,uv=12;function dv(i){const t=window.TouchKit;if(!t)return null;const e=i.input,n=i.canvas,s=()=>{me.active||(me.active=!0,document.body.classList.add("touch"),!localStorage.getItem("voxelcraft_settings")&&i.settings.renderDistance>6&&(i.settings.renderDistance=6,i.applySettings(i.settings)))};window.matchMedia&&matchMedia("(pointer: coarse)").matches&&(s(),me.lastTouch=!0,e.touchMode=!0),addEventListener("pointerdown",x=>{const v=x.pointerType!=="mouse";me.lastTouch=v,v?(s(),e.locked||(e.touchMode=!0)):e.touchMode&&document.pointerLockElement!==n&&(e.touchMode=!1,e.locked=!1)},!0);let r=0;addEventListener("pointerup",x=>{x.pointerType!=="mouse"&&(i.audio.unlock(),clearTimeout(r),r=setTimeout(()=>{document.getElementById("tooltip").style.display="none"},1500))},!0),document.addEventListener("visibilitychange",()=>{document.hidden&&me.active&&o()&&i.pause()}),document.documentElement.style.overscrollBehavior="none",document.addEventListener("gesturestart",x=>x.preventDefault());const o=()=>i.running&&!i.paused&&i.player&&!i.player.dead&&!i.containers.isOpen&&!i.screens.current,a=t.create({show:"never",preventGestures:!1,landscape:!0,sticks:[{id:"move",side:"left",label:"MOVE",keys:"wasd"}],buttons:[{id:"jump",label:"JUMP",icon:"▲",key:"Space",row:0},{id:"mine",label:"MINE",icon:"⛏",row:0,onDown:()=>e.press(0,!0),onUp:()=>e.press(0,!1)},{id:"use",label:"USE",icon:"◆",row:1,onDown:()=>e.press(2,!0),onUp:()=>e.press(2,!1)},{id:"run",label:"RUN",icon:"»",size:"s",row:1,toggle:!0,onDown:()=>{e.touchSprint=!0},onUp:()=>{e.touchSprint=!1}},{id:"sneak",label:"SNEAK",icon:"▾",size:"s",row:2,toggle:!0,key:"ShiftLeft"},{id:"down",label:"DOWN",icon:"▼",size:"s",row:2,key:"ShiftLeft"},{id:"pick",label:"PICK",icon:"✚",size:"s",row:3,onDown:()=>e.tap(1)},{id:"pause",icon:"Ⅱ",size:"s",place:"top-right",key:"Escape",tap:!0},{id:"bag",label:"BAG",icon:"▦",size:"s",place:"top-right",key:"KeyE",tap:!0},{id:"items",label:"ITEMS",icon:"✦",size:"s",place:"top-right",key:"Tab",tap:!0},{id:"drop",label:"DROP",icon:"↓",size:"s",place:"top-right",key:"KeyQ",tap:!0}]});let l=!1;const c=document.querySelector(".tk-rot"),u=c&&c.querySelector("button");u&&u.addEventListener("click",()=>{l=!0});const h={id:null,x:0,y:0,x0:0,y0:0,t0:0,moved:!1,mining:!1,timer:0},d=()=>{clearTimeout(h.timer),h.mining&&e.press(0,!1),h.id=null,h.mining=!1};n.addEventListener("pointerdown",x=>{if(x.pointerType!=="mouse"&&(x.preventDefault(),!(h.id!==null||!o()))){Object.assign(h,{id:x.pointerId,x:x.clientX,y:x.clientY,x0:x.clientX,y0:x.clientY,t0:performance.now(),moved:!1,mining:!1});try{n.setPointerCapture(x.pointerId)}catch{}clearTimeout(h.timer),h.timer=setTimeout(()=>{h.id!==null&&!h.moved&&o()&&(h.mining=!0,e.press(0,!0))},hv)}}),n.addEventListener("pointermove",x=>{if(x.pointerId!==h.id)return;const v=x.clientX-h.x,y=x.clientY-h.y;h.x=x.clientX,h.y=x.clientY,!h.moved&&Math.hypot(x.clientX-h.x0,x.clientY-h.y0)>uv&&(h.moved=!0,h.mining||clearTimeout(h.timer)),o()&&(e.dx+=v*eh,e.dy+=y*eh)});const f=x=>{x.pointerId===h.id&&(!h.mining&&x.type==="pointerup"&&!h.moved&&performance.now()-h.t0<cv&&o()&&e.tap(2),d())};n.addEventListener("pointerup",f),n.addEventListener("pointercancel",f);const g=document.getElementById("hotbar");g.addEventListener("pointerdown",x=>{if(x.pointerType==="mouse")return;const v=x.target.closest(".slot");v&&(x.preventDefault(),o()&&(i.player.selected=Array.prototype.indexOf.call(g.children,v)))});let _=!1;const m=(x,v)=>{x&&x._on!==v&&(x._on=v,x.el.style.display=v?"":"none")},p=()=>{requestAnimationFrame(p);const x=me.active&&!!o();if(x!==_&&(_=x,a.show(x),x?l&&c&&c.classList.remove("need"):(e.touchSprint=!1,e.press(0,!1),e.press(2,!1),d())),x){const v=i.player;m(a.buttons.down,v.flying),m(a.buttons.pick,v.creative),m(a.buttons.items,v.creative)}};return requestAnimationFrame(p),a}class fv{constructor(t){this.game=t,this.root=document.getElementById("screens"),this.current=null,this.settings=av()}show(t,e={}){this.current=t,this.root.style.display="",this.root.innerHTML="";const n=document.createElement("div");n.className="panel",this.root.appendChild(n),this["_"+t](n,e)}hide(){this.current=null,this.root.style.display="none",this.root.innerHTML=""}_title(t){t.classList.add("title"),t.innerHTML=`
      <h1>VoxelCraft</h1>
      <p class="sub">A voxel sandbox — build, mine, survive.</p>
      <div class="worlds" id="world-list"></div>
      <div class="row">
        <button id="btn-new" class="big">Create New World</button>
        <button id="btn-settings">Settings</button>
        <button id="btn-help">Controls</button>
        <button id="btn-fs">Fullscreen</button>
      </div>`;const e=t.querySelector("#world-list"),n=tr();n.length||(e.innerHTML='<div class="empty">No worlds yet. Create one!</div>');for(const s of n){const r=document.createElement("div");r.className="world",r.innerHTML=`<div class="info"><b>${Ko(s.name)}</b><span>${s.mode===1?"Creative":"Survival"} · seed ${s.seed} · ${new Date(s.lastPlayed).toLocaleString()}</span></div>
        <button class="play">Play</button><button class="del danger">Delete</button>`,r.querySelector(".play").onclick=()=>this.game.startWorld(s),r.querySelector(".del").onclick=()=>{confirm(`Delete world "${s.name}"?`)&&(ov(s.id),this.show("title"))},e.appendChild(r)}t.querySelector("#btn-new").onclick=()=>this.show("create"),t.querySelector("#btn-settings").onclick=()=>this.show("settings",{back:"title"}),t.querySelector("#btn-help").onclick=()=>this.show("help",{back:"title"}),t.querySelector("#btn-fs").onclick=()=>this.game.toggleFullscreen()}_create(t){t.innerHTML=`
      <h2>Create New World</h2>
      <label>World name <input id="w-name" value="New World" maxlength="32"></label>
      <label>Seed (leave blank for random) <input id="w-seed" placeholder="random"></label>
      <label>Game mode
        <select id="w-mode"><option value="0">Survival</option><option value="1">Creative</option></select>
      </label>
      <div class="row"><button id="w-create" class="big">Create World</button><button id="w-back">Back</button></div>`,t.querySelector("#w-back").onclick=()=>this.show("title"),t.querySelector("#w-create").onclick=()=>{const e=t.querySelector("#w-name").value.trim()||"New World",n=t.querySelector("#w-seed").value.trim();let s;n?/^-?\d+$/.test(n)?s=parseInt(n,10)|0:s=_u(n)|0:s=Math.floor(Math.random()*2147483647);const r=parseInt(t.querySelector("#w-mode").value,10),o=eu(e,s,r);this.game.startWorld(o)}}_settings(t,e){const n=this.settings;t.innerHTML=`
      <h2>Settings</h2>
      <label>Render distance: <span id="rd-val">${n.renderDistance}</span> chunks<input type="range" id="rd" min="4" max="14" value="${n.renderDistance}"></label>
      <label>Mouse sensitivity: <span id="sens-val">${n.sensitivity.toFixed(2)}</span><input type="range" id="sens" min="0.2" max="3" step="0.05" value="${n.sensitivity}"></label>
      <label>Volume: <span id="vol-val">${Math.round(n.volume*100)}%</span><input type="range" id="vol" min="0" max="1" step="0.05" value="${n.volume}"></label>
      <label>Field of view: <span id="fov-val">${n.fov}</span><input type="range" id="fov" min="50" max="110" step="1" value="${n.fov}"></label>
      <label>Sprint key (hold; double-tap W always works)
        <select id="sprint-key">
          <option value="KeyR"${(n.sprintKey||"KeyR")==="KeyR"?" selected":""}>R</option>
          <option value="AltLeft"${n.sprintKey==="AltLeft"?" selected":""}>Left Alt</option>
          <option value="ControlLeft"${n.sprintKey==="ControlLeft"?" selected":""}>Left Ctrl (fullscreen only — Ctrl+W closes the tab otherwise)</option>
        </select>
      </label>
      <div class="row"><button id="s-back" class="big">Done</button></div>`;const s=(o,a,l)=>{const c=t.querySelector("#"+o);c.oninput=()=>{n[a]=parseFloat(c.value),t.querySelector("#"+o+"-val").textContent=l(n[a]),this.game.applySettings(n)}};s("rd","renderDistance",o=>o),s("sens","sensitivity",o=>o.toFixed(2)),s("vol","volume",o=>Math.round(o*100)+"%"),s("fov","fov",o=>o);const r=t.querySelector("#sprint-key");r.onchange=()=>{n.sprintKey=r.value,this.game.applySettings(n)},t.querySelector("#s-back").onclick=()=>{lv(n),this.show(e.back||"title")}}_help(t,e){const n=me.active?`
      <table class="keys">
        <tr><td>Left stick</td><td>Move</td></tr>
        <tr><td>Drag the screen</td><td>Look around</td></tr>
        <tr><td>Tap the screen / USE</td><td>Place block / use / eat / open (hold USE to draw the bow)</td></tr>
        <tr><td>Hold the screen / MINE</td><td>Mine block / attack (keep dragging to aim)</td></tr>
        <tr><td>JUMP</td><td>Jump / swim up (double-tap: fly in Creative, DOWN to descend)</td></tr>
        <tr><td>RUN · SNEAK</td><td>Toggle sprint · toggle sneak</td></tr>
        <tr><td>Hotbar</td><td>Tap a slot to select it</td></tr>
        <tr><td>BAG · ITEMS · DROP · Ⅱ</td><td>Inventory · item palette (Creative) · drop item · pause</td></tr>
        <tr><td>In inventories</td><td>Tap = pick up / put down · Split = right-click · Quick move = Shift+click</td></tr>
      </table><p class="tip">Keyboard &amp; mouse:</p>`:"";t.innerHTML=`
      <h2>Controls</h2>${n}
      <table class="keys">
        <tr><td>W A S D</td><td>Move</td></tr>
        <tr><td>Mouse</td><td>Look around</td></tr>
        <tr><td>Space</td><td>Jump / swim up (double-tap: fly in Creative)</td></tr>
        <tr><td>Shift</td><td>Sneak / fly down</td></tr>
        <tr><td>R (hold) or double-tap W</td><td>Sprint — <b>not Ctrl</b>: Ctrl+W closes the browser tab. In fullscreen (F4) Ctrl works too.</td></tr>
        <tr><td>F4</td><td>Fullscreen (locks the keyboard so browser shortcuts don't fire)</td></tr>
        <tr><td>Left click</td><td>Mine block / attack</td></tr>
        <tr><td>Right click</td><td>Place block / use / eat / open</td></tr>
        <tr><td>Hold right click (bow)</td><td>Draw the bow, release to shoot — a full 1 s draw flies farthest</td></tr>
        <tr><td>Middle click</td><td>Pick block (Creative)</td></tr>
        <tr><td>1-9 / Scroll</td><td>Select hotbar slot</td></tr>
        <tr><td>E</td><td>Inventory &amp; crafting</td></tr>
        <tr><td>Q</td><td>Drop item</td></tr>
        <tr><td>F3</td><td>Debug info</td></tr>
        <tr><td>Esc</td><td>Pause menu</td></tr>
      </table>
      <p class="tip">Tip: punch trees for logs → planks → crafting table (2×2 planks) → tools. Light up the night with torches (coal + stick). Beware creepers!</p>
      <div class="row"><button id="h-back" class="big">Back</button></div>`,t.querySelector("#h-back").onclick=()=>e.back==="pause"?this.show("pause"):this.show("title")}_pause(t){t.innerHTML=`
      <h2>Game Paused</h2>
      <div class="col">
        <button id="p-resume" class="big">Back to Game</button>
        <button id="p-settings">Settings</button>
        <button id="p-help">Controls</button>
        <button id="p-fs">Fullscreen (F4)</button>
        ${me.active?'<button id="p-debug">Debug info (F3)</button>':""}
        <button id="p-save">Save World</button>
        <button id="p-quit" class="danger">Save &amp; Quit to Title</button>
      </div>`,t.querySelector("#p-resume").onclick=()=>this.game.resume();const e=t.querySelector("#p-debug");e&&(e.onclick=()=>{this.game.hud.showDebug=!this.game.hud.showDebug,this.game.resume()}),t.querySelector("#p-settings").onclick=()=>this.show("settings",{back:"pause"}),t.querySelector("#p-help").onclick=()=>this.show("help",{back:"pause"}),t.querySelector("#p-fs").onclick=()=>{this.game.toggleFullscreen(),this.game.resume()},t.querySelector("#p-save").onclick=()=>{this.game.save(),this.game.hud.showMessage("World saved"),this.game.resume()},t.querySelector("#p-quit").onclick=()=>this.game.quitToTitle()}_death(t,e){t.classList.add("death"),t.innerHTML=`
      <h2>You died!</h2>
      <p class="sub">${Ko(e.message||"")}</p>
      <div class="col"><button id="d-respawn" class="big">Respawn</button><button id="d-quit">Title Screen</button></div>`,t.querySelector("#d-respawn").onclick=()=>this.game.respawn(),t.querySelector("#d-quit").onclick=()=>this.game.quitToTitle()}_loading(t,e){t.innerHTML=`<h2>${Ko(e.text||"Loading world...")}</h2><div class="bar"><div id="load-bar" style="width:0%"></div></div>`}setLoadProgress(t){const e=document.getElementById("load-bar");e&&(e.style.width=Math.round(t*100)+"%")}}function Ko(i){return String(i).replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[t])}const er=[b.OAK_PLANKS,b.BIRCH_PLANKS,b.SPRUCE_PLANKS];b.OAK_LOG,b.BIRCH_LOG,b.SPRUCE_LOG;b.WOOL,b.RED_WOOL,b.BLUE_WOOL,b.GREEN_WOOL,b.YELLOW_WOOL,b.BLACK_WOOL;const ml=[];function xe(i,t,e,n=1){ml.push({pattern:i,key:t,result:{id:e,count:n}})}function je(i,t,e=1){ml.push({ingredients:i,result:{id:t,count:e}})}je([b.OAK_LOG],b.OAK_PLANKS,4);je([b.BIRCH_LOG],b.BIRCH_PLANKS,4);je([b.SPRUCE_LOG],b.SPRUCE_PLANKS,4);xe(["P","P"],{P:er},Y.STICK,4);xe(["PP","PP"],{P:er},b.CRAFTING_TABLE);xe(["CCC","C C","CCC"],{C:b.COBBLESTONE},b.FURNACE);xe(["PPP","P P","PPP"],{P:er},b.CHEST);xe(["C","S"],{C:[Y.COAL],S:Y.STICK},b.TORCH,4);xe(["SS","SS"],{S:b.SAND},b.SANDSTONE);xe(["SS","SS"],{S:b.STONE},b.STONE_BRICKS,4);xe(["C","C"],{C:b.COBBLESTONE},b.MOSSY_COBBLESTONE,2);xe(["PSP","PSP","PSP"],{P:er,S:Y.STICK},b.BOOKSHELF);xe(["III","III","III"],{I:Y.IRON_INGOT},b.IRON_BLOCK);xe(["III","III","III"],{I:Y.GOLD_INGOT},b.GOLD_BLOCK);xe(["III","III","III"],{I:Y.DIAMOND},b.DIAMOND_BLOCK);xe(["III","III","III"],{I:Y.LAPIS},b.LAPIS_BLOCK);xe(["III","III","III"],{I:Y.COAL},b.COAL_BLOCK);je([b.IRON_BLOCK],Y.IRON_INGOT,9);je([b.GOLD_BLOCK],Y.GOLD_INGOT,9);je([b.DIAMOND_BLOCK],Y.DIAMOND,9);je([b.LAPIS_BLOCK],Y.LAPIS,9);je([b.COAL_BLOCK],Y.COAL,9);xe(["GSG","SGS","GSG"],{G:Y.GUNPOWDER,S:b.SAND},b.TNT);je([b.WOOL,b.POPPY],b.RED_WOOL);je([b.WOOL,Y.LAPIS],b.BLUE_WOOL);je([b.WOOL,b.CACTUS],b.GREEN_WOOL);je([b.WOOL,b.DANDELION],b.YELLOW_WOOL);je([b.WOOL,Y.COAL],b.BLACK_WOOL);xe(["WWW","WWW","WWW"],{W:Y.WHEAT},Y.BREAD,3);je([Y.APPLE,Y.GOLD_INGOT,Y.GOLD_INGOT,Y.GOLD_INGOT,Y.GOLD_INGOT],Y.GOLDEN_APPLE);xe([" SW","S W"," SW"],{S:Y.STICK,W:Y.FEATHER},Y.BOW);xe(["F","S","W"],{F:Y.FLINT,S:Y.STICK,W:Y.FEATHER},Y.ARROW,4);xe(["I I"," I "],{I:Y.IRON_INGOT},Y.BUCKET);const pv=[[er,0],[b.COBBLESTONE,1],[Y.IRON_INGOT,2],[Y.DIAMOND,3]];for(const[i,t]of pv){const e=Y.WOODEN_PICKAXE+t*4;xe(["MMM"," S "," S "],{M:i,S:Y.STICK},e+0),xe(["MM","MS"," S"],{M:i,S:Y.STICK},e+1),xe(["M","S","S"],{M:i,S:Y.STICK},e+2),xe(["M","M","S"],{M:i,S:Y.STICK},e+3)}function nh(i,t){return Array.isArray(i)?i.includes(t):i===t}function Yo(i,t,e){let n=t,s=e,r=-1,o=-1,a=0;const l=[];for(let h=0;h<e;h++)for(let d=0;d<t;d++){const f=i[h*t+d];f&&(a++,l.push(f.id),d<n&&(n=d),d>r&&(r=d),h<s&&(s=h),h>o&&(o=h))}if(a===0)return null;const c=r-n+1,u=o-s+1;for(const h of ml){if(h.ingredients){if(h.ingredients.length!==a)continue;const g=l.slice();let _=!0;for(const m of h.ingredients){const p=g.findIndex(x=>nh(m,x));if(p<0){_=!1;break}g.splice(p,1)}if(_)return{result:h.result,recipe:h};continue}const d=h.pattern.length,f=Math.max(...h.pattern.map(g=>g.length));if(!(f!==c||d!==u))for(const g of[!1,!0]){let _=!0;for(let m=0;m<d&&_;m++)for(let p=0;p<f;p++){const x=g?f-1-p:p,v=h.pattern[m][x]||" ",y=i[(s+m)*t+(n+p)];if(v===" "){if(y){_=!1;break}continue}if(!y||!nh(h.key[v],y.id)){_=!1;break}}if(_)return{result:h.result,recipe:h}}}return null}function ih(i){for(let t=0;t<i.length;t++){const e=i[t];e&&(e.count-=1,e.count<=0&&(i[t]=null))}}class mv{constructor(t){this.game=t,this.root=document.getElementById("container"),this.cursorEl=document.getElementById("cursor-stack"),this.tooltip=document.getElementById("tooltip"),this.kind=null,this.cursor=null,this.craftGrid=[],this.craftW=2,this.blockEntity=null,this.bePos=null,this.refreshTimer=0,this.creativeFilter="",this.mouseX=0,this.mouseY=0,window.addEventListener("mousemove",e=>{this.mouseX=e.clientX,this.mouseY=e.clientY,this.kind&&this._moveCursor()}),this.root.addEventListener("mousedown",e=>{const n=e.target.closest("[data-slot]");if(!n){e.target===this.root&&this.cursor&&this._dropCursor();return}e.preventDefault();const s=me.lastTouch;this._clickSlot(n.dataset.slot,s&&me.alt&&e.button===0?2:e.button,e.shiftKey||s&&me.shift)}),this.root.addEventListener("click",e=>{const n=e.target.closest("[data-touch]");if(!n)return;const s=n.dataset.touch;if(s==="close"){this.close(),this.game.input.enabled=!0,this.game.input.lock();return}s==="alt"&&(me.alt=!me.alt,me.alt&&(me.shift=!1)),s==="shift"&&(me.shift=!me.shift,me.shift&&(me.alt=!1)),this.render()}),window.addEventListener("resize",()=>{this.kind&&this._fit()}),this.root.addEventListener("contextmenu",e=>e.preventDefault()),this.root.addEventListener("mouseover",e=>{const n=e.target.closest("[data-slot]");n?this._showTooltip(n.dataset.slot):this.tooltip.style.display="none"}),this.root.addEventListener("mouseleave",()=>{this.tooltip.style.display="none"})}get isOpen(){return this.kind!==null}open(t,e=null,n=null){this.kind=t,this.blockEntity=e,this.bePos=n,this.craftW=t==="crafting"?3:2,this.craftGrid=new Array(this.craftW*this.craftW).fill(null),this.root.style.display="",this.render()}close(){if(!this.kind)return;const t=this.game.player;for(let e=0;e<this.craftGrid.length;e++){const n=this.craftGrid[e];if(n){const s=t.inventory.addStack(n);s&&this.game.dropItem(t.x,t.y+1,t.z,s,!0),this.craftGrid[e]=null}}if(this.cursor){const e=t.inventory.addStack(this.cursor);e&&this.game.dropItem(t.x,t.y+1,t.z,e,!0),this.cursor=null}this.kind=null,this.blockEntity=null,this.root.style.display="none",this.tooltip.style.display="none",this.cursorEl.style.display="none",this.game.hud.inventoryChanged()}_get(t){const[e,n]=t.split(":"),s=this.game.player;switch(e){case"inv":return s.inventory.slots[+n];case"craft":return this.craftGrid[+n];case"be":return this.blockEntity.slots[+n];case"result":{const r=Yo(this.craftGrid,this.craftW,this.craftW);return r?{...r.result}:null}case"creative":{const r=+n;return{id:r,count:Ge(r)}}default:return null}}_set(t,e){const[n,s]=t.split(":"),r=this.game.player;switch(n){case"inv":r.inventory.slots[+s]=e;break;case"craft":this.craftGrid[+s]=e;break;case"be":this.blockEntity.slots[+s]=e;break}}_clickSlot(t,e,n){const s=t.split(":")[0],r=this.game.player,o=this.game;if(o.audio.play("click"),s==="trash"){this.cursor=null,this.render();return}if(s==="creative"){const c=+t.split(":")[1];this.cursor&&this.cursor.id===c&&e===0?this.cursor.count=Math.min(Ge(c),this.cursor.count+1):this.cursor?this.cursor=null:n?r.inventory.add(c,Ge(c)):this.cursor={id:c,count:e===2?1:Ge(c)},this.render();return}if(s==="result"){const c=Yo(this.craftGrid,this.craftW,this.craftW);if(!c)return;if(n){let u=0;for(;u++<64;){const h=Yo(this.craftGrid,this.craftW,this.craftW);if(!h)break;const d=r.inventory.add(h.result.id,h.result.count);if(d){r.inventory.remove(h.result.id,h.result.count-d);break}ih(this.craftGrid)}}else{if(this.cursor&&(this.cursor.id!==c.result.id||this.cursor.count+c.result.count>Ge(c.result.id)))return;this.cursor?this.cursor.count+=c.result.count:this.cursor={...c.result},ih(this.craftGrid)}o.audio.play("craft"),this.render();return}const a=s==="be"&&this.blockEntity.type==="furnace"&&t==="be:2",l=this._get(t);if(n){if(!l)return;this._quickMove(t,l),this.render();return}if(a){if(!l)return;this.cursor?this.cursor.id===l.id&&this.cursor.count+l.count<=Ge(l.id)&&(this.cursor.count+=l.count,this._set(t,null)):(this.cursor=l,this._set(t,null)),this.render();return}if(e===0)if(!this.cursor)l&&(this.cursor=l,this._set(t,null));else if(!l)this._set(t,this.cursor),this.cursor=null;else if(l.id===this.cursor.id&&!l.dur&&!this.cursor.dur){const c=Ge(l.id),u=Math.min(c-l.count,this.cursor.count);l.count+=u,this.cursor.count-=u,this.cursor.count<=0&&(this.cursor=null)}else this._set(t,this.cursor),this.cursor=l;else if(e===2){if(this.cursor)l?l.id===this.cursor.id&&l.count<Ge(l.id)&&!l.dur&&(l.count+=1,this.cursor.count-=1,this.cursor.count<=0&&(this.cursor=null)):(this._set(t,{...this.cursor,count:1}),this.cursor.count-=1,this.cursor.count<=0&&(this.cursor=null));else if(l){const c=Math.ceil(l.count/2);this.cursor={...l,count:c},l.count-=c,l.count<=0&&this._set(t,null)}}this.render()}_quickMove(t,e){const n=this.game.player,[s,r]=t.split(":"),o=+r,a=n.inventory.slots,l=c=>{for(const[u,h]of c)for(let d=u;d<h&&e.count>0;d++){const f=a[d];if(f&&f.id===e.id&&!f.dur&&!e.dur&&f.count<Ge(f.id)){const g=Math.min(Ge(f.id)-f.count,e.count);f.count+=g,e.count-=g}}for(const[u,h]of c)for(let d=u;d<h&&e.count>0;d++)a[d]||(a[d]={...e},e.count=0)};if(s==="inv"){if(this.kind==="chest"){const c=this.blockEntity.slots;for(let u=0;u<c.length&&e.count>0;u++){const h=c[u];if(h&&h.id===e.id&&!h.dur&&h.count<Ge(h.id)){const d=Math.min(Ge(h.id)-h.count,e.count);h.count+=d,e.count-=d}}for(let u=0;u<c.length&&e.count>0;u++)c[u]||(c[u]={...e},e.count=0)}else if(this.kind==="furnace"){const c=qh(e.id)?0:Ba(e.id)?1:-1;if(c>=0){const u=this.blockEntity.slots[c];if(!u)this.blockEntity.slots[c]={...e},e.count=0;else if(u.id===e.id&&u.count<Ge(u.id)){const h=Math.min(Ge(u.id)-u.count,e.count);u.count+=h,e.count-=h}}}e.count>0&&l(o<9?[[9,36]]:[[0,9]])}else l([[0,9],[9,36]]);e.count<=0?this._set(t,null):this._set(t,e)}_dropCursor(){const t=this.game.player,e=t.getLookDir();this.game.dropItem(t.x+e.x,t.y+1.3,t.z+e.z,this.cursor,!1,e),this.cursor=null,this.render()}_slotHtml(t,e,n=""){let s="";if(e){s=`<img src="${za(e.id)}" draggable="false">`,e.count>1&&(s+=`<span class="count">${e.count}</span>`);const r=Ne(e.id);if(r&&r.durability&&e.dur){const o=1-e.dur/r.durability;s+=`<div class="dur"><div style="width:${Math.round(o*100)}%;background:${o>.5?"#4c4":o>.25?"#cc4":"#c44"}"></div></div>`}}return`<div class="slot ${n}" data-slot="${t}">${s}</div>`}_invHtml(){const t=this.game.player.inventory.slots;let e='<div class="cp-inv"><div class="grid inv-main">';for(let n=9;n<36;n++)e+=this._slotHtml("inv:"+n,t[n]);e+='</div><div class="grid inv-hotbar">';for(let n=0;n<9;n++)e+=this._slotHtml("inv:"+n,t[n]);return e+="</div></div>",e}_touchBar(){if(!me.active)return"";const t=e=>e?" on":"";return`<div class="cp-bar"><button type="button" data-touch="alt" class="${t(me.alt)}">Split (right-click)</button><button type="button" data-touch="shift" class="${t(me.shift)}">Quick move (Shift)</button><button type="button" data-touch="close" class="x">✕ Close</button></div>`}_fit(){const t=this.root.querySelector(".cpanel");if(!t||(t.style.zoom="",!t.offsetWidth))return;const e=Math.min(1,(window.innerWidth-12)/t.offsetWidth,(window.innerHeight-12)/t.offsetHeight);e<.999&&(t.style.zoom=e.toFixed(3))}render(){const t=this.kind;if(!t)return;let e='<div class="cpanel">'+this._touchBar()+'<div class="cp-body"><div class="cp-top">';if(t==="inventory"||t==="crafting"){const n=this.craftW;e+=`<h3>${t==="crafting"?"Crafting":"Inventory"}</h3><div class="craft"><div class="grid craft-grid w${n}">`;for(let s=0;s<n*n;s++)e+=this._slotHtml("craft:"+s,this.craftGrid[s]);e+='</div><div class="arrow">➜</div>',e+=this._slotHtml("result",this._get("result"),"result"),e+="</div>",this.game.player.creative&&t==="inventory"&&(e+=`<div class="hint">Creative: ${me.active?"the ITEMS button opens":"press Tab for"} the item palette</div>`)}else if(t==="creative"){e+=`<h3>Items</h3><input id="creative-search" placeholder="Search..." value="${gv(this.creativeFilter)}"><div class="grid creative-grid">`;const n=this.creativeFilter.toLowerCase();for(const s of x_())n&&!Qr(s).toLowerCase().includes(n)||(e+=this._slotHtml("creative:"+s,{id:s,count:1}));e+='</div><div class="row-slots">'+this._slotHtml("trash",null,"trash")+'<span class="hint">← trash</span></div>'}else if(t==="furnace"){const n=this.blockEntity,s=n.burnMax>0?Math.max(0,n.burn/n.burnMax):0,r=Math.min(1,n.cook/10);e+=`<h3>Furnace</h3><div class="furnace">
        <div class="col-slots">${this._slotHtml("be:0",n.slots[0])}<div class="flame"><div style="height:${Math.round(s*100)}%"></div></div>${this._slotHtml("be:1",n.slots[1])}</div>
        <div class="progress"><div style="width:${Math.round(r*100)}%"></div></div>
        ${this._slotHtml("be:2",n.slots[2],"result")}</div>`}else if(t==="chest"){e+='<h3>Chest</h3><div class="grid chest-grid">';for(let n=0;n<27;n++)e+=this._slotHtml("be:"+n,this.blockEntity.slots[n]);e+="</div>"}if(e+="</div>"+this._invHtml()+"</div></div>",this.root.innerHTML=e,this._fit(),t==="creative"){const n=this.root.querySelector("#creative-search");n.oninput=()=>{this.creativeFilter=n.value;const s=n.selectionStart;this.render();const r=this.root.querySelector("#creative-search");r.focus(),r.setSelectionRange(s,s)}}this._moveCursor(),this.game.hud.inventoryChanged()}_moveCursor(){if(!this.cursor){this.cursorEl.style.display="none";return}this.cursorEl.style.display="",this.cursorEl.style.left=this.mouseX+"px",this.cursorEl.style.top=this.mouseY+"px";const t=this.cursor.id+":"+this.cursor.count;this.cursorEl.dataset.sig!==t&&(this.cursorEl.dataset.sig=t,this.cursorEl.innerHTML=`<img src="${za(this.cursor.id)}" draggable="false">${this.cursor.count>1?`<span class="count">${this.cursor.count}</span>`:""}`)}_showTooltip(t){const e=this._get(t);if(!e||this.cursor){this.tooltip.style.display="none";return}const n=Ne(e.id);let s=Qr(e.id);n&&n.durability&&(s+=` (${n.durability-(e.dur||0)}/${n.durability})`),n&&n.food&&(s+=` · +${n.food} food`),this.tooltip.textContent=s,this.tooltip.style.display="",this.tooltip.style.left=this.mouseX+14+"px",this.tooltip.style.top=this.mouseY+14+"px"}update(t){this.kind&&this.kind==="furnace"&&(this.refreshTimer+=t,this.refreshTimer>.25&&(this.refreshTimer=0,this.render()))}}function gv(i){return String(i).replace(/"/g,"&quot;")}class _v{constructor(){this.ctx=null,this.master=null,this.volume=1,this.listener={x:0,y:0,z:0},this.noiseBuf=null,this.lastPlay=new Map}unlock(){if(this.ctx){this.ctx.state==="suspended"&&this.ctx.resume();return}try{const t=window.AudioContext||window.webkitAudioContext;if(!t)return;this.ctx=new t,this.master=this.ctx.createGain(),this.master.gain.value=this.volume*.6,this.master.connect(this.ctx.destination);const e=this.ctx.sampleRate*1.5;this.noiseBuf=this.ctx.createBuffer(1,e,this.ctx.sampleRate);const n=this.noiseBuf.getChannelData(0);for(let s=0;s<e;s++)n[s]=Math.random()*2-1}catch{this.ctx=null}}setVolume(t){this.volume=t,this.master&&(this.master.gain.value=t*.6)}_gainFor(t){let e=t.volume??1;if(t.x!==void 0){const n=Math.hypot(t.x-this.listener.x,t.y-this.listener.y,t.z-this.listener.z);e*=Math.max(0,1-n/(t.range||24))}return e}_noise(t,e,n,s,r=1,o=null){const a=this.ctx,l=a.createBufferSource();l.buffer=this.noiseBuf,l.playbackRate.value=1;const c=a.createBiquadFilter();c.type=n,c.frequency.value=s,c.Q.value=r,o&&c.frequency.exponentialRampToValueAtTime(o,a.currentTime+t);const u=a.createGain();u.gain.setValueAtTime(e,a.currentTime),u.gain.exponentialRampToValueAtTime(.001,a.currentTime+t),l.connect(c).connect(u).connect(this.master),l.start(a.currentTime,Math.random()*.8,t+.05),l.stop(a.currentTime+t+.05)}_tone(t,e,n,s="square",r=null,o=0){const a=this.ctx,l=a.createOscillator();l.type=s;const c=a.currentTime+o;l.frequency.setValueAtTime(t,c),r&&l.frequency.exponentialRampToValueAtTime(r,c+e);const u=a.createGain();u.gain.setValueAtTime(1e-4,c),u.gain.exponentialRampToValueAtTime(n,c+.01),u.gain.exponentialRampToValueAtTime(.001,c+e),l.connect(u).connect(this.master),l.start(c),l.stop(c+e+.02)}play(t,e={}){if(!this.ctx)return;this.ctx.state==="suspended"&&this.ctx.resume();const n=performance.now(),s=this.lastPlay.get(t)||0;if(n-s<(e.minGap??40))return;this.lastPlay.set(t,n);const r=this._gainFor(e);if(r<=.01)return;const o=e.pitch||1;switch(t){case"dig_stone":this._noise(.12,.5*r,"lowpass",900*o,1,300);break;case"dig_wood":this._noise(.1,.45*r,"bandpass",500*o,2);break;case"dig_grass":this._noise(.14,.35*r,"highpass",1500*o,.7);break;case"dig_gravel":this._noise(.14,.4*r,"bandpass",1100*o,1.5);break;case"dig_sand":this._noise(.15,.3*r,"highpass",2500*o,.5);break;case"dig_glass":this._noise(.25,.4*r,"highpass",5e3*o,3),this._tone(2400*o,.15,.08*r,"sine",900);break;case"dig_snow":case"dig_cloth":this._noise(.12,.25*r,"lowpass",1200*o,.5);break;case"dig_metal":this._tone(1800*o,.12,.12*r,"triangle",600),this._noise(.08,.3*r,"bandpass",2e3,4);break;case"place":this._noise(.08,.5*r,"lowpass",700*o,1,200);break;case"step":this._noise(.07,.18*r,"lowpass",800*o,.8,300);break;case"hurt":this._tone(300,.18,.25*r,"sawtooth",120);break;case"mob_hurt":this._tone(240*o,.15,.2*r,"square",100*o);break;case"pop":this._tone(600,.09,.15*r,"sine",1400);break;case"craft":this._tone(500,.08,.12*r,"square",800),this._tone(800,.1,.1*r,"square",1200,.07);break;case"eat":this._noise(.1,.25*r,"bandpass",700,2),this._noise(.1,.2*r,"bandpass",500,2);break;case"explode":this._noise(.9,1.2*r,"lowpass",400,.6,60),this._tone(80,.6,.5*r,"sine",30);break;case"fuse":this._noise(.3,.25*r,"highpass",3e3,1);break;case"fall":this._noise(.2,.5*r,"lowpass",500,1,150),this._tone(120,.2,.2*r,"sine",60);break;case"land":this._noise(.08,.2*r,"lowpass",600,1,200);break;case"splash":this._noise(.35,.35*r,"bandpass",1500,.8,400);break;case"bow":this._noise(.15,.3*r,"bandpass",2500,2,600),this._tone(400,.1,.1*r,"triangle",150);break;case"arrow_hit":this._noise(.06,.4*r,"lowpass",2e3,1);break;case"zombie":this._tone(110*o,.6,.18*r,"sawtooth",80*o),this._tone(165*o,.5,.08*r,"sawtooth",120*o);break;case"skeleton":this._noise(.12,.2*r,"bandpass",1800,6),this._noise(.12,.2*r,"bandpass",2400,6);break;case"creeper":this._noise(1.4,.35*r,"highpass",2500,.5);break;case"pig":this._tone(330*o,.12,.15*r,"square",220*o),this._tone(300*o,.14,.15*r,"square",260*o,.13);break;case"cow":this._tone(140*o,.6,.18*r,"sawtooth",110*o);break;case"sheep":this._tone(420*o,.35,.12*r,"sawtooth",380*o);break;case"chicken":this._tone(900*o,.08,.1*r,"square",1200*o),this._tone(1100*o,.1,.08*r,"square",800*o,.1);break;case"click":this._tone(1200,.03,.08*r,"square");break;case"level":this._tone(660,.1,.12*r,"sine"),this._tone(990,.15,.12*r,"sine",null,.1);break}}playStep(t,e={}){const n=de(t),s=n.sound==="wood"?.6:n.sound==="grass"?1.3:n.sound==="sand"||n.sound==="snow"?1.6:1;this.play("step",{...e,pitch:s,volume:.6,minGap:150})}playDig(t,e={}){const n=de(t),s={stone:"dig_stone",wood:"dig_wood",grass:"dig_grass",gravel:"dig_gravel",sand:"dig_sand",glass:"dig_glass",snow:"dig_snow",cloth:"dig_cloth",metal:"dig_metal"};this.play(s[n.sound]||"dig_stone",e)}}const Ms=xt+2,ui=Xt+2,nu=Ms*Ms*ui;function iu(i,t,e){return((i+1)*Ms+(e+1))*ui+(t+1)}const Vr=new Uint8Array(256);for(let i=0;i<256;i++){const t=Vs[i];t&&(Vr[i]=t.render==="cube"&&t.solid&&(t.opaque||t.opacity>0)&&i!==b.ICE?1:0)}const su=new Uint8Array(256);for(let i=0;i<256;i++)Vs[i]&&Vs[i].cullSame&&(su[i]=1);const nr=new Uint16Array(256*6);for(let i=0;i<256;i++){const t=Vs[i];if(t)for(let e=0;e<6;e++)nr[i*6+e]=c_(mn(t,e))}const gl=[{n:[1,0,0],v:[[1,0,1],[1,0,0],[1,1,0],[1,1,1]],shade:.6},{n:[-1,0,0],v:[[0,0,0],[0,0,1],[0,1,1],[0,1,0]],shade:.6},{n:[0,1,0],v:[[0,1,1],[1,1,1],[1,1,0],[0,1,0]],shade:1},{n:[0,-1,0],v:[[1,0,1],[0,0,1],[0,0,0],[1,0,0]],shade:.5},{n:[0,0,1],v:[[0,0,1],[1,0,1],[1,1,1],[0,1,1]],shade:.8},{n:[0,0,-1],v:[[1,0,0],[0,0,0],[0,1,0],[1,1,0]],shade:.8}],gi=[[0,0],[1,0],[1,1],[0,1]],vv=[.5,.7,.85,1];class ru{constructor(){this.pos=new Float32Array(4096*3),this.uv=new Float32Array(4096*2),this.light=new Float32Array(4096*4),this.idx=new Uint32Array(6144),this.vcount=0,this.icount=0}ensure(t){if((this.vcount+t)*3>this.pos.length){const e=(n,s)=>{const r=new n.constructor(Math.max(n.length*2,(this.vcount+t)*s));return r.set(n),r};this.pos=e(this.pos,3),this.uv=e(this.uv,2),this.light=e(this.light,4)}if(this.icount+6*(t/4)>this.idx.length){const e=new Uint32Array(this.idx.length*2);e.set(this.idx),this.idx=e}}reset(){this.vcount=0,this.icount=0}quad(t,e,n,s,r){this.ensure(4);const o=this.vcount;for(let l=0;l<4;l++){const c=o+l;this.pos[c*3]=t[l][0],this.pos[c*3+1]=t[l][1],this.pos[c*3+2]=t[l][2],this.uv[c*2]=e[l][0],this.uv[c*2+1]=e[l][1],this.light[c*4]=n,this.light[c*4+1]=s[l][0],this.light[c*4+2]=s[l][1],this.light[c*4+3]=s[l][2]}const a=this.icount;r?(this.idx[a]=o+1,this.idx[a+1]=o+2,this.idx[a+2]=o+3,this.idx[a+3]=o+1,this.idx[a+4]=o+3,this.idx[a+5]=o):(this.idx[a]=o,this.idx[a+1]=o+1,this.idx[a+2]=o+2,this.idx[a+3]=o,this.idx[a+4]=o+2,this.idx[a+5]=o+3),this.vcount+=4,this.icount+=6}export(){return this.vcount===0?null:{pos:this.pos.slice(0,this.vcount*3),uv:this.uv.slice(0,this.vcount*2),light:this.light.slice(0,this.vcount*4),idx:this.idx.slice(0,this.icount)}}}const _n=new Uint8Array(nu),$n=new Uint8Array(nu),Ss=new ru,Ha=new ru,Fe=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]],Xe=[[0,0,0],[0,0,0],[0,0,0],[0,0,0]],Oe=[[0,0],[0,0],[0,0],[0,0]];function xv(i,t){const e=t.cx*xt,n=t.cz*xt;for(let s=-1;s<=xt;s++)for(let r=-1;r<=xt;r++){const o=i.chunkAt(e+s,n+r),a=iu(s,0,r);if(!o)_n.fill(0,a,a+Xt),$n.fill(240,a,a+Xt);else{const l=((s&15)<<4|r&15)<<7;_n.set(o.blocks.subarray(l,l+Xt),a),$n.set(o.light.subarray(l,l+Xt),a)}_n[a-1]=b.BEDROCK,$n[a-1]=0,_n[a+Xt]=0,$n[a+Xt]=240}}function sh(i,t){xv(i,t),Ss.reset(),Ha.reset();const e=_n;for(let n=0;n<xt;n++)for(let s=0;s<xt;s++){const r=iu(n,0,s);for(let o=0;o<Xt;o++){const a=e[r+o];if(a===0)continue;const l=wn[a];l===on.CUBE?Sv(n,o,s,a,r+o):l===on.LIQUID?Ev(n,o,s,a,r+o):l===on.CROSS?bv(n,o,s,a,r+o):l===on.TORCH&&wv(n,o,s,a,r+o)}}return{opaque:Ss.export(),water:Ha.export()}}const to=[ui*Ms,-ui*Ms,1,-1,ui,-ui];function yv(i,t){return!(ai[t]||t===i&&su[i])}function Mv(i,t,e,n){const s=_n,r=$n,o=s[i+t],a=s[i+e],l=s[i+t+e],c=Vr[o],u=Vr[a],h=Vr[l],d=c&&u?0:3-(c+u+h);let f=0,g=0,_=0,m=r[i];return f+=m>>4,g+=m&15,_++,ai[o]||(m=r[i+t],f+=m>>4,g+=m&15,_++),ai[a]||(m=r[i+e],f+=m>>4,g+=m&15,_++),!ai[l]&&(!ai[o]||!ai[a])&&(m=r[i+t+e],f+=m>>4,g+=m&15,_++),n[0]=f/_,n[1]=g/_,d}const oi=[ui*Ms,1,ui];function Sv(i,t,e,n,s){const r=n===b.CACTUS;for(let o=0;o<6;o++){const a=_n[s+to[o]];if(!yv(n,a))continue;const l=gl[o],c=nr[n*6+o],u=s+to[o],h=o>>1;let d=0,f=0;for(let g=0;g<4;g++){const _=l.v[g];let m=i+_[0],p=t+_[1],x=e+_[2];r&&h!==1&&(h===0?m+=_[0]===1?-1/16:1/16:x+=_[2]===1?-1/16:1/16),Fe[g][0]=m,Fe[g][1]=p,Fe[g][2]=x,Oe[g][0]=gi[g][0],Oe[g][1]=gi[g][1];let v,y;h===0?(v=_[1]?oi[1]:-1,y=_[2]?oi[2]:-130):h===1?(v=_[0]?oi[0]:-2340,y=_[2]?oi[2]:-130):(v=_[0]?oi[0]:-2340,y=_[1]?oi[1]:-1);const A=Mv(u,v,y,Xe[g]);Xe[g][2]=l.shade*vv[A],g===0||g===2?d+=A:f+=A}Ss.quad(Fe,Oe,c,Xe,d<f)}}function Or(i,t,e,n){let s=0,r=0;const o=[i,i+t,i+e,i+t+e];for(let a=0;a<4;a++){const l=o[a],c=_n[l];if(jt[c]!==n)continue;if(jt[_n[l+1]]===n)return 1;const u=$o(c);u>=.8?(s+=u*10,r+=10):(s+=u,r+=1)}return r?s/r:$o(_n[i])}function Ev(i,t,e,n,s){const r=jt[n],o=r===1?Ha:Ss,a=oi[0],l=oi[2];let c,u,h,d;jt[_n[s+1]]===r?c=u=h=d=1:(c=Or(s,-a,-l,r),u=Or(s,a,-l,r),h=Or(s,-a,l,r),d=Or(s,a,l,r));const f=$n[s],g=f>>4,_=f&15;for(let m=0;m<6;m++){const p=_n[s+to[m]];if(jt[p]===r||ai[p])continue;const x=gl[m],v=nr[n*6+m],y=m===3?f:$n[s+to[m]],A=Math.max(g,y>>4),T=Math.max(_,y&15);for(let R=0;R<4;R++){const P=x.v[R],E=P[0]?P[2]?d:u:P[2]?h:c;Fe[R][0]=i+P[0],Fe[R][1]=t+(P[1]?E:0),Fe[R][2]=e+P[2],Oe[R][0]=gi[R][0],Oe[R][1]=gi[R][1]*(m<2||m>3?E:1),Xe[R][0]=A,Xe[R][1]=T,Xe[R][2]=x.shade}o.quad(Fe,Oe,v,Xe,!1)}}function bv(i,t,e,n,s){const r=nr[n*6],o=$n[s],a=o>>4,l=o&15;for(let u=0;u<4;u++)Xe[u][0]=a,Xe[u][1]=l,Xe[u][2]=.9;const c=[[[0,0,0],[1,0,1],[1,1,1],[0,1,0]],[[0,0,1],[1,0,0],[1,1,0],[0,1,1]]];for(const u of c)for(let h=0;h<2;h++){for(let d=0;d<4;d++){const f=u[h?3-d:d];Fe[d][0]=i+f[0],Fe[d][1]=t+f[1],Fe[d][2]=e+f[2];const g=h?[3,2,1,0][d]:d;Oe[d][0]=gi[g][0],Oe[d][1]=gi[g][1]}Ss.quad(Fe,Oe,r,Xe,!1)}}function wv(i,t,e,n,s){const r=nr[n*6],o=$n[s],a=o>>4,l=o&15;for(let d=0;d<4;d++)Xe[d][0]=a,Xe[d][1]=l;const c=7/16,u=9/16,h=10/16;for(let d=0;d<6;d++){const f=gl[d];for(let g=0;g<4;g++){const _=f.v[g];Fe[g][0]=i+(_[0]?u:c),Fe[g][1]=t+(_[1]?h:0),Fe[g][2]=e+(_[2]?u:c),Xe[g][2]=f.shade;const m=gi[g][0],p=gi[g][1];d===2?(Oe[g][0]=c+m*(2/16),Oe[g][1]=8/16+p*(2/16)):d===3?(Oe[g][0]=c+m*(2/16),Oe[g][1]=p*(2/16)):(Oe[g][0]=c+m*(2/16),Oe[g][1]=p*h)}Ss.quad(Fe,Oe,r,Xe,!1)}}const eo=1,_l=2,Tv={[eo]:.25,[_l]:1.5},Av={[eo]:1,[_l]:2},rh=[[1,0],[-1,0],[0,1],[0,-1]];function Rv(i,t,e){return((i+524288)*1048576+(e+524288))*128+t}function Cv(i){const t=i%128,e=(i-t)/128,n=e%1048576-524288;return[Math.floor(e/1048576)-524288,t,n]}function oh(i){return i===b.AIR?!0:jt[i]?!1:ci[i]===1&&!vn[i]}class Lv{constructor(t,e){this.world=t,this.game=e,this.pending=new Map,this.maxPerFrame=800,this.processed=0}schedule(t,e,n,s=0){if(e<0||e>=Xt)return;const r=this.world.getBlock(t,e,n),o=jt[r];if(!o)return;const a=this.world.time+Tv[o],l=Rv(t,e,n),c=this.pending.get(l);(c===void 0||a<c)&&this.pending.set(l,a)}scheduleNeighbours(t,e,n){this.schedule(t+1,e,n),this.schedule(t-1,e,n),this.schedule(t,e+1,n),this.schedule(t,e-1,n),this.schedule(t,e,n+1),this.schedule(t,e,n-1)}onBlockChanged(t,e,n,s,r){jt[r]&&this.schedule(t,e,n),this.scheduleNeighbours(t,e,n)}update(){if(this.pending.size===0)return;const t=this.world.time;let e=0;const n=[];for(const[s,r]of this.pending)if(r<=t&&(n.push(s),++e>=this.maxPerFrame))break;for(const s of n){this.pending.delete(s);const[r,o,a]=Cv(s);this._tick(r,o,a)}this.processed+=n.length}_tick(t,e,n){const s=this.world,r=s.getBlock(t,e,n),o=jt[r];if(!o)return;let a=rn[r];const l=hi[r]===1,c=Av[o];if(o===_l){let d=!1;for(const[f,g,_]of[[1,0,0],[-1,0,0],[0,1,0],[0,0,1],[0,0,-1]])if(jt[s.getBlock(t+f,e+g,n+_)]===eo){d=!0;break}if(d){s.setBlock(t,e,n,l?b.OBSIDIAN:b.COBBLESTONE,"fluid"),this.game.audio.play("dig_glass",{x:t,y:e,z:n,pitch:.6});for(let f=0;f<6;f++)this.game.renderer.spawnParticle({x:t+Math.random(),y:e+1,z:n+Math.random(),vx:0,vy:1.5,vz:0,life:.6,r:.6,g:.6,b:.6,size:1.5,noGravity:!0});return}}if(!l){const d=s.getBlock(t,e+1,n);let f=0,g=!1;if(jt[d]===o)f=8,g=!0;else{let m=0;for(const[p,x]of rh){const v=s.getBlock(t+p,e,n+x);if(jt[v]!==o)continue;const y=rn[v]-c;y>f&&(f=y),hi[v]&&m++}if(o===eo&&m>=2){const p=s.getBlock(t,e-1,n);if(vn[p]||hi[p]){s.setBlock(t,e,n,Vi(o,8,!1),"fluid");return}}}if(f<=0){s.setBlock(t,e,n,b.AIR,"fluid");return}const _=Vi(o,f,g);_!==r&&(s.setBlock(t,e,n,_,"fluid"),a=f)}const u=s.getBlock(t,e-1,n);if(e>0&&oh(u)){this._flowInto(t,e-1,n,Vi(o,8,!0),u);return}jt[u]===o&&!hi[u]&&Ws[u]===0&&rn[u]<8&&s.setBlock(t,e-1,n,Vi(o,8,!0),"fluid");const h=a-c;if(!(h<=0)&&!(!l&&!vn[u])&&!(l&&!vn[u]&&jt[u]!==o))for(const[d,f]of rh){const g=t+d,_=n+f,m=s.getBlock(g,e,_);oh(m)?this._flowInto(g,e,_,Vi(o,h,!1),m):jt[m]===o&&!hi[m]&&!Ws[m]&&rn[m]<h&&s.setBlock(g,e,_,Vi(o,h,!1),"fluid")}}_flowInto(t,e,n,s,r){const o=this.world;r!==b.AIR&&wn[r]===on.CROSS&&this.game.renderer.spawnBlockParticles(t,e,n,r,4),o.setBlock(t,e,n,s,"fluid")}serialize(){const t=[];for(const[e,n]of this.pending)t.push(e,+(n-this.world.time).toFixed(2));return t}deserialize(t){if(t)for(let e=0;e<t.length;e+=2)this.pending.set(t[e],this.world.time+t[e+1])}}const ah=4.5,lh=6;class Dv{constructor(t){this.canvas=t,this.renderer=new B_(t),this.input=new z_(t),this.audio=new _v,this.hud=new nv(this),this.screens=new fv(this),this.containers=new mv(this),this.world=null,this.player=null,this.entities=new j_(this),this.running=!1,this.paused=!1,this.worldEntry=null,this.target=null,this.breaking=null,this.placeCooldown=0,this.digSoundTimer=0,this.spawnTimer=0,this.autosaveTimer=0,this.randomTickTimer=0,this.furnaceTimer=0,this.eatCooldown=0,this.bowDrawing=!1,this.bowCharge=0,this.lastFrame=0,this.ready=!1,this.settings=this.screens.settings,this.stats={frame:0},this.applySettings(this.settings),this.input.onKeyDown=e=>this._onKey(e),this.input.onLockChange=e=>{!e&&this.running&&!this.paused&&!this.containers.isOpen&&!this.player.dead&&this.pause()},t.addEventListener("mousedown",()=>{this.audio.unlock(),this.running&&!this.paused&&!this.containers.isOpen&&!this.player.dead&&this.input.lock()}),window.addEventListener("beforeunload",e=>{this.running&&(this.save(),e.preventDefault(),e.returnValue="")}),document.addEventListener("fullscreenchange",()=>{if(!document.fullscreenElement&&(this.input.keyboardLocked=!1,navigator.keyboard&&navigator.keyboard.unlock))try{navigator.keyboard.unlock()}catch{}this.renderer.resize()}),window.addEventListener("keydown",()=>this.audio.unlock(),{once:!0}),window.addEventListener("mousedown",()=>this.audio.unlock(),{once:!0}),this.hud.setVisible(!1),this.screens.show("title"),requestAnimationFrame(e=>this._frame(e))}get timeOfDay(){return this.world?this.world.time/pu%1:.3}get daylight(){return this.renderer.sky.state.daylight}applySettings(t){this.settings=t,this.renderer.setRenderDistance(t.renderDistance),this.renderer.fov=t.fov,this.audio.setVolume(t.volume),this.player&&(this.player.sensitivity=.0022*t.sensitivity),this.input.sprintKey=t.sprintKey||"KeyR"}async toggleFullscreen(){try{if(document.fullscreenElement){await document.exitFullscreen();return}await document.documentElement.requestFullscreen({navigationUI:"hide"}),navigator.keyboard&&navigator.keyboard.lock&&(await navigator.keyboard.lock(),this.input.keyboardLocked=!0,this.hud.showMessage("Fullscreen: keyboard locked, Ctrl+W is safe here. Hold Esc to leave.",4))}catch(t){console.warn("fullscreen failed",t)}}async startWorld(t){this.worldEntry=t,this.screens.show("loading",{text:`Loading "${t.name}"...`}),await new Promise(l=>setTimeout(l,30));const e=rv(t.id);if(this.world=e&&e.world?Xr.deserialize(e.world):new Xr(t.seed),this.world.onChunkGeometry=(l,c)=>this.renderer.setChunkGeometry(l,c),this.world.onChunkUnload=l=>this.renderer.removeChunk(l),this.world.onBlockChanged((l,c,u,h,d,f)=>this._onBlockChanged(l,c,u,h,d,f)),this.fluids=new Lv(this.world,this),e&&e.fluids&&this.fluids.deserialize(e.fluids),this.renderer.world=this.world,this.renderer.dispose(),this.entities.clear(),this.player=new $_(this),this.player.mode=t.mode??Wr.SURVIVAL,this.player.sensitivity=.0022*this.settings.sensitivity,e&&e.player)this.player.deserialize(e.player);else{const l=this.world.gen.findSpawn();this.player.spawn={x:l.x,y:l.y+1,z:l.z},this.player.teleport(l.x,l.y+1,l.z),this.player.mode,Wr.SURVIVAL}if(e&&e.entities)for(const l of e.entities)if(l.type==="item")this.entities.add(new jc(l.x,l.y,l.z,l.stack));else{const c=Ur(l.type,l.x,l.y,l.z);c&&(c.health=l.health,this.entities.add(c))}const n=Math.min(5,this.settings.renderDistance),s=(2*n+1)*(2*n+1);let r=0;const o=Math.floor(this.player.x)>>4,a=Math.floor(this.player.z)>>4;for(let l=0;l<=n;l++){for(let c=-l;c<=l;c++)for(let u=-l;u<=l;u++)Math.max(Math.abs(c),Math.abs(u))===l&&(this.world.ensureChunk(o+c,a+u),r++);this.screens.setLoadProgress(r/s*.7),await new Promise(c=>setTimeout(c,0))}for(let l=0;l<40;l++){const c=this.world.updateMeshing(this.player.x,this.player.z,30,u=>sh(this.world,u),n-1);if(this.screens.setLoadProgress(.7+.3*(l/40)),c===0)break;await new Promise(u=>setTimeout(u,0))}this._unstuckPlayer(),this.screens.hide(),this.hud.setVisible(!0),this.running=!0,this.paused=!1,this.ready=!0,this.lastFrame=performance.now(),this.hud.showMessage(this.player.creative?me.active?"Creative — double-tap JUMP to fly, ITEMS for blocks":"Creative mode — double-tap Space to fly, Tab for items":"Survival — punch a tree to begin!",5),this.input.lock()}_unstuckPlayer(){const t=this.player,e=this.world;let n=0;for(;n++<200&&(e.isSolid(Math.floor(t.x),Math.floor(t.y),Math.floor(t.z))||e.isSolid(Math.floor(t.x),Math.floor(t.y+1),Math.floor(t.z)));)t.y+=1}save(){if(!this.world||!this.worldEntry)return;const t={version:1,world:this.world.serialize(),player:this.player.serialize(),entities:this.entities.serialize().slice(0,200),fluids:this.fluids?this.fluids.serialize().slice(0,4e3):[]},e=sv(this.worldEntry.id,t);return e||this.hud.showMessage("저장 실패 (용량 초과)",5),e}quitToTitle(){this.save(),this.running=!1,this.paused=!1,this.ready=!1,this.containers.close(),this.entities.clear(),this.renderer.dispose(),this.world=null,this.player=null,this.input.unlock(),this.hud.setVisible(!1),this.screens.show("title")}pause(){!this.running||this.paused||(this.paused=!0,this.input.unlock(),this.input.enabled=!1,this.screens.show("pause"),this.save())}resume(){this.paused=!1,this.input.enabled=!0,this.screens.hide(),this.lastFrame=performance.now(),this.input.lock()}respawn(){this.player.respawn(),this._unstuckPlayer(),this.screens.hide(),this.input.enabled=!0,this.input.lock()}onPlayerHurt(t){t>0&&this.audio.play("hurt")}onPlayerDeath(t){const e=this.player;for(let s=0;s<e.inventory.slots.length;s++){const r=e.inventory.slots[s];r&&(this.dropItem(e.x,e.y+1,e.z,r,!0),e.inventory.slots[s]=null)}this.hud.inventoryChanged(),this.containers.close(),this.input.unlock(),this.input.enabled=!1;const n={fall:"You fell from a high place",lava:"You tried to swim in lava",drown:"You drowned",zombie:"You were slain by a Zombie",skeleton:"You were shot by a Skeleton",arrow:"You were shot by a Skeleton",explosion:"You were blown up",cactus:"You were pricked to death",starve:"You starved to death",fire:"You burned to death",void:"You fell out of the world"};this.screens.show("death",{message:n[t]||"You died"})}_onKey(t){if(!this.running)return;const e=this.player;if(t.code==="Escape"){this.containers.isOpen?(this.containers.close(),this.input.enabled=!0,this.input.lock()):this.paused?this.resume():e.dead||this.pause();return}if(!(this.paused||e.dead)){if(t.code==="KeyE"||t.code==="Tab"&&e.creative){t.preventDefault(),this.containers.isOpen?(this.containers.close(),this.input.enabled=!0,this.input.lock()):(this.containers.open(t.code==="Tab"?"creative":"inventory"),this.input.enabled=!1,this.input.unlock());return}if(!this.containers.isOpen){if(t.code==="F3"&&(this.hud.showDebug=!this.hud.showDebug,t.preventDefault()),t.code.startsWith("Digit")){const n=parseInt(t.code.slice(5),10);n>=1&&n<=9&&(e.selected=n-1)}if(t.code==="KeyQ"){const n=e.heldItem;if(n){const s=e.getLookDir(),r={...n,count:1};e.inventory.consumeSlot(e.selected,1),this.dropItem(e.x+s.x*.5,e.y+1.3,e.z+s.z*.5,r,!1,s),this.hud.inventoryChanged()}}t.code==="KeyF"&&e.creative&&(e.flying=!e.flying,e.vy=0),t.code==="F4"&&(t.preventDefault(),this.toggleFullscreen())}}}_frame(t){if(requestAnimationFrame(n=>this._frame(n)),!this.running)return;let e=(t-this.lastFrame)/1e3;this.lastFrame=t,e>.1&&(e=.1),e<=0&&(e=.001),this.stats.frame++,this.paused||this.update(e),this.renderer.render(),this.hud.update(e),this.input.endFrame()}update(t){const e=this.world,n=this.player;e.time+=t,e.updateLoading(n.x,n.z,this.settings.renderDistance,4),e.updateMeshing(n.x,n.z,6,s=>sh(e,s)),n.update(t,this.input,e),this.audio.listener={x:n.x,y:n.y+1.6,z:n.z},this.input.enabled&&!n.dead?(this.input.wheel&&(n.selected=(n.selected+this.input.wheel+9)%9),this._updateInteraction(t)):(this.target=null,this.renderer.setSelection(null,0),this.bowDrawing=!1,this.bowCharge=0,n.drawing=!1,this.renderer.bowPull=0),this.renderer.setHeldItem(n.heldId),this.entities.update(t),this.fluids.update(),this._spawning(t),this._randomTicks(t),this._scheduledTicks(),this._furnaces(t),this.containers.update(t),this.eatCooldown>0&&(this.eatCooldown-=t),this.placeCooldown>0&&(this.placeCooldown-=t),this.autosaveTimer+=t,this.autosaveTimer>60&&(this.autosaveTimer=0,this.save()),this.renderer.update(t,this.timeOfDay,n,n.headWater)}_updateInteraction(t){const e=this.player,n=this.world,s=this.input,r=e.getEyePos(),o=e.getLookDir(),a=e.creative?lh:ah,l=n.raycast(r.x,r.y,r.z,o.x,o.y,o.z,a),c=this.entities.raycast(r.x,r.y,r.z,o.x,o.y,o.z,a,d=>d.type!=="item"&&d.type!=="arrow"&&!(d.dying>0)),u=c&&(!l||c.dist<l.dist);if(this.target=u?null:l,s.mouseJustPressed(0)&&(this.renderer.triggerSwing(),u)){const d=c.entity,f=S_(e.heldId)*(e.vy<0&&!e.onGround?1.5:1);d.damage&&(d.damage(f,d.x-e.x,d.z-e.z,this,"player"),d.lastAttacker=e,d.type);const g=e.heldItem;g&&Ne(g.id)&&Ne(g.id).tool&&!e.creative&&e.inventory.damageTool(e.selected,1)&&this.audio.play("dig_glass"),this.breaking=null,e.exhaustion+=.1}if(s.mouseDown(0)&&!u&&l){const d=l.id,f=de(d);this.breaking&&(this.breaking.x!==l.x||this.breaking.y!==l.y||this.breaking.z!==l.z)&&(this.breaking=null),this.breaking||(this.breaking={x:l.x,y:l.y,z:l.z,id:d,progress:0,cooldown:0});const g=this.breaking;if(g.cooldown>0)g.cooldown-=t;else if(e.creative)(s.mouseJustPressed(0)||g.progress===0)&&(this._breakBlock(l.x,l.y,l.z,!0),g.cooldown=.25,g.progress=.01);else{const _=y_(d,e.heldId);if(_===1/0)g.progress=0;else if(g.progress+=t/_,this.digSoundTimer-=t,this.digSoundTimer<=0&&(this.digSoundTimer=.25,this.audio.playDig(d,{volume:.4,pitch:1.2}),this.renderer.spawnBlockParticles(l.x,l.y,l.z,d,2)),Math.floor(g.progress*8)!==Math.floor((g.progress-t/_)*8)&&this.renderer.triggerSwing(),g.progress>=1){this._breakBlock(l.x,l.y,l.z,!1),g.progress=0,g.cooldown=.2;const m=e.heldItem;m&&Ne(m.id)&&Ne(m.id).tool&&f.hardness>0&&e.inventory.damageTool(e.selected,1)&&(this.audio.play("dig_glass"),this.hud.showMessage("Your tool broke!")),e.exhaustion+=.05}}this.renderer.setSelection(l,e.creative?0:g.progress)}else this.breaking=null,this.renderer.setSelection(this.target,0);const h=e.heldItem?Ne(e.heldId):null;if(h&&h.bow)s.mouseDown(2)?(this.bowDrawing||(this.bowDrawing=!0,this.bowCharge=0,!e.creative&&e.inventory.count(Y.ARROW)===0&&this.hud.showMessage("No arrows!")),this.bowCharge+=t):this.bowDrawing&&(this.bowDrawing=!1,this._shootBow(Math.min(1,this.bowCharge)),this.bowCharge=0),e.drawing=this.bowDrawing,this.renderer.bowPull=this.bowDrawing?Math.min(1,this.bowCharge):0,this.renderer.bowHasArrow=e.creative||e.inventory.count(Y.ARROW)>0;else if(this.bowDrawing&&(this.bowDrawing=!1,this.bowCharge=0),e.drawing=!1,this.renderer.bowPull=0,s.mouseDown(2)&&(s.mouseJustPressed(2)||this.placeCooldown<=0)){const d=s.mouseJustPressed(2);this.placeCooldown=.22,this._use(l,d)}if(s.mouseJustPressed(1)&&l&&e.creative){const d=l.id===b.FURNACE_LIT?b.FURNACE:l.id,f=e.inventory.slots;let g=-1;for(let _=0;_<9;_++)if(f[_]&&f[_].id===d){g=_;break}if(g>=0)e.selected=g;else{let _=-1;for(let p=0;p<9;p++)if(!f[p]){_=p;break}const m=_>=0?_:e.selected;f[m]={id:d,count:1},e.selected=m}this.hud.inventoryChanged()}}_use(t,e){const n=this.player,s=this.world,r=n.heldItem,o=r?r.id:0,a=o?Ne(o):null;if(t&&!n.sneaking&&e){const l=de(t.id);if(l.interact==="crafting"){this._openContainer("crafting");return}if(l.interact==="furnace"){let c=s.getBlockEntity(t.x,t.y,t.z);c||(c={type:"furnace",slots:[null,null,null],burn:0,burnMax:0,cook:0},s.setBlockEntity(t.x,t.y,t.z,c)),this._openContainer("furnace",c,t);return}if(l.interact==="chest"){let c=s.getBlockEntity(t.x,t.y,t.z);c||(c={type:"chest",slots:new Array(27).fill(null)},s.setBlockEntity(t.x,t.y,t.z,c)),this._openContainer("chest",c,t);return}if(l.interact==="tnt"){s.setBlock(t.x,t.y,t.z,b.AIR,"ignite"),this.entities.add(new Jc(t.x+.5,t.y,t.z+.5,4)),this.audio.play("fuse",{x:t.x,y:t.y,z:t.z});return}}if(!r){this.renderer.triggerSwing();return}if(a&&a.bucket!==void 0){if(!e)return;const l=n.getEyePos(),c=n.getLookDir();if(a.bucket===0){const u=s.raycast(l.x,l.y,l.z,c.x,c.y,c.z,n.creative?lh:ah,!0);if(!u||!hi[u.id])return;const h=jt[u.id];s.setBlock(u.x,u.y,u.z,b.AIR,"player"),n.creative||(n.inventory.consumeSlot(n.selected,1),n.inventory.add(h===1?Y.WATER_BUCKET:Y.LAVA_BUCKET,1)&&this.dropItem(n.x,n.y+1,n.z,{id:h===1?Y.WATER_BUCKET:Y.LAVA_BUCKET,count:1},!0)),this.audio.play("splash",{volume:.6})}else{if(!t)return;let{px:u,py:h,pz:d}=t;if(ci[t.id]&&!jt[t.id]&&(u=t.x,h=t.y,d=t.z),h<0||h>=Xt||!ci[s.getBlock(u,h,d)])return;s.setBlock(u,h,d,a.bucket===1?b.WATER:b.LAVA,"player"),n.creative||(n.inventory.slots[n.selected]={id:Y.BUCKET,count:1}),this.audio.play("splash",{volume:.6})}this.renderer.triggerSwing(),this.hud.inventoryChanged();return}if(a&&a.food&&e){(n.food<20||a.heal)&&this.eatCooldown<=0&&(this.eatCooldown=.6,n.eat(a.food,a.heal||0),n.creative||n.inventory.consumeSlot(n.selected,1),this.audio.play("eat"),this.renderer.triggerSwing(),this.hud.inventoryChanged());return}if(o<256&&t){const l=o,c=de(l);let{px:u,py:h,pz:d}=t;if(ci[t.id]&&!jt[t.id]&&(u=t.x,h=t.y,d=t.z),h<0||h>=Xt)return;const f=s.getBlock(u,h,d);if(!ci[f])return;if(c.plant){const g=s.getBlock(u,h-1,d);if(!(l===b.CACTUS||l===b.DEAD_BUSH?g===b.SAND||g===b.CACTUS:g===b.GRASS||g===b.DIRT||g===b.SNOWY_GRASS||l===b.BROWN_MUSHROOM||l===b.RED_MUSHROOM))return}if(c.solid){const g={x:u+.5,y:h,z:d+.5,w:.5,h:1};if(Kc(g,n))return;for(const _ of this.entities.list)if(!_.dead&&_.type!=="item"&&_.type!=="arrow"&&Kc(g,_))return}s.setBlock(u,h,d,l,"player"),c.sapling&&s.schedule(u,h,d,45+Math.random()*60,"sapling"),n.creative||n.inventory.consumeSlot(n.selected,1),this.audio.playDig(l,{volume:.7,pitch:.8}),this.renderer.triggerSwing(),this.hud.inventoryChanged()}}_shootBow(t){const e=this.player;if(t<.12||!e.creative&&e.inventory.count(Y.ARROW)===0)return;const n=(t*t+t*2)/3,s=80*n;let r=2+n*4,o=!1;t>=1&&Math.random()<.3&&(r*=1.5,o=!0),r=Math.max(1,Math.round(r));const a=e.getEyePos(),l=e.getLookDir(),c=(1-n)*.04,u=l.x+(Math.random()-.5)*c,h=l.y+(Math.random()-.5)*c,d=l.z+(Math.random()-.5)*c,f=new jh(a.x+l.x*.4,a.y-.1+l.y*.4,a.z+l.z*.4,u*s+e.vx,h*s,d*s+e.vz,e,r,o);this.entities.add(f),e.creative||(e.inventory.remove(Y.ARROW,1),e.inventory.damageTool(e.selected,1)&&(this.audio.play("dig_glass"),this.hud.showMessage("Your bow broke!"))),this.audio.play("bow",{pitch:.8+n*.5}),this.renderer.triggerSwing(),this.hud.inventoryChanged()}_openContainer(t,e=null,n=null){this.containers.open(t,e,n),this.input.enabled=!1,this.input.unlock()}_breakBlock(t,e,n,s){const r=this.world,o=this.player,a=r.getBlock(t,e,n);if(!a)return;const l=de(a);if(l.hardness<0&&!s)return;const c=r.getBlockEntity(t,e,n);if(c&&c.slots)for(const h of c.slots)h&&this.dropItem(t+.5,e+.5,n+.5,h,!0);if(r.setBlock(t,e,n,b.AIR,"player"),this.audio.playDig(a,{x:t,y:e,z:n}),this.renderer.spawnBlockParticles(t,e,n,a,14),s||!M_(a,o.heldId))return;const u=l.drops;if(u===null)this.dropItem(t+.5,e+.3,n+.5,{id:a,count:1},!0);else for(const h of u){if(h.chance!==void 0&&Math.random()>h.chance){h.else&&this.dropItem(t+.5,e+.3,n+.5,{id:h.else,count:1},!0);continue}const d=h.count+(h.extra?Math.floor(Math.random()*(h.extra+1)):0);this.dropItem(t+.5,e+.3,n+.5,{id:h.id,count:d},!0)}}dropItem(t,e,n,s,r=!1,o=null){if(!s||s.count<=0)return;const a=new jc(t,e,n,{...s});return o?(a.vx=o.x*6,a.vy=o.y*6+2,a.vz=o.z*6,a.pickupDelay=1.5):r&&(a.vx=(Math.random()-.5)*3,a.vy=3+Math.random()*2,a.vz=(Math.random()-.5)*3),this.entities.add(a),a}explode(t,e,n,s,r){const o=this.world,a=s;this.audio.play("explode",{x:t,y:e,z:n,range:60,volume:1.5});const l=Math.ceil(a),c=[];for(let d=-l;d<=l;d++)for(let f=-l;f<=l;f++)for(let g=-l;g<=l;g++){const _=Math.floor(t)+d,m=Math.floor(e)+f,p=Math.floor(n)+g;if(Math.hypot(d,f,g)>a*(.75+Math.random()*.35))continue;const v=o.getBlock(_,m,p);if(!v)continue;const y=de(v);if(!(y.hardness<0||y.hardness>=20||wn[v]===on.LIQUID)){if(v===b.TNT){c.push([_,m,p]);continue}if(o.setBlock(_,m,p,b.AIR,"explosion"),Math.random()<.3&&y.drops!==void 0){const A=y.drops===null?[{id:v,count:1}]:y.drops.filter(T=>T.chance===void 0);for(const T of A)this.dropItem(_+.5,m+.5,p+.5,{id:T.id,count:T.count},!0)}}}for(const[d,f,g]of c)o.setBlock(d,f,g,b.AIR,"explosion"),this.entities.add(new Jc(d+.5,f,g+.5,.5+Math.random()*1));const u=this.player,h=(d,f)=>{const g=d.x-t,_=d.y+d.h*.5-e,m=d.z-n,p=Math.hypot(g,_,m);if(p>a*2)return;const x=1-p/(a*2),v=Math.round(x*x*s*7);f?d.damage(v,"explosion")&&d.knockback(g,m,x*12):d.damage&&d!==r&&d.damage(v,g,m,this,"explosion")};h(u,!0);for(const d of this.entities.list)!d.dead&&d.damage&&h(d,!1);for(let d=0;d<40;d++){const f=Math.random()*Math.PI*2,g=(Math.random()-.5)*Math.PI,_=4+Math.random()*8;this.renderer.spawnParticle({x:t,y:e,z:n,vx:Math.cos(f)*Math.cos(g)*_,vy:Math.sin(g)*_+3,vz:Math.sin(f)*Math.cos(g)*_,life:.8+Math.random(),r:.6,g:.6,b:.6,size:2+Math.random()*2})}}_onBlockChanged(t,e,n,s,r,o){const a=this.world;if(this.fluids.onBlockChanged(t,e,n,s,r),r===b.AIR||ci[r]){const l=a.getBlock(t,e+1,n);if(l){const c=de(l);c.plant||l===b.TORCH?!(l===b.TORCH&&(a.isSolid(t+1,e+1,n)||a.isSolid(t-1,e+1,n)||a.isSolid(t,e+1,n+1)||a.isSolid(t,e+1,n-1)))&&!vn[r]&&(a.setBlock(t,e+1,n,b.AIR,"support"),c.drops===null&&this.dropItem(t+.5,e+1.3,n+.5,{id:l,count:1},!0),this.renderer.spawnBlockParticles(t,e+1,n,l,6)):c.gravity&&(a.setBlock(t,e+1,n,b.AIR,"gravity"),this.entities.add(new Qc(t,e+1,n,l)))}}de(r).gravity&&!vn[a.getBlock(t,e-1,n)]&&o!=="fall"&&(a.setBlock(t,e,n,b.AIR,"gravity"),this.entities.add(new Qc(t,e,n,r))),o==="player"&&b.AIR}_scheduledTicks(){const t=this.world;if(!t.scheduled.length)return;const e=t.time;for(let n=t.scheduled.length-1;n>=0;n--){const s=t.scheduled[n];if(!(s.time>e)&&(t.scheduled.splice(n,1),s.type==="sapling"&&t.getBlock(s.x,s.y,s.z)===b.OAK_SAPLING)){const r=t.gen.treeBlocks({x:s.x,y:s.y,z:s.z,type:Math.random()<.15?"bigoak":"oak"});let o=!0;for(const[a,l,c,u]of r){const h=t.getBlock(a,l,c);if(h!==b.AIR&&h!==b.OAK_SAPLING&&h!==b.OAK_LEAVES&&h!==b.TALL_GRASS&&u!==b.OAK_LEAVES){o=!1;break}}if(!o){t.schedule(s.x,s.y,s.z,30,"sapling");continue}for(const[a,l,c,u]of r){const h=t.getBlock(a,l,c);(h===b.AIR||h===b.OAK_SAPLING||h===b.TALL_GRASS||h===b.OAK_LEAVES&&u!==b.OAK_LEAVES)&&t.setBlock(a,l,c,u,"growth")}}}}_randomTicks(t){if(this.randomTickTimer+=t,this.randomTickTimer<.5)return;this.randomTickTimer=0;const e=this.world,n=this.player;for(let s=0;s<24;s++){const r=Math.floor(n.x)+Math.floor((Math.random()-.5)*32),o=Math.floor(n.z)+Math.floor((Math.random()-.5)*32),a=Math.floor(n.y)+Math.floor((Math.random()-.5)*24),l=e.getBlock(r,a,o);if(l===b.DIRT){const c=e.getBlock(r,a+1,o);if((c===b.AIR||de(c).render==="cross")&&(e.getSky(r,a+1,o)>=9||e.getBlockLight(r,a+1,o)>=9)){let u=!1;for(let h=-1;h<=1&&!u;h++)for(let d=-1;d<=1&&!u;d++)for(let f=-1;f<=1;f++)if(e.getBlock(r+h,a+f,o+d)===b.GRASS){u=!0;break}u&&e.setBlock(r,a,o,b.GRASS,"growth")}}else if(l===b.GRASS){const c=e.getBlock(r,a+1,o);de(c).opaque&&e.setBlock(r,a,o,b.DIRT,"growth")}else l===b.OAK_SAPLING&&(e.scheduled.some(c=>c.x===r&&c.y===a&&c.z===o)||e.schedule(r,a,o,30+Math.random()*60,"sapling"))}}_furnaces(t){const e=this.world;for(const n of e.chunks.values())if(n.blockEntities.size!==0)for(const[s,r]of n.blockEntities){if(r.type!=="furnace")continue;const o=n.cx*16+(s>>11),a=n.cz*16+(s>>7&15),l=s&127,c=r.slots[0],u=r.slots[1],h=r.slots[2],d=c?qh(c.id):0,f=d&&(!h||h.id===d&&h.count<64);r.burn>0&&(r.burn-=t),r.burn<=0&&f&&u&&Ba(u.id)>0&&(r.burnMax=Ba(u.id),r.burn=r.burnMax,u.id===Y.LAVA_BUCKET?r.slots[1]={id:Y.BUCKET,count:1}:(u.count-=1,u.count<=0&&(r.slots[1]=null)));const g=r.burn>0,_=e.getBlock(o,l,a);g&&_===b.FURNACE?e.setBlock(o,l,a,b.FURNACE_LIT,"furnace"):!g&&_===b.FURNACE_LIT&&e.setBlock(o,l,a,b.FURNACE,"furnace"),g&&f?(r.cook+=t,r.cook>=10&&(r.cook=0,h?h.count+=1:r.slots[2]={id:d,count:1},c.count-=1,c.count<=0&&(r.slots[0]=null))):f||(r.cook=Math.max(0,r.cook-t*2))}}_spawning(t){if(this.spawnTimer+=t,this.spawnTimer<1)return;this.spawnTimer=0;const e=this.world,n=this.player,s=this.entities.count(l=>l.hostile),r=this.entities.count(l=>l.type&&Xo.includes(l.type)),o=this.daylight<.5,a=6;for(let l=0;l<a;l++){const c=Math.random()*Math.PI*2,u=22+Math.random()*20,h=Math.floor(n.x+Math.cos(c)*u),d=Math.floor(n.z+Math.sin(c)*u),f=e.chunkAt(h,d);if(!(!f||!f.lit)){if(s<14){let g;if(Math.random()<.5?g=e.surfaceY(h,d)+1:g=8+Math.floor(Math.random()*Math.max(1,e.surfaceY(h,d)-8)),g>0&&g<Xt-2&&this._spawnable(h,g,d)){const _=e.getSky(h,g,d),m=e.getBlockLight(h,g,d);if(Math.max(m,o?Math.max(0,_-11):_)<8){const x=Math.random(),v=x<.45?"zombie":x<.75?"skeleton":"creeper",y=Ur(v,h+.5,g,d+.5);this.entities.add(y);continue}}}if(r<10&&!o){const g=e.surfaceY(h,d)+1;if(e.getBlock(h,g-1,d)===b.GRASS&&this._spawnable(h,g,d)&&e.getSky(h,g,d)>=9){const _=Xo[Math.floor(Math.random()*Xo.length)],m=1+Math.floor(Math.random()*3);for(let p=0;p<m;p++){const x=h+.5+(Math.random()-.5)*3,v=d+.5+(Math.random()-.5)*3,y=e.surfaceY(Math.floor(x),Math.floor(v))+1;this._spawnable(Math.floor(x),y,Math.floor(v))&&this.entities.add(Ur(_,x,y,v))}}}}}}spawnMobAt(t,e,n,s){const r=Ur(t,e,n,s);return r&&this.entities.add(r),r}_spawnable(t,e,n){const s=this.world;return vn[s.getBlock(t,e-1,n)]&&!s.isSolid(t,e,n)&&!s.isSolid(t,e+1,n)&&!jt[s.getBlock(t,e,n)]&&jt[s.getBlock(t,e-1,n)]!==2}}const Pv=document.getElementById("game"),Es=new Dv(Pv);window.__game=Es;Es.touchKit=dv(Es);const Di=new URLSearchParams(location.search);Di.get("nolock")&&(Es.input.noPointerLock=!0);if(Di.get("world")){const i=Di.get("world"),t=tr().find(e=>e.id===i);t&&Es.startWorld(t)}else if(Di.get("autostart")){const i=parseInt(Di.get("seed")||"1337",10)|0,t=parseInt(Di.get("mode")||"1",10),e=eu(Di.get("name")||"Test World",i,t);Es.startWorld(e)}
