 const POLL_INTERVAL_MS = 30000;

function fetchAndRender(){
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
    .then(blob_response =>{
      update_web_status(blob_response);
    });
}

function testBlob(){
    console.log("testBlob")
    //initialize_charts();
    fetch("/check_connection")
    .then(res => res.json())
    .then(blob_response =>{
      update_web_status(blob_response);
    });
}
function testBlob2(){
  fetch("/get_cosmodb")
    .then(res => res.json())
    .then(cosmo_response => {
        renderCosmoUpdate(cosmo_response);
      })
      .catch(err => console.error("Poll error:", err));
}

function update_web_status(data){
  const pg_status = document.getElementById("page_status");
  pg_status.textContent=`Status: ${data.status}`
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
   console.log("Update cosmo")
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
        console.log("Class list: ",classlist);
        console.log("specific style: ",get_current_style(classlist));
        console.log("danger check: ",classlist.includes("danger"))
        console.log("caution check: ",classlist.includes("caution"))
        console.log("safe check: ",classlist.includes("safe"))
        /*console.log(get_current_style(classlist));
        NEed to get the last class / find the current colour class an replace it with the new one 
        */
       let current_style;
        if(classlist.includes("danger")){
          current_style = "danger";
        }
        else if(classlist.includes("caution")){
          current_style = "caution";
        }
        else if(classlist.includes("safe")){
          current_style = "safe";
        }
        else{
          current_style = "ERROR"
        }
        console.log("Current style:",current_style)
        
        let new_style = update_status_style(loc_data.status);
        console.log("new style:",new_style)
        if(new_style !== current_style){
          console.log("Different values Chaning")
          statusElement.classList.remove(current_style);
          statusElement.classList.add(new_style) ;   
        }         
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
          minIceElement2.textContent = `Min : ${loc_data.minThickness}`;   
          // issue with values not being updated 
            // reason is wrong element being used, still using status

        const maxIceElement = card.querySelector('.max_ice');
        maxIceElement.textContent = `Max : ${loc_data.maxThickness}`;  

        const avgSurfaceElement = card.querySelector('.avg_surface');
        avgSurfaceElement.textContent = `Min : ${loc_data.avgSurfaceTemperature}`; 

        const minSurfaceElement = card.querySelector('.min_surface');
        minSurfaceElement.textContent = `Min : ${loc_data.minSurface}`;  

        const maxSurfaceElement = card.querySelector('.max_surface');
        maxSurfaceElement.textContent = `Max : ${loc_data.maxSurface}`;  

        const snowElement = card.querySelector('.snow');
        snowElement.textContent = `Value : ${loc_data.snowAccumulation}`
        const externalElement = card.querySelector('.external');
        externalElement.textContent = `Value : ${loc_data.avgExternalTemperature}`

    }
}

const testbut = document.getElementById("testbutton");
testbut.addEventListener("click", testBlob2);

function create_x_axis(starthr=1){
  let x = []
  for(let i=starthr;i<=24;i++){
    hr = i%24;
    x.push(hr.toString())
  }
  return hr
}


