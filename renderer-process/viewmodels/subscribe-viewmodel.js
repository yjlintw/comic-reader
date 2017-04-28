/**
 *      Subscriber
 *      subscriber.js
 * 
 *      Manage all the subscription behavior
 */


// TODO::
//      Move the detailed comic subscription information to a different file

// 3rd party library
var async = require('async');
const settings = require("electron-settings");
var notifier = require('node-notifier');

// model
const values = require("../models/values");

// viewcontroller
var favorite_viewcontroller = require('../viewcontrollers/favorite-viewcontroller')
var search_viewcontroller = require('../viewcontrollers/search-viewcontroller');
var read_viewcontroller = require('../viewcontrollers/read-viewcontroller');
var viewswitch_viewcontroller = require('../viewcontrollers/view-switch-viewcontroller')
const translate_viewcontroller = require('../viewcontrollers/translate-viewcontroller');

module.exports = {
    register: register,
    subscribe: subscribe,
    updateUI: updateSubscribeUIStatus,
    checkUpdate: checkUpdate,
    hasSubscription: hasSubscription
}

/**
 *      Variable Definition
 */
var notification;

/**
 * Register a comic. Save the info for a comic, but do not subscribe it. 
 * @param {String} host           : Host name
 * @param {String} titlekey  : Unique key for the comic. the key can be 
 *                                  reused if the comic is from a different host
 * @param {String} title     : Comic's name. (Human-readable)
 * @param {String} link           : Link to the comic
 * @param {String} thumbnail_uri   : thumbnail / cover photo 's url 
 * @param {String} subscribed     : status of subscription
 */
function register(host, titlekey, title, link, thumbnail_uri, subscribed=false) {
    var key_path = "comic." + host + "." + titlekey;
    if (!settings.has(key_path)) {
        settings.set(key_path, {
            "title": title,
            "link": link,
            "thumbnail": thumbnail_uri,
            "subscribed": subscribed,
            "lastread": "",
            "lastpage": "",
            "chapters": {},
            "chapters_count": 0,
            "newestchapter": "",
            "hasupdate": true
        });
    }
    return settings.get(key_path);
}

/**
 * Toggle the subscription status
 * @param see register(...) 
 */
function subscribe(host, titlekey, title, link, thumbnail_uri) {
    var keyPath = "comic." + host + "." + titlekey;
    var comic_data = settings.get(keyPath);
    if (comic_data) {
        
        comic_data.subscribed = !comic_data.subscribed;
        settings.set(keyPath, comic_data);
    } else {
        comic_data = register(host, titlekey, title, link, thumbnail_uri, true)
    }
    if (comic_data.subscribed) {
        checkUpdateSingle(host, titlekey);
    }
    updateSubscribeUIStatus();

}

/**
 * Unsubscribe the comic
 * @param see register(...)
 */
function unsubscribe(host, titlekey) {
    var key_path = "comic." + host + "." + titlekey;
    var comicData = settings.get(key_path);
    if (comicData) {
        comicData.subscribed = false;
        settings.set(key_path, comicData);
        updateSubscribeUIStatus();
    }
}

/**
 * [Async] Check updates for a single comic.
 * @param {String} host 
 * @param {String} titlekey 
 */
function checkUpdateSingle(host, titlekey) {
    console.log("---- Start checking for one comic's updates ----")
    var all_comic_data = settings.get('comic');
    async.apply(values.hostnames[host].parsers.grabChapters(titlekey, all_comic_data[host][titlekey].link,onChaptersGrabbed.bind({
                        all_comic_data: all_comic_data,
                        host: host,
                        titlekey: titlekey,
                        callback: onAllComicsUpdateChecked
                    })));
}

/**
 * [Async] Check updates for all subscribed comics
 */
function checkUpdate() {
    console.log("---- Start checking for updates ----")
    var all_comic_data = settings.get('comic');
    async.eachOf(all_comic_data, function(hostDict, host, callback1) {
        async.eachOf(hostDict, function(comics, titlekey, callback2){
            if (all_comic_data[host][titlekey].subscribed) {
                values.hostnames[host].parsers.grabChapters(titlekey, comics.link,onChaptersGrabbed.bind({
                        all_comic_data: all_comic_data,
                        host: host,
                        titlekey: titlekey,
                        callback: callback2
                    }));
            } else {
                callback2();
            }
        }, function() {
            callback1();
        })
    }, onAllComicsUpdateChecked.bind({all_comic_data : all_comic_data}));
}

