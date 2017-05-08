const electron = require('electron');
const {app, BrowserWindow} = electron;
const path = require('path');
const url = require('url');
const settings = require('electron-settings');
const log = require('electron-log');
const {autoUpdater} = require("electron-updater");

require('electron-debug')({showDevTools: false});

// Logging
autoUpdater.logger = log;
autoUpdater.logger.transports.file.level = "info";
log.info('App Starting');


// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
require('electron-context-menu')();

let win;

function sendStatusToWindow(text) {
  log.info(text);
  win.webContents.send('message', text);
}

function createWindow () {
  const {width, height} = electron.screen.getPrimaryDisplay().workAreaSize
  // Create the browser window.
  var w = 1400;
  var h = 700;
  if (settings.has("system.windowsize")) {
    w = settings.get("system.windowsize.width");
    h = settings.get("system.windowsize.height");
    if (process.platform == "win32" && w == width && h == height) {
      w -= 10;
      h -= 10;
    }
    
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

  autoUpdater.checkForUpdates();
  require('./main-process/menu/mainmenu')
}

autoUpdater.on('checking-for-update', () => {
  sendStatusToWindow('Checking for update...');
})
autoUpdater.on('update-available', (ev, info) => {
  sendStatusToWindow('Update available.');
})
autoUpdater.on('update-not-available', (ev, info) => {
  sendStatusToWindow('Update not available.');
})
autoUpdater.on('error', (ev, err) => {
  sendStatusToWindow('Error in auto-updater.');
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  sendStatusToWindow(log_message);
})
autoUpdater.on('update-downloaded', (ev, info) => {
  sendStatusToWindow('Update downloaded; will install in 5 seconds');
});

autoUpdater.on('update-downloaded', (ev, info) => {
  // Wait 5 second, then quit and install
  setTimeout(function() {
    autoUpdater.quitAndInstall();
  }, 5000);
})

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
