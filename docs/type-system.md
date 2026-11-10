# TDF and TBF Type System

Both formats share one logical type system.

## Primitive types

| Type | Description |
|---|---|
| null | Empty value |
| boolean | true or false |
| number | IEEE 754 number |
| string | UTF-8 text |

## Collection types

### Array

An ordered collection of values.

### Object

A collection of string-keyed values.

## Typed values

### Binary

Stores raw bytes.

### Decimal

Stores a decimal number as a string to preserve its exact representation.

### Timestamp

Stores a numeric Unix timestamp.

### Reference

Stores an identifier referring to another value or resource.

### Entity

Stores an identified object with optional type information and fields.

## Type preservation

Conversion between TDF and TBF must preserve the logical type.

Decimal values must not silently become floating-point numbers.

Binary values must preserve their original bytes.

References and entities must retain their identifiers.