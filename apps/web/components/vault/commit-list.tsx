import { formatEpochMs } from '../../lib/ui/format';

export type CommitListItem = {
  entity_id: string;
  commit_id: string;
  version: string;
  created_at_epoch_ms: number;
};

export type CommitListProps = {
  items: readonly CommitListItem[];
  locale?: string;
};

export default function CommitList(props: CommitListProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Commit list"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Commits
      </div>

      <div className="space-y-3">
        {props.items.map((item) => (
          <article
            key={`${item.entity_id}:${item.commit_id}`}
            className="rounded-lg border border-slate-800 bg-slate-900 p-3"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="text-sm font-semibold">{item.commit_id}</div>
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
        <div className="text-sm text-slate-400">No commits</div>
      ) : null}
    </section>
  );
}
