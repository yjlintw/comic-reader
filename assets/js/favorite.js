const settings = require('electron-settings');
const comicparser = require('./comicparser');

module.exports = {
    updateFavorite: updateFavorite
}

function updateFavorite() {
    console.log("update favorite");
    $('#favorite-list').html("");
    var allcomics = settings.get("comic");
    for (host in allcomics) {
        for (comic in allcomics[host]) {
            if (!allcomics[host][comic].subscribed) {
                continue;
            }
            // console.log ("host:" + comic);
            // create favorite comic panel
            var obj = $("<div class='pure-u-4-24 favorite-entry' title='" 
                + allcomics[host][comic].title + "' + link='" 
                + allcomics[host][comic].link + "' titlekey='" 
                + comic + "' host='" 
                + host + "'></div>");
            var imgObj = $("<div class='pure-u-lg-12-24 pure-u-xl-10-24'><img src='" 
                + allcomics[host][comic].thumbnail + "'></div>");
            obj.append(imgObj);
            var desObj = $("<div class='pure-u-lg-12-24 pure-u-xl-14-24'></div>");
            desObj.append("<h2 class='comic-title'>" + allcomics[host][comic].title + "</h2>");
            desObj.append("<p class='comic-host'>from: " + host + "</p>");
            obj.append(desObj);
            
            var unsubscribeBtn = $("<div class='unsubscribe'>x</div>");
            (function(host, comic) {
                unsubscribeBtn.click(function(e) {
                    e.stopPropagation();
                    console.log("comic." + host + "." + comic + ".subscribed");
                    settings.set("comic." + host + "." + comic + ".subscribed", false);
                    updateFavorite();
                });
            })(host, comic);
            obj.append(unsubscribeBtn);
            obj.click(comicparser.selectComic);

            $('#favorite-list').append(obj);
        }
    }
}
$(document).ready(updateFavorite);