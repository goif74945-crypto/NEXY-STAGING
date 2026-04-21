import { z } from 'zod';

import {
  IntegrityPayloadSchema,
  Sha256HashSchema,
  hashPayload,
} from '../../packages/vault/integrity';
import { VersionStringSchema } from '../../packages/vault/versioning';

export const ArtifactIdSchema = z.string().trim().min(1).max(128);
export type ArtifactId = z.infer<typeof ArtifactIdSchema>;

export const ArtifactTypeSchema = z.enum(['output', 'report', 'snapshot', 'export']);
export type ArtifactType = z.infer<typeof ArtifactTypeSchema>;

export const ArtifactRecordSchema = z
  .object({
    artifact_id: ArtifactIdSchema,
    run_id: z.string().trim().min(1).max(128),
    artifact_type: ArtifactTypeSchema,
    version: VersionStringSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
    payload_hash: Sha256HashSchema,
    payload: IntegrityPayloadSchema,
  })
  .strict();
export type ArtifactRecord = z.infer<typeof ArtifactRecordSchema>;

export const ArtifactRepositoryStateSchema = z
  .object({
    records: z.array(ArtifactRecordSchema),
  })
  .strict();
export type ArtifactRepositoryState = z.infer<typeof ArtifactRepositoryStateSchema>;

function compareArtifactRecords(left: ArtifactRecord, right: ArtifactRecord): -1 | 0 | 1 {
  if (left.created_at_epoch_ms > right.created_at_epoch_ms) {
    return -1;
  }

  if (left.created_at_epoch_ms < right.created_at_epoch_ms) {
    return 1;
  }

  if (left.artifact_id < right.artifact_id) {
    return -1;
  }

  if (left.artifact_id > right.artifact_id) {
    return 1;
  }

  return 0;
}

function sortArtifactRecords(records: readonly ArtifactRecord[]): ArtifactRecord[] {
  return [...records].sort((left, right) => compareArtifactRecords(left, right));
}

function ensureNoDuplicateArtifactIds(records: readonly ArtifactRecord[]): void {
  const seen = new Set<string>();

  for (const record of records) {
    if (seen.has(record.artifact_id)) {
      throw new Error(`Duplicate artifact_id: ${record.artifact_id}`);
    }

    seen.add(record.artifact_id);
  }
}

function parseStateInternal(input: unknown): ArtifactRepositoryState {
  const state = ArtifactRepositoryStateSchema.parse(input);
  ensureNoDuplicateArtifactIds(state.records);

  return ArtifactRepositoryStateSchema.parse({
    records: sortArtifactRecords(state.records),
  });
}

function assertPayloadHashMatches(record: ArtifactRecord): void {
  const expectedHash = hashPayload(record.payload);

  if (record.payload_hash !== expectedHash) {
    throw new Error(`Artifact payload_hash mismatch: ${record.artifact_id}`);
  }
}

export function createEmptyArtifactRepositoryState(): ArtifactRepositoryState {
  return ArtifactRepositoryStateSchema.parse({
    records: [],
  });
}

export function insertArtifactRecord(
  stateInput: unknown,
  recordInput: unknown,
): ArtifactRepositoryState {
  const state = parseStateInternal(stateInput);
  const record = ArtifactRecordSchema.parse(recordInput);

  assertPayloadHashMatches(record);

  if (state.records.some((existingRecord) => existingRecord.artifact_id === record.artifact_id)) {
    throw new Error(`Duplicate artifact_id: ${record.artifact_id}`);
  }

  return ArtifactRepositoryStateSchema.parse({
    records: sortArtifactRecords([...state.records, record]),
  });
}

export function getArtifactById(
  stateInput: unknown,
  artifactIdInput: unknown,
): ArtifactRecord | null {
  const state = parseStateInternal(stateInput);
  const artifact_id = ArtifactIdSchema.parse(artifactIdInput);

  return state.records.find((record) => record.artifact_id === artifact_id) ?? null;
}

export function listArtifacts(stateInput: unknown): ArtifactRecord[] {
  const state = parseStateInternal(stateInput);
  return [...state.records];
}

export function listArtifactsByRunId(
  stateInput: unknown,
  runIdInput: unknown,
): ArtifactRecord[] {
  const state = parseStateInternal(stateInput);
  const run_id = z.string().trim().min(1).max(128).parse(runIdInput);

  return sortArtifactRecords(
    state.records.filter((record) => record.run_id === run_id),
  );
}

export function listArtifactsByType(
  stateInput: unknown,
  artifactTypeInput: unknown,
): ArtifactRecord[] {
  const state = parseStateInternal(stateInput);
  const artifact_type = ArtifactTypeSchema.parse(artifactTypeInput);

  return sortArtifactRecords(
    state.records.filter((record) => record.artifact_type === artifact_type),
  );
}