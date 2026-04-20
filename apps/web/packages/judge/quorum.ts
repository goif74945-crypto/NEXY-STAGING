import { z } from 'zod';

import {
  type ConsensusVote,
  ConsensusThresholdUsedSchema,
  ConsensusVoteSchema,
} from '../contracts/consensus';
import { guardQuorumSatisfied } from '../core/guards';

export const QuorumInputSchema = z
  .object({
    votes: z.array(ConsensusVoteSchema),
    threshold_used: ConsensusThresholdUsedSchema,
  })
  .strict();
export type QuorumInput = z.infer<typeof QuorumInputSchema>;

export const QuorumTallySchema = z
  .object({
    support_count: z.number().int().nonnegative(),
    opposition_count: z.number().int().nonnegative(),
    abstain_count: z.number().int().nonnegative(),
    participating_count: z.number().int().nonnegative(),
    required_quorum: z.number().int().positive(),
    quorum_satisfied: z.boolean(),
    majority_support: z.boolean(),
    supporting_agents: z.array(z.string().trim().min(1).max(128)),
    opposing_agents: z.array(z.string().trim().min(1).max(128)),
    abstaining_agents: z.array(z.string().trim().min(1).max(128)),
  })
  .strict();
export type QuorumTally = z.infer<typeof QuorumTallySchema>;

function deduplicateVotes(votes: readonly ConsensusVote[]): ConsensusVote[] {
  const seen = new Set<string>();
  const unique: ConsensusVote[] = [];

  for (const vote of votes) {
    if (seen.has(vote.agent_id)) {
      throw new Error(`Duplicate vote detected for agent ${vote.agent_id}.`);
    }

    seen.add(vote.agent_id);
    unique.push(vote);
  }

  return unique;
}

export function tallyQuorum(input: unknown): QuorumTally {
  const parsed = QuorumInputSchema.parse(input);
  const votes = deduplicateVotes(parsed.votes);

  const supportingAgents = votes
    .filter((vote) => vote.vote === 'SUPPORT')
    .map((vote) => vote.agent_id);

  const opposingAgents = votes
    .filter((vote) => vote.vote === 'OPPOSE')
    .map((vote) => vote.agent_id);

  const abstainingAgents = votes
    .filter((vote) => vote.vote === 'ABSTAIN')
    .map((vote) => vote.agent_id);

  const participatingCount = votes.length;
  const supportCount = supportingAgents.length;
  const oppositionCount = opposingAgents.length;
  const abstainCount = abstainingAgents.length;

  const quorumGuard = guardQuorumSatisfied(
    participatingCount,
    parsed.threshold_used.quorum_min,
  );

  return {
    support_count: supportCount,
    opposition_count: oppositionCount,
    abstain_count: abstainCount,
    participating_count: participatingCount,
    required_quorum: parsed.threshold_used.quorum_min,
    quorum_satisfied: quorumGuard.passed,
    majority_support: supportCount > oppositionCount,
    supporting_agents: supportingAgents,
    opposing_agents: opposingAgents,
    abstaining_agents: abstainingAgents,
  };
}

export function parseQuorumInput(input: unknown): QuorumInput {
  return QuorumInputSchema.parse(input);
}

export function parseQuorumTally(input: unknown): QuorumTally {
  return QuorumTallySchema.parse(input);
}

export function validateQuorumInput(input: unknown): boolean {
  return QuorumInputSchema.safeParse(input).success;
}

export function validateQuorumTally(input: unknown): boolean {
  return QuorumTallySchema.safeParse(input).success;
}