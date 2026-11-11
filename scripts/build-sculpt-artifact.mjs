// Builds Sculpt as a Claude artifact: the same app code as /workout on the website,
// bundled into .artifact-build/ (index.html, sculpt.js, sculpt.css). Photos are published
// from public/workout-photos beside them. Run: node scripts/build-sculpt-artifact.mjs
import { build } from "esbuild";
import { execSync } from "node:child_process";
import { copyFileSync, mkdirSync } from "node:fs";

const out = ".artifact-build";
let version = "dev";
try {
  version = execSync("git rev-parse --short=7 HEAD").toString().trim();
} catch {
  // not a git checkout
}

mkdirSync(out, { recursive: true });
await build({
  entryPoints: { sculpt: "artifact/entry.js" },
  outdir: out,
  bundle: true,
  minify: true,
  format: "iife",
  target: "es2020",
  jsx: "automatic",
  loader: { ".js": "jsx" },
  tsconfig: "jsconfig.json", // "@/..." imports
  define: {
    "process.env.NODE_ENV": '"production"',
    "process.env.SCULPT_TARGET": '"artifact"',
    "process.env.NEXT_PUBLIC_APP_VERSION": JSON.stringify(version),
  },
  logLevel: "warning",
});
copyFileSync("artifact/index.html", `${out}/index.html`);
console.log(`Built ${out}/ (version ${version})`);
