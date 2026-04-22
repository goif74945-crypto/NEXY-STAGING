import type { FrontPulseView } from '../../lib/front/pulse';

export type PulsePreviewProps = {
  pulse: FrontPulseView;
};

export default function PulsePreview(props: PulsePreviewProps): JSX.Element {
  const { pulse } = props;

  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Pulse preview"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">Pulse Preview</h2>
        <span className="rounded-full border border-slate-700 px-2 py-1 text-xs font-medium">
          {pulse.status}
        </span>
      </div>

      <div className="mb-4 text-sm text-slate-300">{pulse.headline}</div>

      <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Sessions</div>
          <div className="font-semibold">{pulse.counts.active_sessions}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Incidents</div>
          <div className="font-semibold">{pulse.counts.open_incidents}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Queued</div>
          <div className="font-semibold">{pulse.counts.queued_jobs}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Running</div>
          <div className="font-semibold">{pulse.counts.running_jobs}</div>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          <div className="text-xs text-slate-400">Runs</div>
          <div className="font-semibold">{pulse.counts.total_runs}</div>
        </div>
      </div>
    </section>
  );
}
