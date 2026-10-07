#version 300 es

precision highp float;

#include "./common/math.glsl"
#include "./common/hsluv.glsl"


const vec4 POLE_COLOR = vec4(1);
const vec4 ZERO_COLOR = vec4(0.0f, 0.0f, 0.0f, 1.0f);
const vec4 LINE_COLOR1 = vec4(.1,.6,1.,.5);
const vec4 LINE_COLOR2 = vec4(.1,.6,1.,-.5);

const float ZERO_SCALE = -4.;
const float POLE_SCALE = 8.;


in vec2 v_coord;

out vec4 fragColor;

// Global Uniforms
// uniform mat3 uProjectionMatrix;
// uniform mat3 uWorldTransformMatrix;
// uniform mat3 uTransformMatrix;
uniform mat4 u_viewMatrix;
uniform vec3 u_resolution;

// Grid Unifroms
const float u_gridSpacing = .5;
const float uDomainColorAlpha = 1.0;
const float uUnitCircleAlpha = 1.;




// uniform contextUniforms {
//     mat4 uMoebiusTransform;
// };



void main() {
    
    float lineThickness = 1. / u_resolution.y;
    vec2 z = v_coord;

    mat4 mvp = u_viewMatrix;
    vec2 scale = vec2(length(mvp[0]), length(mvp[1]));

    // vec2 s = sign(fract(vCoord) - .5);
    // float t = step(0., s.x * s.y);
    // vec3 c = mix(vec3(0), vec3(1), t);

    vec4 Z = vec4(z, vec2(2./length(scale)));
    
    // cx_div(cx_mul(z, cx_i) - cx_one, -z + cx_i);

    vec4 t = vec4(0.5, 0.5, 0, 0);
    // Z = dmoebiusInv(Z, uMoebiusTransform);

    // Z = dmoebius(vec4(Z), c1, -ci, c1, ci);

    // Z = ddiv(Z - di, Z + di);

    // if (length(Z.xy) > 1.) { discard; }

    vec3 col = vec3(1);

    vec3 domainCol = hpluvToRgb(degrees(atan(Z.y, Z.x)), 100., 80.);
    col = mix(col, domainCol, uDomainColorAlpha);

    vec2 d = mod(Z.xy, u_gridSpacing);
    d = min(d, u_gridSpacing - d);

    col = mix(
        col, LINE_COLOR1.rgb,
        smoothstep(
            lineThickness * length(Z.zw), 0.,
            min(d.x, d.y)
        ) * LINE_COLOR1.a
    );

    d = mod(Z.xy + u_gridSpacing * .5, u_gridSpacing);
    d = min(d, u_gridSpacing - d);

    col = mix(
        col, LINE_COLOR2.rgb,
        smoothstep(
            lineThickness * length(Z.zw), 0.,
            min(d.x, d.y)
        ) * LINE_COLOR2.a
    );

    float norm2 = log(dot(Z.xy,Z.xy));

    col = mix(
        col, ZERO_COLOR.rgb,
        smoothstep(4., 0., norm2 - ZERO_SCALE) * ZERO_COLOR.a
    );

    col = mix(
        col , POLE_COLOR.rgb ,
        smoothstep(3., 1.5, POLE_SCALE - norm2) * POLE_COLOR.a 
    );

    
    col = mix(
        col, vec3(1, 0, 0),
        smoothstep(lineThickness * 2. * length(Z.zw), 0., abs(1. - length(Z.xy))) * uUnitCircleAlpha
    );

    // vec2 s = sign(fract(Z.xy * .5) - .5);
    // float t = step(0., s.x * s.y);
    // col = mix(vec3(0), vec3(1), t);
    

    fragColor = vec4(col, 1);
}