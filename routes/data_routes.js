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
    console.log("THere")
    res.json(resources);
    console.log("end")
  }
  catch(err){
    console.log("error: ",err.message)
    res.status(500).json({ error: err.message });
  }
});


async function getLatestSegment(containerClient, prefix) {
  console.log("Here3")

  const segments = [];
  const iter = containerClient.listBlobsByHierarchy("/", { prefix });

  for await (const item of iter) {
    if (item.kind === "prefix") {
      // Extract the segment name (e.g. "2026/", "04/", "16/", "20/")
      const segment = item.name.slice(prefix.length).replace("/", "");
      segments.push({ name: segment, fullPrefix: item.name });
    }
  }

  if (segments.length === 0) return null;

  // Sort numerically/lexicographically and take the last (latest)
  segments.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));

  return segments[segments.length - 1];
}

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

// Convert stream to text
async function streamToText(readable) {
  readable.setEncoding('utf8');
  let data = '';
  for await (const chunk of readable) {
    data += chunk;
  }
  return data;
}

router.get('/get_blob', async (req,res)=>{
  try{
    // console.log("get blob");
    // bloblist = containerClient.listBlobsFlat()
    // console.log("Blob list")
    // console.log(bloblist)
    // console.log("processing")
    // const timeSet = [...new Set(bloblist.map(p => p.slice(0, p.lastIndexOf("/") + 1)))];
    // console.log(timeSet)

    // for await (const blob of bloblist) {
    //   console.log(blob.name);
    console.log("Here1")
    bloblist2 = await(getLatestHourFiles("aggregations"));
    console.log(bloblist2)

    temp = []
    for  (const blob of bloblist2){
        console.log("downloading content ")
        const blobClient = containerClient.getBlobClient(blob.fullPath);
        const downloadResponse = await blobClient.download();
        console.log("Converting stream to text")
        const raw = await streamToText(downloadResponse.readableStreamBody);
        console.log("parsing")

        const parsed = JSON.parse(raw);

        temp.push(parsed);
        console.log(parsed)
    }
    console.log("Finish combining")
    console.log(temp)

    // loop throu each file 
      // download each file
      // convert values to text 
      // convert values to json 
      // combine the contents  fo the different files into single json
    // process data and send data to the charts 

  
    res.json(200);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }
});

router.get('/health',async (req,res)=>{
  res.status(200,"Health")
})

module.exports = router;