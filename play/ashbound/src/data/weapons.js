(function(AB){
  AB.Balance={
    physics:{gravity:1850,maxFall:920,groundAccel:2600,airAccel:1500,decel:3000,maxSpeed:285,jumpSpeed:650,coyote:0.11,jumpBuffer:0.12},
    player:{width:34,height:56,maxHp:100,hurtInvuln:0.72,rollSpeed:610,rollDuration:0.28,rollInvuln:0.21,rollCooldown:0.72},
    world:{width:1760,height:720,floorY:640,doorWidth:54}
  };
  AB.WeaponDefinitions={
    ashSword:{name:'녹슨 장검',type:'melee',combo:[
      {damage:18,startup:.07,active:.10,recovery:.16,range:66,height:44,knockback:235,critBonus:.08,queue:.25,color:'#e9e0ce'},
      {damage:21,startup:.08,active:.11,recovery:.17,range:72,height:48,knockback:255,critBonus:.10,queue:.27,color:'#f4c56c'},
      {damage:34,startup:.13,active:.13,recovery:.27,range:82,height:62,knockback:410,critBonus:.16,queue:.30,color:'#ff7548'}
    ]},
    emberBolt:{name:'잿빛 발사기',type:'ranged',damage:16,speed:780,lifetime:1.25,cooldown:.48,knockback:170,color:'#69e0d2'},
    ashBomb:{name:'재 폭탄',type:'skill',damage:42,fuse:.72,radius:135,cooldown:6.5,knockback:540,color:'#ff6138'}
  };
})(window.AB=window.AB||{});
