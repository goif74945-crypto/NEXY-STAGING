import { z } from 'zod';

export const ArtifactRepositoryRecordSchema = z
  .object({
    artifact_id: z.string().trim().min(1),
    run_id: z.string().trim().min(1),
    locked: z.boolean(),
    content_hash: z.string().trim().min(1),
  })
  .strict();

export const OutputExportFormatSchema = z.enum(['json', 'markdown', 'pdf']);
export const OutputExportStatusSchema = z.enum(['ready', 'blocked']);

export const OutputExportDescriptorSchema = z
  .object({
    output_id: z.string().trim().min(1).max(256),
    format: OutputExportFormatSchema,
    content_hash: z.string().trim().min(1).max(256),
    export_status: OutputExportStatusSchema,
  })
  .strict();

export const ArtifactLockBodySchema = z
  .object({
    locked_by: z.string().trim().min(1).max(256),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export const ArtifactLockInputSchema = ArtifactLockBodySchema.extend({
  artifact_id: z.string().trim().min(1).max(256),
}).strict();

export const ArtifactLockResultSchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    locked: z.literal(true),
    locked_by: z.string().trim().min(1).max(256),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ArtifactRepositoryRecord = z.infer<
  typeof ArtifactRepositoryRecordSchema
>;
export type OutputExportFormat = z.infer<typeof OutputExportFormatSchema>;
export type OutputExportStatus = z.infer<typeof OutputExportStatusSchema>;
export type OutputExportDescriptor = z.infer<
  typeof OutputExportDescriptorSchema
>;
export type ArtifactLockBody = z.infer<typeof ArtifactLockBodySchema>;
export type ArtifactLockInput = z.infer<typeof ArtifactLockInputSchema>;
export type ArtifactLockResult = z.infer<typeof ArtifactLockResultSchema>;

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

export function buildOutputExportDescriptor(
  outputId: string,
): OutputExportDescriptor {
  return OutputExportDescriptorSchema.parse({
    output_id: outputId,
    format: 'json',
    content_hash: `content_hash:${outputId}`,
    export_status: 'ready',
  });
}

export function lockArtifact(input: ArtifactLockInput): ArtifactLockResult {
  const parsed = ArtifactLockInputSchema.parse(input);

  return ArtifactLockResultSchema.parse({
    artifact_id: parsed.artifact_id,
    locked: true,
    locked_by: parsed.locked_by,
    reason: parsed.reason,
  });
}
