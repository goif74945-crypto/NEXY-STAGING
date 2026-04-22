import { formatEpochMs, formatSessionRoleLabel } from '../../lib/ui/format';

export type SessionListItem = {
  session_id: string;
  subject: string;
  role: string;
  status: string;
  issued_at_epoch_ms: number;
  expires_at_epoch_ms: number;
  revoked_at_epoch_ms?: number;
};

export type SessionListPanelProps = {
  sessions: readonly SessionListItem[];
  locale?: string;
};

function renderRoleLabel(role: string): string {
  try {
    return formatSessionRoleLabel(role);
  } catch {
    return role.trim();
  }
}

export default function SessionListPanel(props: SessionListPanelProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Session list panel"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">Sessions</div>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-slate-800 text-left text-slate-400">
              <th className="px-3 py-2 font-medium">Session</th>
              <th className="px-3 py-2 font-medium">Subject</th>
              <th className="px-3 py-2 font-medium">Role</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Issued</th>
              <th className="px-3 py-2 font-medium">Expires</th>
              <th className="px-3 py-2 font-medium">Revoked</th>
            </tr>
          </thead>
          <tbody>
            {props.sessions.map((session) => (
              <tr key={session.session_id} className="border-b border-slate-900 align-top">
                <td className="px-3 py-2 font-medium">{session.session_id}</td>
                <td className="px-3 py-2">{session.subject}</td>
                <td className="px-3 py-2">{renderRoleLabel(session.role)}</td>
                <td className="px-3 py-2">{session.status}</td>
                <td className="px-3 py-2">
                  {formatEpochMs(session.issued_at_epoch_ms, props.locale)}
                </td>
                <td className="px-3 py-2">
                  {formatEpochMs(session.expires_at_epoch_ms, props.locale)}
                </td>
                <td className="px-3 py-2">
                  {session.revoked_at_epoch_ms === undefined
                    ? '—'
                    : formatEpochMs(session.revoked_at_epoch_ms, props.locale)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {props.sessions.length === 0 ? (
        <div className="mt-3 text-sm text-slate-400">No sessions</div>
      ) : null}
    </section>
  );
}
