import { ReactNode, useState } from "react";
import { Input } from "./input";
import { cn } from "@/lib/utils";

export type IconInputProps = React.ComponentProps<typeof Input> & {
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  className?: string;
  inputClassName?: string;
  mask?: string; // e.g., "XX-XX-XX"
  min?: number;
  max?: number;
};

export function IconInput({
  startIcon,
  endIcon,
  className,
  inputClassName,
  mask,
  onChange,
  ...props
}: IconInputProps) {
  const [rawValue, setRawValue] = useState("");

  const applyMask = (value: string, mask: string) => {
    let result = "";
    let valueIndex = 0;

    for (let i = 0; i < mask.length && valueIndex < value.length; i++) {
      if (mask[i] === "X") {
        result += value[valueIndex];
        valueIndex++;
      } else {
        result += mask[i];
      }
    }

    return result;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!mask) {
      onChange?.(e);
      return;
    }
    const input = e.target.value;
    const digitsOnly = input.replace(/\D/g, ""); // Supprime tout sauf les chiffres
    setRawValue(digitsOnly);

    const masked = mask ? applyMask(digitsOnly, mask) : input;

    // Appeler aussi le onChange externe si fourni
    if (onChange) {
      const syntheticEvent = {
        ...e,
        target: {
          ...e.target,
          value: masked,
        },
      };
      onChange(syntheticEvent as React.ChangeEvent<HTMLInputElement>);
    }
  };

  return (
    <div
      className={cn(
        "pl-[28px] pr-[27px] gap-[15px] group flex border border-gray rounded-full relative items-center",
        className
      )}
    >
      {startIcon}
      <Input
        {...props}
        className={cn(
          "!rounded-none shadow-none p-0 border-none outline-none focus:ring-0",
          inputClassName
        )}
        value={mask ? applyMask(rawValue, mask) : props.value}
        onChange={handleChange}
      />
      {endIcon}
    </div>
  );
}
