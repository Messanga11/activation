"use client";

import { z, type ZodSchema } from "zod";
import { useTranslations } from "next-intl";

function validateCreditCard(cardNumber?: string) {
  if (!cardNumber) return false;
  cardNumber = cardNumber.replace(/\D/g, "");

  if (!/^\d{13,19}$/.test(cardNumber)) {
    return false;
  }

  let sum = 0;
  let shouldDouble = false;

  for (let i = cardNumber.length - 1; i >= 0; i--) {
    let digit = parseInt(cardNumber[i] as string, 10);

    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }

    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export const createValidators = (t: (key: string) => string) => ({
  object: z.object,
  string: z
    .string({ message: t("Validators.required") })
    .min(1, t("Validators.required")),
  fileObject: z.object({
    id: z.string().uuid(),
    full_url: z.string(),
  }),
  creditCard: z
    .string({ message: t("Validators.required_string") })
    .min(1, t("Validators.required"))
    .refine(
      (data) => validateCreditCard(data),
      t("Validators.invalidCardNumber")
    ),
  number: z
    .string({ message: t("Validators.required_string") })
    .refine((data) => {
      const num = Number(data);
      return !isNaN(num);
    }, t("Validators.mustBeNumber")),
  positiveNumber: z.preprocess(
    (a) =>
      parseInt(
        z.string({ message: t("Validators.required_string") }).parse(a),
        10
      ),
    z.number().positive().max(100)
  ),
  email: z
    .string({ message: t("Validators.required_string") })
    .email(t("Validators.email"))
    .min(1, t("Validators.required")),
  postalCode: z
    .string({ message: t("Validators.required_string") })
    .regex(/^\d{5}$/, t("Validators.invalidPostalCode")),
  hostname: z
    .string({ message: t("Validators.required_string") })
    .min(1, t("Validators.required"))
    .regex(
      /^(?!:\/\/)([a-zA-Z0-9-_]+(\.[a-zA-Z0-9-_]+)+)$/i,
      t("Validators.invalidHostname")
    ),
  password: z
    .string({ message: t("Validators.required_string") })
    .min(1, t("Validators.required"))
    .refine(
      (value) =>
        /^(?=.{8,})(?=.*[a-z])(?=.*[A-Z])(?=.*[@#$%^&+=.,:_\-*;/!]).*$/.test(
          value
        ),
      t("Validators.invalidPassword")
    ),
  isSameAs: (password: string) =>
    z
      .string({ message: t("Validators.required_string") })
      .superRefine((data, ctx) => {
        if (password !== data) {
          ctx.addIssue({
            code: "custom",
            message: t("Validators.passwordsDontMatch"),
          });
        }
      }),
  string_nr: z.string({ message: t("Validators.required_string") }).optional(),
  arrayOf: (obj: ZodSchema) =>
    z
      .array(obj, {
        message: t("Validators.required"),
      })
      .min(1, t("Validators.required")),
  arrayOf_nr: (obj: ZodSchema) =>
    z.array(obj, {
      message: t("Validators.required"),
    }),
  tva_number: z
    .string({ message: t("Validators.required_string") })
    .min(1, t("Validators.required"))
    .regex(/^[A-Z]{2}\d{13}$/, t("Validators.invalidTvaNumber")),
  siren_siret: z
    .string({ message: t("Validators.required_string") })
    .min(1, t("Validators.required"))
    .regex(/^\d{9}|\d{14}$/, t("Validators.invalidSirenSiret")),
});

export const useValidators = () => {
  const t = useTranslations();
  return createValidators(t);
};

export type IAutoFormValidator = ReturnType<typeof createValidators>;
