precision mediump float;

uniform float u_f_time;
uniform sampler2D u_sampler2d_texture;

uniform vec3 color;

varying vec2 o_v2_uv;

void main(void) { 
	float time = u_f_time/100.0; 

	vec2 offset = vec2(cos(time+o_v2_uv.y*2.0)*(-0.2) , 0);
	vec4 txcolor = texture2D(u_sampler2d_texture, o_v2_uv);
	// txcolor.r = (txcolor.r + gl_FragCoord.y/768.0);
	gl_FragColor = txcolor;
	// gl_FragColor = vec4(1.0, 0.0, 1.0, 1.0);
}
