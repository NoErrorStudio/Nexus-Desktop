const { app, nativeImage } = require('electron')
const Store = require('electron-store')
const path = require('path')

const schema = {
  'theme': {
    'enum': ['dark', 'light', 'azure', 'crimson', 'forest', 'synth'],
    'default': 'dark'
  },
  'hideApp': {
    'type': 'boolean',
    'default': true
  },
  'mainURL': {
    'type': 'string',
    'default': path.resolve('file://', __dirname, '..', 'static/404.html')
  }
}

const config = new Store({
  encryptionKey: 'lErKpfN9',
  fileExtension: 'nx',
  clearInvalidConfig: true,
  schema: schema
})

const mainURL = config.get('mainURL') || path.resolve('file://', __dirname, '..', 'static/404.html')

let mainWindow, splashScreen, settingsView, themeColor
const themeName = config.get('theme')
if (themeName === 'dark'){themeColor = '#222222'}
else if (themeName === 'light'){themeColor = '#cccccc'}
else if (themeName === 'azure'){themeColor = '#483d8b'}
else if (themeName === 'crimson'){themeColor = '#ed143d'}
else if (themeName === 'forest'){themeColor = '#008000'}
else if (themeName === 'synth'){themeColor = '#8400B8'}
else {themeColor = '#222222'}

const icon = nativeImage.createFromPath(path.resolve(__dirname, '..', 'img', 'nexus-logo.png'))

function createWindow () {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    title: 'Nexus',
    width: 800,
    height: 600,
    center: true,
    darkTheme: true,
    closable: true,
    fullscreenable: false,
    minimizable: true,
    autoHideMenuBar: true,
    titleBarStyle: 'hidden',
    frame: false,
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preloadIndex.js'),
      devTools: true
    },
    icon: icon
  })
  mainWindow.setBackgroundColor(themeColor)
}

let tray, view

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
const { BrowserWindow } = require('electron')
const electron = require("electron");

