import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {Writable} from 'node:stream';
import {test} from 'node:test';
import {createHttpLogger} from '../apps/api/src/lib/httpLogger.js';

test('Pino HTTP logs retain request correlation but exclude auth and URL secrets', async () => {
  const lines = [];
  const stream = new Writable({
    write(chunk, _encoding, callback) {
      lines.push(String(chunk));
      callback();
    },
  });
  const middleware = createHttpLogger(stream);
  const server = createServer((request, response) => {
    request.id = 'req-security-20261024';
    middleware(request, response);
    request.log.info('business-request');
    response.setHeader('Set-Cookie', 'bb_erp_session=SHOULD_NOT_APPEAR; HttpOnly');
    response.statusCode = 202;
    response.end('ok');
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  try {
    const port = server.address().port;
    const result = await fetch(`http://127.0.0.1:${port}/api/ventas?access_token=QUERY_SECRET_2026&password=PASS_SECRET`, {
      headers: {
        authorization: 'Bearer AUTH_SECRET_2026',
        cookie: 'bb_erp_session=COOKIE_SECRET_2026',
        'x-api-key': 'APIKEY_SECRET_2026',
      },
    });
    assert.equal(result.status, 202);
    await new Promise(resolve => setImmediate(resolve));
    const output = lines.join('');
    assert.ok(output.includes('business-request'), 'Request-scoped logger still works');
    assert.ok(output.includes('req-security-20261024'), 'Request ID remains available');
    assert.ok(output.includes('/api/ventas'), 'Path remains useful');
    for (const secret of [
      'AUTH_SECRET_2026','COOKIE_SECRET_2026','APIKEY_SECRET_2026',
      'QUERY_SECRET_2026','PASS_SECRET','SHOULD_NOT_APPEAR','access_token=',
    ]) {
      assert.ok(!output.includes(secret), 'Sensitive HTTP metadata leaked: ' + secret);
    }
    const entries = output.trim().split('\n').filter(Boolean).map(line => JSON.parse(line));
    assert.ok(entries.some(item => item.res?.statusCode === 202), 'Completed request retains status');
    assert.ok(entries.some(item => item.req?.url === '/api/ventas'), 'Logged request URL excludes query');
    assert.ok(entries.every(item => !item.req?.headers && !item.res?.headers), 'Headers must be omitted entirely');
  } finally {
    await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  }
});
