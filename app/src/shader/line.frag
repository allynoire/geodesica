#version 300 es

precision mediump float;

uniform vec3 u_lineColor;

in float v_side;
in float v_width;

out vec4 o_color;

void main() {
    // screen space (pixel) distance from edge
    float dist = (1.0 - abs(v_side)) * (0.5 * v_width);

    // anti-aliasing 1 pixel
    float a = smoothstep(0.0, 1.0, dist);
    
    // premultiplied alpha
    o_color = vec4(u_lineColor, 1) * a;
}
