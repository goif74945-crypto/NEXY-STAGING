import { z } from 'zod';

export const AnchorFinalityInputSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    confirmations: z.number().int().nonnegative(),
    required_confirmations: z.number().int().nonnegative(),
    reorg_detected: z.boolean(),
  })
  .strict();

export const AnchorFinalityResultSchema = z
  .object({
    anchor_id: z.string().trim().min(1).max(256),
    finalized: z.boolean(),
    confirmations: z.number().int().nonnegative(),
    required_confirmations: z.number().int().nonnegative(),
    reorg_detected: z.boolean(),
  })
  .strict();

export type AnchorFinalityInput = z.infer<typeof AnchorFinalityInputSchema>;
export type AnchorFinalityResult = z.infer<typeof AnchorFinalityResultSchema>;

export function parseAnchorFinalityInput(input: unknown): AnchorFinalityInput {
  return AnchorFinalityInputSchema.parse(input);
}

export function evaluateAnchorFinality(
  input: AnchorFinalityInput,
): AnchorFinalityResult {
  const parsed = parseAnchorFinalityInput(input);
  const finalized =
    parsed.confirmations >= parsed.required_confirmations &&
    parsed.reorg_detected === false;

  return AnchorFinalityResultSchema.parse({
    anchor_id: parsed.anchor_id,
    finalized,
    confirmations: parsed.confirmations,
    required_confirmations: parsed.required_confirmations,
    reorg_detected: parsed.reorg_detected,
  });
}
