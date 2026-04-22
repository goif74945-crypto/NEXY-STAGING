type SystemNoticeKind = 'info' | 'warning' | 'error' | 'success';

export type SystemNoticeProps = {
  message: string;
  kind: SystemNoticeKind;
};

function getKindClasses(kind: SystemNoticeKind): string {
  switch (kind) {
    case 'info':
      return 'border-blue-800 bg-blue-950 text-blue-100';
    case 'warning':
      return 'border-amber-800 bg-amber-950 text-amber-100';
    case 'error':
      return 'border-red-800 bg-red-950 text-red-100';
    case 'success':
      return 'border-emerald-800 bg-emerald-950 text-emerald-100';
  }
}

export default function SystemNotice(props: SystemNoticeProps): JSX.Element {
  return (
    <div
      className={`rounded-xl border px-4 py-3 text-sm font-medium ${getKindClasses(props.kind)}`}
      role="status"
      aria-live="polite"
    >
      {props.message}
    </div>
  );
}
