import { type Context } from "../api/trpc";
import { getOrganizationId } from "./utils/contextHelpers";
import { TRPCError } from "@trpc/server";
import {
  DeleteProductVariantInput,
  type AddProductVariantInput,
} from "~/schema/productVariantInput";
import { PRODUCT_VARIANT_PRODUCT_NOT_FOUND } from "../exceptions/message";
import { validateProductTypeAttributes } from "./productTypeService";

export const addProductVariant = async (
  ctx: Context,
  { details, price, productId, sku }: AddProductVariantInput
) => {
  const organizationId = getOrganizationId(ctx);

  const product = await ctx.prisma.product.findFirst({
    where: { id: productId, organizationId },
    select: {
      id: true,
      productType: {
        include: {
          attributes: true,
        },
      },
    },
  });

  if (!product) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: PRODUCT_VARIANT_PRODUCT_NOT_FOUND,
    });
  }

  await validateProductTypeAttributes(ctx, product.productType.id, details);

  return ctx.prisma.productVariant.create({
    data: {
      price,
      sku,
      productId,
      details: {
        createMany: {
          data: details,
        },
      },
    },
    include: {
      details: true,
    },
  });
};

export const deleteProductVariant = async (
  ctx: Context,
  { id }: DeleteProductVariantInput
) => {
  const organizationId = getOrganizationId(ctx);
  const productVariant = await ctx.prisma.productVariant.findFirst({
    where: {
      id,
      product: {
        organizationId,
      },
    },
  });

  if (!productVariant) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "",
    });
  }

  return await ctx.prisma.product.delete({
    where: { id: productVariant.id },
  });
};
