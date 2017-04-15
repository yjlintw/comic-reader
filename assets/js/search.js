var request = require('request');
const comicparser = require('./comicparser');
var hostTable = require('./hosttable');
const favorite = require('./favorite');
const settings = require('electron-settings');
$('#search-box').keyup(function(e){
    if(e.keyCode == 13)
    {
        $(this).trigger("enterKey");
    }
});

$('#search-box').bind("enterKey", search)
$("#search-btn").click(search);

String.prototype.toUnicode = function(){
    var result = "";
    for(var i = 0; i < this.length; i++){
        // Assumption: all characters are < 0xffff
        result += "%u" + ("000" + this[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};


// initialize
var hostList = ["s.sfacg.com"];
var searchFlagDict = {};
for (var i = 0; i < hostList.length; i++) {
    searchFlagDict[hostList[i]] = false;
}

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
    $("#search-result").html("loading...");
    var searchString = $("#search-box").val();
    console.log($("#search-box").val());
    
    // --- s.sfacg.com ---
    request(
    { method: 'GET'
    , uri: 'http://s.sfacg.com/?Key=' + searchString.toUnicode() + '&S=0&SS=0'
    }
    , handleResponse);
    searchFlagDict["s.sfacg.com"] = true;

    // --- others ---
    //   $("#search-result").html(tmp.html());
}

function handleResponse(error, response, body) {
      // body is the decompressed response body
    //   console.log(body);
      console.log(response.request.host);
      var host = response.request.host;
      searchFlagDict[host] = false;
      $("#search-result").html("")

      switch(host) {
        case "s.sfacg.com":
            // parse data
            var tmp = $("#form1", "<div>" + body + "</div>").find("table:nth-of-type(5)");
            tmp.find("ul").each(function(i, e){
                var imgHtml = $(e).find("li:first-child img");
                var title = $(e).find("li:nth-child(2)").find("a").text();
                var link = $(e).find("li:nth-child(2)").find("a").attr("href");
                var info = $(e).find("li:nth-child(2)").text().split("\n");
                $.map(info, $.trim);
                var metadata = info[1];
                var description = info.splice(2).join('\n').trim();

                var obj = creatComicDiv(host, title, imgHtml, link, metadata, description);
                
                $("#search-result").append(obj);
                // console.log(e);
                    
                
            });
            break;
        default:
            break;
      }
}

function creatComicDiv(host, title, imgHtml, link, metadata, description) {
    // format html element
    // console.log(link);
    var titleKey = link.substr(link.lastIndexOf('/') + 1);
    var obj = $("<div class='pure-u-1 comic-panel' title='" + title 
        + "' + link='" + link 
        + "' titlekey='" + titleKey + "' host='"
        + hostTable[host] + "'></div>");
    var imgObj = $("<div class='pure-u-4-24 img-thumb'></div>");
    imgObj.append(imgHtml);
    obj.append(imgObj);
    var disObj = $("<div class='pure-u-18-24'></div>");
    disObj.append("<div class='comic-title'>" + title + "<span class='host'>(" + host + ")</span></div>");
    disObj.append("<div class='comic-update'>" + metadata + "</div>");
    disObj.append("<div class='comic-description'>" + description + "</div>");
    obj.append(disObj);

    var likeBtn = $("<div class='pure-u-2-24 like-btn'><i class='fa fa-heart' aria-hidden='true'></i></div>");
    
    likeBtn.click(function(e){
        e.stopPropagation();
        if ($(this).hasClass('subscribed')) {
            $(this).removeClass('subscribed');
            settings.set("comic." + hostTable[host]+"."+titleKey+".subscribed", false);
            
        } else {
            $(this).addClass('subscribed');
            console.log(hostTable[host] + "." + titleKey);
            settings.set("comic." + hostTable[host] + "." + titleKey, {
                "title" : title,
                "link": link,
                "thumbnail": imgHtml.attr("src"),
                "subscribed": true,
                "readchapters": [],
                "lastread": {
                    "chapterlink": "",
                    "page": 0
                }
            });
        }
        favorite.updateFavorite();
    });

    if (settings.has("comic." + hostTable[host]+"."+titleKey) && settings.get("comic." + hostTable[host]+"."+titleKey+".subscribed")) {
        likeBtn.addClass("subscribed");                
    }
    obj.append(likeBtn);
    obj.click(comicparser.selectComic);
    return obj;
                
}

