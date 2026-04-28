export type RunListOutputClass = 'RAW' | 'CLEAN' | 'FINAL' | 'REJECT';

export type RunListItem = {
  run_id: string;
  status: string;
  output_class: RunListOutputClass;
  updated_at_epoch_ms: number;
};

export type RunListProps = {
  runs?: RunListItem[];
};

const DEFAULT_RUNS: RunListItem[] = [
  {
    run_id: 'run_001',
    status: 'stable',
    output_class: 'FINAL',
    updated_at_epoch_ms: 1700000010000,
  },
  {
    run_id: 'run_002',
    status: 'verifying',
    output_class: 'CLEAN',
    updated_at_epoch_ms: 1700000020000,
  },
];

export default function RunList({ runs = DEFAULT_RUNS }: RunListProps) {
  return (
    <section
      aria-label="Run list"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Runs</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {runs.map((run) => (
          <article
            key={run.run_id}
            style={{
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              padding: 12,
            }}
          >
            <strong>{run.run_id}</strong>
            <dl>
              <dt>Status</dt>
              <dd>{run.status}</dd>
              <dt>Output class</dt>
              <dd>{run.output_class}</dd>
              <dt>Updated at</dt>
              <dd>{run.updated_at_epoch_ms}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
