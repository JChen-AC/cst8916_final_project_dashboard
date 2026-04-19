require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const express = require('express');
const router = express.Router();


/*

Set up CosmoDB and Blob Storage Clients 

*/
const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT, 
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER);


/*

Handling CosmoDB 

*/
router.get('/get_cosmodb', async (req, res) => {
  try {
    // gets the top 3 data points from the database with the data appearing in descending order based on the time 
    // reason for top 3 is one for each location
    const { resources } = await container.items.query("SELECT TOP 3 * FROM c  ORDER BY c.dateTimeStamp DESC").fetchAll();
    res.json(resources);
  }
  catch (err) {
    console.log("error: ", err.message)
    res.status(500).json({ error: err.message });
  }
});



/*

Handling Blob storage

*/
//AI used as a reference but modified 
async function getLatestSegment(containerClient, prefix) {
  // determine which folder is the newest
  let highestName = null;
  let highestFullPrefix = null;

  const subfolders = containerClient.listBlobsByHierarchy("/", { prefix });
  // get all subfolder names in the folder 

  // loop through each folder and comparing them based on their number to see the newest/highest number 
  for await (const folder of subfolders) {
    if (folder.kind === "prefix") {
      const segment = folder.name.slice(prefix.length).replace("/", "");

      if (highestName === null) {
        highestName = segment;
        highestFullPrefix = folder.name;
      } else {
        const result = segment.localeCompare(highestName, undefined, { numeric: true });
        if (result > 0) {
          highestName = segment;
          highestFullPrefix = folder.name;
        }
      }
    }
  }

  if (highestName === null) return null;
  return { name: highestName, fullPrefix: highestFullPrefix };
}


//AI Generated function to find the
async function getLatestHourFiles(rootPrefix = "root/") {
  // gets the latest files in the blob storage (since should only handle last hour)
  
  // Step 1 — Latest year
  const latestYear = await getLatestSegment(containerClient, rootPrefix);
  if (!latestYear) return [];

  // Step 2 — Latest month
  const latestMonth = await getLatestSegment(containerClient, latestYear.fullPrefix);
  if (!latestMonth) return [];

  // Step 3 — Latest day
  const latestDay = await getLatestSegment(containerClient, latestMonth.fullPrefix);
  if (!latestDay) return [];

  // Step 4 — Latest hour
  const latestHour = await getLatestSegment(containerClient, latestDay.fullPrefix);
  if (!latestHour) return [];

  // Step 5 — List all files in the latest hour folder
  const files = [];

  // modified code from the ai generated code
  // gets the files from the folder that was found to be the latest
  for await (const blob of containerClient.listBlobsFlat({ prefix: latestHour.fullPrefix })) {
    const fileName = blob.name.slice(latestHour.fullPrefix.length);
    files.push(blob.name)
    console.log(`${fileName}`);
  }

  console.log(`\nTotal: ${files.length} file(s) in latest hour`);
  return files;
}


// Microsoft function
// convert stream data to text 
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}


router.get('/get_blob', async (req, res) => {
  // route to get blob information
  try {    

    // get list of blob files 
    const bloblist2 = await getLatestHourFiles("aggregations");

    const blob_data = [];

    for (const blob of bloblist2) {
      // connect to blob object based on the file path 
      const blobClient = containerClient.getBlobClient(blob);
      // download each blob 
      const downloadResponse = await blobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error("No stream returned");
      }

      console.log("Converting stream to text...");
      const raw = await streamToText(downloadResponse.readableStreamBody);

      // AI
      // converts the gotten data into json
      const parsed = raw
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
      // END AI 
      blob_data.push(parsed);
    }

    res.status(200).json(blob_data);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send(err.message);
  }
});

async function checkCosmo() {
  // checks to see if connection with cosmodb is still good 
  try {
    // execute quick read function on the cosmodb to see if still connected 
    await container.read();
    return true;
  }
  catch (err) {
    return false;
  }
}

/*

Update page status

*/

async function checkBlob() {
  // checks to see if connection with blob container is still good 

  try {
    // checks to see if the blob container clients still exist 
    const exists = await containerClient.exists();
    if (exists) {
      return true;
    }
    return false;
  }
  catch (err) {
    return false
  }
}

// route to update page status 
router.get('/check_connection', async (req, res) => {
  // get connection status 
  let cosmoHealth = await checkCosmo();
  let blobHealth = await checkBlob();

  // checks to see if both are still connected 
  if (cosmoHealth && blobHealth) {
    console.log("Inner : live")
    res.status(200).json({ status: 'live' }); // AI helped with the json (how to format the return)
  }
  else {
    console.log("Inner : down")
    res.status(201).json({ status: 'down' });   // AI helped with the json (how to format the return)
  }
})

// general health check 
router.get('/health', async (req, res) => {
  res.status(200, "Health")
})


// export the routes 
module.exports = router;