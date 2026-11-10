export type BinaryValue = {
  kind: "binary";
  value: Uint8Array;
};

export type DecimalValue = {
  kind: "decimal";
  value: string;
};

export type TimestampValue = {
  kind: "timestamp";
  value: number;
};

export type ReferenceValue = {
  kind: "reference";
  id: string;
};

export type EntityValue = {
  kind: "entity";
  id: string;
  type?: string;
  fields: Record<string, Value>;
};

export type TypedValue =
  | BinaryValue
  | DecimalValue
  | TimestampValue
  | ReferenceValue
  | EntityValue;

export type PrimitiveValue =
  | null
  | boolean
  | number
  | string;

export type Value =
  | PrimitiveValue
  | TypedValue
  | Value[]
  | { [key: string]: Value };

export interface Document {
  version: string;
  root: Value;
}

export interface ValidationIssue {
  path: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  issues: ValidationIssue[];
}