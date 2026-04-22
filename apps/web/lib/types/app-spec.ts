import { z } from 'zod';

export const AppSpecSourceSchema = z
  .object({
    name: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    locked: z.boolean(),
  })
  .strict();

export const AppSpecRecordSchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    canonical_json: z.string().trim().min(1).max(100000),
    spec_hash: z.string().trim().min(1).max(256),
    sources: z.array(AppSpecSourceSchema),
  })
  .strict();

export type AppSpecSource = z.infer<typeof AppSpecSourceSchema>;
export type AppSpecRecord = z.infer<typeof AppSpecRecordSchema>;

export function parseAppSpecRecord(input: unknown): AppSpecRecord {
  return AppSpecRecordSchema.parse(input);
}

export function validateAppSpecRecord(input: unknown): boolean {
  return AppSpecRecordSchema.safeParse(input).success;
}
