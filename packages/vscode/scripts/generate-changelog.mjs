
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const manifest = JSON.parse(readFileSync("package.json", "utf8"));
const version = manifest.version;

if (!/^\d+\.\d+\.\d+$/.test(version)) {
  throw new Error("Invalid package version.");
}

const tags = execFileSync("git", ["tag", "--list", "v*", "--sort=-version:refname"], {
  encoding: "utf8"
}).trim().split("\n").filter(Boolean);

const previousTag = tags[0];

const args = ["log", "--pretty=format:%s"];

if (previousTag) {
  args.push(`${previousTag}..HEAD`);
}

const commits = execFileSync("git", args, {
  encoding: "utf8"
}).split("\n").filter(Boolean);

const sections = {
  Added: [],
  Changed: [],
  Fixed: [],
  Other: []
};

for (const commit of commits) {
  const match = commit.match(/^(\w+)(?:\([^)]*\))?!?:\s*(.+)$/);

  if (!match) {
    sections.Other.push(commit);
    continue;
  }

  const [, type, description] = match;

  if (type === "feat") sections.Added.push(description);
  else if (type === "fix") sections.Fixed.push(description);
  else if (["refactor", "perf", "docs"].includes(type)) {
    sections.Changed.push(description);
  } else {
    sections.Other.push(description);
  }
}

const date = new Date().toISOString().slice(0, 10);

let output = `## [${version}] - ${date}\n`;

for (const [name, entries] of Object.entries(sections)) {
  if (!entries.length) continue;

  output += `\n### ${name}\n`;
  output += entries.map(entry => `- ${entry}`).join("\n");
  output += "\n";
}

const changelog = readFileSync("CHANGELOG.md", "utf8");
const updated = changelog.replace(
  /^## \[Unreleased\][^\n]*\n?/m,
  `## [Unreleased]\n\n${output}\n`
);

if (updated === changelog) {
  throw new Error("Could not locate Unreleased section in CHANGELOG.md.");
}

writeFileSync("CHANGELOG.md", updated);

console.log(`Generated changelog for ${version}.`);
