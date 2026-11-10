import { describe, expect, it } from "vitest";
import { validateDocument, validateValue } from "../src/validation";
import { FORMAT_VERSION } from "../src/constants";

describe("Shared validation", () => {
  it("accepts a valid document", () => {
    expect(() =>
      validateDocument({
        version: FORMAT_VERSION,
        root: { name: "TDF", enabled: true }
      })
    ).not.toThrow();
  });

  it("rejects an unsupported version", () => {
    expect(() =>
      validateDocument({
        version: "999.0",
        root: null
      } as never)
    ).toThrow();
  });

  it("rejects non-finite numbers", () => {
    expect(() => validateValue(Infinity)).toThrow();
    expect(() => validateValue(NaN)).toThrow();
  });

  it("accepts binary data within limits", () => {
    expect(() => validateValue(new Uint8Array([1, 2, 3]))).not.toThrow();
  });

  it("accepts nested arrays and objects", () => {
    expect(() =>
      validateValue({
        users: [{ id: 1 }, { id: 2 }]
      })
    ).not.toThrow();
  });
});