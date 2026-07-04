import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Frozen Claude Design export — GENERATED, do not edit; excluded so its false-positive
    // lint/SAST hits (no-this-in-component on React.Component methods, etc.) don't add CI noise.
    "docs/design/export/**",
  ]),
]);

export default eslintConfig;
