import assert from 'node:assert/strict';
import test from 'node:test';
import {assertTransition, InvalidStateTransitionError, STATE_MACHINES} from '../apps/api/src/services/stateTransitions.js';

// A missing machine must never silently accept a same-state retry.
test('missing state-machine definitions fail closed with HTTP 409', () => {
  for (const map of [null, undefined, {}]) {
    assert.throws(
      () => assertTransition({entity: 'PURCHASE_ORDER', from: 'DRAFT', to: 'DRAFT', map}),
      error => {
        assert.ok(error instanceof InvalidStateTransitionError);
        assert.equal(error.code, 'INVALID_STATE_TRANSITION');
        assert.equal(error.statusCode, 409);
        assert.deepEqual(error.allowed, []);
        return true;
      },
    );
  }
});

test('rejected transitions do not mutate shared state-machine definitions', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    const snapshot = structuredClone(map);
    const from = Object.keys(map)[0];
    assert.throws(
      () => assertTransition({entity, from, to: 'UNKNOWN_TARGET', map}),
      error => error instanceof InvalidStateTransitionError && error.statusCode === 409,
    );
    assert.deepEqual(map, snapshot, `${entity}: transition validation must be read-only`);
    assert.equal(assertTransition({entity, from, to: from, map}), true);
  }
});
