import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma";
import { NotFoundError } from "@/lib/errors";
import { hashPassword } from "../auth";
import { getSession } from "../auth/role";

export const createMember = async (data: {
  organizationId: string;
  role: UserRole;
  password: string;
  cni: string;
  blueNumber: string;
  otherNumber: string;
  name: string;
  email: string;
  teamLeaderId: string | null;
}) => {
  // Hasher le mot de passe avec bcrypt
  const hashedPassword = await hashPassword(data.password);

  return await db.$transaction(
    async (tx) => {
      // Créer l'utilisateur
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          emailVerified: true,
          role: data.role,
          teamLeaderId: data.teamLeaderId,
          accounts: {
            create: {
              providerId: "credential",
              accountId: data.email,
              password: hashedPassword,
            },
          },
        },
      });

      // Créer le membre
      const member = await tx.member.create({
        data: {
          organizationId: data.organizationId,
          userId: user.id,
          role: data.role,
          cni: data.cni,
          blueNumber: data.blueNumber,
          otherNumber: data.otherNumber,
          simCount: 0,
        },
      });

      return {
        user,
        member,
      };
    },
    {
      timeout: 10000,
    }
  );
};

export const updateMember = async (
  data: Partial<{
    role: UserRole;
    cni: string;
    blueNumber: string;
    otherNumber: string;
    name: string;
    email: string;
    organizationId: string;
    teamLeaderId: string | null;
  }>
) => {
  const member = await db.member.findFirst({
    where: {
      user: { email: data.email },
      organizationId: data.organizationId,
    },
    include: { user: true },
  });
  if (!member) throw new NotFoundError("Member");

  return await db.$transaction(
    async (tx) => {
      // Préparer les données de mise à jour pour l'utilisateur
      const userUpdateData: Partial<{
        name: string;
        email: string;
        role: UserRole;
        teamLeaderId: string | null;
      }> = {};

      if (data.name !== undefined) userUpdateData.name = data.name;
      if (data.email !== undefined) userUpdateData.email = data.email;
      if (data.role !== undefined) userUpdateData.role = data.role;
      if (data.teamLeaderId !== undefined)
        userUpdateData.teamLeaderId = data.teamLeaderId;

      // Mettre à jour l'utilisateur
      const user = await tx.user.update({
        where: { id: member.userId },
        data: userUpdateData,
      });

      // Préparer les données de mise à jour pour le membre
      const memberUpdateData: Partial<{
        role: UserRole;
        cni: string;
        blueNumber: string;
        otherNumber: string;
      }> = {};

      if (data.role !== undefined) memberUpdateData.role = data.role;
      if (data.cni !== undefined) memberUpdateData.cni = data.cni;
      if (data.blueNumber !== undefined)
        memberUpdateData.blueNumber = data.blueNumber;
      if (data.otherNumber !== undefined)
        memberUpdateData.otherNumber = data.otherNumber;

      // Mettre à jour le membre
      const updatedMember = await tx.member.update({
        where: { id: member.id },
        data: memberUpdateData,
      });

      return {
        user,
        member: updatedMember,
      };
    },
    {
      timeout: 10000,
    }
  );
};

export const deleteMember = async (id: string) => {
  const member = await db.member.findUnique({
    where: { id },
    include: { user: true },
  });
  if (!member) throw new NotFoundError("Member");

  return await db.$transaction(
    async (tx) => {
      // Supprimer le membre
      await tx.member.delete({ where: { id } });

      // Supprimer l'utilisateur associé
      await tx.user.delete({ where: { id: member.userId } });

      // Note: Les comptes (accounts) seront supprimés automatiquement
      // grâce à la relation onDelete: Cascade
    },
    {
      timeout: 10000,
    }
  );
};

export const getMember = async (id: string) => {
  const member = await db.member.findUnique({
    where: { id },
    include: {
      user: true,
      organization: true,
      baSales: true,
      teamLeaderSales: true,
    },
  });
  if (!member) throw new NotFoundError("Member");

  return member;
};

export const getMembers = async (
  organizationId?: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  role?: UserRole
) => {
  const skip = (page - 1) * limit;

  const session = await getSession();

  // biome-ignore lint/suspicious/noExplicitAny: any required
  const where: any = {};
  if (organizationId) where.organizationId = organizationId;
  if (role) where.role = role;

  if (session.user.role === UserRole.TEAM_LEADER) {
    where.user = { teamLeaderId: session.user.id };
  }

  if (search) {
    where.OR = [
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
      { cni: { contains: search, mode: "insensitive" } },
      { blueNumber: { contains: search, mode: "insensitive" } },
    ];
  }

  const [members, total] = await Promise.all([
    db.member.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: true,
        organization: true,
      },
    }),
    db.member.count({ where }),
  ]);

  return {
    data: members,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};

export const getMemberByUserAndOrg = async (
  userId: string,
  organizationId: string
) => {
  const member = await db.member.findUnique({
    where: {
      organizationId_userId: {
        userId,
        organizationId,
      },
    },
    include: {
      organization: true,
      user: true,
    },
  });

  return member;
};
