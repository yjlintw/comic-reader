module.exports = {
    toUnicode : toUnicode,
    pad: pad,
    getSelected: getSelected
}

/**
 * Convert an input string to Unicode format
 * @param {String} str 
 * 
 * @return {String} string in unicode format
 */
function toUnicode(str, header="%u"){
    var result = "";
    for(var i = 0; i < str.length; i++){
        // Assumption: all characters are < 0xffff
        result += header + ("000" + str[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};


function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

function getSelected() {
    if (window.getSelection) {
        return window.getSelection().toString();
    }
    // } else if (document.getSelection) {
    //     return document.getSelection().toString();
    // } else {
    //     var selection = document.selection && document.selection.createRange();
    //     if (selection.text) {
    //         return selection.text.toString();
    //     }
    //     return "";
    // }
    return "";
}