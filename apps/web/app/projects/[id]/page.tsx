'use client';

import ProjectTree from '../../../components/vault/project-tree';
import TimelineView from '../../../components/vault/timeline-view';
import VaultBrowser from '../../../components/vault/vault-browser';

type ProjectDetailPageProps = {
  params: Promise<{ id: string }>;
};

const handleSelect = (): void => {};

export default async function ProjectDetailPage(
  props: ProjectDetailPageProps,
): Promise<JSX.Element> {
  const { id } = await props.params;

  const projectNodes = [
    {
      id: `${id}:root`,
      name: `${id} Root`,
      depth: 0,
      kind: 'project',
      selected: true,
    },
    {
      id: `${id}:workspace`,
      name: 'Workspace',
      depth: 1,
      kind: 'folder',
      selected: false,
    },
    {
      id: `${id}:artifacts`,
      name: 'Artifacts',
      depth: 1,
      kind: 'folder',
      selected: false,
    },
    {
      id: `${id}:latest-output`,
      name: 'Latest Output',
      depth: 2,
      kind: 'file',
      selected: false,
    },
  ] as const;

  const timelineEntries = [
    {
      id: `${id}:timeline:1`,
      label: 'Project created',
      timestampEpochMs: 1711000000000,
      description: `Deterministic project timeline entry for ${id}.`,
    },
    {
      id: `${id}:timeline:2`,
      label: 'Revision captured',
      timestampEpochMs: 1711000900000,
      description: 'A sample revision was added to the workspace history.',
    },
  ] as const;

  const vaultItems = [
    {
      id: `${id}:snapshot`,
      label: 'Latest Snapshot',
      kind: 'snapshot',
      selected: true,
    },
    {
      id: `${id}:report`,
      label: 'Validation Report',
      kind: 'report',
      selected: false,
    },
    {
      id: `${id}:export`,
      label: 'Export Package',
      kind: 'export',
      selected: false,
    },
  ] as const;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <header className="rounded-xl border border-slate-800 bg-slate-950 p-4">
        <h1 className="text-lg font-semibold">Project {id}</h1>
        <p className="mt-1 text-sm text-slate-400">
          Deterministic project detail page foundation.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <ProjectTree nodes={projectNodes} onSelect={handleSelect} />
        <VaultBrowser items={vaultItems} onSelect={handleSelect} />
      </div>

      <TimelineView entries={timelineEntries} locale="en-US" />
    </main>
  );
}
