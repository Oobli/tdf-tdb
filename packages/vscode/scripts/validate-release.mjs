
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const root = process.cwd();
const manifestPath = resolve(root, "package.json");

if (!existsSync(manifestPath)) {
  throw new Error("package.json not found. Run from packages/vscode.");
}

const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));

const required = [
  "README.md",
  "LICENSE",
  "CHANGELOG.md",
  "images/extension-icon.png",
  "icons/file-icons.json",
  "icons/tdf.svg",
  "icons/tbf.svg",
  "syntaxes/tdf.tmLanguage.json"
];

const errors = [];

if (!/^\d+\.\d+\.\d+$/.test(manifest.version)) {
  errors.push("Invalid extension version.");
}

if (manifest.publisher !== "spideythedev") {
  errors.push("Unexpected Marketplace publisher.");
}

if (!manifest.engines?.vscode) {
  errors.push("Missing VS Code engine requirement.");
}

if (!manifest.main || !manifest.scripts?.build) {
  errors.push("Missing extension entry point or build script.");
}

for (const file of required) {
  if (!existsSync(resolve(root, file))) {
    errors.push(`Missing required file: ${file}`);
  }
}

if (existsSync(resolve(root, "CHANGELOG.md"))) {
  const changelog = readFileSync(
    resolve(root, "CHANGELOG.md"),
    "utf8"
  );

  if (!changelog.includes(`[${manifest.version}]`)) {
    errors.push("Current version missing from CHANGELOG.md.");
  }
}

if (errors.length) {
  console.error("Release validation failed:\n");
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`Release validation passed: ${manifest.version}`);
