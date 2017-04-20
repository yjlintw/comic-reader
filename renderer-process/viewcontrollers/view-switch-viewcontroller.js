/**
 *      view-switcher.js
 *
 *      Control the behavior of view switching and sidebar
 *      See: ../sections/sidebar.html
 */

// var subscriber = require('../subscribe-viewmodel'); 

module.exports = {
    tabswitch: tabswitch,
    bindUpdateAllUI: bindUpdateAllUI
    
}
// Variable definition
var updateAllUIFunc;

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
        case 0:
            $("#tab-favorite").trigger("click");
            break;
        case 1:
            $("#tab-search").trigger("click");
            break;
        case 2:
            $("#tab-read").trigger("click");
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
    $(".content-view").addClass("is-hidden");
    $($(this).attr("associate-view")).removeClass("is-hidden");
    $(".sidebar .entry").removeClass("active");
    $(this).addClass("active");

    updateAllUIFunc();
}


$(document).ready(function() {
    $(".sidebar .entry").click(onTabEntryClick);
});
