# Format Versioning

TDF and TBF share a format version.

Current development version:

    1.0

## Version structure

Versions use:

    MAJOR.MINOR

### Major version

A major version changes when compatibility is broken.

Examples:

- Removing an existing value type
- Changing the meaning of an existing tag
- Changing the document structure incompatibly

### Minor version

A minor version adds compatible functionality.

Examples:

- Adding optional metadata
- Adding compatible syntax
- Introducing an optional typed value

## Compatibility rules

- Parsers must identify the document version.
- Unsupported major versions must be rejected.
- Unknown required features must not be silently ignored.
- Decoders must reject invalid headers.
- Encoders must produce the version they explicitly support.

## Stability

The 1.0 specification must be finalized before claiming stable
cross-implementation compatibility.