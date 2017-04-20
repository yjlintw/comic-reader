/**
 *      Read View
 *      read-view.js
 * 
 *      See Also: ../sections/read-view.html,
 *      ../sections/chapter-entry.html,
 *      ../sections/page.html,
 *      ./comic-parser.js
 */


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
    getChIdx: function() {return current_chapter_idx},
    getCurHost: function() {return current_host},
    getCurTitleKey: function() {return current_titlekey},
    setPageIds: function(x) { page_id_list = x},
    getChapterList: function() { return chapter_list },
    setChapterList: function(x) { chapter_list = x},
    setCurrentComic: setCurrentComic,
    updateChapterList: updateChapterList
}

/**
 *      Variable Defintion
 */
// HTML DOM Template
var chapter_entry_template_str = "";
var page_container_template_str = "";

// Binded Function
var subscribeFunc;
var selectChapterFunc;

// Info
var current_host = "";
var current_titlekey = "";
var current_title = "";
var current_link = "";
var current_imguri = "";

var page_id_list = [];
var chapter_list = [];
var current_page_idx = 0;
var current_chapter_idx = -1;

var did_scroll = false;


// Action Binding

/**
 * Bind subscribe function
 * @param {function} func 
 */
function bindSubscribe(func) {
    subscribeFunc = func;
}
/**
 * Bind chapter selection function
 * @param {functino} func 
 */
function bindSelectChapter(func) {
    selectChapterFunc = func;
}


/**
 * Set selected comic's information
 * @param {string} host 
 * @param {string} titlekey 
 * @param {string} title 
 * @param {string} link 
 * @param {string} imguri 
 */
function setCurrentComic(host, titlekey, title, link, imguri) {
    current_host = host;
    current_titlekey = titlekey;
    current_title = title;
    current_link = link;
    currentImguri = imguri;

    // Reset current chapter index
    current_chapter_idx = -1;

    // Update HTML DOM
    $("#comic-header .comic-title").html(title);
    var header = $("#comic-header");
    header.attr("host", host);
    header.attr("link", link);
    header.attr("title", title);
    header.attr("titlekey", titlekey);
}

/**
 * Update the UI indication of subscription
 * TODO:: separate settings from view
 */
function updateSubscribeUI(all_comic_data) {
    var dom = $("#comic-header");
    var host = dom.attr("host");
    var titlekey = dom.attr("titlekey");
    
    var isSubscribed = all_comic_data[host] 
        && all_comic_data[host][titlekey] 
        && all_comic_data[host][titlekey].subscribed;

    if (isSubscribed) {
        dom.find(".subscribe-btn").addClass("subscribed");
    } else {
        dom.find(".subscribe-btn").removeClass("subscribed");
    }
    
}

/**
 * update chapter list
 * @param {Object} all_comic_data 
 */
