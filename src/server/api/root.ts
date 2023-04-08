import { createTRPCRouter } from "~/server/api/trpc";
import { exampleRouter } from "~/server/api/routers/example";
import { productTypeRouter } from "./routers/productType";
import { productRouter } from "./routers/product";
import { salesRouter } from "./routers/sale";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  example: exampleRouter,
  productType: productTypeRouter,
  product: productRouter,
  sales: salesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
