/* eslint-disable global-require */
describe('db', () => {
  const ARRIVALS_TABLE = 'test-table';
  const originalEnv = process.env;
  beforeEach(() => {
    jest.resetModules();
    process.env = {
      ...originalEnv,
      ARRIVALS_TABLE,
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
        TableName: ARRIVALS_TABLE,
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
        TableName: ARRIVALS_TABLE,
        ExpressionAttributeValues: {
          ':nk': nameKey,
        },
        KeyConditionExpression: 'nameKey = :nk',
      });
    });
  });
});
