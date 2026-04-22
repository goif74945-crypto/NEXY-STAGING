import { z } from 'zod';

export const ExecutionFreezePolicyInputSchema = z
  .object({
    blocked: z.boolean(),
    compromised: z.boolean(),
    quarantined: z.boolean(),
    integrity_ok: z.boolean(),
  })
  .strict();

export const ExecutionFreezePolicyResultSchema = z
  .object({
    freeze_required: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type ExecutionFreezePolicyInput = z.infer<
  typeof ExecutionFreezePolicyInputSchema
>;
export type ExecutionFreezePolicyResult = z.infer<
  typeof ExecutionFreezePolicyResultSchema
>;

export function parseExecutionFreezePolicyInput(
  input: unknown,
): ExecutionFreezePolicyInput {
  return ExecutionFreezePolicyInputSchema.parse(input);
}

export function evaluateExecutionFreezePolicy(
  input: ExecutionFreezePolicyInput,
): ExecutionFreezePolicyResult {
  const parsed = parseExecutionFreezePolicyInput(input);
  const freeze_required =
    parsed.blocked ||
    parsed.compromised ||
    parsed.quarantined ||
    !parsed.integrity_ok;

  if (!freeze_required) {
    return ExecutionFreezePolicyResultSchema.parse({
      freeze_required: false,
      reason: 'ok',
    });
  }

  const reasons: string[] = [];

  if (parsed.blocked) {
    reasons.push('blocked');
  }

  if (parsed.compromised) {
    reasons.push('compromised');
  }

  if (parsed.quarantined) {
    reasons.push('quarantined');
  }

  if (!parsed.integrity_ok) {
    reasons.push('integrity_not_ok');
  }

  return ExecutionFreezePolicyResultSchema.parse({
    freeze_required: true,
    reason: reasons.join('|'),
  });
  }
