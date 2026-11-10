import { TBFError } from "../../shared/src/errors";

export class ByteReader {
  private position = 0;

  constructor(private readonly bytes: Uint8Array) {}

  get offset(): number {
    return this.position;
  }

  get remaining(): number {
    return this.bytes.length - this.position;
  }

  readByte(): number {
    this.ensureAvailable(1);

    return this.bytes[this.position++];
  }

  readBytes(length: number): Uint8Array {
    if (!Number.isSafeInteger(length) || length < 0) {
      throw new TBFError("Invalid byte length");
    }

    this.ensureAvailable(length);

    const result = this.bytes.slice(
      this.position,
      this.position + length
    );

    this.position += length;

    return result;
  }

  readUint32(): number {
    const bytes = this.readBytes(4);

    return (
      bytes[0] * 0x1000000 +
      (bytes[1] << 16) +
      (bytes[2] << 8) +
      bytes[3]
    );
  }

  readFloat64(): number {
    const bytes = this.readBytes(8);
    const buffer = new ArrayBuffer(8);

    new Uint8Array(buffer).set(bytes);

    const value = new DataView(buffer).getFloat64(0, false);

    if (!Number.isFinite(value)) {
      throw new TBFError("Invalid non-finite number");
    }

    return value;
  }

  readString(): string {
    const length = this.readUint32();
    const bytes = this.readBytes(length);

    try {
      return new TextDecoder("utf-8", {
        fatal: true
      }).decode(bytes);
    } catch {
      throw new TBFError("Invalid UTF-8 string");
    }
  }

  ensureFinished(): void {
    if (this.remaining !== 0) {
      throw new TBFError("Unexpected trailing binary data");
    }
  }

  private ensureAvailable(length: number): void {
    if (length > this.remaining) {
      throw new TBFError(
        `Unexpected end of TBF data at offset ${this.position}`
      );
    }
  }
}