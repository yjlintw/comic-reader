const values = require("./values");
const settings = require("electron-settings");

module.exports = {
    subscribe: subscribe,
    updateUI: updateSubscribeUIStatus

}

/**
 *      Variable Definition
 */
var favEntryViewStr = "";


function subscribe(host, comicTitleKey, comicTitle, link, thumbnailURI) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    if (settings.has(keyPath)) {
        if (settings.get(keyPath + ".subscribed")) {
            settings.set(keyPath + ".subscribed", false);
        } else {
            settings.set(keyPath + ".subscribed", true);
        }
    } else {
        settings.set(keyPath, {
            "title": comicTitle,
            "link": link,
            "thumbnail": thumbnailURI,
            "subscribed": true,
        });
    }

    updateSubscribeUIStatus();

}

function unsubscribe(host, comicTitleKey) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    console.log(keyPath);
    if (settings.has(keyPath)) {
        settings.set(keyPath + ".subscribed", false);
        updateSubscribeUIStatus();
    }
}

function updateComicInfo(host, comicTitleKey) {

}

function updateSubscribeUIStatus() {
    updateSearchSubscribeUI();
    updateFavoriteSubscribeUI();
}

function updateSearchSubscribeUI() {
    $(".search-result").each(function(i, e) {
        var dom = $(e);
        var host = dom.attr("host");
        var titleKey = dom.attr("titlekey");
        var keyPath = "comic." + host + "." + titleKey;
        var isSubscribed = (
            settings.has(keyPath) &&
            settings.get(keyPath + ".subscribed"));
        
        if (isSubscribed) {
            dom.find(".subscribe-btn").addClass("subscribed");
        } else {
            dom.find(".subscribe-btn").removeClass("subscribed");
        }
    });  
}

function updateFavoriteSubscribeUI() {
    $("#favorite-contents").html("");
    var comics = settings.get("comic");

    for (var host in comics) {
        for (var titleKey in comics[host]) {
            if (comics[host][titleKey].subscribed) {
                var link = comics[host][titleKey].link;
                var imguri = comics[host][titleKey].thumbnail;
                var title = comics[host][titleKey].title;

                var view = createFavEntry(link, titleKey, imguri, title, host);

                $("#favorite-contents").append(view);
            }
        }
    }

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
    updateSubscribeUIStatus();
}

function createFavEntry(link, titleKey, imguri, title, host) {
    var view = $(favEntryViewStr);
    view.find("img").attr("src", imguri);
    view.find(".comic-name strong").text(title);
    view.find(".comic-name small").text(host);

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
    });

    return view;
}

/**
 *      Main Script
 */

init();
$(document).ready(lateInit);