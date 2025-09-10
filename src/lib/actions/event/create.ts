// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { eventCreateSchema } from "@/lib/validations/event";
import { createEvent } from "@/lib/dal/event";
import { getSession, requireSupervisor } from "@/lib/auth/role";

export async function createEventAction(input: unknown) {
  try {
    const validatedData = eventCreateSchema.parse(input);
    const session = await getSession();

    await requireSupervisor();

    const event = await createEvent(validatedData);
    revalidatePath("/events");

    return { success: true, data: event };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// update.ts, delete.ts, read.ts, list.ts similar to previous patterns
