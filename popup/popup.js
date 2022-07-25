'use strict';

const timeEl = document.getElementById('time');
chrome.runtime.sendMessage({ request: 'timeStat' }, (res) => {
  console.log(res.timeStat);
  timeEl.textContent = secondsToTime(res.timeStat);
});

const secondsToTime = (sec) => {
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = sec - hours * 3600 - minutes * 60; //  get seconds

  [hours, minutes, seconds] = [hours, minutes, seconds].map(
    (time) => (time < 10 ? '0' + time : '' + time) //Add 0 at the start if time is less than 10
  );

  return hours === '00'
    ? minutes + ':' + seconds //Return MM:SS if HH is 00
    : hours + ':' + minutes + ':' + seconds; // Return in HH:MM:SS
};
