(function(AB){
  class UpgradeSystem{
    constructor(rng){this.rng=rng;this.acquired=[]}
    choices(){return this.rng.shuffle(AB.UpgradeDefinitions).slice(0,3)}
    apply(def,player){def.apply(player);const found=this.acquired.find(a=>a.id===def.id);if(found)found.stacks++;else this.acquired.push({id:def.id,name:def.name,stacks:1});player.hp=Math.min(player.hp,player.maxHp)}
  }
  AB.UpgradeSystem=UpgradeSystem;
})(window.AB=window.AB||{});
