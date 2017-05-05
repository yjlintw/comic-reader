const {app, BrowserWindow} = require('electron');
const path = require('path');
const url = require('url');
const settings = require('electron-settings');
require('electron-debug')({showDevTools: false});
console.log(app.getAppPath())
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
require('electron-context-menu')();

let win;

function createWindow () {
  // Create the browser window.
  var w = 1400;
  var h = 700;
  if (settings.has("system.windowsize")) {
    w = settings.get("system.windowsize.width");
    h = settings.get("system.windowsize.height");
  }
  win = new BrowserWindow({
    width: w,
    height: h,
    frame: false,
    transparent: true,
    // resizable: true,
    // maximizable: true,
    icon: path.join(__dirname, 'assets/icons/icon.icns'),
    webPreferences: {
      blinkFeatures: 'OverlayScrollbars'
    }
  })

  // win.setMaximizable(true);
  // console.log(win.getBounds());
  // and load the index.html of the app.
  win.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  // win.webContents.openDevTools()

  // Emitted when the window is closed.
  win.on('close', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    var bounds = win.getBounds();
    settings.set("system.windowsize.width", bounds.width);
    settings.set("system.windowsize.height", bounds.height);
  })

  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.

    win = null
  })

  require('./main-process/menu/mainmenu')
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  // On macOS it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (win === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
