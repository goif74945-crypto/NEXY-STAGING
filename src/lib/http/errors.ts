import { z } from 'zod';

export const HttpErrorCodeSchema = z.enum([
  'BAD_REQUEST',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'NOT_FOUND',
  'CONFLICT',
  'RATE_LIMITED',
  'INTERNAL_ERROR',
]);

export const HttpErrorStatusSchema = z.union([
  z.literal(400),
  z.literal(401),
  z.literal(403),
  z.literal(404),
  z.literal(409),
  z.literal(429),
  z.literal(500),
]);

export const HttpErrorSchema = z
  .object({
    code: HttpErrorCodeSchema,
    status: HttpErrorStatusSchema,
    message: z.string().trim().min(1),
    recoverable: z.boolean(),
  })
  .strict();

export type HttpErrorCode = z.infer<typeof HttpErrorCodeSchema>;
export type HttpErrorStatus = z.infer<typeof HttpErrorStatusSchema>;
export type HttpError = z.infer<typeof HttpErrorSchema>;

export function parseHttpError(input: unknown): HttpError {
  return HttpErrorSchema.parse(input);
}

export function buildHttpError(input: {
  code: HttpErrorCode;
  status: HttpErrorStatus;
  message: string;
  recoverable: boolean;
}): HttpError {
  return HttpErrorSchema.parse({
    code: input.code,
    status: input.status,
    message: input.message,
    recoverable: input.recoverable,
  });
}

export function isHttpErrorStatus(input: unknown): input is HttpErrorStatus {
  return HttpErrorStatusSchema.safeParse(input).success;
}
