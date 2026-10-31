shader_type spatial;
render_mode unshaded;
varying vec3 world;
varying vec3 wn;
varying vec4 baked;
uniform sampler2D atlas:source_color,filter_linear_mipmap;
uniform vec2 tile;
uniform vec4 tint:source_color=vec4(1.0);
void vertex(){world=(MODEL_MATRIX*vec4(VERTEX,1.0)).xyz;wn=normalize(mat3(MODEL_MATRIX)*NORMAL);baked=COLOR;}
void fragment(){vec3 n=abs(wn);vec2 p=n.y>max(n.x,n.z)?world.xz:n.x>n.z?world.zy:world.xy;vec2 uv=(tile+mix(vec2(.015),vec2(.985),fract(p*.38)))*.5;ALBEDO=texture(atlas,uv).rgb*tint.rgb*baked.rgb;ROUGHNESS=1.0;}
