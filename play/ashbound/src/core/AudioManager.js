(function(AB){
  class AudioManager{
    constructor(){this.context=null;this.enabled=true}
    unlock(){if(!this.context){const C=window.AudioContext||window.webkitAudioContext;if(C)this.context=new C()}if(this.context&&this.context.state==='suspended')this.context.resume()}
    play(name){if(!this.enabled||!this.context)return;const tones={attack:[170,.035,'sawtooth'],hit:[90,.05,'square'],jump:[260,.06,'triangle'],roll:[110,.08,'sawtooth'],explosion:[55,.18,'sawtooth'],death:[70,.2,'square'],pickup:[520,.08,'sine'],door:[310,.13,'triangle'],shoot:[430,.045,'square']};const t=tones[name];if(!t)return;const now=this.context.currentTime,o=this.context.createOscillator(),g=this.context.createGain();o.type=t[2];o.frequency.setValueAtTime(t[0],now);o.frequency.exponentialRampToValueAtTime(Math.max(28,t[0]*.55),now+t[1]);g.gain.setValueAtTime(.035,now);g.gain.exponentialRampToValueAtTime(.0001,now+t[1]);o.connect(g).connect(this.context.destination);o.start(now);o.stop(now+t[1])}
  }
  AB.AudioManager=AudioManager;
})(window.AB=window.AB||{});
