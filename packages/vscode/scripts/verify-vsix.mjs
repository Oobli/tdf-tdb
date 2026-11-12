
import { existsSync, readFileSync, statSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(
  readFileSync("package.json", "utf8")
);

const packagePath = resolve(
  `${manifest.name}-${manifest.version}.vsix`
);

if (!existsSync(packagePath)) {
  console.error(`VSIX not found: ${packagePath}`);
  process.exit(1);
}

const stats = statSync(packagePath);

if (!stats.isFile() || stats.size === 0) {
  console.error("VSIX package is empty or invalid.");
  process.exit(1);
}

console.log("VSIX verification passed.");
console.log(`Package: ${manifest.name}`);
console.log(`Version: ${manifest.version}`);
console.log(`Size: ${stats.size} bytes`);
