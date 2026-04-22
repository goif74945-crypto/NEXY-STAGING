import { z } from 'zod';

export const SandboxStackSchema = z
  .object({
    container_runtime: z.string().trim().min(1).max(128),
    namespace_profile: z.string().trim().min(1).max(128),
    seccomp_profile: z.string().trim().min(1).max(128),
    readonly_rootfs: z.boolean(),
    no_privilege_escalation: z.boolean(),
  })
  .strict();

export type SandboxStack = z.infer<typeof SandboxStackSchema>;

export function parseSandboxStack(input: unknown): SandboxStack {
  return SandboxStackSchema.parse(input);
}

export function validateSandboxStack(input: unknown): boolean {
  return SandboxStackSchema.safeParse(input).success;
}

export function buildSandboxStack(input: SandboxStack): SandboxStack {
  const parsed = parseSandboxStack(input);

  return {
    container_runtime: parsed.container_runtime,
    namespace_profile: parsed.namespace_profile,
    seccomp_profile: parsed.seccomp_profile,
    readonly_rootfs: parsed.readonly_rootfs,
    no_privilege_escalation: parsed.no_privilege_escalation,
  };
}
