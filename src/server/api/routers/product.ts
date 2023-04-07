import { AddProductInputSchema } from "~/schema/productInput";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { addProduct } from "~/server/services/productService";
import { addProductVariant } from "~/server/services/productVariantService";
import { AddProductVariantInputSchema } from "~/schema/productVariantInput";

export const productRouter = createTRPCRouter({
  add: protectedProcedure
    .input(AddProductInputSchema)
    .mutation(({ ctx, input }) => addProduct(ctx, input)),

  addVariant: protectedProcedure
    .input(AddProductVariantInputSchema)
    .mutation(({ ctx, input }) => addProductVariant(ctx, input)),
});
