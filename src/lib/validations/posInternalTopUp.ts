import { z } from "zod";

export const posInternalTopUpListSchema = z.object({
  posId: z.string().optional(),
  page: z.number().default(1),
  limit: z.number().default(20),
  search: z.string().optional(),
});

export const posInternalTopUpCreateSchema = z.object({
  amount: z.number().positive("Amount must be positive"),
  blueNumber: z.string().min(1, "Blue number is required"),
  posId: z.string().cuid(),
  observations: z.string().optional(),
  customerName: z.string().optional(),
});

export const posInternalTopUpReadSchema = z.object({
  id: z.string().cuid(),
});

export const posInternalTopUpUpdateSchema = posInternalTopUpCreateSchema
  .partial()
  .extend({
    id: z.string().cuid(),
  });

export const posInternalTopUpDeleteSchema = z.object({
  id: z.string().cuid(),
});
