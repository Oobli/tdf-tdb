import type { Document, Value } from "../../shared/src/types";
import { FORMAT_VERSION, DEFAULT_LIMITS } from "../../shared/src/constants";
import { validateDocument } from "../../shared/src/validation";
import { TBFError } from "../../shared/src/errors";
import { readTBFHeader, TBF_HEADER_LENGTH } from "./header";
import { ByteReader } from "./reader";

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

function readValue(reader: ByteReader, depth = 0): Value {
  if (depth > DEFAULT_LIMITS.maxDepth) {
    throw new TBFError("Maximum nesting depth exceeded");
  }

  const tag = reader.readByte();

  switch (tag) {
    case TAG.null:
      return null;

    case TAG.false:
      return false;

    case TAG.true:
      return true;

    case TAG.number:
      return reader.readFloat64();

    case TAG.string: {
      const value = reader.readString();

      if (value.length > DEFAULT_LIMITS.maxStringLength) {
        throw new TBFError("String is too long");
      }

      return value;
    }

    case TAG.array: {
      const length = reader.readUint32();

      if (length > DEFAULT_LIMITS.maxArrayLength) {
        throw new TBFError("Array is too large");
      }

      const result: Value[] = [];

      for (let i = 0; i < length; i++) {
        result.push(readValue(reader, depth + 1));
      }

      return result;
    }

    case TAG.object: {
      const length = reader.readUint32();

      if (length > DEFAULT_LIMITS.maxObjectKeys) {
        throw new TBFError("Object has too many keys");
      }

      const result: Record<string, Value> = Object.create(null);

      for (let i = 0; i < length; i++) {
        const key = reader.readString();

        if (key.length > DEFAULT_LIMITS.maxStringLength) {
          throw new TBFError("Object key is too long");
        }

        if (Object.prototype.hasOwnProperty.call(result, key)) {
          throw new TBFError(`Duplicate object key: ${key}`);
        }

        result[key] = readValue(reader, depth + 1);
      }

      return result;
    }

    case TAG.binary: {
      const length = reader.readUint32();

      if (length > DEFAULT_LIMITS.maxBinaryLength) {
        throw new TBFError("Binary value is too large");
      }

      return {
        kind: "binary",
        value: reader.readBytes(length)
      };
    }

    case TAG.decimal:
      return {
        kind: "decimal",
        value: reader.readString()
      };

    case TAG.timestamp: {
      const value = reader.readFloat64();

      if (!Number.isSafeInteger(value)) {
        throw new TBFError("Invalid timestamp value");
      }

      return {
        kind: "timestamp",
        value
      };
    }

    case TAG.reference: {
      const id = reader.readString();

      if (!id) {
        throw new TBFError("Reference ID cannot be empty");
      }

      return {
        kind: "reference",
        id
      };
    }

    case TAG.entity: {
      const id = reader.readString();
      const type = reader.readString();
      const fields = readValue(reader, depth + 1);

      if (
        !id ||
        typeof fields !== "object" ||
        fields === null ||
        Array.isArray(fields) ||
        "kind" in fields
      ) {
        throw new TBFError("Invalid entity data");
      }

      return {
        kind: "entity",
        id,
        ...(type ? { type } : {}),
        fields
      };
    }

    default:
      throw new TBFError(`Unknown TBF value tag: 0x${tag.toString(16)}`);
  }
}

export function decodeTBF(bytes: Uint8Array): Document {
  if (!(bytes instanceof Uint8Array)) {
    throw new TBFError("TBF input must be a Uint8Array");
  }

  if (bytes.length > DEFAULT_LIMITS.maxDocumentLength) {
    throw new TBFError("TBF document is too large");
  }

  readTBFHeader(bytes);

  const reader = new ByteReader(
    bytes.subarray(TBF_HEADER_LENGTH)
  );

  const root = readValue(reader);

  reader.ensureFinished();

  const document: Document = {
    version: FORMAT_VERSION,
    root
  };

  validateDocument(document);

  return document;
}