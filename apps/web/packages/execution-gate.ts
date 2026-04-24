import { z } from 'zod';

export const ExecutionGateStatusValues = ['READY', 'FREEZE'] as const;

export const ExecutionGateStatusSchema = z.enum(ExecutionGateStatusValues);

export type ExecutionGateStatus = z.infer<typeof ExecutionGateStatusSchema>;

export const ExecutionGateInputSchema = z
  .object({
    packageGateExists: z.boolean(),
    tsconfigGateExists: z.boolean(),
    testsGateExists: z.boolean(),
  })
  .strict();

export type ExecutionGateInput = z.infer<typeof ExecutionGateInputSchema>;

export const ExecutionGateResultSchema = z
  .object({
    status: ExecutionGateStatusSchema,
    missing: z.array(z.enum(['package.json', 'tsconfig.json', 'tests'])),
  })
  .strict();

export type ExecutionGateResult = z.infer<typeof ExecutionGateResultSchema>;

export function evaluateExecutionGate(input: unknown): ExecutionGateResult {
  const parsed = ExecutionGateInputSchema.parse(input);
  const missing: ExecutionGateResult['missing'] = [];

  if (!parsed.packageGateExists) {
    missing.push('package.json');
  }

  if (!parsed.tsconfigGateExists) {
    missing.push('tsconfig.json');
  }

  if (!parsed.testsGateExists) {
    missing.push('tests');
  }

  return ExecutionGateResultSchema.parse({
    status: missing.length === 0 ? 'READY' : 'FREEZE',
    missing,
  });
}
