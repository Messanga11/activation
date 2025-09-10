// create.ts
"use server";

import { revalidatePath } from "next/cache";
import { organizationCreateSchema } from "@/lib/validations/organization";
import { createOrganization } from "@/lib/dal/organization";
import { requireSuperAdmin } from "@/lib/auth/role";

export async function createOrganizationAction(input: unknown) {
  try {
    const validatedData = organizationCreateSchema.parse(input);

    await requireSuperAdmin();

    const organization = await createOrganization(validatedData);
    revalidatePath("/organizations");

    return { success: true, data: organization };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

// update.ts, delete.ts, read.ts, list.ts (similar pattern to user actions)
