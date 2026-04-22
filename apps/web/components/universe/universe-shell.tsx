import type { ReactNode } from 'react';

export type UniverseShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export default function UniverseShell(props: UniverseShellProps): JSX.Element {
  return (
    <section
      className="rounded-2xl border border-slate-800 bg-slate-950 p-5 text-slate-100"
      aria-label="Universe shell"
    >
      <header className="mb-4 border-b border-slate-800 pb-4">
        <h1 className="text-lg font-semibold">{props.title}</h1>
        <p className="mt-1 text-sm text-slate-400">{props.subtitle}</p>
      </header>

      <div className="space-y-4">{props.children}</div>
    </section>
  );
}
