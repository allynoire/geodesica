import { setTextureParameters, v3 } from "twgl.js";

const PI = Math.PI
const TWO_PI = 2 * PI

export function createWireframeIndices(triangleIndices) {
    const lines = [];
    const seenEdges = new Set();

    for (let i = 0; i < triangleIndices.length; i += 3) {
        const a = triangleIndices[i];
        const b = triangleIndices[i + 1];
        const c = triangleIndices[i + 2];

        const edges = [[a, b], [b, c], [c, a]];

        for (const [v1, v2] of edges) {
            const edgeKey = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
            
            if (!seenEdges.has(edgeKey)) {
                seenEdges.add(edgeKey);
                lines.push(v1, v2);
            }
        }
    }

    return new Uint16Array(lines);
}


export function createOrderColor(numVertices) {
    const color = []
    for (let i = 0; i < numVertices; i++) {
        const shade = i / numVertices
        color.push(shade, shade, shade)
    }
    return new Float32Array(color)
}

/**
 * Creates evenly spaced vertices on a circular arc.
 * Starting from `fromAngle` following the shortest arc until `toAngle`.
 * NOTE: Excludes the vertex at `toAngle`.
 * @param {v3.Vec3} center 
 * @param {number} fromAngle 
 * @param {number} toAngle 
 * @param {number} numVertices
 */
export function createShortArc(
    centerX, 
    centerY, 
    radius, 
    fromAngle, 
    toAngle, 
    numVertices
) {
    const n = numVertices
    const vertices = new Float32Array(n * 3)

    let diff = toAngle - fromAngle
    diff = ((diff + Math.PI) % (2 * Math.PI)) - Math.PI;
    if (diff < -Math.PI) diff += 2 * Math.PI;

    for (let i = 0; i < n; i++) {
        const t = diff * (i / n) + fromAngle
        vertices[i*3 + 0] = centerX + radius * Math.cos(t)
        vertices[i*3 + 1] = centerY + radius * Math.sin(t)
        vertices[i*3 + 2] = 0 
    }

    return vertices
}

/**
 * 
 * @param {v3.Vec3} a 
 * @param {v3.Vec3} b 
 * @param {v3.Vec3} c 
 */
export function createDiskModelTriangle(a, b, c, numVertices) {
    
    const nums = partitionEvenly(numVertices, 3)
    const edges = [
        [a, b, nums[0]],
        [b, c, nums[1]],
        [c, a, nums[2]]
    ]
    const vertices = []
    // console.log(nums)
    
    for (const [v1, v2, n] of edges) {

        const g = createDiskModelGeodesic(v1, v2)
        
        switch (g.type) {
            case 'line':
                for (let i = 0; i < n; ++i) {
                    const v = v3.lerp(v1, v2, i / n)
                    vertices.push(...v)
                }
                break
            case 'arc':
                let fromAngle = angle(v3.subtract(v1, g.center))
                let toAngle = angle(v3.subtract(v2, g.center))
         
                const vs = createShortArc(
                    g.center[0],
                    g.center[1],
                    g.radius,
                    fromAngle,
                    toAngle,
                    n
                )

                vertices.push(...vs)
                break
        }
        
    }
    
    console.assert(
        vertices.length % 3 == 0, 
        "vertices must have 3 components"
    )
    console.assert(
        vertices.length / 3 == numVertices, 
        "generated incorrect number of vertices"
    )

    return new Float32Array(vertices)
}

/**
 * @param {v3} v
 */
function createPolar(v) {
    return v3.create(v[0], v[1], -0.5 * v3.lengthSq(v) - 0.5)
}

/**
 * 
 * @param {v3} a 
 * @param {v3} b 
 */
function createDiskModelGeodesic(a, b) {
    const l1 = createPolar(a)
    const l2 = createPolar(b)
    const x = v3.cross(l1, l2)
    if (Math.abs(x[2]) < 1e-6) {
        // if a, b are collinear
        const tangent = v3.subtract(a, b)
        v3.normalize(tangent, tangent)
        const normal = perp(tangent)
        
        return { type: 'line',  normal, tangent }
    }
    else {
        const center = v3.create(
            x[0] / x[2],
            x[1] / x[2],
            0
        )
        const radius = v3.length(v3.subtract(center, a))

        return { type: 'arc', center, radius }
    }
}

/**
 * 
 * @param {v3.Vec3} v 
 */
function angle(v) {
    let theta = Math.atan2(v[1], v[0]) // range [-pi, pi]
    if (theta < 0.0) { theta += Math.PI * 2.0 } // range [0, 2pi]
    return theta
}

function perp(v, dst) {
    if (dst === undefined) { dst = v3.create() }
    const x = -v[1]
    const y = v[0]
    dst[0] = x
    dst[1] = y
    return dst
}

function partitionEvenly(n, k) {
    const div = Math.floor(n / k)
    const rem = Math.floor(n % k)
    const arr = new Array(k)
    for (let i = 0; i < arr.length; ++i) {
        arr[i] = div + (i < rem ? 1 : 0)
    }
    return arr
}