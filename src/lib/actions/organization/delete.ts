"use server";

import { revalidatePath } from "next/cache";
import { organizationDeleteSchema } from "@/lib/validations/organization";
import { deleteOrganization } from "@/lib/dal/organization";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function deleteOrganizationAction(input: unknown) {
  try {
    const validatedData = organizationDeleteSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    await deleteOrganization(validatedData.id);
    revalidatePath("/organizations");

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
