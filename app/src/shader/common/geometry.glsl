const float TOL = 1e-6;

float lengthSq(vec2 z) { return dot(z, z); }

vec2 perp(vec2 z) { return vec2(-z.y, z.x); }

vec2 reflectOnGeodesic(vec2 z, vec3 G) {
    if (G.z == 0.0) {
        return z - G.xy * 2.0 * dot(z, G.xy);
    } 
    else {
        z -= G.xy;
        G.z /= lengthSq(z);
        return z * G.z + G.xy;
    }
}

float sdLine(vec2 z, vec3 l) { return dot(z, l.xy) - l.z; }

vec2 reflectOnLine(vec2 p, vec3 L) {
    return p - L.xy * sdLine(p, L) * 2.0;
}

float sdCircle(vec2 v, vec3 c) { return length(v - c.xy) - sqrt(c.z); }

float sdGeodesic(vec2 z, vec3 G) { 
    return G.z == 0.0 ? sdLine(z, G) : sdCircle(z, G);
}

vec3 createPolar(vec2 p) { return vec3(p.xy, -0.5 * dot(p, p) - 0.5); }

vec3 createGeodesic(vec2 p, vec2 q) {
    vec3 l1 = createPolar(p);
    vec3 l2 = createPolar(q);
    vec3 a = cross(l1, l2); // intersect
    if (abs(a.z) < TOL) {
        vec2 n = normalize(perp(p-q));
        return vec3(n, 0.0);
    }
    else {
        vec2 c = a.xy / a.z;
        float r2 = lengthSq(c - p);
        return vec3(c, r2);
    }
}

vec3 createLine(vec2 p, vec2 q) {
    vec2 n = normalize(perp(q - p));
    return vec3(n, dot(n, p));
}