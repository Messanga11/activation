import { z } from "zod";

type IUnknown = Record<string, unknown>;

export const getInitialItemWithDot = (
  _initialItem: Record<string, unknown>,
  propWithDot: string
) => {
  const initialItem = JSON.parse(JSON.stringify(_initialItem ?? {}));
  const keys = propWithDot
    .split("")
    .reverse()
    .join("")
    .split(".")
    .map((k) => k.split("").reverse().join(""))
    .reverse();
  let finalValue: unknown | IUnknown;
  keys.forEach((key, index) => {
    if (index === 0) {
      if (!initialItem) keys.length = keys.length + 1; // break
      else finalValue = initialItem[key];
    } else {
      if (!finalValue) keys.length = keys.length + 1; // break
      else finalValue = (finalValue as IUnknown)[key];
    }
  });

  return finalValue ?? "";
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const setValueWithDotInKey = <T extends Record<string, any>>(
  item: T,
  propWithDot: string,
  value: unknown
) => {
  const keys = propWithDot.split(".");
  let currentObj: T = item;
  keys.forEach((key, index) => {
    currentObj[key as keyof T] = index !== keys.length - 1 ? item[key] ?? {} : value;
    currentObj = currentObj[key as keyof T];
  });
};

export const formatValuesWithDots = (
  values: IUnknown,
  options?: {
    useZodObject?: boolean;
  }
) => {
  const formattedObj: IUnknown = {};
  Object.keys(values).forEach((key) => {
    const keysArr = key
      .split("")
      .reverse()
      .join("")
      .split(".")
      .map((k) => k.split("").reverse().join(""))
      .reverse();
    const currentObj = keysArr.length > 1 ? formattedObj[keysArr[0]] || {} : values[key];
    keysArr.forEach((keyPart, index) => {
      if (index !== 0) {
        if (index === 1) {
          (currentObj as Record<string, unknown>)[keyPart] =
            index === keysArr.length - 1 ? values[key] : {};
        } else {
          ((currentObj as IUnknown)[keysArr[index - 1]] as IUnknown)[keyPart] =
            index === keysArr.length - 1 ? values[key] : {};
        }
      }

      if (index === keysArr.length - 1) {
        formattedObj[keysArr[0]] = currentObj;
      }
    });
  });

  return options?.useZodObject ? convertObjectsToZodObjects(formattedObj) : formattedObj;
};

const convertObjectsToZodObjects = (obj: IUnknown) => {
  const finalObject: IUnknown = {};
  for (const key of Object.keys(obj)) {
    let currentObj = obj[key];

    if (
      currentObj &&
      !Array.isArray(currentObj) &&
      typeof currentObj === "object" &&
      !((currentObj as z.ZodSchema)?._def as { typeName: string })?.typeName?.startsWith("Zod")
    ) {
      currentObj = z.object(convertObjectsToZodObjects(currentObj as IUnknown) as z.ZodRawShape);
    }
    finalObject[key] = currentObj;
  }

  return finalObject;
};
