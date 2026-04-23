const frontDoorChecks = [
  'root-src-tree-active',
  'apps-web-excluded-from-root-typecheck',
  'root-http-layer-self-contained',
  'root-auth-routes-restored',
] as const;

export default function FrontDoorPage() {
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
          NEXY ROOT FRONT DOOR
        </p>
        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>
          Canonical root entry is now the active build lane.
        </h1>
        <p style={{ maxWidth: 720, color: '#cbd5e1', lineHeight: 1.7 }}>
          This front-door page belongs to the root src tree. It exists to keep the
          active rebuild baseline deterministic while the legacy apps/web tree is
          treated as a separate non-root line.
        </p>

        <div
          style={{
            marginTop: 32,
            padding: 24,
            border: '1px solid #1e293b',
            borderRadius: 16,
            background: '#0f172a',
          }}
        >
          <h2 style={{ marginTop: 0 }}>Root lane checks</h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            {frontDoorChecks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
