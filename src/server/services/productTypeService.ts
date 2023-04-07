import { AttributeType, Prisma, type ProductType } from "@prisma/client";
import { type Context } from "../api/trpc";
import { TRPCError } from "@trpc/server";
import {
  type EditProductTypeInput,
  type AddProductTypeInput,
  type DeleteProductTypeInput,
} from "~/schema/productTypeInput";
import { getOrganizationId } from "./utils/contextHelpers";
import { type AddProductVariantInput } from "~/schema/productVariantInput";
import {
  PRODUCT_TYPE_ATTRIBUTE_MANY_COLUMNS_DEFINED,
  PRODUCT_VARIANT_DETAIL_COLUMN_VALUE_NOT_FOUND,
  PRODUCT_TYPE_INVALID_ATTRIBUTES,
} from "../exceptions/message";

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

export const validateProductTypeAttributes = async (
  ctx: Context,
  productTypeId: string,
  details: AddProductVariantInput["details"]
) => {
  const attributes = await ctx.prisma.productTypeAttribute.findMany({
    where: {
      productTypeId,
    },
  });

  const validAttributeIds = attributes.map((a) => a.id);
  const hasInvalidAttributes =
    details.filter((d) => !validAttributeIds.includes(d.attributeId)).length >
    0;
  if (hasInvalidAttributes) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: PRODUCT_TYPE_INVALID_ATTRIBUTES,
    });
  }

  const hasValueInAllColumns =
    details.filter((d) => {
      const attribute = attributes.find((a) => a.id === d.attributeId);
      if (!attribute) return true;
      return d.valueNumber && d.valueText;
    }).length > 0;

  if (hasValueInAllColumns) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: PRODUCT_TYPE_ATTRIBUTE_MANY_COLUMNS_DEFINED,
    });
  }

  const hasNoValueInCorrectColumn =
    details.filter((d) => {
      const attribute = attributes.find((a) => a.id === d.attributeId);
      if (!attribute) return true;
      if (attribute.type === AttributeType.NUMBER)
        return !d.valueNumber && d.valueText;
      else return d.valueNumber && !d.valueText;
    }).length > 0;

  if (hasNoValueInCorrectColumn) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: PRODUCT_VARIANT_DETAIL_COLUMN_VALUE_NOT_FOUND,
    });
  }
};
