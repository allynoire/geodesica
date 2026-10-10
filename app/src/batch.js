import * as twgl from 'twgl.js'

import canvasVS from './shader/canvas.vert'
import testFS from './shader/test.frag'
import standartVS from './shader/standart.vert'
import standartFS from './shader/standart.frag'
import geometryVS from './shader/geometry.vert'
import earcut, { refine } from 'earcut'
import { createDiskModelTriangle, createWireframeIndices } from './meshing'
import { deleteBufferInfo } from './utility'

export class Batch {

    constructor() {
        this.vertices = []
        this.indicies = []
        this.wireframe = false
        this.dirty = true
    }

    init(gl) {
        this.programInfo = twgl.createProgramInfo(gl, [geometryVS, testFS])
    }

    drawTriangle(a, b, c) {
        this.indicies.push(this.vertices.length)
        this.vertices.push(...a)
        this.indicies.push(this.vertices.length)
        this.vertices.push(...b)
        this.indicies.push(this.vertices.length)
        this.vertices.push(...c)
        this.dirty = true
    }


    drawPolygon(vertices) {
        const indices = earcut(vertices, null, 3)
        refine(indices, vertices, 3)
        this.vertices.push(...vertices)
        this.indicies.push(...indices)
        
        this.dirty = 21
    }

    clear() {
        this.vertices = []
        this.indicies = []
        this.dirty = true
    }

    /**
     * 
     * @param {WebGL2RenderingContext} gl 
     * @param {*} globalUniforms 
     * @returns 
     */
    render(gl, globalUniforms) {
        if (this.vertices.length == 0) { return }
    
        if (this.dirty) {

            if (this.bufferInfo !== undefined) {
                deleteBufferInfo(gl, this.bufferInfo)
            }
            
            this.bufferInfo = twgl.createBufferInfoFromArrays(gl, {
                position: this.vertices,
                indices: this.wireframe ? createWireframeIndices(this.indicies) : this.indicies,
            })
            
            this.dirty = false
        }

        gl.useProgram(this.programInfo.program)
        twgl.setUniforms(this.programInfo, globalUniforms)
        twgl.setBuffersAndAttributes(gl, this.programInfo, this.bufferInfo)
        twgl.drawBufferInfo(gl, this.bufferInfo, this.wireframe ? gl.LINES : gl.TRIANGLES)

    }

}