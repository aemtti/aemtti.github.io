import {CpuMLT} from './transport-cpu.mjs';
let renderer=null,version=0;
self.onmessage=({data})=>{
 try{
  if(data.type==='reset'){version=data.version;renderer=new CpuMLT(data.config);}
  if(data.type==='step'&&renderer&&data.version===version){const stats=renderer.batch(4096);const map=renderer.map.slice();self.postMessage({version,...stats,map},[map.buffer]);}
 }catch(error){self.postMessage({version,error:String(error)});}
};
