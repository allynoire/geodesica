const includeRegex = /^#include\s+"(.+?)"$/gm;

const cache = new Map();


/**
 * 
 * @param {String} fileName
 * @param { { definitions: string[] } } options
 * @returns {Promise<String>}
 */
export async function loadShaderSourceAsync(fileName, definitions) {
    
    let shaderSource = await fetch(fileName)
        .then(res => res.ok ? res.text() : Promise.reject(`failed to load shader source '${fileName}'`))
    
    if (definitions) {
        const s = definitions.map(it => `#define ${it}\n`).join('')
        const idx = shaderSource.indexOf('\n') + 1;
        if (idx > 0) {
            shaderSource = shaderSource.substring(0, idx) + s + shaderSource.substring(idx);
        }
    }

    return inlineIncludes(shaderSource);
}


/**
 * 
 * @param {String} shaderSource 
 */
export async function inlineIncludes(shaderSource) {
    const includes = new Map();
    for (let match of shaderSource.matchAll(includeRegex)) {
        const fileName = match[1];
        includes.set(fileName, await load_shader_source_async(fileName));
    }
    return shaderSource.replaceAll(includeRegex, (_, fileName) => includes.get(fileName));
}
