import { ProductType } from "@prisma/client";
import { z } from "zod";
import { PaginationSchema } from "./paginationInput";

export const GetAllProductInputSchema = z.object({
  type: z.string().refine((s) => s in ProductType, {
    message: "Invalid product type",
  }),
  pagination: PaginationSchema,
});

export type GetAllProductInput = z.infer<typeof GetAllProductInputSchema>;
