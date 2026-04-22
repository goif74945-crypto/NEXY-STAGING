'use client';

import StatusBar from '../../components/shell/status-bar';
import BuilderPanel from '../../components/architect/builder-panel';
import PromptConsole from '../../components/dashboard/prompt-console';
import FinalOutputViewer from '../../components/dashboard/final-output-viewer';
import ControlStrip from '../../components/shell/control-strip';

const forgeActions = [
  {
    id: 'forge:preview',
    label: 'Preview',
    disabled: false,
    active: true,
  },
  {
    id: 'forge:seal',
    label: 'Seal',
    disabled: false,
    active: false,
  },
  {
    id: 'forge:export',
    label: 'Export',
    disabled: true,
    active: false,
  },
] as const;

const handlePromptChange = (): void => {};
const handlePromptSubmit = (): void => {};
const handleActionSelect = (): void => {};

export default function ForgePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Forge"
        status="active"
        trustLevel="medium"
        activeSessions={3}
        openIncidents={0}
        queuedJobs={2}
        runningJobs={1}
      />

      <BuilderPanel
        specHash="spec:forge:0001"
        artifactHash="artifact:forge:0001"
        sealed={false}
        reproducible={true}
      />

      <ControlStrip actions={forgeActions} onActionSelect={handleActionSelect} />

      <PromptConsole
        value="Forge deterministic output from the current sealed specification."
        placeholder="Enter forge directive"
        disabled={false}
        onChange={handlePromptChange}
        onSubmit={handlePromptSubmit}
      />

      <FinalOutputViewer
        title="Forge Output"
        content={
          'Forge page foundation is rendering deterministic sample output only.\nNo backend execution is performed on this page.'
        }
        status="idle"
        reasonSummary={['forge_page_sample', 'deterministic_preview']}
      />
    </main>
  );
}
