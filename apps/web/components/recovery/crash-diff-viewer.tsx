type CrashDiffSummary = {
  added_lines: number;
  removed_lines: number;
  changed: boolean;
};

export type CrashDiffViewerProps = {
  beforeText: string;
  afterText: string;
  summary: CrashDiffSummary;
};

export default function CrashDiffViewer(props: CrashDiffViewerProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Crash diff viewer"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Crash Diff
      </div>

      <div className="mb-4 grid gap-3 text-sm sm:grid-cols-3">
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          Added Lines: <span className="font-medium">{props.summary.added_lines}</span>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          Removed Lines: <span className="font-medium">{props.summary.removed_lines}</span>
        </div>
        <div className="rounded-lg border border-slate-800 bg-slate-900 px-3 py-2">
          Changed: <span className="font-medium">{props.summary.changed ? 'Yes' : 'No'}</span>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Before
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
            {props.beforeText}
          </pre>
        </div>

        <div>
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            After
          </div>
          <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
            {props.afterText}
          </pre>
        </div>
      </div>
    </section>
  );
}
