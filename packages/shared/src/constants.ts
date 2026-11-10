export const FORMAT_VERSION = "1.0";

export const TDF_FORMAT_NAME = "TDF";
export const TBF_FORMAT_NAME = "TBF";

export const TBF_MAGIC = new Uint8Array([
  0x54,
  0x42,
  0x46,
  0x00
]);

export const TBF_HEADER_SIZE = 6;

export const TBF_TAGS = {
  NULL: 0x00,
  FALSE: 0x01,
  TRUE: 0x02,
  NUMBER: 0x03,
  STRING: 0x04,
  ARRAY: 0x05,
  OBJECT: 0x06,
  BINARY: 0x07,
  DECIMAL: 0x08,
  TIMESTAMP: 0x09,
  REFERENCE: 0x0a,
  ENTITY: 0x0b
} as const;

export const DEFAULT_LIMITS = {
  maxDepth: 128,
  maxStringLength: 10_000_000,
  maxArrayLength: 1_000_000,
  maxObjectKeys: 1_000_000,
  maxBinaryLength: 100_000_000,
  maxDocumentLength: 100_000_000
} as const;