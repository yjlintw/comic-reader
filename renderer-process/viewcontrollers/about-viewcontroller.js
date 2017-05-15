const ipc = require('electron').ipcRenderer;
let pjson = require('../../package.json');

function lateInit() {
    $("#update-btn").click(function(e) {
            // console.log("check update click");
            ipc.send('check-for-update');
        }
    );
    let about_view = $("#about-view");
    about_view.find(".app-name").text(pjson.productName)
    about_view.find(".description").text(pjson.description);
    about_view.find(".version").text(pjson.version);
}

$(document).ready(lateInit);