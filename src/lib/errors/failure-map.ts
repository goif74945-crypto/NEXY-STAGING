import { z } from 'zod';

export const FailureSeveritySchema = z.enum([
  'S0',
  'S1',
  'S2',
  'S3',
  'S4',
  'S5',
]);

export const FailureMapEntrySchema = z
  .object({
    code: z.string().trim().min(1),
    severity: FailureSeveritySchema,
    message: z.string().trim().min(1),
    recoverable: z.boolean(),
  })
  .strict();

export const FailureMapSchema = z.array(FailureMapEntrySchema);

export type FailureSeverity = z.infer<typeof FailureSeveritySchema>;
export type FailureMapEntry = z.infer<typeof FailureMapEntrySchema>;
export type FailureMap = z.infer<typeof FailureMapSchema>;

export function buildFailureMapEntry(input: {
  code: string;
  severity: FailureSeverity;
  message: string;
  recoverable: boolean;
}): FailureMapEntry {
  return FailureMapEntrySchema.parse({
    code: input.code,
    severity: input.severity,
    message: input.message,
    recoverable: input.recoverable,
  });
}

export function parseFailureMap(input: unknown): FailureMap {
  return FailureMapSchema.parse(input);
}
