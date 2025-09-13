"use client";

import { TablePage } from "@/components/table-page";
import { ListTile } from "@/components/list-tile";
import { AvatarItem } from "@/components/avatar-item";
import { createSimSaleAction } from "@/lib/actions/simSale/create";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { listSimSalesAction } from "@/lib/actions/simSale/list";
import { listMembersAction } from "@/lib/actions/member/list";
import { SimSale, SimSaleStatus, UserRole } from "@/generated/prisma";
import { authClient } from "@/lib/auth-client";
import { updateStatusAction } from "@/lib/actions/simSale/update-status";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { AutoForm } from "@/components/ui/auto-form";
import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { showAlert } from "@/components/show-alert";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function SimSalesPage() {
  const v = useValidators();
  const session = authClient.useSession();
  const queryClient = useQueryClient();

  const isBA = session?.data?.user?.role === UserRole.BA;

  return (
    <TablePage
      title="Ventes de SIM"
      description="Gérez les ventes de SIM de votre organisation"
      exportModel="simSale"
      dataService={listSimSalesAction}
      createAction={createSimSaleAction}
      otherActions={(row) => [
        !row.status ||
        row.status === SimSaleStatus.ACTIVATING ||
        row.status === SimSaleStatus.REJECTED ? (
          <Button
            key={`activate-${row.id}`}
            variant="outline"
            onClick={() => {
              showAlert({
                title: !row.status
                  ? "Démarrer l'activation"
                  : row.status === SimSaleStatus.REJECTED
                    ? "Relancer l'activation"
                    : row.status === SimSaleStatus.ACTIVATING
                      ? "Terminer l'activation"
                      : "",
                message:
                  row.status === SimSaleStatus.ACTIVATING
                    ? "Voulez-vous vraiment démarrer l'activation ?"
                    : row.status === SimSaleStatus.REJECTED
                      ? "Voulez-vous vraiment relancer l'activation ?"
                      : row.status === SimSaleStatus.ACTIVATED
                        ? "Voulez-vous vraiment terminer l'activation ?"
                        : "",
                onConfirm: async () => {
                  const data = await updateStatusAction({
                    id: row.id,
                    isRejected: false,
                  });
                  if (!data.success) {
                    throw new Error(data.error);
                  }
                  queryClient.resetQueries({
                    queryKey: ["tableData"],
                  });
                },
              });
            }}
          >
            {!row.status
              ? "Démarer l'activation"
              : row.status === SimSaleStatus.REJECTED
                ? "Relancer l'activation"
                : row.status === SimSaleStatus.ACTIVATING
                  ? "Terminer l'activation"
                  : ""}
          </Button>
        ) : null,
        row.status === SimSaleStatus.ACTIVATING ||
        row.status === SimSaleStatus.ACTIVATED ? (
          <RejectSimSale key={`reject-${row.id}`} row={row} />
        ) : null,
      ]}
      rowClassName={(row) =>
        // biome-ignore lint/suspicious/noExplicitAny: needed
        (row as any).isDuplicated
          ? "bg-orange-800"
          : row.status === SimSaleStatus.ACTIVATING
            ? "bg-blue-800"
            : row.status === SimSaleStatus.ACTIVATED
              ? "bg-green-800"
              : row.status === SimSaleStatus.REJECTED
                ? "bg-destructive/20"
                : ""
      }
      columns={[
        {
          header: "Client",
          cellClassName: "min-w-[250px]",
          cell: (row) => (
            <ListTile
              icon={<AvatarItem title={row.customerName ?? ""} />}
              title={row.customerName ?? ""}
              description={`CNI: ${row.cni ?? ""}`}
            />
          ),
        },
        {
          header: "Date de vente",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          header: "Numéro blue",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.blueNumber}</span>
            </div>
          ),
        },
        {
          header: "Autre numéro",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.otherNumber}</span>
            </div>
          ),
        },
        {
          header: "CNI du client",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.cni}</span>
            </div>
          ),
        },
        {
          header: "Adresse",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.address}</span>
            </div>
          ),
        },
        {
          header: "IMEI",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.imei}</span>
            </div>
          ),
        },

        {
          header: "ICCID",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.iccid}</span>
            </div>
          ),
        },
        {
          header: "BA",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.ba?.user?.name || "N/A"}</span>
            </div>
          ),
        },
        {
          header: "Team leader",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.teamLeader?.user?.name || "N/A"}</span>
            </div>
          ),
        },
        {
          header: "Raison de refus",
          cell: (row) => (
            <div className="flex flex-col">
              <span>{row.rejectReason || "-"}</span>
            </div>
          ),
        },
      ]}
      formFields={{
        customerName: {
          label: "Nom du client",
          validator: v.string.min(1, "Le nom du client est requis"),
        },
        cni: {
          label: "Numéro CNI",
          validator: v.string.min(1, "Le numéro CNI est requis"),
        },
        blueNumber: {
          label: "Numéro bleu",
          type: "phone",
          validator: v.string.min(1, "Le numéro bleu est requis"),
        },
        otherNumber: {
          label: "Autre numéro",
          type: "phone",
          validator: v.string.min(1, "L'autre numéro est requis"),
        },
        address: {
          label: "Adresse",
          validator: v.string.min(1, "L'adresse est requise"),
        },
        imei: {
          label: "IMEI",
          validator: v.string.min(1, "L'IMEI est requis"),
        },
        iccid: {
          label: "ICCID",
          validator: v.string.min(1, "L'ICCID est requis"),
        },
        ...(isBA
          ? {}
          : {
              baId: {
                label: "BA",
                type: "combobox",
                validator: v.string.cuid("Sélectionnez un BA valide"),
                // Note: Vous devrez ajouter une logique pour charger les options des BA
                props: {
                  action: async (keyword) => {
                    const res = await listMembersAction({
                      role: UserRole.BA,
                      search: keyword,
                    });
                    return res.data?.data ?? [];
                  },
                  getOptionLabel: (option) => option.user.name,
                  getOptionValue: (option) => option.user.id,
                },
              },
            }),
      }}
    />
  );
}

function RejectSimSale({ row }: { row: SimSale }) {
  const v = useValidators();
  const btnReject = useRef<HTMLButtonElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();

  const onSubmit = async (data: { rejectReason: string }) => {
    try {
      setLoading(true);
      const res = await updateStatusAction({
        id: row.id,
        isRejected: true,
        rejectReason: data.rejectReason,
      });
      if (!res.success) {
        throw new Error(res.error);
      }
      queryClient.resetQueries({
        queryKey: ["tableData"],
      });
      toast.success("Vente refusée");
      setIsOpen(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog key={`reject-${row.id}`} open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          onClick={() => {
            btnReject.current?.click();
          }}
        >
          Refuser
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Refuser la vente</DialogTitle>
          <DialogDescription>
            Voulez-vous vraiment refuser la vente ?
          </DialogDescription>

          <AutoForm
            btnRef={btnReject}
            disabled={loading}
            fields={{
              rejectReason: {
                label: "Raison",
                type: "textarea",
                helper: "Pourquoi refuser la vente ?",
                validator: v.string,
              },
            }}
            onSubmit={onSubmit}
          />

          <DialogFooter>
            <DialogClose asChild>
              <Button disabled={loading} variant="outline">
                Annuler
              </Button>
            </DialogClose>
            <Button
              disabled={loading}
              onClick={() => btnReject.current?.click()}
            >
              {loading ? <Loader2 className="animate-spin" /> : "Confirmer"}
            </Button>
          </DialogFooter>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
