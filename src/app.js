const express = require('express');
const { getArrivalHandler } = require('./handlers/arrival-handler');
const { getHistoryHandler } = require('./handlers/history-handler');

const createApp = (dynamoDbClient) => {
  const app = express();

  app.use(express.json());

  app.post('/arrival', getArrivalHandler(dynamoDbClient));
  app.get('/history/:nameKey', getHistoryHandler(dynamoDbClient));

  return app;
};

module.exports = {
  createApp,
};
