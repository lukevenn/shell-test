const serverless = require('serverless-http');
const AWS = require('aws-sdk');
const { createApp } = require('./src/app');

const { IS_OFFLINE } = process.env;

let dynamoDbClient;
if (IS_OFFLINE === 'true') {
  dynamoDbClient = new AWS.DynamoDB.DocumentClient({
    region: 'localhost',
    endpoint: 'http://localhost:8000',
  });
} else {
  dynamoDbClient = new AWS.DynamoDB.DocumentClient();
}

module.exports.handler = serverless(createApp(dynamoDbClient));
