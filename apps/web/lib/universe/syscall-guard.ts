import { z } from 'zod';

export const SyscallGuardSchema = z
  .object({
    profile: z.string().trim().min(1).max(128),
    default_action: z.string().trim().min(1).max(128),
    allowed_syscalls: z.array(z.string().trim().min(1).max(256)),
    blocked_syscalls: z.array(z.string().trim().min(1).max(256)),
  })
  .strict();

export type SyscallGuard = z.infer<typeof SyscallGuardSchema>;

export function parseSyscallGuard(input: unknown): SyscallGuard {
  return SyscallGuardSchema.parse(input);
}

export function validateSyscallGuard(input: unknown): boolean {
  return SyscallGuardSchema.safeParse(input).success;
}

export function buildSyscallGuard(input: SyscallGuard): SyscallGuard {
  const parsed = parseSyscallGuard(input);
  const blockedSet = new Set(parsed.blocked_syscalls);

  for (const syscall of parsed.allowed_syscalls) {
    if (blockedSet.has(syscall)) {
      throw new Error('Illegal syscall guard contradiction.');
    }
  }

  return {
    profile: parsed.profile,
    default_action: parsed.default_action,
    allowed_syscalls: [...parsed.allowed_syscalls],
    blocked_syscalls: [...parsed.blocked_syscalls],
  };
}
