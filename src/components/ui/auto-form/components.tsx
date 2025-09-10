import type {
  ControllerFieldState,
  ControllerRenderProps,
  UseFormReturn,
  UseFormStateReturn,
} from "react-hook-form";

import type { AutoFormField } from "./index";
import type { TComponent } from "./index";
import { SvgAsset } from "../../svg-asset";
import { Textarea } from "../textarea";
import { AppSelect } from "../app-select";
import { Combobox } from "../combobox";
import { PhoneInput } from "../phone-input";
import { IconInput } from "../icon-input";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { DatePicker } from "@/components/date-picker";

type FieldExtra = {
  placeholder: string;
  disabled?: boolean;
  invalid: boolean;
  form: UseFormReturn;
  register?: Record<string, unknown>;
  initialOption?: unknown;
};

export type IRenderField = {
  field: ControllerRenderProps<
    {
      [x: string]: string;
    },
    string
  > & { id?: string };
  fieldState: ControllerFieldState;
  formState: UseFormStateReturn<{
    [x: string]: string;
  }>;
};

export type ComponentRenderFunction = (
  props: IRenderField,
  formField: Exclude<AutoFormField, TComponent>,
  extra?: FieldExtra
) => React.ReactNode | React.ReactElement | null;

const Password: ComponentRenderFunction = ({ field }, formField, extra) => {
  const t = (key: string) => key;
  const [isVisible, setIsVisible] = useState(false);
  return (
    <div>
      <IconInput
        endIcon={
          <button
            type="button"
            aria-label="Change password"
            onClick={() => setIsVisible(!isVisible)}
            className="relative"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <title>Hide password</title>
              <path
                d="M2.06202 12.348C1.97868 12.1235 1.97868 11.8765 2.06202 11.652C2.87372 9.68385 4.25153 8.00103 6.02079 6.81689C7.79004 5.63275 9.87106 5.00061 12 5.00061C14.129 5.00061 16.21 5.63275 17.9792 6.81689C19.7485 8.00103 21.1263 9.68385 21.938 11.652C22.0214 11.8765 22.0214 12.1235 21.938 12.348C21.1263 14.3161 19.7485 15.999 17.9792 17.1831C16.21 18.3672 14.129 18.9994 12 18.9994C9.87106 18.9994 7.79004 18.3672 6.02079 17.1831C4.25153 15.999 2.87372 14.3161 2.06202 12.348Z"
                stroke="#4B5A6A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z"
                stroke="#4B5A6A"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {isVisible && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-6 w-0.5 bg-slate-400 rotate-45" />
            )}
          </button>
        }
        startIcon={
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <title>Hide password</title>
            <path
              d="M2.586 17.414C2.2109 17.789 2.00011 18.2976 2 18.828V21C2 21.2652 2.10536 21.5195 2.29289 21.7071C2.48043 21.8946 2.73478 22 3 22H6C6.26522 22 6.51957 21.8946 6.70711 21.7071C6.89464 21.5195 7 21.2652 7 21V20C7 19.7348 7.10536 19.4804 7.29289 19.2929C7.48043 19.1053 7.73478 19 8 19H9C9.26522 19 9.51957 18.8946 9.70711 18.7071C9.89464 18.5195 10 18.2652 10 18V17C10 16.7348 10.1054 16.4804 10.2929 16.2929C10.4804 16.1053 10.7348 16 11 16H11.172C11.7024 15.9999 12.211 15.7891 12.586 15.414L13.4 14.6C14.7898 15.0841 16.3028 15.0823 17.6915 14.5947C19.0801 14.1072 20.2622 13.1628 21.0444 11.9161C21.8265 10.6694 22.1624 9.19415 21.9971 7.73172C21.8318 6.26928 21.1751 4.90623 20.1344 3.86555C19.0937 2.82486 17.7307 2.16816 16.2683 2.00287C14.8058 1.83757 13.3306 2.17347 12.0839 2.95562C10.8372 3.73776 9.89279 4.91985 9.40525 6.3085C8.91771 7.69714 8.91585 9.21014 9.4 10.6L2.586 17.414Z"
              stroke="#A1A8AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M16.5 8C16.7761 8 17 7.77614 17 7.5C17 7.22386 16.7761 7 16.5 7C16.2239 7 16 7.22386 16 7.5C16 7.77614 16.2239 8 16.5 8Z"
              fill="#A1A8AF"
              stroke="#A1A8AF"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        }
        {...{
          disabled: extra?.disabled,
        }}
        {...field}
        placeholder={extra?.placeholder}
        className={cn(formField.props?.className, {
          "border-destructive text-destructive ring-destructive placeholder:text-destructive":
            extra?.invalid,
        })}
        type={isVisible ? "text" : formField?.type}
      />
      {(formField as { showMatchers?: boolean }).showMatchers && (
        <div className="mt-2 flex flex-col gap-y-2">
          {[
            {
              label: "Au moins 8 caractères",
              match: (value: string) => String(value || "").length >= 8,
            },
            {
              label: "Au moins une minuscule",
              match: (value: string) =>
                RegExp(/[a-z]/).exec(String(value || "")),
            },
            {
              label: "Au moins une majuscule",
              match: (value: string) => RegExp(/[A-Z]/).exec(value ?? ""),
            },
            {
              label: "Au moins un chiffre",
              match: (value: string) => RegExp(/\d/).exec(value ?? ""),
            },
            {
              label: "Au moins un caractère spécial",
              match: (value: string) =>
                RegExp(/[@#$%^&+=].*$/).exec(value ?? ""),
            },
          ].map((matchCriteria, index) => (
            <div
              key={`${field.name}-${matchCriteria.label}-${index}`}
              className={cn(
                "flex items-center gap-x-1 text-sm",
                matchCriteria.match(field.value)
                  ? "text-green-500"
                  : "text-gray-500"
              )}
            >
              <SvgAsset
                size={12}
                className="shrink-0"
                icon="password-check-circle"
              />
              <span>{matchCriteria.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ComboboxCmp: ComponentRenderFunction = ({ field }, formField) => (
  <Combobox
    getOptionLabel={function (_: unknown): string {
      throw new Error("Function getOptionLabel not implemented.");
    }}
    getOptionValue={function (_: unknown): string {
      throw new Error("Function getOptionValue not implemented.");
    }}
    {...(formField.props || {})}
    onChange={field.onChange}
    value={field.value}
  />
);

const PhoneCmp: ComponentRenderFunction = ({ field }, formField) => (
  <PhoneInput
    {...(formField.props || {})}
    onChange={field.onChange}
    value={field.value}
  />
);

const Select: ComponentRenderFunction = ({ field }, formField) => (
  <AppSelect
    {...(formField.props || {})}
    onChange={field.onChange}
    value={field.value}
    getLabel={
      (formField.props as { getLabel: (option: unknown) => string })?.getLabel
    }
    getValue={
      (formField.props as { getValue: (option: unknown) => string })?.getValue
    }
    options={(formField.props as { options: [] })?.options ?? []}
    renderOption={
      (
        formField.props as {
          renderOption: (option: unknown) => React.ReactNode;
        }
      )?.renderOption
    }
  />
);

// const FileInput: ComponentRenderFunction = ({ field }, formField) => (
//   <FileUploaderBasic
//     {...(formField.props ?? {})}
//     onChange={field.onChange}
//     value={field.value as unknown as UploadedFile[]}
//   />
// );

const DatePickerCmp: ComponentRenderFunction = ({ field }, formField) => (
  <DatePicker
    {...(formField.props || {})}
    onChange={field.onChange}
    value={field.value}
  />
);

const DefaultInput: ComponentRenderFunction = ({ field }, formField, extra) => (
  <IconInput
    {...{
      placeholder: extra?.placeholder,
      title: extra?.placeholder,
      disabled: extra?.disabled,
    }}
    {...(formField.props ?? {})}
    {...field}
    className={cn(
      {
        "border-destructive text-destructive ring-destructive placeholder:text-destructive":
          extra?.invalid,
      },
      formField.props?.className
    )}
    type={formField?.type}
  />
);

const TextareaCmp: ComponentRenderFunction = ({ field }, formField, extra) => (
  <Textarea
    {...((formField.props as Record<string, unknown>) ?? {})}
    {...{
      placeholder: extra?.placeholder,
      title: extra?.placeholder,
      disabled: extra?.disabled,
    }}
    {...field}
    className={cn({
      "border-destructive text-destructive ring-destructive placeholder:text-destructive":
        extra?.invalid,
    })}
  />
);

// const MultiChecboxCmp: ComponentRenderFunction = ({ field }, formField) => (
//   <MultiCheckbox
//     options={[]}
//     {...(formField.props ?? {})}
//     values={field.value as unknown as string[]}
//     onChange={field.onChange}
//   />
// );

// const OpeningHourCmp: ComponentRenderFunction = ({ field }, formField) => (
//   <OpeningHours
//     {...(formField.props ?? {})}
//     onChange={field.onChange}
//     value={field.value}
//   />
// );

export function getComponent(type?: string): ComponentRenderFunction {
  switch (type) {
    case "textarea": {
      return TextareaCmp;
    }
    case "password": {
      return Password;
    }
    case "select": {
      return Select;
    }
    case "combobox": {
      return ComboboxCmp;
    }
    case "phone": {
      return PhoneCmp;
    }
    case "date": {
      return DatePickerCmp;
    }
    // case "file": {
    //   return FileInput;
    // }
    // case "multi-checkbox": {
    //   return MultiChecboxCmp;
    // }
    // case "opening-hours": {
    //   return OpeningHourCmp;
    // }
    default: {
      return DefaultInput;
    }
  }
}
