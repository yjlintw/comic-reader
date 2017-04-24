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
 *              titlekey
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
 *              ch_name,
 *              ch_link,
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
 *          titlekey {String}
 *          imguri {String}
 *          title {String}
 *          host {String}
 *          updateinfo {String}
 *          description {String}
 */
function search(search_term, callback) {
    request({
        method: "GET",
        uri: searchuri.replace("{search}", util.toUnicode(search_term))
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
        var title = $(e).find("li:nth-child(2)").find("a").text();
        var link = $(e).find("li:nth-child(2)").find("a").attr("href");
        var info = $(e).find("li:nth-child(2)").text().split("\n");
        $.map(info, $.trim);
        var updateinfo = info[1];
        var description = info.splice(2).join('\n').trim();
        var titlekey = link.substr(link.lastIndexOf('/') + 1);
        var obj = {};
        obj.link = link;
        obj.titlekey = titlekey;
        obj.imguri = imguri;
        obj.title = title;
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
 *            {String} ch_name : Chapter's name
 *            {String} ch_link : URL to the chapter
 *            {String} ch_group: Chapter's Group
 *            {String} ch_key  : Chapter's unique key
 *            {String} domid   : HTML DOM object id
 *            {int}    index   : index
 *      
 */
function grabChapters(titlekey, link, callback) {
    request({
        methos: 'GET',
        uri: link
    }, onChapterGrabbed.bind({callback: callback, titlekey: titlekey}));
}

function onChapterGrabbed(error, response, body) {
    var hostpath = response.request.host;
    var tmp = $("table:nth-of-type(9)", "<div>" + body + "</div>").find("ul.serialise_list.Blue_link2");
    var result = [];
    var newest = "";
    var titlekey = this.titlekey;
    tmp.find("li").each(function(i, e) {
        var ch_name = $(e).text();
        var ch_link = "http://" + hostpath + $(e).find('a').attr('href');
        var domid = "chapter" + i;
        var ch_group = "";
        var ch_key = "";
        var link_chunks = ch_link.split("/");
        // console.log(linkChunks[linkChunks.length - 3] + ":" + titleKey);
        if (link_chunks[link_chunks.length - 3] == titlekey) {
            ch_group = "cr_main";
            ch_key = link_chunks[link_chunks.length - 2];
            if (newest == "") {
                newest = ch_name;
            }
        } else if (link_chunks[link_chunks.length - 4] == titlekey) {
            ch_group = link_chunks[link_chunks.length - 3];
            ch_key = link_chunks[link_chunks.length - 2];
        }

        var obj = {
            ch_name: ch_name,
            ch_link: ch_link,
            ch_group: ch_group,
            ch_key: ch_key, 
            domid: domid,
            index: i
        };
        result.push(obj);
    });

    this.callback(result, newest);
}


/**
 * 
 * @param {String} ch_link : Link to the chapter 
 * @param {String} ch_group: Chapter's Group
 * @param {String} ch_key  : Chapter's unique key
 * @param {String} ch_name : Chapter name (User-readable)
 * @param {function} callback(result, chName)
 *      @param result: list of obj contains information for images to load
 *          {String} imgurl: Image URL
 *          {String} id    : HTML DOM object id
 *          {int}    idx   : index
 */
function loadChapter(ch_link, ch_group, ch_key, callback) {
    request({
        method: 'GET',
        uri: ch_link
    }, onSingleChapterLoaded.bind({callback:callback, ch_group: ch_group, ch_key: ch_key}))    

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
    }, utilParser.bind({callback:this.callback, ch_group: this.ch_group, ch_key: this.ch_key}));
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

    this.callback(result, this.ch_group, this.ch_key);
    
}