var titlebar = require('titlebar')();
var pjson = require('../../package.json');
const remote = require('electron').remote;

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
            window.maximize();
        });

    var div = document.createElement('div');
    div.id = 'titlebar-title';
    titlebar.element.appendChild(div);

    setTitle(pjson.productName);
}


$(document).ready(lateInit);