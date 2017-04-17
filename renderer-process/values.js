var sfacg = require("./parsers/sfacg");

module.exports = {
    hosts: {
        "s.sfacg.com": {
            name: "sfacg",
            searchuri: "http://s.sfacg.com/?Key={search}&S=0&SS=0",
            parsers: sfacg
        }
    },
    chapterhosts: {
        "comic.sfacg.com": {
            name: "sfacg"
        }
    },
    hostnames: {
        "sfacg": {
            parsers: sfacg
        }
    }
}