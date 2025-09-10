// delete.ts
"use server";

import { revalidatePath } from "next/cache";
import { dsmDeleteSchema } from "@/lib/validations/dsm";
import { deleteDsm } from "@/lib/dal/dsm";
import { requireSuperAdmin } from "@/lib/auth/role";

export async function deleteDsmAction(input: unknown) {
  try {
    const validatedData = dsmDeleteSchema.parse(input);

    await requireSuperAdmin();

    await deleteDsm(validatedData.id);
    revalidatePath("/dsms");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
