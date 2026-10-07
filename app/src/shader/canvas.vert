#version 300 es

/* Shader for a */

uniform mat4 u_invViewMatrix;

in vec4 a_position;

out vec4 COORD;

void main() {
    COORD = a_position * u_invViewMatrix;
    gl_Position = a_position;
}
