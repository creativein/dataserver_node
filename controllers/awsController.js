const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');

//configuring the AWS environment
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    apiVersion: 'latest',
    region: process.env.REGION_NAME,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// initialize s3
const s3 = new AWS.S3();

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
    const date = req.query?.date;
    const fileName = `User_data_${date}`;
    let csvFileName = fileName.replaceAll('.', '_');
    csvFileName = `${fileName}.csv`;

    const params = {
        Bucket: process.env.AWS_BUCKET,
        Key: `results/${csvFileName}`
    };

    const filePath = path.join('temp', csvFileName);

    console.log('File', filePath);

    return s3.getObject(params, (err, data) => {
        if (err) {
            console.error('error', err);
            res.status(404).end()
        };
        fs.writeFileSync(filePath, data?.Body);

        //download
        res.download(filePath, function (err) {
            if (err) {
                // Handle error, but keep in mind the response may be partially-sent
                // so check res.headersSent
                console.log(res.headersSent);
            } else {
                // decrement a download credit, etc. // here remove temp file
                fs.unlink(filePath, function (err) {
                    if (err) {
                        console.error(err);
                    }
                    console.log('Temp File Delete');
                });
            }
        })

    });
}

exports.listBucket = (req, res) => {
    var params = {
        Bucket: process.env.AWS_BUCKET,
        Delimiter: '/',
        Prefix: 'results/'
    };

    const list = [];

    s3.listObjects(params, function (err, data) {
        if (err) {
            return 'There was an error viewing your album: ' + err.message
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

//http://localhost:8080/download?date=02_12_2021