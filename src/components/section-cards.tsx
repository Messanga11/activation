// src/components/section-cards.tsx
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSession } from "@/lib/auth/role";
import { db } from "@/lib/db";

export async function SectionCards() {
  const session = await getSession();

  if (!session.user) {
    return null;
  }

  const organizationId = session.user.organizationId;
  const currentDate = new Date();
  const currentMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    1
  );
  const previousMonthStart = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth() - 1,
    1
  );
  const previousMonthEnd = new Date(
    currentDate.getFullYear(),
    currentDate.getMonth(),
    0
  );

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
    if (customPop) {
      const result = await db[model as "simSale"].findMany({
        where:
          model === "posTopUp"
            ? {
                // @ts-expect-error
                pos: {
                  organizationId,
                },
              }
            : {
                organizationId,
              },
        select: {
          [customPop]: true,
        },
      });
      // @ts-expect-error
      return result.reduce((acc, item) => acc + item[customPop], 0);
    }
    const whereCondition: any = {
      organizationId,
      createdAt: {
        gte: start,
        lte: end,
      },
    };

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
      simSalesPrevious,
      posTopUpsCurrent,
      posTopUpsPrevious,
      posCurrent,
      posPrevious,
      dsmCurrent,
      dsmPrevious,
    ] = await Promise.all([
      getCount("simSale", currentMonthStart, currentDate),
      getCount("simSale", previousMonthStart, previousMonthEnd),
      getCount("posTopUp", currentMonthStart, currentDate, "amount"),
      getCount("posTopUp", previousMonthStart, previousMonthEnd, "amount"),
      getCount("pos", currentMonthStart, currentDate),
      getCount("pos", previousMonthStart, previousMonthEnd),
      getCount("dsm", currentMonthStart, currentDate, "amount"),
      getCount("dsm", previousMonthStart, previousMonthEnd, "amount"),
    ]);

    // Calcul des tendances
    const simSalesTrend = calculateTrend(simSalesCurrent, simSalesPrevious);
    const posTopUpsTrend = calculateTrend(posTopUpsCurrent, posTopUpsPrevious);
    const posTrend = calculateTrend(posCurrent, posPrevious);
    const dsmTrend = calculateTrend(dsmCurrent, dsmPrevious);

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

    return (
      <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Carte 1: Ventes de SIM */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Ventes de SIM</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {simSalesCurrent}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {simSalesTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                {simSalesTrend >= 0
                  ? `+${simSalesTrend.toFixed(1)}%`
                  : `${simSalesTrend.toFixed(1)}%`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {simSalesTrend >= 0
                ? "Augmentation ce mois"
                : "Diminution ce mois"}
              {simSalesTrend >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Par rapport au mois dernier
            </div>
          </CardFooter>
        </Card>

        {/* Carte 2: Vente de crédit */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Vente de crédit</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {posTopUpsCurrent}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {posTopUpsTrend >= 0 ? (
                  <IconTrendingUp />
                ) : (
                  <IconTrendingDown />
                )}
                {posTopUpsTrend >= 0
                  ? `+${posTopUpsTrend.toFixed(1)}%`
                  : `${posTopUpsTrend.toFixed(1)}%`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {posTopUpsTrend >= 0
                ? "Augmentation ce mois"
                : "Diminution ce mois"}
              {posTopUpsTrend >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Par rapport au mois dernier
            </div>
          </CardFooter>
        </Card>

        {/* Carte 3: Stock de SIM */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Stock de SIM</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {simStock}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              Stock actuel
            </div>
            <div className="text-muted-foreground">Total des SIM en stock</div>
          </CardFooter>
        </Card>

        {/* Carte 4: Solde Masters */}
        <Card className="@container/card">
          <CardHeader>
            <CardDescription>Solde Masters</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {dsmCurrent}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {dsmTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                {dsmTrend >= 0
                  ? `+${dsmTrend.toFixed(1)}%`
                  : `${dsmTrend.toFixed(1)}%`}
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {dsmTrend >= 0 ? "Augmentation ce mois" : "Diminution ce mois"}
              {dsmTrend >= 0 ? (
                <IconTrendingUp className="size-4" />
              ) : (
                <IconTrendingDown className="size-4" />
              )}
            </div>
            <div className="text-muted-foreground">
              Par rapport au mois dernier
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  } catch (error) {
    console.error("Erreur lors du chargement des statistiques:", error);
    return (
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        <Card>
          <CardHeader>
            <CardDescription>Erreur</CardDescription>
            <CardTitle className="text-2xl font-semibold">
              Données indisponibles
            </CardTitle>
          </CardHeader>
          <CardFooter>
            <div className="text-muted-foreground">
              Impossible de charger les statistiques
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }
}
