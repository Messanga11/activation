"use client";

import { TablePage } from "@/components/table-page";
import { getUsersAction } from "@/lib/actions/user/list";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { UserRole } from "@/generated/prisma";
import { createUserAction } from "@/lib/actions/user/create";
import { updateUserAction } from "@/lib/actions/user/update";
import { deleteUserAction } from "@/lib/actions/user/delete";

export default function UsersPage() {
  const v = useValidators();
  return (
    <TablePage
      title="Utilisateurs"
      description="Gestion des utilisateurs"
      columns={[
        {
          header: "Nom",
          cell: (row) => row.name,
        },
        {
          header: "Email",
          cell: (row) => row.email,
        },
        {
          header: "Role",
          cell: (row) => row.role,
        },
      ]}
      dataService={getUsersAction}
      createAction={createUserAction}
      updateAction={updateUserAction}
      deleteAction={deleteUserAction}
      formFields={{
        name: {
          label: "Nom",
          type: "text",
          validator: v.string,
        },
        email: {
          label: "Email",
          type: "email",
          validator: v.email,
        },
        password: {
          label: "Mot de passe",
          type: "password",
          validator: v.password,
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
      }}
      canCreate={true}
      canEdit={true}
      canDelete={true}
    />
  );
}
