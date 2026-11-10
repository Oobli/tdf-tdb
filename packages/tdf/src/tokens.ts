export type TokenType =
  | "identifier"
  | "string"
  | "number"
  | "at"
  | "leftBrace"
  | "rightBrace"
  | "leftBracket"
  | "rightBracket"
  | "leftParen"
  | "rightParen"
  | "colon"
  | "comma"
  | "eof";

export interface Token {
  type: TokenType;
  value: string;
  offset: number;
}