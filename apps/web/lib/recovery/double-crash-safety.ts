import { z } from 'zod';

export const DoubleCrashSafetySchema = z
  .object({
    previous_crash: z.boolean(),
    current_crash: z.boolean(),
    safe_to_resume: z.boolean(),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();

export type DoubleCrashSafety = z.infer<typeof DoubleCrashSafetySchema>;

export function parseDoubleCrashSafety(input: unknown): DoubleCrashSafety {
  return DoubleCrashSafetySchema.parse(input);
}

export function validateDoubleCrashSafety(input: unknown): boolean {
  return DoubleCrashSafetySchema.safeParse(input).success;
}

export function buildDoubleCrashSafety(
  input: DoubleCrashSafety,
): DoubleCrashSafety {
  const parsed = parseDoubleCrashSafety(input);
  const safe_to_resume = !(parsed.previous_crash && parsed.current_crash);

  if (parsed.safe_to_resume !== safe_to_resume) {
    throw new Error('Illegal double crash safety contradiction.');
  }

  return {
    previous_crash: parsed.previous_crash,
    current_crash: parsed.current_crash,
    safe_to_resume,
    reason: parsed.reason,
  };
}
