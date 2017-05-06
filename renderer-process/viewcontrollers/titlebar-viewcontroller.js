var pjson = require('../../package.json');
const remote = require('electron').remote;
var titlebar = require('../components/titlebar')({
    iswin: process.platform == 'win32'
    // iswin: true
});

module.exports = {
    updateTitle: updateTitle
}

var _is_maximized = false;

function updateTitle() {
    if ($('#read-view').hasClass('is-hidden')) {
        setTitle(pjson.productName);
    } else {
        var comicTitle = $('#comic-header').attr('title');
        var episode = $('.chapter-entry.active').text();
        setTitle(comicTitle, [episode]);
    }
}

function setTitle(name, options) {
    var result = name;
    if (options !== undefined) {
        var subtitle = options.join('-');
        result += '-' + subtitle;

    }
    $("#titlebar-title").text(result);
}


function lateInit() {
    titlebar.appendTo(document.querySelector('#titlebar'))
        .on('close', function() {
            var window = remote.getCurrentWindow();
            window.close();
        })
        .on('minimize', function() {
            var window = remote.getCurrentWindow();
            window.minimize();
        })
        .on('fullscreen', function() {
            var window = remote.getCurrentWindow();
            window.setFullScreen(!window.isFullScreen());
        
        })
        .on('maximize', function() {
            var window = remote.getCurrentWindow();
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