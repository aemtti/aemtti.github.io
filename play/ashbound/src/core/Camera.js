(function(AB){
  class Camera{
    constructor(){this.x=0;this.y=0;this.shakeTime=0;this.shakePower=0;this.sx=0;this.sy=0}
    update(dt,player,viewW,viewH,room){const look=player.vx*.22;const tx=Math.max(0,Math.min(room.width-viewW,player.x+player.w/2-viewW/2+look));const ty=Math.max(0,Math.min(room.height-viewH,player.y+player.h/2-viewH*.56));const ease=1-Math.pow(.001,dt);this.x+=(tx-this.x)*ease;this.y+=(ty-this.y)*ease;if(this.shakeTime>0){this.shakeTime-=dt;const p=this.shakePower*Math.max(0,this.shakeTime/.25);this.sx=(Math.random()*2-1)*p;this.sy=(Math.random()*2-1)*p}else{this.sx=this.sy=0}}
    shake(power,duration=.2){this.shakePower=Math.max(this.shakePower,power);this.shakeTime=Math.max(this.shakeTime,duration)}
    begin(ctx){ctx.save();ctx.translate(-Math.round(this.x)+this.sx,-Math.round(this.y)+this.sy)}
    end(ctx){ctx.restore()}
  }
  AB.Camera=Camera;
})(window.AB=window.AB||{});
