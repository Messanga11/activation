import type { ZodEffects, ZodString } from "zod";

import type { AutoFormField } from "./index";
import { getInitialItemWithDot } from "./utils/helpers";
import { useValidators } from "./utils/validators";
import { useTranslations } from "next-intl";
export type IUseFieldsFields<T, TInitialItem = T> = Partial<
  Record<keyof T | string, Partial<AutoFormField<T, TInitialItem>>>
>;
export type IReturnedFields<T, TInitialItem = T> = Record<
  keyof T,
  AutoFormField<T, TInitialItem>
>;

export function useFields<T, TInitialItem = T>(
  fields: IUseFieldsFields<T, TInitialItem>
): IReturnedFields<T, TInitialItem> {
  // Fallback function pour les labels
  const t = useTranslations();
  const v = useValidators();

  return buildFields<T, TInitialItem>(
    fields,
    t,
    {} as IReturnedFields<T, TInitialItem>,
    v
  );
}

function buildFields<T, TInitialItem = T>(
  fields: IUseFieldsFields<T, TInitialItem>,
  t: (key: string) => string,
  formattedFields: IReturnedFields<T, TInitialItem> = {} as IReturnedFields<
    T,
    TInitialItem
  >,
  v: ReturnType<typeof useValidators>
) {
  for (const fieldName of Object.keys(fields)) {
    const currentField = fields[fieldName as keyof typeof fields];

    if (currentField && currentField.type === "group") {
      buildFields(
        (currentField as { items: typeof fields }).items,
        t,
        formattedFields,
        v
      );
    } else {
      buildField(currentField, fieldName, t, formattedFields, v);
    }
  }

  return formattedFields;
}

function buildField(
  currentField: Partial<AutoFormField<never>> | undefined,
  fieldName: string,
  t: (key: string) => string,
  formattedFields = {},
  v: ReturnType<typeof useValidators>
) {
  const typeValidationMapper = {
    text: v.string,
    number: v.positiveNumber,
    password: v.password,
  };

  let label: string | undefined = undefined;
  let placeholder: string | undefined = undefined;
  let description: string | undefined = undefined;

  const type = currentField?.type as keyof typeof typeValidationMapper;
  let validator = typeValidationMapper[type];

  if (currentField?.type !== "group") {
    placeholder = t("form.placeholder_enter_model");
    label = (currentField as { label?: string })?.label ?? fieldName;
    description = `description.${fieldName}`;

    validator = (v[currentField?.type as keyof typeof v] ??
      v.string) as ZodEffects<ZodString, string, string>;
  }

  const finalObj: unknown = {
    initialValue: (row: unknown) =>
      getInitialItemWithDot(row as Record<string, unknown>, fieldName),
    label,
    placeholder,
    // helper: `helper.${fieldName}`,
    description,
    validator,
    ...currentField,
  };

  formattedFields[fieldName as keyof typeof formattedFields] =
    finalObj as (typeof formattedFields)[keyof unknown];
}
