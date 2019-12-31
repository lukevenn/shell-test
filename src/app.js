const express = require('express');
const AWS = require('aws-sdk');
const { getArrivalHandler } = require('./handlers/arrival-handler');
const { getHistoryHandler } = require('./handlers/history-handler');

const dynamoDbClient = new AWS.DynamoDB.DocumentClient();

const app = express();

app.use(express.json());

app.post('/arrival', getArrivalHandler(dynamoDbClient));
app.get('/history/:nameKey', getHistoryHandler(dynamoDbClient));
