// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { eventMaterialCreateSchema } from "@/lib/validations/eventMaterial";
import { createEventMaterial } from "@/lib/dal/eventMaterial";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createEventMaterialAction(input: unknown) {
  try {
    const validatedData = eventMaterialCreateSchema.parse(input);
    const session = await getSession();

    await requireSupervisor();

    const eventMaterial = await createEventMaterial(validatedData);
    revalidatePath("/event-materials");
    revalidatePath(`/events/${validatedData.eventId}`);
    revalidatePath(`/materials/${validatedData.materialId}`);

    return { success: true, data: eventMaterial };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// read.ts and list.ts similar to previous patterns
