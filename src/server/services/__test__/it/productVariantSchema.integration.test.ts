import { prisma } from "~/server/db";

describe("product variant relationship", () => {
  it("should remove ProductVariants and ProductVariantDetails when Product is deleted", async () => {
    await prisma.productVariantDetails.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.productType.deleteMany();
    await prisma.organization.deleteMany();

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

    const productTypeAttribute = await prisma.productTypeAttribute.create({
      data: {
        name: "test-product-type",
        type: "NUMBER",
        productTypeId: productType.id,
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

    await prisma.productVariant.create({
      data: {
        price: 1,
        sku: "test-sku",
        details: {
          create: {
            attributeId: productTypeAttribute.id,
            valueNumber: 1,
          },
        },
        productId: product.id,
      },
    });

    const result = await prisma.product.delete({
      where: { id: product.id },
    });
    expect(result).toBeTruthy();

    const productVariants = await prisma.productVariant.findMany();
    expect(productVariants.length).toEqual(0);

    const productVariantsDetails =
      await prisma.productVariantDetails.findMany();
    expect(productVariantsDetails.length).toEqual(0);

    await prisma.productTypeAttribute.deleteMany();
    await prisma.productType.deleteMany();
    await prisma.organization.deleteMany();
  });
});
