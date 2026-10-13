import eslintPluginAstro from "eslint-plugin-astro";
import tseslint from "typescript-eslint";

export default [
  {
    ignores: [
      "dist/**",
      ".astro/**",
      "node_modules/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "docs/**",
      "public/**",
      "scripts/**",
      "tests/contracts/**",
      "content/**",
    ],
  },
  ...tseslint.configs.recommended,
  ...eslintPluginAstro.configs.recommended,
  {
    rules: {
      // Regel aus der Rolle Frontend Developer: kein `any` im neuen Code.
      "@typescript-eslint/no-explicit-any": "error",
    },
  },
];
