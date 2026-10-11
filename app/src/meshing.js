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
export function createDiskModelGeodesic(a, b) {
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
 * Returns the polar angle of a vector in the range [0, 2π]
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

/**
 * 
 * @param {v3.Vec3} point 
 * @param {v3.Vec3} center
 * @param {number} radius 
 */
export function distancePointCircle(point, center, radius) {
    return v3.distance(point, center) - radius
}

export function distancePointLine(point, normal, distance) {
    return v3.dot(point, normal) - distance
}

/**
 * 
 * @param {v3.Vec3} a 
 * @param {v3.Vec3} b 
 */
export function boundsLineSegment(a, b) {
    const min_x = Math.min(a[0], b[0])
    const max_x = Math.max(a[0], b[0])
    const min_y = Math.min(a[1], b[1])
    const max_y = Math.max(a[1], b[1])
    return { min_x, max_x, min_y, max_y }
}

/**
 * 
 * @param {v3.Vec3} center 
 * @param {number} radius 
 * @param {number} fromAngle 
 * @param {number} toAngle 
 */
export function boundsCircularArc(a, b, center, radius) {   
    let min_x = Math.min(a[0], b[0])
    let max_x = Math.max(a[0], b[0])
    let min_y = Math.min(a[1], b[1])
    let max_y = Math.max(a[1], b[1])

    const [fromAngle, toAngle] = shortArcAngles(
        angle(v3.subtract(a, center)),
        angle(v3.subtract(b, center))
    )
    
    for (const angle of [0, 0.5 * Math.PI, Math.PI, 1.5 * Math.PI]) {
        // console.log(
        //     `(${a}) (${b}):`,
        //     `${deg(fromAngle)} < ${deg(angle)} < ${deg(toAngle)}:`,
        //     `${fromAngle < angle && angle < toAngle}`
        // )
        
        // TODO: find a better algorithm to check whether an angle is contained the short circualr arc.
        if (fromAngle < angle && angle < toAngle 
            || fromAngle < angle + TWO_PI && angle + TWO_PI <  toAngle
        ) {
            const extrema_x = center[0] + radius * Math.cos(angle)
            const extrema_y = center[1] + radius * Math.sin(angle)
            min_x = Math.min(min_x, extrema_x)
            max_x = Math.max(max_x, extrema_x)
            min_y = Math.min(min_y, extrema_y)
            max_y = Math.max(max_y, extrema_y)
        }
    }

    return { min_x, max_x, min_y, max_y }
}

function deg(rad) {
    return Math.round(rad / Math.PI * 180)
}

/**
 * 
 * @param {number} fromAngle angle in range [0, 2π]
 * @param {number} toAngle anglein range [0, 2π]
 */
function shortArcAngles(fromAngle, toAngle) {
    
    if (Math.abs(fromAngle - toAngle) < PI) {
        if (fromAngle < toAngle) {
            return [fromAngle, toAngle]
        }
        else {
            return [toAngle, fromAngle]
        }
    }
    else {
        if (fromAngle < toAngle) {
            return [toAngle, fromAngle + TWO_PI]
        }
        else {
            return [fromAngle, toAngle + TWO_PI]
        }
    }
}

/**
 * 
 * @param {[v3.Vec3]} points 
 */
export function createLineMesh(points) {

    const position = []
    const normal = []
    const indices = []
    const side = []

    let k = 0; // index counter

    for (let i = 1; i < points.length; i++) {

        // points of the current segment
        const p1 = points[i-1]
        const p2 = points[i]

        const n = v3.subtract(p2, p1)
        v3.normalize(n, n)
        perp(n, n)

        position.push(...p1); normal.push(...n); side.push(1)
        position.push(...p1); normal.push(...n); side.push(-1)

        position.push(...p2); normal.push(...n); side.push(1)
        position.push(...p2); normal.push(...n); side.push(-1)

        // push indices for quad
        indices.push(k, k+1, k+2)
        indices.push(k+1, k+3, k+2)
        k += 4;
    }

    return {
        position: new Float32Array(position),
        normal: new Float32Array(normal),
        side: { numComponents: 1, data: new Float32Array(side) },
        indices: new Uint32Array(indices),
    }
}