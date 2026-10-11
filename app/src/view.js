import * as twgl from 'twgl.js'
import { v3, m4 } from 'twgl.js';
import { boundsCircularArc, boundsLineSegment, createDiskModelGeodesic, createDiskModelTriangle, distancePointCircle, distancePointLine } from './meshing';
import { randRange } from './utility';
import earcut, { refine } from 'earcut';
import { Batch } from './batch';

import pointVS from './shader/point.vert'
import pointFS from './shader/point.frag'
import canvasVS from './shader/canvas.vert'
import testFS from './shader/test.frag'
import standartFS from './shader/standart.frag'
import standartVS from './shader/standart.vert'
import gridFS from './shader/grid.frag'
import geometryVS from './shader/geometry.vert'
import triangleFS from './shader/triangle.frag'

export class View {

    constructor({
        canvas
    }) {
        this.gl = twgl.getContext(canvas)
        // this.viewMatrix = m4.create()
        this.viewMatrix = m4.create()
        this.invViewMatrix = m4.create()
        this.resolution = v3.create()
        this.batch = new Batch()
        this.devicePixelRatio = window.devicePixelRatio
        this.screenToClipMatrix = m4.create()
        this.cursorPosition = v3.create()
        this.triangleVertices = [
            v3.create(randRange(-1, 1), randRange(-1, 1), 0),
            v3.create(randRange(-1, 1), randRange(-1, 1), 0),
            v3.create(randRange(-1, 1), randRange(-1, 1), 0)
        ]

        // this.triangleRenderer = new TriangleMeshRenderer(90)
        this.triangleRenderer = new TriangleImplicitRenderer()
    }

    init() {
        
        this.gl.enable(this.gl.CULL_FACE)
        this.program = twgl.createProgramInfo(this.gl, [canvasVS, gridFS])

        this.vertices = twgl.createBufferInfoFromArrays(this.gl, {
            indices: [ 0, 1, 2, 1, 3, 2 ],
            position: [
                -1, -1, 0, // bottom left
                1, -1, 0,  // bottom right
                -1, 1, 0,  // top left
                1, 1, 0,   // top right
            ]
        })

        this.point_program = twgl.createProgramInfo(this.gl, [pointVS, pointFS])

        const point_vertices = []
        const N = 10
        const M = 10
        for (let i = 0; i < N; i++) {
            for (let j = 0; j < M; j++) {
                point_vertices.push((i+0.5) / N)
                point_vertices.push((j+0.5) / N)
                point_vertices.push(0)
            }
        }

        this.points = twgl.createBufferInfoFromArrays(this.gl, {
            position: point_vertices
        })

        this.sphere = twgl.primitives.createSphereBufferInfo(this.gl, 1.0, 64, 64)

        this.standartProgramInfo = twgl.createProgramInfo(this.gl, [standartVS, standartFS])
    
        this.batch.init(this.gl)

        const circle = []
        const n = 10
        const r = 0.5
        for (let i = 0; i < n; i++) {
            const t = i / n * Math.PI * 2.0
            const x = r * Math.cos(t)
            const y = r * Math.sin(t)
            circle.push(x, y, 0)
        }
        

        this.triangleRenderer.init(this.gl)
    
    }

    attach() {
        this.resizeObserver ??= new ResizeObserver(this.resize.bind(this))
        this.resizeObserver.observe(this.gl.canvas)

        this.gl.canvas.addEventListener('pointermove', this.input.bind(this))
        document.addEventListener('keydown', this.input.bind(this))
        this.resize()
    }

    detach() {
        this.resizeObserver.disconnect()
    }

    /**
     * 
     * @param {KeyboardEvent} ev 
     */
    input(ev) {
        if (ev instanceof PointerEvent) {
            switch (ev.type) {
            case 'pointermove':
                v3.copy(
                    this.displayToWorld(ev.offsetX, ev.offsetY),
                    this.cursorPosition
                )
                break
            }
        }
        if (ev instanceof KeyboardEvent) {
            // if (ev.repeat) { return1 }

            switch (ev.key) {
            case '1': 
                this.triangleRenderer.setABC({a: this.cursorPosition})
                break
            case '2':
                this.triangleRenderer.setABC({b: this.cursorPosition})
                break
            case '3':
                this.triangleRenderer.setABC({c: this.cursorPosition})
                break
            }

        }
    }

