import { z } from 'zod';

export const PrismaClientDescriptorSchema = z
  .object({
    provider: z.literal('postgresql'),
    client: z.literal('prisma-client-js'),
    runtime: z.literal('descriptor-only'),
  })
  .strict();

export type PrismaClientDescriptor = z.infer<typeof PrismaClientDescriptorSchema>;

export function createPrismaClientDescriptor(): PrismaClientDescriptor {
  return PrismaClientDescriptorSchema.parse({
    provider: 'postgresql',
    client: 'prisma-client-js',
    runtime: 'descriptor-only',
  });
}
