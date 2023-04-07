import { TRPCError } from "@trpc/server";
import { type EditProductInferredInput } from "~/schema/productInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PRODUCT_NOT_FOUND } from "~/server/exceptions/message";

const clearDatabase = async () => {
  await prisma.organization.deleteMany();
};

describe("editProduct", () => {
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await clearDatabase());

  it("should throw if user is not logged in", async () => {
    const caller = appRouter.createCaller({
      session: null,
      prisma,
    });

    const input: EditProductInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.edit(input);
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

    const input: EditProductInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.edit(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should throw when editing a product that doesn't exists", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test-organization",
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

    const input: EditProductInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.edit(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", PRODUCT_NOT_FOUND);
    }
  });

  it("should return the edited product", async () => {
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

    const product = await prisma.product.create({
      data: {
        brand: "test-brand",
        name: "test-name",
        organizationId: organization.id,
        productTypeId: productType.id,
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

    const input: EditProductInferredInput = {
      id: product.id,
      name: "test-edited-name",
    };

    const result = await caller.product.edit(input);
    expect(result).toEqual(
      expect.objectContaining({
        name: "test-edited-name",
      })
    );
  });

  it("should keep original values when editing a product with undefined input values", async () => {
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

    const product = await prisma.product.create({
      data: {
        brand: "test-brand",
        name: "test-name",
        organizationId: organization.id,
        productTypeId: productType.id,
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

    const input: EditProductInferredInput = {
      id: product.id,
      name: "test-edited-name",
    };

    const result = await caller.product.edit(input);
    expect(result.brand).toEqual(product.brand);
  });
});
