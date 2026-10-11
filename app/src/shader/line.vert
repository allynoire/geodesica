#version 300 es

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;
uniform vec2 u_resolution;
uniform float u_lineWidth; // line width in screen space (pixels)

in vec3 a_position; 
in vec3 a_normal; // expecting 2d vector (nx, ny, 0)
in float a_side;  // side of the middle this vertex is on

out float v_side;
out float v_width;

void main() {
    mat4 mvp = u_projectionMatrix * u_viewMatrix;
    
    // transforming into clip space
    vec4 pos = mvp * vec4(a_position, 1);
    
    // expecting mvp to be uniformly scaled
    vec2 normal = normalize(mvp * vec4(a_normal, 0)).xy; 
    
    vec2 pixelWidth = 2.0 / u_resolution;

    // offset the vertex from the middle line
    pos.xy += normal * a_side * (0.5 * u_lineWidth) * pixelWidth;

    v_side = a_side;
    v_width = u_lineWidth;

    gl_Position = pos;
}
