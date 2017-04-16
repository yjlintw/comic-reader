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

// $.get('./sections/search-result-entry.html', function(result) {
//     var result_s = $(result);
//     result_s.find(".subscribe-btn").addClass("subscribed");
//     $("#search-results").append(result_s);

//     result_s = $(result);
//     result_s.find(".subscribe-btn").addClass("subscribed");
//     $("#search-results").append(result_s);
//     $("#search-results").append(result);
//     $("#search-results").append(result);
//     result_s = $(result);
//     result_s.find(".subscribe-btn").addClass("subscribed");
//     $("#search-results").append(result_s);
//     $("#search-results").append(result);
//     $("#search-results").append(result);
//     $("#search-results").append(result);
//     result_s = $(result);
//     result_s.find(".subscribe-btn").addClass("subscribed");
//     $("#search-results").append(result_s);
// })

// tmp.load('./sections/search-view.html');
// $("#main-view").append(tmp.find("loader").html());
// tmp.load('./sections/read-view.html');
// $("#main-view").append(tmp.find("loader").html());