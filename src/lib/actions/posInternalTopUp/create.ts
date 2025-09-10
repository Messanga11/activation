"use server";

import { getSession, requireSupervisor } from "@/lib/auth/role";
import { createPosInternalTopUp } from "@/lib/dal/posInternalTopUp";
import { AuthorizationError } from "@/lib/errors";
import { posInternalTopUpCreateSchema } from "@/lib/validations/posInternalTopUp";
import { revalidatePath } from "next/cache";

export const createPosInternalTopUpAction = async (data: {
  amount: number;
  blueNumber: string;
  posId: string;
  observations?: string;
  customerName?: string;
}) => {
  try {
    const session = await getSession();
    const organizationId = session?.user.organizationId;

    if (!organizationId) throw new AuthorizationError();

    if (!session?.user.memberId) throw new AuthorizationError();

    await requireSupervisor();

    const validatedData = posInternalTopUpCreateSchema.parse({
      ...data,
      amount: Number(data.amount),
    });

    const posInternalTopUp = await createPosInternalTopUp({
      ...validatedData,
      memberId: session.user.memberId,
    });
    revalidatePath("/pos-internal-top-ups");
    revalidatePath(`/organizations/${organizationId}/pos-internal-top-ups`);

    return { success: true, data: posInternalTopUp };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
};
