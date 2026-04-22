'use client';

import StatusBar from '../../components/shell/status-bar';
import BuilderPanel from '../../components/architect/builder-panel';
import PromptConsole from '../../components/dashboard/prompt-console';
import FinalOutputViewer from '../../components/dashboard/final-output-viewer';
import ControlStrip from '../../components/shell/control-strip';

const controlActions = [
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
    id: 'forge:publish',
    label: 'Publish',
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
        specHash="spec:alpha:0001"
        artifactHash="artifact:alpha:0001"
        sealed={false}
        reproducible={true}
      />

      <ControlStrip actions={controlActions} onActionSelect={handleActionSelect} />

      <PromptConsole
        value="Prepare forge output from deterministic sample spec."
        placeholder="Type forge directive"
        disabled={false}
        onChange={handlePromptChange}
        onSubmit={handlePromptSubmit}
      />

      <FinalOutputViewer
        title="Forge Output"
        content={
          'Forge preview is using deterministic sample values only.\nNo backend generation is executed on this page.'
        }
        status="idle"
        reasonSummary={['forge_page_sample', 'deterministic_preview']}
      />
    </main>
  );
}
