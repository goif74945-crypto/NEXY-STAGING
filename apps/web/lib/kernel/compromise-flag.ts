import { z } from 'zod';

export const CompromiseFlagSchema = z
  .object({
    compromised: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
    scope: z.string().trim().min(1).max(256),
  })
  .strict();

export type CompromiseFlag = z.infer<typeof CompromiseFlagSchema>;

export function parseCompromiseFlag(input: unknown): CompromiseFlag {
  return CompromiseFlagSchema.parse(input);
}

export function validateCompromiseFlag(input: unknown): boolean {
  return CompromiseFlagSchema.safeParse(input).success;
}

export function buildCompromiseFlag(input: CompromiseFlag): CompromiseFlag {
  const parsed = parseCompromiseFlag(input);

  return {
    compromised: parsed.compromised,
    reason: parsed.reason,
    scope: parsed.scope,
  };
}
