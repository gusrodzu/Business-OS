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

test('unknown same-state retries are rejected rather than treated as idempotent', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    assert.throws(
      () => assertTransition({entity, from: 'UNKNOWN_STATE', to: 'UNKNOWN_STATE', map}),
      (error) => {
        assert.ok(error instanceof InvalidStateTransitionError);
        assert.equal(error.code, 'INVALID_STATE_TRANSITION');
        assert.equal(error.statusCode, 409);
        assert.equal(error.expose, true);
        assert.deepEqual(error.allowed, []);
        return true;
      },
      `${entity}: unknown self-transition must fail`,
    );
  }
});

test('inherited Object prototype names are not valid state-machine states', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    for (const inherited of ['toString', 'constructor', 'hasOwnProperty', '__proto__', 'valueOf', 'isPrototypeOf']) {
      assert.throws(
        () => assertTransition({entity, from: inherited, to: inherited, map}),
        (error) => {
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code, 'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode, 409);
          assert.deepEqual(error.allowed, []);
          return true;
        },
        `${entity}: inherited key ${inherited} must not be a valid state`,
      );
    }
    for (const known of Object.keys(map)) {
      assert.equal(assertTransition({entity, from: known, to: known, map}), true);
    }
  }
});

test('inherited prototype source keys reject transitions with HTTP 409, not TypeError', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    for (const from of ['toString', 'constructor', 'hasOwnProperty', '__proto__', 'valueOf', 'isPrototypeOf']) {
      const to = Object.keys(map)[0];
      assert.throws(
        () => assertTransition({entity, from, to, map}),
        (error) => {
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code, 'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode, 409);
          assert.equal(error.expose, true);
          assert.deepEqual(error.allowed, []);
          return true;
        },
        `${entity}: inherited source ${from} must return the contract error`,
      );
    }
  }
});

test('malformed source values reject known destinations with the HTTP 409 contract', () => {
  const malformedSources = [null, undefined, '', 0, false, {}, []];
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    const to = Object.keys(map)[0];
    for (const from of malformedSources) {
      assert.throws(
        () => assertTransition({entity, from, to, map}),
        (error) => {
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code, 'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode, 409);
          assert.equal(error.expose, true);
          assert.equal(error.from, from);
          assert.equal(error.to, to);
          assert.deepEqual(error.allowed, []);
          return true;
        },
        `${entity}: malformed source must reject transition to ${to}`,
      );
    }
  }
});

test('symbol-valued source and target preserve the HTTP 409 transition contract', () => {
  for (const [entity, map] of Object.entries(STATE_MACHINES)) {
    const known = Object.keys(map)[0];
    const symbol = Symbol('invalid-state');
    for (const [from, to] of [[symbol, known], [known, symbol], [symbol, symbol]]) {
      assert.throws(
        () => assertTransition({entity, from, to, map}),
        (error) => {
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code, 'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode, 409);
          assert.equal(error.expose, true);
          assert.equal(error.from, from);
          assert.equal(error.to, to);
          assert.ok(error.message.includes('invalid-state'));
          return true;
        },
        `${entity}: symbol state must not cause a TypeError`,
      );
    }
  }
});


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

test('malformed transition lists fail closed with the HTTP 409 contract', () => {
  const malformedLists = [null, undefined, false, 0, '', {}, {includes: () => true}];
  for (const allowed of malformedLists) {
    const map = {DRAFT: allowed, APPROVED: []};
    for (const to of ['APPROVED', 'DRAFT']) {
      assert.throws(
        () => assertTransition({entity: 'PURCHASE_ORDER', from: 'DRAFT', to, map}),
        error => {
          assert.ok(error instanceof InvalidStateTransitionError);
          assert.equal(error.code, 'INVALID_STATE_TRANSITION');
          assert.equal(error.statusCode, 409);
          assert.equal(error.expose, true);
          assert.deepEqual(error.allowed, []);
          return true;
        },
        'malformed state-machine entry must not throw a TypeError or accept a retry',
      );
    }
  }
});

test('array and object state keys cannot be coerced into valid transitions', () => {
  const map = {DRAFT: ['APPROVED'], APPROVED: []};
  const invalidPairs = [
    [['DRAFT'], 'APPROVED'],
    ['DRAFT', ['APPROVED']],
    [{toString: () => 'DRAFT'}, 'APPROVED'],
    ['DRAFT', {toString: () => 'APPROVED'}],
    [['DRAFT'], ['DRAFT']],
  ];
  for (const [from, to] of invalidPairs) {
    assert.throws(
      () => assertTransition({entity: 'PURCHASE_ORDER', from, to, map}),
      error => {
        assert.ok(error instanceof InvalidStateTransitionError);
        assert.equal(error.code, 'INVALID_STATE_TRANSITION');
        assert.equal(error.statusCode, 409);
        assert.equal(error.expose, true);
        assert.equal(error.from, from);
        assert.equal(error.to, to);
        assert.deepEqual(error.allowed, typeof from === 'string' ? map[from] : []);
        return true;
      },
      'non-string state values must never resolve to a declared state',
    );
  }
  assert.equal(assertTransition({entity: 'PURCHASE_ORDER', from: 'DRAFT', to: 'APPROVED', map}), true);
  assert.equal(assertTransition({entity: 'PURCHASE_ORDER', from: 'DRAFT', to: 'DRAFT', map}), true);
});
