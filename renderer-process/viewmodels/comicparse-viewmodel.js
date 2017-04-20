/**
 *      Comic Parser
 *      comic-parser.js
 * 
 *      Grab the chapter info and image contents from the website using 
 *      site-specific parsers
 */

// 3rd party library
var settings = require('electron-settings');

// model
const values = require('../models/values');

// view model
var subscriber = require('./subscribe-viewmodel');

// view controller
var searchViewController = require('../viewcontrollers/search-viewcontroller');
var favViewController = require('../viewcontrollers/favorite-viewcontroller');
var readViewController = require('../viewcontrollers/read-viewcontroller');
var viewSwitchViewController = require("../viewcontrollers/view-switch-viewcontroller");
var translateViewController = require("../viewcontrollers/translate-viewcontroller");

module.exports = {
    selectComic: selectComic
}


/**
 *      Variable Definition
 */
// variable to store the settings. Preventing frequently I/O operations
var comicData = {};

/**
 * Set information for selected comic and grab chapters-info
 * @param {String} host     : Host name
 * @param {String} link     : Link to the comic
 * @param {String} title    : Comic's name (human-readable)
 * @param {String} titleKey : Unique key for the comic
 * @param {String} imguri   : thumbnail/cover photo 's url
 */
function selectComic(host, link, title, titleKey, imguri) {
    readViewController.setCurrentComic(host, titleKey, title, link, imguri);
    subscriber.register(host, titleKey, title, link, imguri);

    readViewController.clearReadArea();
    values.hostnames[host].parsers.grabChapters(titleKey, link, onChaptersGrabbed);

    // -- UI update --
    // Enable the loading screen
    readViewController.toggleLoadingAnimation(true);
    // update the subscription indicators' UI
    subscriber.updateUI();
    // Make read-view active
    viewSwitchViewController.tabswitch(2);
}

/**
 * Callback function when chapter info is grabbed
 * @param {Object} result : list of object
 *      @param {String} result.chName : Chapter name (human-readable)
 *      @param {String} result.chLink : url to the chapter
 *      @param {String} domid         : HTML DOM id to the chapter selector entry 
 *      @param {int}    index         : index in the chapter list
 */
function onChaptersGrabbed(result, newest){
    // clear the chapter selector
    readViewController.clearChapterSelector();

    // create an empty chapter list with size of the length of the result
    var chapterList = new Array(result.length);

    // Get information from settings
    var keyPath = "comic." + readViewController.getCurHost() 
                    + "." + readViewController.getCurTitleKey();
    comicData = settings.get(keyPath)
    var chaptersData = comicData.chapters;
    
    for (var index in result) {
        var obj = result[index];
        var view = readViewController.createChapterEntry(obj.chGroup, obj.chKey, obj.chName, obj.chLink, obj.domid, obj.index);
        chapterList[obj.index] = "#" + obj.domid;
        
        // if it is a new chapter, update the setting files
        if (!(obj.chGroup in chaptersData)) {
            chaptersData[obj.chGroup] = {}
        } 
        if (!(obj.chKey in chaptersData[obj.chGroup])) {
            chaptersData[obj.chGroup][obj.chKey] = {
                name: obj.chName,
                read: false
            }
        }

        // add new ui to the screen
        readViewController.appendNewChapter(view);
    }
    // Pass information to the read view
    readViewController.setChapterList(chapterList);

    // update the newest chapter 
    // TODO: sloppy method, should implement with a different way later
    comicData.newestchapter = newest;
    comicData.hasupdate = false;

    // update the read-history UI
    updateChapterList();

    translateViewController.translate();
    // disable the loading UI
    readViewController.toggleLoadingAnimation(false);
}


/**
 * Select one chapter to load
 * @param {String} chLink  : URL to the chapter
 * @param {String} chGroup : Chapter group
 * @param {String} chKey   : Chapter's unique key
 */
function selectChapter(chLink, chGroup, chKey) {

    readViewController.clearReadArea();
    
    curPageIdx = 0;
    values.hostnames[readViewController.getCurHost()].parsers.loadChapter(chLink, chGroup, chKey, onSingleChapterLoaded);
    
}


/**
 * Callback function when one single chapter is loaded
 * @param {list} result : list of objects
 *      @param {String} imgurl : image url
 *      @param {String} id     : HTML DOM object id for that image
 *      @param {int}    idx    : index in the image array
 * @param {String} chGroup : Chapter group
 * @param {String} chKey   : Chapter's unique key
 */
function onSingleChapterLoaded(result, chGroup, chKey) {
    if (chKey != $(readViewController.getChapterList()[readViewController.getChIdx()]).attr("chKey")) {
        return;
    }
    var pageIds = new Array(result.length);
    for (var index in result) {
        var obj = result[index];
        var view = readViewController.createComicPage(obj.imgurl, obj.id, obj.idx);
        pageIds[obj.idx] = obj.id;
        readViewController.appendNewPage(view);
    }
    readViewController.setPageIds(pageIds);
    // console.log("read");
    comicData.chapters[chGroup][chKey].read = true;
    comicData.lastread = comicData.chapters[chGroup][chKey].name;
    updateChapterList();
}


/**
 * Update read-history UI indicator
 */
function updateChapterList() {
    readViewController.updateChapterList(comicData);
    var keyPath = "comic." + readViewController.getCurHost() + "." + readViewController.getCurTitleKey();
    settings.set(keyPath, comicData);
}

/**
 *      Initialization / UI
 */

function init() {
    searchViewController.bindSelectComic(selectComic);
    favViewController.bindSelectComic(selectComic);

    readViewController.bindSelectChapter(selectChapter);
}

function lateInit() {
    
}


/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);
