import { z } from "zod";

export const PaginationSchema = z
  .object({
    page: z.number().min(0),
    limit: z.number().min(0),
  })
  .optional();

export type PaginationInput = z.infer<typeof PaginationSchema>;
