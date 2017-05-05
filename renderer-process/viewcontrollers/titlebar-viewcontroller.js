var pjson = require('../../package.json');
const remote = require('electron').remote;
var titlebar = require('../components/titlebar')({
    iswin: process.platform == 'win32'
    // iswin: true
});

module.exports = {
    updateTitle: updateTitle
}



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
            // console.log(window.isMaximized());
            // console.log(window.isMaximizable());
            if (window.isMaximized()) {
                window.unmaximize();
            } else {
                window.maximize();
            }
        });
    setTitle(pjson.productName);
}


$(document).ready(lateInit);