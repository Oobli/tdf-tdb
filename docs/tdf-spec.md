# TDF Specification

TDF means Typed Data Format.

TDF is a human-readable representation of structured data. It supports
primitive values, arrays, objects, and explicitly typed values.

## Document structure

A TDF document begins with a version declaration.

    tdf 1.0

The declaration is followed by the root value.

Example:

    tdf 1.0

    {
      name: "Example",
      enabled: true,
      count: 42,
      tags: ["data", "format"]
    }

## Primitive values

Supported primitive values:

- null
- true
- false
- numbers
- strings

Strings use double quotes.

## Arrays

Arrays contain ordered values.

    [1, 2, 3, "four"]

## Objects

Objects contain string keys and values.

    {
      name: "Fahad",
      active: true
    }

## Typed values

TDF defines these typed constructors:

    @binary("AQID")
    @decimal("123.45")
    @timestamp(1794355200)
    @ref("record-001")
    @entity("user-001", "user", {
      name: "Example"
    })

## Plain objects

Use `@object` when an object must remain an ordinary object even if
it contains a `kind` property that resembles a typed value.

    @object({
      kind: "decimal",
      value: "not-a-typed-value"
    })

## Encoding

TDF documents are UTF-8 text.

## Compatibility

A parser must reject unsupported major versions.

Minor-version compatibility must follow the versioning rules.