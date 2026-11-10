import { describe, expect, it } from "vitest";
import { encodeTBF } from "../src/encoder";
import { decodeTBF } from "../src/decoder";
import { FORMAT_VERSION } from "../../shared/src/constants";
import type { Document } from "../../shared/src/types";
import { markPlainObject } from "../../shared/src/type-guards";

describe("TBF round-trip", () => {
  function roundTrip(root: Document["root"]) {
    const document: Document = {
      version: FORMAT_VERSION,
      root
    };

    return decodeTBF(encodeTBF(document));
  }

  it("preserves primitive values", () => {
    expect(roundTrip("TBF").root).toBe("TBF");
    expect(roundTrip(123).root).toBe(123);
    expect(roundTrip(true).root).toBe(true);
    expect(roundTrip(null).root).toBe(null);
  });

  it("preserves nested objects", () => {
    const value = {
      name: "TDF",
      metadata: {
        version: 1,
        tags: ["binary", "text"]
      }
    };

    expect(roundTrip(value).root).toEqual(value);
  });

  it("preserves binary values", () => {
    const value = {
      kind: "binary",
      value: new Uint8Array([1, 2, 3])
    };

    expect(roundTrip(value).root).toEqual(value);
  });

  it("preserves decimal values", () => {
    const value = {
      kind: "decimal",
      value: "123456.789"
    };

    expect(roundTrip(value).root).toEqual(value);
  });

  it("preserves references", () => {
    const value = {
      kind: "reference",
      id: "user-001"
    };

    expect(roundTrip(value).root).toEqual(value);
  });

  it("preserves typed-looking ordinary objects", () => {
    const value = markPlainObject({
      kind: "decimal",
      value: "123.45"
    });

    const result = roundTrip(value);

    expect(result.root).toEqual(value);
  });

  it("rejects corrupted binary documents", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: "TBF"
    };

    const bytes = encodeTBF(document);
    bytes[0] ^= 255;

    expect(() => decodeTBF(bytes)).toThrow();
  });

  it("rejects unexpected trailing bytes", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: null
    };

    const bytes = encodeTBF(document);
    const corrupted = new Uint8Array(bytes.length + 1);

    corrupted.set(bytes);

    expect(() => decodeTBF(corrupted)).toThrow();
  });
});