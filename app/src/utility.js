import * as twgl from 'twgl.js'

/**
 * 
 * @param {WebGL2RenderingContext} gl 
 * @param {twgl.BufferInfo} bufferInfo 
 */
export function deleteBufferInfo(gl, bufferInfo) {
    for (const attrib of Object.values(bufferInfo.attribs)) {
        gl.deleteBuffer(attrib.buffer)
    }
    if (bufferInfo.indices !== undefined) {
        gl.deleteBuffer(bufferInfo.indices)
    }
}

export function randRange(a, b) {
    return (b-a) * Math.random() + a
}