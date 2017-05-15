/**
 * Things to load after everything is loaded
 */
// const path = require('path');
// 3rd party library
let schedule = require('node-schedule');

// viewmodel
let subscriber = require('./viewmodels/subscribe-viewmodel');

// viewcontroller
let viewswitch_viewcontroller = require('./viewcontrollers/view-switch-viewcontroller');
const isDev = require('electron-is-dev');

let scheduledTask;
$(document).ready(function() {
    // console.log(viewswitch_viewcontroller)
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

    if (isDev) {
        $.getScript("http://localhost:35729/livereload.js?snipver=2");
    }
    
});