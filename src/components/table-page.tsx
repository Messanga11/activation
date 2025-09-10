/** biome-ignore-all lint/suspicious/noExplicitAny: any is needed here */
"use client";

import { useState, useRef } from "react";
import { ShinyTable } from "@/components/shiny-table";
import { AutoForm, type AutoFormProps } from "@/components/ui/auto-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Plus, Search, Edit, Trash, Loader2 } from "lucide-react";
import { useTableData } from "@/hooks/use-table-data";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { ACCESS } from "@/config/access";
import { authClient } from "@/lib/auth-client";
import { useParams, usePathname } from "next/navigation";
import { UserRole } from "@/generated/prisma";
import { useValidators } from "./ui/auto-form/utils/validators";

export interface TablePageColumn<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T, index: number) => React.ReactNode;
  headerClassName?: string;
  cellClassName?: string;
}

export interface TablePageProps<T> {
  title: string;
  description: string;
  columns: TablePageColumn<T>[];
  dataService: (params: {
    page: number;
    limit: number;
    search?: string;
    filters?: Record<string, any>;
  }) => Promise<{
    success: boolean;
    data?: {
      data: T[];
      pagination: {
        page: number;
        limit: number;
        total: number;
        pages: number;
      };
    };
    error?: string;
  }>;
  refetchInterval?: number;
  createAction?: (data: any) => Promise<{ success: boolean; error?: string }>;
  updateAction?: (data: any) => Promise<{ success: boolean; error?: string }>;
  deleteAction?: (data: any) => Promise<{ success: boolean; error?: string }>;
  formFields?: AutoFormProps<any>["fields"];
  initialFormData?: any;
  className?: string;
  resolveData?: (data: any) => T[];
  otherActions?: (row: T) => React.ReactNode[];
  onFormValuesChange?: (values: any) => void;
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  filters?: AutoFormProps<any>["fields"];
}

