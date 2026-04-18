export function createRequestId(prefix = 'req'): string {
  return `${prefix}_${crypto.randomUUID().replace(/-/g, '')}`;
}

export function createEntityId(prefix: string): string {
  if (!prefix || prefix.trim() === '') {
    throw new Error('Entity id prefix is required.');
  }

  return `${prefix.trim().toLowerCase()}_${crypto.randomUUID().replace(/-/g, '')}`;
}
