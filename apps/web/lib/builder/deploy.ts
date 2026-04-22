import { z } from 'zod';

export const DeployInputSchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    target: z.string().trim().min(1).max(256),
    deployed: z.boolean(),
  })
  .strict();

export const DeployRecordSchema = z
  .object({
    artifact_id: z.string().trim().min(1).max(256),
    artifact_hash: z.string().trim().min(1).max(256),
    target: z.string().trim().min(1).max(256),
    deployed: z.boolean(),
  })
  .strict();

export type DeployInput = z.infer<typeof DeployInputSchema>;
export type DeployRecord = z.infer<typeof DeployRecordSchema>;

export function buildDeployRecord(input: DeployInput): DeployRecord {
  const parsed = DeployInputSchema.parse(input);

  return DeployRecordSchema.parse({
    artifact_id: parsed.artifact_id,
    artifact_hash: parsed.artifact_hash,
    target: parsed.target,
    deployed: parsed.deployed,
  });
}

export function parseDeployInput(input: unknown): DeployInput {
  return DeployInputSchema.parse(input);
}
