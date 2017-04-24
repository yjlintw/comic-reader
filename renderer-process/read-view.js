/**
 *      Read View
 *      read-view.js
 *
 *      See Also: ../sections/read-view.html,
 *      ../sections/chapter-entry.html,
 *      ../sections/page.html,
 *      ./comic-parser.js
 */

const settings = require('electron-settings');


module.exports = {
    // create new elements
    createChapterEntry: createChapterEntry,
    createComicPage: createComicPage,

    // append to the screen
    appendNewPage: appendNewPage,
    appendNewChapter: appendNewChapter,

    // UI update / clear
    updateSubscribeUI: updateSubscribeUI,
    clearReadArea: clearReadArea,
    clearChapterSelector: clearChapterSelector,
    toggleLoadingAnimation: toggleLoadingAnimation,

    // Action Binding
    bindSubscribe: bindSubscribe,
    bindSelectChapter: bindSelectChapter,

    // Getter / Setter
    getChIdx: function() {return curChapterIdx},
    getCurHost: function() {return curHost},
    getCurTitleKey: function() {return curTitleKey},
    setPageIds: function(x) { pageIds = x},
    getChapterList: function() { return chapterList },
    setChapterList: function(x) { chapterList = x},
    setCurrentComic: setCurrentComic,
    updateChapterList: updateChapterList
}

/**
 *      Variable Defintion
 */
// HTML DOM Template
var chapterEntryStr = "";
var pageContainerStr = "";

// Binded Function
var subscribe;
var selectChapter;

// Info
var curHost = "";
var curTitleKey = "";
var curTitle = "";
var curLink = "";
var curImguri = "";

var pageIds = [];
var chapterList = [];
var curPageIdx = 0;
var curChapterIdx = -1;

var didscroll = false;


// Action Binding

/**
 * Bind subscribe function
 * @param {function} func
 */
function bindSubscribe(func) {
    subscribe = func;
}
/**
 * Bind chapter selection function
 * @param {functino} func
 */
function bindSelectChapter(func) {
    selectChapter = func;
}


/**
 * Set selected comic's information
 * @param {string} host
 * @param {string} titleKey
 * @param {string} title
 * @param {string} link
 * @param {string} imguri
 */
function setCurrentComic(host, titleKey, title, link, imguri) {
    curHost = host;
    curTitleKey = titleKey;
    curTitle = title;
    curLink = link;
    currentImguri = imguri;

    // Reset current chapter index
    curChapterIdx = -1;

    // Update HTML DOM
    $("#comic-header .comic-title").html(title);
    var header = $("#comic-header");
    header.attr("host", host);
    header.attr("link", link);
    header.attr("title", title);
    header.attr("titlekey", titleKey);
}

/**
 * Update the UI indication of subscription
 * TODO:: separate settings from view
 */
