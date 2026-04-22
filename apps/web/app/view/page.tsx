import StatusBar from '../../components/shell/status-bar';
import FinalOutputViewer from '../../components/dashboard/final-output-viewer';

export default function ViewPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Output View"
        status="active"
        trustLevel="low"
        activeSessions={3}
        openIncidents={0}
        queuedJobs={2}
        runningJobs={1}
      />

      <FinalOutputViewer
        title="Rendered Output"
        content={'Deterministic final output sample.\nNo network or backend calls are used on this page.'}
        status="success"
        reasonSummary={['deterministic_sample', 'view_mode']}
      />
    </main>
  );
}
