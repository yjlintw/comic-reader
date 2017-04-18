/**
 * Things to load after everything is loaded
 */

var viewswitcher = require("./view-switcher");

$(document).ready(function() {
    viewswitcher.tabswitch(0);
});