function updateChapterList(comic_data) {
    // console.log(comicData);
    $(".chapter-entry").each(function(i, e) {
        var ch_key = $(e).attr("chKey");
        var ch_group = $(e).attr("chGroup");
        
        if (comic_data.chapters[ch_group][ch_key].read) {
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

    if (did_scroll) {
        did_scroll = false;
        var height = $(window).height();
        var pos = $(window).scrollTop();
        current_page_idx = Math.ceil(pos / height);
    }
    current_page_idx--;
    if (current_page_idx < 0) current_page_idx = 0;
    
    if ($("#" + page_id_list[current_page_idx]).offset() !== undefined ) { 
    
        $('html, body').animate({
            scrollTop: $("#" + page_id_list[current_page_idx]).offset().top
        }, 100);
    }
}

/**
 * Scroll to next pic
 */
function nextPic() {
    if (did_scroll) {
        did_scroll = false;
        var height = $(window).height();
        var pos = $(window).scrollTop();
        current_page_idx = Math.floor(pos / height);
    }
    current_page_idx++;
    
    if (current_page_idx >= page_id_list.length) current_page_idx = page_id_list.length -1;;
    if ($("#" + page_id_list[current_page_idx]).offset() !== undefined) {
        $('html, body').animate({
            scrollTop: $("#" + page_id_list[current_page_idx]).offset().top
        }, 100)
    }
}

/**
 * Scroll to previous chapter
 */
function prevChapter() {
    current_chapter_idx--;
    if (current_chapter_idx < 0) current_chapter_idx = 0;
    // console.log(chapterList[curChapterIdx]);
    $(chapter_list[current_chapter_idx]).trigger('click');
    
    scrollMiddlePanel();
}

/**
 * Scroll to next chapter
 */
function nextChapter() {
    current_chapter_idx++;
    if (current_chapter_idx >= chapter_list.length) current_chapter_idx = chapter_list.length - 1;
    $(chapter_list[current_chapter_idx]).trigger('click');
    scrollMiddlePanel();
}

/**
 * Scroll the chapter selector, so the active chapter
 * will always be visible
 */
function scrollMiddlePanel() {
    var scroll_bottom = $(".middle-panel").height() - $("#comic-header").height();
    var e = $(chapter_list[current_chapter_idx]);
    if (e.offset() && e.offset().top  + e.height() >= scroll_bottom) {
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
        chapter_entry_template_str = result;
    });

    $.get('./sections/page.html', function(result) {
        page_container_template_str = result;
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
        subscribeFunc(current_host, current_titlekey, current_title, current_link, current_imguri);
    });
}

function appendNewChapter(view) {
    $("#chapter-selector").append(view);
}

function appendNewPage(view) {
    $("#read-area").append(view);
}

function clearReadArea() {
    current_page_idx = 0;
    $("#read-area").html("");
}

function clearChapterSelector() {
    $("#chapter-selector").html("");
}

/**
 * @param {String} ch_group: chapter's group
 * @param {String} ch_key  : chapter's unique key
 * @param {String} ch_name : chapter's name (human-readable)
 * @param {String} ch_link : chapter's link
 * @param {String} domid   : HTML DOM id of the selected entry
 * @param {int}    index   : index of selected chapter in the chapter list
 */
function createChapterEntry(ch_group, ch_key, ch_name, ch_link, domid, index) {
    var view = $(chapter_entry_template_str);
    view.attr("link", ch_link);
    view.attr("chGroup", ch_group);
    view.attr("chKey", ch_key);
    view.attr("idx", index);
    view.attr("id", domid);

    view.html(ch_name);
    view.click(function(){
        if ($("#comic-header").css("top") == "50px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
        selectChapterFunc(ch_link, ch_group, ch_key);
        $(".chapter-entry").removeClass("active");
        $(this).addClass("active");
        current_chapter_idx = index;
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
        var view = $(page_container_template_str);
        view.attr("id", id);
        view.attr("idx", idx);
        view.find("img").attr("src", imguri);
        view.click(function() {
            current_page_idx = idx;
            nextPic();
        });
        return view;
}

/**
 * Toggle Chapter Selector, used in mobile view only
 */
function toggleChapterSelector() {
    var chapter_selector = $("#chapter-selector");
    if (chapter_selector.hasClass("is-hidden-mobile")) {
        chapter_selector.removeClass("is-hidden-mobile");
    } else {
        chapter_selector.addClass("is-hidden-mobile");
    }
}

/**
 * Toggle loading animation
 * @param {bool} shown 
 */
function toggleLoadingAnimation(shown) {
    var loading_bg = $(".middle-panel .loading-bg");
    if (shown) {
        loading_bg.removeClass("is-hidden");
    } else {
        loading_bg.addClass("is-hidden");
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
            case 37: // left
                prevPic();
            break;

            case 38: // up
                prevChapter();
            break;

            case 34:
            case 39: // right
                nextPic();
            break;

            case 40: // down
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
            did_scroll = true;
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

