// Explicit light/eye subpaths, joined with balance-heuristic MIS in area measure.
// Ideal specular vertices can be traversed but never used as connection endpoints.
struct PathVertex { p:vec3f, n:vec3f, beta:vec3f, color:vec3f, emission:vec3f, mat:u32, id:u32 }
fn asVertex(h:Hit,beta:vec3f)->PathVertex{var v:PathVertex;v.p=h.p;v.n=h.n;v.color=h.albedo;v.emission=h.emission;v.mat=h.mat;v.id=h.id;v.beta=beta;return v;}
fn pathPdf(v:PathVertex,incoming:vec3f,outgoing:vec3f)->f32{
 if(v.mat==3u){return max(dot(v.n,outgoing),0.0)/PI;}
 let n=select(-v.n,v.n,dot(incoming,v.n)<0.0);
 if(v.mat==0u){return max(dot(n,outgoing),0.0)/PI;}
 if(v.mat==1u){return select(0.0,1.0,dot(reflectRay(incoming,n),outgoing)>.9998);}
 let eta=select(u.settings.x,1.0/u.settings.x,dot(incoming,v.n)<0.0);let f=fresnel(-dot(incoming,n),eta);let refracted=refractRay(incoming,n,eta);
 if(dot(refracted,refracted)<.1){return select(0.0,1.0,dot(reflectRay(incoming,n),outgoing)>.9998);}
 if(dot(reflectRay(incoming,n),outgoing)>.9998){return f;}
 return select(0.0,1.0-f,dot(refracted,outgoing)>.9998);
}
fn areaPdf(a:PathVertex,b:PathVertex,incoming:vec3f)->f32{
 let delta=b.p-a.p;let d2=dot(delta,delta);let d=delta/sqrt(d2);
 return pathPdf(a,incoming,d)*abs(dot(b.n,-d))/max(d2,1e-10);
}
fn connectionMIS(path:array<PathVertex,18>,count:u32,chosen:u32)->f32{
 var forwardPdf:array<f32,18>;var reversePdf:array<f32,18>;var densities:array<f32,18>;
 for(var i=0u;i<count;i++){
  if(i+1u<count){var incoming=vec3f(0,-1,0);if(i>0u){incoming=normalize(path[i].p-path[i-1u].p);}forwardPdf[i]=areaPdf(path[i],path[i+1u],incoming);}
  if(i>0u){var previousPosition=u.eye.xyz;if(i+1u<count){previousPosition=path[i+1u].p;}reversePdf[i]=areaPdf(path[i],path[i-1u],normalize(path[i].p-previousPosition));}
 }
 var highest=-1e30;
 for(var split=0u;split<count;split++){
  var eligible=true;var logPdf=0.0;
  if(split>0u){eligible=path[split].mat==0u&&(split==1u||path[split-1u].mat==0u);logPdf=log(1.0/1.04);}
  if(eligible){
   for(var j=0u;j<count;j++){
    if(split>=2u&&j+1u<split){let p=forwardPdf[j];if(p<=0.0){eligible=false;}logPdf+=log(max(p,1e-30));}
    if(j>split){let p=reversePdf[j];if(p<=0.0){eligible=false;}logPdf+=log(max(p,1e-30));}
   }
  }
  densities[split]=select(-1e30,logPdf,eligible);highest=max(highest,densities[split]);
 }
 var sum=0.0;for(var split=0u;split<count;split++){sum+=exp(densities[split]-highest);}
 return exp(densities[chosen]-highest)/max(sum,1e-20);
}
fn scatterVertex(h:Hit,incoming:vec3f,lightSide:bool)->vec4f{
 let n=select(-h.n,h.n,dot(incoming,h.n)<0.0);
 if(h.mat==0u){return vec4f(cosineDirection(n),1);}
 if(h.mat==1u){return vec4f(reflectRay(incoming,n),1);}
 let entering=dot(incoming,h.n)<0.0;let eta=select(u.settings.x,1.0/u.settings.x,entering);let f=fresnel(-dot(incoming,n),eta);let d=refractRay(incoming,n,eta);
 if(dot(d,d)<.1||rand()<f){return vec4f(reflectRay(incoming,n),1);}
 // Radiance and importance transport differ across refractive interfaces.
 return vec4f(d,select(eta*eta,1.0,lightSide));
}
fn traceBidirectional(uv:vec2f)->vec3f{
 var lv:array<PathVertex,18>;var ev:array<PathVertex,18>;var lcount=1u;var ecount=0u;var rays=0u;
 var source:PathVertex;source.p=sampleLight(vec2f(rand(),rand()));source.n=vec3f(0,-1,0);source.mat=3u;source.id=30u;source.emission=lightEmission();source.beta=lightEmission()*1.04;lv[0]=source;
 var ro=source.p;var rd=cosineDirection(source.n);var beta=source.beta*PI;
 for(var k=0u;k<16u;k++){
  if(k+1u>=u32(u.res.w)){break;}let h=intersect(ro+rd*EPS*2.0,rd);rays++;if(h.t>1e4||h.mat==3u){break;}lv[lcount]=asVertex(h,beta);lcount++;
  let scatter=scatterVertex(h,rd,true);beta*=h.albedo*scatter.w;rd=scatter.xyz;ro=h.p;
 }
 ro=u.eye.xyz;rd=normalize(u.forward.xyz+u.right.xyz*uv.x*u.eye.w*u.right.w+u.up.xyz*uv.y*u.eye.w);beta=vec3f(1);var result=vec3f(0);
 for(var k=0u;k<16u;k++){
  if(k>=u32(u.res.w)){break;}let h=intersect(ro,rd);rays++;if(h.t>1e4){result+=beta*environment(rd);break;}
  ev[ecount]=asVertex(h,beta);ecount++;
  if(luminance(h.emission)>0.0){var weight=1.0;if(h.id==30u&&ecount>1u){var path:array<PathVertex,18>;for(var j=0u;j<ecount;j++){path[j]=ev[ecount-1u-j];}weight=connectionMIS(path,ecount,0u);}result+=beta*h.emission*weight;if(h.mat==3u){break;}}
  let scatter=scatterVertex(h,rd,false);beta*=h.albedo*scatter.w;rd=scatter.xyz;ro=h.p+rd*EPS*2.0;
 }
 for(var t=0u;t<ecount;t++){
  let eye=ev[t];if(eye.mat!=0u){continue;}
  // Choose one light vertex and compensate its selection probability. This
  // keeps every connection strategy available without a quadratic per-pixel cost.
  let s=min(u32(rand()*f32(lcount)),lcount-1u);let light=lv[s];if(light.mat!=0u&&s>0u){continue;}
  if(s+t+1u>u32(u.res.w)){continue;}
  let delta=light.p-eye.p;let dist2=dot(delta,delta);if(dist2<1e-7){continue;}let d=delta/sqrt(dist2);
  var eyePrevious=u.eye.xyz;if(t>0u){eyePrevious=ev[t-1u].p;}let en=select(-eye.n,eye.n,dot(eyePrevious-eye.p,eye.n)>0.0);
  var ln=light.n;if(s>0u){ln=select(-light.n,light.n,dot(lv[s-1u].p-light.p,light.n)>0.0);}
  let ce=max(dot(en,d),0.0);let cl=max(dot(ln,-d),0.0);if(ce<=0.0||cl<=0.0){continue;}
  rays++;if(!visible(eye.p+en*EPS*2.0,light.p+ln*EPS*2.0)){continue;}
  var path:array<PathVertex,18>;var count=0u;for(var j=0u;j<=s;j++){path[count]=lv[j];count++;}for(var j=0u;j<=t;j++){path[count]=ev[t-j];count++;}
  let weight=connectionMIS(path,count,s+1u);let lb=select(light.color/PI,vec3f(1),s==0u);
  result+=eye.beta*eye.color/PI*light.beta*lb*(ce*cl/dist2)*weight*f32(lcount);
 }
 atomicAdd(&counters[0],rays);return max(result,vec3f(0));
}

