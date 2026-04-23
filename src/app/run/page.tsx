const runStates = [
  'queued',
  'running',
  'frozen',
  'completed',
] as const;

const runGuards = [
  'directive-before-run',
  'auth-before-execution',
  'freeze-policy-enforced',
  'artifact-release-reviewed',
] as const;

export default function RunPage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <section style={{ maxWidth: 960, margin: '0 auto' }}>
        <p
          style={{
            margin: 0,
            color: '#38bdf8',
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          NEXY RUN SURFACE
        </p>
        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Deterministic run control lane is active.
        </h1>
        <p style={{ maxWidth: 720, color: '#cbd5e1', lineHeight: 1.7 }}>
          This page is the canonical root entry for monitoring and reviewing run
          lifecycle state without crossing into the isolated legacy tree.
        </p>

        <div style={{ display: 'grid', gap: 24, marginTop: 32 }}>
          <section
            style={{
              padding: 24,
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Run states</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {runStates.map((state) => (
                <li key={state}>{state}</li>
              ))}
            </ul>
          </section>

          <section
            style={{
              padding: 24,
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Execution guards</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {runGuards.map((guard) => (
                <li key={guard}>{guard}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
