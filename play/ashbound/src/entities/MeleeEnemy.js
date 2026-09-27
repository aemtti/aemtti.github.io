(function(AB){
  class MeleeEnemy extends AB.Enemy{
    constructor(x,y,elite){super(x,y,'melee',elite)}
    update(dt,game){
      if(this.commonUpdate(dt,game))return;const p=game.player,dx=p.x-this.x,dist=Math.abs(dx);if(dist<this.def.detect)this.seen=true;if(dist>this.def.detect*1.35)this.seen=false;this.facing=dx>=0?1:-1;
      switch(this.state){
        case'idle':case'patrol':this.vx=this.seen?this.facing*this.def.speed:this.patrolDir*this.def.speed*.28;if(this.seen)this.setState('chase');break;
        case'chase':this.vx=this.facing*this.def.speed*(this.elite?1.16:1);if(dist<this.def.attackRange)this.setState('windup',this.def.windup);break;
        case'windup':this.vx*=Math.pow(.02,dt);if(this.stateTime<=0)this.setState('attack',.15);break;
        case'attack':this.vx=this.facing*145;if(!this.attackHit){this.attackHit=true;const box={x:this.facing>0?this.x+this.w:this.x-50,y:this.y+8,w:50,h:45};if(AB.Collision.overlaps(box,p))game.damagePlayer(this.def.damage*(this.elite?1.3:1),this.facing,260)}if(this.stateTime<=0)this.setState('recover',this.def.recover);break;
        case'recover':this.vx*=Math.pow(.025,dt);if(this.stateTime<=0)this.setState('chase');break;
      }this.applyPhysics(dt,game);
    }
    render(ctx,game){super.render(ctx,game);if(this.state==='windup'||this.state==='attack'){ctx.fillStyle='rgba(255,91,72,.22)';ctx.fillRect(this.facing>0?this.x+this.w:this.x-58,this.y+7,58,48)}}
  }
  AB.MeleeEnemy=MeleeEnemy;
})(window.AB=window.AB||{});
