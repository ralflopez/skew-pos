import { type inferProcedureInput } from "@trpc/server";
import { z } from "zod";
import { type AppRouter } from "~/server/api/root";

export const AddProductTypeInputSchema = z.object({
  name: z.string(),
});
export type AddProductTypeInput = z.infer<typeof AddProductTypeInputSchema>;
export type AddProductTypeInferredInput = inferProcedureInput<
  AppRouter["productType"]["add"]
>;

export const EditProductTypeInputSchema = z.object({
  id: z.string(),
  name: z.string().optional(),
  attributes: z
    .object({
      name: z.string(),
      type: z.enum(["NUMBER", "TEXT"]),
    })
    .array(),
});
export type EditProductTypeInput = z.infer<typeof EditProductTypeInputSchema>;
export type EditProductTypeInferredInput = inferProcedureInput<
  AppRouter["productType"]["edit"]
>;

export const DeleteProductTypeInputSchema = z.object({
  id: z.string(),
});
export type DeleteProductTypeInput = z.infer<
  typeof DeleteProductTypeInputSchema
>;
export type DeleteProductTypeInferredInput = inferProcedureInput<
  AppRouter["productType"]["delete"]
>;
