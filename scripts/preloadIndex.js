/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const {ipcRenderer} = require('electron')
const ipc = ipcRenderer

window.addEventListener('DOMContentLoaded', () => {
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape'){
            ipc.send('closeSettings')
        }
    })
    document.querySelector('#closeBtn').addEventListener('click', () => {
        ipc.send('closeApp')
    })
    document.querySelector('#minBtn').addEventListener('click', () => {
        ipc.send('minApp')
    })
    document.querySelector('#maxBtn').addEventListener('click', () => {
        ipc.send('maxApp')
    })
    document.querySelector('#menuBtn').addEventListener('click', () => {
        ipc.send('openSettings')
    })
})
