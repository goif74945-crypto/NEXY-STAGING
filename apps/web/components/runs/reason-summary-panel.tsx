import ReasonSummaryPanel from '../dialog/reason-summary-panel';

export type RunsReasonSummaryPanelProps = {
  items: readonly string[];
  truncated: boolean;
};

export default function RunsReasonSummaryPanel(
  props: RunsReasonSummaryPanelProps,
): JSX.Element {
  return <ReasonSummaryPanel items={props.items} truncated={props.truncated} />;
}
