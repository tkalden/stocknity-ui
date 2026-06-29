/**
 * Verifies the single axios instance fires the registered onUnauthorized
 * callback when a response rejects with HTTP 401 (and not for other errors).
 */
export {};

// Capture the interceptor handlers that api.ts registers at import time.
const captured: {
  responseFulfilled?: (r: any) => any;
  responseRejected?: (e: any) => any;
} = {};

jest.mock('axios', () => {
  const instance = {
    interceptors: {
      request: { use: jest.fn() },
      response: {
        use: jest.fn((fulfilled: any, rejected: any) => {
          captured.responseFulfilled = fulfilled;
          captured.responseRejected = rejected;
        }),
      },
    },
    request: jest.fn(),
  };
  return {
    __esModule: true,
    default: { create: jest.fn(() => instance) },
    create: jest.fn(() => instance),
  };
});

// Import after the mock is in place so the interceptors register on the fake instance.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setOnUnauthorized } = require('./api');

describe('api 401 -> onUnauthorized', () => {
  afterEach(() => setOnUnauthorized(null));

  test('calls the registered handler on a 401 response and re-rejects', async () => {
    const handler = jest.fn();
    setOnUnauthorized(handler);

    const error = { response: { status: 401 } };
    await expect(captured.responseRejected!(error)).rejects.toBe(error);
    expect(handler).toHaveBeenCalledTimes(1);
  });

  test('does not call the handler for non-401 errors', async () => {
    const handler = jest.fn();
    setOnUnauthorized(handler);

    const error = { response: { status: 500 } };
    await expect(captured.responseRejected!(error)).rejects.toBe(error);
    expect(handler).not.toHaveBeenCalled();
  });

  test('does not throw when no handler is registered', async () => {
    setOnUnauthorized(null);
    const error = { response: { status: 401 } };
    await expect(captured.responseRejected!(error)).rejects.toBe(error);
  });
});
