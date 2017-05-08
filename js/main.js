
$(document).ready(function() {
  $(window).scroll(function() {
    if ($(window).scrollTop() > 100) {
          $('.home-menu').addClass('active');
    }
    else {
        $('.home-menu').removeClass('active');
    }
  });


  $( "#btn01" ).click(function() {
    $('html, body').animate({scrollTop: $('#feature').offset().top - 50}, 'slow');
  });
  $( "#btn02" ).click(function() {
    $('html, body').animate({scrollTop: $('#getstarted').offset().top - 50}, 'slow');
  });
  $( "#btn04" ).click(function() {
    $('html, body').animate({scrollTop: $('#download').offset().top - 50}, 'slow');
  });



});
