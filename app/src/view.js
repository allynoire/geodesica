import * as twgl from 'twgl.js'
import { v3, m4 } from 'twgl.js';

import pointVS from './shader/point.vert'
import pointFS from './shader/point.frag'
import canvasVS from './shader/canvas.vert'
import testFS from './shader/test.frag'
import standartFS from './shader/standart.frag'
import standartVS from './shader/standart.vert'

export class View {

    constructor({
        canvas
    }) {
        this.gl = twgl.getContext(canvas)
        // this.viewMatrix = m4.create()
        this.viewMatrix = m4.create()
        this.invViewMatrix = m4.create()
    }

    init() {
        this.program = twgl.createProgramInfo(this.gl, [canvasVS, testFS])
        this.vertices = twgl.createBufferInfoFromArrays(this.gl, {
            'indices': [ 0, 1, 2, 3, 1, 2 ],
            'position': [
                -1, -1, 0, 
                -1, 1, 0, 
                1, -1, 0,
                1, 1, 0,
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
            position: generate()
        })

        this.sphere = twgl.primitives.createSphereBufferInfo(this.gl, 0.5, 16, 16)

        this.standartProgramInfo = twgl.createProgramInfo(this.gl, [standartVS, standartFS])
    }

    attach() {
        this.resizeObserver ??= new ResizeObserver(this.resize.bind(this))
        this.resizeObserver.observe(this.gl.canvas)
        
        this.resize()
    }

    detach() {
        this.resizeObserver.disconnect()
    }

    resize() {
        twgl.resizeCanvasToDisplaySize(this.gl.canvas, window.devicePixelRatio)
        
        const width = this.gl.canvas.width
        const height = this.gl.canvas.height
        
        this.gl.viewport(0, 0, width, height)
        
        const s = 3
        const w = s * width / width
        const h = s * height / width

        // update view matrix
        m4.ortho(
            -w, w,
            -h, h,
            0.1, 100,
            this.viewMatrix
        )

        // update inverse view matrix
        m4.inverse(this.viewMatrix, this.invViewMatrix)

        requestAnimationFrame((time) => this.render(time))
    }

    async render(time) {

        const gl = this.gl

        const uniforms = {
            u_viewMatrix: this.viewMatrix,
            u_invViewMatrix: this.invViewMatrix,
            u_time: time
        }

        gl.useProgram(this.program.program)
        twgl.setUniforms(this.program, uniforms)
        twgl.setBuffersAndAttributes(gl, this.program, this.vertices);
        twgl.drawBufferInfo(gl, this.vertices);


        gl.useProgram(this.point_program.program)
        twgl.setUniforms(this.point_program, uniforms)
        twgl.setBuffersAndAttributes(gl, this.point_program, this.points)
        twgl.drawBufferInfo(gl, this.points, gl.POINTS)

        gl.useProgram(this.standartProgramInfo.program)
        twgl.setUniforms(this.standartProgramInfo, uniforms)
        twgl.setBuffersAndAttributes(gl, this.standartProgramInfo, this.sphere)
        twgl.drawBufferInfo(gl, this.sphere)

        requestAnimationFrame((time) => this.render(time))
    }

    screen_to_world() {}

    world_to_screen() {}

}


function generate() {
    const a = v3.create(0, 0, 0)
    const b = v3.create(1, 0, 0)
    const c = v3.create(0, 1, 0)
    
    const triangles = [ {a, b, c} ]

    


    return new Float32Array(triangles.flatMap(({a, b, c}) => [
        ...a, ...b, ...c
    ]))
}


