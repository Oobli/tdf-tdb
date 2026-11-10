import { describe, expect, it } from "vitest";
import { Lexer } from "../src/lexer";

describe("TDF Lexer", () => {
  it("tokenizes document declarations", () => {
    const tokens = new Lexer('tdf 1.0 { name: "TDF" }').tokenize();

    expect(tokens.map(token => token.type)).toEqual([
      "identifier",
      "number",
      "leftBrace",
      "identifier",
      "colon",
      "string",
      "rightBrace",
      "eof"
    ]);
  });

  it("tokenizes arrays and punctuation", () => {
    const tokens = new Lexer("[1, 2, 3]").tokenize();

    expect(tokens.map(token => token.type)).toEqual([
      "leftBracket",
      "number",
      "comma",
      "number",
      "comma",
      "number",
      "rightBracket",
      "eof"
    ]);
  });

  it("supports comments", () => {
    const tokens = new Lexer(
      'tdf 1.0 # comment\n"hello"'
    ).tokenize();

    expect(tokens.map(token => token.type)).toContain("string");
  });

  it("rejects unterminated strings", () => {
    expect(() => new Lexer('"hello').tokenize()).toThrow();
  });

  it("rejects invalid characters", () => {
    expect(() => new Lexer("$").tokenize()).toThrow();
  });

  it("preserves token offsets", () => {
    const tokens = new Lexer("123").tokenize();

    expect(tokens[0].offset).toBe(0);
  });
});