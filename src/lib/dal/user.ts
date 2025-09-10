import { db } from "@/lib/db";
import { UserRole } from "@/generated/prisma";
import { NotFoundError } from "@/lib/errors";

export const createUser = async (data: {
  name: string;
  email: string;
  role: UserRole;
  teamLeaderId?: string | null;
  image?: string | null;
}) => {
  return await db.user.create({
    data: {
      ...data,
      accounts: {
        create: {
          providerId: "email",
          accountId: data.email,
          password: "temp-password", // Should be handled properly
        },
      },
    },
  });
};

export const updateUser = async (
  id: string,
  data: Partial<{
    name: string;
    email: string;
    role: UserRole;
    teamLeaderId: string | null;
    image: string | null;
  }>
) => {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User");

  return await db.user.update({
    where: { id },
    data,
  });
};

export const deleteUser = async (id: string) => {
  const user = await db.user.findUnique({ where: { id } });
  if (!user) throw new NotFoundError("User");

  return await db.user.delete({ where: { id } });
};

export const getUser = async (id: string) => {
  const user = await db.user.findUnique({
    where: { id },
    include: {
      teamMembers: true,
      teamLeader: true,
      members: {
        include: {
          organization: true,
        },
      },
    },
  });
  if (!user) throw new NotFoundError("User");

  return user;
};

export const getUsers = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        teamLeader: true,
        members: {
          include: {
            organization: true,
          },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  return {
    data: users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
