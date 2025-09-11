import { db } from "@/lib/db";
import { NotFoundError, InsufficientStockError } from "@/lib/errors";

export const createEventMaterial = async (data: {
  eventId: string;
  materialId: string;
  quantity: number;
  observations?: string;
}) => {
  return await db.$transaction(
    async (tx) => {
      const [event, material] = await Promise.all([
        tx.event.findUnique({ where: { id: data.eventId } }),
        tx.material.findUnique({ where: { id: data.materialId } }),
      ]);

      if (!event) throw new NotFoundError("Event");
      if (!material) throw new NotFoundError("Material");

      // Check if material has enough quantity
      if (material.quantity < data.quantity) {
        throw new InsufficientStockError("Material");
      }

      // Update material quantity
      await tx.material.update({
        where: { id: material.id },
        data: { quantity: material.quantity - data.quantity },
      });

      return await tx.eventMaterial.create({
        data,
        include: {
          event: true,
          material: true,
        },
      });
    },
    {
      timeout: 10000,
    }
  );
};

export const returnEventMaterial = async (
  id: string,
  returnedQuantity: number,
  observations?: string
) => {
  return await db.$transaction(
    async (tx) => {
      const eventMaterial = await tx.eventMaterial.findUnique({
        where: { id },
        include: {
          material: true,
        },
      });

      if (!eventMaterial) throw new NotFoundError("Event Material");

      // Update material quantity
      await tx.material.update({
        where: { id: eventMaterial.materialId },
        data: { quantity: eventMaterial.material.quantity + returnedQuantity },
      });

      // Update event material with return information
      return await tx.eventMaterial.update({
        where: { id },
        data: {
          returnedQuantity,
          returnObservations: observations,
          returnedAt: new Date(),
        },
        include: {
          event: true,
          material: true,
        },
      });
    },
    {
      timeout: 10000,
    }
  );
};

export const getEventMaterial = async (id: string) => {
  const eventMaterial = await db.eventMaterial.findUnique({
    where: { id },
    include: {
      event: true,
      material: true,
    },
  });
  if (!eventMaterial) throw new NotFoundError("Event Material");

  return eventMaterial;
};

export const getEventMaterials = async (
  eventId?: string,
  materialId?: string,
  page: number = 1,
  limit: number = 20
) => {
  const skip = (page - 1) * limit;

  const where: any = {};
  if (eventId) where.eventId = eventId;
  if (materialId) where.materialId = materialId;

  const [eventMaterials, total] = await Promise.all([
    db.eventMaterial.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        event: true,
        material: true,
      },
    }),
    db.eventMaterial.count({ where }),
  ]);

  return {
    eventMaterials,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
