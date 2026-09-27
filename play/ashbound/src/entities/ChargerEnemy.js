(function(AB){
  class ChargerEnemy extends AB.Enemy{
    constructor(x,y,elite){super(x,y,'charger',elite);this.chargeDir=-1}
    update(dt,game){
      if(this.commonUpdate(dt,game))return;const p=game.player,dx=p.x-this.x,dist=Math.abs(dx);this.facing=dx>=0?1:-1;
      switch(this.state){
        case'idle':this.vx=0;if(dist<this.def.detect)this.setState('alert',.25);break;
        case'alert':this.vx=0;if(this.stateTime<=0)this.setState('windup',this.def.windup);break;
        case'windup':this.vx=0;if(this.stateTime<=0){this.chargeDir=this.facing;this.setState('attack',.82)}break;
        case'attack':this.vx=this.chargeDir*this.def.chargeSpeed*(this.elite?1.12:1);if(!this.attackHit&&AB.Collision.overlaps(this,p)){this.attackHit=true;game.damagePlayer(this.def.damage*(this.elite?1.25:1),this.chargeDir,480)}break;
        case'recover':this.vx*=Math.pow(.01,dt);if(this.stateTime<=0)this.setState('idle');break;
      }
      this.applyPhysics(dt,game);if(this.state==='attack'&&(this.hitWall||this.stateTime<=0)){game.camera.shake(8,.14);game.particles.burst(this.x+this.w/2,this.y+this.h*.7,'#e59345',12,180);this.setState(this.hitWall?'stunned':'recover',this.hitWall?1.25:this.def.recover)}
    }
    render(ctx,game){super.render(ctx,game);if(this.state==='windup'){ctx.fillStyle='rgba(255,116,55,.17)';ctx.fillRect(this.facing>0?this.x+this.w:this.x-260,this.y+17,260,28)}if(this.state==='attack'){ctx.fillStyle='rgba(255,159,72,.28)';ctx.fillRect(this.chargeDir>0?this.x-60:this.x+this.w,this.y+10,60,38)}}
  }
  AB.ChargerEnemy=ChargerEnemy;
})(window.AB=window.AB||{});
