export type UniverseQuarantineBannerProps = {
  quarantined: boolean;
  reason: string;
};

export default function UniverseQuarantineBanner(
  props: UniverseQuarantineBannerProps,
): JSX.Element | null {
  if (!props.quarantined) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-red-800 bg-red-950 px-4 py-3 text-red-100"
      aria-label="Universe quarantine banner"
    >
      <div className="text-sm font-semibold uppercase tracking-wide">Quarantined</div>
      <div className="mt-1 text-sm">{props.reason.trim() ? props.reason : 'No reason provided'}</div>
    </section>
  );
}ำ