export function TablePage<T extends object>({
  title,
  description,
  columns,
  dataService,
  createAction,
  updateAction,
  deleteAction,
  formFields = {},
  className,
  resolveData,
  otherActions,
  refetchInterval,
  onFormValuesChange,
  canCreate: _canCreate,
  canEdit: _canEdit,
  canDelete: _canDelete,
  filters,
}: TablePageProps<T>) {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const session = authClient.useSession();
  const pathname = usePathname();
  const _params = useParams();

  const { data, loading, pagination, updateParams, refresh } =
    // @ts-expect-error
    useTableData<T>(dataService, title, {
      refetchInterval,
    });
  const v = useValidators();

  const userRole = session.data?.user?.role;

  const isAdmin = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.SUPERVISOR,
  ].includes((userRole as "ADMIN") ?? "");

  const access = Object.fromEntries(
    Object.entries(ACCESS[(userRole as "BA") ?? ""] ?? {}).map(
      ([key, value]) => {
        let transformedKey = key;
        Object.keys(_params).forEach((k: keyof typeof _params) => {
          // @ts-expect-error
          transformedKey = transformedKey.replace(`[${k}]`, _params[k]);
        });
        return [transformedKey, value];
      }
    )
  );
  const availableActions = access?.[pathname.replace(`/${_params.locale}`, "")];
  const canCreate =
    _canCreate ??
    (isAdmin || (availableActions ? availableActions.create : false));
  const canEdit =
    _canEdit ??
    (isAdmin || (availableActions ? availableActions.update : false));
  const canDelete =
    _canDelete ??
    (isAdmin || (availableActions ? availableActions.delete : false));

  const handleSearch = (filters: any) => {
    updateParams({ ...filters, page: 1 });
  };

  const handlePageChange = (page: number) => {
    updateParams({ page });
  };

  const handleCreate = async (formData: any) => {
    if (!createAction) return;

    setFormError(null);
    setIsLoading(true);
    const data: any = {};
    Object.entries(formData)
      .filter(([, value]) => !!value)
      .forEach(([key, value]) => {
        data[key] = value;
      });
    const result = await createAction(data);

    if (result.success) {
      setIsDialogOpen(false);
      refresh();
    } else {
      setFormError(result.error || "Failed to create item");
    }
    setIsLoading(false);
  };

  const handleEdit = async (formData: any) => {
    if (!updateAction) return;

    setFormError(null);
    setIsLoading(true);
    const data: any = {};
    Object.entries(formData)
      .filter(([, value]) => !!value)
      .forEach(([key, value]) => {
        data[key] = value;
      });
    const result = await updateAction({ ...data, id: editingItem.id });

    if (result.success) {
      setIsDialogOpen(false);
      setEditingItem(null);
      refresh();
    } else {
      setFormError(result.error || "Failed to update item");
    }
    setIsLoading(false);
  };

  const handleDelete = async () => {
    if (!deleteAction || !itemToDelete) return;

    setIsLoading(true);
    const result = await deleteAction({ id: itemToDelete.id });

    if (result.success) {
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
      refresh();
    } else {
      setFormError(result.error || "Failed to delete item");
    }
    setIsLoading(false);
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setIsDialogOpen(true);
    setFormError(null);
  };

  const openDeleteDialog = (item: any) => {
    setItemToDelete(item);
    setIsDeleteDialogOpen(true);
  };

  const actionColumns: TablePageColumn<T>[] = [
    ...columns,
    {
      header: "Actions",
      cell: (row: any) => (
        <div className="flex space-x-2">
          {...otherActions?.(row) ?? []}
          {canEdit && updateAction && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => openEditDialog(row)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {canDelete && deleteAction && (
            <Button
              variant="destructive"
              size="sm"
              onClick={() => openDeleteDialog(row)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className={cn("flex flex-1 flex-col p-5", className)}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">{title}</h2>
          <p className="text-muted-foreground text-md text-balance">
            {description}
          </p>
        </div>
        {canCreate && createAction && (
          <Dialog
            open={isDialogOpen}
            onOpenChange={isLoading ? undefined : setIsDialogOpen}
          >
            <DialogTrigger asChild>
              <Button
                onClick={() => {
                  setEditingItem(null);
                  setFormError(null);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Ajouter
              </Button>
            </DialogTrigger>
            <DialogContent
              className={cn(
                isLoading && "pointer-events-none",
                "p-0 overflow-hidden"
              )}
            >
              <ScrollArea className="max-h-[calc(100vh-20rem)]">
                <div className="relative p-5">
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center z-50 bg-muted/70">
                      <Loader2 className="animate-spin size-5" />
                    </div>
                  )}
                  <DialogHeader>
                    <DialogTitle>
                      {editingItem ? "Modifier" : "Ajouter"} {title}
                    </DialogTitle>
                    <DialogDescription>
                      Remplissez les champs suivants pour{" "}
                      {editingItem ? "modifier" : "ajouter"} un élément
                    </DialogDescription>
                  </DialogHeader>
                  <div className="mt-4">
                    <AutoForm
                      btnRef={btnRef}
                      onSubmit={editingItem ? handleEdit : handleCreate}
                      onFormChange={onFormValuesChange}
                      fields={formFields}
                      initialItem={editingItem}
                    />
                    {formError && (
                      <div className="text-destructive text-sm mt-2">
                        {formError}
                      </div>
                    )}
                  </div>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button variant="outline">Annuler</Button>
                    </DialogClose>
                    <Button onClick={() => btnRef.current?.click()}>
                      {editingItem ? "Modifier" : "Créer"}
                    </Button>
                  </DialogFooter>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <AutoForm
        onFormChange={(values) => handleSearch(values)}
        submitBtnClassName="hidden"
        className="flex items-center gap-2"
        fields={{
          search: {
            label: "",
            props: {
              startIcon: <Search className="h-4 w-4" />,
            },
            validator: v.string_nr,
            placeholder: "Rechercher...",
            className: "flex-1",
          },
          ...(filters || {}),
        }}
      />

      <div className="lg:w-[calc(100vw-330px)] rounded-[15px] overflow-hidden">
        <ShinyTable
          // @ts-expect-error
          cols={actionColumns}
          data={data}
          isLoading={loading}
          currentPage={pagination.page}
          totalPages={pagination.pages}
          setCurrentPage={handlePageChange}
          resolveData={resolveData}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer cet élément ? Cette action est
              irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
