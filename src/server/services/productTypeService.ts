import { Prisma, type ProductType } from "@prisma/client";
import { type Context } from "../api/trpc";
import { TRPCError } from "@trpc/server";
import {
  type EditProductTypeInput,
  type AddProductTypeInput,
  type DeleteProductTypeInput,
} from "~/schema/productTypeInput";
import { getOrganizationId } from "./utils/contextHelpers";

export const addProductType = async (
  ctx: Context,
  { name }: AddProductTypeInput
): Promise<ProductType> => {
  const organizationId = getOrganizationId(ctx);

  const existing = await ctx.prisma.productType.findFirst({
    where: { name, organizationId },
  });

  if (existing) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `Type: ${name} already exists`,
    });
  }

  return ctx.prisma.productType.create({
    data: {
      name,
      organizationId,
    },
  });
};

export const getAllProductTypesWithAttributes = async (ctx: Context) => {
  const organizationId = getOrganizationId(ctx);

  return ctx.prisma.productType.findMany({
    where: {
      organizationId,
    },
    include: {
      attributes: true,
    },
  });
};

export const editProductType = async (
  ctx: Context,
  { id, name, attributes }: EditProductTypeInput
) => {
  const organizationId = getOrganizationId(ctx);

  // update name
  try {
    await ctx.prisma.productType.update({
      where: { id },
      data: {
        name,
      },
    });
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2025")
        throw new TRPCError({
          code: "NOT_FOUND",
          message: `Product with id: ${id} not found`,
        });
    } else {
      throw e;
    }
  }

  // update attributes
  await ctx.prisma.productTypeAttribute.deleteMany({
    where: {
      productTypeId: id,
      productType: {
        organizationId,
      },
    },
  });

  await ctx.prisma.productTypeAttribute.createMany({
    data: attributes.map((a) => ({ ...a, productTypeId: id })),
  });

  return ctx.prisma.productType.findFirst({
    where: {
      id,
      AND: {
        organizationId: {
          equals: organizationId,
        },
      },
    },
    select: {
      id: true,
      name: true,
      organizationId: true,
      attributes: true,
    },
  });
};

export const deleteProductType = async (
  ctx: Context,
  { id }: DeleteProductTypeInput
) => {
  const organizationId = getOrganizationId(ctx);
  return ctx.prisma.productType.findFirst({ where: { id, organizationId } });
};
