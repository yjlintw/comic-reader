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

var requestModule = require("request");
const util = require("../util");
var async = require('async');
var jar = requestModule.jar();


var request = requestModule.defaults({jar: jar});


module.exports = {
    search: search,
    grabChapters: grabChapters,
    loadChapter: loadChapter
}
var host = "read-comicbooks-online";
var searchuri = "http://readcomicbooksonline.net/search/node/{search}";
var baseuri = "http://readcomicbooksonline.net";

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
    // // var tmp2 = $("<div>" + body + "</div>");
    // // console.log(tmp2.html());
    var tmp = $("#block-system-main", "<div>" + body + "</div>").find(".search-result");
    console.log (tmp);
    var result = [];
    var callback = this.callback;
    async.each(tmp, function(e, callback1){
        console.log(e);
        let titleinfo = e.querySelector(".title");
        let title = titleinfo.textContent.replace(/^\s+|\s+$/g, '');
        // console.log(title);
        var link = titleinfo.querySelector('a').getAttribute('href');
        var titlekey = link.substr(link.lastIndexOf('/') + 1);
        // console.log(titlekey);
    //     var imguri = $(e).find('img').attr('src');
    //     var updateinfo = "作者：" + $(e).find('dt>a:first-of-type').text();
    //     // console.log(updateinfo);
    //     var description = $(e).find('.info .value').text().replace(/^\s+|\s+$/g, '');
        var obj = {};
        obj.link = link;
        obj.titlekey = titlekey;
        // obj.imguri = imguri;
        obj.title = title;
        obj.host = host;
    //     obj.updateinfo = updateinfo;
    //     obj.description = description;
        request({
            method: "GET",
            uri: link
        }, onDetailInfoGet.bind({
            callback: callback1,
            obj: obj,
            result: result
        }));
        // result.push(obj);
        // callback1();
    }, function () {
        console.log("All Search dm5 done");
        callback(result, host);
    });

    // this.callback(result, host);
}

function onDetailInfoGet(error, response, body) {
    // console.log(response);
    var tmp = $("#infoblock", "<div>" + body + "</div>");
    console.log(tmp);
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
    }, onChapterGrabbed.bind({callback: callback, titlekey: titlekey}));
}

function onChapterGrabbed(error, response, body) {
    var hostpath = response.request.host;
    var tmp = $("#chapterlist", "<div>" + body + "</div>").find(".chapter");
    // console.log(tmp);
    // var tmp = $("<div>" + body + "</div>").find('[id^=cbc] li a');
    var comic_title = $("#content-wrap", "<div>" + body + "</div>").find(".page-title").text();
    var comic_title_alt = comic_title.replace(/[^\w\s]/gi, '');
console.log(comic_title);
    var result = [];
    var result_keys = {};
    var newest = "";
    var titlekey = this.titlekey;
    tmp.each(function(i, e){
        // console.log(e);
        var ch_name = $(e).text().replace(comic_title, '');
        ch_name = ch_name.replace(comic_title_alt, "");

        var ch_link = $(e).find('a').attr("href");
        var ch_group = "cr_main";

        var ch_key = ch_link.substr(ch_link.lastIndexOf('/') + 1).replace(/[^\w\s]/gi, '');;
        var domid = ch_key;
    //     var ch_key = domid;
        // console.log(ch_name + ":" + ch_link + ":" + ch_group + ":" + domid + ":" + ch_key);
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
    // var doc = body;
    // console.log(body);
    console.log(response.request.href);
    var tmp = $("<div>" + body + "</div>");
    var omv = tmp.find("#omv");
    var num_pages = omv.find(".pager:first-child select:nth-child(2) option").length;
    var rel_img_url_template = omv.find(".picture").attr("src");
    // console.log(num_pages)
    // console.log(rel_img_url_template);
    var result = [];
    var callback = this.callback;
    var ch_group = this.ch_group;
    var ch_key = this.ch_key;
    async.times(num_pages, function(i, next) {
        var rel_img_url = rel_img_url_template.replace(/-\d*\./g, "-" + util.pad(i+1, 3) + ".");
        var img_url = baseuri + "/reader/" + rel_img_url;
        request({
            method:'GET',
            uri: img_url,
            headers: {
                Referer: 'http://readcomicbooksonline.net/reader/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
                cookie: 'has_js=1'
            }

        }, function(error, response, body) {
            // console.log(error);
            // console.log(response);
            // console.log(body);
            // console.log(rel_img_url);
            var id = "pic" + i;
            var obj = {
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
