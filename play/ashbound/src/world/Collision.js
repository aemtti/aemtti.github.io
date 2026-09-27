(function(AB){
  const Collision={
    overlaps(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y},
    segmentIntersectsRect(x1,y1,x2,y2,r){
      const steps=Math.max(1,Math.ceil(Math.hypot(x2-x1,y2-y1)/12));
      for(let i=0;i<=steps;i++){const t=i/steps,x=x1+(x2-x1)*t,y=y1+(y2-y1)*t;if(x>=r.x&&x<=r.x+r.w&&y>=r.y&&y<=r.y+r.h)return true}return false;
    },
    hasLineOfSight(a,b,platforms){const x1=a.x+a.w/2,y1=a.y+a.h*.45,x2=b.x+b.w/2,y2=b.y+b.h*.45;return !platforms.some(p=>!p.oneWay&&this.segmentIntersectsRect(x1,y1,x2,y2,p))},
    resolve(body,dx,dy,platforms,options={}){
      // Substeps keep unusually large deltas from tunnelling through thin walls.
      const steps=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dy))/8)),sx=dx/steps,sy=dy/steps;body.grounded=false;
      for(let step=0;step<steps;step++){
        body.x+=sx;for(const p of platforms){if(p.oneWay)continue;if(this.overlaps(body,p)){if(sx>0)body.x=p.x-body.w;else if(sx<0)body.x=p.x+p.w;body.vx=0;body.hitWall=true}}
        const previousBottom=body.y+body.h;body.y+=sy;
        for(const p of platforms){
          if(p.oneWay&&(options.dropThrough||sy<0||previousBottom>p.y+5))continue;
          if(this.overlaps(body,p)){
            if(sy>=0&&previousBottom<=p.y+8){body.y=p.y-body.h;body.vy=0;body.grounded=true;body.ground=p}
            else if(!p.oneWay&&sy<0){body.y=p.y+p.h;body.vy=0}
          }
        }
      }
    }
  };
  AB.Collision=Collision;
})(window.AB=window.AB||{});
