import assert from 'node:assert/strict';
import test from 'node:test';

import AgentStatusPanel from '../src/components/dashboard/agent-status-panel';
import SessionTools from '../src/components/dashboard/session-tools';
import PulsePreview from '../src/components/front-door/pulse-preview';

type ElementLike = {
  type: unknown;
  props: Record<string, unknown>;
  key: unknown;
};

function assertElementLike(input: unknown): asserts input is ElementLike {
  assert.equal(typeof input, 'object');
  assert.notEqual(input, null);

  const record = input as Record<string, unknown>;

  assert.ok('type' in record);
  assert.ok('props' in record);
  assert.ok('key' in record);
  assert.equal(typeof record.props, 'object');
  assert.notEqual(record.props, null);
}

function collectPrimitiveText(input: unknown): string[] {
  if (typeof input === 'string' || typeof input === 'number') {
    return [String(input)];
  }

  if (Array.isArray(input)) {
    return input.flatMap((item) => collectPrimitiveText(item));
  }

  if (typeof input === 'object' && input !== null) {
    const record = input as Record<string, unknown>;
    const props = record.props;

    if (typeof props === 'object' && props !== null) {
      const propsRecord = props as Record<string, unknown>;

      return collectPrimitiveText(propsRecord.children);
    }
  }

  return [];
}

test('PulsePreview accepts deterministic pulse props', () => {
  const element = PulsePreview({
    pulse: {
      active_sessions: 7,
      open_incidents: 2,
      queued_jobs: 5,
      running_jobs: 3,
      total_runs: 11,
    },
  });

  assertElementLike(element);
  assert.equal(element.props['aria-label'], 'Front door pulse');

  const text = collectPrimitiveText(element);

  assert.ok(text.includes('Pulse'));
  assert.ok(text.includes('Active sessions'));
  assert.ok(text.includes('7'));
  assert.ok(text.includes('Open incidents'));
  assert.ok(text.includes('2'));
  assert.ok(text.includes('Queued jobs'));
  assert.ok(text.includes('5'));
  assert.ok(text.includes('Running jobs'));
  assert.ok(text.includes('3'));
  assert.ok(text.includes('Total runs'));
  assert.ok(text.includes('11'));
});

test('AgentStatusPanel accepts deterministic agents props', () => {
  const element = AgentStatusPanel({
    agents: [
      {
        agent_id: 'agent_test_001',
        label: 'Test judge',
        status: 'online',
        current_run_id: 'run_test_001',
      },
      {
        agent_id: 'agent_test_002',
        label: 'Test swarm',
        status: 'blocked',
        current_run_id: 'run_test_002',
      },
    ],
  });

  assertElementLike(element);
  assert.equal(element.props['aria-label'], 'Agent status');

  const text = collectPrimitiveText(element);

  assert.ok(text.includes('Agents'));
  assert.ok(text.includes('Test judge'));
  assert.ok(text.includes('agent_test_001'));
  assert.ok(text.includes('online'));
  assert.ok(text.includes('run_test_001'));
  assert.ok(text.includes('Test swarm'));
  assert.ok(text.includes('agent_test_002'));
  assert.ok(text.includes('blocked'));
  assert.ok(text.includes('run_test_002'));
});

test('SessionTools returns deterministic React element', () => {
  const element = SessionTools();

  assertElementLike(element);
  assert.equal(element.props['aria-label'], 'Session tools');

  const text = collectPrimitiveText(element);

  assert.ok(text.includes('Session tools'));
  assert.ok(text.includes('logout_current'));
  assert.ok(text.includes('Logout current session'));
  assert.ok(text.includes('revoke_session'));
  assert.ok(text.includes('Revoke selected session'));
  assert.ok(text.includes('revoke_all_other_sessions'));
  assert.ok(text.includes('Revoke all other sessions'));
});
