import { describe, expect, it } from "vitest";
import { inspectTBFHeader, TBF_MAGIC } from "../src/tbf";

function createHeader(major = 1, minor = 0): Uint8Array {
  return new Uint8Array([
    ...TBF_MAGIC,
    major,
    minor
  ]);
}

describe("TBF header inspection", () => {
  it("recognizes a valid TBF header", () => {
    expect(inspectTBFHeader(createHeader())).toEqual({
      major: 1,
      minor: 0,
      size: 6
    });
  });

  it("rejects incomplete headers", () => {
    expect(() =>
      inspectTBFHeader(new Uint8Array([0x54, 0x42]))
    ).toThrow("Incomplete TBF header");
  });

  it("rejects invalid magic bytes", () => {
    expect(() =>
      inspectTBFHeader(new Uint8Array([
        0x00, 0x00, 0x00, 0x00, 1, 0
      ]))
    ).toThrow("Invalid TBF magic signature");
  });

  it("rejects unsupported versions", () => {
    expect(() =>
      inspectTBFHeader(createHeader(2, 0))
    ).toThrow("Unsupported TBF version");
  });

  it("rejects unsupported minor versions", () => {
    expect(() =>
      inspectTBFHeader(createHeader(1, 1))
    ).toThrow("Unsupported TBF version");
  });
});