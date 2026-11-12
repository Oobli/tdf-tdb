
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const changelog = readFileSync("CHANGELOG.md", "utf8");

const version = manifest.version;
const expectedTag = `v${version}`;

const actualTag = process.argv[2];

if (actualTag && actualTag !== expectedTag) {
  throw new Error(
    `Tag mismatch: expected ${expectedTag}, received ${actualTag}`
  );
}

const heading = new RegExp(
  `^## \\[${version.replaceAll(".", "\\.")}\\] - \\d{4}-\\d{2}-\\d{2}$`,
  "m"
);

if (!heading.test(changelog)) {
  throw new Error(`Changelog entry missing for ${version}.`);
}

console.log("Release consistency verified.");
console.log(`Extension: ${manifest.publisher}.${manifest.name}`);
console.log(`Version: ${version}`);
console.log(`Tag: ${expectedTag}`);
