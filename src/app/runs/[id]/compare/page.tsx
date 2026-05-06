import RunCompareClient from '@/components/runs/run-compare-client';
import { getRunById, listRuns } from '@/lib/repositories/run-repository';

function pickComparisonTarget(leftId: string): string | null {
  const candidate =
    listRuns().find((run) => run.run_id !== leftId)?.run_id ?? null;

  return candidate;
}

export default function RunComparePage({
  params,
}: {
  params: { id: string };
}) {
  const left = getRunById(params.id);
  const rightId = pickComparisonTarget(params.id);
  const right = rightId === null ? null : getRunById(rightId);

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <section style={{ maxWidth: 960, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            color: '#38bdf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          NEXY RUN COMPARE
        </p>

        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Deterministic run comparison.
        </h1>

        <p style={{ maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          This route compares two deterministic run fixtures. It does not fetch
          external data and does not claim production run lineage.
        </p>

        <div style={{ marginTop: 32 }}>
          {left === null ? (
            <section
              aria-label="Run missing"
              style={{
                border: '1px solid #1e293b',
                borderRadius: 16,
                background: '#0f172a',
                padding: 24,
              }}
            >
              <h2 style={{ marginTop: 0 }}>Run not found</h2>
              <p style={{ marginBottom: 0, color: '#cbd5e1' }}>
                No deterministic fixture exists for run ID: {params.id}
              </p>
            </section>
          ) : right === null ? (
            <section
              aria-label="Comparison unavailable"
              style={{
                border: '1px solid #1e293b',
                borderRadius: 16,
                background: '#0f172a',
                padding: 24,
              }}
            >
              <h2 style={{ marginTop: 0 }}>Comparison target missing</h2>
              <p style={{ marginBottom: 0, color: '#cbd5e1' }}>
                No secondary deterministic run fixture is available for
                comparison.
              </p>
            </section>
          ) : (
            <RunCompareClient
              comparison={{
                left_run_id: left.run_id,
                right_run_id: right.run_id,
                same_status: left.status === right.status,
                same_output_class: left.output_class === right.output_class,
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}
