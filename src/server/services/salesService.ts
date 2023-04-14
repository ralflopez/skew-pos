import { type GetAllSaleInput, type AddSaleInput } from "~/schema/saleInput";
import { type Context } from "../api/trpc";
import { getOrganizationId } from "./utils/contextHelpers";
import { InventoryLogActionType, type Prisma } from "@prisma/client";
import { INVENTORY_LOG_INSUFFICIENT_STOCK } from "../exceptions/message";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";

export const addSales = async (ctx: Context, { order }: AddSaleInput) => {
  const organizationId = getOrganizationId(ctx);
  const invalidSKUsQuantity = await getInvalidSKUQuantity(
    ctx,
    organizationId,
    order.map((o) => o.sku)
  );

  if (invalidSKUsQuantity.length > 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: INVENTORY_LOG_INSUFFICIENT_STOCK,
    });
  }

  const createdAt = new Date();
  const transactionId = randomUUID().toString();

  const data: Prisma.Enumerable<Prisma.InventoryLogCreateManyInput> = order.map(
    ({ price, quantity, sku: productVariantSku }) => ({
      action: InventoryLogActionType.OUTGOING,
      organizationId,
      price,
      quantity,
      productVariantSku,
      createdAt,
      transactionId,
    })
  );

  return await ctx.prisma.inventoryLog.createMany({
    data,
  });
};

export const getAllSalesWithPagination = async (
  ctx: Context,
  { limit, page }: GetAllSaleInput
) => {
  const organizationId = getOrganizationId(ctx);
  const result = await ctx.prisma.inventoryLog.groupBy({
    by: ["transactionId", "createdAt"],
    _sum: {
      price: true,
    },
    where: {
      action: InventoryLogActionType.OUTGOING,
      organizationId,
      isVoid: false,
    },
    orderBy: { createdAt: "desc" },
    take: limit,
    skip: page === 1 ? 0 : (page - 1) * limit,
  });

  return result.map((r) => ({
    transactionId: r.transactionId,
    createdAt: r.createdAt,
    total: r._sum.price,
  }));
};

export const voidSales = async (ctx: Context, transactionId: string) => {
  const organizationId = getOrganizationId(ctx);
  return ctx.prisma.inventoryLog.updateMany({
    data: {
      isVoid: true,
    },
    where: { transactionId, organizationId },
  });
};

const getInvalidSKUQuantity = async (
  ctx: Context,
  organizationId: string,
  SKUs: string[]
): Promise<string[]> => {
  const stocks = await ctx.prisma.inventoryLog.groupBy({
    by: ["productVariantSku", "action"],
    _sum: {
      quantity: true,
    },
    where: {
      productVariantSku: { in: SKUs },
      organizationId,
    },
  });

  const stockQuantityMap: Map<string, number> = new Map();
  stocks.forEach((s) => {
    const key = s.productVariantSku;
    const value: number =
      s.action === InventoryLogActionType.INCOMING
        ? s._sum.quantity || 0
        : -(s._sum.quantity || 0);

    const current = stockQuantityMap.get(key);
    if (!current) {
      stockQuantityMap.set(key, value);
      return;
    }

    stockQuantityMap.set(key, current + value);
  });

  const invalidSKUs: string[] = [];
  stockQuantityMap.forEach((val, key) => {
    if (val < 1) {
      invalidSKUs.push(key);
    }
  });

  return invalidSKUs;
};
