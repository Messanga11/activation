"use client";

import { IconUpload } from "@tabler/icons-react";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "./ui/dialog";
import { DatePicker } from "./date-picker";
import { AppSelect } from "./ui/app-select";
import moment from "moment";
import { Label } from "./ui/label";
import { Loader2 } from "lucide-react";

export default function ExportButton({ model }: { model?: string }) {
  const [start, setStart] = useState<string>("2024-01-01");
  const [end, setEnd] = useState<string>("2024-12-31");
  const [period, setPeriod] = useState<string>("today");
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/export?start=${start}&end=${end}&model=${model}`
      );
      if (!res.ok) throw new Error("Export failed");

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `${model}_${start}_${end}.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);

      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  }

  useEffect(() => {
    if (period === "today") {
      setStart(moment().format("YYYY-MM-DD"));
      setEnd(moment().format("YYYY-MM-DD"));
    } else if (period === "yesterday") {
      setStart(moment().subtract(1, "day").format("YYYY-MM-DD"));
      setEnd(moment().subtract(1, "day").format("YYYY-MM-DD"));
    } else if (period === "this-week") {
      setStart(moment().startOf("week").format("YYYY-MM-DD"));
      setEnd(moment().endOf("week").format("YYYY-MM-DD"));
    } else if (period === "this-month") {
      setStart(moment().startOf("month").format("YYYY-MM-DD"));
      setEnd(moment().endOf("month").format("YYYY-MM-DD"));
    }
  }, [period]);

  const isStartBeforeEnd = moment(start).isBefore(end);

  if (!model) return null;

  return (
    <Dialog open={open} onOpenChange={loading ? undefined : setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={loading}>
          <IconUpload className="size-4 lg:mr-2" />
          <span className="hidden lg:inline">Exporter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-[200px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Exporter</DialogTitle>
          <DialogDescription>Exporter dans un fichier Excel</DialogDescription>
        </DialogHeader>
        <div>
          <Label className="mb-2">Période</Label>
          <AppSelect
            triggerClassName="w-full"
            value={period}
            onChange={setPeriod}
            options={[
              { label: "Aujourd'hui", value: "today" },
              { label: "Hier", value: "yesterday" },
              { label: "Cette semaine", value: "this-week" },
              { label: "Ce mois", value: "this-month" },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2 flex-wrap">
          <span>{isStartBeforeEnd ? "du" : "le"}</span>
          <DatePicker disabled value={start} />
          {isStartBeforeEnd && (
            <>
              <span>au</span>
              <DatePicker disabled value={end} />
            </>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Annuler</Button>
          </DialogClose>
          <Button onClick={handleExport} disabled={loading}>
            {loading ? <Loader2 className="animate-spin" /> : "Exporter"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
