import { z } from 'zod';

import { TrustLevelSchema } from './trust-level';

export const KernelEventSchema = z
  .object({
    event_id: z.string().trim().min(1).max(256),
    kind: z.string().trim().min(1).max(256),
    severity: TrustLevelSchema,
    created_at_epoch_ms: z.number().int().nonnegative(),
    detail: z.string().trim().min(1).max(4096),
  })
  .strict();

export type KernelEvent = z.infer<typeof KernelEventSchema>;

export function parseKernelEvent(input: unknown): KernelEvent {
  return KernelEventSchema.parse(input);
}

export function validateKernelEvent(input: unknown): boolean {
  return KernelEventSchema.safeParse(input).success;
}
