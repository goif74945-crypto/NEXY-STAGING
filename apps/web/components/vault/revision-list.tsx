import { formatEpochMs } from '../../lib/ui/format';

export type RevisionListItem = {
  entity_id: string;
  revision_id: string;
  version: string;
  created_at_epoch_ms: number;
};

export type RevisionListProps = {
  items: readonly RevisionListItem[];
  locale?: string;
};

export default function RevisionList(props: RevisionListProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Revision list"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Revisions
      </div>

      <div className="space-y-3">
        {props.items.map((item) => (
          <article
            key={`${item.entity_id}:${item.revision_id}`}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{item.revision_id}</div>
              <div className="text-xs text-slate-400">
                {formatEpochMs(item.created_at_epoch_ms, props.locale)}
              </div>
            </div>
            <div className="mt-2 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
              <div>Entity: {item.entity_id}</div>
              <div>Version: {item.version}</div>
            </div>
          </article>
        ))}
      </div>

      {props.items.length === 0 ? (
        <div className="text-sm text-slate-400">No revisions</div>
      ) : null}
    </section>
  );
}
