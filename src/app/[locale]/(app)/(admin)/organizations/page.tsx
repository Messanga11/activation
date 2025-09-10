"use client";

import { TablePage } from "@/components/table-page";
import { useValidators } from "@/components/ui/auto-form/utils/validators";
import { createOrganizationAction } from "@/lib/actions/organization/create";
import { deleteOrganizationAction } from "@/lib/actions/organization/delete";
import { getOrganizationsAction } from "@/lib/actions/organization/list";
import { updateOrganizationAction } from "@/lib/actions/organization/update";
import { AvatarItem } from "@/components/avatar-item";
import { ListTile } from "@/components/list-tile";
import { Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function OrganizationsPage() {
  const v = useValidators();
  const router = useRouter();

  return (
    <TablePage
      title="Organisations"
      description="Gérez les organisations de votre application"
      columns={[
        {
          header: "Nom",
          cell: (row) => (
            <ListTile
              icon={<AvatarItem title={row?.slug ?? ""} />}
              title={row?.name}
              description={row?.slug}
            />
          ),
        },
        {
          header: "Slug",
          accessorKey: "slug",
        },
        {
          header: "Date de création",
          accessorKey: "createdAt",
          cell: (row) => new Date(row.createdAt).toLocaleDateString(),
        },
      ]}
      dataService={getOrganizationsAction}
      createAction={createOrganizationAction}
      updateAction={updateOrganizationAction}
      deleteAction={deleteOrganizationAction}
      formFields={{
        name: {
          label: "Nom",
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
        slug: {
          label: "Slug",
          validator: v.string,
        },
        // logo: {
        //   label: "URL du logo",
        //   validator: v.string.optional(),
        // },
        cni: {
          label: "CNI",
          validator: v.string,
        },
        blueNumber: {
          label: "Numéro bleu",
          type: "phone",
          validator: v.string,
        },
        otherNumber: {
          label: "Numéro autre",
          type: "phone",
          validator: v.string,
        },
      }}
      otherActions={(row) => [
        <Button
          key={`organization-${row.id}`}
          variant="outline"
          size="sm"
          onClick={() => router.push(`/organization/${row.id}`)}
        >
          <Eye className="h-4 w-4" />
        </Button>,
      ]}
      canCreate={true}
      canEdit={true}
      canDelete={true}
    />
  );
}
