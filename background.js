'use strict';

console.log('working');
const URLSnippet = 'youtube.com';
const queryOptions = {
  url: ['https://*.youtube.com/*'],
};

let startTime = '';
let endTime = '';
let elapsedTime = 0;

const now = new Date();
const today = new Date(
  `${now.getFullYear()} ${now.getMonth() + 1} ${now.getDate()}`
).getTime();

function viewStorage() {
  chrome.storage.sync.get(`${today}`, function (obj) {
    console.log(obj);
  });
}

async function isTimerRunning() {
  const { isRunning } = await chrome.storage.sync.get('isRunning');
  return isRunning ? true : false;
}

async function init() {
  //Check if timer is running
  if (await isTimerRunning()) return;

  //Initialising history
  let { history } = await chrome.storage.sync.get('history');

  if (!history) {
    await chrome.storage.sync.set({ history: [] });
    ({ history } = await chrome.storage.sync.get('history'));
    console.log('History array initialised');
  }

  if (!history.some((entry) => entry.date === today)) {
    history.push({
      date: today,
      time: 0,
    });
    await chrome.storage.sync.set({ history: history });
    console.log(`${today} entry made`);
  }
}

async function updateStorage(time) {
  const { history } = await chrome.storage.sync.get('history');

  const dataObj = history.find((entry) => entry.date === today);

  console.log(`Old time: ${dataObj.time}`);
  dataObj.time += time;
  console.log(`Updated time: ${dataObj.time}`);

  await chrome.storage.sync.set({ history: history });
  console.log('Time Updated');
}

//Timer start and stop
async function startTimer() {
  if (await isTimerRunning()) return;
  await chrome.storage.sync.set({ isRunning: true });

  await chrome.storage.sync.set({ startTime: new Date().toString() });
  console.log('Timer Start');
}

async function stopTimer() {
  if (!(await isTimerRunning())) return;
  await chrome.storage.sync.set({ isRunning: false });

  const { startTime } = await chrome.storage.sync.get('startTime');
  const endTime = new Date();
  elapsedTime = (endTime - new Date(startTime)) / 1000;

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
init();
