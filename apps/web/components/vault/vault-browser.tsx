export type VaultBrowserItem = {
  id: string;
  label: string;
  kind: string;
  selected: boolean;
};

export type VaultBrowserProps = {
  items: readonly VaultBrowserItem[];
  onSelect: (itemId: string) => void;
};

export default function VaultBrowser(props: VaultBrowserProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Vault browser"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Vault Browser
      </div>

      <div className="space-y-2">
        {props.items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => props.onSelect(item.id)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
              item.selected
                ? 'border-blue-700 bg-blue-950 text-blue-100'
                : 'border-slate-800 bg-slate-900 text-slate-100'
            }`}
          >
            <span className="min-w-0 truncate font-medium">{item.label}</span>
            <span className="ml-3 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">
              {item.kind}
            </span>
          </button>
        ))}
      </div>

      {props.items.length === 0 ? (
        <div className="text-sm text-slate-400">No vault items</div>
      ) : null}
    </section>
  );
}
