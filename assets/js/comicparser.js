var request = require('request');

module.exports = {
    chapterGraper: function (title, link) {
        $('#chapter-list-title').text(title);
        $("#chapter-list").html("");
        request(
        { method: 'GET'
        , uri: link    
        }
        , chapterParser);
    }
};

function chapterParser(error, response, body) {
    var host = response.request.host;
    
    switch(host) {
        case "comic.sfacg.com":
            
            var tmp = $("table:nth-of-type(9)", "<div>" + body + "</div>").find("ul.serialise_list.Blue_link2");
            
            // console.log(tmp);
            tmp.find("li").each(function(i, e) {
                // console.log($(e).text());
                var ch_name = $(e).text();
                var ch_link = $(e).find('a').attr('href');
                // console.log(ch_link);
                var obj = $("<div class='pure-u-1 chapter-entry' link='http://" + host + ch_link + "'></div>");
                obj.append("<h2>" + ch_name + "</h2>");
                obj.click(selectChapter);

                $("#chapter-list").append(obj);

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
    if (currentIdx > picDivIds.length) currentIdx = picDivIds.length - 1;
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
    switch(e.which) {
        case 33:
        case 37: // left
        if (!$('#read-panel').hasClass('is-hidden')){
            prevPic();
        }
        break;

        case 38: // up
        break;

        case 34:
        case 39: // right
        if (!$('#read-panel').hasClass('is-hidden')){
            nextPic();
        }
        break;

        case 40: // down
        break;

        default: return; // exit this handler for other keys
    }
    if (!$('#read-panel').hasClass('is-hidden')){
        e.preventDefault(); // prevent the default action (scroll / move caret)
    }
});