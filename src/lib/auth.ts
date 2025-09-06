import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { UserRole } from "@prisma/client";

import { db } from "./db";

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // true si tu veux forcer la vérification par mail
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        return user.role === UserRole.SUPER_ADMIN;
      },
    }),
  ],
});
