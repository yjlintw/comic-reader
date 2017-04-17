const values = require('./values');
var subscriber = require('./subscriber');
var settings = require('electron-settings');

module.exports = {
    selectComic: selectComic
}


/**
 *      Variable Definition
 */

var chapterEntryStr = "";
var curHost = "";
var curTitleKey = "";
var chapterList = [];
var curChapterIdx = -1;
var pageContainerStr = "";
var pageIds = [];
var curPageIdx = 0;
var comicSettings = {};

function selectComic(host, link, title, titleKey, imguri) {
    $("#comic-header .comic-title").html(title);
    $("#comic-header").attr("host", host);
    $("#comic-header").attr("link", link);
    $("#comic-header").attr("title", title);
    $("#comic-header").attr("titlekey", titleKey);
    curHost = host;
    curTitleKey = titleKey;
    chapterList = [];
    curChapterIdx = -1;
    subscriber.register(host, titleKey, title, link, imguri);
    $("#read-area").html("");
    $("#comic-header .subscribe-btn").click(function(e) {
        e.stopPropagation();
        subscriber.subscribe(host, titleKey, title, link, imguri);
    });

    values.hostnames[host].parsers.grapeChapters(link, onChaptersGraped);

    $(".middle-panel .loading-bg").removeClass("is-hidden");
    subscriber.updateUI();
    $("#tab-read").trigger("click");
}

function onChaptersGraped(result){
    $("#chapter-selector").html("");
    chapterList = new Array(result.length);
    var keyPath = "comic." + curHost + "." + curTitleKey;
    comicSettings = settings.get(keyPath)
    var chapters = comicSettings.chapters;
    for (var index in result) {
        var obj = result[index];
        var view = createChapterEntry(obj.chName, obj.chLink, obj.domid, obj.index);
        chapterList[obj.index] = "#" + obj.domid;
        
        if (!(obj.chName in chapters)) {
            chapters[obj.chName] = {
                read: false
            }
        }
        $("#chapter-selector").append(view);
    }
    comicSettings.newestchapter = result[0].chName;
    updateChapterList();
    $(".middle-panel .loading-bg").addClass("is-hidden");
}

function selectChapter(chLink, chName) {
    // console.log(chLink);
    $("#read-area").html("");
    
    curPageIdx = 0;
    values.hostnames[curHost].parsers.loadChapter(chLink, chName, onSingleChapterLoaded);
    
}

function onSingleChapterLoaded(result, chName) {
    if (chName != $(chapterList[curChapterIdx]).text()) {
        return;
    }
    pageIds = new Array(result.length);
    for (var index in result) {
        var obj = result[index];
        var view = createComicPage(obj.imgurl, obj.id, obj.idx);
        pageIds[obj.idx] = obj.id;
        $("#read-area").append(view);
    }

    comicSettings.chapters[chName].read = true;
    comicSettings.lastread = chName;
    updateChapterList();
}

function updateChapterList() {
    $(".chapter-entry").each(function(i, e) {
        var chName = $(e).text();
        if (comicSettings.chapters[chName].read) {
            $(e).addClass("read");
        }
    });
    var keyPath = "comic." + curHost + "." + curTitleKey;
    settings.set(keyPath, comicSettings);
}

/**
 *      Navigation
 */

function prevPic() {
    if (!$("#" + pageIds[curPageIdx]).offset()) return;
    curPageIdx--;
    if (curPageIdx < 0) curPageIdx = 0;
    $('html, body').animate({
        scrollTop: $("#" + pageIds[curPageIdx]).offset().top
    }, 100);
}

function nextPic() {
    if (!$("#" + pageIds[curPageIdx]).offset()) return;
    curPageIdx++;
    if (curPageIdx >= pageIds.length) curPageIdx = pageIds.length -1;;
    $('html, body').animate({
        scrollTop: $("#" + pageIds[curPageIdx]).offset().top
    }, 100)
}

function prevChapter() {
    curChapterIdx--;
    if (curChapterIdx < 0) curChapterIdx = 0;
    // console.log(chapterList[curChapterIdx]);
    $(chapterList[curChapterIdx]).trigger('click');
    
    scrollMiddlePanel();
}

function nextChapter() {
    curChapterIdx++;
    if (curChapterIdx >= chapterList.length) curChapterIdx = chapterList.length - 1;
    $(chapterList[curChapterIdx]).trigger('click');
    scrollMiddlePanel();
}

function scrollMiddlePanel() {
    var scrollBottom = $(".middle-panel").height() - $("#comic-header").height();
    console.log(scrollBottom);
    var e = $(chapterList[curChapterIdx]);
    // console.log(e.offset());
    // console.log(e.height());
    console.log($("#comic-header").outerHeight());

    if (e.offset().top  + e.height() >= scrollBottom) {

        console.log("offscreen");
        $(".middle-panel").animate({
            scrollTop: $(".middle-panel").scrollTop() + e.offset().top - $("#comic-header").outerHeight()
        }, 100)
    } else if (e.offset().top < $("#comic-header").outerHeight()) {
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
}

function createChapterEntry(chName, chLink, domid, index) {
    var view = $(chapterEntryStr);
    view.attr("link", chLink);
    view.attr("idx", index);
    view.attr("id", domid);

    view.html(chName);
    view.click(function(){
        if ($("#comic-header").css("top") == "50px") {
            // toggle chapter selector
            toggleChapterSelector();
        }
        selectChapter(chLink, chName);
        $(".chapter-entry").removeClass("active");
        $(this).addClass("active");
        curChapterIdx = index;
    });
    return view;
}

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

function toggleChapterSelector() {
    if ($("#chapter-selector").hasClass("is-hidden-mobile")) {
        $("#chapter-selector").removeClass("is-hidden-mobile");
    } else {
        $("#chapter-selector").addClass("is-hidden-mobile");
    }
}



function onKeydown(e) {
    if (!$('#read-panel').hasClass('is-hidden')) {
        switch(e.which) {
            case 33:
            case 37: // left
                prevPic();
            break;

            case 38: // up
                nextChapter();
            break;

            case 34:
            case 39: // right
                nextPic();
            break;

            case 40: // down
                prevChapter();
            break;

            default: return; // exit this handler for other keys
        }
        
        e.preventDefault(); // prevent the default action (scroll / move caret)
    }
}

$(function(){
    $(window).bind('scroll', function() {
        if (!$('#read-panel').hasClass('is-hidden')){
            curPageId = 0;
            var height = $(window).height();
            var pos = $(window).scrollTop();
            curPageId = Math.round(pos / height);
        }
    });
});



/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);

$(document).keydown(onKeydown);