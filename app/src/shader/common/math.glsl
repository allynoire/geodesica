/*
contributors: Patricio Gonzalez Vivo
description: some useful math constants
license:
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Prosperity License - https://prosperitylicense.com/versions/3.0.0
    - Copyright (c) 2021 Patricio Gonzalez Vivo under Patron License - https://lygia.xyz/license
*/
#ifndef EIGHTH_PI
#define EIGHTH_PI 0.39269908169
#endif
#ifndef QTR_PI
#define QTR_PI 0.78539816339
#endif
#ifndef HALF_PI
#define HALF_PI 1.5707963267948966192313216916398
#endif
#ifndef PI
#define PI 3.1415926535897932384626433832795
#endif
#ifndef TWO_PI
#define TWO_PI 6.2831853071795864769252867665590
#endif
#ifndef TAU
#define TAU 6.2831853071795864769252867665590
#endif
#ifndef INV_PI
#define INV_PI 0.31830988618379067153776752674503
#endif
#ifndef INV_SQRT_TAU
#define INV_SQRT_TAU 0.39894228040143267793994605993439  // 1.0/SQRT_TAU
#endif
#ifndef SQRT_HALF_PI
#define SQRT_HALF_PI 1.25331413732
#endif
#ifndef PHI
#define PHI 1.618033988749894848204586834
#endif
#ifndef EPSILON
#define EPSILON 0.0000001
#endif
#ifndef GOLDEN_RATIO
#define GOLDEN_RATIO 1.6180339887
#endif
#ifndef GOLDEN_RATIO_CONJUGATE 
#define GOLDEN_RATIO_CONJUGATE 0.61803398875
#endif
#ifndef GOLDEN_ANGLE // (3.-sqrt(5.0))*PI radians
#define GOLDEN_ANGLE 2.39996323
#endif
#ifndef DEG2RAD
#define DEG2RAD (PI / 180.0)
#endif
#ifndef RAD2DEG
#define RAD2DEG (180.0 / PI)
#endif




/**
Complex functions and their derivatives
@source https://www.shadertoy.com/view/Ms2Bz3
*/


// Complex basis
const vec2 c1 = vec2(1.,0.);
const vec2 ci = vec2(0.,1.);
const vec4 d1 = vec4(1.,0.,0.,0.);
const vec4 di = vec4(0.,1.,0.,0.);

/* Reals to Complex functions */

vec2 cpolar( float k , float t ){  return k*vec2(cos(t),sin(t));}

/* Complex to Complex functions */

vec2 cconj( vec2 z )  { return vec2( z.x , -z.y ); }
vec2 cmul( vec2 a, vec2 b )  { return vec2( a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x ); }
vec2 csquared( vec2 a )  { return vec2( a.x*a.x - a.y*a.y, 2.*a.x*a.y ); }
vec2 cexp( vec2 z ) { return cpolar(exp(z.x) , z.y ); }
vec2 clog( vec2 z ) { return vec2( log(length(z)) , atan(z.y , z.x) ); }
vec2 cdiv( vec2 a, vec2 b )  { 
    // scaled division
    if (abs(b.x) >= abs(b.y)) {
        float r = b.y / b.x;
        float d = b.x + b.y*r;
        return vec2(a.x + a.y*r, a.y - a.x*r) / d;
    }
    else {
        float r = b.x / b.y;
        float d = b.y + b.x*r;
        return vec2(a.x*r + a.y, a.y*r - a.x) / d;
    }
    // float d = dot(b,b); 
    // return vec2( dot(a,b), a.y*b.x - a.x*b.y ) / d; 
}
vec2 cpow( vec2 z , float k ) { return cpolar(pow(length(z),k) , k*atan(z.y,z.x) ); }

#define cinv(a) (cdiv(c1,a))
#define cmuli(a) (cmul(ci,a))

/* Complex functions in .xy + Derivatives in .zw
   Only theses functions should be used
*/

// nothing in k and t should depends on z....
vec4 dpolar( float k , float t ){  return k*vec4(cos(t),sin(t),.0,.0);}

vec4 dmul( vec4 X , vec4 Y ){ return vec4(
    cmul(X.xy,Y.xy) ,
    cmul(X.xy,Y.zw)+cmul(X.zw,Y.xy) // product rule
); }

// special case where dY = 0, multiplication by constant
vec4 dmul( vec4 X , vec2 Y ){ return vec4(
    cmul(X.xy,Y.xy) ,
    cmul(X.zw,Y.xy)
); }

vec4 dsquared( vec4 X ){ return dmul(X,X); }

