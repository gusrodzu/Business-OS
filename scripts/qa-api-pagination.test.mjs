import assert from 'node:assert/strict';
import test from 'node:test';
import {paginationFromQuery,pageMeta} from '../apps/api/src/lib/pagination.js';

test('pagination defaults and conventional numeric strings',()=>{
  assert.deepEqual(paginationFromQuery({}),{page:1,pageSize:50,skip:0,take:50});
  assert.deepEqual(paginationFromQuery({page:'3',pageSize:'20'}),{page:3,pageSize:20,skip:40,take:20});
  assert.deepEqual(paginationFromQuery({page:'2',pageSize:'999'}),{page:2,pageSize:250,skip:250,take:250});
});

test('pagination ignores malformed, partial, negative and unsafe values',()=>{
  for(const invalid of ['2abc','1e3','1.5','-2','0','Infinity','9007199254740992',{},['2'],null]){
    assert.equal(paginationFromQuery({page:invalid}).page,1);
    assert.equal(paginationFromQuery({pageSize:invalid}).pageSize,50);
  }
});

test('pagination bounds offset to safe integers',()=>{
  const result=paginationFromQuery({page:String(Number.MAX_SAFE_INTEGER),pageSize:'250'});
  assert.ok(Number.isSafeInteger(result.skip));
  assert.ok(result.skip>=0);
  assert.ok(result.skip+result.take<=Number.MAX_SAFE_INTEGER);
});

test('page metadata preserves existing contract',()=>{
  assert.deepEqual(pageMeta({page:2,pageSize:10,total:25}),{
    page:2,pageSize:10,total:25,pages:3,hasNext:true,hasPrevious:true
  });
});
