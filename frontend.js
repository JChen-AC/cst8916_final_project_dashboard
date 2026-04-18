const POLL_INTERVAL_MS = 30000; //repeat interval

// global chart variables
let historyChart = null;
let iceChart = null;
let snowChart = null;
let externalTempChart = null;
let surfaceTempChart = null;

/*

TEST FUNCTIONS 

*/

const testbut = document.getElementById("testbutton");
testbut.addEventListener("click", testBlob2);

function testBlob() {
  console.log("testBlob")
  //initialize_charts();
  fetch("/check_connection")
    .then(res => res.json())
    .then(blob_response => {
      update_web_status(blob_response);
    });
}
function testBlob2() {
  fetch("/get_cosmodb")
    .then(res => res.json())
    .then(cosmo_response => {
      renderCosmoUpdate(cosmo_response);
    })
    .catch(err => console.error("Poll error:", err));
}

function update_web_status(data) {
  const pg_status = document.getElementById("page_status");
  pg_status.textContent = `Status: ${data.status}`
}




async function update_chart() {
  fetch("/get_blob").then(res => res.json())
    .then(blob_response => {
      renderChartUpdates(blob_response);
    })
    .catch(err => console.error("Poll error:", err));
}


/*

Update Webpage

*/

function fetchAndRender() {
  console.log("Fetch and render")
  fetch("/get_cosmodb")
    .then(res => res.json())
    .then(cosmo_response => {
      renderCosmoUpdate(cosmo_response);
    })
    .catch(err => console.error("Poll error:", err));
  fetch("/get_blob").then(res => res.json())
    .then(blob_response => {
      renderChartUpdates(blob_response);
    })
    .catch(err => console.error("Poll error:", err));
  fetch("/check_connection")
    .then(res => res.json())
    .then(blob_response => {
      update_web_status(blob_response);
    });
}


/*
Update Cards with cosmodb data
*/

function get_status_style(classlist) {
  if (classlist === "Unsafe") {
    console.log("Undafe: ", classlist);
    return "danger"
  }
  else if (classlist === "Safe") {
    console.log("Safe: ", classlist);
    return "safe"
  }
  else {
    console.log("caution: ", classlist);
    return "caution"
  }
}

function renderCosmoUpdate(data) {
  // Update the cards with the latest cosmodb information 
  console.log("Update cosmo")  
  for (const loc_data of data) {
    // loops for each location
    // get the card associated with the element 
    const card = document.getElementsByClassName(loc_data.location)[0];
    const statusElement = card.querySelector('.status');

    // update the status value 
    statusElement.textContent = `Status : ${loc_data.status}`;
    // update status style 
    let classlist = Array.from(statusElement.classList)
    let current_style;
    if (classlist.includes("danger")) {
      current_style = "danger";
    }
    else if (classlist.includes("caution")) {
      current_style = "caution";
    }
    else if (classlist.includes("safe")) {
      current_style = "safe";
    }
    else {
      current_style = "ERROR"
    }
    let new_style = get_status_style(loc_data.status);
    // remove old style and add new style if it changes 
    if (new_style !== current_style) {
      console.log("Different values Chaning")
      statusElement.classList.remove(current_style);
      statusElement.classList.add(new_style);
    }

    // update the ice values 
    const avgIceElement = card.querySelector('.average_ice');
    avgIceElement.textContent = `Average : ${loc_data.avgIceThickness}`;

    const minIceElement2 = card.querySelector('.min_ice');
    minIceElement2.textContent = `Min : ${loc_data.minThickness}`;

    const maxIceElement = card.querySelector('.max_ice');
    maxIceElement.textContent = `Max : ${loc_data.maxThickness}`;

    // update surface temperature elements 
    const avgSurfaceElement = card.querySelector('.avg_surface');
    avgSurfaceElement.textContent = `Min : ${loc_data.avgSurfaceTemperature}`;

    const minSurfaceElement = card.querySelector('.min_surface');
    minSurfaceElement.textContent = `Min : ${loc_data.minSurface}`;

    const maxSurfaceElement = card.querySelector('.max_surface');
    maxSurfaceElement.textContent = `Max : ${loc_data.maxSurface}`;

    //update snow elements 
    const snowElement = card.querySelector('.snow');
    snowElement.textContent = `Value : ${loc_data.snowAccumulation}`

    //update external temperature elements 
    const externalElement = card.querySelector('.external');
    externalElement.textContent = `Value : ${loc_data.avgExternalTemperature}`
  }
}

