(function(AB){
  class SeededRandom{
    constructor(seed){this.seedText=String(seed||Date.now());this.state=this.hash(this.seedText)||0x6d2b79f5}
    hash(text){let h=2166136261;for(let i=0;i<text.length;i++){h^=text.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
    next(){let t=this.state+=0x6d2b79f5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296}
    range(min,max){return min+(max-min)*this.next()}
    int(min,max){return Math.floor(this.range(min,max+1))}
    pick(list){return list[Math.floor(this.next()*list.length)]}
    shuffle(list){const a=list.slice();for(let i=a.length-1;i>0;i--){const j=this.int(0,i);[a[i],a[j]]=[a[j],a[i]]}return a}
  }
  AB.SeededRandom=SeededRandom;
})(window.AB=window.AB||{});
