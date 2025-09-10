import { z } from "zod";

export const simSaleCreateSchema = z.object({
  organizationId: z.string().cuid(),
  blueNumber: z.string().min(1, "Blue number is required"),
  otherNumber: z.string().min(1, "Other number is required"),
  customerName: z.string().min(1, "Customer name is required"),
  cni: z.string().min(1, "CNI is required"),
  address: z.string().min(1, "Address is required"),
  imei: z.string().min(1, "IMEI is required"),
  iccid: z.string().min(1, "ICCID is required"),
  baId: z.string().cuid(),
});

export const simSaleUpdateSchema = simSaleCreateSchema.partial().extend({
  id: z.string().cuid(),
});

export const simSaleDeleteSchema = z.object({
  id: z.string().cuid(),
});

export const simSaleReadSchema = z.object({
  id: z.string().cuid(),
});

export const simSaleListSchema = z.object({
  organizationId: z.string().cuid().optional(),
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
  search: z.string().optional(),
});
