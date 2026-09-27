(function(AB){
  class Hitbox{
    constructor(owner,x,y,w,h,attackId){Object.assign(this,{owner,x,y,w,h,attackId});this.hitTargets=new Set();this.active=true}
    overlaps(target){return this.active&&AB.Collision.overlaps(this,target)}
  }
  AB.Hitbox=Hitbox;
})(window.AB=window.AB||{});
