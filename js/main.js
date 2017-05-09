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
  // LANG SWITCH
  $(function () {
    $("#mydropdown").change(function () {
      var langCode = this.value;
      $.getJSON('lang/'+langCode+'.json', translate);
    });
  });

  //LATEST RELEASE
  GetLatestReleaseInfo();
    });

    function GetLatestReleaseInfo() {
        $.getJSON("https://api.github.com/repos/yjlintw/comic-reader/releases/latest").done(function (release) {
            var asset = release.assets[0];
            var downloadCount = 0;
            for (var i = 0; i < release.assets.length; i++) {
                downloadCount += release.assets[i].download_count;
                if (release.assets[i].content_type === 'application/x-apple-diskimage') {
                    mac_downloadurl = release.assets[i].browser_download_url;
                    }
                else if (release.assets[i].content_type === 'application/x-msdownload') {
                    win_downloadurl = release.assets[i].browser_download_url;
                    }
            }
            var oneHour = 60 * 60 * 1000;
            var oneDay = 24 * oneHour;
            var dateDiff = new Date() - new Date(asset.updated_at);
            var timeAgo;
            if (dateDiff < oneDay)
            {
                timeAgo = (dateDiff / oneHour).toFixed(1) + " hours ago";
            }
            else
            {
                timeAgo = (dateDiff / oneDay).toFixed(1) + " days ago";
            }
            var releaseInfo = release.name + " was updated " + timeAgo;
            // var releaseInfo = release.name + " was updated " + timeAgo + " and downloaded " + downloadCount.toLocaleString() + " times.";
            $("#mac-download").attr("href", mac_downloadurl);
            $("#win-download").attr("href", win_downloadurl);
            $(".release-info").text(releaseInfo);
            $(".release-info").fadeIn("slow");
        });
}
