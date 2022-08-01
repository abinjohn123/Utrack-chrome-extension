'use strict';

const ctx = document.getElementById('statChart');

chrome.runtime.sendMessage({ request: 'history' }, (res) => {
  plotGraph(res.history);
});

function plotGraph(history) {
  const dateOptions = {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  };
  const dateLocale = navigator.language || 'en-US';
  const dates = history.map((entry) => {
    return new Intl.DateTimeFormat(dateLocale, dateOptions).format(
      new Date(entry.date)
    );
  });
  const time = history.map((entry) => {
    let sec = Math.floor(entry.time) / 1000;
    let hours = Math.floor(sec / 3600); // get hours
    let minutes = Math.floor((sec - hours * 3600) / 60);
    return minutes;
  });

  const myChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: dates,
      datasets: [
        {
          label: '# of Votes',
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
        },
      },
    },
  });
}
