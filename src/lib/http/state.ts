import { z } from 'zod';

export const HttpRequestStateSchema = z.enum([
  'received',
  'validated',
  'processed',
  'failed',
]);

export const HttpStateSchema = z
  .object({
    request_id: z.string().trim().min(1),
    trace_id: z.string().trim().min(1),
    state: HttpRequestStateSchema,
    ok: z.boolean(),
  })
  .strict();

export type HttpState = z.infer<typeof HttpStateSchema>;

export function parseHttpState(input: unknown): HttpState {
  return HttpStateSchema.parse(input);
}

export function buildHttpState(input: {
  request_id: string;
  trace_id: string;
  state: z.infer<typeof HttpRequestStateSchema>;
  ok: boolean;
}): HttpState {
  return HttpStateSchema.parse({
    request_id: input.request_id,
    trace_id: input.trace_id,
    state: input.state,
    ok: input.ok,
  });
}
