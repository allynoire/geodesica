#version 300 es

precision mediump float;

uniform vec3 u_lineColor;

in float v_side;
out vec4 o_color;

void main() {
    float dist = (1.0 - abs(v_side));
    float aawidth = fwidth(dist) * 1.0;
    float a = smoothstep(0.0, aawidth, dist);
    
    o_color = vec4(u_lineColor, 1) * a;
}
