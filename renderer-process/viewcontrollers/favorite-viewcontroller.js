/**
 *      Favorite View
 *      favorite-viewcontroller.js
 * 
 *      See Also: ../sections/favorite-view.html,
 *      ../sections/favorite-entry.html,
 *      ./subscriber.js
 */

module.exports = {
    updateSubscribeUI: updateSubscribeUI,

    // Binding functions
    bindRegister: bindRegister,
    bindSubscribe: bindSubscribe,
    bindUnsubscribe: bindUnsubscribe,
    bindSelectComic: bindSelectComic
}

/**
 * Action Binding
 */
var register;
var subscribe;
var unsubscribe;
var selectComic;

function bindRegister(func) {
    register = func;
}

function bindSubscribe(func) {
    subscribe = func;
}

function bindUnsubscribe(func) {
    unsubscribe = func;
}

function bindSelectComic(func) {
    selectComic = func;
}

/**
 * Update subscription indicator UI
 */
function updateSubscribeUI(allComicData) {
    $("#favorite-contents").html("");

    for (var host in allComicData) {
        for (var titleKey in allComicData[host]) {
            var comicData = allComicData[host][titleKey];
            if (comicData.subscribed) {
                var link = comicData.link;
                var imguri = comicData.thumbnail;
                var title = comicData.title;
                var lastread = comicData.lastread;
                var newest = comicData.newestchapter;
                var view = createFavEntry(link, titleKey, imguri, title, host, lastread, newest);

                if (allComicData[host][titleKey].hasupdate) {
                    view.addClass("hasupdate");
                }
                $("#favorite-contents").append(view);
            }
        }
    }

}

/**
 * Create a favorite entry HTML DOM object
 * @param {String} link      : link to comic 
 * @param {String} titleKey  : title key store in settings
 * @param {String} imguri    : thumbnail's url
 * @param {String} title     : comic's name (human-readable)
 * @param {String} host      : host name
 */
function createFavEntry(link, titleKey, imguri, title, host, lastread, newest) {
    var view = $(favEntryViewStr);
    view.find("img").attr("src", imguri);
    view.find(".comic-name strong").text(title);
    view.find(".comic-name small").text(host);
    view.find(".last-read strong").text(lastread);
    view.find(".newest strong").text(newest)
    view.attr("title", title);
    view.attr("link", link);
    view.attr("titlekey", titleKey);
    view.attr("host", host);

    view.find(".subscribe-btn").click(function(e){
        e.stopPropagation();
        console.log(host);
        console.log(titleKey);
        unsubscribe(host, titleKey);
    });

    view.click(function(e){
        console.log("fav click:" + title + ", from:" + host);
        selectComic(host, link, title, titleKey, imguri);

    });

    return view;
}




/**
 *      Initialized
 */

function init () {
    $.get('./sections/favorite-entry.html', function(result) {
        favEntryViewStr = result;
    })
}

// init when documen is ready
function lateInit() {
    // updateSubscribeUIStatus();
}


/**
 *      Main Script
 */

init();
$(document).ready(lateInit);