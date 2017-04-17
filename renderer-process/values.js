var sfacg = require("./parsers/sfacg");

module.exports = {
    hosts: {
        "s.sfacg.com": {
            name: "sfacg",
            parsers: sfacg
        }
    },
    hostnames: {
        "sfacg": {
            parsers: sfacg
        }
    }
}