import { z } from 'zod';

export const localeSchema = z.enum(['en', 'vi']);
export const createBookSchema = z.strictObject({
  title: z.string().trim().min(1).max(200),
  locale: localeSchema,
});
export const publicBookSchema = createBookSchema.extend({ id: z.number().int().positive() });
export type CreateBook = z.output<typeof createBookSchema>;
export type PublicBook = z.output<typeof publicBookSchema>;
