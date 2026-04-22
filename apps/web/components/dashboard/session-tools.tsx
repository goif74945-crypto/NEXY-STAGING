export type SessionToolsProps = {
  canLogout: boolean;
  canRevokeOthers: boolean;
  onLogout: () => void;
  onRevokeOthers: () => void;
};

export default function SessionTools(props: SessionToolsProps): JSX.Element {
  return (
    <div className="flex flex-wrap gap-2" aria-label="Session tools">
      <button
        type="button"
        disabled={!props.canLogout}
        onClick={props.onLogout}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Logout
      </button>
      <button
        type="button"
        disabled={!props.canRevokeOthers}
        onClick={props.onRevokeOthers}
        className="rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-medium text-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Revoke Other Sessions
      </button>
    </div>
  );
}
