"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2 } from "lucide-react";
import { Badge } from "./badge";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";

export type ComboboxProps<T, M extends boolean = false> = {
  multiple?: M;
  url?: string;
  options?: T[];
  resolveOptions?: (data: any) => T[];
  getOptionLabel: (option: T) => string;
  getOptionValue: (option: T) => string;
  renderOption?: (option: T) => React.ReactNode;
  value?: M extends true ? string[] : string;
  onChange?: (value: M extends true ? string[] : string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  maxDisplayedItems?: number;
  action?: (keyword: string) => Promise<T[]>;
};

export function Combobox<T, M extends boolean = false>({
  multiple = false as M,
  url,
  action,
  options: initialOptions = [],
  resolveOptions = (data) => data as T[],
  getOptionLabel,
  getOptionValue,
  renderOption,
  value,
  onChange,
  placeholder = "Select an item...",
  searchPlaceholder = "Search...",
  className,
  maxDisplayedItems = 3,
}: ComboboxProps<T, M>) {
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState<
    M extends true ? string[] : string
    // @ts-expect-error
  >(multiple ? ([] as string[]) : ("" as M extends true ? string[] : string));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOptions, setSelectedOptions] = useState<T[]>(() =>
    initialOptions ? getSelectedOptions(initialOptions, value) : []
  );

  function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (crypto.getRandomValues(new Uint8Array(1))[0] & 15) >> 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  const fetchData = async () => {
    if (!url && !action) return;

    if (action) {
      const data = await action(searchQuery);
      const resolved = resolveOptions(data);
      return resolved;
    } else {
      // @ts-expect-error
      const response = await fetch(url);
      const data = await response.json();
      const resolved = resolveOptions(data);
      return resolved;
    }
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: enough
  const id = useMemo(() => uuidv4(), []);

  const { data, isPending: loading } = useQuery({
    queryKey: ["combobox", url, searchQuery, multiple, id],
    queryFn: () => fetchData(),
    enabled: !!url || !!action,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
    refetchInterval: 0,
    refetchIntervalInBackground: false,
    throwOnError: true,
  });

  const options = data || initialOptions || [];

  useEffect(() => {
    // @ts-expect-error
    setInternalValue(value ?? (multiple ? [] : ""));
  }, [value, multiple]);

  const handleSelect = (currentValue: string) => {
    let newValue: any;

    if (multiple) {
      const currentArray = Array.isArray(internalValue) ? internalValue : [];
      // @ts-expect-error
      newValue = currentArray.includes(currentValue)
        ? currentArray.filter((v) => v !== currentValue)
        : [...currentArray, currentValue];
    } else {
      newValue = currentValue === internalValue ? "" : currentValue;
      setOpen(false);
    }

    setInternalValue(newValue);
    onChange?.(newValue);
  };

  function getSelectedOptions(options: T[], value?: string | string[]) {
    const selectedOptions = options.filter((option) =>
      multiple
        ? (value as string[]).includes(getOptionValue(option))
        : getOptionValue(option) === value
    );
    return selectedOptions;
  }

  const getDisplayValue = () => {
    if (multiple) {
      const displayValues = selectedOptions.map(getOptionLabel);
      const remainingItems = displayValues.length - maxDisplayedItems;

      return (
        <div className="flex flex-wrap gap-1 overflow-hidden">
          {displayValues.length === 0 && placeholder}
          {displayValues.slice(0, maxDisplayedItems).map((label) => (
            <Badge
              key={label}
              variant="secondary"
              className="rounded-sm px-1 font-normal"
            >
              {label}
            </Badge>
          ))}
          {remainingItems > 0 && (
            <Badge variant="secondary" className="rounded-sm px-1 font-normal">
              +{remainingItems} more
            </Badge>
          )}
        </div>
      );
    }

    return selectedOptions[0]
      ? getOptionLabel(selectedOptions[0])
      : placeholder;
  };

  // biome-ignore lint/correctness/useExhaustiveDependencies: false positive
  useEffect(() => {
    setSelectedOptions(
      getSelectedOptions(
        [...(options ?? []), ...(initialOptions ?? [])],
        internalValue
      )
    );
  }, [
    internalValue,
    JSON.stringify(options || []),
    JSON.stringify(initialOptions || []),
  ]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "w-full justify-between",
            value
              ? "text-foreground hover:text-foreground"
              : "text-gray hover:text-gray",
            className
          )}
        >
          {getDisplayValue()}
          <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command shouldFilter={false}>
          <div className="flex items-center gap-2 relative">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchQuery}
              onValueChange={setSearchQuery}
            />
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin absolute right-2" />
            )}
          </div>

          <CommandList>
            <CommandEmpty className="py-6 text-center text-sm flex items-center justify-center">
              {loading ? "Chargement..." : "No results found."}
            </CommandEmpty>
            <CommandGroup>
              {options
                .filter((option) =>
                  getOptionLabel(option)
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase())
                )
                .map((option) => {
                  const optionValue = getOptionValue(option);
                  const isSelected = multiple
                    ? (internalValue as string[]).includes(optionValue)
                    : internalValue === optionValue;

                  return (
                    <CommandItem
                      key={optionValue}
                      value={optionValue}
                      onSelect={() => handleSelect(optionValue)}
                    >
                      {renderOption ? (
                        renderOption(option)
                      ) : (
                        <>
                          {isSelected && (
                            <Check className={cn("mr-2 h-4 w-4")} />
                          )}
                          {getOptionLabel(option)}
                        </>
                      )}
                      {multiple && isSelected && (
                        <span className="ml-auto text-xs text-muted-foreground">
                          Selected
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
