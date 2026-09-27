(function(AB){
  class RoomGenerator{
    constructor(seed){this.rng=new AB.SeededRandom(seed)}
    generate(){
      const count=this.rng.int(7,9),rooms=[];let previous='',enemyOrdinal=0;
      for(let i=0;i<count;i++){
        let type='combat';if(i===0)type='start';else if(i===count-1)type='exit';else if(i===Math.floor(count*.48))type='reward';else if(i===count-2)type='elite';else if(i===2&&this.rng.next()>.45)type='platform';
        let candidates=AB.RoomTemplates.filter(t=>t.id!==previous);const template=this.rng.pick(candidates);previous=template.id;
        const enemyCount=type==='start'||type==='reward'||type==='platform'||type==='exit'?0:type==='elite'?5:this.rng.int(2,4);
        const enemies=[];
        for(let e=0;e<enemyCount;e++){
          const roll=this.rng.next();let enemyType=enemyOrdinal<3?['melee','ranged','charger'][enemyOrdinal]:roll<.45?'melee':roll<.75?'ranged':'charger';if(type==='elite'&&e===0)enemyType='charger';enemyOrdinal++;
          enemies.push({type:enemyType,x:template.spawns[e%template.spawns.length]+this.rng.int(-35,35),elite:type==='elite'&&e===0});
        }
        rooms.push({id:`${i+1}-${template.id}`,index:i,type,templateId:template.id,name:template.name,enemies,cleared:enemyCount===0,visited:false});
      }
      return rooms;
    }
  }
  AB.RoomGenerator=RoomGenerator;
})(window.AB=window.AB||{});
