/**
 * Things to load after everything is loaded
 */

var viewswitcher = require("./view-switcher");
var subscriber = require("./subscriber");
var schedule = require('node-schedule');

var scheduledTask;

$(document).ready(function() {
    viewswitcher.tabswitch(0);
    subscriber.checkUpdate();
    scheduledTask = schedule.scheduleJob('* * */6 * * *', function(){
        // console.log("schedule update");
        subscriber.checkUpdate();
    });
});