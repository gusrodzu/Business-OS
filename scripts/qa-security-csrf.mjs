import assert from 'node:assert/strict';
import {after, before, test} from 'node:test';
import {cookieCsrfOriginGuard} from '../apps/api/src/middleware/csrfOrigin.js';

const originalClientUrl = process.env.CLIENT_URL;
before(() => { process.env.CLIENT_URL = 'https://erp.example.test,https://staff.example.test'; });
after(() => {
  if (originalClientUrl === undefined) delete process.env.CLIENT_URL;
  else process.env.CLIENT_URL = originalClientUrl;
});

function run({method = 'POST', origin, cookie, authorization, apiKey} = {}) {
  let nextCalled = false;
  const request = {
    method,
    id: 'security-qa',
    headers: {
      ...(origin === undefined ? {} : {origin}),
      ...(cookie === undefined ? {} : {cookie}),
      ...(authorization === undefined ? {} : {authorization}),
      ...(apiKey === undefined ? {} : {'x-api-key': apiKey}),
    },
  };
  const response = {
    statusCode: 200,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
  cookieCsrfOriginGuard(request, response, () => { nextCalled = true; });
  return {response, nextCalled};
}
const sessionCookie = 'bb_erp_session=synthetic_test_session';
const platformCookie = 'bb_platform_session=synthetic_test_session';

test('public and cookie-free API requests do not require browser Origin', () => {
  assert.equal(run({}).nextCalled, true);
  assert.equal(run({authorization:'Bearer bb_live_serverkey'}).nextCalled, true);
  assert.equal(run({apiKey:'synthetic-service-key'}).nextCalled, true);
});
test('safe methods remain available with session cookies', () => {
  for (const method of ['GET','HEAD','OPTIONS']) {
    assert.equal(run({method,cookie:sessionCookie}).nextCalled,true);
  }
});
test('cookie mutations require an exact whitelisted Origin', () => {
  for (const cookie of [sessionCookie,platformCookie]) {
    for (const origin of ['https://erp.example.test','https://staff.example.test']) {
      assert.equal(run({cookie,origin}).nextCalled,true);
    }
    for (const origin of [undefined,'','https://evil.example.test','https://erp.example.test.attacker.net','http://erp.example.test']) {
      const result = run({cookie,origin});
      assert.equal(result.nextCalled,false);
      assert.equal(result.response.statusCode,403);
      assert.equal(result.response.body.code,'CSRF_ORIGIN_DENIED');
    }
  }
});
test('unverified API key and Bearer headers cannot bypass cookie CSRF protection', () => {
  for (const extra of [{apiKey:'forged'}, {authorization:'Bearer bb_live_forged'}, {authorization:'Bearer synthetic'}]) {
    const result = run({cookie:sessionCookie,origin:'https://evil.example.test',...extra});
    assert.equal(result.nextCalled,false);
    assert.equal(result.response.statusCode,403);
  }
});
test('no cookie session still permits service-to-service requests without Origin', () => {
  assert.equal(run({authorization:'Bearer bb_live_test',method:'PATCH'}).nextCalled,true);
  assert.equal(run({apiKey:'synthetic',method:'DELETE'}).nextCalled,true);
});
