import HistoryPanel from '../../components/history/history-panel';
import ComparePanel from '../../components/history/compare-panel';

const historyItems = [
  {
    id: 'hist:1',
    label: 'Build snapshot',
    timestampEpochMs: 1710000000000,
    description: 'Pre-change stable state.',
  },
  {
    id: 'hist:2',
    label: 'Build snapshot',
    timestampEpochMs: 1710001200000,
    description: 'Post-change stable state.',
  },
] as const;

const left = {
  id: 'hist:1',
  label: 'Before',
  timestampEpochMs: 1710000000000,
  description: 'Stable baseline state.',
};

const right = {
  id: 'hist:2',
  label: 'After',
  timestampEpochMs: 1710001200000,
  description: 'Updated state after deterministic revision.',
};

export default function HistoryPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <HistoryPanel items={historyItems} locale="en-US" />
      <ComparePanel left={left} right={right} locale="en-US" />
    </main>
  );
}
