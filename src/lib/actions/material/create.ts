// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { materialCreateSchema } from "@/lib/validations/material";
import { createMaterial } from "@/lib/dal/material";
import { requireSupervisor } from "@/lib/auth/role";

export async function createMaterialAction(input: unknown) {
  try {
    const validatedData = materialCreateSchema.parse(input);

    // Only supervisor and organization owners can create materials
    await requireSupervisor(); // This might need adjustment based on your requirements

    const material = await createMaterial(validatedData);
    revalidatePath("/materials");

    return { success: true, data: material };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// update.ts, delete.ts, read.ts, list.ts similar to previous patterns
