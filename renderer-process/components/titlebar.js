var events = require('events');
var util = require('util');
var fs = require('fs');
var domify = require('domify');
var $ = require("dombo");

var $window = $(window);

var html_mac = fs.readFileSync(__dirname + '/../../sections/titlebar-mac.html', 'utf-8');
var html_win = fs.readFileSync(__dirname + '/../../sections/titlebar-win.html', 'utf-8');
// console.log(html);
var TitleBar = function(options) {
    if (!(this instanceof TitleBar)) return new TitleBar(options);
    events.EventEmitter.call(this);
    this._options = options || {};
    var html = html_mac;
    if (this._options.iswin) {
        html = html_win;
    }
    var element = domify(html);
    var $element = $(element);
    this.element = element;

    var self = this;
	  var close = $('.titlebar-close', element)[0];
	  var minimize = $('.titlebar-minimize', element)[0];
	  var fullscreen = $('.titlebar-fullscreen', element)[0];



    $element.on('click', function(e) {
		var target = e.target;
		if(close.contains(target)) {
        if (options.iswin) {
            self.emit('win-close', e);
          } else {
            self.emit('close', e);
          }
        }
		else if(minimize.contains(target)) self.emit('minimize', e);
		else if(fullscreen.contains(target)) {
            if (options.iswin) {
                self.emit('maximize', e);
            } else {
                if(e.altKey) self.emit('maximize', e);
                else self.emit('fullscreen', e);
            }
		}
	});

	$element.on('dblclick', function(e) {
		var target = e.target;
		if(close.contains(target) || minimize.contains(target) || fullscreen.contains(target)) return;
		self.emit('maximize', e);
	});

};

util.inherits(TitleBar, events.EventEmitter);

TitleBar.prototype.appendTo = function(target) {
	if(typeof target === 'string') target = $(target)[0];

	var $element = $(this.element);

	$window.on('keydown', this._onkeydown = function(e) {

		if(e.keyCode === 18) {
            $element.addClass('alt');
        }
	});

	$window.on('keyup', this._onkeyup = function(e) {
		if(e.keyCode === 18) $element.removeClass('alt');
	});

	target.appendChild(this.element);
	return this;
};

TitleBar.prototype.destroy = function() {
	var parent = this.element.parentNode;
	if(parent) parent.removeChild(this.element);
	$window.off('keydown', this._onkeydown);
	$window.off('keyup', this._onkeyup);
	return this;
};


module.exports = TitleBar;
