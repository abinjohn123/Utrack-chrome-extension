'use strict';

console.log('working');
const URLSnippet = 'youtube.com';
const queryOptions = {
  url: ['https://*.youtube.com/*'],
  status: 'complete',
};

function checkCurrentTab() {
  chrome.tabs.query(queryOptions, function (obj) {
    console.log(obj);
  });
}

//Listeners
chrome.tabs.onActivated.addListener(checkCurrentTab);
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  if (changeInfo.hasOwnProperty('url') || changeInfo.hasOwnProperty('audible'))
    checkCurrentTab();
});
