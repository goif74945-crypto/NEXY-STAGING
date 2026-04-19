import { z } from 'zod';

import {
  EvidenceBatchIdSchema,
  EvidenceBatchSchema,
  EvidenceDirectionSchema,
  EvidenceHashSchema,
  EvidenceIdSchema,
  EvidenceItemListSchema,
  EvidenceItemSchema,
  EvidenceReferenceKindSchema,
  EvidenceReferenceSchema,
  EvidenceSourceListSchema,
  EvidenceSourceSchema,
  EvidenceSourceTypeSchema,
  EvidenceWeightSchema,
} from '../contracts/evidence';

export const EvidenceIngestRequestSchema = z
  .object({
    batch: EvidenceBatchSchema,
  })
  .strict();
export type EvidenceIngestRequest = z.infer<typeof EvidenceIngestRequestSchema>;

export const EvidenceUpsertRequestSchema = z
  .object({
    item: EvidenceItemSchema,
  })
  .strict();
export type EvidenceUpsertRequest = z.infer<typeof EvidenceUpsertRequestSchema>;

export const EvidenceBatchLookupSchema = z
  .object({
    id: EvidenceBatchIdSchema,
  })
  .strict();
export type EvidenceBatchLookup = z.infer<typeof EvidenceBatchLookupSchema>;

export const EvidenceItemLookupSchema = z
  .object({
    id: EvidenceIdSchema,
  })
  .strict();
export type EvidenceItemLookup = z.infer<typeof EvidenceItemLookupSchema>;

export const EvidenceQuerySchema = z
  .object({
    id: EvidenceIdSchema.optional(),
    hash: EvidenceHashSchema.optional(),
    source_type: EvidenceSourceTypeSchema.optional(),
    direction: EvidenceDirectionSchema.optional(),
    reference_kind: EvidenceReferenceKindSchema.optional(),
    directive_id: z.string().trim().min(1).max(128).optional(),
  })
  .strict();
export type EvidenceQuery = z.infer<typeof EvidenceQuerySchema>;

export const EvidenceItemResponseSchema = z
  .object({
    data: EvidenceItemSchema,
  })
  .strict();
export type EvidenceItemResponse = z.infer<typeof EvidenceItemResponseSchema>;

export const EvidenceBatchResponseSchema = z
  .object({
    data: EvidenceBatchSchema,
  })
  .strict();
export type EvidenceBatchResponse = z.infer<typeof EvidenceBatchResponseSchema>;

export const EvidenceCollectionResponseSchema = z
  .object({
    data: EvidenceItemListSchema,
  })
  .strict();
export type EvidenceCollectionResponse = z.infer<typeof EvidenceCollectionResponseSchema>;

export const EvidenceSourceCollectionResponseSchema = z
  .object({
    data: EvidenceSourceListSchema,
  })
  .strict();
export type EvidenceSourceCollectionResponse = z.infer<typeof EvidenceSourceCollectionResponseSchema>;

export const EvidenceReferenceCollectionSchema = z.array(EvidenceReferenceSchema);
export type EvidenceReferenceCollection = z.infer<typeof EvidenceReferenceCollectionSchema>;

export const EvidenceWeightedItemSchema = z
  .object({
    item: EvidenceItemSchema,
    weight: EvidenceWeightSchema,
  })
  .strict();
export type EvidenceWeightedItem = z.infer<typeof EvidenceWeightedItemSchema>;

export const EvidenceWeightedItemListSchema = z.array(EvidenceWeightedItemSchema);
export type EvidenceWeightedItemList = z.infer<typeof EvidenceWeightedItemListSchema>;

export function parseEvidenceIngestRequest(input: unknown): EvidenceIngestRequest {
  return EvidenceIngestRequestSchema.parse(input);
}

export function parseEvidenceUpsertRequest(input: unknown): EvidenceUpsertRequest {
  return EvidenceUpsertRequestSchema.parse(input);
}

export function parseEvidenceBatchLookup(input: unknown): EvidenceBatchLookup {
  return EvidenceBatchLookupSchema.parse(input);
}

export function parseEvidenceItemLookup(input: unknown): EvidenceItemLookup {
  return EvidenceItemLookupSchema.parse(input);
}

export function parseEvidenceQuery(input: unknown): EvidenceQuery {
  return EvidenceQuerySchema.parse(input);
}

export function parseEvidenceItemResponse(input: unknown): EvidenceItemResponse {
  return EvidenceItemResponseSchema.parse(input);
}

export function parseEvidenceBatchResponse(input: unknown): EvidenceBatchResponse {
  return EvidenceBatchResponseSchema.parse(input);
}

export function validateEvidenceSource(input: unknown): boolean {
  return EvidenceSourceSchema.safeParse(input).success;
}

export function validateEvidenceReference(input: unknown): boolean {
  return EvidenceReferenceSchema.safeParse(input).success;
}

export function validateEvidenceItem(input: unknown): boolean {
  return EvidenceItemSchema.safeParse(input).success;
}

export function validateEvidenceBatch(input: unknown): boolean {
  return EvidenceBatchSchema.safeParse(input).success;
}