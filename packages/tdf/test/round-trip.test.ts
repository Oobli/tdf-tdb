import { describe, expect, it } from "vitest";
import { parseTDF } from "../src/parser";
import { stringifyTDF } from "../src/serializer";
import { FORMAT_VERSION } from "../../shared/src/constants";
import { markPlainObject } from "../../shared/src/type-guards";

describe("TDF round-trip", () => {
  it("preserves primitive values", () => {
    const source = `
      tdf ${FORMAT_VERSION}
      {
        name: "TDF",
        enabled: true,
        count: 42,
        empty: null
      }
    `;

    const result = parseTDF(stringifyTDF(parseTDF(source)));

    expect(result.root).toEqual(parseTDF(source).root);
  });

  it("preserves nested structures", () => {
    const source = `
      tdf ${FORMAT_VERSION}
      {
        user: {
          name: "Fahad",
          roles: ["developer", "founder"]
        }
      }
    `;

    const first = parseTDF(source);
    const second = parseTDF(stringifyTDF(first));

    expect(second.root).toEqual(first.root);
  });

  it("preserves binary values", () => {
    const source = `
      tdf ${FORMAT_VERSION}
      @binary("AQID")
    `;

    const result = parseTDF(stringifyTDF(parseTDF(source)));

    expect(result.root).toEqual({
      kind: "binary",
      value: new Uint8Array([1, 2, 3])
    });
  });

  it("preserves escaped typed-looking objects", () => {
    const value = markPlainObject({
      kind: "decimal",
      value: "123.45"
    });

    const document = {
      version: FORMAT_VERSION,
      root: value
    } as never;

    const result = parseTDF(stringifyTDF(document));

    expect(result.root).toEqual(value);
  });
});