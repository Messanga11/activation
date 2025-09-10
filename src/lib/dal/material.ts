import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export const createMaterial = async (data: {
  name: string;
  quantity: number;
}) => {
  return await db.material.create({
    data,
    include: {
      associatedEvents: {
        include: {
          event: true,
        },
      },
    },
  });
};

export const updateMaterial = async (
  id: string,
  data: Partial<{
    name: string;
    quantity: number;
  }>
) => {
  const material = await db.material.findUnique({ where: { id } });
  if (!material) throw new NotFoundError("Material");

  return await db.material.update({
    where: { id },
    data,
    include: {
      associatedEvents: {
        include: {
          event: true,
        },
      },
    },
  });
};

export const deleteMaterial = async (id: string) => {
  const material = await db.material.findUnique({ where: { id } });
  if (!material) throw new NotFoundError("Material");

  return await db.material.delete({ where: { id } });
};

export const getMaterial = async (id: string) => {
  const material = await db.material.findUnique({
    where: { id },
    include: {
      associatedEvents: {
        include: {
          event: true,
        },
      },
    },
  });
  if (!material) throw new NotFoundError("Material");

  return material;
};

export const getMaterials = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [{ name: { contains: search, mode: "insensitive" } }],
      }
    : {};

  const [materials, total] = await Promise.all([
    db.material.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        associatedEvents: {
          include: {
            event: true,
          },
        },
      },
    }),
    db.material.count({ where }),
  ]);

  return {
    materials,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
