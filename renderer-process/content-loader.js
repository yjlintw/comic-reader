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