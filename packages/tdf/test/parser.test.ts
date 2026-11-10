import { describe, expect, it } from "vitest";
import { parseTDF } from "../src/parser";
import { FORMAT_VERSION } from "../../shared/src/constants";

describe("TDF Parser", () => {
  it("parses a document", () => {
    const document = parseTDF(`
      tdf ${FORMAT_VERSION}
      {
        name: "TDF",
        enabled: true,
        version: 1
      }
    `);

    expect(document.root).toEqual({
      name: "TDF",
      enabled: true,
      version: 1
    });
  });

  it("parses arrays", () => {
    const document = parseTDF(`
      tdf ${FORMAT_VERSION}
      [1, 2, 3]
    `);

    expect(document.root).toEqual([1, 2, 3]);
  });

  it("parses null values", () => {
    const document = parseTDF(`
      tdf ${FORMAT_VERSION}
      { value: null }
    `);

    expect(document.root).toEqual({ value: null });
  });

  it("parses typed decimal values", () => {
    const document = parseTDF(`
      tdf ${FORMAT_VERSION}
      @decimal("123.45")
    `);

    expect(document.root).toEqual({
      kind: "decimal",
      value: "123.45"
    });
  });

  it("rejects duplicate object keys", () => {
    expect(() => parseTDF(`
      tdf ${FORMAT_VERSION}
      { name: "A", name: "B" }
    `)).toThrow();
  });

  it("rejects unsupported versions", () => {
    expect(() => parseTDF("tdf 999.0 null")).toThrow();
  });

  it("rejects trailing document content", () => {
    expect(() => parseTDF(`
      tdf ${FORMAT_VERSION}
      null true
    `)).toThrow();
  });

  it("preserves typed-looking ordinary objects", () => {
    const document = parseTDF(`
      tdf ${FORMAT_VERSION}
      @object({
        kind: "decimal",
        value: "123.45"
      })
    `);

    expect(document.root).toEqual({
      kind: "decimal",
      value: "123.45"
    });
  });
});