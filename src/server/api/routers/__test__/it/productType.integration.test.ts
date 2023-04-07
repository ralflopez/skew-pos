import { prisma } from "~/server/db";
import { appRouter } from "~/server/api/root";
import {
  type EditProductTypeInferredInput,
  type AddProductTypeInferredInput,
  type DeleteProductTypeInferredInput,
} from "~/schema/productTypeInput";
import { TRPCError } from "@trpc/server";
import { AttributeType } from "@prisma/client";

describe("productTypeService", () => {
  beforeEach(async () => {
    await prisma.organization.deleteMany();
  });

  afterEach(async () => {
    await prisma.organization.deleteMany();
  });

  describe("add", () => {
    it("should throw if user is not logged in", async () => {
      const caller = appRouter.createCaller({
        session: null,
        prisma,
      });

      const input: AddProductTypeInferredInput = {
        name: "test-product-type-input",
      };

      try {
        await caller.productType.add(input);
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

      const input: AddProductTypeInferredInput = {
        name: "test-product-type-input",
      };

      try {
        await caller.productType.add(input);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e).toHaveProperty("code", "UNAUTHORIZED");
      }
    });

    it("should throw if product type already exists in an organization", async () => {
      const organization = await prisma.organization.create({
        data: {
          masterPin: "1234",
          name: "test organization",
        },
      });

      await prisma.productType.create({
        data: {
          name: "test-product-type-input",
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

      const input: AddProductTypeInferredInput = {
        name: "test-product-type-input",
      };

      try {
        await caller.productType.add(input);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e).toHaveProperty("code", "CONFLICT");
      }
    });

    it("should create a product if a product type doesn't exist", async () => {
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

      const input: AddProductTypeInferredInput = {
        name: "test-product-type-input",
      };

      await caller.productType.add(input);
      const databaseContent = await prisma.productType.findMany({
        where: {
          organizationId: organization.id,
        },
      });

      expect(databaseContent.length).toBe(1);
    });
  });

  describe("getAll", () => {
    it("should throw if user is not logged in", async () => {
      const caller = appRouter.createCaller({
        session: null,
        prisma,
      });

      try {
        await caller.productType.getAll();
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
        await caller.productType.getAll();
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e).toHaveProperty("code", "UNAUTHORIZED");
      }
    });

    it("should return only the product types for the users organization", async () => {
      const organization = await prisma.organization.create({
        data: {
          masterPin: "1234",
          name: "test organization",
        },
      });

      const differentOrganization = await prisma.organization.create({
        data: {
          masterPin: "1234",
          name: "test organization 2",
        },
      });

      await prisma.productType.createMany({
        data: [
          {
            name: "test-product-1",
            organizationId: organization.id,
          },
          {
            name: "test-product-2",
            organizationId: organization.id,
          },
          {
            name: "test-product-3",
            organizationId: organization.id,
          },
          {
            name: "product-1",
            organizationId: differentOrganization.id,
          },
          {
            name: "product-2",
            organizationId: differentOrganization.id,
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

      const result = await caller.productType.getAll();
      expect(result.length).toBe(3);
    });
  });

  describe("edit", () => {
    it("should throw if user is not logged in", async () => {
      const caller = appRouter.createCaller({
        session: null,
        prisma,
      });

      const input: EditProductTypeInferredInput = {
        id: "product-type-id",
        name: "New Tire Name",
        attributes: [
          {
            name: "width",
            type: "NUMBER",
          },
          {
            name: "aspectRatio",
            type: "NUMBER",
          },
          {
            name: "rimDiameter",
            type: "NUMBER",
          },
        ],
      };

      try {
        await caller.productType.edit(input);
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

      const input: EditProductTypeInferredInput = {
        id: "product-type-id",
        name: "New Tire Name",
        attributes: [
          {
            name: "width",
            type: "NUMBER",
          },
          {
            name: "aspectRatio",
            type: "NUMBER",
          },
          {
            name: "rimDiameter",
            type: "NUMBER",
          },
        ],
      };

      try {
        await caller.productType.edit(input);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e).toHaveProperty("code", "UNAUTHORIZED");
      }
    });

    it("should throw when editing a product type that doesn't exists", async () => {
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

      const input: EditProductTypeInferredInput = {
        id: "product-type-id",
        name: "New Tire Name",
        attributes: [
          {
            name: "width",
            type: "NUMBER",
          },
          {
            name: "aspectRatio",
            type: "NUMBER",
          },
          {
            name: "rimDiameter",
            type: "NUMBER",
          },
        ],
      };

      try {
        await caller.productType.edit(input);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e).toHaveProperty("code", "NOT_FOUND");
      }
    });

    it("should update keep product type name when name input is blank", async () => {
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

      const input: EditProductTypeInferredInput = {
        id: productType.id,
        attributes: [
          {
            name: "width",
            type: "NUMBER",
          },
          {
            name: "aspectRatio",
            type: "NUMBER",
          },
          {
            name: "rimDiameter",
            type: "NUMBER",
          },
        ],
      };

      const newProductType = await caller.productType.edit(input);

      expect(newProductType?.name).toEqual(productType.name);
    });

    it("should update all given data", async () => {
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

      const input: EditProductTypeInferredInput = {
        id: productType.id,
        attributes: [
          {
            name: "width",
            type: AttributeType.NUMBER,
          },
          {
            name: "aspectRatio",
            type: AttributeType.NUMBER,
          },
          {
            name: "rimDiameter",
            type: AttributeType.TEXT,
          },
        ],
      };

      const newProductType = await caller.productType.edit(input);

      expect(newProductType?.name).toEqual(productType.name);
      expect(newProductType?.attributes.length).toEqual(3);
      newProductType?.attributes.forEach((p) => {
        expect(p).toHaveProperty("name");
        expect(p).toHaveProperty("type");
      });
    });
  });

  describe("delete", () => {
    it("should throw if user is not logged in", async () => {
      const caller = appRouter.createCaller({
        session: null,
        prisma,
      });

      const input: DeleteProductTypeInferredInput = {
        id: "product-type-id",
      };

      try {
        await caller.productType.delete(input);
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

      const input: DeleteProductTypeInferredInput = {
        id: "product-type-id",
      };

      try {
        await caller.productType.delete(input);
        expect(true).toBe(false);
      } catch (e) {
        expect(e).toBeInstanceOf(TRPCError);
        expect(e).toHaveProperty("code", "UNAUTHORIZED");
      }
    });

    it("should delete existing product type within an organization", async () => {
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

      const input: DeleteProductTypeInferredInput = {
        id: productType.id,
      };

      const res = await caller.productType.delete(input);
      expect(res).toHaveProperty("id");
    });

    it("should return null when no product type matches an id to be deleted", async () => {
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

      const input: DeleteProductTypeInferredInput = {
        id: "product-test-id",
      };

      const res = await caller.productType.delete(input);
      expect(res).toBeNull();
    });
  });
});
