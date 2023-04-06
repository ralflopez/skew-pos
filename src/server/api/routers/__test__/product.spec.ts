import { TRPCError, inferProcedureInput } from "@trpc/server";
import { AppRouter, appRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";
import { ZodError } from "zod";
import { mockDeep } from "jest-mock-extended";
import { PrismaClient, Product } from "@prisma/client";

describe("product router", () => {
  describe("getAll", () => {
    it("should throw if the type is invalid", async () => {
      const caller = appRouter.createCaller(
        createInnerTRPCContext({
          session: null,
        })
      );

      type Input = inferProcedureInput<AppRouter["product"]["getAll"]>;

      const input: Input = {
        type: "INVALID",
      };

      await expect(caller.product.getAll(input)).rejects.toThrow(TRPCError);
    });

    it("should return all products if page and limit is undefined", async () => {
      const prismaMock = mockDeep<PrismaClient>();

      const mockOutput: Product[] = [
        {
          brand: "Brand X",
          id: "cuid",
          name: "Test",
          price: 100,
          sku: "SKU",
          type: "Tire",
        },
      ];

      prismaMock.product.findMany.mockResolvedValue(mockOutput);

      const caller = appRouter.createCaller(
        createInnerTRPCContext({ session: null, prisma: prismaMock })
      );
      type Input = inferProcedureInput<AppRouter["product"]["getAll"]>;
      const input: Input = {
        type: "Tire",
      };

      const result = await caller.product.getAll(input);

      expect(result).toHaveLength(mockOutput.length);
      expect(result).toStrictEqual(mockOutput);
    });
  });
});
