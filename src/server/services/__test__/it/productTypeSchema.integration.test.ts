import { prisma } from "~/server/db";

describe("productType relationship", () => {
  it("should remove ProductTypeAttributes if ProductType is removed", async () => {
    await prisma.productTypeAttribute.deleteMany();
    await prisma.productType.deleteMany();

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

    await prisma.productTypeAttribute.create({
      data: {
        name: "test-product-type",
        type: "NUMBER",
        productTypeId: productType.id,
      },
    });

    const result = await prisma.productType.delete({
      where: { id: productType.id },
    });
    expect(result).toBeTruthy();

    const productTypeAttributes = await prisma.productTypeAttribute.findMany();
    expect(productTypeAttributes.length).toBe(0);
  });
});
