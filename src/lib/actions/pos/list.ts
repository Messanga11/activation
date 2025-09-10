"use server";

import { revalidatePath } from "next/cache";
import { posListSchema } from "@/lib/validations/pos";
import { getPosList } from "@/lib/dal/pos";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function listPosAction(input: unknown) {
  try {
    const validatedData = posListSchema.parse(input);
    const session = await getSession();

    await requireSupervisor();

    const pos = await getPosList(
      session.user.organizationId,
      validatedData.dsmId,
      validatedData.page,
      validatedData.limit,
      validatedData.search
    );
    revalidatePath("/pos");
    revalidatePath(`/organizations/${session.user.organizationId}/pos`);

    return { success: true, data: pos };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
