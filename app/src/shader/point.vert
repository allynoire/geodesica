#version 300 es

uniform mat4 u_invViewMatrix;
uniform mat4 u_viewMatrix;

in vec4 a_position;

out vec4 COORD;

void main() {
    COORD = a_position * u_viewMatrix;
    gl_Position = COORD;
    gl_PointSize = 4.0;
}
