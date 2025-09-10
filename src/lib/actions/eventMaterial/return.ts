// return.ts
"use server";

import { revalidatePath } from "next/cache";
import { eventMaterialReturnSchema } from "@/lib/validations/eventMaterial";
import { returnEventMaterial } from "@/lib/dal/eventMaterial";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function returnEventMaterialAction(input: unknown) {
  try {
    const validatedData = eventMaterialReturnSchema.parse(input);
    const session = await getSession();

    await requireSupervisor();

    const eventMaterial = await returnEventMaterial(
      validatedData.id,
      validatedData.returnedQuantity,
      validatedData.observations
    );
    revalidatePath("/event-materials");
    revalidatePath(`/events/${eventMaterial.eventId}`);
    revalidatePath(`/materials/${eventMaterial.materialId}`);

    return { success: true, data: eventMaterial };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
