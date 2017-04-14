const settings = require('electron-settings');
var comicparser = require('./comicparser');

module.exports = {
    updateFavorite: updateFavorite
}

function updateFavorite() {
    console.log("update favorite");
    $('#favorite-list').html("");
    var allcomics = settings.get("comic");
    for (host in allcomics) {
        for (comic in allcomics[host]) {
            console.log ("host:" + comic);
            // create favorite comic panel
            var obj = $("<div class='pure-u-1-12 favorite-entry' title='" 
                + allcomics[host][comic].title + "' + link='" 
                + allcomics[host][comic].link + "' ></div>");
            var imgObj = $("<div class='pure-u-1 img-thumb'><img src='" 
                + allcomics[host][comic].thumbnail + "'></div>");
            obj.append(imgObj);
            obj.append("<div class='pure-u-1 comic-title'>" + allcomics[host][comic].title + "</div>");
            obj.click(selectComic);

            $('#favorite-list').append(obj);
        }
    }
}

function selectComic() {
    console.log($(this).attr("title"));
    console.log($(this).attr("link"));
    comicparser.chapterGraper($(this).attr("title"), $(this).attr("link"));
    $("#read-tab").trigger('click');
}

$(document).ready(updateFavorite);