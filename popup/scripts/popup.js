'use strict';

const stateEl = document.querySelector('.state-control');
const timeContainer = document.getElementById('time-container');
chrome.runtime.sendMessage({ request: 'timeStat' }, (res) => {
  setTime(res.timeStat);
});

chrome.runtime.sendMessage({ request: 'isOn' }, (res) => {
  console.log(`isOn on popup load: ${res.isOn}`);
  switchButtonState(res.isOn);
});

function setTime(sec) {
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds

  [hours, minutes, seconds] = [hours, minutes, seconds].map(
    (time) => (time < 10 ? '0' + time : '' + time) //Add 0 at the start if time is less than 10
  );

  let time = document.createElement('div');
  time.innerHTML =
    hours === '00'
      ? `<span class="time">${minutes}</span><span class="time-identifier">m</span> <span class="time">${seconds}</span><span class="time-identifier">s</span>` //Return MM:SS if HH is 00
      : `<span class="time">${hours}</span><span class="time-identifier">h</span> <span class="time">${minutes}</span><span class="time-identifier">m</span>`; // Return in HH:MM:SS

  timeContainer.innerHTML = '';
  timeContainer.append(time);
}

function switchButtonState(state) {
  if (state) {
    stateEl.classList.add('--state-on');
    stateEl.dataset.state = 'extensionOn';
  } else {
    stateEl.classList.remove('--state-on');
    stateEl.dataset.state = 'extensionOff';
  }
}

function stateClickHandler() {
  const currentState = stateEl.dataset.state;

  currentState === 'extensionOn'
    ? switchButtonState(false)
    : switchButtonState(true);
  chrome.runtime.sendMessage({ request: currentState }, (res) => {
    console.log('State: ', res.state);
  });
}

stateEl.addEventListener('click', stateClickHandler);
