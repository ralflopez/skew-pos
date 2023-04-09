import { InventoryLogActionType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { randomUUID } from "crypto";
import { type GetAllSaleInferredInput } from "~/schema/saleInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

const clearDatabase = async () => {
  await prisma.organization.deleteMany();
};

describe("getAllSales", () => {
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await clearDatabase());

  it("should throw if user is not logged in", async () => {
    const caller = appRouter.createCaller({
      session: null,
      prisma,
    });

    const input: GetAllSaleInferredInput = {
      limit: 10,
      page: 1,
    };

    try {
      await caller.sales.getAll(input);
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

    const input: GetAllSaleInferredInput = {
      limit: 10,
      page: 1,
    };

    try {
      await caller.sales.getAll(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should paginate", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "Test Organization",
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
        productTypeId: productType.id,
        organizationId: organization.id,
      },
    });

    const productVariant = await prisma.productVariant.create({
      data: {
        price: 1,
        productId: product.id,
        sku: "test-sku",
      },
    });

    const productVariant2 = await prisma.productVariant.create({
      data: {
        price: 1,
        productId: product.id,
        sku: "test-sku2",
      },
    });

    const transactionId = randomUUID();
    const transactionId2 = randomUUID();
    const transactionId3 = randomUUID();
    const transactionId4 = randomUUID();

    await prisma.inventoryLog.createMany({
      data: [
        {
          action: InventoryLogActionType.INCOMING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          quantity: 10,
          transactionId: randomUUID(),
        },
        {
          action: InventoryLogActionType.INCOMING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          quantity: 10,
          transactionId: randomUUID(),
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          quantity: 1,
          transactionId: transactionId,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          quantity: 1,
          transactionId: transactionId,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          quantity: 1,
          transactionId: transactionId2,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          quantity: 1,
          transactionId: transactionId3,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          quantity: 1,
          transactionId: transactionId4,
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

    const input: GetAllSaleInferredInput = {
      limit: 2,
      page: 1,
    };

    const result = await caller.sales.getAll(input);
    expect(result.length).toBe(2);

    const input2: GetAllSaleInferredInput = {
      limit: 2,
      page: 2,
    };

    const result2 = await caller.sales.getAll(input2);
    expect(result2.length).toBe(2);

    expect(result[0]?.transactionId).not.toBe(result2[0]?.transactionId);
    expect(result[1]?.transactionId).not.toBe(result2[1]?.transactionId);
  });

  it("should return the total value of the sale when getting", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "Test Organization",
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
        productTypeId: productType.id,
        organizationId: organization.id,
      },
    });

    const productVariant = await prisma.productVariant.create({
      data: {
        price: 1,
        productId: product.id,
        sku: "test-sku",
      },
    });

    const productVariant2 = await prisma.productVariant.create({
      data: {
        price: 1,
        productId: product.id,
        sku: "test-sku2",
      },
    });

    const productVariant3 = await prisma.productVariant.create({
      data: {
        price: 1,
        productId: product.id,
        sku: "test-sku3",
      },
    });

    const transactionId = randomUUID();

    await prisma.inventoryLog.createMany({
      data: [
        {
          action: InventoryLogActionType.INCOMING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant.sku,
          quantity: 10,
          transactionId: randomUUID(),
        },
        {
          action: InventoryLogActionType.INCOMING,
          organizationId: organization.id,
          price: 1,
          productVariantSku: productVariant2.sku,
          quantity: 10,
          transactionId: randomUUID(),
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 125,
          productVariantSku: productVariant.sku,
          quantity: 1,
          transactionId: transactionId,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 654,
          productVariantSku: productVariant2.sku,
          quantity: 1,
          transactionId: transactionId,
        },
        {
          action: InventoryLogActionType.OUTGOING,
          organizationId: organization.id,
          price: 8,
          productVariantSku: productVariant3.sku,
          quantity: 1,
          transactionId: transactionId,
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

    const input: GetAllSaleInferredInput = {
      limit: 2,
      page: 1,
    };

    const result = await caller.sales.getAll(input);
    expect(result[0]?.total).toBe(787);
  });
});
