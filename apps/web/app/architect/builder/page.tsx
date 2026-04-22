import BuilderPanel from '../../../components/architect/builder-panel';
import SystemNotice from '../../../components/shell/system-notice';

export default function ArchitectBuilderPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <BuilderPanel
        specHash="spec:builder:0007"
        artifactHash="artifact:builder:0007"
        sealed={true}
        reproducible={true}
      />

      <SystemNotice
        kind="success"
        message="Builder sample page is rendering deterministic forge metadata only."
      />
    </main>
  );
}
