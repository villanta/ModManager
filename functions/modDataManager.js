var fs = require('fs');
var request = require('sync-request');

var htmlParser = require('./htmlParser');
var modParser = require('./modParser');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const parse5 = require('parse5');

var jsonfile = require('jsonfile')

exports.getModData = (username) => {
    modJson = {};

    modJson = readFromFile(username);
    if (modJson.length == 0) {
        getPagesFrom(username, modJson);
        writeToFile(modJson, username);
    }

    return modJson;
}
function readFromFile(username) {
    var file = 'C:\\temp\\' + username + '.json';

    if (!fs.existsSync(file)) {
        console.log('no cached data, parse new data.');
        return [];
    }

    var stats = fs.statSync(file);

    var mtime = new Date(stats.mtime);

    // Do your operations
    var now = new Date();
    var seconds = (now.getTime() - mtime.getTime()) / 1000;

    if (seconds > 600) {
        console.log('Older cache data, please update.');
        return [];
    } else {
        return jsonfile.readFileSync(file);
    }
}

function writeToFile(json, username) {
    var file = 'C:\\temp\\' + username + '.json';
    jsonfile.writeFileSync(file, json);
}


function getPagesFrom(username, modJson) {
    pageNumber = 1;
    pageCount = 1;

    while (pageNumber <= pageCount) {
        console.log("Requesting page: " + pageNumber);
        var url = "https://swgoh.gg/u/" + username + "/mods/?page=" + pageNumber;
        console.log("URL: " + url);
        var options = htmlParser.getJSDomOptions(url);

        var body = request('GET', url).getBody();        

        const dom = new JSDOM(body);

        var mods = htmlParser.getMods(dom);

        var index = 0;
        for (var i = 0; i < mods.length; i++) {
            modJson[modJson.length] = modParser.parseModForJSON(mods[i]);
        }

        pageNumber++;
        var pageCount = htmlParser.getPageCount(dom);
    }
}