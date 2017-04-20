/**
 *      Search-Controller.js
 * 
 *      This file includes search behavior for search page
 *
 *      See Also: ../sections/search-view.html, ./search-view.js
 */

// model
const values = require("../models/values");

// viewmodel
var subscribe_viewmodel = require("./subscribe-viewmodel");
var comicparser_viewmodel = require("./comicparse-viewmodel");

//view controller
var search_viewcontroller = require("../viewcontrollers/search-viewcontroller");

/**
 *      Variable Definition
 */
// {tring} store the html template for search result
var result_view_str_template = "";         

// {Object} key: hostname value: boolean flag
// Store information of the search request to every host
// true: is searching
// false: not searching
var search_flag_dict = {};        

/**
 *      Backend Functionality / View
 */

/**
 * Check whether is still searching
 * 
 * @return: {bool} true: is searching, false: not searching
 */
function isSearching() {
    for(key in search_flag_dict) {
        if (search_flag_dict[key]) {
            return true;
        }
    }
    return false;
}

/**
 * Send search request to different host through parsers
 * Triggerd when the user hit enter in the input box or click the search button
 * 
 * function searchResponse(result, host) will be triggered after each search 
 * request is completed
 */
function search() {
    if (isSearching()) return; // if still in the middle of searching, abort
    
    // get the search query from input box
    var search_str = search_viewcontroller.getSearchQuery(); 

    // clear the previous search results
    search_viewcontroller.clearSearchResults();

    // Show loading animiation
    search_viewcontroller.loadingUI(true);

    // Send requests using parsers
    for (var key in values.hosts) {
        values.hosts[key].parsers.search(search_str, searchResponse)
        search_flag_dict[values.hosts[key].name] = true;
    }
}

/**
 * Callback: search response returns
 * It take response, create search result and display on search-view
 * @param {Object} result 
 *        {String} link: link to the comic page
 *        {String} titlekey: a unique key for a comic in a host, two comics
 *                           from different hosts can have the same key
 * @param {String} host: name of the host that returns the response
 */
function searchResponse(result, host) {
    // Remove loading animation
    search_viewcontroller.loadingUI(false);
    
    // set search flag false
    search_flag_dict[host] = false;

    // construct UI element
    for (var idx in result) {
        var obj = result[idx];
        var view = search_viewcontroller.createResultView(
            obj.link, obj.titlekey, obj.imguri, obj.title, obj.host, 
            obj.updateinfo, obj.description);
        search_viewcontroller.appendNewResult(view);
    }

    // Update subscribe status
    subscribe_viewmodel.updateUI();
}



/**
 *      View
 *      Initialize & UI Interaction
 */
// init as soon as the script loads.
function init() {
    for (var key in values.hosts) {
        search_flag_dict[values.hosts[key].name] = false;
    }
    search_viewcontroller.bindSearch(search);
}

// init when document is ready
function lateInit() {
   
}

/**
 *      Main Scripts
 */
init();
$(document).ready(lateInit);

