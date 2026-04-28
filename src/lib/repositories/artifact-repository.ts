import { z } from 'zod';

export const ArtifactRepositoryRecordSchema = z
  .object({
    artifact_id: z.string().trim().min(1),
    run_id: z.string().trim().min(1),
    locked: z.boolean(),
    content_hash: z.string().trim().min(1),
  })
  .strict();

export type ArtifactRepositoryRecord = z.infer<
  typeof ArtifactRepositoryRecordSchema
>;

function buildArtifactRecords(): ArtifactRepositoryRecord[] {
  return [
    ArtifactRepositoryRecordSchema.parse({
      artifact_id: 'artifact_001',
      run_id: 'run_001',
      locked: true,
      content_hash: 'content_hash:artifact_001',
    }),
    ArtifactRepositoryRecordSchema.parse({
      artifact_id: 'artifact_002',
      run_id: 'run_002',
      locked: false,
      content_hash: 'content_hash:artifact_002',
    }),
  ];
}

function cloneArtifactRecord(
  record: ArtifactRepositoryRecord,
): ArtifactRepositoryRecord {
  return ArtifactRepositoryRecordSchema.parse({
    artifact_id: record.artifact_id,
    run_id: record.run_id,
    locked: record.locked,
    content_hash: record.content_hash,
  });
}

export function listArtifacts(): ArtifactRepositoryRecord[] {
  return buildArtifactRecords().map(cloneArtifactRecord);
}

export function getArtifactById(
  artifactId: string,
): ArtifactRepositoryRecord | null {
  const artifact = buildArtifactRecords().find(
    (record) => record.artifact_id === artifactId,
  );

  return artifact === undefined ? null : cloneArtifactRecord(artifact);
}
