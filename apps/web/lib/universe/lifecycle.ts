import { z } from 'zod';

export const UniverseLifecycleStateSchema = z.enum([
  'created',
  'running',
  'paused',
  'quarantined',
  'stopped',
  'terminated',
]);

export const UniverseLifecycleTransitionSchema = z.enum([
  'start',
  'pause',
  'quarantine',
  'stop',
  'terminate',
]);

export type UniverseLifecycleState = z.infer<typeof UniverseLifecycleStateSchema>;
export type UniverseLifecycleTransition = z.infer<
  typeof UniverseLifecycleTransitionSchema
>;

export function parseUniverseLifecycleState(
  input: unknown,
): UniverseLifecycleState {
  return UniverseLifecycleStateSchema.parse(input);
}

export function parseUniverseLifecycleTransition(
  input: unknown,
): UniverseLifecycleTransition {
  return UniverseLifecycleTransitionSchema.parse(input);
}

export function reduceUniverseLifecycleState(
  currentState: UniverseLifecycleState,
  transition: UniverseLifecycleTransition,
): UniverseLifecycleState {
  const parsedState = parseUniverseLifecycleState(currentState);
  const parsedTransition = parseUniverseLifecycleTransition(transition);

  if (parsedTransition === 'terminate') {
    if (parsedState === 'terminated') {
      throw new Error('Illegal universe lifecycle transition.');
    }

    return 'terminated';
  }

  if (parsedTransition === 'start') {
    if (
      parsedState === 'created' ||
      parsedState === 'paused' ||
      parsedState === 'stopped'
    ) {
      return 'running';
    }

    throw new Error('Illegal universe lifecycle transition.');
  }

  if (parsedTransition === 'pause') {
    if (parsedState === 'running') {
      return 'paused';
    }

    throw new Error('Illegal universe lifecycle transition.');
  }

  if (parsedTransition === 'quarantine') {
    if (
      parsedState === 'created' ||
      parsedState === 'running' ||
      parsedState === 'paused' ||
      parsedState === 'stopped'
    ) {
      return 'quarantined';
    }

    throw new Error('Illegal universe lifecycle transition.');
  }

  if (
    parsedState === 'running' ||
    parsedState === 'paused' ||
    parsedState === 'quarantined'
  ) {
    return 'stopped';
  }

  throw new Error('Illegal universe lifecycle transition.');
}
