const express = require('express');
const { getArrivalHandler } = require('./handlers/arrival-handler');
const { getHistoryHandler } = require('./handlers/history-handler');

const createApp = (dynamoDbClient) => {
  const app = express();

  app.use(express.json());

  app.all('/', (req, res) => res.send('hello world'));
  app.post('/arrival', getArrivalHandler(dynamoDbClient));
  app.get('/history/:nameKey', getHistoryHandler(dynamoDbClient));

  return app;
};

module.exports = {
  createApp,
};
