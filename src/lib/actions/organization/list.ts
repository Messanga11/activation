"use server";

import { organizationListSchema } from "@/lib/validations/organization";
import { getOrganizations } from "@/lib/dal/organization";
import { getSession, requireSuperAdmin } from "@/lib/auth/role";

export async function getOrganizationsAction(input: unknown) {
  try {
    const validatedData = organizationListSchema.parse(input);
    const session = await getSession();

    await requireSuperAdmin();

    const result = await getOrganizations(
      validatedData.page,
      validatedData.limit,
      validatedData.search
    );

    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
