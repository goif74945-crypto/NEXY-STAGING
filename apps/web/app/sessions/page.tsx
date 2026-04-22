import SessionListPanel from '../../components/dashboard/session-list-panel';
import SessionTools from '../../components/dashboard/session-tools';

const handleLogout = (): void => {};
const handleRevokeOthers = (): void => {};

const sessions = [
  {
    session_id: 'session:primary',
    subject: 'owner@nexy.local',
    role: 'owner',
    status: 'active',
    issued_at_epoch_ms: 1710000000000,
    expires_at_epoch_ms: 1710086400000,
  },
  {
    session_id: 'session:tablet',
    subject: 'owner@nexy.local',
    role: 'operator',
    status: 'revoked',
    issued_at_epoch_ms: 1709900000000,
    expires_at_epoch_ms: 1709986400000,
    revoked_at_epoch_ms: 1709950000000,
  },
] as const;

export default function SessionsPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <SessionListPanel sessions={sessions} locale="en-US" />
      <SessionTools
        canLogout={true}
        canRevokeOthers={true}
        onLogout={handleLogout}
        onRevokeOthers={handleRevokeOthers}
      />
    </main>
  );
}