function create_scatter_chart(ctx,){
  let temp_chart = new Chart(ctx,{
    type:'scatter',
    data:{
      //labels: create_x_axis(1),
      datasets:[{
        label: "Dow's Lake",
        data:[],
        borderColor: 'red',
      },
      {
        label: 'Fifth Avenue',
        data:[],
        borderColor: 'green',
      },
      {
        label: 'NAC',
        data:[],
        borderColor: 'blue',
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        title:  { display: true},

        // AI helped create tool tip for hovering
        tooltip: {
          callbacks: {
            label: function(context) {
              //const stateNames = { 1: 'Ready', 0.5: 'Loading', 0: 'Not Ready' };
              //const stateName  = stateNames[context.parsed.y] ?? context.parsed.y;
              let stateName;
              if(context.parsed.y===1){
                stateName  = 'Ready';
              }
              else if(context.parsed.y === 0.5){
                stateName  = 'Loading';
              }
              else if(context.parsed.y ===0){
                stateName  = 'Not Ready';
              }
              else{
                stateName = context.parsed.y;
              }
              const time = new Date(context.parsed.x).toLocaleTimeString();
              return `${context.dataset.label} — ${stateName} at ${time}`;
            }
          }
        }
      },
      scales: {       
        
        x:{type:'time',stepSize: 5,  },

        // ai helped with y axis relabelling
        y: {
          min: -0.2,   // a little padding below 0
          max:  1.2,   // a little padding above 1
          ticks: {
            // Only show ticks at your 3 values, nowhere else
            stepSize: 0.5,
            callback: function(value) {
              let label;
              if(value===1){
                label  = 'Ready';
              }
              else if(value === 0.5){
                label  = 'Loading';
              }
              else if(value ===0){
                label  = 'Not Ready';
              }
              else{
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

function multi_create_chart(ctx){
  let temp_chart = new Chart(ctx,{
    type:'line',
    data:{
      //labels: create_x_axis(1),
      datasets:[
        // colours gotten from claude
      { label: "Dow's Lake Average", data:[], borderColor: '#FF0000', },
      { label: 'Fifth Avenue Average', data:[], borderColor: '#00CC00', },
      { label: 'NAC Average', data:[], borderColor: '#0000FF', },
      { label: "Dow's Lake Min", data:[], borderColor: '#FF6666', },
      { label: 'Fifth Avenue Min', data:[], borderColor: '#90EE90', },
      { label: 'NAC Min', data:[], borderColor: '#ADD8E6', },
      { label: "Dow's Lake Max", data:[], borderColor: '#8B0000', },
      { label: 'Fifth Avenue Max', data:[], borderColor: '#006400', },
      { label: 'NAC Max', data:[], borderColor: '#00008B', },     
    ]
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
        x:{type:'time',stepSize: 5,}
      }
    }

  });
  return temp_chart;
}


function create_chart(ctx){
  let temp_chart = new Chart(ctx,{
    type:'line',
    data:{
      //labels: create_x_axis(1),
      datasets:[{
        label: "Dow's Lake",
        data:[],
        borderColor: 'red',
      },
      {
        label: 'Fifth Avenue',
        data:[],
        borderColor: 'green',
      },
      {
        label: 'NAC',
        data:[],
        borderColor: 'blue',
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
        x:{type:'time',stepSize: 5,}
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
  /*
  Call process chart data to get the processed data 
  then using the process data update each data set individually 
  */
 let processed_data = processChartData(blob_response);

 console.log("Updating history chart");
  console.log("Updating dow with: ",processed_data.status.DowsLake)
  historyChart.data.datasets[0].data = processed_data.status.DowsLake;
  console.log("New dow: ",historyChart.data.datasets[0].data)
  console.log("Updating dow with: ",processed_data.status.FifthAvenue)
  historyChart.data.datasets[1].data = processed_data.status.FifthAvenue;
  console.log("Updating dow with: ",processed_data.status.NAC)
  historyChart.data.datasets[2].data = processed_data.status.NAC;
  historyChart.data.labels= processed_data.timestamp;
  console.log("Data loaded updating now")
  historyChart.update();
  console.log("Finished updating ")

  console.log("Updating snow chart");
  snowChart.data.datasets[0].data = processed_data.snow.DowsLake;
  snowChart.data.datasets[1].data = processed_data.snow.FifthAvenue;
  snowChart.data.datasets[2].data = processed_data.snow.NAC;
  snowChart.data.labels= processed_data.timestamp;
  snowChart.update();
  console.log("Finish updating snow")

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
  surfaceTempChart.data.labels= processed_data.timestamp;
  surfaceTempChart.update();
  console.log("Finish updating temp")

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
  iceChart.data.labels= processed_data.timestamp;
  iceChart.update();

  console.log("Finish updating ice")


//   iceChart.data.datasets

//   historyChart.data;
//  iceChart;
//  snowChart;
//  externalTempChart;
//  surfaceTempChart;
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
      "NAC":{ min:[], max:[], avg:[]
      }
    },
    "snow":{ "DowsLake":[], "FifthAvenue":[], "NAC":[]
    },
    "temp":{
      "DowsLake":{ min:[], max:[], external:[]
      },
      "FifthAvenue":{ min:[], max:[], external:[]
      },        
      "NAC":
        { min:[], max:[], external:[]
        }
      
    }  ,
    "timestamp":[]
  }
  for (const data of data_response){
    for(const chunk of data){
      if(chunk.status==="Unsafe"){
        processed["status"][chunk.location].push(0);
      }
      else if(chunk.status==="Safe"){
        processed["status"][chunk.location].push(1);
      }
      else{
        processed["status"][chunk.location].push(0.5);
      }
            
      processed["ice"][chunk.location]["min"].push(chunk.minThickness);
      processed["ice"][chunk.location]["max"].push(chunk.maxThickness);
      processed["ice"][chunk.location]["avg"].push(chunk.avgIceThickness);
      processed["snow"][chunk.location].push(chunk.snowAccumulation);
      processed["temp"][chunk.location]["min"].push(chunk.minSurface);
      processed["temp"][chunk.location]["max"].push(chunk.maxSurface);
      processed["temp"][chunk.location]["external"].push(chunk.avgExternalTemperature);
      if(chunk.location==="DowsLake"){
        // AI added suggesting to prevent triplicating the timestamps 
        processed["timestamp"].push(chunk.dateTimeStamp);
      }
    }
  }
  console.log(processed);
  return processed ;

}


// AI helped with debugging 
let historyChart = null;
let iceChart = null;
let snowChart = null;
let externalTempChart = null;
let surfaceTempChart = null;

function initialize_charts(){
  const history_ctx   = document.getElementById('historyData').getContext('2d');
  const ice_ctx   = document.getElementById('icehistory').getContext('2d');
  const temp_ctx   = document.getElementById('temphistory').getContext('2d');
  const snow_ctx  = document.getElementById('snowhistory').getContext('2d');
  if(!historyChart){
    historyChart = create_scatter_chart(history_ctx);
  }
  if(!iceChart){
      iceChart = multi_create_chart(ice_ctx);

  }
  if(!snowChart){
    snowChart = create_chart(snow_ctx);

  }
  if(!surfaceTempChart){
      surfaceTempChart = multi_create_chart(temp_ctx);

  }
    
}
  initialize_charts();
  setInterval(fetchAndRender,POLL_INTERVAL_MS)