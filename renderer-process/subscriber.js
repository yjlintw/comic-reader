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


module.exports = {
    register: register,
    subscribe: subscribe,
    updateUI: updateSubscribeUIStatus

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
            "chapters": {},
            "newestchapter": ""
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

function updateComicInfo(host, comicTitleKey) {

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