"use server";

import { revalidatePath } from "next/cache";
import { organizationUpdateSchema } from "@/lib/validations/organization";
import { updateOrganization } from "@/lib/dal/organization";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function updateOrganizationAction(input: unknown) {
  try {
    const validatedData = organizationUpdateSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const organization = await updateOrganization(
      validatedData.id,
      validatedData
    );
    revalidatePath("/organizations");
    revalidatePath(`/organizations/${validatedData.id}`);

    return { success: true, data: organization };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
