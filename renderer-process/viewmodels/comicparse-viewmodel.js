/**
 *      Comic Parser
 *      comic-parser.js
 * 
 *      Grab the chapter info and image contents from the website using 
 *      site-specific parsers
 */

// 3rd party library
let settings = require('electron-settings');

// model
const values = require('../models/values');

// view model
let subscribe_viewmodel = require('./subscribe-viewmodel');

// view controller
let search_viewcontroller = require('../viewcontrollers/search-viewcontroller');
let favorite_viewcontroller = require('../viewcontrollers/favorite-viewcontroller');
let read_viewcontroller = require('../viewcontrollers/read-viewcontroller');
let viewswitch_viewcontroller = require("../viewcontrollers/view-switch-viewcontroller");
let translate_viewcontroller = require("../viewcontrollers/translate-viewcontroller");
let titlebar_viewcontroller = require("../viewcontrollers/titlebar-viewcontroller");


/**
 *      Variable Definition
 */
// letiable to store the settings. Preventing frequently I/O operations
let comic_data = {};

/**
 * Set information for selected comic and grab chapters-info
 * @param {String} host     : Host name
 * @param {String} link     : Link to the comic
 * @param {String} title    : Comic's name (human-readable)
 * @param {String} titlekey : Unique key for the comic
 * @param {String} imguri   : thumbnail/cover photo 's url
 */
function selectComic(host, link, title, titlekey, imguri) {
    read_viewcontroller.setCurrentComic(host, titlekey, title, link, imguri);
    subscribe_viewmodel.register(host, titlekey, title, link, imguri);

    read_viewcontroller.clearReadArea();
    values.hostnames[host].parsers.grabChapters(titlekey, link, onChaptersGrabbed);

    // -- UI update --
    // Enable the loading screen
    read_viewcontroller.toggleLoadingAnimation(true);
    // update the subscription indicators' UI
    subscribe_viewmodel.updateUI();
    // Make read-view active
    viewswitch_viewcontroller.tabswitch(viewswitch_viewcontroller.TAB_NAME.READ);


}

/**
 * Callback function when chapter info is grabbed
 * @param {Object} result : list of object
 *      @param {String} result.ch_name : Chapter name (human-readable)
 *      @param {String} result.ch_link : url to the chapter
 *      @param {String} domid          : HTML DOM id to the chapter selector entry 
 *      @param {int}    index          : index in the chapter list
 */
function onChaptersGrabbed(result, newest){
    // clear the chapter selector
    read_viewcontroller.clearChapterSelector();

    // create an empty chapter list with size of the length of the result
    let chapter_list = new Array(result.length);

    // Get information from settings
    let keyPath = "comic." + read_viewcontroller.getCurHost() 
                    + "." + read_viewcontroller.getCurTitleKey();
    comic_data = settings.get(keyPath)
    let chapters_data = comic_data.chapters;
    
    for (let index in result) {
        let obj = result[index];
        let view = read_viewcontroller.createChapterEntry(obj.ch_group, obj.ch_key, obj.ch_name, obj.ch_link, obj.domid, obj.index);
        chapter_list[obj.index] = "#" + obj.domid;
        
        // if it is a new chapter, update the setting files
        if (!(obj.ch_group in chapters_data)) {
            chapters_data[obj.ch_group] = {}
        } 
        if (!(obj.ch_key in chapters_data[obj.ch_group])) {
            chapters_data[obj.ch_group][obj.ch_key] = {
                name: obj.ch_name,
                ch_link: obj.ch_link,
                read: false
            }
        }

        // add new ui to the screen
        read_viewcontroller.appendNewChapter(view);
    }
    // console.log(chapter_list);
    // Pass information to the read view
    read_viewcontroller.setChapterList(chapter_list);

    // update the newest chapter 
    // TODO: sloppy method, should implement with a different way later
    comic_data.newestchapter = newest;
    comic_data.hasupdate = false;

    
    // update the read-history UI
    updateChapterList();

    translate_viewcontroller.translate();
    // disable the loading UI
    read_viewcontroller.toggleLoadingAnimation(false);

    // select last chapter
    if (comic_data.lastread_ch_key !== undefined) {
        let obj = result[result.length - 1];
        let lastpage = comic_data.lastpage;
        if (comic_data.lastread_ch_key !== obj.ch_key) {
            lastpage = 0;
        }
        read_viewcontroller.selectChapter(comic_data.chapters[comic_data.lastread_ch_group][comic_data.lastread_ch_key].ch_link, comic_data.lastread_ch_group, comic_data.lastread_ch_key, lastpage);
    } else {
        let obj = result[result.length - 1];
        read_viewcontroller.selectChapter(obj.ch_link, obj.ch_group, obj.ch_key);
    }
}


/**
 * Select one chapter to load
 * @param {String} ch_link  : URL to the chapter
 * @param {String} ch_group : Chapter group
 * @param {String} ch_key   : Chapter's unique key
 */
function selectChapter(ch_link, ch_group, ch_key) {
    read_viewcontroller.clearReadArea();
    
    values.hostnames[read_viewcontroller.getCurHost()].parsers.loadChapter(ch_link, ch_group, ch_key, onSingleChapterLoaded);
    
}


/**
 * Callback function when one single chapter is loaded
 * @param {list} result : list of objects
 *      @param {String} imgurl : image url
 *      @param {String} id     : HTML DOM object id for that image
 *      @param {int}    idx    : index in the image array
 * @param {String} ch_group : Chapter group
 * @param {String} ch_key   : Chapter's unique key
 */
function onSingleChapterLoaded(result, ch_group, ch_key) {
    if (ch_key !== $(read_viewcontroller.getChapterList()[read_viewcontroller.getChIdx()]).attr("chkey")) {
        return;
    }
    let pageIds = new Array(result.length);
    for (let index in result) {
        let obj = result[index];
        let view = read_viewcontroller.createComicPage(obj.imgurl, obj.id, obj.idx);
        pageIds[obj.idx] = obj.id;
        read_viewcontroller.appendNewPage(view);
    }
    let lastpage_view = read_viewcontroller.createLastpageNotice();
    read_viewcontroller.appendNewPage(lastpage_view);
    read_viewcontroller.setPageIds(pageIds);
    let lastpage = comic_data.lastpage;
    if (comic_data.lastread_ch_key !== ch_key) {
        lastpage = 0;
    }
    console.log("scroll to page: comicparse");
    read_viewcontroller.scrollToPage(lastpage);
    read_viewcontroller.showToolTips();
    // console.log("read");
    comic_data.chapters[ch_group][ch_key].read = true;
    comic_data.lastread = comic_data.chapters[ch_group][ch_key].name;
    comic_data.lastread_ch_key = ch_key;
    comic_data.lastread_ch_group = ch_group;
    comic_data.lastpage = 0;
    updateChapterList();
}


/**
 * Update read-history UI indicator
 */
function updateChapterList() {
    read_viewcontroller.updateChapterList(comic_data);
    let keypath = "comic." + read_viewcontroller.getCurHost() + "." + read_viewcontroller.getCurTitleKey();
    settings.set(keypath, comic_data);
    titlebar_viewcontroller.updateTitle();
}

/**
 *      Initialization / UI
 */

function init() {
    search_viewcontroller.bindSelectComic(selectComic);
    favorite_viewcontroller.bindSelectComic(selectComic);

    read_viewcontroller.bindSelectChapter(selectChapter);
}

function lateInit() {
}


/**
 *      Main Scripts
 */

init();
$(document).ready(lateInit);


module.exports = {
    selectComic: selectComic
}