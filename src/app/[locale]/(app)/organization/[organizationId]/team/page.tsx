"use client";

import { TablePage } from "@/components/table-page";
import { ListTile } from "@/components/list-tile";
import { AvatarItem } from "@/components/avatar-item";
import { createMemberAction } from "@/lib/actions/member/create";
import { listMembersAction } from "@/lib/actions/member/list";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { Member, User, UserRole } from "@/generated/prisma";
import { updateMemberAction } from "@/lib/actions/member/update";
import { useState } from "react";

export default function OrganizationTeamPage() {
  const v = useValidators();

  const [formValues, setFormValues] = useState({} as { role: string });

  const isBA = formValues?.role === UserRole.BA;

  return (
    <TablePage
      title="Membres d'équipe"
      description="Gérez les membres de votre organisation"
      onFormValuesChange={setFormValues}
      columns={[
        {
          header: "Nom",
          cell: (row) => (
            <ListTile
              icon={<AvatarItem title={row.user?.name ?? ""} />}
              title={row.user?.name ?? ""}
              description={row.role}
            />
          ),
        },
        {
          header: "Role",
          cell: (row) => row.role,
        },
        {
          header: "Nombre de SIM",
          cell: (row) => row.simCount,
        },
        {
          header: "Date de création",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
      ]}
      dataService={listMembersAction}
      createAction={createMemberAction}
      updateAction={updateMemberAction}
      // deleteAction={deleteMemberAction}
      formFields={{
        name: {
          label: "Nom",
          validator: v.string,
          initialValue(item) {
            return item?.user?.name;
          },
        },
        email: {
          label: "Email",
          type: "email",
          validator: v.email,
          initialValue(item) {
            return item?.user?.email;
          },
        },
        password: {
          label: "Mot de passe",
          type: "password",
          validator: v.password,
          initialValue() {
            return "";
          },
        },
        role: {
          label: "Role",
          type: "select",
          validator: v.string,
          props: {
            options: Object.values(UserRole).map((role) => ({
              label: role,
              value: role,
            })),
          },
        },
        cni: {
          label: "CNI",
          validator: v.string,
          initialValue(item) {
            return item?.cni;
          },
        },
        blueNumber: {
          label: "Numéro bleu",
          type: "phone",
          validator: v.string,
          initialValue(item) {
            return item?.blueNumber;
          },
        },
        otherNumber: {
          label: "Numéro autre",
          type: "phone",
          validator: v.string,
          initialValue(item) {
            return item?.otherNumber;
          },
        },
        ...(isBA
          ? {
              teamLeaderId: {
                label: "Team Leader",
                type: "combobox",
                validator: v.string,
                initialValue(item) {
                  return (
                    (item as Member & { user: User })?.user?.teamLeaderId ?? ""
                  );
                },
                props: {
                  action: async (keyword: string) => {
                    const res = await listMembersAction({
                      role: UserRole.TEAM_LEADER,
                      search: keyword,
                    });
                    return res.data?.data ?? [];
                  },
                  getOptionLabel: (option) => option.user.name,
                  getOptionValue: (option) => option.user.id,
                },
              },
            }
          : {}),
      }}
      canCreate={true}
      canEdit={true}
      canDelete={true}
    />
  );
}
