import {
  AddProductTypeInputSchema,
  DeleteProductTypeInputSchema,
  EditProductTypeInputSchema,
} from "~/schema/productTypeInput";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  addProductType,
  deleteProductType,
  editProductType,
  getAllProductTypesWithAttributes,
} from "~/server/services/productTypeService";

export const productTypeRouter = createTRPCRouter({
  add: protectedProcedure
    .input(AddProductTypeInputSchema)
    .mutation(({ ctx, input }) => addProductType(ctx, input)),

  getAll: protectedProcedure.query(({ ctx }) =>
    getAllProductTypesWithAttributes(ctx)
  ),

  edit: protectedProcedure
    .input(EditProductTypeInputSchema)
    .mutation(({ ctx, input }) => editProductType(ctx, input)),

  delete: protectedProcedure
    .input(DeleteProductTypeInputSchema)
    .mutation(({ ctx, input }) => deleteProductType(ctx, input)),
});
