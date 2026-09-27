(function(AB){
  class WeaponSystem{
    constructor(player){this.player=player;this.attack=null;this.comboIndex=0;this.comboWindow=0;this.attackSerial=0;this.currentHitbox=null}
    reset(){this.attack=null;this.comboIndex=0;this.comboWindow=0;this.currentHitbox=null}
    start(index){const data=AB.WeaponDefinitions.ashSword.combo[index];this.attack={index,data,phase:'startup',timer:data.startup/this.player.mods.attackSpeed,queued:false,facing:this.player.facing,id:++this.attackSerial};this.currentHitbox=null;this.player.vx*=.68}
    update(dt,game){
      this.comboWindow=Math.max(0,this.comboWindow-dt);if(!this.attack){if(game.input.wasPressed('melee')&&!this.player.isRolling){this.start(this.comboWindow>0?this.comboIndex:0)}return}
      const a=this.attack;if(game.input.wasPressed('melee'))a.queued=true;a.timer-=dt;
      if(a.phase==='startup'&&a.timer<=0){a.phase='active';a.timer=a.data.active/this.player.mods.attackSpeed;const x=a.facing>0?this.player.x+this.player.w-2:this.player.x-a.data.range+2;this.currentHitbox=new AB.Hitbox(this.player,x,this.player.y+(this.player.h-a.data.height)/2,a.data.range,a.data.height,a.id);game.audio.play('attack');game.particles.trail(x,this.player.y+5,a.data.range,this.player.h-10,a.data.color)}
      if(a.phase==='active'){
        for(const enemy of game.room.enemies){if(enemy.dead||this.currentHitbox.hitTargets.has(enemy)||!this.currentHitbox.overlaps(enemy))continue;this.currentHitbox.hitTargets.add(enemy);const crit=Math.random()<Math.min(.75,this.player.mods.crit+a.data.critBonus);AB.DamageSystem.damageEnemy(game,enemy,a.data.damage*this.player.mods.melee*(crit?1.75:1),a.facing,a.data.knockback,crit);if(a.index===2)game.camera.shake(8,.13)}
        if(a.timer<=0){a.phase='recovery';a.timer=a.data.recovery/this.player.mods.attackSpeed;this.currentHitbox=null}
      }else if(a.phase==='recovery'&&a.timer<=0){const next=(a.index+1)%3;this.attack=null;this.comboIndex=next;this.comboWindow=a.data.queue;if(a.queued)this.start(next)}
    }
    render(ctx){if(!this.attack)return;const a=this.attack;if(a.phase==='active'){const p=this.player,c=a.index===2?'#ff7044':'#f1dfbd';ctx.save();ctx.strokeStyle=c;ctx.lineWidth=a.index===2?10:7;ctx.globalAlpha=.8;ctx.beginPath();const cx=p.x+p.w/2,cy=p.y+p.h/2,r=a.data.range;ctx.arc(cx,cy,r,a.facing>0?-1.15:Math.PI-1.15,a.facing>0?1.15:Math.PI+1.15,a.facing<0);ctx.stroke();ctx.restore()}}
  }
  AB.WeaponSystem=WeaponSystem;
})(window.AB=window.AB||{});
