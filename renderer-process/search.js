const values = require("./values");
var request = require('request');
var subscriber = require("./subscriber");
var comicparser = require("./comic-parser");

/**
 *      Variable Definition
 */
var resultViewStr = "";
var searchFlagDict = {};

/**
 *      Utility
 */
String.prototype.toUnicode = function(){
    var result = "";
    for(var i = 0; i < this.length; i++){
        // Assumption: all characters are < 0xffff
        result += "%u" + ("000" + this[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};




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
        request({
            method: 'GET',
            uri: values.hosts[key].searchuri.replace("{search}", searchStr.toUnicode())
        }, searchResponse);
        searchFlagDict[values.hosts[key].name] = true;
    }
    

    // for (var i = 0; i < 10; i++) {
    //     var view = createResultView(null, i, "host"+i, null, null);
    //     $("#search-results").append(view);
    // }
}

function searchResponse(error, response, body) {
    $("#search-results").removeClass("is-hidden");
    $("#search-view .loading-bg").addClass("is-hidden");
    var hostpath = response.request.host;
    var host = values.hosts[hostpath].name;
    searchFlagDict[host] = false;

    switch(host) {
        case "sfacg":
            var tmp = $("#form1", "<div>" + body + "</div>").find("table:nth-of-type(5)");
            tmp.find("ul").each(function(i, e){
                var imguri = $(e).find("li:first-child img").attr("src");
                // console.log(imguri);
                var comicTitle = $(e).find("li:nth-child(2)").find("a").text();
                var link = $(e).find("li:nth-child(2)").find("a").attr("href");
                var info = $(e).find("li:nth-child(2)").text().split("\n");
                $.map(info, $.trim);
                var updateinfo = info[1];
                var description = info.splice(2).join('\n').trim();
                var titleKey = link.substr(link.lastIndexOf('/') + 1);
                var view = createResultView(link, titleKey, imguri, comicTitle, host, updateinfo, description);
                $("#search-results").append(view);
            });
            break;
        default:
            break;
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

