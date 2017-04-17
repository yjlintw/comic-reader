var subscriber = require("./subscriber");

// Scroll behavior

// Hide Header on on scroll down
var didScroll;
var lastScrollTop = 0;
var delta = 5;
var navbarHeight = $('aside').outerHeight();

$(window).scroll(function(event){
    didScroll = true;
});

setInterval(function() {
    if (didScroll && $(".float-menu").css("position") == "fixed") {
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



function onTabEntryClick() {
    $(".content-view").addClass("is-hidden");
    $($(this).attr("associate-view")).removeClass("is-hidden");
    $(".sidebar .entry").removeClass("active");
    $(this).addClass("active");
    subscriber.updateUI();
}


$(document).ready(function() {
    $(".sidebar .entry").click(onTabEntryClick);
});