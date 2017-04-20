/**
 *      Search View
 *      search-view.js
 * 
 *      See Also: ../sections/search-view.html,
 *      ../sections/search-result-entry.html,
 *      ./search-controller.js
 */
module.exports = {
    createResultView: createResultView,
    getSearchQuery: getSearchQuery,
    clearSearchResults: clearSearchResults,
    appendNewResult: appendNewResult,
    loadingUI: loadingUI,
    updateSubscribeUI: updateSubscribeUI,
    bindSearch: bindSearch,
    bindSubscribe: bindSubscribe,
    bindSelectComic: bindSelectComic,
}

/**
 *      View
 *      Initialize & UI Interaction
 */

// search function
var search;
var subscribe;
var selectComic;

/**
 * Create a single search result HTML DOM
 * 
 * See: ../sections/search-result-entry.html
 * 
 * @param {String} link         : link to the comic page
 * @param {String} titleKey     : a unique key for a comic in a host, two comics
                                  from different hosts can have the same key
 * @param {String} imguri       : image thumbnail / cover photo
 * @param {String} title        : comic name (human-readable)
 * @param {String} host         : host name
 * @param {String} updateinfo   :
 * @param {String} description  : 
 * 
 * @return {jQueryObject} result view HTML DOM
 */
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
        selectComic(host, link, title, titleKey, imguri);
    })

    view.find(".subscribe-btn").click(function(e) {
        e.stopPropagation();
        subscribe(host, titleKey, title, link, imguri);
    });

    return view;
}

/**
 * @return: {String} return values in input box
 */
function getSearchQuery() {
    return $("#search-input").val();
}

/**
 * Clear #search-results view
 */
function clearSearchResults() {
    $("#search-results").html("");
}

/**
 * Append a new view to #search-results
 * @param {jQueryObject} view 
 */
function appendNewResult(view) {
    $("#search-results").append(view);
}

/**
 * Toggle loading animation
 * @param {bool} shown 
 */
function loadingUI(shown) {
    if (shown) {
        $("#search-results").addClass("is-hidden");
        $("#search-view .loading-bg").removeClass("is-hidden");
    } else {
        $("#search-results").removeClass("is-hidden");
        $("#search-view .loading-bg").addClass("is-hidden");
    }
}

/**
 * Update subscription UI indicator
 */
function updateSubscribeUI(allComicData) {
    $(".search-result").each(function(i, e) {
        var dom = $(e);
        var host = dom.attr("host");
        var titleKey = dom.attr("titlekey");
        // var keyPath = "comic." + host + "." + titleKey;
        
        if (allComicData && allComicData[host] && allComicData[host][titleKey] && allComicData[host][titleKey].subscribed) {
            dom.find(".subscribe-btn").addClass("subscribed");
        } else {
            dom.find(".subscribe-btn").removeClass("subscribed");
        }
    });  
}


/**
 * Bind the search function
 * @param {function} func 
 */
function bindSearch(func) {
    search = func;
}

/**
 * Bind subsribe function
 * @param {function} func 
 */
function bindSubscribe(func) {
    subscribe = func;
}

/**
 * Bind select comic function
 * @param {function} func 
 */
function bindSelectComic(func) {
    selectComic = func;
}

// init as soon as the script loads.
function init() {
    $.get('./sections/search-result-entry.html', function(result) {
        resultViewStr = result;
    });
}

// init when document is ready
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

/**
 *      Main Scripts
 */
init();
$(document).ready(lateInit);
