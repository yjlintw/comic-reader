/**
 *      Values.js
 *      
 *      Contains global constants
 *      Mapping from host to its parser
 */


var sfacg = require("../parsers/sfacg");
var _8comic = require("../parsers/8comic");
var dm5 = require("../parsers/dm5");
var manhuagui = require("../parsers/manhuagui")
var readcomicbooksonline = require("../parsers/readcomicbooksonline");

module.exports = {
    // from host path
    hosts: {
        "s.sfacg.com": {
            name: "sfacg",
            parsers: sfacg
        },
        // "8comic.se": {
        //     name: "8comic",
        //     parsers: _8comic
        // },
        // "www.dm5.com": {
        //     name: "dm5",
        //     parsers: dm5
        // },
        "www.manhuagui.com": {
            name: "manhuagui",
            parsers: manhuagui
        }
        // "readcomicbooksonline.net": {
        //     name: "read-comicbooks-online",
        //     parsers: readcomicbooksonline
        // }
    },
    // from host name
    hostnames: {
        "sfacg": {
            parsers: sfacg
        },
        // "8comic": {
        //     parsers: _8comic
        // },
        // "dm5": {
        //     parsers: dm5
        // },
        "manhuagui": {
            parsers: manhuagui
        }
        // "read-comicbooks-online": {
        //     parsers: readcomicbooksonline
        // }
    }
}