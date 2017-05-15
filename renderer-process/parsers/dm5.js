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

let request = require("request");
const util = require("../util");
let async = require('async');

module.exports = {
    search: search,
    grabChapters: grabChapters,
    loadChapter: loadChapter
}
let host = "dm5";
let searchuri = "http://www.dm5.com/search?title={search}&language=1";
let baseuri = "http://www.dm5.com/";

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
        headers: {
            Referer: 'http://www.dm5.com/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
            cookie: 'isAdult=1'
        },
        timeout: 5000
    }, searchResponse.bind({callback:callback}));
}

/**
 * HTML request callback function. Response from search
 * @param see npm request module
 */
function searchResponse(error, response, body) {
    let tmp = $(".container .midBar .item", "<div>" + body + "</div>");
    let result = [];
    let callback = this.callback;
    async.each(tmp, function(e, callback1){
        let $e = $(e);
        let title = $e.find('a.title').text();
        let rel_link = $e.find('a.title').attr('href');
        let titlekey = rel_link.substring(1, rel_link.length - 2);
        let link = baseuri + rel_link;
        let imguri = $e.find('img').attr('src');
        let updateinfo = "作者：" + $e.find('dt>a:first-of-type').text();
        let description = $(e).find('.info .value').text().replace(/^\s+|\s+$/g, '');
        let obj = {
            link: link,
            titlekey: titlekey,
            imguri: imguri,
            title: title,
            host: host,
            updateinfo: updateinfo,
            description: description
        }
        result.push(obj);
        callback1();
    }, function () {
        console.log("All Search dm5 done");
        callback(result, host);
    });

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
        },
        timeout: 5000
    }, onChapterGrabbed.bind({callback: callback, titlekey: titlekey}));
}

/**
 * 
 * @param see npm request module
 */
function onChapterGrabbed(error, response, body) {
    // let hostpath = response.request.host;
    let tmp = $("<div>" + body + "</div>").find('[id^=cbc] li a');
    let result = [];
    let result_keys = {};
    let newest = "";
    let titlekey = this.titlekey;
    tmp.each(function(i, e){
        if($(e).attr('href') == undefined) return;
        let ch_name = $(e).text().replace(/.*(?:漫畫|漫画)\s*/g, '');
        let rel_link = $(e).attr('href');
        if (rel_link.includes("javascript")) return;
        let ch_link = baseuri + rel_link;
        let ch_group = "cr_main";
        
        let domid = rel_link.replace(/\//g, '');
        let ch_key = domid;
        let obj = {
            ch_name: ch_name,
            ch_link: ch_link,
            ch_group: ch_group,
            ch_key: ch_key, 
            domid: domid,
            index: i
        };
        if (ch_key in result_keys) {

        } else {
            result.push(obj);
            result_keys[ch_key] = true;
        }
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
        headers: {
            Referer: 'http://www.dm5.com/',
			'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
			'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
            cookie: 'isAdult=1'
        },
        timeout: 5000
    }, onSingleChapterLoaded.bind({callback:callback, ch_group: ch_group, ch_key: ch_key}))    

}



/**
 * Load the page to find the javascript file location that contains info we need
 * @param see npm request module
 */
function onSingleChapterLoaded(error, response, body) {
    let doc = body;
    let tmp = $("<div>" + body + "</div>");
    let script1=/<script type\=\"text\/javascript\">(.*)reseturl/.exec(body)[1];
	eval(script1);
    

    let url = response.request.href;
    let callback = this.callback;
    let ch_group = this.ch_group;
    let ch_key = this.ch_key;
    async.times(DM5_IMAGE_COUNT, function(n, next) {
        let src = baseuri + "chapterfun.ashx?cid=" + DM5_CID.toString() + "&page=" + (n + 1) + "&key=&language=1";
        request({
            method: 'GET',
            uri: src,
            headers: {
                Referer: 'http://www.dm5.com/',
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/51.0.2704.103 Safari/537.36',
                'Accept-Language': 'en-US,en;q=0.8,zh-TW;q=0.6,zh;q=0.4,ja;q=0.2',
                cookie: 'isAdult=1'
            },
            timeout: 5000
        }, function(error, response, body){
            let images = eval(body);
            if (images == undefined) {
                next(null, null);
                return;
            }
            let id = 'pic' + n;
            let obj = {
                imgurl: images[0],
                id: id,
                idx: n
            };
            next(null, obj);
        })
    },function(err, result) {
        callback(result, ch_group, ch_key);
    })
   
}
