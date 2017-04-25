var titlebar = require('titlebar');
const remote = require('electron').remote;


var log = function(name) {
    return function(e) {
        console.log(name, e);
    };
};
var t = titlebar()
    .appendTo(document.querySelector('#titlebar'))
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