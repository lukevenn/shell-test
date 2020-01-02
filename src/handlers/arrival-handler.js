const moment = require('moment');
const httpErrors = require('http-errors');
const {
  REQUEST_MISSING_BODY,
  REQUEST_INVALID_BODY,
  REQUEST_INVALID_DATETIME,
  DB_PUT_FAIL,
} = require('../constants');
const { putArrival } = require('../utils/db');

const getArrivalHandler = (dynamoDbClient) => (req, res) => {
  const { body } = req;
  if (!body) {
    // this should never happen
    res.send(new httpErrors.BadRequest(REQUEST_MISSING_BODY));
    return;
  }

  const expectedKeys = ['captain', 'datetime', 'port', 'vessel'];
  const validKeys = Object.keys(body).sort().join(',') === expectedKeys.join(',');
  const validValueTypes = Object.values(body).every((val) => typeof val === 'string' && val.length > 0);

  if (!validKeys || !validValueTypes) {
    res.send(new httpErrors.BadRequest(REQUEST_INVALID_BODY));
    return;
  }

  const {
    datetime,
    vessel,
    port,
    captain,
  } = body;

  const convertedDateTime = moment(datetime, 'Do of MMM YYYY');
  if (!convertedDateTime.isValid()) {
    res.send(new httpErrors.BadRequest(REQUEST_INVALID_DATETIME));
    return;
  }

  const params = putArrival({
    captain,
    datetime: convertedDateTime.valueOf(),
    port,
    vessel,
  });

  dynamoDbClient.put(params, (error) => {
    if (error) {
      res.send(new httpErrors.BadRequest(DB_PUT_FAIL));
      console.log(error); // eslint-disable-line no-console
      return;
    }
    res.sendStatus(200);
  });
};

module.exports = {
  getArrivalHandler,
};
