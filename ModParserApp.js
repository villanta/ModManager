// node libraries
var http = require('http')
var url = require('url');
var fs = require('fs');
var uc = require('upper-case');

var htmlParser = require('./functions/htmlParser');
var modParser = require('./functions/modParser');
var modDataManager = require('./functions/modDataManager');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
const parse5 = require('parse5');

var jsonfile = require('jsonfile')

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    if (req.url == '/favicon.ico') {
        res.write("404 - Fuck Off");
        res.end();
    } else {
        var modJson = [];
        var query = url.parse(req.url, true);
        var urlTokens = getUrlTokens(query.pathname);

        if (urlTokens[0] === 'u' && urlTokens.length >= 2) {
            username = urlTokens[urlTokens.length - 1];
            modJson = modDataManager.getModData(username);
            console.log(query.query);
            respond(query.query, modJson, res);
        }
    }
}).listen(8080);

function respond(queryData, modJson, res) {
    var output = "";
    var jsonString = JSON.stringify(modJson);
    var selectPage = './html/select.html';
    var html = fs.readFileSync(selectPage).toString();

    html = html.replace('MOD_JSON_SEGMENT', jsonString);

    /*
    var modCount = 0;
    for (var i = 0; i < modJson.length; i++) {
        if (matchesQuery(queryData, modJson[i])) {
            output += "Mod owner: " + modJson[i].charname + "<br>\n";
            output += "Number of dots: " + modJson[i].dotcount + "<br>\n";
            output += "Rarity: " + modJson[i].rarity + "<br>\n";
            output += "Slot: " + modJson[i].slotname + "<br>\n";
            output += "Set bonus: " + modJson[i].set + "<br>\n";
            output += "Level: " + modJson[i].level + "<br>\n";
            output += "\tPrimary: " + modJson[i].primary.type + ": " + modJson[i].primary.value + "<br>\n";

            for (var j = 0; j < modJson[i].secondaries.length; j++) {
                output += "\t\tSecondary: " + modJson[i].secondaries[j].type + ": " + modJson[i].secondaries[j].value + "<br>\n";
            }
            output += "<br>\n";
            modCount++;
        }
    }
    */

    //console.log(output);
    res.write(html);
    res.end();
}

function getUrlTokens(url) {
    if (url.startsWith('/')) {
        url = url.substr(1);
    } else {
        url = url;
    }
    var urlTokens = url.split('/');
    return urlTokens;
}

function matchesQuery(qd, modJson) {
    var matches = true;

    if (qd.charname && !uc(modJson.charname).includes(uc(qd.charname))) {
        return false;
    }
    if (qd.dotcount && qd.dotcount != modJson.dotcount) {
        return false;
    }
    if (qd.rarity && qd.rarity != modJson.rarity) {
        return false;
    }
    if (qd.slotname && qd.slotname != modJson.slotname) {
        return false;
    }
    if (qd.set && qd.set != modJson.set) {
        return false;
    }
    if (qd.level && qd.level != modJson.level) {
        return false;
    }
    if (qd.primarytype && qd.primarytype != modJson.primary.type) {
        return false;
    }

    if (qd.secondarytype1) {
        var secondaryStatTypeMatches = doesSecondaryTypeMatch(qd.secondarytype1, modJson.secondaries);
        if (!secondaryStatTypeMatches) {
            return false;
        }
    }
    if (qd.secondarytype2) {
        var secondaryStatTypeMatches = doesSecondaryTypeMatch(qd.secondarytype2, modJson.secondaries);
        if (!secondaryStatTypeMatches) {
            return false;
        }
    }
    if (qd.secondarytype3) {
        var secondaryStatTypeMatches = doesSecondaryTypeMatch(qd.secondarytype3, modJson.secondaries);
        if (!secondaryStatTypeMatches) {
            return false;
        }
    }
    if (qd.secondarytype4) {
        var secondaryStatTypeMatches = doesSecondaryTypeMatch(qd.secondarytype4, modJson.secondaries);
        if (!secondaryStatTypeMatches) {
            return false;
        }
    }

    return matches;
}

function doesSecondaryTypeMatch(secondarytype, secondaries) {
    var secondaryStatTypeMatches = false;
    for (var i = 0; i < secondaries.length; i++) {
        if (secondarytype === secondaries[i].type) {
            secondaryStatTypeMatches = true;
        }
    }
    return secondaryStatTypeMatches;
}