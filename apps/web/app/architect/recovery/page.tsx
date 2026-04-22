'use client';

import RecoveryGate from '../../../components/recovery/recovery-gate';
import ExactReplayCard from '../../../components/recovery/exact-replay-card';
import CleanRebootCard from '../../../components/recovery/clean-reboot-card';
import ManualInspectCard from '../../../components/recovery/manual-inspect-card';
import RecoveryPackagePanel from '../../../components/recovery/recovery-package-panel';
import CrashDiffViewer from '../../../components/recovery/crash-diff-viewer';

const handleReplay = (): void => {};
const handleReboot = (): void => {};
const handleInspect = (): void => {};

export default function ArchitectRecoveryPage(): JSX.Element {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-slate-950 px-6 py-8 text-slate-100">
      <RecoveryGate
        blocked={true}
        reason="Recovery path locked to deterministic review."
        mode="manual_inspect"
      />

      <div className="grid gap-6 xl:grid-cols-3">
        <ExactReplayCard
          ready={false}
          summary="Exact replay is blocked by current recovery mode."
          onReplay={handleReplay}
        />
        <CleanRebootCard
          ready={true}
          summary="Clean reboot is available from the recovery policy sample."
          onReboot={handleReboot}
        />
        <ManualInspectCard
          required={true}
          summary="Manual inspect remains required for this deterministic page sample."
          onInspect={handleInspect}
        />
      </div>

      <RecoveryPackagePanel
        packageId="pkg:recovery:0001"
        universeId="universe:architect"
        createdAtEpochMs={1712000000000}
        summary="Sample recovery package prepared for architect overview."
        locale="en-US"
      />

      <CrashDiffViewer
        beforeText={'state=running\nquarantine=false\nmode=exact_replay'}
        afterText={'state=paused\nquarantine=true\nmode=manual_inspect'}
        summary={{
          added_lines: 1,
          removed_lines: 1,
          changed: true,
        }}
      />
    </main>
  );
}
