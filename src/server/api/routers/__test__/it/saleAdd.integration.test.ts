import { InventoryLogActionType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { type AddSaleInferredInput } from "~/schema/saleInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { INVENTORY_LOG_INSUFFICIENT_STOCK } from "~/server/exceptions/message";
import { randomUUID } from "crypto";

const clearDatabase = async () => {
  await prisma.organization.deleteMany();
};

describe("addProduct", () => {
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await clearDatabase());

  it("should throw if user is not logged in", async () => {
    const caller = appRouter.createCaller({
      session: null,
      prisma,
    });

    const input: AddSaleInferredInput = {
      order: [
        {
          quantity: 1,
          sku: "test-sku",
          price: 1,
        },
      ],
    };

    try {
      await caller.sale.add(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should throw if user is not part of any organization", async () => {
    const caller = appRouter.createCaller({
      session: {
        expires: new Date().toISOString(),
        user: {
          id: "test-user-id",
        },
      },
      prisma,
    });

    const input: AddSaleInferredInput = {
      order: [
        {
          quantity: 1,
          sku: "test-sku",
          price: 1,
        },
      ],
    };

    try {
      await caller.sale.add(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should throw if at least one product have no sufficient stock", async () => {
    const createdAt = new Date();
    const transactionId = randomUUID().toString();

    const organization = await prisma.organization.create({
      data: {
        name: "test-organization",
        masterPin: "1234",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        brand: "test-brand",
        name: "test-name",
        organizationId: organization.id,
        productTypeId: productType.id,
      },
    });

    const productVariant = await prisma.productVariant.create({
      data: {
        price: 1,
        sku: "test-sku",
        productId: product.id,
      },
    });

    const productVariant2 = await prisma.productVariant.create({
      data: {
        price: 1,
        sku: "test-sku2",
        productId: product.id,
      },
    });

    await prisma.inventoryLog.createMany({
      data: [
        {
          action: InventoryLogActionType.INCOMING,
          quantity: 1,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          transactionId,
          createdAt,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          quantity: 1,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          transactionId,
          createdAt,
        },
        {
          action: InventoryLogActionType.INCOMING,
          quantity: 10,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          transactionId,
          createdAt,
        },
      ],
    });

    const caller = appRouter.createCaller({
      session: {
        expires: new Date().toISOString(),
        user: {
          id: "test-user-id",
          organizationId: organization.id,
        },
      },
      prisma,
    });

    const input: AddSaleInferredInput = {
      order: [
        {
          quantity: 1,
          sku: productVariant.sku,
          price: 1,
        },
        {
          quantity: 1,
          sku: productVariant2.sku,
          price: 1,
        },
      ],
    };

    try {
      await caller.sale.add(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", INVENTORY_LOG_INSUFFICIENT_STOCK);
    }
  });

  it("should return the count of the type of products added to the inventory log", async () => {
    const createdAt = new Date();
    const transactionId = randomUUID().toString();

    const organization = await prisma.organization.create({
      data: {
        name: "test-organization",
        masterPin: "1234",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        brand: "test-brand",
        name: "test-name",
        organizationId: organization.id,
        productTypeId: productType.id,
      },
    });

    const productVariant = await prisma.productVariant.create({
      data: {
        price: 1,
        sku: "test-sku",
        productId: product.id,
      },
    });

    const productVariant2 = await prisma.productVariant.create({
      data: {
        price: 1,
        sku: "test-sku2",
        productId: product.id,
      },
    });

    await prisma.inventoryLog.createMany({
      data: [
        {
          action: InventoryLogActionType.INCOMING,
          quantity: 10,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          transactionId,
          createdAt,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          quantity: 1,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          transactionId,
          createdAt,
        },
        {
          action: InventoryLogActionType.INCOMING,
          quantity: 10,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          transactionId,
          createdAt,
        },
      ],
    });

    const caller = appRouter.createCaller({
      session: {
        expires: new Date().toISOString(),
        user: {
          id: "test-user-id",
          organizationId: organization.id,
        },
      },
      prisma,
    });

    const input: AddSaleInferredInput = {
      order: [
        {
          quantity: 1,
          sku: productVariant.sku,
          price: 1,
        },
        {
          quantity: 1,
          sku: productVariant2.sku,
          price: 1,
        },
      ],
    };

    const result = await caller.sale.add(input);
    expect(result?.count).toEqual(2);
  });
});
