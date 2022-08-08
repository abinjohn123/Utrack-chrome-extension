'use strict';

console.log('working');
const URLSnippet = 'youtube.com';
const queryOptions = {
  url: ['https://*.youtube.com/*'],
};

const now = new Date();
const today = new Date(
  `${now.getFullYear()} ${now.getMonth() + 1} ${now.getDate()}`
).getTime();

async function isTimerRunning() {
  const { isRunning } = await chrome.storage.sync.get('isRunning');
  return isRunning ? true : false;
}

async function isExtensionOn() {
  const { isOn } = await chrome.storage.sync.get('isOn');
  return isOn;
}

async function switchExtensionState(state) {
  await chrome.storage.sync.set({ isOn: state });

  if (state) checkYouTubeTabs();
  else stopTimer();
}

async function init() {
  //return if timer is running
  if (await isTimerRunning()) return;

  //Check history array
  let { history } = await chrome.storage.sync.get('history');
  let isOn = await isExtensionOn();

  if (!history) {
    await chrome.storage.sync.set({ history: [] });
    ({ history } = await chrome.storage.sync.get('history'));
  }

  if (!isOn) await switchExtensionState(true);

  if (!history.some((entry) => entry.date === today)) {
    history.push({
      date: today,
      time: 0,
    });

    //Remove history older than 8 days
    history = history.slice(-8);
    await chrome.storage.sync.set({ history: history });
  }
}

async function updateStorage() {
  const { history } = await chrome.storage.sync.get('history');
  const dataObj = history.find((entry) => entry.date === today);

  if (await isTimerRunning()) {
    const { startTime } = await chrome.storage.sync.get('startTime');
    const currentTime = new Date();
    const elapsedTime = (currentTime - new Date(startTime)) / 1000;

    dataObj.time += elapsedTime;

    await chrome.storage.sync.set({ startTime: currentTime.getTime() });
    await chrome.storage.sync.set({ history: history });
  }

  return Math.floor(dataObj.time);
}

//Timer start and stop
async function startTimer() {
  if (await isTimerRunning()) return;
  await chrome.storage.sync.set({ isRunning: true });
  await chrome.storage.sync.set({ startTime: new Date().getTime() });
}

async function stopTimer() {
  if (!(await isTimerRunning())) return;
  const _time = await updateStorage();
  await chrome.storage.sync.set({ isRunning: false });
}

// Check for open YouTube tabs
async function checkYouTubeTabs() {
  if (!(await isExtensionOn())) {
    const _time = await updateStorage();
    return;
  }

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
chrome.runtime.onMessage.addListener(function (message, _sender, sendResponse) {
  messageHandler(message, _sender, sendResponse);
  return true;
});

async function messageHandler(message, _sender, sendResponse) {
  const { request } = message;
  switch (request) {
    case 'timeStat':
      const time = await updateStorage();
      sendResponse({ timeStat: time });
      break;
    case 'history':
      const { history } = await chrome.storage.sync.get('history');
      sendResponse({ history: history });
      break;
    case 'isOn':
      const { isOn } = await chrome.storage.sync.get('isOn');
      sendResponse({ isOn: isOn });
      break;
    case 'extensionOff':
      await switchExtensionState(true);
      sendResponse({ state: true });
      break;
    case 'extensionOn':
      await switchExtensionState(false);
      sendResponse({ state: false });
      break;
  }
}

//INIT
init();
