(function(AB){
  class Input{
    constructor(canvas){this.down=new Set();this.pressed=new Set();this.released=new Set();this.canvas=canvas;this.bindings={left:['KeyA','ArrowLeft'],right:['KeyD','ArrowRight'],jump:['KeyW','Space','ArrowUp'],down:['KeyS','ArrowDown'],melee:['KeyJ','Mouse0'],ranged:['KeyK','Mouse2'],roll:['KeyL','ShiftLeft','ShiftRight'],bomb:['KeyQ']};this.bind()}
    bind(){
      window.addEventListener('keydown',e=>{if(!this.down.has(e.code))this.pressed.add(e.code);this.down.add(e.code);if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault()});
      window.addEventListener('keyup',e=>{this.down.delete(e.code);this.released.add(e.code)});
      this.canvas.addEventListener('mousedown',e=>{const c='Mouse'+e.button;if(!this.down.has(c))this.pressed.add(c);this.down.add(c);this.canvas.focus()});
      window.addEventListener('mouseup',e=>{const c='Mouse'+e.button;this.down.delete(c);this.released.add(c)});
      this.canvas.addEventListener('contextmenu',e=>e.preventDefault());
      window.addEventListener('blur',()=>{this.down.clear();this.pressed.clear();this.released.clear()});
    }
    matches(action,set){return this.bindings[action].some(k=>set.has(k))}
    isDown(action){return this.matches(action,this.down)}
    wasPressed(action){return this.matches(action,this.pressed)}
    wasReleased(action){return this.matches(action,this.released)}
    endFrame(){this.pressed.clear();this.released.clear()}
  }
  AB.Input=Input;
})(window.AB=window.AB||{});
