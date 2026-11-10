import { TBFError } from "../../shared/src/errors";

export class ByteWriter {
  private buffer: number[] = [];

  writeByte(value: number): void {
    if (!Number.isInteger(value) || value < 0 || value > 255) {
      throw new TBFError("Invalid byte value");
    }

    this.buffer.push(value);
  }

  writeBytes(bytes: Uint8Array): void {
    for (const byte of bytes) {
      this.buffer.push(byte);
    }
  }

  writeUint32(value: number): void {
    if (
      !Number.isSafeInteger(value) ||
      value < 0 ||
      value > 0xffffffff
    ) {
      throw new TBFError("Invalid 32-bit unsigned integer");
    }

    this.writeByte((value >>> 24) & 255);
    this.writeByte((value >>> 16) & 255);
    this.writeByte((value >>> 8) & 255);
    this.writeByte(value & 255);
  }

  writeFloat64(value: number): void {
    if (!Number.isFinite(value)) {
      throw new TBFError("Cannot encode a non-finite number");
    }

    const buffer = new ArrayBuffer(8);
    new DataView(buffer).setFloat64(0, value, false);

    this.writeBytes(new Uint8Array(buffer));
  }

  writeString(value: string): void {
    const bytes = new TextEncoder().encode(value);

    this.writeUint32(bytes.length);
    this.writeBytes(bytes);
  }

  toUint8Array(): Uint8Array {
    return new Uint8Array(this.buffer);
  }
}