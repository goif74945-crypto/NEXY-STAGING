export type CleanRebootCardProps = {
  ready: boolean;
  summary: string;
  onReboot: () => void;
};

export default function CleanRebootCard(props: CleanRebootCardProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Clean reboot card"
    >
      <div className="mb-2 text-sm font-semibold uppercase tracking-wide">
        Clean Reboot
      </div>
      <div className="mb-4 text-sm text-slate-300">{props.summary}</div>
      <button
        type="button"
        disabled={!props.ready}
        onClick={props.onReboot}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Reboot
      </button>
    </section>
  );
}
