/**
 *      Values.js
 *      
 *      Contains global constants
 *      Mapping from host to its parser
 */


var sfacg = require("./parsers/sfacg");

module.exports = {
    // from host path
    hosts: {
        "s.sfacg.com": {
            name: "sfacg",
            parsers: sfacg
        }
    },
    // from host name
    hostnames: {
        "sfacg": {
            parsers: sfacg
        }
    }
}