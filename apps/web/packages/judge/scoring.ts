import { z } from 'zod';

import {
  type EvidenceBatch,
  type EvidenceDirection,
  type EvidenceItem,
  EvidenceBatchSchema,
  EvidenceDirectionSchema,
  EvidenceItemSchema,
} from '../contracts/evidence';
import { validateEvidenceBatch } from '../validation/evidence.schema';

export const EvidenceScoreBreakdownSchema = z
  .object({
    confidence: z.number().finite().min(0).max(1),
    relevance: z.number().finite().min(0).max(1),
    integrity: z.number().finite().min(0).max(1),
    freshness: z.number().finite().min(0).max(1),
  })
  .strict();
export type EvidenceScoreBreakdown = z.infer<typeof EvidenceScoreBreakdownSchema>;

export const EvidenceScoreItemSchema = z
  .object({
    evidence_id: z.string().trim().min(1).max(128),
    direction: EvidenceDirectionSchema,
    verified: z.boolean(),
    contradicted: z.boolean(),
    breakdown: EvidenceScoreBreakdownSchema,
    final_score: z.number().finite().min(0).max(1),
  })
  .strict();
export type EvidenceScoreItem = z.infer<typeof EvidenceScoreItemSchema>;

export const EvidenceScoreBatchSchema = z
  .object({
    directive_id: z.string().trim().min(1).max(128),
    items: z.array(EvidenceScoreItemSchema),
    aggregate_score: z.number().finite().min(0).max(1),
    average_confidence: z.number().finite().min(0).max(1),
    average_relevance: z.number().finite().min(0).max(1),
    average_integrity: z.number().finite().min(0).max(1),
    average_freshness: z.number().finite().min(0).max(1),
    support_count: z.number().int().nonnegative(),
    oppose_count: z.number().int().nonnegative(),
    neutral_count: z.number().int().nonnegative(),
  })
  .strict();
export type EvidenceScoreBatch = z.infer<typeof EvidenceScoreBatchSchema>;

function normalizeUnitInterval(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Score value must be finite.');
  }

  if (value < 0) {
    return 0;
  }

  if (value > 1) {
    return 1;
  }

  return value;
}

function computeFreshnessScore(collectedAt: string): number {
  const collectedAtMs = Date.parse(collectedAt);

  if (Number.isNaN(collectedAtMs)) {
    throw new Error('Invalid evidence collected_at timestamp.');
  }

  const nowMs = Date.now();
  const ageMs = Math.max(0, nowMs - collectedAtMs);
  const ageDays = ageMs / 86_400_000;

  if (ageDays <= 1) {
    return 1;
  }

  if (ageDays >= 30) {
    return 0;
  }

  return normalizeUnitInterval(1 - ageDays / 30);
}

function average(values: readonly number[]): number {
  if (values.length === 0) {
    return 0;
  }

  const total = values.reduce((sum, value) => sum + value, 0);
  return normalizeUnitInterval(total / values.length);
}

function scoreDirection(direction: EvidenceDirection): number {
  switch (direction) {
    case 'SUPPORT':
      return 1;
    case 'NEUTRAL':
      return 0.75;
    case 'OPPOSE':
      return 0.9;
  }
}

export function scoreEvidenceItem(input: unknown): EvidenceScoreItem {
  const item: EvidenceItem = EvidenceItemSchema.parse(input);

  const freshness = computeFreshnessScore(item.collected_at);
  const confidence = normalizeUnitInterval(item.confidence);
  const relevance = normalizeUnitInterval(item.weight.relevance);
  const integrity = normalizeUnitInterval(item.weight.integrity);

  const rawScore =
    confidence * 0.35 +
    relevance * 0.25 +
    integrity * 0.25 +
    freshness * 0.15;

  const verificationMultiplier = item.verified ? 1 : 0;
  const contradictionMultiplier = item.contradicted === true ? 0 : 1;
  const directionMultiplier = scoreDirection(item.direction);

  const finalScore = normalizeUnitInterval(
    rawScore * verificationMultiplier * contradictionMultiplier * directionMultiplier,
  );

  return {
    evidence_id: item.id,
    direction: item.direction,
    verified: item.verified,
    contradicted: item.contradicted === true,
    breakdown: {
      confidence,
      relevance,
      integrity,
      freshness,
    },
    final_score: finalScore,
  };
}

export function scoreEvidenceBatch(input: unknown): EvidenceScoreBatch {
  if (!validateEvidenceBatch(input)) {
    throw new Error('Evidence batch failed validation.');
  }

  const batch: EvidenceBatch = EvidenceBatchSchema.parse(input);
  const items = batch.items.map((item) => scoreEvidenceItem(item));

  const supportCount = items.filter((item) => item.direction === 'SUPPORT').length;
  const opposeCount = items.filter((item) => item.direction === 'OPPOSE').length;
  const neutralCount = items.filter((item) => item.direction === 'NEUTRAL').length;

  return {
    directive_id: batch.directive_id,
    items,
    aggregate_score: average(items.map((item) => item.final_score)),
    average_confidence: average(items.map((item) => item.breakdown.confidence)),
    average_relevance: average(items.map((item) => item.breakdown.relevance)),
    average_integrity: average(items.map((item) => item.breakdown.integrity)),
    average_freshness: average(items.map((item) => item.breakdown.freshness)),
    support_count: supportCount,
    oppose_count: opposeCount,
    neutral_count: neutralCount,
  };
}

export function parseEvidenceScoreItem(input: unknown): EvidenceScoreItem {
  return EvidenceScoreItemSchema.parse(input);
}

export function parseEvidenceScoreBatch(input: unknown): EvidenceScoreBatch {
  return EvidenceScoreBatchSchema.parse(input);
}

export function validateEvidenceScoreItem(input: unknown): boolean {
  return EvidenceScoreItemSchema.safeParse(input).success;
}

export function validateEvidenceScoreBatch(input: unknown): boolean {
  return EvidenceScoreBatchSchema.safeParse(input).success;
}