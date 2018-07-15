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
const LZString = require('../LZS');

String.prototype.splic = function (f) {
	return LZString.decompressFromBase64(this).split(f)
}

module.exports = {
    search: search,
    grabChapters: grabChapters,
    loadChapter: loadChapter
}

let host = "manhuagui";
let searchuri = "https://www.manhuagui.com/s/{search}.html";
let baseuri = "https://www.manhuagui.com";
let imgbaseuri = "https://i.hamreus.com"

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
    // console.log(body);
    let tmp = $(".w996 .book-result", "<div>" + body + "</div>").find('li');
    // console.log(tmp);
    let result = [];
    let callback = this.callback;
    async.each(tmp, function(e, callback1){
        let $e = $(e);
        let title = $e.find(".book-detail dt a").attr("title");
        // console.log(title);
        let link = baseuri + $e.find(".book-detail dt a").attr("href");
        let titlekey =  $e.find(".book-detail dt a").attr("href");
        let imguri = $e.find(".book-cover img").attr("src");
        let updateinfo = $e.find(".book-detail .status").text();
        let description = $e.find(".book-detail .intro").text();
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
        console.log("All Search manguagui done");
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
        timeout: 5000
    }, onChapterGrabbed.bind({callback: callback, titlekey: titlekey}));
}

/**
 * 
 * @param see npm request module
 */
function onChapterGrabbed(error, response, body) {
    if (error) {
        console.error("manhuagui: " + error);
        this.callback(null, null);
        return;
    }
    let hostpath = response.request.host;
    
    let tmp = [];
    let chapter_tmps = $(".chapter-list.cf.mt10", "<div>" + body + "</div>");
    for (var i = 0; i < chapter_tmps.length; i++) {
        let sublist = $(chapter_tmps[i]).find('ul');
        for (var j = sublist.length - 1; j >= 0; j--) {
            tmp.push.apply(tmp, $(sublist[j]).find('li'));
        }
    }
    let result = [];
    let newest = "";
    let titlekey = this.titlekey;
    tmp.forEach(function(e, i){
        let $e = $(e);
        // console.log(e);
        if($e.find('a').attr('href') == undefined) return;
        let ch_name = $e.find('a').text();
        let ch_link = baseuri + $e.find('a').attr('href');
        let ch_group = "cr_main";
        let link_chunks = $e.find('a').attr('href').split('/');
        let lastIndex = link_chunks.length;
        let domid = link_chunks[lastIndex-1] == ""? link_chunks[lastIndex-2]:link_chunks[lastIndex-1];
        let ch_key = domid.split(".")[0];
        domid = ch_key;
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
    var scriptsHtml = /window\[\"\\x65\\x76\\x61\\x6c\"\](.*?)<\/script>/.exec(body)[1];
    //var scriptsHtml = /p;}\((.*?),\{\}/im.exec(body)[1];
    //console.log(scriptUrls[0]);
    //console.log(scriptUrls[1]);
    //console.log(scriptsHtml);
    var p = eval(scriptsHtml);
    p = p.replace(").preInit();", "");
    p = p.replace("SMH.imgData(", "");
    console.log(p);
    var data = JSON.parse(p);
    console.log(data);
    var callback = this.callback;
    var ch_group = this.ch_group;
    var ch_key = this.ch_key;
    var referer = 'https://www.manhuagui.com/comic/' + data.bid +"/" + data.cid + ".html";

    async.times(data.len, function(n, next){
        var imguri = encodeURI(imgbaseuri + data.path) + data.files[n] + "?cid=" + data.cid + "&md5=" + data.sl.md5;
        console.log(imguri);
        
        getImage(n, imguri, referer, next);
    }, function(err, result) {
        callback(result, ch_group, ch_key);
    })
}

function getImage(idx, imguri, referer, callback)
{
    request({
        method: 'GET',
        uri: imguri,
        //uri: "http://www.gstatic.com/webp/gallery/1.webp",
        encoding: 'binary',
        headers: {
            'Accept': 'image/webp,image/*,*/*;q=0.8',
            'Accept-Encoding': 'gzip, deflate, sdch',
            'Accept-Language': 'zh-CN,zh;q=0.8,en-US;q=0.6,en;q=0.4',
            'Host': 'i.hamreus.com',
            'Referer': referer,
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_4) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3396.99 Safari/537.36'
        },
        timeout: 5000
    }, function(error, response, body) {
        var imgdata = "";
        if (response != null) {
            var type = response.headers["content-type"];
            console.log(type);
            if (type.startsWith("image")) {
                var prefix = "data:" + type + ";base64,";
                var base64 = new Buffer(body, 'binary').toString('base64');
                imgdata = prefix + base64;
                let id = 'pic' + idx;
                // console.log(body);
                let obj = {
                    imgurl: imgdata,
                    id: id,
                    idx: idx
                }
                callback(null, obj);
                return;
            }
        }
        getImage(idx, imguri, referer, callback);
    });
       
}