    resize() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas, this.devicePixelRatio)
        
        const width = this.gl.canvas.width
        const height = this.gl.canvas.height
        console.log(`resized ${width}, ${height}`)
        
        this.gl.viewport(0, 0, width, height)
        
        const s = 3
        const w = s * width / width
        const h = s * height / width

        // update view matrix
        m4.ortho(
            -w, w,
            -h, h,
            -100, 100,
            this.viewMatrix
        )

        // update inverse view matrix
        m4.inverse(this.viewMatrix, this.invViewMatrix)

        // update screen to clip matrix
        m4.ortho(
            0, width,
            height, 0,
            -1, 1,
            this.screenToClipMatrix
        )

        requestAnimationFrame((time) => this.render(time))
    }

    async render(time) {

        const gl = this.gl

        const globalUniforms = {
            u_viewMatrix: this.viewMatrix,
            u_invViewMatrix: this.invViewMatrix,
            u_resolution: [ this.gl.canvas.width, this.gl.canvas.height],
            u_time: time,
        }

        gl.useProgram(this.program.program)
        twgl.setUniforms(this.program, globalUniforms)
        twgl.setBuffersAndAttributes(gl, this.program, this.vertices);
        twgl.drawBufferInfo(gl, this.vertices);

    
        const t = time * 0.001
        // this.triangleRenderer.setABC({
        //     c: v3.create(Math.cos(t), Math.sin(t), 0)
        // })

        this.triangleRenderer.render(gl, globalUniforms)
       

        // Draw points
        // gl.useProgram(this.point_program.program)
        // twgl.setUniforms(this.point_program, globalUniforms)
        // twgl.setBuffersAndAttributes(gl, this.point_program, this.points)
        // twgl.drawBufferInfo(gl, this.points, gl.POINTS)

        setTimeout(() => {
            requestAnimationFrame((time) => this.render(time))
        }, 10)
        
        // requestAnimationFrame((time) => this.render(time))
    }

    displayToWorld(x, y) {
        const pos = v3.create(x, y, 0)
        // display -> screen
        v3.mulScalar(pos, this.devicePixelRatio, pos)
        // screen -> world
        return this.screenToWorld(pos)
    }

    screenToWorld(screenPosition) {
        const pos = v3.copy(screenPosition)
        // screen -> clip space
        m4.transformPoint(
            this.screenToClipMatrix,
            pos, pos
        )
        // clip space -> world
        m4.transformPoint(
            this.invViewMatrix,
            pos, pos
        )
        return pos
    }

    world_to_screen() {}

}

/**
 * Mesh-based renderer for hyperbolic triangles.
 */
class TriangleMeshRenderer {

    constructor(numVertices) {
        this.numVertices = numVertices
        this.a = v3.create(0, 0.5, 0)
        this.b = v3.create(-.5, -.5, 0)
        this.c = v3.create(0, -0.5, 0)
        this.dirty = true
    }

    init(gl) {
        this.programInfo = twgl.createProgramInfo(gl, [geometryVS, testFS])
    }

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     */
    remesh(gl) {
        const {a, b, c, numVertices} = this
        const vertices = createDiskModelTriangle(a, b, c, numVertices)
        let indices = earcut(vertices, null, 3)
        refine(indices, vertices, 3)
        // indices = createWireframeIndices(indices)
        
        if (this.bufferInfo === undefined) {
            // create the buffer if it does not exist
            // NOTE: use gl.DYNAMIC_DRAW if buffer size changes
            this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
                position: { data: vertices, drawType: gl.STATIC_DRAW },
                indices: { data: indices, drawType: gl.STATIC_DRAW }
            })
        }
        else {
            console.assert(
                vertices.length == this.vertices.length,
                "position attribute buffer length does not match previous",
                `Expected ${this.vertices.length}, but got ${vertices.length}`
            )
1
            // update the existing buffer
            twgl.setAttribInfoBufferFromArray(gl,
                this.bufferInfo.attribs.a_position,
                vertices
            )

            // TODO: update index buffer (although probably not necesarry if the first triangulation is adequate)
            if (false) {
                console.assert(
                    indices.length == this.indices.length,
                    "Index buffer length does not match previous",
                    `Expected ${this.indices.length} but got ${indices.length}`
                )
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.bufferInfo.indices)
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.DYNAMIC_DRAW)
                this.bufferInfo.numElements = indices.length
            }
        }
        
        this.vertices = vertices
        this.indices = indices
    }

    render(gl, globalUniforms) {
        if (this.dirty || this.bufferInfo === undefined) {
            this.remesh(gl)
            this.dirty = false
        }

        gl.useProgram(this.programInfo.program)
        twgl.setUniforms(this.programInfo, globalUniforms)
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
        twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLE)
    }

    setABC({a, b, c}) {
        if (a !== undefined) {
            v3.copy(a, this.a)
            this.dirty = true
        }
        if (b !== undefined) {
            v3.copy(b, this.b)
            this.dirty = true
        }
        if (c !== undefined) {
            v3.copy(c, this.c)
            this.dirty = true
        }
    }
}

