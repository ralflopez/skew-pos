import {
  AddProductInputSchema,
  DeleteProductInputSchema,
  EditProductInputSchema,
} from "~/schema/productInput";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  addProduct,
  deleteProduct,
  editProduct,
  getAllProductsWithVariants,
} from "~/server/services/productService";
import {
  addProductVariant,
  deleteProductVariant,
} from "~/server/services/productVariantService";
import {
  AddProductVariantInputSchema,
  DeleteProductVariantInputSchema,
} from "~/schema/productVariantInput";

export const productRouter = createTRPCRouter({
  add: protectedProcedure
    .input(AddProductInputSchema)
    .mutation(({ ctx, input }) => addProduct(ctx, input)),

  getAll: protectedProcedure.query(({ ctx }) =>
    getAllProductsWithVariants(ctx)
  ),

  edit: protectedProcedure
    .input(EditProductInputSchema)
    .mutation(({ ctx, input }) => editProduct(ctx, input)),

  delete: protectedProcedure
    .input(DeleteProductInputSchema)
    .mutation(({ ctx, input }) => deleteProduct(ctx, input)),

  addVariant: protectedProcedure
    .input(AddProductVariantInputSchema)
    .mutation(({ ctx, input }) => addProductVariant(ctx, input)),

  deleteVariant: protectedProcedure
    .input(DeleteProductVariantInputSchema)
    .mutation(({ ctx, input }) => deleteProductVariant(ctx, input)),
});
