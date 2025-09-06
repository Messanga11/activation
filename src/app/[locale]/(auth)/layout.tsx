import { authClient } from "@/lib/auth-client";
import { redirect } from "next/navigation";
import { ROUTES } from "@/config/routes";

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await authClient.getSession();

  if (user) {
    return redirect(ROUTES.dashboard);
  }

  return children;
}
