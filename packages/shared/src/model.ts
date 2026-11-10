import type {
  BinaryValue,
  DecimalValue,
  Document,
  EntityValue,
  ReferenceValue,
  TimestampValue,
  TypedValue,
  Value
} from "./types";

export type {
  BinaryValue,
  DecimalValue,
  Document,
  EntityValue,
  ReferenceValue,
  TimestampValue,
  TypedValue,
  Value
};

export function createDocument(root: Value): Document {
  return {
    version: "1.0",
    root
  };
}

export function binary(value: Uint8Array): BinaryValue {
  return {
    kind: "binary",
    value
  };
}

export function decimal(value: string): DecimalValue {
  return {
    kind: "decimal",
    value
  };
}

export function timestamp(value: number): TimestampValue {
  return {
    kind: "timestamp",
    value
  };
}

export function reference(id: string): ReferenceValue {
  return {
    kind: "reference",
    id
  };
}

export function entity(
  id: string,
  fields: Record<string, Value>,
  type?: string
): EntityValue {
  return {
    kind: "entity",
    id,
    ...(type === undefined ? {} : { type }),
    fields
  };
}

export function isDocument(value: unknown): value is Document {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return (
    "version" in value &&
    typeof value.version === "string" &&
    "root" in value
  );
}

export function isTypedValue(value: unknown): value is TypedValue {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  if (!("kind" in value) || typeof value.kind !== "string") {
    return false;
  }

  return [
    "binary",
    "decimal",
    "timestamp",
    "reference",
    "entity"
  ].includes(value.kind);
}