const values = require("./values");
var subscriber = require("./subscriber");
var comicparser = require("./comic-parser");

/**
 *      Variable Definition
 */
var resultViewStr = "";
var searchFlagDict = {};

/**
 *      Backend Functionality
 */

function isSearching() {
    for(key in searchFlagDict) {
        if (searchFlagDict[key]) {
            return true;
        }
    }
    return false;
}

function search() {
    if (isSearching()) return;
    var searchStr = $("#search-input").val();
    $("#search-results").html("");
    $("#search-results").addClass("is-hidden");
    $("#search-view .loading-bg").removeClass("is-hidden");
    for (var key in values.hosts) {
        values.hosts[key].parsers.search(searchStr, searchResponse)
        searchFlagDict[values.hosts[key].name] = true;
    }
}

// function searchResponse(error, response, body) {
function searchResponse(result, host) {
    $("#search-results").removeClass("is-hidden");
    $("#search-view .loading-bg").addClass("is-hidden");
    
    searchFlagDict[host] = false;

    for (var idx in result) {
        var obj = result[idx];
        var view = createResultView(obj.link, obj.titleKey, obj.imguri, obj.comicTitle, obj.host, obj.updateinfo, obj.description);
        $("#search-results").append(view);
    }
    subscriber.updateUI();
}

/**
 *      UI Interaction
 */
// init as soon as the script loads.
function init() {
    $.get('./sections/search-result-entry.html', function(result) {
        resultViewStr = result;
    });

    for (var key in values.hosts) {
        searchFlagDict[values.hosts[key].name] = false;
    }
}

// init when documen is ready
function lateInit() {
    // Search Header
    $('#search-input').keyup(function(e){
        if(e.keyCode == 13)
        {
            $(this).trigger("enterKey");
        }
    });

    $("#search-input").bind("enterKey", search);

    $("#search-btn").click(search);
}

function createResultView(link, titleKey, imguri, title, host, updateinfo, description) {
    var view = $(resultViewStr);
    view.find(".thumbnail img").attr("src", imguri);
    view.find(".comic-name strong").html(title);
    view.find(".comic-name small").html("(" + host +")");
    view.find(".comic-update-info").html(updateinfo);
    view.find(".comic-description").html(description);    
    
    view.attr("title", title);
    view.attr("link", link);
    view.attr("titlekey", titleKey);
    view.attr("host", host);

    view.click(function() {
        comicparser.selectComic(host, link, title, titleKey, imguri);
    })

    view.find(".subscribe-btn").click(function(e) {
        e.stopPropagation();
        subscriber.subscribe(host, titleKey, title, link, imguri);
    });

    return view;
}



/**
 *      Main
 */
init();
$(document).ready(lateInit);

