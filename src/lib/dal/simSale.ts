import { SimSaleStatus, UserRole } from "@/generated/prisma";
import { db } from "@/lib/db";
import { InsufficientStockError, NotFoundError } from "@/lib/errors";

export const createSimSale = async (data: {
  organizationId: string;
  blueNumber: string;
  otherNumber: string;
  customerName: string;
  cni: string;
  address: string;
  imei: string;
  iccid: string;
  baId: string;
}) => {
  // Check if organization, BA and Team Leader exist
  const [organization, ba] = await Promise.all([
    db.organization.findUnique({ where: { id: data.organizationId } }),
    db.member.findFirst({
      where: { user: { id: data.baId } },
      select: { user: true, id: true },
    }),
  ]);

  if (!organization) throw new NotFoundError("Organization");
  if (!ba) throw new NotFoundError("BA");

  const teamLeader = await db.member.findFirst({
    where: { user: { id: ba.user.teamLeaderId ?? "" } },
    select: { user: true, id: true },
  });

  if (!teamLeader) throw new NotFoundError("Team Leader");

  return await db.$transaction(
    async (tx) => {
      const baMember = await tx.member.findUnique({ where: { id: ba.id } });

      const baSimCount = baMember?.simCount ?? 0;

      if (baSimCount < 1) {
        throw new InsufficientStockError("BA");
      }

      await tx.member.update({
        where: { id: ba.id },
        data: { simCount: baSimCount - 1 },
      });

      await tx.simSale.create({
        data: {
          ...data,
          baId: ba.id,
          teamLeaderId: teamLeader.id,
        },
        include: {
          organization: true,
          ba: {
            include: {
              user: true,
            },
          },
          teamLeader: {
            include: {
              user: true,
            },
          },
        },
      });
    },
    {
      timeout: 10000,
    }
  );
};

