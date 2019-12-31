const moment = require('moment');
const httpErrors = require('http-errors');
const { errors } = require('../constants');

const getArrivalHandler = (dynamoDbClient) => (req, res) => {
  const { body } = req;
  if (!body) {
    // this should never happen
    return res.send(new httpErrors.BadRequest(errors.REQUEST_MISSING_BODY));
  }

  const expectedKeys = ['captain', 'datetime', 'port', 'vessel'];
  const validKeys = Object.keys(body).sort().join(',') === expectedKeys.join(',');
  const validValueTypes = Object.values(body).every((val) => typeof val === 'string' && val.length > 0);

  if (!validKeys || !validValueTypes) {
    return res.send(new httpErrors.BadRequest(errors.REQUEST_INVALID_BODY));
  }

  const {
    datetime,
    vessel,
    port,
    captain,
  } = body;

  const convertedDateTime = moment(datetime, 'Do of MMM YYYY');
  if (!convertedDateTime.isValid()) {
    return res.send(new httpErrors.BadRequest(errors.REQUEST_INVALID_DATETIME));
  }

  dynamoDbClient.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      CAPTAIN: captain,
      DATETIME: convertedDateTime.valueOf(),
      PORT: port,
      VESSEL: vessel,
    },
  });

  return res.sendStatus(200);
};

module.exports = {
  getArrivalHandler,
};
