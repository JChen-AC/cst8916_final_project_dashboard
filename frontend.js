  const POLL_INTERVAL_MS = 30000;

function fetchAndRender(){
  console.log("Fetch and render")
  fetch("/get_cosmodb")
    .then(res => res.json())
    .then(cosmo_response => {
        renderCosmoUpdate(cosmo_response);
      })
      .catch(err => console.error("Poll error:", err));
  

}

function testBlob(){
    console.log("testBlob")
    fetch("/get_blob")
    .then(res => res.json())
}

function update_status_style(data){
  if(data === "Unsafe"){
    console.log("Undafe: ",data);
    return "danger"
  }
  else if(data ==="Safe"){
    console.log("Safe: ",data);
    return "safe"
  }
  else{
    console.log("caution: ",data);
    return "caution"
  }
}

function get_current_style(classlist){
  if(classlist === "Unsafe"){
    console.log("Undafe: ",classlist);
    return "danger"
  }
  else if(classlist ==="Safe"){
    console.log("Safe: ",classlist);
    return "safe"
  }
  else{
    console.log("caution: ",classlist);
    return "caution"
  }
}

function renderCosmoUpdate(data){
    /*
    for location in data
        get card information per location 
        update values location.value 

    */
   console.log(data)
   for(const loc_data of data){
        console.log(loc_data)
        console.log(`Location : ${loc_data.location}`)
        const card = document.getElementsByClassName(loc_data.location)[0];
        console.log(card)
        const statusElement = card.querySelector('.status');
        console.log(loc_data.status);
        statusElement.textContent = `Status : ${loc_data.status}`;   
        console.log(update_status_style(loc_data.status));
        let classlist = Array.from(statusElement.classList)
        /*console.log(get_current_style(classlist));
        NEed to get the last class / find the current colour class an replace it with the new one 
        */

        statusElement.classList.add(update_status_style(loc_data.status)) ;    
          const avgIceElement = card.querySelector('.average_ice');
          console.log(avgIceElement);
          console.log(loc_data.avgIceThickness)
          console.log(`Average : ${loc_data.avgIceThickness}`)

          avgIceElement.textContent = `Average : ${loc_data.avgIceThickness}`;   

        const minIceElement = card.querySelector('.min_ice');
          const minIceElement2 = card.querySelector('.min_ice');
          console.log(minIceElement2);
          console.log(loc_data.minThickness)
          console.log(`Mibn collect : ${loc_data.minThickness}`)
          minIceElement2.textContent = `Average : ${loc_data.minThickness}`;   
          // issue with values not being updated 
            // reason is wrong element being used, still using status

        const maxIceElement = card.querySelector('.max_ice');
        const minSurfaceElement = card.querySelector('.min_surface');
        const maxSurfaceElement = card.querySelector('.max_surface');
        const snowElement = card.querySelector('.snow');
        const externalElement = card.querySelector('.external');

    }
}

const testbut = document.getElementById("testbutton");
testbut.addEventListener("click", testBlob);

function create_x_axis(starthr=1){
  let x = []
  for(let i=starthr;i<=24;i++){
    hr = i%24;
    x.push(hr.toString())
  }
  return hr
}

function create_chart(ctx){
  let temp_chart = new Chart(ctx,{
    type:'line',
    datasets:{
      //labels: create_x_axis(1),
      datasets:[{
        label: "Dow's Lake",
        data:[]
      },
      {
        label: 'Fifth Avenue',
        data:[]
      },
      {
        label: 'NAC',
        data:[]
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title:  { display: true}
      },
      scales: {        
        y: { beginAtZero: false },
        x:{type:'time'}
      }
    }

  });
  return temp_chart;
}

async function update_chart(){
  fetch("/get_blob").then(res => res.json())
    .then(blob_response => {
      renderChartUpdates(blob_response);
    })
    .catch(err => console.error("Poll error:", err));
}


function renderChartUpdates(blob_response){

}

function processChartData(data_response){
  let processed={
    "status":{
      "DowsLake":[],
      "FifthAvenue":[],
      "NAC":[]
    },
    "ice":{
      "DowsLake":{ min:[], max:[], avg:[] },
      "FifthAvenue":{ min:[], max:[], avg:[] },
      "NAC":{
        min:[],
        max:[],
        avg:[]
      }
    },
    "snow":{
      "DowsLake":[],
      "FifthAvenue":[],
      "NAC":[]
    },
    "temp":{
      "DowsLake":{
        min:[],
        max:[],
        external:[]
      },
      "FifthAvenue":{
        min:[],
        max:[],
        external:[]
      },        
      "NAC":
        {
          min:[],
          max:[],
          external:[]
        }
      
    }  ,
    "timestamp":[]
  }
  for (data in data_response){
    for(chunk in data){
      processed["status"][chunk.location].push(chunk.status);
      processed["timestamp"].push(chunk.dateTimeStamp);
      processed["ice"][chunk.location]["min"].push(chunk.minThickness);
      processed["ice"][chunk.location]["max"].push(chunk.maxThickness);
      processed["ice"][chunk.location]["avg"].push(chunk.avgIceThickness);
      processed["snow"][chunk.location].push(chunk.snowAccumulation);
      processed["temp"][chunk.location]["min"].push(chunk.minSurface);
      processed["temp"][chunk.location]["max"].push(chunk.maxSurface);
      processed["temp"][chunk.location]["external"].push(chunk.avgExternalTemperature);
    }
  }

  /*
  return: 
  processed={
    "status":{
      "dowslake":[],
      "fifthavenue":[],
      "NAC":[],
      "timestamp":[]
    },
    "ice":{
      "dowslake"::{
        min:[],
        max:[],
        avg:[]
      },,
      "fifthavenue"::{
        min:[],
        max:[],
        avg:[]
      },,
      "NAC"::{
        min:[],
        max:[],
        avg:[]
      },,
      "timestamp":[]
    },
    "snow":{
      "dowslake":[],
      "fifthavenue":[],
      "NAC":[],
      "timestamp":[]
    },
    "temp":{
      "dowslake"::{
        min:[],
        max:[],
        external:[]
      },,
      "fifthavenue":min:[],
        max:[],
        external:[],
      "NAC":min:[],
        max:[],
        external:[],
      "timestamp":[]
    },
  
  }
  */
}

let historyChart;
let iceChart;
let snowChart;
let externalTempChart;
let surfaceTempChart;

function initialize_charts(){
  const history_ctx   = document.getElementById('historyData').getContext('2d');
  const ice_ctx   = document.getElementById('icehistory').getContext('2d');
  const temp_ctx   = document.getElementById('temphistory').getContext('2d');
  const snow_ctx  = document.getElementById('snowhistory').getContext('2d');

  historyChart = create_chart(history_ctx);
  iceChart = create_chart(ice_ctx);
  snowChart = create_chart(snow_ctx);
  surfaceTempChart = create_chart(temp_ctx);
}

//CHARTS 
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

const ctx2   = document.getElementById('icehistory').getContext('2d');
const chart2 = new Chart(ctx2, {
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

const ctx3   = document.getElementById('temphistory').getContext('2d');
const chart3 = new Chart(ctx3, {
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

const ctx4   = document.getElementById('snowhistory').getContext('2d');
const chart4 = new Chart(ctx4, {
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