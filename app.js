const express = require('express');
const app     = express();

// Serve static files from a "public" folder
app.use(express.static(__dirname));
const dataRoutes = require('./routes/data_routes');
app.use('/', dataRoutes);

// window.onload = () => {
//   console.log("Hello");
// };

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});