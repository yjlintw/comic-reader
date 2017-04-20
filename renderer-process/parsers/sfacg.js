/**
 *      Parser Module
 *      
 *      A parser module needs to have three functions
 * 
 *      *   Function: search(searchTerm, callback)
 *          function callback(result)
 *          result is a list of obj contains following
 *          fields:
 *              link
 *              titleKey
 *              imguri
 *              comicTitle
 *              host
 *              updateinfo
 *              description
 * 
 *      *   Function: GrabChapters(searchResponse, callback)
 *          function callback(result)
 *          result is a list of obj contains following
 *          fields:
 *              chName,
 *              chLink,
 *              domid,
 *              index 
 * 
 *      *   Function: loadChapters(searchResponse, callback)
 *          function callback(result)
 *          result is a list of obj contains following
 *          fields:
 *              imgurl,
 *              id,
 *              idx
 *              
 * 
 */

var request = require("request");
const util = require("../util");


module.exports = {
    search: search,
    grabChapters: grabChapters,
    loadChapter: loadChapter
}

var host = "sfacg";
var searchuri = "http://s.sfacg.com/?Key={search}&S=0&SS=0";


/**
 * Search comic books
 * @param {string} searchTerm: Keywords to search
 * @param {function} callback(result, host)
 *        
 *        result {Array}: List of obj (see below) that contains information about the comic
 *        host {String}: name of the host
 * 
 *        obj {Object}:
 *          link {String}
 *          titleKey {String}
 *          imguri {String}
 *          comicTitle {String}
 *          host {String}
 *          updateinfo {String}
 *          description {String}
 */
function search(searchTerm, callback) {
    request({
        method: "GET",
        uri: searchuri.replace("{search}", util.toUnicode(searchTerm))
    }, searchResponse.bind({callback:callback}));
}

/**
 * HTML request callback function. Response from search
 * @param see npm request module
 */
function searchResponse(error, response, body) {
    var tmp = $("#form1", "<div>" + body + "</div>").find("table:nth-of-type(5)");
    var result = [];
    tmp.find("ul").each(function(i, e){
        var imguri = $(e).find("li:first-child img").attr("src");
        // console.log(imguri);
        var comicTitle = $(e).find("li:nth-child(2)").find("a").text();
        var link = $(e).find("li:nth-child(2)").find("a").attr("href");
        var info = $(e).find("li:nth-child(2)").text().split("\n");
        $.map(info, $.trim);
        var updateinfo = info[1];
        var description = info.splice(2).join('\n').trim();
        var titleKey = link.substr(link.lastIndexOf('/') + 1);
        var obj = {};
        obj.link = link;
        obj.titleKey = titleKey;
        obj.imguri = imguri;
        obj.comicTitle = comicTitle;
        obj.host =host;
        obj.updateinfo = updateinfo;
        obj.description = description;
        result.push(obj);
    });

    this.callback(result, host);
}


/**
 * 
 * @param {String} titleKey
 * @param {String} link 
 * @param {function} callback (result)
 * 
 * 
 *      {List}  result: List of obj (see below)
 *      {Object} obj
 *            {String} chName : Chapter's name
 *            {String} chLink : URL to the chapter
 *            {String} chGroup: Chapter's Group
 *            {String} chKey  : Chapter's unique key
 *            {String} domid  : HTML DOM object id
 *            {int}    index  : index
 *      
 */
function grabChapters(titleKey, link, callback) {
    request({
        methos: 'GET',
        uri: link
    }, onChapterGrabbed.bind({callback: callback, titleKey: titleKey}));
}

function onChapterGrabbed(error, response, body) {
    var hostpath = response.request.host;
    var tmp = $("table:nth-of-type(9)", "<div>" + body + "</div>").find("ul.serialise_list.Blue_link2");
    var result = [];
    var newest = "";
    var titleKey = this.titleKey;
    tmp.find("li").each(function(i, e) {
        var chName = $(e).text();
        var chLink = "http://" + hostpath + $(e).find('a').attr('href');
        var domid = "chapter" + i;
        var chGroup = "";
        var chKey = "";
        var linkChunks = chLink.split("/");
        // console.log(linkChunks[linkChunks.length - 3] + ":" + titleKey);
        if (linkChunks[linkChunks.length - 3] == titleKey) {
            chGroup = "cr_main";
            chKey = linkChunks[linkChunks.length - 2];
            if (newest == "") {
                newest = chName;
            }
        } else if (linkChunks[linkChunks.length - 4] == titleKey) {
            chGroup = linkChunks[linkChunks.length - 3];
            chKey = linkChunks[linkChunks.length - 2];
        }

        var obj = {
            chName: chName,
            chLink: chLink,
            chGroup: chGroup,
            chKey: chKey, 
            domid: domid,
            index: i
        };
        result.push(obj);
    });

    this.callback(result, newest);
}


/**
 * 
 * @param {String} chLink : Link to the chapter 
 * @param {String} chGroup: Chapter's Group
 * @param {String} chKey  : Chapter's unique key
 * @param {String} chName : Chapter name (User-readable)
 * @param {function} callback(result, chName)
 *      @param result: list of obj contains information for images to load
 *          {String} imgurl: Image URL
 *          {String} id    : HTML DOM object id
 *          {int}    idx   : index
 */
function loadChapter(chLink, chGroup, chKey, callback) {
    request({
        method: 'GET',
        uri: chLink
    }, onSingleChapterLoaded.bind({callback:callback, chGroup: chGroup, chKey: chKey}))    

}

/**
 * Load the page to find the javascript file location that contains info we need
 * @param see npm request module
 */
function onSingleChapterLoaded(error, response, body) {
    var tmp = $("<div>" + body + "</div>");
    var scripts = tmp.find("script").eq(1).attr("src");
    var hostpath = response.request.host;
    request({
        method: 'GET',
        uri: "http://" + hostpath + scripts
    }, utilParser.bind({callback:this.callback, chGroup: this.chGroup, chKey: this.chKey}));
}

/**
 * Load the javascript that stored int the target website.
 * The javascript contains information included:
 *      @param {Array} hosts : list of server that we can use in String format
 *      @param {Array} picAy : list of image url in String format
 * 
 * invoke the callback function that was passed in from loacChapter(...)
 * @param see npm request module
 */
function utilParser (error, response, body) {
    var host = response.request.host;
    eval(body);
    var pichost = hosts[0];
    var result = [];
    for(idx in picAy) {
        imgurl = "http://" + host+picAy[idx];
        var id = "pic" + idx;
        var obj = {
            imgurl: imgurl,
            id: id,
            idx: idx
        };
        result.push(obj);
    }

    this.callback(result, this.chGroup, this.chKey);
    
}