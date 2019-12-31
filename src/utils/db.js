const TableName = process.env.TABLE_NAME;

const putArrival = ({
  captain,
  datetime,
  port,
  vessel,
}) => ({
  TableName,
  Item: {
    nameKey: captain.replace(/\s/g, '+').toLowerCase(),
    captain,
    datetime,
    port,
    vessel,
  },
});

const queryTrips = (nameKey) => ({
  TableName,
  ExpressionAttributeValues: {
    ':nk': nameKey,
  },
  KeyConditionExpression: 'nameKey = :nk',
});

module.exports = {
  queryTrips,
  putArrival,
};
