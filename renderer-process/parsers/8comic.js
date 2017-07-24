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

let host = "8comic";
let searchuri = "http://8comic.se/搜尋結果/?w={search}";
let baseuri = "http://8comic.se";

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
    let tmp = $("#post-35", "<div>" + body + "</div>").find('.post-list-full .data a');
    let result = [];
    let callback = this.callback;
    async.each(tmp, function(e, callback1){
        let $e = $(e);
        let title = $e.text();
        let link = baseuri + $e.attr('href');
        let rel_link = $e.attr('href');
        let titlekey = $e.attr('href').substr(1, rel_link.length - 2);
        request({
            method: "GET",
            uri: link,
            timeout: 5000
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

/**
 * Since 8Comic's search result does not return detail information, we will
 * need another GET request to get those information
 * @param see npm request module
 */
function onDetailInfoGet(error, response, body) {
    let tmp = $("#content", "<div>" + body + "</div>").find('table tr:first-child');
    
    let imguri = tmp.find('img').attr('src');
    let description = tmp.find('p').text().replace(/^\s+|\s+$/g, '');

    let obj = {
        link: this.link,
        titlekey: this.titlekey,
        imguri: imguri,
        title: this.title,
        host: host,
        updateinfo: "",
        description: description
    }
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
        console.error("8comic: " + error);
        this.callback(null, null);
        return;
    }
    let hostpath = response.request.host;
    let tmp = $("#content", "<div>" + body + "</div>").find('table tr:nth-child(n+3):nth-last-child(n+1) td');
    let result = [];
    let newest = "";
    let titlekey = this.titlekey;
    tmp.each(function(i, e){
        let $e = $(e);
        if($e.find('a').attr('href') == undefined) return;
        let ch_name = $e.find('a').text();
        let ch_link = $e.find('a').attr('href');
        let ch_group = "cr_main";
        let link_chunks = $e.find('a').attr('href').split('/');
        let lastIndex = link_chunks.length;
        let domid = link_chunks[lastIndex-1] == ""? link_chunks[lastIndex-2]:link_chunks[lastIndex-1];
        let ch_key = domid;

        let obj = {
            ch_name: ch_name,
            ch_link: ch_link,
            ch_group: ch_group,
            ch_key: ch_key, 
            domid: domid,
            index: i
        };
        result.unshift(obj)
    });
    for (let i = 0; i < result.length; i++) {
        result[i].index = i;
    }
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
    let find_script = tmp.find('#pull').find('option:nth-child(2)').attr('value').split("'");
    let chapters_num = find_script[1];
    let num_pages = find_script[3];
    let img_template = tmp.find("#caonima").attr("src");
    
    let pid = '/' + chapters_num + '/';
    let img = img_template.split(pid);
    let result = [];
    for (let i = 1; i <= num_pages; i++) {
        let src = img[0] + pid + util.pad(i, 3) + '.jpg'; 
        let id = 'pic' + i;
        let obj = {
            imgurl: src,
            id: id,
            idx: i-1
        };
        result.push(obj);
    }
    this.callback(result, this.ch_group, this.ch_key);
}
