export const TBF_MAGIC = [0x54, 0x42, 0x46, 0x00];

export interface TBFHeader {
  major: number;
  minor: number;
  size: number;
}

export function inspectTBFHeader(
  bytes: Uint8Array
): TBFHeader {
  if (bytes.length < 6) {
    throw new Error("Incomplete TBF header");
  }

  for (let i = 0; i < TBF_MAGIC.length; i++) {
    if (bytes[i] !== TBF_MAGIC[i]) {
      throw new Error("Invalid TBF magic signature");
    }
  }

  const major = bytes[4];
  const minor = bytes[5];

  if (major !== 1 || minor !== 0) {
    throw new Error(
      `Unsupported TBF version: ${major}.${minor}`
    );
  }

  return {
    major,
    minor,
    size: 6
  };
}