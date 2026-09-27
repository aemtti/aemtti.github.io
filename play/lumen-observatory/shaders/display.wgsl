struct Display { values:vec4f }
@group(0) @binding(0) var frame:texture_2d<f32>;
@group(0) @binding(1) var frameSampler:sampler;
@group(0) @binding(2) var<uniform> display:Display;
struct Vertex { @builtin(position) position:vec4f, @location(0) uv:vec2f }
@vertex fn vertex(@builtin(vertex_index) index:u32)->Vertex{
 var p=array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));var out:Vertex;out.position=vec4f(p[index],0,1);out.uv=vec2f((p[index].x+1.0)*.5,(1.0-p[index].y)*.5);return out;
}
fn aces(x:vec3f)->vec3f{return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),vec3f(0),vec3f(1));}
@fragment fn fragment(in:Vertex)->@location(0) vec4f{
 var c=textureSample(frame,frameSampler,in.uv).rgb;let dims=vec2f(textureDimensions(frame));
 // Optional small bilateral display filter; raw radiance stays untouched.
 if(display.values.y>.5){var sum=c;var w=1.0;for(var y=-1;y<=1;y++){for(var x=-1;x<=1;x++){if(x==0&&y==0){continue;}let other=textureSample(frame,frameSampler,in.uv+vec2f(f32(x),f32(y))/dims).rgb;let weight=exp(-abs(dot(other-c,vec3f(.2126,.7152,.0722)))*5.0)*.3;sum+=other*weight;w+=weight;}}c=sum/w;}
 c=aces(c*exp2(display.values.x));c=pow(c,vec3f(1.0/2.2));return vec4f(c,1);
}
