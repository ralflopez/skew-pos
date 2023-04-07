import { type inferProcedureInput } from "@trpc/server";
import { z } from "zod";
import { type AppRouter } from "~/server/api/root";

export const AddProductInputSchema = z.object({
  brand: z.string().nonempty(),
  name: z.string().nonempty(),
  productTypeId: z.string().nonempty(),
});
export type AddProductInput = z.infer<typeof AddProductInputSchema>;
export type AddProductInferredInput = inferProcedureInput<
  AppRouter["product"]["add"]
>;

export const DeleteProductInputSchema = z.object({
  id: z.string(),
});
export type DeleteProductInput = z.infer<typeof DeleteProductInputSchema>;
export type DeleteProductInferredInput = inferProcedureInput<
  AppRouter["product"]["delete"]
>;
