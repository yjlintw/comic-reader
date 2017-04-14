$(".tab").click(function(){
    $(".panel").addClass("is-hidden");
    var activePanelId = $(this).attr("panel");
    $("#" + activePanelId).removeClass("is-hidden");
    $(".tab").removeClass("active");
    $(this).addClass("active");
});