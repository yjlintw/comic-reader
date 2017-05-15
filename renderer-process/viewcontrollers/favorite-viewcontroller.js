/**
 *      Favorite View
 *      favorite-viewcontroller.js
 *
 *      See Also: ../sections/favorite-view.html,
 *      ../sections/favorite-entry.html,
 *      ./subscriber.js
 */
const util = require('../util');
const EA = require('electron-analytics');
let fs = require('fs');

/**
 * HTML String template
 */
const favorite_entry_template_str = fs.readFileSync(__dirname + '/../../sections/favorite-entry.html', 'utf-8');
const favorite_empty_template_str = fs.readFileSync(__dirname + '/../../sections/favorite-empty.html', 'utf-8');

/**
 * Action Binding
 */
let registerFunc;
let subscribeFunc;
let unsubscribeFunc;
let selectComicFunc;

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
function updateSubscribeUI(all_comic_data, has_subscription = true) {
    $("#favorite-contents").html("");

    if (has_subscription) {
        for (let host in all_comic_data) {
            for (let titlekey in all_comic_data[host]) {
                let comic_data = all_comic_data[host][titlekey];
                if (comic_data.subscribed) {
                    let link = comic_data.link;
                    let imguri = comic_data.thumbnail;
                    let title = comic_data.title;
                    let lastread = comic_data.lastread;
                    let newest = comic_data.newestchapter;
                    let view = createFavEntry(link, titlekey, imguri, title, host, lastread, newest);

                    if (all_comic_data[host][titlekey].hasupdate) {
                        view.addClass("hasupdate");
                    }
                    $("#favorite-contents").append(view);
                }
            }
        }
    } else {
        let view = $(favorite_empty_template_str);
        $("#favorite-contents").append(view);
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
function createFavEntry(link, titlekey, imguri, title, host, lastread, newest)  {
    let view = $(favorite_entry_template_str);
    view.find("img").each(function(n, img) {
            view.find(".thumb").css({
                'background': '#fff url(' + imguri + ') center center no-repeat',
                'background-size': 'cover'
            });
            img.remove();
        });
    view.find(".comic-name").text(title);
    view.find(".host").text(host);
    view.find(".last-read").text(lastread);
    view.find(".newest").text(newest)
    view.attr("title", title);
    view.attr("link", link);
    view.attr("titlekey", titlekey);
    view.attr("host", host);

    view.find(".subscribe-btn").click(function(e){
        EA.send("MOUSE_CLICKED_FAVORITE_SUBSCRIBE"); 
        e.stopPropagation();
        unsubscribeFunc(host, titlekey);
    });

    view.click(function(e){
        EA.send("MOUSE_CLICKED_FAVORITE_ENTRY"); 
        let sel = util.getSelected().toString();
        if (sel === '') {
            selectComicFunc(host, link, title, titlekey, imguri);
        }

    });

    return view;
}





/**
 *      Initialized
 */

function init () {
}

// init when documen is ready
function lateInit() {
}


/**
 *      Main Script
 */

init();
$(document).ready(lateInit);

/**
 *      Interface
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