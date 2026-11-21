import assert from 'node:assert/strict';
import test from 'node:test';
import {assertTransition,InvalidStateTransitionError,STATE_MACHINES} from '../apps/api/src/services/stateTransitions.js';

for(const [entity,map] of Object.entries(STATE_MACHINES)){
  test(`${entity}: every declared transition is accepted`,()=>{
    for(const [from,targets] of Object.entries(map)){
      for(const to of targets){
        assert.equal(assertTransition({entity,from,to,map}),true,`${from} -> ${to}`);
      }
    }
  });
  test(`${entity}: terminal states reject transitions back to draft or pending`,()=>{
    for(const [from,targets] of Object.entries(map)){
      if(targets.length!==0)continue;
      for(const to of Object.keys(map)){
        if(to===from)continue;
        assert.throws(()=>assertTransition({entity,from,to,map}),error=>{
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code,'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode,409);
          assert.equal(error.from,from);
          assert.equal(error.to,to);
          assert.deepEqual(error.allowed,[]);
          return true;
        });
      }
    }
  });
}

test('same-state retries are idempotent for recognized states',()=>{
  for(const [entity,map] of Object.entries(STATE_MACHINES)){
    for(const from of Object.keys(map)){
      assert.equal(assertTransition({entity,from,to:from,map}),true);
    }
  }
});

test('invalid transition reports only configured allowed destinations',()=>{
  assert.throws(()=>assertTransition({entity:'PURCHASE_ORDER',from:'DRAFT',to:'RECEIVED',map:STATE_MACHINES.PURCHASE_ORDER}),error=>{
    assert.ok(error instanceof InvalidStateTransitionError);
    assert.deepEqual(error.allowed,['ISSUED','CANCELLED']);
    assert.equal(error.expose,true);
    return true;
  });
});
