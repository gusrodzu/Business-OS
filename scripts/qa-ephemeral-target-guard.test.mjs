import assert from 'node:assert/strict';
import test from 'node:test';
import {assertEphemeralQaTarget} from './qa-ephemeral-api.mjs';

const keys=['ERP_QA_EPHEMERAL_DB','DATABASE_URL','API_URL','JWT_SECRET'];
const valid={
  ERP_QA_EPHEMERAL_DB:'1',
  DATABASE_URL:'postgresql://qa@127.0.0.1:5432/erpqa',
  API_URL:'http://127.0.0.1:3000/api',
  JWT_SECRET:'qa-only-regression-placeholder',
};

function withEnvironment(overrides,check){
  const original=Object.fromEntries(keys.map(key=>[key,process.env[key]]));
  try {
    for(const key of keys){
      const value={...valid,...overrides}[key];
      if(value===undefined)delete process.env[key];
      else process.env[key]=value;
    }
    check();
  } finally {
    for(const key of keys){
      if(original[key]===undefined)delete process.env[key];
      else process.env[key]=original[key];
    }
  }
}

test('ephemeral QA guard accepts only explicitly opted-in local fixtures',()=>{
  withEnvironment({},()=>assert.doesNotThrow(assertEphemeralQaTarget));
  withEnvironment({DATABASE_URL:'postgres://qa@localhost:5432/erpqa',API_URL:'http://localhost:3000/api/'},
    ()=>assert.doesNotThrow(assertEphemeralQaTarget));
});

test('ephemeral QA guard rejects unsafe targets before any API or database use',()=>{
  const cases=[
    {ERP_QA_EPHEMERAL_DB:undefined},
    {ERP_QA_EPHEMERAL_DB:'0'},
    {DATABASE_URL:undefined},
    {DATABASE_URL:'postgresql://qa@db.example.invalid:5432/erpqa'},
    {DATABASE_URL:'postgresql://qa@127.0.0.1:5432/erp_cliente'},
    {DATABASE_URL:'postgresql://qa@127.0.0.2:5432/erpqa'},
    {API_URL:undefined},
    {API_URL:'https://127.0.0.1:3000/api'},
    {API_URL:'http://api.example.invalid/api'},
    {API_URL:'http://127.0.0.1:3000/admin'},
    {JWT_SECRET:undefined},
    {JWT_SECRET:'production-placeholder'},
  ];
  for(const overrides of cases){
    withEnvironment(overrides,()=>assert.throws(assertEphemeralQaTarget,Error,
      `Expected QA guard to reject ${Object.keys(overrides).join(', ')}`));
  }
});
