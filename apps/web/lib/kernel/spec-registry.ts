import { z } from 'zod';

export const SpecRegistryItemSchema = z
  .object({
    spec_id: z.string().trim().min(1).max(256),
    version: z.string().trim().min(1).max(128),
    spec_hash: z.string().trim().min(1).max(256),
    locked: z.boolean(),
  })
  .strict();

export const SpecRegistrySchema = z
  .object({
    items: z.array(SpecRegistryItemSchema),
  })
  .strict();

export type SpecRegistryItem = z.infer<typeof SpecRegistryItemSchema>;
export type SpecRegistry = z.infer<typeof SpecRegistrySchema>;

function sameRegistryKey(left: SpecRegistryItem, right: SpecRegistryItem): boolean {
  return left.spec_id === right.spec_id && left.version === right.version;
}

export function parseSpecRegistry(input: unknown): SpecRegistry {
  return SpecRegistrySchema.parse(input);
}

export function validateSpecRegistry(input: unknown): boolean {
  return SpecRegistrySchema.safeParse(input).success;
}

export function upsertSpecRegistryItem(
  registry: SpecRegistry,
  item: SpecRegistryItem,
): SpecRegistry {
  const parsedRegistry = parseSpecRegistry(registry);
  const parsedItem = SpecRegistryItemSchema.parse(item);

  const existingIndex = parsedRegistry.items.findIndex((entry) =>
    sameRegistryKey(entry, parsedItem),
  );

  if (existingIndex === -1) {
    return {
      items: [
        ...parsedRegistry.items.map((entry) => ({
          spec_id: entry.spec_id,
          version: entry.version,
          spec_hash: entry.spec_hash,
          locked: entry.locked,
        })),
        {
          spec_id: parsedItem.spec_id,
          version: parsedItem.version,
          spec_hash: parsedItem.spec_hash,
          locked: parsedItem.locked,
        },
      ],
    };
  }

  return {
    items: parsedRegistry.items.map((entry, index) => {
      if (index !== existingIndex) {
        return {
          spec_id: entry.spec_id,
          version: entry.version,
          spec_hash: entry.spec_hash,
          locked: entry.locked,
        };
      }

      return {
        spec_id: parsedItem.spec_id,
        version: parsedItem.version,
        spec_hash: parsedItem.spec_hash,
        locked: parsedItem.locked,
      };
    }),
  };
}
