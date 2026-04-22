export type WarningBannerProps = {
  title: string;
  message: string;
  visible: boolean;
};

export default function WarningBanner(props: WarningBannerProps): JSX.Element | null {
  if (!props.visible) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-amber-800 bg-amber-950 px-4 py-3 text-amber-100"
      aria-label="Warning banner"
    >
      <div className="text-sm font-semibold uppercase tracking-wide">{props.title}</div>
      <div className="mt-1 text-sm">{props.message}</div>
    </section>
  );
}
