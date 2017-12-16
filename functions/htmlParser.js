// node libraries
const http = require('http')
const url = require('url');

const jsdom = require("jsdom");
const parse5 = require('parse5');
const { JSDOM } = jsdom;

/**
 * Function to get application "default" JSDom options.
 * @param {*String} url referrer url.
 */
exports.getJSDomOptions = (url) => {
    return {
        referrer: url,
        includeNodeLocations: true
    };
};

/**
 * Gets the page count for a given mod page.
 * @param {*} dom 
 */
exports.getPageCount = (dom) => {
    const element = parse5.parse(dom.window.document.body.outerHTML);
    var subElement =  findTagWithClass(element, 'div', 'pull-right')
    var el = findTagWithClass(subElement, 'a', 'javascript:;')

    var pageInfo = el.childNodes[0].value;
    var tokens = pageInfo.split(' ');
    var maxPageCount = tokens[tokens.length - 1];
    return maxPageCount;
};

/**
 * Takes a dom and returns an array containing html elements that each describe a single mod.
 * @param {*} dom 
 */
exports.getMods = (dom) => {
    var nodeList = dom.window.document.querySelectorAll(".collection-mod");

    return nodeList;
};

/**
 * Finds a sub-element with a specified element, which has the specified tag and class name.
 * Finds the first element only.
 * @param {*} element 
 * @param {*} tag 
 * @param {*} clazz 
 */
function findTagWithClass (element, tag, clazz) {
    if (element.tagName === tag) {
        var attrs = element.attrs;
        if (attrs[0].value === clazz) {
            return element;
        }
    }
    if (element.hasOwnProperty('childNodes')) {
        for (var i = 0; i < element.childNodes.length; i++) {
            var str = findTagWithClass(element.childNodes[i], tag, clazz);
            if (str) {
                return str;
            }
        }
    }
    return null;
};