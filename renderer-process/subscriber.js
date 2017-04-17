const values = require("./values");
const settings = require("electron-settings");
module.exports = {
    register: register,
    subscribe: subscribe,
    updateUI: updateSubscribeUIStatus

}

var comicparser = require("./comic-parser");

/**
 *      Variable Definition
 */
var favEntryViewStr = "";


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

function subscribe(host, comicTitleKey, comicTitle, link, thumbnailURI) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    var comicSettings = settings.get(keyPath);
    if (comicSettings) {
        comicSettings.subscribed = !comicSettings.subScribed;
        settings.set(keyPath, comicSettings);
    } else {
        register(host, comicTitleKey, comicTitle, link, thumbnailURI, true)
    }

    updateSubscribeUIStatus();

}

function unsubscribe(host, comicTitleKey) {
    var keyPath = "comic." + host + "." + comicTitleKey;
    var comicSettings = settings.get(keyPath);
    if (comicSettings) {
        comicSettings.subscribed = false;
        settings.set(keyPath + comicSettings);
        updateSubscribeUIStatus();
    }
}

function updateComicInfo(host, comicTitleKey) {

}

function updateSubscribeUIStatus() {
    updateSearchSubscribeUI();
    updateFavoriteSubscribeUI();
    updateReadSubscribeUI();
}

function updateSearchSubscribeUI() {
    $(".search-result").each(function(i, e) {
        var dom = $(e);
        var host = dom.attr("host");
        var titleKey = dom.attr("titlekey");
        var keyPath = "comic." + host + "." + titleKey;
        var isSubscribed = settings.get(keyPath + ".subscribed");
        
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

function updateReadSubscribeUI() {
    var dom = $("#comic-header");
    var host = dom.attr("host");
    var titleKey = dom.attr("titlekey");
    var keyPath = "comic." + host + "." + titleKey;
    var isSubscribed = settings.get(keyPath + ".subscribed");

    if (isSubscribed) {
        dom.find(".subscribe-btn").addClass("subscribed");
    } else {
        dom.find(".subscribe-btn").removeClass("subscribed");
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
    var lastread = settings.get("comic." + host + "." + titleKey + ".lastread");
    var newest = settings.get("comic." + host + "." + titleKey + ".newestchapter");
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
        comicparser.selectComic(host, link, title, titleKey, imguri);

    });

    return view;
}

/**
 *      Main Script
 */

init();
$(document).ready(lateInit);