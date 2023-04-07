import { TRPCError } from "@trpc/server";
import { type AddProductInferredInput } from "~/schema/productInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PRODUCT_ALREADY_EXISTS } from "~/server/exceptions/message";

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

    const input: AddProductInferredInput = {
      brand: "test-brand",
      name: "test-name",
      productTypeId: "test-product-type-id",
    };

    try {
      await caller.product.add(input);
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

    const input: AddProductInferredInput = {
      brand: "test-brand",
      name: "test-name",
      productTypeId: "test-product-type-id",
    };

    try {
      await caller.product.add(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should throw when adding a product that already exists", async () => {
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

    await prisma.product.create({
      data: {
        brand: "test-brand",
        name: "test-name",
        productTypeId: productType.id,
        organizationId: organization.id,
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

    const input: AddProductInferredInput = {
      brand: "test-brand",
      name: "test-name",
      productTypeId: productType.id,
    };

    try {
      await caller.product.add(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", PRODUCT_ALREADY_EXISTS);
    }
  });

  it("should return the created product", async () => {
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

    const input: AddProductInferredInput = {
      brand: "test-brand",
      name: "test-name",
      productTypeId: productType.id,
    };

    const result = await caller.product.add(input);
    expect(result).toEqual(expect.objectContaining(input));
  });
});
