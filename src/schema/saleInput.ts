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
  AppRouter["sale"]["add"]
>;
