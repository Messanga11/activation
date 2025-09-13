/** biome-ignore-all lint/correctness/useExhaustiveDependencies: needed here */
/** biome-ignore-all lint/suspicious/noExplicitAny: needed here */
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  useWatch,
  type FieldValues,
  type UseFormReturn,
} from "react-hook-form";
import * as z from "zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../form";

import { getComponent, type ComponentRenderFunction } from "./components";
import { useFields, type IUseFieldsFields } from "./use-fields";
import { formatValuesWithDots } from "./utils/helpers";
import { type IAutoFormValidator, useValidators } from "./utils/validators";
import { Button } from "../button";
import { Loader2 } from "lucide-react";
import type { ComboboxProps } from "../combobox";
import type { TAppSelectProps } from "../app-select";
import type { PhoneInputProps } from "../phone-input";
import type { IconInputProps } from "../icon-input";
import { cn } from "@/lib/utils";

type ButtonProps = React.ComponentProps<"button"> & {
  variant?: string;
};
type InputProps = React.ComponentProps<"input">;
type InitialValueType = any;

type TextareaField = {
  type: "textarea";
  props?: InputProps;
};

type TextField = {
  type: "email" | "date";
  props?: IconInputProps;
};

type NumberField = {
  type: "number";
  props?: IconInputProps;
};

type PasswordField = {
  type: "password";
  props?: InputProps;
  showMatchers?: boolean;
};

type GroupItems = {
  items: IUseFieldsFields<any>;
  type?: "group";
};

type SelectField = {
  type: "select";
  props?: TAppSelectProps<any>;
};

type ComboboxField = {
  type: "combobox";
  props?: ComboboxProps<any>;
};

type PhoneField = {
  type: "phone";
  props?: PhoneInputProps;
};

// type FileField = {
//   type: "file";
//   props?: FileUploaderProps;
// };

// type MultiCheckboxField = {
//   type: "multi-checkbox";
//   props?: IMultiCheckboxProps;
// };

// type OpeningHoursPropsField = {
//   type: "opening-hours";
//   props?: TOpeningHoursProps;
// };

export type TComponent = {
  type?: "component";
  component: React.ReactNode;
};

export type IKeysToObject<S, T = any> = S extends `${infer U}.${infer V}`
  ? {
      [K in U]: IKeysToObject<V>;
    }
  : S extends string | number
    ? {
        [K in S]: T;
      }
    : T;

type IUnionToIntersection<U> = (
  U extends any
    ? (k: U) => void
    : never
) extends (k: infer I) => void
  ? I
  : never;

export type IAutoFormReturn<T extends object> = IUnionToIntersection<
  {
    [K in keyof T]: T[K] extends GroupItems
      ? IAutoFormReturn<T[K]["items"]>
      : IKeysToObject<K, T[K] extends NumberField ? number : string>;
  }[keyof T]
>;

export type AutoFormField<T = unknown, TInitialItem = T> = (
  | TComponent
  | ({
      initialValue: (initialItem?: T) => InitialValueType;
      validator?: IAutoFormValidator[keyof IAutoFormValidator] | any;
      helper: string;
      label: string;
      className?: string;
      labelClassName?: string;
      disabled?: boolean;
      placeholder: string;
      props?: React.HTMLAttributes<HTMLDivElement>;
      noErrorFeedBack?: boolean;
    } & (
      | PasswordField
      | SelectField
      | PhoneField
      | NumberField
      | TextField
      | ComboboxField
      | GroupItems
      | TextareaField
    ))
) & {
  hide?: (item: TInitialItem) => boolean;
};
// | FileField
// | MultiCheckboxField
// | OpeningHoursPropsField

export type IAutoFormForm = UseFormReturn<
  {
    [x: string]: any;
  },
  any,
  FieldValues
>;

export interface AutoFormProps<
  T extends object,
  TInitialItem extends object = T,
> extends Omit<React.HTMLAttributes<HTMLFormElement>, "onSubmit"> {
  fields: T extends unknown ? IUseFieldsFields<T, TInitialItem> : T;
  labelsClassName?: string;
  onSubmit?: (
    values: IAutoFormReturn<T>,
    form: UseFormReturn<
      {
        [x: string]: any;
      },
      any,
      FieldValues
    >,
  ) => void;
  initialItem?: T;
  submitBtnText?: React.ReactNode;
  submitBtnClassName?: string;
  submitButtonVariant?: ButtonProps["variant"];
  isLoading?: boolean;
  btnRef?: React.RefObject<HTMLButtonElement | null>;
  schema?: Record<string, IAutoFormValidator[keyof IAutoFormValidator]>;
  disabled?: boolean;
  addToPayload?: object;
  superRefine?: (data: any, ctx: z.RefinementCtx) => void;
  formRef?: React.RefObject<IAutoFormForm>;
  onFormChange?: (values: any, _form: IAutoFormForm) => void;
  disableInitialDirty?: boolean;
  beforeBtn?: React.ReactNode;
}

