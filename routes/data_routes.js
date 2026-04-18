require("dotenv").config();
const { CosmosClient } = require("@azure/cosmos");
const { BlobServiceClient } = require("@azure/storage-blob");
const fs = require("fs");
const express = require('express');
const router    = express.Router();

const client = new CosmosClient({
  endpoint: process.env.COSMOS_ENDPOINT,   // e.g. https://your-account.documents.azure.com:443/
  key: process.env.COSMOS_KEY
});

const database = client.database(process.env.COSMOS_DATABASE);
const container = database.container(process.env.COSMOS_CONTAINER);

const blobServiceClient = BlobServiceClient.fromConnectionString(
  process.env.AZURE_STORAGE_CONNECTION_STRING
);
  const containerClient = blobServiceClient.getContainerClient(process.env.BLOB_CONTAINER);



router.get('/get_cosmodb', async (req,res)=>{
  try{
    console.log("HEre")
    const {resources} = await container.items.query("SELECT TOP 3 * FROM c  ORDER BY c.dateTimeStamp DESC").fetchAll();
    //console.log("THere")
    res.json(resources);
    //console.log("end")
  }
  catch(err){
    console.log("error: ",err.message)
    res.status(500).json({ error: err.message });
  }
});


//AI used as a reference but modified 
async function getLatestSegment(containerClient, prefix) {
  let highestName = null;
  let highestFullPrefix = null;

  const subfolders = containerClient.listBlobsByHierarchy("/", { prefix });

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
  //const containerClient = blobServiceClient.getContainerClient(containerName);
  console.log("Here2")
  // Step 1 — Latest year
  const latestYear  = await getLatestSegment(containerClient, rootPrefix);
  if (!latestYear)  return [];
  console.log(`📅 Latest year  : ${latestYear.name}`);

  // Step 2 — Latest month
  const latestMonth = await getLatestSegment(containerClient, latestYear.fullPrefix);
  if (!latestMonth) return [];
  console.log(`📅 Latest month : ${latestMonth.name}`);

  // Step 3 — Latest day
  const latestDay   = await getLatestSegment(containerClient, latestMonth.fullPrefix);
  if (!latestDay)   return [];
  console.log(`📅 Latest day   : ${latestDay.name}`);

  // Step 4 — Latest hour
  const latestHour  = await getLatestSegment(containerClient, latestDay.fullPrefix);
  if (!latestHour)  return [];
  console.log(`📅 Latest hour  : ${latestHour.name}`);

  console.log(`\n✅ Latest path  : ${latestHour.fullPrefix}`);
  console.log("─".repeat(50));

  // Step 5 — List all files in the latest hour folder
  const files = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix: latestHour.fullPrefix })) {
    const fileName = blob.name.slice(latestHour.fullPrefix.length);
    files.push({
      fileName,
      fullPath : blob.name,
      modified : blob.properties.lastModified,
      size     : blob.properties.contentLength
    });
    console.log(`📄 ${fileName}`);
  }

  console.log(`\nTotal: ${files.length} file(s) in latest hour`);
  return files;
}

async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

router.get('/get_blob', async (req, res) => {
  try {
    console.log("Here1");

    const bloblist2 = await getLatestHourFiles("aggregations");
    console.log(bloblist2);

    const temp = [];

    for (const blob of bloblist2) {
      console.log(`⬇️ Downloading: ${blob.fullPath}`);

      const blobClient = containerClient.getBlobClient(blob.fullPath);
      const downloadResponse = await blobClient.download();

      if (!downloadResponse.readableStreamBody) {
        throw new Error("No stream returned");
      }

      console.log("Converting stream to text...");
      const raw = await streamToText(downloadResponse.readableStreamBody);

      console.log("Parsing JSON...");
      // AI
      const parsed = raw
        .split('\n')
        .filter(line => line.trim() !== '')
        .map(line => JSON.parse(line));
      // END AI 
      temp.push(parsed);
    }

    console.log("✅ Finished combining");
    console.log(temp)
    res.status(200).json(temp);

  } catch (err) {
    console.error("❌ Error:", err);
    res.status(500).send(err.message);
  }
});

async function checkCosmo(){
  try{
    await container.read();
    return true;
  }
  catch(err){
    return false;
  }
}

async function checkBlob(){
  try{
    const exists = await containerClient.exists();
    if(exists){
      return true; 
    }
    return false;
  }
  catch(err){
    return false 
  }
}

router.get('/check_connection',async(req,res)=>{
  let cosmoHealth = await checkCosmo();
  let blobHealth = await checkBlob();
  if(cosmoHealth && blobHealth){
    console.log("Inner : live")
    res.status(200).json({ status: 'live' }); // AI helped with the json
  }
  else{
    console.log("Inner : down")
    res.status(201).json({ status: 'down' });   // AI helped with the json
  }
  
})

router.get('/health',async (req,res)=>{
  res.status(200,"Health")
})

module.exports = router;