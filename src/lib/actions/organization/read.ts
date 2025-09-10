"use server";

import { organizationReadSchema } from "@/lib/validations/organization";
import { getOrganization } from "@/lib/dal/organization";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function getOrganizationAction(input: unknown) {
  try {
    const validatedData = organizationReadSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const organization = await getOrganization(validatedData.id);

    return { success: true, data: organization };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
