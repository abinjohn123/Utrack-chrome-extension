'use strict';

const canvasContainer = document.querySelector('.graph');
const ctx = document.getElementById('statChart').getContext('2d');
const gradient = ctx.createLinearGradient(0, 0, 0, 300);
gradient.addColorStop(0, 'rgb(25, 118, 210)');
gradient.addColorStop(0.5, 'rgba(255, 255, 255,0)');

chrome.runtime.sendMessage({ request: 'history' }, (res) => {
  if (res.history.length <= 3) displayCanvasMessage(res.history.length);
  else plotGraph(res.history);
});

function displayCanvasMessage(days) {
  const daysLeft = 3 - days;
  const canvas = canvasContainer.querySelector('#statChart');
  canvas.remove();
  const messageEl = document.createElement('div');
  messageEl.classList.add('graph--message');
  messageEl.innerHTML = `<p>Stats will be available ${
    daysLeft === 0
      ? 'from tomorrow'
      : `after ${daysLeft} day${daysLeft > 1 ? 's' : ''}`
  }</p>`;
  canvasContainer.append(messageEl);
}

function getTooltipLabel({ time: sec }) {
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = Math.floor(sec - hours * 3600 - minutes * 60); //  get seconds

  [hours, minutes, seconds] = [hours, minutes, seconds].map(
    (time) => String(time).padStart(2, '0') //Add 0 at the start if time is less than 10
  );

  return hours === '00' ? `${minutes}m ${seconds}s` : `${hours}h ${minutes}m`;
}

function calculateStepSize(timeArray) {
  const max = Math.max(...timeArray);
  const min = Math.min(...timeArray);
  const difference = max - min;

  if (difference > 90) return 30;
  if (difference > 60) return 15;
  return Math.floor(difference / timeArray.length);
}

function plotGraph(history) {
  const last7Days = history.slice(-8, -1);
  const dateOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  };
  const dateLocale = navigator.language || 'en-US';
  const dates = last7Days.map((entry) => {
    return new Intl.DateTimeFormat(dateLocale, dateOptions).format(
      new Date(entry.date)
    );
  });
  const time = last7Days.map((entry) => {
    const sec = entry.time;
    const min = Math.floor(sec / 60);
    return min;
  });

  const myChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: dates,
      datasets: [
        {
          data: time,
          backgroundColor: gradient,
          borderColor: '#1976d2',
          borderWidth: 2.5,
          tension: 0.1,
          fill: true,
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value, index, ticks) {
              return value ? `${value}m` : value;
            },
            stepSize: calculateStepSize(time),
            maxTicksLimit: 5,
          },

          grid: {
            display: false,
          },
        },
        x: {
          display: false,
        },
      },
      plugins: {
        title: {
          display: true,
          text: `Last ${last7Days.length > 6 ? 7 : last7Days.length - 1} days`,
        },
        legend: {
          display: false,
        },
        tooltip: {
          displayColors: false,
          bodyAlign: 'center',
          callbacks: {
            label: function (context) {
              return getTooltipLabel(last7Days[context.dataIndex]);
            },
          },
        },
      },
    },
  });
}
