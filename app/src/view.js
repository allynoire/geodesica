import * as twgl from 'twgl.js'
import { v3, m4 } from 'twgl.js';
import { boundsCircularArc, boundsLineSegment, createDiskModelGeodesic, createDiskModelTriangle, distancePointCircle, distancePointLine } from './meshing';
import { randRange, randVec } from './utility';
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
        this.projectionMatrix = m4.identity()
        this.invProjectionMatrix = m4.identity()
        this.viewMatrix = m4.scaling(v3.create(1/3, 1/3, 1/3))
        this.invViewMatrix = m4.identity()
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
        // this.triangleRenderer = new TriangleImplicitRenderer()
        this.renderers = []

        for (let i = 0; i < 2; i++) {
            this.renderers.push(new TriangleImplicitRenderer())
            // this.renderers.push(new TriangleMeshRenderer(30))
        }
    }

    init() {
        
        const gl = this.gl

        gl.enable(gl.CULL_FACE)

        this.programs = twgl.createProgramInfos(gl, {
            point: [pointVS, pointFS],
            triangle: [geometryVS, triangleFS],
            standart: [standartVS, standartFS],
            grid: [canvasVS, gridFS]
        })

        this.quadInfo = twgl.createBufferInfoFromArrays(this.gl, {
            indices: [ 0, 1, 2, 1, 3, 2 ],
            position: [
                -1, -1, 0, // bottom left
                1, -1, 0,  // bottom right
                -1, 1, 0,  // top left
                1, 1, 0,   // top right
            ]
        })

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


        for (const renderer of this.renderers) {
            renderer.init(this.gl, this.programs)
        }
    }

    attach() {
        this.resizeObserver ??= new ResizeObserver(this.resize.bind(this))
        this.resizeObserver.observe(this.gl.canvas)

        this.gl.canvas.addEventListener('pointermove', this.input.bind(this))
        this.gl.canvas.addEventListener('wheel', this.input.bind(this))
        
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

                if (ev.buttons & 1 == 1) {

                    const delta = v3.create(ev.movementX, ev.movementY, 0);
                    
                    v3.mulScalar(delta, this.devicePixelRatio, delta)
                    
                    m4.transformDirection(
                        this.screenToClipMatrix,
                        delta, delta
                    )

                    m4.transformDirection(
                        this.invProjectionMatrix,
                        delta, delta
                    )

                    m4.transformDirection(
                        this.invViewMatrix,
                        delta, delta
                    )

                    m4.translate(this.viewMatrix, delta, this.viewMatrix)
                }
                break
            }
        }
        if (ev instanceof WheelEvent) {
            const SCALE_FACTOR = 1.1

            const s = ev.deltaY > 0 ? (1 / SCALE_FACTOR) : SCALE_FACTOR
            const scale = v3.create(s, s, s)

            const offset = v3.mulScalar(this.cursorPosition, (1 - s))

            m4.translate(this.viewMatrix, offset, this.viewMatrix)
            m4.scale(this.viewMatrix, scale, this.viewMatrix)
        }
        if (ev instanceof KeyboardEvent) {
            // if (ev.repeat) { return1 }

            const a = this.renderers[0]
            const b = this.renderers[1]
            switch (ev.key) {
            case '1': 
                a.setABC({a: this.cursorPosition})
                break
            case '2':
                a.setABC({b: this.cursorPosition})
                b.setABC({b: this.cursorPosition})
                break
            case '3':
                a.setABC({c: this.cursorPosition})
                b.setABC({c: this.cursorPosition})
                break
            case '4':
                b.setABC({a: this.cursorPosition})
            }

        }
    }

    resize() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas, this.devicePixelRatio)
        
        const width = this.gl.canvas.width
        const height = this.gl.canvas.height
        console.log(`resized ${width}, ${height}`)
        
        this.gl.viewport(0, 0, width, height)
        
        const w = width / width
        const h = height / width

        // update view matrix
        m4.ortho(
            -w, w,
            -h, h,
            -100, 100,
            this.projectionMatrix
        )

        // update inverse view matrix
        m4.inverse(this.projectionMatrix, this.invProjectionMatrix)

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

        m4.inverse(this.viewMatrix, this.invViewMatrix)

        const globalUniforms = {
            u_projectionMatrix: this.projectionMatrix,
            u_invProjectionMatrix: this.invProjectionMatrix,
            u_viewMatrix: this.viewMatrix,
            u_invViewMatrix: this.invViewMatrix,
            u_resolution: [ this.gl.canvas.width, this.gl.canvas.height],
            u_time: time,
        }

        gl.useProgram(this.programs.grid.program)
        twgl.setUniforms(this.programs.grid, globalUniforms)
        twgl.setBuffersAndAttributes(gl, this.programs.grid, this.quadInfo);
        twgl.drawBufferInfo(gl, this.quadInfo);

        for (const renderer of this.renderers) {
            // renderer.setABC({
            //     a: randVec(),
            //     b: randVec(),
            //     c: randVec()
            // })
            renderer.render(gl, globalUniforms)
        }
       
        // setTimeout(() => {
        //     requestAnimationFrame((time) => this.render(time))
        // }, 1000)
        
        requestAnimationFrame((time) => this.render(time))
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
        // clip space -> view
        m4.transformPoint(
            this.invProjectionMatrix,
            pos, pos
        )
        // view -> world
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

    init(gl, programs) {
        this.programInfo = programs.triangle
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

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {*} globalUniforms 
     */
    render(gl, globalUniforms) {
        if (this.dirty) {
            this.refresh(gl)
            this.dirty = false
        }

        // gl.useProgram(this.aabbPorgramInfo.program)
        // twgl.setUniforms(this.aabbPorgramInfo, globalUniforms)
        // twgl.setBuffersAndAttributes(gl, this.aabbPorgramInfo, this.aabbInfo)
        // twgl.drawBufferInfo(gl, this.aabbInfo)

        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.useProgram(this.programInfo.program)
        twgl.setUniforms(this.programInfo, {
            ...globalUniforms,
            ...this.uniforms
        })
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
        twgl.drawBufferInfo(gl, this.bufferInfo, gl.TRIANGLE)

        gl.disable(gl.BLEND)

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
