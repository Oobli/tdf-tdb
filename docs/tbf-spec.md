# TBF Specification

TBF is the binary counterpart to TDF.

It represents the same logical data model using a compact binary encoding.

## Header

The header contains:

| Field | Size |
|---|---:|
| Magic bytes | 4 bytes |
| Major version | 1 byte |
| Minor version | 1 byte |

The magic bytes are:

    54 42 46 00

The version bytes represent the major and minor version numbers.

For version 1.0:

    01 00

## Value tags

| Tag | Value |
|---|---|
| 0x00 | Null |
| 0x01 | False |
| 0x02 | True |
| 0x03 | Number |
| 0x04 | String |
| 0x05 | Array |
| 0x06 | Object |
| 0x07 | Binary |
| 0x08 | Decimal |
| 0x09 | Timestamp |
| 0x0A | Reference |
| 0x0B | Entity |

## Numeric values

Numbers use IEEE 754 64-bit floating-point representation.

Multi-byte numeric values use big-endian byte order.

## Strings

Strings are UTF-8 encoded and length-prefixed.

## Arrays

Arrays contain a length followed by their encoded elements.

## Objects

Objects contain a key count followed by encoded key-value pairs.

## Binary values

Binary values contain a byte length followed by raw bytes.

## Typed values

Decimal, timestamp, reference, and entity values use their dedicated tags.

## Safety

Decoders must enforce configured limits for:

- Nesting depth
- String length
- Array length
- Object key count
- Binary length
- Total document length

Malformed or truncated input must produce a decoding error.