'use strict';

console.log('working');
const URLSnippet = 'youtube.com';
const queryOptions = {
  url: ['https://*.youtube.com/*'],
};

// Check for open YouTube tabs
function checkCurrentTab() {
  chrome.tabs.query(queryOptions, function (obj) {
    if (obj.length === 0) return;

    console.log(obj);
  });
}

// Filter on the changeInfo object
function changeInfoFilter(changeInfo) {
  if (changeInfo.status === 'complete' || changeInfo.hasOwnProperty('audible'))
    return true;

  return false;
}

//Listeners
chrome.tabs.onActivated.addListener(checkCurrentTab);
chrome.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfoFilter(changeInfo) && tab.url.includes(URLSnippet)) {
    checkCurrentTab();
  }
});
