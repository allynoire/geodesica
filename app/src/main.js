import { View } from './view.js'
import * as twgl from 'twgl.js'

twgl.setDefaults({ 
    attribPrefix: 'a_' 
});

const canvas = document.getElementById('canvas')

const view = new View({ canvas })

try {
    view.init()
    view.attach()
}
catch (e) {
    displayError(e)
}

function displayError(message) {
    const error = document.getElementById('error')
    error.innerText = message
}
