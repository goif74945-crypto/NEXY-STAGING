import RunDetailClient from '../../../components/runs/run-detail-client';
import RunsReasonSummaryPanel from '../../../components/runs/reason-summary-panel';

type RunDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunDetailPage(
  props: RunDetailPageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <RunDetailClient
        runId={id}
        status="freeze"
        startedAtEpochMs={1710000000000}
        updatedAtEpochMs={1710001200000}
        endedAtEpochMs={1710001800000}
        outputClass="report"
        freezeReason={`Sample freeze reason for ${id}`}
        locale="en-US"
      />

      <RunsReasonSummaryPanel
        items={[
          `run:${id}:freeze_detected`,
          'manual_review_required',
          'deterministic_page_sample',
        ]}
        truncated={false}
      />
    </main>
  );
}
