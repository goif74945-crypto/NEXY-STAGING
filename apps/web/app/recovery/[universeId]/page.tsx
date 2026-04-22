import RecoveryGate from '../../../components/recovery/recovery-gate';
import ExactReplayCard from '../../../components/recovery/exact-replay-card';
import CleanRebootCard from '../../../components/recovery/clean-reboot-card';
import ManualInspectCard from '../../../components/recovery/manual-inspect-card';
import RecoveryPackagePanel from '../../../components/recovery/recovery-package-panel';

type RecoveryUniversePageProps = {
  params: Promise<{ universeId: string }>;
};

const handleReplay = (): void => {};
const handleReboot = (): void => {};
const handleInspect = (): void => {};

export default async function RecoveryUniversePage(
  props: RecoveryUniversePageProps,
): Promise<JSX.Element> {
  const { universeId } = await props.params;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <RecoveryGate
        blocked={true}
        reason={`Recovery lock is active for ${universeId}.`}
        mode="manual_inspect"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <ExactReplayCard
          ready={false}
          summary={`Exact replay remains blocked for ${universeId}.`}
          onReplay={handleReplay}
        />
        <CleanRebootCard
          ready={true}
          summary={`Clean reboot is available for ${universeId}.`}
          onReboot={handleReboot}
        />
        <ManualInspectCard
          required={true}
          summary={`Manual inspection is required before recovery continues for ${universeId}.`}
          onInspect={handleInspect}
        />
      </div>

      <RecoveryPackagePanel
        packageId={`pkg:${universeId}:recovery`}
        universeId={universeId}
        createdAtEpochMs={1712100000000}
        summary={`Deterministic recovery package sample for ${universeId}.`}
        locale="en-US"
      />
    </main>
  );
}
