import assert from 'node:assert/strict';
import test from 'node:test';

import {
  getDashboardAgents,
  getDashboardIncidents,
  getDashboardRecentRuns,
  getDashboardSummary,
} from '../src/lib/repositories/dashboard-repository';
import {
  getRunById,
  listRecentRuns,
  listRuns,
} from '../src/lib/repositories/run-repository';

test('getDashboardSummary returns deterministic summary metrics', () => {
  assert.deepEqual(getDashboardSummary(), {
    active_sessions: 2,
    total_runs: 4,
    open_incidents: 1,
    queued_jobs: 3,
    running_jobs: 1,
    agents_online: 2,
  });
});

test('getDashboardRecentRuns returns deterministic dashboard run projection', () => {
  assert.deepEqual(getDashboardRecentRuns(), [
    {
      run_id: 'run_004',
      status: 'stable',
      output_class: 'FINAL',
      updated_at_epoch_ms: 1_700_000_040_000,
    },
    {
      run_id: 'run_003',
      status: 'verifying',
      output_class: 'CLEAN',
      updated_at_epoch_ms: 1_700_000_030_000,
    },
  ]);
});

test('getDashboardIncidents returns deterministic incident projection', () => {
  assert.deepEqual(getDashboardIncidents(), [
    {
      incident_id: 'incident_001',
      severity: 'S2',
      status: 'open',
      title: 'Deterministic queue pressure',
    },
    {
      incident_id: 'incident_002',
      severity: 'S1',
      status: 'investigating',
      title: 'Telemetry warning threshold',
    },
  ]);
});

test('getDashboardAgents returns deterministic agent projection', () => {
  assert.deepEqual(getDashboardAgents(), [
    {
      agent_id: 'agent_001',
      label: 'Judge agent',
      status: 'online',
      current_run_id: 'run_004',
    },
    {
      agent_id: 'agent_002',
      label: 'Swarm agent',
      status: 'idle',
      current_run_id: 'none',
    },
  ]);
});

test('listRuns returns deterministic run records', () => {
  assert.deepEqual(listRuns(), [
    {
      run_id: 'run_001',
      directive_id: 'directive_001',
      status: 'stable',
      output_class: 'FINAL',
      started_at_epoch_ms: 1_700_000_000_000,
      updated_at_epoch_ms: 1_700_000_010_000,
      freeze_reason: '',
    },
    {
      run_id: 'run_002',
      directive_id: 'directive_002',
      status: 'verifying',
      output_class: 'CLEAN',
      started_at_epoch_ms: 1_700_000_020_000,
      updated_at_epoch_ms: 1_700_000_030_000,
      freeze_reason: '',
    },
  ]);
});

test('getRunById returns run_001', () => {
  assert.deepEqual(getRunById('run_001'), {
    run_id: 'run_001',
    directive_id: 'directive_001',
    status: 'stable',
    output_class: 'FINAL',
    started_at_epoch_ms: 1_700_000_000_000,
    updated_at_epoch_ms: 1_700_000_010_000,
    freeze_reason: '',
  });
});

test('getRunById returns null for missing run', () => {
  assert.equal(getRunById('missing'), null);
});

test('listRecentRuns returns records sorted deterministically', () => {
  const runs = listRecentRuns();

  assert.deepEqual(
    runs.map((run) => run.run_id),
    ['run_002', 'run_001'],
  );

  assert.deepEqual(
    runs.map((run) => run.updated_at_epoch_ms),
    [1_700_000_030_000, 1_700_000_010_000],
  );
});
