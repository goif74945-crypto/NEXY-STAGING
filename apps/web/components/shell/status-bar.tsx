import type { TrustLevel } from '../../lib/types/trust-level';

type LocalSystemStatus = 'idle' | 'active' | 'warning' | 'critical';

export type StatusBarProps = {
  title: string;
  status: LocalSystemStatus;
  trustLevel: TrustLevel;
  activeSessions: number;
  openIncidents: number;
  queuedJobs: number;
  runningJobs: number;
};

function getStatusClasses(status: LocalSystemStatus): string {
  switch (status) {
    case 'idle':
      return 'border-slate-700 bg-slate-900 text-slate-200';
    case 'active':
      return 'border-blue-700 bg-blue-950 text-blue-200';
    case 'warning':
      return 'border-amber-700 bg-amber-950 text-amber-200';
    case 'critical':
      return 'border-red-700 bg-red-950 text-red-200';
  }
}

function getTrustClasses(trustLevel: TrustLevel): string {
  switch (trustLevel) {
    case 'low':
      return 'bg-emerald-950 text-emerald-200 border-emerald-700';
    case 'medium':
      return 'bg-blue-950 text-blue-200 border-blue-700';
    case 'high':
      return 'bg-amber-950 text-amber-200 border-amber-700';
    case 'critical':
      return 'bg-red-950 text-red-200 border-red-700';
  }
}

export default function StatusBar(props: StatusBarProps): JSX.Element {
  return (
    <section
      className={`w-full rounded-xl border px-4 py-3 shadow-sm ${getStatusClasses(props.status)}`}
      aria-label="System status bar"
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-3">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold uppercase tracking-wide">
              {props.title}
            </div>
            <div className="text-xs opacity-80">
              Status: <span className="font-medium">{props.status}</span>
            </div>
          </div>
          <span
            className={`inline-flex rounded-full border px-2 py-1 text-xs font-medium ${getTrustClasses(
              props.trustLevel,
            )}`}
          >
            Trust: {props.trustLevel}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
          <div className="rounded-lg border border-white/10 px-3 py-2">
            <div className="opacity-70">Active Sessions</div>
            <div className="text-sm font-semibold">{props.activeSessions}</div>
          </div>
          <div className="rounded-lg border border-white/10 px-3 py-2">
            <div className="opacity-70">Open Incidents</div>
            <div className="text-sm font-semibold">{props.openIncidents}</div>
          </div>
          <div className="rounded-lg border border-white/10 px-3 py-2">
            <div className="opacity-70">Queued Jobs</div>
            <div className="text-sm font-semibold">{props.queuedJobs}</div>
          </div>
          <div className="rounded-lg border border-white/10 px-3 py-2">
            <div className="opacity-70">Running Jobs</div>
            <div className="text-sm font-semibold">{props.runningJobs}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
