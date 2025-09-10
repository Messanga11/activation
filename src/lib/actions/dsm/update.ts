// update.ts
"use server";

import { revalidatePath } from "next/cache";
import { dsmUpdateSchema } from "@/lib/validations/dsm";
import { updateDsm } from "@/lib/dal/dsm";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function updateDsmAction(input: object) {
  try {
    const session = await getSession();
    const validatedData = dsmUpdateSchema.parse({
      ...input,
      organizationId: session.user.organizationId,
    });

    await requireSupervisor(session.user.organizationId);

    const dsm = await updateDsm(validatedData.id, validatedData);
    revalidatePath("/dsms");
    revalidatePath(`/dsms/${validatedData.id}`);

    return { success: true, data: dsm };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
