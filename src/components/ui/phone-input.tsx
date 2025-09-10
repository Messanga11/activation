"use client";

import { useEffect, useRef, useState } from "react";
import PhoneInputComp from "react-phone-number-input";
import { Check, Search } from "lucide-react";
import { create } from "zustand";
import { Input } from "./input";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import { Button } from "./button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandGroup,
  CommandList,
} from "./command";
import { cn } from "@/lib/utils";
import { countryCodes } from "@/utils/county-codes";

interface PhoneInputStore {
  countryCode: string;
  setCountryCode: (code: string) => void;
}

const usePhoneInputStore = create<PhoneInputStore>((set) => ({
  countryCode: "CM",
  setCountryCode: (countryCode) => set({ countryCode }),
}));

export interface PhoneInputProps {
  value?: string;
  className?: string;
  onChange?: (value?: string) => void;
  placeholder?: string;
}

export const PhoneInput = ({
  onChange,
  value,
  className,
  placeholder = "Enter phone number",
}: PhoneInputProps) => {
  const store = usePhoneInputStore();

  return (
    <div className="relative flex items-center gap-2">
      <PhoneInputComp
        className={cn("flex w-full gap-[15px]", className)}
        initialValueFormat="national"
        placeholder={placeholder}
        value={value}
        onChange={onChange ?? (() => {})}
        countrySelectComponent={CountrySelector}
        inputComponent={Input}
        disabled={!store.countryCode}
      />
    </div>
  );
};

const CountrySelector = ({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const store = usePhoneInputStore();

  const selectedCountry = countryCodes.find(
    (c) => c.iso?.toLowerCase() === value?.toLowerCase()
  );

  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (selectedCountry?.code && store.countryCode !== selectedCountry?.code) {
      store.setCountryCode(selectedCountry?.code);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCountry?.code, store.countryCode]);

  // useEffect(() => {
  //   const findCountryCode = async () => {
  //     if (store.countryCode) return;
  //     try {
  //       abortRef.current = new AbortController();
  //       const res = await fetch("https://api.country.is/", {
  //         signal: abortRef.current?.signal,
  //       });

  //       const data = await res.json();
  //       abortRef.current = null;
  //       if (data.country) {
  //         store.setCountryCode(data.country);
  //         onChange?.(data.country);
  //       }
  //     } catch (e) {
  //       console.log(e);
  //       abortRef.current = null;
  //     }
  //   };

  //   findCountryCode();
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [store.countryCode]);

  useEffect(() => {
    if (!value) {
      store.setCountryCode("CM");
      onChange?.("CM");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button aria-expanded={open}>
          {selectedCountry ? (
            <>
              <span>+{selectedCountry.code}</span>
            </>
          ) : (
            <span>Pays</span>
          )}
          <div className="[&_svg]:h-[4px] [&_svg]:w-[4px]">
            <svg
              width="9"
              height="6"
              viewBox="0 0 9 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M4.5 6L9 0H0L4.5 6Z" fill="currentColor" />
            </svg>
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
            <CommandInput
              placeholder="Search country..."
              value={search}
              onValueChange={setSearch}
              className="h-11 border-none focus:ring-0"
            />
          </div>

          <CommandList>
            <CommandEmpty className="py-4 text-center text-sm">
              No country found
            </CommandEmpty>

            <CommandGroup className="max-h-[300px] overflow-y-auto">
              {countryCodes
                .filter((countryCode) => countryCode.iso === "CM")
                .filter((c) =>
                  c.country.toLowerCase().includes((search ?? "").toLowerCase())
                )
                .map((country) => (
                  <CommandItem
                    key={country.iso}
                    value={country.country}
                    onSelect={() => {
                      if (abortRef.current) {
                        abortRef.current.abort();
                      }
                      onChange(country.iso);
                      setOpen(false);
                    }}
                    className="gap-3 aria-selected:bg-accent/50"
                  >
                    <img
                      width={28}
                      height={20}
                      alt={country.country}
                      src={`https://flagcdn.com/${country.iso.toLowerCase()}.svg`}
                      className="h-5 w-7 rounded-sm object-cover shadow-sm"
                    />
                    <div className="flex-1">
                      <span className="text-sm">{country.country}</span>
                      <span className="ml-2 text-xs text-muted-foreground">
                        +{country.code}
                      </span>
                    </div>
                    <Check
                      className={cn(
                        "h-4 w-4 text-primary",
                        country.iso === value ? "opacity-100" : "opacity-0"
                      )}
                    />
                  </CommandItem>
                ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
