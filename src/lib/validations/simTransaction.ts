import { z } from "zod";

export const simTransactionCreateSchema = z.object({
  range: z.string().min(1, "Range is required"),
  quantity: z.number().int().positive("Quantity must be positive"),
  memberId: z.string().cuid(),
});

export const simTransactionReadSchema = z.object({
  id: z.string().cuid(),
});

export const simTransactionListSchema = z.object({
  memberId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
