#version 300 es

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform float u_lineWidth;

in vec3 a_position; // expected 2d vector
in vec3 a_normal;
in float a_side;

out float v_side;
out float v_width;

void main() {
    
    vec4 viewPos = u_viewMatrix * vec4(a_position, 1);
    
    // displace line width in view space
    viewPos.xyz += a_normal * a_side * 0.5 * u_lineWidth;

    v_side = a_side;
    v_width = u_lineWidth;

    gl_Position = u_projectionMatrix * viewPos;
}
