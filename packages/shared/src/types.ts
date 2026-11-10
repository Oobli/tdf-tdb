
export type Primitive =
  | null
  | boolean
  | number
  | string;

export type BinaryData = Uint8Array;

export interface EntityReference {
  $ref: string;
}

export interface Entity {
  $id: string;
  $type?: string;
  [key: string]: Value | undefined;
}

export interface Timestamp {
  $timestamp: number;
}

export interface Decimal {
  $decimal: string;
}

export interface ValueObject {
  [key: string]: Value;
}

export type Value =
  | Primitive
  | BinaryData
  | EntityReference
  | Timestamp
  | Decimal
  | Value[]
  | ValueObject;

export interface Document {
  version: string;
  root: Value;
}
