struct Uniforms {
  res: vec4f, eye: vec4f, right: vec4f, up: vec4f, forward: vec4f,
  light: vec4f, settings: vec4f, flags: vec4f, sizes: vec4f,
}
struct Chain { primary: vec4f, point: vec4f, flux: vec4f, extra: vec4f }
@group(0) @binding(0) var<uniform> u: Uniforms;
@group(0) @binding(1) var<storage, read_write> film: array<vec4f>;
@group(0) @binding(2) var<storage, read_write> photonMap: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read_write> chains: array<Chain>;
@group(0) @binding(4) var<storage, read_write> counters: array<atomic<u32>>;
@group(0) @binding(5) var image: texture_storage_2d<rgba16float, write>;
const PI = 3.14159265359;
const EPS = 0.0008;
const GRID = 256u;
const EXTENT = 8.0;
const FIXED = 256.0;
var<private> seed: u32;
fn hash(x: u32) -> u32 { var a=x; a=(a^(a>>16u))*0x7feb352du; a=(a^(a>>15u))*0x846ca68bu; return a^(a>>16u); }
fn rand() -> f32 { seed=hash(seed+0x9e3779b9u); return (f32(seed & 0x00ffffffu)+0.5)/16777216.0; }
fn luminance(c: vec3f) -> f32 { return dot(c,vec3f(.2126,.7152,.0722)); }
fn reflectRay(d:vec3f,n:vec3f)->vec3f{return d-2.0*dot(d,n)*n;}
fn refractRay(d:vec3f,n:vec3f,eta:f32)->vec3f{let c=-dot(d,n);let k=1.0-eta*eta*(1.0-c*c);if(k<0.0){return vec3f(0);}return eta*d+(eta*c-sqrt(k))*n;}
fn fresnel(c:f32,eta:f32)->f32{let r=(1.0-eta)/(1.0+eta);return r*r+(1.0-r*r)*pow(1.0-clamp(c,0.0,1.0),5.0);}
fn basis(n:vec3f)->mat3x3f{let helper=select(vec3f(0,1,0),vec3f(1,0,0),abs(n.y)>.95);let x=normalize(cross(helper,n));return mat3x3f(x,cross(n,x),n);}
fn cosineDirection(n:vec3f)->vec3f{let a=2.0*PI*rand();let r=sqrt(rand());return basis(n)*vec3f(r*cos(a),r*sin(a),sqrt(max(0.0,1.0-r*r)));}
fn lightColor()->vec3f{
 if(u.settings.w<.5){return vec3f(1.0,.83,.63);}
 if(u.settings.w<1.5){return vec3f(.57,.79,1.0);}
 return vec3f(1.0,.48,.57);
}
fn lightEmission()->vec3f{return lightColor()*u.light.w*22.0;}
fn sampleLight(a:vec2f)->vec3f{return u.light.xyz+vec3f((a.x-.5)*1.3,0,(a.y-.5)*.8);}
struct Hit { t:f32, p:vec3f, n:vec3f, albedo:vec3f, emission:vec3f, mat:u32, id:u32 }
fn noHit()->Hit{var h:Hit;h.t=1e5;h.mat=0u;h.id=999u;return h;}
fn sphereDistance(ro:vec3f,rd:vec3f,c:vec3f,r:f32)->f32{
 let oc=ro-c;let b=dot(oc,rd);let det=b*b-dot(oc,oc)+r*r;if(det<0.0){return 1e5;}
 let sq=sqrt(det);var t=-b-sq;if(t<EPS){t=-b+sq;}if(t<EPS){return 1e5;}return t;
}
fn sphereHit(h:Hit,ro:vec3f,rd:vec3f,c:vec3f,r:f32,col:vec3f,mat:u32,id:u32)->Hit{
 let t=sphereDistance(ro,rd,c,r);if(t>=h.t){return h;}var v=h;v.t=t;v.p=ro+t*rd;v.n=(v.p-c)/r;v.albedo=col;v.mat=mat;v.id=id;v.emission=vec3f(0);return v;
}
fn lensCenter(i:u32)->vec3f{if(i==0u){return vec3f(-.85,1.4,0);}return vec3f(1.35,.79,.8);}
fn lensRadius(i:u32)->f32{return select(.72,1.12,i==0u);}
fn lensTint(i:u32)->vec3f{return select(vec3f(.90,.97,1.0),vec3f(.99,.91,.73),i==0u);}
fn torusHit(ro:vec3f,rd:vec3f,c:vec3f,n:vec3f,r:f32,tube:f32)->vec4f{
 let oc=ro-c;let b=dot(oc,rd);let det=b*b-dot(oc,oc)+(r+tube)*(r+tube);if(det<0.0){return vec4f(0,0,0,1e5);}
 var t=max(EPS,-b-sqrt(det));let end=-b+sqrt(det);
 for(var i=0u;i<48u;i++){let p=oc+rd*t;let vertical=dot(p,n);let radial=p-n*vertical;let rl=length(radial);let q=vec2f(rl-r,vertical);let sd=length(q)-tube;
  if(sd<.0005){let center=radial*r/max(rl,.0001);return vec4f(normalize(p-center),t);}t+=max(sd,.0003);if(t>end){break;}}
 return vec4f(0,0,0,1e5);
}
fn intersect(ro:vec3f,rd:vec3f)->Hit{
 var h=noHit();
 if(abs(rd.y)>1e-6){let t=-ro.y/rd.y;if(t>EPS){let p=ro+rd*t;if(length(p.xz)<6.3){h.t=t;h.p=p;h.n=vec3f(0,1,0);h.mat=0u;h.id=10u;
 let r=length(p.xz);h.albedo=select(vec3f(.07,.105,.145),vec3f(.40,.48,.53),r<3.25);
 let lines=abs(fract(p.xz*.5+.5)-.5);if(min(lines.x,lines.y)<.006&&r>3.25){h.albedo*=.45;}
 if(abs(r-3.26)<.012||abs(r-2.92)<.008){h.emission=vec3f(.13,.9,1.0)*2.5;h.albedo=vec3f(.2);}
 if(r>3.3&&r<3.43){h.mat=1u;h.albedo=vec3f(.72,.8,.86);}
 if(r<2.88&&abs(fract(atan2(p.z,p.x)*24.0/PI)-.5)<.025&&r>2.76){h.albedo=vec3f(.13,.21,.24);}
 }}}
 // Cylindrical observation chamber, with vertical luminous slits.
 let a=dot(rd.xz,rd.xz);let b=dot(ro.xz,rd.xz);let dd=b*b-a*(dot(ro.xz,ro.xz)-36.0);
 if(dd>0.0&&a>1e-6){let t=(-b+sqrt(dd))/a;let p=ro+t*rd;if(t>EPS&&t<h.t&&p.y>0.0&&p.y<5.4){h.t=t;h.p=p;h.n=normalize(vec3f(-p.x,0,-p.z));h.albedo=vec3f(.075,.12,.17);h.emission=vec3f(0);h.mat=0u;h.id=11u;let ang=atan2(p.z,p.x);
 if(abs(fract(ang*9.0/PI)-.5)<.012){h.albedo=vec3f(.18,.23,.27);h.mat=1u;}
 if(abs(fract(ang*3.0/PI+.12)-.5)<.005&&p.y>.38&&p.y<4.75){h.emission=vec3f(.18,.55,.75)*2.2;}
 if(p.y<.05||abs(p.y-4.9)<.015){h.emission=vec3f(.10,.6,.72)*1.8;}
 }}
 for(var i=0u;i<2u;i++){h=sphereHit(h,ro,rd,lensCenter(i),lensRadius(i),lensTint(i),2u,i);}
 h=sphereHit(h,ro,rd,vec3f(.65,1.15,-1.48),.98,vec3f(.90,.70,.42),1u,2u);
 h=sphereHit(h,ro,rd,vec3f(-2.0,.41,1.05),.41,vec3f(.73,.82,.85),0u,3u);
 h=sphereHit(h,ro,rd,vec3f(2.15,.24,-.52),.24,vec3f(.77,.88,.94),1u,4u);
 h=sphereHit(h,ro,rd,vec3f(-.25,.20,2.12),.20,vec3f(.84,.95,1),2u,5u);
 h=sphereHit(h,ro,rd,vec3f(-1.0,.14,-2.22),.14,vec3f(.98,.68,.37),1u,6u);
 for(var i=0u;i<2u;i++){
 let nn=select(normalize(vec3f(.73,.26,.63)),normalize(vec3f(.15,.93,.33)),i==0u);
 let th=torusHit(ro,rd,vec3f(0,1.45,0),nn,select(1.91,2.56,i==0u),.027);
 if(th.w<h.t){h.t=th.w;h.p=ro+rd*h.t;h.n=th.xyz;h.albedo=vec3f(.72,.85,.9);h.emission=vec3f(0);h.mat=1u;h.id=20u+i;}
 }
 // The physical rectangular emitter is also sampled for direct illumination.
 if(abs(rd.y)>1e-6){let t=(u.light.y-ro.y)/rd.y;let p=ro+rd*t;if(t>EPS&&t<h.t&&abs(p.x-u.light.x)<.65&&abs(p.z-u.light.z)<.4){h.t=t;h.p=p;h.n=vec3f(0,-1,0);h.albedo=vec3f(0);h.emission=select(vec3f(.15),lightEmission(),rd.y>0.0);h.mat=3u;h.id=30u;}}
 return h;
}
fn visible(a:vec3f,b:vec3f)->bool{let d=b-a;let dist=length(d);let h=intersect(a,d/dist);return h.t>dist-.003;}
fn environment(rd:vec3f)->vec3f{return mix(vec3f(.016,.031,.055),vec3f(.12,.17,.23),pow(max(rd.y,0.0),.65));}
fn powerWeight(a:f32,b:f32)->f32{return a*a/max(a*a+b*b,1e-15);}
fn gatherPhotons(p:vec3f)->vec3f{
 let pos=(p.xz/EXTENT+.5)*f32(GRID);let radius=max(u.settings.y*f32(GRID)/EXTENT,.7);
 let ir=i32(ceil(radius));var sum=vec3f(0);var weightSum=0.0;
 for(var dy=-12;dy<=12;dy++){for(var dx=-12;dx<=12;dx++){if(abs(dx)>ir||abs(dy)>ir){continue;}let cell=vec2i(floor(pos))+vec2i(dx,dy);if(any(cell<vec2i(0))||any(cell>=vec2i(i32(GRID)))){continue;}
 let d=length(vec2f(cell)+.5-pos)/radius;if(d>1.0){continue;}let w=1.0-d;let k=(u32(cell.y)*GRID+u32(cell.x))*3u;
 sum+=vec3f(f32(atomicLoad(&photonMap[k])),f32(atomicLoad(&photonMap[k+1u])),f32(atomicLoad(&photonMap[k+2u])))*w;weightSum+=w;
 }}
 // Kernel normalized in world area. All modes accumulate incident photon power.
 let kernelArea=PI*pow(radius*EXTENT/f32(GRID),2.0)/3.0;
 return sum/FIXED/max(u.settings.z,1.0)/max(kernelArea,.00001)*u.sizes.y;
}
