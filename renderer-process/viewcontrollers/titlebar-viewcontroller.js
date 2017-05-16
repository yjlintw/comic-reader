let pjson = require('../../package.json');
const remote = require('electron').remote;
let titlebar = require('../components/titlebar')({
    iswin: process.platform == 'win32'
    // iswin: true
});

let _is_maximized = false;

function updateTitle() {
    if ($('#read-view').hasClass('is-hidden')) {
        setTitle(pjson.productName);
    } else {
        let comicTitle = $('#comic-header').attr('title');
        let episode = $('.chapter-entry.active').text();
        setTitle(comicTitle, [episode]);
    }
}

function setTitle(name, options) {
    let result = name;
    if (options !== undefined) {
        let subtitle = options.join('-');
        result += '-' + subtitle;

    }
    $("#titlebar-title").text(result);
}


function lateInit() {
    titlebar.appendTo(document.querySelector('#titlebar'))
        .on('close', function() {
            let window = remote.getCurrentWindow();
            window.close();
        })
        .on('minimize', function() {
            let window = remote.getCurrentWindow();
            window.minimize();
        })
        .on('fullscreen', function() {
            let window = remote.getCurrentWindow();
            window.setFullScreen(!window.isFullScreen());
        
        })
        .on('maximize', function() {
            let window = remote.getCurrentWindow();
            console.log(window.isMaximized());
            // console.log(window.isMaximizable());
            _is_maximized == process.platform == 'win32' ? _is_maximized : window.isMaximized();
            if (_is_maximized) {
                window.unmaximize();
                _is_maximized = false;
            } else {
                window.maximize();
                _is_maximized = true;
                console.log(window.isMaximized());
            }
        });
    setTitle(pjson.productName);
}


$(document).ready(lateInit);

/**
 *      Interface
 */
module.exports = {
    updateTitle: updateTitle
}