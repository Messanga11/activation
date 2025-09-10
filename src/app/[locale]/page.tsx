import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default async function Page() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    return redirect(ROUTES.login);
  } else {
    return redirect(ROUTES.dashboard);
  }
}
