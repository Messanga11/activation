// read.ts
"use server";

import { dsmTopUpReadSchema } from "@/lib/validations/dsmTopUp";
import { getDsmTopUp } from "@/lib/dal/dsmTopUp";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function getDsmTopUpAction(input: unknown) {
  try {
    const validatedData = dsmTopUpReadSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const dsmTopUp = await getDsmTopUp(validatedData.id);

    return { success: true, data: dsmTopUp };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
