import SessionListPanel from '@/components/dashboard/session-list-panel';
import SessionTools from '@/components/dashboard/session-tools';
import { listSessionFixtures } from '@/lib/auth/session';

export default function SessionsPage() {
  const sessions = listSessionFixtures();

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <section style={{ maxWidth: 1120, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            color: '#38bdf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          NEXY SESSIONS
        </p>

        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Deterministic session fixtures.
        </h1>

        <p style={{ maxWidth: 760, color: '#cbd5e1', lineHeight: 1.7 }}>
          This page renders deterministic session fixtures for the root lane. It
          does not claim production authentication or persistence.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 24,
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            marginTop: 32,
          }}
        >
          <SessionListPanel sessions={sessions} />
          <SessionTools />
        </div>
      </section>
    </main>
  );
}
