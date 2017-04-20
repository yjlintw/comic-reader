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
var subscriber = require("./subscribe-viewmodel");
var comicparser = require("./comicparse-viewmodel");

//view controller
var searchViewController = require("../viewcontrollers/search-viewcontroller");

/**
 *      Variable Definition
 */
// {tring} store the html template for search result
var resultViewStr = "";         

// {Object} key: hostname value: boolean flag
// Store information of the search request to every host
// true: is searching
// false: not searching
var searchFlagDict = {};        

/**
 *      Backend Functionality / View
 */

/**
 * Check whether is still searching
 * 
 * @return: {bool} true: is searching, false: not searching
 */
function isSearching() {
    for(key in searchFlagDict) {
        if (searchFlagDict[key]) {
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
    var searchStr = searchViewController.getSearchQuery(); 

    // clear the previous search results
    searchViewController.clearSearchResults();

    // Show loading animiation
    searchViewController.loadingUI(true);

    // Send requests using parsers
    for (var key in values.hosts) {
        values.hosts[key].parsers.search(searchStr, searchResponse)
        searchFlagDict[values.hosts[key].name] = true;
    }
}

/**
 * Callback: search response returns
 * It take response, create search result and display on search-view
 * @param {Object} result 
 *        {String} link: link to the comic page
 *        {String} titleKey: a unique key for a comic in a host, two comics
 *                           from different hosts can have the same key
 * @param {String} host: name of the host that returns the response
 */
function searchResponse(result, host) {
    // Remove loading animation
    searchViewController.loadingUI(false);
    
    // set search flag false
    searchFlagDict[host] = false;

    // construct UI element
    for (var idx in result) {
        var obj = result[idx];
        var view = searchViewController.createResultView(obj.link, obj.titleKey, obj.imguri, obj.comicTitle, obj.host, obj.updateinfo, obj.description);
        searchViewController.appendNewResult(view);
    }

    // Update subscribe status
    subscriber.updateUI();
}



/**
 *      View
 *      Initialize & UI Interaction
 */
// init as soon as the script loads.
function init() {
    for (var key in values.hosts) {
        searchFlagDict[values.hosts[key].name] = false;
    }
    searchViewController.bindSearch(search);
}

// init when document is ready
function lateInit() {
   
}

/**
 *      Main Scripts
 */
init();
$(document).ready(lateInit);

