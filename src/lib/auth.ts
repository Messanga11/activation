import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { organization } from "better-auth/plugins";
import { customSession } from "better-auth/plugins";

import { db } from "./db";
import { UserRole } from "@/generated/prisma";
import { AuthorizationError } from "./errors";

import * as bcrypt from "bcrypt";

export const hashPassword = async (password: string) => {
  console.log("hashPassword", password);
  return await bcrypt.hash(password, 10);
};

export const auth = betterAuth({
  database: prismaAdapter(db, {
    provider: "sqlite", // or "mysql", "postgresql", ...etc
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    disableCookieCache: true,
    password: {
      hash: hashPassword,
      verify: async (data: { hash: string; password: string }) => {
        return await bcrypt.compare(data.password, data.hash);
      },
    },
  },
  plugins: [
    organization({
      allowUserToCreateOrganization: async (user) => {
        return user.role === UserRole.SUPER_ADMIN;
      },
    }),
    customSession(async ({ user, session }) => {
      const [_user, member] = await Promise.all([
        db.user.findUnique({ where: { id: user.id } }),
        db.member.findFirst({
          where: {
            userId: user.id ?? "",
          },
          include: {
            organization: true,
          },
        }),
      ]);
      if (!_user) throw new AuthorizationError();
      const role = _user.role;
      return {
        role,
        user: {
          ...user,
          organizationId: member?.organizationId,
          teamLeaderId: _user.teamLeaderId,
          memberId: member?.id,
          simCount: member?.simCount,
          organization: member?.organization,
          role,
        },
        session,
      };
    }),
  ],
});
