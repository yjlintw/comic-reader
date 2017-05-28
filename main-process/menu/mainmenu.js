const {app, Menu} = require('electron')
const path = require('path')
// var openAboutWindow = require('about-window').default;
// Support only macOS for now. Don't have a windows machine to test the menu.
if (process.platform === 'darwin') {
    const name = app.getName()
    template = [{
        label: name,
        submenu: [
            {
                label: `About ${name}`,
                click: function(item, focusedWindow) { 
                    console.log(focusedWindow.webContents);
                    let main_web_contents = focusedWindow.webContents;
                    main_web_contents.send("open-about");
                }
            },
            { type: 'separator' },
            {
                label: 'Preferences',
                accelerator: (function() {
                    if (process.platform === 'darwin') {
                        return 'Command+,';
                    }
                })(),
                click: function(item, focusedWindow) { 
                    console.log(focusedWindow.webContents);
                    let main_web_contents = focusedWindow.webContents;
                    main_web_contents.send("open-about");
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
    }, {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]}
    ]
    const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(menu)
}


