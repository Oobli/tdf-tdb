import type { Document, Value } from "../../shared/src/types";
import { FORMAT_VERSION } from "../../shared/src/constants";
import { ParseError } from "../../shared/src/errors";
import { markPlainObject } from "../../shared/src/type-guards";
import { Lexer } from "./lexer";
import type { Token } from "./tokens";
import { isTypedValue, markPlainObject } from "../../shared/src/type-guards";

export class Parser {
  private tokens: Token[];
  private position = 0;

  constructor(source: string) {
    this.tokens = new Lexer(source).tokenize();
  }

  parse(): Document {
    this.expect("identifier", "tdf");

    const version = this.expect("number").value;

    if (version !== FORMAT_VERSION) {
      throw new ParseError(
        `Unsupported TDF version: ${version}`,
        this.previous().offset
      );
    }

    const root = this.parseValue();

    if (this.current().type !== "eof") {
      throw new ParseError(
        "Unexpected content after document",
        this.current().offset
      );
    }

    return { version, root };
  }

  private parseValue(): Value {
    const token = this.current();

    if (token.type === "string") {
      this.position++;
      return token.value;
    }

    if (token.type === "number") {
      this.position++;

      const value = Number(token.value);

      if (!Number.isFinite(value)) {
        throw new ParseError("Number must be finite", token.offset);
      }

      return value;
    }

    if (token.type === "leftBrace") {
      return this.parseObject();
    }

    if (token.type === "leftBracket") {
      return this.parseArray();
    }

    if (token.type === "at") {
      return this.parseTypedValue();
    }

    if (token.type === "identifier") {
      this.position++;

      switch (token.value) {
        case "true":
          return true;
        case "false":
          return false;
        case "null":
          return null;
        default:
          throw new ParseError(
            `Unknown value: ${token.value}`,
            token.offset
          );
      }
    }

    throw new ParseError("Expected a value", token.offset);
  }

  private parseObject(): Record<string, Value> {
    this.expect("leftBrace");

    const result: Record<string, Value> = Object.create(null);

    while (this.current().type !== "rightBrace") {
      const keyToken = this.current();

      if (
        keyToken.type !== "string" &&
        keyToken.type !== "identifier"
      ) {
        throw new ParseError(
          "Expected an object key",
          keyToken.offset
        );
      }

      this.position++;

      const key = keyToken.value;

      if (Object.prototype.hasOwnProperty.call(result, key)) {
        throw new ParseError(
          `Duplicate object key: ${key}`,
          keyToken.offset
        );
      }

      this.expect("colon");
      result[key] = this.parseValue();

      if (this.current().type !== "comma") {
        break;
      }

      this.position++;

      if (this.current().type === "rightBrace") {
        break;
      }
    }

    this.expect("rightBrace");

    return result;
  }

  private parseArray(): Value[] {
    this.expect("leftBracket");

    const result: Value[] = [];

    while (this.current().type !== "rightBracket") {
      result.push(this.parseValue());

      if (this.current().type !== "comma") {
        break;
      }

      this.position++;

      if (this.current().type === "rightBracket") {
        break;
      }
    }

    this.expect("rightBracket");

    return result;
  }

  private parseTypedValue(): Value {
    this.expect("at");

    const type = this.expect("identifier").value;

    this.expect("leftParen");

    switch (type) {
      case "object": {
        const value = this.parseValue();
        this.expect("rightParen");

        if (
          typeof value !== "object" ||
          value === null ||
          Array.isArray(value) ||
          value instanceof Uint8Array ||
          "kind" in value
        ) {
          throw new ParseError(
            "@object requires an ordinary object",
            this.previous().offset
          );
        }

        return markPlainObject(value as Record<string, unknown>) as
          Record<string, Value>;
      }

      case "decimal": {
        const value = this.expect("string").value;
        this.expect("rightParen");

        if (!/^-?(?:0|[1-9]\d*)(?:\.\d+)?$/.test(value)) {
          throw new ParseError(
            "Invalid decimal value",
            this.previous().offset
          );
        }

        return { kind: "decimal", value };
      }

      case "timestamp": {
        const token = this.expect("number");
        const value = Number(token.value);
        this.expect("rightParen");

        if (!Number.isSafeInteger(value)) {
          throw new ParseError(
            "Timestamp must be a safe integer",
            token.offset
          );
        }

        return { kind: "timestamp", value };
      }

      case "binary": {
        const encoded = this.expect("string").value;
        this.expect("rightParen");

        return {
          kind: "binary",
          value: this.decodeBase64(encoded)
        };
      }

      case "ref": {
        const id = this.expect("string").value;
        this.expect("rightParen");

        if (!id) {
          throw new ParseError(
            "Reference ID cannot be empty",
            this.previous().offset
          );
        }

        return { kind: "reference", id };
      }

      case "entity": {
        const id = this.expect("string").value;
        this.expect("comma");

        const entityType = this.expect("string").value;
        this.expect("comma");

        const fields = this.parseObject();
        this.expect("rightParen");

        if (!id) {
          throw new ParseError(
            "Entity ID cannot be empty",
            this.previous().offset
          );
        }

        return {
          kind: "entity",
          id,
          ...(entityType ? { type: entityType } : {}),
          fields
        };
      }

      default:
        throw new ParseError(
          `Unknown typed value: @${type}`,
          this.previous().offset
        );
    }
  }

  private decodeBase64(input: string): Uint8Array {
    const alphabet =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";

    if (
      input.length % 4 !== 0 ||
      !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(input)
    ) {
      throw new ParseError(
        "Invalid base64 binary value",
        this.previous().offset
      );
    }

    const output: number[] = [];

    for (let i = 0; i < input.length; i += 4) {
      const a = alphabet.indexOf(input[i]);
      const b = alphabet.indexOf(input[i + 1]);
      const c = input[i + 2] === "="
        ? 0
        : alphabet.indexOf(input[i + 2]);
      const d = input[i + 3] === "="
        ? 0
        : alphabet.indexOf(input[i + 3]);

      const bits = (a << 18) | (b << 12) | (c << 6) | d;

      output.push((bits >> 16) & 255);

      if (input[i + 2] !== "=") {
        output.push((bits >> 8) & 255);
      }

      if (input[i + 3] !== "=") {
        output.push(bits & 255);
      }
    }

    return new Uint8Array(output);
  }

  private current(): Token {
    return this.tokens[this.position];
  }

  private previous(): Token {
    return this.tokens[this.position - 1];
  }

  private expect(
    type: Token["type"],
    value?: string
  ): Token {
    const token = this.current();

    if (
      token.type !== type ||
      (value !== undefined && token.value !== value)
    ) {
      throw new ParseError(
        value === undefined
          ? `Expected ${type}, got ${token.type}`
          : `Expected "${value}", got "${token.value}"`,
        token.offset
      );
    }

    this.position++;
    return token;
  }
}

export function parseTDF(source: string): Document {
  return new Parser(source).parse();
}