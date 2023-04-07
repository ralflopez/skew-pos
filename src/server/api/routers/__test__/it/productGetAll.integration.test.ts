import { AttributeType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";

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

    try {
      await caller.product.getAll();
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

    try {
      await caller.product.getAll();
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should return only the products of the users organization", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test-organization",
      },
    });

    const otherOrganization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test-other-organization",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const otherProductType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: otherOrganization.id,
      },
    });

    await prisma.product.createMany({
      data: [
        {
          brand: "test-brand",
          name: "test-name-1",
          productTypeId: productType.id,
          organizationId: organization.id,
        },
        {
          brand: "test-brand",
          name: "test-name-2",
          productTypeId: productType.id,
          organizationId: organization.id,
        },
        {
          brand: "test-brand",
          name: "test-name-3",
          productTypeId: otherProductType.id,
          organizationId: otherOrganization.id,
        },
        {
          brand: "test-brand",
          name: "test-name-4",
          productTypeId: otherProductType.id,
          organizationId: otherOrganization.id,
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

    const result = await caller.product.getAll();
    expect(result.length).toEqual(2);
  });

  it("should return the products with variants", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test-organization",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const productTypeAttribute = await prisma.productTypeAttribute.create({
      data: {
        name: "width",
        type: AttributeType.NUMBER,
        productTypeId: productType.id,
      },
    });

    const product = await prisma.product.create({
      data: {
        brand: "test-brand",
        name: "test-name-1",
        productTypeId: productType.id,
        organizationId: organization.id,
      },
    });

    const productVariant = await prisma.productVariant.create({
      data: {
        price: 1,
        sku: "test-sku",
        productId: product.id,
      },
    });

    await prisma.productVariantDetails.create({
      data: {
        attributeId: productTypeAttribute.id,
        valueNumber: 1,
        variantId: productVariant.id,
      },
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

    const result = await caller.product.getAll();
    expect(result.length).toEqual(1);
    expect(result[0]?.variants).toBeTruthy();
    expect(result[0]?.variants.length).toEqual(1);
    expect(result[0]?.variants[0]?.details).toBeTruthy();
  });
});
