const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

// initialize s3
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    region: process.env.REGION_NAME,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

function formatSizeUnits(bytes) {
    if (bytes >= 1073741824) { bytes = (bytes / 1073741824).toFixed(2) + " GB"; }
    else if (bytes >= 1048576) { bytes = (bytes / 1048576).toFixed(2) + " MB"; }
    else if (bytes >= 1024) { bytes = (bytes / 1024).toFixed(2) + " KB"; }
    else if (bytes > 1) { bytes = bytes + " bytes"; }
    else if (bytes == 1) { bytes = bytes + " byte"; }
    else { bytes = "0 bytes"; }
    return bytes;
}

exports.download = (req, res) => {
    try {
        const date = req.query?.date;

        if (date) {
            const fileName = `User_data_${date}`;
            let csvFileName = fileName.replaceAll('.', '_');
            csvFileName = `${fileName}.csv`;

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: `results/${csvFileName}`
            };

            console.log('Looking For File:', csvFileName);

            res.attachment(csvFileName);

            const file = s3.getObject(params).createReadStream().on('error', error => {
                res.status(500).end();
            });

            file.pipe(res);
        } else {
            res.status(500).end();
        }

    } catch (error) {
        console.log('Error Occured:', error);
        res.status(500).end();
    }
}

exports.downloadWebData = (req, res) => {
    try {
        const date = req.query?.date;

        if (date) {
            const fileName = `Web_data_${date}`;
            let csvFileName = fileName.replaceAll('.', '_');
            csvFileName = `${fileName}.csv`;

            const params = {
                Bucket: process.env.AWS_BUCKET,
                Key: `similarwebresults/${csvFileName}`
            };

            console.log('Looking For File:', csvFileName);


            res.attachment(csvFileName);

            const file = s3.getObject(params).createReadStream().on('error', error => {
                res.status(500).end();
            });

            file.pipe(res);
        } else {
            res.status(500).end();
        }
    } catch (error) {
        console.log('Error Occured:', error);
        res.status(500).end();
    }
}

exports.listBucket = (req, res) => {

    const folderName = req.query?.folder ? req.query?.folder : 'results';

    var params = {
        Bucket: process.env.AWS_BUCKET,
        Delimiter: '/',
        Prefix: `${folderName}/`
    };

    const list = [];

    s3.listObjects(params, function (err, data) {
        if (err) {
            return 'There was an error viewing your s3 folder: ' + err.message
        } else {
            data.Contents.forEach(function (obj, index) {
                list.push({
                    "file": obj.Key,
                    "size": formatSizeUnits(obj.Size)
                })
            })

            res.status(200).send(list);
        }
    })


}

// http://localhost:8080/download?date=02_12_2021
// http://localhost:8080/list?folder=similarwebresults
// http://ec2-3-109-93-88.ap-south-1.compute.amazonaws.com:5000/download?date=04_06_2021