import type {
  BinaryValue,
  DecimalValue,
  EntityValue,
  ReferenceValue,
  TimestampValue,
  Value
} from "./types";

const PLAIN_OBJECT = Symbol.for("tdf.plain-object");

type TaggedValue =
  | BinaryValue
  | DecimalValue
  | TimestampValue
  | ReferenceValue
  | EntityValue;

export function markPlainObject<T extends Record<string, unknown>>(
  value: T
): T {
  if (isMarkedPlainObject(value)) {
    return value;
  }

  Object.defineProperty(value, PLAIN_OBJECT, {
    value: true,
    enumerable: false,
    configurable: false
  });

  return value;
}

export function isMarkedPlainObject(
  value: object
): boolean {
  return (
    (value as Record<symbol, unknown>)[PLAIN_OBJECT] === true
  );
}

export function isTypedValue(value: unknown): value is TaggedValue {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    isMarkedPlainObject(value)
  ) {
    return false;
  }

  const item = value as Record<string, unknown>;

  switch (item.kind) {
    case "binary":
      return item.value instanceof Uint8Array;

    case "decimal":
      return typeof item.value === "string";

    case "timestamp":
      return typeof item.value === "number";

    case "reference":
      return typeof item.id === "string";

    case "entity":
      return (
        typeof item.id === "string" &&
        typeof item.fields === "object" &&
        item.fields !== null &&
        !Array.isArray(item.fields)
      );

    default:
      return false;
  }
}

export function asValue(value: unknown): Value {
  return value as Value;
}