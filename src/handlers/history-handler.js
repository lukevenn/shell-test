const httpErrors = require('http-errors');
const {
  REQUEST_INVALID_NAME,
  DB_QUERY_FAIL,
  DB_NO_RESULTS,
} = require('../constants');
const { queryTrips } = require('../utils/db');

const calculateTrips = (items) => (
  items
    .sort((a, b) => a.datetime - b.datetime)
    .map((next, i, arr) => {
      const prev = arr[i - 1] || {};
      return {
        vessel: next.vessel,
        from: prev.port,
        to: next.port,
        fromDate: prev.datetime,
        toDate: next.datetime,
      };
    })
    .filter((trip) => Boolean(trip.from))
);

const createResponseBody = (items) => {
  const { captain: captainName } = items[0];
  return {
    captainName,
    trips: calculateTrips(items),
  };
};

const getHistoryHandler = (dynamoDbClient) => (req, res) => {
  const { nameKey } = req.params;
  if (!nameKey) {
    res.send(new httpErrors.BadRequest(REQUEST_INVALID_NAME));
    return;
  }

  const params = queryTrips(nameKey);

  dynamoDbClient.query(params, (error, data = {}) => {
    if (error) {
      res.send(new httpErrors.FailedDependency(DB_QUERY_FAIL));
      console.log(error); // eslint-disable-line no-console
      return;
    }
    const { Items: items } = data;

    if (!items || !items.length) {
      res.send(new httpErrors.NotFound(DB_NO_RESULTS));
      return;
    }
    const responseBody = createResponseBody(items);
    res.status(200).json(responseBody);
  });
};

module.exports = {
  getHistoryHandler,
  createResponseBody,
};
