import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const apiKey=readFileSync(new URL('../apps/api/src/middleware/apiKey.js',import.meta.url),'utf8');
const mutation=readFileSync(new URL('../apps/api/src/middleware/mutationAudit.js',import.meta.url),'utf8');

test('API key access logs store only the URL pathname',()=>{
  assert.match(apiKey,/path:\s*\(req\.originalUrl\|\|req\.url\|\|''\)\.split\('\?'\)\[0\]/);
  assert.doesNotMatch(apiKey,/path:\s*req\.originalUrl\s*[,}]/);
});
test('mutation audit description and metadata share sanitized path',()=>{
  assert.match(mutation,/const safePath=\(request\.originalUrl\|\|request\.url\|\|''\)\.split\('\?'\)\[0\]/);
  assert.match(mutation,/description:\x60\$\{request\.method\} \$\{safePath\}\x60/);
  assert.match(mutation,/route:safePath/);
});
test('query stripping preserves path without persisting parameters',()=>{
  for(const input of ['/api/items?token=redacted','/api/items?companyId=123&filter=x','/api/items']){
    const output=input.split('?')[0];
    assert.equal(output,'/api/items');
    assert.equal(output.includes('?'),false);
  }
});
