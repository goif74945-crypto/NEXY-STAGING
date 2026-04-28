export type ModeSwitcherMode = 'VIEW' | 'RUN' | 'FORGE';

export type ModeSwitcherProps = {
  activeMode?: ModeSwitcherMode;
};

const MODES: ModeSwitcherMode[] = ['VIEW', 'RUN', 'FORGE'];

export default function ModeSwitcher({
  activeMode = 'VIEW',
}: ModeSwitcherProps): JSX.Element {
  return (
    <section
      aria-label="Mode switcher"
      style={{
        border: '1px solid #d4d4d8',
        borderRadius: 12,
        padding: 16,
      }}
    >
      <h2>Mode</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {MODES.map((mode) => {
          const active = mode === activeMode;

          return (
            <div
              key={mode}
              aria-current={active ? 'true' : undefined}
              style={{
                border: '1px solid #d4d4d8',
                borderRadius: 10,
                padding: '8px 12px',
                fontWeight: active ? 700 : 400,
              }}
            >
              {mode}
            </div>
          );
        })}
      </div>
    </section>
  );
}
