export type RunDetailOutputClass = 'RAW' | 'CLEAN' | 'FINAL' | 'REJECT';

export type RunDetailRecord = {
  run_id: string;
  directive_id: string;
  status: string;
  output_class: RunDetailOutputClass;
  freeze_reason: string;
};

export type RunDetailClientProps = {
  run?: RunDetailRecord;
};

const DEFAULT_RUN: RunDetailRecord = {
  run_id: 'run_001',
  directive_id: 'directive_001',
  status: 'stable',
  output_class: 'FINAL',
  freeze_reason: '',
};

export default function RunDetailClient({
  run = DEFAULT_RUN,
}: RunDetailClientProps) {
  return (
    <section
      aria-label="Run detail"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Run detail</h2>
      <dl>
        <dt>Run ID</dt>
        <dd>{run.run_id}</dd>
        <dt>Directive ID</dt>
        <dd>{run.directive_id}</dd>
        <dt>Status</dt>
        <dd>{run.status}</dd>
        <dt>Output class</dt>
        <dd>{run.output_class}</dd>
        <dt>Freeze reason</dt>
        <dd>{run.freeze_reason === '' ? 'none' : run.freeze_reason}</dd>
      </dl>
    </section>
  );
}
