import {
  type DeleteProductInput,
  type AddProductInput,
  type EditProductInput,
} from "~/schema/productInput";
import { type Context } from "../api/trpc";
import { getOrganizationId } from "./utils/contextHelpers";
import { TRPCError } from "@trpc/server";
import {
  PRODUCT_ALREADY_EXISTS,
  PRODUCT_NOT_FOUND,
} from "../exceptions/message";

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
      message: PRODUCT_ALREADY_EXISTS,
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

export const getAllProductsWithVariants = async (ctx: Context) => {
  const organizationId = getOrganizationId(ctx);

  return await ctx.prisma.product.findMany({
    where: { organizationId },
    include: {
      variants: {
        include: {
          details: true,
        },
      },
    },
  });
};

export const editProduct = async (
  ctx: Context,
  { brand, id, name }: EditProductInput
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
      message: PRODUCT_NOT_FOUND,
    });
  }

  return ctx.prisma.product.update({
    data: {
      brand,
      name,
    },
    where: { id: product.id },
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
      message: PRODUCT_NOT_FOUND,
    });
  }

  return await ctx.prisma.product.delete({
    where: { id: product.id },
  });
};
