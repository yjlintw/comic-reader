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
var async = require('async');

module.exports = {
    search: search,
    grabChapters: grabChapters,
    loadChapter: loadChapter
}

var host = "8comic";
var searchuri = "http://8comic.se/搜尋結果/?w={search}";
var baseuri = "http://8comic.se";

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
    console.log(encodeURI(searchuri.replace("{search}", searchTerm)))
    request({
        method: "GET",
        uri: encodeURI(searchuri.replace("{search}", searchTerm))
    }, searchResponse.bind({callback:callback}));
}

/**
 * HTML request callback function. Response from search
 * @param see npm request module
 */
function searchResponse(error, response, body) {
    // console.log(body);
    var tmp = $("#post-35 .post-list-full", "<div>" + body + "</div>").find('.data a');
    var result = [];
    var callback = this.callback;
    async.each(tmp, function(e, callback1){
        var title = $(e).text();
        var link = baseuri + $(e).attr('href');
        var relLink = $(e).attr('href');
        var titleKey = $(e).attr('href').substr(1, relLink.length - 2);
        request({
            method: "GET",
            uri: link
        }, onDetailInfoGet.bind({
            callback: callback1,
            link: link,
            title: title,
            titleKey: titleKey,
            result: result
        }));


    }, function () {
        console.log("All Search 8COMICS done");
        callback(result);
    });

    this.callback(result, host);
}

function onDetailInfoGet(error, response, body) {
    var tmp = $("#content table tr:first-child", "<div>" + body + "</div>");
    // console.log(this.title);
    // console.log(this.titleKey);
    
    var imguri = tmp.find('img').attr('src');
    var description = tmp.find('p').text().replace(/^\s+|\s+$/g, '');
    // console.log(imgurl);
    // console.log(description);

    var obj = {};
    obj.link = this.link;
    obj.titleKey = this.titleKey;
    obj.imguri = imguri;
    obj.comicTitle = this.title;
    obj.host = host;
    obj.updateinfo = "";
    obj.description = description;
    this.result.push(obj);

    this.callback();

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
    var tmp = $("#content table tr:nth-child(n+3):nth-last-child(n+1)", "<div>" + body + "</div>").find('td');
    var result = [];
    var newest = "";
    var titleKey = this.titleKey;
    tmp.each(function(i, e){
        if($(e).text() == "") return;
        var chName = $(e).find('a').text();
        var chLink = $(e).find('a').attr('href');
        var chGroup = "cr_main";
        var linkChunks = $(e).find('a').attr('href').split('/');
        var lastIndex = linkChunks.length;
        var domid = linkChunks[lastIndex-1] == ""? linkChunks[lastIndex-2]:linkChunks[lastIndex-1];
        var chKey = domid;
        // console.log(chName + ":" + chLink + ":" + chGroup + ":" + domid);

        var obj = {
            chName: chName,
            chLink: chLink,
            chGroup: chGroup,
            chKey: chKey, 
            domid: domid,
            index: i
        };
        result.unshift(obj)
    });
    for (var i = 0; i < result.length; i++) {
        result[i].index = i;
    }
    // console.log(result);
    newest = result[0].chName;

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
    // console.log(this.chKey);
    var tmp = $("<div>" + body + "</div>");
    var find_script = tmp.find('#pull option:nth-child(2)').attr('value').split("'");
    var chapNum = find_script[1];
    var numPages = find_script[3];
    var imgTemplate = tmp.find("#caonima").attr("src");
    var pid = chapNum + '/';
    var img = imgTemplate.split(pid);
    var result = [];
    for (var i = 1; i <= numPages; i++) {
        var src = img[0] + pid + util.pad(i, 3) + '.jpg'; 
        // console.log(src);
        var id = 'pic' + i;
        var obj = {
            imgurl: src,
            id: id,
            idx: i-1
        };
        result.push(obj);
    }
    this.callback(result, this.chGroup, this.chKey);
}
