(function(AB){
  class ParticleSystem{
    constructor(){this.particles=[];this.texts=[];this.trails=[]}
    burst(x,y,color,count=10,speed=180){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=speed*(.25+Math.random()*.75),life=.25+Math.random()*.35;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,max:life,size:2+Math.random()*5,color})}}
    dust(x,y){for(let i=0;i<7;i++)this.particles.push({x:x+(Math.random()-.5)*25,y,vx:(Math.random()-.5)*80,vy:-30-Math.random()*60,life:.32,max:.32,size:4+Math.random()*7,color:'#a99082'})}
    damageText(x,y,amount,crit=false){this.texts.push({x,y,text:String(Math.round(amount)),life:.72,max:.72,crit})}
    trail(x,y,w,h,color){this.trails.push({x,y,w,h,color,life:.16,max:.16})}
    update(dt){for(const p of this.particles){p.life-=dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=280*dt;p.vx*=Math.pow(.05,dt)}for(const t of this.texts){t.life-=dt;t.y-=45*dt}for(const t of this.trails)t.life-=dt;this.particles=this.particles.filter(p=>p.life>0);this.texts=this.texts.filter(t=>t.life>0);this.trails=this.trails.filter(t=>t.life>0)}
    render(ctx){for(const t of this.trails){ctx.globalAlpha=t.life/t.max*.45;ctx.fillStyle=t.color;ctx.fillRect(t.x,t.y,t.w,t.h)}ctx.globalAlpha=1;for(const p of this.particles){ctx.globalAlpha=Math.max(0,p.life/p.max);ctx.fillStyle=p.color;ctx.fillRect(p.x-p.size/2,p.y-p.size/2,p.size,p.size)}ctx.globalAlpha=1;for(const t of this.texts){ctx.globalAlpha=Math.min(1,t.life*3);ctx.fillStyle=t.crit?'#ffe078':'#f5eee2';ctx.strokeStyle='#181116';ctx.lineWidth=3;ctx.font=`${t.crit?'900 24':'800 17'}px Segoe UI`;ctx.strokeText(t.text,t.x,t.y);ctx.fillText(t.text,t.x,t.y)}ctx.globalAlpha=1}
    clear(){this.particles.length=this.texts.length=this.trails.length=0}
  }
  AB.ParticleSystem=ParticleSystem;
})(window.AB=window.AB||{});
