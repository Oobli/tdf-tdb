import { buildSync } from "esbuild";
import { mkdirSync } from "node:fs";

mkdirSync("dist/web", { recursive: true });

const result = buildSync({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "browser",
  format: "cjs",
  external: ["vscode"],
  outfile: "dist/web/extension.js",
  target: "es2020",
  sourcemap: false,
  minify: false
});

if (result.errors.length > 0) {
  throw new Error("Web extension build failed.");
}

console.log("VS Code Web bundle generated successfully.");
