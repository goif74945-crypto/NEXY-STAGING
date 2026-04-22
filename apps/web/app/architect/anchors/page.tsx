import AnchorFsmPanel from '../../../components/architect/anchor-fsm-panel';

const steps = [
  {
    id: 'anchor:prepare',
    label: 'Prepare Batch',
    active: false,
    completed: true,
  },
  {
    id: 'anchor:sign',
    label: 'Sign',
    active: true,
    completed: false,
  },
  {
    id: 'anchor:finalize',
    label: 'Finalize',
    active: false,
    completed: false,
  },
] as const;

export default function ArchitectAnchorsPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <AnchorFsmPanel steps={steps} />
    </main>
  );
}
