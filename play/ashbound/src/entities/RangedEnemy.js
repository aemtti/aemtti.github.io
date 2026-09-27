(function(AB){
  class RangedEnemy extends AB.Enemy{
    constructor(x,y,elite){super(x,y,'ranged',elite)}
    update(dt,game){
      if(this.commonUpdate(dt,game))return;const p=game.player,dx=p.x-this.x,dist=Math.abs(dx),sight=dist<this.def.detect&&AB.Collision.hasLineOfSight(this,p,game.room.platforms);this.facing=dx>=0?1:-1;if(sight)this.seen=true;if(dist>this.def.detect*1.3)this.seen=false;
      switch(this.state){
        case'idle':this.vx=0;if(this.seen)this.setState('chase');break;
        case'chase':this.vx=dist<this.def.idealRange*.7?-this.facing*this.def.speed:dist>this.def.idealRange*1.15?this.facing*this.def.speed:0;if(sight&&dist>170&&Math.abs(this.vx)<1)this.setState('windup',this.def.windup);break;
        case'windup':this.vx=0;if(!sight){this.setState('chase');break}if(this.stateTime<=0){const c=this.center(),pc=p.center(),a=Math.atan2(pc.y-c.y,pc.x-c.x);game.projectiles.push(new AB.Projectile({x:c.x,y:c.y,vx:Math.cos(a)*390,vy:Math.sin(a)*390,team:'enemy',damage:this.def.damage,knockback:220,life:2.2,color:'#d989ef'}));game.audio.play('shoot');this.setState('recover',this.def.recover)}break;
        case'recover':this.vx=0;if(this.stateTime<=0)this.setState('chase');break;
      }this.applyPhysics(dt,game);
    }
    render(ctx,game){super.render(ctx,game);if(this.state==='windup'){const c=this.center(),p=game.player.center();ctx.save();ctx.strokeStyle='rgba(226,129,245,.55)';ctx.setLineDash([8,8]);ctx.beginPath();ctx.moveTo(c.x,c.y);ctx.lineTo(p.x,p.y);ctx.stroke();ctx.restore()}}
  }
  AB.RangedEnemy=RangedEnemy;
})(window.AB=window.AB||{});
