import * as esbuild from "esbuild";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

await esbuild.build({
  entryPoints: [path.join(__dirname, "server", "index.ts")],
  bundle: true,
  platform: "node",
  target: "node20",
  format: "esm",
  outfile: path.join(__dirname, "dist", "index.js"),
  packages: "external", // Treat ALL node_modules as external
  banner: {
    js: `
// Polyfill __dirname for ESM
import { fileURLToPath as __fileURLToPath } from 'url';
import { dirname as __dirname_func } from 'path';
const __filename = __fileURLToPath(import.meta.url);
const __dirname = __dirname_func(__filename);
    `.trim(),
  },
  sourcemap: true,
  minify: false, // Keep readable for debugging
});

console.log("✅ Server bundle built successfully");
