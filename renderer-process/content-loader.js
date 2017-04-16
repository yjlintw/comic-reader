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

$.get('./sections/favorite-entry.html', function(result) {
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);
    $("#favorite-view .columns").append(result);

})

// tmp.load('./sections/search-view.html');
// $("#main-view").append(tmp.find("loader").html());
// tmp.load('./sections/read-view.html');
// $("#main-view").append(tmp.find("loader").html());