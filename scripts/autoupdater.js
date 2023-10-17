const { autoUpdater } = require('electron-updater')

// const updateURL = 'https://raw.githubusercontent.com/jvherck/nexus-desktop/main/win.json'

module.exports = {
    init,
    autoUpdater
}

autoUpdater.logger = require("electron-log")
autoUpdater.logger.transports.file.level = "info"

autoUpdater.autoDownload = true
autoUpdater.allowPrerelease = false
autoUpdater.allowDowngrade = false
autoUpdater.autoRunAppAfterInstall = false

function init(){
    console.log('initialised update checking')
    logEvents()
    autoUpdater.checkForUpdates()
    autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall()
    })
}

function logEvents(){
    autoUpdater.on('checking-for-update', () => {
        console.log('checking-for-updates')
    })
    autoUpdater.on('update-available', () => {
        console.log('update-available')
        autoUpdater.downloadUpdate()
    })
    autoUpdater.on('update-not-available', () => {
        console.log('update-not-available')
    })
    autoUpdater.on('update-downloaded', () => {
        console.log('update-downloaded')
    })
    autoUpdater.on('error', (obj) => {
        console.log(obj)
    })
}