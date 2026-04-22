type DialogChannel = 'front' | 'dialog' | 'companion' | 'guard';

export type DialogPanelProps = {
  title: string;
  channel: DialogChannel;
  text: string;
  showGuardBanner: boolean;
};

function getChannelClasses(channel: DialogChannel): string {
  switch (channel) {
    case 'front':
      return 'border-blue-800 bg-blue-950 text-blue-100';
    case 'dialog':
      return 'border-slate-800 bg-slate-950 text-slate-100';
    case 'companion':
      return 'border-emerald-800 bg-emerald-950 text-emerald-100';
    case 'guard':
      return 'border-red-800 bg-red-950 text-red-100';
  }
}

export default function DialogPanel(props: DialogPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Dialog panel"
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide">{props.title}</h2>
        <span className={`rounded-full border px-2 py-1 text-xs font-medium ${getChannelClasses(props.channel)}`}>
          {props.channel}
        </span>
      </div>

      {props.showGuardBanner ? (
        <div className="mb-3 rounded-lg border border-amber-800 bg-amber-950 px-3 py-2 text-sm text-amber-100">
          Guard banner visible
        </div>
      ) : null}

      <pre className="whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm leading-6">
        {props.text}
      </pre>
    </section>
  );
}
