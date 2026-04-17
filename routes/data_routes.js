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

router.get('/get_blob', async (req,res)=>{
  try{
    const {resources} = await container.items.query("SELECT TOP 3 * FROM c  ORDER BY c.dateTimeStamp DESC").fetchAll();
    res.json(resources);
  }
  catch(err){
    res.status(500).json({ error: err.message });
  }
});

router.get('/health',async (req,res)=>{
  res.status(200,"Health")
})

module.exports = router;