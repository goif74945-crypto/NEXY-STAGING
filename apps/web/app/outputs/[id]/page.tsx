import StatusBar from '../../../components/shell/status-bar';
import FinalOutputViewer from '../../../components/dashboard/final-output-viewer';

type OutputDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function OutputDetailPage(
  props: OutputDetailPageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Output Detail"
        status="active"
        trustLevel="low"
        activeSessions={1}
        openIncidents={0}
        queuedJobs={0}
        runningJobs={1}
      />

      <FinalOutputViewer
        title={`Output ${id}`}
        content={`Deterministic output detail sample for ${id}.\nNo backend retrieval is performed on this page.`}
        status="success"
        reasonSummary={['output_detail_sample', `output_id:${id}`]}
      />
    </main>
  );
}
