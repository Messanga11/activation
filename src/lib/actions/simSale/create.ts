// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { simSaleCreateSchema } from "@/lib/validations/simSale";
import { createSimSale } from "@/lib/dal/simSale";
import { getSession, requireRole } from "@/lib/auth/role";
import { UserRole } from "@/generated/prisma";

export async function createSimSaleAction(input: object) {
  try {
    const session = await getSession();
    requireRole(session.user.role, [
      UserRole.TEAM_LEADER,
      UserRole.BA,
      UserRole.SUPERVISOR,
      UserRole.ADMIN,
    ]);

    const validatedData = simSaleCreateSchema.parse({
      ...input,
      memberId: session.user.id,
      baId:
        session.user.role !== UserRole.BA
          ? (input as { baId: string }).baId
          : session.user.id,
      organizationId: session.user.organizationId,
    });

    const simSale = await createSimSale(validatedData);
    revalidatePath("/sim-sales");
    revalidatePath(`/organizations/${validatedData.organizationId}/sim-sales`);

    return { success: true, data: simSale };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
