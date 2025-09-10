import { z } from "zod";

export const dsmTopUpCreateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  dsmId: z.string().cuid(),
  memberId: z.string().cuid(),
  observations: z.string().optional(),
});

export const dsmTopUpReadSchema = z.object({
  id: z.string().cuid(),
});

export const dsmTopUpListSchema = z.object({
  dsmId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
