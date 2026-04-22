import StatusBar from '../../../components/shell/status-bar';
import ArtifactPreview from '../../../components/vault/artifact-preview';

type ArtifactDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function ArtifactDetailPage(
  props: ArtifactDetailPageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Artifact Detail"
        status="active"
        trustLevel="low"
        activeSessions={2}
        openIncidents={0}
        queuedJobs={1}
        runningJobs={1}
      />

      <ArtifactPreview
        artifactId={id}
        artifactType="report"
        version="1.0.0"
        payloadHash="hash:artifact:sample:0001"
        payload={{
          artifact_id: id,
          summary: 'Deterministic artifact detail sample.',
          frozen: false,
        }}
      />
    </main>
  );
}
