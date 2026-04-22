import DialogPanel from '../../components/dialog/dialog-panel';
import ReasonSummaryPanel from '../../components/dialog/reason-summary-panel';
import GuardBanner from '../../components/guard/guard-banner';
import { routeDialogReply } from '../../lib/dialog/reply-routing';
import { buildReasonSummaryView } from '../../lib/dialog/reason-summary';

const routing = routeDialogReply({
  mode: 'operator',
  trust_level: 'medium',
  has_incidents: true,
  first_contact: false,
});

const reasonSummary = buildReasonSummaryView({
  reasons: [
    'operator_keywords_detected',
    'first_contact_context',
    'operator_keywords_detected',
    'incident_visibility_enabled',
  ],
  max_items: 3,
});

export default function DialogPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <DialogPanel
        title="Dialog"
        channel={routing.channel}
        text="Deterministic dialog output sample for NEXY foundation."
        showGuardBanner={routing.show_guard_banner}
      />

      <ReasonSummaryPanel
        items={reasonSummary.items}
        truncated={reasonSummary.truncated}
      />

      <GuardBanner
        blocked={routing.show_guard_banner}
        reason={routing.show_guard_banner ? 'Guard banner requested by routing rules' : 'No guard action'}
        severity={routing.show_guard_banner ? 'medium' : 'low'}
      />
    </main>
  );
}
