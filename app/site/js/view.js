import * as twgl from '../vendor/twgl-full.module.js'
import { v3, m4 } from '../vendor/twgl-full.module.js';

export class View {

    constructor({
        canvas
    }) {
        this.gl = twgl.getContext(canvas)
        this.projectionMatrix = m4.create()
    }

    init(fs, vs) {
        this.program = twgl.createProgramInfo(this.gl, [fs, vs])
        this.vertices = twgl.createBufferInfoFromArrays(this.gl, {
            'indices': [ 0, 1, 2, 3, 1, 2 ],
            'position': [
                -1, -1, 0, 
                -1, 1, 0, 
                1, -1, 0,
                1, 1, 0,
            ]
        })

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
        // twgl.resizeCanvasToDisplaySize(this.gl.canvas, window.devicePixelRatio)
        this.gl.viewport(0, 0, this.gl.canvas.width, this.gl.canvas.height)
        this.render()
    }

    render() {
        this.gl.useProgram(this.program.program)
        twgl.setBuffersAndAttributes(this.gl, this.program, this.vertices);
        twgl.drawBufferInfo(this.gl, this.vertices);
    }

    screen_to_world() {}

    world_to_screen() {}



}