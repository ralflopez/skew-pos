import { TRPCError } from "@trpc/server";
import { type Context } from "~/server/api/trpc";

export const getOrganizationId = (ctx: Context): string => {
  const organizationId = ctx.session?.user.organizationId;
  if (!organizationId) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "No organization found for this account",
    });
  }

  return organizationId;
};
