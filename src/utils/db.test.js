/* eslint-disable global-require */
describe('db', () => {
  const TABLE_NAME = 'test-table';
  const originalEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      TABLE_NAME,
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('putArrival', () => {
    it('should generate the expected payload', () => {
      const { putArrival } = require('./db');
      const params = {
        captain: 'Boat Captain',
        datetime: 123,
        vessel: 'My Boat',
        port: 'A Port',
      };

      expect(putArrival(params)).toEqual({
        TableName: TABLE_NAME,
        Item: {
          ...params,
          nameKey: 'boat+captain',
        },
      });
    });
  });

  describe('queryTrips', () => {
    it('should generate the expected payload', () => {
      const { queryTrips } = require('./db');
      const nameKey = 'boat+captain';
      expect(queryTrips(nameKey)).toEqual({
        TableName: TABLE_NAME,
        ExpressionAttributeValues: {
          ':nk': nameKey,
        },
        KeyConditionExpression: 'nameKey = :nk',
      });
    });
  });
});
