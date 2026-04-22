import { z } from 'zod';

import { AppSpecRecordSchema } from '../types/app-spec';

export const AppSpecSchema = AppSpecRecordSchema;

export type AppSpec = z.infer<typeof AppSpecSchema>;

export function parseAppSpec(input: unknown): AppSpec {
  return AppSpecSchema.parse(input);
}

export function validateAppSpec(input: unknown): boolean {
  return AppSpecSchema.safeParse(input).success;
}