function updateSubscribeUI() {
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
 * update chapter list
 * @param {Object} allComicData
 */
function updateChapterList(comicData) {
    // console.log(comicData);
    $(".chapter-entry").each(function(i, e) {
        var chKey = $(e).attr("chKey");
        var chGroup = $(e).attr("chGroup");
        if (comicData.chapters[chGroup][chKey].read) {
            $(e).addClass("read");
        }
    });
}

/**
 *      Navigation
 */

/**
 * Scroll to previous pic
 */
function prevPic() {

    if (didscroll) {
        didscroll = false;
        var height = $(window).height();
        var pos = $(window).scrollTop();
        curPageIdx = Math.ceil(pos / height);
    }
    curPageIdx--;
    if (curPageIdx < 0) curPageIdx = 0;
    if ($("#" + pageIds[curPageIdx]).offset() !== undefined ) {
        $('html, body').animate({
            scrollTop: $("#" + pageIds[curPageIdx]).offset().top
        }, 100);
    }
}

/**
 * Scroll to next pic
 */
function nextPic() {
    if (didscroll) {
        didscroll = false;
        var height = $(window).height();
        var pos = $(window).scrollTop();
        curPageIdx = Math.floor(pos / height);
    }
    curPageIdx++;

    if (curPageIdx >= pageIds.length) curPageIdx = pageIds.length -1;;
    if ($("#" + pageIds[curPageIdx]).offset() !== undefined) {
        $('html, body').animate({
            scrollTop: $("#" + pageIds[curPageIdx]).offset().top
        }, 100)
    }
}

/**
 * Scroll to previous chapter
 */
function prevChapter() {
    curChapterIdx--;
    if (curChapterIdx < 0) curChapterIdx = 0;
    // console.log(chapterList[curChapterIdx]);
    $(chapterList[curChapterIdx]).trigger('click');

    scrollMiddlePanel();
}

/**
 * Scroll to next chapter
 */
function nextChapter() {
    curChapterIdx++;
    if (curChapterIdx >= chapterList.length) curChapterIdx = chapterList.length - 1;
    $(chapterList[curChapterIdx]).trigger('click');
    scrollMiddlePanel();
}

/**
 * Scroll the chapter selector, so the active chapter
 * will always be visible
 */
function scrollMiddlePanel() {
    var scrollBottom = $(".middle-panel").height() - $("#comic-header").height();
    var e = $(chapterList[curChapterIdx]);
    if (e.offset() && e.offset().top  + e.height() >= scrollBottom) {
        $(".middle-panel").animate({
            scrollTop: $(".middle-panel").scrollTop() + e.offset().top - $("#comic-header").outerHeight()
        }, 100)
    } else if (e.offset() && e.offset().top < $("#comic-header").outerHeight()) {
        $(".middle-panel").animate({
            scrollTop: $(".middle-panel").scrollTop() - $(".middle-panel").height() + $("#comic-header").outerHeight() + e.offset().top
        }, 100)
    }
}


/**
 *      Initialization / UI
 */

function init() {
    $.get('./sections/chapter-entry.html', function(result) {
        chapterEntryStr = result;
    });

    $.get('./sections/page.html', function(result) {
        pageContainerStr = result;
    })
}

function lateInit() {
    // comic header click behavior in mobile view
    $("#comic-header").click(function(e) {
        if ($("#comic-header").css("top") == "50px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
    })

    $("#comic-header .subscribe-btn").click(function(e) {
        e.stopPropagation();
        subscribe(curHost, curTitleKey, curTitle, curLink, curImguri);
    });
}

function appendNewChapter(view) {
    $("#chapter-selector").append(view);
}

function appendNewPage(view) {
    $("#read-area").append(view);
}

function clearReadArea() {
    curPageIdx = 0;
    $("#read-area").html("");
}

function clearChapterSelector() {
    $("#chapter-selector").html("");
}

/**
 * @param {String} chGroup: chapter's group
 * @param {String} chKey  : chapter's unique key
 * @param {String} chName : chapter's name (human-readable)
 * @param {String} chLink : chapter's link
 * @param {String} domid  : HTML DOM id of the selected entry
 * @param {int}    index  : index of selected chapter in the chapter list
 */
function createChapterEntry(chGroup, chKey, chName, chLink, domid, index) {
    var view = $(chapterEntryStr);
    view.attr("link", chLink);
    view.attr("chGroup", chGroup);
    view.attr("chKey", chKey);
    view.attr("idx", index);
    view.attr("id", domid);

    view.html(chName);
    view.click(function(){
        if ($("#comic-header").css("top") == "50px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
        selectChapter(chLink, chGroup, chKey);
        $(".chapter-entry").removeClass("active");
        $(this).addClass("active");
        curChapterIdx = index;
        // console.log(curChapterIdx);
    });
    return view;
}

/**
 *
 * @param {String} imguri : comic image url
 * @param {String} id     : HTML DOM id for the image
 * @param {int}    idx    : index in the pic array
 */
function createComicPage(imguri, id, idx) {
        var view = $(pageContainerStr);
        view.attr("id", id);
        view.attr("idx", idx);
        view.find("img").attr("src", imguri);
        view.click(function() {
            curPageIdx = idx;
            nextPic();
        });
        return view;
}

/**
 * Toggle Chapter Selector, used in mobile view only
 */
function toggleChapterSelector() {
    var chapSelector = $("#chapter-selector");
    if (chapSelector.hasClass("is-hidden-mobile")) {
        chapSelector.removeClass("is-hidden-mobile");
    } else {
        chapSelector.addClass("is-hidden-mobile");
    }
}

/**
 * Toggle loading animation
 * @param {bool} shown
 */
function toggleLoadingAnimation(shown) {
    var loadBg = $(".middle-panel .loading-bg");
    if (shown) {
        loadBg.removeClass("is-hidden");
    } else {
        loadBg.addClass("is-hidden");
    }
}

/**
 * Keyboard Event only in readview
 * @param {KeyEvent} e
 */
function onKeydown(e) {
    if (!$('#read-view').hasClass('is-hidden')) {
        switch(e.which) {
            case 33:
            case 38: // up
                prevPic();
            break;

            case 39: // left
                prevChapter();
            break;

            case 34:
            case 40: // down
                nextPic();
            break;

            case 37: // right
                nextChapter();
            break;

            default: return; // exit this handler for other keys
        }

        e.preventDefault(); // prevent the default action (scroll / move caret)
    }
}

/**
 * Bind window scroll to update current page index
 */
$(function(){
    $(window).bind('mousewheel', function(e){
        if (!$('#read-panel').hasClass('is-hidden')){
            // curPageIdx = 0;
            // var height = $(window).height();
            // var pos = $(window).scrollTop();
            // console.log("scroll: " + height + "," + pos + "," +curPageIdx);
            // curPageIdx = Math.round(pos / height);
            // console.log("scrolled: " + curPageIdx);
            didscroll = true;
            // console.log("scroll");

        }
    });
});

/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);

$(document).keydown(onKeydown);
