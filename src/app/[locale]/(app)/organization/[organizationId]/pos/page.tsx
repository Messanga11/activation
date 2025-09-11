"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { PosType } from "@/generated/prisma";
import { listPosAction } from "@/lib/actions/pos/list";
import { createPosAction, updatePosAction } from "@/lib/actions/pos/create";
import { getDsmsAction } from "@/lib/actions/dsm/list";
import { useTranslations } from "next-intl";

export default function OrganizationPosPage() {
  const v = useValidators();
  const t = useTranslations();

  return (
    <TablePage
      title="DSM"
      description="Gérez les DSM de votre organisation"
      dataService={listPosAction}
      createAction={createPosAction}
      updateAction={updatePosAction}
      // deleteAction={deleteMemberAction}
      columns={[
        {
          header: "Date de création",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
        {
          header: "Numéro blue DSM",
          cell: (row) => row.blueNumber,
        },
        {
          header: "Numéro Master associé",
          cell: (row) => row.dsm.number,
        },
        {
          header: "Nom du client",
          cell: (row) => row.holderName,
        },
        {
          header: "Autre numéro",
          cell: (row) => row.otherNumber,
        },
        {
          header: "CNI du client",
          cell: (row) => row.cni,
        },
        {
          header: "Adresse",
          cell: (row) => row.address,
        },
        {
          header: "Type",
          cell: (row) => t(`common.dsm.${row.type}`),
        },
      ]}
      formFields={{
        blueNumber: {
          label: "Numéro Blue",
          type: "phone",
          validator: v.string,
          initialValue(item) {
            return item.blueNumber;
          },
        },
        otherNumber: {
          label: "Autre numéro",
          type: "phone",
          validator: v.string,
          initialValue(item) {
            return item.otherNumber;
          },
        },
        cni: {
          label: "CNI",
          validator: v.string,
          initialValue(item) {
            return item.cni;
          },
        },
        address: {
          label: "Adresse",
          validator: v.string,
          initialValue(item) {
            return item.address;
          },
        },
        holderName: {
          label: "Nom",
          validator: v.string,
          initialValue(item) {
            return item.holderName;
          },
        },
        dsmId: {
          label: "Master",
          type: "combobox",
          validator: v.string,
          props: {
            action: async (keyword: string) => {
              const res = await getDsmsAction({ search: keyword });
              console.log(res);
              return res.data?.data ?? [];
            },
            getOptionLabel: (option) => `${option.name} (${option.number})`,
            getOptionValue: (option) => option.id,
          },
          initialValue(item) {
            return item.dsmId;
          },
        },
        type: {
          label: "Type",
          type: "select",
          validator: v.string,
          props: {
            options: Object.values(PosType).map((type) => ({
              label: t(`common.dsm.${type}`),
              value: type,
            })),
          },
          initialValue(item) {
            return item.type;
          },
        },
      }}
    />
  );
}
