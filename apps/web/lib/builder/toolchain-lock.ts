import { z } from 'zod';

export const ToolchainLockSchema = z
  .object({
    name: z.string().trim().min(1).max(128),
    version: z.string().trim().min(1).max(128),
    locked: z.boolean(),
  })
  .strict();

export type ToolchainLock = z.infer<typeof ToolchainLockSchema>;

export function parseToolchainLock(input: unknown): ToolchainLock {
  return ToolchainLockSchema.parse(input);
}

export function validateToolchainLock(input: unknown): boolean {
  return ToolchainLockSchema.safeParse(input).success;
}
