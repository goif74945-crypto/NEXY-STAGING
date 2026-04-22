import StatusBar from '../../components/shell/status-bar';
import SystemNotice from '../../components/shell/system-notice';
import FrontGate from '../../components/front/front-gate';
import FrontModeSwitch from '../../components/front/front-mode-switch';
import { classifyFirstContact } from '../../lib/front/first-contact';

const firstContact = classifyFirstContact({
  text: 'start new session and route me to the safest mode',
  session_known: false,
  has_history: false,
});

const handleContinue = (): void => {};
const handleModeChange = (): void => {};

export default function FrontDoorPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="Front Door"
        status="active"
        trustLevel="low"
        activeSessions={2}
        openIncidents={0}
        queuedJobs={1}
        runningJobs={1}
      />

      <SystemNotice
        kind="info"
        message="Front-door routing is using deterministic sample values for page foundation."
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <FrontGate
          firstContact={firstContact.first_contact}
          mode={firstContact.suggested_mode}
          confidence={firstContact.confidence}
          onContinue={handleContinue}
        />

        <section className="rounded-xl border border-slate-800 bg-slate-950 p-4">
          <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
            Mode Selection
          </div>
          <FrontModeSwitch
            value={firstContact.suggested_mode}
            disabled={false}
            onChange={handleModeChange}
          />
        </section>
      </div>
    </main>
  );
}
