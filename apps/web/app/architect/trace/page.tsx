import TracePanel from '../../../components/architect/trace-panel';

const traceEntries = [
  {
    id: 'trace-page:1',
    label: 'Directive accepted',
    status: 'stable',
    detail: 'Input was parsed deterministically.',
  },
  {
    id: 'trace-page:2',
    label: 'Consensus prepared',
    status: 'verifying',
    detail: 'Sample consensus branch is waiting on verification.',
  },
  {
    id: 'trace-page:3',
    label: 'Freeze boundary checked',
    status: 'stable',
    detail: 'No freeze boundary breach in sample page.',
  },
] as const;

export default function ArchitectTracePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <TracePanel entries={traceEntries} />
    </main>
  );
}
