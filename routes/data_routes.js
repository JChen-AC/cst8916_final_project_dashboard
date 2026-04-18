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


//AI Generated function to find the
async function getLatestSegment(containerClient, prefix) {
  console.log("Here3")

  const numbers = [];
  let highest = 0;
  let highest_folder = null;
  const subfolders = containerClient.listBlobsByHierarchy("/", { prefix });
  console.log(prefix)

  for await (const item of subfolders) {
    console.log(item)
    if (item.kind === "prefix") {
      // Extract the segment name (e.g. "2026/", "04/", "16/", "20/")
      const segment = item.name.slice(prefix.length).replace("/", "");
      console.log(segment)
      if(highest_folder === null){
        highest_folder = segment;
      }
      else{
        const result = segment.localeCompare(highest_folder, undefined, { numeric: true });
        if (result >0){
          highest_folder = segment;
        }        
      }
    }
  }

  if (highest_folder === null) return null;
  return highest_folder

}

async function getLatestHourFiles(rootPrefix = "root/") {
  //const containerClient = blobServiceClient.getContainerClient(containerName);
  console.log("Here2")
  // Step 1 — Latest year
  let path = rootPrefix
  const latestYear  = await getLatestSegment(containerClient, path);
  if (!latestYear){
    console.log("year is null")
     return []
  } ;
  console.log(`📅 Latest year  : ${latestYear}`);
  path+=latestYear+'/';

  // Step 2 — Latest month
  const latestMonth = await getLatestSegment(containerClient, path);
  if (!latestMonth){
    console.log("month is null")
     return []
  } ;
  console.log(`📅 Latest month : ${latestMonth}`);
  path+=latestMonth+'/'
  // Step 3 — Latest day
  const latestDay   = await getLatestSegment(containerClient, path);
  if (!latestDay){
    console.log("day is null")
     return []
  } ;
  console.log(`📅 Latest day   : ${latestDay}`);
  path+=latestDay+'/'
  // Step 4 — Latest hour
  const latestHour  = await getLatestSegment(containerClient, path);
  if (!latestHour){
    console.log("hour is null")
     return []
  } ;
  console.log(`📅 Latest hour  : ${latestHour}`);
  path+=latestHour+'/'
  console.log(`\n✅ Latest path  : ${path}`);
  console.log("─".repeat(50));

  // Step 5 — List all files in the latest hour folder
  const files = [];

  for await (const blob of containerClient.listBlobsFlat({ prefix: path })) {
    const fileName = blob.name.slice(path.length);
    files.push({
      fileName,
      fullPath : blob.name,
      modified : blob.properties.lastModified,
      size     : blob.properties.contentLength
    });
    console.log(`📄 ${fileName}`);
    // can just return a list of files, don't need this human readable version
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