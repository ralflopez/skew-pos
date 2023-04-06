import { type Product as PrismaProduct, type Tire } from "@prisma/client";

export type Product = PrismaProduct | Tire;
