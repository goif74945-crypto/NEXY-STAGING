export type ArtifactPreviewProps = {
  artifactId: string;
  artifactType: string;
  version: string;
  payloadHash: string;
  payload: unknown;
};

function stringifyPayload(payload: unknown): string {
  try {
    return JSON.stringify(payload, null, 2);
  } catch {
    return String(payload);
  }
}

export default function ArtifactPreview(props: ArtifactPreviewProps): JSX.Element {
  return (
    <section
      className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-slate-100"
      aria-label="Artifact preview"
    >
      <div className="mb-3 text-sm font-semibold uppercase tracking-wide">
        Artifact Preview
      </div>

      <div className="grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
        <div>Artifact ID: {props.artifactId}</div>
        <div>Type: {props.artifactType}</div>
        <div>Version: {props.version}</div>
        <div className="break-all">Payload Hash: {props.payloadHash}</div>
      </div>

      <pre className="mt-4 overflow-x-auto whitespace-pre-wrap break-words rounded-lg border border-slate-800 bg-slate-900 p-3 text-sm text-slate-200">
        {stringifyPayload(props.payload)}
      </pre>
    </section>
  );
}
