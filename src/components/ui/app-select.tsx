/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "./select";
import { cn } from "@/lib/utils";

type TSelectLabel = {
  type: "label";
  value: string;
};

export type TAppSelectProps<T> = {
  options: (T | TSelectLabel)[];
  getLabel?: (option: T) => string;
  getValue?: (option: T) => string;
  onChange?: (value: string) => void;
  value?: string;
  placeholder?: string;
  renderOption?: (option: T) => React.ReactNode;
  triggerClassName?: string;
  selectValueClassName?: string;
};

export function AppSelect<T>({
  options,
  getLabel,
  getValue,
  onChange,
  placeholder,
  value,
  renderOption,
  triggerClassName,
  selectValueClassName,
}: TAppSelectProps<T>) {
  const getOptionLabel =
    getLabel ?? ((option: { label: string }) => option.label);
  const getOptionValue =
    getValue ?? ((option: { value: string }) => option.value);

  return (
    <Select onValueChange={onChange} value={value} defaultValue={value}>
      <SelectTrigger
        className={cn(
          "pl-[28px] pr-[24px] rounded-full min-h-[52px] border-gray text-base",
          triggerClassName
        )}
      >
        <SelectValue
          className={cn("[data-placeholder]:text-gray", selectValueClassName)}
          placeholder={placeholder ?? "Please select an option"}
        />
      </SelectTrigger>
      <SelectContent className="rounded-[15px] backdrop-blur-[4px] bg-popover/80">
        {options.map((option) => (
          <React.Fragment
            key={`Select-${getOptionValue(option as any)}-${getOptionLabel(
              option as any
            )}`}
          >
            {(option as TSelectLabel).type === "label" ? (
              <SelectLabel>{(option as TSelectLabel).value}</SelectLabel>
            ) : (
              <SelectItem
                className="cursor-pointer text-base py-[12.5px] px-5"
                value={getOptionValue(option as any)}
              >
                {renderOption?.(option as T) ?? getOptionLabel(option as any)}
              </SelectItem>
            )}
          </React.Fragment>
        ))}
      </SelectContent>
    </Select>
  );
}
