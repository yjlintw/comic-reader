/**
 *      Subscriber
 *      subscriber.js
 * 
 *      Manage all the subscription behavior
 */


// TODO::
//      Move the detailed comic subscription information to a different file


const values = require("./values");
const settings = require("electron-settings");
var favoriteview = require('./favorite-view')
var searchview = require('./search-view');
var readview = require('./read-view');
var async = require('async');

module.exports = {
    register: register,
    subscribe: subscribe,
    updateUI: updateSubscribeUIStatus,
    checkUpdate: checkUpdate
}

/**
 *      Variable Definition
 */


/**
 * Register a comic. Save the info for a comic, but do not subscribe it. 
 * @param {String} host           : Host name
 * @param {String} comicTitleKey  : Unique key for the comic. the key can be 
 *                                  reused if the comic is from a different host
 * @param {String} comicTitle     : Comic's name. (Human-readable)
 * @param {String} link           : Link to the comic
 * @param {String} thumbnailURI   : thumbnail / cover photo 's url 
 * @param {String} subscribed     : status of subscription
 */
function register(host, comicTitleKey, comicTitle, link, thumbnailURI, subscribed=false) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    if (!settings.has(keyPath)) {
        settings.set(keyPath, {
            "title": comicTitle,
            "link": link,
            "thumbnail": thumbnailURI,
            "subscribed": subscribed,
            "lastread": "",
            "lastpage": "",
            "chapters": {},
            "newestchapter": "",
            "hasupdate": true
        });
    }
}

/**
 * Toggle the subscription status
 * @param see register(...) 
 */
function subscribe(host, comicTitleKey, comicTitle, link, thumbnailURI) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    var comicSettings = settings.get(keyPath);
    if (comicSettings) {
        comicSettings.subscribed = !comicSettings.subscribed;
        settings.set(keyPath, comicSettings);
    } else {
        register(host, comicTitleKey, comicTitle, link, thumbnailURI, true)
    }

    updateSubscribeUIStatus();

}

/**
 * Unsubscribe the comic
 * @param see register(...)
 */
function unsubscribe(host, comicTitleKey) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    var comicSettings = settings.get(keyPath);
    if (comicSettings) {
        comicSettings.subscribed = false;
        settings.set(keyPath, comicSettings);
        updateSubscribeUIStatus();
    }
}

function checkUpdate() {
    var comicSettings = settings.get('comic');
    async.eachOf(comicSettings, function(hostDict, host, callback) {
        async.eachOf(hostDict, function(comics, comicTitleKey, callback){
            values.hostnames[host].parsers.grabChapters(comics.link,onChaptersGrabbed.bind({
                    comicSettings: comicSettings,
                    host: host,
                    comicTitleKey: comicTitleKey,
                    callback: callback
                }));
        }, function() {
            callback();
        })
    }, onAllComicsUpdateChecked.bind({comicSettings:comicSettings}));
}
function onDone() {
    console.log("onDone");
}

function onChaptersGrabbed(result) {
    var comic = this.comicSettings[this.host][this.comicTitleKey];
    var chapters = comic.chapters;
    if (result.length != Object.keys(chapters).length) {
        comic.hasupdate = true;
    }
    
    for (var index in result) {
        var obj = result[index];
        if (!(obj.chName in chapters)) {
            chapters[obj.chName] = {
                read: false
            }
        }
    }
    comic.newestchapter = result[0].chName;
    // console.log(this.comicSettings);
    this.callback();
}

function onAllComicsUpdateChecked() {
    settings.set("comic", this.comicSettings);
    updateSubscribeUIStatus();
}

/**
 * Refresh subscription indicators' UI
 */
function updateSubscribeUIStatus() {
    searchview.updateSubscribeUI();
    favoriteview.updateSubscribeUI();
    readview.updateSubscribeUI();
}

/**
 *      Initialized
 */

function init () {
    searchview.bindSubscribe(subscribe);

    favoriteview.bindRegister(register);
    favoriteview.bindSubscribe(subscribe);
    favoriteview.bindUnsubscribe(unsubscribe);

    
    readview.bindSubscribe(subscribe);
}

// init when documen is ready
function lateInit() {
    updateSubscribeUIStatus();
}

/**
 *      Main Script
 */

init();
$(document).ready(lateInit);