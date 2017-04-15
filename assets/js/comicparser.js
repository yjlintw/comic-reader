var request = require('request');
const settings = require('electron-settings');

module.exports = {
    selectComic: function() {
        console.log("select comic");
        console.log($(this).attr("title"));
        console.log($(this).attr("link"));
        $("#read-area").html("");
        chapterGraper(
            $(this).attr("host"),
            $(this).attr("titlekey"), 
            $(this).attr("title"), 
            $(this).attr("link")
        );

        
        $("#read-tab").trigger('click');
    },
    chapterGraper: chapterGraper
};

function chapterGraper(host, titlekey, title, link) {
    $('#chapter-list-title h1').text(title);
    updateSubscribedIcon(host, titlekey);
    // console.log(settings.get("comic." + host + "." + titlekey + ".subscribed"))
    

    $("#chapter-list-title i").click(function() {
        var flag = settings.get("comic." + host + "." + titlekey + ".subscribed");
        settings.set("comic." + host + "." + titlekey + ".subscribed", !flag);
        updateSubscribedIcon(host, titlekey);
    });

    $("#chapter-list").html("loading...");
    request(
    { method: 'GET'
    , uri: link    
    }
    , chapterParser);
}
const favorite = require('./favorite.js');

function updateSubscribedIcon(host, titlekey) {
    if (settings.get("comic." + host + "." + titlekey + ".subscribed")) {
        $("#chapter-list-title i").removeClass("fa-heart-o");
        $("#chapter-list-title i").addClass("fa-heart");
    } else {
        $("#chapter-list-title i").addClass("fa-heart-o");
        $("#chapter-list-title i").removeClass("fa-heart");
    }
    favorite.updateFavorite();
}

var chapterList = [];
var curChaptIdx = 0;
function chapterParser(error, response, body) {
    var host = response.request.host;
    $("#chapter-list").html("");  
    switch(host) {
        case "comic.sfacg.com":
            
            var tmp = $("table:nth-of-type(9)", "<div>" + body + "</div>").find("ul.serialise_list.Blue_link2");
            
            // console.log(tmp);
            tmp.find("li").each(function(i, e) {
                // console.log($(e).text());
                var ch_name = $(e).text();
                var ch_link = $(e).find('a').attr('href');
                // console.log(ch_link);
                var obj = $("<div class='pure-u-1 chapter-entry' idx='"+ i 
                    + "' id='ch" + i + "' link='http://" + host + ch_link + "'></div>");
                obj.append("<h2>" + ch_name + "</h2>");
                obj.click(selectChapter);

                $("#chapter-list").append(obj);
                chapterList.push('ch' + i);
            });
            break;
        default:
            break;
    }
}

function selectChapter() {
    var link = $(this).attr('link');
    $("#read-area").html("");
    request(
        { method: 'GET'
        , uri: link    
        }
        , comicParser);
    
    $('.chapter-entry').removeClass("active");
    $(this).addClass("active");
    curChaptIdx = $(this).attr("idx");
}

function nextChapter() {
    curChaptIdx--;
    if (curChaptIdx < 0) curChaptIdx = 0;
    $("#" + chapterList[curChaptIdx]).trigger('click');
}

function prevChapter() {
    curChaptIdx++;
    if (curChaptIdx >= chapterList.length) curChaptIdx = chapterList.length - 1;
    $("#" + chapterList[curChaptIdx]).trigger('click');
}


function comicParser(error, response, body) {
    var host = response.request.host;
    
    switch(host) {
        case "comic.sfacg.com":
            var tmp = $("<div>" + body + "</div>");
            var pagecount = tmp.find("#pageSel");
            // console.log(body);
            var scripts = tmp.find("script").eq(1).attr("src");
            // console.log(scripts)
            request({
                method: 'GET',
                uri: "http://" + host + scripts
            }, utilParser)
            break;
        default:
            break;
    }
}



var picDivIds = [];
function utilParser (error, response, body) {
    // console.log(error);
    var host = response.request.host;
    eval(body);
    picDivIds = [];
    var pichost = hosts[0];
    for(idx in picAy) {
        imgurl = "http://" + host+picAy[idx];
        var id = "pic" + idx;
        picDivIds.push(id);
        var obj = $("<div class='pure-u-1 comic-page-container' idx='" + idx + "' id='pic" + idx + "'></div>");
        obj.append("<img class='comic-page' src='" + imgurl + "'>");
        obj.click(onClickPic);
        $("#read-area").append(obj);
    }
}

function onClickPic() {
    currentIdx = $(this).attr('idx');
    nextPic();
}

function nextPic() {
    currentIdx++;
    if (currentIdx >= picDivIds.length) currentIdx = picDivIds.length - 1;
    $('html, body').animate({
        scrollTop: $("#" + picDivIds[currentIdx]).offset().top
    }, 100);
}

function prevPic() {
    currentIdx--;
    if (currentIdx < 0) currentIdx = 0;
    $('html, body').animate({
        scrollTop: $("#" + picDivIds[currentIdx]).offset().top
    }, 100);
}


var currentIdx = 0;

$(function(){
    $(window).bind('scroll', function() {
        if (!$('#read-panel').hasClass('is-hidden')){
            currentIdx = 0;
            var height = $(window).height();
            var pos = $(window).scrollTop();
            currentIdx = Math.round(pos / height);
        }
    });
});

$(document).keydown(function(e) {
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
});