const httpErrors = require('http-errors');
const {
  REQUEST_MISSING_BODY,
  REQUEST_INVALID_BODY,
  REQUEST_INVALID_DATETIME,
  DB_PUT_FAIL,
} = require('../constants');
const { getArrivalHandler } = require('./arrival-handler');

describe('arrivalHandler', () => {
  let mockDynamoDbClient;
  let mockResponseObject;
  let validBody;
  let arrivalHandler;

  beforeEach(() => {
    mockDynamoDbClient = {
      put: jest.fn(),
    };

    mockResponseObject = {
      status: jest.fn(() => mockResponseObject),
      send: jest.fn(() => mockResponseObject),
      sendStatus: jest.fn(() => mockResponseObject),
    };

    validBody = {
      captain: 'Boat Captain',
      vessel: 'boaty',
      port: 'newport',
      datetime: '5th of Feb 2056',
    };
    arrivalHandler = getArrivalHandler(mockDynamoDbClient);
  });

  it('should return a 200 response if all ok', () => {
    const mockRequest = {
      body: validBody,
    };
    mockDynamoDbClient.put.mockImplementationOnce((_, callback) => callback());
    arrivalHandler(mockRequest, mockResponseObject);
    expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should send a BadRequest error when there is no body', () => {
    arrivalHandler({}, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(REQUEST_MISSING_BODY);
  });

  it('should send a BadRequest error when the body is missing keys', () => {
    const mockRequest = {
      body: {
        datetime: '5th of Feb 2056',
      },
    };

    arrivalHandler(mockRequest, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(REQUEST_INVALID_BODY);
  });

  it('should send a BadRequest error when the body has extra keys', () => {
    const mockRequest = {
      body: {
        ...validBody,
        anotherDatetime: '5th of Feb 2056',
      },
    };

    arrivalHandler(mockRequest, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(REQUEST_INVALID_BODY);
  });

  it('should send a BadRequest error when the body has invalid data types', () => {
    const mockRequest = {
      body: {
        ...validBody,
        datetime: 1234,
      },
    };

    arrivalHandler(mockRequest, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(REQUEST_INVALID_BODY);
  });

  it('should send a BadRequest error when an invalid date is passed', () => {
    const mockRequest = {
      body: {
        captain: 'bob',
        vessel: 'boaty',
        port: 'newport',
        datetime: 'not a valid date',
      },
    };

    arrivalHandler(mockRequest, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(REQUEST_INVALID_DATETIME);
  });

  it('should convert the date string to a number in the dymano params', () => {
    const mockRequest = {
      body: validBody,
    };
    arrivalHandler(mockRequest, mockResponseObject);
    const [params] = mockDynamoDbClient.put.mock.calls[0];
    expect(mockDynamoDbClient.put).toHaveBeenCalled();
    expect(typeof params.Item.datetime).toBe('number');
  });

  it('should create a normalised key for a captain', () => {
    const mockRequest = {
      body: validBody,
    };
    arrivalHandler(mockRequest, mockResponseObject);
    const [params] = mockDynamoDbClient.put.mock.calls[0];
    expect(mockDynamoDbClient.put).toHaveBeenCalled();
    expect(params.Item.nameKey).toBe('boat+captain');
  });

  it('should send a BadRequest error when the DB put fails', () => {
    mockDynamoDbClient.put.mockImplementationOnce((_, callback) => callback('error'));
    const mockRequest = {
      body: validBody,
    };
    arrivalHandler(mockRequest, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(DB_PUT_FAIL);
  });
});
