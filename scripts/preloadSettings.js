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
    document.querySelector('#settingsCloseBtn').addEventListener('click', () => {
        ipc.send('closeSettings')
    })
    document.addEventListener('keyup', (event) => {
        if (event.key === 'Escape'){
            ipc.send('closeSettings')
        }
    })

    document.querySelector('#switchHideApp').addEventListener('click', () => {
        ipc.send('onHideApp')
    })
    document.querySelector('#nexusServerUrlBtn').addEventListener('click', () => {
        ipc.send('serverUrlUpdate', {url:document.querySelector('#nexusServerUrl').value})
    })
})
