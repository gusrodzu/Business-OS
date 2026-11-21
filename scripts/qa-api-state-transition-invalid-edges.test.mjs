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

test('unknown source states cannot transition into a known state', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    const target = Object.keys(map)[0];
    assert.throws(
      () => assertTransition({entity, from: 'UNKNOWN_STATE', to: target, map}),
      (error) => {
        assert.ok(error instanceof InvalidStateTransitionError);
        assert.equal(error.statusCode, 409);
        assert.deepEqual(error.allowed, []);
        return true;
      },
    );
  }
});

test('unknown target states are rejected from every recognized source', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    for (const [from, allowed] of Object.entries(map)) {
      assert.throws(
        () => assertTransition({entity, from, to: 'UNKNOWN_TARGET', map}),
        (error) => {
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code, 'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode, 409);
          assert.equal(error.expose, true);
          assert.equal(error.from, from);
          assert.equal(error.to, 'UNKNOWN_TARGET');
          assert.deepEqual(error.allowed, allowed);
          return true;
        },
        `${entity}: ${from} -> UNKNOWN_TARGET must be rejected`,
      );
    }
  }
});

test('state machine definitions contain only known unique destinations', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    const known = new Set(Object.keys(map));
    assert.ok(known.size > 0, `${entity}: at least one state required`);
    for (const [from, targets] of Object.entries(map)) {
      assert.ok(Array.isArray(targets), `${entity}: ${from} destinations must be an array`);
      assert.equal(new Set(targets).size, targets.length, `${entity}: ${from} has duplicate destinations`);
      for (const to of targets) {
        assert.ok(known.has(to), `${entity}: ${from} references unknown destination ${to}`);
        assert.notEqual(to, from, `${entity}: ${from} must not declare redundant self-transition`);
      }
    }
  }
});

test('malformed target values are rejected without changing allowed destinations', () => {
  const invalidTargets = [null, undefined, '', 0, false, {}, []];
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    for (const [from, allowed] of Object.entries(map)) {
      for (const to of invalidTargets) {
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
          `${entity}: malformed target must be rejected from ${from}`,
        );
      }
    }
  }
});
