# TDF & TBF

TDF (Typed Data Format) is a text-based format for representing structured data.

TBF (Typed Binary Format) is its binary counterpart. Both formats use the same data model and support conversion between text and binary representations.

## Formats

Format| Extension| Description
TDF| ".tdf"| Text representation
TBF| ".tbf"| Binary representation

## Example

```tdf
tdf 1.0

{
  name: "Example",
  version: 1,
  active: true,
  tags: ["text", "binary", "data"]
}
```
## Data types

Both formats support:

- Null
- Boolean
- Number
- String
- Array
- Object
- Binary
- Decimal
- Timestamp
- Reference
- Entity

## Repository structure
```text
├── docs/
│   ├── tdf-spec.md
│   ├── tbf-spec.md
│   ├── type-system.md
│   └── versioning.md
├── packages/
│   ├── shared/
│   ├── tdf/
│   └── tbf/
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── tsconfig.json
└── vitest.config.ts
```

## Requirements

- Node.js 20 or later
- pnpm

## Development

Install dependencies:

`pnpm install`

## Run tests:

pnpm test

## Run TypeScript checks:

`pnpm typecheck`

## Specifications

The format specifications are maintained in "docs/".

- "TDF Specification" (docs/tdf-spec.md)
- "TBF Specification" (docs/tbf-spec.md)
- "Type System" (docs/type-system.md)
- "Versioning" (docs/versioning.md)

## Compatibility

TDF and TBF are designed to preserve the same logical values across conversions.

The implementation is under development. Compatibility and stability guarantees will be established alongside the format specifications and test suite.

## License

See ![LICENSE](LICENSE).