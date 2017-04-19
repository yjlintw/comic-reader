/**
 *      Comic Parser
 *      comic-parser.js
 * 
 *      Grab the chapter info and image contents from the website using 
 *      site-specific parsers
 */


const values = require('./values');
var subscriber = require('./subscriber');
var settings = require('electron-settings');
var searchview = require('./search-view');
var favoriteview = require('./favorite-view');
var readview = require('./read-view');
var viewswitcher = require("./view-switcher");

module.exports = {
    selectComic: selectComic
}


/**
 *      Variable Definition
 */
// variable to store the settings. Preventing frequently I/O operations
var comicSettings = {};

/**
 * Set information for selected comic and grab chapters-info
 * @param {String} host     : Host name
 * @param {String} link     : Link to the comic
 * @param {String} title    : Comic's name (human-readable)
 * @param {String} titleKey : Unique key for the comic
 * @param {String} imguri   : thumbnail/cover photo 's url
 */
function selectComic(host, link, title, titleKey, imguri) {
    readview.setCurrentComic(host, titleKey, title, link, imguri);
    subscriber.register(host, titleKey, title, link, imguri);

    readview.clearReadArea();
    values.hostnames[host].parsers.grabChapters(link, onChaptersGrabbed);

    // -- UI update --
    // Enable the loading screen
    readview.toggleLoadingAnimation(true);
    // update the subscription indicators' UI
    subscriber.updateUI();
    // Make read-view active
    viewswitcher.tabswitch(2);
}

/**
 * Callback function when chapter info is grabbed
 * @param {Object} result : list of object
 *      @param {String} result.chName : Chapter name (human-readable)
 *      @param {String} result.chLink : url to the chapter
 *      @param {String} domid         : HTML DOM id to the chapter selector entry 
 *      @param {int}    index         : index in the chapter list
 */
function onChaptersGrabbed(result){
    // clear the chapter selector
    readview.clearChapterSelector();

    // create an empty chapter list with size of the length of the result
    var chapterList = new Array(result.length);

    // Get information from settings
    var keyPath = "comic." + readview.getCurHost() 
                    + "." + readview.getCurTitleKey();
    comicSettings = settings.get(keyPath)
    var chapters = comicSettings.chapters;
    
    for (var index in result) {
        var obj = result[index];
        var view = readview.createChapterEntry(obj.chName, obj.chLink, obj.domid, obj.index);
        chapterList[obj.index] = "#" + obj.domid;
        
        // if it is a new chapter, update the setting files
        if (!(obj.chName in chapters)) {
            chapters[obj.chName] = {
                read: false
            }
        }

        // add new ui to the screen
        readview.appendNewChapter(view);
    }
    // Pass information to the read view
    readview.setChapterList(chapterList);

    // update the newest chapter 
    // TODO: sloppy method, should implement with a different way later
    comicSettings.newestchapter = result[0].chName;
    comicSettings.hasupdate = false;

    // update the read-history UI
    updateChapterList();

    // disable the loading UI
    readview.toggleLoadingAnimation(false);
}


/**
 * Select one chapter to load
 * @param {String} chLink : URL to the chapter
 * @param {String} chName : Chapter name. Human-readable.
 */
function selectChapter(chLink, chName) {

    readview.clearReadArea();
    
    curPageIdx = 0;
    values.hostnames[readview.getCurHost()].parsers.loadChapter(chLink, chName, onSingleChapterLoaded);
    
}


/**
 * Callback function when one single chapter is loaded
 * @param {list} result : list of objects
 *      @param {String} imgurl : image url
 *      @param {String} id     : HTML DOM object id for that image
 *      @param {int}    idx    : index in the image array
 * @param {String} chName : Chapter name. Human-readable
 */
function onSingleChapterLoaded(result, chName) {
    if (chName != $(readview.getChapterList()[readview.getChIdx()]).text()) {
        return;
    }
    var pageIds = new Array(result.length);
    for (var index in result) {
        var obj = result[index];
        var view = readview.createComicPage(obj.imgurl, obj.id, obj.idx);
        pageIds[obj.idx] = obj.id;
        readview.appendNewPage(view);
    }
    readview.setPageIds(pageIds);
    comicSettings.chapters[chName].read = true;
    comicSettings.lastread = chName;
    updateChapterList();
}


/**
 * Update read-history UI indicator
 */
function updateChapterList() {
    readview.updateChapterList(comicSettings);
    var keyPath = "comic." + readview.getCurHost() + "." + readview.getCurTitleKey();
    settings.set(keyPath, comicSettings);
}

/**
 *      Initialization / UI
 */

function init() {
    searchview.bindSelectComic(selectComic);
    favoriteview.bindSelectComic(selectComic);

    readview.bindSelectChapter(selectChapter);
}

function lateInit() {
    
}


/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);
