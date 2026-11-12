
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const changelog = readFileSync("CHANGELOG.md", "utf8");

const version = manifest.version;
const heading = new RegExp(
  `^## \\[${version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`,
  "m"
);

if (!heading.test(changelog)) {
  console.error(`Missing dated changelog entry for ${version}.`);
  process.exit(1);
}

console.log(`Changelog validation passed: ${version}`);
