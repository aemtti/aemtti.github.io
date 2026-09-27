// Shared deterministic CPU reference for the two-interface glass caustic family.
export const GRID=256, EXTENT=8, FIXED=256;
export const add=(a,b)=>a.map((v,i)=>v+b[i]);
export const sub=(a,b)=>a.map((v,i)=>v-b[i]);
export const mul=(a,s)=>a.map(v=>v*s);
export const dot=(a,b)=>a.reduce((n,v,i)=>n+v*b[i],0);
export const norm=a=>mul(a,1/Math.hypot(...a));
export const cross=(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]];
export function refract(d,n,eta){const c=-dot(d,n),k=1-eta*eta*(1-c*c);return k<0?null:add(mul(d,eta),mul(n,eta*c-Math.sqrt(k)));}
export function fresnel(c,eta){const r=(1-eta)/(1+eta);return r*r+(1-r*r)*(1-Math.max(0,Math.min(1,c)))**5;}
export function sphereDistance(o,d,c,r){const v=sub(o,c),b=dot(v,d),disc=b*b-dot(v,v)+r*r;if(disc<0)return 1e5;let t=-b-Math.sqrt(disc);if(t<.0008)t=-b+Math.sqrt(disc);return t<.0008?1e5:t;}
export const centers=[[-.85,1.4,0],[1.35,.79,.8]];
export const radii=[1.12,.72];
export const tints=[[.99,.91,.73],[.90,.97,1]];
const spheres=[...centers.map((c,i)=>({c,r:radii[i],id:i})),{c:[.65,1.15,-1.48],r:.98,id:2},{c:[-2,.41,1.05],r:.41,id:3},{c:[2.15,.24,-.52],r:.24,id:4},{c:[-.25,.20,2.12],r:.20,id:5},{c:[-1,.14,-2.22],r:.14,id:6}];
function torusDistance(o,d,n,r){const oc=sub(o,[0,1.45,0]),b=dot(oc,d),disc=b*b-dot(oc,oc)+(r+.027)**2;if(disc<0)return 1e5;let t=Math.max(.0008,-b-Math.sqrt(disc)),end=-b+Math.sqrt(disc);for(let i=0;i<48;i++){const p=add(oc,mul(d,t)),h=dot(p,n),rad=sub(p,mul(n,h)),sd=Math.hypot(Math.hypot(...rad)-r,h)-.027;if(sd<.0005)return t;t+=Math.max(sd,.0003);if(t>end)break;}return 1e5;}
const rings=[{n:norm([.15,.93,.33]),r:2.56},{n:norm([.73,.26,.63]),r:1.91}];
function firstHit(o,d){let t=d[1]<-.00001?-o[1]/d[1]:1e5;let id=t>.0008?10:999;if(id===999)t=1e5;for(const s of spheres){const st=sphereDistance(o,d,s.c,s.r);if(st<t){t=st;id=s.id;}}for(let i=0;i<rings.length;i++){const r=rings[i],st=torusDistance(o,d,r.n,r.r);if(st<t){t=st;id=20+i;}}return{id,t};}
export function photon(primary,config){
 const empty={primary,p:[0,0],flux:[0,0,0],score:0,rays:0};if(config.bounces<3)return empty;
 const o=add(config.light,[(primary[0]-.5)*1.3,0,(primary[1]-.5)*.8]);const i=Math.min(Math.floor(primary[2]*2),1),c=centers[i],r=radii[i],axis=norm(sub(c,o));
 const delta=sub(c,o),cosMax=Math.sqrt(Math.max(0,1-r*r/dot(delta,delta))),ct=1+(cosMax-1)*(primary[2]*2-i),st=Math.sqrt(Math.max(0,1-ct*ct)),phi=primary[3]*Math.PI*2;
 const helper=Math.abs(axis[1])>.95?[1,0,0]:[0,1,0],bx=norm(cross(helper,axis)),by=cross(axis,bx);
 const initial=add(add(mul(bx,st*Math.cos(phi)),mul(by,st*Math.sin(phi))),mul(axis,ct));
 const et=sphereDistance(o,initial,c,r);if(et>1e4)return empty;const entry=add(o,mul(initial,et)),n=mul(sub(entry,c),1/r),eta=1/config.ior,d=refract(initial,n,eta);if(!d)return empty;
 const f1=1-fresnel(-dot(initial,n),eta),exitT=sphereDistance(add(entry,mul(d,.0016)),d,c,r),exit=add(entry,mul(d,exitT+.0016)),en=norm(sub(exit,c)),final=refract(d,mul(en,-1),config.ior);
 if(!final||final[1]>=-.001)return empty;const f2=1-fresnel(dot(d,en),config.ior),floorT=-exit[1]/final[1],floor=add(exit,mul(final,floorT));if(floorT<0||Math.abs(floor[0])>=4||Math.abs(floor[2])>=4)return empty;
 const first=firstHit(o,initial),last=firstHit(add(exit,mul(final,.0024)),final);empty.rays=4;
 if(first.id!==i||last.id!==10)return empty;
 let pdf=0;for(let j=0;j<2;j++){const dd=sub(centers[j],o),cosM=Math.sqrt(Math.max(0,1-radii[j]**2/dot(dd,dd)));if(dot(initial,norm(dd))>=cosM)pdf+=.5/(2*Math.PI*(1-cosM));}
 const color=[[1,.83,.63],[.57,.79,1],[1,.48,.57]][config.palette];const flux=color.map((v,k)=>v*config.intensity*22*1.04*Math.max(-initial[1],0)/Math.max(pdf,1e-8)*f1*f2*tints[i][k]**(exitT+2));
 const score=dot(flux,[.2126,.7152,.0722]);return{primary,p:[floor[0],floor[2]],flux,score,rays:4};
}
export function splat(map,p,flux){const q=p.map(v=>(v/8+.5)*GRID-.5),base=q.map(Math.floor),f=q.map((v,i)=>v-base[i]);for(let y=0;y<2;y++)for(let x=0;x<2;x++){const cx=base[0]+x,cy=base[1]+y;if(cx<0||cy<0||cx>=GRID||cy>=GRID)continue;const w=(x?f[0]:1-f[0])*(y?f[1]:1-f[1]),idx=(cy*GRID+cx)*3;for(let j=0;j<3;j++)map[idx+j]+=Math.max(0,Math.min(1e7,Math.floor(flux[j]*w*FIXED)));}}
export function makeRandom(seed=1943){let s=seed;return()=>{s=(s+0x6D2B79F5)|0;let t=Math.imul(s^(s>>>15),1|s);t^=t+Math.imul(t^(t>>>7),61|t);return ((t^(t>>>14))>>>0)/4294967296;};}
export class CpuMLT{
 constructor(config,count=128){this.config=config;this.rand=makeRandom();this.map=new Uint32Array(GRID*GRID*3);this.chains=[];this.samples=0;this.accepted=0;this.normSum=0;this.normCount=0;this.rays=0;for(let i=0;i<count;i++){let state=this.trace(this.random()),total=state.score;for(let j=0;j<8;j++){const p=this.trace(this.random());total+=p.score;if(p.score>0&&this.rand()*total<p.score)state=p;}this.chains.push(state);}}
 random(){return[this.rand(),this.rand(),this.rand(),this.rand()];}
 trace(s){const p=photon(s,this.config);this.rays+=p.rays;return p;}
 batch(iterations=4096){this.mapSamples??=0;if(this.mapSamples>4194304){for(let i=0;i<this.map.length;i++)this.map[i]>>>=1;this.mapSamples*=.5;}for(let k=0;k<iterations;k++){const idx=this.samples%this.chains.length,current=this.chains[idx];const large=this.rand()<.25;const scale=Math.exp(Math.log(.0008)+(Math.log(.08)-Math.log(.0008))*this.rand());const primary=large?this.random():current.primary.map(v=>(v+(this.rand()-.5)*scale+1)%1);const proposed=this.trace(primary);
  if(large){this.normSum+=proposed.score;this.normCount++;}
  const a=proposed.score>0?Math.min(1,proposed.score/Math.max(current.score,1e-20)):0;
  if(current.score>0)splat(this.map,current.p,mul(current.flux,(1-a)/current.score));if(proposed.score>0)splat(this.map,proposed.p,mul(proposed.flux,a/proposed.score));
  if(this.rand()<a){this.chains[idx]=proposed;this.accepted++;}this.samples++;this.mapSamples++;
 }return{samples:this.samples,mapSamples:this.mapSamples,accepted:this.accepted,norm:this.normSum/Math.max(this.normCount,1),rays:this.rays};}
}
