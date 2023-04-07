import { type inferProcedureInput } from "@trpc/server";
import { z } from "zod";
import { type AppRouter } from "~/server/api/root";

export const AddProductVariantInputSchema = z.object({
  productId: z.string().nonempty(),
  sku: z.string().nonempty(),
  price: z.number().min(0),
  details: z
    .object({
      attributeId: z.string().nonempty(),
      valueText: z.string().optional(),
      valueNumber: z.number().optional(),
    })
    .array(),
});
export type AddProductVariantInput = z.infer<
  typeof AddProductVariantInputSchema
>;
export type AddProductVariantInferredInput = inferProcedureInput<
  AppRouter["product"]["addVariant"]
>;

export const DeleteProductVariantInputSchema = z.object({
  id: z.string().nonempty(),
});
export type DeleteProductVariantInput = z.infer<
  typeof DeleteProductVariantInputSchema
>;
export type DeleteProductVariantInferredInput = inferProcedureInput<
  AppRouter["product"]["deleteVariant"]
>;
