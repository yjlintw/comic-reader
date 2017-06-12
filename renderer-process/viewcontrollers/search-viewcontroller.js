/**
 *      Search View
 *      search-view.js
 *
 *      See Also: ../sections/search-view.html,
 *      ../sections/search-result-entry.html,
 *      ./search-controller.js
 */
const util = require('../util');
const values = require('../models/values');
const EA = require("electron-analytics");
let fs = require('fs');

/**
 *      View
 *      Initialize & UI Interaction
 */

const resultview_template_str = fs.readFileSync(__dirname + '/../../sections/search-result-entry.html', 'utf-8');
const filter_template_str = fs.readFileSync(__dirname + '/../../sections/search-filter.html', 'utf-8');
// search function
let searchFunc;
let subscribeFunc;
let selectComicFunc;

/**
 * Create a single search result HTML DOM
 *
 * See: ../sections/search-result-entry.html
 *
 * @param {String} link         : link to the comic page
 * @param {String} titlekey     : a unique key for a comic in a host, two comics
                                  from different hosts can have the same key
 * @param {String} imguri       : image thumbnail / cover photo
 * @param {String} title        : comic name (human-readable)
 * @param {String} host         : host name
 * @param {String} updateinfo   :
 * @param {String} description  :
 *
 * @return {jQueryObject} result view HTML DOM
 */
function createResultView(link, titlekey, imguri, title, host, updateinfo, description) {
    let view = $(resultview_template_str);
    view.find("img").each(function(n, img) {
            view.find(".thumb").css({
                'background': '#fff url(' + imguri + ') center center no-repeat',
                'background-size': 'cover'
            });
            img.remove();
        });
    view.find(".comic-name").text(title);
    view.find(".host").text(host);
    view.find(".comic-update-info").html(updateinfo);
    view.find(".comic-description").html(description);

    view.attr("title", title);
    view.attr("link", link);
    view.attr("titlekey", titlekey);
    view.attr("host", host);

    view.click(function() {
        EA.send("MOUSE_CLICKED_SEARCH_ENTRY");
        let sel = util.getSelected();
        if (sel === '') {
            selectComicFunc(host, link, title, titlekey, imguri);
        }
    })

    view.find(".subscribe-btn").click(function(e) {
        EA.send("MOUSE_CLICKED_SEARCH_SUBSCRIBE");
        e.stopPropagation();
        subscribeFunc(host, titlekey, title, link, imguri);
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
function updateSubscribeUI(all_comic_Data) {
    $(".search-result").each(function(i, e) {
        let dom = $(e);
        let host = dom.attr("host");
        let titlekey = dom.attr("titlekey");
        // let keyPath = "comic." + host + "." + titleKey;

        if (all_comic_Data && all_comic_Data[host]
            && all_comic_Data[host][titlekey]
            && all_comic_Data[host][titlekey].subscribed) {
            dom.find(".subscribe-btn").addClass("subscribed");
            dom.addClass("subscribed");
        } else {
            dom.find(".subscribe-btn").removeClass("subscribed");
            dom.removeClass("subscribed");
        }
    });
}

function updateSearchResult() {
    let activetags = {};
    $('#search-filters .tag').each(function() {
        if ($(this).hasClass('active')) {
            activetags[$(this).attr('host')] = true;
        }
    });
    $('.search-result').each(function() {
        if ($(this).attr('host') in activetags) {
            $(this).removeClass('is-hidden');
        } else {
            $(this).addClass('is-hidden');
        }
    });
}


/**
 * Bind the search function
 * @param {function} func
 */
function bindSearch(func) {
    searchFunc = func;
}

/**
 * Bind subsribe function
 * @param {function} func
 */
function bindSubscribe(func) {
    subscribeFunc = func;
}

/**
 * Bind select comic function
 * @param {function} func
 */
function bindSelectComic(func) {
    selectComicFunc = func;
}

// init as soon as the script loads.
function init() {

}

// init when document is ready
function lateInit() {
  // SearchAnimate

  $("#search-btn").click(function() {
      EA.send("MOUSE_CLICKED_SEARCH_SEARCH_BTN");
    $('#search-header h2').addClass('active');
    $('#search-results').addClass('active');
  });

    // Search Header
    $('#search-input').keypress(function(e){
        if(e.keyCode == 13)
        {
            EA.send("KEYDOWN_SEARCH_ENTER");
            $(this).trigger("enterKey");
            $('#search-header h2').addClass('active');
            $('#search-results').addClass('active');
        }
    });


    $("#search-input").bind("enterKey", searchFunc);

    $("#search-btn").click(searchFunc);

    // create filters
    for (let key in values.hostnames) {
        let view = $(filter_template_str);
        view.text(key);
        view.attr('host', key);
        view.append('<button class="delete is-small"></button>');
        view.click(function () {
            EA.send("MOUSE_CLICKED_SEARCH_FILTER");
            let host = $(this).attr('host');
            let activate = $(this).hasClass('active');
            console.log(activate);
            activate = !activate;
            if (!activate) {
                $(this).removeClass('active').find('button').remove();
            } else {
                $(this).addClass('active').append('<button class="delete is-small"></button>');
            }
            updateSearchResult();

        })
        $("#search-filters").append(view);
    }
}

/**
 *      Main Scripts
 */
init();
$(document).ready(lateInit);

/**
 *      Interface
 */
module.exports = {
    createResultView: createResultView,
    getSearchQuery: getSearchQuery,
    clearSearchResults: clearSearchResults,
    appendNewResult: appendNewResult,
    loadingUI: loadingUI,
    updateSubscribeUI: updateSubscribeUI,
    updateSearchResult: updateSearchResult,
    bindSearch: bindSearch,
    bindSubscribe: bindSubscribe,
    bindSelectComic: bindSelectComic,
}
