import type { Token, TokenType } from "./tokens";
import { ParseError } from "../../shared/src/errors";

export class Lexer {
  private position = 0;
  private tokens: Token[] = [];

  constructor(private readonly source: string) {}

  tokenize(): Token[] {
    while (this.position < this.source.length) {
      const char = this.source[this.position];

      if (/\s/.test(char)) {
        this.position++;
        continue;
      }

      if (char === "#") {
        this.skipComment();
        continue;
      }

      const offset = this.position;

      if (char === '"') {
        this.readString();
        continue;
      }

      if (char === "-" || /\d/.test(char)) {
        this.readNumber();
        continue;
      }

      if (/[a-zA-Z_]/.test(char)) {
        this.readIdentifier();
        continue;
      }

      const punctuation: Record<string, TokenType> = {
        "@": "at",
        "{": "leftBrace",
        "}": "rightBrace",
        "[": "leftBracket",
        "]": "rightBracket",
        "(": "leftParen",
        ")": "rightParen",
        ":": "colon",
        ",": "comma"
      };

      const type = punctuation[char];

      if (type) {
        this.tokens.push({
          type,
          value: char,
          offset
        });

        this.position++;
        continue;
      }

      throw new ParseError(
        `Unexpected character "${char}"`,
        offset
      );
    }

    this.tokens.push({
      type: "eof",
      value: "",
      offset: this.position
    });

    return this.tokens;
  }

  private skipComment(): void {
    while (
      this.position < this.source.length &&
      this.source[this.position] !== "\n"
    ) {
      this.position++;
    }
  }

  private readString(): void {
    const offset = this.position;
    this.position++;

    let escaped = false;

    while (this.position < this.source.length) {
      const char = this.source[this.position++];

      if (escaped) {
        escaped = false;
        continue;
      }

      if (char === "\\") {
        escaped = true;
        continue;
      }

      if (char === '"') {
        const raw = this.source.slice(
          offset,
          this.position
        );

        let value: string;

        try {
          value = JSON.parse(raw);
        } catch {
          throw new ParseError("Invalid string escape", offset);
        }

        this.tokens.push({
          type: "string",
          value,
          offset
        });

        return;
      }
    }

    throw new ParseError("Unterminated string", offset);
  }

  private readNumber(): void {
    const offset = this.position;
    const remaining = this.source.slice(this.position);

    const match = remaining.match(
      /^-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/
    );

    if (!match) {
      throw new ParseError("Invalid number", offset);
    }

    const value = match[0];
    const next = remaining[value.length];

    if (next && /[a-zA-Z_]/.test(next)) {
      throw new ParseError("Invalid character after number", offset);
    }

    this.position += value.length;

    this.tokens.push({
      type: "number",
      value,
      offset
    });
  }

  private readIdentifier(): void {
    const offset = this.position;
    const remaining = this.source.slice(this.position);
    const match = remaining.match(/^[a-zA-Z_][a-zA-Z0-9_-]*/);

    if (!match) {
      throw new ParseError("Invalid identifier", offset);
    }

    this.position += match[0].length;

    this.tokens.push({
      type: "identifier",
      value: match[0],
      offset
    });
  }
}