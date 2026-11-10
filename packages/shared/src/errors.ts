export class TDFError extends Error {
  readonly code: string;

  constructor(message: string, code = "TDF_ERROR") {
    super(message);
    this.name = "TDFError";
    this.code = code;
  }
}

export class ParseError extends TDFError {
  readonly position?: number;

  constructor(message: string, position?: number) {
    super(message, "PARSE_ERROR");
    this.name = "ParseError";
    this.position = position;
  }
}

export class ValidationError extends TDFError {
  readonly path?: string;

  constructor(message: string, path?: string) {
    super(message, "VALIDATION_ERROR");
    this.name = "ValidationError";
    this.path = path;
  }
}

export class TBFError extends TDFError {
  readonly offset?: number;

  constructor(message: string, offset?: number) {
    super(message, "TBF_ERROR");
    this.name = "TBFError";
    this.offset = offset;
  }
}