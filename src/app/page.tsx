const foundationFiles = [
  'package.json',
  'tsconfig.json',
  'next.config.ts',
  '.env.example',
  'prisma/schema.prisma',
  'src/lib/config/env.ts',
  'src/lib/db/prisma.ts',
  'src/lib/utils/ids.ts',
  'src/lib/errors/app-errors.ts',
  'src/lib/http/envelope.ts',
  'src/lib/http/route-error.ts',
  'src/lib/auth/session-types.ts',
];

export default function HomePage() {
  return (
    <main style={{ minHeight: '100vh', padding: '48px 24px' }}>
      <section style={{ maxWidth: 960, margin: '0 auto' }}>
        <p style={{ margin: 0, color: '#38bdf8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
          NEXY-STAGING
        </p>
        <h1 style={{ marginTop: 12, marginBottom: 16, fontSize: 40 }}>Pack 1 foundation is now the active rebuild baseline.</h1>
        <p style={{ maxWidth: 720, color: '#cbd5e1', lineHeight: 1.7 }}>
          This repository is the clean staging lane for rebuilding NEXY without mixing in the old demo prototype.
          The current scope is intentionally narrow: boot files, environment loading, Prisma bootstrap, shared ids,
          shared errors, HTTP envelope helpers, and the first App Router entrypoints.
        </p>

        <div style={{ marginTop: 32, padding: 24, border: '1px solid #1e293b', borderRadius: 16, background: '#0f172a' }}>
          <h2 style={{ marginTop: 0 }}>Foundation files currently expected</h2>
          <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.8 }}>
            {foundationFiles.map((filePath) => (
              <li key={filePath}>{filePath}</li>
            ))}
          </ul>
        </div>
      </section>
    </main>
  );
}
