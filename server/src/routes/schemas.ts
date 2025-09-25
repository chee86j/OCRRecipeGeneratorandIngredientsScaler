import { z } from 'zod';

export const normalizedUnitSchema = z.enum([
  'tsp',
  'tbsp',
  'cup',
  'oz',
  'lb',
  'g',
  'kg',
  'ml',
  'l',
  'pinch',
  'dash',
  'to-taste'
]);

export const ingredientQuantitySchema = z.union([
  z.number(),
  z.object({ min: z.number(), max: z.number() }),
  z.null()
]);

export const ingredientSchema = z.object({
  raw: z.string(),
  quantity: ingredientQuantitySchema,
  unit: normalizedUnitSchema.nullable(),
  ingredient: z.string(),
  note: z.string().nullable().optional()
});

export const warningCodeSchema = z.enum([
  'missing-title',
  'missing-ingredients',
  'missing-instructions',
  'unknown-unit',
  'quantity-out-of-range',
  'unparsed-line',
  'empty-ingredient'
]);

export const warningSchema = z.object({
  code: warningCodeSchema,
  message: z.string(),
  pointer: z.string(),
  severity: z.enum(['info', 'warning', 'error'])
});

export const parsedRecipeSchema = z.object({
  id: z.string(),
  title: z.string(),
  sourceType: z.enum(['ocr', 'voice', 'manual', 'hybrid']),
  originalServings: z.number().nullable(),
  ingredients: z.array(ingredientSchema),
  instructions: z.array(z.string()),
  warnings: z.array(warningSchema),
  createdAt: z.string()
});
