function onTabEntryClick() {
    $(".content-view").addClass("is-hidden");
    $($(this).attr("associate-view")).removeClass("is-hidden");
    $(".sidebar .entry").removeClass("active");
    $(this).addClass("active");
}


$(document).ready(function() {
    $(".sidebar .entry").click(onTabEntryClick);
});