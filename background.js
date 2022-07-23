'use strict';

console.log('working');
const URLSnippet = 'youtube.com';
const queryOptions = {
  active: true,
  lastFocusedWindow: true,
};

async function checkCurrentTab() {
  const [tab] = await chrome.tabs.query(queryOptions);

  if (!tab.url.includes(URLSnippet)) return;

  // start or stop countdown
  // OR send message to UI
}
checkCurrentTab();
