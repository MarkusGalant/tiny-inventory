import { z } from 'zod';

export const storeFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Store name is required')
    .max(255, 'Store name must be 255 characters or less'),
  address: z
    .string()
    .max(500, 'Address must be 500 characters or less')
    .optional()
    .or(z.literal('')),
});

// Schema for create with required fields
export const createStoreFormSchema = storeFormSchema;
export const updateStoreFormSchema = storeFormSchema;

export type StoreFormSchema = z.infer<typeof storeFormSchema>;
export type CreateStoreFormSchema = z.infer<typeof createStoreFormSchema>;
export type UpdateStoreFormSchema = z.infer<typeof updateStoreFormSchema>;