export const updateSimStatus = async (
  id: string,
  isRejected?: boolean,
  rejectReason?: string
) => {
  const simSale = await db.simSale.findUnique({ where: { id } });
  if (!simSale) throw new NotFoundError("Sim Sale");

  // if (simSale.status === SimSaleStatus.ACTIVATED)
  //   throw new Error("Sim Sale status is already treated");

  let status: SimSaleStatus | undefined;

  if (
    simSale.status === SimSaleStatus.ACTIVATING ||
    simSale.status === SimSaleStatus.ACTIVATED
  ) {
    status = isRejected ? SimSaleStatus.REJECTED : SimSaleStatus.ACTIVATED;
  } else {
    status = SimSaleStatus.REJECTED;
  }

  if (simSale.status === SimSaleStatus.REJECTED) {
    status = SimSaleStatus.ACTIVATING;
  }

  if (!status) throw new Error("Invalid status");

  return await db.simSale.update({
    where: { id },
    data: {
      status,
      rejectReason: isRejected ? rejectReason : "",
    },
    include: {
      organization: true,
      ba: {
        include: {
          user: true,
        },
      },
      teamLeader: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const updateSimSale = async (
  id: string,
  data: Partial<{
    blueNumber: string;
    otherNumber: string;
    customerName: string;
    cni: string;
    address: string;
    imei: string;
    iccid: string;
    baId: string;
    teamLeaderId: string;
  }>
) => {
  const simSale = await db.simSale.findUnique({ where: { id } });
  if (!simSale) throw new NotFoundError("Sim Sale");

  return await db.simSale.update({
    where: { id },
    data,
    include: {
      organization: true,
      ba: {
        include: {
          user: true,
        },
      },
      teamLeader: {
        include: {
          user: true,
        },
      },
    },
  });
};

export const deleteSimSale = async (id: string) => {
  const simSale = await db.simSale.findUnique({ where: { id } });
  if (!simSale) throw new NotFoundError("Sim Sale");

  return await db.simSale.delete({ where: { id } });
};

export const getSimSale = async (id: string) => {
  const simSale = await db.simSale.findUnique({
    where: { id },
    include: {
      organization: true,
      ba: {
        include: {
          user: true,
        },
      },
      teamLeader: {
        include: {
          user: true,
        },
      },
    },
  });
  if (!simSale) throw new NotFoundError("Sim Sale");

  return simSale;
};

export const getSimSales = async (
  organizationId?: string,
  page: number = 1,
  limit: number = 20,
  search?: string,
  userId?: string
) => {
  const skip = (page - 1) * limit;

  // biome-ignore lint/suspicious/noExplicitAny: can't find a better way
  const where: any = {};
  if (organizationId) where.organizationId = organizationId;

  if (userId) {
    const member = await db.member.findFirst({
      where: { user: { id: userId } },
    });
    if (!member) throw new NotFoundError("Member");
    if (member.role === UserRole.BA) where.baId = member.id;
    if (member.role === UserRole.TEAM_LEADER) where.teamLeaderId = member.id;
  }

  if (search) {
    where.OR = [
      { customerName: { contains: search, mode: "insensitive" } },
      { blueNumber: { contains: search, mode: "insensitive" } },
      { otherNumber: { contains: search, mode: "insensitive" } },
      { cni: { contains: search, mode: "insensitive" } },
    ];
  }

  const [simSalesWithDuplicates, total] = await Promise.all([
    db.$transaction(async (tx) => {
      // 1. Récupérer les enregistrements de la page courante
      const simSales = await tx.simSale.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          organization: true,
          ba: {
            include: {
              user: true,
            },
          },
          teamLeader: {
            include: {
              user: true,
            },
          },
        },
      });

      if (simSales.length === 0) return simSales;

      // 2. Collecter les valeurs à vérifier depuis la page courante
      const valuesToCheck = new Map<string, string[]>(); // field -> values[]

      simSales.forEach((sale) => {
        if (sale.blueNumber && sale.blueNumber.trim() !== "") {
          if (!valuesToCheck.has("blueNumber")) {
            valuesToCheck.set("blueNumber", []);
          }
          valuesToCheck.get("blueNumber")!.push(sale.blueNumber);
        }

        if (sale.iccid && sale.iccid.trim() !== "") {
          if (!valuesToCheck.has("iccid")) {
            valuesToCheck.set("iccid", []);
          }
          valuesToCheck.get("iccid")!.push(sale.iccid);
        }

        // Ajouter d'autres champs si nécessaire
        // if (sale.otherNumber && sale.otherNumber.trim() !== '') {
        //   if (!valuesToCheck.has('otherNumber')) {
        //     valuesToCheck.set('otherNumber', []);
        //   }
        //   valuesToCheck.get('otherNumber')!.push(sale.otherNumber);
        // }
      });

      // 3. Pour chaque champ, compter les occurrences dans TOUTE la base
      const duplicateValues = new Set<string>(); // stockage: "field:value"

      for (const [field, values] of valuesToCheck.entries()) {
        if (values.length === 0) continue;

        // Grouper par valeur pour compter les occurrences dans toute la BD
        const countResults = await tx.simSale.groupBy({
          by: [field as keyof typeof tx.simSale.fields],
          where: {
            [field]: { in: values },
          },
          _count: {
            id: true,
          },
          having: {
            id: {
              _count: {
                gt: 1,
              },
            },
          },
        });

        // Marquer les valeurs qui apparaissent plus d'une fois
        countResults.forEach((result) => {
          const value = result[field as keyof typeof result] as string;
          if (value) {
            duplicateValues.add(`${field}:${value}`);
          }
        });
      }

      // 4. Marquer les enregistrements de la page courante qui sont dupliqués
      simSales.forEach((sale) => {
        let isDuplicated = false;

        if (sale.blueNumber && sale.blueNumber.trim() !== "") {
          if (duplicateValues.has(`blueNumber:${sale.blueNumber}`)) {
            isDuplicated = true;
          }
        }

        if (sale.iccid && sale.iccid.trim() !== "") {
          if (duplicateValues.has(`iccid:${sale.iccid}`)) {
            isDuplicated = true;
          }
        }

        // Ajouter d'autres champs si nécessaire
        // if (sale.otherNumber && sale.otherNumber.trim() !== '') {
        //   if (duplicateValues.has(`otherNumber:${sale.otherNumber}`)) {
        //     isDuplicated = true;
        //   }
        // }

        if (isDuplicated) {
          // biome-ignore lint/suspicious/noExplicitAny: needed
          (sale as any).isDuplicated = true;
        }
      });

      return simSales;
    }),
    db.simSale.count({ where }),
  ]);

  return {
    data: simSalesWithDuplicates,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  };
};
