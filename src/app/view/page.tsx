const outputModes = [
  'directive_view',
  'run_output_review',
  'artifact_preview',
  'freeze_snapshot',
] as const;

const guarantees = [
  'root_src_lane_only',
  'deterministic_render_only',
  'no_runtime_fetch',
  'review_before_release',
] as const;

export default function ViewPage() {
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
          NEXY VIEW
        </p>
        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Canonical output review surface is active.
        </h1>
        <p style={{ maxWidth: 720, color: '#cbd5e1', lineHeight: 1.7 }}>
          This page is the root src output surface for reviewing deterministic
          results without mixing in the legacy apps/web tree.
        </p>

        <div
          style={{
            display: 'grid',
            gap: 24,
            marginTop: 32,
          }}
        >
          <section
            style={{
              padding: 24,
              border: '1px solid #1e293b',
              borderRadius: 16,
              background: '#0f172a',
            }}
          >
            <h2 style={{ marginTop: 0 }}>Supported review modes</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {outputModes.map((mode) => (
                <li key={mode}>{mode}</li>
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
            <h2 style={{ marginTop: 0 }}>Root lane guarantees</h2>
            <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
              {guarantees.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        </div>
      </section>
    </main>
  );
}
