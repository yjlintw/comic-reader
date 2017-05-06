var pjson = require('../../package.json');
const remote = require('electron').remote;
var window = remote.getCurrentWindow();
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

function maxiWin() {
    var show = $('#maximize').hasClass('active');
    // alert(show);
    if (show == true) {
      window.unmaximize();
      } else {
        window.maximize();
        }
}

function lateInit() {

    titlebar.appendTo(document.querySelector('#titlebar'))
        .on('close', function() {
            window.close();
        })
        .on('win-close', function() {
            window.unmaximize();
            window.close();
        })
        .on('minimize', function() {
            window.minimize();
        })
        .on('fullscreen', function() {
            window.setFullScreen(!window.isFullScreen());

        })

    setTitle(pjson.productName);

    $("#maximize").click(function(e) {
        maxiWin();
        $("#maximize").toggleClass("active");
    });

}


$(document).ready(lateInit);
