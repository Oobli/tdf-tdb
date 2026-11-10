export class TDFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TDFError";
  }
}

export class TBFError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TBFError";
  }
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

export class ParseError extends TDFError {
  constructor(
    message: string,
    public readonly offset: number
  ) {
    super(`${message} at position ${offset}`);
    this.name = "ParseError";
  }
}