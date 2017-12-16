// node libraries
const jsdom = require("jsdom");
const parse5 = require('parse5');
const { JSDOM } = jsdom;

/**
 * This function parses an individual mod element html and creates a mod JSON object.
 * @param {*} modHtml HTML Element that describes a single mod.
 */
exports.parseModForJSON = modHtml => {
    // mod to return
    var mod = {};
    // Create parse5 document for easier parsing.
    const document = parse5.parse(modHtml.outerHTML);
    // The actual element we need to interact with.
    var modElement = document.childNodes[0];

    // get the character name based on the image portrait hover (alt) text.
    mod.charname = findAltTextInHtml(modElement, 'char-portrait-img');

    // get the tokens for the mod name, i.e. "Mk V-A Critical Chance Receiver" => ["Mk", "V-A", "Critical", "Chance", "Receiver"]
    // Again from the hover text.
    var modNameTokens = findAltTextInHtml(modElement, 'statmod-img').split(' ');
    mod.slotname = modNameTokens[modNameTokens.length - 1]; // i.e. "Receiver"
    mod.dotcount = modNameTokens[1].split('-')[0]; // i.e. "V"
    mod.rarity = modNameTokens[1].split('-')[1]; // i.e. "A"

    // take all tokens between the rarity and the slot name and concatenate them to form the set bonus.
    mod.set = "";
    for (var i = 2; i < modNameTokens.length - 1; i++) {
        mod.set = mod.set + ' ' + modNameTokens[i];
        mod.set = mod.set.trim();
    }

    // The mod level.
    mod.level = findModLevelInHtml(modElement);
    // The mod primary stat.
    mod.primary = findModPrimaryStat(modElement);
    // The mod secondary stats.
    mod.secondaries = findModSecondaryStats(modElement);

    return mod;
};

/**
 * This function parses an image with class 'clazz' for for it's alt text.
 * This method is recursive.
 * @param {*} element   The HTML element to parse.
 * @param {*} clazz     The img class to look for.
 */
function findAltTextInHtml(element, clazz) {
    // is the current element an img?
    if (element.tagName === 'img') {
        // if the first attribute value matches the specified clazz then return the value of the third attribute.
        var attrs = element.attrs;
        if (attrs[0].value == clazz) {
            return attrs[2].value;
        }
    }
    // for each child node below this element recursively call this function on it.
    // if any of those calls returns a string, then return that immediately, otherwise continue.
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var str = findAltTextInHtml(element.childNodes[i], clazz);
            if (str) {
                return str;
            }
        }
    }
    // return null and hope another element contains the img.
    return null;
};

/**
 * This function parses an element and looks through all it's children to see if it can find the mod level.
 * This method is recursive.
 * @param {*} element   The HTML element to parse.
 */
function findModLevelInHtml(element) {
    // The mod level is within a span element, so let's look for a span!
    if (element.tagName === 'span') {
        // if the class attribute equals "statmod-level" then the value of the child will be the level text.
        var attrs = element.attrs;
        if (attrs[0].value == 'statmod-level') {
            return element.childNodes[0].value;
        }
    }
    // for each child node below this element recursively call this function on it.
    // if any of those calls returns a string, then return that immediately, otherwise continue.
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var str = findModLevelInHtml(element.childNodes[i]);
            if (str) {
                return str;
            }
        }
    }
    // return null and hope another element contains the img.
    return null;
};

/**
 * This function returns a JSON object representing the primary stat of the mod given the top level mod html element.
 * @param {*} element 
 */
function findModPrimaryStat(element) {
    // start by getting the primary stat html element.
    var primaryStatElement = findPrimaryStatElementInHtml(element);
    var primary = {};
    // parse that segment and retrieve the type and value by looking for the content of the spans with specific classes.
    primary.type = findTextContentOfSpanAndClassInHtml(primaryStatElement, 'statmod-stat-label');
    primary.value = findTextContentOfSpanAndClassInHtml(primaryStatElement, 'statmod-stat-value');

    return primary;
};

/**
 * This function retrieves the primary stat sub-element from the mod element.
 * @param {*} element 
 */
function findPrimaryStatElementInHtml(element) {
    // we're looking for a div
    if (element.tagName === 'div') {
        // with class "statmod-stats statmod-stats-1"
        var attrs = element.attrs;
        if (attrs[0].value == 'statmod-stats statmod-stats-1') {
            return element;
        }
    }
    // call recursively, again returning if a non-null value is returned.
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var el = findPrimaryStatElementInHtml(element.childNodes[i]);
            if (el) {
                return el;
            }
        }
    }
    // Not this sub-element, maybe another?
    return null;
};

/**
 * This method is similar to "findModPrimaryStat()" but it looks for each of the (up to) four secondary stats
 * @param {*} element 
 */
function findModSecondaryStats(element) {
    var secondaryStatElements = [];
    var secondaryStatELement = findSecondaryStatElementInHtml(element)

    findSecondaryStatElementsInHtml(secondaryStatELement, secondaryStatElements);

    var secondaryStats = [];

    for (var i = 0; i < secondaryStatElements.length; i++) {
        secondaryStats[i] = {};
        secondaryStats[i].type = findTextContentOfSpanAndClassInHtml(secondaryStatElements[i], 'statmod-stat-label');
        secondaryStats[i].value = findTextContentOfSpanAndClassInHtml(secondaryStatElements[i], 'statmod-stat-value');
        if (secondaryStats[i].value.includes('%')) {
            var type = secondaryStats[i].type;
            if (type === 'Health'
                || type === 'Protection'
                || type === 'Offence'
                || type === 'Defence') {
                secondaryStats[i].type = secondaryStats[i].type + "%";
            }
        }
    }
    return secondaryStats;
};

function findSecondaryStatElementInHtml(element) {
    if (element.tagName === 'div') {
        var attrs = element.attrs;
        if (attrs[0].value == 'statmod-stats statmod-stats-2') {
            return element;
        }
    }
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var el = findSecondaryStatElementInHtml(element.childNodes[i]);
            if (el) {
                return el;
            }
        }
    }
    return null;
};

function findSecondaryStatElementsInHtml(element, secondaryStatElements) {
    if (element.tagName === 'div') {
        var attrs = element.attrs;
        if (attrs[0].value == 'statmod-stat') {
            secondaryStatElements[secondaryStatElements.length] = element;
        }
    }
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            findSecondaryStatElementsInHtml(element.childNodes[i], secondaryStatElements);
        }
    }
};

function findTextContentOfSpanAndClassInHtml(element, clazz) {
    if (element.tagName === 'span') {
        var attrs = element.attrs;
        if (attrs[0].value == clazz) {
            return element.childNodes[0].value;
        }
    }
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var str = findTextContentOfSpanAndClassInHtml(element.childNodes[i], clazz);
            if (str) {
                return str;
            }
        }
    }
    return null;
}