import { z } from 'zod';

export const storeQuantitySchema = z.object({
  storeId: z.string().uuid('Store ID must be a valid UUID'),
  quantity: z.number().min(0, 'Quantity must be non-negative').int('Quantity must be an integer'),
});

export const productFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Product name is required')
    .max(255, 'Product name must be 255 characters or less'),
  category: z
    .string()
    .min(1, 'Category is required')
    .max(100, 'Category must be 100 characters or less'),
  price: z
    .number()
    .min(0, 'Price must be non-negative')
    .max(999999.99, 'Price must be less than 1,000,000')
    .refine((val) => {
      // Check that price has at most 2 decimal places
      const decimalPlaces = (val.toString().split('.')[1] || '').length;
      return decimalPlaces <= 2;
    }, 'Price can have at most 2 decimal places'),
  stockQuantity: z
    .number()
    .min(0, 'Stock quantity must be non-negative')
    .int('Stock quantity must be an integer'),
});

// Schema for create with required stores
export const createProductFormSchema = productFormSchema;
export const updateProductFormSchema = productFormSchema;

export type ProductFormSchema = z.infer<typeof productFormSchema>;
export type CreateProductFormSchema = z.infer<typeof createProductFormSchema>;
export type UpdateProductFormSchema = z.infer<typeof updateProductFormSchema>;
