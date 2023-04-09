import { AddSaleInputSchema, GetAllSaleInputSchema } from "~/schema/saleInput";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import {
  addSales,
  getAllSalesWithPagination,
} from "~/server/services/salesService";

export const salesRouter = createTRPCRouter({
  add: protectedProcedure
    .input(AddSaleInputSchema)
    .mutation(({ ctx, input }) => addSales(ctx, input)),
  getAll: protectedProcedure
    .input(GetAllSaleInputSchema)
    .mutation(({ ctx, input }) => getAllSalesWithPagination(ctx, input)),
});
