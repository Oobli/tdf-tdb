export const FORMAT_VERSION = "1.0";

export const TDF_HEADER = "tdf";
export const TBF_MAGIC = new Uint8Array([0x54, 0x42, 0x46, 0x00]);

export const DEFAULT_LIMITS = {
  maxDepth: 128,
  maxStringLength: 10_000_000,
  maxArrayLength: 1_000_000,
  maxObjectKeys: 1_000_000,
  maxBinaryLength: 100_000_000,
  maxDocumentLength: 100_000_000
} as const;