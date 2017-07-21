// 3rd party library
let settings = require('electron-settings');

const ipc = require('electron').ipcRenderer;
let pjson = require('../../package.json');
const {shell} = require('electron');

function lateInit() {
    $("#update-btn").click(function(e) {
            // console.log("check update click");
            ipc.send('check-for-update');
        }
    );

    $("#beta-checkbox").click(function(e) {
        console.log(this.checked)
        settings.set("system.update.allowbeta", this.checked);
        ipc.send("update-beta", this.checked)
    })

    $(document.getElementById("about-view")).find('.other-info .github-link').click(function(e) {
        e.stopPropagation();
        shell.openExternal('https://github.com/yjlintw/comic-reader');
    });

    $(document.getElementById("about-view")).find('.app-info .website-link').click(function(e) {
        e.stopPropagation();
        shell.openExternal('https://yjlintw.github.io/comic-reader');
    });
    let about_view = $("#about-view");
    about_view.find(".app-name").text(pjson.productName)
    about_view.find(".description").text(pjson.description);
    about_view.find(".version").text(pjson.version);

    $("#beta-checkbox").prop("checked", settings.get("system.update.allowbeta"));
}

$(document).ready(lateInit);