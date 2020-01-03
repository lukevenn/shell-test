const httpErrors = require('http-errors');
const { getHistoryHandler, createResponseBody } = require('./history-handler');
const {
  REQUEST_INVALID_NAME,
  DB_QUERY_FAIL,
  DB_NO_RESULTS,
} = require('../constants');

const normaliseKeys = (arr) => arr.sort().join(',');

describe('historyHandler', () => {
  let mockDynamoDbClient;
  let mockResponseObject;
  let historyHandler;

  beforeEach(() => {
    mockDynamoDbClient = {
      query: jest.fn(),
    };

    mockResponseObject = {
      status: jest.fn(() => mockResponseObject),
      send: jest.fn(() => mockResponseObject),
      json: jest.fn(() => mockResponseObject),
    };

    historyHandler = getHistoryHandler(mockDynamoDbClient);
  });

  it('should send a BadRequest error if there is no captain name passed', () => {
    const mockRequest = { params: {} };

    historyHandler(mockRequest, mockResponseObject);

    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(REQUEST_INVALID_NAME);
  });

  it('should send a FailedDependency error when the db query fails', () => {
    mockDynamoDbClient.query.mockImplementationOnce((_, callback) => callback('error'));
    const mockRequest = { params: { nameKey: 'boat+captain' } };

    historyHandler(mockRequest, mockResponseObject);

    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.FailedDependency);
    expect(error.message).toBe(DB_QUERY_FAIL);
  });

  it('should send a NotFound error when no results are returned', () => {
    mockDynamoDbClient.query.mockImplementationOnce((_, callback) => (
      callback(undefined, { Items: [] })
    ));
    const mockRequest = { params: { nameKey: 'boat+captain' } };

    historyHandler(mockRequest, mockResponseObject);

    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.NotFound);
    expect(error.message).toBe(DB_NO_RESULTS);
  });

  it('should return the result as JSON', () => {
    const nameKey = 'boat+captain';
    const captain = 'Boat Captain';
    const vessel = 'My Boat';
    const baseData = {
      nameKey,
      captain,
      vessel,
    };

    const testItems = [
      {
        ...baseData,
        port: 'a',
        datetime: 1,
      },
      {
        ...baseData,
        port: 'b',
        datetime: 2,
      },
    ];

    mockDynamoDbClient.query.mockImplementationOnce((_, callback) => (
      callback(undefined, { Items: testItems })
    ));
    const mockRequest = { params: { nameKey: 'boat+captain' } };

    historyHandler(mockRequest, mockResponseObject);

    expect(mockResponseObject.json).toHaveBeenCalled();
  });
});

describe('createResponseBody', () => {
  const nameKey = 'boat+captain';
  const captain = 'Boat Captain';
  const vessel = 'My Boat';
  const baseData = {
    nameKey,
    captain,
    vessel,
  };

  const testArrivals = [
    {
      ...baseData,
      port: 'a',
      datetime: 1,
    },
    {
      ...baseData,
      port: 'c',
      datetime: 3,
    },
    {
      ...baseData,
      port: 'b',
      datetime: 2,
    },
  ];
  it('should return the expected format of data', () => {
    const responseBody = createResponseBody(testArrivals);
    expect(normaliseKeys(Object.keys(responseBody))).toEqual(normaliseKeys(['captainName', 'trips']));
    expect(typeof responseBody.captainName).toBe('string');
    expect(Array.isArray(responseBody.trips)).toBe(true);
  });

  it('should return the trips in the expected order and format', () => {
    const { trips } = createResponseBody(testArrivals);
    expect(trips).toHaveLength(2);
    expect(trips[0]).toEqual({
      vessel,
      from: 'a',
      to: 'b',
      fromDate: 1,
      toDate: 2,
    });
  });
});
