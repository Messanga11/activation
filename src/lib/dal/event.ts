import { db } from "@/lib/db";
import { NotFoundError } from "@/lib/errors";

export const createEvent = async (data: {
  name: string;
  description?: string;
  date: Date;
  location?: string;
  observations?: string;
}) => {
  return await db.event.create({
    data,
    include: {
      associatedMaterials: {
        include: {
          material: true,
        },
      },
    },
  });
};

export const updateEvent = async (
  id: string,
  data: Partial<{
    name: string;
    description: string;
    date: Date;
    location: string;
    observations: string;
  }>
) => {
  const event = await db.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError("Event");

  return await db.event.update({
    where: { id },
    data,
    include: {
      associatedMaterials: {
        include: {
          material: true,
        },
      },
    },
  });
};

export const deleteEvent = async (id: string) => {
  const event = await db.event.findUnique({ where: { id } });
  if (!event) throw new NotFoundError("Event");

  return await db.event.delete({ where: { id } });
};

export const getEvent = async (id: string) => {
  const event = await db.event.findUnique({
    where: { id },
    include: {
      associatedMaterials: {
        include: {
          material: true,
        },
      },
    },
  });
  if (!event) throw new NotFoundError("Event");

  return event;
};

export const getEvents = async (
  page: number = 1,
  limit: number = 20,
  search?: string
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { location: { contains: search, mode: "insensitive" } },
        ],
      }
    : {};

  const [events, total] = await Promise.all([
    db.event.findMany({
      where,
      skip,
      take: limit,
      orderBy: { date: "desc" },
      include: {
        associatedMaterials: {
          include: {
            material: true,
          },
        },
      },
    }),
    db.event.count({ where }),
  ]);

  return {
    events,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
