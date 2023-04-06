import { ProductType, type Tire } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import {
  type EditTireInput,
  type AddTireInput,
  type DeleteTireInput,
} from "~/schema/server/input/tireProductInput";
import { type Context } from "~/server/api/trpc";

export const addTire = async (
  ctx: Context,
  { aspectRatio, brand, name, price, rimDiameter, sku, width }: AddTireInput
): Promise<Tire> => {
  return ctx.prisma.tire.create({
    data: {
      aspectRatio,
      rimDiameter,
      width,
      product: {
        create: {
          brand,
          name,
          price,
          sku,
          type: ProductType.Tire,
        },
      },
    },
  });
};

export const editTire = async (
  ctx: Context,
  {
    id,
    brand,
    name,
    price,
    sku,
    aspectRatio,
    rimDiameter,
    width,
  }: EditTireInput
): Promise<Tire> => {
  const tire = await ctx.prisma.tire.findFirst({
    where: {
      id,
    },
  });

  if (!tire)
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Tire does not exist`,
    });

  const updatedTire = await ctx.prisma.tire.update({
    data: {
      aspectRatio,
      rimDiameter,
      width,
      product: {
        update: {
          brand,
          name,
          price,
          sku,
        },
      },
    },
    where: { id },
  });

  return updatedTire;
};

export const deleteTire = async (
  ctx: Context,
  { id }: DeleteTireInput
): Promise<Tire> => {
  return await ctx.prisma.tire.delete({
    where: {
      id,
    },
  });
};
