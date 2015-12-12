precision mediump float;

attribute vec2 a_v2_position;
attribute vec2 a_v2_uv;

uniform mat4 u_m4_projection;
uniform mat4 u_m4_view;
uniform mat4 u_m4_model;

varying vec2 o_v2_uv;

void main(void) {
	o_v2_uv = a_v2_uv;
	// gl_Position = u_m4_projection * u_m4_view * u_m4_model * vec4(a_v2_position, 0.0, 1.0);
	gl_Position = u_m4_projection * u_m4_model * vec4(a_v2_position, -1.0, 1.0);
	// gl_Position = vec4(a_v2_position, 0.0, 1.0);
}
