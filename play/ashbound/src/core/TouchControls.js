/* 휴대폰·태블릿 터치 조작 (TouchKit.js 사용).
   왼쪽 화면 스틱 = A/D 이동(아래로 끝까지 = S, 점프와 함께 일방통행 발판 아래로),
   오른쪽 버튼 = 점프(누르는 길이만큼 높이)·검·에너지 볼트·구르기·재 폭탄, 오른쪽 위 = 일시정지.
   키보드와 같은 키 코드를 보내므로 Input/Player 로직은 바뀌지 않는다. 조작 버튼은 플레이 중에만 보인다. */
(function(AB){
  const game=window.ashboundGame;if(!game||!window.TouchKit)return;
  const root=document.documentElement;
  let touched=TouchKit.isTouch();if(touched)root.classList.add('touch');
  const held={KeyA:false,KeyD:false,KeyS:false};
  const hold=(code,on)=>{if(held[code]===on)return;held[code]=on;(on?TouchKit.press:TouchKit.release)(code)};
  const kit=TouchKit.create({
    landscape:true,
    show:'manual',
    sticks:[{id:'move',side:'left',label:'이동',onMove:(x,y,on)=>{
      const side=on&&Math.abs(x)>.28,down=on&&y>.62&&Math.abs(x)<.8;
      hold('KeyA',side&&x<0);hold('KeyD',side&&x>0);hold('KeyS',down);
    }}],
    buttons:[
      {id:'jump',label:'점프',icon:'▲',key:'Space',size:'l',row:0},
      {id:'melee',label:'검',icon:'⚔',key:'KeyJ',row:0},
      {id:'roll',label:'구르기',icon:'↻',key:'KeyL',size:'s',row:1},
      {id:'bolt',label:'볼트',icon:'✦',key:'KeyK',size:'s',row:1},
      {id:'bomb',label:'폭탄',icon:'✹',key:'KeyQ',size:'s',row:1},
      {id:'pause',icon:'❚❚',key:'Escape',tap:true,place:'top-right',size:'s'}
    ]
  });
  AB.touchKit=kit;
  // 세로 화면 안내를 한 번 닫으면 일시정지 후 다시 뜨지 않게 한다.
  const rot=document.querySelector('.tk-rot');let rotDismissed=false;
  if(rot)rot.querySelector('button').addEventListener('click',()=>{rotDismissed=true});
  addEventListener('touchstart',()=>{if(!touched){touched=true;root.classList.add('touch')}},{capture:true,passive:true});
  // 일시정지 화면의 '새 런' 버튼 (키보드 R과 같음)
  const again=document.getElementById('pause-restart-button');
  if(again)again.addEventListener('click',()=>game.restart());
  let shown=null;
  (function sync(){
    const want=touched&&game.state==='playing';
    if(want!==shown){shown=want;kit.show(want);if(!want)held.KeyA=held.KeyD=held.KeyS=false;else if(rotDismissed&&rot)rot.classList.remove('need')}
    requestAnimationFrame(sync);
  })();
})(window.AB=window.AB||{});
