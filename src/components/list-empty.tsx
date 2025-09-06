"use client";

import { PackageOpen } from "lucide-react";
import { useTranslations } from "next-intl";
import React from "react";

export function ListItemsEmpty() {
  const t = useTranslations("SettingsPage");

  return (
    <div className="w-full flex justify-center mt-20">
      <div className="flex flex-col justify-center items-center gap-2.5 w-full md:w-2/4">
        <div className="size-20 bg-success/10 flex items-center justify-center text-success rounded-full">
          <PackageOpen size={35} />
        </div>
        <h4 className="text-xl text-gray1 font-fuzzy font-semibold text-center">
          {t("empty_state_title")}
        </h4>
        <p className="text-center text-sm text-gray font-poppins">
          {t("empty_state_description")}
        </p>
      </div>
    </div>
  );
}
