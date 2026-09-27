(function(AB){
  const u=(id,name,description,accent,apply)=>({id,name,description,accent,apply});
  AB.UpgradeDefinitions=[
    u('vitality','단단한 심지','최대 체력 +25, 즉시 25 회복','#ff646e',p=>{p.maxHp+=25;p.hp=Math.min(p.maxHp,p.hp+25)}),
    u('melee','톱니 잿불','근접 피해 +18%','#ff8a54',p=>p.mods.melee*=1.18),
    u('ranged','청록 화약','원거리 피해 +22%','#69e0d2',p=>p.mods.ranged*=1.22),
    u('speed','바람 먹는 장화','이동 속도 +10%','#acd1ff',p=>p.mods.speed*=1.10),
    u('haste','빠른 손목','공격 속도 +12%','#f4c56c',p=>p.mods.attackSpeed*=1.12),
    u('roll','무연 보폭','구르기 재사용 -14%','#d6d8e1',p=>p.mods.rollCooldown*=.86),
    u('bomb','화산재 핵','폭탄 피해 +28%','#ff6138',p=>p.mods.bomb*=1.28),
    u('crit','정밀한 균열','치명타 확률 +7%','#ffe090',p=>p.mods.crit+=.07),
    u('heal','피의 불씨','적 처치 시 체력 4 회복','#df4b64',p=>p.mods.killHeal+=4),
    u('pierce','관통 결정','투사체 관통 +1','#7ff7e9',p=>p.mods.pierce+=1)
  ];
})(window.AB=window.AB||{});
