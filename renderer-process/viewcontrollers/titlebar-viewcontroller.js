var titlebar = require('titlebar');


var log = function(name) {
    return function(e) {
        console.log(name, e);
    };
};
var t = titlebar()
    .appendTo(document.querySelector('#titlebar'))
    .on('close', log('close'))
    .on('minimize', log('minimize'))
    .on('fullscreen', log('fullscreen'))
	.on('maximize', log('maximize'));