/**
 * Things to load after everything is loaded
 */
// const path = require('path');
// 3rd party library
var schedule = require('node-schedule');

// viewmodel
var subscriber = require('./viewmodels/subscribe-viewmodel');

// viewcontroller
var viewswitch_viewcontroller = require('./viewcontrollers/view-switch-viewcontroller');

var scheduledTask;
$(document).ready(function() {
    console.log(viewswitch_viewcontroller)
    if (subscriber.hasSubscription()) {
        viewswitch_viewcontroller.tabswitch(viewswitch_viewcontroller.TAB_NAME.FAVORITE);
    } else {
        viewswitch_viewcontroller.tabswitch(viewswitch_viewcontroller.TAB_NAME.SEARCH);
    }
    subscriber.checkUpdate();
    // console.log(scheduledTask);
    if (!scheduledTask) {
        scheduledTask = schedule.scheduleJob('0 10 5,11,17,23 * * *', function(){
            // console.log("schedule update");
            subscriber.checkUpdate();
        });
    }
    
    
});