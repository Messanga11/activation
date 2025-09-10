import { createAuthClient } from "better-auth/react";
import { organizationClient } from "better-auth/client/plugins";
import { customSessionClient } from "better-auth/client/plugins";
import type { auth } from "./auth";

export const authClient = createAuthClient({
  baseURL: `${process.env.NEXT_PUBLIC_BASE_URL}/api/auth`,
  plugins: [organizationClient(), customSessionClient<typeof auth>()],
});
