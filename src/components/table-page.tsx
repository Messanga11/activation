"use client";

import { ShinyTable } from "@/components/shiny-table";
import { AutoForm } from "@/components/ui/auto-form";
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
import { Plus, Search } from "lucide-react";
import { useRef } from "react";
import { useValidators } from "@/components/ui/auto-form/utils/validators";

export function TablePage() {
  const btnRef = useRef<HTMLButtonElement | null>(null);
  const v = useValidators();

  return (
    <div className="flex flex-1 flex-col p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Organizations</h2>
          <p className="text-muted-foreground text-md text-balance">
            Une bonne description de la page
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus />
              Ajouter
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une organisation</DialogTitle>
              <DialogDescription>
                Remplissez les champs suivants pour ajouter une organisation
              </DialogDescription>
            </DialogHeader>
            <div>
              <AutoForm
                btnRef={btnRef}
                onSubmit={(data) => console.log(data)}
                fields={{
                  name: {
                    label: "Nom",
                    initialValue: (initialItem?: any) => "",
                    validator: v.string,
                  },
                  description: {
                    label: "Description",
                    initialValue: (initialItem?: any) => "",
                    validator: v.string,
                  },
                }}
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={() => btnRef.current?.click()}>
                Enregistrer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4" />
        <Input placeholder="Recherche..." className="pl-8" />
      </div>
      <ShinyTable
        cols={[
          {
            header: "Name",
            accessorKey: "name",
          },
          {
            header: "Description",
            accessorKey: "description",
          },
        ]}
        data={[
          {
            name: "Organization 1",
            description: "Description 1",
          },
          {
            name: "Organization 2",
            description: "Description 2",
          },
          {
            name: "Organization 3",
            description: "Description 3",
          },
          {
            name: "Organization 4",
            description: "Description 4",
          },
        ]}
      />
    </div>
  );
}
