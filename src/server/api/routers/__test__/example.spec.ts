import { type Example, type PrismaClient } from "@prisma/client";
import { appRouter, type AppRouter } from "../../root";
import { createInnerTRPCContext } from "../../trpc";
import type { inferProcedureInput } from "@trpc/server";
import { mockDeep } from "jest-mock-extended";
import { type Session } from "next-auth";

describe("example", () => {
  describe("hello test", () => {
    it("should return a greeting", async () => {
      const caller = appRouter.createCaller(
        createInnerTRPCContext({
          session: null,
        })
      );

      type Input = inferProcedureInput<AppRouter["example"]["hello"]>;

      const input: Input = {
        text: "test",
      };

      const result = await caller.example.hello(input);

      expect(result).toStrictEqual({
        greeting: "Hello test",
      });
    });
  });

  describe("get all", () => {
    it("should return all", async () => {
      const prismaMock = mockDeep<PrismaClient>();

      const mockOutput: Example[] = [
        {
          id: "test-user-id",
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      prismaMock.example.findMany.mockResolvedValue(mockOutput);

      const caller = appRouter.createCaller(
        createInnerTRPCContext({ session: null, prisma: prismaMock })
      );

      const result = await caller.example.getAll();

      expect(result).toHaveLength(mockOutput.length);
      expect(result).toStrictEqual(mockOutput);
    });
  });

  describe("get secret message", () => {
    it("should return secret message", async () => {
      const prismaMock = mockDeep<PrismaClient>();
      const mockSession: Session = {
        expires: new Date().toISOString(),
        user: { id: "test-user-id", name: "Test User" },
      };

      const caller = appRouter.createCaller({
        session: mockSession,
        prisma: prismaMock,
      });

      const result = await caller.example.getSecretMessage();

      expect(result).toBe("you can now see this secret message!");
    });
  });
});
