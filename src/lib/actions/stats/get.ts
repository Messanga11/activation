"use server";

import { getSession } from "@/lib/auth/role";
import { db } from "@/lib/db";
import moment from "moment";

export const getStatsAction = async (input: { from?: Date; to?: Date }) => {
  const session = await getSession();

  if (!session.user) {
    return null;
  }

  const organizationId = session.user.organizationId;
  const currentStartDate = input.from || new Date();
  const currentEndDate = input.to || new Date();

  // Fonction pour calculer les tendances
  const calculateTrend = (current: number, previous: number): number => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  // Fonction générique pour compter les entités
  const getCount = async (
    model: "simSale" | "posTopUp" | "pos" | "dsm",
    start: Date,
    end: Date,
    customPop?: string
  ) => {
    if (!moment(start).isValid() || !moment(end).isValid()) {
      throw new Error("Date range is required");
    }

    start.setHours(0, 0, 0, 0);
    end.setHours(23, 59, 59, 999);

    const whereCondition: any = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };
    if (customPop) {
      const result = await db[model as "simSale"].findMany({
        where: {
          ...whereCondition,
          ...(model === "posTopUp"
            ? {
                pos: {
                  organizationId,
                },
              }
            : {
                organizationId,
              }),
        },
        select: {
          [customPop]: true,
        },
      });
      return result.reduce((acc, item) => acc + item[customPop], 0);
    }

    if (organizationId) {
      whereCondition.organizationId = organizationId;
    }

    return await db[model as "simSale"].count({
      where: whereCondition,
    });
  };

  try {
    // Récupération des données en parallèle
    const [
      simSalesCurrent,
      // simSalesPrevious,
      posTopUpsCurrent,
      // posTopUpsPrevious,
      posCurrent,
      // posPrevious,
      dsmCurrent,
      // dsmPrevious,
    ] = await Promise.all([
      getCount("simSale", currentStartDate, currentEndDate),
      // getCount("simSale", previousMonthStart, previousMonthEnd),
      getCount("posTopUp", currentStartDate, currentEndDate, "amount"),
      // getCount("posTopUp", previousMonthStart, previousMonthEnd, "amount"),
      getCount("pos", currentStartDate, currentEndDate),
      // getCount("pos", previousMonthStart, previousMonthEnd),
      getCount("dsm", currentStartDate, currentEndDate, "amount"),
      // getCount("dsm", previousMonthStart, previousMonthEnd, "amount"),
    ]);

    // Calcul des tendances
    // const simSalesTrend = calculateTrend(simSalesCurrent, simSalesPrevious);
    // const posTopUpsTrend = calculateTrend(posTopUpsCurrent, posTopUpsPrevious);
    // const posTrend = calculateTrend(posCurrent, posPrevious);
    // const dsmTrend = calculateTrend(dsmCurrent, dsmPrevious);

    // Récupération du stock de SIM
    let simStock = 0;
    if (organizationId) {
      const org = await db.organization.findUnique({
        where: { id: organizationId },
        select: { simCount: true },
      });
      simStock = org?.simCount || 0;
    } else {
      // Pour les SUPER_ADMIN: somme des simCount de toutes les organisations
      const result = await db.organization.aggregate({
        _sum: {
          simCount: true,
        },
      });
      simStock = result._sum.simCount || 0;
    }

    return {
      data: {
        simSalesCurrent,
        // simSalesPrevious,
        posTopUpsCurrent,
        // posTopUpsPrevious,
        posCurrent,
        // posPrevious,
        dsmCurrent,
        // dsmPrevious,
        simStock,
        // simSalesTrend,
        // posTopUpsTrend,
        // posTrend,
        // dsmTrend,
      },
    };
  } catch (e) {
    return { data: null };
  }
};
