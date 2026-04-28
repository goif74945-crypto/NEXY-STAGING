import { OutputClassSchema, type OutputClass } from '@/lib/types/output-class';

export function formatEpochMs(epochMs: number): string {
  if (!Number.isInteger(epochMs) || epochMs < 0) {
    throw new Error('epochMs must be a non-negative integer.');
  }

  return `${epochMs}ms`;
}

export function formatCount(count: number): string {
  if (!Number.isInteger(count) || count < 0) {
    throw new Error('count must be a non-negative integer.');
  }

  return String(count);
}

export function formatBoolean(value: boolean): string {
  return value ? 'true' : 'false';
}

export function formatOutputClass(outputClass: OutputClass): string {
  return OutputClassSchema.parse(outputClass);
}
