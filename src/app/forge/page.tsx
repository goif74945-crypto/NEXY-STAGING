export default function ForgePage() {
  const forgeStages = [
    'directive_build',
    'validation_pass',
    'execution_plan',
    'artifact_ready',
  ] as const;

  const forgeConstraints = [
    'no-ambiguous-directive',
    'schema-validation-required',
    'evidence-before-output',
    'no-guessing-law',
  ] as const;

  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <section style={{ maxWidth: 960, margin: '0 auto' }}>
        <p style={{ margin: 0, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          NEXY FORGE
        </p>
        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Directive forge lane is active.
        </h1>

        <div style={{ display: 'grid', gap: 24, marginTop: 32 }}>
          <section style={{ padding: 24, border: '1px solid #1e293b', borderRadius: 16, background: '#0f172a' }}>
            <h2 style={{ marginTop: 0 }}>Forge stages</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {forgeStages.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          </section>

          <section style={{ padding: 24, border: '1px solid #1e293b', borderRadius: 16, background: '#0f172a' }}>
            <h2 style={{ marginTop: 0 }}>Constraints</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {forgeConstraints.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
