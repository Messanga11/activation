"use client";

import { type DateRange } from "react-day-picker";
import * as React from "react";

import { Calendar } from "@/components/ui/calendar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import moment from "moment";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Button } from "./ui/button";
import { CalendarIcon } from "lucide-react";

const quickDateOptions = {
  today: {
    label: "Aujourd'hui",
    value: "today",
    from: new Date(),
    to: new Date(),
  },
  yesterday: {
    label: "Hier",
    value: "yesterday",
    from: moment().subtract(1, "day").toDate(),
    to: moment().subtract(1, "day").toDate(),
  },
  thisWeek: {
    label: "Cette semaine",
    value: "thisWeek",
    from: moment().startOf("week").toDate(),
    to: moment().endOf("week").toDate(),
  },
  thisMonth: {
    label: "Ce mois",
    value: "thisMonth",
    from: moment().startOf("month").toDate(),
    to: moment().endOf("month").toDate(),
  },
} as const;

export function DateRangeSelect({
  dateRange,
  setDateRange,
}: {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
}) {
  const [selectedQuickDate, setSelectedQuickDate] =
    React.useState<keyof typeof quickDateOptions>("today");

  // biome-ignore lint/correctness/useExhaustiveDependencies: needed
  React.useEffect(() => {
    if (selectedQuickDate === "today") {
      setDateRange(quickDateOptions.today);
    } else if (selectedQuickDate === "yesterday") {
      setDateRange(quickDateOptions.yesterday);
    } else if (selectedQuickDate === "thisWeek") {
      setDateRange(quickDateOptions.thisWeek);
    } else if (selectedQuickDate === "thisMonth") {
      setDateRange({
        from: moment().startOf("month").toDate(),
        to: moment().endOf("month").toDate(),
      });
    }
  }, [selectedQuickDate]);

  const selected = Object.entries(quickDateOptions).find(([, v]) => {
    console.log(v.from, v.to, dateRange.from, dateRange.to);
    return (
      moment(v.from).format("ll") === moment(dateRange.from).format("ll") &&
      moment(v.to).format("ll") === moment(dateRange.to).format("ll")
    );
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          data-empty={!dateRange.from}
          className="data-[empty=true]:text-muted-foreground justify-start text-left font-normal"
        >
          <CalendarIcon />
          {dateRange.from ? (
            `${moment(dateRange.from).format("ll")} - ${moment(
              dateRange.to
            ).format("ll")}`
          ) : (
            <span>Pick a date</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Card className="border-transparent shadow-none">
          <CardHeader className="border-b">
            <CardTitle>{selected?.[1].label ?? "Date personnalisée"}</CardTitle>
            <CardDescription>
              du {moment(dateRange.from).format("ll")} au{" "}
              {moment(dateRange.to).format("ll")}
            </CardDescription>
            <CardAction>
              <Select
                value={selected?.[1].value}
                onValueChange={(value) =>
                  setSelectedQuickDate(value as keyof typeof quickDateOptions)
                }
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Date personnalisée" />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="today">Aujourd'hui</SelectItem>
                  <SelectItem value="yesterday">Hier</SelectItem>
                  <SelectItem value="thisWeek">Cette semaine</SelectItem>
                  <SelectItem value="thisMonth">Ce mois</SelectItem>
                </SelectContent>
              </Select>
            </CardAction>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="range"
              required
              selected={dateRange}
              onSelect={(value) =>
                setDateRange({
                  from: value.from
                    ? moment(value.from).startOf("day").toDate()
                    : undefined,
                  to: value.to
                    ? moment(value.to).endOf("day").toDate()
                    : undefined,
                })
              }
              defaultMonth={dateRange?.from}
              numberOfMonths={2}
              className="bg-transparent p-0"
              buttonVariant="outline"
            />
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}
