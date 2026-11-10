import type { Document, Value } from "../../shared/src/types";
import { validateDocument } from "../../shared/src/validation";
import { TBFError } from "../../shared/src/errors";
import { isTypedValue } from "../../shared/src/type-guards";
import { createTBFHeader } from "./header";
import { ByteWriter } from "./writer";

const TAG = {
  null: 0x00,
  false: 0x01,
  true: 0x02,
  number: 0x03,
  string: 0x04,
  array: 0x05,
  object: 0x06,
  binary: 0x07,
  decimal: 0x08,
  timestamp: 0x09,
  reference: 0x0a,
  entity: 0x0b
} as const;

function encodeValue(writer: ByteWriter, value: Value): void {
  if (value === null) {
    writer.writeByte(TAG.null);
    return;
  }

  if (typeof value === "boolean") {
    writer.writeByte(value ? TAG.true : TAG.false);
    return;
  }

  if (typeof value === "number") {
    writer.writeByte(TAG.number);
    writer.writeFloat64(value);
    return;
  }

  if (typeof value === "string") {
    writer.writeByte(TAG.string);
    writer.writeString(value);
    return;
  }

  if (Array.isArray(value)) {
    writer.writeByte(TAG.array);
    writer.writeUint32(value.length);

    for (const item of value) {
      encodeValue(writer, item);
    }

    return;
  }

  if (value instanceof Uint8Array) {
    writer.writeByte(TAG.binary);
    writer.writeUint32(value.length);
    writer.writeBytes(value);
    return;
  }

  if (isTypedValue(value)) {
    switch (value.kind) {
      case "binary":
        writer.writeByte(TAG.binary);
        writer.writeUint32(value.value.length);
        writer.writeBytes(value.value);
        return;

      case "decimal":
        writer.writeByte(TAG.decimal);
        writer.writeString(value.value);
        return;

      case "timestamp":
        writer.writeByte(TAG.timestamp);
        writer.writeFloat64(value.value);
        return;

      case "reference":
        writer.writeByte(TAG.reference);
        writer.writeString(value.id);
        return;

      case "entity":
        writer.writeByte(TAG.entity);
        writer.writeString(value.id);
        writer.writeString(value.type ?? "");
        encodeValue(writer, value.fields);
        return;
    }
  }

  const entries = Object.entries(value);

  writer.writeByte(TAG.object);
  writer.writeUint32(entries.length);

  for (const [key, item] of entries) {
    writer.writeString(key);
    encodeValue(writer, item);
  }
}

export function encodeTBF(document: Document): Uint8Array {
  validateDocument(document);

  const writer = new ByteWriter();

  writer.writeBytes(createTBFHeader());
  encodeValue(writer, document.root);

  return writer.toUint8Array();
}