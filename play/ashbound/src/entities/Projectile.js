(function(AB){
  class Projectile extends AB.Entity{
    constructor(options){super(options.x-6,options.y-4,12,8);Object.assign(this,options);this.team=options.team;this.damage=options.damage;this.knockback=options.knockback||120;this.life=options.life||1.5;this.pierce=options.pierce||0;this.color=options.color||'#fff';this.hitTargets=new Set()}
    update(dt,game){
      this.life-=dt;if(this.life<=0){this.remove=true;return}const ox=this.x,oy=this.y;this.x+=this.vx*dt;this.y+=this.vy*dt;
      const walls=game.room.collisionPlatforms().filter(p=>!p.oneWay);if(walls.some(p=>AB.Collision.segmentIntersectsRect(ox+this.w/2,oy+this.h/2,this.x+this.w/2,this.y+this.h/2,p))){this.remove=true;game.particles.burst(this.x,this.y,this.color,4,70);return}
      if(this.team==='player'){
        for(const enemy of game.room.enemies){if(enemy.dead||this.hitTargets.has(enemy)||!AB.Collision.overlaps(this,enemy))continue;this.hitTargets.add(enemy);const crit=Math.random()<game.player.mods.crit;AB.DamageSystem.damageEnemy(game,enemy,this.damage*(crit?1.75:1),this.vx>=0?1:-1,this.knockback,crit);if(this.pierce--<=0){this.remove=true;break}}
      }else if(!game.player.dead&&AB.Collision.overlaps(this,game.player)){game.damagePlayer(this.damage,this.vx>=0?1:-1,this.knockback);this.remove=true}
    }
    render(ctx){ctx.save();ctx.fillStyle=this.color;ctx.shadowColor=this.color;ctx.shadowBlur=12;ctx.fillRect(this.x,this.y,this.w,this.h);ctx.globalAlpha=.35;ctx.fillRect(this.x-(this.vx>=0?20:-this.w),this.y+2,20,this.h-4);ctx.restore()}
  }
  AB.Projectile=Projectile;
})(window.AB=window.AB||{});
