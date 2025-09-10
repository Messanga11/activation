import { z } from "zod";

export const eventMaterialCreateSchema = z.object({
  eventId: z.string().cuid(),
  materialId: z.string().cuid(),
  quantity: z.number().int().positive("Quantity must be positive"),
  observations: z.string().optional(),
});

export const eventMaterialReturnSchema = z.object({
  id: z.string().cuid(),
  returnedQuantity: z
    .number()
    .int()
    .nonnegative("Returned quantity must be non-negative"),
  observations: z.string().optional(),
});

export const eventMaterialReadSchema = z.object({
  id: z.string().cuid(),
});

export const eventMaterialListSchema = z.object({
  eventId: z.string().cuid().optional(),
  materialId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});
