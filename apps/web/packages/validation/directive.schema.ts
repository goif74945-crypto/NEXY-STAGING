import { z } from 'zod';

import {
  DirectiveAcceptedResponseDataSchema,
  DirectiveCommandSchema,
  DirectiveIdSchema,
  DirectiveInputTypeSchema,
  DirectiveListSchema,
  DirectiveModeSchema,
  DirectivePrioritySchema,
  DirectiveRejectedResponseDataSchema,
  DirectiveSchema,
  DirectiveSourceSchema,
} from '../contracts/directive';

export const DirectiveCreateRequestSchema = DirectiveSchema;
export type DirectiveCreateRequest = z.infer<typeof DirectiveCreateRequestSchema>;

export const DirectiveCommandRequestSchema = DirectiveCommandSchema;
export type DirectiveCommandRequest = z.infer<typeof DirectiveCommandRequestSchema>;

export const DirectiveBatchRequestSchema = z.array(DirectiveSchema).min(1);
export type DirectiveBatchRequest = z.infer<typeof DirectiveBatchRequestSchema>;

export const DirectiveQuerySchema = z
  .object({
    id: DirectiveIdSchema.optional(),
    mode: DirectiveModeSchema.optional(),
    priority: DirectivePrioritySchema.optional(),
    input_type: DirectiveInputTypeSchema.optional(),
    source: DirectiveSourceSchema.optional(),
  })
  .strict();
export type DirectiveQuery = z.infer<typeof DirectiveQuerySchema>;

export const DirectiveAcceptedResponseSchema = z
  .object({
    data: DirectiveAcceptedResponseDataSchema,
  })
  .strict();
export type DirectiveAcceptedResponse = z.infer<typeof DirectiveAcceptedResponseSchema>;

export const DirectiveRejectedResponseSchema = z
  .object({
    data: DirectiveRejectedResponseDataSchema,
  })
  .strict();
export type DirectiveRejectedResponse = z.infer<typeof DirectiveRejectedResponseSchema>;

export const DirectiveCollectionResponseSchema = z
  .object({
    data: DirectiveListSchema,
  })
  .strict();
export type DirectiveCollectionResponse = z.infer<typeof DirectiveCollectionResponseSchema>;

export function parseDirectiveCreateRequest(input: unknown): DirectiveCreateRequest {
  return DirectiveCreateRequestSchema.parse(input);
}

export function parseDirectiveCommandRequest(input: unknown): DirectiveCommandRequest {
  return DirectiveCommandRequestSchema.parse(input);
}

export function parseDirectiveBatchRequest(input: unknown): DirectiveBatchRequest {
  return DirectiveBatchRequestSchema.parse(input);
}

export function parseDirectiveQuery(input: unknown): DirectiveQuery {
  return DirectiveQuerySchema.parse(input);
}

export function parseDirectiveAcceptedResponse(input: unknown): DirectiveAcceptedResponse {
  return DirectiveAcceptedResponseSchema.parse(input);
}

export function parseDirectiveRejectedResponse(input: unknown): DirectiveRejectedResponse {
  return DirectiveRejectedResponseSchema.parse(input);
}

export function parseDirectiveCollectionResponse(input: unknown): DirectiveCollectionResponse {
  return DirectiveCollectionResponseSchema.parse(input);
}

export function validateDirectiveCreateRequest(input: unknown): boolean {
  return DirectiveCreateRequestSchema.safeParse(input).success;
}

export function validateDirectiveCommandRequest(input: unknown): boolean {
  return DirectiveCommandRequestSchema.safeParse(input).success;
}

export function validateDirectiveBatchRequest(input: unknown): boolean {
  return DirectiveBatchRequestSchema.safeParse(input).success;
}