import type { Document, Value } from "../../shared/src/types";
import { validateDocument } from "../../shared/src/validation";
import {
  isMarkedPlainObject,
  isTypedValue
} from "../../shared/src/type-guards";

function encodeBase64(bytes: Uint8Array): string {
  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

  let result = "";

  for (let i = 0; i < bytes.length; i += 3) {
    const a = bytes[i];
    const hasB = i + 1 < bytes.length;
    const hasC = i + 2 < bytes.length;
    const b = hasB ? bytes[i + 1] : 0;
    const c = hasC ? bytes[i + 2] : 0;

    result += alphabet[a >> 2];
    result += alphabet[((a & 3) << 4) | (b >> 4)];
    result += hasB
      ? alphabet[((b & 15) << 2) | (c >> 6)]
      : "=";
    result += hasC ? alphabet[c & 63] : "=";
  }

  return result;
}

function serializeValue(value: Value, depth: number): string {
  const indent = "  ".repeat(depth);
  const childIndent = "  ".repeat(depth + 1);

  if (value === null) return "null";

  if (typeof value === "boolean" || typeof value === "number") {
    return String(value);
  }

  if (typeof value === "string") {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    if (value.length === 0) return "[]";

    const items = value.map(
      item => `${childIndent}${serializeValue(item, depth + 1)}`
    );

    return `[\n${items.join(",\n")}\n${indent}]`;
  }

  if (value instanceof Uint8Array) {
    return `@binary(${JSON.stringify(encodeBase64(value))})`;
  }

  if (isTypedValue(value)) {
    switch (value.kind) {
      case "binary":
        return `@binary(${JSON.stringify(
          encodeBase64(value.value)
        )})`;

      case "decimal":
        return `@decimal(${JSON.stringify(value.value)})`;

      case "timestamp":
        return `@timestamp(${value.value})`;

      case "reference":
        return `@ref(${JSON.stringify(value.id)})`;

      case "entity": {
        const fields = serializeValue(value.fields, depth);

        return `@entity(${JSON.stringify(value.id)}, ${JSON.stringify(
          value.type ?? ""
        )}, ${fields})`;
      }
    }
  }

  const entries = Object.entries(value);

  const properties = entries.map(
    ([key, item]) =>
      `${childIndent}${JSON.stringify(key)}: ${serializeValue(
        item,
        depth + 1
      )}`
  );

  const object = entries.length === 0
    ? "{}"
    : `{\n${properties.join(",\n")}\n${indent}}`;

  return isMarkedPlainObject(value)
    ? `@object(${object})`
    : object;
}

export function stringifyTDF(document: Document): string {
  validateDocument(document);

  return `tdf ${document.version}\n${serializeValue(
    document.root,
    0
  )}\n`;
}