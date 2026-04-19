import { z } from 'zod';

import { EvidenceBatchSchema, EvidenceItemSchema } from './evidence';

export const ConsensusAgentIdSchema = z.string().trim().min(1).max(128);
export type ConsensusAgentId = z.infer<typeof ConsensusAgentIdSchema>;

export const ConsensusDecisionValues = ['ACCEPT', 'REJECT', 'FREEZE'] as const;
export const ConsensusDecisionSchema = z.enum(ConsensusDecisionValues);
export type ConsensusDecision = z.infer<typeof ConsensusDecisionSchema>;

export const ConsensusVoteValueValues = ['SUPPORT', 'OPPOSE', 'ABSTAIN'] as const;
export const ConsensusVoteValueSchema = z.enum(ConsensusVoteValueValues);
export type ConsensusVoteValue = z.infer<typeof ConsensusVoteValueSchema>;

export const ConsensusThresholdUsedSchema = z
  .object({
    confidence_min: z.number().finite().min(0).max(1),
    deterministic_match_min: z.number().finite().min(0).max(1),
    quorum_min: z.number().int().positive(),
  })
  .strict();
export type ConsensusThresholdUsed = z.infer<typeof ConsensusThresholdUsedSchema>;

export const ConsensusVoteSchema = z
  .object({
    agent_id: ConsensusAgentIdSchema,
    vote: ConsensusVoteValueSchema,
    reason: z.string().trim().min(1).max(4096),
    evidence_ids: z.array(z.string().trim().min(1).max(128)),
  })
  .strict();
export type ConsensusVote = z.infer<typeof ConsensusVoteSchema>;

export const ConsensusSupportSchema = z
  .object({
    count: z.number().int().nonnegative(),
    votes: z.array(ConsensusVoteSchema),
  })
  .strict();
export type ConsensusSupport = z.infer<typeof ConsensusSupportSchema>;

export const ConsensusOppositionSchema = z
  .object({
    count: z.number().int().nonnegative(),
    votes: z.array(ConsensusVoteSchema),
  })
  .strict();
export type ConsensusOpposition = z.infer<typeof ConsensusOppositionSchema>;

export const ConsensusFreezeContractSchema = z
  .object({
    should_freeze: z.boolean(),
    freeze_code: z.string().trim().min(1).max(128).optional(),
    reason: z.string().trim().min(1).max(4096).optional(),
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.should_freeze && (!value.freeze_code || !value.reason)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'freeze_code and reason are required when should_freeze is true.',
      });
    }
  });
export type ConsensusFreezeContract = z.infer<typeof ConsensusFreezeContractSchema>;

export const ConsensusConflictReportSchema = z
  .object({
    conflicting_agents: z.array(ConsensusAgentIdSchema).min(1),
    reason: z.string().trim().min(1).max(4096),
  })
  .strict();
export type ConsensusConflictReport = z.infer<typeof ConsensusConflictReportSchema>;

export const ConsensusResultSchema = z
  .object({
    accepted: z.boolean(),
    releaseable: z.boolean(),
    output: z.string().optional(),
    confidence: z.number().finite().min(0).max(1),
    deterministic_match_score: z.number().finite().min(0).max(1),
    participating_agents: z.array(ConsensusAgentIdSchema),
    excluded_agents: z.array(ConsensusAgentIdSchema),
    evidence: z.array(EvidenceItemSchema),
    threshold_used: ConsensusThresholdUsedSchema,
    decision_reason: z.string().trim().min(1).max(4096),
    conflict_report: ConsensusConflictReportSchema.optional(),
    decision: ConsensusDecisionSchema,
    support: ConsensusSupportSchema,
    opposition: ConsensusOppositionSchema,
    freeze: ConsensusFreezeContractSchema,
  })
  .strict()
  .superRefine((value, ctx) => {
    if (value.participating_agents.length < value.threshold_used.quorum_min) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'participating_agents must satisfy quorum_min.',
        path: ['participating_agents'],
      });
    }

    if (value.decision === 'FREEZE' && !value.freeze.should_freeze) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'freeze.should_freeze must be true when decision is FREEZE.',
        path: ['freeze'],
      });
    }

    if (value.decision !== 'FREEZE' && value.freeze.should_freeze) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'freeze.should_freeze must be false when decision is not FREEZE.',
        path: ['freeze'],
      });
    }
  });
export type ConsensusResult = z.infer<typeof ConsensusResultSchema>;

export const ConsensusBatchSchema = z
  .object({
    evidence_batch: EvidenceBatchSchema,
    result: ConsensusResultSchema,
  })
  .strict();
export type ConsensusBatch = z.infer<typeof ConsensusBatchSchema>;

export const parseConsensusResult = (input: unknown): ConsensusResult =>
  ConsensusResultSchema.parse(input);