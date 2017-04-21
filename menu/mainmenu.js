const {app, Menu} = require('electron')
const path = require('path')
var openAboutWindow = require('about-window').default;

// Support only macOS for now. Don't have a windows machine to test the menu.
if (process.platform === 'darwin') {
    const name = app.getName()
    template = [{
        label: name,
        submenu: [{
            label: `About ${name}`,
            click() { 
                openAboutWindow({
                    win_options: {minimizable: false, maximizable: false, fullscreen: false},
                    icon_path: path.join('file://', __dirname, '../assets/icons/icon.png')
                })
            }
        },
        {
            type: 'separator'
        },
        {
            role: 'quit'
        }]
    }]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}

