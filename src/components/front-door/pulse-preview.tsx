export type PulsePreviewMetrics = {
  active_sessions: number;
  open_incidents: number;
  queued_jobs: number;
  running_jobs: number;
  total_runs: number;
};

export type PulsePreviewProps = {
  pulse?: PulsePreviewMetrics;
};

const DEFAULT_PULSE: PulsePreviewMetrics = {
  active_sessions: 2,
  open_incidents: 1,
  queued_jobs: 3,
  running_jobs: 1,
  total_runs: 4,
};

export default function PulsePreview({
  pulse = DEFAULT_PULSE,
}: PulsePreviewProps): JSX.Element {
  return (
    <section
      aria-label="Front door pulse"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Pulse</h2>
      <dl>
        <dt>Active sessions</dt>
        <dd>{pulse.active_sessions}</dd>
        <dt>Open incidents</dt>
        <dd>{pulse.open_incidents}</dd>
        <dt>Queued jobs</dt>
        <dd>{pulse.queued_jobs}</dd>
        <dt>Running jobs</dt>
        <dd>{pulse.running_jobs}</dd>
        <dt>Total runs</dt>
        <dd>{pulse.total_runs}</dd>
      </dl>
    </section>
  );
}
