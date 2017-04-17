module.exports = {
    toUnicode : toUnicode
}


function toUnicode(str){
    var result = "";
    for(var i = 0; i < str.length; i++){
        // Assumption: all characters are < 0xffff
        result += "%u" + ("000" + str[i].charCodeAt(0).toString(16)).substr(-4);
    }
    return result;
};