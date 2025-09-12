"use server";

import { requireActivator } from "@/lib/auth/role";
import { updateSimStatus } from "@/lib/dal/simSale";
import { simSaleUpdateStatusSchema } from "@/lib/validations/simSale";

export async function updateStatusAction(input: unknown) {
  try {
    const validatedData = simSaleUpdateStatusSchema.parse(input);
    await requireActivator();

    const simSale = await updateSimStatus(
      validatedData.id,
      validatedData.isRejected,
      validatedData.rejectReason
    );
    console.log({ simSale });
    return { success: true, data: simSale };
  } catch (error) {
    console.log({ error });
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
