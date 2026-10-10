#version 300 es

precision highp float;

#include "./common/math.glsl"
#include "./common/hsluv.glsl"


const vec4 POLE_COLOR = vec4(1);
const vec4 ZERO_COLOR = vec4(0.0f, 0.0f, 0.0f, 1.0f);
const vec4 LINE_COLOR1 = vec4(.1,.6,1.,.5);
const vec4 LINE_COLOR2 = vec4(.1,.6,1.,-.5);
const vec3 BG_COLOR = vec3(1);

const float ZERO_SCALE = -4.;
const float POLE_SCALE = 8.;

in vec2 v_coord;

out vec4 o_color;

uniform mat4 u_viewMatrix;
uniform vec2 u_resolution;

// Grid Unifroms
const float u_gridSpacing = 1.0;
const float uDomainColorAlpha = 1.0;
const float uUnitCircleAlpha = 0.5;

void main() {
    
    float lineThickness = 1. / u_resolution.y;
    vec2 z = v_coord;

    mat4 mvp = u_viewMatrix;
    vec2 scale = vec2(length(mvp[0]), length(mvp[1]));

    vec4 Z = vec4(z, vec2(2./length(scale)));
    
    vec3 domainColor = hpluvToRgb(degrees(atan(Z.y, Z.x)), 100., 80.);

    vec3 color = mix(
        BG_COLOR, 
        domainColor, 
        uDomainColorAlpha
    );

    vec2 d = mod(Z.xy, u_gridSpacing);
    d = min(d, u_gridSpacing - d);

    color = mix(
        color, LINE_COLOR1.rgb,
        smoothstep(
            lineThickness * length(Z.zw), 0.,
            min(d.x, d.y)
        ) * LINE_COLOR1.a
    );

    d = mod(Z.xy + u_gridSpacing * .5, u_gridSpacing);
    d = min(d, u_gridSpacing - d);

    color = mix(
        color, LINE_COLOR2.rgb,
        smoothstep(
            lineThickness * length(Z.zw), 0.,
            min(d.x, d.y)
        ) * LINE_COLOR2.a
    );

    float norm2 = log(dot(Z.xy,Z.xy));

    color = mix(
        color, ZERO_COLOR.rgb,
        smoothstep(4., 0., norm2 - ZERO_SCALE) * ZERO_COLOR.a
    );

    color = mix(
        color , POLE_COLOR.rgb ,
        smoothstep(3., 1.5, POLE_SCALE - norm2) * POLE_COLOR.a 
    );

    
    color = mix(
        color, vec3(1, 0, 0),
        smoothstep(lineThickness * 2. * length(Z.zw), 0., abs(1. - length(Z.xy))) * uUnitCircleAlpha
    );

    o_color = vec4(color, 1);
}