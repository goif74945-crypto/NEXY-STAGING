import CompanionPanel from '../../components/dialog/companion-panel';
import ReasonSummaryPanel from '../../components/dialog/reason-summary-panel';
import { planCompanionReply } from '../../lib/dialog/companion';
import { buildReasonSummaryView } from '../../lib/dialog/reason-summary';

const plan = planCompanionReply({
  text: 'Explain the reasoning clearly and keep it calm.',
  mode: 'viewer',
  trust_level: 'medium',
});

const reasonSummary = buildReasonSummaryView({
  reasons: ['viewer_context', 'clarity_requested', 'viewer_context'],
  max_items: 2,
});

export default function CompanionPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <CompanionPanel
        tone={plan.tone}
        showReasonSummary={plan.show_reason_summary}
        showSoftProbe={plan.show_soft_probe}
      />

      <ReasonSummaryPanel
        items={reasonSummary.items}
        truncated={reasonSummary.truncated}
      />
    </main>
  );
}
