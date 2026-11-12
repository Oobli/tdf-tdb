
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { resolve } from "node:path";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));

const filename =
  `${manifest.publisher}.${manifest.name}-${manifest.version}.vsix`;

const packagePath = resolve(filename);

if (!existsSync(packagePath)) {
  console.error(`VSIX not found: ${filename}`);
  process.exit(1);
}

const stats = statSync(packagePath);
const signature = readFileSync(packagePath).subarray(0, 2);

if (!stats.isFile() || stats.size < 4 ||
    signature[0] !== 0x50 || signature[1] !== 0x4b) {
  console.error("Invalid VSIX ZIP package.");
  process.exit(1);
}

console.log(`VSIX verification passed: ${filename}`);
console.log(`Size: ${stats.size} bytes`);
