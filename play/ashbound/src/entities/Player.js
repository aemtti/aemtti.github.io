(function(AB){
  class Player extends AB.Entity{
    constructor(x,y){
      const b=AB.Balance.player;super(x,y,b.width,b.height);this.maxHp=b.maxHp;this.hp=this.maxHp;this.facing=1;this.coyote=0;this.jumpBuffer=0;this.hurtInvuln=0;this.rollTimer=0;this.rollCooldown=0;this.rollDirection=1;this.rangedCooldown=0;this.bombCooldown=0;this.weapon=new AB.WeaponSystem(this);this.mods={melee:1,ranged:1,bomb:1,speed:1,attackSpeed:1,rollCooldown:1,crit:.05,killHeal:0,pierce:0};this.dropTimer=0;this.wasGrounded=false;
    }
    get isRolling(){return this.rollTimer>0}
    get invulnerable(){const b=AB.Balance.player;return this.hurtInvuln>0||(this.rollTimer>b.rollDuration-b.rollInvuln)}
    update(dt,game){
      if(this.dead)return;const input=game.input,bp=AB.Balance.physics,b=AB.Balance.player;this.updateTimers(dt);this.hurtInvuln=Math.max(0,this.hurtInvuln-dt);this.rollCooldown=Math.max(0,this.rollCooldown-dt);this.rangedCooldown=Math.max(0,this.rangedCooldown-dt);this.bombCooldown=Math.max(0,this.bombCooldown-dt);this.dropTimer=Math.max(0,this.dropTimer-dt);this.jumpBuffer=Math.max(0,this.jumpBuffer-dt);this.coyote=Math.max(0,this.coyote-dt);
      if(input.wasPressed('jump'))this.jumpBuffer=bp.jumpBuffer;if(this.grounded)this.coyote=bp.coyote;
      const axis=(input.isDown('right')?1:0)-(input.isDown('left')?1:0);if(axis)this.facing=axis;
      if(input.wasPressed('roll')&&this.rollCooldown<=0&&!this.weapon.attack){this.rollDirection=axis||this.facing;this.rollTimer=b.rollDuration;this.rollCooldown=b.rollCooldown*this.mods.rollCooldown;this.weapon.reset();game.audio.play('roll')}
      if(this.isRolling){this.rollTimer=Math.max(0,this.rollTimer-dt);this.vx=this.rollDirection*b.rollSpeed;this.vy*=Math.pow(.06,dt);if(Math.random()<.55)game.particles.trail(this.x,this.y,this.w,this.h,'#d8e2e3')}
      else{
        const accel=this.grounded?bp.groundAccel:bp.airAccel,target=axis*bp.maxSpeed*this.mods.speed;if(axis)this.vx+=(target-this.vx)*Math.min(1,accel*dt/Math.max(1,bp.maxSpeed));else if(this.grounded)this.vx+=(0-this.vx)*Math.min(1,bp.decel*dt/Math.max(1,bp.maxSpeed));
        if(input.isDown('down')&&input.wasPressed('jump')){this.dropTimer=.18;this.jumpBuffer=0;this.coyote=0;this.grounded=false;this.y+=5}
        else if(this.jumpBuffer>0&&this.coyote>0){this.vy=-bp.jumpSpeed;this.jumpBuffer=0;this.coyote=0;this.grounded=false;game.audio.play('jump');game.particles.dust(this.x+this.w/2,this.y+this.h)}
        if(input.wasReleased('jump')&&this.vy<0)this.vy*=.46;
        this.weapon.update(dt,game);this.handleActions(game);
      }
      this.vy=Math.min(bp.maxFall,this.vy+bp.gravity*dt);this.wasGrounded=this.grounded;AB.Collision.resolve(this,this.vx*dt,this.vy*dt,game.room.collisionPlatforms(),{dropThrough:this.dropTimer>0});if(!this.wasGrounded&&this.grounded)game.particles.dust(this.x+this.w/2,this.y+this.h);
      this.x=Math.max(0,this.x);if(this.y>game.room.height+120)game.killPlayer();
    }
    handleActions(game){
      if(game.input.wasPressed('ranged')&&this.rangedCooldown<=0){const w=AB.WeaponDefinitions.emberBolt,c=this.center();this.rangedCooldown=w.cooldown/this.mods.attackSpeed;game.projectiles.push(new AB.Projectile({x:c.x+this.facing*18,y:c.y-5,vx:this.facing*w.speed,vy:0,team:'player',damage:w.damage*this.mods.ranged,knockback:w.knockback,life:w.lifetime,pierce:this.mods.pierce,color:w.color}));game.audio.play('shoot');game.particles.burst(c.x+this.facing*22,c.y,w.color,5,90)}
      if(game.input.wasPressed('bomb')&&this.bombCooldown<=0){const w=AB.WeaponDefinitions.ashBomb;this.bombCooldown=w.cooldown;game.bombs.push({x:this.x+this.w/2,y:this.y+this.h-8,vx:this.facing*180,vy:-280,fuse:w.fuse,radius:w.radius,damage:w.damage*this.mods.bomb,dead:false});game.audio.play('shoot')}
    }
    render(ctx){
      const flicker=this.hurtInvuln>0&&Math.floor(this.hurtInvuln*18)%2===0;if(flicker)return;ctx.save();if(this.isRolling){ctx.translate(this.x+this.w/2,this.y+this.h/2);ctx.rotate(this.rollDirection*(AB.Balance.player.rollDuration-this.rollTimer)*18);ctx.translate(-this.w/2,-this.h/2)}else ctx.translate(this.x,this.y);
      ctx.fillStyle=this.flash>0?'#fff':'#d9d6cf';ctx.fillRect(5,5,this.w-10,this.h-5);ctx.fillStyle='#242832';ctx.fillRect(2,30,this.w-4,26);ctx.fillStyle='#ff623c';ctx.fillRect(this.facing>0?22:5,12,7,8);ctx.fillStyle='#77433b';ctx.fillRect(this.facing>0?0:24,23,10,29);ctx.restore();this.weapon.render(ctx);
    }
  }
  AB.Player=Player;
})(window.AB=window.AB||{});
