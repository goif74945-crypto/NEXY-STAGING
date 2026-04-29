import { z } from 'zod';

import { SESSION_ROLES } from '@/lib/auth/session-types';

export const FreezeAuthoritySchema = z.enum([
  'LAW',
  'JUDGE',
  'VERIFY',
  'SECURITY',
  'RECOVERY_GATE',
  'OWNER_COMMAND',
]);

export const FreezeReasonCodeSchema = z.enum([
  'LAW_FREEZE',
  'JUDGE_FREEZE',
  'VERIFY_FREEZE',
  'SECURITY_FREEZE',
  'RECOVERY_APPROVED',
  'OWNER_COMMAND',
  'SECURITY_KILL',
  'PIPELINE_REJECTED',
]);

export const FreezePolicyActionSchema = z.enum(['freeze', 'unfreeze', 'kill']);

const ActorRoleSchema = z.enum(SESSION_ROLES);

export const FreezeAuthorityInputSchema = z
  .object({
    actor_role: ActorRoleSchema,
    authority_source: FreezeAuthoritySchema,
    reason_code: FreezeReasonCodeSchema,
  })
  .strict();

export const FreezeDecisionSchema = z
  .object({
    action: FreezePolicyActionSchema,
    allowed: z.boolean(),
    actor_role: ActorRoleSchema,
    authority_source: FreezeAuthoritySchema,
    reason_code: FreezeReasonCodeSchema,
    denial_reason: z.string().trim().min(1).nullable(),
  })
  .strict();

export type FreezeAuthority = z.infer<typeof FreezeAuthoritySchema>;
export type FreezeReasonCode = z.infer<typeof FreezeReasonCodeSchema>;
export type FreezePolicyAction = z.infer<typeof FreezePolicyActionSchema>;
export type FreezeAuthorityInput = z.infer<typeof FreezeAuthorityInputSchema>;
export type FreezeDecision = z.infer<typeof FreezeDecisionSchema>;

const FREEZE_AUTHORITY_SOURCES: readonly string[] = [
  'LAW',
  'JUDGE',
  'VERIFY',
  'SECURITY',
];

const KILL_AUTHORITY_SOURCES: readonly string[] = ['OWNER_COMMAND', 'SECURITY'];

function buildDecision(input: {
  action: FreezePolicyAction;
  allowed: boolean;
  actor_role: FreezeAuthorityInput['actor_role'];
  authority_source: FreezeAuthority;
  reason_code: FreezeReasonCode;
  denial_reason: string | null;
}): FreezeDecision {
  return FreezeDecisionSchema.parse(input);
}

export function evaluateFreezeAuthority(
  input: FreezeAuthorityInput,
): FreezeDecision {
  const parsed = FreezeAuthorityInputSchema.parse(input);
  const roleAllowed =
    parsed.actor_role === 'OWNER' || parsed.actor_role === 'OPERATOR';
  const sourceAllowed = FREEZE_AUTHORITY_SOURCES.includes(
    parsed.authority_source,
  );
  const allowed = roleAllowed && sourceAllowed;

  return buildDecision({
    action: 'freeze',
    allowed,
    actor_role: parsed.actor_role,
    authority_source: parsed.authority_source,
    reason_code: parsed.reason_code,
    denial_reason: allowed
      ? null
      : 'Freeze requires OWNER or OPERATOR role and LAW/JUDGE/VERIFY/SECURITY authority source.',
  });
}

export function evaluateUnfreezeAuthority(
  input: FreezeAuthorityInput,
): FreezeDecision {
  const parsed = FreezeAuthorityInputSchema.parse(input);
  const allowed =
    parsed.actor_role === 'OWNER' &&
    parsed.authority_source === 'RECOVERY_GATE';

  return buildDecision({
    action: 'unfreeze',
    allowed,
    actor_role: parsed.actor_role,
    authority_source: parsed.authority_source,
    reason_code: parsed.reason_code,
    denial_reason: allowed
      ? null
      : 'Unfreeze requires OWNER role and RECOVERY_GATE authority source.',
  });
}

export function evaluateKillAuthority(
  input: FreezeAuthorityInput,
): FreezeDecision {
  const parsed = FreezeAuthorityInputSchema.parse(input);
  const sourceAllowed = KILL_AUTHORITY_SOURCES.includes(
    parsed.authority_source,
  );
  const allowed = parsed.actor_role === 'OWNER' && sourceAllowed;

  return buildDecision({
    action: 'kill',
    allowed,
    actor_role: parsed.actor_role,
    authority_source: parsed.authority_source,
    reason_code: parsed.reason_code,
    denial_reason: allowed
      ? null
      : 'Kill requires OWNER role and OWNER_COMMAND or SECURITY authority source.',
  });
}
