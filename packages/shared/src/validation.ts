import type { Document, Value } from "./types";
import {
  FORMAT_VERSION,
  DEFAULT_LIMITS
} from "./constants";
import { ValidationError } from "./errors";
import {
  isMarkedPlainObject,
  isTypedValue
} from "./type-guards";

export function validateDocument(document: Document): void {
  if (!document || typeof document !== "object") {
    throw new ValidationError("Document must be an object");
  }

  if (document.version !== FORMAT_VERSION) {
    throw new ValidationError(
      `Unsupported document version: ${document.version}`
    );
  }

  validateValue(document.root);
}

export function validateValue(
  value: Value,
  depth = 0
): void {
  if (depth > DEFAULT_LIMITS.maxDepth) {
    throw new ValidationError("Maximum nesting depth exceeded");
  }

  if (value === null || typeof value === "boolean") {
    return;
  }

  if (typeof value === "string") {
    if (value.length > DEFAULT_LIMITS.maxStringLength) {
      throw new ValidationError("String is too long");
    }

    return;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new ValidationError("Numbers must be finite");
    }

    return;
  }

  if (Array.isArray(value)) {
    if (value.length > DEFAULT_LIMITS.maxArrayLength) {
      throw new ValidationError("Array is too large");
    }

    for (const item of value) {
      validateValue(item, depth + 1);
    }

    return;
  }

  if (value instanceof Uint8Array) {
    validateBinary(value);
    return;
  }

  if (typeof value !== "object") {
    throw new ValidationError("Unsupported value type");
  }

  if (isTypedValue(value)) {
    validateTypedValue(value, depth);
    return;
  }

  validateObject(value as Record<string, Value>, depth);
}

function validateTypedValue(
  value: ReturnType<typeof getTypedValue>,
  depth: number
): void {
  switch (value.kind) {
    case "binary":
      validateBinary(value.value);
      return;

    case "decimal":
      if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value.value)) {
        throw new ValidationError("Invalid decimal value");
      }
      return;

    case "timestamp":
      if (!Number.isSafeInteger(value.value)) {
        throw new ValidationError("Invalid timestamp value");
      }
      return;

    case "reference":
      if (!value.id) {
        throw new ValidationError("Invalid reference ID");
      }
      return;

    case "entity":
      if (!value.id) {
        throw new ValidationError("Invalid entity ID");
      }

      if (
        value.type !== undefined &&
        typeof value.type !== "string"
      ) {
        throw new ValidationError("Invalid entity type");
      }

      validateObject(value.fields, depth + 1);
      return;
  }
}

function getTypedValue(value: Value) {
  return value as Extract<
    Value,
    { kind: string }
  >;
}

function validateBinary(value: Uint8Array): void {
  if (value.length > DEFAULT_LIMITS.maxBinaryLength) {
    throw new ValidationError("Binary value is too large");
  }
}

function validateObject(
  value: Record<string, Value>,
  depth: number
): void {
  const keys = Object.keys(value);

  if (keys.length > DEFAULT_LIMITS.maxObjectKeys) {
    throw new ValidationError("Object has too many keys");
  }

  for (const key of keys) {
    if (key.length > DEFAULT_LIMITS.maxStringLength) {
      throw new ValidationError("Object key is too long");
    }

    validateValue(value[key], depth + 1);
  }
}