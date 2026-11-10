
export type Primitive =
  | null
  | boolean
  | number
  | string;

export interface BinaryValue {
  readonly kind: "binary";
  readonly value: Uint8Array;
}

export interface DecimalValue {
  readonly kind: "decimal";
  readonly value: string;
}

export interface TimestampValue {
  readonly kind: "timestamp";
  readonly value: number;
}

export interface ReferenceValue {
  readonly kind: "reference";
  readonly id: string;
}

export interface EntityValue {
  readonly kind: "entity";
  readonly id: string;
  readonly type?: string;
  readonly fields: Record<string, Value>;
}

export interface ObjectValue {
  readonly [key: string]: Value;
}

export type Value =
  | Primitive
  | BinaryValue
  | DecimalValue
  | TimestampValue
  | ReferenceValue
  | EntityValue
  | Value[]
  | ObjectValue;

export interface Document {
  readonly version: string;
  readonly root: Value;
}
