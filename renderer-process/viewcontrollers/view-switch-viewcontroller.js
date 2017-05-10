/**
 *      view-switcher.js
 *
 *      Control the behavior of view switching and sidebar
 *      See: ../sections/sidebar.html
 */

// var subscriber = require('../subscribe-viewmodel'); 
var read_viewcontroller = require('./read-viewcontroller');
var titlebar_viewcontroller = require('./titlebar-viewcontroller');
const EA = require("electron-analytics");
const ipc = require('electron').ipcRenderer;

// Variable definition
var updateAllUIFunc;
var TAB_NAME = {
        FAVORITE: 0,
        SEARCH: 1,
        READ: 2,
        ABOUT: 3,
    };

// Scroll behavior

// Hide Header on on scroll down
var did_scroll;
var last_scroll_top = 0;
var delta = 5;
var navbar_height = $('aside').outerHeight();
$(window).scroll(function(event){
    did_scroll = ($(".sidebar.float-menu").css("flex-direction") == "row")
});

$(window).resize(function(event){
    $('.float-menu').removeClass('nav-up').addClass('nav-down');
})

setInterval(function() {
    if (did_scroll) {
        hasScrolled();
        did_scroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if(Math.abs(last_scroll_top - st) <= delta)
        return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > last_scroll_top && st > navbar_height){
        // Scroll Down
        $('.float-menu').removeClass('nav-down').addClass('nav-up');
    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('.float-menu').removeClass('nav-up').addClass('nav-down');
        }
    }

    last_scroll_top = st;
}

/**
 * Switch active panel
 * @param {int} index
 */
function tabswitch(index) {
    switch (index) {
        case TAB_NAME.FAVORITE:
            $("#tab-favorite").trigger("click");
            break;
        case TAB_NAME.SEARCH:
            $("#tab-search").trigger("click");
            break;
        case TAB_NAME.READ:
            $("#tab-read").trigger("click");
            break;
        case TAB_NAME.ABOUT:
            $("#tab-about").trigger("click");
            break;
    }
}

function bindUpdateAllUI(func) {
    updateAllUIFunc = func;
}

/**
 * Callback function when sidebar tab is clicked
 */
function onTabEntryClick() {
    EA.send("MOUSE_CLICKED_VIEW_SWITCH");
    updateAllUIFunc();
    $(".content-view").addClass("is-hidden");
    $($(this).attr("associate-view")).removeClass("is-hidden");
    $(".sidebar .entry").removeClass("active");
    $(this).addClass("active");
    if ($(this).attr('id') == "tab-read") {
        read_viewcontroller.scrollToPage(-1);
    }

    titlebar_viewcontroller.updateTitle();
}


$(document).ready(function() {
    $(".sidebar .entry").click(onTabEntryClick);
});

ipc.on("open-about", function(event) {
    console.log("open-about received");
    tabswitch(TAB_NAME.ABOUT);
});


module.exports = {
    TAB_NAME: TAB_NAME,
    tabswitch: tabswitch,
    bindUpdateAllUI: bindUpdateAllUI,
    
    
}
