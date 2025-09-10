"use server";

import { getSession } from "@/lib/auth/role";
import { getSimSales } from "@/lib/dal/simSale";
import { simSaleListSchema } from "@/lib/validations/simSale";

export async function listSimSalesAction(input: unknown) {
  try {
    const validatedData = simSaleListSchema.parse(input);
    const session = await getSession();

    const simSales = await getSimSales(
      validatedData.organizationId,
      validatedData.page,
      validatedData.limit,
      validatedData.search,
      session.user.id
    );

    return { success: true, data: simSales };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}
