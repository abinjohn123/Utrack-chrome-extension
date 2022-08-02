'use strict';

const ctx = document.getElementById('statChart');

chrome.runtime.sendMessage({ request: 'history' }, (res) => {
  plotGraph(res.history);
});

function getTooltipLabel({ time: sec }) {
  let hours = Math.floor(sec / 3600); // get hours
  let minutes = Math.floor((sec - hours * 3600) / 60); // get minutes
  let seconds = Math.floor(sec - hours * 3600 - minutes * 60); //  get seconds

  [hours, minutes, seconds] = [hours, minutes, seconds].map(
    (time) => (time < 10 ? '0' + time : '' + time) //Add 0 at the start if time is less than 10
  );

  return hours === '00' ? `${minutes}m ${seconds}s` : `${hours}h ${minutes}m`;
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
    type: 'bar',
    data: {
      labels: dates,
      datasets: [
        {
          label: 'last 7 days',
          data: time,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
            'rgba(255, 159, 64, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
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
          },
        },
      },
      plugins: {
        title: {
          display: true,
          text: 'Last 7 days',
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
