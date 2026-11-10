import { TBF_MAGIC, FORMAT_VERSION } from "../../shared/src/constants";
import { TBFError } from "../../shared/src/errors";

export const TBF_HEADER_LENGTH = 6;

export interface TBFHeader {
  major: number;
  minor: number;
}

export function createTBFHeader(): Uint8Array {
  const [major, minor] = FORMAT_VERSION.split(".").map(Number);

  if (
    !Number.isInteger(major) ||
    !Number.isInteger(minor) ||
    major < 0 ||
    major > 255 ||
    minor < 0 ||
    minor > 255
  ) {
    throw new TBFError("Invalid TBF format version");
  }

  return new Uint8Array([
    ...TBF_MAGIC,
    major,
    minor
  ]);
}

export function readTBFHeader(bytes: Uint8Array): TBFHeader {
  if (bytes.length < TBF_HEADER_LENGTH) {
    throw new TBFError("TBF header is incomplete");
  }

  for (let i = 0; i < TBF_MAGIC.length; i++) {
    if (bytes[i] !== TBF_MAGIC[i]) {
      throw new TBFError("Invalid TBF magic signature");
    }
  }

  const major = bytes[4];
  const minor = bytes[5];

  if (`${major}.${minor}` !== FORMAT_VERSION) {
    throw new TBFError(
      `Unsupported TBF version: ${major}.${minor}`
    );
  }

  return { major, minor };
}