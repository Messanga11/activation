import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export const createDsm = async (data: {
  number: string;
  organizationId: string;
  amount: number;
  name: string;
}) => {
  const organization = await db.organization.findUnique({
    where: { id: data.organizationId },
  });
  if (!organization) throw new NotFoundError("Organization");

  return await db.dsm.create({
    data,
    include: {
      organization: true,
      topUps: true,
      posTopUps: true,
      pos: true,
    },
  });
};

export const updateDsm = async (
  id: string,
  data: Partial<{
    number: string;
    amount: number;
    name: string;
    organizationId: string;
  }>
) => {
  const dsm = await db.dsm.findUnique({ where: { id } });
  if (!dsm) throw new NotFoundError("DSM");

  if (!data.organizationId) throw new NotFoundError("Organization");

  const organization = await db.organization.findUnique({
    where: { id: data.organizationId },
  });
  if (!organization) throw new NotFoundError("Organization");

  if (organization.id !== dsm.organizationId)
    throw new NotFoundError("Organization");

  return await db.dsm.update({
    where: { id },
    data,
    include: {
      organization: true,
      topUps: true,
      posTopUps: true,
      pos: true,
    },
  });
};

export const deleteDsm = async (id: string) => {
  const dsm = await db.dsm.findUnique({ where: { id } });
  if (!dsm) throw new NotFoundError("DSM");

  return await db.dsm.delete({ where: { id } });
};

export const getDsm = async (id: string) => {
  const dsm = await db.dsm.findUnique({
    where: { id },
    include: {
      organization: true,
      topUps: {
        include: {
          member: {
            include: {
              user: true,
            },
          },
        },
      },
      posTopUps: {
        include: {
          member: {
            include: {
              user: true,
            },
          },
          pos: true,
        },
      },
      pos: true,
    },
  });
  if (!dsm) throw new NotFoundError("DSM");

  return dsm;
};

export const getDsms = async (
  organizationId?: string,
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (organizationId) where.organizationId = organizationId;

  if (search) {
    where.OR = [{ number: { contains: search, mode: "insensitive" } }];
  }

  const [dsms, total] = await Promise.all([
    db.dsm.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        organization: true,
        _count: {
          select: {
            topUps: true,
            posTopUps: true,
            pos: true,
          },
        },
      },
    }),
    db.dsm.count({ where }),
  ]);

  return {
    data: dsms,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
