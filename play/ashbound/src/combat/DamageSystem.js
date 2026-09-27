(function(AB){
  AB.DamageSystem={
    damageEnemy(game,enemy,amount,direction,knockback,crit=false){if(enemy.dead)return;enemy.takeDamage(game,amount,direction,knockback,crit)},
    damagePlayer(game,amount,direction,knockback){game.damagePlayer(amount,direction,knockback)}
  };
})(window.AB=window.AB||{});
