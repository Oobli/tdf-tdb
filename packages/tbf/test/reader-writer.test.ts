import { describe, expect, it } from "vitest";
import { ByteWriter } from "../src/writer";
import { ByteReader } from "../src/reader";

describe("TBF Byte Writer and Reader", () => {
  it("writes and reads individual bytes", () => {
    const writer = new ByteWriter();

    writer.writeByte(10);
    writer.writeByte(20);

    const reader = new ByteReader(writer.toUint8Array());

    expect(reader.readByte()).toBe(10);
    expect(reader.readByte()).toBe(20);
  });

  it("writes and reads unsigned integers", () => {
    const writer = new ByteWriter();

    writer.writeUint32(123456);

    const reader = new ByteReader(writer.toUint8Array());

    expect(reader.readUint32()).toBe(123456);
  });

  it("writes and reads floating-point values", () => {
    const writer = new ByteWriter();

    writer.writeFloat64(123.456);

    const reader = new ByteReader(writer.toUint8Array());

    expect(reader.readFloat64()).toBe(123.456);
  });

  it("writes and reads UTF-8 strings", () => {
    const writer = new ByteWriter();

    writer.writeString("Hello, TBF!");

    const reader = new ByteReader(writer.toUint8Array());

    expect(reader.readString()).toBe("Hello, TBF!");
  });

  it("supports Unicode strings", () => {
    const writer = new ByteWriter();

    writer.writeString("こんにちは 🌍");

    const reader = new ByteReader(writer.toUint8Array());

    expect(reader.readString()).toBe("こんにちは 🌍");
  });

  it("rejects invalid byte values", () => {
    const writer = new ByteWriter();

    expect(() => writer.writeByte(300)).toThrow();
  });

  it("rejects reading beyond available data", () => {
    const reader = new ByteReader(new Uint8Array([1]));

    expect(() => reader.readUint32()).toThrow();
  });

  it("detects trailing data", () => {
    const reader = new ByteReader(new Uint8Array([1, 2]));

    reader.readByte();

    expect(() => reader.ensureFinished()).toThrow();
  });
});