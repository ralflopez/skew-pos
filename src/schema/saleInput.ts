import { type inferProcedureInput } from "@trpc/server";
import { z } from "zod";
import { type AppRouter } from "~/server/api/root";

export const AddSaleInputSchema = z.object({
  order: z
    .object({
      sku: z.string().nonempty(),
      quantity: z.number().min(1),
      price: z.number().min(1),
    })
    .array(),
});
export type AddSaleInput = z.infer<typeof AddSaleInputSchema>;

export type AddSaleInferredInput = inferProcedureInput<
  AppRouter["sales"]["add"]
>;

export const GetAllSaleInputSchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1),
});
export type GetAllSaleInput = z.infer<typeof GetAllSaleInputSchema>;
export type GetAllSaleInferredInput = inferProcedureInput<
  AppRouter["sales"]["getAll"]
>;
