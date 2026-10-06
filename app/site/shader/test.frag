#version 300 es

precision mediump float;

in vec4 v_position;

out vec4 o_color;

void main() {
    o_color = vec4(v_position.xy, 0, 1);
}
