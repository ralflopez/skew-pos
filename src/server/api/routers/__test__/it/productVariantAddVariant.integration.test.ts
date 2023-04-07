import { AttributeType } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { type AddProductVariantInferredInput } from "~/schema/productVariantInput";
import { appRouter } from "~/server/api/root";
import { prisma } from "~/server/db";
import { PRODUCT_TYPE_INVALID_ATTRIBUTES } from "~/server/exceptions/message";
import {
  PRODUCT_TYPE_ATTRIBUTE_MANY_COLUMNS_DEFINED,
  PRODUCT_VARIANT_DETAIL_COLUMN_VALUE_NOT_FOUND,
  PRODUCT_VARIANT_PRODUCT_NOT_FOUND,
} from "~/server/exceptions/message";

describe("addVariant", () => {
  beforeEach(async () => {
    await prisma.product.deleteMany();
    await prisma.productType.deleteMany();
    await prisma.organization.deleteMany();
  });

  afterEach(async () => {
    await prisma.product.deleteMany();
    await prisma.productType.deleteMany();
    await prisma.organization.deleteMany();
  });

  it("should throw if user is not logged in", async () => {
    const caller = appRouter.createCaller({
      session: null,
      prisma,
    });

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: "test-attribute-id",
          valueNumber: 0,
          valueText: "test-value",
        },
      ],
      price: 100,
      productId: "test-product-id",
      sku: "test-sku",
    };

    try {
      await caller.product.addVariant(input);
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

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: "test-attribute-id",
          valueNumber: 0,
          valueText: "test-value",
        },
      ],
      price: 100,
      productId: "test-product-id",
      sku: "test-sku",
    };

    try {
      await caller.product.addVariant(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "UNAUTHORIZED");
    }
  });

  it("should throw if product doesn't exist", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test organization",
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

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: "test-attribute-id",
          valueNumber: 0,
          valueText: "test-value",
        },
      ],
      price: 100,
      productId: "test-product-id",
      sku: "test-sku",
    };

    try {
      await caller.product.addVariant(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", PRODUCT_VARIANT_PRODUCT_NOT_FOUND);
    }
  });

  it("should throw if there are invalid attributes in input", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test organization",
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

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: "test-invalid-attribute-id",
          valueText: "test-value",
        },
      ],
      price: 100,
      productId: product.id,
      sku: "test-sku",
    };

    try {
      await caller.product.addVariant(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty("message", PRODUCT_TYPE_INVALID_ATTRIBUTES);
    }
  });

  it("should throw if both valueText and valueNumber have values", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test organization",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const widthAttribute = await prisma.productTypeAttribute.create({
      data: {
        name: "width",
        productTypeId: productType.id,
        type: AttributeType.NUMBER,
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

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: widthAttribute.id,
          valueNumber: 1,
          valueText: "test-value",
        },
      ],
      price: 100,
      productId: product.id,
      sku: "test-sku",
    };

    try {
      await caller.product.addVariant(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty(
        "message",
        PRODUCT_TYPE_ATTRIBUTE_MANY_COLUMNS_DEFINED
      );
    }
  });

  it("should throw if there is no value found in the correct column", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test organization",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const widthAttribute = await prisma.productTypeAttribute.create({
      data: {
        name: "width",
        productTypeId: productType.id,
        type: AttributeType.NUMBER,
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

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: widthAttribute.id,
          valueText: "1",
        },
      ],
      price: 100,
      productId: product.id,
      sku: "test-sku",
    };

    try {
      await caller.product.addVariant(input);
      expect(true).toBe(false);
    } catch (e) {
      expect(e).toBeInstanceOf(TRPCError);
      expect(e).toHaveProperty("code", "BAD_REQUEST");
      expect(e).toHaveProperty(
        "message",
        PRODUCT_VARIANT_DETAIL_COLUMN_VALUE_NOT_FOUND
      );
    }
  });

  it("should return the productVariant with its details after creating", async () => {
    const organization = await prisma.organization.create({
      data: {
        masterPin: "1234",
        name: "test organization",
      },
    });

    const productType = await prisma.productType.create({
      data: {
        name: "Tire",
        organizationId: organization.id,
      },
    });

    const widthAttribute = await prisma.productTypeAttribute.create({
      data: {
        name: "width",
        productTypeId: productType.id,
        type: AttributeType.NUMBER,
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

    const input: AddProductVariantInferredInput = {
      details: [
        {
          attributeId: widthAttribute.id,
          valueNumber: 1,
        },
      ],
      price: 100,
      productId: product.id,
      sku: "test-sku",
    };

    const result = await caller.product.addVariant(input);

    expect(result).toEqual(
      expect.objectContaining({
        price: 100,
        sku: "test-sku",
      })
    );
    expect(result).toHaveProperty("details");
  });
});
