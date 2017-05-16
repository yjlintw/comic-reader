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

let requestModule = require("request");
const util = require("../util");
let async = require('async');
let jar = requestModule.jar();


let request = requestModule.defaults({jar: jar});


module.exports = {
    search: search,
    grabChapters: grabChapters,
    loadChapter: loadChapter
}
let host = "read-comicbooks-online";
let searchuri = "http://readcomicbooksonline.net/search/node/{search}";
let baseuri = "http://readcomicbooksonline.net";

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
    request({
        method: "GET",
        uri: encodeURI(searchuri.replace("{search}", search_term)),
        timeout: 5000
    }, searchResponse.bind({callback:callback}));
}

/**
 * HTML request callback function. Response from search
 * @param see npm request module
 */
function searchResponse(error, response, body) {
    let tmp = $("#block-system-main", "<div>" + body + "</div>").find(".search-result");
    let result = [];
    let callback = this.callback;
    async.each(tmp, function(e, callback1){
        let titleinfo = e.querySelector(".title");
        let title = titleinfo.textContent.replace(/^\s+|\s+$/g, '');
        let link = titleinfo.querySelector('a').getAttribute('href');
        let titlekey = link.substr(link.lastIndexOf('/') + 1);
        let obj = {
            link: link,
            titlekey: titlekey,
            title: title,
            host: host
        }
        request({
            method: "GET",
            uri: link,
            timeout: 5000
        }, onDetailInfoGet.bind({
            callback: callback1,
            obj: obj,
            result: result
        }));
    }, function () {
        console.log("All Search readcomicbooksonline done");
        callback(result, host);
    });

    // this.callback(result, host);
}

function onDetailInfoGet(error, response, body) {
    let tmp = $("#infoblock", "<div>" + body + "</div>");
    this.obj.imguri = baseuri + tmp.find('img').attr('src');
    this.obj.updateinfo = tmp.find("#statsblock").find('tr:nth-child(4) .info').text();
    this.obj.description = tmp.find("#summary").children().remove().end().text();

    this.result.push(this.obj);
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
        uri: link,
        timeout: 5000
    }, onChapterGrabbed.bind({callback: callback, titlekey: titlekey}));
}

/**
 * 
 * @param see npm request module
 */
function onChapterGrabbed(error, response, body) {
    let hostpath = response.request.host;
    let tmp = $("#chapterlist", "<div>" + body + "</div>").find(".chapter");
    let comic_title = $("#content-wrap", "<div>" + body + "</div>").find(".page-title").text();
    let comic_title_alt = comic_title.replace(/[^\w\s]/gi, '');
    let result = [];
    let result_keys = {};
    let newest = "";
    let titlekey = this.titlekey;
    tmp.each(function(i, e){
        let $e = $(e);
        let ch_name = $e.text().replace(comic_title, '');
        ch_name = ch_name.replace(comic_title_alt, "");

        let ch_link = $e.find('a').attr("href");
        let ch_group = "cr_main";

        let ch_key = ch_link.substr(ch_link.lastIndexOf('/') + 1).replace(/[^\w\s]/gi, '');;
        let domid = ch_key;
        let obj = {
            ch_name: ch_name,
            ch_link: ch_link,
            ch_group: ch_group,
            ch_key: ch_key, 
            domid: domid,
            index: i
        };
        result.push(obj);

    });
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
        uri: ch_link,
        timeout: 5000
    }, onSingleChapterLoaded.bind({callback:callback, ch_group: ch_group, ch_key: ch_key}))    

}



/**
 * Load the page to find the javascript file location that contains info we need
 * @param see npm request module
 */
function onSingleChapterLoaded(error, response, body) {
    let tmp = $("<div>" + body + "</div>");
    let omv = tmp.find("#omv");
    let num_pages = omv.find(".pager:first-child select:nth-child(2) option").length;
    let rel_img_url_template = omv.find(".picture").attr("src");
    let result = [];
    let callback = this.callback;
    let ch_group = this.ch_group;
    let ch_key = this.ch_key;
    async.times(num_pages, function(i, next) {
        let rel_img_url = rel_img_url_template.replace(/(\d*)(\.jpg|\.png)$/g, util.pad(i+1, 3) + "$2");
        let img_url = baseuri + "/reader/" + rel_img_url;
        request({
            method:'GET',
            uri: img_url,
            headers: {
                Referer: 'http://readcomicbooksonline.net/reader/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
                cookie: 'has_js=1'
            },
            timeout: 5000

        }, function(error, response, body) {
            let id = "pic" + i;
            let obj = {
                imgurl: img_url,
                id: id,
                idx: i
            };
            next(null, obj);
        });

    }, function(err, result){
        callback(result, ch_group, ch_key);

    });

    
   
}
