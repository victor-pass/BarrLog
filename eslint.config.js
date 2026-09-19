import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";
import globals from "globals";

export default tseslint.config(
  {
    ignores: ["dist/**", ".wrangler/**", "drizzle/**", "worker-configuration.d.ts"],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
  {
    files: ["src/**/*.tsx"],
    ...solid.configs["flat/typescript"],
  },
  {
    files: ["src/server/**/*.tsx", "src/browser/index.tsx"],
    rules: {
      // These files use Hono's JSX runtime, not Solid's.
      "solid/reactivity": "off",
      "solid/no-destructure": "off",
      "solid/jsx-no-undef": "off",
    },
  },
);
