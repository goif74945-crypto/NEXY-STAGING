import RunCompareClient from '../../../../components/runs/run-compare-client';

type RunComparePageProps = {
  params: Promise<{ id: string }>;
};

export default async function RunComparePage(
  props: RunComparePageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;
  const rightRunId = 'run:reference';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <RunCompareClient
        leftRunId={id}
        rightRunId={rightRunId}
        sameStatus={false}
        sameOutputClass={true}
        leftStatus="running"
        rightStatus="stable"
        leftOutputClass="report"
        rightOutputClass="report"
      />
    </main>
  );
}
