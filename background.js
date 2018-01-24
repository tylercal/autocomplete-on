/* global console, chrome */

function genericOnClick(info, tab) {
    console.log("item " + info.menuItemId + " was clicked");
    console.log("info: " + JSON.stringify(info));
    console.log("tab: " + JSON.stringify(tab));
}

chrome.contextMenus.create({"title": "Don't force auto-complete", "contexts":["editable"], "onclick": genericOnClick});