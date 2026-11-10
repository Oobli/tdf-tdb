import { describe, expect, it } from "vitest";
import { stringifyTDF } from "../src/serializer";
import { parseTDF } from "../src/parser";
import { FORMAT_VERSION } from "../../shared/src/constants";
import type { Document } from "../../shared/src/types";
import { markPlainObject } from "../../shared/src/type-guards";

describe("TDF Serializer", () => {
  it("serializes a basic document", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: {
        name: "TDF",
        active: true
      }
    };

    const output = stringifyTDF(document);

    expect(output).toContain(`tdf ${FORMAT_VERSION}`);
    expect(output).toContain('"name": "TDF"');
  });

  it("serializes arrays", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: [1, 2, 3]
    };

    expect(stringifyTDF(document)).toContain("[");
  });

  it("serializes binary values", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: {
        kind: "binary",
        value: new Uint8Array([1, 2, 3])
      }
    };

    expect(stringifyTDF(document)).toContain("@binary(");
  });

  it("serializes decimal values", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: {
        kind: "decimal",
        value: "99.99"
      }
    };

    expect(stringifyTDF(document)).toContain('@decimal("99.99")');
  });

  it("escapes typed-looking plain objects", () => {
    const value = markPlainObject({
      kind: "decimal",
      value: "99.99"
    });

    const document = {
      version: FORMAT_VERSION,
      root: value
    } as unknown as Document;

    expect(stringifyTDF(document)).toContain("@object(");
  });

  it("rejects invalid documents", () => {
    expect(() =>
      stringifyTDF({
        version: "999.0",
        root: null
      } as unknown as Document)
    ).toThrow();
  });

  it("produces parseable output", () => {
    const document: Document = {
      version: FORMAT_VERSION,
      root: {
        title: "Binary formats",
        count: 5
      }
    };

    expect(() => parseTDF(stringifyTDF(document))).not.toThrow();
  });
});