// list.ts
"use server";

import { dsmTopUpListSchema } from "@/lib/validations/dsmTopUp";
import { getDsmTopUps } from "@/lib/dal/dsmTopUp";
import { requireSupervisor } from "@/lib/auth/role";

export async function getDsmTopUpsAction(input: unknown) {
  try {
    const validatedData = dsmTopUpListSchema.parse(input);

    await requireSupervisor();

    const result = await getDsmTopUps(
      validatedData.dsmId,
      validatedData.page,
      validatedData.limit
    );

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
