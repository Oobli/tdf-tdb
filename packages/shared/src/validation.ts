import type { Document, Value } from "./types";
import { FORMAT_VERSION, DEFAULT_LIMITS } from "./constants";
import { ValidationError } from "./errors";

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

  if (
    value === null ||
    typeof value === "boolean"
  ) {
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
    if (value.length > DEFAULT_LIMITS.maxBinaryLength) {
      throw new ValidationError("Binary value is too large");
    }

    return;
  }

  if (typeof value !== "object") {
    throw new ValidationError("Unsupported value type");
  }

  const tagged = value as Record<string, unknown>;

  if (typeof tagged.kind === "string") {
    switch (tagged.kind) {
      case "binary":
        if (!(tagged.value instanceof Uint8Array)) {
          throw new ValidationError("Invalid binary value");
        }
        validateValue(tagged.value, depth + 1);
        return;

      case "decimal":
        if (
          typeof tagged.value !== "string" ||
          !/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(tagged.value)
        ) {
          throw new ValidationError("Invalid decimal value");
        }
        return;

      case "timestamp":
        if (
          typeof tagged.value !== "number" ||
          !Number.isSafeInteger(tagged.value)
        ) {
          throw new ValidationError("Invalid timestamp value");
        }
        return;

      case "reference":
        if (
          typeof tagged.id !== "string" ||
          tagged.id.length === 0
        ) {
          throw new ValidationError("Invalid reference ID");
        }
        return;

      case "entity":
        if (
          typeof tagged.id !== "string" ||
          tagged.id.length === 0 ||
          !tagged.fields ||
          typeof tagged.fields !== "object" ||
          Array.isArray(tagged.fields)
        ) {
          throw new ValidationError("Invalid entity value");
        }

        if (
          tagged.type !== undefined &&
          typeof tagged.type !== "string"
        ) {
          throw new ValidationError("Invalid entity type");
        }

        validateValue(
          tagged.fields as Value,
          depth + 1
        );
        return;

      default:
        throw new ValidationError(
          `Unknown typed value: ${tagged.kind}`
        );
    }
  }

  const keys = Object.keys(tagged);

  if (keys.length > DEFAULT_LIMITS.maxObjectKeys) {
    throw new ValidationError("Object has too many keys");
  }

  for (const key of keys) {
    if (key.length > DEFAULT_LIMITS.maxStringLength) {
      throw new ValidationError("Object key is too long");
    }

    validateValue(tagged[key] as Value, depth + 1);
  }
}