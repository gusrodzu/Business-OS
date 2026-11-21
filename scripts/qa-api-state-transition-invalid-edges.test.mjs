import assert from 'node:assert/strict';
import test from 'node:test';
import {assertTransition, InvalidStateTransitionError, STATE_MACHINES} from '../apps/api/src/services/stateTransitions.js';

// Exhaustively cover non-terminal invalid edges, not only terminal states.
for (const [entity, map] of Object.entries(STATE_MACHINES)) {
  test(`${entity}: disallowed transitions return the configured HTTP 409 contract`, () => {
    const states = Object.keys(map);
    for (const [from, allowed] of Object.entries(map)) {
      for (const to of states) {
        if (from === to || allowed.includes(to)) continue;
        assert.throws(
          () => assertTransition({entity, from, to, map}),
          (error) => {
            assert.ok(error instanceof InvalidStateTransitionError);
            assert.equal(error.code, 'INVALID_STATE_TRANSITION');
            assert.equal(error.statusCode, 409);
            assert.equal(error.expose, true);
            assert.equal(error.from, from);
            assert.equal(error.to, to);
            assert.deepEqual(error.allowed, allowed);
            return true;
          },
          `${entity}: ${from} -> ${to} must be rejected`,
        );
      }
    }
  });
}
