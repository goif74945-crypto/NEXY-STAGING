import CanonVersionPanel from '../../../components/architect/canon-version-panel';
import DegradedModePanel from '../../../components/architect/degraded-mode-panel';

export default function ArchitectCanonPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <CanonVersionPanel
        version="2.0.0"
        branch="release"
        amendmentCount={5}
        forked={true}
      />

      <DegradedModePanel
        enabled={true}
        reason="Canon branch divergence requires constrained operation."
        boundary="fork_review_boundary"
      />
    </main>
  );
}
