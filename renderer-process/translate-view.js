var fs = require("fs");

function read(f) {
  return fs.readFileSync(f).toString();
}
function include(f) {
  eval.apply(global, [read(f)]);
}

var t = require('../assets/js/tongwen/tongwen_core');
const table1 = require('../assets/js/tongwen/tongwen_table_ps2t.js');
const table2 = require('../assets/js/tongwen/tongwen_table_pt2s.js');
const table3 = require('../assets/js/tongwen/tongwen_table_s2t.js');
const table4 = require('../assets/js/tongwen/tongwen_table_t2s.js');
var TongWen = t.TongWen();
TongWen.addS2TTable(table1.S2TTable);
TongWen.addT2STable(table2.T2STable);
TongWen.addS2TTable(table3.S2TTable);
TongWen.addT2STable(table4.T2STable);


module.exports = {
    translate: translate
}

var toTChinese = true;

function translate() {
    if (toTChinese) {
        TongWen.trans2Trad(document);
    } else {
        TongWen.trans2Simp(document);
    }
}

$(document).ready(function () {
    //chinese convert
    var zhconvert = document.getElementById("zh-convert");
    zhconvert.onclick = function () {
        if (zhconvert.dataset.zh == "tw") {
            toTChinese = false;
            setTimeout(function () { zhconvert.textContent = "簡"; }, 250);
            zhconvert.dataset.zh = "cn";

        } else {
            toTChinese = true;
            setTimeout(function () { zhconvert.textContent = "繁"; }, 250);
            zhconvert.dataset.zh = "tw";
        }
        translate();
    }
});