import { formatEpochMs } from '../../lib/ui/format';

export type HistoryCompareSide = {
  id: string;
  label: string;
  timestampEpochMs: number;
  description?: string;
};

export type ComparePanelProps = {
  left: HistoryCompareSide;
  right: HistoryCompareSide;
  locale?: string;
};

function CompareSideCard(props: {
  title: string;
  side: HistoryCompareSide;
  locale?: string;
}): JSX.Element {
  return (
    <article className="rounded-lg border border-slate-800 bg-slate-900 p-4">
      <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-400">
        {props.title}
      </div>
      <div className="space-y-2 text-sm text-slate-200">
        <div>
          <span className="text-slate-400">ID:</span> {props.side.id}
        </div>
        <div>
          <span className="text-slate-400">Label:</span> {props.side.label}
        </div>
        <div>
          <span className="text-slate-400">Timestamp:</span>{' '}
          {formatEpochMs(props.side.timestampEpochMs, props.locale)}
        </div>
        <div>
          <span className="text-slate-400">Description:</span>{' '}
          {props.side.description?.trim() ? props.side.description : '—'}
        </div>
      </div>
    </article>
  );
}

export default function ComparePanel(props: ComparePanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="History compare panel"
    >
      <div className="mb-4 text-sm font-semibold uppercase tracking-wide">
        History Compare
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <CompareSideCard title="Left" side={props.left} locale={props.locale} />
        <CompareSideCard title="Right" side={props.right} locale={props.locale} />
      </div>
    </section>
  );
}
