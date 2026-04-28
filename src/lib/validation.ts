import { z } from 'zod';

export const ValidationIssueSchema = z
  .object({
    path: z.array(z.string()),
    message: z.string().trim().min(1),
    code: z.string().trim().min(1),
  })
  .strict();

export const ValidationResultSchema = z
  .object({
    valid: z.boolean(),
    issues: z.array(ValidationIssueSchema),
  })
  .strict();

export type ValidationIssue = z.infer<typeof ValidationIssueSchema>;
export type ValidationResult = z.infer<typeof ValidationResultSchema>;

export function buildValidationResult(input: {
  valid: boolean;
  issues: ValidationIssue[];
}): ValidationResult {
  return ValidationResultSchema.parse({
    valid: input.valid,
    issues: input.issues,
  });
}

export function buildValidationFailure(
  issues: ValidationIssue[],
): ValidationResult {
  const parsedIssues = z.array(ValidationIssueSchema).parse(issues);

  return ValidationResultSchema.parse({
    valid: false,
    issues: parsedIssues,
  });
}

export function buildValidationSuccess(): ValidationResult {
  return ValidationResultSchema.parse({
    valid: true,
    issues: [],
  });
}
