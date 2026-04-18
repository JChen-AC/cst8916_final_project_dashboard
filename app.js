const express = require('express');
const app     = express();

// Serve static files from a current directory 
app.use(express.static(__dirname));

// add routes 
const dataRoutes = require('./routes/data_routes');
app.use('/', dataRoutes); 

// run the app
app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});