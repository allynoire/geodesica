#version 300 es

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

in vec3 a_position;
in vec3 a_color;

out vec2 v_coord;
out vec3 v_color;

void main() {
    vec4 pos = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1);
    v_color = a_color;
    v_coord = pos.xy;
    gl_Position = pos;
    gl_PointSize = 10.0;
}
