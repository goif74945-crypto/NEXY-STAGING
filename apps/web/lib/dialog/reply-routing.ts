import { z } from 'zod';

import { IntentModeSchema } from '../types/intent-mode';
import { TrustLevelSchema } from '../types/trust-level';

export const DialogReplyRoutingInputSchema = z
  .object({
    mode: IntentModeSchema,
    trust_level: TrustLevelSchema,
    has_incidents: z.boolean(),
    first_contact: z.boolean(),
  })
  .strict();
export type DialogReplyRoutingInput = z.infer<typeof DialogReplyRoutingInputSchema>;

const DialogReplyChannelSchema = z.enum(['front', 'dialog', 'companion', 'guard']);
export type DialogReplyChannel = z.infer<typeof DialogReplyChannelSchema>;

export const DialogReplyRoutingResultSchema = z
  .object({
    channel: DialogReplyChannelSchema,
    show_soft_probe: z.boolean(),
    show_guard_banner: z.boolean(),
  })
  .strict();
export type DialogReplyRoutingResult = z.infer<typeof DialogReplyRoutingResultSchema>;

export function routeDialogReply(input: unknown): DialogReplyRoutingResult {
  const parsed = DialogReplyRoutingInputSchema.parse(input);

  const show_soft_probe = parsed.trust_level === 'high' || parsed.trust_level === 'critical';
  const show_guard_banner =
    parsed.has_incidents || parsed.trust_level === 'high' || parsed.trust_level === 'critical';

  let channel: DialogReplyChannel;

  if (parsed.trust_level === 'critical') {
    channel = 'guard';
  } else if (parsed.first_contact) {
    channel = 'front';
  } else if (parsed.mode === 'viewer' || parsed.mode === 'unknown') {
    channel = 'companion';
  } else if (parsed.has_incidents && parsed.trust_level === 'high') {
    channel = 'guard';
  } else {
    channel = 'dialog';
  }

  return DialogReplyRoutingResultSchema.parse({
    channel,
    show_soft_probe,
    show_guard_banner,
  });
}
