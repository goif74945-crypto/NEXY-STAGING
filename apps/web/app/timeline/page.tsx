import TimelineView from '../../components/vault/timeline-view';
import HistoryPanel from '../../components/history/history-panel';

const entries = [
  {
    id: 'timeline:1',
    label: 'Session initialized',
    timestampEpochMs: 1710000000000,
    description: 'Workspace timeline sample entry.',
  },
  {
    id: 'timeline:2',
    label: 'Directive frozen',
    timestampEpochMs: 1710000500000,
    description: 'Deterministic state boundary recorded.',
  },
] as const;

const historyItems = [
  {
    id: 'history:1',
    label: 'Version 1.0.0',
    timestampEpochMs: 1710000100000,
    description: 'Initial snapshot.',
  },
  {
    id: 'history:2',
    label: 'Version 1.0.1',
    timestampEpochMs: 1710000700000,
    description: 'Revision applied.',
  },
] as const;

export default function TimelinePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <TimelineView entries={entries} locale="en-US" />
      <HistoryPanel items={historyItems} locale="en-US" />
    </main>
  );
}
