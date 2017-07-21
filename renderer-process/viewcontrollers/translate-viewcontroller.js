let fs = require("fs");

function read(f) {
  return fs.readFileSync(f).toString();
}
function include(f) {
  eval.apply(global, [read(f)]);
}

let t = require('../tongwen/tongwen_core');
const table1 = require('../tongwen/tongwen_table_ps2t.js');
const table2 = require('../tongwen/tongwen_table_pt2s.js');
const table3 = require('../tongwen/tongwen_table_s2t.js');
const table4 = require('../tongwen/tongwen_table_t2s.js');
let TongWen = t.TongWen();
TongWen.addS2TTable(table1.S2TTable);
TongWen.addT2STable(table2.T2STable);
TongWen.addS2TTable(table3.S2TTable);
TongWen.addT2STable(table4.T2STable);


module.exports = {
    translate: translate
}

let to_traditional_chinese = true;

function translate() {
    if (to_traditional_chinese) {
        TongWen.trans2Trad(document);
    } else {
        TongWen.trans2Simp(document);
    }
}

$(document).ready(function () {
    //chinese convert
    let zhconvert = document.getElementById("zh-convert");
    zhconvert.onclick = function () {
        if (zhconvert.dataset.zh == "tw") {
            to_traditional_chinese = false;
            setTimeout(function () { $('.convert span').toggleClass('icon-zhtw icon-zhcn'); }, 250);
            zhconvert.dataset.zh = "cn";

        } else {
            to_traditional_chinese = true;
            setTimeout(function () { $('.convert span').toggleClass('icon-zhcn icon-zhtw'); }, 250);
            zhconvert.dataset.zh = "tw";
        }
        translate();
    }
});