export function AutoForm<T extends object>({
  fields: _fields,
  onSubmit,
  initialItem,
  btnRef,
  isLoading: loading,
  submitBtnText,
  submitBtnClassName,
  className,
  schema,
  disabled,
  addToPayload,
  formRef,
  onFormChange,
  superRefine,
  disableInitialDirty,
  beforeBtn,
  submitButtonVariant,
  labelsClassName,
  ...rest
}: Readonly<AutoFormProps<T>>) {
  const isLoading = loading;
  const fields = useFields(_fields as any);

  const [loaded, setLoaded] = useState<boolean>(false);
  const v = useValidators();

  const fieldsAsArray = useMemo(() => {
    return Object.keys(fields)
      .map((key) => ({
        id: key,
        ...(fields as Record<string, AutoFormField>)[key],
      }))
      .filter((field) => (field.hide ? !field.hide(initialItem) : true));
  }, [fields, initialItem]);

  const formSchema = useMemo(() => {
    if (schema) {
      return z.object(schema as z.ZodRawShape);
    }

    const schemas: Record<
      string,
      IAutoFormValidator[keyof IAutoFormValidator]
    > = {};
    for (const field of fieldsAsArray) {
      if ("component" in field) {
        continue;
      }
      const validator = "validator" in field ? field.validator : v.string;
      schemas[field.id] = validator as any;
    }

    let zObject = z.object(
      formatValuesWithDots(schemas, {
        useZodObject: true,
      }) as z.ZodRawShape,
    );

    if (superRefine) {
      zObject = zObject.superRefine(superRefine) as unknown as z.ZodObject<
        z.ZodRawShape,
        "strip",
        z.ZodTypeAny,
        {
          [x: string]: any;
        },
        {
          [x: string]: any;
        }
      >;
    }

    return zObject;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, fieldsAsArray]);

  const defaultValues = useMemo(() => {
    const values: Record<string, InitialValueType> = {};
    for (const field of fieldsAsArray) {
      if ("component" in field) {
        continue;
      }
      try {
        const value =
          "initialValue" in field ? field.initialValue(initialItem) : "";
        values[field.id] = value;
      } catch (_) {
        continue;
      }
    }

    return formatValuesWithDots(values);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fields, fieldsAsArray]);

  const renderField: ComponentRenderFunction = (props, formField, extras) => {
    if ("component" in formField) return formField.component as React.ReactNode;
    let cmp = null;
    const render = getComponent(formField.type);
    if (render) {
      cmp = render(props, formField, extras);
    }

    return cmp;
  };

  const form = useForm<z.infer<typeof formSchema>>({
    mode: "onSubmit",
    reValidateMode: "onChange",
    context: undefined,
    criteriaMode: "firstError",
    shouldFocusError: true,
    shouldUnregister: false,
    delayError: undefined,
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const handleFormChange = useCallback(() => {
    if (formRef) {
      formRef.current = form;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, formRef, onFormChange, defaultValues]);

  const watchedValues = useWatch({ control: form.control });

  // Ref pour garder l'ancienne valeur
  const previousValuesRef = useRef({});

  useEffect(() => {
    if (!deepEqual(previousValuesRef.current, watchedValues)) {
      previousValuesRef.current = watchedValues;
      onFormChange?.(watchedValues, form); // uniquement si valeurs changent vraiment
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedValues]);

  useEffect(() => {
    handleFormChange();
  }, [handleFormChange]);

  useEffect(() => {
    if (!disableInitialDirty) {
      const firstKey = Object.keys(fields || {})[0];
      if (firstKey) {
        const value = form.getValues()[firstKey];
        if (value) {
          form.setValue(firstKey, value, {
            shouldDirty: true,
            shouldTouch: true,
            shouldValidate: true,
          });
          form.setError(firstKey, {
            message: "",
          });
        }
      }
    }
    setLoaded(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [disableInitialDirty]);

  const submitHandler = async (values: unknown) => {
    const payload = formSchema.parse({
      ...(values as Record<string, unknown>),
      ...(addToPayload ?? {}),
      id: (initialItem as { id: string })?.id,
    });

    if (onSubmit) {
      onSubmit(payload as IAutoFormReturn<T>, form as any);
    }
  };

  const renderItems = (
    __fields: typeof _fields = _fields,
  ): React.ReactNode[] => {
    return Object.keys(__fields).map((key) => {
      const formField = __fields[key] as Exclude<
        AutoFormField<unknown>,
        TComponent
      >;
      const completeField = fields[key as keyof typeof fields] as Exclude<
        AutoFormField<unknown>,
        TComponent
      >;
      if (
        !formField ||
        (formField.hide ? formField.hide(initialItem) : false) ||
        (formField.type === "group" ? false : !completeField)
      )
        return null;

      return formField.type === "group" ? (
        <div
          key={`auto-form-group-${key}`}
          className="grid grid-cols-2 gap-4"
          {...(formField.props ?? {})}
        >
          {renderItems(
            (formField as unknown as { items: typeof _fields }).items,
          )}
        </div>
      ) : (
        <FormField
          key={key}
          control={form.control}
          name={key}
          {...(formField.props ?? {})}
          render={(props) => (
            <FormItem
              className={cn(
                "flex flex-col gap-1 space-y-0",
                formField?.className,
              )}
            >
              {formField.label && (
                <FormLabel
                  htmlFor={key}
                  className={cn(
                    "block mb-[10px]",
                    labelsClassName,
                    formField.labelClassName,
                  )}
                >
                  {completeField.label}
                </FormLabel>
              )}
              <FormControl className="mt-0">
                {renderField(
                  {
                    ...props,
                    field: {
                      ...props.field,
                      id: props.field.name,
                    },
                  },
                  completeField,
                  {
                    disabled: isLoading ?? disabled ?? completeField.disabled,
                    placeholder: completeField.placeholder,
                    invalid: !loaded && !!form.formState.errors[key],
                    form,
                  },
                )}
              </FormControl>
              {completeField.helper && (
                <FormDescription>{completeField.helper}</FormDescription>
              )}
              {!completeField.noErrorFeedBack && <FormMessage />}
            </FormItem>
          )}
        />
      );
    });
  };

  return (
    <Form {...form}>
      <form
        {...rest}
        onSubmit={form.handleSubmit(submitHandler)}
        className={cn(
          "space-y-[15px]",
          { "opacity-75 transition": isLoading },
          className,
        )}
      >
        {renderItems()}
        <div>
          {beforeBtn}
          <Button
            disabled={isLoading || disabled}
            variant={submitButtonVariant as "outline"}
            className={cn(submitBtnClassName, {
              hidden: btnRef,
            })}
            ref={btnRef}
            type="submit"
          >
            {isLoading && (
              <Loader2 className="inline-block mr-2 animate-spin" />
            )}
            {submitBtnText ?? "Envoyer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export function deepEqual(
  a: any,
  b: any,
  visited: WeakMap<object, object> = new WeakMap(),
): boolean {
  if (Object.is(a, b)) return true;

  if (typeof a !== typeof b || a === null || b === null) return false;
  if (typeof a !== "object") return false;

  if (visited.has(a)) return visited.get(a) === b;
  visited.set(a, b);

  if (a.constructor !== b.constructor) return false;

  if (a instanceof Date) {
    return b instanceof Date && a.getTime() === b.getTime();
  }

  if (a instanceof RegExp) {
    return b instanceof RegExp && a.toString() === b.toString();
  }

  if (a instanceof Set && b instanceof Set) {
    if (a.size !== b.size) return false;
    const aValues = Array.from(a);
    const bValues = Array.from(b);
    return aValues.every((val) =>
      bValues.some((bVal) => deepEqual(val, bVal, visited)),
    );
  }

  if (a instanceof Map && b instanceof Map) {
    if (a.size !== b.size) return false;
    for (const [key, val] of a.entries()) {
      if (!b.has(key) || !deepEqual(val, b.get(key), visited)) return false;
    }
    return true;
  }

  const keysA = Reflect.ownKeys(a).sort();
  const keysB = Reflect.ownKeys(b).sort();

  if (keysA.length !== keysB.length) return false;

  for (let i = 0; i < keysA.length; i++) {
    if (keysA[i] !== keysB[i]) return false;

    const key = keysA[i] as keyof typeof a;
    if (!deepEqual(a[key], b[key], visited)) return false;
  }

  return true;
}
