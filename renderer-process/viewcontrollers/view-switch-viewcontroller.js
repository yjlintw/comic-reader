/**
 *      view-switcher.js
 *
 *      Control the behavior of view switching and sidebar
 *      See: ../sections/sidebar.html
 */

// let subscriber = require('../subscribe-viewmodel'); 
let read_viewcontroller = require('./read-viewcontroller');
let titlebar_viewcontroller = require('./titlebar-viewcontroller');
const ipc = require('electron').ipcRenderer;

// Variable definition
let updateAllUIFunc;
let checkUpdateFunc;
let TAB_NAME = {
        FAVORITE: 0,
        SEARCH: 1,
        READ: 2,
        ABOUT: 3,
    };

// Scroll behavior

// Hide Header on on scroll down
let did_scroll;
let last_scroll_top = 0;
let delta = 5;
let navbar_height = $('aside').outerHeight();
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
    let st = $(this).scrollTop();

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

function bindCheckUpdate(func) {
    checkUpdateFunc = func;
}

/**
 *  Animation
 */

function loadingAnimate(flag) {
    if (flag) {
        $("#tab-refresh").addClass("loading");
    } else {
        $("#tab-refresh").removeClass("loading");
    }
}

/**
 * Callback function when sidebar tab is clicked
 */
function onTabEntryClick() {
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
    $("#tab-refresh").click(function(e){
        checkUpdateFunc();
    });
});

ipc.on("open-about", function(event) {
    console.log("open-about received");
    tabswitch(TAB_NAME.ABOUT);
});


module.exports = {
    TAB_NAME: TAB_NAME,
    tabswitch: tabswitch,
    bindUpdateAllUI: bindUpdateAllUI,
    bindCheckUpdate: bindCheckUpdate,
    loadingAnimate: loadingAnimate
}
