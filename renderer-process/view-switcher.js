/**
 *      view-switcher.js
 *
 *      Control the behavior of view switching and sidebar
 *      See: ../sections/sidebar.html
 */

var searchview = require('./search-view');
var favoriteview = require('./favorite-view');
var readview = require('./read-view');

module.exports = {
    tabswitch: tabswitch
}

// Scroll behavior

// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('aside').outerHeight();
$(window).scroll(function(event){
    didScroll = ($(".sidebar.float-menu").css("flex-direction") == "row")
});

$(window).resize(function(event){
    $('.float-menu').removeClass('nav-up').addClass('nav-down');
})

setInterval(function() {
    if (didScroll) {
        hasScrolled();
        didScroll = false;
    }
}, 250);

function hasScrolled() {
    var st = $(this).scrollTop();

    // Make sure they scroll more than delta
    if(Math.abs(lastScrollTop - st) <= delta)
        return;

    // If they scrolled down and are past the navbar, add class .nav-up.
    // This is necessary so you never see what is "behind" the navbar.
    if (st > lastScrollTop && st > navbarHeight){
        // Scroll Down
        $('.float-menu').removeClass('nav-down').addClass('nav-up');
    } else {
        // Scroll Up
        if(st + $(window).height() < $(document).height()) {
            $('.float-menu').removeClass('nav-up').addClass('nav-down');
        }
    }

    lastScrollTop = st;
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

/**
 * Callback function when sidebar tab is clicked
 */
function onTabEntryClick() {
    $(".content-view").addClass("is-hidden");
    $($(this).attr("associate-view")).removeClass("is-hidden");
    $(".sidebar .entry").removeClass("active");
    $(this).addClass("active");

    searchview.updateSubscribeUI();
    favoriteview.updateSubscribeUI();
    readview.updateSubscribeUI();
}


$(document).ready(function() {
    $(".sidebar .entry").click(onTabEntryClick);
    //chinese convert
    var zhconvert = document.getElementById("zh-convert");
      zhconvert.onclick = function() {
        if (zhconvert.dataset.zh == "tw") {
            TongWen.trans2Simp(document);
            setTimeout(function() {zhconvert.textContent = "簡";}, 500);
            zhconvert.dataset.zh = "cn";

          } else {
            TongWen.trans2Trad(document);
            setTimeout(function() {zhconvert.textContent = "繁";}, 500);
            zhconvert.dataset.zh = "tw";
          }
        }
});
