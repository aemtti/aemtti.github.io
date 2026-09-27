(function(AB){
  class Enemy extends AB.Entity{
    constructor(x,y,type,elite=false){
      const def=AB.EnemyDefinitions[type];super(x,y,38,56);this.type=type;this.def=def;this.elite=elite;this.maxHp=def.hp*(elite?1.75:1);this.hp=this.maxHp;this.state='idle';this.stateTime=.2;this.facing=-1;this.attackHit=false;this.stun=0;this.patrolDir=Math.random()>.5?1:-1;this.seen=false;this.contactCooldown=0;
    }
    setState(state,time=0){this.state=state;this.stateTime=time;this.attackHit=false}
    commonUpdate(dt,game){
      this.updateTimers(dt);this.stateTime-=dt;this.stun=Math.max(0,this.stun-dt);this.contactCooldown=Math.max(0,this.contactCooldown-dt);this.hitWall=false;
      if(this.dead){this.vy+=AB.Balance.physics.gravity*dt;AB.Collision.resolve(this,this.vx*dt,this.vy*dt,game.room.collisionPlatforms());this.vx*=Math.pow(.02,dt);if(this.stateTime<=0)this.remove=true;return true}
      if(this.state==='hurt'){this.vy+=AB.Balance.physics.gravity*dt;AB.Collision.resolve(this,this.vx*dt,this.vy*dt,game.room.collisionPlatforms());this.vx*=Math.pow(.04,dt);if(this.stateTime<=0)this.setState('chase');return true}
      if(this.state==='stunned'){this.vy+=AB.Balance.physics.gravity*dt;AB.Collision.resolve(this,this.vx*dt,this.vy*dt,game.room.collisionPlatforms());this.vx*=Math.pow(.02,dt);if(this.stateTime<=0)this.setState('alert',.25);return true}
      return false;
    }
    applyPhysics(dt,game){this.vy=Math.min(AB.Balance.physics.maxFall,this.vy+AB.Balance.physics.gravity*dt);AB.Collision.resolve(this,this.vx*dt,this.vy*dt,game.room.collisionPlatforms());if(this.y>game.room.height+120)this.die(game)}
    takeDamage(game,amount,direction,knockback,crit){
      if(this.dead)return;this.hp-=amount;this.flash=.11;this.vx=direction*knockback;this.vy=-Math.min(320,knockback*.65);game.particles.damageText(this.x+this.w/2,this.y-5,amount,crit);game.particles.burst(this.x+this.w/2,this.y+this.h/2,crit?'#ffe078':'#f2e5d1',crit?11:6,170);game.audio.play('hit');
      if(this.hp<=0)this.die(game);else this.setState('hurt',crit?.28:.18);
    }
    die(game){if(this.dead)return;this.dead=true;this.setState('dead',.55);this.vx*=.65;this.vy=-170;game.run.kills++;const [a,b]=this.def.gold;const value=game.rng.int(a,b)*(this.elite?2:1);game.room.items.push({x:this.x+this.w/2,y:this.y+12,vy:-180,life:9,value,dead:false});game.particles.burst(this.x+this.w/2,this.y+this.h/2,this.def.color,this.elite?28:17,260);game.audio.play('death');game.camera.shake(this.elite?11:6,.18);if(game.player.mods.killHeal){game.player.hp=Math.min(game.player.maxHp,game.player.hp+game.player.mods.killHeal)}game.updateHud()}
    separate(other){if(other===this||other.dead||this.dead)return;if(AB.Collision.overlaps(this,other)){const overlap=Math.min(this.x+this.w-other.x,other.x+other.w-this.x);const dir=this.x<other.x?-1:1;this.x+=dir*overlap*.18}}
    render(ctx){
      ctx.save();const bob=this.state==='windup'?Math.sin(this.stateTime*35)*2:0;ctx.translate(0,bob);if(this.dead)ctx.globalAlpha=Math.max(0,this.stateTime/.55);if(this.flash>0)ctx.fillStyle='#fff';else ctx.fillStyle=this.def.color;
      ctx.fillRect(this.x+4,this.y+9,this.w-8,this.h-9);ctx.fillStyle='#17151a';ctx.fillRect(this.x+9+(this.facing>0?8:0),this.y+19,8,5);ctx.fillStyle=this.elite?'#f4c56c':'#2a2329';ctx.fillRect(this.x,this.y+43,this.w,this.h-43);
      if(this.elite){ctx.strokeStyle='#f4c56c';ctx.lineWidth=2;ctx.strokeRect(this.x-4,this.y+5,this.w+8,this.h-1)}
      if(this.state==='windup'||this.state==='alert'){ctx.globalAlpha=.85;ctx.strokeStyle='#ffef9a';ctx.lineWidth=3;ctx.beginPath();ctx.arc(this.x+this.w/2,this.y-10,10+Math.sin(performance.now()*.02)*3,0,Math.PI*2);ctx.stroke()}
      ctx.globalAlpha=1;const ratio=Math.max(0,this.hp/this.maxHp);ctx.fillStyle='#1a171c';ctx.fillRect(this.x,this.y-12,this.w,5);ctx.fillStyle=this.elite?'#f4c56c':'#e25d5a';ctx.fillRect(this.x,this.y-12,this.w*ratio,5);ctx.restore();
    }
  }
  AB.Enemy=Enemy;
})(window.AB=window.AB||{});
