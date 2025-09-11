import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";
import { hashPassword } from "../auth";

export const createOrganization = async (_data: {
  name: string;
  email: string;
  password: string;
  slug: string;
  logo?: string;
  cni?: string;
  blueNumber?: string;
  otherNumber?: string;
  metadata?: Record<string, any>;
}) => {
  const { password, ...data } = _data;

  // Hasher le mot de passe
  const hashedPassword = await hashPassword(password);

  return await db.$transaction(
    async (tx) => {
      // Créer l'organization dans la base de données
      const organization = await tx.organization.create({
        data: {
          name: data.name,
          slug: data.slug,
          logo: data.logo,
          metadata: data.metadata ? JSON.stringify(data.metadata) : null,
          simCount: 0,
          email: data.email,
        },
      });

      if (!organization) throw new NotFoundError("Organization");

      // Créer l'utilisateur dans la base de données
      const user = await tx.user.create({
        data: {
          name: data.name,
          email: data.email,
          emailVerified: true, // Marquer comme vérifié puisque nous créons manuellement
          role: "ADMIN", // Définir un rôle approprié
          accounts: {
            create: {
              providerId: "credential",
              accountId: data.email,
              password: hashedPassword,
            },
          },
        },
      });

      if (!user) throw new NotFoundError("User");

      // Créer le membre dans la base de données
      const member = await tx.member.create({
        data: {
          organizationId: organization.id,
          userId: user.id,
          role: "ADMIN", // Définir un rôle approprié
          cni: data.cni || "",
          blueNumber: data.blueNumber || "",
          otherNumber: data.otherNumber || "",
          simCount: 0,
        },
      });

      if (!member) throw new NotFoundError("Member");

      return {
        organization,
        user,
        member,
      };
    },
    {
      maxWait: 10000,
      timeout: 10000,
    }
  );
};

export const updateOrganization = async (
  id: string,
  data: Partial<{
    name: string;
    slug: string;
    logo: string | null;
    metadata: string;
    simCount: number;
  }>
) => {
  const organization = await db.organization.findUnique({ where: { id } });
  if (!organization) throw new NotFoundError("Organization");

  return await db.organization.update({
    where: { id },
    data,
  });
};

export const deleteOrganization = async (id: string) => {
  const organization = await db.organization.findUnique({ where: { id } });
  if (!organization) throw new NotFoundError("Organization");

  return await db.organization.delete({ where: { id } });
};

export const getOrganization = async (id: string) => {
  const organization = await db.organization.findUnique({
    where: { id },
    include: {
      members: {
        include: {
          user: true,
        },
      },
      simSales: true,
      dsm: true,
      pos: true,
    },
  });
  if (!organization) throw new NotFoundError("Organization");

  return organization;
};

export const getOrganizations = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const where: any = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { slug: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [organizations, total] = await Promise.all([
    db.organization.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: {
            members: true,
            simSales: true,
          },
        },
      },
    }),
    db.organization.count({ where }),
  ]);

  return {
    data: organizations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
