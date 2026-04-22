export type UniverseStatusRow = {
  universe_id: string;
  state: string;
  quota: string;
  quarantined: boolean;
};

export type UniverseStatusTableProps = {
  rows: readonly UniverseStatusRow[];
};

export default function UniverseStatusTable(
  props: UniverseStatusTableProps,
): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Universe status table"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Universe Status
      </div>

      {props.rows.length === 0 ? (
        <div className="text-sm text-slate-400">No universes</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-left text-slate-400">
                <th className="px-3 py-2 font-medium">Universe</th>
                <th className="px-3 py-2 font-medium">State</th>
                <th className="px-3 py-2 font-medium">Quota</th>
                <th className="px-3 py-2 font-medium">Quarantined</th>
              </tr>
            </thead>
            <tbody>
              {props.rows.map((row) => (
                <tr key={row.universe_id} className="border-b border-slate-900 align-top">
                  <td className="px-3 py-2 font-medium">{row.universe_id}</td>
                  <td className="px-3 py-2">{row.state}</td>
                  <td className="px-3 py-2">{row.quota}</td>
                  <td className="px-3 py-2">{row.quarantined ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
