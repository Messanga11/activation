import { z } from "zod";

export const idSchema = z.string().cuid();
export const emailSchema = z.string().email();
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
