type ResponsePanelStatus = 'idle' | 'working' | 'success' | 'error';

export type ResponsePanelProps = {
  title: string;
  content: string;
  status: ResponsePanelStatus;
  reasonSummary?: readonly string[];
};

function getPanelClasses(status: ResponsePanelStatus): string {
  switch (status) {
    case 'idle':
      return 'border-slate-800 bg-slate-950 text-slate-100';
    case 'working':
      return 'border-blue-800 bg-blue-950 text-blue-100';
    case 'success':
      return 'border-emerald-800 bg-emerald-950 text-emerald-100';
    case 'error':
      return 'border-red-800 bg-red-950 text-red-100';
  }
}

export default function ResponsePanel(props: ResponsePanelProps): JSX.Element {
  const reasonSummary = props.reasonSummary ?? [];

  return (
    <section
      className={`w-full rounded-xl border p-4 ${getPanelClasses(props.status)}`}
      aria-label="Response panel"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{props.title}</h2>
        <span className="rounded-full border border-white/10 px-2 py-1 text-xs font-medium">
          {props.status}
        </span>
      </div>

      <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-white/10 bg-black/10 p-3 text-sm leading-6">
        {props.content}
      </pre>

      {reasonSummary.length > 0 ? (
        <div className="mt-4">
          <div className="mb-2 text-xs font-semibold uppercase tracking-wide opacity-80">
            Reason Summary
          </div>
          <ul className="list-disc space-y-1 pl-5 text-sm">
            {reasonSummary.map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}
