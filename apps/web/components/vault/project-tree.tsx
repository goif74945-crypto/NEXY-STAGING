export type ProjectTreeNode = {
  id: string;
  name: string;
  depth: number;
  kind: string;
  selected: boolean;
};

export type ProjectTreeProps = {
  nodes: readonly ProjectTreeNode[];
  onSelect: (nodeId: string) => void;
};

function getIndentStyle(depth: number): string {
  const safeDepth = depth < 0 ? 0 : depth;
  return `${safeDepth * 16}px`;
}

export default function ProjectTree(props: ProjectTreeProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Project tree"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Project Tree
      </div>

      <div className="space-y-1">
        {props.nodes.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => props.onSelect(node.id)}
            className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm ${
              node.selected
                ? 'border-blue-700 bg-blue-950 text-blue-100'
                : 'border-slate-800 bg-slate-900 text-slate-100'
            }`}
            style={{ paddingLeft: `calc(${getIndentStyle(node.depth)} + 12px)` }}
          >
            <span className="truncate font-medium">{node.name}</span>
            <span className="ml-3 rounded-full border border-white/10 px-2 py-1 text-xs text-slate-300">
              {node.kind}
            </span>
          </button>
        ))}
      </div>

      {props.nodes.length === 0 ? (
        <div className="text-sm text-slate-400">No project nodes</div>
      ) : null}
    </section>
  );
}
