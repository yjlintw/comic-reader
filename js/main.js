$(document).ready(function() {
  // MENU BG COLOR
  $(window).scroll(function() {
    if ($(window).scrollTop() > 100) {
      $('.home-menu').addClass('active');
    } else {
      $('.home-menu').removeClass('active');
    }
  });

  // MENU FUNCTION
  $("#btn01").click(function() {
    $('html, body').animate({
      scrollTop: $('#feature').offset().top - 63
    }, 'slow');
  });
  $("#btn02").click(function() {
    $('html, body').animate({
      scrollTop: $('#getstarted').offset().top - 63
    }, 'slow');
  });
  $("#btn04").click(function() {
    $('html, body').animate({
      scrollTop: $('#download').offset().top - 63
    }, 'slow');
  });

});