/**
 * Callback when one chapter is grabbed.
 * @param {Array} result :list of obj (see below)
 *          {Object} obj:
 *            {String} ch_name : Chapter's name
 *            {String} ch_group: Chapter's group
 *            {String} ch_key  : Chapter's unique key
 *            {String} ch_link : URL to the chapter
 *            {String} domid   : HTML DOM object id
 *            {int}    index   : index
 * @param {JSON} this.all_comic_data
 * @param {JSON} this.host
 * @param {JSON} this.titlekey
 * @param {JSON} this.callback : must invoke callback at the end of the function
 *                               when the job is finished.
 *              
 */
function onChaptersGrabbed(result, newest) {
    console.log("---One Comic Update Checked---")
    var comic = this.all_comic_data[this.host][this.titlekey];
    var chapters_data = comic.chapters;
    // console.log(result.length + ":" + comic.chapters_count);
    if (result.length != comic.chapters_count) {
        comic.hasupdate = true;
        notifier.notify({
            title: 'Comic Reader',
            message: comic.title + ' has new updates',
            wait: false
        })
    }
    
    for (var index in result) {
        // console.log(result[index].chLink);
        
        var obj = result[index];
        // if is a new group
        if (!chapters_data[obj.ch_group]) {
            chapters_data[obj.ch_group] = {}
        } 
        if (!chapters_data[obj.ch_group][obj.ch_key]) {
            chapters_data[obj.ch_group][obj.ch_key] = {
                name: obj.ch_name,
                ch_link: obj.ch_link,
                read: false
            }
        }
    }
    comic.newestchapter = newest;
    comic.chapters_count = result.length;
    this.callback();
}

/**
 * Callback when all update check in done.
 * @param {JSON} this.all_comic_data
 */
function onAllComicsUpdateChecked() {
    console.log("---- All updates checked ----")
    settings.set("comic", this.all_comic_data);
    updateSubscribeUIStatus();
}

/**
 * Refresh subscription indicators' UI
 */
function updateSubscribeUIStatus() {
    all_comic_data = settings.get('comic');
    if (all_comic_data == undefined) {
        all_comic_data = {};
        settings.set('comic', all_comic_data);
    }
    search_viewcontroller.updateSubscribeUI(all_comic_data);
    favorite_viewcontroller.updateSubscribeUI(all_comic_data, hasSubscription());
    read_viewcontroller.updateSubscribeUI(all_comic_data);
    translate_viewcontroller.translate();

    var page_idx = read_viewcontroller.getCurrentPageIdx();
    var titlekey = read_viewcontroller.getCurTitleKey();
    var host = read_viewcontroller.getCurHost();
    // console.log(page_idx + ":" + titlekey + ":" + host); 
    if (host && titlekey && page_idx != 0) {
        all_comic_data[host][titlekey].lastpage = page_idx;
        settings.set('comic', all_comic_data);
    }
}

function hasSubscription() {
    all_comic_data = settings.get('comic');
    if (all_comic_data == undefined) return false;

    for (var host in all_comic_data) {
        for (var comic in all_comic_data[host]) {
            if (all_comic_data[host][comic].subscribed) {
                return true;
            }
        }
    }

    return false;
}

/**
 *      Initialized
 */

function init () {
    search_viewcontroller.bindSubscribe(subscribe);

    favorite_viewcontroller.bindRegister(register);
    favorite_viewcontroller.bindSubscribe(subscribe);
    favorite_viewcontroller.bindUnsubscribe(unsubscribe);

    
    read_viewcontroller.bindSubscribe(subscribe);
    viewswitch_viewcontroller.bindUpdateAllUI(updateSubscribeUIStatus);
}

// init when documen is ready
function lateInit() {
    updateSubscribeUIStatus();
    window.onbeforeunload = unload;
}

function unload(e) {
    console.log("test2");
    var page_idx = read_viewcontroller.getCurrentPageIdx();
    var titlekey = read_viewcontroller.getCurTitleKey();
    var host = read_viewcontroller.getCurHost();
    console.log(page_idx + ":" + titlekey + ":" + host); 
    if (host && titlekey && page_idx != 0) {
        all_comic_data[host][titlekey].lastpage = page_idx;
        settings.set('comic', all_comic_data);
    }
}

/**
 *      Main Script
 */

init();
$(document).ready(lateInit);