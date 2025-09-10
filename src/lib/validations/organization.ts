import { z } from "zod";

export const organizationCreateSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8),
  cni: z.string().min(1, "CNI is required"),
  blueNumber: z.string().min(1, "Blue number is required"),
  otherNumber: z.string().min(1, "Other number is required"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug can only contain lowercase letters, numbers and hyphens"
    ),
});

export const organizationUpdateSchema = organizationCreateSchema
  .partial()
  .extend({
    id: z.string().cuid(),
  });

export const organizationDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const organizationReadSchema = z.object({
  id: z.string().cuid(),
});

export const organizationListSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
