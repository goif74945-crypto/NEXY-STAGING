import RunDetailClient from '@/components/runs/run-detail-client';
import { getRunById } from '@/lib/repositories/run-repository';

export default function RunDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const run = getRunById(params.id);

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
          NEXY RUN DETAIL
        </p>

        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Deterministic run record.
        </h1>

        <p style={{ maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          This route renders a deterministic run fixture by ID. It does not
          accept client-provided run records and does not claim production run
          persistence.
        </p>

        <div style={{ marginTop: 32 }}>
          {run === null ? (
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
          ) : (
            <RunDetailClient
              run={{
                run_id: run.run_id,
                directive_id: run.directive_id,
                status: run.status,
                output_class: run.output_class,
                freeze_reason: run.freeze_reason,
              }}
            />
          )}
        </div>
      </section>
    </main>
  );
}
