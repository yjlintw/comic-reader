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
var host = "dm5";
var searchuri = "http://www.dm5.com/search?title={search}&language=1";
var baseuri = "http://www.dm5.com/";

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
        uri: encodeURI(searchuri.replace("{search}", search_term)),
        headers: {
            Referer: 'http://www.dm5.com/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
            cookie: 'isAdult=1'
        }
    }, searchResponse.bind({callback:callback}));
}

/**
 * HTML request callback function. Response from search
 * @param see npm request module
 */
function searchResponse(error, response, body) {
    // console.log(body);
    // var tmp2 = $("<div>" + body + "</div>");
    // console.log(tmp2.html());
    var tmp = $(".container .midBar .item", "<div>" + body + "</div>");
    // console.log (tmp);
    var result = [];
    var callback = this.callback;
    async.each(tmp, function(e, callback1){
        var title = $(e).find('a.title').text();
        // console.log(title);
        var rel_link = $(e).find('a.title').attr('href');
        var titlekey = rel_link.substring(1, rel_link.length - 2);
        var link = baseuri + rel_link;
        var imguri = $(e).find('img').attr('src');
        var updateinfo = "作者：" + $(e).find('dt>a:first-of-type').text();
        // console.log(updateinfo);
        var description = $(e).find('.info .value').text().replace(/^\s+|\s+$/g, '');
        var obj = {};
        obj.link = link;
        obj.titlekey = titlekey;
        obj.imguri = imguri;
        obj.title = title;
        obj.host = host;
        obj.updateinfo = updateinfo;
        obj.description = description;
        result.push(obj);
        callback1();
    }, function () {
        console.log("All Search dm5 done");
        callback(result, host);
    });

    // this.callback(result, host);
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
        headers: {
            Referer: 'http://www.dm5.com/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
            cookie: 'isAdult=1'
        }
    }, onChapterGrabbed.bind({callback: callback, titlekey: titlekey}));
}

function onChapterGrabbed(error, response, body) {
    // var hostpath = response.request.host;
    var tmp = $("<div>" + body + "</div>").find('[id^=cbc] li a');
    var result = [];
    var result_keys = {};
    var newest = "";
    var titlekey = this.titlekey;
    tmp.each(function(i, e){
        if($(e).attr('href') == undefined) return;
        var ch_name = $(e).text();
        var rel_link = $(e).attr('href');
        if (rel_link.includes("javascript")) return;
        var ch_link = baseuri + rel_link;
        var ch_group = "cr_main";
    //     var link_chunks = $(e).find('a').attr('href').split('/');
    //     var lastIndex = link_chunks.length;
        
        var domid = rel_link.replace(/\//g, '');
        var ch_key = domid;
    //     // console.log(chName + ":" + chLink + ":" + chGroup + ":" + domid);
        var obj = {
            ch_name: ch_name,
            ch_link: ch_link,
            ch_group: ch_group,
            ch_key: ch_key, 
            domid: domid,
            index: i
        };
        // console.log(ch_name + ":" + i + ":" + ch_key);
        if (ch_key in result_keys) {

        } else {
            result.push(obj);
            result_keys[ch_key] = true;
        }
    });
    // for(var i = 0; i < result.length; i++) {
    //     result[i].index = i;
    // }
    // console.log(this.titlekey)
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
        uri: ch_link,
        headers: {
            Referer: 'http://www.dm5.com/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
            cookie: 'isAdult=1'
        }
    }, onSingleChapterLoaded.bind({callback:callback, ch_group: ch_group, ch_key: ch_key}))    

}



/**
 * Load the page to find the javascript file location that contains info we need
 * @param see npm request module
 */
function onSingleChapterLoaded(error, response, body) {
    var doc = body;
    // console.log(body);
    var tmp = $("<div>" + body + "</div>");
    // console.log(body);
    var script1=/<script type\=\"text\/javascript\">(.*)reseturl/.exec(body)[1];
	eval(script1);
    

    var url = response.request.href;
    // console.log(DM5_IMAGE_COUNT);
    var callback = this.callback;
    var ch_group = this.ch_group;
    var ch_key = this.ch_key;
    async.times(DM5_IMAGE_COUNT, function(n, next) {
        var src = baseuri + "chapterfun.ashx?cid=" + DM5_CID.toString() + "&page=" + (n + 1) + "&key=&language=1";
        request({
            method: 'GET',
            uri: src,
            headers: {
                Referer: 'http://www.dm5.com/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
                cookie: 'isAdult=1'
            }
        }, function(error, response, body){
            var images = eval(body);
            var id = 'pic' + n;
            var obj = {
                imgurl: images[0],
                id: id,
                idx: n
            };
            next(null, obj);
        })
    },function(err, result) {
        // console.log(images);
        callback(result, ch_group, ch_key);
    })
   
}
