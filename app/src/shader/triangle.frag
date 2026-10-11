#version 300 es

precision mediump float;

const mat3 COLORS = mat3(
    vec3(1, 0, 0),
    vec3(0, 1, 0),
    vec3(0, 0, 1)
);

uniform vec3[3] u_edges;    // the triangle edges
uniform vec2[3] u_vertices; // the triangle vertices

in vec2 v_coord;

out vec4 o_color;

float sdLine(vec2 pos, vec3 line) { 
    return dot(pos, line.xy) - line.z; 
}


float sdCircle(vec2 pos, vec3 circle) { 
    return sign(circle.z) * (length(pos - circle.xy) - abs(circle.z)); 
}

float sdEdge(vec2 pos, vec3 edge) {
    return edge.z == 0.0 ? sdLine(pos, edge) : sdCircle(pos, edge);
}

float distanceDiskModel(vec2 u, vec2 v) {
    float num = 2.0 * dot(u-v, u-v);
    float div = (1.0 - dot(u,u)) * (1.0 - dot(v,v));
    return acosh(1.0 + num / div);
}

vec3 gyrobarycentric(vec2 pos) {
    vec3 d = vec3(
        distanceDiskModel(pos, u_vertices[0]),
        distanceDiskModel(pos, u_vertices[1]),
        distanceDiskModel(pos, u_vertices[2])
    );
    vec3 w = 1.0 / sinh(d);
    return w / (w.x + w.y + w.z);
}

void main() {

    vec2 pos = v_coord;
    
    // discard if outside the unit circle
    if (dot(pos, pos) > 1.0) { discard; }

    // find min distance
    float dist = min(
        sdEdge(pos, u_edges[0]), 
        min(sdEdge(pos, u_edges[1]), sdEdge(pos, u_edges[2]))
    );

    // anti-aliasing distance
    // NOTE: we push the edge slightly outwards, instead of inwards.
    //       this avoids a visible gap between two adjacent triangles.
    float aawidth = fwidth(dist);

    // discrard the fragment if it is outside the triangle
    if (dist < -aawidth) { discard;}

    // interpolating vertex colors
    vec3 w = gyrobarycentric(pos);
    vec3 color = COLORS * w;

    // anti aliasing
    float a  = smoothstep(-aawidth, 0.0, dist);

    // NOTE: using premultiplied alpha
    o_color = vec4(color, 1) * a; 
}


