/**
 *      Values.js
 *      
 *      Contains global constants
 *      Mapping from host to its parser
 */


var sfacg = require("./parsers/sfacg");
var _8comic = require("./parsers/8comic");

module.exports = {
    // from host path
    hosts: {
        "s.sfacg.com": {
            name: "sfacg",
            parsers: sfacg
        },
        "8comic.se": {
            name: "8comic",
            parsers: _8comic
        }
    },
    // from host name
    hostnames: {
        "sfacg": {
            parsers: sfacg
        },
        "8comic": {
            parsers: _8comic
        }
    }
}