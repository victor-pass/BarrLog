import js from "@eslint/js";
import tseslint from "typescript-eslint";
import solid from "eslint-plugin-solid";
import globals from "globals";
import noRelativeImportPaths from "eslint-plugin-no-relative-import-paths";

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      ".wrangler/**",
      "drizzle/**",
      "worker-configuration.d.ts",
    ],
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
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["solid-js/types/**", "solid-js/*/types/**"],
              message:
                "Import from 'solid-js' (or 'solid-js/web', 'solid-js/store'), which resolves the browser/server build.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*.{ts,tsx}"],
    plugins: { "no-relative-import-paths": noRelativeImportPaths },
    rules: {
      "no-relative-import-paths/no-relative-import-paths": [
        "error",
        { allowSameFolder: false, rootDir: "src", prefix: "@" },
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
