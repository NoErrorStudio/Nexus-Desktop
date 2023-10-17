/**
 * The preload script runs before. It has access to web APIs
 * as well as Electron's renderer process modules and some
 * polyfilled Node.js functions.
 *
 * https://www.electronjs.org/docs/latest/tutorial/sandbox
 */
const {ipcRenderer} = require('electron')
const ipc = ipcRenderer

const title = document.getElementById('title')
ipcRenderer.on('update-available', () => {
    title.innerHTML = '<b>Preparing to update...<b/>';
})
ipcRenderer.on('update-progress', (event, progressObj) => {
    title.innerHTML = `
        <b>Downloading updates...<b/><br />
        <span>${progressObj.percent}% - ${progressObj.transferred}/${progressObj.total} - ${progressObj.bytesPerSecond}</span>
        `
})
