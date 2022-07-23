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

const now = new Date();
const today = new Date(
  `${now.getFullYear()} ${now.getMonth()} ${now.getDate()}`
).getTime();

function viewStorage() {
  chrome.storage.sync.get(`${today}`, function (obj) {
    console.log(obj);
  });
}

async function makeStorageEntry() {
  const obj = await chrome.storage.sync.get(`${today}`);
  if (Object.keys(obj).length === 0)
    chrome.storage.sync.set({ [today]: 0 }, function () {
      console.log(`${today} entry made in storage`);
    });
}

async function updateStorage(time) {
  const obj = await chrome.storage.sync.get(`${today}`);
  const currentElapsed = obj[today];
  const newElapsed = currentElapsed + time;
  await chrome.storage.sync.set({ [today]: newElapsed });
  viewStorage();
}

//Timer start and stop
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
  elapsedTime = (endTime - startTime) / 1000;
  updateStorage(elapsedTime);
  console.log('Timer Stop');
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

//INIT
makeStorageEntry();
