const {app, Menu} = require('electron')
const path = require('path')
var openAboutWindow = require('about-window').default;

// Support only macOS for now. Don't have a windows machine to test the menu.
if (process.platform === 'darwin') {
    const name = app.getName()
    template = [{
        label: name,
        submenu: [
            {
                label: `About ${name}`,
                click() { 
                    openAboutWindow({
                        win_options: {minimizable: false, maximizable: false, fullscreen: false},
                        icon_path: path.join('file://', __dirname, '../../assets/icons/icon.png')
                    })
                }
            },
            {
                label: 'Toggle Developer Tools',
                accelerator: (function () {
                    if (process.platform === 'darwin') {
                        return 'Alt+Command+I'
                    } else {
                        return 'Ctrl+Shift+I'
                    }
                })(),
                click: function (item, focusedWindow) {
                if (focusedWindow) {
                    focusedWindow.toggleDevTools()
                }
                }
            },
            { type: 'separator' },
            { role: 'quit' }
        ]
    }]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

