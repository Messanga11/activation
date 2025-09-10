import { z } from "zod";

export const materialCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  quantity: z.number().int().nonnegative("Quantity must be non-negative"),
});

export const materialUpdateSchema = materialCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const materialDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const materialReadSchema = z.object({
  id: z.string().cuid(),
});

export const materialListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
