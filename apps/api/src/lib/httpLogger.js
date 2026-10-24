import pinoHttp from 'pino-http';

// Keep HTTP telemetry useful while excluding cookies, credentials, query parameters
// and Set-Cookie response headers from both request-bound and completion logs.
export function createHttpLogger(stream) {
  return pinoHttp({
    wrapSerializers: false,
    serializers: {
      req(request) {
        return {
          id: request.id ?? null,
          method: request.method || null,
          url: String(request.url || '').split(/[?#]/, 1)[0],
        };
      },
      res(response) {
        return {statusCode: response.statusCode ?? null};
      },
    },
  }, stream);
}
