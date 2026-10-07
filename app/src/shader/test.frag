#version 300 es

precision mediump float;

in vec2 v_coord;

out vec4 o_color;

void main() {
    if (0.0 < v_coord.x && v_coord.x < 1.0 && 0.0 < v_coord.y && v_coord.y < 1.0) {
        o_color = vec4(v_coord.xy, 0, 1);
    }
}