// AI helped create the base of this function, but was modified to fit need
function create_scatter_chart(ctx,) {
  // create a chart for a scatter plot 
  let temp_chart = new Chart(ctx, {
    // add default chart values 
    type: 'scatter',
    data: {
      // configure the datasets 
      datasets: [{
        label: "Dow's Lake",
        data: [],
        borderColor: 'red',
      },
      {
        label: 'Fifth Avenue',
        data: [],
        borderColor: 'green',
      },
      {
        label: 'NAC',
        data: [],
        borderColor: 'blue',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true },

        // AI created the base of this code, but was modified
          tooltip: {
            // create custom hover over data point function
            callbacks: {
              label: function (context) {
                let stateName;
                if (context.parsed.y === 1) {
                  stateName = 'Safe';
                }
                else if (context.parsed.y === 0.5) {
                  stateName = 'Cautious';
                }
                else if (context.parsed.y === 0) {
                  stateName = 'Danger';
                }
                else {
                  stateName = context.parsed.y;
                }
                const time = new Date(context.parsed.x).toLocaleTimeString();
                return `${context.dataset.label} — ${stateName} at ${time}`;
              }
            }
          }
        // end of AI base code
      },
      scales: {
        // create default x scale
        x: { type: 'time', stepSize: 5, },

        // AI created the base of this code, but was modified
          y: {
            // update y scale
            min: -0.2,   // a little padding below 0
            max: 1.2,   // a little padding above 1
            ticks: {
              // Only show ticks at your 3 values, nowhere else
              stepSize: 0.5,
              callback: function (value) {
                let label;
                if (value === 1) {
                  label = 'Safe';
                }
                else if (value === 0.5) {
                  label = 'Cautious';
                }
                else if (value === 0) {
                  label = 'Danger';
                }
                else {
                  label = '';
                }
                return label;
              }
            },
            title: { display: true, text: 'Status' }
          }
      }
    }

  });
  return temp_chart;
}

// AI helped create the base of this function, but was modified to fit need
function multi_create_chart(ctx) {
  // create default chart for multiple datasets 
  let temp_chart = new Chart(ctx, {
    type: 'line',
    data: {
      datasets: [
        // colours gotten from claude
        // avg dataset configuration
        { label: "Dow's Lake Average", data: [], borderColor: '#FF0000', },
        { label: 'Fifth Avenue Average', data: [], borderColor: '#00CC00', },
        { label: 'NAC Average', data: [], borderColor: '#0000FF', },

        // min dataset configuration
        { label: "Dow's Lake Min", data: [], borderColor: '#FF6666', },
        { label: 'Fifth Avenue Min', data: [], borderColor: '#90EE90', },
        { label: 'NAC Min', data: [], borderColor: '#ADD8E6', },

        // max dataset configuration
        { label: "Dow's Lake Max", data: [], borderColor: '#8B0000', },
        { label: 'Fifth Avenue Max', data: [], borderColor: '#006400', },
        { label: 'NAC Max', data: [], borderColor: '#00008B', },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true }
      },
      scales: {
        y: { beginAtZero: false },
        x: { type: 'time', stepSize: 5, }
      }
    }

  });
  return temp_chart;
}

