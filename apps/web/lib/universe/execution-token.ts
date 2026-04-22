import { z } from 'zod';

export const ExecutionTokenSchema = z
  .object({
    universe_id: z.string().trim().min(1).max(256),
    spec_hash: z.string().trim().min(1).max(256),
    build_hash: z.string().trim().min(1).max(256),
    monotonic_counter: z.number().int().nonnegative(),
    allowed: z.boolean(),
  })
  .strict();

export type ExecutionToken = z.infer<typeof ExecutionTokenSchema>;

export function parseExecutionToken(input: unknown): ExecutionToken {
  return ExecutionTokenSchema.parse(input);
}

export function validateExecutionToken(input: unknown): boolean {
  return ExecutionTokenSchema.safeParse(input).success;
}

export function buildExecutionToken(input: ExecutionToken): ExecutionToken {
  const parsed = parseExecutionToken(input);

  if (parsed.allowed === true && parsed.monotonic_counter < 1) {
    throw new Error('Illegal execution token contradiction.');
  }

  return {
    universe_id: parsed.universe_id,
    spec_hash: parsed.spec_hash,
    build_hash: parsed.build_hash,
    monotonic_counter: parsed.monotonic_counter,
    allowed: parsed.allowed,
  };
}
