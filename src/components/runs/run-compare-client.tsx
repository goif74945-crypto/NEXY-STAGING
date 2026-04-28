export type RunComparison = {
  left_run_id: string;
  right_run_id: string;
  same_status: boolean;
  same_output_class: boolean;
};

export type RunCompareClientProps = {
  comparison?: RunComparison;
};

const DEFAULT_COMPARISON: RunComparison = {
  left_run_id: 'run_001',
  right_run_id: 'run_002',
  same_status: false,
  same_output_class: true,
};

function formatBoolean(value: boolean): string {
  return value ? 'true' : 'false';
}

export default function RunCompareClient({
  comparison = DEFAULT_COMPARISON,
}: RunCompareClientProps) {
  return (
    <section
      aria-label="Run comparison"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Run comparison</h2>
      <dl>
        <dt>Left run ID</dt>
        <dd>{comparison.left_run_id}</dd>
        <dt>Right run ID</dt>
        <dd>{comparison.right_run_id}</dd>
        <dt>Same status</dt>
        <dd>{formatBoolean(comparison.same_status)}</dd>
        <dt>Same output class</dt>
        <dd>{formatBoolean(comparison.same_output_class)}</dd>
      </dl>
    </section>
  );
}
