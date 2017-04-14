var request = require('request');
var comicparser = require('./comicparser');
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
    $("#search-result").html("");
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

      switch(host) {
        case "s.sfacg.com":
            // parse data
            var tmp = $("#form1", "<div>" + body + "</div>").find("table:nth-of-type(5)");
            tmp.find("ul").each(function(i, e){
                var imgHtml = $(e).find("li:first-child").html();
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
    var obj = $("<div class='pure-u-1 comic-panel' title='" + title + "' + link='" + link + "' ></div>");
    var imgObj = $("<div class='pure-u-4-24 img-thumb'></div>");
    imgObj.append(imgHtml);
    obj.append(imgObj);
    var disObj = $("<div class='pure-u-20-24'></div>");
    disObj.append("<div class='comic-title'>" + title + "<span class='host'>(" + host + ")</span></div>");
    disObj.append("<div class='comic-update'>" + metadata + "</div>");
    disObj.append("<div class='comic-description'>" + description + "</div>");
    obj.append(disObj);
    obj.click(selectComic);
    return obj;
                
}

function selectComic() {
    console.log($(this).attr("title"));
    console.log($(this).attr("link"));
    comicparser.chapterGraper($(this).attr("title"), $(this).attr("link"));
}