#version 300 es

precision mediump float;

uniform float u_time;

in vec3 v_normal;
out vec4 o_color;

void main() {
    float t = u_time * 0.001;
    vec3 light_dir = vec3(cos(t), 0, sin(t));
    float diff = max(dot(normalize(v_normal), light_dir), 0.0);
    o_color = vec4(vec3(diff), 1);
}
