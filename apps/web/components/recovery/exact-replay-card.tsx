export type ExactReplayCardProps = {
  ready: boolean;
  summary: string;
  onReplay: () => void;
};

export default function ExactReplayCard(props: ExactReplayCardProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Exact replay card"
    >
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide">
        Exact Replay
      </div>
      <div className="mb-4 text-sm text-slate-300">{props.summary}</div>
      <button
        type="button"
        disabled={!props.ready}
        onClick={props.onReplay}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Replay
      </button>
    </section>
  );
}
