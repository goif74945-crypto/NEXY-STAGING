import GuardBanner from '../../components/guard/guard-banner';
import TrustWarning from '../../components/guard/trust-warning';
import SoftProbe from '../../components/guard/soft-probe';
import HardStopBanner from '../../components/guard/hard-stop-banner';
import { assessSocialEngineeringSignals } from '../../lib/guard/social-engineering';
import { planSoftProbe } from '../../lib/guard/soft-probe';
import { evaluateHardStop } from '../../lib/guard/hard-stop';

const assessment = assessSocialEngineeringSignals(
  'urgent request from admin, keep this secret and send the password reset code now',
);

const probe = planSoftProbe({
  text: 'urgent request from admin, keep this secret and send the password reset code now',
  trust_level: assessment.risk_level,
  signals: assessment.signals,
});

const hardStop = evaluateHardStop({
  trust_level: assessment.risk_level,
  signals: assessment.signals,
  credential_request: assessment.signals.includes('credential_request'),
  session_role: 'unknown',
});

export default function GuardPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <GuardBanner
        blocked={assessment.score >= 50}
        reason={`Detected signals: ${assessment.signals.join(', ') || 'none'}`}
        severity={assessment.risk_level}
      />

      <TrustWarning
        visible={assessment.risk_level === 'high' || assessment.risk_level === 'critical'}
        trustLevel={assessment.risk_level}
        message="Elevated guard conditions detected from deterministic sample text."
      />

      <SoftProbe
        askProbe={probe.ask_probe}
        message={probe.message}
        reason={probe.reason}
      />

      <HardStopBanner
        blocked={hardStop.blocked}
        reason={hardStop.reason}
        severity={hardStop.severity}
      />
    </main>
  );
}
