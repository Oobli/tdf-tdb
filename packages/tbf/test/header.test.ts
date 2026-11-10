import { describe, expect, it } from "vitest";
import {
  createTBFHeader,
  readTBFHeader,
  TBF_HEADER_LENGTH
} from "../src/header";

describe("TBF Header", () => {
  it("creates a valid header", () => {
    const header = createTBFHeader();

    expect(header).toBeInstanceOf(Uint8Array);
    expect(header.length).toBe(TBF_HEADER_LENGTH);
  });

  it("reads a generated header", () => {
    const header = createTBFHeader();

    expect(() => readTBFHeader(header)).not.toThrow();
  });

  it("rejects an invalid magic signature", () => {
    const header = createTBFHeader();
    header[0] ^= 255;

    expect(() => readTBFHeader(header)).toThrow();
  });

  it("rejects incomplete headers", () => {
    expect(() => readTBFHeader(new Uint8Array([1, 2]))).toThrow();
  });

  it("rejects unsupported versions", () => {
    const header = createTBFHeader();
    header[4] = 255;

    expect(() => readTBFHeader(header)).toThrow();
  });
});