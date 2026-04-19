import { z } from 'zod';

import { RoleSchema, TimestampIsoSchema } from './state';

export const DirectiveIdSchema = z.string().trim().min(1).max(128);
export type DirectiveId = z.infer<typeof DirectiveIdSchema>;

export const ProjectIdSchema = z.string().trim().min(1).max(128);
export type ProjectId = z.infer<typeof ProjectIdSchema>;

export const ArtifactIdSchema = z.string().trim().min(1).max(128);
export type ArtifactId = z.infer<typeof ArtifactIdSchema>;

export const DirectiveInputTypeValues = ['TEXT', 'STRUCTURED_JSON'] as const;
export const DirectiveInputTypeSchema = z.enum(DirectiveInputTypeValues);
export type DirectiveInputType = z.infer<typeof DirectiveInputTypeSchema>;

export const DirectiveModeValues = ['fast', 'strict', 'audit'] as const;
export const DirectiveModeSchema = z.enum(DirectiveModeValues);
export type DirectiveMode = z.infer<typeof DirectiveModeSchema>;

export const DirectivePriorityValues = ['LOW', 'NORMAL', 'HIGH', 'CRITICAL'] as const;
export const DirectivePrioritySchema = z.enum(DirectivePriorityValues);
export type DirectivePriority = z.infer<typeof DirectivePrioritySchema>;

export const DirectiveSourceValues = ['OPERATOR', 'API', 'SYSTEM', 'SCHEDULED'] as const;
export const DirectiveSourceSchema = z.enum(DirectiveSourceValues);
export type DirectiveSource = z.infer<typeof DirectiveSourceSchema>;

export const DirectiveConstraintSchema = z
  .object({
    max_tokens: z.number().int().positive(),
    allow_external: z.boolean(),
    deterministic_required: z.boolean(),
  })
  .strict();
export type DirectiveConstraint = z.infer<typeof DirectiveConstraintSchema>;

export const DirectiveMetadataSchema = z
  .object({
    created_at: TimestampIsoSchema,
    operator_id: z.string().trim().min(1).max(128),
    requested_by_role: RoleSchema,
    schema_version: z.string().trim().min(1).max(64),
    idempotency_key: z.string().trim().min(1).max(128),
    source: DirectiveSourceSchema,
  })
  .strict();
export type DirectiveMetadata = z.infer<typeof DirectiveMetadataSchema>;

export const DirectiveSchema = z
  .object({
    id: DirectiveIdSchema,
    project_id: ProjectIdSchema,
    artifact_id: ArtifactIdSchema.optional(),
    input: z.string().trim().min(1),
    input_type: DirectiveInputTypeSchema,
    mode: DirectiveModeSchema,
    priority: DirectivePrioritySchema,
    constraints: DirectiveConstraintSchema,
    metadata: DirectiveMetadataSchema,
  })
  .strict();
export type Directive = z.infer<typeof DirectiveSchema>;

export const DirectiveListSchema = z.array(DirectiveSchema);
export type DirectiveList = z.infer<typeof DirectiveListSchema>;

export const DirectiveCommandTypeValues = [
  'RUN',
  'VERIFY',
  'FREEZE',
  'LOCK',
  'EXPORT',
  'KILL',
] as const;
export const DirectiveCommandTypeSchema = z.enum(DirectiveCommandTypeValues);
export type DirectiveCommandType = z.infer<typeof DirectiveCommandTypeSchema>;

export const DirectiveCommandSchema = z
  .object({
    command: DirectiveCommandTypeSchema,
    directive: DirectiveSchema,
  })
  .strict();
export type DirectiveCommand = z.infer<typeof DirectiveCommandSchema>;

export const DirectiveAcceptedResponseDataSchema = z
  .object({
    directive_id: DirectiveIdSchema,
    state: z.literal('ACCEPTED'),
  })
  .strict();
export type DirectiveAcceptedResponseData = z.infer<typeof DirectiveAcceptedResponseDataSchema>;

export const DirectiveRejectedResponseDataSchema = z
  .object({
    directive_id: DirectiveIdSchema,
    state: z.literal('REJECTED'),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();
export type DirectiveRejectedResponseData = z.infer<typeof DirectiveRejectedResponseDataSchema>;

export const parseDirective = (input: unknown): Directive => DirectiveSchema.parse(input);

export const parseDirectiveCommand = (input: unknown): DirectiveCommand =>
  DirectiveCommandSchema.parse(input);