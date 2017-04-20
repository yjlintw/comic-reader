module.exports = {
    toUnicode : toUnicode,
    pad: pad
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