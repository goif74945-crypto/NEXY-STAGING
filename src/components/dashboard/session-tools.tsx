export type SessionToolAction = {
  id: 'logout_current' | 'revoke_session' | 'revoke_all_other_sessions';
  label: string;
};

const ACTIONS: SessionToolAction[] = [
  {
    id: 'logout_current',
    label: 'Logout current session',
  },
  {
    id: 'revoke_session',
    label: 'Revoke selected session',
  },
  {
    id: 'revoke_all_other_sessions',
    label: 'Revoke all other sessions',
  },
];

export default function SessionTools(): JSX.Element {
  return (
    <section
      aria-label="Session tools"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Session tools</h2>
      <ul>
        {ACTIONS.map((action) => (
          <li key={action.id}>
            <span>{action.id}</span>
            <span> — </span>
            <strong>{action.label}</strong>
          </li>
        ))}
      </ul>
    </section>
  );
}
