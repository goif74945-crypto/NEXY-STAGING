'use client';

import StatusBar from '../../components/shell/status-bar';
import PulsePreview from '../../components/front/pulse-preview';
import FrontGate from '../../components/front/front-gate';
import { buildFrontPulseView } from '../../lib/front/pulse';
import { classifyFirstContact } from '../../lib/front/first-contact';

const pulse = buildFrontPulseView({
  active_sessions: 4,
  open_incidents: 1,
  queued_jobs: 6,
  running_jobs: 2,
  total_runs: 18,
});

const firstContact = classifyFirstContact({
  text: 'hello, I need to inspect current system activity',
  session_known: false,
  has_history: false,
});

const handleContinue = (): void => {};

export default function FrontPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <StatusBar
        title="NEXY Front"
        status="warning"
        trustLevel="medium"
        activeSessions={pulse.counts.active_sessions}
        openIncidents={pulse.counts.open_incidents}
        queuedJobs={pulse.counts.queued_jobs}
        runningJobs={pulse.counts.running_jobs}
      />

      <div className="grid gap-6 lg:grid-cols-[1.35fr_1fr]">
        <PulsePreview pulse={pulse} />
        <FrontGate
          firstContact={firstContact.first_contact}
          mode={firstContact.suggested_mode}
          confidence={firstContact.confidence}
          onContinue={handleContinue}
        />
      </div>
    </main>
  );
}
