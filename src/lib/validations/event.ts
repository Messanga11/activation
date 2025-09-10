import { z } from "zod";

export const eventCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  date: z.coerce.date(),
  location: z.string().optional(),
  observations: z.string().optional(),
});

export const eventUpdateSchema = eventCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const eventDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const eventReadSchema = z.object({
  id: z.string().cuid(),
});

export const eventListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
