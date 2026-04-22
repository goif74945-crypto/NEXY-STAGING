import ResponsePanel, { type ResponsePanelProps } from '../shell/response-panel';

export type FinalOutputViewerProps = {
  title: string;
  content: string;
  status: ResponsePanelProps['status'];
  reasonSummary?: readonly string[];
};

export default function FinalOutputViewer(props: FinalOutputViewerProps): JSX.Element {
  return (
    <section aria-label="Final output viewer">
      <ResponsePanel
        title={props.title}
        content={props.content}
        status={props.status}
        reasonSummary={props.reasonSummary}
      />
    </section>
  );
}
