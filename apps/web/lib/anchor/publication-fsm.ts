import { z } from 'zod';

export const AnchorPublicationTransitionSchema = z.enum([
  'propose',
  'sign',
  'finalize',
]);

export const AnchorPublicationStateSchema = z.enum([
  'proposed',
  'signed',
  'finalized',
]);

export type AnchorPublicationTransition = z.infer<
  typeof AnchorPublicationTransitionSchema
>;
export type AnchorPublicationState = z.infer<typeof AnchorPublicationStateSchema>;

export function reduceAnchorPublicationState(
  currentState: AnchorPublicationState | null,
  transition: AnchorPublicationTransition,
): AnchorPublicationState {
  const parsedTransition = AnchorPublicationTransitionSchema.parse(transition);

  if (parsedTransition === 'propose') {
    if (currentState !== null) {
      throw new Error('Illegal publication transition.');
    }

    return 'proposed';
  }

  if (parsedTransition === 'sign') {
    if (currentState !== 'proposed') {
      throw new Error('Illegal publication transition.');
    }

    return 'signed';
  }

  if (currentState !== 'signed') {
    throw new Error('Illegal publication transition.');
  }

  return 'finalized';
}

export function parseAnchorPublicationTransition(
  input: unknown,
): AnchorPublicationTransition {
  return AnchorPublicationTransitionSchema.parse(input);
}

export function parseAnchorPublicationState(input: unknown): AnchorPublicationState {
  return AnchorPublicationStateSchema.parse(input);
}
