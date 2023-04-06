import { type Context } from "../api/trpc";
import { type GetAllProductInput } from "~/schema/server/input/productInput";
import { ProductType } from "@prisma/client";
import { type Product } from "~/types/product";

export const getAllProducts = async (
  ctx: Context,
  input: GetAllProductInput
): Promise<Product[]> => {
  switch (input.type) {
    case ProductType.Tire:
      return ctx.prisma.tire.findMany({
        take: input.pagination?.limit,
        skip: input.pagination?.page,
      });
    default:
      return ctx.prisma.product.findMany({
        take: input.pagination?.limit,
        skip: input.pagination?.page,
      });
  }
};
