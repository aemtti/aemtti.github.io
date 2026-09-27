(function(AB){
  class Entity{
    constructor(x,y,w,h){this.x=x;this.y=y;this.w=w;this.h=h;this.vx=0;this.vy=0;this.grounded=false;this.dead=false;this.remove=false;this.flash=0;this.hitWall=false}
    center(){return{x:this.x+this.w/2,y:this.y+this.h/2}}
    updateTimers(dt){this.flash=Math.max(0,this.flash-dt)}
  }
  AB.Entity=Entity;
})(window.AB=window.AB||{});
