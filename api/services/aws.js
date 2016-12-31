
var AWS = require('aws-sdk');
var local = require('../../config/local');

// Lock API to a know point in time.
AWS.config.apiVersion = '2014-07-01';

// config readonly user access
AWS.config.update({ "accessKeyId": local.awsAccessKey,
                    "secretAccessKey": local.awsSecretKey,
                    "region": "us-east-1",
                    "maxRetries": 1,
                    "logger": process.stdout,
                    sslEnabled: true
                  });
                    
module.exports = AWS;