// AI helped create the base of this function, but was modified to fit need
function create_chart(ctx) {
  // create single type chart 
  let temp_chart = new Chart(ctx, {
    type: 'line',
    data: {
      //default dataset configuration
      datasets: [{
        label: "Dow's Lake",
        data: [],
        borderColor: 'red',
      },
      {
        label: 'Fifth Avenue',
        data: [],
        borderColor: 'green',
      },
      {
        label: 'NAC',
        data: [],
        borderColor: 'blue',
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title: { display: true }
      },
      scales: {
        y: { beginAtZero: false },
        x: { type: 'time', stepSize: 5, }
      }
    }

  });
  return temp_chart;
}

/*
Update the charts with historical data 
*/

function renderChartUpdates(blob_response) {
  // renders and updates the charts 
  let processed_data = processChartData(blob_response);

  
  console.log("Updating history chart");
  // Update the history / status chart 
  historyChart.data.datasets[0].data = processed_data.status.DowsLake;
  console.log("New dow: ", historyChart.data.datasets[0].data)
  historyChart.data.datasets[1].data = processed_data.status.FifthAvenue;
  historyChart.data.datasets[2].data = processed_data.status.NAC;
  historyChart.data.labels = processed_data.timestamp;
  historyChart.update();

  // update the snow chart 
  console.log("Updating snow chart");
  snowChart.data.datasets[0].data = processed_data.snow.DowsLake;
  snowChart.data.datasets[1].data = processed_data.snow.FifthAvenue;
  snowChart.data.datasets[2].data = processed_data.snow.NAC;
  snowChart.data.labels = processed_data.timestamp;
  snowChart.update();
  console.log("Finish updating snow")

  //update the tempearture chart 
  console.log("Updating temp chart");
  surfaceTempChart.data.datasets[0].label = "Dow's Lake External Temperature";
  surfaceTempChart.data.datasets[0].data = processed_data.temp.DowsLake.external;
  surfaceTempChart.data.datasets[1].label = "Fifth Avenue External Temperature";
  surfaceTempChart.data.datasets[1].data = processed_data.temp.FifthAvenue.external;
  surfaceTempChart.data.datasets[2].label = "NAC External Temperature";
  surfaceTempChart.data.datasets[2].data = processed_data.temp.NAC.external;
  surfaceTempChart.data.datasets[3].data = processed_data.temp.DowsLake.min;
  surfaceTempChart.data.datasets[4].data = processed_data.temp.FifthAvenue.min;
  surfaceTempChart.data.datasets[5].data = processed_data.temp.NAC.min;
  surfaceTempChart.data.datasets[6].data = processed_data.temp.DowsLake.max;
  surfaceTempChart.data.datasets[7].data = processed_data.temp.FifthAvenue.max;
  surfaceTempChart.data.datasets[8].data = processed_data.temp.NAC.max;
  surfaceTempChart.data.labels = processed_data.timestamp;
  surfaceTempChart.update();
  console.log("Finish updating temp")

  // update ice chart
  console.log("Updating ice chart");
  iceChart.data.datasets[0].data = processed_data.ice.DowsLake.external;
  iceChart.data.datasets[1].data = processed_data.ice.FifthAvenue.external;
  iceChart.data.datasets[2].data = processed_data.ice.NAC.external;
  iceChart.data.datasets[3].data = processed_data.ice.DowsLake.min;
  iceChart.data.datasets[4].data = processed_data.ice.FifthAvenue.min;
  iceChart.data.datasets[5].data = processed_data.ice.NAC.min;
  iceChart.data.datasets[6].data = processed_data.ice.DowsLake.max;
  iceChart.data.datasets[7].data = processed_data.ice.FifthAvenue.max;
  iceChart.data.datasets[8].data = processed_data.ice.NAC.max;
  iceChart.data.labels = processed_data.timestamp;
  iceChart.update();

  console.log("Finish updating ice")
}

function processChartData(data_response) {
  // Process the response data to be usable for the charts
  let processed = {
    "status": {
      "DowsLake": [],
      "FifthAvenue": [],
      "NAC": []
    },
    "ice": {
      "DowsLake": { min: [], max: [], avg: [] },
      "FifthAvenue": { min: [], max: [], avg: [] },
      "NAC": {
        min: [], max: [], avg: []
      }
    },
    "snow": {
      "DowsLake": [], "FifthAvenue": [], "NAC": []
    },
    "temp": {
      "DowsLake": { min: [], max: [], external: [] },
      "FifthAvenue": { min: [], max: [], external: [] },
      "NAC": { min: [], max: [], external: [] }
    },
    "timestamp": []
  }
  //loops for each file of data and chunk of data
  for (const file_data of data_response) {
    for (const chunk of file_data) {
      // get the status and convert it into something that can be graphed easily 
        // 0 : danger, 1 : safe, 0.5: cautious
      if (chunk.status === "Unsafe") {
        processed["status"][chunk.location].push(0);
      }
      else if (chunk.status === "Safe") {
        processed["status"][chunk.location].push(1);
      }
      else {
        processed["status"][chunk.location].push(0.5);
      }

      processed["ice"][chunk.location]["min"].push(chunk.minThickness);
      processed["ice"][chunk.location]["max"].push(chunk.maxThickness);
      processed["ice"][chunk.location]["avg"].push(chunk.avgIceThickness);
      processed["snow"][chunk.location].push(chunk.snowAccumulation);
      processed["temp"][chunk.location]["min"].push(chunk.minSurface);
      processed["temp"][chunk.location]["max"].push(chunk.maxSurface);
      processed["temp"][chunk.location]["external"].push(chunk.avgExternalTemperature);

      // AI added suggesting to prevent triplicating the timestamps 
      if (chunk.location === "DowsLake") {
        processed["timestamp"].push(chunk.dateTimeStamp);
      }
    }
  }
  console.log(processed);
  return processed;

}


// AI helped with debugging 

function initialize_charts() {
  // initialize the charts 

  // getting chart elements 
  const history_ctx = document.getElementById('historyData').getContext('2d');
  const ice_ctx = document.getElementById('icehistory').getContext('2d');
  const temp_ctx = document.getElementById('temphistory').getContext('2d');
  const snow_ctx = document.getElementById('snowhistory').getContext('2d');

  // creating charts if they have not already been created 
  if (!historyChart) {
    historyChart = create_scatter_chart(history_ctx);
  }
  if (!iceChart) {
    iceChart = multi_create_chart(ice_ctx);
  }
  if (!snowChart) {
    snowChart = create_chart(snow_ctx);
  }
  if (!surfaceTempChart) {
    surfaceTempChart = multi_create_chart(temp_ctx);
  }
}


// Funcitonal called when loaded
initialize_charts();
setInterval(fetchAndRender, POLL_INTERVAL_MS)