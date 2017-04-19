/**
 * Things to load after everything is loaded
 */

var viewswitcher = require("./view-switcher");
var subscriber = require("./subscriber");

$(document).ready(function() {
    viewswitcher.tabswitch(0);
    subscriber.checkUpdate();
});