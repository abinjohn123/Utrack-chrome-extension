'use strict';

console.log('working');
const URLSnippet = 'youtube.com';
const queryOptions = {
  url: ['https://*.youtube.com/*'],
};

let isTimerActive = false;
let startTime = '';
let endTime = '';
let elapsedTime = 0;
let logTimer = '';

function startTimer() {
  if (isTimerActive) return;

  isTimerActive = true;
  startTime = new Date();
  console.log('Timer Start');
}

function stopTimer() {
  if (!isTimerActive) return;

  isTimerActive = false;
  endTime = new Date();
  elapsedTime += (endTime - startTime) / 1000;

  console.log('Timer Stop');
  console.log(elapsedTime);
}

// Check for open YouTube tabs
function checkYouTubeTabs() {
  chrome.tabs.query(queryOptions, function (tabs) {
    if (tabs.length === 0) {
      stopTimer();
      return;
    }

    if (tabs.some((tab) => tab.active || (!tab.active && tab.audible))) {
      startTimer();
    } else stopTimer();
  });
}

// Filter on the changeInfo object
function changeInfoFilter(changeInfo) {
  if (changeInfo.status === 'complete' || changeInfo.hasOwnProperty('audible'))
    return true;

  return false;
}

//Listeners
chrome.tabs.onActivated.addListener(checkYouTubeTabs);
chrome.tabs.onRemoved.addListener(checkYouTubeTabs);
chrome.tabs.onUpdated.addListener(function (_, changeInfo, tab) {
  if (changeInfoFilter(changeInfo) && tab.url.includes(URLSnippet)) {
    checkYouTubeTabs();
  }
});