app.whenReady().then(() => {
  splashScreen = new BrowserWindow({
    width: 500,
    height: 300,
    frame: false,
    alwaysOnTop: false,
    webPreferences: {
      devTools: true
    },
    icon: icon
  });
  splashScreen.loadFile('./static/splash.html')
  splashScreen.center()

  const updater = require('./autoupdater')
  updater.init()

  createWindow()
  mainWindow.loadFile('./static/index.html')

  const { BrowserView } = require('electron')

  settingsView = new BrowserView({
    webPreferences: {
      preload: path.join(__dirname, 'preloadSettings.js'),
      devTools: true
    },
  })
  view = new BrowserView({
    webPreferences: {
      devTools: true
    }
  })
  settingsView.setAutoResize({width: true, height: true})
  view.setAutoResize({width: true, height: true,})
  settingsView.setBackgroundColor(themeColor)
  view.setBackgroundColor(themeColor)
  settingsView.webContents.loadFile('./static/settings.html')
  view.webContents.loadURL(mainURL)

  mainWindow.setBrowserView(settingsView)
  mainWindow.setBrowserView(view)

  mainWindow.webContents.executeJavaScript(`document.querySelector(".titlebar").style.background = "${themeColor}";`, true)
  view.webContents.executeJavaScript('localStorage.setItem("desktopApp", "true");', true)

  mainWindow.once('ready-to-show', () => {
    setTimeout(() => {
      splashScreen.close()
      mainWindow.center()
      mainWindow.show()
      mainWindow.maximize()
      settingsView.setBounds({x: 0, y: 31, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-31})
      view.setBounds({x: 0, y: 31, width: electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize.width, height: electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize.height-31})
    }, 100)
  })

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })

  const { Tray, Menu } = require('electron')
  tray = new Tray(icon)
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Open Nexus', type: 'normal', click: function(menuItem, browserWindow, event){
        if (mainWindow.hidden){mainWindow.show()}
        else {mainWindow.maximize()}
      } },
    { label: 'Hide Nexus', type: 'normal', click: function(menuItem, browserWindow, event){
        mainWindow.hide()
      } },
    { type: 'separator' },
    { label: 'Close and exit Nexus', type: 'normal', click: function(menuItem, browserWindow, event){
        app.quit()
      } }
  ])

  tray.setToolTip('Nexus')
  tray.setContextMenu(contextMenu)
  tray.on('double-click', function(event, bounds){
    mainWindow.maximize()
  })
  tray.on('click', function(event, bounds){
    mainWindow.maximize()
  })

  const { ipcMain } = require('electron')
  const ipc = ipcMain

  ipc.on('closeApp', () => {
    // console.log('Clicked close app')
    if (config.get('hideApp') === true){mainWindow.hide()}
    else {mainWindow.close()}
  })
  ipc.on('minApp', () => {
    // console.log('Clicked min app')
    mainWindow.minimize()
  })
  ipc.on('maxApp', () => {
    // console.log('Clicked max app')
    if (mainWindow.isMaximized()) {
      mainWindow.restore()
    } else {
      mainWindow.maximize()
    }
  })
  ipc.on('openSettings', () => {
    if (!settingsView){
      //
    }
    // update all setting values to their current value
    if (config.get('hideApp') === true){
      settingsView.webContents.executeJavaScript(`document.getElementById('switchHideApp').checked = true;`)
    }
    if (config.get('mainURL')){
      settingsView.webContents.executeJavaScript(`document.getElementById('nexusServerUrl').value = '${config.get("mainURL")}'`)
    }
    mainWindow.setBrowserView(settingsView)
  })
  ipc.on('closeSettings', () => {
    if (settingsView){
      mainWindow.setBrowserView(view)
    }
  })
  ipc.on('onHideApp', () => {
    settingsView.webContents.executeJavaScript(`document.getElementById('switchHideApp').checked;`).then((hideApp) => {
      config.set('hideApp', hideApp)
    })
  })
  const { dialog } = require('electron')
  ipc.on('serverUrlUpdate', (event, data) => {
    if (data.url !== config.get('mainURL')){
      config.set('mainURL', data.url)
      dialog.showMessageBox(mainWindow, {
        message: 'You need to restart the app before changes take effect.',
        type: 'warning',
        buttons: ['Restart now', 'Exit app'],
        defaultId: 0,
        title: 'Restart required',
        icon: icon
      }).then((obj) => {
        if (obj.response === 0){
          app.relaunch()
          app.exit()
        } else {mainWindow.close()}
      })
    }
  })

  mainWindow.on('close', function(){
    view.webContents.executeJavaScript('localStorage.getItem("theme");', true).then(theme => {
      if (theme !== themeName && theme !== null && theme !== undefined){
        config.set('theme', theme.toString())
        console.log('config saved!')
      }
      else {console.log('no changes!')}
    })
  })
  mainWindow.on('maximize', function(){
    view.setBounds({x: 0, y: 31, width: electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize.width, height: electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize.height-31})
    settingsView.setBounds({x: 0, y: 31, width: electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize.width, height: electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint()).workAreaSize.height-31})
  })
  mainWindow.on('unmaximize', function(){
    view.setBounds({x: 0, y: 31, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-31})
    settingsView.setBounds({x: 0, y: 31, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-31})
  })
  mainWindow.on('restore', function(){
    view.setBounds({x: 0, y: 31, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-31})
    settingsView.setBounds({x: 0, y: 31, width: mainWindow.getBounds().width, height: mainWindow.getBounds().height-31})
  })

  const { globalShortcut } = require('electron')
  globalShortcut.register('CommandOrControl+W', function(){})
  globalShortcut.register('Ctrl+Shift+I', function(){
    if (settingsView) {
      settingsView.webContents.openDevTools({mode: 'detach'})
    }
    else if (splashScreen) {
      splashScreen.webContents.openDevTools({mode: 'detach'})
    }
    else {
      mainWindow.webContents.openDevTools({mode: 'detach'})
    }
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

app.setAppUserModelId("Nexus")
