
//CHART 
const ctx   = document.getElementById('historyData').getContext('2d');
const chart = new Chart(ctx, {
  type: 'line',
  data: {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],  // X axis
    datasets: [{
      label:           'Temperature (°C)',
      data:            [4, 7, 12, 18, 22, 26],            // Y axis values
      borderColor:     'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.1)',
      tension:         0.4,     // curve smoothing (0 = straight lines)
      fill:            true,    // fill area under line
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' },
      title:  { display: true, text: 'Monthly Temperature' }
    },
    scales: {
      y: { beginAtZero: false }
    }
  }
});