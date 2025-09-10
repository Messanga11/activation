// read.ts
"use server";

import { dsmReadSchema } from "@/lib/validations/dsm";
import { getDsm } from "@/lib/dal/dsm";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function getDsmAction(input: unknown) {
  try {
    const validatedData = dsmReadSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const dsm = await getDsm(validatedData.id);

    return { success: true, data: dsm };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
