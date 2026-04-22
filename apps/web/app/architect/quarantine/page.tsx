import QuarantinePanel from '../../../components/architect/quarantine-panel';

const quarantineItems = [
  {
    universe_id: 'universe:beta',
    reason: 'Runtime isolation sample triggered.',
    active: true,
  },
  {
    universe_id: 'universe:delta',
    reason: 'Manual review hold remains in place.',
    active: false,
  },
] as const;

export default function ArchitectQuarantinePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <QuarantinePanel items={quarantineItems} />
    </main>
  );
}
