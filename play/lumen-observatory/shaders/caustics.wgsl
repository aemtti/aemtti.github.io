override CAUSTIC_MODE:u32=4u;
struct Photon { primary:vec4f, p:vec2f, flux:vec3f, score:f32, lens:u32, entry:vec3f, exitPoint:vec3f, incoming:vec3f, outgoing:vec3f }
fn zeroPhoton(s:vec4f)->Photon{var p:Photon;p.primary=s;p.score=0.0;p.flux=vec3f(0);return p;}
fn conePdf(d:vec3f,o:vec3f)->f32{
 var pdf=0.0;for(var i=0u;i<2u;i++){let delta=lensCenter(i)-o;let cosMax=sqrt(max(0.0,1.0-pow(lensRadius(i),2.0)/dot(delta,delta)));if(dot(d,normalize(delta))>=cosMax){pdf+=.5/(2.0*PI*(1.0-cosMax));}}return pdf;
}
// Analytic, two-interface spherical glass -> diffuse floor path family.
// The cone-mixture proposal includes both lenses and its full mixture PDF.
fn endpoint(s:vec4f)->Photon{
 var out=zeroPhoton(s);if(u.res.w<3.0){return out;}let origin=sampleLight(s.xy);let index=min(u32(s.z*2.0),1u);out.lens=index;
 let center=lensCenter(index);let radius=lensRadius(index);let axis=normalize(center-origin);let cosMax=sqrt(max(0.0,1.0-radius*radius/dot(center-origin,center-origin)));
 let ct=mix(1.0,cosMax,fract(s.z*2.0));let st=sqrt(max(0.0,1.0-ct*ct));let ph=s.w*2.0*PI;let initial=basis(axis)*vec3f(st*cos(ph),st*sin(ph),ct);
 let entryT=sphereDistance(origin,initial,center,radius);if(entryT>1e4){return out;}let entry=origin+initial*entryT;let n=(entry-center)/radius;
 let eta=1.0/u.settings.x;let d=refractRay(initial,n,eta);if(dot(d,d)<.1){return out;}let f1=1.0-fresnel(-dot(initial,n),eta);
 let exitT=sphereDistance(entry+d*EPS*2.0,d,center,radius);let exitPoint=entry+d*(exitT+EPS*2.0);let en=normalize(exitPoint-center);let outgoing=refractRay(d,-en,u.settings.x);if(dot(outgoing,outgoing)<.1||outgoing.y>=-.001){return out;}
 let f2=1.0-fresnel(dot(d,en),u.settings.x);let floorT=-exitPoint.y/outgoing.y;let floorPoint=exitPoint+floorT*outgoing;if(floorT<0.0||any(abs(floorPoint.xz)>=vec2f(EXTENT*.5))){return out;}
 atomicAdd(&counters[0],2u);
 let pdf=conePdf(initial,origin);let power=lightEmission()*1.04*max(-initial.y,0.0)/max(pdf,1e-8)*f1*f2*pow(lensTint(index),vec3f(exitT+2.0));
 out.p=floorPoint.xz;out.flux=power;out.score=luminance(power);out.entry=entry;out.exitPoint=exitPoint;out.incoming=initial;out.outgoing=outgoing;return out;
}
fn clearSegment(o:vec3f,d:vec3f,limit:f32)->bool{
 for(var i=0u;i<2u;i++){if(sphereDistance(o,d,lensCenter(i),lensRadius(i))<limit){return false;}}
 if(sphereDistance(o,d,vec3f(.65,1.15,-1.48),.98)<limit){return false;}
 if(sphereDistance(o,d,vec3f(-2.0,.41,1.05),.41)<limit){return false;}
 if(sphereDistance(o,d,vec3f(2.15,.24,-.52),.24)<limit){return false;}
 if(sphereDistance(o,d,vec3f(-.25,.20,2.12),.20)<limit){return false;}
 if(sphereDistance(o,d,vec3f(-1.0,.14,-2.22),.14)<limit){return false;}
 for(var i=0u;i<2u;i++){let nn=select(normalize(vec3f(.73,.26,.63)),normalize(vec3f(.15,.93,.33)),i==0u);if(torusHit(o,d,vec3f(0,1.45,0),nn,select(1.91,2.56,i==0u),.027).w<limit){return false;}}
 return true;
}
fn validatePhoton(p:Photon)->Photon{
 if(p.score<=0.0){return p;}var out=p;let origin=sampleLight(p.primary.xy);let end=p.exitPoint+p.outgoing*EPS*3.0;
 atomicAdd(&counters[0],2u);
 if(!clearSegment(origin,p.incoming,distance(origin,p.entry)-EPS*3.0)||!clearSegment(end,p.outgoing,-end.y/p.outgoing.y-EPS*3.0)){out.score=0.0;out.flux=vec3f(0);}
 return out;
}
fn photon(s:vec4f)->Photon{return validatePhoton(endpoint(s));}
fn splat(p:vec2f,c:vec3f){
 let q=(p/EXTENT+.5)*f32(GRID)-.5;let b=vec2i(floor(q));let f=fract(q);
 for(var y=0;y<2;y++){for(var x=0;x<2;x++){let cell=b+vec2i(x,y);if(any(cell<vec2i(0))||any(cell>=vec2i(i32(GRID)))){continue;}
 let w=select(1.0-f.x,f.x,x==1)*select(1.0-f.y,f.y,y==1);let v=vec3u(clamp(c*w*FIXED,vec3f(0),vec3f(1e7)));let idx=(u32(cell.y)*GRID+u32(cell.x))*3u;
 atomicAdd(&photonMap[idx],v.x);atomicAdd(&photonMap[idx+1u],v.y);atomicAdd(&photonMap[idx+2u],v.z);
 }}
}
fn randomPrimary()->vec4f{return vec4f(rand(),rand(),rand(),rand());}
fn mutate(s:vec4f)->vec4f{let scale=exp(mix(log(.0008),log(.08),rand()));return fract(s+vec4f(rand()-.5,rand()-.5,rand()-.5,rand()-.5)*scale+1.0);}
fn fromChain(c:Chain)->Photon{var p:Photon;p.primary=c.primary;p.p=c.point.xy;p.flux=c.flux.xyz;p.score=c.flux.w;p.lens=u32(c.point.z);return p;}
fn toChain(p:Photon)->Chain{var c:Chain;c.primary=p.primary;c.point=vec4f(p.p,f32(p.lens),0);c.flux=vec4f(p.flux,p.score);return c;}
// Numerically invert the refracted endpoint map. Local changes in the receiver
// are pulled back to the same specular branch using a 2 x 2 Newton solve.
fn manifoldProposal(current:Photon)->Photon{
 if(current.score<=0.0){return photon(randomPrimary());}
 let destination=current.p+vec2f(rand()-.5,rand()-.5)*.07;var s=current.primary;var candidate=current;
 for(var j=0u;j<7u;j++){
  candidate=endpoint(s);if(candidate.score<=0.0){return zeroPhoton(s);}let error=candidate.p-destination;if(length(error)<.002){atomicAdd(&counters[5],1u);return validatePhoton(candidate);}
  let h=.00015;let px=endpoint(s+vec4f(0,0,h,0));let py=endpoint(s+vec4f(0,0,0,h));if(px.score<=0.0||py.score<=0.0){return zeroPhoton(s);}
  let dx=(px.p-candidate.p)/h;let dy=(py.p-candidate.p)/h;let det=dx.x*dy.y-dx.y*dy.x;if(abs(det)<.00001){return zeroPhoton(s);}
  let delta=vec2f(dy.y*error.x-dy.x*error.y,-dx.y*error.x+dx.x*error.y)/det;let change=clamp(delta,vec2f(-.025),vec2f(.025));s.z-=change.x;s.w-=change.y;
  if(s.z<f32(current.lens)*.5||s.z>=f32(current.lens+1u)*.5){return zeroPhoton(s);}s.w=fract(s.w+1.0);
 }
 return zeroPhoton(s);
}
fn endpointJacobian(p:Photon)->f32{
 let h=.00015;let a=endpoint(p.primary+vec4f(0,0,h,0));let b=endpoint(p.primary+vec4f(0,0,0,h));if(a.score<=0.0||b.score<=0.0){return 0.0;}let da=(a.p-p.p)/h;let db=(b.p-p.p)/h;return abs(da.x*db.y-da.y*db.x);
}
@compute @workgroup_size(64)
fn caustics(@builtin(global_invocation_id) gid:vec3u){
 let id=gid.x;if(id>=u32(u.flags.y)){return;}seed=hash(id*31u+u32(u.flags.x)*9781u+43897u);let mode=CAUSTIC_MODE;
 if(mode==4u){for(var k=0u;k<4u;k++){let p=photon(randomPrimary());if(p.score>0.0){splat(p.p,p.flux);atomicAdd(&counters[2],1u);}}atomicAdd(&counters[1],4u);return;}
 if(mode!=2u&&mode!=5u){return;}
 // Independent uniform bootstrap estimate of the normalizing constant.
 let bootstrap=photon(randomPrimary());atomicAdd(&counters[6],u32(bootstrap.score*FIXED));atomicAdd(&counters[7],1u);
 var current=fromChain(chains[id]);
 if(u.flags.x<.5){var total=0.0;for(var j=0u;j<8u;j++){let p=photon(randomPrimary());total+=p.score;if(p.score>0.0&&rand()*total<p.score){current=p;}}}
 for(var k=0u;k<4u;k++){
  let large=rand()<.25;var proposed:Photon;var correction=1.0;
  if(large){proposed=photon(randomPrimary());}
  else if(mode==5u){proposed=manifoldProposal(current);if(proposed.score>0.0&&current.score>0.0){let jc=endpointJacobian(current);let jp=endpointJacobian(proposed);correction=jc/max(jp,.00001);if(jc<=0.0){proposed.score=0.0;}}}
  else {proposed=photon(mutate(current.primary));}
  var acceptance=0.0;if(proposed.score>0.0){acceptance=min(1.0,proposed.score/max(current.score,1e-20)*correction);}
  // Rao-Blackwellized splats include rejected-state residence time.
  if(current.score>0.0){splat(current.p,current.flux/current.score*(1.0-acceptance));}
  if(proposed.score>0.0){splat(proposed.p,proposed.flux/proposed.score*acceptance);}
  if(rand()<acceptance){current=proposed;atomicAdd(&counters[3],1u);}
  atomicAdd(&counters[4],1u);
 }
 chains[id]=toChain(current);atomicAdd(&counters[1],4u);
}
@compute @workgroup_size(64)
fn decayMap(@builtin(global_invocation_id) gid:vec3u){if(gid.x<GRID*GRID*3u){let v=atomicLoad(&photonMap[gid.x]);atomicStore(&photonMap[gid.x],v/2u);}}

