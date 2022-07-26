'use strict';

const timeContainer = document.getElementById('time-container');
chrome.runtime.sendMessage({ request: 'timeStat' }, (res) => {
  setTime(res.timeStat);
});

const setTime = (sec) => {
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

  timeContainer.append(time);
};
