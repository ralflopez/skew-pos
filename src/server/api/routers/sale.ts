import { AddSaleInputSchema } from "~/schema/saleInput";
import { createTRPCRouter, protectedProcedure } from "../trpc";
import { addSales } from "~/server/services/salesService";

export const salesRouter = createTRPCRouter({
  add: protectedProcedure
    .input(AddSaleInputSchema)
    .mutation(({ ctx, input }) => addSales(ctx, input)),
});
