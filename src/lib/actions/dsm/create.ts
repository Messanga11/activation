// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { dsmCreateSchema } from "@/lib/validations/dsm";
import { createDsm } from "@/lib/dal/dsm";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createDsmAction(input: object) {
  try {
    const session = await getSession();
    await requireSupervisor();

    const validatedData = dsmCreateSchema.parse({
      ...input,
      amount: Number((input as { amount: string }).amount.replace(/\D/g, "")),
      organizationId: session.user.organizationId,
    });

    const dsm = await createDsm(validatedData);
    revalidatePath("/dsms");
    revalidatePath(`/organizations/${validatedData.organizationId}/dsms`);

    return { success: true, data: dsm };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
