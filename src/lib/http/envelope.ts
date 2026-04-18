export type EnvelopeStatus = 'OK' | 'ERROR';

export type EnvelopeError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
};

export type Envelope<T> = {
  status: EnvelopeStatus;
  requestId: string;
  data: T;
  error: EnvelopeError | null;
};

export function makeEnvelope<T>(args: {
  status: EnvelopeStatus;
  requestId: string;
  data: T;
  error?: EnvelopeError | null;
}): Envelope<T> {
  return {
    status: args.status,
    requestId: args.requestId,
    data: args.data,
    error: args.error ?? null,
  };
}
