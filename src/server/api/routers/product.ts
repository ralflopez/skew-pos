import { createTRPCRouter, publicProcedure } from "../trpc";
import { GetAllProductInputSchema } from "~/schema/server/input/productInput";
import { AddTireInputSchema } from "~/schema/server/input/tireProductInput";
import { getAllProducts } from "~/server/services/productService";
import { addTire } from "~/server/services/products/tireProductService";

export const productRouter = createTRPCRouter({
  add: publicProcedure.input(AddTireInputSchema).mutation(({ ctx, input }) => {
    return addTire(ctx, input);
  }),
  getAll: publicProcedure
    .input(GetAllProductInputSchema)
    .query(({ ctx, input }) => {
      return getAllProducts(ctx, input);
    }),
});
