/**
 *      Read View
 *      read-view.js
 *
 *      See Also: ../sections/read-view.html,
 *      ../sections/chapter-entry.html,
 *      ../sections/page.html,
 *      ./comic-parser.js
 */
let fs = require('fs');

/**
 *      Variable Defintion
 */
// HTML DOM Template
const chapter_entry_template_str = fs.readFileSync(__dirname + '/../../sections/chapter-entry.html', 'utf-8');
const page_container_template_str = fs.readFileSync(__dirname + '/../../sections/page.html', 'utf-8');
const lastpage_notice_template_str = fs.readFileSync(__dirname + '/../../sections/lastpagenotice-view.html', 'utf-8');

// Binded Function
let subscribeFunc;
let selectChapterFunc;

// Info
let current_host = "";
let current_titlekey = "";
let current_title = "";
let current_link = "";
let current_imguri = "";

let page_id_list = [];
let chapter_list = [];
let current_page_idx = 0;
let current_chapter_idx = -1;
let current_chapter_key = "";

let did_scroll = false;


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
 * Return current page idx. If the user did scroll by mouse, calculate current
 * page index by using the scroll position and image height.
 */
function getCurrentPageIdx() {
    if (did_scroll && $("#read-view").css('display') !== "none") {
        did_scroll = false;
        let height = $('.comic-page-container').outerHeight(true);
        let pos = $('#read-area').scrollTop();
        current_page_idx = Math.ceil(pos / height);
    }
    return current_page_idx;
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
    let header = $("#comic-header");
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
    // console.log("update subscribe ui: " + current_page_idx);
    let dom = $("#comic-header");
    let host = dom.attr("host");
    let titlekey = dom.attr("titlekey");

    let isSubscribed = all_comic_data[host]
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
        let ch_key = $(e).attr("chKey");
        let ch_group = $(e).attr("chGroup");

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

    let height = $('.comic-page-container').outerHeight(true);
    if (did_scroll) {
        did_scroll = false;
        let pos = $('#read-area').scrollTop();
        current_page_idx = Math.ceil(pos / height);
    }
    current_page_idx--;
    if (current_page_idx < 0) current_page_idx = 0;

    if ($("#" + page_id_list[current_page_idx]).offset() !== undefined ) {
        scrollToPage(current_page_idx);
    }
}

/**
 * Scroll to next pic
 */
function nextPic() {
    let height = $('.comic-page-container').outerHeight(true);
    if (did_scroll) {
        did_scroll = false;
        let pos = $('#read-area').scrollTop();
        current_page_idx = Math.floor(pos / height);
    }
    current_page_idx++;

    if (current_page_idx >= page_id_list.length) {
        current_page_idx = page_id_list.length;
        scrollToPage(current_page_idx);

    } else if ($("#" + page_id_list[current_page_idx]).offset() !== undefined) {

        scrollToPage(current_page_idx);
    }
}

/**
 * Scroll to previous chapter
 */
function nextChapter() {
    if (current_chapter_idx === 0) return;
    current_chapter_idx--;
    if (current_chapter_idx < 0) current_chapter_idx = 0;
    $(chapter_list[current_chapter_idx]).trigger('click');
    // scrollMiddlePanel();
}

/**
 * Scroll to next chapter
 */
function prevChapter() {
    if (current_chapter_idx === chapter_list.length - 1) return;
    current_chapter_idx++;
    if (current_chapter_idx >= chapter_list.length) current_chapter_idx = chapter_list.length - 1;
    $(chapter_list[current_chapter_idx]).trigger('click');
    // scrollMiddlePanel();
}

function scrollToPage(page_idx, use_animation = true) {
    if (page_idx >= 0) {
        current_page_idx = page_idx;
    }
    let height = $('.comic-page-container').outerHeight(true);
    let read_area = $('#read-area');
    if (use_animation) {
        read_area.animate({
            scrollTop: (current_page_idx >= page_id_list.length)? read_area[0].scrollHeight :current_page_idx * height
        }, 100)
    } else {
        let value = (current_page_idx >= page_id_list.length)? read_area[0].scrollHeight :current_page_idx * height;
        read_area.scrollTop(value);
    }

}


/**
 * Scroll the chapter selector, so the active chapter
 * will always be visible
 */
function scrollMiddlePanel() {
    let scroll_bottom = $("#chapter-selector").height() + $("#titlebar").outerHeight();
    let e = $(chapter_list[current_chapter_idx]);
    if (e.offset() && e.offset().top  + e.height() >= scroll_bottom) {
        $("#chapter-selector").animate({
            scrollTop: $("#chapter-selector").scrollTop() + e.offset().top - $("#comic-header").outerHeight() - $("#titlebar").outerHeight()
        }, 100)
        console.log($("#chapter-selector").scrollTop() + " + " + e.offset().top + " - " + $("#comic-header").outerHeight() + " - " + $("#titlebar").outerHeight());
    } else if (e.offset() && e.offset().top < $("#comic-header").outerHeight() + $("#titlebar").outerHeight()) {
        $("#chapter-selector").animate({
            scrollTop: $("#chapter-selector").scrollTop() - $("#chapter-selector").height() + e.offset().top - $("#titlebar").outerHeight()
        }, 100)
    }
}


