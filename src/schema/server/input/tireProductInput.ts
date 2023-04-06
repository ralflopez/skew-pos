import { z } from "zod";

export const AddTireInputSchema = z.object({
  brand: z.string(),
  name: z.string(),
  sku: z.string(),
  price: z.number().min(1),
  width: z.number().min(1),
  aspectRatio: z.number().min(1),
  rimDiameter: z.number().min(1),
});

export type AddTireInput = z.infer<typeof AddTireInputSchema>;

export const EditTireInputSchema = z.object({
  id: z.string(),
  brand: z.string().optional(),
  name: z.string().optional(),
  sku: z.string().optional(),
  price: z.number().optional(),
  width: z.number().optional(),
  aspectRatio: z.number().optional(),
  rimDiameter: z.number().optional(),
});

export type EditTireInput = z.infer<typeof EditTireInputSchema>;

export const DeleteTireInput = z.object({
  id: z.string(),
});

export type DeleteTireInput = z.infer<typeof DeleteTireInput>;
