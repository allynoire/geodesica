#version 300 es

/* Shader for a */

uniform mat4 u_invViewMatrix;
uniform mat4 u_invProjectionMatrix;

in vec3 a_position;

out vec2 v_coord;

void main() {
    v_coord = (u_invViewMatrix * u_invProjectionMatrix * vec4(a_position, 1)).xy;
    gl_Position = vec4(a_position, 1);
}