/**
 *      Initialization / UI
 */

function init() {
}

function lateInit() {
    // comic header click behavior in mobile view
    $("#comic-header").click(function(e) {
        if ($("#comic-header").css("top") == "85px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
    });

    $("#comic-header .subscribe-btn").click(function(e) {
        e.stopPropagation();
        subscribeFunc(current_host, current_titlekey, current_title, current_link, current_imguri);
    });
    $('#change').click(function(){
			$('.content').css("background-color","#FF0000");
			$('.content').css("color","#FFF");
		});

    $(".chapToggle").click(function(e) {
        $('.middle-panel, #read-area, .toggleTag').addClass("active");
        $('.sidebar').addClass("active");
    });
    $(".toggleTag").click(function(e) {
        $('.sidebar').removeClass("active");
        $('.middle-panel, #read-area, .toggleTag').removeClass("active");

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

function showToolTips() {
    $('.controlTips').addClass('is-visible')
    setTimeout(function() {
        $('.controlTips').removeClass('is-visible')
    }, 2000);
}

function selectChapter(ch_link, ch_group, ch_key, last_page = 0) {
    $(".chapter-entry").each(function(i, v) {
        if ($(v).attr("link") === ch_link) {
            $(v).trigger('click');
            return false;
        }
    });
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
    let view = $(chapter_entry_template_str);
    view.attr("link", ch_link);
    view.attr("chGroup", ch_group);
    view.attr("chKey", ch_key);
    view.attr("idx", index);
    view.attr("id", domid);

    view.html(ch_name);
    view.click(function(){
        if ($("#comic-header").css("top") == "85px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
        selectChapterFunc(ch_link, ch_group, ch_key);
        $(".chapter-entry").removeClass("active");
        $(this).addClass("active");
        current_chapter_idx = index;
        current_chapter_key = ch_key;
        scrollMiddlePanel();
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
        let view = $(page_container_template_str);
        view.attr("id", id);
        view.attr("idx", idx);
        view.find("img").attr("src", imguri);

        view.find('.zoom-btn').click(function() {
            view.zoom({
                on:'click',
                magnify: '1.5',
                callback: function() {
                    view.trigger('click');
                },
                onZoomOut: function() {
                    view.trigger('zoom.destroy');
                }
            })

        });
        view.find("img").click(function() {
            current_page_idx = idx;
            nextPic();
        });

        return view;
}


function createLastpageNotice() {
    let view = $(lastpage_notice_template_str);
    return view;
}

/**
 * Toggle Chapter Selector, used in mobile view only
 */
function toggleChapterSelector() {
    let chapter_selector = $("#chapter-selector");
    if (chapter_selector.hasClass("is-hidden-mobile")) {
        chapter_selector.removeClass("is-hidden-mobile");
        $('#read-area').find('.zoom-btn').css("z-index","0");
        $('#read-view').find('.middle-panel').css("z-index", 3);

    } else {
        chapter_selector.addClass("is-hidden-mobile");
        $('#read-area').find('.zoom-btn').css("z-index","99");
        $('#read-view').find('.middle-panel').css("z-index", 0);
    }
}

/**
 * Toggle loading animation
 * @param {bool} shown
 */
function toggleLoadingAnimation(shown) {
    let loading_bg = $(".middle-panel .loading-bg");
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
            case 33: // pageup
            case 37: // left
                prevChapter();
            break;

            case 38: // up
                prevPic();
            break;

            case 34: // pagedown
            case 39: // right
                nextChapter();
            break;

            case 40: // down
                nextPic();
            break;

            case 35: // END
                current_page_idx = page_id_list.length;
                scrollToPage(current_page_idx);
            break;
            case 36: // HOME
                current_page_idx = 0;
                scrollToPage(current_page_idx);
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
            did_scroll = true;
        }
    });

    $(window).resize(function() {
        if (!$('#read-panel').hasClass('is-hidden')){
            scrollToPage(current_page_idx, false);
        }
    });
});


/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);

$(document).keydown(onKeydown);


module.exports = {
    // create new elements
    createChapterEntry: createChapterEntry,
    createComicPage: createComicPage,
    createLastpageNotice: createLastpageNotice,

    // append to the screen
    appendNewPage: appendNewPage,
    appendNewChapter: appendNewChapter,

    // UI update / clear
    updateSubscribeUI: updateSubscribeUI,
    clearReadArea: clearReadArea,
    clearChapterSelector: clearChapterSelector,
    toggleLoadingAnimation: toggleLoadingAnimation,
    scrollToPage: scrollToPage,
    selectChapter: selectChapter,
    showToolTips: showToolTips,

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
    getCurrentChapterKey: function () {return current_chapter_key},
    setCurrentComic: setCurrentComic,
    getCurrentPageIdx: getCurrentPageIdx,
    updateChapterList: updateChapterList
}
