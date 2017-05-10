$('#sidebar').load('./sections/sidebar.html');
$.get('./sections/favorite-view.html', function(result) {
    $("#main-view").append(result);
})

$.get('./sections/search-view.html', function(result) {
    $("#main-view").append(result);
})

$.get('./sections/read-view.html', function(result) {
    $("#main-view").append(result);
})

$.get('./sections/about-view.html', function(result) {
    $("#main-view").append(result);
})

// $.get('./sections/page.html', function(result) {
//     for(var i = 0; i < 50; i++) {
//         var view = $(result);
//         view.find("img").attr("src", "./assets/img/test/80x100.png")
//         $("#read-area").append(view);
//     }

// })

// tmp.load('./sections/search-view.html');
// $("#main-view").append(tmp.find("loader").html());
// tmp.load('./sections/read-view.html');
// $("#main-view").append(tmp.find("loader").html());