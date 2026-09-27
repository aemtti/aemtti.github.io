(function(AB){
  class RunManager{
    constructor(seed){this.seed=String(seed);this.elapsed=0;this.roomIndex=0;this.kills=0;this.gold=0;this.roomsCleared=0}
    tick(dt){this.elapsed+=dt}
    snapshot(upgrades){return{room:this.roomIndex+1,kills:this.kills,gold:this.gold,time:this.elapsed,upgrades:upgrades.acquired.reduce((n,u)=>n+u.stacks,0)}}
  }
  AB.RunManager=RunManager;
  // Deliberately separate from per-run data so permanent growth can be added later.
  AB.MetaProgress={version:1,totalRuns:0,bestRoom:0};
})(window.AB=window.AB||{});
