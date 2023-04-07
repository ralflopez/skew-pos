import {
  type DeleteProductInput,
  type AddProductInput,
} from "~/schema/productInput";
import { type Context } from "../api/trpc";
import { getOrganizationId } from "./utils/contextHelpers";
import { TRPCError } from "@trpc/server";

export const addProduct = async (
  ctx: Context,
  { brand, name, productTypeId }: AddProductInput
) => {
  const organizationId = getOrganizationId(ctx);

  const existing = await ctx.prisma.product.findFirst({
    where: { brand, name, productTypeId, organizationId },
  });

  if (existing) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "",
    });
  }

  return ctx.prisma.product.create({
    data: {
      brand,
      name,
      productTypeId,
      organizationId,
    },
  });
};

export const deleteProduct = async (
  ctx: Context,
  { id }: DeleteProductInput
) => {
  const organizationId = getOrganizationId(ctx);
  const product = await ctx.prisma.product.findFirst({
    where: {
      id,
      organizationId,
    },
  });

  if (!product) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "",
    });
  }

  return await ctx.prisma.product.delete({
    where: { id: product.id },
  });
};
