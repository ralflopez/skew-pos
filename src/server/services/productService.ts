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
import {
  ProductWithVariants,
  ProductVariant,
  ProductVariantDetail,
} from "~/types/product";

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

export const getAllProductsWithVariants = async (
  ctx: Context
): Promise<ProductWithVariants[]> => {
  const organizationId = getOrganizationId(ctx);

  const result = await ctx.prisma.product.findMany({
    where: { organizationId },
    include: {
      productType: true,
      variants: {
        include: {
          details: {
            include: {
              attribute: true,
            },
          },
          product: true,
        },
      },
    },
  });

  return result.map((product) => {
    return {
      brand: product.brand,
      id: product.id,
      name: product.name,
      productType: product.productType.name,
      productTypeId: product.productType.id,
      variants: product.variants.map((variant) => {
        return {
          id: variant.id,
          price: variant.price,
          productId: variant.productId,
          sku: variant.sku,
          product,
          details: variant.details.map((detail) => {
            return {
              attribute: detail.attribute.name,
              value:
                detail.attribute.type === "NUMBER"
                  ? detail.valueNumber || 0
                  : detail.valueText || "",
            };
          }),
        };
      }),
    };
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
