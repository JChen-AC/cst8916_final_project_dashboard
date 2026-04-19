# cst8916_final_project_dashboard

## Student information
**Student Name**: Joshua Chen

**Student ID**: 041280453

**Course**: CST8916 Remote Data and Real Time Application

**Semester**: Winter 2026
## Overview

This is the dashboard for the Rideau Canal project. 
It creates a dashboard that displays information regarding the Rideau Canal in cards and charts. It shows the connectivity status to the databases in the top right corner. 
There is a single card for each device / location that shows the status of the location as well as the aggregated data for the location, which is gotten from the CosmoDB. The charts display historical data gotten from the Blob Storage, with there being 4 charts; a status chart, an ice chart, a temperature chart, and a snow chart. 

The following technologies were used
- Node.js
- npm
- Azure Cosmo DB SDK
- Azure Blob Storage SDK
- Chart.js
- html, javascript, css

## Prerequisites

Node.js and npm need to be installed

The Blob Storage and Azure CosmoDB need to be set up. 

To run locally, it requires a working browser and an internet connection. 
To run it in the cloud, an Azure App Service needs to be set up.

## Installation

### Local 
1) Clone the repository 
    git clone https://github.com/JChen-AC/cst8916_final_project_rideau_canal_dashboard.git

2) Cd into the project folder
3) Download the required packages
    npm install 

### Configuration

1) Create .env file
2) Add environment variables 
Add the following:
- COSMOS_ENDPOINT
- COSMOS_KEY
- AZURE_STORAGE_CONNECTION_STRING
- COSMOS_DATABASE
- COSMOS_CONTAINER
- BLOB_CONTAINER

See .env.sample for a proper example 

## API Endpoints
### GET /get_cosmodb
Method : GET
Description: Used to get the most latest aggregated data of the 3 locations from the Azure CosmoDB. Querying the Database using the CosmoDB container client that was created and request the Top 3 aggregated data from the CosmoDB when it is sorted by time stamps. (The Top 3 corresponds to the 3 locations)
The results are used to update the cards that show the location information

returns a Json version of the aggregate data, or a 500 if something goes wrong

Connects to the Azure CosmoDB 

See sample_cosmodb_response.js for sample response

### GET /get_blob
Method : GET
Description: Used to get the historical data from Azure Blob Storage. It looks through the folder path to find the latest folder and downloads the contents using a Blob Container client. It streams the data and converts it to Json format and combines the results if there are multiple files. The results are used to update the charts that display the historical data 

returns a json version of the historical data or a 500 if there is an error

Connects to the Azure Blob Storage

See sample_blob_response.txt for sample response

### GET /check_connection
Method : GET
Description: A health check that is run every 30 seconds that checks the connectivity to the Azure Blob Storage and Azure CosmoDB. The result is used to update the page status. 

returning alive if it is able to connect to both, and down if it is unable to connect to either

Connects to both the Azure Blob Storage and Azure CosmoDB 

### GET /health 
Method : GET
Description: A simple health check that returns 200 if it is able to connect. Used to test to see if the webpage is running properly 

## Deployment to Azure App Services 

1) Create an Azure App Service, selecting a region that is the same as the other cloud services being used, chosing no redundancy. The publish will be set to code, and the runtime stack is Node.js 20. 
2) For deployment, select continuous deployment, and connect your GitHub Account. For the repository, select the forked version of this repo and the branch set to main. 
3) Ensure that public access is true in the networking tab and leave everything else the same
4) Create the App Service
5) Configure the Environment Variables using the Environment Variable tab. Using the same ones listed above 
6) Restart the App Service
7) Ensure that the App Service is running
8) Connect to the Website 

## Dashboard Features
The dashboard allows for real time updates, querying the Azure CosmosDB and Blob Storage every 30 seconds.

It consists of 3 sections of display data. 
The first is the page status in the top right corner, which queries the CosmoDB and Blob Storage and displays the status of this connection. 

The second section are the cards, these are the 3 boxes in the center, which display the current information regarding the different location. It consists of the status of the location and the ice thickness, snow accumulation, surface temperature, and external temperature. The status changes colour based on its status, with red being Danger, yellow being cautious, and green being safe. 

The final section is the historical charts. There are 4 historical chart that represent the state, the temperature, the ice, and the snow. Each chart shows the historical data of all 3 locations on a single chart. 

The status chart is a scatter plot, with the dots being placed on the status. With the rest of the charts being line graphs. The snow chart shows the historic snow accumulation, and the ice chart showing the historic min, max, and average ice thickness of the 3 locations. Finally, the temperature shows the historic min and max surface temperature and the historic external temperature. The charts are suppose to show the historical information, meaning it shows the different 5 minute aggregation and analysis that the Azure Stream Analytics does, and it is supposed to only show the last hour due to how it loads the information. 
## AI Usage
AI was used extensively in this project and repository
Note : All code generated with AI will have a comment stating that it was generated or AI generated code was the primary base

ChatGPT and Claude were used extensively in the following ways
- to help understand the project structure for a node.js project
- to learn the basics of node.js 
- help understand the functions needed to get data from Azure CosmoDB using node.js 
- to learn the basics of chart.js and generate code for the basic templates that the charts were created from
- Generated code to provide a custom Y scale and hover over points functionality 
- Used extensively to debug the routes and their connection to the Azure services, as well as sending data to the dashboard/front end 
- Used to generate code to communicate with the Blob Storage, (functions to determine the latest folder)
- provide colour codes for the chart
- used to help determine what content to put in the documentation
