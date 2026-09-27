(function(){
  const canvas=document.getElementById('game'),game=new AB.Game(canvas);window.ashboundGame=game;
  const seedInput=document.getElementById('seed-input');
  document.getElementById('start-button').addEventListener('click',()=>game.start(seedInput.value));
  seedInput.addEventListener('keydown',e=>{if(e.key==='Enter')game.start(seedInput.value)});
  document.getElementById('resume-button').addEventListener('click',()=>game.togglePause());
  document.getElementById('restart-button').addEventListener('click',()=>game.restart());
  window.addEventListener('keydown',e=>{
    if(e.code==='Escape'){e.preventDefault();if(game.state==='playing'||game.state==='paused')game.togglePause()}
    if(e.code==='F2'){e.preventDefault();game.debug=!game.debug}
    if(e.code==='KeyR'&&!e.repeat&&['playing','paused','upgrade','dead','victory'].includes(game.state)){e.preventDefault();game.restart()}
  });
})();
