"use server";

import { getSession, requireSupervisor } from "@/lib/auth/role";
import { getInternalPosTopUps } from "@/lib/dal/posInternalTopUp";
import { posInternalTopUpListSchema } from "@/lib/validations/posInternalTopUp";

export const getInternalPosTopUpsAction = async (input: unknown) => {
  try {
    const validatedData = posInternalTopUpListSchema.parse(input);
    const session = await getSession();
    const organizationId = session?.user.organizationId;

    await requireSupervisor(organizationId);

    const data = await getInternalPosTopUps(
      validatedData.posId,
      validatedData.page,
      validatedData.limit,
      validatedData.search
    );

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
};
