import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const grammar = JSON.parse(
  readFileSync(
    resolve(process.cwd(), "packages/vscode/syntaxes/tdf.tmLanguage.json"),
    "utf8"
  )
);

describe("TDF TextMate grammar", () => {
  it("declares the correct scope", () => {
    expect(grammar.scopeName).toBe("source.tdf");
  });

  it("defines the required repositories", () => {
    const required = [
      "comments",
      "header",
      "typed-values",
      "strings",
      "numbers",
      "constants",
      "keys",
      "operators"
    ];

    for (const name of required) {
      expect(grammar.repository).toHaveProperty(name);
    }
  });

  it("recognizes all typed constructors", () => {
    const pattern =
      grammar.repository["typed-values"].patterns[0].match;

    for (const constructor of [
      "binary",
      "decimal",
      "timestamp",
      "ref",
      "entity",
      "object"
    ]) {
      expect(new RegExp(pattern).test(`@${constructor}`)).toBe(true);
    }
  });

  it("defines string escape highlighting", () => {
    expect(
      grammar.repository.strings.patterns[0].name
    ).toBe("constant.character.escape.tdf");
  });
});