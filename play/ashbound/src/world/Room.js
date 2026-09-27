(function(AB){
  const TYPE_NAMES={start:'시작 방',combat:'전투 방',platform:'이동 방',reward:'보상 방',elite:'정예 전투 방',exit:'출구 방'};
  class Room{
    constructor(spec){
      this.spec=spec;this.width=AB.Balance.world.width;this.height=AB.Balance.world.height;this.type=spec.type;this.name=spec.name;this.index=spec.index;this.id=spec.id;this.enemies=[];this.items=[];this.entered=false;this.rewardClaimed=false;
      const t=AB.RoomTemplates.find(v=>v.id===spec.templateId);this.platforms=t.platforms.map(p=>({...p}));this.platforms.push({x:-40,y:0,w:40,h:this.height,oneWay:false});this.door={x:this.width-42,y:494,w:42,h:146};
      this.decor=Array.from({length:18},(_,i)=>({x:(i*137+spec.index*73)%this.width,y:90+(i*97)%380,r:12+(i*19)%48}));
    }
    get locked(){return (this.type==='combat'||this.type==='elite')&&this.enemies.some(e=>!e.dead)}
    collisionPlatforms(){const p=this.platforms.slice();if(this.locked)p.push({...this.door,oneWay:false});return p}
    enter(game){
      this.entered=true;this.spec.visited=true;this.enemies=[];this.items=[];
      for(const data of this.spec.enemies){const enemy=game.createEnemy(data.type,data.x,AB.Balance.world.floorY-56,data.elite);this.enemies.push(enemy)}
      if(this.type==='reward'&&!this.rewardClaimed&&game.state==='playing')game.offerUpgrades();
      if(this.type==='exit')game.announce('재의 관문',1.1);
    }
    update(dt,game){
      for(const enemy of this.enemies)enemy.update(dt,game);
      for(const item of this.items){item.life-=dt;item.vy+=900*dt;item.y+=item.vy*dt;if(item.y>602){item.y=602;item.vy*=-.25}if(AB.Collision.overlaps(game.player,{x:item.x-10,y:item.y-10,w:20,h:20})){item.dead=true;game.run.gold+=item.value;game.audio.play('pickup');game.particles.burst(item.x,item.y,'#f4c56c',8,120);game.updateHud()}}
      this.enemies=this.enemies.filter(e=>!e.remove);this.items=this.items.filter(i=>!i.dead&&i.life>0);
      if(!this.locked&&!this.spec.cleared){this.spec.cleared=true;game.audio.play('door');game.announce('봉인이 풀렸습니다',.9)}
    }
    render(ctx,game){
      const g=ctx.createLinearGradient(0,0,0,this.height);g.addColorStop(0,'#111622');g.addColorStop(.7,'#1c1a20');g.addColorStop(1,'#292027');ctx.fillStyle=g;ctx.fillRect(0,0,this.width,this.height);
      ctx.globalAlpha=.13;ctx.fillStyle='#e9673d';for(const d of this.decor){ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,Math.PI*2);ctx.fill()}ctx.globalAlpha=1;
      for(let x=60;x<this.width;x+=185){ctx.fillStyle='#19171d';ctx.fillRect(x,130,24,510);ctx.fillStyle='#2a2327';ctx.fillRect(x+5,150,5,450)}
      for(const p of this.platforms){if(p.y>=640){ctx.fillStyle='#24242b';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#59403d';ctx.fillRect(p.x,p.y,p.w,7)}else{ctx.fillStyle='#38343b';ctx.fillRect(p.x,p.y,p.w,p.h);ctx.fillStyle='#9a6250';ctx.fillRect(p.x,p.y,p.w,4);ctx.fillStyle='#1d1d23';for(let x=p.x+18;x<p.x+p.w;x+=44)ctx.fillRect(x,p.y+5,6,p.h-5)}}
      this.renderDoor(ctx);
      for(const item of this.items){ctx.save();ctx.translate(item.x,item.y);ctx.rotate(item.life*2);ctx.fillStyle='#f4c56c';ctx.shadowColor='#f4c56c';ctx.shadowBlur=14;ctx.fillRect(-7,-7,14,14);ctx.restore()}
      for(const enemy of this.enemies)enemy.render(ctx,game);
      ctx.fillStyle='rgba(255,255,255,.35)';ctx.font='700 12px Segoe UI';ctx.fillText(`${String(this.index+1).padStart(2,'0')} · ${this.name}`,36,52);
    }
    renderDoor(ctx){const x=this.door.x,y=this.door.y;ctx.fillStyle='#19191e';ctx.fillRect(x-8,y-18,50,164);ctx.strokeStyle=this.locked?'#f14d45':'#69e0d2';ctx.lineWidth=3;ctx.strokeRect(x,y,30,146);ctx.fillStyle=this.locked?'rgba(241,77,69,.22)':'rgba(105,224,210,.18)';ctx.fillRect(x,y,30,146);ctx.fillStyle=this.locked?'#f14d45':'#69e0d2';ctx.fillRect(x+12,y+58,6,25)}
  }
  AB.Room=Room;AB.RoomTypeNames=TYPE_NAMES;
})(window.AB=window.AB||{});
