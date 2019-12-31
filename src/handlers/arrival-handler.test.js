const httpErrors = require('http-errors');
const { errors } = require('../constants');
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
      send: jest.fn(),
      sendStatus: jest.fn(),
    };

    validBody = {
      captain: 'bob',
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
    arrivalHandler(mockRequest, mockResponseObject);
    expect(mockResponseObject.sendStatus).toHaveBeenCalledWith(200);
  });

  it('should send a BadRequest error when there is no body', () => {
    arrivalHandler({}, mockResponseObject);
    const [error] = mockResponseObject.send.mock.calls[0];
    expect(error).toBeInstanceOf(httpErrors.BadRequest);
    expect(error.message).toBe(errors.REQUEST_MISSING_BODY);
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
    expect(error.message).toBe(errors.REQUEST_INVALID_BODY);
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
    expect(error.message).toBe(errors.REQUEST_INVALID_BODY);
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
    expect(error.message).toBe(errors.REQUEST_INVALID_BODY);
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
    expect(error.message).toBe(errors.REQUEST_INVALID_DATETIME);
  });

  it('should convert the date string to a number in the dymano params', () => {
    const mockRequest = {
      body: validBody,
    };
    arrivalHandler(mockRequest, mockResponseObject);
    const [params] = mockDynamoDbClient.put.mock.calls[0];
    expect(mockDynamoDbClient.put).toHaveBeenCalled();
    expect(typeof params.Item.DATETIME).toBe('number');
  });
});
