import { TRPCError } from "@trpc/server";
import { type DeleteProductInferredInput } from "~/schema/productInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PRODUCT_NOT_FOUND } from "~/server/exceptions/message";

const clearDatabase = async () => {
  await prisma.organization.deleteMany();
};

describe("deleteProduct", () => {
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await clearDatabase());

  it("should throw if user is not logged in", async () => {
    const caller = appRouter.createCaller({
      session: null,
      prisma,
    });

    const input: DeleteProductInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.delete(input);
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

    const input: DeleteProductInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.delete(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should throw when deleting a product that doesn't exists", async () => {
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

    const input: DeleteProductInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.delete(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", PRODUCT_NOT_FOUND);
    }
  });

  it("should return the deleted product", async () => {
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

    const input: DeleteProductInferredInput = {
      id: product.id,
    };

    const result = await caller.product.delete(input);
    expect(result).toStrictEqual(product);
  });
});
