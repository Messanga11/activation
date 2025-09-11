"use client";

import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DateRangeSelect } from "./date-range-select";
import React from "react";
import type { DateRange } from "react-day-picker";
import { useQuery } from "@tanstack/react-query";
import { getStatsAction } from "@/lib/actions/stats/get";
import { Loader2 } from "lucide-react";

export function SectionCards() {
  const [dateRange, setDateRange] = React.useState<DateRange>({
    from: new Date(),
    to: new Date(),
  });

  const { data: res, isPending } = useQuery({
    queryKey: ["stats", dateRange],
    queryFn: () => getStatsAction(dateRange),
  });

  const { simSalesCurrent, posTopUpsCurrent, simStock, dsmCurrent } =
    res?.data || {};

  return (
    <section className="px-4 lg:px-6 space-y-4">
      {/* Carte 3: Stock de SIM */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="mr-auto">
          <h2 className="text-5xl font-semibold tabular-nums @[250px]/card:text-3xl">
            Tableau de bord
          </h2>
          <p className="text-sm text-muted-foreground ml-auto">
            Stock de SIM: {simStock ?? "patientez..."}
          </p>
        </div>
        <DateRangeSelect dateRange={dateRange} setDateRange={setDateRange} />
      </div>
      {isPending ? (
        <div className="p-6 justify-center items-center">
          <Loader2 className="animate-spin" />
        </div>
      ) : !res?.data ? (
        <div className="p-6 justify-center items-center">
          <p className="text-center text-sm text-gray font-poppins">
            Nous ne parvenons pas a charger les données
          </p>
        </div>
      ) : (
        <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs @xl/main:grid-cols-3 @5xl/main:grid-cols-3">
          {/* Carte 1: Ventes de SIM */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Ventes de SIM</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {simSalesCurrent}
              </CardTitle>
              {/* <CardAction>
              <Badge variant="outline">
                {simSalesTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                {simSalesTrend >= 0
                  ? `+${simSalesTrend.toFixed(1)}%`
                  : `${simSalesTrend.toFixed(1)}%`}
              </Badge>
            </CardAction> */}
            </CardHeader>
            {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
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
          </CardFooter> */}
          </Card>

          {/* Carte 2: Vente de crédit */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Vente de crédit</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {posTopUpsCurrent}
              </CardTitle>
              {/* <CardAction>
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
            </CardAction> */}
            </CardHeader>
            {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
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
          </CardFooter> */}
          </Card>

          {/* Carte 4: Solde Masters */}
          <Card className="@container/card">
            <CardHeader>
              <CardDescription>Solde Masters</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
                {dsmCurrent}
              </CardTitle>
              {/* <CardAction>
              <Badge variant="outline">
                {dsmTrend >= 0 ? <IconTrendingUp /> : <IconTrendingDown />}
                {dsmTrend >= 0
                  ? `+${dsmTrend.toFixed(1)}%`
                  : `${dsmTrend.toFixed(1)}%`}
              </Badge>
            </CardAction> */}
            </CardHeader>
            {/* <CardFooter className="flex-col items-start gap-1.5 text-sm">
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
          </CardFooter> */}
          </Card>
        </div>
      )}
    </section>
  );
}