vec4 dinv( vec4 X ){ return vec4(
      cinv(X.xy) ,
      cdiv(-X.zw,csquared(X.xy)) // -dX/X²
); }

vec4 ddiv( vec4 X , vec4 Y ){ return vec4(
    cdiv(X.xy,Y.xy) ,
    cdiv( cmul(X.xy,Y.zw)-cmul(X.zw,Y.xy) ,csquared(Y.xy)) // division rule
); }


vec4 dchain( vec4 X , vec2 fX , vec2 dfX ){ return vec4(
    fX ,
    cmul(dfX,X.zw) // chain rule
); }

/*vec4 dlog( vec4 Z ){ return vec4(
    clog(Z.xy) ,
    cdiv(Z.zw,Z.xy) // chain rule + derivative is 1/Z
); }*/

vec4 dlog( vec4 Z ){ return dchain( Z , 
    clog(Z.xy) ,
    cinv(Z.xy) // derivative is 1/Z
); }

vec4 dexp( vec4 Z ){ return dchain( Z , 
    cexp(Z.xy) ,
    cexp(Z.xy) // derivative is the same function
); }

vec4 dpow( vec4 X , vec4 Y ){
	return dexp( dmul(dlog(X),Y ));
}

#define function_even(z,k) (dmul(k(z)+k(-z),d1*.5))
#define function_odd(z,k) (dmul(k(z)-k(-z),d1*.5))


vec4 dsin( vec4 X ){
    X = dmul(X,di);// remove this line for hyperbolic
	return function_odd( X , dexp );
}

vec4 dcos( vec4 X ){
    X = dmul(X,di); // remove this line for hyperbolic
	return function_even( X , dexp );
}

vec4 dtan( vec4 X ){
	return ddiv( dsin(X) , dcos(X) );
}

vec4 dacos( vec4 X ){
	return dmul( dlog(dpow(dsquared(X)-d1,.5*d1)+X) ,-di);
}


vec4 dzeta(vec4 Z)
{
    // algo from https://www.shadertoy.com/view/Ms2fWR
    // is it correct ?
    
    vec4 sum = vec4(.0);
    for(float i = 1.; i < 30.; ++i)
    {
        float li = log(i);
        float ck = cos(Z.y*li);
        float sk = sin(Z.y*li);
        //sum += sin(-Z.y * log(i) - vec2(1.57, 0.)) / pow(i, Z.x);
        //sum.xy -= vec2(cos(k),sin(k)) * pow(i, -Z.x);
        // crappy derivative... but works :p 
        //sum.zw -= vec2(sin(k),cos(k)) * pow(i, -Z.x) * log(i);
        sum -= vec4(ck,sk,sk*li,ck*li) * pow(i, -Z.x);
    }
    
     return vec4(sum.xy,sum.zw*24.);
}


/*
vec4 dtan( vec4 X ){
	return d1 - 2.*dinv( dexp( dmul(X,2.*di) ) + d1 );
}
*/
vec4 dasin( vec4 X ){
	return dmul( dlog(dpow(dsquared(X)+d1,.5*d1)+X) ,-di);
}

vec4 datan( vec4 X ){
	return dmul(dlog( 2.*dinv(d1 - X) - d1 ),-di*.5);
}


/**
geodesica functions
*/

vec2 cmoebius(vec2 z, vec2 a, vec2 b, vec2 c, vec2 d) {
    vec2 num = cmul(z, a) + b;
    vec2 den = cmul(z, c) + d;
    float s = 1. / max(length(num), length(den));
    num *= s;
    den *= s;
    return cdiv(num, den);
}

vec2 cmoebius(vec2 z, mat4 M) {
    return cmoebius(z, M[0].xy, M[1].xy, M[2].xy, M[3].xy);
}

vec2 cmoebiusInv(vec2 z, mat4 M) {
    return cmoebius(z, M[3].xy, -M[1].xy, -M[2].xy, M[0].xy);
}

// vec2 cmoebius(vec2 z, mat4 M) {
//     return cdiv(
//         cmul(z, M[0].xy) + M[1].xy,
//         cmul(z, M[2].xy) + M[3].xy
//     );
// }


vec4 dmoebius(vec4 z, vec4 a, vec4 b, vec4 c, vec4 d) {
    return ddiv(
        dmul(z, a) + b,
        dmul(z, c) + d
    );
}


vec4 dmoebius(vec4 z, mat4 M) {
    return dmoebius(z, M[0], M[1], M[2], M[3]);
}

vec4 dmoebiusInv(vec4 z, mat4 M) {
    return dmoebius(z, M[3], -M[1], -M[2], M[0]);
}




