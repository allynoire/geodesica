#version 300 es

precision mediump float;

in vec4 COORD;

out vec4 COLOR;

void main() {
    if (0.0 < COORD.x && COORD.x < 1.0 && 0.0 < COORD.y && COORD.y < 1.0) {
        COLOR = vec4(COORD.xy, 0, 1);
    }
}
