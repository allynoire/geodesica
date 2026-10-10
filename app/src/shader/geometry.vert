#version 300 es

uniform mat4 u_viewMatrix;
uniform mat4 u_invViewMatrix;

in vec3 a_position;

out vec2 v_coord;

void main() {
    v_coord = a_position.xy;
    gl_Position = u_viewMatrix * vec4(a_position, 1);
}
