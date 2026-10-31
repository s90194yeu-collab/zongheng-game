shader_type canvas_item;
uniform sampler2D scene : hint_screen_texture, repeat_disable, filter_linear;
void fragment(){
 vec2 uv=SCREEN_UV;
 float edge=smoothstep(.20,.49,abs(uv.y-.52));
 vec2 px=SCREEN_PIXEL_SIZE*edge*1.5;
 vec3 c=texture(scene,uv).rgb*.5;
 c+=(texture(scene,uv+vec2(px.x,px.y)).rgb+texture(scene,uv-vec2(px.x,px.y)).rgb)*.25;
 float vignette=smoothstep(.22,.82,length((uv-.5)*vec2(.9,1.0)));
 c*=1.0-vignette*.16;
 COLOR=vec4(c*vec3(1.025,1.005,.98),1.0);
}
