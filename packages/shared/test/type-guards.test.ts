import { describe, expect, it } from "vitest";
import {
  isMarkedPlainObject,
  isTypedValue,
  markPlainObject
} from "../src/type-guards";

describe("Typed value guards", () => {
  it("recognizes decimal values", () => {
    expect(isTypedValue({
      kind: "decimal",
      value: "123.45"
    })).toBe(true);
  });

  it("recognizes binary values", () => {
    expect(isTypedValue({
      kind: "binary",
      value: new Uint8Array([1, 2])
    })).toBe(true);
  });

  it("does not recognize ordinary objects", () => {
    expect(isTypedValue({
      name: "TDF",
      version: 1
    })).toBe(false);
  });

  it("preserves typed-looking plain objects", () => {
    const value = markPlainObject({
      kind: "decimal",
      value: "123.45"
    });

    expect(isMarkedPlainObject(value)).toBe(true);
    expect(isTypedValue(value)).toBe(false);
  });

  it("does not mark an object twice", () => {
    const value = { kind: "custom" };

    markPlainObject(value);
    expect(markPlainObject(value)).toBe(value);
  });
});