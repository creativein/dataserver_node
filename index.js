const AWS = require('aws-sdk');
const express = require('express');
const cors = require('cors');
const { download, downloadWebData, listBucket } = require('./controllers/awsController');
require('dotenv').config()

const port = process.env.SERVER_PORT;
const app = express();
app.use(cors());

//configuring the AWS environment
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  apiVersion: 'latest',
  region: process.env.REGION_NAME,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

app.get('/', (req, res) => {
  res.send('Download Webdata Endpoint is up.')
})

app.get('/download', (req, res) => {
  download(req, res);
})


app.get('/download_webdata', (req, res) => {
  downloadWebData(req, res);
})

app.get('/list', (req, res) => {
  listBucket(req, res);
})

app.listen(port, () => {
  console.log(`Application is warm up and running on ${port}`)
})



// http://localhost:8080/download?date=02_12_2021
// http://localhost:8080/download_webdata?date=02_12_2021
// http://localhost:8080/list?folder=similarwebresults
// http://localhost:8080/list?folder=results


// http://ec2-3-109-93-88.ap-south-1.compute.amazonaws.com:5000/download?date=04_06_2021