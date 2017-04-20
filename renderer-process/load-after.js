/**
 * Things to load after everything is loaded
 */
const path = require('path');
var viewswitcher = require("./view-switcher");
var subscriber = require("./subscriber");
var schedule = require("node-schedule");

var scheduledTask;
$(document).ready(function() {
    viewswitcher.tabswitch(0);
    subscriber.checkUpdate();
    // console.log(scheduledTask);
    if (!scheduledTask) {
        scheduledTask = schedule.scheduleJob('0 10 5,11,17,23 * * *', function(){
            // console.log("schedule update");
            subscriber.checkUpdate();
        });
    }
    
    
});