class TriangleImplicitRenderer {
    constructor() {
        this.a = v3.create(0, 0.5, 0)
        this.b = v3.create(0.5, 0, 0)
        this.c = v3.create(-0.5, 0, 0)
        this.dirty = true
    }

    init(gl) {
        this.programInfo = twgl.createProgramInfo(gl, [geometryVS, triangleFS])
        this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
            indices: [ 0, 1, 2, 1, 3, 2 ],
            position: [
                -1, -1, 0, // bottom left
                1, -1, 0,  // bottom right
                -1, 1, 0,  // top left
                1, 1, 0,   // top right
            ]
        })
        
        // this.aabbPorgramInfo = twgl.createProgramInfo(gl, [geometryVS, testFS])
        // this.aabbInfo = twgl.createBufferInfoFromArrays(gl, {
        //     indices: [ 0, 1, 2, 1, 3, 2 ],
        //     position: [
        //         -1, -1, 0, // bottom left
        //         1, -1, 0,  // bottom right
        //         -1, 1, 0,  // top left
        //         1, 1, 0,   // top right
        //     ]
        // })
    }

    refresh(gl) { 
        const { a, b, c } = this 
        const edges = []
        const bounds = []

        for (const [v1, v2, w] of [[a, b, c], [b, c, a], [c, a, b]]) {
            const g = createDiskModelGeodesic(v1, v2)
            if (g.type == 'line') {
                const sign = Math.sign(distancePointLine(w, g.normal, 0))
                edges.push(sign * g.normal[0], sign * g.normal[1], 0)
                bounds.push(boundsLineSegment(v1, v2))
            }
            else {
                const sign = Math.sign(distancePointCircle(w, g.center, g.radius))
                edges.push(g.center[0], g.center[1], sign * g.radius),
                bounds.push(boundsCircularArc(v1, v2, g.center, g.radius))
            }
        }


        this.uniforms = {
            u_edges: edges,
            u_vertices: [
                a[0], a[1],
                b[0], b[1],
                c[0], c[1]
            ]
        }

        const aabb = bounds.reduce((a, b) => ({
            min_x: Math.min(a.min_x, b.min_x),
            max_x: Math.max(a.max_x, b.max_x),
            min_y: Math.min(a.min_y, b.min_y),
            max_y: Math.max(a.max_y, b.max_y)
        }))

        // NOTE: not constraining this further to bounding box since we expect only valid triangles, further can be left undefined for bad triangles
        const aabbVertices = [
            aabb.min_x, aabb.min_y, 0,
            aabb.max_x, aabb.min_y, 0,
            aabb.min_x, aabb.max_y, 0,
            aabb.max_x, aabb.max_y, 0 
        ]

        // twgl.setAttribInfoBufferFromArray(gl,
        //     this.aabbInfo.attribs.a_position,
        //     aabbVertices
        // )

        twgl.setAttribInfoBufferFromArray(gl,
            this.bufferInfo.attribs.a_position,
            aabbVertices
        ) 
        
    }

    render(gl, globalUniforms) {
        if (this.dirty) {
            this.refresh(gl)
            this.dirty = false
        }

        // gl.useProgram(this.aabbPorgramInfo.program)
        // twgl.setUniforms(this.aabbPorgramInfo, globalUniforms)
        // twgl.setBuffersAndAttributes(gl, this.aabbPorgramInfo, this.aabbInfo)
        // twgl.drawBufferInfo(gl, this.aabbInfo)

        gl.useProgram(this.programInfo.program)
        twgl.setUniforms(this.programInfo, {
            ...globalUniforms,
            ...this.uniforms
        })
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
        twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLE)

        

    }

    setABC({a, b, c}) {
        if (a !== undefined) {
            v3.copy(a, this.a)
            this.dirty = true
        }
        if (b !== undefined) {
            v3.copy(b, this.b)
            this.dirty = true
        }
        if (c !== undefined) {
            v3.copy(c, this.c)
            this.dirty = true
        }
    }
}
