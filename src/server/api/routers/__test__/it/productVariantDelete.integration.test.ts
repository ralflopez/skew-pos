import { AttributeType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  type DeleteProductVariantInferredInput,
  type DeleteProductVariantInput,
} from "~/schema/productVariantInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PRODUCT_NOT_FOUND } from "~/server/exceptions/message";

const clearDatabase = async () => {
  await prisma.organization.deleteMany();
};

describe("deleteProductVariant", () => {
  beforeEach(async () => await clearDatabase());
  afterAll(async () => await clearDatabase());

  it("should throw if user is not logged in", async () => {
    const caller = appRouter.createCaller({
      session: null,
      prisma,
    });

    const input: DeleteProductVariantInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.deleteVariant(input);
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

    const input: DeleteProductVariantInput = {
      id: "test-id",
    };

    try {
      await caller.product.deleteVariant(input);
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

    const input: DeleteProductVariantInferredInput = {
      id: "test-id",
    };

    try {
      await caller.product.deleteVariant(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", PRODUCT_NOT_FOUND);
    }
  });

  it("should return the deleted product variant", async () => {
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

    const input: DeleteProductVariantInferredInput = {
      id: productVariant.id,
    };

    const result = await caller.product.deleteVariant(input);
    expect(result).toStrictEqual(productVariant);
  });

  it("should delete the product variant details of the deleted product variant", async () => {
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

    const input: DeleteProductVariantInferredInput = {
      id: productVariant.id,
    };

    await caller.product.deleteVariant(input);

    const updatedProductVariants = await prisma.productVariant.findMany();
    expect(updatedProductVariants.length).toBe(0);

    const updatedProductVariantDetails =
      await prisma.productVariantDetails.findMany();
    expect(updatedProductVariantDetails.length).toBe(0);
  });
});
