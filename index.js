const express = require('express');
const cors = require('cors');
const { download, listBucket } = require('./controllers/awsController');
require('dotenv').config()

const port = process.env.SERVER_PORT;
const app = express();
app.use(cors());

app.get('/', (req, res) => {
  res.send('Download Webdata Endpoint is up.')
})

app.get('/download', (req, res) => {
  download(req, res);
})

app.get('/list', (req, res) => {
  listBucket(req, res);
})

app.listen(port, () => {
  console.log(`Application is warm up and running on ${port}`)
})