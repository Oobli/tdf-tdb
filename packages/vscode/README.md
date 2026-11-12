
# TDF & TBF Language Support

Language support for Typed Data Format (TDF) and Typed Binary Format (TBF) in Visual Studio Code.

## Features

### TDF
- `.tdf` file recognition
- Syntax highlighting
- Language configuration
- Structured text editing support

### TBF
- `.tbf` file recognition
- Binary file association
- TBF header inspection command

## File Icons

Includes a dedicated file icon theme for:

- TDF files
- TBF files

To enable it:

1. Open VS Code.
2. Open Preferences.
3. Select File Icon Theme.
4. Choose TDF & TBF File Icons.

## Commands

| Command | Description |
|---|---|
| TDF: Inspect TBF Header | Inspect a TBF file header |

## File Extensions

| Extension | Format |
|---|---|
| `.tdf` | Typed Data Format |
| `.tbf` | Typed Binary Format |

## Installation

Install the extension from a VSIX package:

1. Open VS Code.
2. Open Extensions.
3. Select the three-dot menu.
4. Choose Install from VSIX.
5. Select the package.

## Development

```bash
pnpm install
pnpm --filter tdf-language-support build
pnpm --filter tdf-language-support test
```

## License

MIT License. See [LICENSE](LICENSE).
