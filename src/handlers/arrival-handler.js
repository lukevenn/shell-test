const moment = require('moment');
const httpErrors = require('http-errors');
const { errors } = require('../constants');

const getArrivalHandler = (dynamoDbClient) => (req, res) => {
  const { body } = req;
  if (!body) {
    // this should never happen
    res.send(new httpErrors.BadRequest(errors.REQUEST_MISSING_BODY));
    return;
  }

  const expectedKeys = ['captain', 'datetime', 'port', 'vessel'];
  const validKeys = Object.keys(body).sort().join(',') === expectedKeys.join(',');
  const validValueTypes = Object.values(body).every((val) => typeof val === 'string' && val.length > 0);

  if (!validKeys || !validValueTypes) {
    res.send(new httpErrors.BadRequest(errors.REQUEST_INVALID_BODY));
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
    res.send(new httpErrors.BadRequest(errors.REQUEST_INVALID_DATETIME));
    return;
  }

  dynamoDbClient.put({
    TableName: process.env.TABLE_NAME,
    Item: {
      captain,
      datetime: convertedDateTime.valueOf(),
      port,
      vessel,
    },
  }, (error) => {
    if (error) {
      res.send(new httpErrors.BadRequest(errors.DB_PUT_FAIL));
      return;
    }
    res.sendStatus(200);
  });
};

module.exports = {
  getArrivalHandler,
};
