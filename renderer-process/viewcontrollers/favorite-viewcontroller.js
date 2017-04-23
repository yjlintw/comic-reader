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
//

var favorite_entry_template_str = "";

/**
 * Action Binding
 */
var registerFunc;
var subscribeFunc;
var unsubscribeFunc;
var selectComicFunc;

function bindRegister(func) {
    registerFunc = func;
}

function bindSubscribe(func) {
    subscribeFunc = func;
}

function bindUnsubscribe(func) {
    unsubscribeFunc = func;
}

function bindSelectComic(func) {
    selectComicFunc = func;
}

/**
 * Update subscription indicator UI
 */
function updateSubscribeUI(all_comic_data) {
    $("#favorite-contents").html("");

    for (var host in all_comic_data) {
        for (var titlekey in all_comic_data[host]) {
            var comic_data = all_comic_data[host][titlekey];
            if (comic_data.subscribed) {
                var link = comic_data.link;
                var imguri = comic_data.thumbnail;
                var title = comic_data.title;
                var lastread = comic_data.lastread;
                var newest = comic_data.newestchapter;
                var view = createFavEntry(link, titlekey, imguri, title, host, lastread, newest);

                if (all_comic_data[host][titlekey].hasupdate) {
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
 * @param {String} titlekey  : title key store in settings
 * @param {String} imguri    : thumbnail's url
 * @param {String} title     : comic's name (human-readable)
 * @param {String} host      : host name
 */
function createFavEntry(link, titlekey, imguri, title, host, lastread, newest) {
    var view = $(favorite_entry_template_str);
    view.find("img").attr("src", imguri);
    view.find(".comic-name").text(title);
    view.find(".host").text(host);
    view.find(".last-read").text(lastread);
    view.find(".newest").text(newest)
    view.attr("title", title);
    view.attr("link", link);
    view.attr("titlekey", titlekey);
    view.attr("host", host);

    view.find(".subscribe-btn").click(function(e){
        e.stopPropagation();
        console.log(host);
        console.log(titlekey);
        unsubscribeFunc(host, titlekey);
    });

    view.click(function(e){
        // console.log("fav click:" + title + ", from:" + host);
        selectComicFunc(host, link, title, titlekey, imguri);

    });

    return view;
}




/**
 *      Initialized
 */

function init () {
    $.get('./sections/favorite-entry.html', function(result) {
        favorite_entry_template_str = result;
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
