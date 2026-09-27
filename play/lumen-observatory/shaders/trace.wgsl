override USE_BDPT:bool=false;
fn directLight(h:Hit,normal:vec3f)->vec3f{
 let lp=sampleLight(vec2f(rand(),rand()));let delta=lp-h.p;let dist2=dot(delta,delta);let l=delta/sqrt(dist2);let co=max(dot(normal,l),0.0);let cl=max(l.y,0.0);
 if(co<=0.0||cl<=0.0){return vec3f(0);}atomicAdd(&counters[0],1u);if(!visible(h.p+normal*EPS*2.0,lp)){return vec3f(0);}
 let pdf=dist2/(cl*1.04);let bsdf=co/PI;
 return h.albedo/PI*lightEmission()*co/pdf*powerWeight(pdf,bsdf);
}
fn tracePixel(uv:vec2f)->vec3f{
 if(USE_BDPT){return traceBidirectional(uv);}
 var ro=u.eye.xyz;var rd=normalize(u.forward.xyz+u.right.xyz*uv.x*u.eye.w*u.right.w+u.up.xyz*uv.y*u.eye.w);
 var beta=vec3f(1);var result=vec3f(0);var specular=true;var prevPdf=0.0;var prevPoint=ro;var diffuseCount=0u;var afterSpecular=false;var rays=0u;
 var mappedReceiver=false;var mappedChain=true;var lensId=999u;var transmissions=0u;
 let mode=u32(u.forward.w);
 for(var bounce=0u;bounce<16u;bounce++){
  if(bounce>=u32(u.res.w)){break;}let h=intersect(ro,rd);rays++;
  if(h.t>1e4){result+=beta*environment(rd);break;}
  let normal=select(-h.n,h.n,dot(rd,h.n)<0.0);
  if(h.mat==3u||luminance(h.emission)>0.0){var mis=1.0;if(!specular&&h.id==30u){let dist2=dot(h.p-prevPoint,h.p-prevPoint);let lp=dist2/(max(rd.y,.001)*1.04);mis=powerWeight(prevPdf,lp);}
   // Photon/MLT modes estimate L(S+)D paths at the diffuse receiver.
   if(!(mode>=2u&&h.id==30u&&mappedReceiver&&mappedChain&&transmissions==2u)){result+=beta*h.emission*mis;}
   if(h.mat==3u){break;}
  }
  if(h.mat==0u){
result+=beta*directLight(h,normal);

   if(mode>=2u&&h.id==10u&&normal.y>.9){result+=beta*h.albedo/PI*gatherPhotons(h.p);}
   rd=cosineDirection(normal);prevPdf=max(dot(rd,normal),0.0)/PI;prevPoint=h.p;beta*=h.albedo;specular=false;diffuseCount++;afterSpecular=false;
   mappedReceiver=h.id==10u&&normal.y>.9;mappedChain=true;lensId=999u;transmissions=0u;
  }else if(h.mat==1u){rd=reflectRay(rd,normal);beta*=h.albedo;specular=true;afterSpecular=true;mappedChain=false;}
  else {let entering=dot(rd,h.n)<0.0;let eta=select(u.settings.x,1.0/u.settings.x,entering);let f=fresnel(-dot(rd,normal),eta);let t=refractRay(rd,normal,eta);if(dot(t,t)<.1||rand()<f){rd=reflectRay(rd,normal);mappedChain=false;}else{rd=normalize(t);beta*=h.albedo;if(!entering){beta*=pow(h.albedo,vec3f(h.t));}if(transmissions==0u){lensId=h.id;}if(h.id!=lensId||h.id>1u){mappedChain=false;}transmissions++;}specular=true;afterSpecular=true;}
  ro=h.p+rd*EPS*2.0;
  if(bounce>3u){let survive=clamp(max(beta.x,max(beta.y,beta.z)),.1,.95);if(rand()>survive){break;}beta/=survive;}
 }
 atomicAdd(&counters[0],rays);return max(result,vec3f(0));
}
@compute @workgroup_size(8,8)
fn trace(@builtin(global_invocation_id) gid:vec3u){
 if(gid.x>=u32(u.res.x)||gid.y>=u32(u.res.y)){return;}let idx=gid.y*u32(u.res.x)+gid.x;
 seed=hash(idx+u32(u.res.z)*1973u+91771u);
 let pixel=vec2f(gid.xy)+vec2f(rand(),rand());let uv=vec2f(pixel.x/u.res.x*2.0-1.0,1.0-pixel.y/u.res.y*2.0);
 let sample=tracePixel(uv);let old=select(vec4f(0),film[idx],u.res.z>0.0);let count=old.w+1.0;let mean=old.xyz+(sample-old.xyz)/count;film[idx]=vec4f(mean,count);
 // Exposure is applied during display, keeping accumulation in linear radiance.
 textureStore(image,vec2i(gid.xy),vec4f(mean,1));
}

