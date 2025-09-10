import { z } from "zod";

export const posTopUpCreateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  dsmId: z.string().cuid(),
  memberId: z.string().cuid(),
  posId: z.string().cuid(),
  observations: z.string().optional(),
});

export const posTopUpReadSchema = z.object({
  id: z.string().cuid(),
});

export const posTopUpListSchema = z.object({
  posId: z.string().cuid().optional(),
  dsmId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});
