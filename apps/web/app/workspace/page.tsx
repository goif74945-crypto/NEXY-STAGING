import StatusBar from '../../components/shell/status-bar';
import PromptConsole from '../../components/dashboard/prompt-console';
import FinalOutputViewer from '../../components/dashboard/final-output-viewer';
import ControlStrip from '../../components/shell/control-strip';
import CommandBar from '../../components/shell/command-bar';

const handleChange = (): void => {};
const handleSubmit = (): void => {};
const handleActionSelect = (): void => {};
const handleCommand = (): void => {};

const actions = [
  { id: 'view', label: 'View', disabled: false, active: true },
  { id: 'run', label: 'Run', disabled: false, active: false },
  { id: 'forge', label: 'Forge', disabled: true, active: false },
] as const;

const commands = [
  { id: 'save', label: 'Save', hint: 'store draft', disabled: false },
  { id: 'freeze', label: 'Freeze', hint: 'hold state', disabled: false },
  { id: 'export', label: 'Export', hint: 'package output', disabled: true },
] as const;

export default function WorkspacePage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Workspace"
        status="active"
        trustLevel="medium"
        activeSessions={4}
        openIncidents={1}
        queuedJobs={3}
        runningJobs={2}
      />

      <ControlStrip actions={actions} onActionSelect={handleActionSelect} />
      <CommandBar commands={commands} onCommand={handleCommand} />

      <PromptConsole
        value="Summarize the current workspace state."
        placeholder="Type a deterministic command"
        disabled={false}
        onChange={handleChange}
        onSubmit={handleSubmit}
      />

      <FinalOutputViewer
        title="Workspace Output"
        content={'Workspace output preview.\nNo runtime fetching is used here.'}
        status="idle"
        reasonSummary={['workspace_sample', 'static_page_foundation']}
      />
    </main>
  );
}
