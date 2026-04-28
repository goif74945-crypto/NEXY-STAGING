export type SessionListItem = {
  session_id: string;
  user_id: string;
  email: string;
  role: string;
  device_id: string;
  issued_at_epoch_ms: number;
  expires_at_epoch_ms: number;
  revoked_at_epoch_ms: number | null;
};

export type SessionListPanelProps = {
  sessions?: SessionListItem[];
};

const DEFAULT_SESSIONS: SessionListItem[] = [
  {
    session_id: 'session_owner_001',
    user_id: 'user_owner_001',
    email: 'owner@nexy.local',
    role: 'OWNER',
    device_id: 'device_owner_001',
    issued_at_epoch_ms: 1699999000000,
    expires_at_epoch_ms: 1800000000000,
    revoked_at_epoch_ms: null,
  },
];

export default function SessionListPanel({
  sessions = DEFAULT_SESSIONS,
}: SessionListPanelProps): JSX.Element {
  return (
    <section
      aria-label="Session list"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Sessions</h2>
      <div style={{ display: 'grid', gap: 8 }}>
        {sessions.map((session) => (
          <article
            key={session.session_id}
            style={{
              border: '1px solid #e4e4e7',
              borderRadius: 10,
              padding: 12,
            }}
          >
            <strong>{session.email}</strong>
            <dl>
              <dt>Session</dt>
              <dd>{session.session_id}</dd>
              <dt>Role</dt>
              <dd>{session.role}</dd>
              <dt>Device</dt>
              <dd>{session.device_id}</dd>
              <dt>Issued</dt>
              <dd>{session.issued_at_epoch_ms}</dd>
              <dt>Expires</dt>
              <dd>{session.expires_at_epoch_ms}</dd>
              <dt>Revoked</dt>
              <dd>{session.revoked_at_epoch_ms ?? 'active'}</dd>
            </dl>
          </article>
        ))}
      </div>
    </section>
  );
}
