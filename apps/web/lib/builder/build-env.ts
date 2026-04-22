import { z } from 'zod';

export const BuildEnvSchema = z
  .object({
    runtime: z.string().trim().min(1).max(128),
    target: z.string().trim().min(1).max(128),
    toolchain: z.string().trim().min(1).max(128),
    locked: z.boolean(),
  })
  .strict();

export type BuildEnv = z.infer<typeof BuildEnvSchema>;

export function parseBuildEnv(input: unknown): BuildEnv {
  return BuildEnvSchema.parse(input);
}

export function validateBuildEnv(input: unknown): boolean {
  return BuildEnvSchema.safeParse(input).success;
}

export function buildDefaultBuildEnv(): BuildEnv {
  return BuildEnvSchema.parse({
    runtime: 'node',
    target: 'web',
    toolchain: 'typescript',
    locked: true,
  });
}
