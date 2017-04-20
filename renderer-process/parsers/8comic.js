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
 *              title
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
 *        host {String} : name of the host
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
    // console.log(encodeURI(searchuri.replace("{search}", search_term)))
    request({
        method: "GET",
        uri: encodeURI(searchuri.replace("{search}", search_term))
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
        var rel_link = $(e).attr('href');
        var titlekey = $(e).attr('href').substr(1, rel_link.length - 2);
        request({
            method: "GET",
            uri: link
        }, onDetailInfoGet.bind({
            callback: callback1,
            link: link,
            title: title,
            titlekey: titlekey,
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
    obj.titlekey = this.titlekey;
    obj.imguri = imguri;
    obj.title = this.title;
    obj.host = host;
    obj.updateinfo = "";
    obj.description = description;
    this.result.push(obj);

    this.callback();

}


/**
 * 
 * @param {String} titlekey
 * @param {String} link 
 * @param {function} callback (result)
 * 
 * 
 *      {List}  result: List of obj (see below)
 *      {Object} obj
 *            {String} ch_name : Chapter's name
 *            {String} ch_link : URL to the chapter
 *            {String} ch_group: Chapter's Group
 *            {String} chKey   : Chapter's unique key
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
    var tmp = $("#content table tr:nth-child(n+3):nth-last-child(n+1)", "<div>" + body + "</div>").find('td');
    var result = [];
    var newest = "";
    var titlekey = this.titlekey;
    tmp.each(function(i, e){
        if($(e).text() == "") return;
        var ch_name = $(e).find('a').text();
        var ch_link = $(e).find('a').attr('href');
        var ch_group = "cr_main";
        var link_chunks = $(e).find('a').attr('href').split('/');
        var lastIndex = link_chunks.length;
        var domid = link_chunks[lastIndex-1] == ""? link_chunks[lastIndex-2]:link_chunks[lastIndex-1];
        var ch_key = domid;
        // console.log(chName + ":" + chLink + ":" + chGroup + ":" + domid);

        var obj = {
            ch_name: ch_name,
            ch_link: ch_link,
            ch_group: ch_group,
            ch_key: ch_key, 
            domid: domid,
            index: i
        };
        result.unshift(obj)
    });
    for (var i = 0; i < result.length; i++) {
        result[i].index = i;
    }
    // console.log(result);
    newest = result[0].ch_name;

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
    // console.log(this.chKey);
    var tmp = $("<div>" + body + "</div>");
    var find_script = tmp.find('#pull option:nth-child(2)').attr('value').split("'");
    var chapters_num = find_script[1];
    var num_pages = find_script[3];
    var img_template = tmp.find("#caonima").attr("src");
    var pid = chapters_num + '/';
    var img = img_template.split(pid);
    var result = [];
    for (var i = 1; i <= num_pages; i++) {
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
    this.callback(result, this.ch_group, this.ch_key);
}
