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
var notifier = require('node-notifier');

module.exports = {
    register: register,
    subscribe: subscribe,
    updateUI: updateSubscribeUIStatus,
    checkUpdate: checkUpdate
}

/**
 *      Variable Definition
 */
var notification;

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
    return settings.get(keyPath);
}

/**
 * Toggle the subscription status
 * @param see register(...) 
 */
function subscribe(host, comicTitleKey, comicTitle, link, thumbnailURI) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    var comicData = settings.get(keyPath);
    if (comicData) {
        
        comicData.subscribed = !comicData.subscribed;
        settings.set(keyPath, comicData);
    } else {
        comicData = register(host, comicTitleKey, comicTitle, link, thumbnailURI, true)
    }
    if (comicData.subscribed) {
        checkUpdateSingle(host, comicTitleKey);
    }
    updateSubscribeUIStatus();

}

/**
 * Unsubscribe the comic
 * @param see register(...)
 */
function unsubscribe(host, comicTitleKey) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    var comicData = settings.get(keyPath);
    if (comicData) {
        comicData.subscribed = false;
        settings.set(keyPath, comicData);
        updateSubscribeUIStatus();
    }
}

/**
 * [Async] Check updates for a single comic.
 * @param {String} host 
 * @param {String} comicTitleKey 
 */
function checkUpdateSingle(host, comicTitleKey) {
    console.log("---- Start checking for one comic's updates ----")
    var allComicData = settings.get('comic');
    async.apply(values.hostnames[host].parsers.grabChapters(allComicData[host][comicTitleKey].link,onChaptersGrabbed.bind({
                        allComicData: allComicData,
                        host: host,
                        comicTitleKey: comicTitleKey,
                        callback: onAllComicsUpdateChecked
                    })));
}

/**
 * [Async] Check updates for all subscribed comics
 */
function checkUpdate() {
    console.log("---- Start checking for updates ----")
    var allComicData = settings.get('comic');
    async.eachOf(allComicData, function(hostDict, host, callback1) {
        async.eachOf(hostDict, function(comics, comicTitleKey, callback2){
            if (allComicData[host][comicTitleKey].subscribed) {
                values.hostnames[host].parsers.grabChapters(comics.link,onChaptersGrabbed.bind({
                        allComicData: allComicData,
                        host: host,
                        comicTitleKey: comicTitleKey,
                        callback: callback2
                    }));
            } else {
                callback2();
            }
        }, function() {
            callback1();
        })
    }, onAllComicsUpdateChecked.bind({allComicData:allComicData}));
}

/**
 * Callback when one chapter is grabbed.
 * @param {Array} result :list of obj (see below)
 *          {Object} obj:
 *            {String} chName: Chapter's name
 *            {String} chLink: URL to the chapter
 *            {String} domid : HTML DOM object id
 *            {int}    index : index
 * @param {JSON} this.allComicData
 * @param {JSON} this.host
 * @param {JSON} this.comicTitleKey
 * @param {JSON} this.callback : must invoke callback at the end of the function
 *                               when the job is finished.
 *              
 */
function onChaptersGrabbed(result) {
    console.log("---One Comic Update Checked---")
    var comic = this.allComicData[this.host][this.comicTitleKey];
    var chapters = comic.chapters;
    if (result.length != Object.keys(chapters).length) {
        comic.hasupdate = true;
        notifier.notify({
            title: 'Comic Reader',
            message: comic.title + ' has new updates ',
            wait: false
        })
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
    this.callback();
}

/**
 * Callback when all update check in done.
 * @param {JSON} this.allComicData
 */
function onAllComicsUpdateChecked() {
    console.log("---- All updates checked ----")
    settings.set("comic", this.allComicData);
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