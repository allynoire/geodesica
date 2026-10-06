import { View } from "./js/view.js"
import { loadShaderSourceAsync } from "./js/loader.js"

const canvas = document.getElementById('canvas')
console.log(canvas)
const view = new View({ canvas })
const vs = await loadShaderSourceAsync("./shader/flat.vert")
const fs = await loadShaderSourceAsync("./shader/test.frag")

try {
    view.init(vs, fs)
    view.attach()
}
catch (e) {
    displayError(e)
}


function displayError(message) {
    const error = document.getElementById('error')
    error.innerText = message
}