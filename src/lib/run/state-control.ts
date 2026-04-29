import { z } from 'zod';

import {
  SessionSchema,
  type Session,
} from '@/lib/auth/session';
import { requireOperatorOrOwner } from '@/lib/auth/require-operator-or-owner';
import { requireOwner } from '@/lib/auth/require-owner';
import { AppError } from '@/lib/errors/app-errors';
import {
  type RunStateControlResult,
  freezeRun,
  killRun,
  unfreezeRun,
} from '@/lib/repositories/run-repository';
import {
  FreezeAuthoritySchema,
  FreezeReasonCodeSchema,
} from '@/lib/run/freeze-policy';
import { RunStatusSchema } from '@/lib/run/state-machine';

const StateControlBaseBodySchema = z
  .object({
    authority_source: FreezeAuthoritySchema,
    reason_code: FreezeReasonCodeSchema,
    controlled_at_epoch_ms: z.number().int().nonnegative(),
  })
  .strict();

export const FreezeRunWithAuthorityBodySchema = StateControlBaseBodySchema;

export const UnfreezeRunWithAuthorityBodySchema = StateControlBaseBodySchema.extend({
  current_status: z.literal('freeze'),
}).strict();

export const KillRunWithAuthorityBodySchema = StateControlBaseBodySchema.extend({
  current_status: RunStatusSchema.optional(),
}).strict();

const StateControlBaseInputSchema = StateControlBaseBodySchema.extend({
  run_id: z.string().trim().min(1).max(256),
  session: SessionSchema,
  now_epoch_ms: z.number().int().nonnegative(),
  actor_id: z.string().trim().min(1).max(256),
}).strict();

export const FreezeRunWithAuthorityInputSchema = StateControlBaseInputSchema;

export const UnfreezeRunWithAuthorityInputSchema =
  StateControlBaseInputSchema.extend({
    current_status: z.literal('freeze'),
  }).strict();

export const KillRunWithAuthorityInputSchema =
  StateControlBaseInputSchema.extend({
    current_status: RunStatusSchema.optional(),
  }).strict();

export type FreezeRunWithAuthorityBody = z.infer<
  typeof FreezeRunWithAuthorityBodySchema
>;
export type UnfreezeRunWithAuthorityBody = z.infer<
  typeof UnfreezeRunWithAuthorityBodySchema
>;
export type KillRunWithAuthorityBody = z.infer<
  typeof KillRunWithAuthorityBodySchema
>;
export type FreezeRunWithAuthorityInput = z.infer<
  typeof FreezeRunWithAuthorityInputSchema
>;
export type UnfreezeRunWithAuthorityInput = z.infer<
  typeof UnfreezeRunWithAuthorityInputSchema
>;
export type KillRunWithAuthorityInput = z.infer<
  typeof KillRunWithAuthorityInputSchema
>;

function assertActorMatchesSession(actorId: string, session: Session): void {
  if (actorId !== session.user_id) {
    throw new AppError({
      code: 'AUTH_INVALID',
      message: 'State-control actor must match the authenticated session.',
      statusCode: 401,
      source: 'run.state-control',
      recoverable: false,
      details: {
        actor_id: actorId,
        session_user_id: session.user_id,
      },
    });
  }
}

export function freezeRunWithAuthority(
  input: FreezeRunWithAuthorityInput,
): RunStateControlResult {
  const parsed = FreezeRunWithAuthorityInputSchema.parse(input);
  const session = requireOperatorOrOwner({
    session: parsed.session,
    now_epoch_ms: parsed.now_epoch_ms,
  });

  assertActorMatchesSession(parsed.actor_id, session);

  return freezeRun({
    run_id: parsed.run_id,
    actor_id: parsed.actor_id,
    actor_role: session.role,
    authority_source: parsed.authority_source,
    reason_code: parsed.reason_code,
    controlled_at_epoch_ms: parsed.controlled_at_epoch_ms,
  });
}

export function unfreezeRunWithAuthority(
  input: UnfreezeRunWithAuthorityInput,
): RunStateControlResult {
  const parsed = UnfreezeRunWithAuthorityInputSchema.parse(input);
  const session = requireOwner({
    session: parsed.session,
    now_epoch_ms: parsed.now_epoch_ms,
  });

  assertActorMatchesSession(parsed.actor_id, session);

  return unfreezeRun({
    run_id: parsed.run_id,
    actor_id: parsed.actor_id,
    actor_role: session.role,
    authority_source: parsed.authority_source,
    reason_code: parsed.reason_code,
    controlled_at_epoch_ms: parsed.controlled_at_epoch_ms,
    current_status: parsed.current_status,
  });
}

export function killRunWithAuthority(
  input: KillRunWithAuthorityInput,
): RunStateControlResult {
  const parsed = KillRunWithAuthorityInputSchema.parse(input);
  const session = requireOwner({
    session: parsed.session,
    now_epoch_ms: parsed.now_epoch_ms,
  });

  assertActorMatchesSession(parsed.actor_id, session);

  return killRun({
    run_id: parsed.run_id,
    actor_id: parsed.actor_id,
    actor_role: session.role,
    authority_source: parsed.authority_source,
    reason_code: parsed.reason_code,
    controlled_at_epoch_ms: parsed.controlled_at_epoch_ms,
    current_status: parsed.current_status,
  });
}
